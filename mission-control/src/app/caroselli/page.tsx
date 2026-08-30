'use client';

import { useMemo, useState } from 'react';
import Image from 'next/image';
import { motion, AnimatePresence } from 'framer-motion';
import { Check, Lock, ShieldCheck, Trash2, Sparkles, Layers } from 'lucide-react';
import { useData } from '@/lib/store';
import { PageHeader, Badge, EmptyState } from '@/components/ui';
import LiveBadge from '@/components/LiveBadge';
import { IgCarouselMockup } from '@/components/PostMockup';
import { cn, fmtDay, fmtTime } from '@/lib/utils';
import type { CarouselItem, CarouselStato } from '@/lib/types';

const FILTERS: Array<{ id: CarouselStato | 'tutti'; label: string }> = [
  { id: 'in_attesa', label: 'Da approvare' },
  { id: 'approvato', label: 'Approvati' },
  { id: 'pubblicato', label: 'Pubblicati' },
  { id: 'tutti', label: 'Tutti' },
];

const STATO_TONE: Record<CarouselStato, { label: string; cls: string }> = {
  in_attesa: { label: 'Aspetta il tuo PIN', cls: 'bg-tan text-tan-ink' },
  approvato: { label: 'Approvato · lo pubblico', cls: 'bg-brand-100 text-brand-700' },
  in_pubblicazione: { label: 'In pubblicazione...', cls: 'bg-brand-50 text-brand-700' },
  bozza_tiktok: { label: 'In bozza su TikTok', cls: 'bg-tan text-tan-ink' },
  pubblicato: { label: 'Pubblicato', cls: 'bg-deep text-mint' },
  scartato: { label: 'Scartato', cls: 'bg-subtle text-ink-3' },
  errore: { label: 'Errore', cls: 'bg-[#fbe9e2] text-[#a63d20]' },
};

type PendingAction = { carousel: CarouselItem; action: 'approve' | 'reject' };


export default function CaroselliPage() {
  const { carousels, agents, loading } = useData();
  const [filter, setFilter] = useState<CarouselStato | 'tutti'>('tutti');
  const [pinAsk, setPinAsk] = useState<PendingAction | null>(null);
  const [pinValue, setPinValue] = useState('');
  const [pinError, setPinError] = useState<string | null>(null);
  const [busy, setBusy] = useState<string | null>(null);
  const [decided, setDecided] = useState<Record<string, CarouselStato>>({});
  const agent = agents.find((a) => a.slug === 'caroselli');

  const withLocal = useMemo(
    () => carousels.map((c) => (decided[c.key] ? { ...c, stato: decided[c.key] } : c)),
    [carousels, decided],
  );
  const list = filter === 'tutti' ? withLocal : withLocal.filter((c) => c.stato === filter);
  const count = (s: CarouselStato | 'tutti') =>
    s === 'tutti' ? withLocal.length : withLocal.filter((c) => c.stato === s).length;

  async function run(action: PendingAction, pin?: string) {
    const { carousel } = action;
    const stored = pin ?? (typeof window !== 'undefined' ? localStorage.getItem('mc_pin') : null);
    if (!stored) {
      setPinValue('');
      setPinError(null);
      setPinAsk(action);
      return;
    }
    setBusy(carousel.key);
    try {
      const res = await fetch('/api/decide', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ carosello_key: carousel.key, action: action.action, pin: stored }),
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
        setDecided((p) => ({ ...p, [carousel.key]: j.status as CarouselStato }));
        setPinAsk(null);
      } else {
        setPinError(j.error ?? 'errore');
      }
    } finally {
      setBusy(null);
    }
  }

  return (
    <div className="mx-auto max-w-[980px]">
      <PageHeader
        title="Caroselli"
        subtitle="I post a scorrimento che la gente salva. RIVO CAROSELLI prende il tema dal piano dello Stratega, scrive le slide e le porta qui: tu approvi col PIN, poi il Publisher pubblica."
        right={<LiveBadge />}
      />

      {/* Chi produce */}
      <div className="card mb-5 flex items-center gap-4 p-4">
        <span className="flex h-[52px] w-[52px] shrink-0 items-center justify-center rounded-2xl bg-[#e6f4f9]">
          <Image src="/avatars/caroselli.png" alt="RIVO CAROSELLI" width={40} height={40} />
        </span>
        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-2">
            <span className="font-display text-[15px] font-bold text-deep">RIVO CAROSELLI</span>
            <Badge tone="brand">post a scorrimento</Badge>
          </div>
          <div className="mt-0.5 text-[12px] leading-relaxed text-ink-2">
            Guide, liste e passi pratici sui rimborsi voli: i contenuti che fanno salvataggi e condivisioni.
            Segue il piano dello Stratega, non pubblica mai da solo.
          </div>
        </div>
        {agent && (
          <div className="hidden shrink-0 text-right sm:block">
            <div className="text-[11px] font-semibold text-ink-2">{agent.schedule_label}</div>
            <div className="text-[10.5px] text-ink-3">RIVO - CAROSELLI</div>
          </div>
        )}
      </div>

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
          {Array.from({ length: 2 }).map((_, i) => (
            <div key={i} className="skeleton h-[280px]" />
          ))}
        </div>
      )}

      {!loading && list.length === 0 && (
        <EmptyState
          title={withLocal.length === 0 ? 'Nessun carosello ancora' : 'Niente qui'}
          note={
            withLocal.length === 0
              ? 'Quando lo Stratega mette un carosello nel piano, RIVO CAROSELLI lo scrive slide per slide e lo porta qui, pronto da approvare col PIN. Compare da solo, in tempo reale.'
              : 'Cambia filtro per vedere gli altri caroselli.'
          }
        />
      )}

      {!loading && list.length > 0 && (
        <div className="space-y-4">
          {list.map((c, i) => {
            const tone = STATO_TONE[c.stato] ?? STATO_TONE.in_attesa;
            const slides = (c.slides ?? []).slice().sort((a, b) => a.n - b.n);
            return (
              <motion.div
                key={c.key}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3, delay: i * 0.05 }}
                className="card overflow-hidden p-4"
              >
                <div className="flex flex-wrap items-center gap-2">
                  <span className="font-display text-[15px] font-bold text-deep">
                    {c.tema || `Carosello del ${fmtDay(c.date)}`}
                  </span>
                  <span className={cn('rounded-full px-2 py-0.5 text-[10px] font-bold', tone.cls)}>{tone.label}</span>
                </div>
                <div className="mt-1 flex flex-wrap items-center gap-2 text-[11px] text-ink-3">
                  <span>{fmtDay(c.created_at ?? c.date)}{c.created_at ? ` ${fmtTime(c.created_at)}` : ''}</span>
                  <span>·</span>
                  <span className="inline-flex items-center gap-1"><Layers size={11} /> {slides.length} slide</span>
                  {c.angolo && (
                    <>
                      <span>·</span>
                      <span className="inline-flex items-center gap-1 font-medium text-brand-600">
                        <Sparkles size={11} /> {c.angolo}
                      </span>
                    </>
                  )}
                </div>

                {/* Anteprima come post Instagram, sfogliabile */}
                {slides.length > 0 ? (
                  <div className="mt-4">
                    <IgCarouselMockup slides={slides} caption={c.caption} />
                  </div>
                ) : (
                  <div className="mt-3 rounded-xl border border-dashed border-line bg-subtle px-4 py-6 text-center text-[12px] text-ink-3">
                    Slide non ancora disponibili.
                  </div>
                )}

                {c.caption && (
                  <div className="mt-3 rounded-xl border border-line bg-subtle/60 px-3.5 py-2.5">
                    <div className="mb-1 text-[10.5px] font-bold uppercase tracking-[0.12em] text-ink-3">Caption</div>
                    <div className="whitespace-pre-wrap text-[12.5px] leading-relaxed text-ink">{c.caption}</div>
                  </div>
                )}

                {c.stato === 'pubblicato' && (c.piattaforme_pubblicate?.length ?? 0) > 0 && (
                  <div className="mt-2 text-[11px] font-medium text-brand-600">
                    Online su: {c.piattaforme_pubblicate!.join(', ')}
                    {c.published_at ? ` · ${fmtDay(c.published_at)} ${fmtTime(c.published_at)}` : ''}
                  </div>
                )}

                {c.stato === 'in_attesa' && (
                  <div className="mt-4 flex items-center gap-2">
                    <button
                      onClick={() => run({ carousel: c, action: 'approve' })}
                      disabled={busy === c.key}
                      className="inline-flex items-center gap-1.5 rounded-xl bg-brand-600 px-4 py-2.5 text-[13px] font-bold text-white shadow-[0_0_0_1px_rgba(14,124,107,0.45),0_4px_14px_rgba(14,124,107,0.3)] transition-all hover:bg-brand-700 active:scale-[0.97] disabled:opacity-50"
                    >
                      <Check size={15} />
                      Approva
                    </button>
                    <button
                      onClick={() => run({ carousel: c, action: 'reject' })}
                      disabled={busy === c.key}
                      className="inline-flex items-center gap-1.5 rounded-xl border border-line bg-white px-3.5 py-2.5 text-[13px] font-semibold text-ink-2 transition-colors hover:border-[#f5c9c4] hover:text-err disabled:opacity-50"
                    >
                      <Trash2 size={14} />
                      Scarta
                    </button>
                  </div>
                )}

                {c.note && (
                  <div className="mt-2.5 whitespace-pre-wrap text-[11px] leading-relaxed text-ink-3">{c.note}</div>
                )}
              </motion.div>
            );
          })}
        </div>
      )}

      <div className="mt-8 flex items-start gap-2.5 rounded-xl border border-brand-200 bg-brand-50/60 px-4 py-3 text-[12px] leading-relaxed text-brand-700">
        <ShieldCheck size={15} className="mt-0.5 shrink-0" />
        Il PIN e&apos; il tuo OK esplicito (regola 1). RIVO CAROSELLI genera le slide come immagini AI (Kie, GPT Image 2)
        gia&apos; on-brand; tu approvi col PIN e il Publisher le pubblica.
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
                    {pinAsk.action === 'approve' ? 'Approvi' : 'Scarti'} il carosello del{' '}
                    <b>{fmtDay(pinAsk.carousel.date)}</b>
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
