import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import test from 'node:test';
import { reportPreview, reportData } from '../dist/report-preview.js';
import * as members from '../dist/studio-members.js';

const read = path => readFile(new URL(`../dist/${path}`, import.meta.url), 'utf8');
const [app, studio, studioStyles, reportStyles] = await Promise.all([read('app.js'), read('studio/index.html'), read('studio-editor.css'), read('report-preview.css')]);
const functionBody = name => app.slice(app.indexOf(`function ${name}(`), app.indexOf('\n}\n', app.indexOf(`function ${name}(`)));
const constBody = name => app.slice(app.indexOf(`const ${name} = `), app.indexOf('\n};\n', app.indexOf(`const ${name} = `)) + 3);

// Runs the real Studio functions from app.js against the real workspace model,
// with only the DOM and persistence stubbed. `prelude` may declare mutable state.
function studioFunctions(names, scope = {}, prelude = '') {
  const all = { ...members, ...scope };
  const body = [prelude, constBody('paletteSupportText'), ...names.map(name => `${functionBody(name)}\n}`), `return { ${names.join(', ')}, state: () => typeof current === 'undefined' ? null : current };`].join('\n');
  return new Function(...Object.keys(all), body)(...Object.values(all));
}

const PALETTE = ['#1B3A4B', '#E07A5F', '#F2CC8F', '#81B29A', '#3D405B', '#F4F1DE', '#6D597A', '#B56576'];
const sizes = [2, 3, 4, 5, 8];
const workspaceOf = count => members.workspaceFromColors(PALETTE.slice(0, count), count > 5 ? [7, 0, 3, 5, 1] : undefined);

function fakeElement(registry, id) {
  const element = { id, hidden: false, title: '', innerHTML: '', className: '', attributes: {},
    classList: { toggle() {} }, setAttribute(name, value) { this.attributes[name] = value; },
    after(next) { registry[`#${next.id}`] = next; } };
  if (id) registry[`#${id}`] = element;
  return element;
}

function renderRail(workspace) {
  const registry = {};
  fakeElement(registry, 'paletteRoles');
  fakeElement(registry, 'paletteCount');
  const { renderPaletteRoles } = studioFunctions(['renderPaletteRoles', 'paletteSupportNote'], {
    $: selector => registry[selector] || null, document: { createElement: () => fakeElement(registry) },
    current: { workspace }, activeColorIndex: 0, textOn: () => '#000000', updatePaletteOverflow() {}, renderPaletteAdd() {},
  });
  renderPaletteRoles();
  return { rail: registry['#paletteRoles'], support: registry['#paletteSupport'] };
}

test('Studio is modestly wider on its own page only', () => {
  assert.match(studioStyles, /\.studio-page\.section-wrap\{width:min\(1480px,100%\)\}/);
  assert.doesNotMatch(studioStyles, /(^|\})\.section-wrap\{/);
});

test('product directions are centered above the preview without a reserved sidebar', () => {
  const stage = studio.match(/<div class="mockup-stage has-product-rail"><div class="product-context-picker" id="productContextPicker"[^>]*>(.*?)<\/div><div id="mockup"/);
  assert.ok(stage, 'picker is the first child of the preview stage, before #mockup');
  assert.deepEqual([...stage[1].matchAll(/data-product-kind="([^"]+)"/g)].map(match => match[1]), ['skincare', 'footwear', 'object']);
  assert.equal([...stage[1].matchAll(/aria-controls="mockup"/g)].length, 3);
  assert.match(studio, /id="productContextPicker" role="tablist" aria-label="Product direction" aria-orientation="horizontal"/);
  // Not in "Your palette", not between the tabs and the stage, and never rebuilt by renderMockup.
  const inspector = studio.slice(studio.indexOf('<aside class="palette-inspector"'), studio.indexOf('</aside>'));
  assert.doesNotMatch(inspector, /productContextPicker/);
  assert.doesNotMatch(studio, /<\/div>\s*<div class="product-context-picker"/);
  assert.doesNotMatch(app, /data-product-kind="/);
  assert.match(functionBody('renderProductPicker'), /classList\.toggle\('has-product-rail', !picker\.hidden\)/);
  assert.match(functionBody('renderSelection'), /renderProductPicker\(\);/);
  assert.match(studioStyles, /\.mockup-stage\.has-product-rail\{display:grid;grid-template-columns:minmax\(0,1fr\)/);
  assert.match(studioStyles, /\.product-context-picker\{display:flex;flex-direction:row;justify-content:center/);
  assert.doesNotMatch(studioStyles, /\.product-context-picker\{[^}]*border-bottom/);
  assert.match(app, /vertical && event\.key === 'ArrowDown'/);
  assert.match(app, /vertical && event\.key === 'ArrowUp'/);
});

test('palette members select without editing; shades and Globe are explicit right tools', () => {
  const palette = functionBody('renderPaletteRoles');
  assert.match(palette, /workspace\.members\.map/);
  assert.match(palette, /data-select-member="\$\{index\}"/);
  assert.match(palette, /aria-pressed="\$\{activeColorIndex === index\}"/);
  assert.doesNotMatch(app, /shadeOverlay|InlineShade|openShadeIndex|data-inline-role-shade/);
  const selection = app.slice(app.indexOf('const selectPaletteMember = index =>'), app.indexOf("paletteRoles.addEventListener('click'"));
  assert.match(selection, /activeColorIndex = index/);
  assert.match(selection, /renderColorLab\(\)/);
  assert.doesNotMatch(selection, /replacePaletteColor|commitWorkspace|persistPalette|studiochange|colorGlobe\.open/);
  // A card click opens that member's Globe; arrow keys only select.
  const cardClick = app.slice(app.indexOf("paletteRoles.addEventListener('click'"), app.indexOf("paletteRoles.addEventListener('keydown'"));
  assert.match(cardClick, /selectPaletteMember\(index\);[\s\S]*colorGlobe\.open\(index\)/);
  assert.doesNotMatch(cardClick, /replacePaletteColor|commitWorkspace|persistPalette|studiochange/);
  const arrows = app.slice(app.indexOf("paletteRoles.addEventListener('keydown'"), app.indexOf("$('#togglePaletteRail')?.addEventListener"));
  assert.match(arrows, /selectPaletteMember\(next\)/);
  assert.doesNotMatch(arrows, /colorGlobe\.open|\.click\(\)/);
  assert.match(studio, /id="openSelectedGlobe"[^>]*aria-controls="colorGlobe"/);
  assert.match(app, /colorGlobe\.open\(activeColorIndex\)/);
});

test('palette collapse changes presentation only, with accessible expand state', () => {
  assert.match(studio, /id="togglePaletteRail"[^>]*aria-expanded="true"/);
  const collapse = app.slice(app.indexOf("$('#togglePaletteRail')?.addEventListener"), app.indexOf("$('#openSelectedGlobe')?.addEventListener"));
  assert.match(collapse, /classList\.toggle\('is-palette-collapsed'\)/);
  assert.match(collapse, /setAttribute\('aria-expanded', String\(!collapsed\)\)/);
  assert.doesNotMatch(collapse, /persistPalette|studiochange|current =|replacePaletteColor/);
  assert.match(studioStyles, /grid-template-columns:184px minmax\(0,1fr\) 280px/);
  assert.match(studioStyles, /grid-template-columns:64px minmax\(0,1fr\) 280px/);
  assert.match(studioStyles, /\.is-palette-collapsed \.palette-member-label/);
});

test('a fresh Studio starts with the existing colorful serum palette, never overwrites a resumable draft', () => {
  assert.match(app, /colors: page === 'studio' \? \[\.\.\.SERUM_SOURCE_COLORS\] : \['#F7F6F2'/);
  assert.match(app, /requestedPalette \|\| \(resumablePalette/);
  assert.match(app, /resumablePalette : workingDraft/);
  assert.match(app, /current = withWorkspace\(current\) \|\| withWorkspace\(workingDraft\)/);
});

test('visible Studio skincare branding reads Katre; stable IDs remain', () => {
  assert.doesNotMatch(app, /CV \/ (?:CARE|Care|SS)/);
  assert.equal(app.match(/<span>KATRE<\/span>/g)?.length, 5);
  assert.match(app, /<h4>Katre<\/h4>/);
  assert.match(app, /Katre is a design concept/);
  assert.match(app, /current\.id === 'skincare-system-01'/);
  assert.match(app, /import \{ freezeColorway \} from '\.\/colorway-kit\.js\?v=3'/);
  assert.match(app, /exportPhotoPreview\(current\.name\)/);
});

test('Screens shows a native report with illustrative, internally consistent data', () => {
  const html = reportPreview();
  assert.match(html, /^<div class="mockup context-kit bi-report">/);
  assert.match(html, /<h4>Sales performance<\/h4>/);
  assert.equal([...html.matchAll(/<li>(FY 2026|All regions|All channels)<\/li>/g)].length, 3);
  assert.equal([...html.matchAll(/<article>/g)].length, 4);
  assert.match(html, /<svg class="bi-trend"[^>]*role="img"/);
  assert.equal([...html.matchAll(/class="bi-bar-label"/g)].length, 5);
  assert.match(html, /Illustrative data · not a live report or Power BI connection/);
  assert.doesNotMatch(html, /<img|<script|<iframe|https?:|Northstar|#[0-9a-f]{3,6}\b/i);
  const sum = values => values.reduce((total, value) => total + value, 0);
  assert.equal(sum(reportData.current), 4820);
  assert.equal(Math.round(sum(reportData.regions.map(([, actual]) => actual)) * 100), 482);
  assert.equal(((sum(reportData.current) / sum(reportData.previous) - 1) * 100).toFixed(1), '6.4');
  assert.doesNotMatch(app, /Northstar/);
});

test('report colors follow the live palette variables only', () => {
  assert.doesNotMatch(reportStyles, /#[0-9a-f]{3,8}\b|rgb\(|hsl\(/i);
  for (const variable of ['--p-bg', '--p-text', '--p-primary', '--p-accent', '--p-surface']) assert.ok(reportStyles.includes(`var(${variable})`), variable);
  assert.match(reportStyles, /\.bi-axis\{fill:var\(--bi-muted\)/);
  // The site-wide svg{stroke:currentColor} icon rule must not outline chart labels.
  assert.match(reportStyles, /\.bi-trend\{[^}]*stroke:none\}/);
  assert.match(reportStyles, /\.bi-trend text\{stroke:none/);
  const html = reportPreview();
  assert.equal(html.match(/class="bi-axis"[^>]*text-anchor="end"/g)?.length, 3, 'one label per y tick');
  assert.match(reportStyles, /@container \(max-width:560px\)/);
});

test('Alternatives state their single-color scope and use the neutral-safe generator', () => {
  assert.match(studio, /<p id="alternativeScope">Changes the selected color only<\/p>/);
  assert.match(app, /changes \$\{label\} only/);
  assert.match(app, /const label = activeLabel\(\);/);
  assert.match(app, /const alternatives = paletteAlternatives\(color, current\.workspace\.members, activeColorIndex\);/);
  assert.match(app, /checked against the other colors/);
  assert.doesNotMatch(app, /clamp\(coordinates\.chroma \* 1\.04, \.06, \.2\)/);
  assert.match(app, /replacePaletteColor\(activeColorIndex, color, \{ keepShadeSource:/);
});

test('right-side shades are always visible and keep their source while applying a shade', () => {
  const panel = studio.slice(studio.indexOf('<aside class="color-lab"'), studio.indexOf('</aside>', studio.indexOf('<aside class="color-lab"')));
  for (const id of ['colorShadeGrid', 'colorQuickActions', 'colorAlternativeGrid', 'colorContrastGrid', 'addColorToTray', 'colorTray']) assert.match(panel, new RegExp(`id="${id}"`));
  assert.match(panel, /<h4 id="shadeOptionsTitle">Shades<\/h4>/);
  assert.doesNotMatch(panel, /Shades open beside|Show shades/);
  assert.match(functionBody('renderColorLab'), /selectedShadeValues\(activeColorIndex\)/);
  assert.match(app, /keepShadeSource: choice\.hasAttribute\('data-color-shade'\)/);
  assert.match(app, /quickColorAdjustments\(color\)/);
});

test('right-side shades are a vertical stack of full-width strips, not a chip grid', () => {
  assert.match(studio, /id="colorShadeGrid" class="color-shade-grid" role="group" aria-label="Shades for selected color, light to deep"/);
  assert.match(functionBody('selectedShadeValues'), /sort\(\(a, b\) => colorCoordinates\(b\)\.lightness - colorCoordinates\(a\)\.lightness\)/);
  assert.match(studioStyles, /\.color-shade-grid\{display:flex;flex-direction:column;width:100%;min-width:0/);
  assert.match(studioStyles, /\.color-shade-grid button\{[^}]*width:100%;min-width:0;height:14px/);
  assert.doesNotMatch(studioStyles, /\.color-shade-grid\{[^}]*grid-template-columns/);
  assert.match(studioStyles, /\.color-shade-grid button:hover,\.color-shade-grid button:focus-visible\{[^}]*box-shadow:0 0 0 2px var\(--ink\)/);
  assert.match(studioStyles, /\.color-shade-grid button\[aria-pressed="true"\]\{[^}]*box-shadow:inset 0 0 0 2px var\(--on\)/);
  assert.match(studioStyles, /\.color-shade-grid button::after\{content:attr\(title\)/);
  const touch = studioStyles.slice(studioStyles.indexOf('@media(pointer:coarse)'));
  assert.match(touch, /\.color-shade-grid\{max-height:354px;[^}]*overflow-y:auto;overflow-x:hidden/);
  assert.match(touch, /\.color-shade-grid button\{height:28px\}/);
  // No return of the inline role editor or a second shade path.
  assert.doesNotMatch(studioStyles, /vertical-shades|shade-overlay|inline-shade/);
});

test('Selected color tells the truth about actual usage; no product assignment panel remains', () => {
  const hint = functionBody('renderColorUseHint');
  assert.match(studio, /<span id="selectedColorUse" hidden><\/span>/);
  assert.match(hint, /context !== 'landing' \|\| productKind !== 'skincare'/);
  assert.match(hint, /roleOfMember\(current\.workspace, activeColorIndex\)/);
  assert.match(hint, /Choose a color under Use in preview to replace it/);
  assert.match(hint, /PHOTO_SURFACE_CONTROLS\.filter/);
  assert.match(hint, /if \(role === 4\) surfaces\.push\('Print'\)/);
  assert.match(hint, /Background and clear glass base stay fixed/);
  assert.doesNotMatch(app, /Apply palette colors|data-care-part|class="care-map"|careOptions/);
  assert.match(functionBody('renderColorLab'), /renderColorUseHint\(\)/);
  assert.match(app, /previewPlacement'\)\.hidden = current\.workspace\.members\.length === 5;/);
  assert.match(app, /assignPreviewRole\(activeColorIndex, role\)/);
});

test('Studio assets are cache-busted', () => {
  assert.match(studio, /\/app\.js\?v=110/);
  assert.match(studio, /\/studio-editor\.css\?v=22/);
  assert.match(studio, /\/report-preview\.css\?v=4/);
  assert.match(app, /'\.\/color-alternatives\.js\?v=4'/);
});

test('neutral member names and legacy exports remain independent of application', () => {
  assert.match(functionBody('renderPaletteRoles'), /memberLabel\(workspace, index\)/);
  assert.doesNotMatch(functionBody('renderPaletteRoles'), /roles\[index\]/);
  assert.match(app, /const previewLabel = role => previewColorLabel\(current\.workspace, role\)/);
  assert.match(functionBody('renderColorLab'), /`vs \$\{previewLabel\(pairIndex\)\}`/);
  assert.doesNotMatch(functionBody('renderColorLab'), /roles\[pairIndex\]/);
  assert.match(app, /<small>Color \$\{sample\}<\/small>/);
});

test('initial shade anchors use ordered members, not the five mapped preview colors', () => {
  assert.match(app, /let shadeSourceColors = \[\.\.\.current\.workspace\.members\];/);
  assert.doesNotMatch(app, /let shadeSourceColors = current\.colors/);
});

test('the rail shows exactly the authored 2/3/4/5/8 colors; 2–4 add a muted support note, not members', () => {
  for (const count of sizes) {
    const workspace = workspaceOf(count);
    const { rail, support } = renderRail(workspace);
    assert.equal([...rail.innerHTML.matchAll(/data-select-member="/g)].length, count, `${count} member buttons`);
    assert.deepEqual([...rail.innerHTML.matchAll(/data-select-member="\d+"[^>]*aria-label="Edit Color \d+, (#[0-9A-F]{6})/g)].map(match => match[1]), PALETTE.slice(0, count));
    for (const neutral of members.SUPPORT_COLORS) assert.doesNotMatch(rail.innerHTML, new RegExp(neutral), `${count}: no support swatch in the rail`);
    if (count < 5) {
      const neutrals = 5 - count;
      assert.equal(support.hidden, false);
      assert.match(rail.attributes['aria-label'], new RegExp(`^${count} palette colors, plus neutral preview support that is not part of the palette\\.`));
      const text = `Preview support: ${neutrals} fixed neutral${neutrals === 1 ? '' : 's'}, not in your palette`;
      assert.equal(support.title, text);
      assert.match(support.innerHTML, new RegExp(`<span class="palette-support-text">${text}</span>`));
      assert.equal([...support.innerHTML.matchAll(/<i style="--swatch:/g)].length, neutrals);
      assert.match(support.innerHTML, /<span class="palette-support-chips" aria-hidden="true">/);
      assert.doesNotMatch(support.innerHTML, /<button|data-select-member|tabindex/);
    } else {
      assert.equal(support.hidden, true, `${count}: no support note`);
      assert.equal(support.innerHTML, '');
      assert.equal(rail.attributes['aria-label'], `${count} palette colors. Select a color to open it in Color Globe; arrow keys move the selection.`);
    }
  }
  // Collapsed keeps the swatch-first column; the note keeps its chips and a clipped, still-readable label.
  assert.match(studioStyles, /\.palette-support\{display:flex;[^}]*color:var\(--muted\)\}/);
  assert.match(studioStyles, /\.palette-support-chips i\{[^}]*outline:1px dashed var\(--muted\)/);
  assert.match(studioStyles, /\.is-palette-collapsed \.palette-support-text\{position:absolute;width:1px;height:1px;overflow:hidden;clip:rect\(0 0 0 0\)/);
  assert.doesNotMatch(studioStyles, /\.is-palette-collapsed[^{]*\.palette-support[^{]*\{[^}]*display:none/);
});

test('short palettes put both authored starting colors on visible serum surfaces', () => {
  assert.match(app, /const SHORT_CARE_ASSIGNMENT = Object\.freeze\(\{ backdrop: 0, bottle: 2, cap: 1, label: 3, carton: 0 \}\)/);
  assert.match(app, /isShort\(current\.workspace\) \? SHORT_CARE_ASSIGNMENT : DEFAULT_CARE_ASSIGNMENT/);
  assert.match(app, /isShort\(workspace\) \? SHORT_CARE_ASSIGNMENT : DEFAULT_CARE_ASSIGNMENT/);
  const short = workspaceOf(2);
  assert.equal(short.roleIndex[2], 0, 'body uses first authored color');
  assert.equal(short.roleIndex[3], 1, 'label uses second authored color');
});

test('Use in preview shows for 2–4 and 6–24, labels support slots, and keeps five-color controls', () => {
  const { previewSlotChoices } = studioFunctions(['previewSlotChoices']);
  for (const count of [2, 3, 4]) {
    const workspace = workspaceOf(count);
    for (let member = 0; member < count; member += 1) {
      const html = previewSlotChoices(workspace, member);
      const slots = [...html.matchAll(/<button [^>]*>/g)].map(match => match[0]);
      assert.equal(slots.length, 5);
      assert.equal(slots.filter(slot => slot.includes('class="is-support"')).length, 5 - count);
      assert.equal([...html.matchAll(/<span>Preview support<\/span>/g)].length, 5 - count);
      assert.equal(slots.filter(slot => slot.includes('aria-pressed="true"')).length, 1);
      const held = members.roleOfMember(workspace, member);
      assert.match(slots[held], new RegExp(`aria-label="Color ${member + 1} fills preview slot ${held + 1}"`));
      const open = members.defaultRoleIndex(count).indexOf(members.SUPPORT_ROLE);
      if (open !== held) assert.match(slots[open], new RegExp(`aria-label="Move Color ${member + 1} to preview slot ${open + 1}, trading places with Preview support"`));
      assert.doesNotMatch(html, /NaN|undefined|Color support/);
    }
  }
  const eight = previewSlotChoices(workspaceOf(8), 2);
  assert.doesNotMatch(eight, /is-support|Preview support/);
  assert.match(eight, /aria-label="Use Color 3 instead of Color 8 in preview" title="Replace Color 8 in preview"/);
  assert.match(functionBody('renderColorLab'), /isShort\(current\.workspace\) \? `Move \$\{label\} to another slot; the two trade places\. Preview support is never added to your palette\.` : 'Replace one of these five preview colors\.'/);
  assert.match(studioStyles, /#previewSlotChoices button\.is-support\{border-style:dashed\}/);
  // Swap with next exists only when the five members are the five preview slots.
  assert.match(functionBody('renderColorLab'), /\(current\.workspace\.members\.length === 5 \? `<button type="button" data-swap-next>/);
  assert.match(app, /if \(event\.target\.closest\('\[data-swap-next\]'\)\) \{\n\s*\/\/[^\n]*\n\s*if \(current\.workspace\.members\.length !== 5\) return;/);
});

test('assigning any 2–4 slot trades with support, never says NaN, and never promotes support', () => {
  for (const count of sizes) {
    for (let member = 0; member < count; member += 1) {
      for (let role = 0; role < 5; role += 1) {
        const initial = { workspace: workspaceOf(count) };
        if (members.roleOfMember(initial.workspace, member) === role) continue;
        const status = { textContent: '' };
        const { assignPreviewRole, state } = studioFunctions(['assignPreviewRole'], {
          initial, $: selector => selector === '#paletteOrderStatus' ? status : null, track() {},
        }, 'let current = initial; const commitWorkspace = workspace => { current = { ...current, workspace, colors: roleColors(workspace) }; };');
        const before = initial.workspace.roleIndex[role], held = members.roleOfMember(initial.workspace, member);
        assignPreviewRole(member, role);
        const { workspace } = state();
        assert.doesNotMatch(status.textContent, /NaN|undefined|support\d|Color support/, status.textContent);
        assert.match(status.textContent, new RegExp(`^Color ${member + 1} now fills preview slot ${role + 1}; `));
        if (count < 5) {
          assert.deepEqual(workspace.members, initial.workspace.members, 'authored members unchanged');
          assert.equal(workspace.roleIndex.filter(index => index === members.SUPPORT_ROLE).length, 5 - count);
          assert.equal(members.roleOfMember(workspace, member), role);
          assert.equal(status.textContent, `Color ${member + 1} now fills preview slot ${role + 1}; ${before === members.SUPPORT_ROLE ? 'Preview support' : `Color ${before + 1}`} moves to slot ${held + 1}.`);
        } else if (count === 8) {
          assert.equal(workspace.members.length, 8);
          assert.match(status.textContent, held >= 0 ? new RegExp(`Color ${before + 1} moves to slot ${held + 1}\\.$`) : new RegExp(`Color ${before + 1} is no longer in the preview\\.$`));
        }
        for (const neutral of members.SUPPORT_COLORS) assert.ok(!workspace.members.includes(neutral) || PALETTE.includes(neutral));
      }
    }
  }
});

test('small screens keep a scrollable horizontal palette rather than squeezing the result', () => {
  assert.match(studioStyles, /\.studio-workspace,\.studio-workspace\.is-palette-collapsed\{grid-template-columns:minmax\(0,1fr\)\}/);
  assert.match(studioStyles, /display:flex;gap:5px;max-height:none;overflow-x:auto;overflow-y:hidden/);
  assert.match(studioStyles, /\.is-palette-collapsed \.palette-member\{flex-basis:44px\}/);
});
