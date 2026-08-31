'use client';

import { useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { Search, FileText, Wrench, Check, X } from 'lucide-react';
import { useData } from '@/lib/store';
import { PageHeader, EmptyState, Badge } from '@/components/ui';
import LiveBadge from '@/components/LiveBadge';
import { nextRunLabel } from '@/lib/utils';

function titoloArticolo(key: string, titolo?: string, markdown?: string): string {
  if (titolo) return titolo;
  const m = markdown?.match(/Meta title[^:]*:\s*(.+)/i);
  if (m) return m[1].trim();
  return key.replace('seo_articolo_', '').replace(/_/g, ' ');
}

const DIFF_TONE: Record<string, 'brand' | 'tan' | 'neutral'> = {
  bassa: 'brand',
  media: 'tan',
  alta: 'neutral',
};

export default function SeoPage() {
  const { agents, seoStato: s, seoArticoli, loading } = useData();
  const agent = agents.find((a) => a.slug === 'seo');
  const kws = s?.keyword_target ?? [];
  const articoli = seoArticoli ?? [];
  const migliorie = s?.migliorie_sito ?? [];
  const empty = !loading && kws.length === 0 && articoli.length === 0 && migliorie.length === 0;

  const [openKey, setOpenKey] = useState<string | null>(null);
  const [busy, setBusy] = useState<string | null>(null);
  const [msg, setMsg] = useState<string | null>(null);
  async function decide(key: string, action: 'approve' | 'reject') {
    const pin = typeof window !== 'undefined' ? localStorage.getItem('mc_pin') : null;
    if (!pin) {
      setMsg('Serve il PIN: approva un contenuto una volta per impostarlo.');
      return;
    }
    setBusy(key);
    setMsg(null);
    try {
      const res = await fetch('/api/decide', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ seo_key: key, action, pin }),
      });
      if (res.status === 401) setMsg('PIN errato.');
      else if (!res.ok) setMsg('Non ha funzionato, riprova.');
    } catch {
      setMsg('Errore di rete, riprova.');
    } finally {
      setBusy(null);
    }
  }

  return (
    <div className="mx-auto max-w-[1120px]">
      <PageHeader
        title="SEO"
        subtitle="Il traffico che compone nel tempo: keyword e articoli evergreen sui rimborsi voli, piu' le migliorie al sito. Tutto in bozza, pubblichi tu."
        right={<LiveBadge />}
      />

      <div className="mb-6 card flex items-center gap-4 p-4">
        <span className="relative flex h-[54px] w-[54px] shrink-0 items-center justify-center rounded-2xl border border-line bg-white shadow-[var(--shadow-card)]">
          <Image src="/avatars/stratega.png" alt="RIVO SEO" width={38} height={38} />
        </span>
        <div className="min-w-0 flex-1">
          <Link href="/agenti/seo" className="font-display text-[15px] font-bold text-deep hover:text-brand-700">
            RIVO - SEO
          </Link>
          <div className="mt-0.5 text-[11.5px] text-ink-3">
            {agent ? `Prossimo giro: ${nextRunLabel(agent.cron)} · ${agent.schedule_label}` : 'Ruolo pronto, sessione da attivare'}
          </div>
        </div>
        <Search size={20} className="text-brand-600" />
      </div>

      {s?.nota && <div className="mb-4 text-[12.5px] text-ink-2">{s.nota}</div>}

      {empty ? (
        <EmptyState
          title="Ancora nessun asset SEO"
          note="Il ruolo SEO fa keyword research, scrive articoli evergreen (bozze) e propone migliorie al sito. Il traffico da Google compone nel tempo: compaiono qui man mano."
        />
      ) : (
        <div className="grid gap-5 lg:grid-cols-[1.2fr_1fr]">
          <div>
            <div className="mb-3 flex items-center gap-2">
              <Search size={16} className="text-brand-600" />
              <h2 className="font-display text-[16px] font-bold text-deep">Keyword nel mirino</h2>
              {kws.length > 0 && <Badge tone="brand">{kws.length}</Badge>}
            </div>
            <div className="card divide-y divide-line">
              {kws.length === 0 && <div className="p-4 text-[12px] text-ink-3">Nessuna keyword ancora.</div>}
              {kws.map((k, i) => (
                <div key={i} className="flex items-center gap-3 p-3">
                  <div className="min-w-0 flex-1">
                    <div className="truncate text-[13px] font-semibold text-deep">{k.kw}</div>
                    {k.intento && <div className="truncate text-[11px] text-ink-3">{k.intento}</div>}
                  </div>
                  {k.difficolta && <Badge tone={DIFF_TONE[k.difficolta] ?? 'neutral'}>{k.difficolta}</Badge>}
                  {k.stato && <span className="text-[10.5px] font-semibold uppercase text-ink-3">{k.stato}</span>}
                </div>
              ))}
            </div>

            <div className="mt-5 mb-3 flex items-center gap-2">
              <FileText size={16} className="text-brand-600" />
              <h2 className="font-display text-[16px] font-bold text-deep">Articoli</h2>
              {articoli.length > 0 && <Badge tone="brand">{articoli.length}</Badge>}
            </div>
            {msg && <p className="mb-2 text-[11.5px] font-medium text-brand-700">{msg}</p>}
            <div className="grid gap-2.5">
              {articoli.length === 0 && <div className="card p-4 text-[12px] text-ink-3">Nessun articolo ancora.</div>}
              {articoli.map((a) => {
                const t = titoloArticolo(a.key, a.titolo, a.markdown);
                const tone = a.stato === 'approvato' ? 'brand' : a.stato === 'scartato' ? 'neutral' : 'tan';
                const open = openKey === a.key;
                return (
                  <div key={a.key} className="card p-3">
                    <div className="flex items-center gap-3">
                      <FileText size={15} className="shrink-0 text-ink-3" />
                      <button
                        onClick={() => setOpenKey(open ? null : a.key)}
                        className="min-w-0 flex-1 truncate text-left text-[12.5px] font-semibold text-deep hover:text-brand-700"
                      >
                        {t}
                      </button>
                      <Badge tone={tone}>{a.stato ?? 'bozza'}</Badge>
                    </div>
                    {open && (
                      <pre className="mt-2 max-h-[320px] overflow-auto whitespace-pre-wrap rounded-lg bg-subtle p-3 text-[11px] leading-snug text-ink-2">
                        {a.markdown || '(testo non disponibile)'}
                      </pre>
                    )}
                    {a.stato !== 'approvato' && a.stato !== 'scartato' && (
                      <div className="mt-2.5 flex items-center gap-2">
                        <button
                          onClick={() => decide(a.key, 'approve')}
                          disabled={busy === a.key}
                          className="inline-flex items-center gap-1.5 rounded-full bg-deep px-3 py-1.5 text-[11.5px] font-semibold text-mint transition hover:opacity-90 disabled:opacity-40"
                        >
                          <Check size={13} /> {busy === a.key ? '...' : 'Approva'}
                        </button>
                        <button
                          onClick={() => decide(a.key, 'reject')}
                          disabled={busy === a.key}
                          className="inline-flex items-center gap-1.5 rounded-full border border-line px-3 py-1.5 text-[11.5px] font-semibold text-ink-2 transition hover:bg-subtle disabled:opacity-40"
                        >
                          <X size={13} /> Scarta
                        </button>
                        <button
                          onClick={() => setOpenKey(open ? null : a.key)}
                          className="ml-auto text-[11.5px] font-semibold text-brand-600 hover:text-brand-700"
                        >
                          {open ? 'Chiudi' : 'Leggi'}
                        </button>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>

          <div>
            <div className="mb-3 flex items-center gap-2">
              <Wrench size={16} className="text-brand-600" />
              <h2 className="font-display text-[16px] font-bold text-deep">Migliorie al sito</h2>
              {migliorie.length > 0 && <Badge tone="tan">{migliorie.length}</Badge>}
            </div>
            <div className="grid gap-2.5">
              {migliorie.length === 0 && <div className="card p-4 text-[12px] text-ink-3">Nessuna miglioria proposta.</div>}
              {migliorie.map((m, i) => (
                <div key={i} className="card p-3">
                  <div className="flex items-start gap-2">
                    <span className="text-[13px] leading-snug text-deep">{m.cosa}</span>
                    {m.priorita && <Badge tone={m.priorita === 'alta' ? 'brand' : 'neutral'}>{m.priorita}</Badge>}
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
