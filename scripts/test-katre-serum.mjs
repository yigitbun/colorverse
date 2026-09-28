import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import { inflateSync } from 'node:zlib';
import test from 'node:test';
import { mountPhotoColorway, rgbToOklab, sanitizePhotoColorway } from '../dist/photo-colorway.js?v=3';
import {
  DEFAULT_SERUM_ASSIGNMENT, KATRE_SERUM_PROFILE, SERUM_HEIGHT, SERUM_NOTE, SERUM_REGIONS, SERUM_SOURCE, SERUM_SOURCE_COLORS, SERUM_SURFACES, SERUM_WIDTH,
  prepareSerumModel, renderSerumColorway,
} from '../dist/katre-serum.js';

const colorway = (colors = SERUM_SOURCE_COLORS, assignment = DEFAULT_SERUM_ASSIGNMENT) => ({ colors, assignment });
const rgb = hex => [1, 3, 5].map(start => parseInt(hex.slice(start, start + 2), 16));
const box = (id, surface, x0, y0, x1, y1, classify = null) => ({ id, surface, classify, points: [[x0, y0], [x1, y0], [x1, y1], [x0, y1]] });
const regions = [
  box('body', 'bottle', 8, 8, 54, 70), box('cap', 'cap', 62, 8, 88, 26), box('collar', 'jar', 62, 32, 88, 44),
  box('paper', 'tube', 16, 22, 46, 60), box('glyphs', 'ink', 19, 28, 42, 39, 'ink'), box('rule', 'jar', 19, 46, 42, 51, 'rule'),
];
const within = (x, y, item) => x >= item.points[0][0] && y >= item.points[0][1] && x < item.points[2][0] && y < item.points[2][1];
const mix = (a, b, weight) => a.map((value, k) => Math.round(value + (b[k] - value) * weight));
const scene = () => {
  const width = 96, height = 80, data = new Uint8ClampedArray(width * height * 4);
  const [paper, cap, body, ochre, ink] = SERUM_SOURCE_COLORS.map(rgb);
  for (let y = 0; y < height; y++) for (let x = 0; x < width; x++) {
    let value = [243, 241, 237];
    if (within(x, y, regions[0])) value = body;
    if (within(x, y, regions[1])) value = cap;
    if (within(x, y, regions[2])) value = ochre;
    if (within(x, y, regions[3])) value = paper;
    if (y >= 30 && y <= 36 && (x === 25 || x === 26)) value = ink;
    if (y >= 30 && y <= 36 && x === 24) value = mix(paper, ink, .4);
    if (y === 48 && x >= 21 && x <= 40) value = ochre;
    if (y === 49 && x >= 21 && x <= 40) value = mix(paper, ochre, .5);
    if (x === 12 && y === 15) value = [255, 248, 241];
    if (x === 13 && y === 15) value = [213, 123, 99];
    data.set([...value, (x + y) % 3 === 0 ? 254 : 255], (y * width + x) * 4);
  }
  return { width, height, data };
};
const at = (data, width, x, y) => Array.from(data.slice((y * width + x) * 4, (y * width + x) * 4 + 4));
const probes = [[32, 25], [12, 40], [74, 38], [74, 18], [25, 33]]; // paper, body, collar, cap, ink
const modelFor = () => prepareSerumModel(scene(), { regions });
const weightsFor = model => {
  const weights = new Float32Array(model.width * model.height * 5);
  model.index.forEach((pixel, i) => { weights[pixel * 5 + model.surface[i]] += model.weight[i]; });
  return weights;
};

test('approved source colors retain every original byte, including remapped source targets', () => {
  const source = scene(), model = prepareSerumModel(source, { regions });
  assert.deepEqual(renderSerumColorway(model, colorway()), source.data);
  const colors = [SERUM_SOURCE_COLORS[2], SERUM_SOURCE_COLORS[0], SERUM_SOURCE_COLORS[3], SERUM_SOURCE_COLORS[1], SERUM_SOURCE_COLORS[4]];
  assert.deepEqual(renderSerumColorway(model, colorway(colors, { tube: 1, bottle: 0, jar: 2, cap: 3 })), source.data, 'identity follows intended color, not palette position');
  assert.deepEqual(renderSerumColorway(model, colorway(SERUM_SOURCE_COLORS.map(value => value.toLowerCase()))), source.data);
});

test('each palette slot independently recolors its surface; ink always follows Text', () => {
  const model = modelFor(), weights = weightsFor(model), slotFor = [0, 2, 3, 1, 4];
  for (let k = 0; k < 5; k++) {
    const colors = [...SERUM_SOURCE_COLORS]; colors[slotFor[k]] = '#306BA5';
    const result = renderSerumColorway(model, colorway(colors));
    assert.notDeepEqual(at(result, model.width, ...probes[k]), at(model.source, model.width, ...probes[k]), SERUM_SURFACES[k]);
    for (let other = 0; other < 5; other++) if (other !== k) assert.deepEqual(at(result, model.width, ...probes[other]), at(model.source, model.width, ...probes[other]), `${SERUM_SURFACES[k]} leaves ${SERUM_SURFACES[other]} alone`);
    let changed = 0;
    for (let pixel = 0; pixel < model.width * model.height; pixel++) {
      const p = pixel * 4;
      if (result[p] !== model.source[p] || result[p + 1] !== model.source[p + 1] || result[p + 2] !== model.source[p + 2]) {
        changed++;
        assert(weights[pixel * 5 + k] > 0, `slot ${slotFor[k]} escaped its mask at ${pixel}`);
      }
      assert.equal(result[p + 3], model.source[p + 3], 'source alpha is unchanged');
    }
    assert(changed > 0);
    if (k === 2) assert.notDeepEqual(at(result, model.width, 30, 48), at(model.source, model.width, 30, 48), 'ochre role also changes the printed rule');
  }
  const colors = [...SERUM_SOURCE_COLORS]; colors[4] = '#BB3853';
  const explicit = renderSerumColorway(model, colorway(colors, { ...DEFAULT_SERUM_ASSIGNMENT, ink: 0 }));
  assert.notDeepEqual(at(explicit, model.width, 25, 33), at(model.source, model.width, 25, 33), 'an extra ink assignment cannot detach print from Text');
  const saved = { tube: 2, bottle: 0, jar: 1, cap: 3 };
  assert.deepEqual(sanitizePhotoColorway(colorway(colors, saved)).assignment, saved, 'saved assignment indices are retained');
});

test('paper and print share antialiased edges without recoloring text windows as boxes', () => {
  const model = modelFor(), weights = weightsFor(model), p = (33 * model.width + 24) * 5;
  assert(weights[p] > 0 && weights[p + 4] > 0, 'antialiased glyph pixel has both paper and ink coverage');
  assert.equal(weights[(33 * model.width + 35) * 5 + 4], 0, 'paper inside glyph search window is not ink');
  assert.equal(weights[(47 * model.width + 30) * 5 + 2], 0, 'paper inside rule search window is not ochre');
  assert.equal(weights[(33 * model.width + 25) * 5], 0, 'solid glyph is excluded from paper');
  const paper = [...SERUM_SOURCE_COLORS]; paper[0] = '#ECD0B4';
  const ink = [...SERUM_SOURCE_COLORS]; ink[4] = '#9B3754';
  assert.notDeepEqual(at(renderSerumColorway(model, colorway(paper)), model.width, 24, 33), at(model.source, model.width, 24, 33));
  assert.notDeepEqual(at(renderSerumColorway(model, colorway(ink)), model.width, 24, 33), at(model.source, model.width, 24, 33));
  for (let pixel = 0; pixel < model.width * model.height; pixel++) assert(weights.slice(pixel * 5, pixel * 5 + 5).reduce((sum, value) => sum + value, 0) <= 1.000001, 'constituent coverages do not exceed the pixel');
});

test('unmasked pixels, inward edges, optical reflections and shading are preserved', () => {
  const model = modelFor(), weights = weightsFor(model), colors = ['#8CA9D1', '#D86B51', '#275575', '#4B886A', '#622D52'];
  const result = renderSerumColorway(model, colorway(colors));
  for (let pixel = 0; pixel < model.width * model.height; pixel++) if (!weights.slice(pixel * 5, pixel * 5 + 5).some(Boolean)) {
    assert.deepEqual(result.slice(pixel * 4, pixel * 4 + 4), model.source.slice(pixel * 4, pixel * 4 + 4));
  }
  for (const [x, y] of [[7, 40], [54, 40], [74, 45], [12, 71]]) assert.deepEqual(at(result, model.width, x, y), at(model.source, model.width, x, y), `outside ${x},${y}`);
  for (const [x, y] of [[15, 25], [46, 25]]) assert.equal(weights[(y * model.width + x) * 5], 0, 'paper does not bleed into the adjacent glass');
  const light = rgbToOklab(...at(result, model.width, 12, 15).slice(0, 3))[0], shade = rgbToOklab(...at(result, model.width, 13, 15).slice(0, 3))[0];
  assert(light > .95 && light > shade + .2, 'white glass reflection retains its brightness');
  assert(weights[(40 * model.width + 8) * 5 + 1] < weights[(40 * model.width + 12) * 5 + 1], 'feather falls inward only');
});

test('snapshots, model source and output buffers have validation and deterministic baseline isolation', () => {
  const source = scene(), model = prepareSerumModel(source, { regions }), baseline = sanitizePhotoColorway(colorway());
  const colors = Object.freeze(['#7299AA', '#CF9B72', '#243A55', '#E193A3', '#F3E7CB']);
  const input = Object.freeze({ colors, assignment: Object.freeze({ ...DEFAULT_SERUM_ASSIGNMENT }) });
  const first = renderSerumColorway(model, input), original = renderSerumColorway(model, baseline);
  assert.deepEqual(renderSerumColorway(model, input, new Uint8ClampedArray(first.length)), first);
  assert.deepEqual(renderSerumColorway(model, baseline), original);
  assert.notDeepEqual(first, original);
  source.data.fill(0);
  assert.deepEqual(renderSerumColorway(model, baseline), original, 'decoded source is copied');
  assert(Object.isFrozen(model) && Object.isFrozen(model.bounds));
  assert(Object.values(model.bounds).filter(Boolean).every(Object.isFrozen));
  for (const bad of [null, {}, colorway(colors.slice(1)), colorway([...colors.slice(0, 4), '#oops!!']), colorway(colors, { cap: 9 })]) assert.throws(() => renderSerumColorway(model, bad), TypeError);
  for (const bad of [{}, null]) assert.throws(() => renderSerumColorway(bad, input), TypeError);
  for (const out of [new Uint8Array(first.length), new Uint8ClampedArray(4), model.source, new Uint8ClampedArray(model.source.buffer)]) assert.throws(() => renderSerumColorway(model, input, out), TypeError);
  assert.throws(() => prepareSerumModel(scene()), /unexpected size/);
  for (const bad of [{}, { ...scene(), data: new Uint8Array(3) }, { ...scene(), width: .5 }]) assert.throws(() => prepareSerumModel(bad), TypeError);
  for (const invalid of [[], [box('bad', 'label', 0, 0, 2, 2)], [box('bad', 'tube', -1, 0, 2, 2)], [{ ...regions[0], points: [[0, NaN], [1, 0], [1, 1]] }], [{ ...regions[0], classify: 'ink' }]]) assert.throws(() => prepareSerumModel(scene(), { regions: invalid }), TypeError);
});

// Decode this repo's approved noninterlaced 8-bit RGB PNG using built-in zlib.
// This is a test-only reader, not image editing or a new runtime dependency.
async function approvedImage() {
  const bytes = await readFile(new URL('../dist/assets/studies/katre-serum-v3.png', import.meta.url));
  assert.deepEqual(Array.from(bytes.subarray(0, 8)), [137, 80, 78, 71, 13, 10, 26, 10]);
  const width = bytes.readUInt32BE(16), height = bytes.readUInt32BE(20);
  assert.deepEqual([bytes[24], bytes[25], bytes[26], bytes[27], bytes[28]], [8, 2, 0, 0, 0]);
  const chunks = [];
  for (let offset = 8; offset < bytes.length;) {
    const length = bytes.readUInt32BE(offset), type = bytes.toString('ascii', offset + 4, offset + 8);
    if (type === 'IDAT') chunks.push(bytes.subarray(offset + 8, offset + 8 + length));
    offset += length + 12;
  }
  const raw = inflateSync(Buffer.concat(chunks)), stride = width * 3, decoded = new Uint8Array(stride * height), data = new Uint8ClampedArray(width * height * 4);
  assert.equal(raw.length, (stride + 1) * height);
  const paeth = (a, b, c) => { const p = a + b - c, da = Math.abs(p - a), db = Math.abs(p - b), dc = Math.abs(p - c); return da <= db && da <= dc ? a : db <= dc ? b : c; };
  for (let y = 0; y < height; y++) {
    const filter = raw[y * (stride + 1)]; assert(filter <= 4);
    for (let x = 0; x < stride; x++) {
      const i = y * stride + x, a = x >= 3 ? decoded[i - 3] : 0, b = y ? decoded[i - stride] : 0, c = y && x >= 3 ? decoded[i - stride - 3] : 0;
      decoded[i] = raw[y * (stride + 1) + 1 + x] + [0, a, b, Math.floor((a + b) / 2), paeth(a, b, c)][filter];
    }
  }
  for (let pixel = 0; pixel < width * height; pixel++) { data.set(decoded.subarray(pixel * 3, pixel * 3 + 3), pixel * 4); data[pixel * 4 + 3] = 255; }
  return { width, height, data };
}

test('actual approved image has tight bounded masks, exact identity and invariant scene/clear base', async () => {
  const source = await approvedImage(); assert.deepEqual([source.width, source.height], [SERUM_WIDTH, SERUM_HEIGHT]);
  const model = prepareSerumModel(source), weights = weightsFor(model), counts = [0, 0, 0, 0, 0];
  model.surface.forEach(k => counts[k]++);
  assert(counts.every(count => count > 100), `actual surface counts ${counts}`);
  assert(Object.isFrozen(SERUM_REGIONS) && SERUM_REGIONS.every(item => Object.isFrozen(item) && Object.isFrozen(item.points) && item.points.every(Object.isFrozen)));
  for (const item of SERUM_REGIONS) for (const [x, y] of item.points) assert(x >= 0 && x <= SERUM_WIDTH && y >= 0 && y <= SERUM_HEIGHT);
  assert.deepEqual(renderSerumColorway(model, colorway()), source.data);
  const colors = ['#315980', '#D3B28C', '#8DA79E', '#CE7B79', '#704655'], changed = renderSerumColorway(model, colorway(colors));
  let outsideChanges = 0, changedPixels = 0;
  for (let pixel = 0; pixel < source.width * source.height; pixel++) {
    const p = pixel * 4, different = changed[p] !== source.data[p] || changed[p + 1] !== source.data[p + 1] || changed[p + 2] !== source.data[p + 2];
    const masked = weights.subarray(pixel * 5, pixel * 5 + 5).some(Boolean);
    if (different) { changedPixels++; if (!masked || Math.floor(pixel / source.width) >= 1014) outsideChanges++; }
    assert.equal(changed[p + 3], 255);
  }
  assert.equal(outsideChanges, 0); assert(changedPixels > 200000 && changedPixels < source.width * source.height * .4);
  for (const [x, y] of [[100, 100], [430, 300], [810, 300], [340, 700], [905, 700], [620, 1050], [620, 1100], [900, 1130]]) assert.deepEqual(at(changed, source.width, x, y), at(source.data, source.width, x, y), `actual scene/base ${x},${y}`);
  for (const k of [0, 1, 2, 3, 4]) {
    const only = [...SERUM_SOURCE_COLORS]; only[[0, 2, 3, 1, 4][k]] = '#396795';
    const result = renderSerumColorway(model, colorway(only));
    let changes = 0;
    for (let pixel = 0; pixel < source.width * source.height; pixel++) {
      const p = pixel * 4;
      if (result[p] !== source.data[p] || result[p + 1] !== source.data[p + 1] || result[p + 2] !== source.data[p + 2]) {
        changes++; assert(weights[pixel * 5 + k] > 0, `${SERUM_SURFACES[k]} escaped its actual mask`);
      }
    }
    assert(changes > 100);
  }
  const { tube, bottle, jar, cap, ink } = model.bounds;
  assert(tube.x >= 437 && tube.y >= 553 && tube.x + tube.width <= 755 && tube.y + tube.height <= 945);
  assert(bottle.x >= 349 && bottle.x + bottle.width <= 895 && bottle.y + bottle.height <= 1014);
  assert(cap.x >= 447 && cap.x + cap.width <= 796 && cap.y >= 219 && cap.y + cap.height <= 379);
  assert(jar.y >= 374 && jar.y + jar.height <= 766);
  assert(ink.x >= 470 && ink.x + ink.width <= 713 && ink.y >= 659 && ink.y + ink.height <= 912);
  console.log(`Actual serum image: paper/body/accent/cap/ink samples ${counts.join('/')}; ${changedPixels} changed pixels, ${outsideChanges} outside/base changes.`);
});

class Node {
  constructor(tag) { this.tagName = tag; this.children = []; this.attributes = {}; this.style = { setProperty: (key, value) => { this.attributes[`style:${key}`] = value; } }; }
  append(...nodes) { nodes.forEach(node => { node.parent = this; this.children.push(node); }); }
  setAttribute(name, value) { this.attributes[name] = String(value); }
  remove() { this.parent?.children.splice(this.parent.children.indexOf(this), 1); }
  getContext() { return this.context ??= { paints: 0, putImageData(image) { this.paints++; this.pixels = new Uint8ClampedArray(image.data); } }; }
}
const host = () => { const node = new Node('div'); node.ownerDocument = { createElement: tag => new Node(tag) }; return node; };
const settle = () => new Promise(resolve => setTimeout(resolve, 35));
globalThis.ImageData ??= class { constructor(width, height) { this.data = new Uint8ClampedArray(width * height * 4); } };

test('serum optional mount has honest notes, square stages and frozen comparison lifecycle', async () => {
  const container = host(), source = scene(), model = prepareSerumModel(source, { regions });
  const profile = { ...KATRE_SERUM_PROFILE, prepare: pixels => prepareSerumModel(pixels, { regions }) };
  let src;
  const baseline = colorway(), current = colorway(['#ECD0B4', '#CF9872', '#345C7B', '#AB758F', '#D9D9B2']);
  const preview = mountPhotoColorway(container, { profile, colorway: current, baseline, loadSource: async path => { src = path; return source; } });
  assert.equal(await preview.ready, 'ready'); await settle();
  assert.equal(src, SERUM_SOURCE);
  assert.equal(preview.element.children[1].textContent, SERUM_NOTE);
  assert.equal(preview.element.attributes['style:--photo-aspect'], '1');
  const [base, live] = preview.element.children[0].children;
  for (const stage of [base, live]) assert(stage.children[0].attributes['aria-label'].includes(SERUM_NOTE));
  assert.deepEqual(base.children[0].context.pixels, source.data);
  assert.deepEqual(live.children[0].context.pixels, renderSerumColorway(model, current));
  assert(Object.isFrozen(preview.baseline.colors) && Object.isFrozen(preview.baseline.assignment));
  assert.equal(preview.update(colorway(['#bad'])), false);
  assert.equal(preview.setBaseline(colorway(['#bad'])), false);
  preview.update(baseline); await settle();
  assert.deepEqual(live.children[0].context.pixels, source.data);
  assert.equal(base.children[0].context.paints, 1, 'comparison did not repaint when current changed');
  preview.setBaseline(null); await settle(); assert.equal(base.children[0].width, 0);
  preview.destroy(); assert.equal(preview.state, 'destroyed'); assert.equal(container.children.length, 0); assert.equal(live.children[0].width, 0);
  assert.equal(preview.update(current), false);
  const failed = mountPhotoColorway(host(), { profile: KATRE_SERUM_PROFILE, loadSource: async () => source });
  assert.equal(await failed.ready, 'error'); assert.match(failed.error.message, /unexpected size/); failed.destroy();
  let resolve;
  const early = mountPhotoColorway(host(), { profile, loadSource: () => new Promise(done => { resolve = done; }) });
  early.destroy(); resolve(source); assert.equal(await early.ready, 'destroyed');
});

test('serum profile imports local reusable math and keeps the photo engine independent', async () => {
  const [serum, photo] = await Promise.all([readFile(new URL('../dist/katre-serum.js', import.meta.url), 'utf8'), readFile(new URL('../dist/photo-colorway.js', import.meta.url), 'utf8')]);
  assert.deepEqual([...serum.matchAll(/^import .* from '([^']+)';$/gm)].map(match => match[1]), ['./photo-colorway.js?v=3']);
  assert.doesNotMatch(serum, /https?:\/\/|fetch\(|XMLHttpRequest|import\(|mountPhotoColorway/);
  assert.doesNotMatch(photo, /katre-serum/);
  assert(new URL(SERUM_SOURCE).pathname.endsWith('/dist/assets/studies/katre-serum-v3.png'));
  assert.match(SERUM_NOTE, /AI-concept/); assert.match(SERUM_NOTE, /not a physical color proof/);
  assert(SERUM_NOTE.length <= 100, 'keep the visible disclosure compact');
  assert.equal(KATRE_SERUM_PROFILE.aspectRatio, 1); assert(Object.isFrozen(KATRE_SERUM_PROFILE));
});
