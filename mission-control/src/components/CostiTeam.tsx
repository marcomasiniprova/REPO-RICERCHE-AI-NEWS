'use client';

import { useMemo } from 'react';
import { motion } from 'framer-motion';
import { Wallet, Sparkles, TrendingUp, CircleHelp } from 'lucide-react';
import { useData } from '@/lib/store';
import { calcolaCostiTeam, eur } from '@/lib/costs';

/**
 * "Quanto costa il team": la vista costi in home.
 * Crediti Kie = dato VERO (li scrivono Video/Caroselli). Euro Kie = stima finche'
 * Valerio non conferma il tasso. Le voci non note restano "da verificare", mai cifre finte.
 */
export default function CostiTeam() {
  const { videos, carousels, loading } = useData();
  const c = useMemo(() => calcolaCostiTeam(videos, carousels), [videos, carousels]);

  if (loading) return <div className="skeleton mb-8 h-[220px]" />;

  return (
    <motion.section
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
      className="mb-8"
    >
      <div className="mb-3 flex items-center justify-between">
        <h2 className="font-display text-[17px] font-bold tracking-tight text-deep">Quanto costa il team</h2>
        <span className="text-[11.5px] text-ink-3">Uso di {c.meseLabel}</span>
      </div>

      <div className="card overflow-hidden p-0">
        {/* Totale stimato + uso Kie del mese */}
        <div className="grid gap-px bg-line sm:grid-cols-3">
          <div className="bg-gradient-to-br from-white to-brand-50 px-5 py-4">
            <div className="flex items-center gap-1.5 text-[11px] font-semibold uppercase tracking-[0.08em] text-ink-3">
              <Wallet size={13} /> Stima al mese
            </div>
            <div className="mt-1.5 font-display text-[30px] font-bold leading-none tracking-tight text-deep">
              {eur(c.totaleStimatoMensile)}
            </div>
            <div className="mt-1.5 text-[11px] text-ink-3">
              Fissi certi + consumo Kie del mese. Le voci &quot;da verificare&quot; non sono incluse.
            </div>
          </div>
          <div className="bg-white px-5 py-4">
            <div className="flex items-center gap-1.5 text-[11px] font-semibold uppercase tracking-[0.08em] text-ink-3">
              <Sparkles size={13} /> Crediti Kie usati
            </div>
            <div className="mt-1.5 font-display text-[30px] font-bold leading-none tracking-tight text-deep">
              {c.kieCreditiMese}
            </div>
            <div className="mt-1.5 text-[11px] text-ink-3">
              {c.kiePezziMese} pezzi generati questo mese · {c.kieCreditiTotali} crediti da sempre
            </div>
          </div>
          <div className="bg-white px-5 py-4">
            <div className="flex items-center gap-1.5 text-[11px] font-semibold uppercase tracking-[0.08em] text-ink-3">
              <TrendingUp size={13} /> Kie in euro (stima)
            </div>
            <div className="mt-1.5 font-display text-[30px] font-bold leading-none tracking-tight text-deep">
              {eur(c.kieEuroMese)}
            </div>
            <div className="mt-1.5 text-[11px] text-ink-3">
              A {eur(c.euroPerCredito)}/credito{c.tassoKieConfermato ? '' : ' (da confermare con te)'}
            </div>
          </div>
        </div>

        {/* Voci fisse dettaglio */}
        <div className="border-t border-line px-5 py-4">
          <div className="mb-2.5 text-[11px] font-semibold uppercase tracking-[0.08em] text-ink-3">
            Costi fissi mensili
          </div>
          <div className="grid gap-2 sm:grid-cols-2">
            {c.vociFisse.map((v) => (
              <div key={v.nome} className="flex items-center justify-between gap-3 rounded-xl bg-subtle px-3 py-2">
                <div className="min-w-0">
                  <div className="truncate text-[12.5px] font-semibold text-deep">{v.nome}</div>
                  <div className="truncate text-[10.5px] text-ink-3">{v.nota}</div>
                </div>
                <div className="shrink-0 text-right">
                  {v.euro === null ? (
                    <span className="inline-flex items-center gap-1 rounded-full bg-tan px-2 py-0.5 text-[10.5px] font-semibold text-tan-ink">
                      <CircleHelp size={11} /> da verificare
                    </span>
                  ) : (
                    <span className="font-display text-[15px] font-bold text-deep">
                      {v.euro === 0 ? 'gratis' : `${eur(v.euro)}/mese`}
                    </span>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Onesta + ROI */}
        <div className="border-t border-line bg-subtle/60 px-5 py-3 text-[11px] leading-snug text-ink-3">
          <span className="font-semibold text-ink-2">Onesto:</span> i crediti Kie sono il dato vero (li scrivono
          Video e Caroselli a ogni generazione). L&apos;euro Kie e il ritorno sull&apos;investimento (pratiche
          avviate, ricavi) restano da calibrare: appena mi dai il costo reale di una ricarica Kie e i primi numeri
          di vendite, questa vista diventa precisa al centesimo.
        </div>
      </div>
    </motion.section>
  );
}
