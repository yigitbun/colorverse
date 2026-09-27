import { oklabDistance } from './color.js';

export const useGroups = Object.freeze({
  digital: ['software', 'data', 'technology', 'gaming', 'digital', 'interface', 'screen'],
  brand: ['brand', 'retail', 'hospitality', 'packaging', 'campaign', 'craft'],
  editorial: ['editorial', 'publishing', 'education', 'print'],
  lifestyle: ['wellness', 'beauty', 'fashion', 'food', 'travel', 'music', 'arts', 'events', 'product', 'space', 'interior', 'furniture'],
});
export const feelingGroups = Object.freeze({
  quiet: ['quiet', 'calm', 'minimal', 'soft', 'grounded', 'atmospheric'],
  vivid: ['vivid', 'bright', 'electric', 'neon', 'energetic', 'playful', 'high-contrast'],
  warm: ['warm', 'sunset', 'earthy', 'sun-baked', 'citrus', 'comforting'],
  cool: ['cool', 'aquatic', 'fresh', 'rain-washed', 'nocturnal'],
  dark: ['dark', 'nocturnal', 'mysterious', 'precise'],
});
const hex = /^#[0-9a-f]{6}$/i;
const normalize = value => String(value || '').normalize('NFKD').replace(/[\u0300-\u036f]/g, '').toLowerCase();

// Each requested color must match a different target color. An average or
// repeated nearest-neighbor match can hide a palette's missing accent.
export function paletteDistance(requested, target) {
  const source = requested.filter(color => hex.test(color)).slice(0, 5);
  const colors = target.filter(color => hex.test(color)).slice(0, 5);
  if (!source.length || source.length > colors.length) return Infinity;
  let states = new Map([[0, 0]]);
  for (const color of source) {
    const next = new Map();
    for (const [mask, score] of states) for (let index = 0; index < colors.length; index++) {
      if (mask & (1 << index)) continue;
      const key = mask | (1 << index), distance = score + oklabDistance(color, colors[index]);
      if (!next.has(key) || distance < next.get(key)) next.set(key, distance);
    }
    states = next;
  }
  return Math.min(...states.values()) / source.length;
}

export function createLibraryEngine(records, { approvedIds = [], aliases = {} } = {}) {
  const approved = new Set(approvedIds), ids = new Set();
  const index = records.filter(record => {
    if (!record || !approved.has(record.id) || ids.has(record.id) || !Array.isArray(record.colors) || record.colors.length !== 5 || !record.colors.every(color => hex.test(color))) return false;
    ids.add(record.id); return true;
  }).map((palette, order) => ({ palette, order, name: normalize(palette.name), text: normalize([palette.name, palette.description, palette.category, ...(aliases[palette.id] || []), ...(palette.tags || []), ...(palette.useCases || [])].join(' ')) }));
  return Object.freeze({
    size: index.length,
    search({ query = '', use = 'all', feeling = 'all', colors = [] } = {}) {
      const tokens = normalize(query).trim().split(/\s+/).filter(Boolean);
      const colorTokens = tokens.filter(token => hex.test(token));
      const words = tokens.filter(token => !hex.test(token));
      const requested = [...colors.filter(color => hex.test(color)), ...colorTokens].slice(0, 5);
      return index.filter(item => words.every(word => item.text.includes(word))
        && (use === 'all' || (useGroups[use] || []).some(word => item.text.includes(word)))
        && (feeling === 'all' || (feelingGroups[feeling] || []).some(word => item.text.includes(word))))
        .map(item => ({ ...item, distance: requested.length ? paletteDistance(requested, item.palette.colors) : null, exactName: words.length && item.name === words.join(' ') ? 1 : 0 }))
        .sort((a, b) => b.exactName - a.exactName || (requested.length ? a.distance - b.distance : 0) || a.order - b.order)
        .map(({ palette, distance }) => ({ palette, distance }));
    },
  });
}
