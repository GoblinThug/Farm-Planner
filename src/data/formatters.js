import { cropSeasonOrder } from './theme';

export const showValue = (value) => {
  if (value === null || value === undefined || value === '') return 'Не указано в JSON';
  if (Array.isArray(value)) return value.length ? value.map(showValue).join(', ') : 'Нет ограничений / не указано';
  if (typeof value === 'boolean') return value ? 'Да' : 'Нет';
  if (typeof value === 'object') {
    if ('min' in value || 'max' in value) return `${value.min ?? '—'}–${value.max ?? '—'}`;
    return Object.entries(value)
      .map(([k, v]) => `${k}: ${showValue(v)}`)
      .join(' · ');
  }
  return String(value);
};

export const cropSeasonList = (value) =>
  (Array.isArray(value) ? value : value ? [value] : [])
    .filter(Boolean)
    .sort((a, b) => cropSeasonOrder.indexOf(a) - cropSeasonOrder.indexOf(b));

export const cropGrowingPlaceLines = (crop) => {
  const locations = crop.growingLocations || [];
  const farmSeasons = cropSeasonList(crop.farmSeasons ?? crop.seasons);
  const lines = [];
  if (locations.includes('farm') && farmSeasons.length) lines.push(`Ферма — ${farmSeasons.join(', ')}`);
  if (locations.includes('greenhouse')) lines.push('Теплица — круглый год');
  if (locations.includes('gingerIsland')) lines.push('Имбирный остров — круглый год');
  if (locations.includes('indoorPot')) lines.push('Горшок в помещении — круглый год');
  return lines;
};

export const cropGrowingSummary = (crop) =>
  cropGrowingPlaceLines(crop).join('\n') || 'Место выращивания не указано';

export const cropLocationLabel = (key) =>
  ({
    farm: 'Ферма',
    greenhouse: 'Теплица',
    gingerIsland: 'Имбирный остров',
    indoorPot: 'Горшок в помещении',
  }[key] || key);

export const fishTimeDisplay = (value) => {
  if (Array.isArray(value) && value.length >= 2) return `${value[0]}–${value[1]}`;
  return showValue(value);
};

export const fishLevelDisplay = (value) =>
  value === 0 ? 'Любой уровень' : value == null ? null : `Уровень ${value}+`;

export const fishTypeLabel = (f) =>
  ({
    regular: 'Обычная рыба',
    nightMarket: 'Ночной рынок',
    legendary: 'Легендарная рыба',
    legendaryExtended: 'Легендарная рыба II',
    crabPot: 'Крабовая ловушка',
    otherCatch: 'Особый улов',
    rod: 'Удочка',
    night: 'Ночной рынок',
    legend: 'Легендарная рыба',
    legend2: 'Легендарная рыба II',
    pot: 'Крабовая ловушка',
    other: 'Особый улов',
  }[f.type] || f.category || 'Улов');

export const fishSeasonText = (f) => showValue(f.seasons ?? f.season);
export const fishLocationText = (f) => showValue(f.locations ?? f.place);
export const fishTimeText = (f) => showValue(f.timeWindow ?? f.time);
export const fishWeatherText = (f) => showValue(f.weatherCondition ?? f.weather);

export const fishCatchMethodText = (f) =>
  ({
    fishingRod: 'Удочка',
    nightMarketSubmarine: 'Подводная лодка ночного рынка',
    crabPot: 'Крабовая ловушка',
  }[f.catchMethod] || showValue(f.catchMethod));

export const isLegendaryFish = (f) => ['legendary', 'legendaryExtended', 'legend', 'legend2'].includes(f.type);
export const isCrabPotFish = (f) => ['crabPot', 'pot'].includes(f.type);
export const isNightMarketFish = (f) => ['nightMarket', 'night'].includes(f.type);
export const isOtherCatch = (f) => ['otherCatch', 'other'].includes(f.type);

export const fishSearchText = (f) =>
  [f.name, fishLocationText(f), fishSeasonText(f), fishTypeLabel(f), fishWeatherText(f), ...(f.availabilityNotes || [])]
    .join(' ')
    .toLocaleLowerCase('ru');

export const animalCategoryLabel = (a) =>
  ({
    coop: 'Курятник',
    barn: 'Хлев',
    special: 'Особое',
  }[a.category] || a.category || 'Животное');

export const animalHousingLabel = (a) => {
  const type =
    {
      coop: 'Курятник',
      barn: 'Хлев',
      slimeHutch: 'Хлев для слизней',
    }[a.housingType] || a.building;
  return showValue(a.building || type);
};

export const animalPurchaseText = (a) => {
  if (a.purchasePrice != null) return `${a.purchasePrice} з. у ${a.purchaseSource || 'Мэри'}`;
  if (a.purchaseSource) return showValue(a.purchaseSource);
  return null;
};

export const animalProduceSummary = (a) => {
  const names = (a.products || []).map(p => p.name).filter(Boolean);
  if (!names.length) return 'Продукты не указаны';
  const main = names.slice(0, 2).join(', ');
  const extra = names.length > 2 ? ` +${names.length - 2}` : '';
  const interval = a.produceInterval ? ` · ${a.produceInterval}` : '';
  return `${main}${extra}${interval}`;
};

export const animalSearchText = (a) =>
  [
    a.name,
    ...(a.aliases || []),
    animalCategoryLabel(a),
    a.building,
    a.purchaseSource,
    animalProduceSummary(a),
    ...(a.products || []).map(p => [p.name, p.condition, p.frequency].join(' ')),
    ...(a.specialNotes || []),
  ]
    .join(' ')
    .toLocaleLowerCase('ru');