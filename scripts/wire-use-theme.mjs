import fs from 'fs';

const files = [
  'src/components/BottomNav.jsx',
  'src/components/NavMenuModal.jsx',
  'src/components/ProfileMenuModal.jsx',
  'src/screens/CalendarScreen.jsx',
  'src/screens/CropsScreen.jsx',
  'src/screens/FishScreen.jsx',
  'src/screens/AnimalsScreen.jsx',
  'src/screens/BundlesScreen.jsx',
  'src/screens/GameEventsScreen.jsx',
];

for (const file of files) {
  let s = fs.readFileSync(file, 'utf8');
  const hadSt = /import\s*\{[^}]*\bst\b[^}]*\}\s*from\s*['\"][^'\"]*styles\/styles['\"]/.test(s);
  const hadSeason = /seasonThemes/.test(s) && /styles\/styles/.test(s);

  // Remove styles import
  s = s.replace(/import\s*\{([^}]*)\}\s*from\s*['\"][^'\"]*styles\/styles['\"];\r?\n/, (full, names) => {
    const cleaned = names
      .split(',')
      .map(x => x.trim())
      .filter(x => x && x !== 'st' && x !== 'seasonThemes');
    if (!cleaned.length) return '';
    return `import { ${cleaned.join(', ')} } from '../styles/styles';\n`;
  });

  // Remove palette from appData import if present — we'll take from useTheme
  // Keep other appData imports
  let needsPaletteFromTheme = /\bpalette\b/.test(s);

  if (!/useTheme/.test(s)) {
    const themeImport = "import { useTheme } from '../context/ThemeContext';\n";
    // insert after react import block
    if (/from 'react';\r?\n/.test(s)) {
      s = s.replace(/from 'react';\r?\n/, m => m + themeImport);
    } else if (/from \"react\";\r?\n/.test(s)) {
      s = s.replace(/from \"react\";\r?\n/, m => m + themeImport);
    } else {
      s = themeImport + s;
    }
  }

  // Inject hook at start of exported function components — file-specific patterns
  const inject = (fnPattern, extraDestructure = '') => {
    const re = new RegExp(`(export function ${fnPattern}\\([^)]*\\)\\s*\\{\\r?\\n)`);
    if (!re.test(s)) return false;
    if (s.includes('const { st') || s.includes('const {st')) return true;
    const parts = ['st'];
    if (needsPaletteFromTheme) parts.push('palette');
    if (hadSeason || /seasonThemes/.test(s)) parts.push('seasonThemes');
    if (extraDestructure) parts.push(extraDestructure);
    const uniq = [...new Set(parts)];
    s = s.replace(re, `$1  const { ${uniq.join(', ')} } = useTheme();\n`);
    return true;
  };

  if (file.includes('BottomNav')) inject('BottomNav|NavTab');
  if (file.includes('NavMenuModal')) inject('NavMenuModal');
  if (file.includes('ProfileMenuModal')) {
    // MenuRow also needs st
    if (!/function MenuRow[\s\S]*useTheme/.test(s)) {
      s = s.replace(
        /(function MenuRow\([^)]*\) \{\r?\n)/,
        `$1  const { st } = useTheme();\n`
      );
    }
    inject('ProfileMenuModal');
  }
  if (file.includes('CalendarScreen')) inject('CalendarScreen');
  if (file.includes('CropsScreen')) inject('CropsScreen');
  if (file.includes('FishScreen')) inject('FishScreen');
  if (file.includes('AnimalsScreen')) inject('AnimalsScreen');
  if (file.includes('BundlesScreen')) inject('BundlesScreen');
  if (file.includes('GameEventsScreen')) inject('GameEventsScreen');

  // BottomNav: NavTab is separate
  if (file.includes('BottomNav') && /function NavTab/.test(s) && !/function NavTab[\s\S]{0,80}useTheme/.test(s)) {
    s = s.replace(/(function NavTab\([^)]*\) \{\r?\n)/, `$1  const { st } = useTheme();\n`);
    if (!/export function BottomNav[\s\S]{0,80}useTheme/.test(s)) {
      s = s.replace(/(export function BottomNav\([^)]*\) \{\r?\n)/, `$1  const { st, palette } = useTheme();\n`);
    }
  }

  fs.writeFileSync(file, s);
  console.log('updated', file, { hadSt, hadSeason });
}
