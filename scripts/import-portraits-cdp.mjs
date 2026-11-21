import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const root = path.join(path.dirname(fileURLToPath(import.meta.url)), '..');
const outDir = path.join(root, 'assets/villagers');
const manifestPath = path.join(root, 'data/villager-portraits.json');

const manifest = fs.existsSync(manifestPath)
  ? JSON.parse(fs.readFileSync(manifestPath, 'utf8'))
  : {};

fs.mkdirSync(outDir, { recursive: true });

for (const file of process.argv.slice(2)) {
  const data = JSON.parse(fs.readFileSync(file, 'utf8'));
  let batch = data.result?.value ?? data;
  if (typeof batch === 'string') batch = JSON.parse(batch);
  for (const [id, b64] of Object.entries(batch)) {
    const rel = `assets/villagers/${id}.png`;
    fs.writeFileSync(path.join(root, rel), Buffer.from(b64, 'base64'));
    manifest[id] = rel;
    console.log('saved', id, 'from', path.basename(file));
  }
}

fs.writeFileSync(manifestPath, `${JSON.stringify(manifest, null, 2)}\n`);
console.log('total portraits:', Object.keys(manifest).length);