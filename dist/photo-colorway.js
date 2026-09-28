import { clamp, oklab } from './color.js?v=2';

// Live colorway preview on the supplied Katre body-care photograph.
// Only hand-annotated packaging surfaces are recolored; every other pixel,
// the printed lettering and the source shading/texture are kept. This is a
// digital AI-concept preview, not arbitrary segmentation or a color proof.

export const PHOTO_COLORWAY_WIDTH = 1280;
export const PHOTO_COLORWAY_HEIGHT = 1600;
export const PHOTO_COLORWAY_SOURCE = new URL('./assets/studies/katre-body.jpg', import.meta.url).href;
export const PHOTO_COLORWAY_NOTE = 'Digital AI-concept color preview · approximate, not a physical color proof';
export const PHOTO_SURFACES = Object.freeze(['tube', 'bottle', 'jar', 'cap']);
// Existing role indexes: Surface, Primary, Accent, Text. No new colors.
export const DEFAULT_PHOTO_ASSIGNMENT = Object.freeze({ tube: 1, bottle: 2, jar: 3, cap: 4 });

// Source-pixel polygons for katre-body.jpg (1280 × 1600), drawn slightly inside
// each visible edge. `light` surfaces are ivory, `dark` are the stone-look caps;
// the tone gate lets overlapping outlines split cleanly at cap seams.
const region = (id, surface, tone, protectInk, points) => Object.freeze({ id, surface, tone, protectInk, points: Object.freeze(points.map(point => Object.freeze(point))) });
export const PHOTO_REGIONS = Object.freeze([
  region('tube-crimp', 'tube', 'light', false, [[226, 483], [540, 483], [541, 516], [227, 516]]),
  region('tube-body', 'tube', 'light', true, [[227, 515], [537, 515], [530, 550], [523, 600], [516, 680], [509, 760], [502, 840], [496, 920], [490, 1000], [485, 1080], [481, 1118], [478, 1133], [467, 1139], [438, 1142], [382, 1144], [329, 1142], [304, 1139], [291, 1135], [285, 1129], [281, 1116], [277, 1080], [271, 1000], [265, 920], [259, 840], [252, 760], [246, 680], [239, 600], [232, 550]]),
  region('tube-cap', 'cap', 'dark', false, [[289, 1141], [475, 1141], [476, 1250], [469, 1257], [440, 1262], [382, 1264], [324, 1262], [295, 1257], [289, 1250]]),
  region('bottle-cap', 'cap', 'dark', false, [[980, 212], [987, 205], [1010, 202], [1059, 201], [1107, 203], [1134, 208], [1138, 215], [1138, 393], [1130, 396], [1095, 398], [1057, 399], [1005, 397], [981, 394]]),
  region('bottle-body', 'bottle', 'light', true, [[961, 411], [983, 407], [1059, 406], [1128, 407], [1152, 411], [1164, 417], [1169, 427], [1170, 442], [1170, 1027], [1168, 1046], [1162, 1056], [1145, 1064], [1110, 1068], [1058, 1070], [1008, 1068], [974, 1065], [955, 1059], [948, 1050], [946, 1037], [946, 439], [948, 425], [953, 417]]),
  region('jar-lid', 'cap', 'dark', false, [[534, 987], [543, 981], [569, 975], [631, 969], [703, 967], [754, 966], [823, 968], [904, 973], [955, 979], [970, 986], [976, 995], [976, 1053], [972, 1063], [956, 1071], [908, 1079], [840, 1084], [754, 1087], [666, 1084], [598, 1080], [549, 1074], [534, 1067], [531, 1057], [531, 998]]),
  region('jar-body', 'jar', 'light', true, [[532, 1080], [560, 1086], [638, 1093], [754, 1097], [872, 1093], [950, 1086], [979, 1079], [984, 1090], [988, 1105], [988, 1259], [985, 1279], [976, 1292], [949, 1302], [870, 1311], [754, 1315], [640, 1311], [550, 1302], [528, 1291], [521, 1279], [518, 1261], [518, 1107], [520, 1093], [524, 1085]]),
]);

const HEX = /^#[0-9a-f]{6}$/i;
export function sanitizePhotoColorway(value) {
  if (!value || typeof value !== 'object' || !Array.isArray(value.colors) || value.colors.length !== 5) return null;
  if (!value.colors.every(color => typeof color === 'string' && HEX.test(color))) return null;
  const source = value.assignment ?? {};
  if (typeof source !== 'object') return null;
  const assignment = {};
  for (const surface of PHOTO_SURFACES) {
    if (!Object.hasOwn(source, surface)) { assignment[surface] = DEFAULT_PHOTO_ASSIGNMENT[surface]; continue; }
    const index = source[surface];
    if (!Number.isInteger(index) || index < 0 || index > 4) return null;
    assignment[surface] = index;
  }
  return Object.freeze({ colors: Object.freeze(value.colors.map(color => color.toUpperCase())), assignment: Object.freeze(assignment) });
}
export const samePhotoColorway = (a, b) => Boolean(a && b) && a.colors.every((color, index) => color === b.colors[index]) && PHOTO_SURFACES.every(surface => a.assignment[surface] === b.assignment[surface]);

const smoothstep = (low, high, value) => { const t = clamp((value - low) / (high - low)); return t * t * (3 - 2 * t); };
const LINEAR = Float32Array.from({ length: 256 }, (_, index) => { const channel = index / 255; return channel <= .04045 ? channel / 12.92 : ((channel + .055) / 1.055) ** 2.4; });
const STEPS = 8192;
const ENCODE = Uint8ClampedArray.from({ length: STEPS + 1 }, (_, index) => { const value = index / STEPS; return Math.round(255 * (value <= .0031308 ? value * 12.92 : 1.055 * value ** (1 / 2.4) - .055)); });

// Same matrices as color.js oklab(), without per-pixel allocation.
export function rgbToOklab(r, g, b, out = new Float64Array(3)) {
  const lr = LINEAR[r], lg = LINEAR[g], lb = LINEAR[b];
  const l = Math.cbrt(.4122214708 * lr + .5363325363 * lg + .0514459929 * lb);
  const m = Math.cbrt(.2119034982 * lr + .6806995451 * lg + .1073969566 * lb);
  const s = Math.cbrt(.0883024619 * lr + .2817188376 * lg + .6299787005 * lb);
  out[0] = .2104542553 * l + .793617785 * m - .0040720468 * s;
  out[1] = 1.9779984951 * l - 2.428592205 * m + .4505937099 * s;
  out[2] = .0259040371 * l + .7827717662 * m - .808675766 * s;
  return out;
}
const labToLinear = (L, a, b, out) => {
  const l = (L + .3963377774 * a + .2158037573 * b) ** 3, m = (L - .1055613458 * a - .0638541728 * b) ** 3, s = (L - .0894841775 * a - 1.291485548 * b) ** 3;
  out[0] = 4.0767416621 * l - 3.3077115913 * m + .2309699292 * s;
  out[1] = -1.2684380046 * l + 2.6097574011 * m - .3413193965 * s;
  out[2] = -.0041960863 * l - .7034186147 * m + 1.707614701 * s;
  return out[0] >= -1e-4 && out[0] <= 1.0001 && out[1] >= -1e-4 && out[1] <= 1.0001 && out[2] >= -1e-4 && out[2] <= 1.0001;
};
// Out-of-gamut results keep lightness and hue and lose chroma, like color.js oklch().
export function oklabToRgb(L, a, b, out = new Uint8ClampedArray(3)) {
  const linear = oklabToRgb.scratch ??= new Float64Array(3);
  if (!labToLinear(L, a, b, linear)) {
    let low = 0, high = 1;
    for (let pass = 0; pass < 8; pass++) { const middle = (low + high) / 2; if (labToLinear(L, a * middle, b * middle, linear)) low = middle; else high = middle; }
    labToLinear(L, a * low, b * low, linear);
  }
  for (let channel = 0; channel < 3; channel++) out[channel] = ENCODE[Math.round(clamp(linear[channel]) * STEPS)];
  return out;
}

// Moves a source pixel from the surface reference to the target color while
// keeping its offset in lightness (shading, speckle) and residual chroma.
export function transferLab(L, a, b, reference, target, out = new Float64Array(3)) {
  const [L0, a0, b0] = reference, [Lt, at, bt] = target;
  // Compress highlight variation when lifting a dark material, rather than
  // amplifying its speckle into metallic-looking white clipping.
  const scale = Lt <= L0 ? clamp(Lt / Math.max(L0, 1e-3), .35, 1)
    : clamp((1 - Lt) / Math.max(1 - L0, 1e-3), .2, 1);
  const next = clamp(Lt + (L - L0) * scale);
  const shade = clamp(next / Math.max(Lt, 1e-3), .4, 1.15), sourceShade = clamp(L / Math.max(L0, 1e-3), .4, 1.15);
  out[0] = next;
  out[1] = at * shade + a - a0 * sourceShade;
  out[2] = bt * shade + b - b0 * sourceShade;
  return out;
}

// Anti-aliased even-odd polygon coverage (4 sub-scanlines, exact horizontal spans).
export function rasterizePolygon(points, width, height, samples = 4) {
  const xs = points.map(point => point[0]), ys = points.map(point => point[1]);
  const x0 = clamp(Math.floor(Math.min(...xs)), 0, width), x1 = clamp(Math.ceil(Math.max(...xs)), 0, width);
  const y0 = clamp(Math.floor(Math.min(...ys)), 0, height), y1 = clamp(Math.ceil(Math.max(...ys)), 0, height);
  const w = x1 - x0, h = y1 - y0, coverage = new Float32Array(Math.max(0, w * h)), amount = 1 / samples, hits = [];
  for (let row = 0; row < h; row++) {
    for (let sample = 0; sample < samples; sample++) {
      const y = y0 + row + (sample + .5) / samples;
      hits.length = 0;
      for (let index = 0; index < points.length; index++) {
        const [ax, ay] = points[index], [bx, by] = points[(index + 1) % points.length];
        if ((ay <= y) !== (by <= y)) hits.push(ax + (y - ay) * (bx - ax) / (by - ay) - x0);
      }
      hits.sort((a, b) => a - b);
      for (let index = 0; index + 1 < hits.length; index += 2) {
        const start = clamp(hits[index], 0, w), end = clamp(hits[index + 1], 0, w);
        if (end <= start) continue;
        const first = Math.floor(start), last = Math.floor(end), offset = row * w;
        if (first === last) { coverage[offset + first] += (end - start) * amount; continue; }
        coverage[offset + first] += (first + 1 - start) * amount;
        for (let x = first + 1; x < last; x++) coverage[offset + x] += amount;
        if (last < w) coverage[offset + last] += (end - last) * amount;
      }
    }
  }
  for (let index = 0; index < coverage.length; index++) coverage[index] = Math.min(1, coverage[index]);
  return { x0, y0, width: w, height: h, coverage };
}

// Softens the inner edge only: weight never extends past the polygon (no halo).
function featherInside(coverage, width, height) {
  const out = new Float32Array(coverage.length);
  for (let y = 0; y < height; y++) for (let x = 0; x < width; x++) {
    const own = coverage[y * width + x];
    if (!own) continue;
    let sum = 0;
    for (let dy = -2; dy <= 2; dy++) for (let dx = -2; dx <= 2; dx++) {
      const nx = x + dx, ny = y + dy;
      if (nx >= 0 && ny >= 0 && nx < width && ny < height) sum += coverage[ny * width + nx];
    }
    out[y * width + x] = own * smoothstep(.45, .98, sum / 25);
  }
  return out;
}

const INK_RADIUS = 6;
const isImage = image => image && Number.isInteger(image.width) && Number.isInteger(image.height) && image.width > 0 && image.height > 0 && (image.data instanceof Uint8ClampedArray || image.data instanceof Uint8Array) && image.data.length === image.width * image.height * 4;
function validRegions(regions, width, height) {
  return Array.isArray(regions) && regions.length > 0 && regions.every(item => item && PHOTO_SURFACES.includes(item.surface) && (item.tone === 'light' || item.tone === 'dark') && Array.isArray(item.points) && item.points.length >= 3
    && item.points.every(point => Array.isArray(point) && Number.isFinite(point[0]) && Number.isFinite(point[1]) && point[0] >= 0 && point[1] >= 0 && point[0] <= width && point[1] <= height));
}

// Builds the immutable per-pixel model once per decoded source.
export function preparePhotoModel(image, { regions = PHOTO_REGIONS } = {}) {
  if (!isImage(image)) throw new TypeError('A decoded RGBA source image is required.');
  const { width, height } = image;
  if (regions === PHOTO_REGIONS && (width !== PHOTO_COLORWAY_WIDTH || height !== PHOTO_COLORWAY_HEIGHT)) throw new Error('The Katre source image has an unexpected size.');
  if (!validRegions(regions, width, height)) throw new TypeError('Photo colorway regions are invalid.');
  const source = new Uint8ClampedArray(image.data), weight = new Float32Array(width * height), owner = new Uint8Array(width * height), lab = new Float64Array(3);
  for (const item of regions) {
    const shape = rasterizePolygon(item.points, width, height), { x0, y0, width: w, height: h } = shape, feather = featherInside(shape.coverage, w, h);
    const lightness = new Float32Array(w * h), mask = new Float32Array(w * h);
    for (let y = 0; y < h; y++) for (let x = 0; x < w; x++) {
      const local = y * w + x;
      if (!feather[local]) continue;
      const p = ((y0 + y) * width + x0 + x) * 4, L = rgbToOklab(source[p], source[p + 1], source[p + 2], lab)[0];
      lightness[local] = L;
      // Bright grains belong to the dark cap too: excluding them would invert
      // its texture when a lighter color is applied. The tight contour bounds
      // the cap; this gate only excludes near-white adjoining packaging.
      mask[local] = feather[local] * (item.tone === 'light' ? smoothstep(.46, .58, L) : 1 - smoothstep(.74, .9, L));
    }
    if (item.protectInk) protectInk(mask, lightness, w, h);
    const surface = PHOTO_SURFACES.indexOf(item.surface) + 1;
    for (let y = 0; y < h; y++) for (let x = 0; x < w; x++) {
      const value = mask[y * w + x], pixel = (y0 + y) * width + x0 + x;
      if (value > weight[pixel]) { weight[pixel] = value; owner[pixel] = surface; }
    }
  }
  let count = 0;
  for (let pixel = 0; pixel < weight.length; pixel++) if (weight[pixel] > 1 / 1024) count++;
  const index = new Uint32Array(count), weights = new Float32Array(count), surfaces = new Uint8Array(count), labs = new Float32Array(count * 3);
  const totals = PHOTO_SURFACES.map(() => [0, 0, 0, 0]), bounds = PHOTO_SURFACES.map(() => [Infinity, Infinity, -Infinity, -Infinity]);
  for (let pixel = 0, next = 0; pixel < weight.length; pixel++) {
    if (!(weight[pixel] > 1 / 1024)) continue;
    const p = pixel * 4, surface = owner[pixel] - 1, value = weight[pixel];
    rgbToOklab(source[p], source[p + 1], source[p + 2], lab);
    index[next] = pixel; weights[next] = value; surfaces[next] = surface;
    labs[next * 3] = lab[0]; labs[next * 3 + 1] = lab[1]; labs[next * 3 + 2] = lab[2];
    const total = totals[surface]; total[0] += lab[0] * value; total[1] += lab[1] * value; total[2] += lab[2] * value; total[3] += value;
    if (value >= .5) { const x = pixel % width, y = (pixel - x) / width, box = bounds[surface]; box[0] = Math.min(box[0], x); box[1] = Math.min(box[1], y); box[2] = Math.max(box[2], x + 1); box[3] = Math.max(box[3], y + 1); }
    next++;
  }
  const reference = Object.freeze(Object.fromEntries(PHOTO_SURFACES.map((surface, i) => [surface, totals[i][3] ? Object.freeze(totals[i].slice(0, 3).map(value => value / totals[i][3])) : null])));
  const surfaceBounds = Object.freeze(Object.fromEntries(PHOTO_SURFACES.map((surface, i) => { const [x, y, right, bottom] = bounds[i]; return [surface, Number.isFinite(x) ? Object.freeze({ x, y, width: right - x, height: bottom - y }) : null]; })));
  return Object.freeze({ width, height, count, source, index, weight: weights, surface: surfaces, lab: labs, reference, bounds: surfaceBounds });
}

// Printed text is thin and darker than the masked surface around it; shading is
// broad. Pixels well below their local masked mean keep their source value.
function protectInk(mask, lightness, width, height) {
  const stride = width + 1, sumMask = new Float64Array(stride * (height + 1)), sumLight = new Float64Array(stride * (height + 1));
  for (let y = 0; y < height; y++) {
    let rowMask = 0, rowLight = 0;
    for (let x = 0; x < width; x++) {
      const local = y * width + x;
      rowMask += mask[local]; rowLight += mask[local] * lightness[local];
      sumMask[(y + 1) * stride + x + 1] = sumMask[y * stride + x + 1] + rowMask;
      sumLight[(y + 1) * stride + x + 1] = sumLight[y * stride + x + 1] + rowLight;
    }
  }
  const area = (sum, left, top, right, bottom) => sum[bottom * stride + right] - sum[top * stride + right] - sum[bottom * stride + left] + sum[top * stride + left];
  for (let y = 0; y < height; y++) for (let x = 0; x < width; x++) {
    const local = y * width + x;
    if (!mask[local]) continue;
    const left = Math.max(0, x - INK_RADIUS), top = Math.max(0, y - INK_RADIUS), right = Math.min(width, x + INK_RADIUS + 1), bottom = Math.min(height, y + INK_RADIUS + 1);
    const total = area(sumMask, left, top, right, bottom);
    if (total <= 0) continue;
    mask[local] *= 1 - smoothstep(.05, .14, area(sumLight, left, top, right, bottom) / total - lightness[local]);
  }
}

const isModel = model => model && Number.isInteger(model.count) && model.source instanceof Uint8ClampedArray && model.index instanceof Uint32Array && model.index.length === model.count;
function outputFor(model, out) {
  if (out === undefined) return new Uint8ClampedArray(model.source.length);
  if (!(out instanceof Uint8ClampedArray) || out.length !== model.source.length) throw new TypeError('The output buffer does not match the source image.');
  return out;
}

// Pure and deterministic: the same model and frozen colorway always give the
// same pixels, so a locked baseline renders through this exact path.
export function renderPhotoColorway(model, colorway, out) {
  if (!isModel(model)) throw new TypeError('A prepared photo model is required.');
  const clean = sanitizePhotoColorway(colorway);
  if (!clean) throw new TypeError('A valid five-color photo colorway is required.');
  const pixels = outputFor(model, out), { source, index, weight, surface, lab } = model;
  pixels.set(source);
  const targets = PHOTO_SURFACES.map(name => oklab(clean.colors[clean.assignment[name]])), references = PHOTO_SURFACES.map(name => model.reference[name]);
  const moved = new Float64Array(3), color = new Uint8ClampedArray(3);
  for (let i = 0; i < model.count; i++) {
    const k = surface[i], reference = references[k];
    if (!reference) continue;
    transferLab(lab[i * 3], lab[i * 3 + 1], lab[i * 3 + 2], reference, targets[k], moved);
    oklabToRgb(moved[0], moved[1], moved[2], color);
    const p = index[i] * 4, w = weight[i];
    pixels[p] = source[p] + (color[0] - source[p]) * w;
    pixels[p + 1] = source[p + 1] + (color[1] - source[p + 1]) * w;
    pixels[p + 2] = source[p + 2] + (color[2] - source[p + 2]) * w;
  }
  return pixels;
}

// QA aid: tints each annotated surface so mask fit can be checked visually.
const MASK_TINTS = [[255, 0, 170], [0, 190, 255], [255, 190, 0], [40, 220, 90]];
export function renderPhotoMaskOverlay(model, out) {
  if (!isModel(model)) throw new TypeError('A prepared photo model is required.');
  const pixels = outputFor(model, out);
  pixels.set(model.source);
  for (let i = 0; i < model.count; i++) {
    const p = model.index[i] * 4, tint = MASK_TINTS[model.surface[i]], w = model.weight[i] * .65;
    for (let channel = 0; channel < 3; channel++) pixels[p + channel] = model.source[p + channel] + (tint[channel] - model.source[p + channel]) * w;
  }
  return pixels;
}

async function loadSameOriginPixels(src) {
  const doc = globalThis.document;
  if (!doc || typeof globalThis.Image !== 'function') throw new Error('The photo preview needs a browser canvas.');
  const url = new URL(src, doc.baseURI);
  if (url.origin !== globalThis.location?.origin) throw new Error('The photo preview only loads same-origin images.');
  const image = new Image();
  image.decoding = 'async';
  image.src = url.href;
  try {
    await image.decode();
    const canvas = doc.createElement('canvas');
    canvas.width = image.naturalWidth; canvas.height = image.naturalHeight;
    const context = canvas.getContext('2d', { willReadFrequently: true });
    if (!context) throw new Error('Canvas is unavailable.');
    context.drawImage(image, 0, 0);
    const pixels = context.getImageData(0, 0, canvas.width, canvas.height);
    canvas.width = 0; canvas.height = 0;
    return pixels;
  } finally { image.removeAttribute('src'); }
}

const frameAPI = () => typeof globalThis.requestAnimationFrame === 'function'
  ? [callback => globalThis.requestAnimationFrame(callback), id => globalThis.cancelAnimationFrame(id)]
  : [callback => setTimeout(callback, 16), id => clearTimeout(id)];

// Mounts current (and optional locked baseline) canvases into `container`.
// `ready` resolves to 'ready' | 'error' | 'destroyed' and never rejects.
export function mountPhotoColorway(container, { colorway = null, baseline = null, src = PHOTO_COLORWAY_SOURCE, regions = PHOTO_REGIONS, showMasks = false, loadSource = loadSameOriginPixels } = {}) {
  if (!container || typeof container.append !== 'function') throw new TypeError('A container element is required.');
  const doc = container.ownerDocument ?? globalThis.document, [requestFrame, cancelFrame] = frameAPI();
  const element = (tag, className, text) => { const node = doc.createElement(tag); node.className = className; if (text) node.textContent = text; return node; };
  let state = 'loading', error = null, model = null, frame = 0;
  let current = colorway == null ? null : sanitizePhotoColorway(colorway), locked = baseline == null ? null : sanitizePhotoColorway(baseline);
  const dirty = { current: true, baseline: true };
  const root = element('figure', 'photo-colorway'), stages = element('div', 'photo-colorway-stages');
  const stage = (role, label) => {
    const node = element('div', 'photo-colorway-stage'), canvas = element('canvas', 'photo-colorway-canvas');
    node.setAttribute('data-role', role);
    canvas.setAttribute('role', 'img'); canvas.setAttribute('aria-label', `${label}. ${PHOTO_COLORWAY_NOTE}.`);
    node.append(canvas, element('span', 'photo-colorway-tag', label));
    return { node, canvas, context: null, image: null };
  };
  const baseStage = stage('baseline', 'Comparison'), currentStage = stage('current', 'Current');
  const status = element('p', 'photo-colorway-status', 'Loading photo preview…');
  status.setAttribute('role', 'status');
  baseStage.node.hidden = true;
  stages.append(baseStage.node, currentStage.node);
  root.append(stages, element('figcaption', 'photo-colorway-note', `${PHOTO_COLORWAY_NOTE}. Only the annotated tube, bottle, jar and caps change.`), status);
  root.setAttribute('data-state', state);
  container.append(root);

  const release = target => { target.canvas.width = 0; target.canvas.height = 0; target.context = null; target.image = null; };
  const paint = (target, value) => {
    if (target.canvas.width !== model.width) target.canvas.width = model.width;
    if (target.canvas.height !== model.height) target.canvas.height = model.height;
    target.context ??= target.canvas.getContext('2d');
    target.image ??= new globalThis.ImageData(model.width, model.height);
    if (showMasks) renderPhotoMaskOverlay(model, target.image.data);
    else if (value) renderPhotoColorway(model, value, target.image.data);
    else target.image.data.set(model.source);
    target.context.putImageData(target.image, 0, 0);
  };
  const draw = () => {
    frame = 0;
    if (state !== 'ready') return;
    if (dirty.current) { dirty.current = false; paint(currentStage, current); }
    if (dirty.baseline) {
      dirty.baseline = false;
      baseStage.node.hidden = !locked;
      root.className = locked ? 'photo-colorway is-comparing' : 'photo-colorway';
      if (locked) paint(baseStage, locked); else release(baseStage);
    }
  };
  const schedule = () => { if (!frame && state === 'ready') frame = requestFrame(draw); };

  const ready = (async () => {
    try {
      const pixels = await loadSource(src);
      if (state === 'destroyed') return state;
      model = preparePhotoModel(pixels, { regions });
      state = 'ready'; status.textContent = ''; status.hidden = true;
      root.setAttribute('data-state', state);
      schedule();
      return state;
    } catch (cause) {
      if (state === 'destroyed') return state;
      error = cause; state = 'error';
      status.textContent = 'The photo preview could not be loaded. Your palette has not changed.';
      root.setAttribute('data-state', state);
      return state;
    }
  })();

  return {
    ready,
    element: root,
    get state() { return state; },
    get error() { return error; },
    get colorway() { return current; },
    get baseline() { return locked; },
    get bounds() { return model?.bounds ?? null; },
    // Returns false (and keeps the last good render) for invalid input or after destroy.
    update(value) {
      if (state === 'destroyed' || state === 'error') return false;
      const clean = sanitizePhotoColorway(value);
      if (!clean) return false;
      if (samePhotoColorway(clean, current)) return true;
      current = clean; dirty.current = true; schedule();
      return true;
    },
    setBaseline(value) {
      if (state === 'destroyed' || state === 'error') return false;
      const clean = value == null ? null : sanitizePhotoColorway(value);
      if (value != null && !clean) return false;
      if (clean === locked || samePhotoColorway(clean, locked)) return true;
      locked = clean; dirty.baseline = true; schedule();
      return true;
    },
    destroy() {
      if (state === 'destroyed') return;
      state = 'destroyed';
      if (frame) cancelFrame(frame);
      frame = 0; model = null;
      release(currentStage); release(baseStage);
      root.remove();
    },
  };
}
