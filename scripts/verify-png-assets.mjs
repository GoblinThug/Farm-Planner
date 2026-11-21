import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const root = path.join(path.dirname(fileURLToPath(import.meta.url)), '..');
const assetsRoot = path.join(root, 'assets');

function walk(dir, out = []) {
  for (const ent of fs.readdirSync(dir, { withFileTypes: true })) {
    const abs = path.join(dir, ent.name);
    if (ent.isDirectory()) walk(abs, out);
    else if (ent.name.toLowerCase().endsWith('.png')) out.push(abs);
  }
  return out;
}

function isPng(buf) {
  return buf.length >= 8 && buf[0] === 0x89 && buf[1] === 0x50 && buf[2] === 0x4e && buf[3] === 0x47;
}

function isWebp(buf) {
  return buf.length >= 12 && buf.slice(0, 4).toString() === 'RIFF' && buf.slice(8, 12).toString() === 'WEBP';
}

const bad = [];
for (const abs of walk(assetsRoot)) {
  const buf = fs.readFileSync(abs);
  if (isWebp(buf)) {
    bad.push(path.relative(root, abs).replace(/\\/g, '/') + ' (WebP bytes with .png extension)');
  } else if (!isPng(buf)) {
    bad.push(path.relative(root, abs).replace(/\\/g, '/') + ' (not a valid PNG)');
  }
}

if (bad.length) {
  console.error('PNG asset check failed:', bad.length);
  for (const line of bad) console.error(' -', line);
  console.error('Rename WebP icons to .webp or convert to PNG before Android release builds.');
  process.exit(1);
}

console.log('OK — all .png assets under assets/ are valid PNGs');