export const roles = ['Background', 'Surface', 'Primary', 'Accent', 'Text'];
export const clamp = (v, min = 0, max = 1) => Math.max(min, Math.min(max, v));
export const rgb = hex => hex.replace('#', '').match(/.{2}/g).map(v => parseInt(v, 16));
export const toHex = values => '#' + values.map(v => Math.round(clamp(v, 0, 255)).toString(16).padStart(2, '0')).join('').toUpperCase();
export function hsv(h, s, v) {
  h = ((h % 360) + 360) % 360;
  const f = (n, k = (n + h / 60) % 6) => (v - v * s * Math.max(Math.min(k, 4 - k, 1), 0)) * 255;
  return toHex([f(5), f(3), f(1)]);
}
export function hue(hex) {
  const [r, g, b] = rgb(hex).map(v => v / 255), hi = Math.max(r, g, b), lo = Math.min(r, g, b), d = hi - lo;
  return d === 0 ? 0 : ((hi === r ? (g - b) / d : hi === g ? (b - r) / d + 2 : (r - g) / d + 4) * 60 + 360) % 360;
}
export function luminance(hex) {
  return rgb(hex).map(v => v / 255).map(v => v <= .04045 ? v / 12.92 : ((v + .055) / 1.055) ** 2.4).reduce((sum, v, i) => sum + v * [.2126, .7152, .0722][i], 0);
}
export function contrast(a, b) {
  const l = [luminance(a), luminance(b)].sort((a, b) => b - a);
  return (l[0] + .05) / (l[1] + .05);
}
export const textOn = hex => contrast(hex, '#FFFFFF') > contrast(hex, '#17171B') ? '#FFFFFF' : '#17171B';
export function oklab(color) {
  const [r, g, b] = (Array.isArray(color) ? color : rgb(color)).map(value => {
    const channel = value / 255;
    return channel <= .04045 ? channel / 12.92 : ((channel + .055) / 1.055) ** 2.4;
  });
  const l = Math.cbrt(.4122214708 * r + .5363325363 * g + .0514459929 * b);
  const m = Math.cbrt(.2119034982 * r + .6806995451 * g + .1073969566 * b);
  const s = Math.cbrt(.0883024619 * r + .2817188376 * g + .6299787005 * b);
  return [
    .2104542553 * l + .793617785 * m - .0040720468 * s,
    1.9779984951 * l - 2.428592205 * m + .4505937099 * s,
    .0259040371 * l + .7827717662 * m - .808675766 * s,
  ];
}
export function oklabDistance(a, b) {
  const aa = oklab(a), bb = oklab(b);
  return Math.hypot(...aa.map((value, index) => value - bb[index]));
}
export function oklch(lightness, chroma, hueValue) {
  const angle = hueValue * Math.PI / 180;
  const toLinear = value => {
    const a = value * Math.cos(angle), b = value * Math.sin(angle);
    const l = (lightness + .3963377774 * a + .2158037573 * b) ** 3;
    const m = (lightness - .1055613458 * a - .0638541728 * b) ** 3;
    const s = (lightness - .0894841775 * a - 1.291485548 * b) ** 3;
    return [
      4.0767416621 * l - 3.3077115913 * m + .2309699292 * s,
      -1.2684380046 * l + 2.6097574011 * m - .3413193965 * s,
      -.0041960863 * l - .7034186147 * m + 1.707614701 * s,
    ];
  };
  let resolved = chroma, linear = toLinear(resolved);
  if (linear.some(value => value < 0 || value > 1)) {
    let low = 0, high = chroma;
    for (let pass = 0; pass < 12; pass++) {
      const middle = (low + high) / 2, candidate = toLinear(middle);
      if (candidate.every(value => value >= 0 && value <= 1)) { low = middle; linear = candidate; } else high = middle;
    }
    resolved = low; linear = toLinear(resolved);
  }
  return toHex(linear.map(value => 255 * (value <= .0031308 ? value * 12.92 : 1.055 * Math.max(0, value) ** (1 / 2.4) - .055)));
}
export function paletteFromColor(hex) {
  const [, a, b] = oklab(hex);
  const h = (Math.atan2(b, a) * 180 / Math.PI + 360) % 360;
  const c = clamp(Math.hypot(a, b), .035, .18);
  return [
    oklch(.97, Math.min(.018, c * .16), h),
    oklch(.88, Math.min(.045, c * .35), h + 5),
    hex.toUpperCase(),
    oklch(.7, clamp(c * .9, .07, .16), h + 32),
    oklch(.22, Math.min(.035, c * .22), h),
  ];
}
// Preview-only support for 2–4 color palettes: a role without an authored
// member holds SUPPORT_ROLE and renders with a fixed quiet neutral. Support
// colors are never palette members and are never exported as authored colors.
export const SUPPORT_ROLE = 'support';
export const SUPPORT_COLORS = Object.freeze(['#F5F5F5', '#E5E5E5', '#737373', '#A3A3A3', '#1F1F1F']);

export function exportPalette(palette, format) {
  const id = palette.id.replace(/[^a-z0-9-]/gi, '-').toLowerCase();
  const count = palette.workspace?.members?.length;
  const short = count >= 2 && count < 5 && Array.isArray(palette.workspace.roleIndex);
  const isSupport = role => short && palette.workspace.roleIndex[role] === SUPPORT_ROLE;
  const map = Object.fromEntries(roles.map((r, i) => [r.toLowerCase(), palette.colors[i]]).filter(([, value], i) => value && !isSupport(i)));
  // Larger and 2–4 color Studio palettes keep every member; role formats say
  // which preview roles they hold. Support roles are named, never given as colors.
  const members = count > 5 || short ? palette.workspace.members : null;
  const support = roles.filter((_, i) => isSupport(i)).map(r => r.toLowerCase());
  const roleNote = short ? ` — ${count} colors; preview-only support (not included): ${support.join(', ') || 'none'}`
    : members ? ` — five preview roles of ${members.length} colors` : '';
  const roleFor = index => roles[palette.workspace.roleIndex.indexOf(index)];
  const previewRoles = () => Object.fromEntries(roles.map((r, i) => [r.toLowerCase(), isSupport(i) ? SUPPORT_ROLE : palette.workspace.roleIndex[i] + 1]));
  if (format === 'json') return JSON.stringify(members ? { name: palette.name, colors: map, members, previewRoles: previewRoles(), ...(short ? { previewSupport: Object.fromEntries(support.map(r => [r, SUPPORT_COLORS[roles.findIndex(role => role.toLowerCase() === r)]])) } : {}) } : { name: palette.name, colors: map }, null, 2);
  if (format === 'scss') return `// ${palette.name}${roleNote}\n` + Object.entries(map).map(([k, v]) => `$${id}-${k}: ${v};`).join('\n');
  if (format === 'tailwind') return `// Add to theme.extend.colors${roleNote}\nexport default {\n  theme: {\n    extend: {\n      colors: {\n        '${id}': ${JSON.stringify(map, null, 2).replace(/\n/g, '\n        ')}\n      }\n    }\n  }\n};`;
  if (format === 'hex') return members ? members.map((color, index) => roleFor(index) ? `${color}\t${roleFor(index)}` : color).join('\n') : palette.colors.join('\n');
  return `/* ${palette.name}${roleNote} */\n:root {\n` + Object.entries(map).map(([k, v]) => `  --${id}-${k}: ${v};`).join('\n') + '\n}';
}

const chromaOf = color => { const [, a, b] = oklab(color); return Math.hypot(a, b); };
function arrangeRoles(source, primaryHint = null) {
  const colors = [...new Set(source.map(color => color.toUpperCase()))];
  const seed = primaryHint || colors[0] || '#6F7780';
  // A neutral seed gets neutral support tones so no hue is invented.
  const neutralSeed = chromaOf(seed) < NEUTRAL_LIMIT;
  const generated = neutralSeed ? [.97, .88, seed, .62, .22].map(l => typeof l === 'string' ? l : oklch(l, 0, 0)) : paletteFromColor(seed);
  for (const tone of [generated[0], generated[4], generated[1], generated[3], generated[2]]) if (colors.length < 5 && !colors.includes(tone)) colors.push(tone);
  while (colors.length < 5) colors.push(oklch(.2 + colors.length * .14, neutralSeed ? 0 : .035, hue(seed)));
  const pool = colors.slice(0, 8).sort((a, b) => luminance(b) - luminance(a));
  const background = pool.shift(), text = pool.pop();
  let primaryIndex = primaryHint ? pool.indexOf(primaryHint.toUpperCase()) : -1;
  if (primaryIndex < 0) primaryIndex = pool.reduce((best, color, index) => chromaOf(color) > chromaOf(pool[best]) ? index : best, 0);
  const primary = pool.splice(primaryIndex, 1)[0];
  const surface = pool.shift();
  const accentIndex = pool.reduce((best, color, index) => oklabDistance(primary, color) > oklabDistance(primary, pool[best]) ? index : best, 0);
  const accent = pool.splice(accentIndex, 1)[0];
  return [background, surface, primary, accent, text];
}

// Oklab chroma below this reads as neutral (white, grey, black, or JPEG noise on them).
const NEUTRAL_LIMIT = .04;
// Colored pixels must cover at least this share of the visible image to count as present.
const CHROMATIC_PRESENCE = .01;
const hueOf = color => { const [, a, b] = oklab(color); return (Math.atan2(b, a) * 180 / Math.PI + 360) % 360; };

// Weighted k-means in Oklab over pre-binned pixels; centers are RGB means of their members.
function clusterBins(entries, k) {
  if (!entries.length || k < 1) return [];
  const distance = (a, b) => (a[0] - b[0]) ** 2 + (a[1] - b[1]) ** 2 + (a[2] - b[2]) ** 2;
  let centers = [entries[0]];
  while (centers.length < Math.min(k, entries.length)) {
    const best = entries.reduce((best, p) => {
      const score = Math.min(...centers.map(c => distance(c.lab, p.lab))) * p.n ** .45;
      return score > best.score ? { score, p } : best;
    }, { score: -1, p: null });
    if (!best.p || best.score <= 0) break;
    centers.push(best.p);
  }
  centers = centers.map(center => ({ c: center.c, lab: center.lab }));
  let groups = [];
  for (let pass = 0; pass < 14; pass++) {
    groups = centers.map(() => ({ n: 0, sum: [0, 0, 0] }));
    for (const p of entries) {
      let index = 0, closest = Infinity;
      centers.forEach((center, i) => { const d = distance(center.lab, p.lab); if (d < closest) { closest = d; index = i; } });
      const g = groups[index]; g.n += p.n; p.c.forEach((v, i) => g.sum[i] += v * p.n);
    }
    centers = groups.map((g, i) => g.n ? { c: g.sum.map(v => v / g.n), lab: oklab(g.sum.map(v => v / g.n)) } : centers[i]);
  }
  return centers.map((center, i) => ({ hex: toHex(center.c), n: groups[i].n })).filter(item => item.n > 0);
}

// Greedy pick that trades coverage (weight) against perceptual separation from what is already chosen.
function pickDistinct(pool, count, weight, chosen = []) {
  const picked = [...chosen];
  while (picked.length < count) {
    const next = pool.filter(item => !picked.includes(item)).reduce((best, item) => {
      const separation = picked.length ? Math.min(...picked.map(other => oklabDistance(item.hex, other.hex))) : 1;
      const score = weight(item) * Math.min(1, separation / .12) ** 2;
      return score > best.score ? { item, score } : best;
    }, { item: null, score: -1 }).item;
    if (!next) break;
    picked.push(next);
  }
  return picked;
}

// Returns a HEX not yet used, nudging lightness of a derived tone if it collides.
function uniqueTone(lightness, chroma, hueValue, used) {
  for (let step = 0; step < 12; step++) {
    const tone = oklch(clamp(lightness + (step % 2 ? 1 : -1) * Math.ceil(step / 2) * .02, .05, .99), chroma, hueValue);
    if (!used.includes(tone)) return tone;
  }
  return oklch(lightness, chroma, (hueValue + 180) % 360);
}

// Rearranges a reading into role order and records which members were sampled.
function reading(source, sampledHexes, primaryHint) {
  const colors = arrangeRoles(source, primaryHint);
  const origins = colors.map(color => sampledHexes.has(color) ? 'sampled' : 'derived');
  return { colors, origins, derived: origins.filter(origin => origin === 'derived').length };
}

const derivedNote = count => count ? ` ${count} supporting tone${count === 1 ? ' is' : 's are'} derived because the image has too few distinct colors.` : '';

// Clustering produces three deliberate readings. Image data never leaves the browser.
// Observed and Focused contain sampled cluster colors; only too-simple images add
// derived support tones. Applied is an openly derived working system.
export function extractPaletteVariants(pixels) {
  const bins = new Map();
  let visible = 0;
  for (let i = 0; i < pixels.length; i += 4) {
    if (pixels[i + 3] < 128) continue;
    visible++;
    const key = (pixels[i] >> 3) * 1024 + (pixels[i + 1] >> 3) * 32 + (pixels[i + 2] >> 3);
    const p = bins.get(key) || { n: 0, sum: [0, 0, 0] };
    p.n++; for (let j = 0; j < 3; j++) p.sum[j] += pixels[i + j]; bins.set(key, p);
  }
  if (!visible) throw new Error('This image has no visible pixels. Try a different image.');
  const entries = [...bins.values()].map(p => {
    const c = p.sum.map(v => v / p.n), lab = oklab(c);
    return { n: p.n, c, lab, chroma: Math.hypot(lab[1], lab[2]) };
  }).sort((a, b) => b.n - a.n);

  // Neutral and colored pixels are clustered separately so a large pale
  // background cannot absorb all eight clusters with near-identical greys.
  const colored = entries.filter(p => p.chroma >= NEUTRAL_LIMIT);
  const coloredShare = colored.reduce((sum, p) => sum + p.n, 0) / visible;
  const hasColor = coloredShare >= CHROMATIC_PRESENCE;
  const neutral = hasColor ? entries.filter(p => p.chroma < NEUTRAL_LIMIT) : entries;
  const neutralShare = hasColor ? 1 - coloredShare : 1;
  const neutralK = !neutral.length ? 0 : hasColor ? clamp(Math.round(8 * neutralShare), 1, 2) : 8;
  const clusters = [...clusterBins(neutral, neutralK), ...(hasColor ? clusterBins(colored, 8 - neutralK) : [])];
  const merged = [];
  for (const cluster of clusters.sort((a, b) => b.n - a.n)) {
    const twin = merged.find(item => item.hex === cluster.hex || oklabDistance(item.hex, cluster.hex) < .02);
    if (twin) twin.n += cluster.n; else merged.push({ ...cluster });
  }
  const candidates = merged.map(item => ({ ...item, chroma: chromaOf(item.hex), lightness: oklab(item.hex)[0] }));
  const sampled = candidates.length;
  const sampledHexes = new Set(candidates.map(item => item.hex));
  const maxCount = candidates[0].n;
  const accents = candidates.filter(item => item.chroma >= NEUTRAL_LIMIT);
  const neutrals = candidates.filter(item => item.chroma < NEUTRAL_LIMIT);

  // Observed: area first, but when color is present only the two largest
  // neutrals (typically page and ink) compete, so other slots show colored regions.
  const neutralSlots = accents.length ? Math.max(2, 5 - accents.length) : 5;
  const observedPool = [...accents, ...pickDistinct(neutrals, Math.min(neutralSlots, neutrals.length), item => item.n)];
  const observedAll = pickDistinct(candidates, 5, item => item.n, pickDistinct(observedPool, Math.min(5, observedPool.length), item => item.n));
  const observed = reading(observedAll.map(item => item.hex), sampledHexes);
  const condensed = hasColor && neutralShare >= .5;

  // Focused: the most saturated, mid-light, reasonably present region leads;
  // other distinct accents follow before neutrals fill in.
  const emphasis = item => {
    const midtone = .55 + Math.min(item.lightness, 1 - item.lightness) * 1.2;
    return (item.chroma + .025) * midtone * (item.n / maxCount) ** .16;
  };
  const focal = (accents.length ? accents : candidates).reduce((best, item) => emphasis(item) > emphasis(best) ? item : best);
  const accentWeight = item => (item.chroma + .02) * (.3 + (item.n / maxCount) ** .25);
  const focusedPicks = pickDistinct(accents, Math.min(5, accents.length), accentWeight, [focal]);
  const focusedAll = pickDistinct(candidates, 5, item => (.08 + item.chroma) * (item.n / maxCount) ** .2, focusedPicks);
  const focused = reading(focusedAll.map(item => item.hex), sampledHexes, focal.hex);

  // Applied: a quiet surface pair, a brand-like primary (the largest usable
  // accent), a contrasting source accent, and ink that reads on the background.
  const brandPool = accents.filter(item => item.lightness >= .35 && item.lightness <= .8);
  const primaryItem = (brandPool.length ? brandPool : accents).reduce((best, item) => !best || item.n * item.chroma ** .5 > best.n * best.chroma ** .5 ? item : best, null)
    || neutrals.reduce((best, item) => !best || Math.abs(item.lightness - .5) < Math.abs(best.lightness - .5) ? item : best, null);
  const primary = primaryItem.hex;
  const tintHue = hueOf(primary), tint = accents.length ? Math.min(primaryItem.chroma, .15) : 0;
  const used = [primary];
  const lightest = candidates.reduce((best, item) => item.lightness > best.lightness ? item : best);
  const background = lightest.lightness >= .94 && lightest.chroma < .03 && lightest.hex !== primary ? lightest.hex : uniqueTone(.975, tint * .08, tintHue, used);
  used.push(background);
  const surfaceItem = candidates.find(item => item.lightness >= .84 && item.lightness < oklab(background)[0] - .015 && item.chroma < .03 &&!used.includes(item.hex));
  const surface = surfaceItem ? surfaceItem.hex : uniqueTone(.92, tint * .22, tintHue, used);
  used.push(surface);
  const accentItem = accents.filter(item => !used.includes(item.hex) && item.lightness > .3 && item.lightness < .88)
    .reduce((best, item) => !best || oklabDistance(primary, item.hex) * (.6 + item.chroma) > oklabDistance(primary, best.hex) * (.6 + best.chroma) ? item : best, null)
    || (!accents.length && neutrals.filter(item => !used.includes(item.hex) && item.lightness > .3 && item.lightness < .85 && oklabDistance(primary, item.hex) > .08)[0]);
  const accent = accentItem ? accentItem.hex : uniqueTone(.68, accents.length ? clamp(tint * .9, .07, .16) : 0, tintHue + 32, used);
  used.push(accent);
  const inkItem = candidates.filter(item => !used.includes(item.hex) && contrast(item.hex, background) >= 7).reduce((best, item) => !best || item.n > best.n ? item : best, null);
  const text = inkItem ? inkItem.hex : uniqueTone(.2, Math.min(.03, tint * .25), tintHue, used);
  const appliedColors = [background, surface, primary, accent, text];
  const appliedOrigins = appliedColors.map(color => sampledHexes.has(color) ? 'sampled' : 'derived');
  const describeOrigins = origin => roles.filter((_, i) => appliedOrigins[i] === origin).map(role => role.toLowerCase()).join(', ');
  const appliedNote = [['Sampled', describeOrigins('sampled')], ['Derived',describeOrigins('derived')]].filter(([, list]) => list).map(([label, list]) => `${label}: ${list}`).join('; ');

  return {
    sampled,
    variants: [
      { key: 'observed', name: 'Observed', detail: 'Dominant tones', description: `The colors that occupy the most visual space${condensed ? ', with the large neutral area condensed to its main tones so colored regions stay visible' : ''}.${derivedNote(observed.derived)}`, colors: observed.colors, origins: observed.origins },
      { key: 'focused', name: 'Focused', detail: 'Visual emphasis', description: `${accents.length ? 'Distinct source accents, led by the likely focal color' : 'The most distinct tones in a neutral image; no accent is invented'}.${derivedNote(focused.derived)}`, colors: focused.colors, origins: focused.origins },
      { key: 'applied', name: 'Applied', detail: 'Design-ready', description: `A derived working system with quiet surfaces, readable ink${accents.length ? ' and source accents' : ', kept neutral like the image'}. ${appliedNote}.`, colors: appliedColors, origins: appliedOrigins },
    ],
  };
}

export function extractColors(pixels) {
  const result = extractPaletteVariants(pixels);
  return { colors: result.variants[0].colors, sampled: result.sampled };
}
