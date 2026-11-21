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
const fandomTitles = JSON.parse(
  fs.readFileSync(path.join(root, 'data/gift-fandom-titles.json'), 'utf8')
);

const wikiTitle = (display) => fandomTitles[display] || display.replace(/[«»]/g, '').trim();

const titles = missing.map((d) => ({ display: d, wiki: wikiTitle(d) }));

const fn = `(async () => {
  const items = ${JSON.stringify(titles)};
  const WIKI = 'https://stardewvalley.fandom.com/ru';
  const API = WIKI + '/api.php';

  function iconFor(html, title) {
    const plain = title.replace(/[«»]/g, '').trim();
    for (const m of html.matchAll(/(https:\\/\\/static\\.wikia\\.nocookie\\.net\\/stardewvalley\\/images\\/[^"'\\s]+\\.png\\/revision\\/latest[^"'\\s]*)/g)) {
      let u = m[1].replace(/&amp;/g, '&');
      if (u.includes('scale-to-width-down') || u.includes('Site-logo')) continue;
      try {
        const dec = decodeURIComponent(u);
        for (const t of [title, plain, plain.replace(/ /g, '_')]) {
          if (dec.includes(t + '.png')) return u;
        }
      } catch (_) {}
    }
    return null;
  }

  async function pageId(title) {
    const j = await (await fetch(API + '?action=query&titles=' + encodeURIComponent(title) + '&format=json&origin=*')).json();
    const p = Object.values(j.query?.pages || {})[0];
    return p?.pageid;
  }

  const out = {};
  for (const { display, wiki } of items) {
    try {
      const html = await (await fetch(WIKI + '/wiki/' + encodeURIComponent(wiki))).text();
      const iconUrl = iconFor(html, wiki);
      if (!iconUrl) {
        out[display] = { error: 'no-icon', wiki };
        continue;
      }
      const pid = await pageId(wiki);
      out[display] = {
        file: 'assets/items/gifts/gift-' + (pid || 'x') + '.png',
        iconUrl,
        wiki,
      };
      await new Promise((r) => setTimeout(r, 80));
    } catch (e) {
      out[display] = { error: String(e), wiki };
    }
  }
  return out;
})()`;

console.log('Open https://stardewvalley.fandom.com/ru/wiki/Пиво then paste in DevTools console, then JSON.stringify(await <paste>)');
console.log('---');
console.log(fn);