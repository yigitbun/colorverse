import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import vm from 'node:vm';

function html(page) {
  return readFileSync(new URL(`../dist/${page}`, import.meta.url), 'utf8');
}
function js(file) {
  return readFileSync(new URL(`../dist/${file}`, import.meta.url), 'utf8');
}

// project-store.js is an ES module; run its non-exported top-level functions in
// a throwaway vm context (same technique as test-release-readiness.mjs) instead
// of duplicating their logic here, so this exercises the real implementation.
const projectStoreSource = js('project-store.js').replace(/^import .*;\n/gm, '').replace('export async function', 'async function');
const projectStoreContext = vm.createContext({ document: { querySelector: () => null } });
vm.runInContext(projectStoreSource, projectStoreContext);
const { templateUseLabel, relativeTime, validProjectId } = projectStoreContext;

test('a saved template only offers direct Studio use once it has all five roles', () => {
  assert.equal(templateUseLabel({ colors: ['#111', '#222', '#333', '#444', '#555'] }), 'Use');
  assert.equal(templateUseLabel({ colors: ['#111', '#222'] }), 'Choose in My palettes');
  assert.equal(templateUseLabel({ colors: [] }), 'Choose in My palettes');
});

test('relativeTime never throws and reports coarser units as time passes', () => {
  const now = Date.now();
  assert.equal(relativeTime(now), 'just now');
  assert.equal(relativeTime(now - 5 * 60_000), '5 min ago');
  assert.equal(relativeTime(now - 3 * 3_600_000), '3 hr ago');
  assert.equal(relativeTime(now - 2 * 86_400_000), '2 days ago');
  assert.equal(relativeTime(now - 86_400_000), '1 day ago');
});

test('validProjectId only accepts a well-formed v4 UUID', () => {
  assert.equal(validProjectId('3fa85f64-5717-4562-b3fc-2c963f66afa6'), true);
  for (const bad of [undefined, '', 'not-a-uuid', '3fa85f64-5717-4562-b3fc-2c963f66afa', '../../etc/passwd']) {
    assert.equal(validProjectId(bad), false);
  }
});

test('every element id that account.js queries exists on the account page', () => {
  const source = js('account.js');
  const page = html('account/index.html');
  const ids = [...source.matchAll(/\$\('#([A-Za-z0-9]+)'\)/g)].map(m => m[1]);
  assert.ok(ids.length > 10, 'expected account.js to reference a realistic number of ids');
  for (const id of new Set(ids)) {
    assert.match(page, new RegExp(`id="${id}"`), `#${id} referenced by account.js is missing from account/index.html`);
  }
});

test('every element id that project-store.js queries exists on the studio page', () => {
  const source = js('project-store.js');
  const page = html('studio/index.html');
  const ids = [...source.matchAll(/\$\('#([A-Za-z0-9]+)'\)/g)].map(m => m[1]);
  assert.ok(ids.length > 10, 'expected project-store.js to reference a realistic number of ids');
  for (const id of new Set(ids)) {
    assert.match(page, new RegExp(`id="${id}"`), `#${id} referenced by project-store.js is missing from studio/index.html`);
  }
});

test('Account and the Studio project dialog announce status changes accessibly', () => {
  for (const [page, statusId] of [['account/index.html', 'accountStatus'], ['studio/index.html', 'projectMessage']]) {
    const source = html(page);
    const statusTag = source.match(new RegExp(`<[a-z]+[^>]*id="${statusId}"[^>]*>`))?.[0] || '';
    assert.match(statusTag, /role="status"/, `#${statusId} on ${page} should announce updates to assistive tech`);
    assert.match(statusTag, /aria-live="polite"/, `#${statusId} on ${page} should be a polite live region`);
  }
});

test('the email and code inputs on both entry points keep a visible or accessible label', () => {
  for (const [page, emailId, codeId] of [
    ['account/index.html', 'accountEmail', 'accountCode'],
    ['studio/index.html', 'projectEmail', 'projectCode'],
  ]) {
    const source = html(page);
    for (const id of [emailId, codeId]) {
      assert.match(source, new RegExp(`for="${id}"`), `#${id} on ${page} has no associated <label for>`);
    }
  }
});

test('project-store.js registers its auth-state listener before awaiting the initial session, guarded against duplicate loads', () => {
  const source = js('project-store.js');
  const listenerIndex = source.indexOf('client.auth.onAuthStateChange');
  const getSessionIndex = source.indexOf('client.auth.getSession()');
  assert.ok(listenerIndex > -1 && getSessionIndex > -1, 'expected both the listener and the initial getSession call');
  assert.ok(listenerIndex < getSessionIndex, 'the auth-state listener should be registered before the initial session is awaited');
  assert.match(source, /changedUser \|\| event === 'SIGNED_IN'/);
});
