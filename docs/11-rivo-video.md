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

## Decisioni bloccate (25/8)
- **Motore**: ENTRAMBI, Higgsfield MCP (coerenza Giulia via Soul ID) + Kie.ai API (volume/costo).
- **Piattaforme**: tutte e 4, IG + TikTok + YouTube Shorts + Facebook (Valerio collega TikTok).
- **Cadenza**: 1 video al giorno, fatto top.
- **Angolo**: MIX educativo (diritti EU261) + storie/testimonianze, per non essere ripetitivi.

## Banca idee iniziale (mix, veritiere, tono Giulia)
Educativo:
1. "Se ti hanno cancellato il volo non hai perso solo la vacanza. Puoi avere diritto fino a 600€." → spiega EU261 in 2 frasi → "controlla gratis se ti spettano".
2. "3 ore di ritardo all'arrivo? La compagnia potrebbe doverti dei soldi, e spera che tu non lo sappia."
3. "Ti hanno detto 'circostanza eccezionale'? Spesso un guasto tecnico non lo è. Non fermarti al primo no."
4. "Non è il rimborso del biglietto. È un compenso IN PIÙ che ti spetta per legge, se hai i requisiti."
5. "Hai buttato la carta d'imbarco? Tienila: può servirti per chiedere il rimborso."
Storie/testimonianze:
6. "Bloccato 4 ore in aeroporto, incazzato. Poi ho scoperto che potevo chiedere un compenso."
7. "Mia sorella non sapeva di avere diritto a un rimborso per il suo volo. Spoiler: ce l'aveva."
8. "Volo cancellato all'ultimo. Invece di arrendermi, ho controllato in 2 minuti se mi spettava qualcosa."

Regola su ogni script: hook nei primi 2 secondi, una sola idea, CTA soft ("controlla gratis"), SEMPRE il condizionale ("puoi", "se hai i requisiti"), mai promesse certe di cifre.

## Stato
- 25/8/2026: playbook + decisioni + banca idee pronti. BLOCCATO in attesa di: (1) collegamento Higgsfield MCP, (2) API key Kie.ai in env, (3) connettore TikTok, (4) asset di Giulia (immagine di riferimento + video di test). Appena ci sono, creo la routine "RIVO - VIDEO" (1/giorno) e si collauda: primi video approvati da Valerio, poi autonomia.

## Correzioni di Valerio (memoria di addestramento)
(si riempie con le sue note su Giulia, tono, stile video)
