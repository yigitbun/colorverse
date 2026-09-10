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
export function paletteFromColor(hex) {
  const h = hue(hex);
  return [hsv(h, .045, .98), hsv(h + 5, .12, .9), hex.toUpperCase(), hsv(h + 30, .48, .93), hsv(h, .4, .17)];
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

// Weighted k-means over a reduced pixel histogram. Image data never leaves the browser.
export function extractColors(pixels) {
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
  while (centers.length < Math.min(5, entries.length)) {
    const best = entries.reduce((best, p) => {
      const score = Math.min(...centers.map(c => distance(c, p.c))) * p.n ** .45;
      return score > best.score ? { score, c: p.c } : best;
    }, { score: -1, c: entries[0].c });
    centers.push(best.c);
  }
  for (let pass = 0; pass < 14; pass++) {
    const groups = centers.map(() => ({ n: 0, sum: [0, 0, 0] }));
    for (const p of entries) {
      const index = centers.reduce((best, c, i) => distance(c, p.c) < distance(centers[best], p.c) ? i : best, 0);
      const g = groups[index]; g.n += p.n; p.c.forEach((v, i) => g.sum[i] += v * p.n);
    }
    centers = groups.map((g, i) => g.n ? g.sum.map(v => v / g.n) : centers[i]);
  }
  const colors = [...new Set(centers.map(toHex))];
  const sampled = colors.length;
  for (const tone of paletteFromColor(colors[0])) if (colors.length < 5 && !colors.includes(tone)) colors.push(tone);
  while (colors.length < 5) colors.push(hsv(hue(colors[0]), .15, .4 + colors.length * .1));
  colors.sort((a, b) => luminance(b) - luminance(a));
  const bg = colors.shift(), text = colors.pop(), surface = colors.shift();
  const chroma = c => Math.max(...rgb(c)) - Math.min(...rgb(c));
  colors.sort((a, b) => chroma(b) - chroma(a));
  return { colors: [bg, surface, colors[0], colors[1], text], sampled };
}
