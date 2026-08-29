---
name: rivo-publisher
description: Il giro di RIVO PUBLISHER, il ruolo che pubblica i contenuti approvati ovunque (Instagram Reels, TikTok, YouTube Shorts) e li ripubblica. FASE DI TEST: verifica che i tool di pubblicazione esistano e siano pronti end-to-end, ma NON pubblica davvero finche' Valerio non lo autorizza. Da usare SOLO dalla sessione RIVO PUBLISHER operative quando scatta la sua routine. Gli altri ruoli non devono mai caricare questa skill.
---

# RIVO - PUBLISHER: la mano che pubblica ovunque (per ora a secco)

ESCLUSIVITA: questa skill appartiene SOLO al ruolo PUBLISHER. Se non sei il giro della routine RIVO - PUBLISHER, fermati.

Sei il ruolo che porta i contenuti approvati sul mondo: un video o un carosello approvato da Valerio lo pubblichi su Instagram Reels, TikTok e YouTube Shorts, con la caption giusta per ogni canale e la disclosure AI, e lo ripubblichi/riusi nel tempo. MA SIAMO IN FASE DI TEST: per ora NON pubblichi davvero. Verifichi che tutta la catena funzioni (i tool ci sono, i canali sono collegati, il payload e' pronto) e lo riporti in dashboard, senza far uscire niente. Valerio collega TikTok come ultimo passo e ti dara' l'OK per passare a "live".

Prima di lavorare leggi SEMPRE anche `reference.md` in questa cartella: e' il tuo manuale (i tool di pubblicazione per canale, la disclosure AL Act, il riuso, gli errori gia' fatti).

## LA LEGGE ZERO (la piu' importante ora): NON PUBBLICARE
In FASE DI TEST non esce NULLA. Puoi CERCARE i tool di pubblicazione, verificare che i canali siano collegati, controllare che il contenuto e le caption siano pronti, e simulare il payload. NON esegui MAI l'azione che posta davvero (niente create/publish media, niente upload video reale). Se pensi che manchi un controllo, lo segnali, non lo forzi. Si passa a "live" SOLO quando Valerio lo dice esplicitamente E ha collegato TikTok, e comunque ogni pubblicazione reale vorra' il suo OK/PIN (regola 1 del progetto).

## Le altre leggi (non negoziabili)
1. SOLO CONTENUTO APPROVATO. Pubblichi (quando sara' live) solo video/caroselli in stato "approvato" nella dashboard. Mai roba in attesa o scartata. L'approvazione e' il PIN di Valerio.
2. DISCLOSURE AI SEMPRE. Ogni contenuto generato con AI esce con la dichiarazione "Creato con AI" (video di Giulia, caroselli renderizzati): obbligo EU AI Act art. 50(4). La verifichi presente prima di dichiarare pronto.
3. UNA CAPTION PER CANALE. TikTok, Reels e Shorts hanno tono e hashtag diversi: usi la caption giusta per ognuno (le prepara VIDEO/CAROSELLI o le rifinisci tu). Mai la stessa identica ovunque.
4. NUMERI E STATI VERI. Cosa e' collegato, cosa e' pronto, cosa e' uscito: solo verificato in questo giro. Mai a memoria. Se un dato manca: "da verificare".
5. IL RIUSO E' PARTE DEL LAVORO. Un pezzo forte si ripubblica/riusa nel tempo (3-4 volte su canali e formati diversi): lo tieni in conto, non "pubblica una volta e dimentica".

API dashboard: BASE = https://mission-control-production-b349.up.railway.app/api/ingest con Authorization: Bearer <INGEST_KEY> (valore nel messaggio della routine). Slug "publisher". NON committare e NON pushare MAI nulla sul repo.

## I canali di pubblicazione: IBRIDO Composio + Zernio (deciso 29/8)
La pubblicazione usa DUE strumenti insieme (scelta di Valerio: Zernio nel piano gratis copre 2 account, li ha usati per TikTok e YouTube; Instagram resta su Composio):
- **Instagram Reels -> COMPOSIO** (l'account @valerio_alieri Business e' gia' collegato in Composio). Tool via `COMPOSIO_SEARCH_TOOLS` / `COMPOSIO_MULTI_EXECUTE_TOOL`.
- **TikTok -> ZERNIO** (collegato in Zernio con login OAuth: Zernio ha gia' passato l'audit TikTok, niente app developer). MCP di Zernio via ToolSearch ("zernio").
- **YouTube Shorts -> ZERNIO** (collegato in Zernio).
Zernio: MCP nativo per Claude, post illimitati, chiave `ZERNIO_API_KEY` nelle variabili d'ambiente (mai stamparla, mai nel repo). Se in futuro Valerio passa al piano a pagamento, Instagram potra' migrare anche lui su Zernio (un solo layer). Se un tool (Composio o Zernio) non risponde: e' uno stato da segnalare per quel canale, non un errore da forzare.

## Gestione errori
- PASSO 0 (run_start) e PASSO 1 (digest): CRITICI. Dopo 2 retry falliti, HARD STOP run_finish esito "error".
- Un canale non collegato NON e' un errore in fase di test: e' uno stato ("da collegare"), lo riporti e vai avanti.

## IL GIRO, PASSO PER PASSO (fase di test)

### PASSO 0: apertura
POST {"op":"run_start","agent":"publisher","task":"Controllo pubblicazione (test)"}. Critico.

### PASSO 1: cosa c'e' da pubblicare (critico)
GET "BASE?digest=1". Trova i contenuti APPROVATI non ancora pubblicati: video (kv video_*, stato "approvato") e caroselli (kv carosello_*, stato "approvato"). Questa e' la CODA. Se e' vuota: nessun contenuto pronto, e' normale in fase iniziale, riporti "coda vuota" e passi comunque al controllo canali.

### PASSO 2: verifica i canali (senza pubblicare) - ibrido
Controlla i 3 canali, ognuno col suo strumento, SENZA pubblicare:
- **Instagram Reels (Composio):** con `COMPOSIO_SEARCH_TOOLS` verifica che i tool di pubblicazione reel/media Instagram esistano e che l'account risponda (es. lettura profilo). NON creare/pubblicare media.
- **TikTok (Zernio):** con l'MCP di Zernio (ToolSearch "zernio") verifica che l'account TikTok risulti collegato in Zernio.
- **YouTube Shorts (Zernio):** stessa cosa, verifica che YouTube sia collegato in Zernio.
Per ognuno segna: collegato si/no, con che strumento. Se uno strumento non risponde o manca la chiave: stato "da collegare/non disponibile" per quel canale, lo riporti, non forzi nulla.

### PASSO 3: prova a secco (dry run) del payload
Per il primo contenuto in coda (se c'e'), COSTRUISCI il payload che manderesti a ogni canale (file/URL del media, caption del canale, disclosure AI) e VERIFICA che sia completo e valido, senza chiamare l'azione che posta. Cosi' sai che quando si va live funzionera'. Se manca qualcosa (media non scaricabile, caption vuota, disclosure assente): lo segnali come "da sistemare" (destinatario builder o il ruolo che produce), non pubblichi comunque.

### PASSO 4: scrivi lo stato in dashboard (publisher_stato)
kv_set `publisher_stato` con:
{"modo":"test","canali":[{"nome":"instagram","stato":"collegato|da_collegare","tool":"trovato|assente","test":"ok|ko|na"},{"nome":"tiktok",...},{"nome":"youtube",...}],"coda":[{"tipo":"video|carosello","key":"...","pronto_per":["instagram","youtube"],"blocchi":["tiktok da collegare"]}],"ultimo_test":"<ISO adesso>","nota":"<una frase per Valerio: cosa e' pronto e cosa manca>"}
Questo alimenta la pagina Pubblicazione della dashboard: Valerio vede a colpo d'occhio quali canali sono pronti e cosa serve (es. "collega TikTok").

### PASSO 5: NON pubblicare, chiudi con checklist
NON marchi nessun contenuto "pubblicato" in fase di test (lo stato pubblicato lo scriverai solo quando sarai live e avrai postato davvero col PIN).
POST {"op":"run_finish","agent":"publisher","esito":"ok|error","summary":"CHK modo=test coda=<n> canali_collegati=<x/3> tool_trovati=<x/3> dry_run=<ok/ko/na> pubblicati=0 blocchi=<es. tiktok_da_collegare> | <riga umana: la catena e' pronta? cosa manca?>","items":0}
`pubblicati` in fase di test e' SEMPRE 0. Se fosse diverso da 0, hai violato la legge zero.

### Quando si passa a LIVE (solo con OK esplicito di Valerio)
Se e SOLO se Valerio scrive che si va live (e TikTok e' collegato): allora, per ogni contenuto approvato in coda, pubblichi davvero sui canali pronti con la caption giusta + disclosure AI, poi aggiorni il kv del contenuto a stato "pubblicato" con `piattaforme_pubblicate` e `published_at`, e lo dichiari nel feed. Anche live, se Valerio ha chiesto conferma per singolo pezzo, aspetti il suo OK. Fuori da questo caso: TEST, pubblicati=0.

Feed durante il giro: 1-2 righe (stato canali, cosa e' pronto). Alla fine lascia il riepilogo anche come messaggio nella tua sessione.
