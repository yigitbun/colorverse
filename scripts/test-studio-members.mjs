import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import test from 'node:test';
import {
  workspaceFromColors, sanitizeWorkspace, withWorkspace, roleColors, roleOfMember, memberLabel, previewColorLabel, isCompact,
  setMember, assignRole, swapRoles, insertMember, removeMember, previewMapping, EXTRACT_MAX_MEMBERS,
} from '../dist/studio-members.js';
import { exportPalette } from '../dist/color.js';
import { sanitizeDraft } from '../dist/member-palette.js';

const read = path => readFile(new URL(`../dist/${path}`, import.meta.url), 'utf8');
const [app, store, account, extractHtml, studioStyles, extractStyles, globe] = await Promise.all([
  read('app.js'), read('project-store.js'), read('account.js'), read('extract/index.html'), read('studio-editor.css'), read('extract-workspace.css'), read('color-globe.js'),
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
  assert.equal(withWorkspace({ id: 'short', colors: five.slice(0, 4) }), null);
  assert.equal(withWorkspace({ id: 'max', colors: many }).workspace.members.length, 24);
  assert.equal(workspaceFromColors(five.slice(0, 4)), null, 'fewer than five is not padded with invented colors');
  for (const bad of [[0, 0, 1, 2, 3], [0, 1, 2, 3], [0, 1, 2, 3, 10], [0, 1, 2, 3, 1.5]]) assert.equal(workspaceFromColors(ten, bad), null);
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
  assert.match(account, /studio\.disabled = item\.colors\.length < 5/);
  assert.match(app, /workspaceFromColors\(saved\.colors, saved\.roleIndex \|\| \(saved\.colors\.length === 5 \? undefined : null\)\)/);
  assert.doesNotMatch(app, /saved\?\.colors\.length === 5/);
  assert.match(app, /sanitizeDraft\(\{ \.\.\.snapshot, colors: \[\.\.\.current\.workspace\.members\]/);
});

test('project, prototype and template paths save and restore the complete workspace', () => {
  assert.match(app, /workspace: isCompact\(current\.workspace\) \?/);
  assert.match(app, /const workspace = sanitizeWorkspace\(snapshot\.workspace, colors\) \|\| workspaceFromColors\(colors\);/);
  assert.equal(store.match(/editorStateFor\(snapshot\)/g)?.length, 3);
  assert.equal(store.match(/workspace: version\.editor_state\?\.workspace/g)?.length, 2);
  assert.match(store, /workspace: baseline\.editor_state\?\.workspace/);
  assert.match(store, /workspace: template\.defaults\?\.workspace/);
  // RPC color fields remain the five role colors.
  assert.equal(store.match(/p_colors: snapshot\.colors/g)?.length, 4);
  assert.match(store, /client\.rpc\('save_member_palette', \{\n        p_item_id: null,/);
  assert.match(store, /p_colors: members,/);
  assert.match(store, /if \(members\?\.length > 5\)/);
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
  assert.match(extractHtml, /\/app\.js\?v=103/);
  assert.match(extractStyles, /\.extract-page \.extracted-swatches \.extract-insert\{position:absolute;/);
});
