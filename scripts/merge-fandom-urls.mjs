#!/usr/bin/env node
/** Merge pasted Fandom URL map into data/gift-fandom-urls.json */
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const root = path.join(path.dirname(fileURLToPath(import.meta.url)), '..');
const dest = path.join(root, 'data/gift-fandom-urls.json');
const base = fs.existsSync(dest) ? JSON.parse(fs.readFileSync(dest, 'utf8')) : {};

for (const file of process.argv.slice(2)) {
  Object.assign(base, JSON.parse(fs.readFileSync(file, 'utf8')));
}
fs.writeFileSync(dest, `${JSON.stringify(base, null, 2)}\n`);
console.log('Merged', Object.keys(base).length, 'entries →', dest);