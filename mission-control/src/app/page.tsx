'use client';

import Link from 'next/link';
import Image from 'next/image';
import { motion } from 'framer-motion';
import { Users, MessagesSquare, PhoneCall, MailOpen, ArrowRight, Video, ShieldCheck } from 'lucide-react';
import { useData } from '@/lib/store';
import { PageHeader, StatCard, EmptyState } from '@/components/ui';
import AgentCard from '@/components/AgentCard';
import LiveBadge from '@/components/LiveBadge';
import { timeAgo } from '@/lib/utils';

const HEALTH = {
  ok: { label: 'Sistema in salute', dot: '#1f9d6b', bg: '#eaf5f0', bd: '#cfe8de', tx: '#0e7c6b' },
  attenzione: { label: 'Attenzione', dot: '#d9a441', bg: '#fdf6ec', bd: '#f0dcc0', tx: '#8a5a1a' },
  critico: { label: 'Serve un intervento', dot: '#d4552f', bg: '#fbecea', bd: '#f3cbc4', tx: '#a63d20' },
} as const;

export default function Home() {
  const { agents, creators, drafts, loading, leadTotals, guardianoHealth } = useData();
  const leadTot = leadTotals.tot;
  const gh = guardianoHealth;
  const h = gh ? HEALTH[gh.stato] ?? HEALTH.ok : null;

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

      {/* Semaforo di salute del Guardiano */}
      {!loading && (
        <div
          className="mb-6 flex items-center gap-3 rounded-2xl border px-4 py-3"
          style={
            h
              ? { background: h.bg, borderColor: h.bd, color: h.tx }
              : { background: '#f4f4f2', borderColor: '#e5e5e0', color: '#83908a' }
          }
        >
          <span className="relative flex h-3 w-3 shrink-0">
            <span
              className={gh?.stato === 'ok' ? 'dot-working absolute inline-flex h-3 w-3 rounded-full' : 'absolute inline-flex h-3 w-3 rounded-full'}
              style={{ background: h ? h.dot : 'var(--ink-3)' }}
            />
          </span>
          <div className="min-w-0 flex-1">
            <div className="flex items-center gap-2">
              <ShieldCheck size={15} />
              <span className="text-[13.5px] font-bold">
                {h ? h.label : 'Guardiano in arrivo'}
              </span>
              {gh?.updated_at && (
                <span className="text-[11px] opacity-70">· controllo {timeAgo(gh.updated_at)}</span>
              )}
            </div>
            <div className="mt-0.5 text-[12px] leading-snug opacity-90">
              {gh?.nota
                ? gh.nota
                : gh
                  ? 'Il Guardiano ha controllato la squadra.'
                  : 'Il manutentore controllera la salute della squadra e ti terra tutto verde. Tu guardi solo qui.'}
            </div>
          </div>
          {gh && (gh.riparati?.length ?? 0) + (gh.da_builder?.length ?? 0) > 0 && (
            <div className="hidden shrink-0 text-right text-[11px] font-semibold sm:block">
              {(gh.riparati?.length ?? 0) > 0 && <div>{gh.riparati!.length} riparati</div>}
              {(gh.da_builder?.length ?? 0) > 0 && <div>{gh.da_builder!.length} al builder</div>}
            </div>
          )}
        </div>
      )}

      {/* KPI */}
      <div className="mb-7 grid grid-cols-2 gap-3.5 lg:grid-cols-4">
        {loading ? (
          Array.from({ length: 4 }).map((_, i) => <div key={i} className="skeleton h-[108px]" />)
        ) : (
          <>
            <Link href="/creator" className="block">
              <StatCard
                label="Creator in pipeline"
                value={crm.length}
                hint={`+ ${leadTot} lead scansionati dallo Scout`}
                icon={<Users size={16} />}
              />
            </Link>
            <Link href="/messaggi" className="block">
              <StatCard
                label="In trattativa"
                value={inTrattativa}
                hint="Hanno risposto, si lavora"
                icon={<MessagesSquare size={16} />}
              />
            </Link>
            <Link href="/creator" className="block">
              <StatCard
                label="Call fissate"
                value={callFissate.length}
                hint="Tutte performance pura"
                icon={<PhoneCall size={16} />}
                accent
              />
            </Link>
            <Link href="/bozze" className="block">
              <StatCard
                label="Bozze da approvare"
                value={pendingDrafts}
                hint={pendingDrafts > 0 ? 'Aspettano il tuo OK' : 'Nessuna in attesa'}
                icon={<MailOpen size={16} />}
              />
            </Link>
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
              href="/call"
              className="group inline-flex items-center gap-1 text-[12px] font-semibold text-brand-600 hover:text-brand-700"
            >
              Materiale call e script
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
