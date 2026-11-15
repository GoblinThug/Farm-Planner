import { crops } from '../data/appData';

const SEASON_ORDER = ['Весна', 'Лето', 'Осень', 'Зима'];

export function buildEncyclopediaCrops() {
  const grouped = new Map();
  crops.forEach(c => {
    const item = grouped.get(c.name);
    if (item) {
      if (!item.seasons.includes(c.season)) item.seasons.push(c.season);
      item.days = Math.min(item.days, c.days);
      item.regrow = Math.max(item.regrow, c.regrow || 0);
      item.farmSeasons = [...new Set([...(item.farmSeasons || []), ...(c.farmSeasons || [c.season])])];
      item.growingLocations = [...new Set([...(item.growingLocations || []), ...(c.growingLocations || ['farm', 'greenhouse'])])];
      if (c.specialNotes && !item.specialNotes) item.specialNotes = c.specialNotes;
      if (c.irrigatedGrowthDays) item.irrigatedGrowthDays = c.irrigatedGrowthDays;
    } else {
      grouped.set(c.name, { ...c, seasons: [...(c.seasons || [c.season])] });
    }
  });
  return [...grouped.values()]
    .map(c => ({
      ...c,
      seasons: [...new Set(c.seasons)].sort((a, b) => SEASON_ORDER.indexOf(a) - SEASON_ORDER.indexOf(b)),
      farmSeasons: [...new Set(c.farmSeasons || [])].sort((a, b) => SEASON_ORDER.indexOf(a) - SEASON_ORDER.indexOf(b)),
    }))
    .sort((a, b) => a.name.localeCompare(b.name, 'ru'));
}