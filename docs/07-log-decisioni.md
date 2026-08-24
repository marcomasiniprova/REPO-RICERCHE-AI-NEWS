# 07 — Log decisioni (cronologico)

Ogni decisione importante va aggiunta qui, con data e motivazione. Dal più recente in cima.

---

### 24 Ago 2026 (notte) — Primi 2 no + rotta confermata + contratto
- Michela (email): lavora solo a fee fissa, no al performance. Inviata chiusura gentile (schedulata 8:00). Prevista dalla ricerca.
- Flaminia (DM): "non sono interessata", no educato senza motivo. Segnata Scartato.
- Valerio ha avuto il timore "nessuno accetta il performance". Perspective: 2 no su 18 risposte, ed erano profili da fisso. Gli 8 veri interessati (gpintrip, Stefi, Yass, Simone, Sarah, Sari, viaggio.ideale, Cristian) non hanno ancora sentito il modello. Il vero KPI e la conversione cliente, non il tasso di firma creator.
- DECISIONE: si tiene il PERFORMANCE PURO, si decide sui dati veri. Gli 8 caldi si muovono domani con calma.
- RIVO esteso: gestisce anche le call (raccoglie disponibilita, propone slot da confermare). Scope DM + email. Report mattutino in chat.
- Creata bozza contratto: docs/09-contratto.md.

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
