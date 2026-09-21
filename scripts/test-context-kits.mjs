import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import test from 'node:test';

const app = await readFile(new URL('../dist/app.js', import.meta.url), 'utf8');
const studio = await readFile(new URL('../dist/studio/index.html', import.meta.url), 'utf8');
const inspiration = await readFile(new URL('../dist/inspiration/index.html', import.meta.url), 'utf8');
const styles = await readFile(new URL('../dist/context-kits.css', import.meta.url), 'utf8');
const studioStyles = await readFile(new URL('../dist/studio-editor.css', import.meta.url), 'utf8');
const store = await readFile(new URL('../dist/project-store.js', import.meta.url), 'utf8');

test('Studio exposes focused Product, Interface, and Report contexts', () => {
  const contexts = [...studio.matchAll(/data-context="([^"]+)"/g)].map(match => match[1]);
  assert.deepEqual(contexts, ['landing', 'interface', 'presentation']);
  assert.match(studio, /Product/);
  assert.match(studio, /Interface/);
  assert.match(studio, /Report/);
  assert.match(app, /interface:\s*`<div class="mockup context-kit product-kit">/);
  assert.match(app, /landing: productPreview/);
});

test('Product preview offers real product directions', () => {
  for (const kind of ['footwear', 'skincare', 'object']) assert.match(studio, new RegExp(`data-product-kind="${kind}"`));
  assert.match(app, /product-preview-kit/);
  assert.match(app, /drift-field-01-colorways-v1\.png/);
  assert.match(app, /skincare-system-01-v1\.jpg/);
  assert.match(app, /ceramic-still-life\.jpg/);
});

test('Report puts KPI cards above its chart', () => {
  const report = app.match(/presentation:\s*`([\s\S]*?)`,\s*social:/)?.[1] || '';
  assert.ok(report.indexOf('report-numbers') < report.indexOf('report-lines'));
  assert.match(report, /trend-up/);
  assert.match(report, /trend-down/);
});

test('Palette rows open an in-card shade curtain', () => {
  assert.match(app, /role-shade-overlay/);
  assert.match(app, /data-inline-role-shade/);
  assert.match(studioStyles, /role-shade-in/);
  assert.match(studioStyles, /role-shade-out/);
  assert.doesNotMatch(studio, /shadeStudio|openShadeStudio|shade-studio\.css/);
  assert.doesNotMatch(app, /createShadeStudio|openShadeStudio/);
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
  assert.match(app, /DRIFT Field 01 footwear family/);
  assert.match(app, /edition-footwear-kit/);
  assert.match(styles, /\.edition-footwear-scene/);
});

test('Inspiration presents the footwear Edition as a three-colorway capsule', () => {
  assert.match(inspiration, /drift-field-01-colorways-v1\.png/);
  assert.match(inspiration, /One runner\.<br>Three directions\./);
  for (const name of ['Stone', 'Meadow', 'Graphite']) assert.match(inspiration, new RegExp(name));
});

test('Inspiration presents RoomKit as an in-house experiment with a Lab path', () => {
  assert.match(inspiration, /roomkit-living-spaces-v1\.png/);
  assert.match(inspiration, /A palette<br>you can live in\./);
  assert.match(inspiration, /Try RoomKit in the Lab/);
  assert.match(inspiration, /private upload/);
});

test('Focused Studio contexts map cleanly into project snapshots', () => {
  assert.match(app, /context,\n    productKind/);
  assert.match(store, /interface: 'website'/);
  assert.match(store, /brand: 'landing'/);
});
