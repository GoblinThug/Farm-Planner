import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const root = path.join(path.dirname(fileURLToPath(import.meta.url)), '..');
const dir = process.argv[2] || path.join(root, 'tmp/portrait-b64');
const manifestPath = path.join(root, 'data/villager-portraits.json');
const manifest = fs.existsSync(manifestPath)
  ? JSON.parse(fs.readFileSync(manifestPath, 'utf8'))
  : {};

for (const name of fs.readdirSync(dir)) {
  if (!name.endsWith('.txt')) continue;
  const id = name.replace(/\.txt$/, '');
  const b64 = fs.readFileSync(path.join(dir, name), 'utf8').trim();
  const rel = `assets/villagers/${id}.png`;
  fs.writeFileSync(path.join(root, rel), Buffer.from(b64, 'base64'));
  manifest[id] = rel;
  console.log('saved', id);
}

fs.writeFileSync(manifestPath, `${JSON.stringify(manifest, null, 2)}\n`);
console.log('total', Object.keys(manifest).length);