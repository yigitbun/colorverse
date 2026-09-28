import { contrast, oklab, oklabDistance, oklch } from './color.js?v=2';

// Nearby alternatives for one selected color. They keep its lightness and
// chroma, so a warm grey stays a grey instead of jumping to a saturated hue.
export const NEUTRAL_CHROMA = .035;

// Small, explicit edits of one color, not palette recommendations. A neutral
// stays neutral; "Richer" is unavailable when there is no meaningful hue.
export function quickColorAdjustments(hex) {
  if (!/^#[0-9a-f]{6}$/i.test(hex)) return [];
  const source = hex.toUpperCase();
  const { lightness, chroma, hue } = colorCoordinates(source);
  const neutral = chroma < .003;
  const steps = [
    ['lighter', 'Lighter', Math.min(1, lightness + .06), chroma],
    ['darker', 'Darker', Math.max(0, lightness - .06), chroma],
    ['softer', 'Softer', lightness, chroma * .72],
    ['richer', 'Richer', lightness, Math.min(.34, chroma * 1.2)],
  ];
  return steps.map(([id, label, nextLightness, nextChroma]) => {
    const color = oklch(nextLightness, nextChroma, hue).toUpperCase();
    return { id, label, color, disabled: color === source || (neutral && (id === 'softer' || id === 'richer')) };
  });
}

export function colorCoordinates(hex) {
  const [lightness, a, b] = oklab(hex);
  return { lightness, chroma: Math.hypot(a, b), hue: (Math.atan2(b, a) * 180 / Math.PI + 360) % 360 };
}

const round = value => Math.round(value * 1e4) / 1e4;

const PRIMARY_STEPS = {
  // Neutrals: the same grey slightly lighter/deeper, then a warmer and a cooler cast within the neutral band.
  neutral: [[0, -.04], [0, .04], [0, -.08], [0, .08], ['warm', 0], ['cool', 0], ['warm', -.05], ['cool', .05]],
  // Colors: small hue turns at the same lightness and chroma, then gentle lightness steps.
  color: [[-12, 0], [12, 0], [-24, 0], [24, 0], [0, -.06], [0, .06], [-36, 0], [36, 0]],
};
// Equally modest steps, used only when too few primary steps suit the palette.
const FALLBACK_STEPS = {
  neutral: [[0, -.02], [0, .02], ['warm', .04], ['cool', -.04], [0, -.06], [0, .06], ['warm', -.02], ['cool', .02]],
  color: [[0, -.03], [0, .03], [-12, -.04], [12, .04], [-12, .04], [12, -.04], [-6, 0], [6, 0]],
};

function nearbyColors(source, steps) {
  const { lightness, chroma, hue } = colorCoordinates(source);
  const neutral = chroma < NEUTRAL_CHROMA;
  const neutralChroma = Math.min(Math.max(chroma, .012), NEUTRAL_CHROMA - .01);
  const candidates = steps[neutral ? 'neutral' : 'color'].map(([turn, lift]) => {
    const nextLightness = round(Math.min(.98, Math.max(.06, lightness + lift)));
    if (!neutral) return oklch(nextLightness, round(chroma), hue + turn);
    if (turn === 'warm') return oklch(nextLightness, round(neutralChroma), 70);
    if (turn === 'cool') return oklch(nextLightness, round(neutralChroma), 250);
    return oklch(nextLightness, round(chroma), hue);
  }).map(value => value.toUpperCase());
  return [...new Set(candidates)].filter(value => value !== source);
}

export function colorAlternatives(hex, limit = 8) {
  if (!/^#[0-9a-f]{6}$/i.test(hex)) return [];
  return nearbyColors(hex.toUpperCase(), PRIMARY_STEPS).slice(0, limit);
}

// Below this OKLab distance two colors read as practically the same swatch.
export const INDISTINGUISHABLE = .03;
const SEPARATIONS = [4.5, 3];

// The same nearby candidates, checked against the other authored members.
// Only the selected member would change; preview support roles are not input.
// A candidate is dropped when it duplicates or nearly duplicates another
// member, or loses a light/dark separation (WCAG 3:1 or 4.5:1) the selected
// color already has with one. The rest are ordered by how closely they keep
// the selected color's distances to the other members, then by the size of
// the change. A conservative heuristic, not a quality score; fewer than
// `limit` results is expected when little nearby suits the palette.
export function paletteAlternatives(hex, members = [], selectedIndex = -1, limit = 8) {
  if (!/^#[0-9a-f]{6}$/i.test(hex)) return [];
  const source = hex.toUpperCase();
  const valid = (Array.isArray(members) ? members : []).map(value => typeof value === 'string' && /^#[0-9a-f]{6}$/i.test(value) ? value.toUpperCase() : null);
  const skip = valid[selectedIndex] ? selectedIndex : valid.indexOf(source);
  const others = valid.filter((value, index) => value && index !== skip);
  if (!others.length) return colorAlternatives(source, limit);
  const baseline = others.map(other => ({ other, distance: oklabDistance(source, other), separation: contrast(source, other) }));
  const suits = value => baseline.every(({ other, separation }) => oklabDistance(value, other) >= INDISTINGUISHABLE
    && SEPARATIONS.every(level => separation < level || contrast(value, other) >= level));
  const cost = value => round(baseline.reduce((sum, { other, distance }) => sum + Math.abs(oklabDistance(value, other) - distance), 0) / baseline.length
    + oklabDistance(value, source) / 4);
  const ranked = list => list.filter(suits).map((value, order) => ({ value, order, cost: cost(value) }))
    .sort((a, b) => a.cost - b.cost || a.order - b.order).map(({ value }) => value);
  const chosen = ranked(nearbyColors(source, PRIMARY_STEPS)).slice(0, limit);
  for (const value of ranked(nearbyColors(source, FALLBACK_STEPS))) {
    if (chosen.length >= limit) break;
    // A fallback must differ visibly from the suggestions already shown.
    if (chosen.every(shown => oklabDistance(shown, value) >= .01)) chosen.push(value);
  }
  return chosen;
}
