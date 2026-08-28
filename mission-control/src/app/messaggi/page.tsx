'use client';

import { useMemo, useState } from 'react';
import { motion } from 'framer-motion';
import { Mail, AtSign, Search } from 'lucide-react';
import { useData } from '@/lib/store';
import { PageHeader, EmptyState, Badge } from '@/components/ui';
import LiveBadge from '@/components/LiveBadge';
import { cn, fmtDay, fmtTime, timeAgo } from '@/lib/utils';
import type { Message } from '@/lib/types';

type Filter = 'tutti' | 'dm' | 'email';

interface Thread {
  key: string;
  name: string;
  channelSet: Set<string>;
  last: Message;
  items: Message[];
}

export default function MessaggiPage() {
  const { messages, loading } = useData();
  const [filter, setFilter] = useState<Filter>('tutti');
  const [q, setQ] = useState('');
  const [sel, setSel] = useState<string | null>(null);

  const threads = useMemo<Thread[]>(() => {
    const by = new Map<string, Thread>();
    for (const m of messages) {
      if (filter !== 'tutti' && m.channel !== filter) continue;
      const key = m.creator_name ?? m.counterpart;
      const t = by.get(key);
      if (t) {
        t.items.push(m);
        t.channelSet.add(m.channel);
        if (m.ts > t.last.ts) t.last = m;
      } else {
        by.set(key, { key, name: key, channelSet: new Set([m.channel]), last: m, items: [m] });
      }
    }
    let list = [...by.values()];
    const term = q.trim().toLowerCase();
    if (term) list = list.filter((t) => t.name.toLowerCase().includes(term));
    list.sort((a, b) => (a.last.ts < b.last.ts ? 1 : -1));
    for (const t of list) t.items.sort((a, b) => (a.ts < b.ts ? -1 : 1));
    return list;
  }, [messages, filter, q]);

  const current = threads.find((t) => t.key === sel) ?? threads[0];

  return (
    <div className="mx-auto max-w-[1120px]">
      <PageHeader
        title="Messaggi"
        subtitle="Le conversazioni vere coi creator: DM Instagram ed email, come sono uscite davvero."
        right={<LiveBadge />}
      />

      <div className="mb-4 flex flex-wrap items-center gap-2.5">
        {(['tutti', 'dm', 'email'] as Filter[]).map((f) => (
          <button
            key={f}
            onClick={() => setFilter(f)}
            className={cn(
              'rounded-full border px-3.5 py-1.5 text-[12px] font-semibold capitalize transition-all',
              filter === f
                ? 'border-deep bg-deep text-white shadow-[0_3px_10px_rgba(10,59,49,0.25)]'
                : 'border-line bg-white text-ink-2 hover:border-line-strong',
            )}
          >
            {f === 'dm' ? 'DM Instagram' : f === 'email' ? 'Email' : 'Tutti'}
          </button>
        ))}
        <div className="relative min-w-[180px] flex-1 sm:max-w-[240px]">
          <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-ink-3" />
          <input
            value={q}
            onChange={(e) => setQ(e.target.value)}
            placeholder="Cerca creator…"
            className="card w-full rounded-xl py-2 pl-9 pr-3 text-[12.5px] outline-none placeholder:text-ink-3 focus:border-brand-400 focus:shadow-[0_0_0_3px_rgba(46,167,141,0.15)]"
          />
        </div>
        <Badge tone="outline">{messages.length} messaggi sincronizzati</Badge>
      </div>

      {loading ? (
        <div className="grid gap-3 lg:grid-cols-[320px_1fr]">
          <div className="skeleton h-[400px]" />
          <div className="skeleton h-[400px]" />
        </div>
      ) : threads.length === 0 ? (
        <EmptyState
          title="Nessun messaggio qui"
          note="Appena gli agenti gestiscono DM ed email, le conversazioni compaiono in questa sezione."
        />
      ) : (
        <div className="grid gap-3 lg:grid-cols-[320px_1fr]">
          {/* Lista conversazioni */}
          <div className="card max-h-[640px] overflow-y-auto p-2">
            {threads.map((t) => (
              <button
                key={t.key}
                onClick={() => setSel(t.key)}
                className={cn(
                  'block w-full rounded-xl px-3 py-2.5 text-left transition-colors',
                  current?.key === t.key ? 'bg-brand-50' : 'hover:bg-subtle',
                )}
              >
                <div className="flex items-center gap-2">
                  <span className="truncate text-[13px] font-semibold text-deep">{t.name}</span>
                  <span className="ml-auto shrink-0 text-[10px] text-ink-3">{timeAgo(t.last.ts)}</span>
                </div>
                <div className="mt-0.5 flex items-center gap-1.5">
                  {t.channelSet.has('dm') && <AtSign size={11} className="shrink-0 text-brand-600" />}
                  {t.channelSet.has('email') && <Mail size={11} className="shrink-0 text-tan-ink" />}
                  <span className="truncate text-[11.5px] text-ink-3">
                    {t.last.direction === 'out' ? 'Tu: ' : ''}
                    {t.last.body}
                  </span>
                </div>
              </button>
            ))}
          </div>

          {/* Thread */}
          {current && (
            <motion.div
              key={current.key}
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.25 }}
              className="card flex max-h-[640px] flex-col overflow-hidden"
            >
              <div className="border-b border-line px-5 py-3">
                <div className="font-display text-[15px] font-bold text-deep">{current.name}</div>
                <div className="text-[11px] text-ink-3">
                  {current.items.length} messaggi ·{' '}
                  {[...current.channelSet].map((c) => (c === 'dm' ? 'DM Instagram' : 'Email')).join(' + ')}
                </div>
              </div>
              <div className="flex-1 space-y-3 overflow-y-auto px-5 py-4">
                {current.items.map((m) => (
                  <div key={m.id} className={cn('flex', m.direction === 'out' ? 'justify-end' : 'justify-start')}>
                    <div
                      className={cn(
                        'max-w-[78%] rounded-2xl px-4 py-2.5 text-[12.5px] leading-relaxed shadow-[var(--shadow-card)]',
                        m.direction === 'out'
                          ? 'rounded-br-md bg-deep text-white'
                          : 'rounded-bl-md border border-line bg-white text-ink',
                      )}
                    >
                      {m.subject && (
                        <div className={cn('mb-1 text-[11px] font-bold', m.direction === 'out' ? 'text-mint' : 'text-brand-700')}>
                          {m.channel === 'email' ? '✉ ' : ''}{m.subject}
                        </div>
                      )}
                      <div className="whitespace-pre-wrap">{m.body}</div>
                      <div className={cn('mt-1.5 text-right text-[10px]', m.direction === 'out' ? 'text-white/60' : 'text-ink-3')}>
                        {fmtDay(m.ts)} {fmtTime(m.ts)} · {m.channel === 'dm' ? 'DM' : 'email'}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </motion.div>
          )}
        </div>
      )}
    </div>
  );
}
