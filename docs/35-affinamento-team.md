# 35 - Affinare il team: configurazione degli agenti (PIANO, in attesa del tuo OK)

Questo e' il piano per portare il Growth RIVO Team al livello successivo: non piu' agenti "liberi senza configurazione", ma ogni ruolo calibrato al massimo. Prima leggi, poi mi dai l'OK (anche punto per punto), poi implemento. Niente parte finche' non dici sì.

Sei d'accordo con la visione: siamo nel 2026, il team fa il middle work, tu fai solo le poche decisioni che contano. Concordo. Ma per farlo bene bisogna sapere DOVE vive la configurazione, perche' non tutto lo posso toccare io.

---

## 1. Dove vive la configurazione (i 3 livelli) - la cosa piu' importante da capire

**Livello A - REPO (lo tocco io, e i ruoli lo leggono a ogni giro).**
I ruoli, a ogni fire, fanno `git pull origin main` prima di partire. Quindi tutto quello che sta nel repo (`.claude/settings.json`, `CLAUDE.md`, le skill, gli hook) arriva a TUTTI i ruoli automaticamente, senza che tu tocchi niente. Qui posso agire io e vale per tutti.

**Livello B - SESSIONE / ROUTINE (lo imposti tu, io no).**
Il MODELLO di ogni ruolo, i tool consentiti e il PROMPT della routine sono legati alla sessione operativa a cui la routine e' agganciata. Verificato sul campo: **non posso cambiare il prompt ne' il modello delle TUE sessioni** (il sistema me lo rifiuta, "not your own session"). Queste cose le imposti tu quando crei o riconfiguri la sessione. Io ti preparo le istruzioni esatte, ma il click finale e' tuo. Cron e on/off invece li posso gestire io (infatti ho appena spento/riacceso i ruoli).

**Livello C - AMBIENTE (gia' fatto).**
Le variabili d'ambiente (chiavi API), la rete, il container cloud: gia' configurati su Railway e nell'ambiente CCR. Non si tocca.

> Regola d'oro: quello che deve valere per tutti e cambiare spesso va nel REPO. Il modello per ruolo, che e' la leva costi/qualita' piu' forte, purtroppo passa da te (livello B). Te lo rendo il piu' semplice possibile.

---

## 2. Cosa propongo, punto per punto

### A. Autocompact per sessione (tu volevi "200k token")

Onesta' tecnica: in Claude Code il taglio del contesto non si imposta come numero secco di token, ma come **frazione della finestra** (`autoCompactWindow`, es. 0.8 = taglia quando il contesto e' pieno all'80%). La finestra dei modelli che usiamo e' 200k token. Quindi "compatta a 200k" vorrebbe dire "quando e' pieno al 100%": troppo tardi.

Cosa faccio davvero (repo-side, vale per tutti):
- `autoCompactEnabled: true`
- `autoCompactWindow: 0.8` cioe' compatta intorno ai ~160k token, prima di rischiare di riempire la finestra.

Se domani passiamo a un modello con finestra piu' grande (1M), allora 0.2 = ~200k netti e ti do davvero i "200k" che chiedevi. Per ora 0.8 e' la scelta sana. Dimmi se ti va o se preferisci un taglio piu' aggressivo (0.7).

Nota: i nostri giri sono corti (aprono, lavorano, chiudono col run_finish), quindi raramente arrivano a compattare. E' rete di sicurezza, non un costo.

### B. Output conciso in tutto il team (taglia costi e velocizza)

Repo-side aggiungo uno stile di output "operativo": niente preamboli, niente spiegoni, va dritto al lavoro e al run_finish. Meno token buttati = meno costo Claude e giri piu' rapidi. Vale per tutti i ruoli, che restano comunque ultra-umani nei CONTENUTI (regola 4): lo stile conciso e' per il loro modo di ragionare/loggare, non per le caption al pubblico.

### C. Mappa MODELLO per ruolo (la leva costi/qualita' piu' forte)

Oggi girano tutti sullo stesso modello di default. Spreco: un ruolo che legge e innesca non ha bisogno dello stesso cervello di chi scrive la strategia. Proposta:

| Ruolo | Modello proposto | Perche' |
|---|---|---|
| STRATEGA | forte (Opus) | e' il cervello: decide il piano su cui lavorano tutti |
| VIDEO | forte (Opus) | script e regia creativa, angoli, hook |
| CAROSELLI | forte (Opus) | copy e design delle slide, converte |
| CRO | forte (Opus) | analisi funnel e ipotesi di test, alto impatto |
| SEO | medio (Sonnet) | articoli lunghi ma piu' meccanici, ottimo rapporto qualita'/costo |
| IG e Email | medio (Sonnet) | messaggi personalizzati ai creator: qualita' serve, ma e' ripetitivo |
| REDDIT | medio (Sonnet) | commenti di valore, volume, va bene un modello agile |
| COMMUNITY | medio (Sonnet) | risposte a commenti/DM, tono umano ma compiti circoscritti |
| TREND-SCOUT | leggero (Haiku) | radar: cerca, filtra, passa munizioni. Lavoro meccanico |
| SCOUT | leggero (Haiku) | trova profili e li carica in CRM: meccanico |
| PUBLISHER (Distribuzione) | leggero (Haiku) | innesca il backend e tira giu' i numeri: quasi zero ragionamento |

Effetto: paghi il cervello grosso solo dove sposta i risultati, i ruoli meccanici costano una frazione e vanno piu' veloci. Questa mappa la applichi TU quando (ri)configuri ogni sessione: io ti scrivo il come, riga per riga, ruolo per ruolo. Se preferisci, in fase di implementazione provo io a settare il modello via routine e ti dico subito quali accetta e quali no (le sessioni persistenti spesso vanno ricreate da te).

### D. Le 3 regole ferree rese MECCANICHE via hook (non piu' affidate alla memoria del modello)

Oggi le regole vivono nelle skill: il modello le legge e le rispetta. Funziona, ma "si fida". Con gli hook diventano imposte dal sistema. Repo-side, in `.claude/hooks/`:

1. **Blocco invii/pubblicazioni senza PIN (regola 1) - PreToolUse.**
   Un hook che intercetta le azioni verso l'esterno (email, DM, post) e le blocca se non c'e' il via libera. E' la rete di sicurezza numero uno: anche se un domani un modello "sbrocca", il sistema non lo lascia pubblicare. Con l'eccezione scritta gia' prevista (commenti Reddit di puro valore).

2. **Git pull garantito a inizio giro - SessionStart.**
   Un hook che assicura repo fresco e skill aggiornate a ogni fire. Cosi' un ruolo non lavora mai su una versione vecchia.

3. **run_finish garantito a fine giro - Stop.**
   Un hook che, se il ruolo sta chiudendo senza aver registrato l'esito, lo ricorda / lo forza. Cosi' la dashboard ha sempre il polso di ogni giro (niente giri "muti").

Onesta': gli hook nel cloud CCR vanno collaudati (l'ambiente cloud ha un suo classificatore che gia' blocca molte azioni esterne, per quello pubblichiamo dal backend). Li implemento con prudenza e li provo su un ruolo prima di estenderli a tutti. Se un hook desse noia, si toglie in un secondo.

### E. Segreti blindati a livello di sistema (regola 8) - permissions.deny

Aggiungo un `deny` che impedisce ai ruoli di leggere/stampare file sensibili e di committare chiavi. Le chiavi restano solo in env. Difesa in profondita' sulla regola 8.

### F. Tool scoping per ruolo (meno errori, piu' sicurezza)

Oggi tutti i ruoli hanno la stessa cassetta degli attrezzi larghissima. Un ruolo che non pubblica non ha bisogno dei tool di pubblicazione. Restringere la cassetta per ruolo = meno modi di sbagliare e giri piu' puliti. Questo pero' e' livello B (sta nella config della sessione): te lo preparo come proposta ruolo per ruolo, decidi tu se stringere.

---

## 3. Chi tocca cosa (tabella onesta)

| Intervento | Livello | Chi lo fa |
|---|---|---|
| Autocompact 0.8 | A - repo | io |
| Output conciso | A - repo | io |
| Hook PIN / git pull / run_finish | A - repo | io (con collaudo) |
| Deny segreti | A - repo | io |
| Modello per ruolo | B - sessione | tu (io ti guido riga per riga) |
| Tool scoping per ruolo | B - sessione | tu (io preparo la proposta) |
| Cron e on/off dei ruoli | routine | io |

---

## 4. Rischi e limiti (te li dico chiari, regola 12)

- **Non posso cambiare il modello delle tue sessioni da solo.** E' la cosa piu' preziosa (i costi) ma passa da te. Te la rendo un copia-incolla.
- **Gli hook nel cloud vanno collaudati.** Non li do per scontati: li provo su un ruolo, poi estendo.
- **La config repo-side prende effetto quando arriva su `main`** (i ruoli fanno pull da main). Quindi al momento dell'OK decidiamo insieme se andare dritti su main o passare da un branch e merge.
- **Niente stravolgimenti dei ruoli.** Qui affiniamo la CONFIGURAZIONE, non ridefiniamo cosa fa ognuno. Le skill restano quelle.

---

## 5. Prossimo passo

Dimmi OK (tutto, o punto per punto: A, B, C, D, E, F). Appena confermi:
1. Implemento subito A, B, E (repo-side sicuri).
2. Implemento D con collaudo su un ruolo, poi estendo.
3. Ti consegno la guida copia-incolla per C e F (modello e tool per ruolo), che applichi tu.

Stato attuale del team: attivi solo **IG-Email, Scout, Reddit**. Gli altri 8 restano in pausa finche' non dici tu (l'affinamento lo prepariamo mentre sono fermi, cosi' quando li riaccendi partono gia' calibrati).
