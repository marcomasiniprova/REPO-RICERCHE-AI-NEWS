# 16 — RIVO Growth Mission Control (dashboard)

La web app dove Valerio vede TUTTA la parte growth di Rivolio in un colpo d'occhio, live, senza aprire le sessioni. Gli agenti fanno il lavoro sporco nelle loro sessioni e lasciano lì il disordine; alla dashboard portano solo lo stato pulito. Riguarda SOLO growth (SCOUT, IG e Email, REDDIT, CAPO), non sales/finance.

## Decisioni bloccate (28/8, popup)
- **Motore dati:** Supabase (Postgres + Realtime). Unico punto di verità.
- **Hosting:** web app sempre online su Railway, con URL fisso da aprire da telefono/pc.
- **Home:** focus SQUADRA AGENTI (li vedi lavorare live); pipeline, bozze, reddit, feed in viste secondarie.
- **Stile:** in attesa delle foto di riferimento di Valerio. Palette/logo Rivolio da rispettare.

## Principio guida (dalla ricerca sulle mission control)
Architettura standard: **gli agenti scrivono i dati → il database reagisce → Realtime distribuisce ai client.** Il DB è l'unico punto di coordinamento.
Regola d'oro: **lo stato deve rispecchiare la realtà.** La dashboard non segna "fatto" perché un agente lo dichiara, ma perché la cosa si è mossa davvero (es. il creator è passato di colonna in Airtable, la bozza è stata approvata). Mai dashboard-finzione.

## Come funziona (flusso)
1. Ogni routine RIVO gira nella sua sessione (SCOUT, IG e Email, REDDIT), fa il suo lavoro.
2. A inizio giro scrive su Supabase `status=working` + cosa sta facendo; a fine giro `status=idle` + riepilogo + output.
3. Ogni evento utile va nel `activity_feed` ("SCOUT ha trovato 4 creator", "IG ha preparato 2 bozze").
4. La pipeline creator e le bozze si sincronizzano da Airtable (fonte operativa) verso Supabase per la vista Kanban.
5. Il CAPO aggrega i KPI.
6. La dashboard su Railway legge Supabase in Realtime e si aggiorna da sola, senza ricaricare.

## Modello dati Supabase (bozza)
- **agents**: id, nome (SCOUT | IG e Email | REDDIT | CAPO), emoji, stato (idle|working|error), task_corrente, ultimo_giro_at, prossimo_giro_at, output_oggi (int), aggiornato_at.
- **agent_runs**: id, agent, inizio_at, fine_at, esito (ok|error), riepilogo, n_item, dettagli(jsonb).
- **activity_feed**: id, ts, agent, tipo, messaggio, ref(jsonb).
- **creators** (mirror per Kanban): id, nome, ig, tiktok, follower, stage (Nuovo | Contattato | Risposto | Call fissata | Attivo), fonte, nota, aggiornato_at.
- **drafts**: id, creator, canale (email|dm), oggetto, corpo, stato (bozza | approvata | inviata), creata_da (agent), creata_at. È la coda "da approvare" (regola 1: niente parte senza OK di Valerio).
- **kpis** (vista/materializzata): contattati, interessati, call_fissate, attivi.

## Sezioni della dashboard
- **Squadra agenti (HOME):** i 4 agenti come roster di squadra. Per ognuno: stato live (verde = sta lavorando), cosa sta facendo ora, ultimo giro, prossimo giro, quanto ha prodotto oggi.
- **Pipeline creator (Kanban):** card dei creator che si spostano tra le colonne Nuovo → Contattato → Risposto → Call fissata → Attivo.
- **Bozze da approvare:** email/DM preparati dagli agenti, in attesa del tuo OK prima di partire.
- **Attività Reddit:** commenti di valore pubblicati e in coda, karma.
- **KPI in alto:** contattati, interessati, call fissate, creator attivi.
- **Feed attività live:** il flusso in diretta di cosa fanno gli agenti.

## Milestone di costruzione
- **M1 — Fondamenta:** progetto Supabase + schema + seed dei 4 agenti. Dashboard su Railway che mostra il roster squadra agenti leggendo Supabase (prima anche solo in polling). Stile applicato dalle foto di Valerio.
- **M2 — Gli agenti scrivono:** ogni routine aggiorna il suo stato + il feed a inizio/fine giro. Si parte dal CAPO che scrive gli aggregati, poi i singoli.
- **M3 — Pipeline e bozze:** sync creator da Airtable → Kanban; pannello bozze da approvare; sottoscrizioni Realtime (aggiornamento dal vivo).
- **M4 — Rifinitura:** KPI, presenza live ("sta lavorando ora"), polish grafico.

## Regole del progetto che restano valide
- Regola 1: le bozze in dashboard sono SOLO da approvare; niente parte senza l'OK esplicito di Valerio.
- Regola 3: questo documento si aggiorna a ogni avanzamento.
- Regola 8: chiavi Supabase/Railway solo in variabili d'ambiente e credenziali, MAI nel repo.

## Stato
- 28/8 mattina: decise le fondamenta (Supabase realtime, Railway, home su squadra agenti). Puliti i 3 residui di routine spenti.
- 28/8 pomeriggio: **IN PRODUZIONE.** URL: https://mission-control-production-b349.up.railway.app (URL segreto, senza password come scelto da Valerio). Supabase: org "Rivolio" (account nuovo), progetto rivo-mission-control (eu-central-1), schema + seed dati veri applicati (58 creator, 4 agenti, 8 reddit), realtime attivo su tutte le tabelle. Railway: progetto rivo-mission-control nel workspace Artec AI, deploy dal branch, healthcheck su /api/health, variabili impostate senza mai passare le chiavi in chiaro. Collaudo tecnico E2E superato (run_start/feed/run_finish del CAPO, 401 senza chiave, transizioni di stato verificate a schermo). Routine aggiornate col protocollo (ricreate: IG trig_01GRw87WgTZXvG6VMUpW82KG, SCOUT trig_01RBTevzcM8gSWjiJEw9xDFR, REDDIT trig_019RtXyZJwFAE19EtaNSwx9a) + creata RIVO - CAPO (trig_014MfPQncuzZ6udpSnXvMvGY, report 8:00/20:00). Giro vero di collaudo IG lanciato. Da monitorare nei primi giorni: che ogni giro aggiorni la dashboard (doppio binario con Airtable per 3-4 giorni, poi stacco).
