import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const root = path.join(path.dirname(fileURLToPath(import.meta.url)), '..');
const reg = fs.readFileSync(path.join(root, 'src/assets/assetRegistry.js'), 'utf8');
const re = /require\("\.\.\/\.\.\/(assets\/[^"]+)"\)/g;
const missing = [];
let m;
while ((m = re.exec(reg)) !== null) {
  const rel = m[1].replace(/\//g, path.sep);
  if (!fs.existsSync(path.join(root, rel))) missing.push(m[1]);
}
if (missing.length) {
  console.error('Missing files:', missing.length);
  missing.forEach((p) => console.error(p));
  process.exit(1);
}
console.log('OK — all registry assets exist');