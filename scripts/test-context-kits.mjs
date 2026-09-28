import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import test from 'node:test';

const app = await readFile(new URL('../dist/app.js', import.meta.url), 'utf8');
const studio = await readFile(new URL('../dist/studio/index.html', import.meta.url), 'utf8');
const inspiration = await readFile(new URL('../dist/inspiration/index.html', import.meta.url), 'utf8');
const styles = await readFile(new URL('../dist/context-kits.css', import.meta.url), 'utf8');
const studioStyles = await readFile(new URL('../dist/studio-editor.css', import.meta.url), 'utf8');
const store = await readFile(new URL('../dist/project-store.js', import.meta.url), 'utf8');

test('Studio groups live applications as Products, Screens, and Campaigns', () => {
  const contexts = [...studio.matchAll(/data-context="([^"]+)"/g)].map(match => match[1]);
  assert.deepEqual(contexts, ['landing', 'interface', 'social', 'presentation']);
  for (const label of ['Products', 'Screens', 'Campaigns']) assert.match(studio, new RegExp(`>${label}<`));
  // The visible label changed; the saved context key did not.
  assert.match(studio, /data-context="landing">Products<\/button>/);
  assert.doesNotMatch(studio, />Objects</);
  assert.match(studio, /<option value="brand">Products<\/option>/);
  assert.match(studio, /data-context="presentation" hidden>Report \(legacy\)<\/button>/);
  assert.match(app, /interface: reportPreview\(\),/);
  assert.match(app, /import \{ reportPreview \} from '\.\/report-preview\.js\?v=\d+'/);
  assert.match(app, /landing: productPreview/);
  assert.match(app, /social:\s*`<div class="mockup context-kit campaign-kit">/);
});

test('Product preview offers directions without retired images', () => {
  for (const kind of ['footwear', 'skincare', 'object']) assert.match(studio, new RegExp(`data-product-kind="${kind}"`));
  assert.match(app, /product-preview-kit/);
  assert.match(app, /Reference image pending/);
  assert.doesNotMatch(app, /\/assets\/(?:editions|palette-library)\//);
});

test('Skincare preview maps palette roles to separate product surfaces', () => {
  for (const part of ['backdrop', 'bottle', 'cap', 'label']) assert.match(app, new RegExp(`careAssignment\\.${part}`));
  assert.match(app, /care-bottle-cap/);
  assert.match(app, /care-bottle-body/);
  assert.match(styles, /\.care-stage\{/);
  assert.match(styles, /\.care-bottle-cap\{/);
  assert.match(styles, /\.care-bottle-body\{/);
});

test('older report projects keep their original preview', () => {
  assert.match(app, /presentation:\s*`<div class="mockup context-kit report-kit">/);
  assert.match(app, /legacyReport\.hidden = context !== 'presentation'/);
  assert.match(store, /slides: 'presentation'/);
});

test('Palette rows open an in-card shade curtain', () => {
  assert.match(app, /role-shade-overlay/);
  assert.match(app, /data-inline-role-shade/);
  assert.match(app, /role="option" data-inline-role-shade/);
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
  assert.match(app, /edition-footwear-image visual-pending/);
  assert.match(app, /edition-footwear-kit/);
  assert.match(styles, /\.edition-footwear-scene/);
});

test('Inspiration presents the footwear Edition as a compact palette-first study', () => {
  assert.match(inspiration, /Image awaiting curation/);
  assert.match(inspiration, /class="study-card"><div class="study-palette" aria-label="Field 01 palette"/);
  assert.match(inspiration, /href="\/editions\/drift-field-01\/"/);
  assert.match(inspiration, /href="\/studio\/\?p=drift-field-01#studio"/);
  assert.doesNotMatch(inspiration, /<img|capsule-colorway/);
});

test('Inspiration presents RoomKit as an in-house experiment with a Lab path', () => {
  assert.match(inspiration, /Image awaiting curation/);
  assert.match(inspiration, /class="study-palette" aria-label="RoomKit example direction"/);
  assert.match(inspiration, /Try RoomKit in the Lab/);
  assert.match(inspiration, /private upload/);
});

test('Focused Studio contexts map cleanly into project snapshots', () => {
  assert.match(app, /context,\n    productKind/);
  assert.match(store, /interface: 'website'/);
  assert.match(store, /brand: 'landing'/);
  assert.match(store, /productKind: version\.editor_state\?\.productKind \|\| 'skincare'/);
  assert.match(store, /p_editor_state: \{ context: snapshot\.context, productKind: snapshot\.productKind, careAssignment: snapshot\.careAssignment, colorwayBaseline: snapshot\.colorwayBaseline \}/);
});

test('Studio exposes private reusable template actions', () => {
  assert.match(studio, /projectTemplateForm/);
  assert.match(studio, /Save as template/);
  assert.match(studio, /templateList/);
  assert.match(store, /save_template_snapshot/);
  assert.match(store, /template_use/);
  assert.match(store, /rename_template/);
  assert.match(store, /delete_template/);
  assert.match(store, /colorverse:trayerror/);
  assert.match(store, /archive_project/);
  assert.match(store, /restore_project/);
});
