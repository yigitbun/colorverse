export const MIN_COLORS = 2;
export const MAX_COLORS = 24;
export const DRAFT_KEY = 'colorverse-palette-draft';
export const STUDIO_HANDOFF_KEY = 'colorverse-member-palette';
export const normalizeHex = value => {
  const text = String(value || '').trim();
  return /^#?[0-9a-f]{6}$/i.test(text) ? `#${text.replace('#', '').toUpperCase()}` : null;
};

export function validColors(colors) {
  return Array.isArray(colors) && colors.length >= MIN_COLORS && colors.length <= MAX_COLORS
    && colors.every(color => typeof color === 'string' && /^#[0-9a-f]{6}$/i.test(color));
}

export function sanitizeDraft(value) {
  if (!value || !validColors(value.colors)) return null;
  return {
    name: String(value.name || 'Untitled palette').slice(0, 120),
    collection: String(value.collection || 'My palettes').slice(0, 100),
    colors: value.colors.map(color => color.toUpperCase()),
    referenceKey: typeof value.referenceKey === 'string' && /^[a-z0-9-]{1,120}$/.test(value.referenceKey) ? value.referenceKey : null,
  };
}

export function readDraft(storage, key = DRAFT_KEY) {
  try { return sanitizeDraft(JSON.parse(storage.getItem(key) || 'null')); } catch { return null; }
}

// Fixed Studio roles stay intact. Larger saved palettes keep all their colors;
// five explicitly chosen positions form a separate Studio working copy.
export function studioColors(colors, indices) {
  if (!validColors(colors) || !Array.isArray(indices) || indices.length !== 5
      || new Set(indices).size !== 5 || indices.some(index => !Number.isInteger(index) || index < 0 || index >= colors.length)) return null;
  return indices.map(index => colors[index]);
}
