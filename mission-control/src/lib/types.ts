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
  leads: LeadRow[];
  loading: boolean;
  live: boolean; // realtime collegato
  mode: 'supabase' | 'demo';
}
