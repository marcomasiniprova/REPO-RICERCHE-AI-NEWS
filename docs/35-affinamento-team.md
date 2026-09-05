# 35 - Affinare il team: configurazione degli agenti (IMPLEMENTATO il 5/9)

Come abbiamo portato il Growth RIVO Team al livello successivo: non piu' agenti "liberi senza configurazione", ma ogni ruolo calibrato. Valerio ha approvato per popup (autocompact 200k, efficienza processi su tutte le skill, hook git-pull + run_finish, deny segreti, PIN -> approvazione ovunque, mappa modelli Sonnet/Opus, tool scoping opzionale) e le parti repo-side sono su `main`. Le parti a livello sessione (modelli, tool) le applica Valerio.

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

### A. Autocompact per sessione a 200k token [FATTO, repo-side]

Verificato online: Valerio aveva ragione. In Claude Code `autoCompactWindow` accetta un **valore in token assoluti** (da 100K a 1M), e i modelli che usiamo (Opus 4.6+ e Sonnet con `[1m]`) hanno la **finestra da 1M token**. Il default compatta intorno al 95% (~950k su 1M): troppo tardi, la sessione e' gia' sporca e brucia token.

Fatto in `.claude/settings.json` (vale per tutti):
- `autoCompactEnabled: true`
- `autoCompactWindow: 200000` (taglia a 200k, tiene i giri puliti ed economici).

### B. Passata di EFFICIENZA sui processi [FATTO sulle skill]

Chiarito da Valerio: non e' "output conciso" (lui non legge le sessioni), e' **efficienza dei processi**. Obiettivo: giri piu' veloci ed economici, tagliando comandi inutili/lunghi, passaggi macchinosi e round-trip ridondanti, SENZA toccare la qualita' del lavoro finale.

Fatto: passata conservativa su tutte le 13 skill (SKILL.md + reference). Regola d'oro applicata: nel dubbio si lascia com'e', meglio non rompere un giro che funziona. Le limature vere trovate finora: eliminata una GET ridondante nello Stratega (dato gia' presente nel digest). La maggior parte dei giri era gia' snella (una sola GET al digest, passi non duplicati), quindi pochi tagli sicuri: e' un bene, vuol dire che i processi erano gia' puliti.

### C. Mappa MODELLO per ruolo (la leva costi/qualita' piu' forte)

Oggi girano tutti sullo stesso modello di default. Spreco: un ruolo che legge e innesca non ha bisogno dello stesso cervello di chi scrive la strategia. Proposta:

Deciso da Valerio: solo **Sonnet e Opus**, niente Haiku (tiene alla qualita' del cervello degli agenti). Opus sui ruoli creativi/strategici, Sonnet su quelli piu' operativi ma comunque intelligenti.

| Ruolo | Modello | Perche' |
|---|---|---|
| STRATEGA | Opus | e' il cervello: decide il piano su cui lavorano tutti |
| VIDEO | Opus | script e regia creativa, angoli, hook |
| CAROSELLI | Opus | copy e design delle slide, converte |
| CRO | Opus | analisi funnel e ipotesi di test, alto impatto |
| SEO | Sonnet | articoli lunghi ottimizzati, ottimo rapporto qualita'/costo |
| IG e Email | Sonnet | messaggi personalizzati ai creator, qualita' alta ma piu' ripetitivo |
| REDDIT | Sonnet | commenti di valore a volume, va bene un modello agile ma bravo |
| COMMUNITY | Sonnet | risposte a commenti/DM, tono umano, compiti circoscritti |
| TREND-SCOUT | Sonnet | radar: cerca, filtra, passa munizioni |
| SCOUT | Sonnet | trova profili e li carica in CRM |
| PUBLISHER (Distribuzione) | Sonnet | innesca il backend e tira giu' i numeri |

Effetto: Opus dove nasce la qualita' che sposta i risultati, Sonnet dove il lavoro e' piu' operativo (costa meno e va piu' veloce, restando bravo). Se ne occupa Valerio quando (ri)configura ogni sessione. Nota tecnica: le routine sono agganciate a sessioni persistenti, quindi il modello si fissa alla creazione/riconfigurazione della sessione (non lo posso cambiare io dalla routine).

### D. Due hook che rendono i giri affidabili [FATTO, repo-side]

Deciso da Valerio: solo i due hook che rendono i giri affidabili, senza aggiungere config di troppo (il blocco pubblicazioni via hook e' stato scartato: l'approvazione in dashboard e il backend gia' coprono quel fronte). In `.claude/hooks/`:

1. **SessionStart - `session-start.sh`.** Garantisce il repo fresco (skill aggiornate) a inizio giro. NO-OP sicuro: agisce solo se la sessione e' su `main` con working tree pulita, quindi non tocca mai la sessione builder. `git pull --ff-only`, niente merge mess.

2. **Stop - `stop-run-finish.sh`.** Se un giro di ruolo ha aperto il lavoro (run_start) ma non lo ha chiuso (run_finish), ricorda di registrare l'esito prima di fermarsi, cosi' la dashboard ha sempre il polso del giro. Robustezza: conta solo le chiamate VERE (tool_use Bash che contiene il token), non le menzioni nel testo della skill, e ha il guard anti-loop. Collaudato in locale su transcript finti: blocca il giro-ruolo non chiuso, ignora la sessione builder e i giri gia' completi.

Attivi via `.claude/settings.json` (blocco `hooks`).

### E. Segreti blindati a livello di sistema (regola 8) [FATTO, repo-side]

In `.claude/settings.json`, blocco `permissions.deny`: i ruoli non possono leggere file sensibili (`.env`, `*.pem`, chiavi ssh, `credentials.json`, file `*secret*`). Le chiavi restano solo in env, mai lette da file. Difesa in profondita' sulla regola 8. NON tocca l'uso normale delle chiavi via variabili d'ambiente (che e' come i ruoli le usano davvero).

### F. Tool scoping per ruolo [PROPOSTA, la applichi tu]

Oggi ogni sessione ruolo ha la stessa cassetta attrezzi larghissima (inclusi Write/Edit/MultiEdit/NotebookEdit e Task per creare sotto-agenti). Onesta': la maggior parte dei tool serve (Bash per le curl, Read, Skill, WebFetch/WebSearch, i connettori Composio/Airtable), quindi il guadagno di stringere e' modesto e va fatto con cautela per non rompere pattern utili (es. un file temporaneo per una curl grossa).

Proposta conservativa, da applicare quando (ri)configuri le sessioni:
- **Togliere `Task`**: nessun ruolo deve creare sotto-agenti a raffica (controllo costi, evita fan-out accidentali).
- **Togliere `NotebookEdit`**: mai usato dai ruoli.
- **Valutare (non obbligatorio) togliere `Edit`/`MultiEdit`**: i ruoli non modificano i file del repo (regola "mai committare/pushare"). Lasciare `Write` (serve per file temporanei dei payload curl). Se un ruolo non scrive nemmeno file temporanei, si puo' togliere anche `Write`.

Guadagno: meno modi di sbagliare, giri piu' puliti. Ma e' un extra, non una priorita': se preferisci lasciare com'e', va bene. Decidi tu.

---

## 3. Chi tocca cosa (tabella onesta)

| Intervento | Livello | Chi lo fa | Stato |
|---|---|---|---|
| Autocompact 200k | A - repo | io | FATTO |
| Efficienza processi (skill) | A - repo | io | FATTO |
| Hook git pull + run_finish | A - repo | io (collaudati) | FATTO |
| Deny segreti | A - repo | io | FATTO |
| PIN -> approvazione (CLAUDE.md + skill) | A - repo | io | FATTO |
| Modello per ruolo (Sonnet/Opus) | B - sessione | tu | da applicare |
| Tool scoping per ruolo | B - sessione | tu | proposta, opzionale |
| Cron e on/off dei ruoli | routine | io | gestito |

---

## 4. Rischi e limiti (te li dico chiari, regola 12)

- **Il modello per ruolo non lo posso cambiare io.** Le routine sono agganciate a sessioni persistenti: il modello si fissa quando (ri)crei la sessione. Passa da te.
- **La config repo-side prende effetto quando i ruoli fanno pull da `main`.** E' su main: al prossimo giro e' attiva. I ruoli in pausa la prendono quando li riaccendi.
- **Efficienza = limatura, non stravolgimento.** Le skill restano quelle: ho solo tolto due round-trip ridondanti (una GET nello Stratega, una GET doppia nel Community) e convertito la terminologia. Cosa fa ogni ruolo e cosa produce non e' cambiato.

---

## 5. Stato finale

FATTO e su `main`: autocompact 200k, hook git-pull + run_finish (collaudati), deny segreti, PIN -> approvazione ovunque (CLAUDE.md + tutte le skill, zero "PIN" residuo), limatura efficienza sulle skill.

DA FARE TU quando vuoi: impostare Sonnet/Opus per ruolo alla (ri)configurazione delle sessioni (mappa nel punto C); eventuale tool scoping (punto F, opzionale).

Stato del team: attivi solo **IG-Email, Scout, Reddit**. Gli altri 8 in pausa: l'affinamento e' pronto, quando li riaccendi partono gia' calibrati.
