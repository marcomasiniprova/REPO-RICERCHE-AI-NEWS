# GIULIA — Pacchetto completo del ruolo AI

> **Scopo di questo file.** È il pacchetto di handoff per creare/usare **Giulia**, il personaggio fisso di Rivolio, in un'altra sessione (o in un AI Agent). Contiene: chi è, come si comporta, i prompt pronti per le immagini reference, come funzionano le due skill (immagini e video), e il workflow passo-passo. È autosufficiente: chi apre questo file ha tutto.

---

## 1. Le due skill che compongono il ruolo

| Ruolo | Skill | Cosa fa | Come si lancia |
|---|---|---|---|
| **Immagini / caroselli** | `image-team` | Caroselli Instagram brandizzati, validati come un art director. GPT Image 2 su Kie, logo vero incollato in post, device fisso, struttura che converte. | `/image-team` o "fammi un carosello per Rivolio" |
| **Video UGC** | `video-team` | Video UGC iper-realistici con **Giulia** come personaggio fisso. 5 fasi: angolo → script → regia → generazione Kie → QA/pubblicazione. | `/video-team` o "fammi un video con Giulia" |

Entrambe girano su **Kie** (API immagini/video) e chiedono conferma prima di spendere crediti.

---

## 2. Giulia — identità (fonte: `skills/video-team/references/giulia.md`)

- Donna italiana, **24 anni**, content creator.
- **Viso:** lineamenti curati e armoniosi, sorriso sicuro e cordiale, sguardo diretto in camera.
- **Trucco:** professionale ma naturale, mai pesante.
- **Wardrobe fissa (per la coerenza):** casual elegante — maglione o camicia in tinta neutra/calda, niente eccessi. *Stesso outfit in tutte le reference.*
- **Capelli:** stessi in tutte le pose (taglio e colore invariati).
- **Ambiente ricorrente:** stanza luminosa, luce naturale morbida da finestra; pianta e libreria sfocate sullo sfondo.
- **Estetica:** UGC autentico, fotorealistico, colori caldi, come girato con la fotocamera frontale di uno smartphone.

## 3. Personalità e comportamento (default confermato)

**Amica energica e spigliata + grezza e autentica**, come una vera TikToker che intrattiene — non neutra, non "professionale da spot".
- Parla come a un'amica; l'energia sale sulle parole chiave.
- Gesti frequenti e **coerenti col tema** (nei video Rivolio: niente gesti da beauty a caso).
- **1-2 micro-imperfezioni per clip** (una risata, un "ehm", un respiro) → tolgono il sapore di AI.
- Mai finta, mai da telegiornale.
- Banca frasi ed easing dello sguardo completi in `skills/video-team/references/03-regia-realismo.md`.

> Per Rivolio (soldi/rimborsi) resta **energica**, ma il contenuto la rende credibile: parla di un diritto vero (Reg. CE 261/2004), non di fuffa.

## 4. Master reference & regole di coerenza del volto

- **File master:** `rivolio_influencer_2k.png` (GPT Image 2, 2K, 9:16) — nella cartella del progetto. È la fonte della coerenza del volto.
- Per image-to-video / image-to-image su Kie serve un **URL HTTPS pubblico**: i campi reference non accettano file locali. Gli URL temporanei di Kie **scadono in 24h** → prima di ogni sessione ricarica il PNG e usa un link fresco.
- **Regola d'oro:** cambia **una variabile per volta** (posa *O* luce *O* ambiente), mai tutto insieme, o il volto deriva.
- La reference è pulita: **niente telefono in mano**. Nei video è POV (la camera È il telefono, non si vede). Descrivere un telefono → glitch.

---

## 5. Il pacchetto reference — 8 pose (prompt pronti)

Tutte in **image-to-image** dal master (`rivolio_influencer_2k.png` caricato su URL pubblico Kie), **stessa faccia / capelli / outfit**, cambia solo posa + sfondo. Formato **9:16**. Modello `gpt-image-2-image-to-image`. Risoluzione: **2K (10 cr) consigliata** o 4K (16 cr).

**Regola comune da mettere in ogni prompt:** *"Keep the EXACT same woman from the reference image — identical face, hairstyle, makeup and outfit. Photorealistic UGC selfie look, warm natural light, shot on a smartphone front camera. Do NOT show any phone in frame. No text, no logo."*

### Set A — UGC (stanza luminosa / esterno città)
1. **Seduta parla in camera** — `Half-body, sitting in a bright room with soft window light, a plant and blurred bookshelf behind. She looks straight into the camera, warm confident smile, mid-gesture with one hand.`
2. **In piedi mezzo busto** — `Standing, half-body, same bright room, gesturing with both hands as if explaining something, lively natural posture.`
3. **Camminata in esterno** — `Walking outdoors on a sunny city sidewalk, blurred street background, natural daylight, casual confident stride, looking at camera.`
4. **Primo piano ravvicinato** — `Tight close-up of her face and shoulders, soft warm light, genuine relaxed smile, shallow depth of field.`

### Set B — Viaggio Rivolio (aeroporto / trolley)
5. **Seduta con trolley** — `Sitting in an airport lounge, a cabin trolley beside her, blurred gate and large windows behind, warm light, relaxed hopeful expression.`
6. **In piedi, aeroporto dietro** — `Standing half-body inside an airport terminal, blurred departure area and soft light behind, calm confident look at camera.`
7. **In piedi outdoor con valigia** — `Standing outside an airport entrance with her trolley, soft daylight, blurred building behind, natural relaxed posture.`
8. **Primo piano tema viaggio** — `Close-up near an airport window, cooler soft daylight, blurred airplanes in the far background, subtle relieved smile.`

> Con 80 crediti Kie: **5 pose in 4K** oppure **8 pose in 2K**. Per una libreria reference, 8 pose in 2K è la scelta migliore (più angoli, qualità già ottima).

---

## 6. Come usare il ruolo di Giulia in una nuova sessione

1. **Apri la sessione nel progetto Rivolio** (così il business è già nel contesto).
2. Per un **video**: lancia `video-team`. La skill legge Giulia da `giulia.md`, ricarica la master su URL pubblico, e segue le 5 fasi con approvazione a ogni passo.
3. Per un **carosello**: lancia `image-team`. Usa GPT Image 2, logo vero in overlay, device fisso.
4. **Le immagini reference (le 8 pose)** servono come:
   - master alternative per l'image-to-video (pose diverse = video diversi senza rigenerare il volto);
   - materiale per thumbnail, caroselli, profilo.
5. **Voce dei video:** default = audio nativo **Veo 3.1** (miglior italiano). Se stona, o con modelli non-Veo → genera muto + doppia (voce vera o ElevenLabs IT) + lip-sync.
6. **Disclosure obbligatoria:** Giulia è un avatar AI → in pubblicazione applica "Creato con AI" (EU AI Act art. 50(4)).

## 7. Note tecniche & legali

- **Kie API:** base `https://api.kie.ai/api/v1`; saldo `GET /chat/credit`; genera `POST /jobs/createTask` → poll `GET /jobs/recordInfo?taskId=`.
- **Prezzi immagini (GPT Image 2 su Kie):** 1K = 6 cr, 2K = 10 cr, 4K = 16 cr (1 cr ≈ €0,0046).
- **Upload reference:** `POST https://kieai.redpandaai.co/api/file-stream-upload` (multipart: file, uploadPath, fileName) → `downloadUrl` pubblico (scade 24h).
- **Chiave:** in `.env` del progetto (`KIE_API_KEY`), mai stamparla.
- **Disclosure AI** in ogni pubblicazione.

## 8. Stato attuale & prossimi passi

- ✅ Identità, comportamento, prompt, skill: pronti (questo file + skill aggiornate).
- ✅ **5 reference generate in 4K** (image-to-image dal master, volto identico verificato), nella cartella progetto:
  - `giulia_1.png` — casa, seduta, parla in camera (mezzo busto, gesto)
  - `giulia_2.png` — casa, in piedi ¾ busto, gesticola con due mani (jeans + maglione)
  - `giulia_3.png` — casa, primo piano ravvicinato
  - `giulia_4.png` — aeroporto, seduta in lounge con trolley (aereo dietro la vetrata)
  - `giulia_5.png` — aeroporto, in piedi in terminal luminoso
- ⏳ Pose mancanti dal set completo (se le vuoi in futuro): camminata esterno città, outdoor con valigia, primo piano tema viaggio.
- Crediti Kie: **0** (usati 80). Per altre pose o video, ricarica.
