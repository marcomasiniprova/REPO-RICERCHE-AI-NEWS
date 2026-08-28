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
  status: string;
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

export interface DashboardData {
  agents: Agent[];
  runs: AgentRun[];
  feed: FeedItem[];
  creators: Creator[];
  drafts: Draft[];
  reddit: RedditItem[];
  redditKarma: number;
  leadTotals: { tot: number; pronto: number; da_arricchire: number; scartato: number };
  leads: LeadRow[];
  loading: boolean;
  live: boolean; // realtime collegato
  mode: 'supabase' | 'demo';
}
