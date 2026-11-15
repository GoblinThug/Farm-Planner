import { addDays, seasonOrder } from '../data/appData';

export function computeAllEvents(plantings, encyclopediaCrops) {
  return plantings.flatMap(p => {
    const c = encyclopediaCrops.find(x => x.name === p.crop);
    if (!c) return [];
    const plantingYear = p.year || 1;
    const location = p.location || 'farm';
    const canGrowOn = date => {
      if (location !== 'farm') return true;
      const allowed = c.farmSeasons || [c.season];
      return allowed.includes(date.season);
    };
    const growthDays = p.irrigated && c.irrigatedGrowthDays ? c.irrigatedGrowthDays : c.days;
    const first = addDays(p.season, p.day, growthDays, plantingYear);
    if (!canGrowOn(first)) return [{ season: p.season, day: p.day, year: plantingYear, kind: 'Посадка', p, c }];
    let events = c.name === 'Чайные листья' ? [] : [{ ...first, kind: 'Первый сбор', p, c }];
    if (c.name === 'Чайные листья') {
      for (let y = first.year; y <= first.year + 2; y++) {
        for (const s of seasonOrder) {
          if (s === 'Зима' && !['greenhouse', 'indoorPot'].includes(location)) continue;
          for (let d = 22; d <= 28; d++) {
            const candidate = { year: y, season: s, day: d };
            const orderDate = x => x.year * 112 + seasonOrder.indexOf(x.season) * 28 + x.day;
            if (orderDate(candidate) >= orderDate(first)) events.push({ ...candidate, kind: 'Сбор чайных листьев', p, c });
          }
        }
      }
    } else if (c.regrow) {
      for (let i = 1; i < 8; i++) {
        const next = addDays(first.season, first.day, c.regrow * i, first.year);
        if (!canGrowOn(next)) break;
        events.push({ ...next, kind: 'Повторный сбор', p, c });
      }
    }
    return [{ season: p.season, day: p.day, year: plantingYear, kind: 'Посадка', p, c }, ...events];
  });
}