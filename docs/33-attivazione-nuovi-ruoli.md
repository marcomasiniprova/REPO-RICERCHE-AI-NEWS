# Attivare i 3 nuovi ruoli: Trend-scout, SEO, CRO

Le skill sono pronte nel repo e i ruoli sono nel seed della dashboard. Per farli girare servono 3 sessioni operative (le crea Valerio) + le routine (le cabla il builder). Questi 3 ruoli NON hanno bisogno di connettori speciali (niente Composio/Zernio): usano web (ricerca), l'API della dashboard e le chiavi d'ambiente. Quindi la sessione e' "liscia".

## Cosa fa Valerio (creare le 3 sessioni)
Nell'app Claude Code (web), crea 3 nuove sessioni operative sull'ambiente del team (lo stesso degli altri ruoli), una per ruolo. Nome consigliato (per riconoscerle):
- **RIVO TREND-SCOUT operative**
- **RIVO SEO operative**
- **RIVO CRO operative**

Non serve collegare Instagram/Gmail/Zernio a queste sessioni. Basta che siano sull'ambiente giusto (quello con KIE_API_KEY e le altre variabili gia' impostate) e che partano dal repo.

## Cosa fa il builder (cablare le routine)
Una volta create le 3 sessioni, il builder:
1. Recupera i loro `persistent_session_id`.
2. Crea 3 routine (una per ruolo) col prompt standard che: fa `git pull origin main`, carica la skill del ruolo (`rivo-trend-scout` / `rivo-seo` / `rivo-cro`), passa l'INGEST_KEY, ed esegue il giro.
3. Orari consigliati (ora IT):
   - **Trend-scout:** ogni mattina ~6:30, PRIMA dello Stratega (cosi' il radar entra nel piano).
   - **SEO:** ogni giorno ~10:00 (un pezzo forte al giorno).
   - **CRO:** ~11:00, un paio di volte a settimana o al giorno (analisi conversione).

## Nota
Finche' le sessioni non esistono, le pagine /trend, /seo, /cro in dashboard restano vuote (empty state "da attivare") e i ruoli compaiono nella squadra come "da attivare". Appena girano, si popolano da soli.
