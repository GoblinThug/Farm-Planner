import gameEventsData from '../../data/game-events.json';
import villagerGiftsData from '../../data/villager-gifts.json';

/** @type {Set<string>} */
export const MARRIAGEABLE_VILLAGERS = new Set([
  'Абигейл',
  'Алекс',
  'Эллиот',
  'Эмили',
  'Хэйли',
  'Харви',
  'Леа',
  'Мару',
  'Пенни',
  'Сэм',
  'Себастьян',
  'Шейн',
]);

/**
 * @typedef {{ name: string, id?: string, loves: string[], birthday: { season: string, day: number } | null, marriageable: boolean }} VillagerRow
 */

/** @returns {VillagerRow[]} */
export function getVillagers() {
  const birthdayByName = new Map(
    (gameEventsData.birthdays || []).map(b => [b.name, { season: b.season, day: b.day }])
  );
  const names = new Set([
    ...Object.keys(villagerGiftsData.byName || {}),
    ...(gameEventsData.birthdays || []).map(b => b.name),
  ]);

  return [...names]
    .sort((a, b) => a.localeCompare(b, 'ru'))
    .map(name => {
      const gift = villagerGiftsData.byName?.[name];
      return {
        name,
        id: gift?.id,
        loves: gift?.loves || [],
        birthday: birthdayByName.get(name) || null,
        marriageable: MARRIAGEABLE_VILLAGERS.has(name),
      };
    });
}

/** @param {VillagerRow} v */
export function formatVillagerBirthday(v) {
  if (!v?.birthday) return 'День рождения не указан';
  return `${v.birthday.season}, ${v.birthday.day} число`;
}

/** @param {VillagerRow} v */
export function villagerSearchText(v) {
  const parts = [
    v.name,
    v.birthday?.season,
    v.birthday?.day,
    v.marriageable ? 'брак супруг' : '',
    ...(v.loves || []),
  ];
  return parts
    .filter(Boolean)
    .join(' ')
    .toLocaleLowerCase('ru');
}