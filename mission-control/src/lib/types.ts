export type AgentStatus = 'idle' | 'working' | 'error' | 'paused';

export interface Agent {
  slug: string;
  name: string;
  role: string;
  tagline: string;
  avatar: string;
  status: AgentStatus;
  current_task: string | null;
  last_run_at: string | null;
  schedule_label: string;
  cron: string | null;
  today_count: number;
  color: string;
  updated_at: string | null;
}

export interface AgentRun {
  id: number;
  agent_slug: string;
  started_at: string;
  finished_at: string | null;
  status: 'running' | 'ok' | 'error';
  summary: string | null;
  items: number;
}

export type FeedKind = 'info' | 'success' | 'draft' | 'creator' | 'reddit' | 'error' | 'run';

export interface FeedItem {
  id: number;
  ts: string;
  agent_slug: string | null;
  kind: FeedKind;
  message: string;
}

export type CreatorStage =
  | 'Nuovo'
  | 'Contattato'
  | 'Risposto'
  | 'Call fissata'
  | 'Attivo'
  | 'Scartato';

export interface Creator {
  id: number;
  name: string;
  ig: string | null;
  tiktok: string | null;
  followers: string | null;
  fascia: string | null;
  stage: CreatorStage;
  canale: string | null;
  email: string | null;
  esito: string | null;
  priorita: string | null;
  url: string | null;
  source: 'crm' | 'scout';
  updated_at: string | null;
}

export type DraftStatus = 'bozza' | 'approvata' | 'inviata' | 'scartata';

export interface Draft {
  id: number;
  creator: string;
  channel: 'email' | 'dm' | 'reddit';
  subject: string | null;
  body: string;
  status: DraftStatus;
  agent_slug: string;
  created_at: string;
}

export interface RedditItem {
  id: number;
  date: string;
  subreddit: string;
  kind: 'comment' | 'post';
  title: string;
  body_summary: string | null;
  permalink_id: string | null;
  permalink_url?: string | null;
  status: string;
}

export interface Message {
  id: number;
  external_id: string | null;
  creator_name: string | null;
  counterpart: string;
  channel: 'dm' | 'email';
  direction: 'in' | 'out';
  subject: string | null;
  body: string;
  ts: string;
}

export interface LeadRow {
  u: string;
  p: string;
  f: number | null;
  s: string;
  q: string | null;
  sc: number | null;
  e: string | null;
  n: string | null;
  url: string | null;
}

/** Contatori live della tabella Leads, scritti in kv (chiave scout_stats)
 *  dallo SCOUT/CAPO a ogni giro. */
export interface ScoutStats {
  tot: number;
  pronto: number;
  da_arricchire: number;
  scartato: number;
  contattato?: number;
  updated_at?: string;
  fonte?: string;
}

export type VideoStato =
  | 'piano_in_attesa' // l'agente ha proposto il piano, aspetta il tweak/OK di Valerio
  | 'piano_approvato' // Valerio ha approvato il piano col PIN, l'agente genera
  | 'in_attesa' // video generato, aspetta l'OK di pubblicazione
  | 'approvato'
  | 'in_pubblicazione' // approvato, uscito su alcuni canali, altri in corso/da ritentare
  | 'bozza_tiktok' // consegnato alla Creator Inbox di TikTok
  | 'scartato'
  | 'pubblicato'
  | 'errore';

/** Una combinazione modello+qualita+durata proposta nel piano, col costo reale letto su Kie. */
export interface VideoOption {
  id: string;
  modello: string; // es. "Veo 3.1 quality" / "Veo 3.1 fast"
  risoluzione?: string; // es. "1080p" / "720p" / "480p"
  durata_s: number;
  crediti: number;
  euro?: number;
  consigliata?: boolean;
}

/** Video del giorno di RIVO VIDEO: vive nel kv (chiave video_YYYY-MM-DD).
 *  Due fasi: PIANO (l'agente propone, Valerio tweaka col PIN) e OUTPUT (video generato, approvazione+pubblicazione). */
export interface VideoItem {
  key: string; // chiave kv, es. video_2026-08-29
  date: string;
  angolo?: 'edu' | 'mito' | string;
  tema?: string;
  hook?: string;
  script?: string;
  reference_foto?: string;
  // Fase PIANO
  saldo_crediti?: number; // saldo Kie letto quando ha fatto il piano
  opzioni?: VideoOption[]; // ventaglio di combinazioni proposte
  scelta?: VideoOption; // la combinazione scelta/approvata da Valerio
  // Fase OUTPUT
  video_url?: string;
  duration_s?: number;
  crediti_spesi?: number;
  caption_tiktok?: string;
  caption_ig?: string;
  caption_youtube?: string;
  stato: VideoStato;
  note?: string;
  created_at?: string;
  plan_decided_at?: string | null;
  decided_at?: string | null;
  published_at?: string | null;
  piattaforme_pubblicate?: string[];
}

/** Stato di un canale di pubblicazione visto da RIVO PUBLISHER. */
export interface PublisherChannel {
  nome: string; // instagram | tiktok | youtube
  stato: 'collegato' | 'da_collegare' | string;
  tool?: 'trovato' | 'assente' | string;
  test?: 'ok' | 'ko' | 'na' | string;
}

/** Un contenuto approvato in coda di pubblicazione. */
export interface PublisherQueueItem {
  tipo: 'video' | 'carosello' | string;
  key: string;
  tema?: string;
  pronto_per?: string[];
  blocchi?: string[];
}

/** Lo stato della pubblicazione scritto da RIVO PUBLISHER (kv publisher_stato).
 *  In fase di test: verifica la catena, non pubblica (pubblicati sempre 0). */
export interface PublisherStato {
  modo: 'test' | 'live' | string;
  canali: PublisherChannel[];
  coda?: PublisherQueueItem[];
  ultimo_test?: string;
  nota?: string;
}

export type CarouselStato =
  | 'in_attesa'
  | 'approvato'
  | 'in_pubblicazione'
  | 'bozza_tiktok'
  | 'scartato'
  | 'pubblicato'
  | 'errore';

/** Una slide del carosello scritta da RIVO CAROSELLI. */
export interface CarouselSlide {
  n: number;
  tipo: 'copertina' | 'contenuto' | 'cta' | string;
  titolo?: string;
  testo?: string;
  visual?: string; // direzione visiva (cosa si vede, colori, icone)
  img?: string; // URL dell'immagine generata su Kie (GPT Image 2)
  prompt?: string; // prompt di generazione (riferimento)
}

/** Il carosello del giorno di RIVO CAROSELLI: vive nel kv (chiave carosello_YYYY-MM-DD).
 *  L'agente consegna le slide + caption; il PIN di Valerio approva, il PUBLISHER pubblica. */
export interface CarouselItem {
  key: string; // es. carosello_2026-08-29
  date: string;
  tema?: string;
  angolo?: string;
  slides: CarouselSlide[];
  caption?: string;
  canali?: string[];
  modello_img?: string; // modello Kie usato per le immagini
  crediti_spesi?: number;
  stato: CarouselStato;
  note?: string;
  created_at?: string;
  decided_at?: string | null;
  published_at?: string | null;
  piattaforme_pubblicate?: string[];
}

export type CommunityReplyStato = 'in_attesa' | 'approvato' | 'scartato' | 'inviato' | string;

/** Una risposta preparata da RIVO COMMUNITY a un commento o DM (in community_stato.risposte). */
export interface CommunityReply {
  id: string;
  tipo: 'commento' | 'dm' | string;
  da?: string; // handle di chi ha scritto
  dove?: string; // post o "DM"
  loro?: string; // cosa hanno scritto
  bozza?: string; // la risposta pronta
  urgente?: boolean; // nei primi 60 minuti
  stato: CommunityReplyStato;
  creato?: string;
  inviato_at?: string | null;
}

/** Una finestra "primi 60 minuti" attiva su un post. */
export interface CommunityWindow {
  post?: string;
  scade?: string;
  commenti?: number;
}

/** Il cruscotto di RIVO COMMUNITY (kv community_stato): l'aria nei commenti,
 *  le risposte pronte da approvare, la finestra dei primi 60 minuti. */
export interface CommunityStato {
  commenti_nuovi?: number;
  dm_nuovi?: number;
  in_attesa_pin?: number;
  urgenti?: number;
  sentiment?: string;
  tempo_medio_attesa?: string;
  finestra_60min?: CommunityWindow[];
  risposte?: CommunityReply[];
  updated_at?: string;
  nota?: string;
}

/** Semaforo di salute scritto dal GUARDIANO nel kv (chiave guardiano_health). */
export interface GuardianoHealth {
  stato: 'ok' | 'attenzione' | 'critico';
  controllati?: string[];
  problemi?: string[];
  riparati?: string[];
  da_builder?: string[];
  nota?: string;
  updated_at?: string;
}

/** Link Meet fisso di Rivolio (kv meet_link), usato per tutte le call. */
export interface MeetLink {
  url: string;
  nota?: string;
}

/** Un appuntamento confermato (kv meetings), con lo stato dei promemoria. */
export interface Meeting {
  id?: string;
  creator: string;
  canale?: string;
  quando_iso?: string;
  reminded_24h?: boolean;
  reminded_3h?: boolean;
}

/** Chi puo' inviare una bozza (kv drafts_send), per l'etichetta in dashboard. */
export interface DraftSend {
  by: 'agente' | 'valerio';
  canale?: 'email' | 'dm';
  motivo?: string;
  scade?: string;
}

/** Un pezzo pianificato dallo STRATEGA (dentro il kv piano_editoriale). */
export interface EditorialPiece {
  id: string;
  data: string; // YYYY-MM-DD
  formato: 'video' | 'carosello' | string;
  angolo?: string;
  tema?: string;
  hook?: string;
  canali?: string[];
  assegnato_a?: 'video' | 'caroselli' | string;
  stato?: 'pianificato' | 'in_produzione' | 'pronto' | 'pubblicato' | string;
  nota?: string;
}

/** Il calendario editoriale scritto dallo STRATEGA (kv piano_editoriale):
 *  gli ordini che i ruoli contenuti (video, caroselli, publisher, community) eseguono. */
export interface EditorialPlan {
  aggiornato_da?: string;
  updated_at?: string;
  cadenza?: string;
  pezzi: EditorialPiece[];
}

/** Una proposta di cambio profilo dello STRATEGA (in attesa del PIN di Valerio),
 *  dentro stratega_stato.proposte_profilo. Mai applicata in automatico. */
export interface ProfileProposal {
  tipo: 'bio' | 'foto' | 'pinned' | 'strategia' | string;
  attuale?: string;
  proposta?: string;
  perche?: string;
  stato?: string;
}

/** Il cruscotto dello STRATEGA (kv stratega_stato): la foto viva della strategia
 *  che Valerio guarda a colpo d'occhio. Numeri veri letti dagli insight, mai a memoria. */
export interface StrategaStato {
  follower?: string | number;
  follower_delta?: string;
  reach_7g?: string | number;
  eng_rate?: string;
  post_migliore?: string;
  cosa_funziona?: string[];
  cosa_taglio?: string[];
  prossime_mosse?: string[];
  proposte_profilo?: ProfileProposal[];
  updated_at?: string;
  nota?: string;
}

export interface DashboardData {
  agents: Agent[];
  messages: Message[];
  runs: AgentRun[];
  feed: FeedItem[];
  creators: Creator[];
  drafts: Draft[];
  reddit: RedditItem[];
  redditKarma: number;
  leadTotals: { tot: number; pronto: number; da_arricchire: number; scartato: number };
  scoutStats: ScoutStats | null;
  videos: VideoItem[];
  carousels: CarouselItem[];
  publisherStato: PublisherStato | null;
  communityStato: CommunityStato | null;
  guardianoHealth: GuardianoHealth | null;
  meetLink: MeetLink | null;
  meetings: Meeting[];
  draftsSend: Record<string, DraftSend>;
  editorialPlan: EditorialPlan | null;
  strategaStato: StrategaStato | null;
  trendScout: TrendScoutStato | null;
  seoStato: SeoStato | null;
  seoArticoli: SeoArticoloFull[];
  croStato: CroStato | null;
  leads: LeadRow[];
  loading: boolean;
  live: boolean; // realtime collegato
  mode: 'supabase' | 'demo';
}

/* ---------- I 3 nuovi ruoli: Trend-scout, SEO, CRO ---------- */

/** Radar del TREND-SCOUT (kv trend_scout): i trend del giorno da cavalcare. */
export interface TrendItem {
  tipo: 'audio' | 'format' | 'hook' | 'news' | string;
  titolo: string;
  dove?: string;
  perche_rilevante?: string;
  finestra?: string;
  fonte?: string;
  idea_aggancio?: string;
}
export interface TrendScoutStato {
  data?: string;
  trend: TrendItem[];
  nota?: string;
  updated_at?: string;
}

/** Cruscotto SEO (kv seo_stato): keyword, articoli, migliorie al sito. */
export interface SeoKeyword {
  kw: string;
  intento?: string;
  difficolta?: 'bassa' | 'media' | 'alta' | string;
  stato?: 'pianificata' | 'bozza' | 'pubblicata' | string;
}
export interface SeoArticolo {
  titolo: string;
  kw?: string;
  stato?: 'bozza' | 'pubblicato' | string;
}

/** Articolo SEO completo (kv seo_articolo_<slug>): testo + stato approvabile. */
export interface SeoArticoloFull {
  key: string; // chiave kv, es. seo_articolo_rimborso_ryanair
  titolo?: string;
  kw?: string;
  markdown: string; // il testo dell'articolo
  stato: 'bozza' | 'approvato' | 'scartato' | string;
  decided_at?: string | null;
}
export interface SeoMiglioria {
  cosa: string;
  priorita?: 'alta' | 'media' | 'bassa' | string;
}
export interface SeoStato {
  keyword_target?: SeoKeyword[];
  articoli?: SeoArticolo[];
  migliorie_sito?: SeoMiglioria[];
  updated_at?: string;
  nota?: string;
}

/** Cruscotto CRO (kv cro_stato): attriti del funnel + proposte da approvare. */
export interface CroAttrito {
  tappa: 'landing' | 'verdetto' | 'pratica' | string;
  attrito: string;
  gravita?: 'alta' | 'media' | 'bassa' | string;
}
export interface CroProposta {
  cosa: string;
  perche?: string;
  impatto_atteso?: string;
  come_misurare?: string;
  priorita?: 'alta' | 'media' | 'bassa' | string;
  stato?: 'in_attesa' | 'applicata' | 'scartata' | string;
}
export interface CroStato {
  funnel?: CroAttrito[];
  proposte?: CroProposta[];
  updated_at?: string;
  nota?: string;
}
