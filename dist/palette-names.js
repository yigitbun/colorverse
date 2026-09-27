// Small curated ASCII vocabulary. Color-derived suggestions, not unique IDs or
// claims about a palette's quality. Member-entered names are never restricted.
const families = [
  ['Rose', 'Coral', 'Ember', 'Velvet'], ['Amber', 'Citrus', 'Honey', 'Saffron'],
  ['Olive', 'Moss', 'Fern', 'Meadow'], ['Mint', 'Jade', 'Lagoon', 'Sage'],
  ['Azure', 'Indigo', 'Harbor', 'Cobalt'], ['Iris', 'Orchid', 'Lilac', 'Plum'],
];
const neutral = ['Stone', 'Oat', 'Paper', 'Dune'];
const endings = ['Muse', 'Echo', 'Drift', 'Haze', 'Ritual', 'Thread', 'Notes', 'Bloom'];
export function suggestPaletteName(colors = [], variation = 0) {
  const valid = Array.isArray(colors) ? colors.filter(hex => /^#[0-9a-f]{6}$/i.test(hex)) : [];
  let selected = null, best = -1;
  for (const hex of valid) {
    const values = [1, 3, 5].map(i => parseInt(hex.slice(i, i + 2), 16) / 255);
    const hi = Math.max(...values), lo = Math.min(...values), delta = hi - lo;
    if (delta <= best) continue;
    const [r, g, b] = values;
    const hue = delta === 0 ? 0 : ((hi === r ? (g - b) / delta : hi === g ? (b - r) / delta + 2 : (r - g) / delta + 4) * 60 + 360) % 360;
    selected = hue; best = delta;
  }
  let hash = 2166136261;
  for (const char of valid.join('').toUpperCase()) hash = Math.imul(hash ^ char.charCodeAt(0), 16777619) >>> 0;
  const offset = Number.isSafeInteger(variation) ? Math.abs(variation % 32) : 0;
  const words = best < .12 ? neutral : families[Math.floor(selected / 60) % 6];
  return `${words[(hash % words.length + Math.floor(offset / endings.length)) % words.length]} ${endings[(Math.floor(hash / words.length) + offset) % endings.length]}`;
}
