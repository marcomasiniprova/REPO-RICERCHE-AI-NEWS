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

  let body: { draft_id?: number; action?: string; pin?: string };
  try {
    body = await request.json();
  } catch {
    return Response.json({ ok: false, error: 'body non valido' }, { status: 400 });
  }

  if (!body.pin || body.pin !== pinEnv) {
    return Response.json({ ok: false, error: 'PIN errato' }, { status: 401 });
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
