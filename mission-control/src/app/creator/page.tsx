'use client';

import { useMemo, useState } from 'react';
import { motion } from 'framer-motion';
import {
  Columns3,
  Table2,
  LayoutGrid,
  Search,
  AtSign,
  Mail,
  Music2,
  Eye,
  EyeOff,
  Send,
} from 'lucide-react';
import { useData } from '@/lib/store';
import { PageHeader, Badge, EmptyState } from '@/components/ui';
import LiveBadge from '@/components/LiveBadge';
import { cn } from '@/lib/utils';
import type { Creator, CreatorStage } from '@/lib/types';

const STAGES: CreatorStage[] = ['Nuovo', 'Contattato', 'Risposto', 'Call fissata', 'Attivo'];

const STAGE_META: Record<CreatorStage, { dot: string; hint: string }> = {
  Nuovo: { dot: 'bg-tan', hint: 'Dallo Scout' },
  Contattato: { dot: 'bg-ink-3', hint: 'Primo messaggio inviato' },
  Risposto: { dot: 'bg-brand-400', hint: 'In trattativa' },
  'Call fissata': { dot: 'bg-ok', hint: 'In agenda' },
  Attivo: { dot: 'bg-deep', hint: 'Partner operativi' },
  Scartato: { dot: 'bg-err', hint: 'Chiusi' },
};

type View = 'kanban' | 'tabella' | 'card';

function CanaleIcon({ c }: { c: Creator }) {
  if (c.canale === 'Email') return <Mail size={12} className="text-ink-3" />;
  return <AtSign size={12} className="text-ink-3" />;
}

function CreatorCard({ c, compact = false }: { c: Creator; compact?: boolean }) {
  return (
    <div className="card card-hover p-3.5">
      <div className="flex items-start justify-between gap-2">
        <div className="min-w-0">
          <div className="flex items-center gap-1.5">
            <span className="truncate text-[13px] font-semibold text-deep">{c.name}</span>
            {c.priorita === 'Alta' && <span className="h-1.5 w-1.5 shrink-0 rounded-full bg-tan" title="Priorita alta" />}
          </div>
          {c.ig && <div className="truncate text-[11px] font-medium text-brand-600">@{c.ig}</div>}
        </div>
        <div className="flex shrink-0 items-center gap-1.5">
          {c.followers && <Badge tone="outline">{c.followers}</Badge>}
        </div>
      </div>
      {!compact && c.esito && (
        <p className="mt-2 line-clamp-2 text-[11.5px] leading-snug text-ink-3">{c.esito}</p>
      )}
      <div className="mt-2.5 flex items-center gap-2 border-t border-line pt-2 text-[10.5px] text-ink-3">
        <CanaleIcon c={c} />
        <span>{c.canale ?? (c.source === 'scout' ? 'Scout' : '')}</span>
        {c.tiktok && (
          <span className="inline-flex items-center gap-1">
            <Music2 size={11} /> TikTok
          </span>
        )}
        {c.fascia && <span className="ml-auto">{c.fascia}</span>}
      </div>
    </div>
  );
}

export default function CreatorPage() {
  const { creators, loading } = useData();
  const [view, setView] = useState<View>('kanban');
  const [q, setQ] = useState('');
  const [showScartati, setShowScartati] = useState(false);

  const filtered = useMemo(() => {
    const t = q.trim().toLowerCase();
    if (!t) return creators;
    return creators.filter(
      (c) =>
        c.name.toLowerCase().includes(t) ||
        c.ig?.toLowerCase().includes(t) ||
        c.email?.toLowerCase().includes(t),
    );
  }, [creators, q]);

  const byStage = (s: CreatorStage) => filtered.filter((c) => c.stage === s);
  const scartati = byStage('Scartato');

  const views: Array<{ id: View; icon: typeof Table2; label: string }> = [
    { id: 'kanban', icon: Columns3, label: 'Kanban' },
    { id: 'tabella', icon: Table2, label: 'Tabella' },
    { id: 'card', icon: LayoutGrid, label: 'Card' },
  ];

  return (
    <div className="mx-auto max-w-[1120px]">
      <PageHeader
        title="Creator"
        subtitle="Tutta la pipeline: dal lead dello Scout al partner attivo."
        right={<LiveBadge />}
      />

      {/* Toolbar */}
      <div className="mb-5 flex flex-wrap items-center gap-2.5">
        <div className="glass flex items-center gap-1 rounded-xl p-1">
          {views.map(({ id, icon: Icon, label }) => (
            <button
              key={id}
              onClick={() => setView(id)}
              className={cn(
                'inline-flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-[12px] font-semibold transition-all duration-150',
                view === id
                  ? 'bg-deep text-white shadow-[0_3px_10px_rgba(10,59,49,0.25)]'
                  : 'text-ink-2 hover:bg-white/80 hover:text-deep',
              )}
            >
              <Icon size={14} />
              {label}
            </button>
          ))}
        </div>

        <div className="relative min-w-[200px] flex-1 sm:max-w-[280px]">
          <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-ink-3" />
          <input
            value={q}
            onChange={(e) => setQ(e.target.value)}
            placeholder="Cerca nome, handle, email…"
            className="card w-full rounded-xl py-2 pl-9 pr-3 text-[12.5px] text-ink outline-none transition-shadow placeholder:text-ink-3 focus:border-brand-400 focus:shadow-[0_0_0_3px_rgba(46,167,141,0.15)]"
          />
        </div>

        <button
          onClick={() => setShowScartati((v) => !v)}
          className={cn(
            'inline-flex items-center gap-1.5 rounded-xl border px-3 py-2 text-[12px] font-semibold transition-colors',
            showScartati
              ? 'border-line-strong bg-white text-ink'
              : 'border-line bg-transparent text-ink-3 hover:bg-white',
          )}
        >
          {showScartati ? <Eye size={13} /> : <EyeOff size={13} />}
          Scartati ({scartati.length})
        </button>
      </div>

      {loading && (
        <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
          {Array.from({ length: 8 }).map((_, i) => (
            <div key={i} className="skeleton h-[120px]" />
          ))}
        </div>
      )}

      {/* KANBAN */}
      {!loading && view === 'kanban' && (
        <div className="-mx-1 overflow-x-auto px-1 pb-2">
          <div className="flex min-w-[900px] gap-3">
            {[...STAGES, ...(showScartati ? (['Scartato'] as CreatorStage[]) : [])].map((s, i) => {
              const items = byStage(s);
              return (
                <motion.div
                  key={s}
                  initial={{ opacity: 0, y: 12 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.35, delay: i * 0.05 }}
                  className="w-[228px] shrink-0"
                >
                  <div className="mb-2.5 flex items-center gap-2 px-1">
                    <span className={cn('h-2 w-2 rounded-full', STAGE_META[s].dot)} />
                    <span className="font-display text-[12.5px] font-bold text-deep">{s}</span>
                    <span className="rounded-full bg-subtle px-1.5 text-[10.5px] font-bold text-ink-3">
                      {items.length}
                    </span>
                    <span className="ml-auto text-[10px] text-ink-3">{STAGE_META[s].hint}</span>
                  </div>
                  <div className="space-y-2.5">
                    {items.map((c) => (
                      <CreatorCard key={c.id} c={c} />
                    ))}
                    {items.length === 0 && (
                      <div className="rounded-xl border border-dashed border-line px-3 py-6 text-center text-[11px] text-ink-3">
                        Vuoto
                      </div>
                    )}
                  </div>
                </motion.div>
              );
            })}
          </div>
        </div>
      )}

      {/* TABELLA */}
      {!loading && view === 'tabella' && (
        <div className="card overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full min-w-[760px] text-left text-[12.5px]">
              <thead>
                <tr className="border-b border-line bg-subtle/60 text-[10.5px] uppercase tracking-wider text-ink-3">
                  <th className="px-4 py-2.5 font-semibold">Creator</th>
                  <th className="px-4 py-2.5 font-semibold">Stato</th>
                  <th className="px-4 py-2.5 font-semibold">Canale</th>
                  <th className="px-4 py-2.5 font-semibold">Follower</th>
                  <th className="px-4 py-2.5 font-semibold">Fascia</th>
                  <th className="px-4 py-2.5 font-semibold">Ultimo esito</th>
                </tr>
              </thead>
              <tbody>
                {filtered
                  .filter((c) => showScartati || c.stage !== 'Scartato')
                  .map((c) => (
                    <tr key={c.id} className="border-b border-line/60 transition-colors last:border-0 hover:bg-brand-50/40">
                      <td className="px-4 py-2.5">
                        <div className="font-semibold text-deep">{c.name}</div>
                        {c.ig && <div className="text-[11px] text-brand-600">@{c.ig}</div>}
                      </td>
                      <td className="px-4 py-2.5">
                        <span className="inline-flex items-center gap-1.5">
                          <span className={cn('h-1.5 w-1.5 rounded-full', STAGE_META[c.stage].dot)} />
                          {c.stage}
                        </span>
                      </td>
                      <td className="px-4 py-2.5 text-ink-2">{c.canale ?? '—'}</td>
                      <td className="px-4 py-2.5 text-ink-2">{c.followers ?? '—'}</td>
                      <td className="px-4 py-2.5 text-ink-2">{c.fascia ?? '—'}</td>
                      <td className="max-w-[300px] px-4 py-2.5">
                        <span className="line-clamp-1 text-ink-3">{c.esito ?? '—'}</span>
                      </td>
                    </tr>
                  ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* CARD */}
      {!loading && view === 'card' && (
        <div className="grid grid-cols-2 gap-3 lg:grid-cols-3 xl:grid-cols-4">
          {filtered
            .filter((c) => showScartati || c.stage !== 'Scartato')
            .map((c) => (
              <div key={c.id}>
                <div className="mb-1.5 flex items-center gap-1.5 px-1">
                  <span className={cn('h-1.5 w-1.5 rounded-full', STAGE_META[c.stage].dot)} />
                  <span className="text-[10px] font-semibold uppercase tracking-wide text-ink-3">
                    {c.stage}
                  </span>
                </div>
                <CreatorCard c={c} />
              </div>
            ))}
        </div>
      )}

      {!loading && filtered.length === 0 && (
        <EmptyState title="Nessun creator trovato" note="Prova con un altro nome o svuota la ricerca." />
      )}

      {/* Nota Scout */}
      {!loading && (
        <div className="mt-6 flex items-center gap-2 text-[11px] text-ink-3">
          <Send size={12} />
          I lead in colonna «Nuovo» arrivano dallo Scout. Il primo contatto parte solo con il tuo OK.
        </div>
      )}
    </div>
  );
}
