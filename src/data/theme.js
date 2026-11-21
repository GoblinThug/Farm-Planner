/** Warm Stardew palettes — light day / dark night */

export const lightPalette = {
  mode: 'light',
  ink: '#3f3226',
  brown: '#6f5338',
  wood: '#8f6842',
  woodDark: '#5a412e',
  paper: '#f2e6cc',
  paperLight: '#fbf3df',
  paperSoft: '#ebe0c4',
  chip: '#efe3c6',
  line: '#d2b896',
  lineSoft: 'rgba(90, 65, 46, 0.12)',
  green: '#6f8f55',
  greenDark: '#4d6740',
  greenSoft: '#e7eedc',
  muted: '#8a7660',
  gold: '#d9b05a',
  cream: '#fff8ea',
  accent: '#9cb86a',
  danger: '#8b4938',
  dangerSoft: '#f8e5d9',
  backdrop: 'rgba(35,25,15,0.55)',
  statusBar: 'dark',
};

export const darkPalette = {
  mode: 'dark',
  ink: '#f3ead8',
  brown: '#d2b896',
  wood: '#a57a4c',
  woodDark: '#16120e',
  paper: '#17140f',
  paperLight: '#221e18',
  paperSoft: '#2b261f',
  chip: '#343028',
  line: '#4d4336',
  lineSoft: 'rgba(243, 234, 216, 0.12)',
  green: '#7d9f62',
  greenDark: '#a3c47a',
  greenSoft: '#2a3324',
  muted: '#b0a08a',
  gold: '#e0bc6a',
  cream: '#fff8ea',
  accent: '#9cb86a',
  danger: '#c46a55',
  dangerSoft: '#3a2420',
  backdrop: 'rgba(8,6,4,0.72)',
  statusBar: 'light',
};

/** @deprecated Prefer useTheme().palette — kept for non-React modules */
export const palette = lightPalette;

export const seasons = [{ name: 'Весна' }, { name: 'Лето' }, { name: 'Осень' }, { name: 'Зима' }];
export const week = ['Пн', 'Вт', 'Ср', 'Чт', 'Пт', 'Сб', 'Вс'];
export const seasonOrder = ['Весна', 'Лето', 'Осень', 'Зима'];
export const cropSeasonOrder = seasonOrder;

export function paletteForMode(mode) {
  return mode === 'dark' ? darkPalette : lightPalette;
}
