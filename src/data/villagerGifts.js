import villagerGiftsData from '../../data/villager-gifts.json';

export function getVillagerGifts(name) {
  if (!name) return null;
  return villagerGiftsData.byName?.[name] || null;
}

export { villagerGiftsData as villagerGifts };