import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { execFileSync } from 'node:child_process';

const root = path.join(path.dirname(fileURLToPath(import.meta.url)), '..');
const urlsPath = path.join(root, 'data/gift-fandom-urls.json');
const urlsLinesPath = path.join(root, 'data/gift-fandom-urls.jsonl');
const giftIconsPath = path.join(root, 'data/gift-item-icons.json');

if (!fs.existsSync(urlsPath) && !fs.existsSync(urlsLinesPath)) {
  console.error(
    'Missing data/gift-fandom-urls.json or .jsonl — open Fandom in browser and run scripts/build-fandom-urls-snippet.mjs'
  );
  process.exit(1);
}

const urls = fs.existsSync(urlsPath)
  ? JSON.parse(fs.readFileSync(urlsPath, 'utf8'))
  : Object.fromEntries(
      fs
        .readFileSync(urlsLinesPath, 'utf8')
        .split(/\r?\n/)
        .filter(Boolean)
        .map((line) => {
          const row = JSON.parse(line);
          return [row.display ?? row.name, row];
        })
    );
const manifest = fs.existsSync(giftIconsPath)
  ? JSON.parse(fs.readFileSync(giftIconsPath, 'utf8'))
  : {};

const outDir = path.join(root, 'assets/items/gifts');
fs.mkdirSync(outDir, { recursive: true });

function download(url, dest) {
  execFileSync(
    'curl.exe',
    ['-sL', url.replace(/&amp;/g, '&'), '-o', dest],
    { stdio: 'pipe' }
  );
  const stat = fs.statSync(dest);
  if (stat.size < 80) {
    fs.unlinkSync(dest);
    throw new Error(`too small (${stat.size} b)`);
  }
}

let ok = 0;
let fail = 0;

for (const [displayName, entry] of Object.entries(urls)) {
  if (!entry?.iconUrl || !entry?.file) {
    console.warn('skip', displayName, entry?.error || 'no url');
    fail += 1;
    continue;
  }
  const abs = path.join(root, entry.file);
  fs.mkdirSync(path.dirname(abs), { recursive: true });
  try {
    download(entry.iconUrl, abs);
    manifest[displayName] = entry.file;
    ok += 1;
    console.log('ok', displayName, '->', entry.file);
  } catch (e) {
    fail += 1;
    console.warn('fail', displayName, e.message);
  }
}

fs.writeFileSync(giftIconsPath, `${JSON.stringify(manifest, null, 2)}\n`);
console.log('done:', ok, 'ok,', fail, 'fail, manifest keys:', Object.keys(manifest).length);