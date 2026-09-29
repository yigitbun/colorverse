import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import test from 'node:test';
import vm from 'node:vm';
import {
  workspaceFromColors, sanitizeWorkspace, withWorkspace, roleColors, roleOfMember, memberLabel, previewColorLabel, isCompact,
  setMember, assignRole, swapRoles, insertMember, removeMember, previewMapping, syncRoleColors, EXTRACT_MAX_MEMBERS,
  SUPPORT_ROLE, SUPPORT_COLORS, isShort, isSupportRole, defaultRoleIndex,
} from '../dist/studio-members.js';
import { exportPalette } from '../dist/color.js';
import { sanitizeDraft, readDraft } from '../dist/member-palette.js';

const read = path => readFile(new URL(`../dist/${path}`, import.meta.url), 'utf8');
const [app, store, account, extractHtml, studioStyles, extractStyles, globe, legacy, legacyHtml, studioHtml] = await Promise.all([
  read('app.js'), read('project-store.js'), read('account.js'), read('extract/index.html'), read('studio-editor.css'), read('extract-workspace.css'), read('color-globe.js'),
  read('home-test/app.js'), read('home-test/index.html'), read('studio/index.html'),
]);
const five = ['#F7F6F2', '#DFE0DC', '#A9AAA7', '#6E7374', '#252B2F'];
const ten = [...five, '#E85D75', '#2F6FDE', '#B68B70', '#F2C14E', '#3D7A5A'];
const many = Array.from({ length: 24 }, (_, index) => `#${(index * 10 + 16).toString(16).padStart(2, '0').repeat(3)}`.toUpperCase());

test('five colors use identity mapping; 6–24 colors are preserved without truncation', () => {
  const base = workspaceFromColors(five);
  assert.deepEqual(base, { v: 1, members: five, roleIndex: [0, 1, 2, 3, 4] });
  assert.equal(isCompact(base), false);
  const full = workspaceFromColors(many, [3, 0, 23, 7, 12]);
  assert.equal(full.members.length, 24);
  assert.deepEqual(roleColors(full), [many[3], many[0], many[23], many[7], many[12]]);
  assert.equal(workspaceFromColors([...many, '#000000']), null, 'more than 24 is rejected, not cut');
  assert.equal(withWorkspace({ id: 'oversize', colors: [...many, '#000000'] }), null, 'a 25-color palette is rejected, not silently truncated');
  assert.equal(withWorkspace({ id: 'single', colors: five.slice(0, 1) }), null, 'one color is below the two-color minimum');
  assert.equal(withWorkspace({ id: 'max', colors: many }).workspace.members.length, 24);
  assert.deepEqual(workspaceFromColors(five.slice(0, 4)).members, five.slice(0, 4), 'fewer than five is not padded with invented members');
  for (const bad of [[0, 0, 1, 2, 3], [0, 1, 2, 3], [0, 1, 2, 3, 10], [0, 1, 2, 3, 1.5]]) assert.equal(workspaceFromColors(ten, bad), null);
});

const S = SUPPORT_ROLE;
const shortCases = [[five.slice(2, 4), [S, S, 0, 1, S]], [ten.slice(5, 8), [S, 2, 0, 1, S]], [ten.slice(5, 9), [3, 2, 0, 1, S]]];
const supportCount = workspace => workspace.roleIndex.filter(index => index === S).length;

test('2–4 colors keep exactly their members; open preview roles hold preview-only support', () => {
  for (const [members, roleIndex] of shortCases) {
    const workspace = workspaceFromColors(members);
    assert.deepEqual(workspace, { v: 1, members, roleIndex }, `${members.length} members map deterministically`);
    assert.deepEqual(defaultRoleIndex(members.length), roleIndex);
    assert.equal(isShort(workspace), true);
    assert.equal(isCompact(workspace), false);
    assert.equal(workspace.members.length, members.length, 'support is never counted as a member');
    assert.equal(supportCount(workspace), 5 - members.length);
    const colors = roleColors(workspace);
    assert.equal(colors.length, 5, 'renderers still receive five role colors');
    colors.forEach((color, role) => assert.equal(color, isSupportRole(workspace, role) ? SUPPORT_COLORS[role] : members[roleIndex[role]]));
    assert.deepEqual(roleIndex.map((_, role) => previewColorLabel(workspace, role)), roleIndex.map(index => index === S ? 'Preview support' : `Color ${index + 1}`));
  }
  // Two colors: first is Primary, second Accent; neutrals fill Background, Surface and Text.
  const two = workspaceFromColors(['#aa3322', '#2255cc']);
  assert.deepEqual(roleColors(two), [SUPPORT_COLORS[0], SUPPORT_COLORS[1], '#AA3322', '#2255CC', SUPPORT_COLORS[4]]);
  assert.ok(SUPPORT_COLORS.every(color => /^#([0-9A-F]{2})\1\1$/.test(color)), 'support colors are fixed neutral greys');
  assert.ok(Object.isFrozen(SUPPORT_COLORS));
  // Explicit valid mappings are accepted; corrupt, duplicate, out-of-range or hidden-member mappings are not.
  const three = ten.slice(5, 8);
  assert.deepEqual(workspaceFromColors(three, [2, S, S, 0, 1]).roleIndex, [2, S, S, 0, 1]);
  for (const bad of [null, [S, S, 0, 1], [S, S, 0, 0, 1], [S, S, 0, 1, 3], [S, S, 0, 1.5, 2], [S, S, S, 0, 1], ['x', S, 0, 1, 2],
    [0, 1, 2, S, S, S], [S, S, '0', 1, 2], [-1, S, 0, 1, 2]]) assert.equal(workspaceFromColors(three, bad), null, JSON.stringify(bad));
  assert.equal(workspaceFromColors(five, [S, 1, 2, 3, 4]), null, 'five or more members never use support');
  assert.equal(workspaceFromColors(ten, [S, 1, 2, 3, 4]), null);
  assert.equal(workspaceFromColors(['#111111']), null);
  assert.equal(workspaceFromColors(['#111111', 'red']), null);
});

test('2–4 color workspaces survive JSON, rehydration and stale role colors without promoting support', () => {
  for (const [members] of shortCases) {
    const workspace = workspaceFromColors(members, [...defaultRoleIndex(members.length)].reverse());
    const stored = JSON.parse(JSON.stringify({ id: 'short', name: 'Short', colors: roleColors(workspace), workspace }));
    assert.deepEqual(sanitizeWorkspace(stored.workspace, stored.colors), workspace);
    assert.equal(sanitizeWorkspace(stored.workspace, five), null, 'inconsistent with saved role colors');
    assert.equal(sanitizeWorkspace({ ...stored.workspace, v: 2 }), null);
    const restored = withWorkspace(stored);
    assert.deepEqual(restored.workspace, workspace);
    assert.deepEqual(withWorkspace(JSON.parse(JSON.stringify(restored))).workspace, workspace, 'second reload');
    // Colors stored without the workspace are the members themselves.
    assert.deepEqual(withWorkspace({ id: 'plain', colors: members }).workspace, workspaceFromColors(members));
    // A stale five-color array beside a valid short workspace never becomes five members.
    const authored = workspace.roleIndex.findIndex(index => index !== S);
    const stale = stored.colors.map((color, role) => role === authored ? '#010203' : isSupportRole(workspace, role) ? '#FEDCBA' : color);
    const merged = withWorkspace({ ...stored, colors: stale });
    assert.equal(merged.workspace.members.length, members.length);
    assert.equal(merged.workspace.members[workspace.roleIndex[authored]], '#010203');
    assert.deepEqual(merged.workspace.roleIndex, workspace.roleIndex);
    assert.ok(!merged.workspace.members.includes('#FEDCBA'), 'support-slot writes are not promoted to members');
    assert.deepEqual(merged.colors, roleColors(merged.workspace));
  }
  // A corrupt short workspace falls back to the five saved colors, as before.
  const corrupt = { id: 'x', colors: five, workspace: { v: 1, members: five.slice(0, 3), roleIndex: [S, S, 0, 0, 1] } };
  assert.deepEqual(withWorkspace(corrupt).workspace, workspaceFromColors(five));
});

test('editing, assignment, insertion and legacy role writes keep the 2–4 member count', () => {
  const members = ten.slice(5, 8);
  let workspace = workspaceFromColors(members);
  workspace = setMember(workspace, 1, '#123456');
  assert.deepEqual(workspace.members, [members[0], '#123456', members[2]]);
  assert.equal(roleColors(workspace)[3], '#123456');
  assert.equal(setMember(workspace, 3, '#000000'), workspace, 'no member beyond the authored count');
  // Assigning a member to a support role trades places with the support marker.
  const moved = assignRole(workspace, 0, 0);
  assert.deepEqual(moved.roleIndex, [0, 2, S, 1, S]);
  assert.equal(moved.members.length, 3);
  assert.equal(assignRole(workspace, 0, S), workspace, 'support is not a member');
  assert.equal(assignRole(workspace, 0, 3), workspace);
  const swapped = swapRoles(workspace, 1, 4);
  assert.deepEqual(swapped.roleIndex, [S, S, 0, 1, 2]);
  assert.deepEqual(swapped.members, workspace.members);
  // Removal never shrinks an authored palette; insertion fills the next open role.
  assert.equal(removeMember(workspace, 0), null);
  const four = insertMember(workspace, 1, '#ABCDEF');
  assert.deepEqual(four.members, [members[0], '#ABCDEF', '#123456', members[2]]);
  assert.deepEqual(four.roleIndex, [1, 3, 0, 2, S], 'roles keep their members; the new color takes Background');
  const fiveMembers = insertMember(four, 4, '#FEDCBA');
  assert.deepEqual(fiveMembers.roleIndex, [0, 1, 2, 3, 4], 'five members return to the historic model');
  assert.deepEqual(fiveMembers.members, [...roleColors(four).slice(0, 4), '#FEDCBA']);
  assert.ok(!fiveMembers.members.includes(SUPPORT_COLORS[4]));
  assert.equal(insertMember(workspaceFromColors(members), 0, '#111111', 3), null, 'insert respects its maximum');
  // Legacy five-slot writers: role edits reach authored members; support stays fixed; rearrangements move roles.
  const stored = { id: 'short', colors: roleColors(workspace), workspace };
  const edited = syncRoleColors({ ...stored, colors: stored.colors.map((color, role) => role === 2 ? '#0A0B0C' : role === 0 ? '#EEEEEE' : color) });
  assert.deepEqual(edited.workspace.members, ['#0A0B0C', '#123456', members[2]]);
  assert.deepEqual(edited.colors, roleColors(edited.workspace));
  assert.equal(edited.colors[0], SUPPORT_COLORS[0]);
  const legacySwap = syncRoleColors({ ...stored, colors: [stored.colors[2], ...stored.colors.slice(1, 2), stored.colors[0], ...stored.colors.slice(3)] });
  assert.deepEqual(legacySwap.workspace.members, workspace.members, 'a swap never writes support into a member');
  assert.deepEqual(legacySwap.workspace.roleIndex, [0, 2, S, 1, S]);
  assert.deepEqual(syncRoleColors(stored).workspace, workspace);
});

test('2–4 color exports list only authored members and name support roles without supplying them', () => {
  for (const [members] of shortCases) {
    const workspace = workspaceFromColors(members);
    const palette = withWorkspace({ id: 'Short One', name: 'Short', colors: members });
    const support = ['background', 'surface', 'primary', 'accent', 'text'].filter((_, role) => isSupportRole(workspace, role));
    const hex = exportPalette(palette, 'hex').split('\n');
    assert.deepEqual(hex.map(line => line.split('\t')[0]), members, 'raw HEX lists authored members only');
    const json = JSON.parse(exportPalette(palette, 'json'));
    assert.deepEqual(json.members, members);
    assert.deepEqual(json.previewRoles, previewMapping(workspace));
    assert.deepEqual(Object.keys(json.previewRoles).filter(role => json.previewRoles[role] === S), support);
    assert.deepEqual(Object.keys(json.colors), Object.keys(json.previewRoles).filter(role => json.previewRoles[role] !== S));
    assert.ok(Object.values(json.colors).every(color => members.includes(color)));
    assert.deepEqual(Object.keys(json.previewSupport), support);
    for (const format of ['css', 'scss', 'tailwind']) {
      const code = exportPalette(palette, format);
      assert.match(code, new RegExp(`${members.length} colors; preview-only support \\(not included\\): ${support.join(', ')}`));
      assert.ok(SUPPORT_COLORS.every(color => !code.includes(color)), `${format} does not export support colors`);
      assert.doesNotMatch(code, /undefined|NaN/);
    }
  }
  const two = withWorkspace({ id: 'duo', name: 'Duo', colors: ['#AA3322', '#2255CC'] });
  assert.equal(exportPalette(two, 'hex'), '#AA3322\tPrimary\n#2255CC\tAccent');
  assert.equal(exportPalette(two, 'css'), '/* Duo — 2 colors; preview-only support (not included): background, surface, text */\n:root {\n  --duo-primary: #AA3322;\n  --duo-accent: #2255CC;\n}');
});

test('five and 6–24 color workspaces and exports are unchanged by short-palette support', () => {
  for (const members of [five, ten, many]) {
    const workspace = workspaceFromColors(members);
    assert.deepEqual(workspace.roleIndex, [0, 1, 2, 3, 4]);
    assert.equal(isShort(workspace), false);
    assert.equal(supportCount(workspace), 0);
    assert.deepEqual(roleColors(workspace), members.slice(0, 5));
  }
  const small = withWorkspace({ id: 'small', name: 'Small', colors: five });
  assert.equal(exportPalette(small, 'css'), `/* Small */\n:root {\n${five.map((color, role) => `  --small-${['background', 'surface', 'primary', 'accent', 'text'][role]}: ${color};`).join('\n')}\n}`);
  // Legacy palettes without a workspace export as before.
  assert.equal(exportPalette({ id: 'legacy', name: 'Legacy', colors: five }, 'hex'), five.join('\n'));
  const workspace = workspaceFromColors(ten, [5, 1, 2, 3, 9]);
  const large = { id: 'large', name: 'Large', colors: roleColors(workspace), workspace };
  assert.equal(exportPalette(large, 'scss'), `// Large — five preview roles of 10 colors\n$large-background: ${ten[5]};\n$large-surface: ${ten[1]};\n$large-primary: ${ten[2]};\n$large-accent: ${ten[3]};\n$large-text: ${ten[9]};`);
  assert.equal(JSON.parse(exportPalette(large, 'json')).previewSupport, undefined);
  const wide = workspaceFromColors(many, [23, 0, 12, 5, 17]);
  assert.deepEqual(previewMapping(wide), { background: 24, surface: 1, primary: 13, accent: 6, text: 18 });
  assert.equal(exportPalette({ id: 'wide', name: 'Wide', colors: roleColors(wide), workspace: wide }, 'hex').split('\n').length, 24);
});

test('stored workspaces are versioned, bounded and must agree with their role colors', () => {
  const workspace = workspaceFromColors(ten, [5, 1, 2, 3, 9]);
  assert.deepEqual(sanitizeWorkspace(JSON.parse(JSON.stringify(workspace)), roleColors(workspace)), workspace);
  assert.equal(sanitizeWorkspace({ ...workspace, v: 2 }), null);
  assert.equal(sanitizeWorkspace(workspace, five), null, 'inconsistent with saved role colors');
  assert.equal(sanitizeWorkspace({ v: 1, members: ['#GGGGGG', ...ten.slice(1)], roleIndex: [0, 1, 2, 3, 4] }), null);
  // Old snapshots without a workspace, or with a broken one, load as identity.
  assert.deepEqual(withWorkspace({ id: 'old', colors: five }).workspace.roleIndex, [0, 1, 2, 3, 4]);
  assert.deepEqual(withWorkspace({ id: 'bad', colors: five, workspace: { v: 1, members: ten, roleIndex: [9, 8, 7, 6, 5] } }).workspace.members, five);
  const restored = withWorkspace({ id: 'x', colors: roleColors(workspace), workspace });
  assert.deepEqual(restored.colors, [ten[5], ten[1], ten[2], ten[3], ten[9]]);
  assert.equal(restored.workspace.members.length, 10);
});

test('editing an unassigned member leaves the five preview colors unchanged', () => {
  const workspace = workspaceFromColors(ten);
  const edited = setMember(workspace, 7, '#123456');
  assert.deepEqual(roleColors(edited), roleColors(workspace));
  assert.equal(edited.members[7], '#123456');
  const primary = setMember(workspace, 2, '#ABCDEF');
  assert.equal(roleColors(primary)[2], '#ABCDEF');
});

test('explicit role assignment trades or releases members; swaps keep member order', () => {
  const workspace = workspaceFromColors(ten);
  const accentFromExtra = assignRole(workspace, 3, 8);
  assert.deepEqual(accentFromExtra.roleIndex, [0, 1, 2, 8, 4]);
  assert.equal(roleOfMember(accentFromExtra, 3), -1);
  assert.equal(memberLabel(accentFromExtra, 3), 'Color 4');
  assert.equal(memberLabel(accentFromExtra, 8), 'Color 9');
  const traded = assignRole(accentFromExtra, 0, 8);
  assert.deepEqual(traded.roleIndex, [8, 1, 2, 0, 4]);
  const swapped = swapRoles(workspace, 0, 4);
  assert.deepEqual(swapped.members, ten);
  assert.deepEqual(swapped.roleIndex, [4, 1, 2, 3, 0]);
  // Five-color palettes keep the historic behavior: the colors themselves swap.
  const small = swapRoles(workspaceFromColors(five), 0, 4);
  assert.deepEqual(small.roleIndex, [0, 1, 2, 3, 4]);
  assert.deepEqual(small.members, [five[4], five[1], five[2], five[3], five[0]]);
});

test('insert and remove keep each role attached to its original member, up to ten in Extract', () => {
  let workspace = workspaceFromColors(five);
  workspace = insertMember(workspace, 2, '#111111', EXTRACT_MAX_MEMBERS);
  assert.deepEqual(workspace.members, [five[0], five[1], '#111111', five[2], five[3], five[4]]);
  assert.deepEqual(roleColors(workspace), five);
  for (let count = 6; count < 10; count++) workspace = insertMember(workspace, 1, '#222222', EXTRACT_MAX_MEMBERS);
  assert.equal(workspace.members.length, 10);
  assert.equal(insertMember(workspace, 1, '#333333', EXTRACT_MAX_MEMBERS), null, 'Extract stops at ten');
  assert.deepEqual(roleColors(workspace), five);
  assert.equal(removeMember(workspace, workspace.roleIndex[2]), null, 'assigned role colors cannot be removed');
  let reduced = workspace;
  while (reduced.members.length > 5) reduced = removeMember(reduced, reduced.members.findIndex((_, index) => roleOfMember(reduced, index) < 0));
  assert.deepEqual(reduced, workspaceFromColors(five));
  assert.equal(removeMember(reduced, 0), null, 'never below five');
});

test('neutral color labels track member positions, never their application roles', () => {
  for (const members of [five, ten, many]) {
    const workspace = workspaceFromColors(members);
    const before = JSON.stringify(workspace);
    assert.deepEqual(workspace.members.map((_, index) => memberLabel(workspace, index)), members.map((_, index) => `Color ${index + 1}`));
    assert.deepEqual(workspace.roleIndex.map((_, role) => previewColorLabel(workspace, role)), ['Color 1', 'Color 2', 'Color 3', 'Color 4', 'Color 5']);
    assert.equal(JSON.stringify(workspace), before, 'display labels do not change colors or mapping');
  }
  const mapped = workspaceFromColors(ten, [7, 0, 3, 5, 1]);
  assert.deepEqual(mapped.roleIndex.map((_, role) => previewColorLabel(mapped, role)), ['Color 8', 'Color 1', 'Color 4', 'Color 6', 'Color 2']);
  const assigned = assignRole(mapped, 4, 9);
  assert.equal(previewColorLabel(assigned, 4), 'Color 10', 'Print labels the actual mapped member');
  assert.equal(memberLabel(assigned, 1), 'Color 2', 'released member keeps its name');
  assert.deepEqual(assigned.members, ten);
  assert.deepEqual(sanitizeWorkspace(assigned, roleColors(assigned)), assigned, 'existing persistence contract still accepts it');
});

test('exports keep every member with explicit preview-role mapping; five-color output is unchanged', () => {
  const small = withWorkspace({ id: 'small', name: 'Small', colors: five });
  assert.equal(exportPalette(small, 'hex'), five.join('\n'));
  assert.deepEqual(JSON.parse(exportPalette(small, 'json')), { name: 'Small', colors: { background: five[0], surface: five[1], primary: five[2], accent: five[3], text: five[4] } });
  const workspace = workspaceFromColors(ten, [5, 1, 2, 3, 9]);
  const large = { id: 'large', name: 'Large', colors: roleColors(workspace), workspace };
  const json = JSON.parse(exportPalette(large, 'json'));
  assert.deepEqual(json.members, ten);
  assert.deepEqual(json.previewRoles, previewMapping(workspace));
  assert.deepEqual(json.previewRoles, { background: 6, surface: 2, primary: 3, accent: 4, text: 10 });
  assert.equal(Object.keys(json.colors).length, 5);
  const hex = exportPalette(large, 'hex').split('\n');
  assert.equal(hex.length, 10);
  assert.equal(hex[5], `${ten[5]}\tBackground`);
  assert.equal(hex[6], ten[6]);
  for (const format of ['css', 'scss', 'tailwind']) {
    const code = exportPalette(large, format);
    assert.match(code, /five preview roles of 10 colors/);
    assert.doesNotMatch(code, /undefined/);
  }
});

test('My palettes hands every color plus the chosen five positions to Studio', () => {
  const draft = sanitizeDraft({ name: 'Ten', collection: 'Work', colors: ten, roleIndex: [9, 0, 4, 5, 2] });
  assert.deepEqual(draft.colors, ten);
  assert.deepEqual(draft.roleIndex, [9, 0, 4, 5, 2]);
  assert.equal(draft.collection, 'Work');
  assert.equal(sanitizeDraft({ colors: ten, roleIndex: [0, 0, 1, 2, 3] }).roleIndex, undefined);
  assert.match(account, /function openStudio\(item, roleIndex\) \{\n  const draft = sanitizeDraft\(\{ name: item\.name, collection: item\.collections\?\.name, colors: item\.colors, roleIndex,/);
  assert.match(account, /openStudio\(choice, \[\.\.\.chosen\]\)/);
  assert.match(account, /studio\.disabled = item\.colors\.length < MIN_COLORS/);
  assert.doesNotMatch(account, /at least five colors/);
  assert.match(app, /workspaceFromColors\(saved\.colors, saved\.roleIndex \|\| \(saved\.colors\.length <= 5 \? undefined : null\)\)/);
  assert.doesNotMatch(app, /saved\?\.colors\.length === 5/);
  assert.match(app, /sanitizeDraft\(\{ \.\.\.snapshot, colors: \[\.\.\.current\.workspace\.members\]/);
});

// Runs Account's real openStudio/chooseStudio with stubbed browser globals; no auth or network.
function accountHandoff({ failStorage = false } = {}) {
  const source = account.slice(account.indexOf('function openStudio('), account.indexOf('function renderChoice('));
  const stored = new Map(); const log = { assigned: null, status: null, picker: 0 };
  const context = vm.createContext({
    sanitizeDraft, STUDIO_HANDOFF_KEY: 'colorverse-member-palette',
    sessionStorage: { setItem(key, value) { if (failStorage) throw new Error('blocked'); stored.set(key, value); } },
    location: { assign: url => { log.assigned = url; } },
    status: (text, kind) => { log.status = { text, kind }; },
    $: () => ({ showModal: () => { log.picker += 1; } }), renderChoice: () => {}, choice: null, chosen: [],
  });
  vm.runInContext(`${source}\nthis.chooseStudio = chooseStudio;`, context);
  return { choose: item => context.chooseStudio(item), stored, log };
}

test('My palettes opens 2–4 colors in Studio with only the authored colors', () => {
  for (const colors of [ten.slice(5, 7), ten.slice(5, 8), ten.slice(5, 9)]) {
    const { choose, stored, log } = accountHandoff();
    const item = { name: 'Short', collections: { name: 'Work' }, colors: [...colors], palette_id: null };
    choose(item);
    assert.equal(log.picker, 0, 'short palettes skip the five-color picker');
    assert.equal(log.assigned, '/studio/?saved=1');
    const payload = JSON.parse(stored.get('colorverse-member-palette'));
    assert.deepEqual(payload.colors, colors, `${colors.length} colors are sent unchanged`);
    assert.equal(payload.roleIndex, undefined, 'Studio makes the deterministic preview mapping');
    assert.ok(!payload.colors.some(color => SUPPORT_COLORS.includes(color)), 'no support tone in the handoff');
    assert.deepEqual(item.colors, colors, 'the saved member palette is not modified');
    assert.deepEqual(workspaceFromColors(payload.colors).members, colors);
  }
  assert.equal(sanitizeDraft({ colors: ten.slice(5, 8), roleIndex: [0, 1, 2, 0, 1] }).roleIndex, undefined, 'short handoffs never carry a role index');
});

test('My palettes keeps five-color identity and the 6–24 picker', () => {
  const identity = accountHandoff();
  identity.choose({ name: 'Five', colors: [...five] });
  const payload = JSON.parse(identity.stored.get('colorverse-member-palette'));
  assert.deepEqual(payload.colors, five);
  assert.deepEqual(payload.roleIndex, [0, 1, 2, 3, 4]);
  assert.equal(identity.log.picker, 0);
  for (const colors of [ten.slice(0, 6), ten, many]) {
    const large = accountHandoff();
    large.choose({ name: 'Large', colors });
    assert.equal(large.log.picker, 1, `${colors.length} colors open the five-choice picker`);
    assert.equal(large.stored.size, 0); assert.equal(large.log.assigned, null);
  }
});

test('My palettes reports invalid colors and blocked storage without navigating', () => {
  const invalid = accountHandoff();
  invalid.choose({ name: 'Bad', colors: ['#12345', '#ABCDEF'] });
  assert.equal(invalid.stored.size, 0); assert.equal(invalid.log.assigned, null);
  assert.deepEqual(invalid.log.status, { text: 'This palette has invalid colors. Edit it before opening it in Studio.', kind: 'error' });
  const blocked = accountHandoff({ failStorage: true });
  blocked.choose({ name: 'Short', colors: ten.slice(5, 8) });
  assert.equal(blocked.log.assigned, null);
  assert.deepEqual(blocked.log.status, { text: 'Browser storage is unavailable. Allow site storage to transfer this palette to Studio.', kind: 'error' });
});

// Replays the storage chain the Studio routes use (JSON through sessionStorage or
// editor_state), with the same helpers app.js calls, for 8, 10 and 24 members.
test('8, 10 and 24 members survive handoff, reload, edits, export and project state', () => {
  const memory = () => { const map = new Map(); return { getItem: key => map.get(key) ?? null, setItem: (key, value) => map.set(key, String(value)), removeItem: key => map.delete(key) }; };
  const cases = [[ten.slice(0, 8), [7, 0, 3, 5, 1]], [ten, [9, 0, 4, 5, 2]], [many, [23, 0, 12, 5, 17]]];
  for (const [members, roleIndex] of cases) {
    const storage = memory();
    // My palettes → Studio (?saved=1): every color plus the chosen positions.
    storage.setItem('colorverse-member-palette', JSON.stringify(sanitizeDraft({ name: 'Wide', collection: 'Work', colors: members, roleIndex })));
    const saved = readDraft(storage, 'colorverse-member-palette');
    const handed = workspaceFromColors(saved.colors, saved.roleIndex || (saved.colors.length === 5 ? undefined : null));
    assert.deepEqual(handed, { v: 1, members, roleIndex });
    // Reload: persisted current palette → withWorkspace.
    storage.setItem('colorverse-current-palette', JSON.stringify({ id: 'saved-1', name: 'Wide', colors: roleColors(handed), workspace: handed }));
    let current = withWorkspace(JSON.parse(storage.getItem('colorverse-current-palette')));
    assert.deepEqual(current.workspace, handed);
    // Edit an unassigned member, then place it explicitly in the preview.
    const extra = members.findIndex((_, index) => !roleIndex.includes(index));
    let workspace = setMember(current.workspace, extra, '#123456');
    assert.deepEqual(roleColors(workspace), roleColors(handed), 'unassigned edit leaves the preview alone');
    workspace = assignRole(workspace, 3, extra);
    assert.equal(roleColors(workspace)[3], '#123456');
    const expected = members.map((color, index) => index === extra ? '#123456' : color);
    assert.deepEqual(workspace.members, expected, 'order and count unchanged');
    storage.setItem('colorverse-current-palette', JSON.stringify({ ...current, colors: roleColors(workspace), workspace }));
    current = withWorkspace(JSON.parse(storage.getItem('colorverse-current-palette')));
    assert.deepEqual(current.workspace, workspace, 'edited workspace survives a second reload');
    // Full JSON export.
    const json = JSON.parse(exportPalette(current, 'json'));
    assert.deepEqual(json.members, expected);
    assert.deepEqual(json.previewRoles, previewMapping(workspace));
    // Project/template editor_state round trip, as loadStudioSnapshot validates it.
    const editorState = JSON.parse(JSON.stringify({ workspace: current.workspace }));
    assert.deepEqual(sanitizeWorkspace(editorState.workspace, current.colors), workspace);
  }
});

test('a five-color derivative written beside a stale workspace is not resurrected', () => {
  // A writer that edits `colors` but carries the old workspace (as /home-test/
  // did before syncRoleColors) is rejected; Studio does not invent a merge.
  const workspace = workspaceFromColors(ten, [5, 1, 2, 3, 9]);
  const edited = roleColors(workspace).map((color, role) => role === 0 ? '#010203' : color);
  assert.deepEqual(withWorkspace({ id: 'x', colors: edited, workspace }).workspace, workspaceFromColors(edited));
  // Five-member snapshots stay on the historic identity mapping.
  assert.deepEqual(withWorkspace({ id: 'old', colors: five }).workspace, { v: 1, members: five, roleIndex: [0, 1, 2, 3, 4] });
});

test('legacy five-slot edits update the matching full workspace, keeping extras, order and role map', () => {
  for (const [members, roleIndex] of [[ten.slice(0, 8), [7, 0, 3, 5, 1]], [ten, [5, 1, 2, 3, 9]], [many, [23, 0, 12, 5, 17]]]) {
    const workspace = workspaceFromColors(members, roleIndex);
    const stored = JSON.parse(JSON.stringify({ id: 'your-image-balanced', name: 'Wide', colors: roleColors(workspace), workspace }));
    // /home-test/ Mini Studio "Apply color" on slot 2, then a reference fills slots 3–4.
    const applied = syncRoleColors({ ...stored, id: 'custom-mini-studio', colors: stored.colors.map((color, role) => role === 2 ? '#0A0B0C' : color) });
    const suggested = syncRoleColors({ ...applied, colors: applied.colors.map((color, role) => role === 3 ? '#111213' : role === 4 ? '#141516' : color) });
    assert.deepEqual(suggested.workspace.roleIndex, roleIndex, 'role map unchanged');
    assert.equal(suggested.workspace.members.length, members.length);
    const expected = members.map((color, index) => ({ [roleIndex[2]]: '#0A0B0C', [roleIndex[3]]: '#111213', [roleIndex[4]]: '#141516' })[index] || color);
    assert.deepEqual(suggested.workspace.members, expected, 'only the edited role members change; extras and order stay');
    // Legacy swap trades roles, not member order, exactly as Studio does.
    const swapped = syncRoleColors({ ...suggested, colors: [suggested.colors[4], ...suggested.colors.slice(1, 4), suggested.colors[0]], workspace: swapRoles(suggested.workspace, 0, 4) });
    assert.deepEqual(swapped.workspace.members, expected);
    assert.deepEqual(swapped.workspace.roleIndex, [roleIndex[4], ...roleIndex.slice(1, 4), roleIndex[0]]);
    // Open Studio: the persisted palette passes Studio's unchanged validation and reloads whole.
    const reloaded = withWorkspace(JSON.parse(JSON.stringify(swapped)));
    assert.deepEqual(reloaded.workspace, swapped.workspace);
    assert.deepEqual(sanitizeWorkspace(swapped.workspace, swapped.colors), swapped.workspace);
    assert.deepEqual(JSON.parse(exportPalette(reloaded, 'json')).members, expected);
    // Studio can still edit an unassigned member and place it explicitly.
    const extra = expected.findIndex((_, index) => roleOfMember(reloaded.workspace, index) < 0);
    const placed = assignRole(setMember(reloaded.workspace, extra, '#ABCDEF'), 1, extra);
    assert.equal(roleColors(placed)[1], '#ABCDEF');
    assert.equal(placed.members.length, members.length);
  }
  // Five-color and new explicit choices pass through untouched; invalid data is not resurrected.
  const small = withWorkspace({ id: 'small', colors: five });
  const edited = { ...small, colors: ['#010203', ...five.slice(1)] };
  assert.equal(syncRoleColors(edited), edited);
  const library = { id: 'warm-cafe', colors: five };
  assert.equal(syncRoleColors(library), library);
  const broken = { id: 'x', colors: five, workspace: { v: 1, members: ten, roleIndex: [0, 0, 1, 2, 3] } };
  assert.equal(syncRoleColors(broken), broken);
  assert.deepEqual(withWorkspace(broken).workspace.members, five, 'Studio validation unchanged');
  assert.match(legacy, /import \{ sanitizeWorkspace, swapRoles, syncRoleColors \} from '\.\.\/studio-members\.js\?v=5';/);
  assert.match(legacy, /function persistPalette\(palette\) \{\n  const synced = syncRoleColors\(palette\);\n  if \(palette === current\) current = synced;/);
  assert.match(legacy, /function renderSelection\(updateURL = false\) \{\n  current = syncRoleColors\(current\);/);
  assert.match(legacy, /workspace: swapRoles\(workspace, from, to\)/);
  assert.match(legacyHtml, /\/home-test\/app\.js\?v=83/);
  assert.match(app, /from '\.\/studio-members\.js\?v=5'/);
});

test('larger palettes get a compact two-column rail with a count and overflow cue; collapsed stays swatch-only', () => {
  assert.match(studioHtml, /<p class="palette-count" id="paletteCount" hidden><\/p>\n\s*<div class="palette-shuffle-row">.*?<\/div>\n\s*<div class="palette-roles" id="paletteRoles" role="group"><\/div>/);
  assert.match(app, /container\.classList\.toggle\('is-compact-grid', workspace\.members\.length > 5\)/);
  assert.match(app, /count\.hidden = workspace\.members\.length <= 5;/);
  assert.match(app, /container\.classList\.toggle\('has-more-down', down && !across && !atEnd\)/);
  assert.match(app, /' · scroll for all'/);
  assert.match(app, /\$\('#paletteRoles'\)\?\.addEventListener\('scroll', updatePaletteOverflow/);
  assert.match(app, /ArrowUp: Math\.max\(0, index - columns\)/);
  assert.match(app, /ArrowDown: Math\.min\(last, index \+ columns\)/);
  assert.match(studioStyles, /\.palette-inspector \.palette-roles\.is-compact-grid\{grid-template-columns:repeat\(2,minmax\(0,1fr\)\)/);
  assert.match(studioStyles, /\.palette-roles\.is-compact-grid \.palette-member\{flex-direction:column;align-items:stretch;gap:3px;min-height:44px;padding:4px\}/);
  assert.match(studioStyles, /\.palette-inspector \.palette-roles\.has-more-down\{/);
  assert.match(studioStyles, /\.is-palette-collapsed \.palette-inspector \.palette-roles\.is-compact-grid\{grid-template-columns:minmax\(0,1fr\)\}/);
  assert.match(studioStyles, /\.is-palette-collapsed \.palette-count span,\.is-palette-collapsed \.palette-count small\{display:none\}/);
  // Narrow screens keep the contained horizontal strip (no page overflow) with its own cue.
  assert.match(studioStyles, /\.palette-inspector \.palette-roles,\.palette-inspector \.palette-roles\.is-scrolling\{display:flex;gap:5px;max-height:none;overflow-x:auto/);
  assert.match(app, /' · swipe for all'/);
  // Height budget at a 720px viewport (rail max 360px): 5 rows of compact members fit.
  const member = 4 * 2 + 2 + 22 + 3 + 10 * 1.25 + 8 * 1.3;
  assert.ok(5 * member + 4 * 4 <= 360, `ten members need ${5 * member + 16}px`);
});

test('project, prototype and template paths save and restore the complete workspace', () => {
  assert.match(app, /workspace: current\.workspace\.members\.length !== 5 \?/);
  assert.match(app, /const \{ workspace \} = withWorkspace\(\{ colors, workspace: snapshot\.workspace \}\);/);
  assert.equal(store.match(/editorStateFor\(snapshot\)/g)?.length, 3);
  assert.equal(store.match(/workspace: version\.editor_state\?\.workspace/g)?.length, 2);
  assert.match(store, /workspace: baseline\.editor_state\?\.workspace/);
  assert.match(store, /workspace: template\.defaults\?\.workspace/);
  // RPC color fields remain the five role colors.
  assert.equal(store.match(/p_colors: snapshot\.colors/g)?.length, 4);
  assert.match(store, /client\.rpc\('save_member_palette', \{\n        p_item_id: null,/);
  assert.match(store, /p_colors: members,/);
  assert.match(store, /if \(Array\.isArray\(members\) && members\.length !== 5\)/);
  assert.match(store, /productKind: 'skincare',\n      collection:/);
  assert.match(store, /select\('id,name,palette_id,colors,source_metadata,created_at,collections\(name\)'\)/);
});

test('Studio keeps every member in the slim rail with explicit right-side preview assignment', () => {
  assert.match(app, /container\.classList\.toggle\('is-scrolling', workspace\.members\.length > 5\)/);
  assert.match(app, /workspace\.members\.map\(\(color, index\)/);
  assert.match(app, /data-select-member="\$\{index\}"/);
  assert.match(app, /data-assign-slot="\$\{role\}"/);
  assert.match(app, /assignPreviewRole\(activeColorIndex, role\)/);
  assert.match(app, /copy\(members\.join\(', '\), `All \$\{members\.length\} colors copied\.`\)/);
  assert.doesNotMatch(app, /All five colors copied/);
  assert.match(studioStyles, /\.palette-inspector \.palette-roles\.is-scrolling\{max-height:min\(450px,calc\(100svh - 360px\)\);overflow-y:auto/);
  assert.match(studioStyles, /\.palette-member\{display:flex;/);
  // The Globe edits a member and only previews roles that member fills.
  assert.match(app, /if \(role >= 0\) colors\[role\] = color;/);
  assert.match(globe, /palette = Array\.isArray\(source\.members\) \? \[\.\.\.source\.members\] : source\.colors\.slice\(0, 5\);/);
});

test('adding to the color tray uses the selected member, not the five-slot preview-role array', () => {
  const eight = ten.slice(0, 8);
  const workspace = workspaceFromColors(eight, [7, 0, 3, 5, 1]);
  assert.equal(workspace.members.length, 8);
  assert.equal(roleColors(workspace).length, 5);
  // Sixth and last members sit past the five preview-role slots, so the
  // preview-role array (`current.colors`) has no entry for them.
  assert.equal(workspace.members[5], eight[5]);
  assert.equal(roleColors(workspace)[5], undefined);
  assert.equal(workspace.members[7], eight[7]);
  assert.equal(roleColors(workspace)[7], undefined);
  assert.match(app, /\$\('#addColorToTray'\)\?\.addEventListener\('click', \(\) => \{\n  const color = activeColor\(\)\.toUpperCase\(\);/);
  assert.doesNotMatch(app, /current\.colors\[activeColorIndex\]\.toUpperCase\(\)/);
});

test('Extract inserts between rows up to ten, keeps points, and hands the full palette to Studio', () => {
  assert.match(app, /data-extract-insert="\$\{index \+ 1\}" aria-label="Insert a color between samples \$\{sample\} and \$\{sample \+ 1\}"/);
  assert.match(app, /insertMember\(workspace, position, color, EXTRACT_MAX_MEMBERS\), \(\) => pickerPositions\.splice\(position, 0, point\)/);
  assert.match(app, /removeMember\(workspace, index\), \(\) => pickerPositions\.splice\(index, 1\)/);
  assert.match(app, /if \(!variant \|\| pickerPositions\.length !== variant\.colors\.length\) return false;\n    const next = change/);
  assert.match(app, /rememberExtraction\(\);\n    movePoints\(\);/);
  assert.match(app, /roleIndex: extractedVariants\.map\(variant => \[\.\.\.variant\.roleIndex\]\)/);
  assert.match(app, /variant\.roleIndex = saved\.roleIndex\[index\]/);
  assert.match(app, /extractedVariants\[selectedExtraction\]\.roleIndex = \[0, 1, 2, 3, 4\]/);
  assert.match(app, /aria-label="Copy HEX \$\{color\}, sample \$\{sample\}"/);
  assert.match(app, /aria-label="Edit color of sample \$\{sample\} \(image point \$\{sample\}\)"/);
  assert.match(app, /\$\{extracted\.variantName\} · \$\{extracted\.colors\.length\} colors/);
  assert.doesNotMatch(app, /· 5 colors/);
  assert.match(app, /const workspace = workspaceFromColors\(extracted\.colors, extracted\.roleIndex\);/);
  assert.match(app, /colors: roleColors\(workspace\), workspace \}\)\)/);
  assert.doesNotMatch(extractHtml, /Five draggable/);
  assert.match(extractHtml, /\/app\.js\?v=107/);
  assert.match(extractStyles, /\.extract-page \.extracted-swatches \.extract-insert\{position:absolute;/);
});

test('globe selections open in Studio with exactly the chosen colors; suggestions are never authored', async () => {
  const [{ paletteFromColor }, { suggestPaletteName }, { savePaletteHandoff }] = await Promise.all([
    import('../dist/color.js'), import('../dist/palette-names.js'), import('../dist/palette-handoff.js'),
  ]);
  // Runs the real homepage functions from app.js with only the selection state supplied.
  const body = name => `${app.slice(app.indexOf(`function ${name}(`), app.indexOf('\n}\n', app.indexOf(`function ${name}(`)))}\n}`;
  const build = selected => new Function('atlasSelected', 'paletteFromColor', 'suggestPaletteName', 'workspaceFromColors', 'roleColors',
    `${body('miniStudioColors')}\n${body('buildAtlasPalette')}\nreturn { palette: buildAtlasPalette(), suggested: miniStudioColors() };`,
  )(selected.map(hex => ({ hex })), paletteFromColor, suggestPaletteName, workspaceFromColors, roleColors);
  const picks = ['#C0392B', '#2255CC', '#F2C14E', '#3D7A5A', '#6D597A'];
  assert.equal(build([]).palette, null, 'nothing chosen, nothing handed off');
  for (let count = 1; count <= 5; count += 1) {
    const chosen = picks.slice(0, count);
    const { palette, suggested } = build(chosen);
    assert.equal(suggested.length, 5, `${count}: the homepage still shows five swatches, suggestions included`);
    assert.equal(palette.colors.length, 5, `${count}: five role colors ride along for compatibility`);
    const storage = new Map();
    assert.equal(savePaletteHandoff(palette, () => ({ setItem: (key, value) => storage.set(key, value) })), true);
    const restored = withWorkspace(JSON.parse(storage.get('colorverse-current-palette')));
    if (count === 1) {
      assert.equal(palette.workspace, undefined);
      assert.deepEqual(restored.workspace.members, suggested, 'one color keeps the existing completion');
      assert.equal(palette.description, 'One chosen color, completed with four generated suggested tones.');
    } else if (count === 5) {
      assert.equal(palette.workspace, undefined);
      assert.deepEqual(restored.workspace, { v: 1, members: chosen, roleIndex: [0, 1, 2, 3, 4] }, 'five stay the historic five members');
      assert.equal(palette.description, '5 chosen colors.');
    } else {
      assert.deepEqual(palette.workspace, workspaceFromColors(chosen));
      assert.deepEqual(restored.workspace.members, chosen, `${count}: exactly the chosen colors are members`);
      assert.deepEqual(restored.workspace.roleIndex, defaultRoleIndex(count));
      roleColors(restored.workspace).forEach((color, role) => {
        if (isSupportRole(restored.workspace, role)) assert.equal(color, SUPPORT_COLORS[role], 'support only in role slots');
      });
      for (const tone of suggested.slice(count)) assert.ok(!restored.workspace.members.includes(tone), 'a suggested tone is never a member');
      assert.deepEqual(exportPalette(restored, 'hex').split('\n').map(line => line.split('\t')[0]), chosen, 'export lists only the chosen colors');
      assert.deepEqual(withWorkspace(JSON.parse(JSON.stringify(restored))).workspace, restored.workspace, 'second reload');
      assert.equal(palette.description, `${count} chosen colors, previewed with neutral support that is not part of the palette.`);
    }
  }
  let message = '';
  assert.equal(savePaletteHandoff(build(picks.slice(0, 2)).palette, () => { throw new Error('denied'); }, text => { message = text; }), false, 'storage failure stays on the homepage');
  assert.match(message, /Browser storage is unavailable/);
  assert.match(app, /if \(action\) action\.textContent = atlasSelected\.length === 1 \? 'Complete in Studio ↗' : 'Continue in Studio ↗';/);
});
