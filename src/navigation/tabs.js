import { bundleNavIcon } from '../data/appData';

/** @typedef {{ id: string, label: string, icon: string, navIcon?: import('react-native').ImageSourcePropType }} TabDef */

/** @type {TabDef[]} */
export const APP_TABS = [
  { id: 'calendar', label: 'Календарь', icon: 'calendar' },
  { id: 'crops', label: 'Культуры', icon: 'crops' },
  { id: 'animals', label: 'Животные', icon: 'animals' },
  {
    id: 'villagers',
    label: 'Персонажи',
    icon: 'calendar',
    navIcon: require('../../assets/villagers/lewis.png'),
  },
  { id: 'fish', label: 'Рыбалка', icon: 'fish' },
  { id: 'bundles', label: 'Узелки', icon: 'bundles', navIcon: bundleNavIcon },
];

export const LEFT_TAB_IDS = ['calendar', 'crops'];
export const RIGHT_TAB_IDS = ['fish', 'bundles'];

export function tabById(id) {
  return APP_TABS.find(t => t.id === id);
}