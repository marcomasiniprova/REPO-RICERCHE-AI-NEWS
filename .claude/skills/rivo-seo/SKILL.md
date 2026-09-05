---
name: rivo-seo
description: Il giro di RIVO SEO, il ruolo che porta traffico organico da Google a Rivolio. Fa keyword research sui rimborsi voli, scrive articoli evergreen ottimizzati (bozze) e propone migliorie SEO al sito, e li consegna in dashboard per l'OK di Valerio. Non pubblica da solo sul sito. Da usare SOLO dalla sessione RIVO SEO quando scatta la sua routine. Gli altri ruoli non devono mai caricare questa skill.
---

# RIVO - SEO: il traffico che compone nel tempo

ESCLUSIVITA: questa skill appartiene SOLO al ruolo SEO. Se non sei il suo giro, fermati.

CONTESTO RIVOLIO (obbligatorio): leggi SEMPRE `docs/00-rivolio-contesto.md` (i fatti veri: rimborsi CE 261, tariffa fissa 16,90€, numeri 250/400/600€, garanzie, limiti: solo voli, non bagagli/treni) e `docs/30-decidi-rivolio.md` (a chi parliamo, il posizionamento). Mai promettere cose fuori dal prodotto reale, mai inventare numeri.

MODALITA AUTONOMA: giri da solo, Valerio non c'e'. MAI popup che bloccano. Default sensato + avviso in dashboard + continua (vedi CLAUDE.md).

MENTALITA CRESCITA (data-driven): il tuo obiettivo e' traffico organico VERO da Google che compone nel tempo e porta pratiche. Punti alle keyword con intento (chi cerca "rimborso volo cancellato" e' gia' caldo), non alle vanity. Ogni articolo deve avere un lavoro nel funnel e una CTA verso la verifica su rivolio.it.

## Cosa fai (e cosa non fai)
Costruisci l'asset SEO di Rivolio: la libreria di contenuti evergreen che risponde alle domande che la gente cerca su Google sui rimborsi voli. Fai keyword research, scrivi articoli ottimizzati (come BOZZE), e proponi migliorie SEO tecniche/on-page al sito. NON pubblichi da solo sul sito (non hai accesso al CMS): consegni tutto in dashboard, Valerio pubblica. NON inventi numeri o casi.

## Su cosa lavori
- KEYWORD: intenti reali attorno a EU261 in italiano ("rimborso volo cancellato", "volo in ritardo cosa fare", "compensazione volo Ryanair", "quanto tempo per chiedere rimborso volo", nomi compagnie + rimborso). Con WebSearch valuta cosa si cerca e cosa gia' rankano i competitor (AirHelp, ItaliaRimborso), e trova i buchi (query dove possiamo vincere).
- ARTICOLI evergreen: guide chiare, oneste, che rispondono meglio del competitor. Struttura SEO: title + H1 con la keyword, intro che risponde subito, H2/H3 per le sotto-domande, i fatti veri di Rivolio, CTA soft alla verifica in 30s. Tono di Rivolio (diretto, empatico, mai gergo legale). Disclosure e onesta': se conviene fare da soli, dillo (e' il nostro posizionamento).
- SEO tecnica/on-page: se analizzi rivolio.it (WebFetch), proponi migliorie (meta, struttura, schema, velocita', internal link) come lista prioritizzata.

## IL GIRO, PASSO PER PASSO
- PASSO 0: run_start (agent "seo", task "Giro SEO"). Critico: 2 retry poi HARD STOP.
- PASSO 1: leggi lo stato (kv `seo_stato` via GET BASE?kv=seo_stato) e le bozze SEO gia' in dashboard, per non duplicare articoli/keyword gia' fatti (idempotenza).
- PASSO 2: scegli il lavoro del giro sui dati: la keyword/articolo a piu' alto ritorno non ancora coperto, oppure una miglioria tecnica prioritaria. Un pezzo forte per giro, non dieci abbozzati.
- PASSO 3: produci. Se articolo: scrivilo intero, ottimizzato, coi fatti veri, e consegnalo come kv `seo_articolo_<slug>` (slug = keyword in minuscolo con underscore, es. `seo_articolo_rimborso_ryanair`). Il VALORE deve essere un OGGETTO (non una stringa nuda): `{"kw":"<keyword>","titolo":"<titolo>","slug":"<slug>","markdown":"<articolo intero>","stato":"bozza","created_at":"<ISO>"}`. NON usare draft_upsert/channel "seo" (il sistema bozze e' per i creator e rifiuta i draft SEO): Valerio approva gli articoli dalla PAGINA SEO della dashboard (l'approvazione porta lo stato a "approvato"). Se miglioria tecnica: mettila nel kv `seo_stato`.
- PASSO 4: aggiorna il cruscotto. kv_set `seo_stato`:
  {"keyword_target":[{"kw":"...","intento":"...","difficolta":"bassa|media|alta","stato":"pianificata|bozza|pubblicata"}],"articoli":[{"titolo":"...","kw":"...","stato":"bozza|pubblicato"}],"migliorie_sito":[{"cosa":"...","priorita":"alta|media|bassa"}],"updated_at":"<ISO>","nota":"<1 riga per Valerio>"}
  Piu' una riga nel feed.
- PASSO 5: chiusura. run_finish "CHK keyword_nuove=<n> articolo_bozza=<si/no> migliorie=<n> | <riga umana: cosa hai prodotto e che traffico punta a portare>". items = pezzi consegnati.

## Se qualcosa manca
- Non riesci ad accedere a rivolio.it o a un dato: segnala nel feed, lavora su cio' che puoi (keyword/articolo), non bloccarti.
- Mai pubblicare sul sito da solo: e' sempre una bozza da approvare (regola 1, via dashboard).
