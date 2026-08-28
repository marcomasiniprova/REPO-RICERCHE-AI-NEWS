'use client';

import Image from 'next/image';
import { Activity, CheckCircle2, FileText, MessageCircle, UserPlus, AlertTriangle, Zap } from 'lucide-react';
import { useData } from '@/lib/store';
import { cn, timeAgo } from '@/lib/utils';
import type { FeedKind } from '@/lib/types';

const KIND_META: Record<FeedKind, { icon: typeof Activity; cls: string }> = {
  info: { icon: Zap, cls: 'text-ink-3 bg-subtle' },
  success: { icon: CheckCircle2, cls: 'text-ok bg-brand-50' },
  draft: { icon: FileText, cls: 'text-tan-ink bg-[#f7e8d6]' },
  creator: { icon: UserPlus, cls: 'text-brand-700 bg-brand-100' },
  reddit: { icon: MessageCircle, cls: 'text-[#d4552f] bg-[#fbe9e2]' },
  error: { icon: AlertTriangle, cls: 'text-err bg-[#fdeceb]' },
  run: { icon: Activity, cls: 'text-brand-600 bg-brand-50' },
};

export default function FeedRail() {
  const { feed, agents, loading } = useData();

  return (
    <aside className="glass sticky top-0 hidden h-screen w-[300px] shrink-0 flex-col border-l border-[var(--color-line)] px-4 py-5 xl:flex">
      <div className="mb-4 flex items-center gap-2 px-1">
        <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-deep text-mint">
          <Activity size={15} />
        </span>
        <div>
          <div className="font-display text-[14.5px] font-bold text-deep">Live feed</div>
          <div className="text-[10.5px] text-ink-3">Cosa fa la squadra, in diretta</div>
        </div>
      </div>

      <div className="-mx-1 flex-1 space-y-2 overflow-y-auto px-1 pb-4">
        {loading &&
          Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className="skeleton h-[64px] w-full" />
          ))}
        {!loading && feed.length === 0 && (
          <div className="card px-3 py-6 text-center text-[12px] text-ink-3">
            Ancora nessuna attivita registrata.
          </div>
        )}
        {!loading &&
          feed.slice(0, 40).map((f) => {
            const meta = KIND_META[f.kind] ?? KIND_META.info;
            const Icon = meta.icon;
            const agent = agents.find((a) => a.slug === f.agent_slug);
            return (
              <div key={f.id} className="feed-in card card-hover px-3 py-2.5">
                <div className="flex items-start gap-2.5">
                  <span
                    className={cn(
                      'mt-0.5 flex h-6 w-6 shrink-0 items-center justify-center rounded-md',
                      meta.cls,
                    )}
                  >
                    <Icon size={13} />
                  </span>
                  <div className="min-w-0">
                    <div className="flex items-center gap-1.5">
                      {agent && (
                        <Image
                          src={agent.avatar}
                          alt=""
                          width={14}
                          height={14}
                          className="rounded-full"
                        />
                      )}
                      <span className="truncate text-[10.5px] font-semibold uppercase tracking-wide text-ink-3">
                        {agent ? agent.name.replace('RIVO - ', '') : 'Sistema'}
                      </span>
                      <span className="ml-auto shrink-0 text-[10px] text-ink-3">{timeAgo(f.ts)}</span>
                    </div>
                    <p className="mt-0.5 text-[12px] leading-snug text-ink-2">{f.message}</p>
                  </div>
                </div>
              </div>
            );
          })}
      </div>
    </aside>
  );
}
