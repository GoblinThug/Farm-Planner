import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { execFileSync } from 'node:child_process';

const root = path.join(path.dirname(fileURLToPath(import.meta.url)), '..');
const missing = JSON.parse(
  execFileSync(process.execPath, [path.join(root, 'scripts/list-missing-gift-icons.mjs')], {
    encoding: 'utf8',
  })
);

const chunk = Number(process.argv[2] || '0', 10);
const size = Number(process.argv[3] || '18', 10);
const slice = missing.slice(chunk * size, chunk * size + size);

const fn = `(async () => {
  const titles = ${JSON.stringify(slice)};
  const WIKI = 'https://stardewvalley.fandom.com/ru';
  const API = WIKI + '/api.php';

  function iconFor(html, title) {
    for (const m of html.matchAll(/(https:\\/\\/static\\.wikia\\.nocookie\\.net\\/stardewvalley\\/images\\/[^"'\\s]+\\.png\\/revision\\/latest[^"'\\s]*)/g)) {
      let u = m[1].replace(/&amp;/g, '&');
      if (u.includes('scale-to-width-down') || u.includes('Site-logo')) continue;
      try {
        const dec = decodeURIComponent(u);
        const t1 = title + '.png';
        const t2 = title.replace(/ /g, '_') + '.png';
        if (dec.includes(t1) || dec.includes(t2)) return u;
      } catch (_) {}
    }
    return null;
  }

  async function pageId(title) {
    const u = API + '?action=query&titles=' + encodeURIComponent(title) + '&format=json&origin=*';
    const j = await (await fetch(u)).json();
  const p = Object.values(j.query?.pages || {})[0];
  return p?.pageid;
  }

  const out = {};
  for (const title of titles) {
    try {
      const html = await (await fetch(WIKI + '/wiki/' + encodeURIComponent(title))).text();
      const iconUrl = iconFor(html, title);
      if (!iconUrl) {
        out[title] = { error: 'no-icon' };
        continue;
      }
      const pageid = await pageId(title);
      const buf = await (await fetch(iconUrl)).arrayBuffer();
      const bytes = new Uint8Array(buf);
      let bin = '';
      for (let i = 0; i < bytes.length; i += 0x8000) {
        bin += String.fromCharCode(...bytes.subarray(i, i + 0x8000));
      }
      const rel = 'assets/items/gifts/gift-' + (pageid || title.length) + '.webp';
      out[title] = { file: rel, b64: btoa(bin), bytes: bytes.length, iconUrl };
      await new Promise((r) => setTimeout(r, 120));
    } catch (e) {
      out[title] = { error: String(e) };
    }
  }
  return out;
})()`;

console.log(fn);