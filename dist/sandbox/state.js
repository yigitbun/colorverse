import { aiStudies } from '../ai-studies.js?v=2';
import { sanitizeColorway } from '../colorway-kit.js?v=1';
import { suggestPaletteName } from '../palette-names.js?v=1';
export const SANDBOX_KEY = 'colorverse-sandbox-v1';
export function initialSandbox() {
  const study = aiStudies[1];
  return { version: 1, name: study.name, conceptId: study.id, active: 2, ...sanitizeColorway(study), baseline: null };
}
export function sanitizeSandbox(value) {
  const colorway = sanitizeColorway(value);
  if (!colorway || value.version !== 1) return null;
  return { version: 1, name: typeof value.name === 'string' && value.name.trim() ? value.name.slice(0, 120) : suggestPaletteName(colorway.colors),
    conceptId: aiStudies.some(study => study.id === value.conceptId) ? value.conceptId : null,
    active: Number.isInteger(value.active) && value.active >= 0 && value.active < 5 ? value.active : 0,
    ...colorway, baseline: sanitizeColorway(value.baseline) };
}
export function readSandbox(getStorage) {
  try { return sanitizeSandbox(JSON.parse(getStorage().getItem(SANDBOX_KEY))) || initialSandbox(); }
  catch { return initialSandbox(); }
}
export function writeSandbox(value, getStorage) {
  const clean = sanitizeSandbox(value);
  if (!clean) return false;
  try { getStorage().setItem(SANDBOX_KEY, JSON.stringify(clean)); return true; } catch { return false; }
}
