'use client';

import Image from 'next/image';
import Link from 'next/link';
import { Target, TrendingDown, Lightbulb } from 'lucide-react';
import { useData } from '@/lib/store';
import { PageHeader, EmptyState, Badge } from '@/components/ui';
import LiveBadge from '@/components/LiveBadge';
import { nextRunLabel } from '@/lib/utils';

const GRAV_TONE: Record<string, 'brand' | 'tan' | 'neutral'> = {
  alta: 'tan',
  media: 'neutral',
  bassa: 'neutral',
};

export default function CroPage() {
  const { agents, croStato: c, loading } = useData();
  const agent = agents.find((a) => a.slug === 'cro');
  const funnel = c?.funnel ?? [];
  const proposte = c?.proposte ?? [];
  const empty = !loading && funnel.length === 0 && proposte.length === 0;

  return (
    <div className="mx-auto max-w-[1120px]">
      <PageHeader
        title="Conversione"
        subtitle="Il traffico deve diventare pratiche. Qui gli attriti che fanno perdere clienti su rivolio.it e le migliorie proposte, da approvare col PIN."
        right={<LiveBadge />}
      />

      <div className="mb-6 card flex items-center gap-4 p-4">
        <span className="relative flex h-[54px] w-[54px] shrink-0 items-center justify-center rounded-2xl border border-line bg-white shadow-[var(--shadow-card)]">
          <Image src="/avatars/guardiano.png" alt="RIVO CRO" width={38} height={38} />
        </span>
        <div className="min-w-0 flex-1">
          <Link href="/agenti/cro" className="font-display text-[15px] font-bold text-deep hover:text-brand-700">
            RIVO - CRO
          </Link>
          <div className="mt-0.5 text-[11.5px] text-ink-3">
            {agent ? `Prossimo giro: ${nextRunLabel(agent.cron)} · ${agent.schedule_label}` : 'Ruolo pronto, sessione da attivare'}
          </div>
        </div>
        <Target size={20} className="text-brand-600" />
      </div>

      {c?.nota && <div className="mb-4 text-[12.5px] text-ink-2">{c.nota}</div>}

      {empty ? (
        <EmptyState
          title="Funnel non ancora analizzato"
          note="Il ruolo CRO guarda il percorso dal contenuto al verdetto alla pratica su rivolio.it, trova dove si perde gente e propone come toglierlo. Le proposte compaiono qui in attesa del tuo OK."
        />
      ) : (
        <div className="grid gap-6 lg:grid-cols-2">
          <div>
            <div className="mb-3 flex items-center gap-2">
              <TrendingDown size={16} className="text-tan-ink" />
              <h2 className="font-display text-[16px] font-bold text-deep">Attriti del funnel</h2>
              {funnel.length > 0 && <Badge tone="tan">{funnel.length}</Badge>}
            </div>
            <div className="grid gap-2.5">
              {funnel.length === 0 && <div className="card p-4 text-[12px] text-ink-3">Nessun attrito segnalato.</div>}
              {funnel.map((f, i) => (
                <div key={i} className="card p-3">
                  <div className="flex items-center gap-2">
                    <span className="rounded-full bg-subtle px-2 py-0.5 text-[10.5px] font-semibold uppercase tracking-wide text-ink-2">{f.tappa}</span>
                    {f.gravita && <Badge tone={GRAV_TONE[f.gravita] ?? 'neutral'}>{f.gravita}</Badge>}
                  </div>
                  <div className="mt-2 text-[12.5px] leading-snug text-deep">{f.attrito}</div>
                </div>
              ))}
            </div>
          </div>

          <div>
            <div className="mb-3 flex items-center gap-2">
              <Lightbulb size={16} className="text-brand-600" />
              <h2 className="font-display text-[16px] font-bold text-deep">Proposte</h2>
              {proposte.length > 0 && <Badge tone="brand">{proposte.length}</Badge>}
            </div>
            <div className="grid gap-2.5">
              {proposte.length === 0 && <div className="card p-4 text-[12px] text-ink-3">Nessuna proposta ancora.</div>}
              {proposte.map((p, i) => (
                <div key={i} className="card p-4">
                  <div className="flex items-center gap-2">
                    {p.priorita && <Badge tone={p.priorita === 'alta' ? 'brand' : 'neutral'}>{p.priorita}</Badge>}
                    <Badge tone="outline">{p.stato ?? 'in attesa'}</Badge>
                  </div>
                  <div className="mt-2 text-[13px] font-semibold leading-snug text-deep">{p.cosa}</div>
                  {p.perche && <div className="mt-1 text-[11.5px] leading-snug text-ink-2">{p.perche}</div>}
                  <div className="mt-2 flex flex-wrap gap-x-4 gap-y-1 border-t border-line pt-2 text-[11px] text-ink-3">
                    {p.impatto_atteso && <span><span className="font-semibold">Impatto:</span> {p.impatto_atteso}</span>}
                    {p.come_misurare && <span><span className="font-semibold">Misura:</span> {p.come_misurare}</span>}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
