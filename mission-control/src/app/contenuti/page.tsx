'use client';

import { useMemo, useState } from 'react';
import Image from 'next/image';
import { motion, AnimatePresence } from 'framer-motion';
import { Check, Clapperboard, Lock, ShieldCheck, Sparkles, Trash2 } from 'lucide-react';
import { useData } from '@/lib/store';
import { PageHeader, Badge, EmptyState } from '@/components/ui';
import LiveBadge from '@/components/LiveBadge';
import { cn, fmtDay, fmtTime } from '@/lib/utils';
import type { VideoItem, VideoStato } from '@/lib/types';

const FILTERS: Array<{ id: VideoStato | 'tutti'; label: string }> = [
  { id: 'in_attesa', label: 'Da approvare' },
  { id: 'approvato', label: 'Approvati' },
  { id: 'pubblicato', label: 'Pubblicati' },
  { id: 'scartato', label: 'Scartati' },
  { id: 'tutti', label: 'Tutti' },
];

const STATO_TONE: Record<VideoStato, { label: string; cls: string }> = {
  in_attesa: { label: 'Aspetta il tuo PIN', cls: 'bg-tan text-tan-ink' },
  approvato: { label: 'Approvato · esce al prossimo giro', cls: 'bg-brand-100 text-brand-700' },
  pubblicato: { label: 'Pubblicato', cls: 'bg-deep text-mint' },
  scartato: { label: 'Scartato', cls: 'bg-subtle text-ink-3' },
  errore: { label: 'Non proposto (QA fallito)', cls: 'bg-[#fbe9e2] text-[#a63d20]' },
};

const ANGOLO_LABEL: Record<string, string> = {
  edu: 'Educativo',
  mito: 'Smonta-miti',
};

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
  const [pinAsk, setPinAsk] = useState<{ video: VideoItem; action: 'approve' | 'reject' } | null>(null);
  const [pinValue, setPinValue] = useState('');
  const [pinError, setPinError] = useState<string | null>(null);
  const [busy, setBusy] = useState<string | null>(null);
  const [decided, setDecided] = useState<Record<string, VideoStato>>({});
  const videoAgent = agents.find((a) => a.slug === 'video');

  const withLocal = useMemo(
    () => videos.map((v) => (decided[v.key] ? { ...v, stato: decided[v.key] } : v)),
    [videos, decided],
  );
  const list = filter === 'tutti' ? withLocal : withLocal.filter((v) => v.stato === filter);
  const count = (s: VideoStato | 'tutti') =>
    s === 'tutti' ? withLocal.length : withLocal.filter((v) => v.stato === s).length;

  async function decide(video: VideoItem, action: 'approve' | 'reject', pin?: string) {
    const stored = pin ?? (typeof window !== 'undefined' ? localStorage.getItem('mc_pin') : null);
    if (!stored) {
      setPinValue('');
      setPinError(null);
      setPinAsk({ video, action });
      return;
    }
    setBusy(video.key);
    try {
      const res = await fetch('/api/decide', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ video_key: video.key, action, pin: stored }),
      });
      const j = await res.json();
      if (res.status === 401) {
        localStorage.removeItem('mc_pin');
        setPinValue('');
        setPinError('PIN errato, riprova.');
        setPinAsk({ video, action });
        return;
      }
      if (j.ok) {
        try { localStorage.setItem('mc_pin', stored); } catch {}
        setDecided((p) => ({ ...p, [video.key]: action === 'approve' ? 'approvato' : 'scartato' }));
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
        subtitle="La macchina dei contenuti: ogni mattina RIVO VIDEO prepara un video di Giulia. Tu lo guardi, approvi col PIN e lui lo pubblica su TikTok, Reels e Shorts."
        right={<LiveBadge />}
      />

      {/* Chi produce: Giulia + agente */}
      <div className="card mb-5 flex items-center gap-4 p-4">
        <Image
          src="/giulia.png"
          alt="Giulia"
          width={52}
          height={52}
          className="rounded-2xl border border-line object-cover"
        />
        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-2">
            <span className="font-display text-[15px] font-bold text-deep">Giulia</span>
            <Badge tone="brand">avatar AI di Rivolio</Badge>
          </div>
          <div className="mt-0.5 text-[12px] leading-relaxed text-ink-2">
            Un video UGC al giorno sui rimborsi voli, generato con Veo 3.1 dalle sue foto reference.
            Ogni pubblicazione porta la disclosure &quot;Creato con AI&quot;.
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
          title={withLocal.length === 0 ? 'Nessun video ancora' : 'Niente qui'}
          note={
            withLocal.length === 0
              ? 'Il primo video di Giulia arriva col primo giro mattutino di RIVO VIDEO (servono crediti Kie sul conto). Lo troverai qui, pronto da guardare e approvare.'
              : 'Cambia filtro per vedere gli altri video.'
          }
        />
      )}

      {!loading && list.length > 0 && (
        <div className="space-y-4">
          {list.map((v, i) => {
            const tone = STATO_TONE[v.stato] ?? STATO_TONE.in_attesa;
            return (
              <motion.div
                key={v.key}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3, delay: i * 0.05 }}
                className="card overflow-hidden"
              >
                <div className="flex flex-col gap-4 p-4 sm:flex-row">
                  {/* Anteprima video 9:16 */}
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

                  {/* Dettagli */}
                  <div className="min-w-0 flex-1">
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="font-display text-[15px] font-bold text-deep">
                        {v.tema || `Video del ${fmtDay(v.date)}`}
                      </span>
                      <span className={cn('rounded-full px-2 py-0.5 text-[10px] font-bold', tone.cls)}>
                        {tone.label}
                      </span>
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
                      {typeof v.duration_s === 'number' && (
                        <>
                          <span>·</span>
                          <span>{v.duration_s}s</span>
                        </>
                      )}
                      {typeof v.crediti_spesi === 'number' && v.crediti_spesi > 0 && (
                        <>
                          <span>·</span>
                          <span>{v.crediti_spesi} crediti Kie</span>
                        </>
                      )}
                    </div>

                    {v.hook && (
                      <div className="mt-3 rounded-xl bg-brand-50/70 px-3.5 py-2.5 text-[13px] font-semibold leading-snug text-brand-700">
                        {v.hook}
                      </div>
                    )}
                    {v.script && (
                      <div className="mt-2.5 whitespace-pre-wrap text-[12.5px] leading-relaxed text-ink">
                        {v.script}
                      </div>
                    )}

                    <div className="mt-3 grid gap-2 sm:grid-cols-3">
                      <CaptionBlock title="TikTok" text={v.caption_tiktok} />
                      <CaptionBlock title="Instagram Reels" text={v.caption_ig} />
                      <CaptionBlock title="YouTube Shorts" text={v.caption_youtube} />
                    </div>

                    {v.note && (
                      <div className="mt-2.5 whitespace-pre-wrap text-[11px] leading-relaxed text-ink-3">
                        {v.note}
                      </div>
                    )}
                    {v.stato === 'pubblicato' && (v.piattaforme_pubblicate?.length ?? 0) > 0 && (
                      <div className="mt-2 text-[11px] font-medium text-brand-600">
                        Online su: {v.piattaforme_pubblicate!.join(', ')}
                        {v.published_at ? ` · ${fmtDay(v.published_at)} ${fmtTime(v.published_at)}` : ''}
                      </div>
                    )}

                    {v.stato === 'in_attesa' && (
                      <div className="mt-4 flex items-center gap-2">
                        <button
                          onClick={() => decide(v, 'approve')}
                          disabled={busy === v.key}
                          className="inline-flex items-center gap-1.5 rounded-xl bg-brand-600 px-4 py-2.5 text-[13px] font-bold text-white shadow-[0_0_0_1px_rgba(14,124,107,0.45),0_4px_14px_rgba(14,124,107,0.3)] transition-all hover:bg-brand-700 active:scale-[0.97] disabled:opacity-50"
                        >
                          <Check size={15} />
                          Approva e pubblica
                        </button>
                        <button
                          onClick={() => decide(v, 'reject')}
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
              </motion.div>
            );
          })}
        </div>
      )}

      <div className="mt-8 flex items-start gap-2.5 rounded-xl border border-brand-200 bg-brand-50/60 px-4 py-3 text-[12px] leading-relaxed text-brand-700">
        <ShieldCheck size={15} className="mt-0.5 shrink-0" />
        Il tuo PIN e&apos; l&apos;OK esplicito (regola 1): solo i video approvati vengono pubblicati, entro 2 ore
        se il giro e&apos; ancora attivo, altrimenti al giro del mattino dopo. Ogni video esce con la
        disclosure &quot;Creato con AI&quot;.
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
                    {pinAsk.action === 'approve' ? 'Stai approvando' : 'Stai scartando'} il video del{' '}
                    <b>{fmtDay(pinAsk.video.date)}</b>
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
                  if (e.key === 'Enter' && pinValue) decide(pinAsk.video, pinAsk.action, pinValue);
                }}
                placeholder="••••••"
                className="mt-4 w-full rounded-xl border border-line bg-subtle px-4 py-3 text-center font-display text-[22px] font-bold tracking-[0.4em] text-deep outline-none focus:border-brand-400 focus:shadow-[0_0_0_3px_rgba(46,167,141,0.15)]"
              />
              {pinError && <div className="mt-2 text-center text-[12px] font-semibold text-err">{pinError}</div>}
              <div className="mt-4 flex gap-2">
                <button
                  onClick={() => pinValue && decide(pinAsk.video, pinAsk.action, pinValue)}
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
