'use client';

import Image from 'next/image';
import Link from 'next/link';
import { motion } from 'framer-motion';
import {
  Radar,
  Sparkle,
  CheckCircle2,
  XCircle,
  ExternalLink,
  AtSign,
  Music2,
  ArrowRight,
} from 'lucide-react';
import { useData } from '@/lib/store';
import { PageHeader, StatCard, EmptyState } from '@/components/ui';
import LiveBadge from '@/components/LiveBadge';
import { nextRunLabel } from '@/lib/utils';

const FLOW = [
  { step: 'Scoperta', detail: 'Hashtag travel e profili collegati, scansione larga' },
  { step: 'Arricchimento', detail: 'Follower, email pubblica, nicchia del profilo' },
  { step: 'Valutazione', detail: 'GPT giudica pubblico e affinita con Rivolio' },
  { step: 'Consegna', detail: 'Solo i Pronto passano al primo contatto' },
];

export default function ScoutPage() {
  const { creators, agents, loading, leadTotals, scoutStats } = useData();
  const agent = agents.find((a) => a.slug === 'scout');

  // Solo dati LIVE: i Pronto che lo Scout ha consegnato davvero alla dashboard.
  const pronti = creators
    .filter((c) => c.source === 'scout')
    .sort((a, b) => (b.updated_at ?? '').localeCompare(a.updated_at ?? ''));

  return (
    <div className="mx-auto max-w-[1120px]">
      <PageHeader
        title="Scout"
        subtitle="La pipeline dei lead: dalla scoperta larga ai creator pronti per il primo contatto."
        right={<LiveBadge />}
      />

      {/* Stato agente + flusso */}
      <div className="mb-6 grid gap-3.5 lg:grid-cols-[340px_1fr]">
        <div className="card flex items-center gap-4 p-4">
          <div className="relative h-[58px] w-[58px] shrink-0">
            <span className="relative flex h-full w-full items-center justify-center rounded-2xl border border-line bg-white shadow-[var(--shadow-card)]">
              <Image src="/avatars/scout.png" alt="RIVO Scout" width={42} height={42} />
            </span>
          </div>
          <div className="min-w-0 flex-1">
            <div className="flex flex-wrap items-center gap-2">
              <Link href="/agenti/scout" className="font-display text-[15px] font-bold text-deep hover:text-brand-700">
                RIVO - SCOUT
              </Link>
            </div>
            <div className="mt-0.5 text-[11.5px] text-ink-3">
              {agent ? `Prossimo giro: ${nextRunLabel(agent.cron)} · ${agent.schedule_label}` : 'In collegamento'}
            </div>
            <Link
              href="/agenti/scout"
              className="mt-1 inline-flex items-center gap-1 text-[11.5px] font-semibold text-brand-600 hover:text-brand-700"
            >
              Scheda tecnica e storico giri
              <ArrowRight size={11} />
            </Link>
          </div>
        </div>

        <div className="card flex items-center p-4">
          <div className="grid w-full gap-3 sm:grid-cols-4">
            {FLOW.map((f, i) => (
              <div key={f.step} className="relative">
                <div className="flex items-center gap-2">
                  <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-deep text-[10.5px] font-bold text-mint">
                    {i + 1}
                  </span>
                  <span className="text-[12.5px] font-semibold text-deep">{f.step}</span>
                </div>
                <p className="mt-1 pl-8 text-[10.5px] leading-snug text-ink-3 sm:pl-0 sm:pt-0.5">
                  {f.detail}
                </p>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* KPI live dal kv scout_stats */}
      <div className="mb-2 grid grid-cols-2 gap-3.5 lg:grid-cols-4">
        {loading ? (
          Array.from({ length: 4 }).map((_, i) => <div key={i} className="skeleton h-[108px]" />)
        ) : (
          <>
            <StatCard label="Lead scansionati" value={leadTotals.tot} hint="Tutti i profili passati dai giri" icon={<Radar size={16} />} />
            <StatCard label="In arricchimento" value={leadTotals.da_arricchire} hint="Profilo ancora da completare" icon={<Sparkle size={16} />} />
            <StatCard label="Pronti" value={leadTotals.pronto} hint="In target, passano al contatto" icon={<CheckCircle2 size={16} />} accent />
            <StatCard label="Scartati" value={leadTotals.scartato} hint="Fuori target: meglio pochi ma buoni" icon={<XCircle size={16} />} />
          </>
        )}
      </div>
      <div className="mb-6 px-1 text-[10.5px] text-ink-3">
        {scoutStats?.updated_at
          ? `Contatori live dalla tabella Leads di Airtable, ultimo aggiornamento ${new Date(scoutStats.updated_at).toLocaleString('it-IT', { day: 'numeric', month: 'long', hour: '2-digit', minute: '2-digit' })}.`
          : 'Contatori in attesa del primo giro dello Scout.'}
      </div>

      {/* Pronto consegnati: SOLO dati live dalla dashboard */}
      <div className="mb-3 flex items-center justify-between">
        <h2 className="font-display text-[17px] font-bold tracking-tight text-deep">
          Pronto consegnati dallo Scout
        </h2>
        <span className="text-[11.5px] text-ink-3">
          {pronti.length > 0 ? `${pronti.length} in attesa del primo contatto` : 'Nessuno in coda'}
        </span>
      </div>

      {loading ? (
        <div className="grid gap-3 md:grid-cols-2 lg:grid-cols-3">
          {Array.from({ length: 3 }).map((_, i) => (
            <div key={i} className="skeleton h-[92px]" />
          ))}
        </div>
      ) : pronti.length === 0 ? (
        <EmptyState
          title="Pipeline vuota, si riparte da zero"
          note="Reset del 28/8 deciso da Valerio: la tabella Leads e stata svuotata. Lo Scout riparte col giro delle 6:00 e i nuovi Pronto compaiono qui da soli, in tempo reale."
        />
      ) : (
        <div className="grid gap-3 md:grid-cols-2 lg:grid-cols-3">
          {pronti.map((c, i) => (
            <motion.div
              key={c.id}
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.25, delay: Math.min(i * 0.03, 0.4) }}
              className="card card-hover p-3.5"
            >
              <div className="flex items-center gap-2">
                {c.tiktok ? (
                  <Music2 size={12} className="shrink-0 text-ink-3" />
                ) : (
                  <AtSign size={12} className="shrink-0 text-brand-600" />
                )}
                {c.url ? (
                  <a
                    href={c.url}
                    target="_blank"
                    rel="noreferrer"
                    className="group inline-flex min-w-0 items-center gap-1 text-[13px] font-semibold text-deep hover:text-brand-700"
                  >
                    <span className="truncate">{c.name}</span>
                    <ExternalLink size={10} className="shrink-0 opacity-0 transition-opacity group-hover:opacity-100" />
                  </a>
                ) : (
                  <span className="truncate text-[13px] font-semibold text-deep">{c.name}</span>
                )}
                {c.followers && (
                  <span className="ml-auto shrink-0 text-[11px] font-semibold text-ink-2">{c.followers}</span>
                )}
              </div>
              <div className="mt-1.5 flex flex-wrap items-center gap-x-3 gap-y-0.5 text-[10.5px] text-ink-3">
                {c.email && <span className="truncate text-brand-600">{c.email}</span>}
                {c.esito && <span className="line-clamp-2">{c.esito}</span>}
              </div>
            </motion.div>
          ))}
        </div>
      )}

      <div className="mt-8 text-[10.5px] leading-relaxed text-ink-3">
        Tutto quello che vedi qui e live: contatori dal kv mantenuto dagli agenti, card dai Pronto
        consegnati davvero alla dashboard. La lista completa dei lead, scartati compresi, vive in
        Airtable.
      </div>
    </div>
  );
}
