# RIVO VIDEO: protocollo dashboard ed errori da non ripetere

Questo file completa SKILL.md: come i tuoi video vivono nella dashboard e le lezioni fissate dal builder. I manuali creativi (Giulia, hook, script, regia, Kie, pubblicazione) sono in `references/`.

## PARTE 1: lo schema del video nel kv

Ogni video e' UNA chiave kv: `video_YYYY-MM-DD` (data italiana del giorno di produzione). Valore JSON:

```json
{
  "date": "2026-08-29",
  "angolo": "edu",              // "edu" oppure "mito"
  "tema": "Overbooking: e' un tuo diritto",
  "hook": "il testo dell'hook scelto",
  "script": "lo script completo parlato",
  "reference_foto": "giulia_4",
  "video_url": "https://... (URL del risultato Kie, campo output)",
  "duration_s": 18,
  "crediti_spesi": 0,
  "caption_tiktok": "...",
  "caption_ig": "...",
  "caption_youtube": "titolo + descrizione breve",
  "stato": "in_attesa",         // in_attesa | approvato | scartato | pubblicato | errore
  "note": "hook alternativi: 1) ... 2) ... (+ eventuali note di Valerio o difetti QA)",
  "created_at": "ISO",
  "decided_at": null,            // lo scrive la dashboard al PIN
  "published_at": null,
  "piattaforme_pubblicate": []
}
```

Regole:
- Lo stato lo cambiano SOLO: tu (in_attesa, errore, pubblicato) e la dashboard col PIN (approvato, scartato). Mai auto-approvarti un video.
- Quando aggiorni un video esistente, rileggi prima il valore dal digest e riscrivi il JSON COMPLETO (kv_set sovrascrive tutto): non perdere i campi scritti dalla dashboard (decided_at, note di Valerio).
- ATTENZIONE agli URL Kie: alcuni scadono. Se un video "approvato" da pubblicare ha l'URL morto, dillo nel feed (kind error) invece di pubblicare un link rotto.

Il diario e' la chiave `video_diario`: `{"last_date":"YYYY-MM-DD","last_angolo":"edu|mito","history":[{"date","angolo","tema","hook","pubblicato"} ... max 14]}`. Serve ad alternare gli angoli e a non ripetere hook e temi.

## PARTE 2: come funziona l'approvazione (il PIN)

- La pagina **Contenuti** della dashboard mostra il tuo video (anteprima, script, caption, stato). Valerio approva o scarta col suo PIN. Quel click E' il suo OK esplicito: la regola 1 del CLAUDE.md e' rispettata SOLO se pubblichi video in stato "approvato".
- "In_attesa" non e' un guasto: e' Valerio che deve decidere. Non sollecitare nel feed piu' di una volta.
- Se Valerio scrive direttamente in sessione "pubblica" riferito a un video preciso, vale come PIN: pubblica e porta lo stato a "pubblicato" dichiarando nel campo note "OK dato in sessione".

## PARTE 3: pubblicazione via Composio

- Cerca i tool con COMPOSIO_SEARCH_TOOLS (TikTok, Instagram Reels, YouTube Shorts) ed esegui con COMPOSIO_MULTI_EXECUTE_TOOL. Account: quelli di Rivolio collegati da Valerio.
- Prima verifica che l'account della piattaforma sia CONNESSO. Se manca: pubblica sulle piattaforme disponibili, elenca nel feed quelle saltate ("YouTube non connesso in Composio: video pronto, lo posti a mano o colleghi l'account"). Mai inventare destinazioni.
- Stesso video su tutte e tre; caption diversa per piattaforma (vedi `references/05-pubblicazione.md`); flag "contenuto AI" della piattaforma quando esiste + riga in caption.
- Orario: pubblichi quando arriva l'OK, senza aspettare finestre magiche. La costanza quotidiana vale piu' dell'orario perfetto.

## PARTE 4: Kie, i punti dove ci si fa male

- Gli slug/endpoint Veo cambiano: verifica sui docs Kie PRIMA di chiamare (`references/04-kie-tecnico.md`). Flusso Veo: POST /veo/generate, poll GET /veo/record-info?taskId= finche' successFlag: 1.
- L'upload reference (kieai.redpandaai.co/api/file-stream-upload) restituisce un downloadUrl che SCADE IN 24H: ricaricala a ogni giro, mai riusare il link di ieri.
- Il record di risposta contiene anche l'URL della reference in input: il risultato sta nei campi OUTPUT (resultUrls / resultJson). Prendere il primo URL che si vede = consegnare la foto al posto del video.
- Micro-glitch noti: telefono descritto nel prompt = telefoni che appaiono/spariscono; parole italiane rare storpiate dall'audio (riscrivi semplice: "ti spettano", "hai diritto a"); gesto non legato al discorso = effetto AI immediato.
- Il master 2K (`rivolio_influencer_2k.png`) NON e' nel repo: le 5 reference in `assets/giulia/` (giulia_1..5) bastano per l'image-to-video. Se serve il master, chiedilo a Valerio, non rigenerarlo (costa crediti e il volto derivera').

## PARTE 5: errori gia' fatti nel team (mai piu')

- DOPPIA ENTRY nel feed (report via op feed E via run_finish): una sola entry per evento.
- Numeri inventati o "a memoria": ogni numero che riporti (crediti, durate, stati) viene da una chiamata fatta IN QUESTO giro.
- Il trattino lungo nel copy: MAI, in nessuna caption o script (regola 4 del CLAUDE.md).
- Checklist CHK mancante nel summary: il CAPO legge quella; senza, per lui il tuo giro non e' verificabile.
- Lo scheduler ritarda i giri di 5-20 minuti: normale, non e' un guasto.
- Crediti a zero scoperti a meta' giro: il saldo si controlla al PASSO 2, PRIMA di scrivere script e regia, cosi' il lavoro non va buttato.
