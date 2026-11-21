import { seasonOrder } from '../data/theme';

const WEEKDAY_NAMES = ['Понедельник', 'Вторник', 'Среда', 'Четверг', 'Пятница', 'Суббота', 'Воскресенье'];

export const EVENT_FILTER_ALL = 'all';

export function buildEventFilterOptions(gameEvents, { includeBirthdays = false } = {}) {
  const options = [{ id: EVENT_FILTER_ALL, label: 'Все события', kind: 'all' }];
  if (!includeBirthdays) {
    for (const f of gameEvents.festivals || []) {
      options.push({
        id: `festival:${f.name}`,
        label: f.name,
        sublabel: `${f.season}, ${f.day} день`,
        season: f.season,
        day: f.day,
        kind: 'festival',
        name: f.name,
        location: f.location,
      });
    }
    options.push({
      id: 'merchant',
      label: 'Странствующий торговец',
      sublabel: 'Дни визита в сезоне',
      kind: 'merchant',
    });
    const sorted = options.slice(1).sort((a, b) => {
      const sa = seasonOrder.indexOf(a.season);
      const sb = seasonOrder.indexOf(b.season);
      if (a.kind === 'merchant') return 1;
      if (b.kind === 'merchant') return -1;
      if (sa !== sb) return sa - sb;
      return (a.day || 0) - (b.day || 0);
    });
    return [options[0], ...sorted];
  }
  for (const b of gameEvents.birthdays || []) {
    options.push({
      id: `birthday:${b.name}`,
      label: `День рождения · ${b.name}`,
      sublabel: `${b.season}, ${b.day} день`,
      season: b.season,
      day: b.day,
      kind: 'birthday',
      name: b.name,
    });
  }
  for (const f of gameEvents.festivals || []) {
    options.push({
      id: `festival:${f.name}`,
      label: f.name,
      sublabel: `${f.season}, ${f.day} день`,
      season: f.season,
      day: f.day,
      kind: 'festival',
      name: f.name,
      location: f.location,
    });
  }
  options.push({
    id: 'merchant',
    label: 'Странствующий торговец',
    sublabel: 'Дни визита в сезоне',
    kind: 'merchant',
  });
  const sorted = options.slice(1).sort((a, b) => {
    const sa = seasonOrder.indexOf(a.season);
    const sb = seasonOrder.indexOf(b.season);
    if (a.kind === 'merchant') return 1;
    if (b.kind === 'merchant') return -1;
    if (sa !== sb) return sa - sb;
    return (a.day || 0) - (b.day || 0);
  });
  return [options[0], ...sorted];
}

export function dayMatchesEventFilter(filter, season, day, communityCenterComplete, gameEvents) {
  if (!filter || filter.id === EVENT_FILTER_ALL) return true;
  if (filter.kind === 'merchant') return isTravelingMerchantDay(day, communityCenterComplete);
  if (filter.kind === 'birthday') {
    return filter.season === season && filter.day === day;
  }
  if (filter.kind === 'festival') {
    return filter.season === season && filter.day === day;
  }
  return false;
}

export function weekdayNameForDay(day) {
  const d = Math.max(1, Math.min(28, Number(day) || 1));
  return WEEKDAY_NAMES[(d - 1) % 7];
}

export function isTravelingMerchantDay(day, communityCenterComplete) {
  const w = weekdayNameForDay(day);
  if (communityCenterComplete) return w === 'Среда';
  return w === 'Пятница' || w === 'Воскресенье';
}

export function eventsOnDay({ birthdays, festivals }, season, day) {
  const bday = (birthdays || []).filter(e => e.season === season && e.day === day);
  const fest = (festivals || []).filter(e => e.season === season && e.day === day);
  return { birthdays: bday, festivals: fest };
}