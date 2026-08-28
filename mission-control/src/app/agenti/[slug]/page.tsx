'use client';

import { use } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { motion } from 'framer-motion';
import {
  ArrowLeft,
  CalendarClock,
  History,
  PackageCheck,
  Timer,
  Wrench,
  Sparkles,
  ListOrdered,
  ShieldCheck,
  Target,
} from 'lucide-react';
import { useData } from '@/lib/store';
import { StatusPill, EmptyState, CountUp } from '@/components/ui';
import LiveBadge from '@/components/LiveBadge';
import { cn, fmtDay, fmtTime, nextRunLabel, timeAgo } from '@/lib/utils';
import { AGENT_SPECS } from '@/data/agentSpecs';

export default function AgentPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = use(params);
  const { agents, runs, feed, loading } = useData();

  if (!loading && agents.length > 0 && !agents.some((a) => a.slug === slug)) notFound();
  const agent = agents.find((a) => a.slug === slug);

  const agentRuns = runs.filter((r) => r.agent_slug === slug);
  const agentFeed = feed.filter((f) => f.agent_slug === slug);
  const working = agent?.status === 'working';

  return (
    <div className="mx-auto max-w-[900px]">
      <Link
        href="/"
        className="mb-4 inline-flex items-center gap-1.5 text-[12px] font-semibold text-ink-3 transition-colors hover:text-deep"
      >
        <ArrowLeft size={13} />
        Mission Control
      </Link>

      {loading || !agent ? (
        <div className="space-y-4">
          <div className="skeleton h-[140px]" />
          <div className="skeleton h-[240px]" />
        </div>
      ) : (
        <>
          {/* Hero agente */}
          <motion.div
            initial={{ opacity: 0, y: 14 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4 }}
            className={cn(
              'card relative overflow-hidden p-6',
              working && 'border-brand-200 shadow-[var(--shadow-glow)]',
            )}
          >
            {working && (
              <div className="pointer-events-none absolute inset-0 bg-gradient-to-br from-brand-50/80 via-transparent to-transparent" />
            )}
            <div className="relative flex flex-wrap items-center gap-5">
              <div className="relative h-[84px] w-[84px] shrink-0">
                {working && <span className="ring-live absolute -inset-1 rounded-3xl opacity-80" />}
                <span className="relative flex h-full w-full items-center justify-center rounded-3xl border border-line bg-white shadow-[var(--shadow-card)]">
                  <Image src={agent.avatar} alt={agent.name} width={58} height={58} />
                </span>
              </div>
              <div className="min-w-0 flex-1">
                <div className="flex flex-wrap items-center gap-2.5">
                  <h1 className="font-display text-[24px] font-bold tracking-tight text-deep">
                    {agent.name}
                  </h1>
                  <StatusPill status={agent.status} />
                </div>
                <div className="text-[13px] font-medium text-brand-600">{agent.role}</div>
                <p className="mt-1 max-w-[52ch] text-[13px] leading-snug text-ink-2">
                  {working && agent.current_task ? agent.current_task : agent.tagline}
                </p>
              </div>
              <LiveBadge />
            </div>

            <div className="relative mt-5 grid grid-cols-2 gap-3 border-t border-line pt-4 sm:grid-cols-4">
              <div>
                <div className="flex items-center gap-1.5 text-[10.5px] font-semibold uppercase tracking-wide text-ink-3">
                  <History size={11} /> Ultimo giro
                </div>
                <div className="font-display mt-1 text-[15px] font-bold text-deep">
                  {timeAgo(agent.last_run_at)}
                </div>
              </div>
              <div>
                <div className="flex items-center gap-1.5 text-[10.5px] font-semibold uppercase tracking-wide text-ink-3">
                  <CalendarClock size={11} /> Prossimo
                </div>
                <div className="font-display mt-1 text-[15px] font-bold text-deep">
                  {working ? 'In corso' : nextRunLabel(agent.cron)}
                </div>
              </div>
              <div>
                <div className="flex items-center gap-1.5 text-[10.5px] font-semibold uppercase tracking-wide text-ink-3">
                  <Timer size={11} /> Cadenza
                </div>
                <div className="font-display mt-1 text-[15px] font-bold text-deep">
                  {agent.schedule_label}
                </div>
              </div>
              <div>
                <div className="flex items-center gap-1.5 text-[10.5px] font-semibold uppercase tracking-wide text-ink-3">
                  <PackageCheck size={11} /> Prodotto oggi
                </div>
                <div className="font-display mt-1 text-[15px] font-bold text-deep">
                  <CountUp to={agent.today_count} />
                </div>
              </div>
            </div>
          </motion.div>

          {/* Scheda tecnica */}
          {AGENT_SPECS[slug] && (
            <motion.div
              initial={{ opacity: 0, y: 14 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4, delay: 0.12 }}
              className="card mt-4 overflow-hidden"
            >
              <div className="border-b border-line bg-subtle/50 px-6 py-3.5">
                <div className="flex items-center gap-2">
                  <Target size={15} className="text-brand-600" />
                  <h2 className="font-display text-[15px] font-bold tracking-tight text-deep">
                    Come lavora
                  </h2>
                </div>
                <p className="mt-1 text-[12.5px] leading-relaxed text-ink-2">
                  {AGENT_SPECS[slug].missione}
                </p>
              </div>

              <div className="grid gap-0 md:grid-cols-2">
                {/* Tool collegati */}
                <div className="border-b border-line px-6 py-4 md:border-r">
                  <div className="mb-2.5 flex items-center gap-1.5 text-[10.5px] font-semibold uppercase tracking-wide text-ink-3">
                    <Wrench size={11} /> Tool collegati
                  </div>
                  <div className="space-y-2">
                    {AGENT_SPECS[slug].tools.map((t) => (
                      <div key={t.name} className="flex items-baseline gap-2">
                        <span className="shrink-0 rounded-lg bg-brand-50 px-2 py-0.5 text-[11px] font-bold text-brand-700">
                          {t.name}
                        </span>
                        <span className="text-[11.5px] leading-snug text-ink-2">{t.detail}</span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Skill */}
                <div className="border-b border-line px-6 py-4">
                  <div className="mb-2.5 flex items-center gap-1.5 text-[10.5px] font-semibold uppercase tracking-wide text-ink-3">
                    <Sparkles size={11} /> Skill
                  </div>
                  <ul className="space-y-1.5">
                    {AGENT_SPECS[slug].skills.map((s) => (
                      <li key={s} className="flex items-start gap-2 text-[12px] leading-snug text-ink-2">
                        <span className="mt-[7px] h-1 w-1 shrink-0 rounded-full bg-brand-400" />
                        {s}
                      </li>
                    ))}
                  </ul>
                </div>

                {/* Flusso */}
                <div className="border-b border-line px-6 py-4 md:border-b-0 md:border-r">
                  <div className="mb-2.5 flex items-center gap-1.5 text-[10.5px] font-semibold uppercase tracking-wide text-ink-3">
                    <ListOrdered size={11} /> Il suo giro, passo per passo
                  </div>
                  <ol className="space-y-2">
                    {AGENT_SPECS[slug].flusso.map((f, i) => (
                      <li key={f.step} className="flex items-start gap-2.5">
                        <span className="mt-0.5 flex h-[18px] w-[18px] shrink-0 items-center justify-center rounded-full bg-deep text-[9.5px] font-bold text-mint">
                          {i + 1}
                        </span>
                        <div className="min-w-0">
                          <span className="text-[12px] font-semibold text-deep">{f.step}</span>
                          <span className="text-[11.5px] text-ink-3"> · {f.detail}</span>
                        </div>
                      </li>
                    ))}
                  </ol>
                </div>

                {/* Regole dure */}
                <div className="px-6 py-4">
                  <div className="mb-2.5 flex items-center gap-1.5 text-[10.5px] font-semibold uppercase tracking-wide text-ink-3">
                    <ShieldCheck size={11} /> Regole dure
                  </div>
                  <ul className="space-y-1.5">
                    {AGENT_SPECS[slug].regole.map((r) => (
                      <li key={r} className="flex items-start gap-2 text-[12px] leading-snug text-ink-2">
                        <ShieldCheck size={12} className="mt-0.5 shrink-0 text-brand-600" />
                        {r}
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            </motion.div>
          )}

          {/* Storico giri */}
          <div className="mb-3 mt-7 flex items-center justify-between">
            <h2 className="font-display text-[17px] font-bold tracking-tight text-deep">
              Storico giri
            </h2>
            <span className="text-[11.5px] text-ink-3">{agentRuns.length} registrati</span>
          </div>
          {agentRuns.length === 0 ? (
            <EmptyState
              title="Nessun giro registrato ancora"
              note="Da quando la dashboard e collegata, ogni giro dell'agente viene tracciato qui con esito e output."
            />
          ) : (
            <div className="card overflow-hidden">
              <table className="w-full text-left text-[12.5px]">
                <thead>
                  <tr className="border-b border-line bg-subtle/60 text-[10.5px] uppercase tracking-wider text-ink-3">
                    <th className="px-4 py-2.5 font-semibold">Quando</th>
                    <th className="px-4 py-2.5 font-semibold">Esito</th>
                    <th className="px-4 py-2.5 font-semibold">Riepilogo</th>
                    <th className="px-4 py-2.5 text-right font-semibold">Item</th>
                  </tr>
                </thead>
                <tbody>
                  {agentRuns.map((r) => (
                    <tr key={r.id} className="border-b border-line/60 last:border-0 hover:bg-brand-50/40">
                      <td className="whitespace-nowrap px-4 py-2.5 text-ink-2">
                        {fmtDay(r.started_at)} {fmtTime(r.started_at)}
                      </td>
                      <td className="px-4 py-2.5">
                        <span
                          className={cn(
                            'rounded-full px-2 py-0.5 text-[10.5px] font-bold',
                            r.status === 'ok' && 'bg-brand-100 text-brand-700',
                            r.status === 'running' && 'bg-tan text-tan-ink',
                            r.status === 'error' && 'bg-[#fdeceb] text-err',
                          )}
                        >
                          {r.status === 'ok' ? 'OK' : r.status === 'running' ? 'In corso' : 'Errore'}
                        </span>
                      </td>
                      <td className="max-w-[320px] px-4 py-2.5 text-ink-2">
                        <span className="line-clamp-1">{r.summary ?? '—'}</span>
                      </td>
                      <td className="px-4 py-2.5 text-right font-semibold text-deep">{r.items}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          {/* Attivita dell'agente */}
          <div className="mb-3 mt-7 flex items-center justify-between">
            <h2 className="font-display text-[17px] font-bold tracking-tight text-deep">
              Le sue attivita
            </h2>
          </div>
          {agentFeed.length === 0 ? (
            <EmptyState title="Nessuna attivita registrata" />
          ) : (
            <div className="space-y-2">
              {agentFeed.slice(0, 20).map((f) => (
                <div key={f.id} className="card flex items-center gap-3 px-4 py-2.5">
                  <span className="h-1.5 w-1.5 shrink-0 rounded-full bg-brand-400" />
                  <span className="min-w-0 flex-1 truncate text-[12.5px] text-ink-2">{f.message}</span>
                  <span className="shrink-0 text-[10.5px] text-ink-3">{timeAgo(f.ts)}</span>
                </div>
              ))}
            </div>
          )}
        </>
      )}
    </div>
  );
}
