import { CalendarScreen } from './CalendarScreen';
import { CropsScreen } from './CropsScreen';
import { FishScreen } from './FishScreen';
import { BundlesScreen } from './BundlesScreen';
import { AnimalsScreen } from './AnimalsScreen';
import { GameEventsScreen } from './GameEventsScreen';

export const SCREENS_BY_TAB_ID = {
  calendar: CalendarScreen,
  crops: CropsScreen,
  animals: AnimalsScreen,
  fish: FishScreen,
  bundles: BundlesScreen,
  'game-events': GameEventsScreen,
};