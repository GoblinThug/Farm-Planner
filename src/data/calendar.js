import { seasonOrder } from './theme';

export function addDays(startSeason, startDay, amount, startYear = 1) {
  let seasonIndex = seasonOrder.indexOf(startSeason);
  let absoluteDay = Math.max(1, Number(startDay) || 1) - 1 + Math.max(0, Number(amount) || 0);
  let resultYear = Math.max(1, Number(startYear) || 1);
  while (absoluteDay >= 28) {
    absoluteDay -= 28;
    seasonIndex += 1;
    if (seasonIndex >= seasonOrder.length) {
      seasonIndex = 0;
      resultYear += 1;
    }
  }
  return { season: seasonOrder[seasonIndex] || startSeason, day: absoluteDay + 1, year: resultYear };
}

export const dateText = (x) =>
  `${x.season}, ${x.day} день${x.year > 1 ? `, год ${x.year}` : ''}`;