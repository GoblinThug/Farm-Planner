import { Image, Text } from 'react-native';
import bundlesData from '../../data/bundles.json';
import cropsData from '../../data/crops.json';
import cropDetailsData from '../../data/crop-details.json';
import cropRulesData from '../../data/crop-rules.json';
import cropImagesData from '../../data/crop-images.json';
import fishData from '../../data/fish.json';
import fishRulesData from '../../data/fish-rules.json';
import fishImagesData from '../../data/fish-images.json';

const palette = { ink: '#493626', brown: '#765136', wood: '#9b6a3e', woodDark: '#63442f', paper: '#f5e8c8', paperLight: '#fff4d9', line: '#c9a878', green: '#78965a', greenDark: '#526f43', muted: '#8b765c', gold: '#e4b95f' };
const seasonSprites = { Весна: require('../../assets/crops/tulip.png'), Лето: require('../../assets/crops/sunflower.png'), Осень: require('../../assets/crops/pumpkin.png'), Зима: require('../../assets/ui/winter.png') };
const seasons = [{ name: 'Весна' }, { name: 'Лето' }, { name: 'Осень' }, { name: 'Зима' }];
const week = ['Пн', 'Вт', 'Ср', 'Чт', 'Пт', 'Сб', 'Вс'];
const uiSprites = { calendar: require('../../assets/ui/calendar.png'), crops: require('../../assets/ui/crops.png'), fish: require('../../assets/ui/fish.png'), plus: require('../../assets/ui/plus.png'), close: require('../../assets/ui/close.png') };
const UIIcon = ({ name, size = 24 }) => <Image source={uiSprites[name]} style={{ width: size, height: size }} resizeMode="stretch"/>;
const SeasonIcon = ({ name, size = 22 }) => <Image source={seasonSprites[name]} style={{ width: size, height: size }} resizeMode="stretch"/>;
// Growth days are base-game crop growth times. Regrowing crops use the interval after the first harvest.
const cropSpriteAssets = {
    "Амарант": require('../../assets/crops/amaranth.png'),
    "Ананас": require('../../assets/crops/pineapple.png'),
    "Артишок": require('../../assets/crops/artichoke.png'),
    "Баклажан": require('../../assets/crops/eggplant.png'),
    "Батат": require('../../assets/crops/yam.png'),
    "Бок-чой": require('../../assets/crops/bok-choy.png'),
    "Брокколи": require('../../assets/crops/broccoli.png'),
    "Виноград": require('../../assets/crops/grape.png'),
    "Волокна": require('../../assets/crops/fiber.png'),
    "Древний плод": require('../../assets/crops/ancient-fruit.png'),
    "Дыня": require('../../assets/crops/melon.png'),
    "Жгучий перец": require('../../assets/crops/hot-pepper.png'),
    "Зелёная фасоль": require('../../assets/crops/green-bean.png'),
    "Карамбола": require('../../assets/crops/starfruit.png'),
    "Картофель": require('../../assets/crops/potato.png'),
    "Клубника": require('../../assets/crops/strawberry.png'),
    "Клюква": require('../../assets/crops/cranberry.png'),
    "Корень таро": require('../../assets/crops/taro-root.png'),
    "Кофейное зерно": require('../../assets/crops/coffee-bean.png'),
    "Красная капуста": require('../../assets/crops/red-cabbage.png'),
    "Кудрявая капуста": require('../../assets/crops/kale.png'),
    "Кукуруза": require('../../assets/crops/corn.png'),
    "Летний блестник": require('../../assets/crops/summer-spangle.png'),
    "Мак": require('../../assets/crops/poppy.png'),
    "Морковь": require('../../assets/crops/carrot.png'),
    "Неочищенный рис": require('../../assets/crops/rice.png'),
    "Пастернак": require('../../assets/crops/parsnip.png'),
    "Плод кактуса": require('../../assets/crops/cactus-fruit.png'),
    "Подсолнух": require('../../assets/crops/sunflower.png'),
    "Помидор": require('../../assets/crops/tomato.png'),
    "Пшеница": require('../../assets/crops/wheat.png'),
    "Ревень": require('../../assets/crops/rhubarb.png'),
    "Редис": require('../../assets/crops/radish.png'),
    "Свёкла": require('../../assets/crops/beet.png'),
    "Синий яркоцвет": require('../../assets/crops/blue-jazz.png'),
    "Сказочная роза": require('../../assets/crops/fairy-rose.png'),
    "Сквош": require('../../assets/crops/summer-squash.png'),
    "Сладкая самоцветинка": require('../../assets/crops/sweet-gem-berry.png'),
    "Снегодыня": require('../../assets/crops/powdermelon.png'),
    "Тыква": require('../../assets/crops/pumpkin.png'),
    "Тюльпан": require('../../assets/crops/tulip.png'),
    "Фрукт Ки": require('../../assets/crops/qi-fruit.png'),
    "Хмель": require('../../assets/crops/hops.png'),
    "Цветная капуста": require('../../assets/crops/cauliflower.png'),
    "Чайные листья": require('../../assets/crops/tea-leaves.png'),
    "Черника": require('../../assets/crops/blueberry.png'),
    "Чеснок": require('../../assets/crops/garlic.png')
};
const CropIcon = ({ crop, size = 42 }) => cropImagesData[crop.name] && cropSpriteAssets[crop.name]
    ? <Image source={cropSpriteAssets[crop.name]} style={{ width: size, height: size }} resizeMode="contain"/>
    : <Text style={st.cropIcon}>{crop.icon}</Text>;

// JSON — единственный источник характеристик культур.
// Внутренние имена days/regrow оставлены для совместимости с календарём и карточками.
const crops = cropsData.map(item => ({
    ...item,
    days: item.growthDays,
    regrow: item.regrowthDays || 0
}));
const cropDetails = cropDetailsData;
const fishSpriteAssets = {
  "Иглобрюх": require('../../assets/fish/fish-01.png'),
  "Анчоус": require('../../assets/fish/fish-02.png'),
  "Тунец": require('../../assets/fish/fish-03.png'),
  "Сардина": require('../../assets/fish/fish-04.png'),
  "Барабулька": require('../../assets/fish/fish-05.png'),
  "Сельдь": require('../../assets/fish/fish-06.png'),
  "Угорь": require('../../assets/fish/fish-07.png'),
  "Осьминог": require('../../assets/fish/fish-08.png'),
  "Берикс": require('../../assets/fish/fish-09.png'),
  "Кальмар": require('../../assets/fish/fish-10.png'),
  "Морской огурец": require('../../assets/fish/fish-11.png'),
  "Суперогурец": require('../../assets/fish/fish-12.png'),
  "Камбала": require('../../assets/fish/fish-13.png'),
  "Тиляпия": require('../../assets/fish/fish-14.png'),
  "Альбакор": require('../../assets/fish/fish-15.png'),
  "Палтус": require('../../assets/fish/fish-16.png'),
  "Лещ": require('../../assets/fish/fish-17.png'),
  "Большеротый окунь": require('../../assets/fish/fish-18.png'),
  "Малоротый окунь": require('../../assets/fish/fish-19.png'),
  "Радужная форель": require('../../assets/fish/fish-20.png'),
  "Лосось": require('../../assets/fish/fish-21.png'),
  "Судак": require('../../assets/fish/fish-22.png'),
  "Окунь": require('../../assets/fish/fish-23.png'),
  "Карп": require('../../assets/fish/fish-24.png'),
  "Сом": require('../../assets/fish/fish-25.png'),
  "Щука": require('../../assets/fish/fish-26.png'),
  "Солнечник": require('../../assets/fish/fish-27.png'),
  "Полуночный карп": require('../../assets/fish/fish-28.png'),
  "Осётр": require('../../assets/fish/fish-29.png'),
  "Тигровая форель": require('../../assets/fish/fish-30.png'),
  "Сомик": require('../../assets/fish/fish-31.png'),
  "Голавль": require('../../assets/fish/fish-32.png'),
  "Дорадо": require('../../assets/fish/fish-33.png'),
  "Шэд": require('../../assets/fish/fish-34.png'),
  "Змеезуб": require('../../assets/fish/fish-35.png'),
  "Лесоплюх": require('../../assets/fish/fish-36.png'),
  "Бычок": require('../../assets/fish/fish-37.png'),
  "Песковник": require('../../assets/fish/fish-38.png'),
  "Скорпионовый карп": require('../../assets/fish/fish-39.png'),
  "Пятнистый криворот": require('../../assets/fish/fish-40.png'),
  "Рыба-камень": require('../../assets/fish/fish-41.png'),
  "Ледопип": require('../../assets/fish/fish-42.png'),
  "Лавовый угорь": require('../../assets/fish/fish-43.png'),
  "Пустотный лосось": require('../../assets/fish/fish-44.png'),
  "Слаймджек": require('../../assets/fish/fish-45.png'),
  "Скат": require('../../assets/fish/fish-46.png'),
  "Крылатка": require('../../assets/fish/fish-47.png'),
  "Голубой дискус": require('../../assets/fish/fish-48.png'),
  "Ночной кальмар": require('../../assets/fish/fish-49.png'),
  "Жуть-рыба": require('../../assets/fish/fish-50.png'),
  "Рыба-капля": require('../../assets/fish/fish-51.png'),
  "Багрянник": require('../../assets/fish/fish-52.png'),
  "Морской черт": require('../../assets/fish/fish-53.png'),
  "Легенда": require('../../assets/fish/fish-54.png'),
  "Ледорыб": require('../../assets/fish/fish-55.png'),
  "Карп-мутант": require('../../assets/fish/fish-56.png'),
  "Малек Багрянника": require('../../assets/fish/fish-57.png'),
  "Мисс Морской черт": require('../../assets/fish/fish-58.png'),
  "Легенда II": require('../../assets/fish/fish-59.png'),
  "Ледорыб-младший": require('../../assets/fish/fish-60.png'),
  "Радиоактивный карп": require('../../assets/fish/fish-61.png'),
  "Гребешок": require('../../assets/fish/fish-62.png'),
  "Сердцевидка": require('../../assets/fish/fish-63.png'),
  "Краб": require('../../assets/fish/fish-64.png'),
  "Рак": require('../../assets/fish/fish-65.png'),
  "Омар": require('../../assets/fish/fish-66.png'),
  "Мидия": require('../../assets/fish/fish-67.png'),
  "Устрица": require('../../assets/fish/fish-68.png'),
  "Литорина": require('../../assets/fish/fish-69.png'),
  "Креветка": require('../../assets/fish/fish-70.png'),
  "Улитка": require('../../assets/fish/fish-71.png'),
  "Морская водоросль": require('../../assets/fish/fish-72.png'),
  "Зелёная водоросль": require('../../assets/fish/fish-73.png'),
  "Белая водоросль": require('../../assets/fish/fish-74.png'),
  "Морское желе": require('../../assets/fish/fish-75.png'),
  "Речное желе": require('../../assets/fish/fish-76.png'),
  "Пещерное желе": require('../../assets/fish/fish-77.png')
};

// Рыболовная база Stardew Valley 1.6. Цены — базовые, обычное качество.
// Рыболовный справочник загружается из data/fish.json.
const fish = fishData;

const fishRules = fishRulesData;
const cropRules = cropRulesData;
const showValue = value => {
    if (value === null || value === undefined || value === '') return 'Не указано в JSON';
    if (Array.isArray(value)) return value.length ? value.map(showValue).join(', ') : 'Нет ограничений / не указано';
    if (typeof value === 'boolean') return value ? 'Да' : 'Нет';
    if (typeof value === 'object') {
        if ('min' in value || 'max' in value) return `${value.min ?? '—'}–${value.max ?? '—'}`;
        return Object.entries(value).map(([k,v]) => `${k}: ${showValue(v)}`).join(' · ');
    }
    return String(value);
};
const cropSeasonOrder = ['Весна', 'Лето', 'Осень', 'Зима'];
const cropSeasonList = value => (Array.isArray(value) ? value : value ? [value] : [])
    .filter(Boolean)
    .sort((a, b) => cropSeasonOrder.indexOf(a) - cropSeasonOrder.indexOf(b));
const cropGrowingPlaceLines = crop => {
    const locations = crop.growingLocations || [];
    const farmSeasons = cropSeasonList(crop.farmSeasons ?? crop.seasons);
    const lines = [];
    if (locations.includes('farm') && farmSeasons.length) lines.push(`Ферма — ${farmSeasons.join(', ')}`);
    if (locations.includes('greenhouse')) lines.push('Теплица — круглый год');
    if (locations.includes('gingerIsland')) lines.push('Имбирный остров — круглый год');
    if (locations.includes('indoorPot')) lines.push('Горшок в помещении — круглый год');
    return lines;
};
const cropGrowingSummary = crop => cropGrowingPlaceLines(crop).join('\n') || 'Место выращивания не указано';
const cropLocationLabel = key => ({ farm: 'Ферма', greenhouse: 'Теплица', gingerIsland: 'Имбирный остров', indoorPot: 'Горшок в помещении' }[key] || key);
const fishTimeDisplay = value => {
    if (Array.isArray(value) && value.length >= 2) return `${value[0]}–${value[1]}`;
    return showValue(value);
};
const fishLevelDisplay = value => value === 0 ? 'Любой уровень' : value == null ? null : `Уровень ${value}+`;

const fishTypeLabel = f => ({
    regular: 'Обычная рыба',
    nightMarket: 'Ночной рынок',
    legendary: 'Легендарная рыба',
    legendaryExtended: 'Легендарная рыба II',
    crabPot: 'Крабовая ловушка',
    otherCatch: 'Особый улов',
    rod: 'Удочка', night: 'Ночной рынок', legend: 'Легендарная рыба',
    legend2: 'Легендарная рыба II', pot: 'Крабовая ловушка', other: 'Особый улов'
}[f.type] || f.category || 'Улов');
const fishSeasonText = f => showValue(f.seasons ?? f.season);
const fishLocationText = f => showValue(f.locations ?? f.place);
const fishTimeText = f => showValue(f.timeWindow ?? f.time);
const fishWeatherText = f => showValue(f.weatherCondition ?? f.weather);
const fishCatchMethodText = f => ({ fishingRod: 'Удочка', nightMarketSubmarine: 'Подводная лодка ночного рынка', crabPot: 'Крабовая ловушка' }[f.catchMethod] || showValue(f.catchMethod));
const isLegendaryFish = f => ['legendary','legendaryExtended','legend','legend2'].includes(f.type);
const isCrabPotFish = f => ['crabPot','pot'].includes(f.type);
const isNightMarketFish = f => ['nightMarket','night'].includes(f.type);
const isOtherCatch = f => ['otherCatch','other'].includes(f.type);
const fishSearchText = f => [f.name, fishLocationText(f), fishSeasonText(f), fishTypeLabel(f), fishWeatherText(f), ...(f.availabilityNotes || [])].join(' ').toLocaleLowerCase('ru');

const seasonOrder = ['Весна', 'Лето', 'Осень', 'Зима'];
function addDays(startSeason, startDay, amount, startYear = 1) {
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
const dateText = x => `${x.season}, ${x.day} день${x.year > 1 ? `, год ${x.year}` : ''}`;

export {
  bundlesData,
  fishImagesData,
  palette,
  seasonSprites,
  seasons,
  week,
  uiSprites,
  UIIcon,
  SeasonIcon,
  cropSpriteAssets,
  CropIcon,
  crops,
  cropDetails,
  fishSpriteAssets,
  fish,
  fishRules,
  cropRules,
  showValue,
  cropSeasonOrder,
  cropSeasonList,
  cropGrowingPlaceLines,
  cropGrowingSummary,
  cropLocationLabel,
  fishTimeDisplay,
  fishLevelDisplay,
  fishTypeLabel,
  fishSeasonText,
  fishLocationText,
  fishTimeText,
  fishWeatherText,
  fishCatchMethodText,
  isLegendaryFish,
  isCrabPotFish,
  isNightMarketFish,
  isOtherCatch,
  fishSearchText,
  seasonOrder,
  addDays,
  dateText
};

