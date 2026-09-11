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
export function exportPalette(palette, format) {
  const id = palette.id.replace(/[^a-z0-9-]/gi, '-').toLowerCase();
  const map = Object.fromEntries(roles.map((r, i) => [r.toLowerCase(), palette.colors[i]]));
  if (format === 'json') return JSON.stringify({ name: palette.name, colors: map }, null, 2);
  if (format === 'scss') return `// ${palette.name}\n` + Object.entries(map).map(([k, v]) => `$${id}-${k}: ${v};`).join('\n');
  if (format === 'tailwind') return `// Add to theme.extend.colors\nexport default {\n  theme: {\n    extend: {\n      colors: {\n        '${id}': ${JSON.stringify(map, null, 2).replace(/\n/g, '\n        ')}\n      }\n    }\n  }\n};`;
  if (format === 'hex') return palette.colors.join('\n');
  return `/* ${palette.name} */\n:root {\n` + Object.entries(map).map(([k, v]) => `  --${id}-${k}: ${v};`).join('\n') + '\n}';
}

const chromaOf = color => { const [, a, b] = oklab(color); return Math.hypot(a, b); };
function arrangeRoles(source, primaryHint = null) {
  const colors = [...new Set(source.map(color => color.toUpperCase()))];
  const seed = primaryHint || colors[0] || '#6F7780';
  const generated = paletteFromColor(seed);
  for (const tone of [generated[0], generated[4], generated[1], generated[3], generated[2]]) if (colors.length < 5 && !colors.includes(tone)) colors.push(tone);
  while (colors.length < 5) colors.push(oklch(.2 + colors.length * .14, .035, hue(seed)));
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

// Weighted clustering produces three deliberate readings. Image data never leaves the browser.
export function extractPaletteVariants(pixels) {
  const bins = new Map();
  for (let i = 0; i < pixels.length; i += 4) {
    if (pixels[i + 3] < 128) continue;
    const key = (pixels[i] >> 3) * 1024 + (pixels[i + 1] >> 3) * 32 + (pixels[i + 2] >> 3);
    const p = bins.get(key) || { n: 0, sum: [0, 0, 0] };
    p.n++; for (let j = 0; j < 3; j++) p.sum[j] += pixels[i + j]; bins.set(key, p);
  }
  const entries = [...bins.values()].map(p => ({ n: p.n, c: p.sum.map(v => v / p.n) })).sort((a, b) => b.n - a.n);
  if (!entries.length) throw new Error('This image has no visible pixels. Try a different image.');
  const distance = (a, b) => a.reduce((sum, v, i) => sum + (v - b[i]) ** 2, 0);
  let centers = [entries[0].c];
  while (centers.length < Math.min(8, entries.length)) {
    const best = entries.reduce((best, p) => {
      const score = Math.min(...centers.map(c => distance(c, p.c))) * p.n ** .45;
      return score > best.score ? { score, c: p.c } : best;
    }, { score: -1, c: entries[0].c });
    centers.push(best.c);
  }
  let groups = [];
  for (let pass = 0; pass < 14; pass++) {
    groups = centers.map(() => ({ n: 0, sum: [0, 0, 0] }));
    for (const p of entries) {
      const index = centers.reduce((best, c, i) => distance(c, p.c) < distance(centers[best], p.c) ? i : best, 0);
      const g = groups[index]; g.n += p.n; p.c.forEach((v, i) => g.sum[i] += v * p.n);
    }
    centers = groups.map((g, i) => g.n ? g.sum.map(v => v / g.n) : centers[i]);
  }
  const merged = new Map();
  centers.forEach((center, index) => {
    const hex = toHex(center), count = groups[index]?.n || 1;
    merged.set(hex, (merged.get(hex) || 0) + count);
  });
  const candidates = [...merged].map(([hex, n]) => ({ hex, n, chroma: chromaOf(hex), lightness: oklab(hex)[0] })).sort((a, b) => b.n - a.n);
  const sampled = candidates.length;
  const observed = arrangeRoles(candidates.slice(0, 5).map(item => item.hex));
  const maxCount = candidates[0]?.n || 1;
  const focal = candidates.reduce((best, item) => {
    const midtone = .55 + Math.min(item.lightness, 1 - item.lightness) * 1.2;
    const score = (item.chroma + .025) * midtone * (item.n / maxCount) ** .16;
    return score > best.score ? { item, score } : best;
  }, { item: candidates[0], score: -1 }).item;
  const focused = [focal];
  while (focused.length < Math.min(5, candidates.length)) {
    const next = candidates.filter(item => !focused.includes(item)).reduce((best, item) => {
      const separation = Math.min(...focused.map(chosen => oklabDistance(item.hex, chosen.hex)));
      const score = separation * (.72 + item.chroma) * (.35 + (item.n / maxCount) ** .25);
      return score > best.score ? { item, score } : best;
    }, { item: null, score: -1 }).item;
    if (!next) break;
    focused.push(next);
  }
  const [, focalA, focalB] = oklab(focal.hex);
  const focalHue = (Math.atan2(focalB, focalA) * 180 / Math.PI + 360) % 360;
  const focusedTone = oklch(clamp(focal.lightness, .38, .72), clamp(focal.chroma * 1.16, .075, .21), focalHue);
  const focusedColors = arrangeRoles([focusedTone, ...focused.map(item => item.hex)], focusedTone);
  const applied = paletteFromColor(focal.hex);
  const accentPool = candidates.filter(item => item.hex !== focal.hex && item.lightness > .25 && item.lightness < .84);
  const naturalAccent = (accentPool.length ? accentPool : candidates.filter(item => item.hex !== focal.hex)).reduce((best, item) => {
    const score = oklabDistance(focal.hex, item.hex) * (.6 + item.chroma);
    return score > best.score ? { item, score } : best;
  }, { item: null, score: -1 }).item;
  if (naturalAccent && naturalAccent.hex !== applied[3]) applied[3] = naturalAccent.hex;
  return {
    sampled,
    variants: [
      { key: 'observed', name: 'Observed', detail: 'Dominant tones', description: 'The colors that occupy the most visual space.', colors: observed },
      { key: 'focused', name: 'Focused', detail: 'Visual emphasis', description: 'Distinctive colors weighted toward the eye’s likely focus.', colors: focusedColors },
      { key: 'applied', name: 'Applied', detail: 'Design-ready', description: 'A functional system with surfaces, accents, and readable text.', colors: applied },
    ],
  };
}

export function extractColors(pixels) {
  const result = extractPaletteVariants(pixels);
  return { colors: result.variants[0].colors, sampled: result.sampled };
}
