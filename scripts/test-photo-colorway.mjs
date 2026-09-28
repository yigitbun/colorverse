import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import test from 'node:test';
import { oklab } from '../dist/color.js';
import { aiStudies } from '../dist/ai-studies.js';
import {
  DEFAULT_PHOTO_ASSIGNMENT, PHOTO_COLORWAY_HEIGHT, PHOTO_COLORWAY_NOTE, PHOTO_COLORWAY_SOURCE, PHOTO_COLORWAY_WIDTH, PHOTO_REGIONS, PHOTO_SURFACES,
  mountPhotoColorway, oklabToRgb, preparePhotoModel, rasterizePolygon, renderPhotoColorway, renderPhotoMaskOverlay, rgbToOklab, samePhotoColorway, sanitizePhotoColorway, transferLab,
} from '../dist/photo-colorway.js';

const oat = aiStudies.find(study => study.id === 'concept-katre-body').colors;
const probe = ['#1F4E79', '#BBAE9B', '#938570', '#736951', '#2C2924'];
const image = (width, height, paint) => {
  const data = new Uint8ClampedArray(width * height * 4);
  for (let y = 0; y < height; y++) for (let x = 0; x < width; x++) { const p = (y * width + x) * 4; data.set([...paint(x, y), 255], p); }
  return { width, height, data };
};
const at = (pixels, width, x, y) => Array.from(pixels.slice((y * width + x) * 4, (y * width + x) * 4 + 3));
const hueOf = color => { const [, a, b] = oklab(color); return (Math.atan2(b, a) * 180 / Math.PI + 360) % 360; };
const toHex = values => '#' + values.map(value => value.toString(16).padStart(2, '0')).join('');

// Small scene: ivory tube with shading and a printed stroke, speckled dark cap, grey surroundings.
const sceneRegions = [
  { id: 'tube', surface: 'tube', tone: 'light', protectInk: true, points: [[10, 10], [40, 10], [40, 50], [10, 50]] },
  { id: 'cap', surface: 'cap', tone: 'dark', protectInk: false, points: [[50, 10], [70, 10], [70, 30], [50, 30]] },
];
const inside = (x, y, [[x0, y0], , [x1, y1]]) => x >= x0 && x < x1 && y >= y0 && y < y1;
const scene = () => image(80, 60, (x, y) => {
  if (inside(x, y, sceneRegions[0].points)) return (y === 28 || y === 29) && x >= 15 && x < 35 ? [35, 35, 40] : [205 + x, 200 + x, 190 + x];
  if (inside(x, y, sceneRegions[1].points)) return (x + y) % 5 === 0 ? [120, 118, 115] : [60, 58, 55];
  return [150, 145, 140];
});

test('snapshots are validated, normalized and frozen without mutating input', () => {
  const input = Object.freeze({ colors: Object.freeze(oat.map(color => color.toLowerCase())), assignment: Object.freeze({ tube: 0 }) });
  const clean = sanitizePhotoColorway(input);
  assert.deepEqual(clean.colors, oat);
  assert.deepEqual({ ...clean.assignment }, { ...DEFAULT_PHOTO_ASSIGNMENT, tube: 0 });
  assert(Object.isFrozen(clean) && Object.isFrozen(clean.colors) && Object.isFrozen(clean.assignment));
  assert.equal(input.colors[0], oat[0].toLowerCase());
  assert(samePhotoColorway(clean, sanitizePhotoColorway({ colors: oat, assignment: { tube: 0 } })));
  assert(!samePhotoColorway(clean, sanitizePhotoColorway({ colors: oat })));
  for (const bad of [null, {}, { colors: oat.slice(0, 4) }, { colors: [...oat.slice(0, 4), 'E7DFD1'] }, { colors: [...oat.slice(0, 4), 7] }, { colors: oat, assignment: 'tube' }]) assert.equal(sanitizePhotoColorway(bad), null);
  for (const index of [-1, 5, 1.5, '2', null]) assert.equal(sanitizePhotoColorway({ colors: oat, assignment: { cap: index } }), null, `cap index ${index}`);
});

test('pixel color conversion matches color.js and round-trips sRGB', () => {
  for (let r = 0; r <= 255; r += 15) for (let g = 0; g <= 255; g += 15) for (let b = 0; b <= 255; b += 15) {
    const fast = rgbToOklab(r, g, b), reference = oklab([r, g, b]);
    fast.forEach((value, index) => assert(Math.abs(value - reference[index]) < 1e-6));
    const back = oklabToRgb(...fast);
    [r, g, b].forEach((value, index) => assert(Math.abs(back[index] - value) <= 1, `${r},${g},${b}`));
  }
  const clipped = oklabToRgb(.7, .4, .4);
  assert(clipped.every(value => value >= 0 && value <= 255));
});

test('transfer keeps source shading order and is identity for the reference color', () => {
  const reference = [.86, .004, .012], out = new Float64Array(3);
  for (const L of [.7, .8, .86, .92]) {
    transferLab(L, .006, .01, reference, reference, out);
    assert(Math.abs(out[0] - L) < 1e-12 && Math.abs(out[1] - .006) < 1e-12 && Math.abs(out[2] - .01) < 1e-12);
  }
  const target = oklab('#1F4E79'), lightness = [.7, .76, .82, .88, .94].map(L => transferLab(L, 0, 0, reference, target)[0]);
  lightness.slice(1).forEach((value, index) => assert(value > lightness[index]));
  assert(transferLab(.64, 0, 0, [.4, 0, 0], [.86, 0, 0])[0] < .98, 'lifting dark cap grains does not turn them into clipped white glare');
});

test('polygon coverage is anti-aliased, exact in area and bounded to the polygon box', () => {
  const square = rasterizePolygon([[2.5, 2], [7.5, 2], [7.5, 6], [2.5, 6]], 10, 10);
  assert.deepEqual([square.x0, square.y0, square.width, square.height], [2, 2, 6, 4]);
  assert(Math.abs(square.coverage.reduce((sum, value) => sum + value, 0) - 20) < 1e-5);
  assert(Math.abs(square.coverage[0] - .5) < 1e-6 && square.coverage[1] === 1);
  const triangle = rasterizePolygon([[0, 0], [8, 0], [0, 8]], 10, 10);
  assert(Math.abs(triangle.coverage.reduce((sum, value) => sum + value, 0) - 32) < .1);
  assert(triangle.coverage.every(value => value >= 0 && value <= 1));
});

test('rendering changes only masked surfaces and protects print, shading and texture', () => {
  const source = scene(), model = preparePhotoModel(source, { regions: sceneRegions });
  const out = renderPhotoColorway(model, { colors: probe, assignment: { tube: 0, cap: 1 } });
  for (let y = 0; y < 60; y++) for (let x = 0; x < 80; x++) {
    if (!sceneRegions.some(item => inside(x, y, item.points))) assert.deepEqual(at(out, 80, x, y), at(source.data, 80, x, y), `outside ${x},${y}`);
  }
  for (let x = 17; x < 33; x++) for (const y of [28, 29]) assert.deepEqual(at(out, 80, x, y), [35, 35, 40], `print ${x},${y}`);
  const tube = at(out, 80, 25, 20);
  assert.notDeepEqual(tube, at(source.data, 80, 25, 20));
  assert(Math.abs(hueOf(toHex(tube)) - hueOf('#1F4E79')) < 12, 'tube takes the assigned hue');
  const row = Array.from({ length: 22 }, (_, i) => rgbToOklab(...at(out, 80, 14 + i, 20))[0]);
  row.slice(1).forEach((value, index) => assert(value >= row[index] - 1e-3, 'shading gradient survives'));
  assert.notDeepEqual(at(out, 80, 56, 16), at(source.data, 80, 56, 16), 'cap body changes');
  assert(rgbToOklab(...at(out, 80, 55, 15))[0] > rgbToOklab(...at(out, 80, 56, 15))[0], 'cap speckle stays lighter');
  assert(model.bounds.tube && model.bounds.cap && model.bounds.bottle === null);
});

test('renders are deterministic; baseline and current share a model without cross-talk', () => {
  const source = scene(), model = preparePhotoModel(source, { regions: sceneRegions });
  const baseline = sanitizePhotoColorway({ colors: oat }), current = { colors: probe, assignment: { tube: 0 } };
  const first = renderPhotoColorway(model, baseline), second = renderPhotoColorway(model, current), again = renderPhotoColorway(model, baseline, new Uint8ClampedArray(first.length));
  assert.deepEqual(again, first);
  assert.notDeepEqual(second, first);
  source.data.fill(0);
  assert.deepEqual(renderPhotoColorway(model, baseline), first, 'model owns a copy of the decoded source');
  assert.equal(model.source[0], 150);
  assert(Object.isFrozen(model) && Object.isFrozen(model.reference));
  assert.throws(() => renderPhotoColorway(model, { colors: oat.slice(1) }), TypeError);
  assert.throws(() => renderPhotoColorway(model, baseline, new Uint8ClampedArray(4)), TypeError);
  assert.throws(() => renderPhotoColorway({}, baseline), TypeError);
  assert.throws(() => preparePhotoModel({ width: 2, height: 2, data: new Uint8ClampedArray(3) }), TypeError);
  assert.throws(() => preparePhotoModel(scene()), /unexpected size/);
  assert.throws(() => preparePhotoModel(scene(), { regions: [{ surface: 'label', tone: 'light', points: [[0, 0], [1, 0], [1, 1]] }] }), TypeError);
  const overlay = renderPhotoMaskOverlay(model);
  assert.deepEqual(at(overlay, 80, 2, 2), [150, 145, 140]);
});

test('Katre annotations stay on product surfaces and never tint the whole photograph', () => {
  assert.equal(new URL(PHOTO_COLORWAY_SOURCE).pathname.endsWith('/dist/assets/studies/katre-body.jpg'), true);
  assert.match(PHOTO_COLORWAY_NOTE, /AI-concept/); assert.match(PHOTO_COLORWAY_NOTE, /not a physical color proof/);
  assert(Object.isFrozen(PHOTO_REGIONS) && PHOTO_REGIONS.every(item => Object.isFrozen(item) && Object.isFrozen(item.points)));
  for (const surface of PHOTO_SURFACES) assert(PHOTO_REGIONS.some(item => item.surface === surface), surface);
  const total = PHOTO_COLORWAY_WIDTH * PHOTO_COLORWAY_HEIGHT;
  const ivory = image(PHOTO_COLORWAY_WIDTH, PHOTO_COLORWAY_HEIGHT, () => [230, 225, 215]), light = preparePhotoModel(ivory);
  assert(light.count > 0 && light.count < total * .3, `masked share ${light.count / total}`);
  const masked = new Uint8Array(total);
  light.index.forEach(pixel => { masked[pixel] = 1; });
  for (const [x, y, place] of [[60, 60, 'wall'], [300, 230, 'headline'], [140, 950, 'side copy'], [700, 500, 'branch'], [300, 1450, 'stone'], [1215, 700, 'right stone'], [760, 1400, 'ledge'], [524, 720, 'outside tube right'], [243, 800, 'outside tube left'], [519, 1070, 'stone above jar shoulder']]) assert.equal(masked[y * PHOTO_COLORWAY_WIDTH + x], 0, place);
  const out = renderPhotoColorway(light, { colors: probe, assignment: { tube: 0, bottle: 0, jar: 0 } });
  for (let pixel = 0; pixel < total; pixel++) if (!masked[pixel]) assert(out[pixel * 4] === 230 && out[pixel * 4 + 1] === 225 && out[pixel * 4 + 2] === 215);
  assert.equal(light.reference.cap, null);
  const { tube, bottle, jar } = light.bounds;
  assert(tube.x >= 226 && tube.x + tube.width <= 542 && tube.y >= 483 && tube.y + tube.height <= 1143);
  assert(bottle.x >= 943 && bottle.x + bottle.width <= 1172 && bottle.y >= 402);
  assert(jar.y >= 1064 && jar.y + jar.height <= 1318);
  const dark = preparePhotoModel(image(PHOTO_COLORWAY_WIDTH, PHOTO_COLORWAY_HEIGHT, () => [48, 46, 44]));
  assert.equal(dark.reference.tube, null); assert.equal(dark.reference.jar, null);
  assert(dark.bounds.cap.y >= 201 && dark.bounds.cap.y + dark.bounds.cap.height <= 1265);
});

test('module stays local: imports only color helpers and makes no remote calls', async () => {
  const code = await readFile(new URL('../dist/photo-colorway.js', import.meta.url), 'utf8');
  assert.deepEqual([...code.matchAll(/^import .* from '([^']+)';$/gm)].map(match => match[1]), ['./color.js?v=2']);
  assert.doesNotMatch(code, /https?:\/\/|fetch\(|XMLHttpRequest|import\(/);
});

class FakeNode {
  constructor(tag) { this.tagName = tag; this.children = []; this.attributes = {}; this.hidden = false; this.textContent = ''; this.className = ''; this.width = 300; this.height = 150; this.parent = null; }
  append(...nodes) { for (const node of nodes) { node.parent = this; this.children.push(node); } }
  remove() { if (this.parent) this.parent.children.splice(this.parent.children.indexOf(this), 1); this.parent = null; }
  setAttribute(name, value) { this.attributes[name] = String(value); }
  getContext() { return this.context ??= { paints: 0, putImageData(value) { this.paints++; this.last = Array.from(value.data.slice(0, 4)); } }; }
}
const fakeContainer = () => { const node = new FakeNode('div'); node.ownerDocument = { createElement: tag => new FakeNode(tag) }; return node; };
const find = (node, className) => node.className.split(' ').includes(className) ? node : node.children.map(child => find(child, className)).find(Boolean);
const settle = () => new Promise(resolve => setTimeout(resolve, 40));
globalThis.ImageData ??= class { constructor(width, height) { this.width = width; this.height = height; this.data = new Uint8ClampedArray(width * height * 4); } };

test('mounted preview coalesces updates, compares baselines and releases on destroy', async () => {
  const container = fakeContainer(), preview = mountPhotoColorway(container, { colorway: { colors: oat }, regions: sceneRegions, loadSource: async () => scene() });
  assert.equal(preview.state, 'loading');
  assert.equal(preview.update({ colors: probe, assignment: { tube: 0 } }), true);
  assert.equal(preview.update({ colors: probe, assignment: { tube: 9 } }), false, 'invalid mapping is ignored');
  assert.equal(await preview.ready, 'ready');
  await settle();
  const [base, current] = find(preview.element, 'photo-colorway-stages').children.map(stage => stage.children[0]);
  assert.equal(current.context.paints, 1, 'pending updates render once');
  assert.deepEqual(preview.colorway.assignment.tube, 0);
  assert.equal(base.width, 0);
  assert.equal(preview.setBaseline({ colors: oat }), true);
  assert.equal(preview.setBaseline({ colors: ['#nothex'] }), false);
  await settle();
  assert.equal(base.context.paints, 1);
  assert.equal(current.context.paints, 1, 'locking a baseline does not repaint current');
  assert.match(preview.element.className, /is-comparing/);
  assert.equal(preview.update({ colors: probe, assignment: { tube: 0 } }), true);
  await settle();
  assert.equal(current.context.paints, 1, 'identical colorway is not re-rendered');
  preview.update({ colors: oat }); preview.destroy();
  await settle();
  assert.equal(current.context?.paints ?? 1, 1);
  assert.equal(container.children.length, 0);
  assert.equal(current.width, 0);
  assert.equal(preview.update({ colors: oat }), false);
  assert.equal(preview.state, 'destroyed');
});

test('decode failure and destroy-before-load leave the palette alone', async () => {
  const failed = mountPhotoColorway(fakeContainer(), { colorway: { colors: oat }, regions: sceneRegions, loadSource: async () => { throw new Error('decode'); } });
  assert.equal(await failed.ready, 'error');
  assert.match(find(failed.element, 'photo-colorway-status').textContent, /could not be loaded/);
  assert.equal(failed.update({ colors: oat }), false);
  const noBrowser = mountPhotoColorway(fakeContainer(), { colorway: { colors: oat } });
  assert.equal(await noBrowser.ready, 'error', 'the default loader needs a same-origin browser document');
  let release;
  const container = fakeContainer(), early = mountPhotoColorway(container, { regions: sceneRegions, loadSource: () => new Promise(resolve => { release = resolve; }) });
  early.destroy();
  release(scene());
  assert.equal(await early.ready, 'destroyed');
  assert.equal(container.children.length, 0);
  assert.equal(early.bounds, null);
});
