/**
 * Scheda tecnica di ogni agente RIVO: missione, tool collegati, skill e
 * flusso di lavoro. Contenuto statico e verificato, allineato ai docs del repo.
 */

export interface AgentSpec {
  missione: string;
  tools: Array<{ name: string; detail: string }>;
  skills: string[];
  flusso: Array<{ step: string; detail: string }>;
  regole: string[];
}

export const AGENT_SPECS: Record<string, AgentSpec> = {
  capo: {
    missione:
      'Apre e chiude la giornata della squadra: raccoglie i numeri veri dalla pipeline, scrive il report del mattino e della sera e indica le priorita. Decide sui dati, mai sulla fede.',
    tools: [
      { name: 'Airtable', detail: 'Creator Pipeline + Leads, la CRM di squadra' },
      { name: 'Mission Control API', detail: 'Stato, giri e feed di questa dashboard' },
      { name: 'Routine claude.ai', detail: 'Si attiva da solo mattina e sera' },
    ],
    skills: [
      'Skill dedicata rivo-capo (SKILL.md + reference.md nel repo)',
      'Report a formato fisso: 7 righe leggibili in 20 secondi',
      'Fonte numeri unica: il digest della dashboard, mai la memoria',
      'Coordinamento vero: stalli, bozze ferme, coerenza CRM, contatori Scout',
    ],
    flusso: [
      { step: 'Legge la pipeline', detail: 'Stadi, risposte, call fissate e bozze in attesa' },
      { step: 'Confronta con ieri', detail: 'Cosa si e mosso davvero, cosa e fermo' },
      { step: 'Scrive il report', detail: 'Numeri veri, zero stime spacciate per fatti' },
      { step: 'Indica le priorita', detail: 'Cosa conviene fare oggi e perche' },
    ],
    regole: [
      'Mai inventare numeri: se un dato non e verificato si scrive "da verificare"',
      'Ogni giro registrato qui su Mission Control',
    ],
  },
  scout: {
    missione:
      'Trova creator travel italiani in target: scansiona largo, arricchisce i profili con follower, contatti e nicchia, li valuta col cervello GPT e consegna solo i "Pronto".',
    tools: [
      { name: 'n8n', detail: 'Il workflow di harvest che orchestra tutto il giro' },
      { name: 'Apify', detail: 'Scraper ufficiali Instagram e TikTok per i profili' },
      { name: 'GPT-5.6 Terra', detail: 'Valutazione qualita: nicchia, pubblico, score' },
      { name: 'Airtable Leads', detail: 'Dove finiscono i lead con stato e punteggio' },
      { name: 'Mission Control API', detail: 'Stato e output del giro su questa dashboard' },
    ],
    skills: [
      'Skill dedicata rivo-scout (SKILL.md + reference.md nel repo)',
      'Orchestra i 3 workflow n8n fino a success o error',
      'Nessun lead nel limbo: o Pronto o Scartato',
      'Checklist numerica contata da Airtable a fine giro',
    ],
    flusso: [
      { step: 'Scoperta', detail: 'Scansiona hashtag travel e profili collegati' },
      { step: 'Arricchimento', detail: 'Completa il profilo: numeri, contatti, nicchia' },
      { step: 'Valutazione', detail: 'GPT giudica pubblico e affinita con Rivolio' },
      { step: 'Consegna', detail: 'Solo i "Pronto" passano al primo contatto' },
    ],
    regole: [
      'Solo scraper ufficiali, mai violare i termini delle piattaforme',
      'Meglio 2 lead perfetti che 100 tiepidi',
    ],
  },
  ig_email: {
    missione:
      'Il clone di Valerio davanti ai creator: legge DM ed email in arrivo, risponde a chi ha gia scritto, prepara bozze personalizzate. Niente parte senza l\'Approva col PIN dalla dashboard.',
    tools: [
      { name: 'Composio Instagram', detail: 'DM di @valerio_alieri: lettura e risposta entro 24h' },
      { name: 'Composio Gmail', detail: 'Email di valerio@artecai.it' },
      { name: 'Airtable CRM', detail: 'Ogni risposta segnata subito in pipeline' },
      { name: 'Mission Control API', detail: 'Bozze, messaggi e stato del giro' },
    ],
    skills: [
      'Skill dedicata rivo-ig-email (SKILL.md + reference.md nel repo)',
      'Copywriting italiano umano (skill condivisa 2026)',
      'Bonifica totale 48h e test meccanico di freschezza sulle bozze',
      'Guardia record: mai scrivere sul creator sbagliato',
    ],
    flusso: [
      { step: 'Legge la posta', detail: 'DM e email in arrivo, chi ha risposto e cosa chiede' },
      { step: 'Prepara le bozze', detail: 'Risposta cucita sul creator, mai copia-incolla' },
      { step: 'Aspetta l\'OK', detail: 'La bozza resta ferma finche Valerio non approva col PIN' },
      { step: 'Invia e registra', detail: 'Le approvate partono, tutto finisce in CRM e qui' },
    ],
    regole: [
      'Mai un invio senza approvazione esplicita (regola 1)',
      'Mai primo DM a freddo: si risponde solo a chi ha scritto',
      'Mai trattino lungo, tono umano sempre (regola 4)',
    ],
  },
  reddit: {
    missione:
      'Costruisce autorevolezza sui rimborsi EU261 nelle community italiane: aiuto vero a chi ha problemi coi voli, karma che cresce, zero spam.',
    tools: [
      { name: 'Composio Reddit', detail: 'u/Valerio_alieri: lettura thread e commenti' },
      { name: 'Mission Control API', detail: 'Ogni contributo registrato con link' },
    ],
    skills: [
      'Skill dedicata rivo-reddit (SKILL.md + reference.md nel repo)',
      'Karma ufficiale: solo quello dei commenti, mai il totale',
      'Tono da utente vero, valore prima di tutto, tetto 15 al giorno',
    ],
    flusso: [
      { step: 'Scansiona le community', detail: 'r/ViaggiITA, r/CasualIT e le altre in lista' },
      { step: 'Sceglie i thread', detail: 'Solo dove un aiuto concreto ha senso' },
      { step: 'Scrive il contributo', detail: 'Valore puro, per ora zero link Rivolio' },
      { step: 'Registra e misura', detail: 'Karma verificato dai tool, mai stimato' },
    ],
    regole: [
      'Rapporto 9:1 tra valore e promozione',
      'Massimo 15 commenti al giorno',
      'Prima menzione di Rivolio solo a karma consolidato e con OK esplicito',
    ],
  },
  stratega: {
    missione:
      'Il cervello della macchina contenuti: legge i numeri veri del profilo, capisce cosa funziona davvero (salvataggi e condivisioni, non i like), scrive il piano editoriale che gli altri ruoli eseguono e propone i cambi di profilo. Decide sui dati, mai sulla fede. Comanda scrivendo il piano, non tocca mai il mondo esterno.',
    tools: [
      { name: 'Composio Instagram', detail: 'Insight di @valerio_alieri: follower, reach, engagement, post migliori' },
      { name: 'Mission Control API', detail: 'Legge cosa ha prodotto la squadra dal digest' },
      { name: 'Piano editoriale', detail: 'Scrive il calendario che Video, Caroselli, Publisher e Community eseguono' },
      { name: 'Cruscotto strategia', detail: 'La foto viva della crescita che vedi nella pagina Strategia' },
    ],
    skills: [
      'Skill dedicata rivo-stratega (SKILL.md + reference.md nel repo)',
      'Strategia di crescita organica dalle ricerche: TikTok-first, micro-educazione, ritmo 4-7/settimana',
      'Legge le metriche giuste: reach, salvataggi e condivisioni prima dei like',
      'Numeri veri letti live, mai a memoria: se un dato manca, "da verificare"',
    ],
    flusso: [
      { step: 'Legge i numeri', detail: 'Insight veri del profilo + cosa ha prodotto la squadra' },
      { step: 'Capisce cosa funziona', detail: 'Formato e angolo che rendono, su cosa raddoppiare' },
      { step: 'Scrive il piano', detail: 'Il calendario editoriale: chi produce cosa, quando, dove' },
      { step: 'Propone e aggiorna', detail: 'Cambi di bio/foto come bozze da approvare, cruscotto aggiornato' },
    ],
    regole: [
      'Non tocca mai il mondo esterno: propone, non pubblica e non cambia il profilo da solo',
      'Comanda gli altri solo scrivendo il piano, mai facendoli girare a mano',
      'Decide sui dati: pochi contenuti veri, misurati, poi si scala',
    ],
  },
  video: {
    missione:
      'La macchina dei contenuti: ogni mattina produce un video UGC ultra-realistico con Giulia, il personaggio AI di Rivolio, e lo porta fino alla pubblicazione su TikTok, Reels e Shorts. Un video al giorno, fatto bene.',
    tools: [
      { name: 'Kie.ai (Veo 3.1)', detail: 'Generazione video image-to-video con audio italiano nativo' },
      { name: 'Reference di Giulia', detail: '5 foto 4K in assets/giulia, volto e wardrobe fissi' },
      { name: 'Composio social', detail: 'Pubblicazione su TikTok, Instagram Reels e YouTube Shorts' },
      { name: 'Mission Control API', detail: 'I video aspettano il PIN nella pagina Contenuti' },
    ],
    skills: [
      'Skill dedicata rivo-video (SKILL.md + reference.md + bibbia di Giulia nel repo)',
      'Regia ultra-realismo: micro-espressioni, gesti coerenti, feel handheld',
      'Hook nei primi 3 secondi, script 15-25s in italiano umano',
      'Disclosure "Creato con AI" su ogni pubblicazione (EU AI Act)',
    ],
    flusso: [
      { step: 'Saldo e angolo', detail: 'Controlla i crediti Kie, alterna educativo e smonta-miti' },
      { step: 'Script e regia', detail: '3 hook, script parlato, prompt Veo 3.1 dettagliato' },
      { step: 'Genera e QA', detail: 'Image-to-video da una reference, checklist qualita severa' },
      { step: 'PIN e pubblica', detail: 'Il video aspetta il PIN in Contenuti, poi esce sui 3 canali' },
    ],
    regole: [
      'Mai pubblicare senza il PIN di Valerio: semi-auto per scelta',
      'Budget fisso: un video + massimo una rigenerazione al giorno',
      'Se il video sa di AI non si propone: si riparte dalla regia',
    ],
  },
  caroselli: {
    missione:
      'Il creatore dei post a scorrimento: prende il tema dal piano dello Stratega e lo trasforma in un carosello-guida fatto bene, slide per slide (copertina che ferma il pollice, contenuto numerato, CTA soft). Sono i post che la gente salva e condivide. Non pubblica: consegna e aspetta il PIN.',
    tools: [
      { name: 'Piano dello Stratega', detail: 'Prende il tema assegnato dal kv piano_editoriale' },
      { name: 'Mission Control API', detail: 'Consegna il carosello nel kv, aspetta il PIN' },
      { name: 'Composio Instagram', detail: 'Controlla il profilo quando serve, senza pubblicare' },
      { name: 'Griglia di brand', detail: 'Colori, font e tono visivo Rivolio per ogni slide' },
    ],
    skills: [
      'Skill dedicata rivo-caroselli (SKILL.md + reference.md nel repo)',
      'Anatomia del carosello che converte: copertina forte, una idea per slide, CTA soft',
      'Copy italiano umano, numeri veri, niente gergo legale',
      'Il formato dei salvataggi: utile prima di tutto, 5-8 slide',
    ],
    flusso: [
      { step: 'Prende il tema', detail: 'Dal piano dello Stratega, il carosello assegnato a lui' },
      { step: 'Progetta le slide', detail: 'Copertina, contenuto numerato, CTA: una idea per slide' },
      { step: 'Scrive la caption', detail: 'Aggancio, valore, invito soft, hashtag pertinenti' },
      { step: 'Consegna e aspetta', detail: 'Il carosello resta in attesa del tuo PIN nella dashboard' },
    ],
    regole: [
      'Non pubblica e non manda: consegna, poi il Publisher pubblica col PIN',
      'Segue il piano dello Stratega, non inventa temi a caso',
      'Numeri veri o niente, mai il trattino lungo',
    ],
  },
  publisher: {
    missione:
      'La regia della distribuzione e dei dati. La pubblicazione vera la fa il backend della dashboard (server Railway) quando approvi: questo ruolo si assicura che tutto sia uscito su ogni canale (innesca i ri-tentativi finche non esce), e soprattutto tira giu da Zernio i NUMERI VERI (follower, viste, engagement per post, commenti e DM) che servono allo Stratega per decidere e alla Community per rispondere. Non pubblica di suo: gli agenti sono bloccati dal pubblicare all esterno, quindi pubblica il server.',
    tools: [
      { name: 'Mission Control API', detail: 'Innesca /api/publish (ri-tentativo) e legge lo stato delle pubblicazioni' },
      { name: 'Zernio (sola lettura)', detail: 'Analitiche e inbox: follower, viste, engagement per post, commenti e DM' },
      { name: 'Backend pubblicazione', detail: 'La POST verso i social parte dal server Railway, non dall agente' },
    ],
    skills: [
      'Skill dedicata rivo-publisher (SKILL.md + reference.md nel repo)',
      'Non pubblica direttamente: innesca il backend e verifica',
      'Porta i dati di crescita allo Stratega e alla Community',
      'Segnala cosa e uscito e cosa e rimasto indietro (es. TikTok pieno)',
    ],
    flusso: [
      { step: 'Innesca la pubblicazione', detail: 'Chiama /api/publish: il backend pubblica/ritenta gli approvati' },
      { step: 'Legge le analitiche', detail: 'Numeri veri per post e per profilo da Zernio' },
      { step: 'Legge l inbox', detail: 'Commenti e DM nuovi su TikTok/YouTube (le risposte le fa la Community)' },
      { step: 'Riporta lo stato', detail: 'Cosa e pubblicato e verificato, cosa e ancora in coda' },
    ],
    regole: [
      'La pubblicazione esterna la fa il backend, mai l agente (guardrail di Claude)',
      'Esce solo il contenuto approvato; verifica reale prima di dire pubblicato',
      'Ogni contenuto AI esce con la disclosure "Creato con AI"',
    ],
  },
  community: {
    missione:
      'Tiene viva la pagina: legge i commenti e i DM del pubblico sui contenuti, prepara risposte umane e presidia i primi 60 minuti di ogni post nuovo, la finestra che decide se l\'algoritmo lo spinge. Prepara le risposte, non le manda senza il tuo OK.',
    tools: [
      { name: 'Composio Instagram', detail: 'Commenti e DM di @valerio_alieri: lettura e risposta entro 24h' },
      { name: 'Mission Control API', detail: 'Le risposte aspettano il PIN, il cruscotto engagement' },
      { name: 'Finestra 60 minuti', detail: 'Presidia i post appena usciti: risposte urgenti per prime' },
    ],
    skills: [
      'Skill dedicata rivo-community (SKILL.md + reference.md nel repo)',
      'Copywriting italiano umano: risposte calde e personalizzate, mai copia-incolla',
      'Garbo con gli hater, valore alle domande vere, mai numeri inventati',
      'Presidio dei primi 60 minuti: la finestra che fa spingere un post',
    ],
    flusso: [
      { step: 'Invia le approvate', detail: 'Le risposte che hai sbloccato col PIN partono ora' },
      { step: 'Legge commenti e DM', detail: 'Domande, complimenti, critiche: cosa serve gestire' },
      { step: 'Presidia i 60 minuti', detail: 'I post appena usciti: risposte urgenti per prime' },
      { step: 'Prepara le risposte', detail: 'Bozze umane in attesa del tuo PIN + cruscotto engagement' },
    ],
    regole: [
      'Mai rispondere senza il tuo OK: ogni risposta e una bozza col PIN (regola 1)',
      'Mai litigare o essere difensivi: garbo sempre',
      'Mai primo DM a freddo, mai numeri inventati',
    ],
  },
  guardiano: {
    missione:
      'Il manutentore tecnico della squadra: controlla che tutti i ruoli girino e aggiornino la dashboard, ripara gli intoppi che sa sistemare e chiama il builder solo per i bug di codice. Cosi Valerio guarda solo la dashboard, mai i log.',
    tools: [
      { name: 'Mission Control API', detail: 'Legge la salute di tutti i ruoli dal digest' },
      { name: 'n8n', detail: 'Rilancia i workflow dello Scout se si inceppano' },
      { name: 'Semaforo di salute', detail: 'Scrive lo stato verde/giallo/rosso che vedi in home' },
      { name: 'Escalation al builder', detail: 'Segnala nel feed solo cio che serve una fix vera' },
    ],
    skills: [
      'Skill dedicata rivo-guardiano (SKILL.md + reference.md nel repo)',
      'Ripara infrastruttura e dati in sicurezza, mai il codice',
      'Non tocca mai il mondo esterno, non disturba mai Valerio',
      'Distingue il ritardo normale dallo stallo vero: niente falsi allarmi',
    ],
    flusso: [
      { step: 'Controlla la salute', detail: 'Ogni ruolo ha girato in orario? Errori? Dashboard viva?' },
      { step: 'Verifica i dati', detail: 'Contatori coerenti, niente stati impossibili' },
      { step: 'Ripara il riparabile', detail: 'Dati sballati, workflow n8n fermi, ruoli da risvegliare' },
      { step: 'Semaforo + escalation', detail: 'Scrive lo stato salute e chiama il builder solo per i bug' },
    ],
    regole: [
      'Ripara solo cio che e sicuro e reversibile: mai il codice',
      'Ogni cosa va nella dashboard, mai una notifica a Valerio',
      'Meglio unescalation in piu che un danno',
    ],
  },
  'trend-scout': {
    missione:
      'Il radar dei trend: ogni mattina trova audio, format, hook e news del momento (TikTok prima), li filtra su rilevanza per i rimborsi voli e li passa allo Stratega come munizioni per il piano del giorno.',
    tools: [
      { name: 'Ricerca web', detail: 'WebSearch e WebFetch per trend, audio e notizie fresche' },
      { name: 'Mission Control API', detail: 'Scrive il radar nel kv trend_scout' },
      { name: 'Routine claude.ai', detail: 'Ogni mattina, prima dello Stratega' },
    ],
    skills: [
      'Skill dedicata rivo-trend-scout (SKILL.md nel repo)',
      'Agganciato a DECIDI e ai 5 pilastri: un trend serve solo se cavalcabile',
      'Finestra dei trend: un audio si cavalca entro 48h, poi e vecchio',
    ],
    flusso: [
      { step: 'Legge il radar di ieri', detail: 'Per non riproporre gli stessi trend (idempotenza)' },
      { step: 'Cerca i trend caldi', detail: 'Audio, format, hook, news nella nicchia viaggi/diritti' },
      { step: 'Filtra su rilevanza', detail: 'Si aggancia a un pilastro? parla ai passeggeri? e in tempo?' },
      { step: 'Consegna allo Stratega', detail: '3-6 occasioni forti nel kv trend_scout, con idea di aggancio' },
    ],
    regole: [
      'Non produce e non pubblica: passa solo munizioni allo Stratega',
      'Mai inventare un trend per riempire: se e giornata piatta, lo dice',
    ],
  },
  seo: {
    missione:
      'Il traffico che compone nel tempo: keyword research sui rimborsi voli, articoli evergreen ottimizzati (come bozze) e migliorie SEO al sito, per portare traffico organico da Google a Rivolio.',
    tools: [
      { name: 'Ricerca web', detail: 'WebSearch per keyword, SERP e cosa rankano i competitor' },
      { name: 'Mission Control API', detail: 'Bozze articoli + cruscotto nel kv seo_stato' },
      { name: 'Routine claude.ai', detail: 'Ogni giorno, un pezzo forte' },
    ],
    skills: [
      'Skill dedicata rivo-seo (SKILL.md nel repo)',
      'Keyword con intento, non vanity: chi cerca "rimborso volo cancellato" e caldo',
      'Onesta nel testo: se conviene fare da soli, lo dice (e il posizionamento)',
    ],
    flusso: [
      { step: 'Legge lo stato', detail: 'Keyword e articoli gia fatti, per non duplicare' },
      { step: 'Sceglie il pezzo del giro', detail: 'La keyword/articolo a piu alto ritorno non coperto' },
      { step: 'Scrive la bozza', detail: 'Articolo ottimizzato coi fatti veri, CTA alla verifica' },
      { step: 'Consegna in dashboard', detail: 'Bozza + migliorie sito nel cruscotto SEO' },
    ],
    regole: [
      'Non pubblica sul sito da solo: tutto e bozza da approvare (regola 1)',
      'Mai inventare numeri o casi: solo fatti veri del prodotto',
    ],
  },
  cro: {
    missione:
      'Il traffico che converte: analizza il funnel di rivolio.it (dal contenuto al verdetto alla pratica), trova gli attriti che fanno perdere clienti e propone migliorie e test A/B, da approvare col PIN.',
    tools: [
      { name: 'Ricerca web', detail: 'WebFetch per analizzare il sito e la landing' },
      { name: 'Mission Control API', detail: 'Attriti e proposte nel kv cro_stato' },
      { name: 'Routine claude.ai', detail: 'Analisi conversione, in giornata' },
    ],
    skills: [
      'Skill dedicata rivo-cro (SKILL.md nel repo)',
      'Agganciato a DECIDI e alla value equation di Hormozi',
      'Decide sui dati (dove cade la gente), non su opinioni estetiche',
    ],
    flusso: [
      { step: 'Legge lo stato', detail: 'Migliorie gia segnalate/applicate, per non ripetere' },
      { step: 'Analizza una tappa', detail: 'Landing, o verdetto, o il ponte social->sito' },
      { step: 'Trova l attrito top', detail: 'Quello che costa piu pratiche, con la sua gravita' },
      { step: 'Propone la miglioria', detail: 'Cosa, perche, impatto atteso, come misurarlo' },
    ],
    regole: [
      'Non modifica il sito da solo: propone, decide e applica Valerio',
      'Il traffico senza conversione e sprecato: il numero e la pratica avviata',
    ],
  },
};
