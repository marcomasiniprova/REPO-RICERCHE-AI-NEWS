# 07 — Log decisioni (cronologico)

Ogni decisione importante va aggiunta qui, con data e motivazione. Dal più recente in cima.

---

### 27 Ago 2026 — Giro di prova SCOUT upgrade + bug IG sistemato
- Giro completo dal vivo (mix hashtag 50/50 travel + voli/rimborso, deciso da Valerio). Discovery: 29 nuovi in ~76s. Ho pubblicato la versione webhook della discovery e l'enricher TikTok (le modifiche erano in bozza non pubblicata).
- Enricher TikTok GPT-5.6 Terra: PERFETTO. 6 nuovi Pronto (creator italiani veri: italia.io.ti.amo, focus_21052, italyyoudontexpect, alessandra_worldtrip, jepexperiences, lorecostantini_). Scarti intelligenti: "voyager sans avion" (pubblico che non vola), "I plan trips" (agenzia), pagina territoriale, stranieri.
- BUG IG trovato: lo scraper profilo Apify tornava VUOTO per 7/8 lead -> il GPT (bio vuota) li segnava Scartato, bruciandoli. FIX (deciso "entrambe" con Valerio): scrape maxTries 3 + se vuoto il lead resta "Da arricchire" per il giro dopo (non bruciato). I 7 gia' bruciati restano Scartato (scelta di Valerio). Da fare: valutare un actor IG piu' affidabile.
- Pipeline dopo il test: 31 Pronto totali.

### 27 Ago 2026 — Routine spostate in sessione dedicata (fix interruzioni)
- Deciso con Valerio: le routine operative NON firano piu' nella chat di lavoro. Creata sessione dedicata **"RIVO Operativo"** (session_012cNuxi6s8j91iGYP6HDtsP) dove girano in background.
- Ricreate le 3 routine legate alla sessione dedicata: RIVO-REDDIT (trig_01C3yaqK89eNdfZuwPv7DCvi), RIVO-IG (trig_014RYEePhSJpAcYcdnSKQkYH), RIVO-SCOUT (trig_01BKtmgDmmzR42FpHhxJxnM5).
- Le 3 vecchie (bound alla chat di lavoro) sono state MESSE IN PAUSA come rete di sicurezza, NON cancellate: si cancellano dopo aver confermato che la sessione dedicata raggiunge gli strumenti (Composio/n8n).
- CAVEAT: la creazione via tool da' un warning "no MCP connectors" sulle routine. La sessione dedicata e' nello stesso environment (env_013a...) quindi molto probabilmente ha gli strumenti, ma va CONFERMATO al primo giro reale o aprendo la sessione "RIVO Operativo". Se non li raggiunge, ricreare le routine dalla UI Routines di claude.ai (garantisce i connettori). Fatto un fire-test della Reddit per verifica.
- Restano notturne e separate: DAYLY AI NEWS (non RIVO).

### 27 Ago 2026 — Pausa routine orarie (troppe interruzioni in sessione)
- Problema segnalato da Valerio: le routine RIVO-REDDIT e RIVO-IG (orarie, 6-18) firano dentro la STESSA sessione di lavoro e la interrompono di continuo mentre lavoriamo; in piu' l'ambiente si sospende/riprende quando resta inattivo. Sessione caotica.
- FATTO: messe in PAUSA (enabled=false) RIVO-REDDIT (trig_01AbMFnSeUHPMvEKrj7Jo5PL) e RIVO-IG (trig_01STyv92UL1vQ5gxcvrktcLd). Restano attive solo le notturne: RIVO-SCOUT (04:00) e DAYLY AI NEWS (03:45), che non disturbano di giorno.
- Da decidere con Valerio come rifarle ripartire in modo pulito (es. farle firare in una sessione separata dedicata, non in quella di lavoro) quando si va in operativo.
- Reddit: 2 altri commenti valore pubblicati con OK esplicito ("si pubblica"): Malpensa EES (p69fwof) e compagnie telefoniche (p69fyr9). 4/15 oggi.

### 27 Ago 2026 — RIVO-IG: primo contatto ai Pronto + regola "approvo"
- Valerio ha chiarito una regola importante: "approvo/bellissimi/mi piace" = OK sullo STILE, NON un ordine di invio. Si manda/pubblica SOLO con un esplicito "manda"/"pubblica ora". Aggiunta a docs/06 e al prompt di RIVO-IG. (Nota: i 2 commenti Reddit erano gia' stati pubblicati su "VAI CON ENTRAMBE"; Valerio ha confermato di lasciarli su.)
- Fase: oggi si costruisce, domani si lancia. Nessun invio a creator oggi.
- Rinforzato il ruolo RIVO-IG: oltre a rispondere ai DM/email, ora prepara ogni giorno le BOZZE del PRIMO contatto (solo via EMAIL, il DM IG a freddo non e' permesso) per i creator Pronto dello SCOUT che hanno un'email e non sono gia' in CRM. Solo bozze, mai invio senza OK esplicito.
- Modello email primo contatto approvato da Valerio ("bellissimi") e salvato in docs/06 sezione 4. 3 bozze di esempio preparate (Martina, The Traveling Brain, Pamela).
- Dedup fatto: dei Pronto, 5 hanno email e non sono mai stati contattati (laviaggiatricesolitaria, giroilmondoingiro, martinagrimanditravel, the_travelingbrain, travelwithseraluna). aalessiadefazio esclusa (gia' in CRM).

### 27 Ago 2026 — Switch actor IG (flakiness risolta) + fix Follower null
- Verificato il fix "non-brucia": reggeva, ma lo scraper `logical_scrapers` restava ballerino (4-7 vuoti su 8). Trovato mio bug: Follower a stringa vuota rompeva il campo numerico Airtable -> sistemato con `null`.
- Ricerca actor fatta -> switch all'ufficiale **`apify/instagram-profile-scraper`** (proxy RESIDENTIAL), causa-radice della flakiness (login-wall IP datacenter). Aggiunto nodo "Normalizza profilo" per mappare i campi al formato downstream, cosi' il resto del workflow resta intatto.
- Collaudo: **8/8 profili letti** (prima 1/8), zero vuoti, zero errori. Task "valutare actor IG alternativo" chiuso (switchato). SCOUT ora completo e affidabile.

### 27 Ago 2026 — SCOUT upgrade: cervello GPT-5.6 Terra + ICP allargato + ruolo "padre"
- Valerio vuole una macchina "di cui mi fido a occhi chiusi". Tre cambi grossi su SCOUT, tutti fatti e collaudati:
- **Cervello da Mistral a ChatGPT GPT-5.6 Terra (reasoning alto)**, sia classificazione sia vision, in ENTRAMBI gli enricher. IG (`Py4pqJYPO86TJFz9`): classificatore su lmChatOpenAi `gpt-5.6-terra` + vision OpenAI via HTTP (image_url:{url:dataURI}, json_object, reasoning_effort high). TikTok (`65R7BVwsokVyTk3I`): nodo GPT classify OpenAI `gpt-5.6-terra` reasoning high + regole. La bio viene attenzionata a fondo ogni volta.
- **ICP allargato + anti-falsi-positivi**: la macchina distingue il VERO travel creator (video, intrattiene, sponsor, pubblico che VOLA) da fotografo-hobbista, terra-only ed enti/tourism board (tutti Scartati). Niche allargate: travel creator + travel tips/hacks + risparmiatori/budget + diritti del consumatore/passeggeri (non solo travel puro). Test: il nuovo IG enricher ha beccato un finto travel creator (fotografo, 3 video/2246 foto) -> Scartato. TikTok: davidemarranon Pronto 90, gogotravelfood Pronto 80.
- **Volume "scandaglia largo, tieni i perfetti"**: discovery default ttLimit 8/igLimit 8, 3-5 hashtag/giorno; meglio 10-20 PERFETTI che 50 mediocri.
- **SCOUT come "padre" del workflow**: il ruolo fa partire ogni motore, RESTA fino alla fine (polling get_execution), e se si blocca/errore lo fa RIPARTIRE (max 2 retry, attesa crescente). Retry/rate-limit gestiti sia a livello nodo (retryOnFail) sia a livello run (rilancio). Riscritto il prompt della routine RIVO-SCOUT (trig_01JSkZ3mAiZFvStU9rqUKTTL) di conseguenza.
- Aggiornati docs/14-scout.md (sezione UPGRADE) e questo log.

### 26 Ago 2026 — Rename ramo + via al Growth RIVO Team (Capo per primo)
- Il ramo di lavoro si chiamava `claude/svuotare-repository` (nome auto sbagliato, NON un ordine di svuotare). Verificato con Valerio: non si cancella niente. Creato ramo pulito `claude/rivo-growth-team` (stato identico), il vecchio resta su origin per ora.
- Strategia canali confermata: **IG recluta, TikTok pubblica forte**. SCOUT cerca su entrambe. Niente primo contatto via TikTok DM (non standard).
- Roster confermato: **Capo + 10 ruoli** (SCOUT, IG/Email, Reddit, Quora, Gruppi FB, SEO, GEO/AI, Video Giulia, Social Brand, Radar). A regime lavorano tutti ogni giorno, il Capo coordina.
- Metodo di costruzione (voluto da Valerio): si costruisce un ruolo alla volta, si dice cosa collegare, si collega, si collauda "alla perfezione", poi il ruolo dopo. Ordine: prima il Capo, poi SCOUT, poi gli altri (i ruoli che aspettano tool esterni per ultimi).
- Report del Capo deciso: **mattina ~9:00 / sera ~18:00** (orari da confermare quando si accende la routine).
- Costruito docs/13-capo.md (playbook del Capo).
- 27/8: SCOUT messo nel concreto come "motore n8n + ruolo manager" (deciso con Valerio). Il motore `Rivolio - SCOUT (IG+TikTok)` (id ESLNWiVxmXb11Xdu) convertito da schedule a **WEBHOOK** con nodo Config (keyword dal payload o default), liste Byparr ON. Collaudato via webhook: passate hashtags nel body, Config le usa, 14 nuovi creati (6 TikTok nano + 8 IG). Il motore NON gira piu' da solo: lo comanda il ruolo. Creata routine **RIVO - SCOUT** (trig_01JSkZ3mAiZFvStU9rqUKTTL, ~06:00) che ogni mattina ruota gli hashtag, fira il motore via execute_workflow, controlla l'output, tara (target 10-20/gg) e fa report. Il ruolo NON contatta nessuno. Puliti tutti i record di test (auto-run 6am + demo, 71+14). Principio generale del team: meccanico/volume -> n8n, giudizio/report -> ruolo agente.
- Costruito docs/14-scout.md (RIVO-SCOUT). SCOUT ora COSTRUITO, COLLAUDATO e ACCESO: workflow unico `Rivolio - SCOUT (IG+TikTok)` (Apify clockworks hashtag TikTok + IG hashtag + liste Byparr -> dedup -> filtro nano 1k-50k -> Airtable "Da arricchire"), schedule 06:00. Spento Harvest+Cacciatore. Soglia Arricchisci portata a 1k-50k. Test dei 3 actor: la ricerca per nome-utente trova squatter/agenzie, la ricerca per HASHTAG trova creator veri (clockworks vince per TikTok). Cancellati i 71 lead di collaudo. Da tarare: volume/hashtag dopo il 1° giro dell'Arricchisci. Deciso: motori TUTTI insieme (Apify + n8n/Byparr + Exa AI + Firecrawl); ICP nano/micro travel IT 1k-50k; volume 10-20/giorno; enrichment email sì. SCOUT trova e arricchisce, NON contatta (lo fa RIVO-IG con OK). BLOCCATO in attesa API key in env (Apify, Exa, Firecrawl) per collaudare dallo Step 1 (Apify). Prossimo ruolo dopo SCOUT collaudato: da decidere con Valerio.

### 24 Ago 2026 (notte) — Contratto PDF brandizzato + bonus family
- Contratto rifatto in PDF brandizzato Rivolio (colori teal-green dal logo, 1 pagina). Rimossi i .md contratto. Versione compilabile a schermo + link web (artifact).
- Bonus differenziati: SINGOLE €20@10 + €50/25 (invariati). FAMILY €50 ogni 10 (scala unica). Verificato: family tieni ~€9,70/pratica, dopo bonus ~€4,70/pratica. Mai sommare due scale family (es. +€175/25 andava in negativo a 25).
- Corretto un errore di percezione di Valerio: su 10 family "€299" non sono tutti suoi, IVA+Stripe si prendono ~€65, netto reale ~€47 dopo bonus.

### 24 Ago 2026 (notte) — Primi 2 no + rotta confermata + contratto
- Michela (email): lavora solo a fee fissa, no al performance. Inviata chiusura gentile (schedulata 8:00). Prevista dalla ricerca.
- Flaminia (DM): "non sono interessata", no educato senza motivo. Segnata Scartato.
- Valerio ha avuto il timore "nessuno accetta il performance". Perspective: 2 no su 18 risposte, ed erano profili da fisso. Gli 8 veri interessati (gpintrip, Stefi, Yass, Simone, Sarah, Sari, viaggio.ideale, Cristian) non hanno ancora sentito il modello. Il vero KPI e la conversione cliente, non il tasso di firma creator.
- DECISIONE: si tiene il PERFORMANCE PURO, si decide sui dati veri. Gli 8 caldi si muovono domani con calma.
- RIVO esteso: gestisce anche le call (raccoglie disponibilita, propone slot da confermare). Scope DM + email. Report mattutino in chat.
- Creata bozza contratto: docs/09-contratto.md.

### 26 Ago 2026 — Fix RIVO (email lette) + rename + prime call
- ERRORE mio: RIVO controllava le email con filtro `is:unread`, quindi saltava quelle gia' aperte da Valerio sul telefono. Cosi' ho mancato il NO di Giusi (declina per coerenza: fa contenuti paesaggi/mare, non voli). CORRETTO: d'ora in poi controlla email LETTE + non lette, confrontando con Airtable. Verificato: Giusi era l'unica mancata, tutto il resto gestito.
- Rinominata routine "RIVO - IG DM" -> "RIVO - IG e Email" (gestisce entrambi).
- Prime 2 call FISSATE per ven 28/8: Vanessa 9:00 (Meet), Stefi 16:30. Filippo (WhatsApp), Julian (nuovo orario) da fissare.
- Prezzi creator (ricerca): un reel per 150-280k costa €1.000-3.000 di mercato. Il nostro fisso resta simbolico (€80-150 max): i "fisso o niente" (Filippo, Giusi, Giada, travelin.yellow) probabilmente passano, ok. Focus sui performance-believer.

### 25 Ago 2026 (notte) — Collaudo dei due RIVO + tuning
- Verificati live entrambi gli agenti: RIVO - IG DM e RIVO - REDDIT attivi e schedulati, tool testati (IG legge/invia, Gmail, Airtable, Reddit legge).
- CAMBIO: RIVO - IG DM da ogni 3h a OGNI ORA (8:15-20:15), per rispondere ai caldi dentro la finestra 24h (ricerca: rispondere veloce alza molto la qualifica).
- Decisioni di tuning: NIENTE follow-up automatico su IG (Valerio: solo reagisce, gli inseguimenti li decide lui). Report SEPARATI per canale (non unico). Voce Reddit: stile naturale che si affina con le correzioni di Valerio (salvate in docs/10).
- Nota: esiste un terzo trigger vecchio e separato "DAYLY AI NEWS" (news AI, 3:45), non legato a Rivolio. Lasciato dov'e'.
- Punto fragile noto: i trigger fired si appoggiano ai connettori della sessione; se Composio e' giu' al momento dello scatto, la sessione ricarica i tool e riprova.

### 25 Ago 2026 (notte) — Stefi molto calda + nasce RIVO - REDDIT
- STEFI (trolleygirl_): DM letto. Con volare rimborsati NON ha dashboard e lei e' senza P.IVA (bonifici/PayPal). Punti nostri: dashboard in tempo reale + bonifico 15gg senza P.IVA. Risposta approvata, invio agganciato al trigger delle 8:00 del 26/8 (insieme alle 4 email).
- ROUTINE chiarite: RIVO - IG DM (rinominata) e' fissa e ricorrente; i due trigger di invio (8:00 e 9:30) sono one-shot, si autodisattivano dopo il primo scatto. Stesso meccanismo gia' usato per le 2 email del 25/8 alle 8:00.
- NASCE RIVO - REDDIT: playbook completo in docs/10-rivo-reddit.md. Account verificato: u/Valerio_alieri, karma 4, creato luglio 2026 (giovanissimo, serve fase karma). Piano in 4 fasi (preparazione, karma, autorita' EU261, semina soft), 3-5 interazioni/di all'inizio, regola 9:1, zero Rivolio per 4-6 settimane, subreddit Italia + internazionali.
- APPROVAZIONI Reddit concordate: in addestramento tutto passa da Valerio; dopo promozione esplicita, autonomia SOLO su commenti senza link/menzioni; post e menzioni Rivolio sempre con OK (eccezione concordata alla regola 1, attiva solo post-promozione).
- Framework marketing 4 caselle (Decidi/Attira/Converti/Tieniteli) validato: fonti corrette e serie. Divisione: caselle 1-2 (canali, outreach, Reddit, CRM) = questa sessione; casella 3 on-site (landing, conversione, tracking creator/Stripe) e casella 4 automazioni post-acquisto (recupero, recensioni, referral) = sessione webapp.

### 25 Ago 2026 (sera tardi) — Tutto schedulato + decisioni caldi
- SCHEDULATO: 4 email (Filippo, Alessia, Julian h16:00, Albi&Fede slot mer26/gio27) domani 26/8 ore 8:00. 8 follow-up (Vincent, Giusi, Leonardo, Nicolo, Aurora, Matteo, Marina, Vanessa) domani ore 9:30. Bozze gia' in Gmail, trigger one-shot che le invia.
- Cristian: aveva frainteso (pensava di gestire lui le pratiche), Valerio ha chiarito via DM + link sito. In attesa sua risposta.
- gpintrip: il DM per chiedere la loro email lo manda Valerio domani mattina (RIVO glielo ricorda).
- DECISIONE Filippo: per lui (171k) si valuta un fisso un filo piu' alto del mini-ibrido standard, caso per caso, alla call. Mai numeri prima della call.
- DECISIONE Giada & Loris (169k): brief inviato, silenzio. Aspettare 2-3 giorni, nudge il 28/8.
- Obiettivo settembre confermato: 5-10 creator ATTIVI + funnel provato.
- Stato verificato live: 55 contatti (42 DM, 13 email), 19 risposte reali. Instagram tutto gestito. Solo bot/no/parcheggiati senza nostra risposta.

### 25 Ago 2026 (sera) — RIVO chiude sempre con riepilogo verificato
- Aggiunto punto 8 al trigger di RIVO: ALLA FINE DI OGNI GIRO deve fare a Valerio un riepilogo generale conciso e verissimo, dopo aver VERIFICATO tutto cima a fondo (IG + Gmail + conteggio LIVE Airtable). Mai numeri a memoria, mai inventati (anche un dato in meno = disastro). Se un dato non e' verificato, dirlo.
- Ibrido: nei messaggi a Filippo e Alessia si spiega che il fisso sara' contenuto (realta' giovane, generosi sulla performance), niente cifre esorbitanti; numeri esatti in call. Ad Alessia (molto gentile) tono piu' caldo + piccolo spoiler VERO (40% quasi il triplo del settore, family raddoppia, bonus a scaglioni).
- Le 3 email (Filippo ibrido, Alessia ibrido, Julian call mer 26/8 h16:00) da SCHEDULARE domani alle 8:00, solo dopo OK di Valerio sulle bozze.

### 25 Ago 2026 — Numeri verificati + annina automazione + 2 DM inviati
- NUMERI VERI (contati live su Airtable, non a memoria): 55 record totali. Canale: 42 DM, 13 Email. Stato: Risposto 19 reali + Contattato 33 + Visualizzato 1 + Scartato 2. La cifra "56/16 interessati" era la snapshot vecchia del README (24/8); "54" era un mio conteggio a memoria sbagliato. Fonte di verità unica per i numeri = conteggio live Airtable.
- @annina_travel = AUTOMAZIONE, non un lead. Due volte lo stesso identico messaggio di benvenuto, subito dopo i nostri. Segnata Scartato. Aggiunta a docs/08 la regola per riconoscere le automazioni (RIVO deve applicarla).
- INVIATI 2 DM (con OK di Valerio) ai due lead veri con finestra aperta: @travelin.yellow e @2romanintrip. Testi qualificanti (performance, no fisso). annina esclusa.
- Restano 8 lead DM caldi con finestra chiusa (Valerio invia dal telefono): Stefi, Simone, gpintrip, Cristian, viaggio.ideale, Sari, Sarah, yass. + 2 big email ibrido (Filippo, Alessia De Fazio) in hold.

### 25 Ago 2026 — Audit completo chat IG + DM che qualificano
- Fatto audit completo con Composio: 250 conversazioni totali, 36 recenti (>=20/8). Confermato che ci stiamo allargando: 2 risponditori NUOVI il 25/8.
- NUOVI: @travelin.yellow ("ci daresti qualche info in piu?"), @2romanintrip ("spiegaci meglio di cosa si tratta"). Finestre 24h aperte.
- @lorenzopabloo (vocale): interessato, ora in viaggio (California, Brasile, Canada), vuole sentirsi il PROSSIMO MESE. Ricontattare a inizio settembre, non spingere ora.
- @flaminiamontani: NON riaperta. Verificato sul thread reale: l'ultimo messaggio (25/8) sui prezzi era in USCITA dal nostro account, non suo. Lei resta al no del 24/8. Corretto un mio errore di lettura dell'audit (avevo scambiato un messaggio nostro per uno suo).
- DECISIONE copy: i DM vanno riscritti per QUALIFICARE. Devono dire chiaro che e' una collaborazione a PERFORMANCE (percentuale sui risultati + bonus, generosa, cresce nel tempo), NON un cachet fisso. Cosi chi vuole solo il fisso si filtra da solo. I numeri precisi restano per la call (rule 6). Aggiornato Airtable per i 4 record cambiati.

### 25 Ago 2026 — Mini-ibrido per i big + risposte in coda
- 3 creator grossi (Michela, Filippo 171k, Alessia De Fazio) hanno chiesto un fisso oltre al performance. Conferma il pattern della ricerca (mid/big vogliono cachet).
- DECISIONE: si apre un MINI-IBRIDO. Fisso €80 una tantum, pagato alla pubblicazione del primo contenuto, caso per caso (pensato per i 100k+). + 40% + bonus. Micro/nano restano performance puro.
- Le 2 email schedulate sono partite alle 8:00 (Alessia proposta, Michela chiusura). RIVO ha collaudato i giri (8:15 report, poi ogni 3h). Anna gestita da Valerio (rimandato il messaggio iniziale).
- Risposte a Filippo e Alessia con formula ibrida preparate, in attesa di OK per l'invio.

### 24 Ago 2026 (notte) — RIVO potenziato + contratto legale
- Contratto rifatto in stile LEGALE: font serif (Liberation Serif / Times), articoli numerati, testo giustificato, 2 pagine ariose. Versione PDF + compilabile + link web (artifact), stesso URL.
- Tolti dal contratto: il riuso dei contenuti da parte di Rivolio (Art. 8 ora solo "Uso del marchio", i contenuti restano del creator) e la ritenuta d'acconto 20% (Valerio senza P.IVA; Art. 5 ora neutro, adempimenti secondo normativa e posizione del Partner).
- docs/08 riscritto come PLAYBOOK del DM perfetto: ragiona prima (Passo 0), paragrafi corti con righe vuote, lunghezza giusta, mai muro di testo, mai AI-slop, gestione obiezioni, checklist finale, esempio brutto vs giusto.
- RIVO aggiornato (trigger): e il CLONE di Valerio, segue il playbook, riconosce le obiezioni, tiene MEMORIA per creator in Airtable (campo Note/Esito), report mattutino RICCO con priorita e finestre 24h in scadenza.
- 24/7: per ora resta ogni 3h. Il vero 24/7 real-time richiede webhook Meta Instagram -> n8n (n8n gira sempre); Composio nativo non ha trigger "nuovo DM" (solo via terzo "Heyy"). Da valutare piu avanti.

### 24 Ago 2026 (notte) — Instagram: capacita reali + macchina monitoraggio DM
- Verificato il connettore Instagram (Composio, @valerio_alieri, Business). PUO: leggere tutti i DM (sempre), inviare risposte SOLO entro 24h dall'ultimo messaggio della persona, leggere profilo/post/insight. NON PUO: primo DM a freddo, cercare profili altrui, DM di massa.
- Inviato via connettore il DM riscritto a Flaminia Montani (unica finestra 24h aperta). Le altre finestre erano chiuse (creator scrivevano 2-4 giorni fa), quindi il backlog lo manda Valerio dal telefono.
- Costruita la "macchina monitoraggio DM" (Opzione A): cron di sessione ogni 3h circa (8:07, 11:07, 14:07, 17:07, 20:07) che mi risveglia, legge i DM nuovi, prepara bozze personalizzate, aggiorna Airtable, e aspetta l'OK di Valerio prima di inviare. Finestra in scadenza: la lascio chiudere e segnalo, mai inviare senza OK.
- LIMITE: il cron e session-only (muore se la sessione/contenitore va in stand-by, scade a 7 giorni). Da convertire in Routine durevole quando il tool sara raggiungibile.

### 24 Ago 2026 (sera) — Regole operative + errore email
- ERRORE mio: inviate 5 email di risposta ai creator senza l'OK esplicito di Valerio. Non recuperabili (una volta partite restano ai destinatari). Da ora vale la regola 1: mai inviare nulla senza approvazione.
- Creato `CLAUDE.md` con 12 regole ferree + guida ai tool. Creato `docs/08-copywriting.md` (guida copy anti-AI).
- Michela (micmalditravel): contro-risposta, lavora solo a fee fissa per contenuto, NON a performance. Probabile pass, o mini-ibrido se si vuole.
- Connettore Instagram (Composio, @valerio_alieri, Business): legge i DM e risponde entro 24h. Non fa primo DM a freddo, non cerca profili altrui liberamente. Utile per leggere le risposte senza screenshot.
- Slot call: Lun-Ven 8:00-19:00, sempre con conferma di Valerio prima di proporli.
- Copy: mai trattino lungo, sempre ultra-umano e personalizzato. Offerta mai ridotta a "40%/6€": si presenta come collaborazione generosa, con bonus, che cresce nel tempo.

### 24 Ago 2026 — Modello economico bloccato (verificato sui margini reali)
- 40% al creator **sul lordo** che paga il cliente. Motivo: più semplice da comunicare, scelta di Valerio.
- **Check:** bonus €50/100, **niente % sul singolo check**. Motivo: 40%+bonus insieme andava in negativo (Stripe €0,25 fisso pesa il 17,6% su €1,99).
- **Milestone pratiche:** €20 a 10 + €50 ogni 25. Motivo: una "vittoria early" motiva chi parte da zero.
- **Family spinto:** rende ~2× (€10,35 vs €5,38) → si evidenzia.
- Fallimento pratica → **rimborso in crediti** (non cash).
- Pagamenti creator: **ogni 15 giorni**, su incassato consolidato.

### 24 Ago 2026 — Strategia go-to-market
- **Pre-qualifica:** messaggio-filtro → call solo ai caldi. Micro self-serve, call ai big. Motivo: non sprecare call, niente rifiuti in diretta.
- **Obiettivo settembre:** 5-10 creator **attivi** + funnel provato (NON €10k). Motivo: prima si prova la conversione con pochi, poi si scala.
- Priorità tecnica #1: **tracking vendite** (senza cui non si misura né si paga).
- Contratto/script "ufficiali" rimandati a dopo il test del funnel.

### 24 Ago 2026 — Ricerche di mercato (4 subagenti)
- Confermato: 40% è **alto** per il travel (AirHelp affiliate paga 15%).
- Performance puro accettato bene da nano/micro; debole sui mid-tier 100k+ con agenzia.
- CPM **scartato**: pericoloso per una startup che deve restare profittevole (paghi le views prima di sapere se convertono).

### 22 Ago 2026 — Outreach email
- Inviate 13 email di outreach da valerio@artecai.it. → 5 risposte positive (38%).
- Frase "selezionando con cura" nel copy.

### 22 Ago 2026 — CRM & infrastruttura
- Costruita CRM "Creator Pipeline" in Airtable (connettore **nativo**, non Composio) con Kanban colorato.
- Attivato workflow n8n di **harvest giornaliero** (Byparr) — 06:00, dedup verificato.
- Byparr integrato come **fallback di Firecrawl** per i siti Cloudflare.

### Storico — revisione creator
- 58 creator "Pronto" revisionati a mano → 24 perfetti + 34 scartati (con motivi).

---

## ❓ Decisioni ancora APERTE

- **Call:** chi le fa e quando; se confermare il 26/8 a Julian. (In pausa: "situazione seria, ragioniamoci".)
- **Risposte agli interessati:** vanno aggiornate col pacchetto nuovo prima di inviarle.
- **Tracking Metà B:** in attesa che l'altra sessione confermi `metadata.creator` + fornisca API key Stripe.
- **Contratto 1 pagina "ufficiale":** da finalizzare dopo il test del funnel.

## 27/8 — Deck partner v4 + note di conduzione call
- **Deck rifatto (v4, 13 slide)** dopo feedback di Valerio sul flusso confuso e le CTA da bambini. Flusso ora chiaro: come funziona la call, ti conosco (qualifica), cos'è Rivolio, problema, perché tu, pacchetto completo, come guadagni (meccanica), esempio di mese, dashboard, libertà, come si parte, chiusura.
- **CTA adulte:** tolte "prendi pubblica fai quel che vuoi" e "partiamo iniziamo?"; chiusura ora "Attiviamo il tuo account, adesso".
- **Pacchetto completo in slide 7:** aggiunti account gratis e codice sconto 10%, prima assenti.
- **Numero ~296€ inquadrato:** slide 8 chiarisce che si guadagna sulle PRATICHE (non a video, non un fisso); slide 9 è un esempio legato al volume, coi numeri tracciabili riga per riga (115 famiglia + 61 singole + 50 su 100 check + 70 bonus = 296). Verificati sul modello bloccato di docs/02.
- **Note di conduzione (docs/15):** scritte slide per slide (cosa dici e cosa fai) + spiegato il "contorno": deck come rotaia, Valerio parla, dashboard mostrata dal vivo alla slide 10 come passo-prova.
- Regola 1 rispettata: niente inviato. Il deck è materiale per le call, non un invio a terzi.

## 28/8 — Riordino ruoli + Growth Mission Control
- **Problema sollevato da Valerio:** troppe sessioni/routine sparse, non riesce a seguire nulla. Soluzione decisa: una web app "mission control" dove vedere tutto il growth pulito e live, mentre gli agenti restano ognuno nella sua sessione.
- **Puliti i residui:** cancellati i 3 trigger duplicati SPENTI (SCOUT/IG e Email/REDDIT appesi alla sessione di lavoro). Restano attive SOLO le 3 buone nella sessione RIVO Operativo. DAILY AI NEWS e RIVOLIO non toccati (altri progetti).
- **Fondamenta dashboard (popup):** Supabase realtime come motore dati, hosting web app sempre online su Railway, home focalizzata sulla squadra agenti (vederli lavorare live), stile in attesa delle foto di Valerio.
- **Architettura** in docs/16: agenti scrivono su Supabase → Realtime → dashboard. Regola d'oro: lo stato rispecchia la realtà, mai dashboard-finzione. Chiavi Supabase/Railway solo in env (regola 8).
- Ricerca fatta su mission control per agenti (pattern confermato: roster agenti live + Kanban + activity feed).

## 28/8 — Mission Control v1 costruita
- **App completa in `mission-control/`** (Next 16, Tailwind 4, Supabase realtime, Framer Motion): home focus squadra con stato live e avatar 3D a tema (pilota=CAPO, detective=SCOUT, lettera=IG e Email, alien=REDDIT), KPI, Kanban creator multi-vista (Kanban/Tabella/Card) con la CRM vera importata (55 creator + lead Scout), bozze con drawer di lettura, pagina Reddit coi contributi veri (karma 4 verificato), pagina dettaglio per agente con storico giri.
- **Decisioni popup:** transizione morbida da Airtable (doppio aggiornamento finché rodata), nomi RIVO + avatar a tema, URL segreto senza password, codice in questa repo.
- **API `/api/ingest`** con chiave a basso privilegio per le scritture degli agenti; schema SQL + seed dai dati veri; modalità demo etichettata quando il DB non è collegato (mai demo spacciata per live).
- **Collaudo visivo** fatto con Playwright/Chromium su tutte le pagine (iterato: bg, race della simulazione, formati follower).
- **Bloccanti esterni:** accesso al NUOVO account Supabase (Valerio deve dare un Personal Access Token o riconnettere il connettore) e workspace ID Railway (il token del connettore non espone la lista workspace).

## 28/8 pomeriggio — Mission Control IN PRODUZIONE + collaudo E2E
- **Live su Railway:** https://mission-control-production-b349.up.railway.app (workspace Artec AI, deploy automatico dal branch). Supabase nuovo account: org "Rivolio", progetto rivo-mission-control (Francoforte), schema + dati veri, realtime su tutte le tabelle, RLS sola lettura.
- **Collaudo tecnico superato:** giro simulato del CAPO via API (run_start → feed → run_finish) visto muoversi a schermo: stato Al lavoro con anello live, storico giri, feed. Chiave rifiutata se assente (401). Fix robustezza: fetch con allSettled per non restare mai in caricamento.
- **Routine aggiornate col protocollo Mission Control** (run_start/feed/run_finish/creator_upsert/draft_upsert/reddit_add/kv_set): IG e Email, SCOUT, REDDIT ricreate (il tool non modifica prompt di routine legate ad altra sessione), + creata la routine RIVO - CAPO (report 8:00 e 20:00). Giro vero di collaudo IG lanciato subito.
- **Nota tecnica onesta:** la chiave ingest (basso privilegio, scrive solo stato dashboard) sta nei prompt delle routine: compromesso accettato e documentato; le chiavi Supabase invece non sono mai passate in chiaro (impostate server-side). Il warning "no MCP connectors" sulle routine ricreate va verificato col giro di collaudo: se la sessione operativa perde i connettori, va ricreata la routine dalla UI claude.ai.
- Decisioni popup: collaudo tecnico + giro vero; routine CAPO subito; dominio Railway; Airtable si stacca dopo 3-4 giorni di doppio binario se tutto fila.

## 28/8 — Esito collaudo E2E col giro vero: SCOPERTO PROBLEMA CONNETTORI
- Il giro vero di RIVO - IG e Email HA SEGUITO il protocollo dashboard alla perfezione (run_start + run_finish onesto): pipeline dashboard VERIFICATA end-to-end anche dalla sessione routine.
- MA il giro ha riportato: "nessun connettore (IG/Gmail/Airtable) attivo in questa sessione". La sessione operativa dedicata (creata via API il 27/8) NON riceve i connettori MCP nei giri delle routine. Quindi con ogni probabilita' anche i giri di stamattina (SCOUT 6:09, IG 12:16) sono andati a vuoto: nessun lead nuovo di oggi in Airtable, coerente.
- Onesta' (regola 12): il problema NON e' nato oggi, e' nato con lo spostamento delle routine nella sessione dedicata; il collaudo di oggi lo ha SCOPERTO. Le vecchie routine legate alla sessione UI di Valerio funzionavano.
- Mitigazione immediata: 4 routine in PAUSA (niente giri a vuoto ogni ora), agenti segnati "In pausa" in dashboard con nota onesta nel feed.
- FIX (serve 1 minuto di Valerio): creare dalla UI di claude.ai una NUOVA sessione nello stesso ambiente (nome suggerito "RIVO Operativo 2"), che nasce coi connettori; poi Claude ricollega le 4 routine a quella sessione e rifa' il collaudo.
