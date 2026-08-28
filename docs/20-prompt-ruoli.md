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
