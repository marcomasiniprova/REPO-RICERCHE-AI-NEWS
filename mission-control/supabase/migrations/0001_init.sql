-- RIVO Growth Mission Control · schema iniziale
-- Regola 8: nessun segreto qui. Solo struttura.

create table if not exists agents (
  slug text primary key,
  name text not null,
  role text not null,
  tagline text,
  avatar text,
  status text not null default 'idle' check (status in ('idle','working','error','paused')),
  current_task text,
  last_run_at timestamptz,
  schedule_label text,
  cron text,
  today_count int not null default 0,
  color text,
  sort int not null default 100,
  updated_at timestamptz default now()
);

create table if not exists agent_runs (
  id bigint generated always as identity primary key,
  agent_slug text references agents(slug) on delete cascade,
  started_at timestamptz not null default now(),
  finished_at timestamptz,
  status text not null default 'running' check (status in ('running','ok','error')),
  summary text,
  items int not null default 0
);
create index if not exists agent_runs_agent_idx on agent_runs (agent_slug, started_at desc);

create table if not exists activity_feed (
  id bigint generated always as identity primary key,
  ts timestamptz not null default now(),
  agent_slug text,
  kind text not null default 'info',
  message text not null
);
create index if not exists activity_feed_ts_idx on activity_feed (ts desc);

create table if not exists creators (
  id bigint generated always as identity primary key,
  name text not null unique,
  ig text,
  tiktok text,
  followers text,
  fascia text,
  stage text not null default 'Nuovo' check (stage in ('Nuovo','Contattato','Risposto','Call fissata','Attivo','Scartato')),
  canale text,
  email text,
  esito text,
  priorita text,
  url text,
  source text not null default 'crm' check (source in ('crm','scout')),
  updated_at timestamptz default now()
);
create index if not exists creators_stage_idx on creators (stage);

create table if not exists drafts (
  id bigint generated always as identity primary key,
  creator text not null,
  channel text not null default 'email' check (channel in ('email','dm','reddit')),
  subject text,
  body text not null,
  status text not null default 'bozza' check (status in ('bozza','approvata','inviata','scartata')),
  agent_slug text,
  created_at timestamptz not null default now()
);
create index if not exists drafts_status_idx on drafts (status, created_at desc);

create table if not exists reddit_items (
  id bigint generated always as identity primary key,
  date date not null,
  subreddit text not null,
  kind text not null default 'comment' check (kind in ('comment','post')),
  title text not null,
  body_summary text,
  permalink_id text,
  status text not null default 'pubblicato'
);
create index if not exists reddit_items_date_idx on reddit_items (date desc);

create table if not exists kv (
  key text primary key,
  value jsonb,
  updated_at timestamptz default now()
);

-- RLS: lettura pubblica (la dashboard usa la anon key), scrittura solo service role.
alter table agents enable row level security;
alter table agent_runs enable row level security;
alter table activity_feed enable row level security;
alter table creators enable row level security;
alter table drafts enable row level security;
alter table reddit_items enable row level security;
alter table kv enable row level security;

create policy "lettura pubblica agents" on agents for select using (true);
create policy "lettura pubblica agent_runs" on agent_runs for select using (true);
create policy "lettura pubblica activity_feed" on activity_feed for select using (true);
create policy "lettura pubblica creators" on creators for select using (true);
create policy "lettura pubblica drafts" on drafts for select using (true);
create policy "lettura pubblica reddit_items" on reddit_items for select using (true);
create policy "lettura pubblica kv" on kv for select using (true);

-- Realtime
alter publication supabase_realtime add table agents, agent_runs, activity_feed, creators, drafts, reddit_items, kv;
