import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const root = path.join(path.dirname(fileURLToPath(import.meta.url)), '..');
const [id, b64] = process.argv.slice(2);
if (!id || !b64) {
  console.error('Usage: node save-one-portrait.mjs <id> <base64>');
  process.exit(1);
}
const manifestPath = path.join(root, 'data/villager-portraits.json');
const manifest = fs.existsSync(manifestPath)
  ? JSON.parse(fs.readFileSync(manifestPath, 'utf8'))
  : {};
const rel = `assets/villagers/${id}.png`;
fs.mkdirSync(path.dirname(path.join(root, rel)), { recursive: true });
fs.writeFileSync(path.join(root, rel), Buffer.from(b64, 'base64'));
manifest[id] = rel;
fs.writeFileSync(manifestPath, `${JSON.stringify(manifest, null, 2)}\n`);
console.log('saved', id, Object.keys(manifest).length);