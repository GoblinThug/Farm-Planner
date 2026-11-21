import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const root = path.join(path.dirname(fileURLToPath(import.meta.url)), '..');
const gifts = JSON.parse(fs.readFileSync(path.join(root, 'data/villager-gifts.json'), 'utf8'));
const urlMap = JSON.parse(fs.readFileSync(path.join(root, 'data/villager-portrait-urls.json'), 'utf8')).byId;
const outDir = path.join(root, 'assets/villagers');
const manifest = {};

const ruPageById = {
  krobus: 'Кробус',
  lewis: 'Льюис',
  jas: 'Джас',
  kent: 'Кент',
  linus: 'Линус',
  gus: 'Гас',
  vincent: 'Винсент',
  haley: 'Хэйли',
  pam: 'Пэм',
  demetrius: 'Деметриус',
  shane: 'Шейн',
  robin: 'Робин',
  leah: 'Леа',
  emily: 'Эмили',
  pierre: 'Пьер',
  caroline: 'Кэролайн',
  maru: 'Мару',
  alex: 'Алекс',
  sam: 'Сэм',
  willy: 'Вилли',
  leo: 'Лео',
  penny: 'Пенни',
  elliott: 'Эллиот',
  jodi: 'Джоди',
  abigail: 'Абигейл',
  sandy: 'Сэнди',
  marnie: 'Марни',
  george: 'Джордж',
  sebastian: 'Себастьян',
  clint: 'Клинт',
  harvey: 'Харви',
  wizard: 'Волшебник',
  evelyn: 'Эвелин',
};

const UA = 'StardewFarmPlanner/2.0 (portrait fetch)';

fs.mkdirSync(outDir, { recursive: true });

async function imageFromRuWiki(ruTitle) {
  const pageUrl = `https://ru.stardewvalleywiki.com/${encodeURIComponent(ruTitle)}`;
  const res = await fetch(pageUrl, { headers: { 'User-Agent': UA, Accept: 'text/html' } });
  if (!res.ok) throw new Error(`Page ${res.status} for ${ruTitle}`);
  const html = await res.text();
  const m = html.match(/og:image"\s+content="([^"]+)"/i) || html.match(/class="infobox"[^>]*>[\s\S]*?src="([^"]+\.png)"/i);
  return m?.[1]?.replace(/&amp;/g, '&');
}

async function downloadToFile(url, dest) {
  const res = await fetch(url, { headers: { 'User-Agent': UA } });
  if (!res.ok) throw new Error(`Image ${res.status}`);
  const buf = Buffer.from(await res.arrayBuffer());
  fs.writeFileSync(dest, buf);
}

async function fetchPortrait(id) {
  let url = urlMap[id];
  if (!url) {
    const ruTitle = ruPageById[id];
    if (ruTitle) url = await imageFromRuWiki(ruTitle);
  }
  if (!url) throw new Error(`No portrait URL for ${id}`);

  const rel = `assets/villagers/${id}.png`;
  const dest = path.join(root, rel);
  await downloadToFile(url, dest);
  manifest[id] = rel;
  console.log('OK', id);
}

const ids = new Set(Object.values(gifts.byName).map(v => v.id));

for (const id of ids) {
  try {
    await fetchPortrait(id);
    await new Promise(r => setTimeout(r, 200));
  } catch (e) {
    console.warn('Fail', id, e.message);
  }
}

fs.writeFileSync(path.join(root, 'data/villager-portraits.json'), `${JSON.stringify(manifest, null, 2)}\n`);
console.log('Wrote data/villager-portraits.json', Object.keys(manifest).length, 'portraits');