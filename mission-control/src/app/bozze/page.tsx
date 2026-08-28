'use client';

import { useMemo, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Mail, MessageCircle, X, ShieldCheck } from 'lucide-react';
import { useData } from '@/lib/store';
import { PageHeader, Badge, EmptyState } from '@/components/ui';
import LiveBadge from '@/components/LiveBadge';
import { cn, fmtDay, fmtTime } from '@/lib/utils';
import type { Draft, DraftStatus } from '@/lib/types';

const FILTERS: Array<{ id: DraftStatus | 'tutte'; label: string }> = [
  { id: 'bozza', label: 'Da approvare' },
  { id: 'approvata', label: 'Approvate' },
  { id: 'inviata', label: 'Inviate' },
  { id: 'tutte', label: 'Tutte' },
];

const STATUS_TONE: Record<DraftStatus, { label: string; cls: string }> = {
  bozza: { label: 'Da approvare', cls: 'bg-tan text-tan-ink' },
  approvata: { label: 'Approvata', cls: 'bg-brand-100 text-brand-700' },
  inviata: { label: 'Inviata', cls: 'bg-deep text-mint' },
  scartata: { label: 'Scartata', cls: 'bg-subtle text-ink-3' },
};

export default function BozzePage() {
  const { drafts, agents, loading } = useData();
  const [filter, setFilter] = useState<DraftStatus | 'tutte'>('bozza');
  const [open, setOpen] = useState<Draft | null>(null);

  const list = useMemo(
    () => (filter === 'tutte' ? drafts : drafts.filter((d) => d.status === filter)),
    [drafts, filter],
  );

  const count = (s: DraftStatus | 'tutte') =>
    s === 'tutte' ? drafts.length : drafts.filter((d) => d.status === s).length;

  return (
    <div className="mx-auto max-w-[900px]">
      <PageHeader
        title="Bozze"
        subtitle="Email e DM preparati dagli agenti. Niente parte senza il tuo OK."
        right={<LiveBadge />}
      />

      <div className="mb-5 flex flex-wrap items-center gap-2">
        {FILTERS.map((f) => (
          <button
            key={f.id}
            onClick={() => setFilter(f.id)}
            className={cn(
              'rounded-full border px-3.5 py-1.5 text-[12px] font-semibold transition-all duration-150',
              filter === f.id
                ? 'border-deep bg-deep text-white shadow-[0_3px_10px_rgba(10,59,49,0.25)]'
                : 'border-line bg-white text-ink-2 hover:border-line-strong',
            )}
          >
            {f.label}
            <span className={cn('ml-1.5', filter === f.id ? 'text-mint' : 'text-ink-3')}>
              {count(f.id)}
            </span>
          </button>
        ))}
      </div>

      {loading && (
        <div className="space-y-3">
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="skeleton h-[84px]" />
          ))}
        </div>
      )}

      {!loading && list.length === 0 && (
        <EmptyState
          title={filter === 'bozza' ? 'Nessuna bozza in attesa' : 'Niente qui'}
          note="Quando un agente prepara un messaggio, lo trovi qui pronto da leggere. L'approvazione resta in chat con Claude, cosi ogni invio ha il tuo OK esplicito."
        />
      )}

      {!loading && list.length > 0 && (
        <div className="space-y-3">
          {list.map((d, i) => {
            const agent = agents.find((a) => a.slug === d.agent_slug);
            const tone = STATUS_TONE[d.status];
            return (
              <motion.button
                key={d.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3, delay: i * 0.04 }}
                onClick={() => setOpen(d)}
                className="card card-hover block w-full p-4 text-left"
              >
                <div className="flex items-center gap-3">
                  <span
                    className={cn(
                      'flex h-9 w-9 shrink-0 items-center justify-center rounded-xl',
                      d.channel === 'email' ? 'bg-brand-50 text-brand-600' : 'bg-[#fbe9e2] text-[#a63d20]',
                    )}
                  >
                    {d.channel === 'email' ? <Mail size={16} /> : <MessageCircle size={16} />}
                  </span>
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-2">
                      <span className="truncate text-[13.5px] font-semibold text-deep">
                        {d.subject || `Messaggio per ${d.creator}`}
                      </span>
                      <span className={cn('shrink-0 rounded-full px-2 py-0.5 text-[10px] font-bold', tone.cls)}>
                        {tone.label}
                      </span>
                    </div>
                    <div className="mt-0.5 flex items-center gap-2 text-[11px] text-ink-3">
                      <span className="font-medium text-brand-600">{d.creator}</span>
                      <span>·</span>
                      <span>{agent?.name.replace('RIVO - ', '') ?? d.agent_slug}</span>
                      <span>·</span>
                      <span>
                        {fmtDay(d.created_at)} {fmtTime(d.created_at)}
                      </span>
                    </div>
                  </div>
                </div>
              </motion.button>
            );
          })}
        </div>
      )}

      <div className="mt-8 flex items-start gap-2.5 rounded-xl border border-brand-200 bg-brand-50/60 px-4 py-3 text-[12px] leading-relaxed text-brand-700">
        <ShieldCheck size={15} className="mt-0.5 shrink-0" />
        Regola numero 1 del progetto: nessun messaggio parte da solo. Gli agenti preparano, tu leggi
        qui, e l'invio avviene solo quando dici «manda» in chat.
      </div>

      {/* Drawer lettura bozza */}
      <AnimatePresence>
        {open && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setOpen(null)}
              className="fixed inset-0 z-40 bg-deep-2/30 backdrop-blur-[2px]"
            />
            <motion.div
              initial={{ x: 40, opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
              exit={{ x: 40, opacity: 0 }}
              transition={{ type: 'spring', stiffness: 300, damping: 30 }}
              className="fixed right-0 top-0 z-50 flex h-screen w-full max-w-[480px] flex-col border-l border-line bg-white shadow-2xl"
            >
              <div className="flex items-center justify-between border-b border-line px-5 py-4">
                <div>
                  <div className="font-display text-[15px] font-bold text-deep">
                    {open.subject || `Messaggio per ${open.creator}`}
                  </div>
                  <div className="mt-0.5 text-[11px] text-ink-3">
                    Per <b className="text-brand-600">{open.creator}</b> · canale{' '}
                    {open.channel === 'email' ? 'email' : 'DM'}
                  </div>
                </div>
                <button
                  onClick={() => setOpen(null)}
                  className="rounded-lg p-2 text-ink-3 transition-colors hover:bg-subtle hover:text-deep"
                >
                  <X size={16} />
                </button>
              </div>
              <div className="flex-1 overflow-y-auto whitespace-pre-wrap px-5 py-4 text-[13px] leading-relaxed text-ink">
                {open.body}
              </div>
              <div className="border-t border-line px-5 py-3.5">
                <Badge tone="tan">Per approvare o modificare: dillo in chat a Claude</Badge>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
}
