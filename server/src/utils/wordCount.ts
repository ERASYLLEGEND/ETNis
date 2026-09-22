/**
 * Counts words accurately for Kazakh text.
 * Splits by whitespace and accounts for Kazakh Cyrillic punctuation and hyphens.
 */
export function countKazakhWords(text: string | null | undefined): number {
  if (!text) return 0;
  
  // Trim and normalize whitespace
  const trimmed = text.trim();
  if (!trimmed) return 0;

  // Match words consisting of Latin/Cyrillic characters, Kazakh specific letters, and internal hyphens
  // Kazakh specific letters: Әә Іі Ңң Ғғ Үү Ұұ Ққ Өө Һһ
  const wordRegex = /[a-zA-Zа-яА-ЯӘәІіҢңҒғҮүҰұҚқӨөҺһ]+(?:-[a-zA-Zа-яА-ЯӘәІіҢңҒғҮүҰұҚқӨөҺһ]+)*/g;
  const matches = trimmed.match(wordRegex);
  return matches ? matches.length : 0;
}

export function isWordCountInRange(count: number, min: number, max: number): {
  isValid: boolean;
  isUnder: boolean;
  isOver: boolean;
  statusText: string;
  colorClass: string;
} {
  const isUnder = count < min;
  const isOver = count > max;
  const isValid = !isUnder && !isOver;

  let statusText = `${count} сөз (${min}-${max} сөз аралығында)`;
  let colorClass = "text-emerald-600 bg-emerald-50 border-emerald-300";

  if (isUnder) {
    statusText = `${count} сөз (талаптан кем: кемінде ${min} сөз)`;
    colorClass = "text-amber-700 bg-amber-50 border-amber-300";
  } else if (isOver) {
    statusText = `${count} сөз (талаптан көп: ең көбі ${max} сөз)`;
    colorClass = "text-rose-700 bg-rose-50 border-rose-300";
  }

  return { isValid, isUnder, isOver, statusText, colorClass };
}
