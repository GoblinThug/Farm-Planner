import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const root = path.join(path.dirname(fileURLToPath(import.meta.url)), '..');
const gifts = JSON.parse(fs.readFileSync(path.join(root, 'data/villager-gifts.json'), 'utf8'));
const icons = JSON.parse(fs.readFileSync(path.join(root, 'data/bundle-item-icons.json'), 'utf8'));
const crops = JSON.parse(fs.readFileSync(path.join(root, 'data/crop-images.json'), 'utf8'));
const fish = JSON.parse(fs.readFileSync(path.join(root, 'data/fish-images.json'), 'utf8'));
const ap = JSON.parse(fs.readFileSync(path.join(root, 'data/animal-product-images.json'), 'utf8'));
const giftItems = JSON.parse(fs.readFileSync(path.join(root, 'data/gift-item-icons.json'), 'utf8'));
const aliases = JSON.parse(fs.readFileSync(path.join(root, 'data/gift-icon-aliases.json'), 'utf8'));
const fandomTitles = fs.existsSync(path.join(root, 'data/gift-fandom-titles.json'))
  ? JSON.parse(fs.readFileSync(path.join(root, 'data/gift-fandom-titles.json'), 'utf8'))
  : {};

const merged = { ...icons };
for (const [n, v] of Object.entries(crops)) if (v?.file) merged[n] = v.file;
for (const [n, v] of Object.entries(fish)) if (v?.file) merged[n] = v.file;
for (const [n, v] of Object.entries(ap)) if (v?.file) merged[n] = v.file;
for (const [n, f] of Object.entries(giftItems)) merged[n] = f;
for (const [n, t] of Object.entries(aliases)) {
  if (typeof t === 'string' && t.startsWith('assets/')) merged[n] = t;
  else if (merged[t]) merged[n] = merged[t];
}

const loves = new Set();
for (const v of Object.values(gifts.byName || {})) {
  for (const x of v.loves || []) loves.add(x);
}
const missing = [...loves].filter((n) => !merged[n]).sort();
console.log(JSON.stringify(missing, null, 2));