'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import {
  Video,
  Presentation,
  FileDown,
  ExternalLink,
  MessageSquareWarning,
  ClipboardCheck,
  ChevronDown,
  Ear,
  Monitor,
  Handshake,
} from 'lucide-react';
import { useData } from '@/lib/store';
import { PageHeader, EmptyState, Badge } from '@/components/ui';
import LiveBadge from '@/components/LiveBadge';
import { cn } from '@/lib/utils';

/* Il framework ASK-SHOW-EARN, dai docs di progetto (docs/15). */

const BEATS = [
  {
    n: 1,
    title: 'Apertura e rapport',
    time: '2 min',
    text: 'Caldo e specifico: cita un loro post vero. Setta il frame del fit reciproco: prima ci si conosce, poi si parla di guadagni.',
  },
  {
    n: 2,
    title: 'Qualifica',
    time: '4-5 min',
    text: 'Qui ascolti piu che parlare. Piattaforme, views medie, chi e il pubblico. La domanda decisiva: il loro pubblico vola davvero? Voli EU corti, ritardi, cancellazioni.',
  },
  {
    n: 3,
    title: 'Frame dell\'offerta',
    time: '2 min',
    text: 'Non partire dai numeri. Prima la forma: performance vera, pagata ogni 15 giorni, zero fisso, zero obblighi, cresce con loro.',
  },
  {
    n: 4,
    title: 'Mostra la dashboard',
    time: '3 min',
    text: 'Il passo-prova: condividi lo schermo e fai il tour di 60 secondi. Vedere i guadagni in tempo reale abbatte la paura numero uno del performance.',
  },
  {
    n: 5,
    title: 'Obiezioni',
    time: '2-3 min',
    text: 'Le quattro classiche sono qui sotto, con la risposta pronta. Mai discutere: riconoscere e reframare.',
  },
  {
    n: 6,
    title: 'Chiusura a bassa frizione',
    time: '2 min',
    text: 'Non chiedere "ti va di entrare?". Fai il setup dal vivo: account creato in call, link in mano oggi, check-in leggero al giorno 14.',
  },
];

const SLIDES = [
  { n: 1, title: 'Cover', note: 'Apri con la cover mentre vi salutate. Niente fretta: grazie del tempo, ti spiego come funziona la call.' },
  { n: 2, title: 'Come funziona questa call', note: 'Quindici minuti in quattro passi, nessuna pressione: se non fa per loro, lo dicono e siete a posto.' },
  { n: 3, title: 'Parlami di te', note: 'LA parte piu importante: metti giu il deck e fai domande vere. Views medie, pubblico, e il qualifier decisivo: il pubblico vola? Poi rispecchia coi loro numeri.' },
  { n: 4, title: 'Cos\'e Rivolio', note: 'Rimborsi voli fino a 600€, norma europea. Facciamo tutto noi, il cliente tiene il 100% e paga solo una piccola fee fissa. Non siamo recupero crediti.' },
  { n: 5, title: 'Il problema', note: 'Quasi nessuno reclama: moduli, tempo, burocrazia. Non stai vendendo niente al pubblico: gli dici come riprendersi soldi gia loro.' },
  { n: 6, title: 'Perche proprio tu', note: 'Il loro pubblico vola davvero: non e una marchetta a caso, e utile per chi li segue. Piace anche al pubblico, non solo al creator.' },
  { n: 7, title: 'Il pacchetto', note: 'Prima la forma, poi i numeri: account gratis con pratiche illimitate, codice sconto 10%, link tracciato, 40% a pratica, bonus a traguardi, bonifico ogni 15 giorni.' },
  { n: 8, title: 'Come guadagni', note: 'Il punto che confonde di piu: si guadagna sulle pratiche andate a buon fine, non a video e non a fisso. Il link lavora ogni volta che qualcuno lo usa.' },
  { n: 9, title: 'Un esempio di mese', note: 'Esempio per dare la scala, non una promessa: circa 296€ (115+61+50+70). Dillo chiaro: dipende dal volume, nessun tetto sopra.' },
  { n: 10, title: 'La dashboard', note: 'ESCI dal deck e condividi la dashboard vera. Tour di 60 secondi: guadagni in tempo reale, ogni pratica legata al link, niente da rincorrere.' },
  { n: 11, title: 'La tua liberta', note: 'Nessun obbligo: formato, tempi e frequenza li scelgono loro. Unica regola il #adv, per correttezza.' },
  { n: 12, title: 'Come si parte', note: 'Setup dal vivo: account attivato in call, link e codice in mano subito, si usa quando e in linea coi contenuti.' },
  { n: 13, title: 'Chiusura', note: 'Rischio zero: guadagnano solo quando il pubblico recupera i rimborsi. "Te lo attivo?" e poi silenzio: lascia rispondere.' },
];

const OBIEZIONI = [
  {
    q: '"Voglio un fisso"',
    sotto: 'Paura dell\'imprevedibilita, la numero uno sul performance',
    a: 'Un fisso paga una volta e mette un tetto. Qui non c\'e soffitto: un contenuto che funziona rende piu di qualsiasi fisso, si vede maturare in diretta e il bonifico arriva ogni 15 giorni. Poi dritto alla dashboard.',
  },
  {
    q: '"Ma converte?"',
    sotto: 'Paura di lavorare per zero',
    a: 'Due leve: i conti fatti coi loro numeri, per 100 visualizzazioni a un tasso realistico. E la rilevanza: quasi tutti quelli che volano in EU hanno subito un ritardo e non hanno mai chiesto niente. Non e vendere, sono soldi che gli spettano.',
  },
  {
    q: '"Ho gia un competitor"',
    sotto: 'Tema esclusivita, ed e la prova che la categoria funziona',
    a: 'Nessun problema: qui niente e esclusivo ed e una categoria diversa dai soliti link. E reddito in piu, non uno scambio.',
  },
  {
    q: '"Quanto lavoro devo fare?"',
    sotto: 'Paura dell\'obbligo e del calendario imposto',
    a: 'Zero obblighi: nessuna quota, nessuna scadenza, nessuna approvazione dei contenuti. Pubblicano come e quando viene naturale, il link lavora quando viene usato.',
  },
];

const CHECKLIST_PRE = [
  'Profilo e ultimi 2 post guardati: un aggancio vero pronto',
  'Dashboard aperta in una scheda, pronta da condividere',
  'Deck aperto sulla cover',
  'Slot confermato con Valerio (Lun-Ven 8-19)',
];

const CHECKLIST_POST = [
  'Esito segnato subito in CRM (Airtable + Mission Control)',
  'Se ha accettato: account attivato in call, link consegnato',
  'Check-in leggero fissato al giorno 14',
  'Note e obiezioni nuove aggiunte al framework',
];

export default function CallPage() {
  const { creators, loading } = useData();
  const [openSlide, setOpenSlide] = useState<number | null>(3);
  const callFissate = creators.filter((c) => c.source === 'crm' && c.stage === 'Call fissata');

  return (
    <div className="mx-auto max-w-[1060px]">
      <PageHeader
        title="Call e chiusura"
        subtitle="Tutto il materiale per portare un creator dal si alla partenza: agenda, deck, script e risposte."
        right={<LiveBadge />}
      />

      {/* Agenda + deck */}
      <div className="mb-7 grid gap-3.5 lg:grid-cols-[1fr_380px]">
        <div className="card p-5">
          <div className="mb-3 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Video size={16} className="text-brand-600" />
              <h2 className="font-display text-[15px] font-bold tracking-tight text-deep">
                Call in agenda
              </h2>
            </div>
            <Badge tone="outline">Slot: Lun-Ven, 8:00-19:00</Badge>
          </div>
          {loading ? (
            <div className="skeleton h-[120px]" />
          ) : callFissate.length === 0 ? (
            <EmptyState
              title="Nessuna call fissata al momento"
              note="Appena una call viene fissata, compare qui con creator e contesto."
            />
          ) : (
            <div className="space-y-2.5">
              {callFissate.map((c) => (
                <div key={c.id} className="flex items-start gap-3 rounded-xl border border-line bg-white px-4 py-3">
                  <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-deep text-mint">
                    <Video size={15} />
                  </span>
                  <div className="min-w-0 flex-1">
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="text-[13.5px] font-semibold text-deep">{c.name}</span>
                      {c.ig && (
                        <a
                          href={`https://instagram.com/${c.ig}`}
                          target="_blank"
                          rel="noreferrer"
                          className="text-[11.5px] font-semibold text-brand-600 hover:underline"
                        >
                          @{c.ig}
                        </a>
                      )}
                      {c.followers && <Badge tone="neutral">{c.followers}</Badge>}
                    </div>
                    {c.esito && <p className="mt-0.5 text-[11.5px] leading-snug text-ink-3">{c.esito}</p>}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Deck */}
        <div className="card flex flex-col p-5">
          <div className="flex items-center gap-2">
            <Presentation size={16} className="text-brand-600" />
            <h2 className="font-display text-[15px] font-bold tracking-tight text-deep">
              Il deck partner (v4)
            </h2>
          </div>
          <p className="mt-1.5 text-[12px] leading-relaxed text-ink-2">
            13 slide: chi siamo, il pacchetto, l&apos;esempio di mese e la partenza. Il deck e la
            rotaia, non il copione: su ogni slide poche frasi tue, alla slide 10 esci e mostri la
            dashboard vera.
          </p>
          <div className="mt-auto space-y-2 pt-4">
            <a
              href="/deck/presentazione-partner-rivolio.html"
              target="_blank"
              rel="noreferrer"
              className="flex items-center justify-center gap-2 rounded-xl bg-deep px-4 py-2.5 text-[13px] font-semibold text-white shadow-[0_4px_14px_rgba(10,59,49,0.3)] transition-transform hover:scale-[1.01]"
            >
              <ExternalLink size={14} />
              Apri il deck per la call
            </a>
            <a
              href="/deck/presentazione-partner-rivolio.pdf"
              download
              className="flex items-center justify-center gap-2 rounded-xl border border-line bg-white px-4 py-2.5 text-[13px] font-semibold text-ink-2 transition-colors hover:border-line-strong hover:text-deep"
            >
              <FileDown size={14} />
              Scarica il PDF
            </a>
          </div>
        </div>
      </div>

      {/* Framework 6 beat */}
      <div className="mb-3 flex items-center justify-between">
        <h2 className="font-display text-[17px] font-bold tracking-tight text-deep">
          La call in 6 passi
        </h2>
        <span className="text-[11.5px] text-ink-3">ASK-SHOW-EARN · 15-20 minuti totali</span>
      </div>
      <div className="mb-7 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
        {BEATS.map((b, i) => (
          <motion.div
            key={b.n}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3, delay: i * 0.05 }}
            className="card card-hover p-4"
          >
            <div className="flex items-center justify-between">
              <span className="flex h-7 w-7 items-center justify-center rounded-full bg-deep text-[12px] font-bold text-mint">
                {b.n}
              </span>
              <Badge tone="brand">{b.time}</Badge>
            </div>
            <div className="mt-2.5 text-[13.5px] font-semibold text-deep">{b.title}</div>
            <p className="mt-1 text-[12px] leading-snug text-ink-2">{b.text}</p>
          </motion.div>
        ))}
      </div>

      {/* Principi guida */}
      <div className="mb-7 grid gap-3 md:grid-cols-3">
        <div className="card flex items-start gap-3 p-4">
          <Ear size={16} className="mt-0.5 shrink-0 text-brand-600" />
          <div>
            <div className="text-[12.5px] font-semibold text-deep">Prima qualifichi, poi presenti</div>
            <p className="mt-0.5 text-[11.5px] leading-snug text-ink-3">
              Nella prima parte ascolti piu che parlare. L&apos;offerta si cuce sui loro numeri.
            </p>
          </div>
        </div>
        <div className="card flex items-start gap-3 p-4">
          <Monitor size={16} className="mt-0.5 shrink-0 text-brand-600" />
          <div>
            <div className="text-[12.5px] font-semibold text-deep">La dashboard e l&apos;arma vera</div>
            <p className="mt-0.5 text-[11.5px] leading-snug text-ink-3">
              Il deck prepara il terreno, la prova dal vivo abbatte la paura del performance.
            </p>
          </div>
        </div>
        <div className="card flex items-start gap-3 p-4">
          <Handshake size={16} className="mt-0.5 shrink-0 text-brand-600" />
          <div>
            <div className="text-[12.5px] font-semibold text-deep">Setup dal vivo, zero frizione</div>
            <p className="mt-0.5 text-[11.5px] leading-snug text-ink-3">
              Account e link creati in call: nessun passo tra il si e l&apos;operativo.
            </p>
          </div>
        </div>
      </div>

      {/* Note slide per slide */}
      <div className="mb-3">
        <h2 className="font-display text-[17px] font-bold tracking-tight text-deep">
          Lo script, slide per slide
        </h2>
        <p className="mt-0.5 text-[12px] text-ink-3">
          Una traccia, non un copione da leggere: falle tue, con le tue parole.
        </p>
      </div>
      <div className="card mb-7 divide-y divide-line overflow-hidden">
        {SLIDES.map((s) => {
          const open = openSlide === s.n;
          return (
            <div key={s.n}>
              <button
                onClick={() => setOpenSlide(open ? null : s.n)}
                className={cn(
                  'flex w-full items-center gap-3 px-5 py-3 text-left transition-colors',
                  open ? 'bg-brand-50/60' : 'hover:bg-subtle',
                )}
              >
                <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-lg bg-subtle text-[10.5px] font-bold text-ink-2">
                  {s.n}
                </span>
                <span className="flex-1 text-[13px] font-semibold text-deep">{s.title}</span>
                {(s.n === 3 || s.n === 10) && <Badge tone="tan">passo chiave</Badge>}
                <ChevronDown
                  size={14}
                  className={cn('shrink-0 text-ink-3 transition-transform', open && 'rotate-180')}
                />
              </button>
              {open && (
                <div className="px-5 pb-3.5 pl-14 text-[12.5px] leading-relaxed text-ink-2">
                  {s.note}
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Obiezioni */}
      <div className="mb-3 flex items-center gap-2">
        <MessageSquareWarning size={16} className="text-brand-600" />
        <h2 className="font-display text-[17px] font-bold tracking-tight text-deep">
          Obiezioni e risposte pronte
        </h2>
      </div>
      <div className="mb-7 grid gap-3 md:grid-cols-2">
        {OBIEZIONI.map((o) => (
          <div key={o.q} className="card p-4">
            <div className="text-[13.5px] font-bold text-deep">{o.q}</div>
            <div className="mt-0.5 text-[11px] font-semibold uppercase tracking-wide text-tan-ink">
              {o.sotto}
            </div>
            <p className="mt-2 text-[12.5px] leading-relaxed text-ink-2">{o.a}</p>
          </div>
        ))}
      </div>

      {/* Checklist */}
      <div className="mb-3 flex items-center gap-2">
        <ClipboardCheck size={16} className="text-brand-600" />
        <h2 className="font-display text-[17px] font-bold tracking-tight text-deep">Checklist</h2>
      </div>
      <div className="mb-10 grid gap-3 md:grid-cols-2">
        <div className="card p-4">
          <div className="mb-2 text-[11px] font-semibold uppercase tracking-wide text-ink-3">
            Prima della call
          </div>
          <ul className="space-y-1.5">
            {CHECKLIST_PRE.map((c) => (
              <li key={c} className="flex items-start gap-2 text-[12.5px] leading-snug text-ink-2">
                <span className="mt-[7px] h-1 w-1 shrink-0 rounded-full bg-brand-400" />
                {c}
              </li>
            ))}
          </ul>
        </div>
        <div className="card p-4">
          <div className="mb-2 text-[11px] font-semibold uppercase tracking-wide text-ink-3">
            Dopo la call
          </div>
          <ul className="space-y-1.5">
            {CHECKLIST_POST.map((c) => (
              <li key={c} className="flex items-start gap-2 text-[12.5px] leading-snug text-ink-2">
                <span className="mt-[7px] h-1 w-1 shrink-0 rounded-full bg-brand-400" />
                {c}
              </li>
            ))}
          </ul>
        </div>
      </div>
    </div>
  );
}
