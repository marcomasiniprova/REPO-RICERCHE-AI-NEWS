import { createClient } from '@supabase/supabase-js';

/**
 * Decisione di Valerio su una bozza, dal bottone della dashboard.
 * L'approvazione qui NON invia: marca la bozza "approvata" (o "scartata").
 * L'invio vero lo fa l'agente al giro successivo, e solo delle bozze approvate.
 * Protetto da PIN (env APPROVE_PIN): il click e' l'OK esplicito di Valerio.
 */
export async function POST(request: Request) {
  const url = process.env.SUPABASE_URL || process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
  const pinEnv = process.env.APPROVE_PIN;
  if (!url || !key || !pinEnv) {
    return Response.json({ ok: false, error: 'non configurato' }, { status: 503 });
  }

  let body: {
    draft_id?: number;
    video_key?: string;
    carosello_key?: string;
    community_reply_id?: string;
    action?: string;
    note?: string;
    pin?: string;
    scelta?: Record<string, unknown>; // combinazione scelta quando si approva il piano
  };
  try {
    body = await request.json();
  } catch {
    return Response.json({ ok: false, error: 'body non valido' }, { status: 400 });
  }

  if (!body.pin || body.pin !== pinEnv) {
    return Response.json({ ok: false, error: 'PIN errato' }, { status: 401 });
  }

  // Video di RIVO VIDEO: vivono nel kv (chiave video_YYYY-MM-DD), il PIN
  // porta lo stato a "approvato" o "scartato"; pubblica poi l'agente.
  if (body.video_key) {
    const keyName = String(body.video_key);
    if (!/^video_\d{4}-\d{2}-\d{2}$/.test(keyName)) {
      return Response.json({ ok: false, error: 'chiave video non valida' }, { status: 400 });
    }
    const db = createClient(url, key, { auth: { persistSession: false } });
    const { data: row } = await db.from('kv').select('value').eq('key', keyName).single();
    const video = row?.value as Record<string, unknown> | null;
    if (!video || typeof video !== 'object') {
      return Response.json({ ok: false, error: 'video non trovato' }, { status: 404 });
    }
    const nowIso = new Date().toISOString();
    const dateLabel = String(video.date ?? keyName.slice(6));

    // FASE PIANO: Valerio approva il piano (col PIN) e sceglie la combinazione -> l'agente generera'.
    if (body.action === 'approve_plan') {
      if (video.stato !== 'piano_in_attesa') {
        return Response.json({ ok: false, error: 'piano gia deciso o non in attesa' }, { status: 409 });
      }
      const next = {
        ...video,
        stato: 'piano_approvato',
        scelta: body.scelta ?? video.scelta ?? null,
        plan_decided_at: nowIso,
      };
      const { error: upErr } = await db
        .from('kv')
        .update({ value: next, updated_at: nowIso })
        .eq('key', keyName);
      if (upErr) return Response.json({ ok: false, error: upErr.message }, { status: 500 });
      const sc = (body.scelta ?? {}) as Record<string, unknown>;
      const scLabel = sc.modello
        ? `${sc.modello}${sc.risoluzione ? ` ${sc.risoluzione}` : ''} ${sc.durata_s ?? ''}s (${sc.crediti ?? '?'} crediti)`
        : 'la combinazione scelta';
      await db.from('activity_feed').insert({
        agent_slug: null,
        kind: 'success',
        message: `Valerio ha approvato il piano del video del ${dateLabel}: ${scLabel}. RIVO VIDEO genera al primo giro utile.`,
      });
      return Response.json({ ok: true, status: 'piano_approvato' });
    }

    // Scarto del piano
    if (body.action === 'reject' && video.stato === 'piano_in_attesa') {
      const next = { ...video, stato: 'scartato', plan_decided_at: nowIso };
      const { error: upErr } = await db.from('kv').update({ value: next, updated_at: nowIso }).eq('key', keyName);
      if (upErr) return Response.json({ ok: false, error: upErr.message }, { status: 500 });
      await db.from('activity_feed').insert({
        agent_slug: null,
        kind: 'info',
        message: `Valerio ha scartato il piano del video del ${dateLabel}.`,
      });
      return Response.json({ ok: true, status: 'scartato' });
    }

    // FASE OUTPUT: approvazione/scarto del video generato (pubblicazione)
    if (video.stato !== 'in_attesa') {
      return Response.json({ ok: false, error: 'video gia deciso o non pronto' }, { status: 409 });
    }
    const stato = body.action === 'reject' ? 'scartato' : 'approvato';
    const next = {
      ...video,
      stato,
      decided_at: nowIso,
      note: body.note ? `${video.note ? `${video.note}\n` : ''}Valerio: ${String(body.note)}` : video.note,
    };
    const { error: upErr } = await db
      .from('kv')
      .update({ value: next, updated_at: nowIso })
      .eq('key', keyName);
    if (upErr) return Response.json({ ok: false, error: upErr.message }, { status: 500 });

    await db.from('activity_feed').insert({
      agent_slug: null,
      kind: stato === 'approvato' ? 'success' : 'info',
      message:
        stato === 'approvato'
          ? `Valerio ha approvato il video del ${dateLabel}: RIVO VIDEO lo pubblica su TikTok, Reels e Shorts al primo giro utile.`
          : `Valerio ha scartato il video del ${dateLabel}.`,
    });
    return Response.json({ ok: true, status: stato });
  }

  // Caroselli di RIVO CAROSELLI: vivono nel kv (chiave carosello_YYYY-MM-DD).
  // Una sola fase: in_attesa -> approvato/scartato col PIN; pubblica poi il PUBLISHER.
  if (body.carosello_key) {
    const keyName = String(body.carosello_key);
    if (!/^carosello_\d{4}-\d{2}-\d{2}$/.test(keyName)) {
      return Response.json({ ok: false, error: 'chiave carosello non valida' }, { status: 400 });
    }
    const db = createClient(url, key, { auth: { persistSession: false } });
    const { data: row } = await db.from('kv').select('value').eq('key', keyName).single();
    const car = row?.value as Record<string, unknown> | null;
    if (!car || typeof car !== 'object') {
      return Response.json({ ok: false, error: 'carosello non trovato' }, { status: 404 });
    }
    if (car.stato !== 'in_attesa') {
      return Response.json({ ok: false, error: 'carosello gia deciso o non pronto' }, { status: 409 });
    }
    const nowIso = new Date().toISOString();
    const dateLabel = String(car.date ?? keyName.slice(10));
    const stato = body.action === 'reject' ? 'scartato' : 'approvato';
    const next = { ...car, stato, decided_at: nowIso };
    const { error: upErr } = await db.from('kv').update({ value: next, updated_at: nowIso }).eq('key', keyName);
    if (upErr) return Response.json({ ok: false, error: upErr.message }, { status: 500 });
    await db.from('activity_feed').insert({
      agent_slug: null,
      kind: stato === 'approvato' ? 'success' : 'info',
      message:
        stato === 'approvato'
          ? `Valerio ha approvato il carosello del ${dateLabel}: il PUBLISHER lo pubblichera' al primo giro utile (col PIN).`
          : `Valerio ha scartato il carosello del ${dateLabel}.`,
    });
    return Response.json({ ok: true, status: stato });
  }

  // Risposte di RIVO COMMUNITY: vivono in un array dentro il kv community_stato.
  // Il PIN porta la singola risposta a "approvato"; l'agente la invia al giro dopo.
  if (body.community_reply_id) {
    const replyId = String(body.community_reply_id);
    const db = createClient(url, key, { auth: { persistSession: false } });
    const { data: row } = await db.from('kv').select('value').eq('key', 'community_stato').single();
    const stato = row?.value as { risposte?: Array<Record<string, unknown>> } | null;
    if (!stato || !Array.isArray(stato.risposte)) {
      return Response.json({ ok: false, error: 'stato community non trovato' }, { status: 404 });
    }
    const idx = stato.risposte.findIndex((r) => String(r.id) === replyId);
    if (idx < 0) {
      return Response.json({ ok: false, error: 'risposta non trovata' }, { status: 404 });
    }
    if (stato.risposte[idx].stato !== 'in_attesa') {
      return Response.json({ ok: false, error: 'risposta gia decisa' }, { status: 409 });
    }
    const nowIso = new Date().toISOString();
    const nuovoStato = body.action === 'reject' ? 'scartato' : 'approvato';
    stato.risposte[idx] = { ...stato.risposte[idx], stato: nuovoStato, deciso_at: nowIso };
    const { error: upErr } = await db.from('kv').update({ value: stato, updated_at: nowIso }).eq('key', 'community_stato');
    if (upErr) return Response.json({ ok: false, error: upErr.message }, { status: 500 });
    const da = String(stato.risposte[idx].da ?? 'un utente');
    await db.from('activity_feed').insert({
      agent_slug: null,
      kind: nuovoStato === 'approvato' ? 'success' : 'info',
      message:
        nuovoStato === 'approvato'
          ? `Valerio ha approvato la risposta a ${da}: RIVO COMMUNITY la invia al prossimo giro.`
          : `Valerio ha scartato la risposta a ${da}.`,
    });
    return Response.json({ ok: true, status: nuovoStato });
  }

  const id = Number(body.draft_id);
  const action = body.action === 'reject' ? 'scartata' : 'approvata';
  if (!id) return Response.json({ ok: false, error: 'draft_id mancante' }, { status: 400 });

  const db = createClient(url, key, { auth: { persistSession: false } });
  const { data: draft, error } = await db
    .from('drafts')
    .update({ status: action, decided_at: new Date().toISOString() })
    .eq('id', id)
    .in('status', ['bozza'])
    .select('id, creator, channel')
    .single();
  if (error || !draft) {
    return Response.json({ ok: false, error: 'bozza non trovata o gia decisa' }, { status: 404 });
  }

  await db.from('activity_feed').insert({
    agent_slug: null,
    kind: action === 'approvata' ? 'success' : 'info',
    message:
      action === 'approvata'
        ? `Valerio ha approvato la bozza per ${draft.creator}: ${draft.channel === 'email' ? "l'email parte" : 'il DM parte'} al prossimo giro dell'agente.`
        : `Valerio ha scartato la bozza per ${draft.creator}.`,
  });

  return Response.json({ ok: true, status: action });
}
