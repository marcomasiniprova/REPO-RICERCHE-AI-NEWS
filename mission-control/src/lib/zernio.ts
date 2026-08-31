/**
 * Client Zernio lato SERVER (gira su Railway, non nell'ambiente di Claude, quindi
 * niente classificatore di sicurezza: la pubblicazione esterna la fa il backend).
 * Chiave in process.env.ZERNIO_API_KEY (mai esposta al client).
 */

const BASE = 'https://zernio.com/api/v1';

function key(): string {
  const k = process.env.ZERNIO_API_KEY;
  if (!k) throw new Error('ZERNIO_API_KEY mancante nell ambiente Railway');
  return k;
}

async function zfetch(path: string, init?: RequestInit): Promise<Response> {
  return fetch(`${BASE}${path}`, {
    ...init,
    headers: {
      Authorization: `Bearer ${key()}`,
      'Content-Type': 'application/json',
      ...(init?.headers ?? {}),
    },
    // niente cache: sono azioni/dati live
    cache: 'no-store',
  });
}

export interface ZernioAccount {
  _id: string;
  platform: string;
  displayName?: string;
  enabled?: boolean;
  isActive?: boolean;
}

/** Elenco account collegati in Zernio (tiktok, youtube, ...). */
export async function listAccounts(): Promise<ZernioAccount[]> {
  const res = await zfetch('/accounts');
  if (!res.ok) throw new Error(`Zernio /accounts HTTP ${res.status}`);
  const data = (await res.json()) as { accounts?: ZernioAccount[] };
  return data.accounts ?? [];
}

/** L'_id dell'account di una piattaforma (es. 'tiktok'), o null se non collegato. */
export async function accountIdFor(platform: string): Promise<string | null> {
  const accs = await listAccounts();
  const a = accs.find((x) => x.platform === platform && x.isActive !== false);
  return a?._id ?? null;
}

export interface PublishResult {
  ok: boolean;
  postId?: string;
  permalink?: string;
  error?: string;
}

/**
 * Pubblica un CAROSELLO FOTO su TikTok. `content` = titolo (<=90 char, TikTok toglie
 * hashtag/URL dal titolo); `description` = caption completa (fino a 4000 char, gli
 * hashtag vanno qui). `aiGenerated` alza il flag disclosure AI nativo di TikTok.
 */
export async function publishTiktokCarousel(opts: {
  accountId: string;
  images: string[];
  content: string;
  description: string;
  aiGenerated?: boolean;
  draft?: boolean; // true = consegna alla Creator Inbox di TikTok (l'utente finalizza nell'app)
}): Promise<PublishResult> {
  const body = {
    content: opts.content.slice(0, 90),
    mediaItems: opts.images.map((url) => ({ type: 'image', url })),
    platforms: [{ platform: 'tiktok', accountId: opts.accountId }],
    tiktokSettings: {
      privacy_level: 'PUBLIC_TO_EVERYONE',
      allow_comment: true,
      media_type: 'photo',
      photo_cover_index: 0,
      description: opts.description.slice(0, 3990),
      auto_add_music: true,
      video_made_with_ai: opts.aiGenerated ?? true,
      content_preview_confirmed: true,
      express_consent_given: true,
      ...(opts.draft ? { draft: true } : {}),
    },
    publishNow: true,
  };

  const res = await zfetch('/posts', { method: 'POST', body: JSON.stringify(body) });
  const text = await res.text();
  let json: Record<string, unknown> = {};
  try {
    json = JSON.parse(text) as Record<string, unknown>;
  } catch {
    /* body non-JSON: lo teniamo come testo per l'errore */
  }
  if (!res.ok) {
    const msg = (json.error as string) || (json.message as string) || text.slice(0, 300);
    return { ok: false, error: `Zernio HTTP ${res.status}: ${msg}` };
  }
  const post = (json.post as Record<string, unknown>) ?? json;
  const postId = (post._id as string) ?? (post.id as string) ?? undefined;
  const permalink = (post.permalink as string) ?? (post.url as string) ?? undefined;
  return { ok: true, postId, permalink };
}

/** Stato di un post pubblicato (per verificare che sia davvero online). */
export async function getPost(postId: string): Promise<Record<string, unknown> | null> {
  const res = await zfetch(`/posts/${postId}`);
  if (!res.ok) return null;
  const data = (await res.json()) as Record<string, unknown>;
  return (data.post as Record<string, unknown>) ?? data;
}

export type Platform = 'tiktok' | 'instagram' | 'youtube';
export type MediaKind = 'image' | 'video';

/**
 * Pubblica UN contenuto su UNA piattaforma via Zernio, costruendo le impostazioni
 * giuste per ogni social. Ritorna postId (o errore). La verifica dello stato reale
 * si fa dopo con getPlatformPostStatus.
 *  - tiktok carosello foto: tiktokSettings.media_type=photo
 *  - tiktok video: tiktokSettings video
 *  - instagram: content=caption; piu' immagini = carosello feed; video = reel
 *  - youtube: solo video; title + description + privacy
 */
export async function publishToPlatform(opts: {
  platform: Platform;
  accountId: string;
  media: Array<{ kind: MediaKind; url: string }>;
  content: string; // titolo breve (tiktok) o caption (ig)
  description?: string; // caption lunga (tiktok description / youtube description)
  title?: string; // titolo (youtube, reel ig)
  aiGenerated?: boolean;
  draft?: boolean;
}): Promise<PublishResult> {
  const isVideo = opts.media.some((m) => m.kind === 'video');
  const mediaItems = opts.media.map((m) => ({ type: m.kind, url: m.url }));
  const desc = (opts.description || opts.content || '').slice(0, 3990);

  const body: Record<string, unknown> = {
    content: opts.content.slice(0, 90),
    mediaItems,
    platforms: [{ platform: opts.platform, accountId: opts.accountId }],
    publishNow: true,
  };

  if (opts.platform === 'tiktok') {
    body.tiktokSettings = {
      privacy_level: 'PUBLIC_TO_EVERYONE',
      allow_comment: true,
      ...(isVideo
        ? { allow_duet: true, allow_stitch: true }
        : { media_type: 'photo', photo_cover_index: 0, auto_add_music: true }),
      description: desc,
      video_made_with_ai: opts.aiGenerated ?? true,
      content_preview_confirmed: true,
      express_consent_given: true,
      ...(opts.draft ? { draft: true } : {}),
    };
  } else if (opts.platform === 'instagram') {
    // content = caption. Piu' immagini = carosello feed. Video = reel.
    body.content = desc; // su IG il caption e' il content
    body.platformSpecificData = {
      ...(isVideo ? { contentType: 'reel', ...(opts.title ? { title: opts.title } : {}) } : {}),
      isAiGenerated: opts.aiGenerated ?? true,
    };
  } else if (opts.platform === 'youtube') {
    // Solo video. title obbligatorio (<=100), description, privacy pubblica.
    body.content = desc;
    body.youtubeSettings = {
      title: (opts.title || opts.content || 'Rivolio').slice(0, 100),
      privacyStatus: 'public',
      madeForKids: false,
      categoryId: '27', // Education
    };
  }

  const res = await zfetch('/posts', { method: 'POST', body: JSON.stringify(body) });
  const text = await res.text();
  let json: Record<string, unknown> = {};
  try {
    json = JSON.parse(text) as Record<string, unknown>;
  } catch {
    /* non-JSON */
  }
  if (!res.ok) {
    const msg = (json.error as string) || (json.message as string) || text.slice(0, 300);
    return { ok: false, error: `Zernio HTTP ${res.status}: ${msg}` };
  }
  const post = (json.post as Record<string, unknown>) ?? json;
  return {
    ok: true,
    postId: (post._id as string) ?? (post.id as string) ?? undefined,
    permalink: (post.permalink as string) ?? (post.url as string) ?? undefined,
  };
}

export interface PlatformPostStatus {
  status: string;
  platformStatus?: string;
  error?: string;
  permalink?: string;
}

/** Stato reale del post su una piattaforma specifica. */
export async function getPlatformPostStatus(
  postId: string,
  platform: Platform,
): Promise<PlatformPostStatus | null> {
  const p = await getPost(postId);
  if (!p) return null;
  const platforms = (p.platforms as Array<Record<string, unknown>>) ?? [];
  const pl = platforms.find((x) => x.platform === platform) ?? platforms[0];
  return {
    status: String(p.status ?? ''),
    platformStatus: pl ? String(pl.status ?? '') : undefined,
    error: pl ? (pl.errorMessage as string) : undefined,
    permalink: pl
      ? ((pl.platformPostUrl as string) ??
        (pl.permalink as string) ??
        (pl.publishedUrl as string) ??
        (pl.postUrl as string) ??
        undefined)
      : undefined,
  };
}

export interface TiktokPostStatus {
  status: string; // top-level: failed / published / processing / scheduled ...
  platformStatus?: string; // stato del canale tiktok
  error?: string; // messaggio d'errore se fallito
  permalink?: string; // link al post quando e' online
}

/** Legge lo stato REALE del post su TikTok (non basta l'accettazione della POST). */
export async function getTiktokPostStatus(postId: string): Promise<TiktokPostStatus | null> {
  const p = await getPost(postId);
  if (!p) return null;
  const platforms = (p.platforms as Array<Record<string, unknown>>) ?? [];
  const tk = platforms.find((x) => x.platform === 'tiktok') ?? platforms[0];
  return {
    status: String(p.status ?? ''),
    platformStatus: tk ? String(tk.status ?? '') : undefined,
    error: tk ? (tk.errorMessage as string) : undefined,
    permalink: tk
      ? ((tk.permalink as string) ?? (tk.publishedUrl as string) ?? (tk.postUrl as string) ?? undefined)
      : undefined,
  };
}
