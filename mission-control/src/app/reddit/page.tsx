'use client';

import { motion } from 'framer-motion';
import { MessageCircle, TrendingUp, CalendarDays, ExternalLink, ShieldCheck } from 'lucide-react';
import { useData } from '@/lib/store';
import { PageHeader, StatCard, EmptyState, Badge } from '@/components/ui';
import LiveBadge from '@/components/LiveBadge';
import { cn, nextRunLabel } from '@/lib/utils';

const SUB_COLORS: Record<string, string> = {
  'r/ViaggiITA': 'bg-brand-100 text-brand-700',
  'r/CasualIT': 'bg-[#f7e8d6] text-tan-ink',
  'r/amexItaly': 'bg-[#e8ecf7] text-[#31497a]',
  'r/Avvocati': 'bg-[#efe6f7] text-[#5b3a7a]',
};

export default function RedditPage() {
  const { reddit, redditKarma, agents, loading } = useData();
  const agent = agents.find((a) => a.slug === 'reddit');

  const today = new Date().toISOString().slice(0, 10);
  const todayCount = reddit.filter((r) => r.date === today).length;

  return (
    <div className="mx-auto max-w-[900px]">
      <PageHeader
        title="Reddit"
        subtitle="u/Valerio_alieri: aiuto vero nelle community italiane, karma che cresce, zero spam."
        right={<LiveBadge />}
      />

      <div className="mb-7 grid grid-cols-2 gap-3.5 lg:grid-cols-4">
        {loading ? (
          Array.from({ length: 4 }).map((_, i) => <div key={i} className="skeleton h-[108px]" />)
        ) : (
          <>
            <StatCard label="Karma" value={redditKarma} hint="Verificato dai tool, mai stimato" icon={<TrendingUp size={16} />} accent />
            <StatCard label="Contributi pubblicati" value={reddit.length} hint="Commenti di puro valore" icon={<MessageCircle size={16} />} />
            <StatCard label="Oggi" value={todayCount} hint="Tetto sicuro: 15 al giorno" icon={<CalendarDays size={16} />} />
            <div className="card card-hover px-5 py-4">
              <span className="text-[11.5px] font-semibold uppercase tracking-[0.08em] text-ink-3">
                Prossimo giro
              </span>
              <div className="font-display mt-1.5 text-[17px] font-bold leading-tight text-deep">
                {agent ? nextRunLabel(agent.cron) : '—'}
              </div>
              <div className="mt-1.5 text-[11.5px] text-ink-3">{agent?.schedule_label}</div>
            </div>
          </>
        )}
      </div>

      <div className="mb-3 flex items-center justify-between">
        <h2 className="font-display text-[17px] font-bold tracking-tight text-deep">
          Contributi pubblicati
        </h2>
        <Badge tone="outline">Fase attuale: solo valore, zero link Rivolio</Badge>
      </div>

      {loading && (
        <div className="space-y-3">
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="skeleton h-[76px]" />
          ))}
        </div>
      )}

      {!loading && reddit.length === 0 && (
        <EmptyState title="Nessun contributo ancora" note="I commenti pubblicati compaiono qui con link e community." />
      )}

      {!loading && (
        <div className="space-y-2.5">
          {reddit.map((r, i) => (
            <motion.a
              key={r.id}
              href={r.permalink_url ?? `https://www.reddit.com/${r.subreddit.replace(/^r\//, 'r/')}/`}
              target="_blank"
              rel="noreferrer"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3, delay: i * 0.04 }}
              className="card card-hover flex items-start gap-3.5 p-4"
              title={r.permalink_url ? 'Apri il commento su Reddit' : 'Apri la community su Reddit'}
            >
              <span
                className={cn(
                  'mt-0.5 shrink-0 rounded-lg px-2 py-1 text-[10.5px] font-bold',
                  SUB_COLORS[r.subreddit] ?? 'bg-subtle text-ink-2',
                )}
              >
                {r.subreddit}
              </span>
              <div className="min-w-0 flex-1">
                <div className="flex items-center gap-2">
                  <span className="truncate text-[13.5px] font-semibold text-deep">«{r.title}»</span>
                  <span className="inline-flex shrink-0 items-center gap-1 text-[10.5px] font-semibold text-brand-600">
                    <ExternalLink size={11} />
                    apri
                  </span>
                </div>
                {r.body_summary && (
                  <p className="mt-0.5 text-[12px] leading-snug text-ink-2">{r.body_summary}</p>
                )}
              </div>
              <div className="shrink-0 text-right">
                <div className="text-[11px] font-semibold text-ink-2">
                  {new Date(r.date + 'T12:00:00').toLocaleDateString('it-IT', { day: 'numeric', month: 'short' })}
                </div>
                <div className="text-[10px] uppercase tracking-wide text-ok">{r.status}</div>
              </div>
            </motion.a>
          ))}
        </div>
      )}

      <div className="mt-8 flex items-start gap-2.5 rounded-xl border border-line bg-white/70 px-4 py-3 text-[12px] leading-relaxed text-ink-2">
        <ShieldCheck size={15} className="mt-0.5 shrink-0 text-brand-600" />
        Regole anti-ban attive: rapporto 9:1 valore/promozione, massimo 15 commenti al giorno, prima
        menzione di Rivolio solo a karma consolidato e con OK esplicito.
      </div>
    </div>
  );
}
