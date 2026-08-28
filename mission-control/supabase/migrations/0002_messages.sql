-- v2: storico messaggi (DM + email), decisioni sulle bozze, link reddit
create table if not exists messages (
  id bigint generated always as identity primary key,
  external_id text unique,
  creator_name text,
  counterpart text not null,
  channel text not null check (channel in ('dm','email')),
  direction text not null check (direction in ('in','out')),
  subject text,
  body text not null,
  ts timestamptz not null,
  created_at timestamptz default now()
);
create index if not exists messages_counterpart_idx on messages (counterpart, ts desc);
create index if not exists messages_ts_idx on messages (ts desc);

alter table drafts add column if not exists decided_at timestamptz;
alter table reddit_items add column if not exists permalink_url text;

alter table messages enable row level security;
create policy "lettura pubblica messages" on messages for select using (true);
alter publication supabase_realtime add table messages;
