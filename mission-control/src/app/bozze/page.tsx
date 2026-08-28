'use client';

import { useMemo, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Mail, MessageCircle, X, ShieldCheck, Check, Trash2, Lock, MessagesSquare } from 'lucide-react';
import { useData } from '@/lib/store';
import { PageHeader, Badge, EmptyState } from '@/components/ui';
import LiveBadge from '@/components/LiveBadge';
import { cn, fmtDay, fmtTime } from '@/lib/utils';
import type { Draft, DraftStatus } from '@/lib/types';

const FILTERS: Array<{ id: DraftStatus | 'tutte'; label: string }> = [
  { id: 'bozza', label: 'Da approvare' },
  { id: 'approvata', label: 'Approvate' },
  { id: 'inviata', label: 'Inviate' },
  { id: 'scartata', label: 'Scartate' },
  { id: 'tutte', label: 'Tutte' },
];

const STATUS_TONE: Record<DraftStatus, { label: string; cls: string }> = {
  bozza: { label: 'Da approvare', cls: 'bg-tan text-tan-ink' },
  approvata: { label: 'Approvata · parte al prossimo giro', cls: 'bg-brand-100 text-brand-700' },
  inviata: { label: 'Inviata', cls: 'bg-deep text-mint' },
  scartata: { label: 'Scartata', cls: 'bg-subtle text-ink-3' },
};

function ChannelIcon({ d }: { d: Draft }) {
  if (d.channel === 'email') return <Mail size={16} />;
  if (d.channel === 'reddit') return <MessagesSquare size={16} />;
  return <MessageCircle size={16} />;
}

export default function BozzePage() {
  const { drafts, agents, loading } = useData();
  const [filter, setFilter] = useState<DraftStatus | 'tutte'>('bozza');
  const [open, setOpen] = useState<Draft | null>(null);
  const [pinAsk, setPinAsk] = useState<{ draft: Draft; action: 'approve' | 'reject' } | null>(null);
  const [pinValue, setPinValue] = useState('');
  const [pinError, setPinError] = useState<string | null>(null);
  const [busy, setBusy] = useState<number | null>(null);
  const [decided, setDecided] = useState<Record<number, DraftStatus>>({});

  const list = useMemo(() => {
    const withLocal = drafts.map((d) => (decided[d.id] ? { ...d, status: decided[d.id] } : d));
    return filter === 'tutte' ? withLocal : withLocal.filter((d) => d.status === filter);
  }, [drafts, filter, decided]);

  const count = (s: DraftStatus | 'tutte') => {
    const withLocal = drafts.map((d) => (decided[d.id] ? { ...d, status: decided[d.id] } : d));
    return s === 'tutte' ? withLocal.length : withLocal.filter((d) => d.status === s).length;
  };

  async function decide(draft: Draft, action: 'approve' | 'reject', pin?: string) {
    const stored = pin ?? (typeof window !== 'undefined' ? localStorage.getItem('mc_pin') : null);
    if (!stored) {
      setPinValue('');
      setPinError(null);
      setPinAsk({ draft, action });
      return;
    }
    setBusy(draft.id);
    try {
      const res = await fetch('/api/decide', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ draft_id: draft.id, action, pin: stored }),
      });
      const j = await res.json();
      if (res.status === 401) {
        localStorage.removeItem('mc_pin');
        setPinValue('');
        setPinError('PIN errato, riprova.');
        setPinAsk({ draft, action });
        return;
      }
      if (j.ok) {
        try { localStorage.setItem('mc_pin', stored); } catch {}
        setDecided((p) => ({ ...p, [draft.id]: action === 'approve' ? 'approvata' : 'scartata' }));
        setPinAsk(null);
        setOpen(null);
      } else {
        setPinError(j.error ?? 'errore');
      }
    } finally {
      setBusy(null);
    }
  }

  return (
    <div className="mx-auto max-w-[900px]">
      <PageHeader
        title="Bozze"
        subtitle="Approva col PIN: l'email o il DM parte al primo giro utile dell'agente. Niente parte senza di te."
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
            <span className={cn('ml-1.5', filter === f.id ? 'text-mint' : 'text-ink-3')}>{count(f.id)}</span>
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
          note="Quando un agente prepara un messaggio, lo trovi qui pronto da leggere e approvare col tuo PIN."
        />
      )}

      {!loading && list.length > 0 && (
        <div className="space-y-3">
          {list.map((d, i) => {
            const agent = agents.find((a) => a.slug === d.agent_slug);
            const tone = STATUS_TONE[d.status];
            return (
              <motion.div
                key={d.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3, delay: i * 0.04 }}
                className="card card-hover p-4"
              >
                <div className="flex items-center gap-3">
                  <button onClick={() => setOpen(d)} className="flex min-w-0 flex-1 items-center gap-3 text-left">
                    <span
                      className={cn(
                        'flex h-9 w-9 shrink-0 items-center justify-center rounded-xl',
                        d.channel === 'email' ? 'bg-brand-50 text-brand-600' : 'bg-[#fbe9e2] text-[#a63d20]',
                      )}
                    >
                      <ChannelIcon d={d} />
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
                  </button>
                  {d.status === 'bozza' && (
                    <div className="flex shrink-0 items-center gap-2">
                      <button
                        onClick={() => decide(d, 'approve')}
                        disabled={busy === d.id}
                        className="inline-flex items-center gap-1.5 rounded-xl bg-brand-600 px-3.5 py-2 text-[12px] font-bold text-white shadow-[0_0_0_1px_rgba(14,124,107,0.45),0_4px_14px_rgba(14,124,107,0.3)] transition-all hover:bg-brand-700 hover:shadow-[0_0_0_1px_rgba(14,124,107,0.55),0_6px_18px_rgba(14,124,107,0.4)] active:scale-[0.97] disabled:opacity-50"
                      >
                        <Check size={14} />
                        Approva
                      </button>
                      <button
                        onClick={() => decide(d, 'reject')}
                        disabled={busy === d.id}
                        className="inline-flex items-center gap-1.5 rounded-xl border border-line bg-white px-3 py-2 text-[12px] font-semibold text-ink-2 transition-colors hover:border-[#f5c9c4] hover:text-err disabled:opacity-50"
                      >
                        <Trash2 size={13} />
                        Scarta
                      </button>
                    </div>
                  )}
                </div>
              </motion.div>
            );
          })}
        </div>
      )}

      <div className="mt-8 flex items-start gap-2.5 rounded-xl border border-brand-200 bg-brand-50/60 px-4 py-3 text-[12px] leading-relaxed text-brand-700">
        <ShieldCheck size={15} className="mt-0.5 shrink-0" />
        Il tuo click con PIN e' l'OK esplicito (regola 1). L'invio vero lo fa l'agente al suo primo giro
        utile, solo per le bozze approvate. Chi non ha il PIN puo' guardare ma non approvare.
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
                    {open.channel === 'email' ? 'email' : open.channel === 'reddit' ? 'Reddit' : 'DM'}
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
              <div className="flex items-center gap-2 border-t border-line px-5 py-3.5">
                {(decided[open.id] ?? open.status) === 'bozza' ? (
                  <>
                    <button
                      onClick={() => decide(open, 'approve')}
                      className="inline-flex flex-1 items-center justify-center gap-1.5 rounded-xl bg-brand-600 px-3.5 py-2.5 text-[13px] font-bold text-white shadow-[0_4px_14px_rgba(14,124,107,0.3)] transition-all hover:bg-brand-700 active:scale-[0.98]"
                    >
                      <Check size={15} /> Approva
                    </button>
                    <button
                      onClick={() => decide(open, 'reject')}
                      className="inline-flex items-center gap-1.5 rounded-xl border border-line px-3.5 py-2.5 text-[13px] font-semibold text-ink-2 hover:text-err"
                    >
                      <Trash2 size={14} /> Scarta
                    </button>
                  </>
                ) : (
                  <Badge tone="brand">{STATUS_TONE[decided[open.id] ?? open.status].label}</Badge>
                )}
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>

      {/* Modal PIN */}
      <AnimatePresence>
        {pinAsk && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 z-[60] bg-deep-2/40 backdrop-blur-[3px]"
              onClick={() => setPinAsk(null)}
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.94, y: 10 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.94, y: 10 }}
              transition={{ type: 'spring', stiffness: 320, damping: 26 }}
              className="fixed left-1/2 top-1/2 z-[70] w-[min(92vw,380px)] -translate-x-1/2 -translate-y-1/2 rounded-2xl border border-line bg-white p-6 shadow-2xl"
            >
              <div className="mb-1 flex items-center gap-2">
                <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-deep text-mint">
                  <Lock size={16} />
                </span>
                <div>
                  <div className="font-display text-[15.5px] font-bold text-deep">PIN di approvazione</div>
                  <div className="text-[11px] text-ink-3">
                    {pinAsk.action === 'approve' ? 'Stai approvando' : 'Stai scartando'} la bozza per{' '}
                    <b>{pinAsk.draft.creator}</b>
                  </div>
                </div>
              </div>
              <input
                autoFocus
                type="password"
                inputMode="numeric"
                value={pinValue}
                onChange={(e) => setPinValue(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' && pinValue) decide(pinAsk.draft, pinAsk.action, pinValue);
                }}
                placeholder="••••••"
                className="mt-4 w-full rounded-xl border border-line bg-subtle px-4 py-3 text-center font-display text-[22px] font-bold tracking-[0.4em] text-deep outline-none focus:border-brand-400 focus:shadow-[0_0_0_3px_rgba(46,167,141,0.15)]"
              />
              {pinError && <div className="mt-2 text-center text-[12px] font-semibold text-err">{pinError}</div>}
              <div className="mt-4 flex gap-2">
                <button
                  onClick={() => pinValue && decide(pinAsk.draft, pinAsk.action, pinValue)}
                  disabled={!pinValue || busy !== null}
                  className="flex-1 rounded-xl bg-brand-600 px-4 py-2.5 text-[13px] font-bold text-white shadow-[0_4px_14px_rgba(14,124,107,0.3)] transition-all hover:bg-brand-700 active:scale-[0.98] disabled:opacity-50"
                >
                  Conferma
                </button>
                <button
                  onClick={() => setPinAsk(null)}
                  className="rounded-xl border border-line px-4 py-2.5 text-[13px] font-semibold text-ink-2 hover:bg-subtle"
                >
                  Annulla
                </button>
              </div>
              <div className="mt-3 text-center text-[10.5px] text-ink-3">
                Il PIN viene ricordato su questo dispositivo dopo il primo uso.
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
}
