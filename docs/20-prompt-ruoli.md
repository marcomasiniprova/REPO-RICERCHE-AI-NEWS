# I 4 ruoli del Growth RIVO Team: architettura e prompt completi

Aggiornato al 28/8 sera, dopo lo split in sessioni dedicate. Questa pagina e' la verita' scritta dei ruoli: se un prompt di routine cambia, va aggiornata anche qui (la tiene il builder, i ruoli non committano mai nulla).

## Come e' fatta la macchina

- **ROUTINE** (la sveglia + il mestiere): ognuna delle 4 routine su claude.ai contiene il cron e il PROMPT COMPLETO del ruolo. Tutto il "chi sei, cosa fai, in che ordine, con che regole" vive nel prompt della routine: l'agente lo rilegge da capo a ogni giro, non va a memoria.
- **SESSIONE** (il banco di lavoro): ogni routine e' agganciata a una sessione UI dedicata, creata da Valerio. La sessione porta due cose che la routine da sola non ha: i CONNETTORI (Instagram, Gmail, Airtable, Reddit, n8n via Composio) e il repo in sola lettura (CLAUDE.md e i playbook in docs/). Il contesto della sessione contiene SOLO i giri di quel ruolo.
- **PLAYBOOK** (il come, nel dettaglio): i prompt rimandano ai docs del repo (06 messaggi, 08 copywriting, 10 reddit, 13 capo, 14 scout) e alla skill `copywriting-italiano-umano-2026`. Non esistono "4 skill": esistono 4 prompt + i playbook + una skill di copy condivisa.
- **DASHBOARD** (il registro dei fatti): ogni giro scrive run_start, feed, checklist CHK nel run_finish. Le bozze aspettano il PIN di Valerio (propose-then-commit). Il CAPO legge il quadro da GET ?digest=1.
- La chiave API della dashboard e' indicata nei prompt come Bearer: qui e' oscurata come `<INGEST_KEY>` (regola 8: segreti mai nel repo). Vive nelle routine e nelle env Railway.

## Mappa routine, sessioni e orari (ora italiana)

| Ruolo | Routine (trigger) | Sessione | Orari |
|---|---|---|---|
| SCOUT | RIVO - SCOUT (trig_018927nhJqfVVsLefhixxD1s) | RIVO SCOUT operative | 06:00 |
| IG e Email | RIVO - IG e Email (trig_01CMRxqjmbbRSnA5Bqsc499E) | RIVO IG - DM operative | ogni ora 8:15-20:15 |
| REDDIT | RIVO - REDDIT (trig_01MCzR2LNjCrQaWBm978Bwjk) | RIVO REDDIT operative | ogni ora 8:00-20:00 |
| CAPO | RIVO - CAPO (trig_01LP8chJe9KcbWa9ZM8yFHCF) | RIVO CAPO operative | 8:30 e 20:30 |

Lo scheduler consegna i giri con 5-20 minuti di ritardo rispetto all'orario nominale: e' normale.

Nota tecnica (lezione imparata): i connettori vivono solo nelle sessioni create dalla UI, per questo le routine devono restare agganciate a sessioni create da Valerio. Un fire manuale di collaudo si fa SENZA testo extra, altrimenti parte in una sessione orfana senza connettori.

## Regole comuni a tutti i ruoli

1. MAI inviare nulla a persone reali senza OK esplicito: o Valerio scrive "manda/invia/pubblica ora", o la bozza ha il PIN (status "approvata" in dashboard).
2. MAI numeri inventati: o contati dai tool in quel giro, o "da verificare".
3. MAI il trattino lungo. Copy ultra-umano.
4. MAI commit o push sul repo.
5. Checklist numerica CHK obbligatoria nel run_finish di ogni giro.
6. Zero fiducia nella memoria dei giri precedenti: verifiche rifatte da zero ogni volta.

I prompt completi e correnti dei 4 ruoli si leggono in ogni momento dalla lista Routine su claude.ai (ogni routine mostra il suo prompt). Le modifiche si fanno SOLO ricreando la routine (delete+create) dal builder, mai a mano da dentro un giro, e ogni modifica va annotata in docs/07-log-decisioni.md con data e motivo.

## Sintesi dei 4 prompt (cosa contiene ciascuno)

### RIVO - SCOUT (06:00)
Identita' talent scout, ICP allargato a 4 famiglie (travel creator, travel tips, budget travel, diritti passeggeri) con falsi positivi da scartare. Padre dei 3 workflow n8n (discovery hashtag, enricher IG, enricher TikTok): li lancia, li segue fino a success/error, li rilancia se si bloccano. Regola suprema: nessun lead nel limbo, giro finito solo con Da arricchire a zero o motivo documentato. Consegna i nuovi Pronto in dashboard, checklist CHK con prima/nuovi/qualificati/pronto_nuovi/scartati/resta + id esecuzioni n8n.

### RIVO - IG e Email (ogni ora 8:15-20:15)
Il clone di Valerio coi creator. Giro in 7 passi: 1) invia le bozze APPROVATE col PIN (unico caso di invio reale) e le marca inviate; 2) SYNC TOTALE 48h di Instagram (tutte le conversazioni, entrata e uscita) e Gmail (inbox + sent) contro l'indice della dashboard, aggiunge solo cio' che manca con id nativi; 3) test meccanico di freschezza su OGNI bozza (la bozza deve rispondere all'ultimo messaggio del creator, non conta quando e' stata scritta) con riscrittura a stesso id; 4) bozze nuove per chi aspetta risposta; 5) primi contatti email ai Pronto dello SCOUT mai contattati; 6) checklist CHK. Guardie extra: verifica che il record Airtable sia del creator giusto prima di scrivere; slot call proposti in bozza e confermati dal PIN (o da conferma scritta di Valerio, che vale anche fuori Lun-Ven).

### RIVO - REDDIT (ogni ora 8:00-20:00)
Il clone di Valerio su Reddit (u/Valerio_alieri, da founder, mai finto utente neutro). Fase addestramento: zero pubblicazioni di iniziativa, tutto passa dal PIN. Giro: pubblica le bozze approvate, verifica il karma vero (SOLO comment_karma, mai total) e lo scrive nel kv, controlla le risposte ai commenti gia' pubblicati, caccia 1-3 thread dove dare valore vero, checklist CHK. Tetto 12-15 commenti/giorno, rapporto valore/promozione 9:1, prima menzione Rivolio verso i 50 karma e solo con OK.

### RIVO - CAPO (8:30 e 20:30)
Il coordinatore. Numeri SOLO dal GET ?digest=1 (stato agenti, ultimi giri con checklist, pipeline per stage, bozze, kv) o da letture Airtable fatte nel giro. Doveri di coordinamento: controlla che ogni agente abbia girato agli orari previsti (segnala STALLO), bozze ferme oltre 24h in cima alle priorita', verifica a campione che gli esiti in dashboard corrispondano al record Airtable giusto, karma solo commenti. Mantiene i contatori live della pagina Scout (kv scout_stats) applicando i numeri della checklist SCOUT. Report in formato FISSO di 7 righe (Pipeline / Fatti di oggi / Bozze / Agenti / Priorita / Stalli), UNA sola entry nel feed per giro, mai doppioni.

## Aggiornamento 28/8 notte: da prompt monolitici a SKILL dedicate
Su decisione di Valerio ogni ruolo ora ha la sua skill nel repo, una cartella per ruolo in `.claude/skills/`:
- `rivo-scout`, `rivo-ig-email`, `rivo-reddit`, `rivo-capo`, ognuna con `SKILL.md` (il giro operativo completo) e `reference.md` (lezioni imparate ed errori noti).
- Il prompt della routine ora e' CORTO: fa `git pull origin main`, carica la SUA skill col tool Skill (fallback: lettura diretta dei file), passa il valore di `<INGEST_KEY>` e impone l'ESCLUSIVITA': ogni ruolo esegue solo la propria skill, mai quelle degli altri.
- Vantaggio: il mestiere e' versionato nel repo (ogni modifica e' un commit leggibile), le lezioni si accumulano nei reference senza gonfiare i prompt, e la scheda tecnica in dashboard mostra le skill vere.
- Trigger correnti: SCOUT trig_01VHFawpzN29TiVDyYgy6j4y (6:00), IG e Email trig_01TvbWgSaFBzUaUcbjnqRGHK (8:15-20:15), REDDIT trig_01DAbpzjFBqoNc8MDHZABVrv (8-20), CAPO trig_01QA9WDHme4LPCAnHz5ry4Zf (8:30 e 20:30).

## 29/8 — Il quinto ruolo: RIVO - VIDEO (la macchina dei contenuti)
- Skill: `.claude/skills/rivo-video/` (SKILL.md il giro, reference.md protocollo dashboard, `references/00..06` la bibbia di Giulia scritta da Valerio: personaggio, hook, script, regia ultra-realismo, Kie/Veo 3.1, pubblicazione, routine). Le 5 foto reference di Giulia sono in `assets/giulia/`.
- Cosa fa: 1 video UGC al giorno (15-25s, 9:16, Veo 3.1 su Kie, image-to-video dalle reference di Giulia), stesso video su TikTok + Instagram Reels + YouTube Shorts con caption dedicate e disclosure AI obbligatoria (EU AI Act art. 50(4)).
- Approvazione: i video vivono nel kv della dashboard (chiavi `video_YYYY-MM-DD`); la pagina Contenuti mostra anteprima, script e caption; il PIN di Valerio porta lo stato a "approvato" e l'agente pubblica (subito se il PIN arriva entro 2 ore dal giro, altrimenti al giro del mattino dopo). Mai pubblicazione senza PIN o OK esplicito in sessione.
- Budget: autorizzato 1 video + max 1 rigenerazione al giorno; saldo Kie controllato a inizio giro, con crediti a zero il giro si ferma e urla nel feed (destinatario: Valerio, ricarica).
- Chiavi: `KIE_API_KEY` dalle variabili dell'environment (vedi `.env.example` alla root: nel repo SOLO i nomi delle chiavi, mai i valori, regola 8). Pubblicazione via Composio (account social di Rivolio collegati da Valerio).
- Routine: RIVO - VIDEO, ogni mattina 7:30 italiane (cron 30 5 * * * UTC), agganciata alla sessione "RIVO VIDEO operative" creata da Valerio. Prompt corto come gli altri: git pull, carica la skill rivo-video, esclusivita', INGEST_KEY nel messaggio.

## 29/8 pomeriggio — Tutte e 5 le routine blindate (prompt a prova di container vuoto)
Dopo i problemi del ruolo VIDEO (container svuotato dal cambio ambiente + contesto stale sui re-fire ravvicinati), TUTTE le 5 routine sono state ricreate con lo stesso prompt blindato: "OGNI FIRE E' UN GIRO NUOVO DA ZERO" (mai a memoria) + PASSO ZERO che clona il repo se il container e' vuoto e fa SEMPRE git pull + rilettura del digest da zero. Nuovi trigger id:
- SCOUT: trig_01NuXDkrkZu6jZDSLzoJcwGQ (0 4 UTC = 6:00 IT) -> session_01JG8SAgg9iJ3VxMNHcCUnsQ
- IG e Email: trig_01HmBxBdk3YYAnqE7mCwdpKj (15 6-18 UTC = 8:15-20:15 IT) -> session_01L8ijRZeY15T4eCWkZ6qqzD
- REDDIT: trig_013C4p235ZbFjKco1b4Mg6ny (0 6-18 UTC = 8-20 IT) -> session_01FydgQ9ZgE4Vtoj47N4VVyP
- CAPO: trig_01S88EMToiFpSrJBm1NUmBKu (30 6,18 UTC = 8:30 e 20:30 IT) -> session_01V7gAxxPXdsr4q51VN1GaKD
- VIDEO: trig_019TfbbbBF4gDwobdrcRPMzS (0 6-18/3 UTC = 8,11,14,17,20 IT) -> session_01Qt543vKnFPbxMaAguXtDB3
I vecchi trigger sono stati eliminati. Collaudo del 29/8 16:39 (giro di prova simultaneo dei 5): IG ok (sync pulito), REDDIT ok (karma 15), CAPO ok (report sera coordinato, ha visto anche il video in attesa PIN), VIDEO ok (idempotente: non ha rigenerato, video gia' in_attesa), SCOUT in corso (n8n discovery). Le 2 call sono per LUNEDI: Marina 15:30, yass 16:30.

## 29/8 — Roadmap fase 2 (decisa con Valerio, da costruire in ordine)
Il ruolo di Valerio da ora e' SOLO la dashboard (approva/guarda), mai piu' sessioni/log. Il manutentore diventa un ruolo dedicato. Ordine deciso: (1) robustezza dei 4 [FATTO]; poi (2) Guardiano/manutentore (ripara i ruoli fermi, rilancia i giri saltati, sistema n8n; chiama il builder solo per i bug di codice); (3) etichette bozze in dashboard ("manda l'agente" se DM entro 24h o c'e' email; "mandi tu" se DM oltre 24h e senza email; email sempre preferita); (4) promemoria meeting anti no-show (automatici 24h e 3h prima, dalla sezione Call + Airtable, MAI da approvare); (5) link Meet fisso globale (nella dashboard, riusato per tutte le call; l'invio del link alla conferma call e' da approvare, i promemoria no). Serve da Valerio: il link Meet fisso.

## 29/8 sera — La macchina contenuti a 5 ruoli: nasce lo STRATEGA (il cervello)
Dopo la ricerca sulla crescita organica, la macchina contenuti diventa un vero team a 5 ruoli, non piu' il solo VIDEO. Il primo costruito e' lo STRATEGA, il social media manager che comanda gli altri.

### RIVO - STRATEGA (il cervello, 2 giri/giorno: piano mattino + review sera)
- Skill: `.claude/skills/rivo-stratega/` (SKILL.md il giro, reference.md il manuale: strategia dalle ricerche, come si leggono le metriche, angoli per il pubblico di Rivolio, errori noti).
- Cosa fa: legge i numeri VERI del profilo (@valerio_alieri Business, insight via Composio: follower, reach, engagement, post migliori, orari attivi) + il digest della squadra; capisce cosa funziona (salvataggi/condivisioni/reach, non i like); scrive il PIANO EDITORIALE (kv `piano_editoriale`) che gli altri ruoli contenuti eseguono; aggiorna il cruscotto (kv `stratega_stato`); propone i cambi di bio/foto/pinned come bozze in attesa PIN.
- Comanda gli altri SOLO scrivendo il piano (non fa girare a mano le loro routine). E' il primo a girare al mattino: quando gli altri si svegliano, il piano c'e' gia'.
- Confini (regola 1): non pubblica, non cambia il profilo davvero, non manda DM/commenti. Osserva, decide, propone. Ogni cambio del mondo esterno passa dal PIN.
- Slug dashboard "stratega". kv posseduti: `piano_editoriale` (calendario/ordini), `stratega_stato` (cruscotto + proposte_profilo).
- Da attivare: integrazione dashboard (sezione Strategia + calendario) sul ramo dashboard; sessione "RIVO STRATEGA operative" creata da Valerio; routine agganciata dal builder (cadenza proposta: mattino presto prima del CAPO delle 8:30 + sera).

### Gli altri 3 ruoli contenuti (da costruire dopo, in ordine)
- **RIVO - CAROSELLI**: produce i post a scorrimento (guide, liste, passi pratici) che generano salvataggi. Legge il piano dello Stratega, prepara il carosello, lo consegna in dashboard per il PIN.
- **RIVO - PUBLISHER**: pubblica il pezzo approvato su Instagram Reels + TikTok + YouTube Shorts e lo ripubblica/riusa. In fase di test: si verifica che il tool "pubblica" esista e funzioni end-to-end, MA non si pubblica davvero (vincolo Valerio). TikTok collegato da Valerio come ultimo passo.
- **RIVO - COMMUNITY**: risponde a commenti e DM, presidia i primi 60 minuti dei post (la finestra che decide se un pezzo viene spinto). Tutto passa dalle regole di approvazione (niente risposte non approvate a freddo).

## 29/8 sera — Terzo pezzo della macchina contenuti: RIVO CAROSELLI
### RIVO - CAROSELLI (il creatore dei post a scorrimento)
- Skill: `.claude/skills/rivo-caroselli/` (SKILL.md + reference.md). Slug dashboard "caroselli".
- Cosa fa: legge il piano dello Stratega (kv piano_editoriale, pezzi assegnato_a=caroselli), progetta il carosello slide per slide (copertina che ferma il pollice, contenuto numerato, CTA soft), scrive la caption con hashtag, consegna nel kv `carosello_YYYY-MM-DD` in stato in_attesa. 5-8 slide, una idea per slide.
- Confini: non pubblica (PUBLISHER col PIN), non decide i temi (Stratega), non risponde ai commenti (Community), non inventa numeri. Consegna il contenuto perfetto delle slide + la direzione visiva; la resa in immagini vere e' del render del Publisher.
- Da attivare: integrazione dashboard (anteprima slide in Contenuti + PIN); sessione "RIVO CAROSELLI operative" creata da Valerio; routine agganciata dal builder (cadenza proposta: mattina, dopo lo Stratega). Attivazione insieme agli altri ruoli contenuti.
