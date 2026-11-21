import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const root = path.join(path.dirname(fileURLToPath(import.meta.url)), '..');
const outDir = path.join(root, 'assets/items');
const manifestPath = path.join(root, 'data/gift-item-icons.json');

const manifest = fs.existsSync(manifestPath)
  ? JSON.parse(fs.readFileSync(manifestPath, 'utf8'))
  : {};

fs.mkdirSync(outDir, { recursive: true });

for (const file of process.argv.slice(2)) {
  const data = JSON.parse(fs.readFileSync(file, 'utf8'));
  let batch = data.result?.value ?? data;
  if (typeof batch === 'string') batch = JSON.parse(batch);
  for (const [ruName, entry] of Object.entries(batch)) {
    if (!entry?.b64 || !entry?.file) continue;
    const rel = entry.file.startsWith('assets/') ? entry.file : `assets/items/wiki/${entry.file}`;
    const abs = path.join(root, rel);
    fs.mkdirSync(path.dirname(abs), { recursive: true });
    fs.writeFileSync(abs, Buffer.from(entry.b64, 'base64'));
    manifest[ruName] = rel;
    console.log('saved', ruName, '->', rel);
  }
}

fs.writeFileSync(manifestPath, `${JSON.stringify(manifest, null, 2)}\n`);
console.log('gift-item-icons:', Object.keys(manifest).length);