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
};
