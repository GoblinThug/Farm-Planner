import { mapManifestToSprites, resolveAssetPath } from './assetRegistry';
import cropImagesData from '../../data/crop-images.json';
import fishImagesData from '../../data/fish-images.json';
import animalImagesData from '../../data/animal-images.json';
import animalProductImagesData from '../../data/animal-product-images.json';
import bundleImageManifest from '../../data/bundle-image-manifest.json';
import bundleItemIconsData from '../../data/bundle-item-icons.json';

export const cropSpriteAssets = mapManifestToSprites(cropImagesData);
export const fishSpriteAssets = mapManifestToSprites(fishImagesData);
export const animalSpriteAssets = mapManifestToSprites(animalImagesData);
export const animalProductSpriteAssets = mapManifestToSprites(animalProductImagesData);
export const bundleImageAssets = mapManifestToSprites(bundleImageManifest.bundleIcons);
export const bundleRoomImages = mapManifestToSprites(bundleImageManifest.roomIcons);
export const bundleItemIcons = mapManifestToSprites(bundleItemIconsData);
export const bundleNavIcon = resolveAssetPath('assets/ui/bundle.png');

export const uiSprites = {
  calendar: resolveAssetPath('assets/ui/calendar.png'),
  crops: resolveAssetPath('assets/ui/crops.png'),
  fish: resolveAssetPath('assets/ui/fish.png'),
  animals: resolveAssetPath('assets/ui/animals.png'),
  plus: resolveAssetPath('assets/ui/plus.png'),
  close: resolveAssetPath('assets/ui/close.png'),
};

export const seasonSprites = {
  Весна: resolveAssetPath('assets/crops/tulip.png'),
  Лето: resolveAssetPath('assets/crops/sunflower.png'),
  Осень: resolveAssetPath('assets/crops/pumpkin.png'),
  Зима: resolveAssetPath('assets/ui/winter.png'),
};