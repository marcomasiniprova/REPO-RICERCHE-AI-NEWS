# 06 — Routine giornaliera (il loop)

Questo è il giro esatto che RivoVideo esegue **ogni giorno**. Pensato per girare via scheduled task in una sessione dedicata aperta in questa cartella.

## Prompt di avvio (per lo scheduled task)
> "Esegui RivoVideo: produci il video del giorno seguendo `SKILL.md`. Fermati ai checkpoint e aspetta il mio OK prima di pubblicare."

## Il loop (con checkpoint)

**0. Saldo & preparazione**
- `GET /api/v1/chat/credit` → mostra crediti (~€). Se non bastano per un video Veo, avvisa e fermati.
- Leggi qual è stato l'**ultimo angolo** usato (vedi "Diario" sotto) per alternare.

**1. Angolo del giorno** (`01-angoli-hook.md`)
- Alterna **Educativo ↔ Smonta-miti** rispetto a ieri.
- Scegli il tema e la foto reference di Giulia adatta (casa vs aeroporto).
- → **Checkpoint:** mostra angolo + 3 hook, Valerio valida/sceglie.

**2. Script** (`02-script-copy.md`)
- Scrivi lo script 15-25s (Hook→Problema→Soluzione→CTA), italiano umano.
- → **Checkpoint:** Valerio approva lo script.

**3. Regia** (`03-regia-realismo.md` + `00-giulia.md`)
- Costruisci il prompt Veo 3.1 lungo (tutti i blocchi: micro-espressioni, gesti coerenti, feel iPhone, continuità, banca frasi).
- → **Checkpoint:** Valerio approva prompt + foto di partenza PRIMA di spendere crediti.

**4. Generazione** (`04-kie-tecnico.md`)
- Ri-carica la reference di Giulia su URL pubblico fresco.
- Ricontrolla saldo, **calcola e mostra i crediti** della durata scelta, **fatti confermare**.
- Genera (Veo 3.1), scarica il video. Se serve, doppiaggio + lip-sync.

**5. QA + Pubblicazione** (`05-pubblicazione.md`)
- Passa la checklist QA. Se un punto è NO, torna indietro.
- Prepara 3 caption + disclosure AI.
- → **Checkpoint pubblicazione:** mostra video + caption + piattaforme, **aspetta l'OK**, poi pubblica su TikTok + Reels + Shorts via Composio.

## Diario (traccia per non ripeterti)
Tieni una riga per giorno in `assets/diario.md` (crealo se non c'è):
`YYYY-MM-DD | angolo (edu/mito) | tema | hook scelto | pubblicato sì/no`
Serve a: alternare gli angoli, non ripetere hook, e sapere cosa è già uscito.

## Principi
- **Un video al giorno, fatto bene.** Se non convince, sistema, non pubblicare tanto per.
- **Mai spendere crediti o pubblicare senza conferma.**
- **Ultra-realismo** è la priorità numero uno: se il video "sa di AI", riparti dalla regia.
