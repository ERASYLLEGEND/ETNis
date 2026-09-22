export function countKazakhWords(text: string | null | undefined): number {
  if (!text) return 0;
  const trimmed = text.trim();
  if (!trimmed) return 0;
  const wordRegex = /[a-zA-Zа-яА-ЯӘәІіҢңҒғҮүҰұҚқӨөҺһ]+(?:-[a-zA-Zа-яА-ЯӘәІіҢңҒғҮүҰұҚқӨөҺһ]+)*/g;
  const matches = trimmed.match(wordRegex);
  return matches ? matches.length : 0;
}

export function getWordCountStatus(count: number, min: number, max: number) {
  const isUnder = count < min;
  const isOver = count > max;
  const isValid = !isUnder && !isOver;

  let text = `${count} сөз (${min}-${max} сөз аралығы)`;
  let color = 'text-emerald-700 bg-emerald-50 border-emerald-300';
  let badgeText = 'Талапқа сай';

  if (isUnder) {
    text = `${count} сөз (талаптан кем, кемінде ${min} сөз)`;
    color = 'text-amber-800 bg-amber-50 border-amber-300';
    badgeText = `${min - count} сөз жетпейді`;
  } else if (isOver) {
    text = `${count} сөз (талаптан көп, ең көбі ${max} сөз)`;
    color = 'text-rose-800 bg-rose-50 border-rose-300';
    badgeText = `${count - max} сөз артық`;
  }

  return { count, isValid, isUnder, isOver, text, color, badgeText };
}
