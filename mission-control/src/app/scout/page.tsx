'use client';

import { useMemo, useState } from 'react';
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
  Search,
  ArrowRight,
} from 'lucide-react';
import { useData } from '@/lib/store';
import { PageHeader, StatCard, Badge, StatusPill } from '@/components/ui';
import LiveBadge from '@/components/LiveBadge';
import { cn, fmtFollowers, nextRunLabel } from '@/lib/utils';
import type { LeadRow } from '@/lib/types';

const FLOW = [
  { step: 'Scoperta', detail: 'Hashtag travel e profili collegati, scansione larga' },
  { step: 'Arricchimento', detail: 'Follower, email pubblica, nicchia del profilo' },
  { step: 'Valutazione', detail: 'GPT giudica pubblico e affinita con Rivolio' },
  { step: 'Consegna', detail: 'Solo i Pronto passano al primo contatto' },
];

const Q_COLORS: Record<string, string> = {
  A: 'bg-brand-100 text-brand-700',
  B: 'bg-[#f7e8d6] text-tan-ink',
  C: 'bg-subtle text-ink-2',
};

function LeadCard({ lead, index }: { lead: LeadRow; index: number }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.25, delay: Math.min(index * 0.03, 0.4) }}
      className="card card-hover p-3"
    >
      <div className="flex items-center gap-2">
        {lead.p === 'TikTok' ? (
          <Music2 size={12} className="shrink-0 text-ink-3" />
        ) : (
          <AtSign size={12} className="shrink-0 text-brand-600" />
        )}
        {lead.url ? (
          <a
            href={lead.url}
            target="_blank"
            rel="noreferrer"
            className="group inline-flex min-w-0 items-center gap-1 text-[12.5px] font-semibold text-deep hover:text-brand-700"
          >
            <span className="truncate">{lead.u}</span>
            <ExternalLink size={10} className="shrink-0 opacity-0 transition-opacity group-hover:opacity-100" />
          </a>
        ) : (
          <span className="truncate text-[12.5px] font-semibold text-deep">{lead.u}</span>
        )}
        {lead.q && (
          <span className={cn('ml-auto shrink-0 rounded-md px-1.5 py-0.5 text-[10px] font-bold', Q_COLORS[lead.q] ?? Q_COLORS.C)}>
            {lead.q}
          </span>
        )}
      </div>
      <div className="mt-1.5 flex flex-wrap items-center gap-x-3 gap-y-0.5 text-[10.5px] text-ink-3">
        {lead.f != null && lead.f > 0 && <span className="font-semibold text-ink-2">{fmtFollowers(lead.f)} follower</span>}
        {lead.sc != null && <span>score {lead.sc}</span>}
        {lead.n && <span className="capitalize">{lead.n}</span>}
        {lead.e && <span className="truncate text-brand-600">{lead.e}</span>}
      </div>
    </motion.div>
  );
}

export default function ScoutPage() {
  const { leads, agents, loading, leadTotals, scoutStats } = useData();
  const agent = agents.find((a) => a.slug === 'scout');
  const [q, setQ] = useState('');
  const [allScartati, setAllScartati] = useState(false);

  const filtered = useMemo(() => {
    const term = q.trim().toLowerCase();
    if (!term) return leads;
    return leads.filter(
      (l) => l.u.toLowerCase().includes(term) || (l.n ?? '').toLowerCase().includes(term),
    );
  }, [leads, q]);

  const cols = useMemo(() => {
    const byScore = (a: LeadRow, b: LeadRow) => (b.sc ?? -1) - (a.sc ?? -1);
    return {
      arricchire: filtered.filter((l) => l.s === 'Da arricchire').sort(byScore),
      pronto: filtered.filter((l) => l.s === 'Pronto').sort(byScore),
      scartato: filtered.filter((l) => l.s === 'Scartato').sort(byScore),
    };
  }, [filtered]);

  const scartatiVisible = allScartati ? cols.scartato : cols.scartato.slice(0, 12);

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
              {agent && <StatusPill status={agent.status} size="sm" />}
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

      {/* KPI */}
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
          : 'Contatori dallo snapshot impacchettato: appena gli agenti scrivono i numeri live, compaiono qui da soli.'}
      </div>

      {/* Ricerca */}
      <div className="mb-4 flex flex-wrap items-center gap-2.5">
        <div className="relative min-w-[200px] flex-1 sm:max-w-[280px]">
          <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-ink-3" />
          <input
            value={q}
            onChange={(e) => setQ(e.target.value)}
            placeholder="Cerca lead o nicchia…"
            className="card w-full rounded-xl py-2 pl-9 pr-3 text-[12.5px] outline-none placeholder:text-ink-3 focus:border-brand-400 focus:shadow-[0_0_0_3px_rgba(46,167,141,0.15)]"
          />
        </div>
        <Badge tone="outline">Qualita: A forte · B buona · C debole</Badge>
      </div>

      {/* Kanban */}
      {loading ? (
        <div className="grid gap-3.5 lg:grid-cols-3">
          {Array.from({ length: 3 }).map((_, i) => (
            <div key={i} className="skeleton h-[380px]" />
          ))}
        </div>
      ) : (
        <div className="grid items-start gap-3.5 lg:grid-cols-3">
          {/* Da arricchire */}
          <div className="rounded-2xl border border-line bg-white/50 p-3">
            <div className="mb-2.5 flex items-center gap-2 px-1">
              <Sparkle size={14} className="text-tan-ink" />
              <span className="text-[12.5px] font-bold text-deep">Da arricchire</span>
              <span className="ml-auto rounded-full bg-subtle px-2 py-0.5 text-[10.5px] font-bold text-ink-2">
                {cols.arricchire.length}
              </span>
            </div>
            <div className="space-y-2">
              {cols.arricchire.length === 0 && (
                <p className="px-1 py-4 text-center text-[11.5px] text-ink-3">
                  Nessun lead in arricchimento adesso.
                </p>
              )}
              {cols.arricchire.map((l, i) => (
                <LeadCard key={l.u} lead={l} index={i} />
              ))}
            </div>
          </div>

          {/* Pronto */}
          <div className="rounded-2xl border border-brand-200 bg-brand-50/50 p-3">
            <div className="mb-2.5 flex items-center gap-2 px-1">
              <CheckCircle2 size={14} className="text-brand-600" />
              <span className="text-[12.5px] font-bold text-deep">Pronto</span>
              <span className="ml-auto rounded-full bg-brand-100 px-2 py-0.5 text-[10.5px] font-bold text-brand-700">
                {cols.pronto.length}
              </span>
            </div>
            <div className="space-y-2">
              {cols.pronto.length === 0 && (
                <p className="px-1 py-4 text-center text-[11.5px] text-ink-3">
                  Nessun lead pronto in questo momento.
                </p>
              )}
              {cols.pronto.map((l, i) => (
                <LeadCard key={l.u} lead={l} index={i} />
              ))}
            </div>
            {cols.pronto.length > 0 && (
              <p className="mt-2.5 px-1 text-[10.5px] leading-snug text-ink-3">
                I Pronto passano a RIVO IG e Email per il primo contatto personalizzato.
              </p>
            )}
          </div>

          {/* Scartato */}
          <div className="rounded-2xl border border-line bg-white/50 p-3">
            <div className="mb-2.5 flex items-center gap-2 px-1">
              <XCircle size={14} className="text-ink-3" />
              <span className="text-[12.5px] font-bold text-deep">Scartato</span>
              <span className="ml-auto rounded-full bg-subtle px-2 py-0.5 text-[10.5px] font-bold text-ink-2">
                {cols.scartato.length}
              </span>
            </div>
            <div className="space-y-2">
              {scartatiVisible.map((l, i) => (
                <LeadCard key={l.u} lead={l} index={i} />
              ))}
            </div>
            {cols.scartato.length > 12 && (
              <button
                onClick={() => setAllScartati((v) => !v)}
                className="mt-2.5 w-full rounded-xl border border-line bg-white py-2 text-[11.5px] font-semibold text-ink-2 transition-colors hover:border-line-strong hover:text-deep"
              >
                {allScartati ? 'Mostra meno' : `Mostra tutti i ${cols.scartato.length} in vista`}
              </button>
            )}
            {leadTotals.scartato > cols.scartato.length && (
              <p className="mt-2.5 px-1 text-[10.5px] leading-snug text-ink-3">
                Qui i piu rilevanti: gli scartati totali sono {leadTotals.scartato}, la lista completa
                vive in Airtable.
              </p>
            )}
          </div>
        </div>
      )}

      <div className="mt-8 text-[10.5px] leading-relaxed text-ink-3">
        I contatori qui sopra sono i numeri veri di Airtable, mantenuti a ogni giro dello Scout e del
        CAPO. Le card della pipeline mostrano un estratto dei lead piu rilevanti: la lista completa
        vive in Airtable.
      </div>
    </div>
  );
}
