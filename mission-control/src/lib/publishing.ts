import type { SupabaseClient } from '@supabase/supabase-js';
import { accountIdFor, publishTiktokCarousel, getTiktokPostStatus } from './zernio';

/**
 * Orchestrazione della pubblicazione lato server (Railway).
 * Un carosello "approvato" viene pubblicato su TikTok via Zernio e segnato
 * "pubblicato" SOLO dopo aver verificato lo stato REALE su TikTok (non basta che
 * Zernio accetti la POST: TikTok potrebbe rifiutare, es. "direct posting at capacity").
 * Idempotente: se e' gia' uscito, o e' in pubblicazione con un post id, non ri-posta.
 * Claude non tocca niente di tutto questo: gira solo qui, sul backend.
 */

export interface PubEsito {
  key: string;
  ok: boolean;
  skipped?: string;
  stato?: string;
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
  tiktok_post_id?: string | null;
  [k: string]: unknown;
};

const sleep = (ms: number) => new Promise((r) => setTimeout(r, ms));
const OK_STATI = new Set(['published', 'live', 'success', 'posted', 'complete', 'completed']);
const KO_STATI = new Set(['failed', 'error', 'rejected']);

function captionFor(car: CarValue): string {
  const c = (car.caption_tiktok || car.caption || '').trim();
  if (c) return c;
  const tema = car.tema || 'Rimborso volo';
  return `${tema}. Salva questo prima del prossimo volo. Creato con AI. #rimborsovolo #volocancellato #dirittideipasseggeri #voli`;
}

async function feed(db: SupabaseClient, kind: string, message: string) {
  await db.from('activity_feed').insert({ agent_slug: 'publisher', kind, message });
}

async function setKv(db: SupabaseClient, keyName: string, value: CarValue) {
  await db.from('kv').update({ value, updated_at: new Date().toISOString() }).eq('key', keyName);
}

/** Interroga lo stato reale del post su TikTok e chiude di conseguenza. */
async function verificaEChiudi(
  db: SupabaseClient,
  keyName: string,
  car: CarValue,
  postId: string,
  dateLabel: string,
): Promise<PubEsito> {
  // Poll: TikTok puo' impiegare qualche secondo. Fino a ~18s totali.
  for (let i = 0; i < 5; i++) {
    const st = await getTiktokPostStatus(postId);
    const ps = (st?.platformStatus || st?.status || '').toLowerCase();
    if (st && (OK_STATI.has(ps) || (st.permalink && !KO_STATI.has(ps)))) {
      const gia = Array.isArray(car.piattaforme_pubblicate) ? car.piattaforme_pubblicate : [];
      await setKv(db, keyName, {
        ...car,
        stato: 'pubblicato',
        piattaforme_pubblicate: Array.from(new Set([...gia, 'tiktok'])),
        published_at: new Date().toISOString(),
        tiktok_post_id: postId,
        tiktok_permalink: st.permalink ?? null,
      });
      await feed(db, 'success', `Pubblicato e verificato su TikTok (@rivolio_ai) il carosello del ${dateLabel}${st.permalink ? `: ${st.permalink}` : '.'}`);
      return { key: keyName, ok: true, stato: 'pubblicato', postId, permalink: st.permalink };
    }
    if (st && KO_STATI.has(ps)) {
      // Fallito su TikTok: torna "approvato" (ritentabile) e registra il motivo.
      await setKv(db, keyName, {
        ...car,
        stato: 'approvato',
        piattaforme_pubblicate: [],
        tiktok_post_id: null,
        ultimo_errore_pubblicazione: st.error ?? 'TikTok ha rifiutato la pubblicazione',
      });
      await feed(db, 'error', `TikTok ha rifiutato il carosello del ${dateLabel}: ${st.error ?? 'errore'}. Resta approvato, si ritenta.`);
      return { key: keyName, ok: false, stato: 'approvato', error: st.error };
    }
    await sleep(2000 + i * 1500);
  }
  // Ancora in lavorazione: salva il post id e lo stato, il prossimo giro ricontrolla (niente ri-post).
  await setKv(db, keyName, { ...car, stato: 'in_pubblicazione', tiktok_post_id: postId });
  await feed(db, 'info', `Carosello del ${dateLabel} in pubblicazione su TikTok, verifico tra poco.`);
  return { key: keyName, ok: true, stato: 'in_pubblicazione', postId, skipped: 'in lavorazione' };
}

/** Pubblica UN carosello (per chiave kv) su TikTok, con verifica reale. */
export async function pubblicaCarosello(
  db: SupabaseClient,
  keyName: string,
  opts?: { draft?: boolean },
): Promise<PubEsito> {
  const { data: row } = await db.from('kv').select('value').eq('key', keyName).single();
  const car = (row?.value as CarValue | null) ?? null;
  if (!car) return { key: keyName, ok: false, error: 'carosello non trovato' };

  const dateLabel = String(car.date ?? keyName.replace(/^carosello_/, ''));
  const gia = Array.isArray(car.piattaforme_pubblicate) ? car.piattaforme_pubblicate : [];
  if (gia.includes('tiktok')) return { key: keyName, ok: true, skipped: 'gia pubblicato su tiktok', stato: 'pubblicato' };

  // Idempotenza: se e' gia' in pubblicazione con un post id, ricontrolla quel post (niente ri-post).
  if (car.stato === 'in_pubblicazione' && typeof car.tiktok_post_id === 'string' && car.tiktok_post_id) {
    return verificaEChiudi(db, keyName, car, car.tiktok_post_id, dateLabel);
  }

  if (car.stato !== 'approvato') {
    return { key: keyName, ok: false, skipped: `stato ${car.stato ?? '?'}, non approvato` };
  }

  const images = (car.slides ?? [])
    .map((s) => s?.img)
    .filter((u): u is string => typeof u === 'string' && u.startsWith('http'));
  if (images.length === 0) return { key: keyName, ok: false, error: 'nessuna immagine valida nelle slide' };

  let accountId: string | null;
  try {
    accountId = await accountIdFor('tiktok');
  } catch (e) {
    return { key: keyName, ok: false, error: (e as Error).message };
  }
  if (!accountId) return { key: keyName, ok: false, error: 'account TikTok non collegato in Zernio' };

  const res = await publishTiktokCarousel({
    accountId,
    images,
    content: car.tema || 'Rivolio',
    description: captionFor(car),
    aiGenerated: true,
    draft: opts?.draft,
  });

  if (!res.ok) {
    await setKv(db, keyName, { ...car, ultimo_errore_pubblicazione: res.error });
    await feed(db, 'error', `Pubblicazione TikTok non avviata per il carosello del ${dateLabel}: ${res.error}. Resta approvato, si ritenta.`);
    return { key: keyName, ok: false, error: res.error };
  }

  // Modalita' bozza: consegnato alla Creator Inbox di TikTok (Valerio finalizza nell'app).
  if (opts?.draft) {
    await setKv(db, keyName, { ...car, stato: 'bozza_tiktok', tiktok_post_id: res.postId ?? null });
    await feed(db, 'success', `Carosello del ${dateLabel} consegnato alla Creator Inbox di TikTok: aprilo nell'app @rivolio_ai per pubblicarlo.`);
    return { key: keyName, ok: true, stato: 'bozza_tiktok', postId: res.postId };
  }

  if (!res.postId) {
    // Accettato ma senza id: segnalo, non dichiaro pubblicato.
    await feed(db, 'info', `Carosello del ${dateLabel} inviato a TikTok, in attesa di conferma.`);
    return { key: keyName, ok: true, stato: 'in_pubblicazione', skipped: 'senza post id' };
  }

  return verificaEChiudi(db, keyName, car, res.postId, dateLabel);
}

/** Pubblica TUTTI i caroselli approvati (o ricontrolla quelli in pubblicazione). */
export async function pubblicaTuttiApprovati(db: SupabaseClient): Promise<PubEsito[]> {
  const { data } = await db.from('kv').select('key,value');
  const rows = (data as Array<{ key: string; value: CarValue }> | null) ?? [];
  const daFare = rows.filter((r) => {
    if (!/^carosello_\d{4}-\d{2}-\d{2}$/.test(r.key) || !r.value) return false;
    const st = r.value.stato;
    const gia = Array.isArray(r.value.piattaforme_pubblicate) && r.value.piattaforme_pubblicate.includes('tiktok');
    return !gia && (st === 'approvato' || st === 'in_pubblicazione');
  });
  const esiti: PubEsito[] = [];
  for (const r of daFare) esiti.push(await pubblicaCarosello(db, r.key));
  return esiti;
}
