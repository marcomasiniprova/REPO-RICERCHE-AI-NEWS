import type { SupabaseClient } from '@supabase/supabase-js';
import {
  accountIdFor,
  publishToPlatform,
  getPlatformPostStatus,
  type Platform,
  type MediaKind,
} from './zernio';

/**
 * Orchestrazione della pubblicazione lato server (Railway), MULTI-PIATTAFORMA via Zernio.
 * Un contenuto "approvato" viene pubblicato su TUTTE le sue piattaforme collegate
 * (carosello -> TikTok + Instagram; video -> TikTok + YouTube + Instagram; YouTube
 * salta i caroselli). Ogni canale ha invio + verifica + retry indipendenti.
 * "pubblicato" solo dopo verifica REALE. Idempotente (non ri-posta un canale gia' fatto
 * o gia' in lavorazione). Claude non entra mai: gira tutto sul backend.
 */

export interface CanaleEsito {
  canale: Platform;
  ok: boolean;
  stato?: string; // pubblicato | in_lavorazione | fallito | non_collegato
  permalink?: string;
  error?: string;
}
export interface PubEsito {
  key: string;
  ok: boolean;
  skipped?: string;
  stato?: string;
  canali?: CanaleEsito[];
}

type ContentValue = {
  date?: string;
  tema?: string;
  stato?: string;
  slides?: Array<{ img?: string; img_ig?: string; img_tiktok?: string }>;
  video_url?: string;
  caption?: string;
  caption_tiktok?: string;
  caption_ig?: string;
  youtube_titolo?: string;
  youtube_descrizione?: string;
  piattaforme_pubblicate?: string[];
  permalinks?: Record<string, string>;
  pub_post_ids?: Record<string, string>;
  [k: string]: unknown;
};

const sleep = (ms: number) => new Promise((r) => setTimeout(r, ms));
const OK_STATI = new Set(['published', 'live', 'success', 'posted', 'complete', 'completed']);
const KO_STATI = new Set(['failed', 'error', 'rejected']);

function isVideoKey(key: string): boolean {
  return key.startsWith('video_');
}
function channelsFor(key: string): Platform[] {
  return isVideoKey(key) ? ['tiktok', 'youtube', 'instagram'] : ['tiktok', 'instagram'];
}
function mediaFor(key: string, v: ContentValue, platform: Platform): Array<{ kind: MediaKind; url: string }> {
  if (isVideoKey(key)) {
    return v.video_url && v.video_url.startsWith('http') ? [{ kind: 'video', url: v.video_url }] : [];
  }
  // Carosello: TikTok vuole 9:16 (img_tiktok), Instagram 4:5 (img_ig). Fallback su img.
  const pick = (s: { img?: string; img_ig?: string; img_tiktok?: string }): string | undefined =>
    platform === 'tiktok' ? (s.img_tiktok ?? s.img) : (s.img_ig ?? s.img);
  return (v.slides ?? [])
    .map(pick)
    .filter((u): u is string => typeof u === 'string' && u.startsWith('http'))
    .map((url) => ({ kind: 'image' as MediaKind, url }));
}
function fallbackCaption(tema: string): string {
  return `${tema}. Salva questo prima del prossimo volo. Creato con AI. #rimborsovolo #volocancellato #dirittideipasseggeri #voli`;
}
function textFor(platform: Platform, v: ContentValue): { content: string; description: string; title: string } {
  const tema = v.tema || 'Rivolio';
  const base = (v.caption || '').trim();
  if (platform === 'tiktok') {
    return { content: tema, description: (v.caption_tiktok || base || fallbackCaption(tema)), title: tema };
  }
  if (platform === 'instagram') {
    return { content: tema, description: (v.caption_ig || base || fallbackCaption(tema)), title: tema };
  }
  // youtube
  const t = v.youtube_titolo || tema;
  return { content: t, description: (v.youtube_descrizione || base || fallbackCaption(tema)), title: t };
}

async function feed(db: SupabaseClient, kind: string, message: string) {
  await db.from('activity_feed').insert({ agent_slug: 'publisher', kind, message });
}
async function setKv(db: SupabaseClient, keyName: string, value: ContentValue) {
  await db.from('kv').update({ value, updated_at: new Date().toISOString() }).eq('key', keyName);
}

/** Verifica lo stato reale di un canale (poll breve). */
async function verificaCanale(postId: string, canale: Platform): Promise<'ok' | 'ko' | 'wait'> {
  for (let i = 0; i < 4; i++) {
    const st = await getPlatformPostStatus(postId, canale);
    const ps = (st?.platformStatus || st?.status || '').toLowerCase();
    if (st && (OK_STATI.has(ps) || (st.permalink && !KO_STATI.has(ps)))) return 'ok';
    if (st && KO_STATI.has(ps)) return 'ko';
    await sleep(2000 + i * 1500);
  }
  return 'wait';
}

/** Pubblica UN contenuto (carosello o video) su tutte le sue piattaforme collegate. */
export async function pubblicaContenuto(
  db: SupabaseClient,
  keyName: string,
  opts?: { draft?: boolean },
): Promise<PubEsito> {
  const { data: row } = await db.from('kv').select('value').eq('key', keyName).single();
  const v = (row?.value as ContentValue | null) ?? null;
  if (!v) return { key: keyName, ok: false, skipped: 'contenuto non trovato' };

  const dateLabel = String(v.date ?? keyName.replace(/^[a-z]+_/, ''));
  const haMedia = isVideoKey(keyName) ? !!v.video_url : (v.slides ?? []).length > 0;
  if (!haMedia) return { key: keyName, ok: false, skipped: 'nessun media pubblicabile' };

  const gia = new Set(Array.isArray(v.piattaforme_pubblicate) ? v.piattaforme_pubblicate : []);
  const permalinks: Record<string, string> = { ...(v.permalinks ?? {}) };
  const pubIds: Record<string, string> = { ...(v.pub_post_ids ?? {}) };
  const channels = channelsFor(keyName);
  const canali: CanaleEsito[] = [];
  let ultimoErrore: string | undefined;

  for (const ch of channels) {
    if (gia.has(ch)) {
      canali.push({ canale: ch, ok: true, stato: 'pubblicato', permalink: permalinks[ch] });
      continue;
    }
    let accountId: string | null = null;
    try {
      accountId = await accountIdFor(ch);
    } catch (e) {
      ultimoErrore = (e as Error).message;
    }
    if (!accountId) {
      canali.push({ canale: ch, ok: false, stato: 'non_collegato' });
      continue;
    }

    // Se ho gia' un post id per questo canale, ricontrollo (niente ri-post).
    let postId = pubIds[ch];
    if (!postId) {
      const media = mediaFor(keyName, v, ch);
      if (media.length === 0) {
        canali.push({ canale: ch, ok: false, stato: 'fallito', error: 'nessun media nel formato per questo canale' });
        continue;
      }
      const t = textFor(ch, v);
      const res = await publishToPlatform({
        platform: ch,
        accountId,
        media,
        content: t.content,
        description: t.description,
        title: t.title,
        aiGenerated: true,
        draft: opts?.draft,
      });
      if (!res.ok) {
        ultimoErrore = res.error;
        canali.push({ canale: ch, ok: false, stato: 'fallito', error: res.error });
        continue;
      }
      postId = res.postId ?? '';
      if (postId) pubIds[ch] = postId;
      if (res.permalink) permalinks[ch] = res.permalink;
    }

    if (!postId) {
      canali.push({ canale: ch, ok: true, stato: 'in_lavorazione' });
      continue;
    }
    const esito = await verificaCanale(postId, ch);
    if (esito === 'ok') {
      const st = await getPlatformPostStatus(postId, ch);
      if (st?.permalink) permalinks[ch] = st.permalink;
      gia.add(ch);
      canali.push({ canale: ch, ok: true, stato: 'pubblicato', permalink: permalinks[ch] });
    } else if (esito === 'ko') {
      const st = await getPlatformPostStatus(postId, ch);
      ultimoErrore = st?.error ?? 'rifiutato dalla piattaforma';
      delete pubIds[ch];
      canali.push({ canale: ch, ok: false, stato: 'fallito', error: ultimoErrore });
    } else {
      canali.push({ canale: ch, ok: true, stato: 'in_lavorazione' });
    }
  }

  // Canali "target" davvero collegati (esclude i non_collegato).
  const collegati = canali.filter((c) => c.stato !== 'non_collegato').map((c) => c.canale);
  const tuttiFatti = collegati.length > 0 && collegati.every((c) => gia.has(c));
  const qualcunoInCorso = canali.some((c) => c.stato === 'in_lavorazione');
  const nuovoStato = tuttiFatti ? 'pubblicato' : qualcunoInCorso ? 'in_pubblicazione' : (v.stato ?? 'approvato');

  await setKv(db, keyName, {
    ...v,
    stato: nuovoStato,
    piattaforme_pubblicate: Array.from(gia),
    permalinks,
    pub_post_ids: pubIds,
    ...(tuttiFatti ? { published_at: new Date().toISOString() } : {}),
    ...(ultimoErrore ? { ultimo_errore_pubblicazione: ultimoErrore } : {}),
  });

  const pubblicati = canali.filter((c) => c.stato === 'pubblicato');
  if (pubblicati.length > 0) {
    const dove = pubblicati.map((c) => c.canale).join(', ');
    await feed(db, 'success', `Pubblicato e verificato il ${dateLabel} su: ${dove}.`);
  }
  const falliti = canali.filter((c) => c.stato === 'fallito');
  if (falliti.length > 0) {
    await feed(db, 'error', `Il ${dateLabel} non e' uscito su ${falliti.map((c) => c.canale).join(', ')}: ${falliti[0].error}. Si ritenta.`);
  }

  return { key: keyName, ok: falliti.length === 0, stato: nuovoStato, canali };
}

// Compat: il vecchio nome usato da /api/decide.
export const pubblicaCarosello = pubblicaContenuto;

/** Pubblica/ricontrolla TUTTI i contenuti approvati o in pubblicazione (carosello + video). */
export async function pubblicaTuttiApprovati(db: SupabaseClient): Promise<PubEsito[]> {
  const { data } = await db.from('kv').select('key,value');
  const rows = (data as Array<{ key: string; value: ContentValue }> | null) ?? [];
  const daFare = rows.filter((r) => {
    if (!/^(carosello|video)_\d{4}-\d{2}-\d{2}$/.test(r.key) || !r.value) return false;
    return r.value.stato === 'approvato' || r.value.stato === 'in_pubblicazione';
  });
  const esiti: PubEsito[] = [];
  for (const r of daFare) esiti.push(await pubblicaContenuto(db, r.key));
  return esiti;
}
