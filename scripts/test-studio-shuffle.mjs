// Unit check for STU-14: the Shuffle control mixes the visible palette member
// order with a real Fisher–Yates permutation. Runs the real functions from
// app.js (randomPaletteOrder, shufflePalette, commitWorkspace) against the
// real workspace reducers in studio-members.js, with only the DOM, storage
// and (optionally) crypto stubbed. No browser needed; see
// test-studio-shuffle-browser.mjs for the rendered/layout checks.
import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import test from 'node:test';
import * as members from '../dist/studio-members.js';

const read = path => readFile(new URL(`../dist/${path}`, import.meta.url), 'utf8');
const [app, studio, studioStyles] = await Promise.all([read('app.js'), read('studio/index.html'), read('studio-editor.css')]);
const functionBody = name => app.slice(app.indexOf(`function ${name}(`), app.indexOf('\n}\n', app.indexOf(`function ${name}(`)));

// Distinct, order-traceable colors: #000001, #000002, ... so a permutation can
// always be read back off the resulting HEX values without ambiguity.
const palette = count => Array.from({ length: count }, (_, index) => `#${(index + 1).toString(16).padStart(6, '0').toUpperCase()}`);

// A non-identity role map for 6+ members, distinct and in range, so role
// preservation is actually exercised rather than accidentally trivial.
const customRoleIndex = count => [count - 1, 0, Math.floor(count / 2), 1, 2];
const workspaceOf = count => members.workspaceFromColors(palette(count), count >= 6 ? customRoleIndex(count) : undefined);

function runRandomOrder(count, rollFn) {
  const scope = { window: { crypto: rollFn ? { getRandomValues: rollFn } : globalThis.crypto } };
  const body = [`${functionBody('randomPaletteOrder')}\n}`, `return randomPaletteOrder(${count});`].join('\n');
  return new Function(...Object.keys(scope), body)(...Object.values(scope));
}

// Runs the real shufflePalette() once against a sandboxed `current`/module state
// and returns everything a caller could observe afterward.
function runShuffle({ workspace, activeColorIndex = 0, shadeSourceColors, rollFn }) {
  const status = { textContent: '' };
  const trackCalls = [];
  const scope = {
    ...members,
    status,
    trackCalls,
    $: selector => (selector === '#paletteOrderStatus' ? status : null),
    persistPalette: () => true,
    renderSelection: () => {},
    track: (name, detail) => trackCalls.push({ name, detail }),
    window: { crypto: rollFn ? { getRandomValues: rollFn } : globalThis.crypto },
  };
  const prelude = [
    `let current = { id: 'custom-test', workspace: ${JSON.stringify(workspace)} };`,
    'current.colors = roleColors(current.workspace);',
    `let activeColorIndex = ${activeColorIndex};`,
    `let shadeSourceColors = ${JSON.stringify(shadeSourceColors || workspace.members)};`,
    'let shuffleUndo = null;',
  ].join('\n');
  const names = ['randomPaletteOrder', 'shufflePalette', 'commitWorkspace'];
  const body = [
    prelude,
    ...names.map(name => `${functionBody(name)}\n}`),
    'shufflePalette();',
    'return { workspace: current.workspace, activeColorIndex, shadeSourceColors, shuffleUndo, status: status.textContent, trackCalls };',
  ].join('\n');
  return new Function(...Object.keys(scope), body)(...Object.values(scope));
}

const identityRoll = buffer => { for (let index = 0; index < buffer.length; index += 1) buffer[index] = index; return buffer; };

test('randomPaletteOrder always returns a valid, non-identity permutation (2–24 members)', () => {
  for (const count of [2, 3, 4, 5, 6, 8, 10, 16, 24]) {
    for (let trial = 0; trial < 25; trial += 1) {
      const order = runRandomOrder(count);
      assert.deepEqual([...order].sort((a, b) => a - b), Array.from({ length: count }, (_, index) => index), `${count}: a permutation of every index`);
      assert.ok(order.some((value, index) => value !== index), `${count}: visibly different from the original order`);
    }
  }
});

test('prefers crypto.getRandomValues and falls back to Math.random when unavailable', () => {
  let calls = 0;
  const order = runRandomOrder(6, buffer => { calls += 1; return identityRoll(buffer).map((_, i) => (i + 3) % 6); });
  assert.ok(calls > 0, 'crypto.getRandomValues is used when present');
  assert.equal(order.length, 6);
  // No crypto at all: the Math.random fallback still returns a valid permutation.
  const scope = { window: {} };
  const body = [`${functionBody('randomPaletteOrder')}\n}`, 'return randomPaletteOrder(9);'].join('\n');
  const fallback = new Function(...Object.keys(scope), body)(...Object.values(scope));
  assert.deepEqual([...fallback].sort((a, b) => a - b), Array.from({ length: 9 }, (_, i) => i));
});

test('adjusts deterministically instead of looping forever if every attempt lands on identity', () => {
  const order = runRandomOrder(5, identityRoll);
  assert.notDeepEqual(order, [0, 1, 2, 3, 4], 'never returns the original order');
  assert.deepEqual(order, [1, 0, 2, 3, 4], 'falls back to swapping the first two positions');
});

test('shuffle reorders members only: same colors, no HEX added/edited/removed, for 2–24 members', () => {
  for (const count of [2, 3, 4, 5, 6, 8, 10, 24]) {
    const workspace = workspaceOf(count);
    const shadeSourceColors = workspace.members.map((_, index) => `#SHADE${index}`);
    const activeColorIndex = Math.floor(count / 2);
    const result = runShuffle({ workspace, activeColorIndex, shadeSourceColors });

    assert.deepEqual([...result.workspace.members].sort(), [...workspace.members].sort(), `${count}: same set of colors`);
    assert.notDeepEqual(result.workspace.members, workspace.members, `${count}: one click visibly changes order`);
    assert.equal(result.workspace.members.length, count, `${count}: member count unchanged`);

    if (count === 5) {
      assert.deepEqual(result.workspace.roleIndex, [0, 1, 2, 3, 4], '5-member: identity role map keeps preview following position');
      assert.deepEqual(members.roleColors(result.workspace), result.workspace.members, '5-member: preview equals the new member order');
    } else {
      assert.ok(members.validRoleIndex(result.workspace.roleIndex, count), `${count}: role map stays valid`);
      assert.deepEqual(members.roleColors(result.workspace), members.roleColors(workspace), `${count}: preview/role colors unchanged by shuffle`);
    }

    // shadeSourceColors and the active color travel with their member's identity, not its old index.
    result.workspace.members.forEach((color, newIndex) => {
      const originalIndex = workspace.members.indexOf(color);
      assert.equal(result.shadeSourceColors[newIndex], shadeSourceColors[originalIndex], `${count}: shade source follows color ${color} to its new slot`);
    });
    assert.equal(result.workspace.members[result.activeColorIndex], workspace.members[activeColorIndex], `${count}: the active color stays selected after moving`);

    assert.match(result.status, new RegExp(`^Shuffled ${count} colors into a new order\\. Colors are unchanged\\.$`));
    assert.deepEqual(result.trackCalls, [{ name: 'color_edit', detail: { method: 'shuffle' } }]);

    assert.deepEqual(result.shuffleUndo.workspace, workspace, `${count}: undo snapshot keeps the pre-shuffle workspace`);
    assert.deepEqual(result.shuffleUndo.shadeSourceColors, shadeSourceColors, `${count}: undo snapshot keeps the pre-shuffle shade sources`);
    assert.equal(result.shuffleUndo.activeColorIndex, activeColorIndex, `${count}: undo snapshot keeps the pre-shuffle active color`);
  }
});

test('commitWorkspace clears the shuffle snapshot for every other writer, and the shuffle call itself preserves it', () => {
  const workspace = workspaceOf(5);
  const scope = { ...members, $: () => null, persistPalette: () => true, renderSelection: () => {}, track: () => {}, window: { crypto: globalThis.crypto } };
  const prelude = [
    `let current = { id: 'custom-test', workspace: ${JSON.stringify(workspace)} };`,
    'current.colors = roleColors(current.workspace);',
    'let activeColorIndex = 0;',
    `let shadeSourceColors = ${JSON.stringify(workspace.members)};`,
    'let shuffleUndo = null;',
  ].join('\n');
  const body = [
    prelude,
    `${functionBody('randomPaletteOrder')}\n}`,
    `${functionBody('shufflePalette')}\n}`,
    `${functionBody('commitWorkspace')}\n}`,
    'shufflePalette();',
    'const afterShuffle = shuffleUndo;',
    // Simulate any other edit going through the shared funnel with its default (clearing) form.
    'commitWorkspace(current.workspace);',
    'return { afterShuffle, afterOtherEdit: shuffleUndo };',
  ].join('\n');
  const { afterShuffle, afterOtherEdit } = new Function(...Object.keys(scope), body)(...Object.values(scope));
  assert.ok(afterShuffle, 'shuffle keeps its own undo snapshot alive');
  assert.equal(afterOtherEdit, null, 'any other commit clears the one-step shuffle undo');
});

test('markup: a compact icon-only Shuffle sits right-aligned on the palette name row, not in its own block', () => {
  const inspector = studio.slice(studio.indexOf('<aside class="palette-inspector"'), studio.indexOf('</aside>'));
  const nameRowIndex = inspector.indexOf('class="palette-name-row"');
  const nameIndex = inspector.indexOf('id="paletteName"');
  const shuffleIndex = inspector.indexOf('id="paletteShuffle"');
  const undoIndex = inspector.indexOf('id="paletteShuffleUndo"');
  const countIndex = inspector.indexOf('id="paletteCount"');
  const railIndex = inspector.indexOf('id="paletteRoles"');
  assert.ok([nameRowIndex, nameIndex, shuffleIndex, undoIndex, countIndex, railIndex].every(index => index > -1), 'all markers are present');
  assert.ok(nameRowIndex < nameIndex && nameIndex < shuffleIndex && shuffleIndex < undoIndex, 'name, then Shuffle, then Undo, all on the same row');
  assert.ok(undoIndex < countIndex && countIndex < railIndex, 'the name row is above the count and the member rail, not between them');
  assert.doesNotMatch(inspector, /class="palette-shuffle-row"/, 'the old full-width Shuffle block is removed');
  assert.match(inspector, /<button class="palette-icon-action" id="paletteShuffle"[^>]*aria-label="[^"]*"[^>]*title="[^"]*mix[^"]*"[^>]*><svg/i, 'icon-only button with an aria-label and a tooltip that plainly says it mixes order');
  assert.doesNotMatch(inspector, /id="paletteShuffle"[^>]*><svg[^>]*>.*?<\/svg><span>/, 'no visible text label; icon-only');
  assert.match(inspector, /<button class="palette-icon-action palette-shuffle-undo" id="paletteShuffleUndo"[^>]*aria-label="[^"]*"[^>]*><svg/, 'Undo is an equally compact icon-only peer, not a text button');
});

test('markup: Shuffle/Undo add no extra row and stay hidden together while the rail is collapsed', () => {
  assert.doesNotMatch(studioStyles, /\.palette-shuffle-row/, 'the removed block has no leftover styling');
  assert.match(studioStyles, /\.palette-add-toggle\{[^}]*border:1px dashed/, 'sanity: add-color keeps its dashed treatment, untouched');
  // The whole name row (Shuffle + Undo included) hides with the palette name while
  // collapsed: two icon controls do not fit the 64px collapsed rail safely.
  assert.match(studioStyles, /\.is-palette-collapsed \.palette-inspector \.eyebrow,\.is-palette-collapsed \.palette-name-row,/, 'the name row hides as a unit while collapsed, same as the palette name did before');
});

test('wiring: clicking Shuffle calls shufflePalette; Undo restores the snapshot, self-clears, and returns focus', () => {
  const shuffleClick = app.slice(app.indexOf("$('#paletteShuffle')?.addEventListener"), app.indexOf("$('#paletteShuffleUndo')?.addEventListener"));
  assert.match(shuffleClick, /shufflePalette\(\)/);
  const undoClick = app.slice(app.indexOf("$('#paletteShuffleUndo')?.addEventListener"), app.indexOf("$('#paletteAddToggle')?.addEventListener"));
  assert.match(undoClick, /if \(!shuffleUndo\) return;/, 'no-op once the one-step snapshot is gone');
  assert.match(undoClick, /shadeSourceColors = restore\.shadeSourceColors/);
  assert.match(undoClick, /activeColorIndex = restore\.activeColorIndex/);
  assert.match(undoClick, /commitWorkspace\(restore\.workspace\)/, 'restoring uses the default form, so undo consumes itself rather than allowing redo');
  assert.doesNotMatch(undoClick, /commitWorkspace\(restore\.workspace,[^)]*keepShuffleUndo/, 'no accidental history stack');
  assert.match(undoClick, /\$\('#paletteShuffle'\)\?\.focus\(/, 'focus returns to Shuffle once Undo disappears');
});

test('renderPaletteRoles keeps the Undo button in sync with the live shuffle snapshot', () => {
  const renderBody = functionBody('renderPaletteRoles');
  assert.match(renderBody, /paletteShuffleUndo/);
  assert.match(renderBody, /shuffleUndoButton\.hidden = !shuffleUndo/);
});
