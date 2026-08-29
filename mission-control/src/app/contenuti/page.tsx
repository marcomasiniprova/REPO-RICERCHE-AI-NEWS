'use client';

import { useMemo, useState } from 'react';
import Image from 'next/image';
import { motion, AnimatePresence } from 'framer-motion';
import { Check, Clapperboard, Lock, Loader2, ShieldCheck, Sparkles, Trash2, Wallet } from 'lucide-react';
import { useData } from '@/lib/store';
import { PageHeader, Badge, EmptyState } from '@/components/ui';
import LiveBadge from '@/components/LiveBadge';
import { cn, fmtDay, fmtTime } from '@/lib/utils';
import type { VideoItem, VideoOption, VideoStato } from '@/lib/types';

const FILTERS: Array<{ id: VideoStato | 'tutti'; label: string }> = [
  { id: 'piano_in_attesa', label: 'Piani da approvare' },
  { id: 'piano_approvato', label: 'In generazione' },
  { id: 'in_attesa', label: 'Video da approvare' },
  { id: 'pubblicato', label: 'Pubblicati' },
  { id: 'tutti', label: 'Tutti' },
];

const STATO_TONE: Record<VideoStato, { label: string; cls: string }> = {
  piano_in_attesa: { label: 'Piano: aspetta il tuo OK', cls: 'bg-tan text-tan-ink' },
  piano_approvato: { label: 'Piano approvato · in generazione', cls: 'bg-brand-100 text-brand-700' },
  in_attesa: { label: 'Video pronto: aspetta il tuo PIN', cls: 'bg-tan text-tan-ink' },
  approvato: { label: 'Approvato · esce al prossimo giro', cls: 'bg-brand-100 text-brand-700' },
  pubblicato: { label: 'Pubblicato', cls: 'bg-deep text-mint' },
  scartato: { label: 'Scartato', cls: 'bg-subtle text-ink-3' },
  errore: { label: 'Errore', cls: 'bg-[#fbe9e2] text-[#a63d20]' },
};

const ANGOLO_LABEL: Record<string, string> = { edu: 'Educativo', mito: 'Smonta-miti' };

type PendingAction = { video: VideoItem; action: 'approve' | 'reject' | 'approve_plan'; scelta?: VideoOption };

function costo(o: VideoOption): string {
  const eur = o.euro ?? o.crediti * 0.0046; // fallback: 1 credito ≈ €0,0046
  return `${o.crediti} crediti · €${eur.toFixed(2)}`;
}

function CaptionBlock({ title, text }: { title: string; text?: string }) {
  if (!text) return null;
  return (
    <div className="rounded-xl border border-line bg-subtle/60 px-3.5 py-2.5">
      <div className="mb-1 text-[10.5px] font-bold uppercase tracking-[0.12em] text-ink-3">{title}</div>
      <div className="whitespace-pre-wrap text-[12.5px] leading-relaxed text-ink">{text}</div>
    </div>
  );
}

export default function ContenutiPage() {
  const { videos, agents, loading } = useData();
  const [filter, setFilter] = useState<VideoStato | 'tutti'>('tutti');
  const [pinAsk, setPinAsk] = useState<PendingAction | null>(null);
  const [pinValue, setPinValue] = useState('');
  const [pinError, setPinError] = useState<string | null>(null);
  const [busy, setBusy] = useState<string | null>(null);
  const [decided, setDecided] = useState<Record<string, VideoStato>>({});
  const [chosen, setChosen] = useState<Record<string, string>>({}); // video.key -> option id
  const videoAgent = agents.find((a) => a.slug === 'video');

  const withLocal = useMemo(
    () => videos.map((v) => (decided[v.key] ? { ...v, stato: decided[v.key] } : v)),
    [videos, decided],
  );
  const list = filter === 'tutti' ? withLocal : withLocal.filter((v) => v.stato === filter);
  const count = (s: VideoStato | 'tutti') =>
    s === 'tutti' ? withLocal.length : withLocal.filter((v) => v.stato === s).length;

  function selectedOption(v: VideoItem): VideoOption | undefined {
    const opts = v.opzioni ?? [];
    const id = chosen[v.key];
    return opts.find((o) => o.id === id) ?? opts.find((o) => o.consigliata) ?? opts[0];
  }

  async function run(action: PendingAction, pin?: string) {
    const { video, scelta } = action;
    const stored = pin ?? (typeof window !== 'undefined' ? localStorage.getItem('mc_pin') : null);
    if (!stored) {
      setPinValue('');
      setPinError(null);
      setPinAsk(action);
      return;
    }
    setBusy(video.key);
    try {
      const res = await fetch('/api/decide', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ video_key: video.key, action: action.action, scelta, pin: stored }),
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
        setDecided((p) => ({ ...p, [video.key]: j.status as VideoStato }));
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
        title="Contenuti"
        subtitle="La macchina dei contenuti. Prima RIVO VIDEO ti propone un PIANO (modello, secondi, costo): tu scegli e approvi col PIN. Poi genera il video, e col PIN lo pubblichi su TikTok, Reels e Shorts."
        right={<LiveBadge />}
      />

      {/* Chi produce */}
      <div className="card mb-5 flex items-center gap-4 p-4">
        <span className="flex h-[52px] w-[52px] shrink-0 items-center justify-center rounded-2xl bg-[#f3effc]">
          <Image src="/avatars/video.png" alt="RIVO VIDEO" width={40} height={40} />
        </span>
        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-2">
            <span className="font-display text-[15px] font-bold text-deep">RIVO VIDEO</span>
            <Badge tone="brand">Giulia, avatar AI</Badge>
          </div>
          <div className="mt-0.5 text-[12px] leading-relaxed text-ink-2">
            Un video UGC al giorno sui rimborsi voli, con Giulia generata su Kie. Non spende mai a cieco:
            ti porta un piano coi costi veri, tu decidi. Ogni video esce con la disclosure &quot;Creato con AI&quot;.
          </div>
        </div>
        {videoAgent && (
          <div className="hidden shrink-0 text-right sm:block">
            <div className="text-[11px] font-semibold text-ink-2">{videoAgent.schedule_label}</div>
            <div className="text-[10.5px] text-ink-3">RIVO - VIDEO</div>
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
            <div key={i} className="skeleton h-[220px]" />
          ))}
        </div>
      )}

      {!loading && list.length === 0 && (
        <EmptyState
          title={withLocal.length === 0 ? 'Nessun contenuto ancora' : 'Niente qui'}
          note={
            withLocal.length === 0
              ? 'Al primo giro RIVO VIDEO ti portera qui un piano col costo reale su Kie. Lo scegli, lo approvi col PIN, e lui genera il video di Giulia.'
              : 'Cambia filtro per vedere gli altri contenuti.'
          }
        />
      )}

      {!loading && list.length > 0 && (
        <div className="space-y-4">
          {list.map((v, i) => {
            const tone = STATO_TONE[v.stato] ?? STATO_TONE.piano_in_attesa;
            const isPlan = v.stato === 'piano_in_attesa';
            const isGenerating = v.stato === 'piano_approvato';
            const isVideo = ['in_attesa', 'approvato', 'pubblicato'].includes(v.stato);
            const sel = selectedOption(v);
            return (
              <motion.div
                key={v.key}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3, delay: i * 0.05 }}
                className="card overflow-hidden p-4"
              >
                {/* Testata comune */}
                <div className="flex flex-wrap items-center gap-2">
                  <span className="font-display text-[15px] font-bold text-deep">
                    {v.tema || `Video del ${fmtDay(v.date)}`}
                  </span>
                  <span className={cn('rounded-full px-2 py-0.5 text-[10px] font-bold', tone.cls)}>{tone.label}</span>
                </div>
                <div className="mt-1 flex flex-wrap items-center gap-2 text-[11px] text-ink-3">
                  <span>{fmtDay(v.created_at ?? v.date)}{v.created_at ? ` ${fmtTime(v.created_at)}` : ''}</span>
                  {v.angolo && (
                    <>
                      <span>·</span>
                      <span className="inline-flex items-center gap-1 font-medium text-brand-600">
                        <Sparkles size={11} />
                        {ANGOLO_LABEL[v.angolo] ?? v.angolo}
                      </span>
                    </>
                  )}
                  {typeof v.saldo_crediti === 'number' && (
                    <>
                      <span>·</span>
                      <span className="inline-flex items-center gap-1">
                        <Wallet size={11} /> saldo {v.saldo_crediti} crediti
                      </span>
                    </>
                  )}
                </div>

                {v.hook && (
                  <div className="mt-3 rounded-xl bg-brand-50/70 px-3.5 py-2.5 text-[13px] font-semibold leading-snug text-brand-700">
                    {v.hook}
                  </div>
                )}
                {v.script && (
                  <div className="mt-2.5 whitespace-pre-wrap text-[12.5px] leading-relaxed text-ink">{v.script}</div>
                )}

                {/* FASE PIANO: ventaglio combinazioni */}
                {(isPlan || isGenerating) && (v.opzioni?.length ?? 0) > 0 && (
                  <div className="mt-4">
                    <div className="mb-2 text-[11px] font-bold uppercase tracking-[0.12em] text-ink-3">
                      Combinazioni proposte {isPlan && '· scegli la tua'}
                    </div>
                    <div className="grid gap-2 sm:grid-cols-2">
                      {v.opzioni!.map((o) => {
                        const overBudget =
                          typeof v.saldo_crediti === 'number' && o.crediti > v.saldo_crediti;
                        const active = isPlan && sel?.id === o.id;
                        const isChosen = isGenerating && v.scelta?.id === o.id;
                        return (
                          <button
                            key={o.id}
                            disabled={!isPlan || overBudget}
                            onClick={() => setChosen((p) => ({ ...p, [v.key]: o.id }))}
                            className={cn(
                              'rounded-xl border px-3.5 py-2.5 text-left transition-all',
                              active || isChosen
                                ? 'border-brand-500 bg-brand-50 shadow-[0_0_0_1px_rgba(14,124,107,0.35)]'
                                : 'border-line bg-white',
                              isPlan && !overBudget && 'hover:border-line-strong',
                              overBudget && 'cursor-not-allowed opacity-45',
                            )}
                          >
                            <div className="flex items-center gap-2">
                              <span className="text-[13px] font-bold text-deep">{o.modello}</span>
                              {o.risoluzione && (
                                <span className="rounded-full bg-subtle px-1.5 py-0.5 text-[10px] font-semibold text-ink-2">
                                  {o.risoluzione}
                                </span>
                              )}
                              {o.consigliata && (
                                <span className="rounded-full bg-brand-100 px-1.5 py-0.5 text-[9.5px] font-bold text-brand-700">
                                  consigliata
                                </span>
                              )}
                            </div>
                            <div className="mt-1 flex items-center justify-between text-[11px] text-ink-3">
                              <span>{o.durata_s}s</span>
                              <span className={cn('font-semibold', overBudget ? 'text-err' : 'text-ink-2')}>
                                {costo(o)}
                                {overBudget && ' · fuori budget'}
                              </span>
                            </div>
                          </button>
                        );
                      })}
                    </div>
                  </div>
                )}

                {/* Azioni PIANO */}
                {isPlan && (
                  <div className="mt-4 flex flex-wrap items-center gap-2">
                    <button
                      onClick={() => sel && run({ video: v, action: 'approve_plan', scelta: sel })}
                      disabled={busy === v.key || !sel}
                      className="inline-flex items-center gap-1.5 rounded-xl bg-brand-600 px-4 py-2.5 text-[13px] font-bold text-white shadow-[0_0_0_1px_rgba(14,124,107,0.45),0_4px_14px_rgba(14,124,107,0.3)] transition-all hover:bg-brand-700 active:scale-[0.97] disabled:opacity-50"
                    >
                      <Check size={15} />
                      Approva e genera{sel ? ` · ${costo(sel)}` : ''}
                    </button>
                    <button
                      onClick={() => run({ video: v, action: 'reject' })}
                      disabled={busy === v.key}
                      className="inline-flex items-center gap-1.5 rounded-xl border border-line bg-white px-3.5 py-2.5 text-[13px] font-semibold text-ink-2 transition-colors hover:border-[#f5c9c4] hover:text-err disabled:opacity-50"
                    >
                      <Trash2 size={14} />
                      Scarta
                    </button>
                    <span className="text-[11px] text-ink-3">Puoi cambiare combinazione: l&apos;agente aspetta.</span>
                  </div>
                )}
                {isGenerating && (
                  <div className="mt-4 inline-flex items-center gap-2 rounded-xl bg-brand-50 px-3.5 py-2.5 text-[12.5px] font-semibold text-brand-700">
                    <Loader2 size={15} className="animate-spin" />
                    Piano approvato{v.scelta ? ` (${v.scelta.modello}${v.scelta.risoluzione ? ` ${v.scelta.risoluzione}` : ''}, ${v.scelta.durata_s}s)` : ''}: RIVO VIDEO sta generando il video.
                  </div>
                )}

                {/* FASE OUTPUT: video generato */}
                {isVideo && (
                  <div className="mt-4 flex flex-col gap-4 sm:flex-row">
                    <div className="mx-auto w-[200px] shrink-0 sm:mx-0">
                      {v.video_url ? (
                        <video
                          src={v.video_url}
                          controls
                          playsInline
                          preload="metadata"
                          className="aspect-[9/16] w-full rounded-xl border border-line bg-deep-2 object-cover"
                        />
                      ) : (
                        <div className="flex aspect-[9/16] w-full flex-col items-center justify-center gap-2 rounded-xl border border-dashed border-line bg-subtle text-ink-3">
                          <Clapperboard size={22} />
                          <span className="px-3 text-center text-[11px]">Anteprima non disponibile</span>
                        </div>
                      )}
                    </div>
                    <div className="min-w-0 flex-1">
                      <div className="mb-2 flex flex-wrap items-center gap-2 text-[11px] text-ink-3">
                        {typeof v.duration_s === 'number' && <span>{v.duration_s}s</span>}
                        {typeof v.crediti_spesi === 'number' && v.crediti_spesi > 0 && (
                          <>
                            <span>·</span>
                            <span>{v.crediti_spesi} crediti spesi</span>
                          </>
                        )}
                      </div>
                      <div className="grid gap-2 sm:grid-cols-3">
                        <CaptionBlock title="TikTok" text={v.caption_tiktok} />
                        <CaptionBlock title="Instagram Reels" text={v.caption_ig} />
                        <CaptionBlock title="YouTube Shorts" text={v.caption_youtube} />
                      </div>
                      {v.stato === 'pubblicato' && (v.piattaforme_pubblicate?.length ?? 0) > 0 && (
                        <div className="mt-2 text-[11px] font-medium text-brand-600">
                          Online su: {v.piattaforme_pubblicate!.join(', ')}
                          {v.published_at ? ` · ${fmtDay(v.published_at)} ${fmtTime(v.published_at)}` : ''}
                        </div>
                      )}
                      {v.stato === 'in_attesa' && (
                        <div className="mt-4 flex items-center gap-2">
                          <button
                            onClick={() => run({ video: v, action: 'approve' })}
                            disabled={busy === v.key}
                            className="inline-flex items-center gap-1.5 rounded-xl bg-brand-600 px-4 py-2.5 text-[13px] font-bold text-white shadow-[0_0_0_1px_rgba(14,124,107,0.45),0_4px_14px_rgba(14,124,107,0.3)] transition-all hover:bg-brand-700 active:scale-[0.97] disabled:opacity-50"
                          >
                            <Check size={15} />
                            Approva e pubblica
                          </button>
                          <button
                            onClick={() => run({ video: v, action: 'reject' })}
                            disabled={busy === v.key}
                            className="inline-flex items-center gap-1.5 rounded-xl border border-line bg-white px-3.5 py-2.5 text-[13px] font-semibold text-ink-2 transition-colors hover:border-[#f5c9c4] hover:text-err disabled:opacity-50"
                          >
                            <Trash2 size={14} />
                            Scarta
                          </button>
                        </div>
                      )}
                    </div>
                  </div>
                )}

                {v.note && (
                  <div className="mt-2.5 whitespace-pre-wrap text-[11px] leading-relaxed text-ink-3">{v.note}</div>
                )}
              </motion.div>
            );
          })}
        </div>
      )}

      <div className="mt-8 flex items-start gap-2.5 rounded-xl border border-brand-200 bg-brand-50/60 px-4 py-3 text-[12px] leading-relaxed text-brand-700">
        <ShieldCheck size={15} className="mt-0.5 shrink-0" />
        Il PIN e&apos; il tuo OK esplicito (regola 1). Serve due volte: per approvare il PIANO (che autorizza la
        spesa dei crediti e la generazione) e per pubblicare il VIDEO finito. Ogni video esce con la disclosure
        &quot;Creato con AI&quot;.
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
                    {pinAsk.action === 'approve_plan'
                      ? 'Approvi il piano e autorizzi la spesa'
                      : pinAsk.action === 'approve'
                        ? 'Approvi la pubblicazione'
                        : 'Scarti'}{' '}
                    del video del <b>{fmtDay(pinAsk.video.date)}</b>
                    {pinAsk.action === 'approve_plan' && pinAsk.scelta ? ` · ${costo(pinAsk.scelta)}` : ''}
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
