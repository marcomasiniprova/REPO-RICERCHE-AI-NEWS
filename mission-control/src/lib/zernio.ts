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
