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

interface Slide {
  n: number;
  title: string;
  tempo: string;
  fai: string;
  dici: string[];
}

const SLIDES: Slide[] = [
  {
    n: 1,
    title: 'Cover',
    tempo: '30 sec',
    fai: 'Apri con la cover mentre vi salutate. Sorridi, niente fretta: i primi 30 secondi decidono il clima di tutta la call.',
    dici: [
      'Che piacere, finalmente! Grazie davvero che ti sei presa questo quarto d\'ora.',
      'Ti dico subito come la vedo io: prima mi racconti due cose di te e di chi ti segue, poi ti faccio vedere Rivolio e come funziona la parte guadagni.',
      'E se sentiamo che ci incastriamo, ti attivo tutto oggi stesso, ci vogliono cinque minuti. Ci sta?',
    ],
  },
  {
    n: 2,
    title: 'Come funziona questa call',
    tempo: '30 sec',
    fai: 'Mostra i quattro passaggi. Serve a togliere pressione: nessuno deve comprare niente, vi state conoscendo.',
    dici: [
      'Sono quindici minuti in quattro passi: ti conosco, ti spiego Rivolio, ti mostro come si guadagna, e se torna a entrambi partiamo.',
      'Nessun impegno eh: se a un certo punto senti che non fa per te, me lo dici e siamo a posto, ci facciamo comunque una bella chiacchierata.',
    ],
  },
  {
    n: 3,
    title: 'Parlami di te',
    tempo: '4-5 min',
    fai: 'LA parte piu importante della call: metti giu il deck, fai domande vere e prendi appunti. Qui ascolti, non vendi. Le risposte che raccogli sono i mattoni con cui costruisci tutto il resto.',
    dici: [
      'Raccontami un attimo il tuo pubblico: chi sono, dove sei piu forte, Instagram o TikTok?',
      'A livello di numeri, un reel o una storia tua quante persone raggiunge di solito? (le views contano piu dei follower)',
      'E la tua gente vola? Cioe voli in Europa, low cost, ritardi, cancellazioni: e roba che gli capita davvero? (il qualifier decisivo)',
      'Hai gia fatto collaborazioni o affiliazioni? Com\'e andata, cosa ti e piaciuto e cosa no? (qualsiasi cosa risponda qui e la tua leva dopo)',
      'Poi rispecchia coi LORO numeri: "Quindi il tuo pubblico prende un paio di voli corti l\'anno. Sono esattamente quelli che restano fregati da un ritardo e non chiedono mai quello che gli spetta."',
    ],
  },
  {
    n: 4,
    title: 'Cos\'e Rivolio',
    tempo: '2 min',
    fai: 'Passa alla proposta solo DOPO aver capito chi hai davanti. Tono semplice, zero tecnicismi.',
    dici: [
      'Rivolio recupera i rimborsi dei voli andati storti: ritardi e cancellazioni, fino a 600 euro a passeggero. E\' una norma europea, la EU261.',
      'La cosa importante: facciamo tutto noi, il passeggero non muove un dito.',
      'E la differenza vera dagli altri: il passeggero si tiene il CENTO per cento del rimborso. Paga solo una piccola fee fissa. Non siamo una societa di recupero crediti che si trattiene un terzo.',
    ],
  },
  {
    n: 5,
    title: 'Il problema',
    tempo: '1 min',
    fai: 'Usa la foto del tabellone per far sentire il punto. Qui pianti il seme che rende facile tutto il resto.',
    dici: [
      'Il problema e\' che quasi nessuno reclama: moduli, tempo, burocrazia. La gente lascia perdere e i soldi restano alle compagnie.',
      'Quindi guarda che qui non stai vendendo niente al tuo pubblico: gli stai dicendo come riprendersi soldi che sono GIA\' loro.',
      'E\' il tipo di contenuto che ti fa fare la figura di chi da\' una dritta vera, non di chi piazza una marchetta.',
    ],
  },
  {
    n: 6,
    title: 'Perche proprio tu',
    tempo: '1 min',
    fai: 'Riprendi ESATTAMENTE le parole che ha usato lei nella qualifica: pubblico, mete, tipo di voli. Personalizzato batte perfetto.',
    dici: [
      'E il punto e\' che il tuo pubblico vola davvero: me lo hai appena detto tu.',
      'Per questo con te ha senso: chi ti segue prende quei voli li\', e prima o poi un ritardo grosso gli capita.',
      'Di solito questa cosa piace anche al pubblico, non solo al creator: e\' un\'informazione utile, la condividono pure.',
    ],
  },
  {
    n: 7,
    title: 'Il pacchetto',
    tempo: '2 min',
    fai: 'Qui mostri cosa riceve. Non buttare i numeri di corsa: prima la forma, poi i pezzi uno a uno, con calma.',
    dici: [
      'Ora la parte tua. E\' una collaborazione a performance vera, generosa, che cresce con te. Ti do cinque cose.',
      'Un account Rivolio gratis con pratiche illimitate, un codice sconto del 10 per cento da regalare ai tuoi, un link personale tracciato.',
      'Il 40 per cento su ogni pratica che parte da te, piu bonus a traguardi che si aggiungono man mano.',
      'E ti pago ogni 15 giorni con bonifico. Zero fisso, zero anticipi, zero obblighi.',
    ],
  },
  {
    n: 8,
    title: 'Come guadagni',
    tempo: '1-2 min',
    fai: 'Chiarisci il punto che confonde di piu: si guadagna sulle PRATICHE andate a buon fine, non a video e non a fisso.',
    dici: [
      'In pratica funziona cosi: pubblichi col tuo link quando vuoi, i tuoi aprono la pratica per il loro rimborso.',
      'Tu prendi il 40 per cento su ogni pratica andata a buon fine, e ti arriva col bonifico ogni 15 giorni.',
      'Non ti pago a video e non c\'e\' un fisso: il link lavora ogni volta che qualcuno lo usa, anche su un contenuto vecchio di un mese.',
    ],
  },
  {
    n: 9,
    title: 'Un esempio di mese',
    tempo: '1-2 min',
    fai: 'E\' un esempio per dare la scala, NON una promessa: dillo chiaro, la trasparenza qui vale piu di tutto. I numeri quadrano: 115+61+50+70 = 296.',
    dici: [
      'Ti faccio un esempio concreto di un mese, cosi hai un\'idea della scala.',
      'Diciamo 10 pratiche famiglia, 10 singole e un centinaio di check portati: sono circa 296 euro tra percentuali e bonus.',
      'Ma e\' un esempio, non un fisso: dipende dal volume che porti. La cosa importante e\' che sopra non c\'e\' un tetto.',
    ],
  },
  {
    n: 10,
    title: 'La dashboard',
    tempo: '3 min',
    fai: 'IL passo-prova: esci dal deck e condividi la dashboard vera. Tour di 60 secondi. E\' l\'arma piu forte che hai: abbatte la paura numero uno del performance, l\'imprevedibilita.',
    dici: [
      'E questa e\' la parte che secondo me ti piacera\' piu di tutte: questa e\' la TUA dashboard.',
      'Ogni pratica e\' legata al tuo link. Entri quando vuoi e vedi in tempo reale quanto stai maturando.',
      'Niente da rincorrermi, niente da chiedermi: quello che vedi qui e\' quello che ti arriva col bonifico.',
      'Massima trasparenza: preferisco che tu controlli i numeri piuttosto che credermi sulla parola.',
    ],
  },
  {
    n: 11,
    title: 'La tua liberta',
    tempo: '1 min',
    fai: 'Il tuo differenziatore vero rispetto alle collaborazioni classiche. Rallenta e falla pesare.',
    dici: [
      'E soprattutto: nessun obbligo. Nessuna quota di post, nessuna scadenza, nessuna approvazione dei contenuti.',
      'Story, reel o link in bio: il formato lo scegli tu, pubblichi come e quando ti viene naturale.',
      'L\'unica regola e\' mettere il tag adv, per correttezza verso chi ti segue.',
    ],
  },
  {
    n: 12,
    title: 'Come si parte',
    tempo: '1 min',
    fai: 'Chiusura a bassa frizione: il setup lo fai TU dal vivo, in call. Togli ogni passo tra il si e l\'operativo.',
    dici: [
      'Se ci incastriamo facciamo la cosa piu semplice: ti creo l\'account ADESSO mentre siamo in call, cosi non compili niente tu.',
      'Link e codice ce li hai tra cinque minuti, e li usi quando e\' in linea coi tuoi contenuti.',
      'Il primo bonifico e\' a 15 giorni, e tra due settimane ci risentiamo dieci minuti per guardare i numeri veri insieme.',
    ],
  },
  {
    n: 13,
    title: 'Chiusura',
    tempo: '30 sec',
    fai: 'La domanda finale e poi SILENZIO: lascia rispondere. Chi parla per primo dopo la domanda di chiusura, di solito concede.',
    dici: [
      'Il bello e\' che per te e\' a rischio zero: guadagni quando il tuo pubblico recupera i suoi rimborsi.',
      'Se ti va, il link ce l\'hai oggi. Te lo attivo?',
      '(E se dice si: fai il setup subito, in call. Il prossimo aggancio e\' il check-in leggero al giorno 14.)',
    ],
  },
];

/* Struttura di ogni risposta: riconosci, ribalta con un fatto concreto,
   chiudi con una domanda che riprende il controllo. Mai discutere. */
const OBIEZIONI = [
  {
    q: '"Voglio un fisso"',
    sotto: 'Paura dell\'imprevedibilita, la numero uno sul performance',
    a: 'Ti capisco, il fisso sembra sicurezza. Ma guardalo al contrario: un fisso ti paga una volta e ti mette un tetto, e ti conviene solo se il contenuto va MALE. Se va bene, quel tetto lo stai pagando tu. Qui un reel che funziona continua a generarti pratiche per settimane, lo vedi maturare in diretta sulla dashboard e ogni 15 giorni arriva il bonifico. Dimmi una cosa: l\'ultima collaborazione a fisso, quanto ti ha reso in tutto? Una cifra, una volta sola, giusto?',
    insiste: 'Facciamo un patto: partiamo a performance col primo bonus a traguardo messo vicino apposta, cosi lo tocchi nelle prime settimane. Se dopo un mese i numeri non ti danno ragione, ne riparliamo coi dati davanti. Sui numeri veri non si litiga mai.',
  },
  {
    q: '"Ma converte?"',
    sotto: 'Paura di lavorare per zero',
    a: 'Domanda giusta, e la risposta ce l\'hai gia in casa: pensa a quante persone del tuo pubblico hanno avuto un volo in ritardo nell\'ultimo anno e non hanno chiesto UN euro. Quasi tutte. Tu non devi convincere nessuno a comprare qualcosa: gli indichi soldi LORO che stanno lasciando alle compagnie, fino a 600 euro a passeggero, e con noi il rimborso resta tutto a loro. E\' il contenuto piu facile da far convertire che esista. Vuoi che facciamo i conti adesso sui TUOI numeri, con le tue views medie?',
    insiste: 'Non ti chiedo di credermi, ti chiedo di provarlo: zero costi, zero obblighi. Un contenuto quando ti viene naturale, e tra due settimane guardiamo la dashboard insieme. Se non converte non hai perso niente, se converte l\'hai visto coi tuoi occhi. Cosa perdi a provare?',
  },
  {
    q: '"Ho gia un competitor"',
    sotto: 'Tema esclusivita, ed e la prova che la categoria funziona',
    a: 'Perfetto, allora sai gia che la categoria converte, la parte difficile l\'abbiamo saltata. Due cose: qui niente esclusiva, non devi togliere nulla per aggiungere noi. E c\'e una differenza che il tuo pubblico sente subito: con la maggior parte degli altri servizi il passeggero lascia sul tavolo un terzo del rimborso, con Rivolio si tiene il 100% e paga solo una piccola fee fissa. Quando lo spieghi, converte meglio e fai la figura di chi consiglia la cosa giusta. Piuttosto dimmi: con loro come ti trovi? Ti pagano puntuali? Vedi quanto stai maturando?',
    insiste: 'Allora tienili entrambi un mese e lascia parlare i numeri: stessa audience, due link, e a fine mese guardi chi ti ha reso di piu e chi ti ha trattato meglio. Se vinciamo noi, lo decidono i dati, non io.',
  },
  {
    q: '"Quanto lavoro devo fare?"',
    sotto: 'Paura dell\'obbligo e del calendario imposto',
    a: 'Zero, ed e\' la parte a cui di solito non credono: nessuna quota di post, nessuna scadenza, nessuna approvazione dei contenuti. Il link e\' tuo e lavora quando lo usi: una storia quando il tema capita da solo, un reel se ti va, il link in bio che intanto sta li a lavorare. L\'unica regola e\' il tag adv, per correttezza. Ti chiedo io una cosa: nelle collaborazioni che fai oggi, quanto ti pesa la parte obblighi e revisioni?',
    insiste: 'Ti dico come partono quasi tutti: una storia singola la prima settimana, giusto per vedere come reagisce il pubblico. Dieci minuti di lavoro in tutto. Da li decidi tu se e quanto spingere, senza che nessuno ti chieda niente.',
  },
  {
    q: '"Ci devo pensare"',
    sotto: 'Quasi sempre nasconde UN dubbio preciso non detto: fallo uscire ora',
    a: 'Certo, figurati. Pero aiutami a pensarci con te: il dubbio e\' sui soldi, sul tempo che ti porta via, o sul proporre una cosa nuova al tuo pubblico? Te lo chiedo perche su ognuna di queste ho una risposta concreta, e se e\' un\'altra cosa preferisco sentirla adesso a voce che perderci una settimana di messaggi.',
    insiste: 'Facciamo che oggi non decidi niente: ti attivo comunque l\'account, tanto e\' gratis e non ti obbliga a nulla, cosi il link ce l\'hai in tasca. Se tra qualche giorno ti va, lo usi. Se non ti va, non e\' successo niente. Ti ho solo tolto la burocrazia di mezzo.',
  },
  {
    q: '"Quanto guadagno davvero?"',
    sotto: 'Vuole numeri: e\' un segnale di interesse, non un attacco',
    a: 'Te lo dico coi numeri, non con le promesse: il 40% su ogni pratica andata a buon fine, piu bonus a traguardi, pagati ogni 15 giorni. Un mese realistico, tra pratiche famiglia, singole e check portati, fa circa 296 euro. Ma il punto vero e\' un altro: non c\'e\' un tetto, dipende dal volume che porti tu, non da un budget che decido io. Facciamo i conti adesso sui TUOI numeri? Dimmi le tue views medie e li vediamo insieme.',
    insiste: 'La cifra esatta non te la prometto, e ti direi di diffidare di chi lo fa. Ti prometto la trasparenza: ogni euro che maturi lo vedi in dashboard in tempo reale, e il bonifico arriva ogni 15 giorni. Il rischio per te e\' il tempo di una storia.',
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
                <span className="shrink-0 text-[10.5px] text-ink-3">{s.tempo}</span>
                {(s.n === 3 || s.n === 10) && <Badge tone="tan">passo chiave</Badge>}
                <ChevronDown
                  size={14}
                  className={cn('shrink-0 text-ink-3 transition-transform', open && 'rotate-180')}
                />
              </button>
              {open && (
                <div className="space-y-3 px-5 pb-4 pl-14">
                  <div>
                    <div className="mb-1 text-[10.5px] font-semibold uppercase tracking-wide text-ink-3">
                      Cosa fai
                    </div>
                    <p className="text-[12.5px] leading-relaxed text-ink-2">{s.fai}</p>
                  </div>
                  <div>
                    <div className="mb-1.5 text-[10.5px] font-semibold uppercase tracking-wide text-ink-3">
                      Cosa dici
                    </div>
                    <div className="space-y-1.5">
                      {s.dici.map((frase) => (
                        <p
                          key={frase}
                          className={cn(
                            'rounded-xl px-3.5 py-2 text-[12.5px] leading-relaxed',
                            frase.startsWith('(')
                              ? 'bg-subtle italic text-ink-3'
                              : 'border-l-2 border-brand-400 bg-brand-50/60 text-ink',
                          )}
                        >
                          {frase.startsWith('(') ? frase : `«${frase}»`}
                        </p>
                      ))}
                    </div>
                  </div>
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
            <p className="mt-2 rounded-xl border-l-2 border-brand-400 bg-brand-50/60 px-3.5 py-2.5 text-[12.5px] leading-relaxed text-ink">
              «{o.a}»
            </p>
            <div className="mt-2.5">
              <div className="mb-1 text-[10px] font-bold uppercase tracking-wide text-ink-3">
                Se insiste
              </div>
              <p className="rounded-xl bg-subtle px-3.5 py-2.5 text-[12px] leading-relaxed text-ink-2">
                «{o.insiste}»
              </p>
            </div>
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
