import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import test from 'node:test';
import { readCurrentColors } from '../dist/study-gallery.js';
const read = path => readFile(new URL(`../dist/${path}`, import.meta.url), 'utf8');
const [app, studio, extractCss, account, header, photoCss] = await Promise.all([read('app.js'), read('studio/index.html'), read('extract-workspace.css'), read('account/index.html'), read('header-controls.css'), read('photo-colorway.css')]);

test('photo renderer is reused across role edits and released on leaving its view', () => {
  assert.match(app, /if \(!host\) \{ destroyPhotoPreview\(\); return; \}/);
  assert.match(app, /if \(!photoPreview\) \{/);
  assert.match(app, /host\.append\(photoPreview\.element\)/);
  assert.match(app, /photoPreview\.update\(colorway\)/);
  assert.match(app, /photoPreview\.setBaseline\(baseline\)/);
  assert.match(app, /photoPreview\?\.destroy\(\)/);
  assert.match(studio, /photo-colorway\.css\?v=3/);
});
test('PNG exports visible photo canvases, including locked comparison, not the old vector', () => {
  assert.match(app, /photo-colorway-stage:not\(\[hidden\]\)/);
  assert.match(app, /context\.drawImage\(stage\.canvas, x, top\)/);
  assert.match(app, /canvas\.toBlob\(resolve, 'image\/png'\)/);
  assert.match(app, /PHOTO_COLORWAY_NOTE/);
  assert.match(app, /exportButton\.disabled = state !== 'ready'/);
  assert.match(app, /retry\.hidden = state !== 'error'/);
  assert.doesNotMatch(app, /downloadColorway/);
});
test('Library matching uses five explicit preview colors, not arbitrary first members', () => {
  const members = ['#111111','#222222','#333333','#444444','#555555','#666666','#777777','#888888'];
  const workspace = {v:1,members,roleIndex:[7,1,2,3,5]};
  const storage = value => ({getItem: () => JSON.stringify(value)});
  assert.deepEqual(readCurrentColors(storage({workspace})), ['#888888','#222222','#333333','#444444','#666666']);
  assert.deepEqual(readCurrentColors(storage({workspace:{...workspace,roleIndex:[0,0,1,2,3]}})), []);
  assert.deepEqual(readCurrentColors(storage({colors:members})), []);
  assert.deepEqual(readCurrentColors(storage({colors:members.slice(0,5)})), members.slice(0,5));
});
test('larger Extract lists switch to readable rows on narrow screens', () => {
  assert.match(extractCss, /@media\(max-width:700px\)\{\s*\.extract-page \.extracted-swatches:has\(>:nth-child\(6\)\)\{flex-direction:column;width:100%;min-width:0\}/);
  assert.match(extractCss, /min-height:48px/);
});
test('shared clients and account handoff are cache-busted and narrow headers use two columns', () => {
  assert.match(account, /\/account\.js\?v=9/);
  assert.match(studio, /\/app\.js\?v=99/);
  assert.match(header, /grid-template-columns:minmax\(0,1fr\) auto;column-gap:6px/);
});
test('photo size stays bounded and new colorways use Accent without replacing saved mappings', () => {
  assert.match(photoCss, /\.photo-preview-kit \.photo-colorway-stage\{width:100%;max-width:320px\}/);
  assert.match(app, /const careAssignment = \{ backdrop: 0, bottle: 2, cap: 4, label: 1, carton: 3 \}/);
  assert.match(app, /if \(current\.careAssignment\) for/);
  assert.match(app, /careAssignment\[part\] = value/);
  assert.match(photoCss, /\.photo-preview-kit\.is-comparing \.care-map\{grid-template-columns:repeat\(2,minmax\(0,1fr\)\)\}/);
});
test('project, palette and comparison actions have distinct visible labels', () => {
  assert.match(studio, /id="saveProject"[^>]*>Save project/);
  assert.match(studio, /id="savePersonalPalette"[^>]*>Save palette/);
  assert.match(app, /Keep for comparison/);
  assert.match(app, /Use comparison colors/);
  assert.doesNotMatch(studio, /Five preview roles update live/);
});
