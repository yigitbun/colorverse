import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import test from 'node:test';

const app = await readFile(new URL('../dist/app.js', import.meta.url), 'utf8');
const studio = await readFile(new URL('../dist/studio/index.html', import.meta.url), 'utf8');
const styles = await readFile(new URL('../dist/context-kits.css', import.meta.url), 'utf8');
const store = await readFile(new URL('../dist/project-store.js', import.meta.url), 'utf8');

test('Studio exposes five applied contexts including the material study', () => {
  const contexts = [...studio.matchAll(/data-context="([^"]+)"/g)].map(match => match[1]);
  assert.deepEqual(contexts, ['landing', 'presentation', 'social', 'shop', 'material']);
  assert.match(app, /material:\s*`<div class="mockup context-kit material-kit">/);
});

test('the material study compares one selected role across five named surfaces', () => {
  for (const name of ['Mineral paint', 'Woven textile', 'Uncoated paper', 'Matte polymer', 'Brushed metal']) {
    assert.match(app, new RegExp(name));
  }
  assert.match(app, /current\.colors\[activeColorIndex\]/);
  assert.match(app, /Visual comparison only\.<\/b> Check physical samples before production\./);
  assert.match(styles, /\.material-plaster/);
  assert.match(styles, /\.material-textile/);
  assert.match(styles, /\.material-paper/);
  assert.match(styles, /\.material-polymer/);
  assert.match(styles, /\.material-metal/);
});

test('the first Edition keeps its packaging identity inside Studio', () => {
  assert.match(app, /current\.id === 'skincare-system-01'/);
  assert.match(app, /Soft Structure palette applied to five care objects/);
  assert.match(app, /<strong>Cleanse<\/strong>/);
  assert.match(app, /<strong>Night<\/strong>/);
  assert.match(styles, /\.edition-pack-scene/);
  assert.match(styles, /\.edition-tube-5/);
});

test('the footwear Edition keeps its independent brand identity inside Studio', () => {
  assert.match(app, /id: 'drift-field-01'/);
  assert.match(app, /name: 'Field 01'/);
  assert.match(app, /brand: 'DRIFT'/);
  assert.match(app, /current\.id === 'drift-field-01'/);
  assert.match(app, /DRIFT Field 01 footwear study/);
  assert.match(app, /edition-footwear-kit/);
  assert.match(styles, /\.edition-footwear-scene/);
});

test('material context survives project snapshots without widening database input', () => {
  assert.match(app, /'shop', 'material'/);
  assert.match(store, /material: 'brand'/);
});
