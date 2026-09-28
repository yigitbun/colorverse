import { oklab, oklch } from './color.js?v=2';

// Nearby alternatives for one selected color. They keep its lightness and
// chroma, so a warm grey stays a grey instead of jumping to a saturated hue.
export const NEUTRAL_CHROMA = .035;

export function colorCoordinates(hex) {
  const [lightness, a, b] = oklab(hex);
  return { lightness, chroma: Math.hypot(a, b), hue: (Math.atan2(b, a) * 180 / Math.PI + 360) % 360 };
}

const round = value => Math.round(value * 1e4) / 1e4;

export function colorAlternatives(hex, limit = 8) {
  if (!/^#[0-9a-f]{6}$/i.test(hex)) return [];
  const source = hex.toUpperCase();
  const { lightness, chroma, hue } = colorCoordinates(source);
  const neutral = chroma < NEUTRAL_CHROMA;
  const steps = neutral
    // Neutrals: the same grey slightly lighter/deeper, then a warmer and a cooler cast within the neutral band.
    ? [[0, -.04, 0], [0, .04, 0], [0, -.08, 0], [0, .08, 0], ['warm', 0, 0], ['cool', 0, 0], ['warm', -.05, 0], ['cool', .05, 0]]
    // Colors: small hue turns at the same lightness and chroma, then gentle lightness steps.
    : [[-12, 0, 0], [12, 0, 0], [-24, 0, 0], [24, 0, 0], [0, -.06, 0], [0, .06, 0], [-36, 0, 0], [36, 0, 0]];
  const neutralChroma = Math.min(Math.max(chroma, .012), NEUTRAL_CHROMA - .01);
  const candidates = steps.map(([turn, lift]) => {
    const nextLightness = round(Math.min(.98, Math.max(.06, lightness + lift)));
    if (!neutral) return oklch(nextLightness, round(chroma), hue + turn);
    if (turn === 'warm') return oklch(nextLightness, round(neutralChroma), 70);
    if (turn === 'cool') return oklch(nextLightness, round(neutralChroma), 250);
    return oklch(nextLightness, round(chroma), hue);
  }).map(value => value.toUpperCase());
  return [...new Set(candidates)].filter(value => value !== source).slice(0, limit);
}
