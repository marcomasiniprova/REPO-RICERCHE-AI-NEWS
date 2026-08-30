'use client';

import Image from 'next/image';
import Link from 'next/link';
import { Radio, Music2, Newspaper, Sparkles, Clapperboard, ArrowRight } from 'lucide-react';
import { useData } from '@/lib/store';
import { PageHeader, EmptyState, Badge } from '@/components/ui';
import LiveBadge from '@/components/LiveBadge';
import { nextRunLabel } from '@/lib/utils';
import type { TrendItem } from '@/lib/types';

const TIPO_META: Record<string, { label: string; icon: React.ReactNode }> = {
  audio: { label: 'Audio', icon: <Music2 size={12} /> },
  format: { label: 'Format', icon: <Clapperboard size={12} /> },
  hook: { label: 'Hook', icon: <Sparkles size={12} /> },
  news: { label: 'News', icon: <Newspaper size={12} /> },
};

function TrendCard({ t }: { t: TrendItem }) {
  const m = TIPO_META[t.tipo] ?? { label: t.tipo, icon: <Sparkles size={12} /> };
  return (
    <div className="card p-4">
      <div className="flex items-center gap-2">
        <span className="inline-flex items-center gap-1 rounded-full bg-brand-100 px-2 py-0.5 text-[10.5px] font-semibold text-brand-700">
          {m.icon}
          {m.label}
        </span>
        {t.finestra && <Badge tone="tan">{t.finestra}</Badge>}
        {t.dove && <span className="ml-auto text-[10.5px] text-ink-3">{t.dove}</span>}
      </div>
      <div className="mt-2 text-[13.5px] font-semibold leading-snug text-deep">{t.titolo}</div>
      {t.perche_rilevante && <div className="mt-1 text-[12px] leading-snug text-ink-2">{t.perche_rilevante}</div>}
      {t.idea_aggancio && (
        <div className="mt-2 border-t border-line pt-2 text-[11.5px] leading-snug text-ink-3">
          <span className="font-semibold text-brand-600">Aggancio:</span> {t.idea_aggancio}
        </div>
      )}
      {t.fonte && (
        <a href={t.fonte} target="_blank" rel="noreferrer" className="mt-2 inline-flex items-center gap-1 text-[11px] font-semibold text-brand-600 hover:text-brand-700">
          Fonte <ArrowRight size={11} />
        </a>
      )}
    </div>
  );
}

export default function TrendPage() {
  const { agents, trendScout: t, loading } = useData();
  const agent = agents.find((a) => a.slug === 'trend-scout');
  const trend = t?.trend ?? [];

  return (
    <div className="mx-auto max-w-[1120px]">
      <PageHeader
        title="Trend"
        subtitle="Il radar del giorno: audio, format e news da cavalcare, filtrati sui rimborsi voli e passati allo Stratega come munizioni per il piano."
        right={<LiveBadge />}
      />

      <div className="mb-6 card flex items-center gap-4 p-4">
        <span className="relative flex h-[54px] w-[54px] shrink-0 items-center justify-center rounded-2xl border border-line bg-white shadow-[var(--shadow-card)]">
          <Image src="/avatars/scout.png" alt="RIVO Trend-scout" width={38} height={38} />
        </span>
        <div className="min-w-0 flex-1">
          <Link href="/agenti/trend-scout" className="font-display text-[15px] font-bold text-deep hover:text-brand-700">
            RIVO - TREND-SCOUT
          </Link>
          <div className="mt-0.5 text-[11.5px] text-ink-3">
            {agent ? `Prossimo giro: ${nextRunLabel(agent.cron)} · ${agent.schedule_label}` : 'Ruolo pronto, sessione da attivare'}
          </div>
        </div>
        <Radio size={20} className="text-brand-600" />
      </div>

      <div className="mb-3 flex items-center gap-2">
        <Sparkles size={16} className="text-brand-600" />
        <h2 className="font-display text-[17px] font-bold tracking-tight text-deep">Trend del giorno</h2>
        {trend.length > 0 && <Badge tone="brand">{trend.length}</Badge>}
        {t?.data && <span className="ml-auto text-[11.5px] text-ink-3">{t.data}</span>}
      </div>

      {t?.nota && <div className="mb-3 text-[12.5px] text-ink-2">{t.nota}</div>}

      {loading ? (
        <div className="grid gap-3 md:grid-cols-2 lg:grid-cols-3">
          {Array.from({ length: 3 }).map((_, i) => <div key={i} className="skeleton h-[128px]" />)}
        </div>
      ) : trend.length === 0 ? (
        <EmptyState
          title="Radar ancora spento"
          note="Il Trend-scout gira ogni mattina prima dello Stratega: trova gli audio, i format e le notizie del momento da cavalcare. Compaiono qui e finiscono nel piano del giorno."
        />
      ) : (
        <div className="grid gap-3 md:grid-cols-2 lg:grid-cols-3">
          {trend.map((t, i) => <TrendCard key={i} t={t} />)}
        </div>
      )}
    </div>
  );
}
