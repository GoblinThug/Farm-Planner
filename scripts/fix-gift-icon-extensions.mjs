import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const root = path.join(path.dirname(fileURLToPath(import.meta.url)), '..');
const giftsDir = path.join(root, 'assets/items/gifts');

function isWebp(buf) {
  return buf.length >= 12 && buf.slice(0, 4).toString() === 'RIFF' && buf.slice(8, 12).toString() === 'WEBP';
}

function isPng(buf) {
  return buf.length >= 8 && buf[0] === 0x89 && buf[1] === 0x50;
}

function patchJsonFile(relPath, patch) {
  const abs = path.join(root, relPath);
  if (!fs.existsSync(abs)) return;
  const text = fs.readFileSync(abs, 'utf8');
  const next = patch(text);
  if (next !== text) {
    fs.writeFileSync(abs, next);
    console.log('updated', relPath);
  }
}

let renamed = 0;
for (const name of fs.readdirSync(giftsDir)) {
  if (!name.endsWith('.png')) continue;
  const abs = path.join(giftsDir, name);
  const buf = fs.readFileSync(abs);
  if (!isWebp(buf)) {
    if (!isPng(buf)) console.warn('unknown format:', name);
    continue;
  }
  const webpName = name.replace(/\.png$/i, '.webp');
  fs.renameSync(abs, path.join(giftsDir, webpName));
  renamed += 1;
}
console.log('renamed', renamed, 'gift icons to .webp');

const giftPathRe = /assets\/items\/gifts\/gift-(\d+)\.png/g;
const replaceGiftPaths = (text) => text.replace(giftPathRe, 'assets/items/gifts/gift-$1.webp');

for (const rel of [
  'data/gift-item-icons.json',
  'data/gift-fandom-urls.json',
  'data/gift-fandom-urls.jsonl',
  'data/bundle-item-icons.json',
]) {
  patchJsonFile(rel, replaceGiftPaths);
}