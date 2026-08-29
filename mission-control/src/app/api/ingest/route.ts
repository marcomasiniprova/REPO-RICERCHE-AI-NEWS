import { createClient, type SupabaseClient } from '@supabase/supabase-js';
import { cleanEmailBody } from '@/lib/emailClean';
import agentsSeed from '@/data/agents.json';

/** Auto-registrazione: agent_runs.agent_slug ha una FK su agents(slug), quindi un
 *  ruolo nuovo deve avere la sua riga in `agents` prima del primo run_start.
 *  Se manca, la creiamo dai dati del seed (o con un minimo se non e' nel seed),
 *  cosi' aggiungere un ruolo non richiede piu' una insert manuale nel DB. */
async function ensureAgent(
  db: SupabaseClient,
  slug: string,
): Promise<void> {
  const { data: existing } = await db.from('agents').select('slug').eq('slug', slug).maybeSingle();
  if (existing) return;
  const seed = (agentsSeed as Array<Record<string, unknown>>).find((a) => a.slug === slug);
  await db.from('agents').insert({
    slug,
    name: (seed?.name as string) ?? slug.toUpperCase(),
    role: (seed?.role as string) ?? 'RIVO',
    tagline: (seed?.tagline as string) ?? null,
    avatar: (seed?.avatar as string) ?? null,
    schedule_label: (seed?.schedule_label as string) ?? null,
    cron: (seed?.cron as string) ?? null,
    color: (seed?.color as string) ?? null,
  });
}

/**
 * Endpoint unico con cui gli agenti RIVO aggiornano la Mission Control.
 * Auth: header "Authorization: Bearer <INGEST_KEY>".
 *
 * Operazioni (campo "op" nel body JSON):
 *  - run_start     { agent, task }
 *  - run_finish    { agent, esito: 'ok'|'error', summary, items? }
 *  - heartbeat     { agent, status: 'idle'|'working'|'error'|'paused', task? }
 *  - feed          { agent?, kind?, message }
 *  - creator_upsert{ name, ig?, stage?, ...campi creator }
 *  - draft_upsert  { id?, creator, channel, subject?, body, status?, agent? }
 *  - reddit_add    { date, subreddit, kind?, title, body_summary?, permalink_id?, status? }
 *  - kv_set        { key, value }
 *  - persist_asset { url, path, content_type? }  -> salva l'asset in Storage e ritorna { url } permanente
 */

function admin() {
  const url = process.env.SUPABASE_URL || process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !key) return null;
  return createClient(url, key, { auth: { persistSession: false } });
}

/**
 * Lettura per gli agenti (stessa chiave):
 *  - GET /api/ingest?drafts=approvata       -> bozze in quello stato (da inviare)
 *  - GET /api/ingest?messages_hours=48      -> indice dei messaggi gia' in dashboard
 *    nelle ultime N ore (external_id, canale, controparte, direzione, ts):
 *    l'agente lo confronta con Instagram/Gmail e aggiunge SOLO cio' che manca.
 *  - GET /api/ingest?digest=1               -> il quadro per il CAPO in una chiamata:
 *    stato agenti, ultimi giri, pipeline per stage, bozze per stato, kv.
 */
export async function GET(request: Request) {
  const auth = request.headers.get('authorization') ?? '';
  const expected = process.env.INGEST_KEY;
  if (!expected || auth !== `Bearer ${expected}`) {
    return Response.json({ ok: false, error: 'non autorizzato' }, { status: 401 });
  }
  const db = admin();
  if (!db) {
    return Response.json({ ok: false, error: 'database non configurato' }, { status: 503 });
  }
  const params = new URL(request.url).searchParams;

  const status = params.get('drafts');
  if (status) {
    const { data, error } = await db
      .from('drafts')
      .select('id, creator, channel, subject, body, status, agent_slug, created_at')
      .eq('status', status)
      .order('created_at', { ascending: true });
    if (error) {
      return Response.json({ ok: false, error: error.message }, { status: 500 });
    }
    return Response.json({ ok: true, drafts: data });
  }

  if (params.get('digest')) {
    const [agents, runs, creators, drafts, kv] = await Promise.all([
      db.from('agents').select('slug, status, last_run_at, today_count, current_task').order('sort'),
      db
        .from('agent_runs')
        .select('agent_slug, status, started_at, finished_at, summary, items')
        .order('started_at', { ascending: false })
        .limit(12),
      db.from('creators').select('name, ig, stage, esito, updated_at').eq('source', 'crm'),
      db.from('drafts').select('id, creator, channel, status, created_at'),
      db.from('kv').select('key, value, updated_at'),
    ]);
    const err = agents.error ?? runs.error ?? creators.error ?? drafts.error ?? kv.error;
    if (err) return Response.json({ ok: false, error: err.message }, { status: 500 });

    const byStage: Record<string, number> = {};
    for (const c of creators.data ?? []) byStage[c.stage] = (byStage[c.stage] ?? 0) + 1;
    const draftsByStatus: Record<string, number> = {};
    for (const d of drafts.data ?? []) draftsByStatus[d.status] = (draftsByStatus[d.status] ?? 0) + 1;
    const pendingDrafts = (drafts.data ?? []).filter((d) => d.status === 'bozza');

    return Response.json({
      ok: true,
      now: new Date().toISOString(),
      agents: agents.data,
      ultimi_giri: runs.data,
      pipeline_per_stage: byStage,
      creators: creators.data,
      bozze_per_stato: draftsByStatus,
      bozze_in_attesa: pendingDrafts,
      kv: kv.data,
    });
  }

  const hoursRaw = params.get('messages_hours');
  if (hoursRaw) {
    const hours = Math.min(Math.max(Number(hoursRaw) || 48, 1), 168);
    const since = new Date(Date.now() - hours * 3600_000).toISOString();
    const { data, error } = await db
      .from('messages')
      .select('external_id, channel, counterpart, creator_name, direction, ts')
      .gte('ts', since)
      .order('ts', { ascending: true })
      .limit(1000);
    if (error) {
      return Response.json({ ok: false, error: error.message }, { status: 500 });
    }
    return Response.json({ ok: true, since, count: data.length, messages: data });
  }

  return Response.json({ ok: false, error: 'parametro mancante: drafts, messages_hours o digest' }, { status: 400 });
}

export async function POST(request: Request) {
  const auth = request.headers.get('authorization') ?? '';
  const expected = process.env.INGEST_KEY;
  if (!expected || auth !== `Bearer ${expected}`) {
    return Response.json({ ok: false, error: 'non autorizzato' }, { status: 401 });
  }

  const db = admin();
  if (!db) {
    return Response.json({ ok: false, error: 'database non configurato' }, { status: 503 });
  }

  let body: Record<string, unknown>;
  try {
    body = await request.json();
  } catch {
    return Response.json({ ok: false, error: 'body non valido' }, { status: 400 });
  }

  const op = String(body.op ?? '');
  const agent = body.agent ? String(body.agent) : null;
  const nowIso = new Date().toISOString();

  try {
    switch (op) {
      case 'run_start': {
        if (!agent) throw new Error('agent mancante');
        await ensureAgent(db, agent);
        const task = body.task ? String(body.task) : null;
        const { data: run, error } = await db
          .from('agent_runs')
          .insert({ agent_slug: agent, status: 'running', summary: task })
          .select('id')
          .single();
        if (error) throw error;
        await db
          .from('agents')
          .update({ status: 'working', current_task: task, updated_at: nowIso })
          .eq('slug', agent);
        await db.from('activity_feed').insert({
          agent_slug: agent,
          kind: 'run',
          message: task ? `Giro avviato: ${task}` : 'Giro avviato',
        });
        return Response.json({ ok: true, run_id: run.id });
      }

      case 'run_finish': {
        if (!agent) throw new Error('agent mancante');
        await ensureAgent(db, agent);
        const esito = body.esito === 'error' ? 'error' : 'ok';
        const summary = body.summary ? String(body.summary) : null;
        const items = Number(body.items ?? 0) || 0;
        const { data: open } = await db
          .from('agent_runs')
          .select('id')
          .eq('agent_slug', agent)
          .eq('status', 'running')
          .order('started_at', { ascending: false })
          .limit(1);
        if (open && open.length > 0) {
          await db
            .from('agent_runs')
            .update({ status: esito, finished_at: nowIso, summary, items })
            .eq('id', open[0].id);
        } else {
          await db
            .from('agent_runs')
            .insert({ agent_slug: agent, status: esito, finished_at: nowIso, summary, items });
        }
        const { data: a } = await db.from('agents').select('today_count, last_run_at').eq('slug', agent).single();
        const sameDay =
          a?.last_run_at && new Date(a.last_run_at).toDateString() === new Date().toDateString();
        await db
          .from('agents')
          .update({
            status: esito === 'error' ? 'error' : 'idle',
            current_task: null,
            last_run_at: nowIso,
            today_count: (sameDay ? (a?.today_count ?? 0) : 0) + items,
            updated_at: nowIso,
          })
          .eq('slug', agent);
        if (summary) {
          await db.from('activity_feed').insert({
            agent_slug: agent,
            kind: esito === 'error' ? 'error' : 'success',
            message: summary,
          });
        }
        return Response.json({ ok: true });
      }

      case 'heartbeat': {
        if (!agent) throw new Error('agent mancante');
        const status = String(body.status ?? 'idle');
        await db
          .from('agents')
          .update({
            status,
            current_task: body.task ? String(body.task) : null,
            updated_at: nowIso,
          })
          .eq('slug', agent);
        return Response.json({ ok: true });
      }

      case 'feed': {
        const message = String(body.message ?? '').trim();
        if (!message) throw new Error('message mancante');
        await db.from('activity_feed').insert({
          agent_slug: agent,
          kind: String(body.kind ?? 'info'),
          message,
        });
        return Response.json({ ok: true });
      }

      case 'creator_upsert': {
        const name = String(body.name ?? '').trim();
        if (!name) throw new Error('name mancante');
        const fields: Record<string, unknown> = {
          name,
          updated_at: nowIso,
        };
        for (const k of ['ig', 'tiktok', 'followers', 'fascia', 'stage', 'canale', 'email', 'esito', 'priorita', 'url', 'source']) {
          if (body[k] !== undefined) fields[k] = body[k];
        }
        const { error } = await db.from('creators').upsert(fields, { onConflict: 'name' });
        if (error) throw error;
        return Response.json({ ok: true });
      }

      case 'draft_upsert': {
        const fields: Record<string, unknown> = {
          creator: String(body.creator ?? ''),
          channel: String(body.channel ?? 'email'),
          subject: body.subject ? String(body.subject) : null,
          body: String(body.body ?? ''),
          status: String(body.status ?? 'bozza'),
          agent_slug: agent ?? 'ig_email',
        };
        if (body.id) {
          await db.from('drafts').update(fields).eq('id', Number(body.id));
        } else {
          await db.from('drafts').insert(fields);
          await db.from('activity_feed').insert({
            agent_slug: agent ?? 'ig_email',
            kind: 'draft',
            message: `Nuova bozza pronta per ${fields.creator}`,
          });
        }
        return Response.json({ ok: true });
      }

      case 'reddit_add': {
        const { error } = await db.from('reddit_items').insert({
          date: String(body.date ?? nowIso.slice(0, 10)),
          subreddit: String(body.subreddit ?? ''),
          kind: String(body.kind ?? 'comment'),
          title: String(body.title ?? ''),
          body_summary: body.body_summary ? String(body.body_summary) : null,
          permalink_id: body.permalink_id ? String(body.permalink_id) : null,
          permalink_url: body.permalink_url ? String(body.permalink_url) : null,
          status: String(body.status ?? 'pubblicato'),
        });
        if (error) throw error;
        return Response.json({ ok: true });
      }

      case 'message_add': {
        const channel_ = body.channel === 'email' ? 'email' : 'dm';
        let body_ = String(body.body ?? '').trim();
        if (channel_ === 'email') body_ = cleanEmailBody(body_);
        if (!body_) throw new Error('body mancante');
        const { error } = await db.from('messages').upsert(
          {
            external_id: body.external_id ? String(body.external_id) : `manual_${Date.now()}`,
            creator_name: body.creator_name ? String(body.creator_name) : null,
            counterpart: String(body.counterpart ?? ''),
            channel: channel_,
            direction: body.direction === 'in' ? 'in' : 'out',
            subject: body.subject ? String(body.subject) : null,
            body: body_,
            ts: body.ts ? String(body.ts) : nowIso,
          },
          { onConflict: 'external_id' },
        );
        if (error) throw error;
        return Response.json({ ok: true });
      }

      case 'kv_set': {
        const key = String(body.key ?? '').trim();
        if (!key) throw new Error('key mancante');
        await db.from('kv').upsert({ key, value: body.value, updated_at: nowIso });
        return Response.json({ ok: true });
      }

      // Salva in modo PERMANENTE un asset generato (video/immagine) che vive
      // solo su un link temporaneo di Kie (scade in ~24h). Lo scarica e lo mette
      // nel bucket "content" di Supabase Storage, e restituisce l'URL pubblico
      // stabile. Idempotente: stesso `path` -> stesso URL (upsert).
      //  body: { url, path, content_type? }  ->  { ok, url }
      case 'persist_asset': {
        const srcUrl = String(body.url ?? '').trim();
        const path = String(body.path ?? '').trim().replace(/^\/+/, '');
        if (!srcUrl) throw new Error('url mancante');
        if (!path) throw new Error('path mancante');
        const BUCKET = 'content';

        // il bucket deve esistere ed essere pubblico (creazione idempotente)
        await db.storage.createBucket(BUCKET, { public: true }).catch(() => {});

        // se e' gia' un nostro URL permanente, non riscaricare: e' gia' a posto
        const { data: pub0 } = db.storage.from(BUCKET).getPublicUrl(path);
        if (srcUrl.startsWith(pub0.publicUrl.split('?')[0].replace('/' + path, ''))) {
          return Response.json({ ok: true, url: pub0.publicUrl, already: true });
        }

        const res = await fetch(srcUrl);
        if (!res.ok) throw new Error(`download fallito: HTTP ${res.status}`);
        const ct = String(body.content_type ?? res.headers.get('content-type') ?? 'application/octet-stream');
        const buf = new Uint8Array(await res.arrayBuffer());
        if (buf.byteLength === 0) throw new Error('asset vuoto');

        const { error: upErr } = await db.storage
          .from(BUCKET)
          .upload(path, buf, { contentType: ct, upsert: true });
        if (upErr) throw upErr;

        const { data: pub } = db.storage.from(BUCKET).getPublicUrl(path);
        return Response.json({ ok: true, url: pub.publicUrl, bytes: buf.byteLength });
      }

      default:
        return Response.json({ ok: false, error: `op sconosciuta: ${op}` }, { status: 400 });
    }
  } catch (e) {
    const msg = e instanceof Error ? e.message : 'errore';
    return Response.json({ ok: false, error: msg }, { status: 500 });
  }
}
