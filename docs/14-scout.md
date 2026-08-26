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

## Cosa serve per accendere SCOUT (dipendenze da collegare)
Questo è l'elenco preciso di cosa mettere in env / collegare, così colleghiamo e collaudiamo un motore alla volta:
1. **Apify** → `APIFY_TOKEN` (o `APIFY_API_KEY`) in env. Scegliere gli actor: uno scraper IG (profili/hashtag) + uno TikTok (es. clockworks TikTok Scraper). Da collaudare per primo: è il motore principale.
2. **Exa AI** → `EXA_API_KEY` in env. Per la ricerca semantica di creator/liste.
3. **Firecrawl** → `FIRECRAWL_API_KEY` in env. Per l'estrazione email e la lettura pagine.
4. **Byparr** → già in uso (password solo in env, regola 8). Verificare che risponda per lo sblocco Cloudflare quando n8n scrappa.
5. **n8n** → estendere l'harvest esistente a TikTok (workflow dedicato). Le credenziali stanno già in n8n.
6. **Airtable** → già collegato (base `appJWp6jzGrG7Kfo3`, tabella Creator Pipeline). Verificare che ci siano i campi: Fonte, Piattaforma, Follower, Email, Stato, Nota, TikTok.

## Collaudo (piano, un motore alla volta)
Come vuole Valerio, "alla perfezione ruolo per ruolo":
- **Step 1**: colleghiamo Apify, facciamo UN giro di prova su 1-2 hashtag travel IT, vediamo cosa restituisce, sistemiamo il filtro ICP. Mostro i risultati a Valerio.
- **Step 2**: aggiungiamo l'enrichment email (Firecrawl) su quei candidati, verifichiamo la qualità delle email trovate.
- **Step 3**: aggiungiamo Exa per allargare la scoperta, poi n8n/Byparr per l'automazione ricorrente.
- **Step 4**: quando il giro dà 10-20 creator puliti/giorno con buona qualità, si crea la routine SCOUT giornaliera e la si mette sotto il Capo.
- Ogni step: prima si guarda l'output vero, si corregge, poi si va avanti. Niente routine accesa finché la qualità non regge.

## Stato
- 26/8/2026: playbook scritto e approvato come 2° pezzo del Growth RIVO Team (dopo il Capo). Motori decisi: Apify + n8n/Byparr + Exa + Firecrawl. ICP: nano/micro travel IT 1k-50k. Volume: 10-20/giorno. Enrichment email: sì. BLOCCATO in attesa delle API key da mettere in env (Apify, Exa, Firecrawl) per iniziare il collaudo dallo Step 1 (Apify).

## Correzioni di Valerio (memoria di addestramento)
(si riempie con le sue note su ICP, qualità dei creator trovati, motori)
