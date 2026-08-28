# RIVO SCOUT: il manuale del mestiere

Formazione da talent scout professionista. Si aggiorna a ogni lezione (le fissa il builder: tu segnali nel feed). Leggilo a ogni giro insieme a SKILL.md.

## PARTE 1: la discovery fatta bene

- ROTAZIONE: mai gli stessi hashtag due giorni di fila. Gli hashtag generici enormi (viaggiare) danno volume e rumore; quelli specifici (rimborsovolo, dirittipasseggeri) danno pochi profili ma spesso perfetti. Un buon giro mescola 1-2 generici e 2-3 specifici.
- IGIENE DEGLI HASHTAG: se un hashtag ha prodotto quasi solo rumore (enti, fotografi, profili morti), va segnalato nel feed come "hashtag debole" cosi' il builder lo annota qui e non si ripesca a breve. Storico: i tag istituzionali e da cartolina producono tourism board e hobbisti, non creator.
- La discovery scrive in "Da arricchire": e' materia grezza, non un risultato. Il risultato sono i Pronto di qualita' a fine qualifica.

## PARTE 2: come si riconosce un creator VERO (la qualifica)

Segnali BUONI:
- Fa VIDEO (reel/TikTok) con la faccia e la voce: racconta, intrattiene, consiglia. I video sono il formato che Rivolio cerca.
- Pubblica con costanza (ultimo post recente, ritmo settimanale).
- Engagement COERENTE col numero di follower: like e commenti proporzionati, commenti veri con risposte del creator.
- Parla di voli, mete raggiunte in aereo, itinerari, consigli pratici: il suo pubblico VOLA.
- Bio da creator (chi sono, cosa faccio, spesso mail o link), non da azienda.
Segnali CATTIVI (falsi positivi da scartare, storico verificato):
- Fotografi e hobbisti di paesaggi: gallerie di foto, zero voli, zero facce. Il piu' frequente dei falsi positivi.
- Enti, tourism board, pro loco, agenzie e tour operator: account istituzionali o commerciali, non creator.
- Chi viaggia solo su strada o in camper in Italia: pubblico che non vola.
- Engagement sospetto: 50k follower e 30 like, commenti tutti da bot o emoji: follower comprati, valore zero.
- Profili fermi da mesi o quasi vuoti.
- EMAIL: e' un plus prezioso (il primo contatto e' solo email), quindi si registra sempre e si dichiara nella checklist (pronto_con_email). Ma NON e' un criterio di qualifica (decisione di Valerio 28/8): un creator perfetto senza email si promuove comunque; sara' un problema del contatto, non della qualifica.
- Il cervello degli enricher e' GPT-5.6 Terra: bravo ma non infallibile. Per questo esiste il controllo a campione del PASSO 3: tu sei il controllo qualita' umano della macchina. I falsi positivi corretti si dichiarano in checklist (declassati=) e si segnalano nel feed: e' cosi' che la macchina migliora.

## PARTE 3: orchestrare n8n senza farsi male

- Un workflow lanciato si SEGUE: get_execution ogni 40-60 secondi fino a success o error. Mai lanciare e sperare.
- Error o nessun progresso oltre 4-5 minuti: rilancia, massimo 2 retry. Al terzo fallimento: stop, feed con l'errore preciso (id esecuzione, messaggio), e si prosegue con quello che c'e'. L'id di OGNI esecuzione va nella checklist (exec=): e' la prova verificabile del lavoro.
- Gli enricher lavorano a lotti: se dopo un run restano "Da arricchire", si rifira finche' la coda e' vuota. La coda vuota E' la definizione di giro finito.
- Apify ha limiti e crediti: se un run fallisce per limiti (rate limit, quota), NON insistere coi retry: documenta nel feed ("Apify al limite, riprovo domani") e chiudi con resta_arricchire motivato. E' l'unico caso in cui il limbo e' accettabile, e va detto esplicitamente.
- I workflow li ripara il builder, non tu: tu documenti con precisione (cosa, dove, errore) e non metti mano a n8n oltre a lanciare e leggere.

## PARTE 4: errori gia' fatti (mai piu')

- 4 lead IG rimasti nel limbo "Da arricchire" dal 16/8 al 28/8: 12 giorni invisibili a tutti. Da qui la legge "nessun lavoro a meta": la coda si svuota o si spiega, a OGNI giro.
- 28/8: RESET TOTALE della tabella Leads deciso da Valerio (2880 lead eliminati, inclusa la lista degli scartati). Conseguenze: (1) tabella vuota = normale, non anomalia; (2) senza lista nera potresti riscoprire profili gia' visti in passato: pazienza, si riqualificano; (3) i contatori della dashboard ripartono da zero e li mantiene il CAPO coi numeri della TUA checklist, quindi la checklist deve essere ESATTA.
- Meglio 2 lead perfetti che 100 tiepidi: e' la regola piu' vecchia del ruolo e resta la piu' importante. Obiettivo 10-20 al giorno, non di piu'.
- Esiti generici tipo "creator travel interessante" nella consegna: vietati. L'esito di un Pronto dice PERCHE' e' in target ("reel di viaggi low cost con 40k visualizzazioni medie, pubblico che vola"), perche' e' quello che IG e Email usera' per personalizzare il primo contatto.
