# 17 — Mission Control: protocollo agenti e runbook

Come gli agenti RIVO aggiornano la dashboard, e come si mette in produzione. Il codice sta in `mission-control/` (Next 16 + Tailwind 4 + Supabase realtime). Regola d'oro: lo stato riflette la realtà, mai il contrario.

## Architettura
- **Supabase** = fonte di verità della dashboard (tabelle: agents, agent_runs, activity_feed, creators, drafts, reddit_items, kv). Schema in `mission-control/supabase/migrations/0001_init.sql`, dati iniziali veri in `supabase/seed.sql` (generato da `scripts/build-seed.py`).
- **Web app** su Railway, sempre online. Legge con la anon key + Realtime (aggiornamento live senza ricaricare). Senza env configurate parte in **modalità demo** (snapshot 28/8, badge DEMO ben visibile: mai spacciare demo per live).
- **Agenti** scrivono tramite `POST /api/ingest` con header `Authorization: Bearer $INGEST_KEY`. La chiave è a basso privilegio: può solo scrivere stato dashboard.

## Il protocollo per OGNI routine (da incollare nei prompt trigger)
A inizio giro:
```
curl -s -X POST "$DASH_URL/api/ingest" -H "Authorization: Bearer $INGEST_KEY" -H "Content-Type: application/json" \
  -d '{"op":"run_start","agent":"<slug>","task":"<cosa sto per fare, una riga>"}'
```
Durante il giro (eventi salienti, 1-3 per giro, non spam):
```
-d '{"op":"feed","agent":"<slug>","kind":"success|creator|draft|reddit|error","message":"<fatto vero, una riga>"}'
```
A fine giro (SEMPRE, anche se non c'era nulla da fare):
```
-d '{"op":"run_finish","agent":"<slug>","esito":"ok|error","summary":"<riepilogo onesto>","items":<numero cose prodotte>}'
```
Aggiornamenti dati:
```
-d '{"op":"creator_upsert","name":"...","stage":"Nuovo|Contattato|Risposto|Call fissata|Attivo|Scartato", ...}'
-d '{"op":"draft_upsert","agent":"ig_email","creator":"...","channel":"email|dm","subject":"...","body":"...","status":"bozza"}'
-d '{"op":"reddit_add","date":"YYYY-MM-DD","subreddit":"r/...","title":"...","body_summary":"...","permalink_id":"...","status":"pubblicato"}'
-d '{"op":"kv_set","key":"reddit_karma","value":<numero verificato>}'
```
Slug agenti: `scout`, `ig_email`, `reddit`, `capo`.
Transizione morbida (decisa 28/8): per qualche giorno le routine aggiornano SIA Airtable SIA la dashboard; quando la dashboard è rodata, Airtable si stacca.

## Runbook messa in produzione (stato al 28/8)
1. **Supabase (BLOCCATO: serve accesso di Valerio al NUOVO account)** — appena c'è: creare progetto `rivo-mission-control`, eseguire `0001_init.sql` poi `seed.sql`, prendere URL + anon key + service role key.
2. **Railway**: creare progetto dal repo `marcomasiniprova/REPO-RICERCHE-AI-NEWS`, root directory `mission-control`, branch `claude/rivo-growth-team`. Env: `NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_ANON_KEY`, `SUPABASE_URL`, `SUPABASE_SERVICE_ROLE_KEY`, `INGEST_KEY` (generata random al deploy). Dominio railway.app generato = URL segreto della dashboard. Nota: il token del connettore Composio non risponde su `me` (probabile token workspace o project): per creare il progetto serve il workspace ID di Valerio.
3. **Trigger**: aggiornare i 3 prompt delle routine col protocollo qui sopra + `DASH_URL` + `INGEST_KEY`.
4. **Collaudo E2E**: giro di prova di una routine → verificare stato live, run in storico, feed aggiornato.

## Sicurezza (onestà, regola 12)
- URL segreto senza password (scelta di Valerio 28/8): chi ha il link vede i dati. La anon key permette SOLO lettura (RLS). Le scritture richiedono INGEST_KEY o service role, mai esposte al client.
- Se in futuro serve più protezione: si aggiunge login (Supabase Auth) senza rifare nulla.

## Stato
- 28/8: v1 costruita e collaudata visivamente in demo (screenshot approvati in sessione). Push su `claude/rivo-growth-team`. In attesa: accesso Supabase nuovo account + workspace Railway.
