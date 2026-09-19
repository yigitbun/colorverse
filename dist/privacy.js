export const CONSENT_KEY = 'colorverse-consent';
export const CONSENT_VERSION = 1;
export const CONSENT_LIFETIME = 180 * 24 * 60 * 60 * 1000;

export function parseConsent(raw, now = Date.now()) {
  try {
    const value = JSON.parse(raw);
    if (value?.version !== CONSENT_VERSION || typeof value.analytics !== 'boolean' || !Number.isFinite(value.at) || value.at > now || now - value.at >= CONSENT_LIFETIME) return null;
    return { version: CONSENT_VERSION, analytics: value.analytics, at: value.at };
  } catch { return null; }
}

export function safePageLocation(value) {
  try { const url = new URL(value); return url.origin + url.pathname; } catch { return ''; }
}

// Only product actions and fixed, non-user-authored values can reach Analytics.
export function analyticsEvent(name, detail = {}) {
  const choices = {
    palette_open: { source: ['library', 'globe', 'image', 'community', 'project'] },
    palette_export: { format: ['css', 'scss', 'tailwind', 'json', 'hex'] },
    color_edit: { method: ['globe', 'shade', 'alternative', 'swap'] },
    context_preview: { context: ['landing', 'presentation', 'social', 'shop', 'material', 'packaging', 'dashboard', 'menu'] },
    image_extract: { result: ['success', 'error'] },
    lab_feedback: { experiment: ['roomkit'], response: ['use', 'gimmick'] },
    project_save: { storage: ['local', 'cloud'] },
    project_resume: { storage: ['local', 'cloud'] },
  };
  if (!Object.hasOwn(choices, name)) return null;
  const clean = {};
  for (const [key, allowed] of Object.entries(choices[name])) if (allowed.includes(detail[key])) clean[key] = detail[key];
  return { name, detail: clean };
}
