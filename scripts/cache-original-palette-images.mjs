import { mkdir, writeFile } from 'node:fs/promises';
import { fileURLToPath } from 'node:url';
import { palettes } from '../dist/palettes.js';

const targetDirectory = new URL('../dist/assets/palette-library/original/', import.meta.url);
const remote = palettes.filter(palette => /^https:\/\/images\.unsplash\.com\//.test(palette.source));

await mkdir(targetDirectory, { recursive: true });

for (const palette of remote) {
  const imageUrl = `${palette.source}?auto=format&fit=crop&w=900&q=80`;
  const response = await fetch(imageUrl, { headers: { 'user-agent': 'ColorVerse asset cache/1.0' } });
  if (!response.ok) throw new Error(`${palette.id}: HTTP ${response.status}`);
  const contentType = response.headers.get('content-type') || '';
  if (!/^image\/(?:jpeg|webp)/.test(contentType)) throw new Error(`${palette.id}: unexpected ${contentType}`);
  const bytes = Buffer.from(await response.arrayBuffer());
  if (bytes.length < 8_000 || bytes.length > 8_000_000) throw new Error(`${palette.id}: unsafe size ${bytes.length}`);
  if (!(bytes[0] === 0xff && bytes[1] === 0xd8 && bytes[2] === 0xff)) throw new Error(`${palette.id}: not a JPEG`);
  await writeFile(new URL(`${palette.id}.jpg`, targetDirectory), bytes);
  console.log(`${palette.id} ${Math.round(bytes.length / 1024)} KB`);
}

console.log(`Cached ${remote.length} original palette images in ${fileURLToPath(targetDirectory)}.`);
