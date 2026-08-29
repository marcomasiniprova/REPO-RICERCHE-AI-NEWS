# Attivazione del team contenuti (i 4 nuovi ruoli) — guida per Valerio

I 5 ruoli contenuti sono COSTRUITI (skill + dashboard). Restano SPENTI finche' non hanno una sessione con i connettori e una routine agganciata. Ordine deciso: Valerio crea le sessioni, il builder aggancia le routine. VIDEO e' gia' attivo; mancano STRATEGA, CAROSELLI, PUBLISHER, COMMUNITY.

## Perche' serve una SESSIONE creata da te
I connettori (Instagram, Gmail, ecc. via Composio) vivono SOLO nelle sessioni create dalla UI di claude.ai. La routine da sola non li ha. Per questo ogni ruolo ha bisogno di una sua sessione operativa creata da te: e' la stessa cosa fatta per VIDEO e GUARDIANO. Il contesto di quella sessione conterra' solo i giri di quel ruolo.

## I passi (uguali per tutti e 4)
1. Su claude.ai apri una NUOVA sessione (stesso environment degli altri RIVO, quello che ha gia' le variabili: KIE, Composio, ecc.).
2. Chiamala col nome esatto della tabella qui sotto (es. "RIVO STRATEGA operative").
3. Verifica che i connettori servano siano collegati nella sessione (Composio con Instagram; per il Publisher anche YouTube, e TikTok quando lo colleghi).
4. Dimmi "sessione X pronta": io creo la routine col prompt corto blindato (git pull, carica la skill, INGEST_KEY nel messaggio, esclusivita') e la aggancio a quella sessione.
5. Faccio un fire di collaudo SENZA testo extra (cosi' parte dentro la tua sessione coi connettori, non in una orfana). Guardiamo il giro nella dashboard.

## Le 4 sessioni da creare

| Ruolo | Nome sessione | Connettori che gli servono | Skill che carica | Cadenza routine (proposta) |
|---|---|---|---|---|
| STRATEGA | `RIVO STRATEGA operative` | Composio: Instagram (insight profilo) | rivo-stratega | Mattina presto + sera (prima del CAPO) |
| CAROSELLI | `RIVO CAROSELLI operative` | Composio: Instagram (facoltativo, per controllo profilo) | rivo-caroselli | Ogni mattina, dopo lo Stratega |
| PUBLISHER | `RIVO PUBLISHER operative` | Composio: Instagram, YouTube (TikTok dopo) | rivo-publisher | Ogni poche ore in orario lavorativo |
| COMMUNITY | `RIVO COMMUNITY operative` | Composio: Instagram (commenti + DM) | rivo-community | Ogni ora, 8-20 |

Nota: tutte condividono lo stesso environment, quindi le variabili (chiavi API) sono gia' a posto: non serve rifarle per sessione.

## Ordine consigliato
1. STRATEGA per primo: e' il cervello, scrive il piano che gli altri leggono. Attivandolo, gli altri avranno gia' un piano da eseguire.
2. Poi CAROSELLI e COMMUNITY (producono/rispondono).
3. PUBLISHER per ultimo tra i quattro, e resta in fase di TEST (non pubblica) finche' non colleghi TikTok e non dai l'OK per il "live".

## Vincoli sempre attivi
- Niente esce senza il PIN di Valerio (regola 1). Il Publisher in fase di test NON pubblica.
- TikTok lo colleghi tu come ultimo passo.
- Le routine le aggancia il builder; Valerio crea solo le sessioni (decisione 29/8: il ruolo di Valerio e' la dashboard).
