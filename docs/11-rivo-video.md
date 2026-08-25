# 11 — RIVO - VIDEO (macchina di contenuti con avatar AI)

Ruolo: produrre e pubblicare ogni giorno video short-form per Rivolio con un personaggio fisso (Giulia), su tutte le piattaforme, in automatico. Obiettivo: traffico organico + brand su TikTok/Reels/Shorts/Facebook. Canale #1 per ROI di contenuto nel 2026.

## Il personaggio: Giulia
- Volto e voce FISSI di Rivolio (avatar AI). Coerente in ogni video (stessa persona, riconoscibile).
- Tono: ragazza italiana, calda, competente ma alla mano. Spiega i diritti dei viaggiatori come un'amica che ne sa.
- Coerenza tecnica: Higgsfield Soul ID oppure immagine di riferimento fissa in image-to-video.

## Lo stack (ricerca 25/8/2026)
- **Generazione**: Kie.ai (una API, 30+ modelli: Veo 3.1, Seedance 2.0, Kling 3.0; webhook, image-to-video, pay-per-second) OPPURE Higgsfield (Soul ID per coerenza personaggio, LipSync, connettore MCP per Claude, da $15/mese).
- **Modelli**: Veo 3.1 = il più realistico; Seedance 2.0 = personaggi coerenti + audio nativo.
- **Pubblicazione**: Instagram, YouTube Shorts, Facebook via Composio. TikTok = manca il connettore (da aggiungere).

## La pipeline (ogni video)
1. IDEA: angolo dai diritti EU261 o storia ("volo cancellato e non lo sapevi?").
2. COPIONE: hook nei primi 2 secondi, 8-15 sec, una sola idea, CTA soft. SEMPRE veritiero.
3. VIDEO: image-to-video da Giulia (coerente). LipSync se parla.
4. CAPTION + HASHTAG: cuciti per piattaforma.
5. AUTO-POST: IG + YT Shorts + FB (+ TikTok quando collegato).
6. TRACKING: salvare in Airtable (tabella Video) data, piattaforma, angolo, view/like, cosa ha funzionato.

## Regole ferree (dal CLAUDE.md)
- MAI numeri inventati o promesse gonfiate. "Fino a 600€ se hai i requisiti", mai "ti diamo 600€".
- MAI trattino lungo. Copy umano (playbook docs/08).
- Segreti (API key Kie/Higgsfield) SOLO in variabili d'ambiente, MAI nel repo (regola 8).
- Niente pubblicato senza OK di Valerio finché non è addestrato e promosso (come RIVO - REDDIT).

## Cosa serve per accendere (dipendenze)
1. Collegare il motore: connettore Higgsfield MCP (consigliato) oppure API key Kie.ai in env.
2. Asset di Giulia: immagine di riferimento del personaggio + video di test.
3. (Per TikTok) collegare un connettore TikTok.
4. Decidere: piattaforme, cadenza (video/giorno), angolo, budget crediti.

## Stato
- 25/8/2026: playbook creato. In attesa di: collegamento motore video + asset Giulia + decisioni (popup). Poi si costruisce e si collauda come RIVO - REDDIT (bozze approvate prima di andare in autonomia).

## Correzioni di Valerio (memoria di addestramento)
(si riempie con le sue note su Giulia, tono, stile video)
