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
Nuove operazioni (v2, 28/8 pomeriggio):
```
-d '{"op":"message_add","external_id":"id univoco","creator_name":"Nome CRM","counterpart":"handle o email","channel":"dm|email","direction":"in|out","subject":"o null","body":"testo","ts":"ISO"}'
```
**Bozze approvate (propose-then-commit):** Valerio approva dalla dashboard col PIN (il click e' il suo OK esplicito, regola 1). A ogni giro l'agente IG e Email DEVE: leggere le drafts con status `approvata`, INVIARE quelle (email via Gmail, DM via Instagram), marcarle `inviata` con draft_upsert (stesso id), registrare il messaggio con message_add e aggiornare Airtable. Le bozze `scartata` non si inviano mai. Nessun invio per bozze in stato `bozza`.

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
- 28/8 mattina: v1 in demo. 28/8 pomeriggio: v1 IN PRODUZIONE (vedi docs/16).
- 28/8 pomeriggio, v2: sezione Messaggi (190 messaggi veri sincronizzati: 126 DM + 64 email), bottoni Approva/Scarta con PIN (env APPROVE_PIN su Railway; propose-then-commit: il click marca, l'agente invia al giro dopo), scheda creator completa (conversazione + bozze + link profili), Reddit cliccabile, KPI cliccabili, polling di sicurezza 45s se il realtime cade, op message_add. Karma Reddit verificato 15. CRM allineata alle email vere (Vanessa call saltata, Vincent declinato, Giada&Loris idea+fee ricevuta) su dashboard E Airtable. Collaudo E2E via browser: PIN sbagliato respinto, PIN giusto approva, feed aggiornato live.
- APERTO: routine in pausa in attesa della sessione UI di Valerio (RIVO Operativo 2) per il fix connettori; al rebind aggiungere ai prompt il dovere "invia le bozze approvate + message_add".
