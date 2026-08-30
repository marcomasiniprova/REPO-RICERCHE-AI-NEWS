'use client';

import Image from 'next/image';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { CalendarClock, History, PackageCheck, ChevronRight, Crown } from 'lucide-react';
import type { Agent } from '@/lib/types';
import { StatusPill } from '@/components/ui';
import { cn, nextRunLabel, timeAgo } from '@/lib/utils';

export default function AgentCard({
  agent,
  index = 0,
  lead = false,
  persona,
  lastResult,
}: {
  agent: Agent;
  index?: number;
  lead?: boolean; // capo reparto
  persona?: string; // soprannome/carattere
  lastResult?: string; // cosa ha fatto oggi (dal feed)
}) {
  const working = agent.status === 'working';
  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, delay: index * 0.07, ease: [0, 0, 0.2, 1] }}
    >
      <Link
        href={`/agenti/${agent.slug}`}
        className={cn(
          'card card-hover group relative block overflow-hidden p-5',
          working && 'border-brand-200 shadow-[var(--shadow-glow)]',
        )}
      >
        {working && (
          <div className="pointer-events-none absolute inset-0 bg-gradient-to-br from-brand-50/70 via-transparent to-transparent" />
        )}
        <div className="relative flex items-start gap-4">
          {/* Avatar con anello live */}
          <div className="relative h-[62px] w-[62px] shrink-0">
            {working && <span className="ring-live absolute -inset-[3px] rounded-2xl opacity-80" />}
            <span
              className="relative flex h-full w-full items-center justify-center rounded-2xl border border-line bg-white shadow-[var(--shadow-card)]"
            >
              <Image src={agent.avatar} alt={agent.name} width={44} height={44} />
            </span>
          </div>

          <div className="min-w-0 flex-1">
            <div className="flex items-center justify-between gap-2">
              <h3 className="font-display truncate text-[16.5px] font-bold tracking-tight text-deep">
                {agent.name}
              </h3>
              <StatusPill status={agent.status} />
            </div>
            <div className="flex flex-wrap items-center gap-1.5">
              <span className="text-[12px] font-medium text-brand-600">{agent.role}</span>
              {lead && (
                <span className="inline-flex items-center gap-0.5 rounded-full bg-tan px-1.5 py-0.5 text-[9.5px] font-bold uppercase tracking-wide text-tan-ink">
                  <Crown size={9} /> Capo reparto
                </span>
              )}
            </div>
            {persona && <div className="mt-0.5 text-[11px] italic text-ink-3">“{persona}”</div>}
            <p className="mt-1 line-clamp-2 text-[12.5px] leading-snug text-ink-2">
              {working && agent.current_task
                ? agent.current_task
                : lastResult
                  ? lastResult
                  : agent.tagline}
            </p>
          </div>
        </div>

        <div className="relative mt-4 grid grid-cols-3 gap-2 border-t border-line pt-3 text-[11px] text-ink-3">
          <div className="flex items-center gap-1.5">
            <History size={12} className="shrink-0" />
            <span className="truncate">
              Ultimo: <b className="font-semibold text-ink-2">{timeAgo(agent.last_run_at)}</b>
            </span>
          </div>
          <div className="flex items-center gap-1.5">
            <CalendarClock size={12} className="shrink-0" />
            <span className="truncate">
              Prossimo: <b className="font-semibold text-ink-2">{working ? 'in corso' : nextRunLabel(agent.cron)}</b>
            </span>
          </div>
          <div className="flex items-center justify-end gap-1.5">
            <PackageCheck size={12} className="shrink-0" />
            <span>
              Oggi: <b className="font-semibold text-ink-2">{agent.today_count}</b>
            </span>
            <ChevronRight
              size={13}
              className="ml-1 text-ink-3 transition-transform duration-200 group-hover:translate-x-0.5 group-hover:text-brand-600"
            />
          </div>
        </div>
      </Link>
    </motion.div>
  );
}
