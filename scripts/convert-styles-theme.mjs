import fs from 'fs';

const path = 'src/styles/styles.js';
let s = fs.readFileSync(path, 'utf8');

s = s.replace(
  "import { palette } from '../data/theme';",
  "import { lightPalette } from '../data/theme';"
);

s = s.replace('const seasonThemes =', 'export const seasonThemes =');

s = s.replace(
  `const surface = {
  card: palette.paperLight,
  muted: palette.paperSoft,
  chip: '#efe3c6',
  selected: palette.greenSoft,
};

const st = StyleSheet.create({`,
  `export function createStyles(palette) {
  const surface = {
    card: palette.paperLight,
    muted: palette.paperSoft,
    chip: palette.chip,
    selected: palette.greenSoft,
  };

  return StyleSheet.create({`
);

s = s.replace(
  `});

export { seasonThemes, st };
`,
  `});
}

export const st = createStyles(lightPalette);
`
);

// theme-aware backdrop / danger colors where hardcoded
s = s.replace(
  "backgroundColor: 'rgba(35,25,15,0.55)'",
  'backgroundColor: palette.backdrop'
);
s = s.replace(
  "backgroundColor: 'rgba(35,25,15,0.4)'",
  'backgroundColor: palette.backdrop'
);
s = s.replace(/backgroundColor: '#8b4938'/g, 'backgroundColor: palette.danger');
s = s.replace(/backgroundColor: '#f8e5d9'/g, 'backgroundColor: palette.dangerSoft');

fs.writeFileSync(path, s);
console.log('converted ok');
