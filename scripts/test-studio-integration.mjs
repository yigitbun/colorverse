import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import test from 'node:test';
import { readCurrentColors } from '../dist/study-gallery.js';
const read = path => readFile(new URL(`../dist/${path}`, import.meta.url), 'utf8');
const [app, studio, extractCss, account, header, photoCss] = await Promise.all([read('app.js'), read('studio/index.html'), read('extract-workspace.css'), read('account/index.html'), read('header-controls.css'), read('photo-colorway.css')]);

test('photo renderer is reused across role edits and released on leaving its view', () => {
  assert.match(app, /if \(!host\) \{ destroyPhotoPreview\(\); return; \}/);
  assert.match(app, /if \(!photoPreview\) \{/);
  assert.match(app, /host\.append\(photoPreview\.element\)/);
  assert.match(app, /photoPreview\.update\(colorway\)/);
  assert.match(app, /photoPreview\.setBaseline\(baseline\)/);
  assert.match(app, /photoPreview\?\.destroy\(\)/);
  assert.match(studio, /photo-colorway\.css\?v=6/);
});
test('PNG exports visible photo canvases, including locked comparison, not the old vector', () => {
  assert.match(app, /photo-colorway-stage:not\(\[hidden\]\)/);
  assert.match(app, /context\.drawImage\(stage\.canvas, x, top\)/);
  assert.match(app, /canvas\.toBlob\(resolve, 'image\/png'\)/);
  assert.match(app, /PHOTO_COLORWAY_NOTE/);
  assert.match(app, /exportButton\.disabled = state !== 'ready'/);
  assert.match(app, /retry\.hidden = state !== 'error'/);
  assert.doesNotMatch(app, /downloadColorway/);
});
test('Library matching uses five explicit preview colors, not arbitrary first members', () => {
  const members = ['#111111','#222222','#333333','#444444','#555555','#666666','#777777','#888888'];
  const workspace = {v:1,members,roleIndex:[7,1,2,3,5]};
  const storage = value => ({getItem: () => JSON.stringify(value)});
  assert.deepEqual(readCurrentColors(storage({workspace})), ['#888888','#222222','#333333','#444444','#666666']);
  assert.deepEqual(readCurrentColors(storage({workspace:{...workspace,roleIndex:[0,0,1,2,3]}})), []);
  assert.deepEqual(readCurrentColors(storage({colors:members})), []);
  assert.deepEqual(readCurrentColors(storage({colors:members.slice(0,5)})), members.slice(0,5));
});
test('larger Extract lists switch to readable rows on narrow screens', () => {
  assert.match(extractCss, /@media\(max-width:700px\)\{\s*\.extract-page \.extracted-swatches:has\(>:nth-child\(6\)\)\{flex-direction:column;width:100%;min-width:0\}/);
  assert.match(extractCss, /min-height:48px/);
});
test('shared clients and account handoff are cache-busted and narrow headers use two columns', () => {
  assert.match(account, /\/account\.js\?v=10/);
  assert.match(studio, /\/app\.js\?v=107/);
  assert.match(header, /grid-template-columns:minmax\(0,1fr\) auto;column-gap:6px/);
});
test('photo size stays bounded and new serum colorways use all five colors without replacing saved mappings', () => {
  assert.match(photoCss, /\.photo-preview-kit \.photo-colorway-stage\{width:100%;max-width:420px\}/);
  assert.match(app, /const DEFAULT_CARE_ASSIGNMENT = Object\.freeze\(\{ backdrop: 0, bottle: 2, cap: 1, label: 0, carton: 3 \}\)/);
  assert.match(app, /const careAssignment = \{ \.\.\.\(isShort\(current\.workspace\) \? SHORT_CARE_ASSIGNMENT : DEFAULT_CARE_ASSIGNMENT\) \}/);
  assert.match(app, /Object\.entries\(defaultCareAssignment\)/);
  assert.match(app, /if \(current\.careAssignment\) for/);
  assert.match(app, /careAssignment\[part\] = value/);
  assert.doesNotMatch(app, /class="care-map"/);
  assert.match(photoCss, /aspect-ratio:var\(--photo-aspect,4\/5\)/);
});
test('project, palette and comparison actions have distinct visible labels', () => {
  assert.match(studio, /id="saveProject"[^>]*>Save project/);
  assert.match(studio, /id="savePersonalPalette"[^>]*>Save palette/);
  assert.match(app, /Keep for comparison/);
  assert.match(app, /Use comparison colors/);
  assert.doesNotMatch(studio, /Five preview roles update live/);
});

// STUDIO-SHORT-14B: the Studio data path mirrors these app/project-store expressions exactly.
const { withWorkspace, workspaceFromColors, roleColors, SUPPORT_COLORS } = await import('../dist/studio-members.js');
const { sanitizeDraft } = await import('../dist/member-palette.js');
const store = await read('project-store.js');
const authored = ['#1A2B3C', '#D94F30', '#F2C14E', '#5B8E7D', '#2E294E', '#8C5383', '#C3D350', '#E6AACE'];
const workspaceOf = count => count === 8 ? workspaceFromColors(authored, [7, 1, 2, 3, 5]) : workspaceFromColors(authored.slice(0, count));
const handoff = saved => saved && workspaceFromColors(saved.colors, saved.roleIndex || (saved.colors.length <= 5 ? undefined : null));
const snapshotWorkspace = workspace => workspace.members.length !== 5 ? { ...workspace, members: [...workspace.members], roleIndex: [...workspace.roleIndex] } : null;
const restore = snapshot => withWorkspace({ colors: snapshot.colors, workspace: snapshot.workspace }).workspace;
const collectionRpc = snapshot => Array.isArray(snapshot.workspace?.members) && snapshot.workspace.members.length !== 5
  ? { rpc: 'save_member_palette', colors: snapshot.workspace.members } : { rpc: 'save_palette_to_collection', colors: snapshot.colors };
const assertAuthored = (workspace, count) => assert.deepEqual(workspace.members, authored.slice(0, count));

test('saved 2–5 color handoffs open without a role choice; 6–24 still require it', () => {
  assert.match(app, /workspaceFromColors\(saved\.colors, saved\.roleIndex \|\| \(saved\.colors\.length <= 5 \? undefined : null\)\)/);
  for (const count of [2, 3, 4, 5]) {
    const workspace = handoff(sanitizeDraft({ name: 'Short', colors: authored.slice(0, count) }));
    assertAuthored(workspace, count);
    assert.equal(roleColors(workspace).length, 5);
    assert.equal(workspace.roleIndex.filter(index => index === 'support').length, 5 - count);
  }
  assert.equal(handoff(sanitizeDraft({ name: 'Eight', colors: authored })), null);
  const eight = handoff(sanitizeDraft({ name: 'Eight', colors: authored, roleIndex: [7, 1, 2, 3, 5] }));
  assertAuthored(eight, 8);
  assert.deepEqual(eight.roleIndex, [7, 1, 2, 3, 5]);
  // A roleIndex cannot reshape a short handoff; it is dropped and the default mapping applies.
  assert.equal(sanitizeDraft({ colors: authored.slice(0, 3), roleIndex: [0, 1, 2, 0, 1] }).roleIndex, undefined);
});

test('project snapshots keep every non-five workspace and restore it beside its role colors', () => {
  assert.match(app, /workspace: current\.workspace\.members\.length !== 5 \? \{ \.\.\.current\.workspace, members: \[\.\.\.current\.workspace\.members\], roleIndex: \[\.\.\.current\.workspace\.roleIndex\] \} : null/);
  assert.match(app, /const \{ workspace \} = withWorkspace\(\{ colors, workspace: snapshot\.workspace \}\);/);
  assert.match(store, /\.\.\.\(snapshot\.workspace \? \{ workspace: snapshot\.workspace \} : \{\}\)/);
  for (const count of [2, 3, 4, 5, 8]) {
    const workspace = workspaceOf(count);
    const saved = { colors: roleColors(workspace), workspace: snapshotWorkspace(workspace) };
    assert.equal(saved.workspace === null, count === 5);
    // JSON round-trip through editor_state, then a project resume.
    const resumed = restore(JSON.parse(JSON.stringify(saved)));
    assertAuthored(resumed, count);
    assert.deepEqual(resumed.roleIndex, workspace.roleIndex);
    assert.deepEqual(roleColors(resumed), saved.colors);
  }
});

test('short project resume never promotes support, even beside edited role colors', () => {
  const workspace = workspaceOf(2);
  const colors = roleColors(workspace);
  const edited = [...colors]; edited[2] = '#123456'; edited[0] = '#ABCDEF';
  const resumed = restore({ colors: edited, workspace });
  assert.deepEqual(resumed.members, ['#123456', authored[1]]);
  assert.equal(roleColors(resumed)[0], SUPPORT_COLORS[0]);
  // Malformed workspaces fall back to the historic five-role identity load, as before.
  for (const bad of [{ ...workspace, v: 2 }, { ...workspace, roleIndex: [0, 0, 1, 'support', 'support'] }, { ...workspace, members: ['nope', '#FFFFFF'] }, 'x', null]) {
    assert.deepEqual(restore({ colors, workspace: bad }).members, colors);
  }
  // Larger snapshots with inconsistent role colors load as before.
  assert.deepEqual(restore({ colors: authored.slice(0, 5), workspace: workspaceOf(8) }).members, authored.slice(0, 5));
});

test('session reload keeps the complete short workspace and its five preview colors', () => {
  for (const count of [2, 3, 4, 5, 8]) {
    const workspace = workspaceOf(count);
    const stored = JSON.parse(JSON.stringify({ id: 'custom-saved-1', name: 'Short', colors: roleColors(workspace), workspace }));
    const reloaded = withWorkspace(stored);
    assertAuthored(reloaded.workspace, count);
    assert.deepEqual(reloaded.colors, stored.colors);
  }
});

test('Save palette sends only authored members; the five-color RPC is for exactly five', () => {
  assert.match(store, /if \(Array\.isArray\(members\) && members\.length !== 5\) \{/);
  assert.match(store, /p_colors: members,/);
  assert.match(store, /save_palette_to_collection[\s\S]{0,200}p_colors: snapshot\.colors,/);
  assert.match(app, /colors: \[\.\.\.current\.workspace\.members\], collection: snapshot\.collection/);
  for (const count of [2, 3, 4, 5, 8]) {
    const workspace = workspaceOf(count);
    const call = collectionRpc({ colors: roleColors(workspace), workspace: snapshotWorkspace(workspace) });
    assert.equal(call.rpc, count === 5 ? 'save_palette_to_collection' : 'save_member_palette');
    assert.deepEqual(call.colors, authored.slice(0, count));
    assert.ok(!call.colors.some(color => SUPPORT_COLORS.includes(color)));
    // The signed-out Save palette draft carries the same authored members.
    assert.deepEqual(sanitizeDraft({ name: 'Short', colors: [...workspace.members] }).colors, authored.slice(0, count));
  }
});
