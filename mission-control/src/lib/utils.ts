import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

const ROME_TZ = 'Europe/Rome';

export function fmtTime(iso: string | null): string {
  if (!iso) return '—';
  return new Date(iso).toLocaleTimeString('it-IT', {
    hour: '2-digit',
    minute: '2-digit',
    timeZone: ROME_TZ,
  });
}

export function fmtDay(iso: string | null): string {
  if (!iso) return '';
  return new Date(iso).toLocaleDateString('it-IT', {
    day: 'numeric',
    month: 'short',
    timeZone: ROME_TZ,
  });
}

export function timeAgo(iso: string | null): string {
  if (!iso) return 'mai';
  const s = Math.max(0, (Date.now() - new Date(iso).getTime()) / 1000);
  if (s < 45) return 'adesso';
  if (s < 3600) return `${Math.round(s / 60)} min fa`;
  if (s < 86400) {
    const h = Math.floor(s / 3600);
    return h === 1 ? '1 ora fa' : `${h} ore fa`;
  }
  const d = Math.floor(s / 86400);
  return d === 1 ? 'ieri' : `${d} giorni fa`;
}

/** Ora corrente nel fuso di Roma, come parti numeriche. */
function romeNow(): { h: number; m: number; date: Date } {
  const now = new Date();
  const parts = new Intl.DateTimeFormat('it-IT', {
    hour: 'numeric',
    minute: 'numeric',
    hour12: false,
    timeZone: ROME_TZ,
  }).formatToParts(now);
  const h = Number(parts.find((p) => p.type === 'hour')?.value ?? 0);
  const m = Number(parts.find((p) => p.type === 'minute')?.value ?? 0);
  return { h, m, date: now };
}

/**
 * Prossimo giro da un cron UTC semplice (minuto + ora singola o range es. "15 6-18 * * *").
 * Restituisce un'etichetta leggibile in ora italiana. Copre i pattern usati dalle routine RIVO.
 */
export function nextRunLabel(cron: string | null): string {
  if (!cron) return 'su richiesta';
  const [minS, hourS] = cron.split(' ');
  const min = Number(minS);
  if (Number.isNaN(min)) return 'pianificato';

  // Offset Roma vs UTC (estate +2, inverno +1): calcolato dal fuso reale.
  const utcH = new Date().getUTCHours();
  const { h: romeH } = romeNow();
  let off = romeH - utcH;
  if (off < -12) off += 24;
  if (off > 12) off -= 24;

  const toRome = (h: number) => (h + off + 24) % 24;
  const { h: nowH, m: nowM } = romeNow();
  const nowMin = nowH * 60 + nowM;

  // Parsa il campo ore del cron: liste con virgola (5,17), intervalli (8-20),
  // intervalli con passo (5-19/2) e valori singoli. Ignora i pezzi non validi.
  const hours: number[] = [];
  for (const part of hourS.split(',')) {
    const [rangePart, stepS] = part.split('/');
    const step = stepS ? Number(stepS) : 1;
    if (rangePart.includes('-')) {
      const [a, b] = rangePart.split('-').map(Number);
      if (Number.isNaN(a) || Number.isNaN(b) || Number.isNaN(step) || step <= 0) continue;
      for (let h = a; h <= b; h += step) hours.push(toRome(h));
    } else {
      const h = Number(rangePart);
      if (Number.isNaN(h)) continue;
      hours.push(toRome(h));
    }
  }
  if (hours.length === 0) return 'pianificato';
  hours.sort((a, b) => a - b);

  for (const h of hours) {
    const t = h * 60 + min;
    if (t > nowMin) {
      return `oggi ${String(h).padStart(2, '0')}:${String(min).padStart(2, '0')}`;
    }
  }
  const h0 = hours[0];
  return `domani ${String(h0).padStart(2, '0')}:${String(min).padStart(2, '0')}`;
}

export function initials(name: string): string {
  return name
    .replace(/^RIVO\s*-\s*/i, '')
    .split(/\s+/)
    .map((w) => w[0])
    .slice(0, 2)
    .join('')
    .toUpperCase();
}

export function fmtFollowers(f: string | number | null): string | null {
  if (f == null) return null;
  if (typeof f === 'string') return f;
  if (f >= 1000) return `${(f / 1000).toFixed(f >= 100000 ? 0 : 1).replace('.', ',')}k`;
  return String(f);
}
