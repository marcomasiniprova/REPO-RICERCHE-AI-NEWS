import type { SupabaseClient } from '@supabase/supabase-js';
import { accountIdFor, publishTiktokCarousel } from './zernio';

/**
 * Orchestrazione della pubblicazione lato server (Railway).
 * Un carosello in stato "approvato" viene pubblicato su TikTok via Zernio e
 * segnato "pubblicato". Idempotente: se e' gia' uscito su TikTok, non ripubblica.
 * Claude non tocca nulla di tutto questo: gira solo qui, sul backend.
 */

export interface PubEsito {
  key: string;
  ok: boolean;
  skipped?: string;
  postId?: string;
  permalink?: string;
  error?: string;
}

type CarValue = {
  date?: string;
  tema?: string;
  stato?: string;
  slides?: Array<{ img?: string }>;
  caption?: string;
  caption_tiktok?: string;
  piattaforme_pubblicate?: string[];
  [k: string]: unknown;
};

/** Caption TikTok da usare: prima la dedicata, poi quella base, poi un fallback dal tema. */
function captionFor(car: CarValue): string {
  const c = (car.caption_tiktok || car.caption || '').trim();
  if (c) return c;
  const tema = car.tema || 'Rimborso volo';
  return `${tema}. Salva questo prima del prossimo volo. Creato con AI. #rimborsovolo #volocancellato #dirittideipasseggeri #voli`;
}

/**
 * Pubblica UN carosello (per chiave kv) su TikTok. Ritorna l'esito.
 * `force` salta il controllo di stato "approvato" (usato solo internamente se serve).
 */
export async function pubblicaCarosello(
  db: SupabaseClient,
  keyName: string,
): Promise<PubEsito> {
  const { data: row } = await db.from('kv').select('value').eq('key', keyName).single();
  const car = (row?.value as CarValue | null) ?? null;
  if (!car) return { key: keyName, ok: false, error: 'carosello non trovato' };

  if (car.stato !== 'approvato') {
    return { key: keyName, ok: false, skipped: `stato ${car.stato ?? '?'}, non approvato` };
  }
  const gia = Array.isArray(car.piattaforme_pubblicate) ? car.piattaforme_pubblicate : [];
  if (gia.includes('tiktok')) {
    return { key: keyName, ok: true, skipped: 'gia pubblicato su tiktok' };
  }

  const images = (car.slides ?? [])
    .map((s) => s?.img)
    .filter((u): u is string => typeof u === 'string' && u.startsWith('http'));
  if (images.length === 0) {
    return { key: keyName, ok: false, error: 'nessuna immagine valida nelle slide' };
  }

  let accountId: string | null;
  try {
    accountId = await accountIdFor('tiktok');
  } catch (e) {
    return { key: keyName, ok: false, error: (e as Error).message };
  }
  if (!accountId) {
    return { key: keyName, ok: false, error: 'account TikTok non collegato in Zernio' };
  }

  const res = await publishTiktokCarousel({
    accountId,
    images,
    content: car.tema || 'Rivolio',
    description: captionFor(car),
    aiGenerated: true,
  });

  const nowIso = new Date().toISOString();
  const dateLabel = String(car.date ?? keyName.replace(/^carosello_/, ''));

  if (!res.ok) {
    await db.from('activity_feed').insert({
      agent_slug: 'publisher',
      kind: 'error',
      message: `Pubblicazione TikTok fallita per il carosello del ${dateLabel}: ${res.error}. Resta approvato, riprovo.`,
    });
    return { key: keyName, ok: false, error: res.error };
  }

  const next = {
    ...car,
    stato: 'pubblicato',
    piattaforme_pubblicate: [...gia, 'tiktok'],
    published_at: nowIso,
    tiktok_post_id: res.postId ?? null,
    tiktok_permalink: res.permalink ?? null,
  };
  await db.from('kv').update({ value: next, updated_at: nowIso }).eq('key', keyName);
  await db.from('activity_feed').insert({
    agent_slug: 'publisher',
    kind: 'success',
    message: `Pubblicato su TikTok (@rivolio_ai) il carosello del ${dateLabel}${res.permalink ? `: ${res.permalink}` : '.'}`,
  });

  return { key: keyName, ok: true, postId: res.postId, permalink: res.permalink };
}

/** Pubblica TUTTI i caroselli approvati non ancora usciti su TikTok. */
export async function pubblicaTuttiApprovati(db: SupabaseClient): Promise<PubEsito[]> {
  const { data } = await db.from('kv').select('key,value');
  const rows = (data as Array<{ key: string; value: CarValue }> | null) ?? [];
  const daFare = rows.filter(
    (r) =>
      /^carosello_\d{4}-\d{2}-\d{2}$/.test(r.key) &&
      r.value &&
      r.value.stato === 'approvato' &&
      !(Array.isArray(r.value.piattaforme_pubblicate) && r.value.piattaforme_pubblicate.includes('tiktok')),
  );
  const esiti: PubEsito[] = [];
  for (const r of daFare) {
    esiti.push(await pubblicaCarosello(db, r.key));
  }
  return esiti;
}
