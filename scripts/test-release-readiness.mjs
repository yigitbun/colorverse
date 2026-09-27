import test from 'node:test';
import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import vm from 'node:vm';
import { savePaletteHandoff } from '../dist/palette-handoff.js';
import { canReviewCandidates, homeCandidateFor, reviewCandidates } from '../dist/curation.js';
import { analyticsEvent } from '../dist/privacy.js';
import { retiredReviewPalettes } from '../dist/retired-review-palettes.js';

const read = path => readFile(new URL(`../${path}`, import.meta.url), 'utf8');

test('only owner-supplied AI studies can bypass final Library approval on Explore', () => {
  for (const host of ['localhost', '127.0.0.1', '[::1]']) {
    assert.equal(canReviewCandidates(host), true);
    assert.equal(homeCandidateFor(reviewCandidates[0].id, [], host), reviewCandidates[0]);
  }
  for (const host of ['colorverse.byigit.dev', 'colorverse-85o.pages.dev', 'localhost.example.org', '127.0.0.1.example.org', '']) {
    assert.equal(canReviewCandidates(host), false);
    assert.equal(homeCandidateFor(reviewCandidates[0].id, [], host), reviewCandidates[0]);
  }
  for (const host of ['localhost', 'colorverse.byigit.dev']) {
    assert.equal(homeCandidateFor(retiredReviewPalettes[0].id, retiredReviewPalettes, host), undefined);
    assert.equal(homeCandidateFor('unapproved', [{ id: 'unapproved', image: 'external.jpg' }], host), undefined);
  }
});

test('palette handoff writes exact colors and authorizes navigation only on success', () => {
  const palette = { id: 'atlas-custom', colors: ['#123456', '#ABCDEF', '#000000', '#FFFFFF', '#CCDDEE'] };
  let stored;
  assert.equal(savePaletteHandoff(palette, () => ({ setItem(key, value) { stored = { key, value }; } })), true);
  assert.equal(stored.key, 'colorverse-current-palette');
  assert.deepEqual(JSON.parse(stored.value), palette);
});

test('denied storage getter and failed writes block palette handoff with a useful error', () => {
  for (const getStorage of [() => { throw new Error('denied'); }, () => ({ setItem() { throw new Error('quota'); } })]) {
    const messages = [];
    assert.equal(savePaletteHandoff({ colors: ['#000000'] }, getStorage, value => messages.push(value)), false);
    assert.equal(messages.length, 1);
    assert.match(messages[0], /palette is still here.*copy it/i);
  }
});

test('Account SDK failure leaves Save and Projects usable with a visible local-only message', async () => {
  const source = (await read('dist/project-store.js')).replace(/^import .*;\n/gm, '').replace('export async function', 'async function');
  const elements = new Map();
  const element = selector => {
    if (!elements.has(selector)) elements.set(selector, {
      hidden: false, textContent: '', dataset: {}, events: {}, open: false,
      addEventListener(name, handler) { this.events[name] = handler; },
      querySelectorAll() { return []; }, showModal() { this.open = true; }, close() { this.open = false; },
    });
    return elements.get(selector);
  };
  const context = vm.createContext({ document: { querySelector: element }, location: { hash: '' },
    getAccountClient: async () => { throw new Error('SDK offline'); } });
  vm.runInContext(source, context);
  await context.initProjectWorkspace({});
  for (const button of ['#saveProject', '#openProjects']) {
    element('#projectDialog').open = false;
    element(button).events.click();
    assert.equal(element('#projectDialog').open, true);
    assert.match(element('#projectMessage').textContent, /Account services are unavailable/);
    assert.equal(element('#projectMessage').dataset.kind, 'error');
    assert.equal(element('#projectAuthForm').hidden, true);
    assert.equal(element('#projectWorkspaceView').hidden, true);
  }
});

test('core public tool routes include a useful static no-JavaScript message', async () => {
  for (const route of ['index.html', 'account/index.html', 'explore/index.html', 'extract/index.html', 'studio/index.html', 'inspiration/index.html', 'community/index.html', 'lab/index.html']) {
    assert.match(await read(`dist/${route}`), /<noscript>[\s\S]*Enable JavaScript[\s\S]*<\/noscript>/, route);
  }
});

test('Studio does not discard private project state or claim success when sign-out fails', async () => {
  const source = await read('dist/project-store.js');
  const handler = source.match(/signOut\.addEventListener\('click', async \(\) => \{([\s\S]*?)\n  \}\);/)[1];
  const messages = [];
  const context = vm.createContext({ signOut: { disabled: false },
    client: { auth: { signOut: async () => ({ error: new Error('offline') }) } },
    activeProjectId: 'saved-project', dirty: true, setMessage: (text, kind) => messages.push({ text, kind }) });
  await vm.runInContext(`(async () => {${handler}\n})()`, context);
  assert.equal(context.activeProjectId, 'saved-project');
  assert.equal(context.dirty, true);
  assert.equal(context.signOut.disabled, false);
  assert.equal(messages.length, 1);
  assert.equal(messages[0].kind, 'error');
  assert.match(messages[0].text, /Sign-out could not be completed/);
});

test('new funnel events discard email, codes, project names and palette values', () => {
  const sensitive = { email: 'private@example.org', token: '12345678', colors: ['#123456'], name: 'Private client' };
  assert.deepEqual(analyticsEvent('account_access', { ...sensitive, step: 'requested' }), { name: 'account_access', detail: { step: 'requested' } });
  assert.deepEqual(analyticsEvent('palette_started', { ...sensitive, source: 'globe' }), { name: 'palette_started', detail: { source: 'globe' } });
  assert.deepEqual(analyticsEvent('account_access', { step: sensitive.email }), { name: 'account_access', detail: {} });
});

test('release live checks validate code entry without creating accounts or sending emails', async () => {
  const source = await read('scripts/test-live-mvp.mjs');
  assert.match(source, /--candidate/);
  assert.match(source, /autocomplete="one-time-code"/);
  assert.match(source, /Real inbox authentication is a separate release gate/);
  assert.doesNotMatch(source, /signInWithOtp|\/auth\/v1\/(?:otp|signup|verify)/);
});
