'use client';

import { useState } from 'react';
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
  const queueVideos = videos.filter((v) => v.stato === 'approvato' || v.stato === 'in_pubblicazione');
  const queueCarousels = carousels.filter((c) => c.stato === 'approvato' || c.stato === 'in_pubblicazione');
  const queueTotal = queueVideos.length + queueCarousels.length;
  const collegati = channels.filter((c) => c.stato === 'collegato').length;

  const [pubBusy, setPubBusy] = useState(false);
  const [pubMsg, setPubMsg] = useState<string | null>(null);
  async function pubblicaOra() {
    const pin = typeof window !== 'undefined' ? localStorage.getItem('mc_pin') : null;
    if (!pin) {
      setPubMsg('Serve il PIN: approva un contenuto una volta per impostarlo.');
      return;
    }
    setPubBusy(true);
    setPubMsg(null);
    try {
      const res = await fetch('/api/publish', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ pin }),
      });
      const data = await res.json();
      if (res.status === 401) setPubMsg('PIN errato.');
      else if (data.ok) setPubMsg(`Fatto: ${data.pubblicati ?? 0} contenuti spinti. Il feed mostra i dettagli.`);
      else setPubMsg('Provato, ma qualcosa non e uscito: guarda il feed per il motivo.');
    } catch {
      setPubMsg('Errore di rete, riprova.');
    } finally {
      setPubBusy(false);
    }
  }

  return (
    <div className="mx-auto max-w-[1000px]">
      <PageHeader
        title="Pubblicazione"
        subtitle="RIVO PUBLISHER porta i contenuti approvati su TikTok, Reels e Shorts. Ora e' LIVE: quando approvi un contenuto, lo pubblica sul serio e verifica che sia online."
        right={<LiveBadge />}
      />

      {/* Banner modalita live */}
      <div className="mb-5 flex items-start gap-2.5 rounded-xl border border-[#cfe8de] bg-[#eaf5f0]/80 px-4 py-3 text-[12.5px] leading-relaxed text-[#0e7c6b]">
        <CheckCircle2 size={16} className="mt-0.5 shrink-0" />
        <span>
          <b>Modalita LIVE: pubblica per davvero col tuo OK.</b> Quando approvi un contenuto, il Publisher lo
          pubblica sui canali giusti (i caroselli su TikTok; Instagram appena c&apos;e&apos; l&apos;account brand @rivolio),
          con caption e hashtag su misura e la disclosure &quot;Creato con AI&quot;, poi rilegge il post per verificare che
          sia davvero online. Quello che non approvi non esce mai.
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
              RIVO - DISTRIBUZIONE & DATI
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
          : 'Tutte e 3 le piattaforme via Zernio dal backend: TikTok e YouTube gia collegati, Instagram si accende quando colleghi @rivolio. La pubblicazione parte dal server (Railway), non dagli agenti.'}
      </p>

      {/* Coda di pubblicazione */}
      <div className="mb-3 flex flex-wrap items-center justify-between gap-2">
        <h2 className="font-display text-[17px] font-bold tracking-tight text-deep">Coda di pubblicazione</h2>
        <div className="flex items-center gap-3">
          <span className="text-[11.5px] text-ink-3">
            {queueTotal > 0 ? `${queueTotal} pronti da pubblicare` : 'niente in coda'}
          </span>
          <button
            onClick={pubblicaOra}
            disabled={pubBusy || queueTotal === 0}
            className="inline-flex items-center gap-1.5 rounded-full bg-deep px-3.5 py-1.5 text-[12px] font-semibold text-mint shadow-sm transition hover:opacity-90 disabled:opacity-40"
          >
            <Send size={13} />
            {pubBusy ? 'Pubblico...' : 'Pubblica ora'}
          </button>
        </div>
      </div>
      {pubMsg && <p className="mb-3 text-[11.5px] font-medium text-brand-700">{pubMsg}</p>}

      {loading ? (
        <div className="grid gap-3 md:grid-cols-2">
          {Array.from({ length: 2 }).map((_, i) => (
            <div key={i} className="skeleton h-[76px]" />
          ))}
        </div>
      ) : queueTotal === 0 ? (
        <EmptyState
          title="Niente in coda"
          note="Qui arrivano i video e i caroselli che approvi. Il Publisher li prende, li prepara per ogni canale e li pubblica sul serio, poi verifica che siano online."
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
          Come funziona: tu approvi un contenuto (il tuo OK), e al primo giro utile il Publisher lo pubblica sui
          canali pronti, con la disclosure &quot;Creato con AI&quot; e la caption giusta per ognuno, poi verifica che sia
          online e te lo conferma qui. I caroselli per ora vanno solo su TikTok; Instagram si sblocca con
          l&apos;account brand @rivolio.
        </span>
      </div>
    </div>
  );
}
