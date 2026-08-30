import { createClient } from '@supabase/supabase-js';
import { pubblicaCarosello, pubblicaTuttiApprovati } from '@/lib/publishing';

/**
 * Pubblicazione lato SERVER (Railway). La chiama:
 *  - /api/decide subito dopo un'approvazione (pubblica quel pezzo),
 *  - un cron/chiamata manuale per smaltire gli approvati non ancora usciti (retry).
 *
 * Claude non passa mai di qui a fare l'azione esterna: la POST verso Zernio parte
 * dal server, quindi il classificatore di sicurezza non c'entra.
 *
 * Auth: header "Authorization: Bearer <INGEST_KEY>" (come /api/ingest).
 * Body opzionale: { key: "carosello_YYYY-MM-DD" } per pubblicarne uno solo;
 * senza body, pubblica tutti gli approvati non ancora su TikTok.
 */
export async function POST(request: Request) {
  const url = process.env.SUPABASE_URL || process.env.NEXT_PUBLIC_SUPABASE_URL;
  const skey = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !skey) {
    return Response.json({ ok: false, error: 'Supabase non configurato' }, { status: 503 });
  }
  if (!process.env.ZERNIO_API_KEY) {
    return Response.json({ ok: false, error: 'ZERNIO_API_KEY mancante su Railway' }, { status: 503 });
  }

  const auth = request.headers.get('authorization') ?? '';
  const expected = process.env.INGEST_KEY;
  if (!expected || auth !== `Bearer ${expected}`) {
    return Response.json({ ok: false, error: 'non autorizzato' }, { status: 401 });
  }

  let body: { key?: string } = {};
  try {
    body = (await request.json()) as { key?: string };
  } catch {
    /* body vuoto = pubblica tutti */
  }

  const db = createClient(url, skey, { auth: { persistSession: false } });

  try {
    if (body.key) {
      const esito = await pubblicaCarosello(db, body.key);
      return Response.json({ ok: esito.ok, esiti: [esito] }, { status: esito.ok ? 200 : 502 });
    }
    const esiti = await pubblicaTuttiApprovati(db);
    return Response.json({ ok: true, pubblicati: esiti.filter((e) => e.ok && !e.skipped).length, esiti });
  } catch (e) {
    return Response.json({ ok: false, error: (e as Error).message }, { status: 500 });
  }
}
