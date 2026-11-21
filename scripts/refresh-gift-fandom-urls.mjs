#!/usr/bin/env node
/**
 * Обновить data/gift-fandom-urls.json из вкладки Fandom (после прохождения Cloudflare).
 * В консоли на https://stardewvalley.fandom.com/ru/wiki/Пиво :
 *   copy(JSON.stringify(await (async () => { ... })()))
 * Вставить содержимое в tmp/fandom-urls-paste.json, затем:
 *   node scripts/refresh-gift-fandom-urls.mjs tmp/fandom-urls-paste.json
 */
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const root = path.join(path.dirname(fileURLToPath(import.meta.url)), '..');
const src = process.argv[2];
if (!src) {
  console.error('Usage: node scripts/refresh-gift-fandom-urls.mjs <paste.json>');
  process.exit(1);
}
const data = JSON.parse(fs.readFileSync(src, 'utf8'));
const dest = path.join(root, 'data/gift-fandom-urls.json');
fs.writeFileSync(dest, `${JSON.stringify(data, null, 2)}\n`);
console.log('Wrote', dest, Object.keys(data).length, 'entries');