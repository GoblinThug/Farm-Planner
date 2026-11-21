import bundlesData from '../../data/bundles.json';
import cropsData from '../../data/crops.json';
import cropDetailsData from '../../data/crop-details.json';
import cropRulesData from '../../data/crop-rules.json';
import fishData from '../../data/fish.json';
import fishRulesData from '../../data/fish-rules.json';
import cropImagesData from '../../data/crop-images.json';
import fishImagesData from '../../data/fish-images.json';
import animalsData from '../../data/animals.json';
import animalImagesData from '../../data/animal-images.json';
import animalProductImagesData from '../../data/animal-product-images.json';
import gameEventsData from '../../data/game-events.json';
import villagerGiftsData from '../../data/villager-gifts.json';

// JSON — единственный источник характеристик культур.
// Внутренние имена days/regrow оставлены для совместимости с календарём и карточками.
const crops = cropsData.map((item) => ({
  ...item,
  days: item.growthDays,
  regrow: item.regrowthDays || 0,
}));

export {
  bundlesData,
  cropDetailsData as cropDetails,
  cropImagesData,
  cropRulesData as cropRules,
  crops,
  fishData as fish,
  fishImagesData,
  fishRulesData as fishRules,
  animalsData as animals,
  animalImagesData,
  animalProductImagesData,
  gameEventsData as gameEvents,
  villagerGiftsData as villagerGifts,
};