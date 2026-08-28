/**
 * Pulizia dei body email prima di salvarli: via le citazioni quotate
 * ("On ... wrote:", "Il giorno ... ha scritto:", righe ">") e i segni
 * di formattazione grezzi. I DM non passano di qui: arrivano gia' bene.
 */

const QUOTE_HEADERS: RegExp[] = [
  /(?:^|\n)[ \t]*On [\s\S]{0,250}?wrote:/,
  /(?:^|\n)[ \t]*Il giorno [\s\S]{0,250}?ha\s+scritto:/,
  /(?:^|\n)[ \t]*-{2,}[ \t]*(?:Original Message|Messaggio originale)[ \t]*-{2,}/i,
  /(?:^|\n)Da:[^\n]+\n(?:[^\n]*\n){0,3}?(?:Inviato|Sent):/i,
  /(?:^|\n)[ \t]*>/,
];

export function cleanEmailBody(body: string): string {
  let t = body.replace(/\r\n/g, '\n').replace(/ /g, ' ').replace(/​/g, '');
  let cut = t.length;
  for (const rx of QUOTE_HEADERS) {
    const m = rx.exec(t);
    if (m && m.index < cut) cut = m.index;
  }
  t = t.slice(0, cut);
  t = t
    .split('\n')
    .filter((l) => !l.trimStart().startsWith('>'))
    .join('\n');
  t = t.replace(/\*([^*\n]{1,120})\*/g, '$1');
  t = t.replace(/[ \t]+\n/g, '\n').replace(/\n{3,}/g, '\n\n').trim();
  return t.length > 0 ? t : body.trim().slice(0, 400);
}
