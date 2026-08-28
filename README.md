# RivoVideo — il tuo agente video

Cartella-agente autosufficiente: gestisce **Giulia** e produce **1 video UGC al giorno** per Rivolio, pronto per TikTok, Instagram Reels e YouTube Shorts. Crescita organica.

## Cosa c'è dentro
```
RivoVideo/
  SKILL.md                     ← il ruolo/agente (leggi questo per primo)
  GIULIA_pacchetto_ruolo_AI.md ← scheda completa di Giulia (handoff)
  references/
    00-giulia.md               ← bibbia del personaggio (identità, gesti, wardrobe lock)
    01-angoli-hook.md          ← angoli Rivolio + scienza dell'hook (3 secondi)
    02-script-copy.md          ← struttura script, italiano umano
    03-regia-realismo.md       ← IL CUORE: micro-espressioni, gesti umani, feel iPhone
    04-kie-tecnico.md          ← Veo 3.1 su Kie, image-to-video, crediti
    05-pubblicazione.md        ← flusso semi-auto + disclosure AI
    06-routine-giornaliera.md  ← il loop esatto che gira ogni giorno
  assets/giulia/               ← master + 5 foto reference 4K di Giulia
```

## Come si usa
- **A mano:** apri una sessione in questa cartella e di' "RivoVideo, fammi il video di oggi". L'agente segue `SKILL.md`.
- **In automatico (routine quotidiana):** crea uno scheduled task / routine che ogni giorno apre una sessione dedicata in questa cartella con il prompt: *"Esegui RivoVideo: produci il video del giorno seguendo SKILL.md, poi fermati e aspetta il mio OK prima di pubblicare."*
  - Il posting è **semi-auto**: l'agente prepara tutto e aspetta il tuo sì (così non finisce online un video sbagliato).

## Prerequisiti
- **Crediti Kie** (l'agente non genera senza; li ricarichi tu).
- **Account social connessi** per la pubblicazione (Composio: TikTok, Instagram, YouTube). Se non connessi, l'agente prepara il video e te lo lascia da postare a mano.
- Chiave `KIE_API_KEY` nel `.env` del progetto.

## Config attuale
Semi-auto · Veo 3.1 · UGC 15-25s 9:16 · stesso video su TikTok+Reels+Shorts · mix educativo + smonta-miti.
