import { featherInside, oklabToRgb, rasterizePolygon, rgbToOklab, sanitizePhotoColorway, smoothstep, transferLab } from './photo-colorway.js?v=3';

// One approved image, not a palette corpus entry or general segmentation engine.
export const SERUM_WIDTH = 1254;
export const SERUM_HEIGHT = 1254;
export const SERUM_SOURCE = new URL('./assets/studies/katre-serum-v3.png', import.meta.url).href;
export const SERUM_SOURCE_COLORS = Object.freeze(['#C8D8A7', '#BBA2D1', '#E9947B', '#EAC843', '#253B25']);
export const DEFAULT_SERUM_ASSIGNMENT = Object.freeze({ tube: 0, bottle: 2, jar: 3, cap: 1 });
export const SERUM_SURFACES = Object.freeze(['tube', 'bottle', 'jar', 'cap', 'ink']);
export const SERUM_NOTE = 'AI-concept · approximate digital color preview, not a physical color proof';

const region = (id, surface, points, classify = null) => Object.freeze({ id, surface, classify, points: Object.freeze(points.map(point => Object.freeze(point))) });
// Source coordinates, slightly inside the silhouette. The lower body contour
// follows the colored fill above the clear glass base, not the bottle's foot.
// Print polygons are tight search windows; pixel classification finds the
// actual glyphs and thin rule rather than painting rectangular text patches.
export const SERUM_REGIONS = Object.freeze([
  region('body', 'bottle', [[468, 397], [438, 411], [415, 424], [394, 443], [378, 463], [366, 488], [356, 520], [350, 556], [349, 650], [349, 815], [351, 907], [359, 939], [372, 961], [394, 977], [425, 990], [470, 1001], [523, 1008], [582, 1013], [644, 1013], [699, 1009], [750, 1002], [794, 991], [832, 977], [857, 960], [875, 939], [886, 910], [892, 840], [894, 721], [892, 574], [887, 530], [878, 495], [864, 467], [847, 445], [825, 426], [798, 411], [775, 401], [773, 396]]),
  region('cap', 'cap', [[447, 242], [450, 234], [463, 229], [493, 224], [544, 221], [601, 219], [657, 219], [716, 222], [767, 227], [787, 233], [794, 240], [795, 359], [790, 364], [775, 369], [732, 374], [671, 377], [611, 378], [552, 377], [498, 373], [463, 368], [449, 361]]),
  region('collar', 'jar', [[468, 376], [494, 380], [552, 383], [611, 384], [673, 383], [733, 379], [773, 374], [773, 389], [767, 392], [726, 397], [666, 400], [604, 400], [545, 398], [494, 394], [468, 389]]),
  region('paper', 'tube', [[443, 553], [752, 555], [754, 558], [753, 942], [750, 944], [622, 944], [494, 940], [439, 937], [437, 934], [440, 557]]),
  region('brand-glyphs', 'ink', [[470, 659], [712, 661], [713, 711], [470, 709]], 'ink'),
  region('serum-glyphs', 'ink', [[535, 798], [646, 800], [646, 823], [535, 821]], 'ink'),
  region('volume-glyphs', 'ink', [[557, 889], [619, 890], [619, 912], [557, 911]], 'ink'),
  region('printed-rule', 'jar', [[502, 756], [681, 759], [681, 766], [502, 763]], 'rule'),
]);

const limit = value => Math.max(0, Math.min(1, value));
const labForHex = hex => rgbToOklab(...[1, 3, 5].map(start => Number.parseInt(hex.slice(start, start + 2), 16)));
const sourceHex = Object.freeze([SERUM_SOURCE_COLORS[0], SERUM_SOURCE_COLORS[2], SERUM_SOURCE_COLORS[3], SERUM_SOURCE_COLORS[1], SERUM_SOURCE_COLORS[4]]);
const references = Object.freeze(sourceHex.map(hex => Object.freeze(Array.from(labForHex(hex)))));
const models = new WeakSet();

function validateRegions(regions, width, height) {
  return Array.isArray(regions) && regions.length > 0 && regions.every(item => item && SERUM_SURFACES.includes(item.surface)
    && (item.classify == null || (item.classify === 'ink' && item.surface === 'ink') || (item.classify === 'rule' && item.surface === 'jar'))
    && (item.surface !== 'ink' || item.classify === 'ink') && Array.isArray(item.points) && item.points.length >= 3
    && item.points.every(point => Array.isArray(point) && point.length === 2 && point.every(Number.isFinite) && point[0] >= 0 && point[0] <= width && point[1] >= 0 && point[1] <= height));
}

// Nearby paper samples retain the label's illumination and texture around
// print. The brightest of eight samples avoids sampling a neighbouring stroke.
function paperAt(source, masks, width, height, pixel, out) {
  const x = pixel % width, y = Math.floor(pixel / width);
  out.set(references[0]);
  let brightest = -1;
  const sample = new Float64Array(3);
  for (const [dx, dy] of [[-7, 0], [7, 0], [0, -7], [0, 7], [-7, -7], [7, -7], [-7, 7], [7, 7]]) {
    const nx = x + dx, ny = y + dy;
    if (nx < 0 || ny < 0 || nx >= width || ny >= height) continue;
    const neighbour = ny * width + nx;
    if (masks[neighbour * 5] < .95) continue;
    const p = neighbour * 4;
    rgbToOklab(source[p], source[p + 1], source[p + 2], sample);
    if (sample[0] > brightest) { brightest = sample[0]; out.set(sample); }
  }
  return out;
}

export function prepareSerumModel(image, { regions = SERUM_REGIONS } = {}) {
  if (!image || !Number.isInteger(image.width) || !Number.isInteger(image.height) || image.width <= 0 || image.height <= 0
    || !(image.data instanceof Uint8ClampedArray || image.data instanceof Uint8Array) || image.data.length !== image.width * image.height * 4) throw new TypeError('A decoded RGBA serum source image is required.');
  const { width, height } = image;
  if (regions === SERUM_REGIONS && (width !== SERUM_WIDTH || height !== SERUM_HEIGHT)) throw new Error('The serum source image has an unexpected size.');
  if (!validateRegions(regions, width, height)) throw new TypeError('Serum colorway regions are invalid.');
  const source = new Uint8ClampedArray(image.data), masks = new Float32Array(width * height * 5);
  // Base surfaces first; paper occludes body even at its inward feathered edge.
  for (const item of regions.filter(item => !item.classify).sort((a, b) => (a.surface === 'tube') - (b.surface === 'tube'))) {
    const shape = rasterizePolygon(item.points, width, height), feather = featherInside(shape.coverage, shape.width, shape.height), k = SERUM_SURFACES.indexOf(item.surface);
    for (let y = 0; y < shape.height; y++) for (let x = 0; x < shape.width; x++) {
      const local = y * shape.width + x, pixel = (shape.y0 + y) * width + shape.x0 + x;
      masks[pixel * 5 + k] = Math.max(masks[pixel * 5 + k], feather[local]);
      for (let other = 0; other < 5; other++) if (other !== k) masks[pixel * 5 + other] *= 1 - shape.coverage[local];
    }
  }
  const lab = new Float64Array(3), paper = new Float64Array(3);
  // Determine print from the source, before subtracting it from the paper mask.
  const print = new Float32Array(width * height), rule = new Float32Array(width * height);
  for (const item of regions.filter(item => item.classify)) {
    const shape = rasterizePolygon(item.points, width, height);
    for (let y = 0; y < shape.height; y++) for (let x = 0; x < shape.width; x++) {
      const pixel = (shape.y0 + y) * width + shape.x0 + x, coverage = shape.coverage[y * shape.width + x];
      if (!coverage || !masks[pixel * 5]) continue;
      const p = pixel * 4;
      rgbToOklab(source[p], source[p + 1], source[p + 2], lab);
      paperAt(source, masks, width, height, pixel, paper);
      const difference = paper[0] - lab[0];
      // Tight glyph windows contain dark green ink on green paper, not the
      // broad shaded glass. Smooth coverage includes the antialiased ink edge.
      const alpha = item.classify === 'ink'
        ? smoothstep(.035, .09, difference) * limit(difference / Math.max(.1, paper[0] - .4))
        : smoothstep(-.02, .04, (source[p] - source[p + 1]) / 255) * smoothstep(.02, .06, (source[p + 1] - source[p + 2]) / 255);
      const target = item.classify === 'ink' ? print : rule;
      target[pixel] = Math.max(target[pixel], coverage * alpha);
    }
  }
  let count = 0;
  for (let pixel = 0; pixel < width * height; pixel++) {
    const m = pixel * 5, paperWeight = masks[m];
    masks[m + 4] = paperWeight * print[pixel];
    masks[m + 2] = Math.max(masks[m + 2], paperWeight * rule[pixel] * (1 - print[pixel]));
    masks[m] *= (1 - print[pixel]) * (1 - rule[pixel]);
    for (let k = 0; k < 5; k++) if (masks[m + k] > 1 / 1024) count++;
  }
  const index = new Uint32Array(count), weight = new Float32Array(count), surface = new Uint8Array(count), labs = new Float32Array(count * 3);
  const boxes = SERUM_SURFACES.map(() => [Infinity, Infinity, -Infinity, -Infinity]);
  for (let pixel = 0, next = 0; pixel < width * height; pixel++) {
    const p = pixel * 4, hasPrint = print[pixel] > 0 || rule[pixel] > 0;
    rgbToOklab(source[p], source[p + 1], source[p + 2], lab);
    if (hasPrint) paperAt(source, masks, width, height, pixel, paper);
    for (let k = 0; k < 5; k++) {
      const w = masks[pixel * 5 + k];
      if (!(w > 1 / 1024)) continue;
      index[next] = pixel; weight[next] = w; surface[next] = k;
      // Mixed edge pixels hold a paper/ink (or paper/rule) composite. Transfer
      // each constituent, then add its weighted delta to the original pixel.
      const component = k === 0 && hasPrint ? paper : (k === 4 && print[pixel] < .98) || (k === 2 && rule[pixel] > 0 && rule[pixel] < .98) ? references[k] : lab;
      labs.set(component, next * 3);
      const x = pixel % width, y = Math.floor(pixel / width), box = boxes[k];
      box[0] = Math.min(box[0], x); box[1] = Math.min(box[1], y); box[2] = Math.max(box[2], x + 1); box[3] = Math.max(box[3], y + 1);
      next++;
    }
  }
  const bounds = Object.freeze(Object.fromEntries(SERUM_SURFACES.map((name, k) => {
    const [x, y, right, bottom] = boxes[k];
    return [name, Number.isFinite(x) ? Object.freeze({ x, y, width: right - x, height: bottom - y }) : null];
  })));
  const model = Object.freeze({ width, height, count, source, index, weight, surface, lab: labs, bounds });
  models.add(model);
  return model;
}

export function renderSerumColorway(model, colorway, out) {
  if (!models.has(model)) throw new TypeError('A prepared serum model is required.');
  const clean = sanitizePhotoColorway(colorway);
  if (!clean) throw new TypeError('A valid five-color photo colorway is required.');
  if (out !== undefined && (!(out instanceof Uint8ClampedArray) || out.length !== model.source.length || out.buffer === model.source.buffer)) throw new TypeError('The output buffer must match the source without aliasing it.');
  const pixels = out ?? new Uint8ClampedArray(model.source.length);
  pixels.set(model.source);
  // Existing four assignment keys are retained. Text always uses slot 4.
  const hexes = SERUM_SURFACES.map(name => clean.colors[name === 'ink' ? 4 : clean.assignment[name]]), targets = hexes.map(labForHex);
  const changed = hexes.map((hex, k) => hex !== sourceHex[k]);
  if (!changed.some(Boolean)) return pixels; // Exact original pixels, no RGB roundtrip.
  const moved = new Float64Array(3), color = new Uint8ClampedArray(3), before = new Uint8ClampedArray(3);
  for (let i = 0; i < model.count;) {
    const pixel = model.index[i], p = pixel * 4, result = [model.source[p], model.source[p + 1], model.source[p + 2]];
    do {
      const k = model.surface[i];
      if (changed[k]) {
        const L = model.lab[i * 3], a = model.lab[i * 3 + 1], b = model.lab[i * 3 + 2], reference = references[k], target = targets[k];
        transferLab(L, a, b, reference, target, moved);
        // White reflections are optical light, not colored pigment. Preserve
        // their brightness and reduce the chroma shift as they approach white.
        const reflection = k === 1 || k === 3 ? smoothstep(reference[0] + .04, .99, L) : 0;
        moved[0] += (L - moved[0]) * reflection;
        moved[1] = a + (moved[1] - a) * (1 - reflection);
        moved[2] = b + (moved[2] - b) * (1 - reflection);
        oklabToRgb(...moved, color); oklabToRgb(L, a, b, before);
        for (let channel = 0; channel < 3; channel++) result[channel] += (color[channel] - before[channel]) * model.weight[i];
      }
      i++;
    } while (i < model.count && model.index[i] === pixel);
    for (let channel = 0; channel < 3; channel++) pixels[p + channel] = result[channel];
  }
  return pixels;
}

// No profile import in the photo engine; this plugs into its existing lifecycle.
// Callers pass the four explicit assignment keys (new defaults exported above).
export const KATRE_SERUM_PROFILE = Object.freeze({ src: SERUM_SOURCE, prepare: prepareSerumModel, render: renderSerumColorway, note: SERUM_NOTE, aspectRatio: 1 });
