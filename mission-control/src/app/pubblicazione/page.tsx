'use client';

import Image from 'next/image';
import Link from 'next/link';
import { motion } from 'framer-motion';
import {
  Send,
  ArrowRight,
  Camera,
  Music2,
  PlayCircle,
  CheckCircle2,
  PlugZap,
  Clock,
  FlaskConical,
  Clapperboard,
  GalleryHorizontalEnd,
} from 'lucide-react';
import { useData } from '@/lib/store';
import { PageHeader, Badge, EmptyState } from '@/components/ui';
import LiveBadge from '@/components/LiveBadge';
import { nextRunLabel, fmtDay } from '@/lib/utils';
import type { PublisherChannel } from '@/lib/types';

const CH_META: Record<string, { label: string; icon: React.ReactNode; via: string }> = {
  instagram: { label: 'Instagram Reels', icon: <Camera size={18} />, via: 'via Composio' },
  tiktok: { label: 'TikTok', icon: <Music2 size={18} />, via: 'via Zernio' },
  youtube: { label: 'YouTube Shorts', icon: <PlayCircle size={18} />, via: 'via Zernio' },
};

// Default finche' il PUBLISHER non ha ancora scritto il suo stato: fatti noti.
// Finche' il PUBLISHER non scrive il suo stato: tutti da collegare dentro Zernio.
const DEFAULT_CHANNELS: PublisherChannel[] = [
  { nome: 'instagram', stato: 'da_collegare', tool: 'assente', test: 'na' },
  { nome: 'tiktok', stato: 'da_collegare', tool: 'assente', test: 'na' },
  { nome: 'youtube', stato: 'da_collegare', tool: 'assente', test: 'na' },
];

function ChannelCard({ c }: { c: PublisherChannel }) {
  const meta = CH_META[c.nome] ?? { label: c.nome, icon: <Send size={18} />, via: '' };
  const collegato = c.stato === 'collegato';
  return (
    <div className="card p-4">
      <div className="flex items-center gap-2.5">
        <span
          className={`flex h-9 w-9 items-center justify-center rounded-xl ${collegato ? 'bg-brand-50 text-brand-600' : 'bg-subtle text-ink-3'}`}
        >
          {meta.icon}
        </span>
        <div className="min-w-0">
          <div className="text-[13.5px] font-bold text-deep">{meta.label}</div>
          {meta.via && <div className="text-[10px] font-semibold uppercase tracking-wide text-ink-3">{meta.via}</div>}
          <div className="mt-0.5">
            {collegato ? (
              <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-brand-600">
                <CheckCircle2 size={12} /> collegato
              </span>
            ) : (
              <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-tan-ink">
                <PlugZap size={12} /> da collegare
              </span>
            )}
          </div>
        </div>
      </div>
      <div className="mt-3 flex flex-wrap gap-1.5">
        <Badge tone={c.tool === 'trovato' ? 'brand' : 'neutral'}>
          tool {c.tool ?? 'da verificare'}
        </Badge>
        {c.test && c.test !== 'na' && (
          <Badge tone={c.test === 'ok' ? 'brand' : 'red'}>test {c.test}</Badge>
        )}
      </div>
    </div>
  );
}

export default function PubblicazionePage() {
  const { agents, publisherStato, videos, carousels, loading } = useData();
  const agent = agents.find((a) => a.slug === 'publisher');
  const channels = publisherStato?.canali?.length ? publisherStato.canali : DEFAULT_CHANNELS;
  const modo = publisherStato?.modo ?? 'test';

  // Coda live: contenuti approvati non ancora pubblicati (dai kv veri).
  const queueVideos = videos.filter((v) => v.stato === 'approvato');
  const queueCarousels = carousels.filter((c) => c.stato === 'approvato');
  const queueTotal = queueVideos.length + queueCarousels.length;
  const collegati = channels.filter((c) => c.stato === 'collegato').length;

  return (
    <div className="mx-auto max-w-[1000px]">
      <PageHeader
        title="Pubblicazione"
        subtitle="RIVO PUBLISHER porta i contenuti approvati su Reels, TikTok e Shorts. Per ora e' in fase di test: verifica che tutto funzioni, ma non pubblica ancora."
        right={<LiveBadge />}
      />

      {/* Banner fase di test */}
      <div className="mb-5 flex items-start gap-2.5 rounded-xl border border-[#ecd3b4] bg-[#f7e8d6]/70 px-4 py-3 text-[12.5px] leading-relaxed text-tan-ink">
        <FlaskConical size={16} className="mt-0.5 shrink-0" />
        <span>
          <b>Fase di test: non esce niente.</b> Il Publisher controlla che i canali siano collegati e che il tool
          di pubblicazione funzioni, poi te lo riporta qui. Si pubblica per davvero solo quando lo dici tu e dopo
          aver collegato TikTok, e comunque sempre col tuo PIN.
        </span>
      </div>

      {/* Stato agente */}
      <div className="mb-6 grid gap-3.5 lg:grid-cols-[340px_1fr]">
        <div className="card flex items-center gap-4 p-4">
          <span className="relative flex h-[58px] w-[58px] shrink-0 items-center justify-center rounded-2xl border border-line bg-white shadow-[var(--shadow-card)]">
            <Image src="/avatars/publisher.png" alt="RIVO Publisher" width={42} height={42} />
          </span>
          <div className="min-w-0 flex-1">
            <Link href="/agenti/publisher" className="font-display text-[15px] font-bold text-deep hover:text-brand-700">
              RIVO - PUBLISHER
            </Link>
            <div className="mt-0.5 text-[11.5px] text-ink-3">
              {agent ? `Prossimo giro: ${nextRunLabel(agent.cron)} · ${agent.schedule_label}` : 'In collegamento'}
            </div>
            <Link
              href="/agenti/publisher"
              className="mt-1 inline-flex items-center gap-1 text-[11.5px] font-semibold text-brand-600 hover:text-brand-700"
            >
              Scheda tecnica e storico giri
              <ArrowRight size={11} />
            </Link>
          </div>
        </div>
        <div className="card flex flex-wrap items-center gap-x-8 gap-y-3 p-4">
          <div>
            <div className="text-[11px] font-semibold uppercase tracking-[0.08em] text-ink-3">Modo</div>
            <div className="mt-0.5 font-display text-[18px] font-bold text-deep">
              {modo === 'live' ? 'Live' : 'Test (a secco)'}
            </div>
          </div>
          <div>
            <div className="text-[11px] font-semibold uppercase tracking-[0.08em] text-ink-3">Canali collegati</div>
            <div className="mt-0.5 font-display text-[18px] font-bold text-deep">{collegati}/3</div>
          </div>
          <div>
            <div className="text-[11px] font-semibold uppercase tracking-[0.08em] text-ink-3">In coda</div>
            <div className="mt-0.5 font-display text-[18px] font-bold text-deep">{queueTotal}</div>
          </div>
          {publisherStato?.ultimo_test && (
            <div className="text-[11px] text-ink-3">
              Ultimo controllo:{' '}
              {new Date(publisherStato.ultimo_test).toLocaleString('it-IT', {
                day: 'numeric',
                month: 'long',
                hour: '2-digit',
                minute: '2-digit',
              })}
            </div>
          )}
        </div>
      </div>

      {/* Canali */}
      <h2 className="mb-3 font-display text-[17px] font-bold tracking-tight text-deep">I canali</h2>
      <div className="mb-2 grid gap-3.5 sm:grid-cols-3">
        {channels.map((c) => (
          <ChannelCard key={c.nome} c={c} />
        ))}
      </div>
      <p className="mb-6 px-1 text-[10.5px] text-ink-3">
        {publisherStato
          ? publisherStato.nota ?? 'Stato scritto dal Publisher al suo ultimo giro.'
          : 'Setup ibrido: Instagram via Composio (gia collegato), TikTok e YouTube via Zernio (login semplice, audit TikTok gia passato da Zernio). In attesa del primo giro del Publisher, che verifica i canali e li segnala qui.'}
      </p>

      {/* Coda di pubblicazione */}
      <div className="mb-3 flex items-center justify-between">
        <h2 className="font-display text-[17px] font-bold tracking-tight text-deep">Coda di pubblicazione</h2>
        <span className="text-[11.5px] text-ink-3">
          {queueTotal > 0 ? `${queueTotal} approvati, pronti da pubblicare` : 'niente in coda'}
        </span>
      </div>

      {loading ? (
        <div className="grid gap-3 md:grid-cols-2">
          {Array.from({ length: 2 }).map((_, i) => (
            <div key={i} className="skeleton h-[76px]" />
          ))}
        </div>
      ) : queueTotal === 0 ? (
        <EmptyState
          title="Niente in coda"
          note="Qui arrivano i video e i caroselli che approvi col PIN. Il Publisher li prende, verifica che siano pronti per ogni canale, e (quando saremo live) li pubblica."
        />
      ) : (
        <div className="grid gap-3 md:grid-cols-2">
          {queueVideos.map((v) => (
            <motion.div key={v.key} initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} className="card flex items-center gap-3 p-3.5">
              <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-[#f3effc] text-[#5b3fb0]">
                <Clapperboard size={16} />
              </span>
              <div className="min-w-0 flex-1">
                <div className="truncate text-[13px] font-semibold text-deep">{v.tema || `Video del ${fmtDay(v.date)}`}</div>
                <div className="text-[11px] text-ink-3">Video · approvato, aspetta la pubblicazione</div>
              </div>
              <Badge tone="brand">in coda</Badge>
            </motion.div>
          ))}
          {queueCarousels.map((c) => (
            <motion.div key={c.key} initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} className="card flex items-center gap-3 p-3.5">
              <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-[#e6f4f9] text-[#1f7d99]">
                <GalleryHorizontalEnd size={16} />
              </span>
              <div className="min-w-0 flex-1">
                <div className="truncate text-[13px] font-semibold text-deep">{c.tema || `Carosello del ${fmtDay(c.date)}`}</div>
                <div className="text-[11px] text-ink-3">Carosello · approvato, aspetta la pubblicazione</div>
              </div>
              <Badge tone="brand">in coda</Badge>
            </motion.div>
          ))}
        </div>
      )}

      <div className="mt-8 flex items-start gap-2 text-[10.5px] leading-relaxed text-ink-3">
        <Clock size={13} className="mt-0.5 shrink-0" />
        <span>
          L&apos;ordine e&apos;: TikTok lo colleghi tu (ultimo passo), poi mi dai l&apos;OK per passare a live. Da li&apos; in poi
          il Publisher pubblica gli approvati sui canali pronti, con la disclosure &quot;Creato con AI&quot; e la caption
          giusta per ognuno, sempre col tuo PIN.
        </span>
      </div>
    </div>
  );
}
