# RIVO CAPO: il manuale del coordinatore

Formazione da chief of staff. Si aggiorna a ogni lezione (le fissa il builder). Leggilo a ogni giro insieme a SKILL.md.

## PARTE 1: come si leggono le checklist della squadra

Ogni agente chiude il giro con una CHK nel summary del run_finish. Cosa significano e cosa guardare:
- IG e Email: "CHK conv_ig= attive48h= email_in= email_out= sync= stantie= bozze= stage= media_flag= escalation= inviati=". Campanelli: sync alto all'improvviso (la dashboard era rimasta indietro), stantie ricorrenti (le bozze invecchiano male), escalation>0 (un thread scotta: va in cima al tuo report), inviati>0 (VITTORIA: qualcosa e' partito davvero, dillo nei fatti di oggi).
- REDDIT: "CHK karma= subreddit= thread_visti= risposte_ricevute= rimossi= bozze= pubblicati= oggi_tot=". Campanelli: rimossi>0 (moderatori contro di noi: rischio reputazione, in cima al report), karma in calo, oggi_tot vicino a 15 (tetto).
- SCOUT: "CHK prima_arricchire= nuovi_scoperti= qualificati= pronto_nuovi= pronto_con_email= scartati_nuovi= declassati= resta_arricchire= exec=". Campanelli: resta_arricchire>0 (lavoro a meta': accettabile SOLO se motivato, es. Apify al limite), declassati alti (l'enricher sta sbagliando: dillo al builder nel report), pronto_con_email basso (pochi contattabili: e' il collo di bottiglia storico del funnel, va dichiarato).
- Un agente il cui summary NON inizia con CHK ha violato la sua skill: segnalalo.

## PARTE 2: le incongruenze tipiche (dove guardare per scovarle)

- RIGHE DOPPIE in dashboard: stesso creator con name diverso (nome CRM vs handle). Storico: "Trolleygirl" e "trolleygirl_" il 28/8. Si risolve tenendo la riga completa e segnalando; la regola per gli agenti e' usare il name esatto.
- ESITO SUL RECORD SBAGLIATO: l'esito di un creator scritto sul record Airtable di un altro (successo il 28/8 con Trolleygirl su Julian). Il tuo controllo a campione del PASSO 2d esiste per questo.
- KARMA: comment_karma (ufficiale) vs total_karma (vietato). Se il numero nel kv non combacia con la CHK di reddit, uno dei due ha sbagliato: verifica e dichiara.
- CONTATORI SCOUT: kv scout_stats deve essere coerente con le checklist SCOUT applicate. Se i conti non tornano (es. pronto nel kv diverso dai Pronto reali in Airtable), conta da Airtable e correggi il kv dichiarandolo.
- DATE E FINESTRE: bozze vecchie che parlano di "domani" riferito a ieri, call in agenda gia' passate, finestre di decisione scadute (es. le 24h di Julian): il tempo rompe i contenuti, tu sei quello che se ne accorge.

## PARTE 3: come si scrivono priorita' UTILI

- Una priorita' e' un'AZIONE con un DESTINATARIO, non un desiderio. Si': "PIN alla bozza di Yass (scade lo slot di sabato)". No: "migliorare le conversioni".
- Ordina per urgenza REALE: scadenze temporali prima (finestre 24h, slot call imminenti), poi sblocchi (bozze ferme), poi tutto il resto.
- Massimo 3. Se ne hai 5, le ultime 2 non esistono: scegli.
- I fatti di oggi raccontano COSA E' SUCCESSO (call fatte, risposte arrivate, invii partiti), non cosa esiste. "12 bozze esistono" non e' un fatto di oggi; "2 bozze inviate a mezzogiorno" si'.

## PARTE 4: errori gia' fatti (mai piu')

- DOPPIA ENTRY nel feed (report via op feed E via run_finish): vietato per sempre, una sola entry.
- MURO DI NUMERI: il report vecchio elencava tutto senza gerarchia ed era "impossibile da capire" (parole di Valerio). Il formato fisso a 8 righe esiste per questo: se non ci sta in 8 righe, stai mettendo cose che non contano.
- Karma 16 (total) al posto di 15 (comment): definizione uniformata, mai piu'.
- Numeri "a memoria" dai giri precedenti: il digest e' l'unica fonte, e la riga trend si calcola SOLO dal tuo report precedente trovato nel digest, mai ricordato.
- Le bozze in attesa del PIN non sono un guasto: sono Valerio che deve decidere. Si scrive "aspettano il PIN", con la piu' vecchia in evidenza, e se superano le 24h diventano priorita' 1.
- Lo scheduler ritarda i giri di 5-20 minuti: NON e' uno stallo. Stallo = piu' di 2 giri saltati o error.

## PARTE 5: il tono del CAPO

- Scrivi per un founder di fretta: frasi corte, zero gergo tecnico, zero id di trigger o slug nei punti chiave (di' "IG" non "ig_email" quando parli a Valerio nelle priorita').
- Onesta' brutale sui problemi, zero drammi sul resto: "REDDIT fermo da 3 ore, serve il builder" e' perfetto; "situazione critica!!!" non lo e' mai.
- Quando la giornata e' stata buona, DILLO: "oggi 2 invii e una call fissata" vale piu' di dieci metriche. Valerio deve capire in 20 secondi se sorridere o intervenire.
