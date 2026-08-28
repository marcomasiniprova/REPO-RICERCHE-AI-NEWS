# 04 — Operatore Kie (generazione)

Modello di default: **Veo 3.1** (top realismo + audio italiano nativo). Video **image-to-video** partendo da una foto reference di Giulia.

## Regole prima di generare
1. **Verifica lo slug/endpoint esatto sui docs di Kie PRIMA di chiamare** (Kie cambia gli slug). Veo ha spesso endpoint dedicati.
2. **Ri-carica la reference di Giulia su URL pubblico fresco.** I campi reference NON accettano file locali, e gli URL temporanei di Kie **scadono in 24h**: non riusare un vecchio link.
3. **Mostra crediti + euro della combinazione e fatti confermare.** Generazione fallita = 0 crediti.

## API Kie (base)
- Base: `https://api.kie.ai/api/v1`
- Saldo: `GET /chat/credit` → `data` = crediti. (1 cr ≈ €0,0046)
- **Veo (flusso dedicato):** `POST /veo/generate` → poll `GET /veo/record-info?taskId=...` (pronto quando `successFlag: 1`). *Verifica campi esatti sui docs prima dell'uso.*
- Header: `Authorization: Bearer <KIE_API_KEY>` (dal `.env`, mai stamparla), `Content-Type: application/json`.

## Upload della reference (per l'URL pubblico)
`POST https://kieai.redpandaai.co/api/file-stream-upload` (multipart: `file`, `uploadPath`, `fileName`) → risposta con `downloadUrl` pubblico (scade 24h). Usa quell'URL nel campo reference del video (es. `reference_image_urls` / `imageUrls` — verifica il nome esatto sui docs Veo).

## Parametri tipici Veo 3.1
- `prompt`: il prompt di regia lungo (vedi `03-regia-realismo.md`).
- reference image (URL pubblico della foto di Giulia scelta).
- durata: **puntare a ~15-25s** (se Veo genera clip più corte, valuta 2 segmenti + montaggio, oppure una singola clip alla durata max supportata — conferma con Valerio).
- aspetto: **9:16**.
- audio: nativo attivo (italiano).

## Estrazione del risultato
Il record di risposta può contenere anche l'URL della reference in input → **prendi l'URL del risultato dal campo output** (es. `resultUrls` / `resultJson`), non il primo URL che trovi. Scarica il video e consegnalo.

## Se l'audio IT stona
Default = prova l'audio nativo Veo. Se all'ascolto una parola è storpiata o l'italiano non convince:
- riscrivi la parola problematica nello script (sinonimo semplice), **oppure**
- genera **muto** e doppia in post (voce vera o ElevenLabs IT) + lip-sync.
Per modelli diversi da Veo (es. Seedance) l'audio IT nativo NON è affidabile → sempre muto + doppiaggio.

## Costi (ordine di grandezza)
Veo 3.1 è tra i modelli più cari su Kie. Calcola sempre i crediti esatti della durata scelta **prima** di generare e mostrali. Se i crediti non bastano per la durata piena, proponi a Valerio: durata più corta o ricarica.
