'use client';

import Link from 'next/link';
import Image from 'next/image';
import { motion } from 'framer-motion';
import { Users, MessagesSquare, PhoneCall, MailOpen, ArrowRight, Video } from 'lucide-react';
import { useData } from '@/lib/store';
import { PageHeader, StatCard, EmptyState } from '@/components/ui';
import AgentCard from '@/components/AgentCard';
import LiveBadge from '@/components/LiveBadge';

export default function Home() {
  const { agents, creators, drafts, loading, leadTotals } = useData();

  const crm = creators.filter((c) => c.source === 'crm');
  const inTrattativa = crm.filter((c) => c.stage === 'Risposto').length;
  const callFissate = crm.filter((c) => c.stage === 'Call fissata');
  const pendingDrafts = drafts.filter((d) => d.status === 'bozza').length;

  return (
    <div className="mx-auto max-w-[1060px]">
      <PageHeader
        title="Mission Control"
        subtitle="La squadra growth di Rivolio, in un colpo d'occhio."
        right={<LiveBadge />}
      />

      {/* KPI */}
      <div className="mb-7 grid grid-cols-2 gap-3.5 lg:grid-cols-4">
        {loading ? (
          Array.from({ length: 4 }).map((_, i) => <div key={i} className="skeleton h-[108px]" />)
        ) : (
          <>
            <StatCard
              label="Creator in pipeline"
              value={crm.length}
              hint={`+ ${leadTotals.tot} lead scansionati dallo Scout`}
              icon={<Users size={16} />}
            />
            <StatCard
              label="In trattativa"
              value={inTrattativa}
              hint="Hanno risposto, si lavora"
              icon={<MessagesSquare size={16} />}
            />
            <StatCard
              label="Call fissate"
              value={callFissate.length}
              hint="Tutte performance pura"
              icon={<PhoneCall size={16} />}
              accent
            />
            <StatCard
              label="Bozze da approvare"
              value={pendingDrafts}
              hint={pendingDrafts > 0 ? 'Aspettano il tuo OK' : 'Nessuna in attesa'}
              icon={<MailOpen size={16} />}
            />
          </>
        )}
      </div>

      {/* Squadra */}
      <div className="mb-3 flex items-center justify-between">
        <h2 className="font-display text-[17px] font-bold tracking-tight text-deep">La squadra</h2>
        <span className="text-[11.5px] text-ink-3">
          {agents.filter((a) => a.status === 'working').length > 0
            ? `${agents.filter((a) => a.status === 'working').length} al lavoro adesso`
            : 'Tutti in attesa del prossimo giro'}
        </span>
      </div>
      <div className="mb-8 grid gap-3.5 lg:grid-cols-2">
        {loading
          ? Array.from({ length: 4 }).map((_, i) => <div key={i} className="skeleton h-[168px]" />)
          : agents.map((a, i) => <AgentCard key={a.slug} agent={a} index={i} />)}
      </div>

      {/* Call di oggi */}
      {callFissate.length > 0 && (
        <motion.div
          initial={{ opacity: 0, y: 14 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.3 }}
        >
          <div className="mb-3 flex items-center justify-between">
            <h2 className="font-display text-[17px] font-bold tracking-tight text-deep">
              Call in agenda
            </h2>
            <Link
              href="/creator"
              className="group inline-flex items-center gap-1 text-[12px] font-semibold text-brand-600 hover:text-brand-700"
            >
              Tutta la pipeline
              <ArrowRight size={13} className="transition-transform group-hover:translate-x-0.5" />
            </Link>
          </div>
          <div className="grid gap-3 md:grid-cols-3">
            {callFissate.map((c) => (
              <div key={c.id} className="card card-hover flex items-start gap-3 p-4">
                <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-deep text-mint">
                  <Video size={16} />
                </span>
                <div className="min-w-0">
                  <div className="truncate text-[13.5px] font-semibold text-deep">{c.name}</div>
                  {c.ig && <div className="truncate text-[11.5px] text-brand-600">@{c.ig}</div>}
                  <p className="mt-1 line-clamp-2 text-[11.5px] leading-snug text-ink-3">{c.esito}</p>
                </div>
              </div>
            ))}
          </div>
        </motion.div>
      )}

      {!loading && agents.length === 0 && (
        <EmptyState
          title="Squadra non ancora collegata"
          note="Appena il database e collegato, gli agenti compaiono qui con il loro stato live."
        />
      )}

      {/* Footer piccolo */}
      <div className="mt-10 flex items-center gap-2 text-[10.5px] text-ink-3">
        <Image src="/plane.png" alt="" width={16} height={16} className="opacity-60" />
        Lo stato riflette i dati veri: niente qui viene segnato fatto se non e successo davvero.
      </div>
    </div>
  );
}
