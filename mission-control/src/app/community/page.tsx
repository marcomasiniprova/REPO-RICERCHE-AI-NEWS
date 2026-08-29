'use client';

import { useMemo, useState } from 'react';
import Image from 'next/image';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Check,
  Lock,
  Trash2,
  ShieldCheck,
  MessageSquare,
  Mail,
  Timer,
  Smile,
  Clock3,
  Flame,
} from 'lucide-react';
import { useData } from '@/lib/store';
import { PageHeader, Badge, EmptyState } from '@/components/ui';
import LiveBadge from '@/components/LiveBadge';
import { cn } from '@/lib/utils';
import type { CommunityReply, CommunityReplyStato } from '@/lib/types';

type PendingAction = { reply: CommunityReply; action: 'approve' | 'reject' };

function MiniStat({ label, value, icon }: { label: string; value: string | number; icon: React.ReactNode }) {
  return (
    <div className="card px-4 py-3">
      <div className="flex items-center justify-between">
        <span className="text-[11px] font-semibold uppercase tracking-[0.08em] text-ink-3">{label}</span>
        <span className="text-brand-600">{icon}</span>
      </div>
      <div className="mt-1 font-display text-[24px] font-bold leading-none text-deep">{value}</div>
    </div>
  );
}

export default function CommunityPage() {
  const { agents, communityStato: s, loading } = useData();
  const agent = agents.find((a) => a.slug === 'community');
  const [pinAsk, setPinAsk] = useState<PendingAction | null>(null);
  const [pinValue, setPinValue] = useState('');
  const [pinError, setPinError] = useState<string | null>(null);
  const [busy, setBusy] = useState<string | null>(null);
  const [decided, setDecided] = useState<Record<string, CommunityReplyStato>>({});

  const replies = useMemo(() => {
    const list = (s?.risposte ?? []).map((r) => (decided[r.id] ? { ...r, stato: decided[r.id] } : r));
    // urgenti prima, poi in attesa, poi il resto
    return list.sort((a, b) => {
      const rank = (r: CommunityReply) => (r.stato === 'in_attesa' ? (r.urgente ? 0 : 1) : 2);
      return rank(a) - rank(b);
    });
  }, [s?.risposte, decided]);
  const pending = replies.filter((r) => r.stato === 'in_attesa');

  async function run(action: PendingAction, pin?: string) {
    const { reply } = action;
    const stored = pin ?? (typeof window !== 'undefined' ? localStorage.getItem('mc_pin') : null);
    if (!stored) {
      setPinValue('');
      setPinError(null);
      setPinAsk(action);
      return;
    }
    setBusy(reply.id);
    try {
      const res = await fetch('/api/decide', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ community_reply_id: reply.id, action: action.action, pin: stored }),
      });
      const j = await res.json();
      if (res.status === 401) {
        localStorage.removeItem('mc_pin');
        setPinValue('');
        setPinError('PIN errato, riprova.');
        setPinAsk(action);
        return;
      }
      if (j.ok) {
        try { localStorage.setItem('mc_pin', stored); } catch {}
        setDecided((p) => ({ ...p, [reply.id]: j.status as CommunityReplyStato }));
        setPinAsk(null);
      } else {
        setPinError(j.error ?? 'errore');
      }
    } finally {
      setBusy(null);
    }
  }

  const num = (v: number | undefined) => (typeof v === 'number' ? v : 0);

  return (
    <div className="mx-auto max-w-[1000px]">
      <PageHeader
        title="Community"
        subtitle="RIVO COMMUNITY tiene viva la pagina: legge commenti e DM, presidia i primi 60 minuti dei post e prepara le risposte. Tu le approvi col PIN, poi partono."
        right={<LiveBadge />}
      />

      {/* Stato agente */}
      <div className="card mb-5 flex items-center gap-4 p-4">
        <span className="flex h-[52px] w-[52px] shrink-0 items-center justify-center rounded-2xl bg-[#f2ecfa]">
          <Image src="/avatars/community.png" alt="RIVO COMMUNITY" width={40} height={40} />
        </span>
        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-2">
            <span className="font-display text-[15px] font-bold text-deep">RIVO COMMUNITY</span>
            <Badge tone="brand">commenti e DM</Badge>
          </div>
          <div className="mt-0.5 text-[12px] leading-relaxed text-ink-2">
            Risponde al pubblico con calore e presidia la prima ora dei post nuovi. Non manda mai una risposta
            senza il tuo OK.
          </div>
        </div>
        {agent && (
          <div className="hidden shrink-0 text-right sm:block">
            <div className="text-[11px] font-semibold text-ink-2">{agent.schedule_label}</div>
            <div className="text-[10.5px] text-ink-3">RIVO - COMMUNITY</div>
          </div>
        )}
      </div>

      {/* Cruscotto engagement */}
      <div className="mb-2 grid grid-cols-2 gap-3 lg:grid-cols-4">
        {loading ? (
          Array.from({ length: 4 }).map((_, i) => <div key={i} className="skeleton h-[84px]" />)
        ) : (
          <>
            <MiniStat label="Commenti nuovi" value={num(s?.commenti_nuovi)} icon={<MessageSquare size={15} />} />
            <MiniStat label="DM nuovi" value={num(s?.dm_nuovi)} icon={<Mail size={15} />} />
            <MiniStat label="Risposte pronte" value={pending.length} icon={<Check size={15} />} />
            <MiniStat label="Urgenti (60 min)" value={num(s?.urgenti)} icon={<Flame size={15} />} />
          </>
        )}
      </div>
      <div className="mb-6 flex flex-wrap items-center gap-x-5 gap-y-1 px-1 text-[11px] text-ink-3">
        {s?.sentiment && (
          <span className="inline-flex items-center gap-1">
            <Smile size={12} /> Aria nei commenti: <b className="text-ink-2">{s.sentiment}</b>
          </span>
        )}
        {s?.tempo_medio_attesa && (
          <span className="inline-flex items-center gap-1">
            <Clock3 size={12} /> Attesa media: <b className="text-ink-2">{s.tempo_medio_attesa}</b>
          </span>
        )}
        {s?.updated_at && (
          <span>
            Aggiornato{' '}
            {new Date(s.updated_at).toLocaleString('it-IT', { day: 'numeric', month: 'long', hour: '2-digit', minute: '2-digit' })}
          </span>
        )}
      </div>

      {/* Finestra 60 minuti attiva */}
      {(s?.finestra_60min?.length ?? 0) > 0 && (
        <div className="mb-6 rounded-xl border border-[#f0d9b0] bg-[#faf1e2] px-4 py-3">
          <div className="mb-1.5 flex items-center gap-2 text-[12.5px] font-bold text-tan-ink">
            <Timer size={14} /> Finestra dei primi 60 minuti attiva
          </div>
          <div className="flex flex-wrap gap-2">
            {s!.finestra_60min!.map((w, i) => (
              <span key={i} className="rounded-full bg-white px-2.5 py-1 text-[11px] font-semibold text-tan-ink">
                {w.post ?? 'post'} · {w.commenti ?? 0} commenti
              </span>
            ))}
          </div>
        </div>
      )}

      {/* Risposte da approvare */}
      <div className="mb-3 flex items-center justify-between">
        <h2 className="font-display text-[17px] font-bold tracking-tight text-deep">Risposte da approvare</h2>
        <span className="text-[11.5px] text-ink-3">{pending.length > 0 ? `${pending.length} in attesa del PIN` : 'niente in attesa'}</span>
      </div>

      {loading ? (
        <div className="space-y-3">
          {Array.from({ length: 2 }).map((_, i) => (
            <div key={i} className="skeleton h-[120px]" />
          ))}
        </div>
      ) : replies.length === 0 ? (
        <EmptyState
          title="Ancora nessuna risposta in coda"
          note="Quando arrivano commenti e DM sui contenuti, RIVO COMMUNITY prepara qui le risposte, gia' scritte con calore. Tu approvi col PIN e partono. Le risposte nella prima ora di un post sono segnate urgenti."
        />
      ) : (
        <div className="space-y-3">
          {replies.map((r, i) => {
            const isPending = r.stato === 'in_attesa';
            return (
              <motion.div
                key={r.id}
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.25, delay: Math.min(i * 0.03, 0.3) }}
                className={cn('card p-4', r.urgente && isPending && 'border-[#f0d9b0]')}
              >
                <div className="flex flex-wrap items-center gap-2">
                  <span className="inline-flex items-center gap-1 text-[12px] font-bold text-deep">
                    {r.tipo === 'dm' ? <Mail size={13} /> : <MessageSquare size={13} />}
                    {r.da ?? 'utente'}
                  </span>
                  {r.dove && <span className="text-[11px] text-ink-3">su {r.dove}</span>}
                  {r.urgente && isPending && <Badge tone="tan">urgente · 60 min</Badge>}
                  {!isPending && (
                    <Badge tone={r.stato === 'approvato' || r.stato === 'inviato' ? 'brand' : 'neutral'}>
                      {r.stato === 'inviato' ? 'inviata' : r.stato === 'approvato' ? 'approvata · parte al giro' : 'scartata'}
                    </Badge>
                  )}
                </div>
                {r.loro && (
                  <div className="mt-2 rounded-xl bg-subtle px-3.5 py-2 text-[12.5px] leading-relaxed text-ink-2">
                    <span className="text-[10px] font-bold uppercase tracking-wide text-ink-3">Ha scritto</span>
                    <div className="mt-0.5">{r.loro}</div>
                  </div>
                )}
                {r.bozza && (
                  <div className="mt-2 rounded-xl bg-brand-50/70 px-3.5 py-2.5 text-[13px] leading-relaxed text-brand-700">
                    <span className="text-[10px] font-bold uppercase tracking-wide text-brand-600">Risposta pronta</span>
                    <div className="mt-0.5 whitespace-pre-wrap">{r.bozza}</div>
                  </div>
                )}
                {isPending && (
                  <div className="mt-3 flex items-center gap-2">
                    <button
                      onClick={() => run({ reply: r, action: 'approve' })}
                      disabled={busy === r.id}
                      className="inline-flex items-center gap-1.5 rounded-xl bg-brand-600 px-4 py-2 text-[13px] font-bold text-white shadow-[0_0_0_1px_rgba(14,124,107,0.45),0_4px_14px_rgba(14,124,107,0.3)] transition-all hover:bg-brand-700 active:scale-[0.97] disabled:opacity-50"
                    >
                      <Check size={15} />
                      Approva e invia
                    </button>
                    <button
                      onClick={() => run({ reply: r, action: 'reject' })}
                      disabled={busy === r.id}
                      className="inline-flex items-center gap-1.5 rounded-xl border border-line bg-white px-3.5 py-2 text-[13px] font-semibold text-ink-2 transition-colors hover:border-[#f5c9c4] hover:text-err disabled:opacity-50"
                    >
                      <Trash2 size={14} />
                      Scarta
                    </button>
                  </div>
                )}
              </motion.div>
            );
          })}
        </div>
      )}

      <div className="mt-8 flex items-start gap-2.5 rounded-xl border border-brand-200 bg-brand-50/60 px-4 py-3 text-[12px] leading-relaxed text-brand-700">
        <ShieldCheck size={15} className="mt-0.5 shrink-0" />
        Nessuna risposta parte senza il tuo PIN (regola 1). RIVO COMMUNITY le scrive gia&apos; pronte e calde; tu
        approvi, e lei le invia al suo prossimo giro. Le risposte nella prima ora di un post sono segnate urgenti.
      </div>

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
                    {pinAsk.action === 'approve' ? 'Approvi e mandi' : 'Scarti'} la risposta a{' '}
                    <b>{pinAsk.reply.da ?? 'utente'}</b>
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
                  if (e.key === 'Enter' && pinValue) run(pinAsk, pinValue);
                }}
                placeholder="••••••"
                className="mt-4 w-full rounded-xl border border-line bg-subtle px-4 py-3 text-center font-display text-[22px] font-bold tracking-[0.4em] text-deep outline-none focus:border-brand-400 focus:shadow-[0_0_0_3px_rgba(46,167,141,0.15)]"
              />
              {pinError && <div className="mt-2 text-center text-[12px] font-semibold text-err">{pinError}</div>}
              <div className="mt-4 flex gap-2">
                <button
                  onClick={() => pinValue && run(pinAsk, pinValue)}
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
