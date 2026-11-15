import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const root = path.join(path.dirname(fileURLToPath(import.meta.url)), '..');
const CDN = 'https://cdn.jsdelivr.net/npm/stardew-valley-data@1.1.0/images';

const jobs = [
  [`${CDN}/animals/White%20Chicken.png`, 'assets/animals/chicken.png'],
  [`${CDN}/animals/Void%20Chicken.png`, 'assets/animals/void-chicken.png'],
  [`${CDN}/animals/Golden%20Chicken.png`, 'assets/animals/golden-chicken.png'],
  [`${CDN}/animals/Duck.png`, 'assets/animals/duck.png'],
  [`${CDN}/animals/Rabbit.png`, 'assets/animals/rabbit.png'],
  [`${CDN}/animals/Dinosaur.png`, 'assets/animals/dinosaur.png'],
  [`${CDN}/animals/White%20Cow.png`, 'assets/animals/cow.png'],
  [`${CDN}/animals/Goat.png`, 'assets/animals/goat.png'],
  [`${CDN}/animals/Sheep.png`, 'assets/animals/sheep.png'],
  [`${CDN}/animals/Pig.png`, 'assets/animals/pig.png'],
  [`${CDN}/animals/Ostrich.png`, 'assets/animals/ostrich.png'],
  [`${CDN}/monsters/Green%20Slime.png`, 'assets/animals/green-slime.png'],
  [`${CDN}/animals/produce/Void%20Egg.png`, 'assets/items/wiki/Void_Egg.png'],
  [`${CDN}/animals/produce/Golden%20Egg.png`, 'assets/items/wiki/Golden_Egg.png'],
  [`${CDN}/animals/produce/Dinosaur%20Egg.png`, 'assets/items/wiki/Dinosaur_Egg.png'],
  [`${CDN}/animals/produce/Goat%20Milk.png`, 'assets/items/wiki/Goat_Milk.png'],
  [`${CDN}/animals/produce/Ostrich%20Egg.png`, 'assets/items/wiki/Ostrich_Egg.png'],
];

for (const [url, destRel] of jobs) {
  const dest = path.join(root, destRel);
  fs.mkdirSync(path.dirname(dest), { recursive: true });
  const res = await fetch(url);
  if (!res.ok) throw new Error(`${url} => ${res.status}`);
  const buf = Buffer.from(await res.arrayBuffer());
  if (buf.slice(0, 4).toString('hex') !== '89504e47') throw new Error(`Not a PNG: ${destRel}`);
  fs.writeFileSync(dest, buf);
  console.log('OK', destRel, buf.length);
}