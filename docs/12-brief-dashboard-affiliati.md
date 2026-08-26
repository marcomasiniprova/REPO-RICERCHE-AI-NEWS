# 12 — Brief per la sessione DEV: Dashboard Affiliati (creator) di Rivolio

Questo file è il contesto + la specifica per l'altra sessione che sviluppa la web app rivolio.it. Serve a trasformare la sezione **Affiliati** (oggi spoglia) in una **vera dashboard** che traccia e gestisce i creator con la massima trasparenza.

## 1. Dove siamo (contesto business)
- Rivolio sta lanciando un programma di **affiliate marketing con creator travel italiani**. Li recluta via DM Instagram ed email.
- Al 26/8: decine di creator contattati, diversi in trattativa/caldi (Filippo 171k, Giusi 276k, Stefi, Julian, Vanessa, Nicolò, ecc.). I primi stanno per essere attivati.
- Un creator, **Stefi**, ha chiesto esplicitamente una **dashboard con controllo da ambo le parti** (lei vuole vedere in tempo reale pratiche e guadagni). È il motivo #1 di questo lavoro: la trasparenza è un nostro vantaggio competitivo.
- Il pagamento ai creator è **manuale** (per ora), ogni 15 giorni, su incassato consolidato.

## 2. Il modello economico (numeri veri, servono per i calcoli)
Fonte: docs/02-modello-collaborazione.md. Il cliente paga un prezzo FISSO, tiene il 100% del rimborso.
- **Commissione creator: 40% sul LORDO** che paga il cliente, su ogni pratica arrivata dal suo codice/link.
- **Bonus pratiche SINGOLE (€16,90):** €20 a quota 10, poi €50 ogni 25 (a 25, 50, 75...).
- **Bonus pratiche FAMILY (€29,90):** €50 ogni 10 (scala unica).
- **Bonus check:** €50 ogni 100 check portati (nessuna % sul singolo check).
- **Mini-ibrido (per big 100k+):** parte fissa €80 una tantum pagata alla PUBBLICAZIONE del primo contenuto, caso per caso, oltre al 40% + bonus. Alcuni big (Filippo, Giusi, Giada&Loris) trattano un fisso: gestire un campo "parte fissa" per creator, importo e stato (da pagare alla pubblicazione / pagato).
- **Costi che incidono (lato admin, per il margine):** Stripe Managed Payments ~5% + €0,25 a transazione; IVA 22% estratta dal lordo (la versa Stripe). Questi servono a calcolare il margine NETTO di Valerio, NON vanno mostrati al creator.
- **Pratica fallita:** il cliente riceve rimborso in CREDITI, non cash. Una pratica non consolidata NON matura commissione finché non è incassata.
- **Cadenza pagamenti creator:** ogni 15 giorni, solo su pratiche/check consolidati (dopo rimborsi/chargeback).

## 3. Stato attuale del pannello (sezione Affiliati)
Esiste già una base a rivolio.it/admin/affiliati:
- 3 stat in alto: "Da pagare in tutto", "Creator attivi", "Commissioni maturate" (oggi 0).
- Form "Nuovo creator": Codice (= codice sconto + coda link rivolio.it/?ref=CODICE), Nome, Sconto al cliente %, Commissione al creator %.
- Funzione "Creator gratis a vita" (account con check/pratiche illimitate gratis, per email).
- Stato vuoto: "Ancora nessun creator".
È una base: manca tutto il tracking e la gestione vera.

## 4. Cosa costruire (la dashboard vera)

### 4a. Vista ADMIN (Valerio) — deve tracciare tutto
Per ogni creator, una scheda con:
- Anagrafica: nome, @handle, email, codice/link ref, fascia follower, stato (in trattativa / attivo / in pausa / chiuso), data attivazione.
- Tipo deal: performance puro / ibrido (con importo parte fissa e stato pagamento fisso).
- **Risultati reali (dal suo codice/link):** click/traffico, iscritti, pratiche avviate, pratiche consolidate (incassate), n° singole vs family, check portati.
- **Soldi:** commissione 40% maturata (solo su consolidato), bonus maturati (calcolati con le regole sopra), parte fissa (se ibrido), TOTALE maturato, già pagato, **SALDO da pagare**.
- Storico pagamenti (data, importo, periodo) con bottone "segna come pagato".
- Note.
KPI aggregati in alto (veri, non finti): creator attivi, commissioni totali maturate, totale da pagare adesso, traffico totale dai creator, pratiche totali dai creator, (opz.) vendite dirette generate come alone.

### 4b. Vista CREATOR (quella che vuole Stefi) — trasparenza in tempo reale
Login del creator, vede SOLO i suoi dati:
- Pratiche arrivate dal suo link in tempo reale (avviate + consolidate).
- Quanto ha guadagnato finora (40% + bonus), prossimi bonus a portata ("ti mancano 2 family al prossimo +50€").
- Quanto gli verrà pagato e quando (prossima data pagamento).
- Il suo link e codice sconto, con i click.
- NON vede i margini interni di Valerio, IVA, Stripe: solo i SUOI numeri.

### 4c. Regole di calcolo (implementare esattamente)
- Commissione = 40% del lordo pagato dal cliente, solo su pratiche CONSOLIDATE.
- Bonus family/singole/check secondo le soglie del punto 2 (mai andare in negativo: sono già verificati profittevoli).
- Ibrido: parte fissa una tantum, maturata alla pubblicazione del primo contenuto.
- Tutto ciò che si mostra deve essere VERO e verificabile (niente stime). Se un dato non è disponibile, mostrarlo come "in attesa/da consolidare", non inventarlo.

## 5. Tracking tecnico (come collegare i risultati al creator)
- Link ref: rivolio.it/?ref=CODICE → salvare l'attribuzione (cookie/param) e legarla all'iscrizione e alle pratiche.
- Ogni pratica/check deve portarsi dietro il `creator`/`ref` di provenienza fino all'incasso, così i calcoli sono automatici.
- (C'è già l'idea di un `metadata.creator` lato Stripe: usarlo per l'attribuzione dei pagamenti.)

## 6. Priorità
La dashboard è importante e urgente: un creator vero (Stefi) la sta aspettando. Ideale: prima la vista admin che traccia tutto, poi la vista creator trasparente.
