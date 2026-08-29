'use client';

import Image from 'next/image';
import Link from 'next/link';
import {
  Brain,
  ArrowRight,
  TrendingUp,
  Users2,
  Eye,
  Heart,
  Sparkles,
  Scissors,
  Target,
  Clapperboard,
  LayoutList,
  UserCog,
  Clock,
  History,
} from 'lucide-react';
import { useData } from '@/lib/store';
import { PageHeader, EmptyState, Badge } from '@/components/ui';
import LiveBadge from '@/components/LiveBadge';
import { nextRunLabel } from '@/lib/utils';

const PILLARS = [
  { step: 'Legge i numeri', detail: 'Insight veri del profilo + cosa ha prodotto la squadra' },
  { step: 'Capisce cosa rende', detail: 'Formato e angolo che funzionano, su cosa raddoppiare' },
  { step: 'Detta la linea', detail: 'Angolo e priorita che Video e Caroselli eseguono ogni giorno' },
  { step: 'Propone e misura', detail: 'Cambi di profilo da approvare, crescita monitorata' },
];

function StatTile({
  label,
  value,
  hint,
  icon,
  accent = false,
}: {
  label: string;
  value: string;
  hint?: string;
  icon: React.ReactNode;
  accent?: boolean;
}) {
  return (
    <div
      className={`card relative overflow-hidden px-5 py-4 ${accent ? 'border-brand-200 bg-gradient-to-br from-white to-brand-50' : ''}`}
    >
      <div className="flex items-center justify-between">
        <span className="text-[11.5px] font-semibold uppercase tracking-[0.08em] text-ink-3">{label}</span>
        <span className="text-brand-600">{icon}</span>
      </div>
      <div className="mt-1.5 font-display text-[28px] font-bold leading-none tracking-tight text-deep">
        {value}
      </div>
      {hint && <div className="mt-1.5 text-[11.5px] text-ink-3">{hint}</div>}
    </div>
  );
}

const FMT_META: Record<string, { label: string; icon: React.ReactNode; cls: string }> = {
  video: { label: 'Video', icon: <Clapperboard size={12} />, cls: 'bg-[#efeafb] text-[#5b3fb0]' },
  carosello: { label: 'Carosello', icon: <LayoutList size={12} />, cls: 'bg-brand-100 text-brand-700' },
};

/* Riga compatta per un contenuto (video o carosello) nello storico o in coda di oggi. */
function ContentRow({
  formato,
  tema,
  href,
  when,
  right,
}: {
  formato: 'video' | 'carosello';
  tema?: string;
  href: string;
  when?: string;
  right?: React.ReactNode;
}) {
  const fmt = FMT_META[formato];
  return (
    <Link href={href} className="card card-hover flex items-center gap-3 p-3">
      <span className={`inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[10.5px] font-semibold ${fmt.cls}`}>
        {fmt.icon}
        {fmt.label}
      </span>
      <span className="min-w-0 flex-1 truncate text-[12.5px] font-semibold text-deep">
        {tema || 'Contenuto senza tema'}
      </span>
      {when && <span className="shrink-0 text-[10.5px] text-ink-3">{when}</span>}
      {right}
      <ArrowRight size={13} className="shrink-0 text-ink-3" />
    </Link>
  );
}

const dayLabel = (iso?: string | null) =>
  iso ? new Date(iso).toLocaleDateString('it-IT', { day: 'numeric', month: 'short' }) : '';

export default function StrategiaPage() {
  const { agents, strategaStato: s, videos, carousels, loading } = useData();
  const agent = agents.find((a) => a.slug === 'stratega');
  const proposte = s?.proposte_profilo ?? [];

  // Pezzi di oggi ancora da approvare (video in attesa dell'OK di pubblicazione o del piano, caroselli in attesa).
  const oggiVideo = videos.filter((v) => v.stato === 'in_attesa' || v.stato === 'piano_in_attesa');
  const oggiCaroselli = carousels.filter((c) => c.stato === 'in_attesa');
  const daApprovare = oggiVideo.length + oggiCaroselli.length;

  // Storico: tutto cio che e stato pubblicato, dal piu recente.
  const storicoVideo = videos
    .filter((v) => v.stato === 'pubblicato')
    .map((v) => ({ formato: 'video' as const, tema: v.tema, href: '/contenuti', when: v.published_at, key: v.key }));
  const storicoCaroselli = carousels
    .filter((c) => c.stato === 'pubblicato')
    .map((c) => ({ formato: 'carosello' as const, tema: c.tema, href: '/caroselli', when: c.published_at, key: c.key }));
  const storico = [...storicoVideo, ...storicoCaroselli].sort((a, b) =>
    (b.when ?? '') < (a.when ?? '') ? -1 : (b.when ?? '') > (a.when ?? '') ? 1 : 0,
  );

  const fmtNum = (v: string | number | undefined) => (v === undefined || v === null || v === '' ? 'da verificare' : String(v));

  return (
    <div className="mx-auto max-w-[1120px]">
      <PageHeader
        title="Strategia"
        subtitle="Il cervello della macchina contenuti: legge i numeri veri, decide cosa postare e comanda la squadra scrivendo il piano."
        right={<LiveBadge />}
      />

      {/* Stato agente + pilastri */}
      <div className="mb-6 grid gap-3.5 lg:grid-cols-[340px_1fr]">
        <div className="card flex items-center gap-4 p-4">
          <span className="relative flex h-[58px] w-[58px] shrink-0 items-center justify-center rounded-2xl border border-line bg-white shadow-[var(--shadow-card)]">
            <Image src="/avatars/stratega.png" alt="RIVO Stratega" width={42} height={42} />
          </span>
          <div className="min-w-0 flex-1">
            <Link href="/agenti/stratega" className="font-display text-[15px] font-bold text-deep hover:text-brand-700">
              RIVO - STRATEGA
            </Link>
            <div className="mt-0.5 text-[11.5px] text-ink-3">
              {agent ? `Prossimo giro: ${nextRunLabel(agent.cron)} · ${agent.schedule_label}` : 'In collegamento'}
            </div>
            <Link
              href="/agenti/stratega"
              className="mt-1 inline-flex items-center gap-1 text-[11.5px] font-semibold text-brand-600 hover:text-brand-700"
            >
              Scheda tecnica e storico giri
              <ArrowRight size={11} />
            </Link>
          </div>
        </div>

        <div className="card flex items-center p-4">
          <div className="grid w-full gap-3 sm:grid-cols-4">
            {PILLARS.map((f, i) => (
              <div key={f.step} className="relative">
                <div className="flex items-center gap-2">
                  <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-deep text-[10.5px] font-bold text-mint">
                    {i + 1}
                  </span>
                  <span className="text-[12.5px] font-semibold text-deep">{f.step}</span>
                </div>
                <p className="mt-1 pl-8 text-[10.5px] leading-snug text-ink-3 sm:pl-0 sm:pt-0.5">{f.detail}</p>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Cruscotto numeri veri */}
      <div className="mb-2 grid grid-cols-2 gap-3.5 lg:grid-cols-4">
        {loading ? (
          Array.from({ length: 4 }).map((_, i) => <div key={i} className="skeleton h-[104px]" />)
        ) : (
          <>
            <StatTile
              label="Follower"
              value={fmtNum(s?.follower)}
              hint={s?.follower_delta ? `${s.follower_delta} vs review scorsa` : 'crescita netta'}
              icon={<Users2 size={16} />}
              accent
            />
            <StatTile label="Reach 7 giorni" value={fmtNum(s?.reach_7g)} hint="persone diverse raggiunte" icon={<Eye size={16} />} />
            <StatTile label="Engagement" value={fmtNum(s?.eng_rate)} hint="salvataggi e condivisioni, non like" icon={<Heart size={16} />} />
            <StatTile label="Post migliore" value={s?.post_migliore ? '★' : 'da verificare'} hint={s?.post_migliore ?? 'il pezzo che ha reso di piu'} icon={<TrendingUp size={16} />} />
          </>
        )}
      </div>
      <div className="mb-6 px-1 text-[10.5px] text-ink-3">
        {s?.updated_at
          ? `Numeri veri dagli insight di Instagram, ultima review ${new Date(s.updated_at).toLocaleString('it-IT', { day: 'numeric', month: 'long', hour: '2-digit', minute: '2-digit' })}.`
          : 'In attesa del primo giro dello Stratega: qui compaiono i numeri veri del profilo, letti live.'}
      </div>

      {/* Cosa funziona / taglio / mosse */}
      {(s?.cosa_funziona?.length || s?.cosa_taglio?.length || s?.prossime_mosse?.length) ? (
        <div className="mb-6 grid gap-3.5 md:grid-cols-3">
          <div className="card p-4">
            <div className="flex items-center gap-2 text-[12.5px] font-bold text-deep">
              <Sparkles size={14} className="text-brand-600" /> Cosa funziona
            </div>
            <ul className="mt-2 space-y-1.5">
              {(s?.cosa_funziona ?? []).map((x, i) => (
                <li key={i} className="text-[12px] leading-snug text-ink-2">• {x}</li>
              ))}
              {!s?.cosa_funziona?.length && <li className="text-[11.5px] text-ink-3">da verificare</li>}
            </ul>
          </div>
          <div className="card p-4">
            <div className="flex items-center gap-2 text-[12.5px] font-bold text-deep">
              <Scissors size={14} className="text-tan-ink" /> Cosa taglio
            </div>
            <ul className="mt-2 space-y-1.5">
              {(s?.cosa_taglio ?? []).map((x, i) => (
                <li key={i} className="text-[12px] leading-snug text-ink-2">• {x}</li>
              ))}
              {!s?.cosa_taglio?.length && <li className="text-[11.5px] text-ink-3">niente da tagliare</li>}
            </ul>
          </div>
          <div className="card p-4">
            <div className="flex items-center gap-2 text-[12.5px] font-bold text-deep">
              <Target size={14} className="text-brand-600" /> Prossime mosse
            </div>
            <ul className="mt-2 space-y-1.5">
              {(s?.prossime_mosse ?? []).map((x, i) => (
                <li key={i} className="text-[12px] leading-snug text-ink-2">• {x}</li>
              ))}
              {!s?.prossime_mosse?.length && <li className="text-[11.5px] text-ink-3">da verificare</li>}
            </ul>
          </div>
        </div>
      ) : null}

      {/* Proposte di profilo in attesa OK */}
      {proposte.length > 0 && (
        <div className="mb-6">
          <div className="mb-3 flex items-center gap-2">
            <UserCog size={16} className="text-brand-600" />
            <h2 className="font-display text-[17px] font-bold tracking-tight text-deep">Proposte di profilo</h2>
            <Badge tone="tan">{proposte.length} aspettano il tuo OK</Badge>
          </div>
          <div className="grid gap-3 md:grid-cols-2">
            {proposte.map((p, i) => (
              <div key={i} className="card p-4">
                <div className="flex items-center gap-2">
                  <Badge tone="brand">{p.tipo}</Badge>
                  <Badge tone="outline">in attesa del PIN</Badge>
                </div>
                {p.proposta && <div className="mt-2 text-[13px] font-semibold leading-snug text-deep">{p.proposta}</div>}
                {p.attuale && <div className="mt-1 text-[11.5px] leading-snug text-ink-3">Ora: {p.attuale}</div>}
                {p.perche && <div className="mt-2 border-t border-line pt-2 text-[11.5px] leading-snug text-ink-2">{p.perche}</div>}
              </div>
            ))}
          </div>
          <p className="mt-2 px-1 text-[10.5px] text-ink-3">
            Lo Stratega non cambia mai il profilo da solo: prepara il testo pronto e aspetta il tuo OK.
          </p>
        </div>
      )}

      {/* Pezzi di oggi da approvare */}
      <div className="mb-3 flex items-center gap-2">
        <Clock size={16} className="text-brand-600" />
        <h2 className="font-display text-[17px] font-bold tracking-tight text-deep">Pezzi di oggi da approvare</h2>
        {daApprovare > 0 && <Badge tone="tan">{daApprovare} aspettano il tuo OK</Badge>}
      </div>

      {loading ? (
        <div className="grid gap-2.5 md:grid-cols-2">
          {Array.from({ length: 2 }).map((_, i) => (
            <div key={i} className="skeleton h-[52px]" />
          ))}
        </div>
      ) : daApprovare === 0 ? (
        <EmptyState
          title="Niente in coda adesso"
          note="Ogni mattina Video e Caroselli producono il pezzo del giorno seguendo la linea dello Stratega. Appena e pronto compare qui, e lo approvi col PIN prima che il Publisher lo pubblichi."
        />
      ) : (
        <div className="grid gap-2.5 md:grid-cols-2">
          {oggiVideo.map((v) => (
            <ContentRow
              key={v.key}
              formato="video"
              tema={v.tema}
              href="/contenuti"
              when={dayLabel(v.created_at)}
              right={
                <Badge tone="tan">{v.stato === 'piano_in_attesa' ? 'piano da approvare' : 'da approvare'}</Badge>
              }
            />
          ))}
          {oggiCaroselli.map((c) => (
            <ContentRow
              key={c.key}
              formato="carosello"
              tema={c.tema}
              href="/caroselli"
              when={dayLabel(c.created_at)}
              right={<Badge tone="tan">da approvare</Badge>}
            />
          ))}
        </div>
      )}

      {/* Storico contenuti pubblicati */}
      <div className="mb-3 mt-8 flex items-center gap-2">
        <History size={16} className="text-brand-600" />
        <h2 className="font-display text-[17px] font-bold tracking-tight text-deep">Storico contenuti pubblicati</h2>
        {storico.length > 0 && <span className="text-[11.5px] text-ink-3">{storico.length} pezzi online</span>}
      </div>

      {!loading && storico.length === 0 ? (
        <EmptyState
          title="Ancora nessun contenuto online"
          note="Qui si accumula tutto cio che e stato pubblicato: video e caroselli, dal piu recente. E la storia della macchina, il grafico che cresce giorno dopo giorno."
        />
      ) : (
        <div className="grid gap-2.5 md:grid-cols-2">
          {storico.map((item) => (
            <ContentRow
              key={item.key}
              formato={item.formato}
              tema={item.tema}
              href={item.href}
              when={dayLabel(item.when)}
              right={<Badge tone="brand">online</Badge>}
            />
          ))}
        </div>
      )}

      <div className="mt-8 flex items-start gap-2 text-[10.5px] leading-relaxed text-ink-3">
        <Brain size={13} className="mt-0.5 shrink-0 text-ink-3" />
        <span>
          Tutto qui e deciso dallo Stratega sui numeri veri del profilo. La linea che detta diventa gli ordini
          per Video e Caroselli. La pubblicazione e le risposte passano sempre dal tuo OK.
        </span>
      </div>
    </div>
  );
}
