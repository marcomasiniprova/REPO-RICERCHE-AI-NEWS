import type { VideoItem, CarouselItem } from './types';

/**
 * Modello dei costi del team (il piu' onesto possibile).
 *
 * Regola del progetto: mai inventare numeri. Quindi qui distinguiamo sempre:
 *  - certo    = numero verificato o dichiarato da Valerio
 *  - stima    = calcolo su un tasso ancora da confermare (es. euro per credito Kie)
 *  - da_verificare = non lo sappiamo ancora, non mettiamo una cifra finta
 *
 * I CREDITI Kie sono un dato VERO: li scrivono Video e Caroselli (crediti_spesi)
 * a ogni generazione. La conversione in euro e' una STIMA finche' Valerio non
 * conferma quanto paga davvero una ricarica.
 */

export type CostCertezza = 'certo' | 'stima' | 'da_verificare';

export interface CostVoce {
  nome: string;
  euro: number | null; // null = da verificare (nessuna cifra finta)
  certezza: CostCertezza;
  nota: string;
}

/**
 * Tasso di conversione crediti Kie -> euro.
 * DA CALIBRARE con Valerio: appena ci dice quanto ha pagato una ricarica e per
 * quanti crediti, si mette il valore esatto qui e la stima diventa precisa.
 * Finche' e' this default, l'euro Kie resta etichettato "stima".
 */
export const EUR_PER_USD = 0.86; // 30/8/2026: 1$ = 0,8624€, arrotondato prudente
export const KIE_USD_PER_CREDIT = 0.005; // pricing ufficiale Kie: $5 / 1000 crediti
export const KIE_EUR_PER_CREDIT = KIE_USD_PER_CREDIT * EUR_PER_USD; // ~0,0043€, confermato
export const KIE_TASSO_CONFERMATO = true;

/**
 * Costi fissi mensili (ricorrenti), cifre reali (30/8/2026, ricerca sui tool + dati
 * di Valerio). Le voci gratis sono 0 certo; niente cifre finte.
 */
export const COSTI_FISSI_MENSILI: CostVoce[] = [
  {
    nome: 'Claude (abbonamento Max 20x)',
    euro: 200,
    certezza: 'certo',
    nota: 'Il team gira sulla tua subscription Claude. Dichiarato da te: ~200€/mese.',
  },
  {
    nome: 'Railway (hosting dashboard)',
    euro: 5 * EUR_PER_USD,
    certezza: 'certo',
    nota: 'Piano Hobby 5$/mese.',
  },
  {
    nome: 'Zernio (pubblicazione TikTok/YouTube)',
    euro: 0,
    certezza: 'certo',
    nota: '2 account gratis (TikTok + YouTube). Oltre i 2: 6$/account/mese quando aggiungerai canali.',
  },
  {
    nome: 'Supabase (database dashboard)',
    euro: 0,
    certezza: 'certo',
    nota: 'Piano Free: 0€. Il Pro sarebbe 25$/mese, per ora non serve.',
  },
  {
    nome: 'Composio (Gmail + Instagram)',
    euro: 0,
    certezza: 'certo',
    nota: 'Piano Free attuale: 0€.',
  },
];

export interface CostiTeam {
  meseLabel: string; // es. "agosto 2026"
  kieCreditiMese: number; // VERO
  kieCreditiTotali: number; // VERO
  kieEuroMese: number; // stima
  kiePezziMese: number; // quanti video+caroselli generati questo mese
  fissiCertiMensili: number; // somma delle voci fisse certe
  totaleStimatoMensile: number; // fissi certi + stima Kie del mese
  vociFisse: CostVoce[];
  tassoKieConfermato: boolean;
  euroPerCredito: number;
}

const MESI_IT = [
  'gennaio', 'febbraio', 'marzo', 'aprile', 'maggio', 'giugno',
  'luglio', 'agosto', 'settembre', 'ottobre', 'novembre', 'dicembre',
];

/** YYYY-MM del contenuto, dal campo date (o dalla chiave kv). */
function meseDi(item: { date?: string; key?: string }): string {
  const d = item.date ?? (item.key ? item.key.replace(/^[a-z]+_/, '') : '');
  return d ? d.slice(0, 7) : '';
}

/**
 * Calcola i costi del team dai dati veri (video + caroselli col credito speso).
 * Non tocca il backend: somma cio' che gli agenti hanno gia' scritto.
 */
export function calcolaCostiTeam(
  videos: VideoItem[],
  carousels: CarouselItem[],
  now: Date = new Date(),
): CostiTeam {
  const meseCorrente = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`;
  const meseLabel = `${MESI_IT[now.getMonth()]} ${now.getFullYear()}`;

  const pezzi = [...videos, ...carousels];
  let kieCreditiMese = 0;
  let kieCreditiTotali = 0;
  let kiePezziMese = 0;

  for (const p of pezzi) {
    const c = typeof p.crediti_spesi === 'number' ? p.crediti_spesi : 0;
    if (c <= 0) continue;
    kieCreditiTotali += c;
    if (meseDi(p) === meseCorrente) {
      kieCreditiMese += c;
      kiePezziMese += 1;
    }
  }

  const kieEuroMese = kieCreditiMese * KIE_EUR_PER_CREDIT;
  const fissiCertiMensili = COSTI_FISSI_MENSILI
    .filter((v) => v.certezza === 'certo' && typeof v.euro === 'number')
    .reduce((s, v) => s + (v.euro as number), 0);

  return {
    meseLabel,
    kieCreditiMese,
    kieCreditiTotali,
    kieEuroMese,
    kiePezziMese,
    fissiCertiMensili,
    totaleStimatoMensile: fissiCertiMensili + kieEuroMese,
    vociFisse: COSTI_FISSI_MENSILI,
    tassoKieConfermato: KIE_TASSO_CONFERMATO,
    euroPerCredito: KIE_EUR_PER_CREDIT,
  };
}

export function eur(n: number): string {
  return n.toLocaleString('it-IT', { style: 'currency', currency: 'EUR', maximumFractionDigits: n % 1 === 0 ? 0 : 2 });
}
