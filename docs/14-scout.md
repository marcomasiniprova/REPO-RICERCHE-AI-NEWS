# 14 — RIVO - SCOUT (il cacciatore di creator)

Ruolo: ogni giorno trovare **10-20 nuovi creator nano/micro travel italiani**, arricchirli (dati + email dove possibile) e metterli in pipeline (Airtable) pronti da contattare. SCOUT è la benzina di tutta la macchina: senza creator nuovi, la catena si ferma. Non contatta nessuno (quello lo fa RIVO-IG e Email): SCOUT trova, verifica, arricchisce, consegna.

## ICP (chi cercare, deciso 26/8)
- **Fascia**: nano/micro, **1k-50k follower**. Sono i più facili da attivare e col miglior rapporto costo/risultato.
- **Tema**: viaggi/travel **italiani** (contenuti in italiano, pubblico italiano). È il cuore ICP di Rivolio.
- **Segnali di qualità**: pubblica ancora (ultimo post recente), engagement reale (commenti veri, non solo like), racconta viaggi/voli/aeroporti (alta pertinenza EU261), profilo "da persona" non brand.
- **Da scartare**: profili morti/inattivi, agenzie, pagine di sole gallery ricondivise, bot, follower gonfiati (tanti follower e zero commenti), non-italiani.
- **Priorità canale**: si cercano su **IG + TikTok** entrambe (poi si recluta su IG, si pubblica forte su TikTok, deciso 26/8).

## I motori di SCOUT (usati tutti insieme, ognuno per ciò che sa fare)
Deciso 26/8: SCOUT non dipende da un solo strumento, li combina come una batteria. Ridondanza = se uno si blocca, gli altri coprono.

1. **Apify** → scraper pronti per Instagram e TikTok: ricerca per hashtag (#viaggiitalia, #voliincredibili, #travelblogitalia...), per keyword, e "profili simili" a un creator che ci piace. Restituisce handle, follower, bio, link. È il motore principale di scoperta in scala.
2. **n8n + scraper esistente + Byparr** → riusa l'harvest già impostato su n8n, esteso a TikTok, con Byparr a sbloccare l'anti-Cloudflare dove serve. Buono per liste ricorrenti e automazioni schedulate.
3. **Exa AI** → ricerca semantica sul web: "travel blogger italiani nano su Instagram", liste, classifiche, articoli "migliori creator viaggi Italia". Trova creator che gli scraper per hashtag non intercettano (es. citati in blog, non attivi su un hashtag preciso).
4. **Firecrawl** → crawla e legge le pagine (profili, link in bio, siti personali, listicle di blog) per **estrarre l'email pubblica** e i dati di contatto, e per leggere pagine che gli altri non digeriscono bene.
5. **Composio (Exa + Firecrawl + Web Search)** → deciso 26/8: Exa e Firecrawl NON servono come chiavi separate in env, sono già disponibili come tool su Composio, insieme a Composio Web Search. SCOUT li richiama da lì per ricerca semantica, lettura pagine ed estrazione email. (Jina resta come alternativa già su n8n.)

Regola d'oro: ogni motore butta i suoi risultati in un unico imbuto, poi SCOUT **deduplica, filtra sull'ICP e arricchisce** prima di consegnare. Meglio 12 creator veri e puliti che 80 grezzi.

## La pipeline di SCOUT (ogni giro)
1. **SCOPERTA**: gira i motori sui temi/hashtag/keyword travel IT. Raccoglie candidati (handle, piattaforma, follower, bio, link).
2. **DEDUP**: confronta con Airtable (Creator Pipeline, base `appJWp6jzGrG7Kfo3`). Chi c'è già si scarta subito, non si ricontatta né si duplica (regola 10).
3. **FILTRO ICP**: tiene solo nano/micro travel IT vivi e pertinenti. Scarta morti/brand/bot/non-IT.
4. **ENRICHMENT**: per i sopravvissuti, prova a trovare l'**email pubblica** (bio, link in bio, sito personale via Firecrawl) e nota i segnali (TikTok sì/no, ultimo post, tema, engagement a occhio). Se l'email non c'è, si scrive "da verificare", non si inventa (regola 7).
5. **CONSEGNA**: scrive i nuovi in Airtable con stato "Da contattare", fonte (quale motore l'ha trovato), piattaforma, follower, email (o "da verificare"), e una nota di 1 riga sul perché è un buon match. Consegna **10-20 al giorno**.
6. **REPORT al Capo**: quanti trovati, quanti nuovi veri, quanti con email, da che motore. Numeri contati, mai a memoria.

## Volume e ritmo
- **Target: 10-20 nuovi creator/giorno** (deciso 26/8). Sostenibile: alimenta i contatti senza creare una lista che non riusciamo a lavorare.
- Se la pipeline "Da contattare" si accumula (RIVO-IG non sta dietro), SCOUT rallenta e avvisa il Capo: meglio pochi ben lavorati che una lista morta (regola 11, si decide sui dati).
- Rispetta i limiti degli scraper e dei siti: niente raffiche che fanno bannare gli account o le API.

## Regole ferree (dal CLAUDE.md)
- **Regola 8**: le API key (Apify, Exa, Firecrawl, Byparr) **solo in variabili d'ambiente**, mai nel repo, mai nei commit.
- **Regola 7**: mai inventare dati. Follower, email, engagement: se non verificati, "da verificare".
- **Regola 10**: ogni nuovo creator entra in Airtable subito, con fonte e stato.
- **Regola 1**: SCOUT NON contatta nessuno. Prepara la lista, il primo messaggio lo gestisce RIVO-IG e Email con l'OK di Valerio.
- Rispetto dei termini delle piattaforme: si raccolgono dati pubblici, niente scraping aggressivo o pratiche che bruciano gli account.

## Cosa esiste GIÀ su n8n (verificato 26/8) — SCOUT non parte da zero
Sul n8n di Valerio (progetto personale) c'è già una pipeline Rivolio. SCOUT va allineato e collaudato su questa, non ricostruito:
- **Rivolio 3 - Harvest lead (Byparr)** (id `NPuoG4jzEJddpyyQ`) → ATTIVO, schedulato ogni giorno alle 06:00. Trova creator travel IT da liste pubbliche via Byparr, estrae handle, deduplica contro Airtable, crea i nuovi in stato "Da arricchire". È il cuore della scoperta.
- **Rivolio 1 - Il Cacciatore (trova)** (id `UhP9u5aDC57mOrh2`) → scoperta da hashtag (ScrapSmith). Ora spento.
- **Rivolio 2 - Arricchisci & Personalizza** (id `Py4pqJYPO86TJFz9`) → arricchimento + personalizzazione lead, notturno, non invia. Ora spento.
- (Rivolio 3 - Il Postino `flvFHPpMZGJlaeIo` e Rivolio 4 - L'Orecchio `CfcziRcoPwmncxqu` sono invio/ascolto email: competono a RIVO-IG e Email, non a SCOUT.)

Credenziali già collegate su n8n (verificato): **Apify** (OAuth + "Apify P.P.C" API key), **byparr**, **Airtable** (token + OAuth), **Mistral / DeepSeek / OpenAI / Jina AI** per filtro e lettura pagine. Manca solo **Exa AI** (e Firecrawl, ma Jina lo copre).

ATTENZIONE (scope): sullo stesso n8n ci sono workflow di ALTRI progetti di Valerio (Studio Virtù, SolarBack, ZeroBattute, Agente V2). SCOUT NON li tocca: lavora solo sui workflow "Rivolio ...".

## Cosa serve per accendere SCOUT (dipendenze da collegare)
Questo è l'elenco preciso di cosa mettere in env / collegare, così colleghiamo e collaudiamo un motore alla volta:
1. **Apify** → GIÀ collegato su n8n (OAuth + "Apify P.P.C"). Da fare: scegliere/agganciare gli actor giusti, uno scraper IG (profili/hashtag) + uno TikTok (es. clockworks TikTok Scraper). Collaudo per primo.
2. **Byparr** → GIÀ collegato e in uso (Harvest attivo). Verificare che risponda.
3. **Airtable** → GIÀ collegato (base `appJWp6jzGrG7Kfo3`, tabella Creator Pipeline). Verificare i campi: Fonte, Piattaforma, Follower, Email, Stato, Nota, TikTok.
4. **Jina AI** → GIÀ collegato: lo usiamo per leggere pagine ed estrarre email (al posto di Firecrawl).
5. **Exa AI** → DA COLLEGARE: `EXA_API_KEY` in env / credenziale n8n. Unico motore ancora mancante (ricerca semantica di creator/liste).
6. **TikTok discovery** → DA AGGIUNGERE: un actor Apify TikTok nell'harvest (oggi l'harvest è più IG/liste). Questo è il pezzo nuovo vero da costruire.

## Collaudo (piano, un motore alla volta)
Come vuole Valerio, "alla perfezione ruolo per ruolo":
- **Step 1**: colleghiamo Apify, facciamo UN giro di prova su 1-2 hashtag travel IT, vediamo cosa restituisce, sistemiamo il filtro ICP. Mostro i risultati a Valerio.
- **Step 2**: aggiungiamo l'enrichment email (Firecrawl) su quei candidati, verifichiamo la qualità delle email trovate.
- **Step 3**: aggiungiamo Exa per allargare la scoperta, poi n8n/Byparr per l'automazione ricorrente.
- **Step 4**: quando il giro dà 10-20 creator puliti/giorno con buona qualità, si crea la routine SCOUT giornaliera e la si mette sotto il Capo.
- Ogni step: prima si guarda l'output vero, si corregge, poi si va avanti. Niente routine accesa finché la qualità non regge.

## Diagnosi Harvest (ispezione read-only, 26/8)
Workflow `Rivolio 3 - Harvest lead (Byparr)` (id `NPuoG4jzEJddpyyQ`), ATTIVO, tabella Airtable `tblNjhgOrmCeFAH3R` (base `appJWp6jzGrG7Kfo3`). Catena: Schedule 06:00 → Sorgenti (5 liste) → Byparr scrape → Estrai handle (regex + filtri anti-spazzatura + dedup) → Esistenti nel DB → Filtra nuovi → Crea in coda ("Da arricchire").
Stato: **struttura sana e robusta** (retry, batch, neverError, dedup corretta). Tre limiti da colmare per fare davvero SCOUT:
1. **Solo Instagram** (estrae solo handle IG). Manca la discovery TikTok → da aggiungere.
2. **Fonti = 5 liste fisse e finite** (blogger famosi, per lo più non-nano). Dopo la dedup il rendimento cala e non garantisce "10-20 nano nuovi/giorno". Serve una fonte VIVA (hashtag/ricerca Apify, o Exa/Web Search via Composio).
3. **Non misura i follower** → il filtro ICP nano 1k-50k non è applicato all'harvest (semmai a valle in "Arricchisci"). Da verificare che il nano-filter esista da qualche parte.
Nessuna modifica fatta: solo lettura.

Workflow `Rivolio 1 - Il Cacciatore (trova)` (id `UhP9u5aDC57mOrh2`), SPENTO. Catena: Schedule 02:00 → legge hashtag da Airtable `tblT789orESFCMvQo` (Tipo=Hashtag, Stato=Da cercare) → Loop → Apify `instagram-search-scraper` (searchType=user, fino a 200) → Rimuovi duplicati → upsert nei Leads `tblNjhgOrmCeFAH3R` ("Da arricchire") → aggiorna conteggio. Difetti: (1) spento; (2) la ricerca Apify è HARDCODED (lista fissa di keyword), quindi il loop sugli hashtag Airtable gira a vuoto; (3) solo IG; (4) nessun filtro nano (prende ogni taglia).
Quadro SCOUT completo: Harvest (liste, IG, attivo) + Cacciatore (Apify hashtag, IG, spento). Manca TikTok ovunque e il filtro nano 1k-50k ovunque. Apify usato via httpHeaderAuth ("Apify P.P.C").

## Diagnosi Arricchisci (ispezione read-only, 26/8)
Workflow `Rivolio 2 - Arricchisci & Personalizza` (id `Py4pqJYPO86TJFz9`), SPENTO. Catena notturna: legge lead "Da arricchire" (Follower vuoto) → scrapa profilo IG via Apify `logical_scrapers~instagram-profile-scraper` → classifica con Mistral (nicchia travel/voli/finanza/consumatori, scarta chi non vola/fotografi/agenzie) → analisi visiva Pixtral sulle copertine → "Motore decisione" (engagement, frequenza, score) → aggiorna riga Airtable con Stato Pronto/Scartato.
Verifiche chiave:
- **Email enrichment: C'È GIÀ** (`scr.businessEmail || allEmails[0] || lead.Email`).
- **Filtro follower: C'È ma la fascia è 5.000-300.000** (scarta <5k e >300k), NON 1k-50k. DISCREPANZA con l'ICP nano 1k-50k deciso il 26/8. Da riconciliare con Valerio (la fascia 5k-300k somiglia di più ai creator reali in chiusura: Filippo 171k, Giusi 276k). DECISIONE APERTA.
- È solo IG (instagram-profile-scraper) e Apify-dipendente (fermo col limite Apify). Manca l'arricchimento TikTok.
Molto ben fatto: è di fatto il "cervello" che filtra taglia + trova email + valuta qualità. SCOUT ci si appoggia.

## Test actor Apify (26/8) — BLOCCATO da limite Apify
Creato banco di prova temporaneo (workflow `W6JlZReSwlr2yGPr`, "SCOUT - TEST actor scraper (temp)") con 3 nodi: clockworks/tiktok-scraper, automation-lab/tiktok-search-scraper, apify/instagram-search-scraper, su keyword "viaggi italia", limiti minimi. Credenziale Apify "Apify P.P.C" agganciata.
Esito esecuzione live: **tutti e 3 → HTTP 403 `{"error":{"type":"platform-feature-disabled","message":"Monthly usage hard limit exceeded"}}`**. L'auth funziona (non è 401): è il LIMITE DI SPESA MENSILE Apify superato. Nessun actor può girare finché non si sblocca.
Conseguenze: (1) confronto actor rimandato; (2) la discovery Apify (Cacciatore) è di fatto ferma; gira solo l'Harvest via Byparr. Da fare lato Valerio: alzare il "monthly usage hard limit" / upgrade piano Apify, o aspettare il reset. Poi si rilancia lo stesso test.

## Progetto del SISTEMA UNICO "Rivolio - SCOUT (IG+TikTok)" (a secco, 26/8)
Deciso con Valerio: UN SOLO workflow di scoperta (non decine sparsi) che sostituisce Harvest + Cacciatore. L'arricchimento resta il workflow "Arricchisci" (il cervello già fatto: profilo, nano-filter, email, Mistral, vision). Così il "sistema" = 1 discovery + 1 enrichment, pulito.

### Struttura del workflow discovery (nodi)
1. **Schedule 06:00** (Europe/Rome).
2. **Ramo A - IG liste (Byparr)**: Sorgenti (5 liste travel IT) → Byparr scrape → Estrai handle IG (regex + filtri anti-spazzatura, come l'Harvest attuale). Output: {username, piattaforma:"Instagram", profilo}.
3. **Ramo B - IG hashtag (Apify)**: Keyword IG → Apify `instagram-search-scraper` (searchType:user) → Estrai. Output uguale al Ramo A.
4. **Ramo C - TikTok (Apify)**: Keyword TT → Apify actor TikTok VINCENTE (da test) → Estrai. Output: {username, piattaforma:"TikTok", profilo, follower se disponibili}.
5. **Unifica** (Merge append dei 3 rami) → lista unica di candidati.
6. **Filtro nano (best-effort in discovery)**: dove il follower è già disponibile (spesso TikTok/IG user-search), scarta fuori fascia. Dove non c'è, passa e il gate nano definitivo resta in "Arricchisci". FASCIA DA CONFERMARE (vedi sotto).
7. **Esistenti nel DB** (Airtable search Username su Leads `tblNjhgOrmCeFAH3R`).
8. **Filtra nuovi** (dedup vs esistenti).
9. **Crea in coda** (Airtable create, Stato "Da arricchire", Piattaforma dal singolo item, Nicchia "Travel", Motivo_AI = fonte).

### Punti di configurazione
- **Keyword/temi** (Ramo B e C): "viaggi italia, travel italia, itinerari, voli, low cost, diritti dei passeggeri, rimborso volo" + un po' finanza/risparmio (come già imposta il Cacciatore). Tema "Viaggi IT + dintorni" (deciso 26/8).
- **FASCIA FOLLOWER — DECISIONE APERTA**: l'ICP dichiarato è nano 1k-50k, ma l'Arricchisci reale tiene **5.000-300.000** (e i creator veri in chiusura sono Filippo 171k, Giusi 276k). Proposta di default: tenere **5k-300k** (allineato al comportamento reale) come parametro unico, facile da cambiare. Valerio conferma la fascia.
- **Actor TikTok**: da scegliere col test dei 3 (clockworks / automation-lab / +1). Provvisorio: clockworks/tiktok-scraper.

### Cosa serve prima di assemblare e accendere
1. Token Apify valido in "Apify P.P.C" (in corso: Valerio cambia account).
2. Un giro di test dell'actor TikTok per vedere i nomi VERI dei campi output (follower/bio) e mappare l'Estrai TikTok senza indovinare.
3. OK di Valerio sulla fascia follower.
Poi: assemblo il workflow, lo collaudo su dati reali (giro manuale), mostro l'output, e solo con OK spengo Harvest/Cacciatore e accendo il sistema unico sotto il Capo.

## Esito test 3 actor (26/8, token nuovo OK) — LEZIONE sul metodo
Test riuscito su keyword "viaggi italia" (5 risultati richiesti). Tutti e 3 gli actor FUNZIONANO e restituiscono i campi utili:
- **clockworks/tiktok-scraper** (searchSection "/user"): `authorMeta` con name, fans (follower), signature (bio con email visibile). Ma nota "Profile has no videos": su ricerca /user rende poco, è pensato per hashtag/video. Risultati: @viaggiitalia 106, @italiaviaggi 148, @viaggiinitalia 69.
- **automation-lab/tiktok-search-scraper** (searchType user): campi PIATTI e puliti (username, nickname, followers, likes, videoCount, signature). Ottimo formato. Ma LENTO (serviti 90s). Risultati: @viaggiitalia 106, @viaggiitalia1 16, @viaggioitalia 2248.
- **apify/instagram-search-scraper**: il PIÙ RICCO (biography, followersCount, **externalUrls** per email/link, businessCategoryName, postsCount, private, verified, latestPosts). Risultati: @coccotravel_ita 2087 (Agenzia), @izitour_italiano 2393 (Travel Company), @viaggioinitalia2025 89 (eventi).

**LEZIONE CHIAVE:** il problema NON sono gli actor, è il METODO. Cercare per NOME-UTENTE una keyword generica ("viaggi italia") restituisce account che si CHIAMANO così: squatter minuscoli, aggregatori, AGENZIE. NON i creator veri (che non si chiamano "viaggi italia"). Questo stesso difetto è nel Cacciatore attuale (searchType=user) → riempiva la pipeline di spazzatura.
**CORREZIONE DI ROTTA:** la discovery vera va fatta per HASHTAG/VIDEO (chi PUBBLICA contenuti travel), poi si estraggono gli autori e si arricchiscono. I campi necessari (follower per nano-filter, email/bio) ci sono in tutti e 3. 
Campi per la mappatura (verificati sui dati reali): clockworks → json.authorMeta.{name,fans,signature}; automation-lab → json.{username,followers,signature,videoCount,profileUrl}; IG → json.{username,followersCount,biography,externalUrls,businessCategoryName,private,verified}.

## Verdetto discovery hashtag/video (26/8) — ACTOR SCELTI
Secondo test in modalità hashtag/video (#viaggiitalia). Risultato netto:
- **clockworks/tiktok-scraper (hashtags) = VINCITORE per TikTok.** 8 creator VERI con follower+bio+email: es. @lorecostantini_ 9.401 (IT), @voyavels 3.509 (IT), @italia.io.ti.amo 2.174, @missnorasinn 145k, @benedettow 471k, @comerrezarviajar 103k, @dahl_nadine 27k, @ailusochan 2k. Alcuni stranieri (li scarta il Mistral dell'Arricchisci). Campi: json.authorMeta.{name, fans, signature}.
- **automation-lab/tiktok-search-scraper (searchType video) = ERRORE** (1 item {error}). Bocciato in questa config.
- **apify/instagram-hashtag-scraper = OK per IG.** 8 account reali che postano (ownerUsername/ownerFullName), es. @blu_viaggi, @vivi_salento_, @cinziamalaguti02. Nessun follower a discovery → il follower/nano-filter lo mette l'Arricchisci.

**DECISIONE ACTOR (26/8):**
- TikTok discovery → **clockworks/tiktok-scraper in modalità hashtags**.
- IG discovery → **apify/instagram-hashtag-scraper** (chi posta) + le liste Byparr (Harvest). NIENTE ricerca per nome-utente (trova squatter/agenzie).
- Enrichment/nano-filter/email/qualità → resta l'Arricchisci (Mistral + profile scrape).
Prossimo: costruire il workflow unico "Rivolio - SCOUT (IG+TikTok)" con questi actor e mapping, SPENTO, collaudo, poi spegnere Harvest/Cacciatore e accendere sotto il Capo.

## COLLAUDO sistema unico (26/8) — RIUSCITO
Creato workflow **`Rivolio - SCOUT (IG+TikTok)`** (id `ESLNWiVxmXb11Xdu`), SPENTO. 13 nodi: 3 rami (TikTok clockworks hashtag / IG hashtag / liste Byparr) → Merge append → Dedup+filtro nano 1k-50k → Esistenti Airtable → Filtra nuovi → Crea "Da arricchire". Credenziali: Apify P.P.C (2 actor), byparr, Airtable token.
Giro manuale di collaudo: SUCCESSO in ~1m45s. **71 nuovi creator creati** in Airtable Leads: **16 TikTok** (tutti nella fascia nano 1k-50k, follrati: es. @giamba.travel_creator 15,5k, @finestre_sui_borghi 31,9k, @inemiliaromagna 23,7k, @italyyoudontexpect 18,5k, @voyavels 3,5k) + **55 Instagram** (follower vuoti → li riempie/filtra l'Arricchisci).
Note: (1) filtro nano funziona sui TikTok (hanno i follower a discovery); gli IG passano senza follower e vengono filtrati dall'Arricchisci. (2) Ripristinata la blocklist big-stranieri in "Estrai liste" (erano rientrati @bemytravelmuse, @kirstenalana ecc.). (3) 71 in un giro è tanto (target 10-20/gg): normale al primo backfill, poi la dedup abbassa; tunabile con meno hashtag/limiti. (4) Workflow di prova temporaneo archiviato.
DA FARE (con OK Valerio): (a) aggiornare soglia Arricchisci 5k-300k → 1k-50k; (b) spegnere Harvest+Cacciatore vecchi e ATTIVARE il SCOUT unico (schedule 06:00) sotto il Capo; (c) eventuale tuning volume/hashtag.

## Catena completa (27/8) — discovery + qualificazione
Il ruolo RIVO-SCOUT ogni mattina comanda 3 motori n8n (tutti webhook/fired-by-agent):
1. **DISCOVERY** `Rivolio - SCOUT (IG+TikTok)` (ESLNWiVxmXb11Xdu): hashtag TikTok+IG -> nano 1k-50k -> "Da arricchire".
2. **ARRICCHISCI IG** `Rivolio 2` (Py4pqJYPO86TJFz9): scrape profilo IG + Mistral + vision -> Pronto/Scartato. Solo IG (filtro Piattaforma=Instagram aggiunto). Collaudato: 8 IG in 2,5 min, scarti tutti corretti (troppo grandi, treno/autostop, fotografi, inattivi). Classificatore niche SEVERO (voluto da Valerio).
3. **ARRICCHISCI TIKTOK** `Rivolio - Arricchisci TikTok` (65R7BVwsokVyTk3I): NUOVO, leggero. Scrape profilo TikTok (clockworks) + regole (nano, non-aereo, video, bio travel, esclude enti/tourism board) + email dalla bio -> Pronto/Scartato. Collaudato: 3 TikTok qualificati in ~70s (gogotravelfood score 90, davidemarranon 70 -> Pronto). Separato dall'IG perche' i dati TikTok hanno forma/cardinalita' diversa (1 riga per video vs 1 per profilo).
Flusso: SCOUT trova -> enricher qualificano -> i "Pronto" sono i creator buoni, pronti per RIVO-IG (che li contatta con OK di Valerio). Il ruolo fira discovery + entrambi gli enricher ogni mattina.

## Impostazioni definitive (27/8, decise con Valerio)
- **Fascia**: nano 1k-50k (confermata).
- **Volume**: 10-20 nuovi/giorno di qualita' (2-3 hashtag, ttLimit 5, igLimit 5).
- **Orario**: 06:00.
- **Liste Byparr**: SPENTE. Si lavora SOLO per hashtag (le liste portavano big/stranieri). Nel motore il ramo "Sorgenti liste" e' disabilitato.
- **Hashtag**: soprattutto viaggi IT (viaggiitalia, borghitalia, weekendfuoriporta, itinerari, mareitalia, montagnaitalia, dolomiti, italiadascoprire, borghiitaliani, viaggiare) + OGNI TANTO angoli voli/soldi (voli, aeroporto, rimborsovolo, vololowcost, finanzaviaggi, risparmioviaggi). Il ruolo li ruota.
- **Report**: RIVO-SCOUT NON scrive a Valerio ogni giorno; i numeri entrano nel REPORT DEL CAPO. Scrive solo per problemi veri (Apify al limite, run fallita, pipeline ferma).

## ARCHITETTURA FINALE (27/8) — motore n8n + ruolo manager
Deciso con Valerio: SCOUT = un **motore n8n a WEBHOOK** + un **ruolo agente "manager"** che ogni mattina lo prepara, lo fa partire e ne controlla l'output. Il ruolo NON rifa' lo scraping (sarebbe lento/caro): il lavoro pesante e' di n8n; il giudizio (keyword, qualita', volume, report, manutenzione) e' dell'agente. Principio per tutto il team: meccanico/volume -> n8n; giudizio/decisioni/report -> ruolo.

**Il motore** — workflow `Rivolio - SCOUT (IG+TikTok)` (id `ESLNWiVxmXb11Xdu`):
- Trigger **Webhook** (POST, path `rivolio-scout`). Niente piu' schedule: lo attiva il ruolo.
- Nodo **Config**: legge `body.hashtags` (+ `ttLimit`, `igLimit`) dal payload, o usa default. Costruisce i body dei due actor.
- 3 rami: TikTok (clockworks hashtag) + IG (instagram-hashtag-scraper) + liste Byparr (ON) -> Merge -> Dedup+filtro nano 1k-50k -> Esistenti Airtable -> Filtra nuovi -> Crea "Da arricchire" (tabella `tblNjhgOrmCeFAH3R`).
- Collaudato via webhook (27/8): passate hashtags nel body, Config le ha usate, 14 nuovi creati (6 TikTok nano + 8 IG). Funziona.

**Il ruolo RIVO-SCOUT** (routine ~06:00, fira nella sessione persistente):
1. Guarda quanti "Da arricchire" ci sono gia' in pipeline; se piena, riduce/salta.
2. Sceglie/ruota gli hashtag del giorno (bacino travel IT), punta a 10-20/giorno di qualita' (2-4 hashtag, limiti bassi).
3. Fira il motore: n8n `execute_workflow` su `ESLNWiVxmXb11Xdu`, inputs webhook body {hashtags, ttLimit, igLimit}.
4. Controlla l'output (nodo "Filtra nuovi"): quanti, TikTok/IG, qualita' a campione.
5. Manutenzione: aggiusta hashtag/blocklist se vede spazzatura; segnala problemi (Apify al limite, run fallita).
6. Report breve a Valerio, numeri veri contati.
7. NON contatta nessuno, non invia niente. Solo scoperta.

## ACCESO (26/8) — SCOUT in produzione
- SCOUT unico `Rivolio - SCOUT (IG+TikTok)` (id `ESLNWiVxmXb11Xdu`) **ATTIVO**, schedule 06:00 (Rome).
- Harvest vecchio (`NPuoG4jzEJddpyyQ`) **spento**; Cacciatore (`UhP9u5aDC57mOrh2`) già spento. Il sistema unico li sostituisce.
- Arricchisci (`Py4pqJYPO86TJFz9`): soglia nano portata da 5k-300k a **1.000-50.000** (Motore decisione). (Nota: resta un warning pre-esistente non mio sul nodo "Cerca lead da arricchire", limit+returnAll; non toccato.)
- I 71 lead del collaudo: **cancellati** (erano test).
- Da rivedere insieme dopo il primo giro dell'Arricchisci: volume (target 10-20/gg) e set hashtag.

## Stato
- 26/8/2026: playbook scritto (2° pezzo dopo il Capo). Motori: Apify + n8n/Byparr + Exa + Jina. ICP: nano/micro travel IT 1k-50k. Volume: 10-20/giorno. Enrichment email: sì.
- 26/8/2026: SCOPERTA — gran parte di SCOUT esiste già su n8n (Harvest Byparr attivo + Cacciatore + Arricchisci). Apify/Byparr/Airtable/Jina già collegati. Manca solo Exa e la discovery TikTok. Quindi il lavoro su SCOUT è: allineare, ripulire e COLLAUDARE la pipeline esistente, poi aggiungere TikTok + Exa. NON ricostruire da zero.

## Correzioni di Valerio (memoria di addestramento)
(si riempie con le sue note su ICP, qualità dei creator trovati, motori)
