import assert from 'node:assert/strict';
import test from 'node:test';
import {
  CONSENT_LIFETIME,
  CONSENT_VERSION,
  analyticsEvent,
  parseConsent,
  safePageLocation,
} from '../dist/privacy.js';

test('consent accepts only the current, unexpired shape', () => {
  const now = 1_800_000_000_000;
  const valid = JSON.stringify({ version: CONSENT_VERSION, analytics: true, at: now - 1_000 });
  assert.deepEqual(parseConsent(valid, now), { version: CONSENT_VERSION, analytics: true, at: now - 1_000 });
  assert.equal(parseConsent(JSON.stringify({ version: 99, analytics: true, at: now }), now), null);
  assert.equal(parseConsent(JSON.stringify({ version: CONSENT_VERSION, analytics: 'yes', at: now }), now), null);
  assert.equal(parseConsent(JSON.stringify({ version: CONSENT_VERSION, analytics: false, at: now - CONSENT_LIFETIME }), now), null);
  assert.equal(parseConsent('not-json', now), null);
});

test('analytics page location drops query strings and fragments', () => {
  assert.equal(safePageLocation('https://colorverse.byigit.dev/studio/?project=private#draft'), 'https://colorverse.byigit.dev/studio/');
  assert.equal(safePageLocation('invalid'), '');
});

test('analytics events reject unknown names and user-authored values', () => {
  assert.deepEqual(analyticsEvent('palette_export', { format: 'css', projectName: 'Private client' }), {
    name: 'palette_export',
    detail: { format: 'css' },
  });
  assert.deepEqual(analyticsEvent('context_preview', { context: 'private-project' }), {
    name: 'context_preview',
    detail: {},
  });
  assert.deepEqual(analyticsEvent('lab_feedback', { experiment: 'roomkit', response: 'use', note: 'private' }), {
    name: 'lab_feedback',
    detail: { experiment: 'roomkit', response: 'use' },
  });
  assert.equal(analyticsEvent('form_text', { value: 'secret' }), null);
});
