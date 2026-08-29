'use client';

import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
} from 'react';
import { createClient, type SupabaseClient } from '@supabase/supabase-js';
import type {
  Agent,
  AgentRun,
  Creator,
  DashboardData,
  Draft,
  FeedItem,
  LeadRow,
  Message,
  RedditItem,
  ScoutStats,
  VideoItem,
  GuardianoHealth,
  MeetLink,
  Meeting,
  DraftSend,
  EditorialPlan,
  StrategaStato,
  CarouselItem,
  PublisherStato,
  CommunityStato,
} from './types';
import { fmtFollowers } from './utils';
import agentsSeed from '@/data/agents.json';
import crmSeed from '@/data/crm.json';
import redditSeed from '@/data/reddit.json';
import leadsSeed from '@/data/leads.json';

const SUPA_URL = process.env.NEXT_PUBLIC_SUPABASE_URL;
const SUPA_KEY = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

const DataContext = createContext<DashboardData | null>(null);

export function useData(): DashboardData {
  const d = useContext(DataContext);
  if (!d) throw new Error('useData fuori dal DataProvider');
  return d;
}

/* ---------- seed demo (dati veri, snapshot 28/8) ---------- */

function demoAgents(): Agent[] {
  return (agentsSeed as Array<Record<string, unknown>>).map((a) => ({
    slug: a.slug as string,
    name: a.name as string,
    role: a.role as string,
    tagline: a.tagline as string,
    avatar: a.avatar as string,
    status: 'idle',
    current_task: null,
    last_run_at: null,
    schedule_label: a.schedule_label as string,
    cron: (a.cron as string) ?? null,
    today_count: 0,
    color: a.color as string,
    updated_at: null,
  }));
}

function demoCreators(): Creator[] {
  const crm = (crmSeed as Array<Record<string, unknown>>).map((c, i) => ({
    id: i + 1,
    name: c.name as string,
    ig: (c.ig as string) ?? null,
    tiktok: (c.tiktok as string) ?? null,
    followers: (c.followers as string) ?? null,
    fascia: (c.fascia as string) ?? null,
    stage: c.stage as Creator['stage'],
    canale: (c.canale as string) ?? null,
    email: (c.email as string) ?? null,
    esito: (c.esito as string) ?? null,
    priorita: (c.priorita as string) ?? null,
    url: (c.url as string) ?? null,
    source: 'crm' as const,
    updated_at: null,
  }));
  const scout = (leadsSeed.rows as LeadRow[])
    .filter((r) => r.s === 'Pronto' || r.s === 'Da arricchire')
    .map((r, i) => ({
      id: 1000 + i,
      name: r.u,
      ig: r.p === 'Instagram' ? r.u : null,
      tiktok: r.p === 'TikTok' ? r.u : null,
      followers: fmtFollowers(r.f),
      fascia: null,
      stage: 'Nuovo' as const,
      canale: null,
      email: r.e,
      esito: r.s === 'Pronto' ? 'Trovato dallo SCOUT, pronto al primo contatto.' : 'In arricchimento.',
      priorita: null,
      url: r.url,
      source: 'scout' as const,
      updated_at: null,
    }));
  return [...crm, ...scout];
}

function demoFeed(): FeedItem[] {
  // Fatti veri, con orari reali del 27-28/8
  const items: Array<[string, string | null, FeedItem['kind'], string]> = [
    ['2026-08-28T07:54:00Z', null, 'info', 'Mission Control avviata in modalita demo: in attesa del collegamento Supabase.'],
    ['2026-08-27T18:20:00Z', 'ig_email', 'success', 'Conferma call inviata a Julian con il link Meet per domani alle 17:00.'],
    ['2026-08-27T16:45:00Z', 'reddit', 'reddit', '4 commenti di valore pubblicati oggi su r/ViaggiITA e r/CasualIT (4/15 del tetto giornaliero).'],
    ['2026-08-27T12:33:00Z', 'scout', 'success', 'Actor Instagram ufficiale attivo: scrape 8/8 riusciti nel giro di prova.'],
    ['2026-08-27T09:00:00Z', 'ig_email', 'creator', 'Call fissata con Trolleygirl: venerdi 28/8 alle 16:30.'],
    ['2026-08-26T08:00:00Z', 'ig_email', 'creator', 'Call fissata con Vanessa Russo Vidali: venerdi 28/8 alle 9:00 su Meet.'],
  ];
  return items.map(([ts, agent, kind, message], i) => ({
    id: i + 1,
    ts,
    agent_slug: agent,
    kind,
    message,
  }));
}

function demoReddit(): RedditItem[] {
  return (redditSeed.items as Array<Record<string, unknown>>).map((r, i) => ({
    id: i + 1,
    date: r.date as string,
    subreddit: r.subreddit as string,
    kind: r.kind as RedditItem['kind'],
    title: r.title as string,
    body_summary: (r.body_summary as string) ?? null,
    permalink_id: (r.permalink_id as string) ?? null,
    status: r.status as string,
  }));
}

/* ---------- provider ---------- */

export function DataProvider({ children }: { children: React.ReactNode }) {
  const hasSupabase = Boolean(SUPA_URL && SUPA_KEY);
  const [agents, setAgents] = useState<Agent[]>([]);
  const [runs, setRuns] = useState<AgentRun[]>([]);
  const [feed, setFeed] = useState<FeedItem[]>([]);
  const [creators, setCreators] = useState<Creator[]>([]);
  const [drafts, setDrafts] = useState<Draft[]>([]);
  const [reddit, setReddit] = useState<RedditItem[]>([]);
  const [messages, setMessages] = useState<Message[]>([]);
  const [redditKarma, setRedditKarma] = useState<number>(0);
  const [scoutStats, setScoutStats] = useState<ScoutStats | null>(null);
  const [videos, setVideos] = useState<VideoItem[]>([]);
  const [carousels, setCarousels] = useState<CarouselItem[]>([]);
  const [publisherStato, setPublisherStato] = useState<PublisherStato | null>(null);
  const [communityStato, setCommunityStato] = useState<CommunityStato | null>(null);
  const [guardianoHealth, setGuardianoHealth] = useState<GuardianoHealth | null>(null);
  const [meetLink, setMeetLink] = useState<MeetLink | null>(null);
  const [meetings, setMeetings] = useState<Meeting[]>([]);
  const [draftsSend, setDraftsSend] = useState<Record<string, DraftSend>>({});
  const [editorialPlan, setEditorialPlan] = useState<EditorialPlan | null>(null);
  const [strategaStato, setStrategaStato] = useState<StrategaStato | null>(null);
  const [loading, setLoading] = useState(true);
  const [live, setLive] = useState(false);
  const supa = useRef<SupabaseClient | null>(null);

  /* --- modalita demo: seed locale --- */
  useEffect(() => {
    if (hasSupabase) return;
    const t = setTimeout(() => {
      setAgents(demoAgents());
      setCreators(demoCreators());
      setFeed(demoFeed());
      setReddit(demoReddit());
      setMessages([]);
      setRedditKarma((redditSeed as { karma: number }).karma);
      setDrafts([]);
      setRuns([]);
      setLoading(false);
    }, 350);
    return () => clearTimeout(t);
  }, [hasSupabase]);

  /* --- demo live: simulazione visiva attivabile con ?demo=live --- */
  useEffect(() => {
    if (hasSupabase) return;
    if (typeof window === 'undefined') return;
    if (!new URLSearchParams(window.location.search).has('demo')) return;
    const tasks = [
      'Scansiono gli hashtag travel del giorno',
      'Arricchisco 3 profili Instagram',
      'Valuto i profili col cervello GPT',
      'Scrivo i risultati in pipeline',
    ];
    let step = 0;
    const assert_ = (task: string) =>
      setAgents((prev) =>
        prev.map((a) =>
          a.slug === 'scout'
            ? { ...a, status: 'working' as const, current_task: task, updated_at: new Date().toISOString() }
            : a,
        ),
      );
    const t0 = setTimeout(() => assert_(tasks[0]), 600);
    const int = setInterval(() => {
      step += 1;
      const task = tasks[step % tasks.length];
      assert_(task);
      setFeed((prev) => [
        {
          id: Date.now(),
          ts: new Date().toISOString(),
          agent_slug: 'scout',
          kind: 'info' as const,
          message: task,
        },
        ...prev,
      ]);
    }, 3200);
    return () => {
      clearTimeout(t0);
      clearInterval(int);
    };
  }, [hasSupabase]);

  /* --- modalita supabase: fetch + realtime --- */
  const refetch = useCallback(async (table?: string) => {
    const c = supa.current;
    if (!c) return;
    const jobs: Array<Promise<void>> = [];
    const want = (t: string) => !table || table === t;

    if (want('agents'))
      jobs.push(
        c.from('agents').select('*').order('sort', { ascending: true }).then(({ data }) => {
          if (data) setAgents(data as Agent[]);
        }) as unknown as Promise<void>,
      );
    if (want('agent_runs'))
      jobs.push(
        c
          .from('agent_runs')
          .select('*')
          .order('started_at', { ascending: false })
          .limit(120)
          .then(({ data }) => {
            if (data) setRuns(data as AgentRun[]);
          }) as unknown as Promise<void>,
      );
    if (want('activity_feed'))
      jobs.push(
        c
          .from('activity_feed')
          .select('*')
          .order('ts', { ascending: false })
          .limit(80)
          .then(({ data }) => {
            if (data) setFeed(data as FeedItem[]);
          }) as unknown as Promise<void>,
      );
    if (want('creators'))
      jobs.push(
        c
          .from('creators')
          .select('*')
          .order('updated_at', { ascending: false })
          .limit(600)
          .then(({ data }) => {
            if (data) setCreators(data as Creator[]);
          }) as unknown as Promise<void>,
      );
    if (want('drafts'))
      jobs.push(
        c
          .from('drafts')
          .select('*')
          .order('created_at', { ascending: false })
          .limit(200)
          .then(({ data }) => {
            if (data) setDrafts(data as Draft[]);
          }) as unknown as Promise<void>,
      );
    if (want('reddit_items'))
      jobs.push(
        c
          .from('reddit_items')
          .select('*')
          .order('date', { ascending: false })
          .limit(200)
          .then(({ data }) => {
            if (data) setReddit(data as RedditItem[]);
          }) as unknown as Promise<void>,
      );
    if (want('messages'))
      jobs.push(
        c
          .from('messages')
          .select('*')
          .order('ts', { ascending: false })
          .limit(800)
          .then(({ data }) => {
            if (data) setMessages(data as Message[]);
          }) as unknown as Promise<void>,
      );
    if (want('kv'))
      jobs.push(
        c.from('kv').select('*').then(({ data }) => {
          const rows = data as Array<{ key: string; value: unknown }> | null;
          const k = rows?.find((r) => r.key === 'reddit_karma');
          if (k) setRedditKarma(Number(k.value));
          const s = rows?.find((r) => r.key === 'scout_stats');
          if (s && s.value && typeof s.value === 'object') setScoutStats(s.value as ScoutStats);
          // I video di RIVO VIDEO vivono nel kv: una chiave video_YYYY-MM-DD per giorno.
          const vids = (rows ?? [])
            .filter((r) => /^video_\d{4}-\d{2}-\d{2}$/.test(r.key) && r.value && typeof r.value === 'object')
            .map((r) => ({ ...(r.value as Omit<VideoItem, 'key'>), key: r.key }) as VideoItem)
            .sort((a, b) => (a.date < b.date ? 1 : -1));
          setVideos(vids);
          // I caroselli di RIVO CAROSELLI vivono nel kv: una chiave carosello_YYYY-MM-DD per giorno.
          const cars = (rows ?? [])
            .filter((r) => /^carosello_\d{4}-\d{2}-\d{2}$/.test(r.key) && r.value && typeof r.value === 'object')
            .map((r) => ({ ...(r.value as Omit<CarouselItem, 'key'>), key: r.key }) as CarouselItem)
            .sort((a, b) => (a.date < b.date ? 1 : -1));
          setCarousels(cars);
          const ps = rows?.find((r) => r.key === 'publisher_stato');
          if (ps && ps.value && typeof ps.value === 'object') setPublisherStato(ps.value as PublisherStato);
          const cs = rows?.find((r) => r.key === 'community_stato');
          if (cs && cs.value && typeof cs.value === 'object') setCommunityStato(cs.value as CommunityStato);
          const gh = rows?.find((r) => r.key === 'guardiano_health');
          if (gh && gh.value && typeof gh.value === 'object') setGuardianoHealth(gh.value as GuardianoHealth);
          const ml = rows?.find((r) => r.key === 'meet_link');
          if (ml && ml.value && typeof ml.value === 'object') setMeetLink(ml.value as MeetLink);
          const mt = rows?.find((r) => r.key === 'meetings');
          if (mt && Array.isArray(mt.value)) setMeetings(mt.value as Meeting[]);
          const ds = rows?.find((r) => r.key === 'drafts_send');
          if (ds && ds.value && typeof ds.value === 'object') setDraftsSend(ds.value as Record<string, DraftSend>);
          // Lo STRATEGA scrive il calendario editoriale e il suo cruscotto nel kv.
          const pe = rows?.find((r) => r.key === 'piano_editoriale');
          if (pe && pe.value && typeof pe.value === 'object') setEditorialPlan(pe.value as EditorialPlan);
          const ss = rows?.find((r) => r.key === 'stratega_stato');
          if (ss && ss.value && typeof ss.value === 'object') setStrategaStato(ss.value as StrategaStato);
        }) as unknown as Promise<void>,
      );
    await Promise.allSettled(jobs);
  }, []);

  useEffect(() => {
    if (!hasSupabase) return;
    const c = createClient(SUPA_URL!, SUPA_KEY!);
    supa.current = c;
    refetch().finally(() => setLoading(false));

    const tables = ['agents', 'agent_runs', 'activity_feed', 'creators', 'drafts', 'reddit_items', 'kv', 'messages'];
    const ch = c.channel('mission-control');
    for (const t of tables) {
      ch.on('postgres_changes', { event: '*', schema: 'public', table: t }, () => refetch(t));
    }
    ch.subscribe((status) => setLive(status === 'SUBSCRIBED'));

    // Rete di sicurezza: se il realtime cade, i dati restano freschi comunque.
    const poll = setInterval(() => refetch(), 45000);
    const onFocus = () => refetch();
    window.addEventListener('focus', onFocus);

    return () => {
      clearInterval(poll);
      window.removeEventListener('focus', onFocus);
      c.removeChannel(ch);
      supa.current = null;
    };
  }, [hasSupabase, refetch]);

  const value = useMemo<DashboardData>(() => {
    // Contatori Leads: prima scelta il kv scout_stats (numeri veri di Airtable,
    // mantenuti dagli agenti), altrimenti lo snapshot impacchettato nel build.
    const leadTotals = scoutStats ?? (leadsSeed.totals as DashboardData['leadTotals']);
    return {
      agents,
      messages,
      runs,
      feed,
      creators,
      drafts,
      reddit,
      redditKarma,
      leadTotals,
      scoutStats,
      videos,
      carousels,
      publisherStato,
      communityStato,
      guardianoHealth,
      meetLink,
      meetings,
      draftsSend,
      editorialPlan,
      strategaStato,
      leads: leadsSeed.rows as LeadRow[],
      loading,
      live,
      mode: hasSupabase ? 'supabase' : 'demo',
    };
  }, [agents, messages, runs, feed, creators, drafts, reddit, redditKarma, scoutStats, videos, carousels, publisherStato, communityStato, guardianoHealth, meetLink, meetings, draftsSend, editorialPlan, strategaStato, loading, live, hasSupabase]);

  return <DataContext.Provider value={value}>{children}</DataContext.Provider>;
}
