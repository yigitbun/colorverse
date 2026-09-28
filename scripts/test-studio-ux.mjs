import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import test from 'node:test';
import { reportPreview, reportData } from '../dist/report-preview.js';

const read = path => readFile(new URL(`../dist/${path}`, import.meta.url), 'utf8');
const [app, studio, studioStyles, reportStyles] = await Promise.all([read('app.js'), read('studio/index.html'), read('studio-editor.css'), read('report-preview.css')]);
const functionBody = name => app.slice(app.indexOf(`function ${name}(`), app.indexOf('\n}\n', app.indexOf(`function ${name}(`)));

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
  const inspector = studio.slice(studio.indexOf('<aside class="palette-inspector">'), studio.indexOf('</aside>'));
  assert.doesNotMatch(inspector, /productContextPicker/);
  assert.doesNotMatch(studio, /<\/div>\s*<div class="product-context-picker"/);
  assert.doesNotMatch(app, /data-product-kind="/);
  assert.match(functionBody('renderProductPicker'), /classList\.toggle\('has-product-rail', !picker\.hidden\)/);
  assert.match(functionBody('renderSelection'), /renderProductPicker\(\);/);
  assert.match(studioStyles, /\.mockup-stage\.has-product-rail\{display:grid;grid-template-columns:minmax\(0,1fr\)/);
  assert.match(studioStyles, /\.product-context-picker\{display:flex;flex-direction:row;justify-content:center/);
  assert.match(studioStyles, /\.product-context-picker\{flex-direction:row;flex-wrap:wrap/);
  assert.doesNotMatch(studioStyles, /\.product-context-picker\{[^}]*border-bottom/);
  assert.match(app, /vertical && event\.key === 'ArrowDown'/);
  assert.match(app, /vertical && event\.key === 'ArrowUp'/);
});

test('role rows are larger, the whole row toggles shades, and controls stay on top', () => {
  assert.match(studioStyles, /\.palette-inspector \.role-swatch\{grid-template-columns:12px 38px minmax\(0,1fr\) 30px;[^}]*min-height:58px/);
  assert.match(studioStyles, /\.palette-inspector \.role-select::before\{content:"";position:absolute;inset:0/);
  assert.match(studioStyles, /\.palette-inspector \.role-grip,\.palette-inspector \.role-action\{position:relative;z-index:1\}/);
  assert.match(studioStyles, /\.palette-inspector \.role-color-control\{position:relative;z-index:1;/);
  assert.match(studioStyles, /\.palette-inspector \.role-grip\{[^}]*cursor:grab/);
  assert.match(app, /aria-expanded="\$\{open\}"/);
});

test('the inline shade strip fills its row without a dead frame', () => {
  assert.match(studioStyles, /\.role-shade-overlay\{position:absolute;inset:-1px;[^}]*padding:0;/);
  assert.match(studioStyles, /\.inline-shade-strip\{display:flex;width:100%;height:100%;gap:0\}/);
  assert.match(studioStyles, /\.inline-shade-strip button\{[^}]*height:100%/);
  assert.doesNotMatch(studioStyles, /\.inline-shade-strip\{[^}]*height:28px/);
  assert.match(app, /role="listbox"/);
  assert.match(app, /tabindex="\$\{value === focusShade \? 0 : -1\}"/);
});

test('an open strip closes on outside click or Escape without changing colors', () => {
  const dismiss = functionBody('dismissInlineShade');
  assert.match(dismiss, /renderPaletteRoles\(\)/);
  assert.doesNotMatch(dismiss, /renderSelection|replacePaletteColor|studiochange/);
  assert.match(dismiss, /if \(restoreFocus\) \$\('#paletteRoles'\)\?\.querySelector\(`\[data-role-select="\$\{index\}"\]`\)\?\.focus/);
  assert.match(app, /document\.addEventListener\('click', event => \{\n    if \(openShadeIndex === null \|\| event\.target\.closest\?\.\('#paletteRoles \[data-role-index\]'\)\) return;\n    dismissInlineShade\(\);\n  \}, true\);/);
  assert.match(app, /event\.key !== 'Escape' \|\| openShadeIndex === null \|\| event\.defaultPrevented \|\| document\.querySelector\('dialog\[open\]'\)/);
  // Opening and toggling closed only re-render the active role, not a project change.
  const activeRole = functionBody('renderActiveRole');
  assert.doesNotMatch(activeRole, /renderSelection|studiochange/);
  assert.match(app, /closeInlineShade\(index, \(\) => \{ renderActiveRole\(\);/);
});

test('shade strip motion respects reduced motion', () => {
  assert.match(functionBody('closeInlineShade'), /if \(!overlay \|\| reduceMotion\.matches\)/);
  assert.match(studioStyles, /@media\(prefers-reduced-motion:reduce\)\{\.role-shade-overlay,\.role-shade-overlay\.is-closing\{animation:none\}\}/);
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
  assert.match(app, /const alternatives = colorAlternatives\(color\);/);
  assert.doesNotMatch(app, /clamp\(coordinates\.chroma \* 1\.04, \.06, \.2\)/);
  assert.match(app, /replacePaletteColor\(activeColorIndex, color\);/);
});

test('shades are edited only inline; the right panel keeps selected-color tools', () => {
  const panel = studio.slice(studio.indexOf('<aside class="color-lab"'), studio.indexOf('</aside>', studio.indexOf('<aside class="color-lab"')));
  // The duplicated vertical Light-to-deep strip and its hooks are gone everywhere.
  for (const removed of [/colorShadeGrid/, /vertical-shades?/, /shadeCurrentHex/, /shadeOptionCount/, /Light to deep/, /Choose a shade to apply it/]) {
    assert.doesNotMatch(panel, removed);
    assert.doesNotMatch(app, removed);
  }
  assert.doesNotMatch(studioStyles, /\.vertical-shades|\.shade-endpoint/);
  assert.match(panel, /<h3 id="colorLabTitle">Selected color<\/h3><span id="selectedColorLabel">/);
  assert.match(panel, /Shades open beside the color on the left\./);
  // Alternatives, contrast and tray remain in the panel.
  for (const id of ['colorAlternativeGrid', 'colorContrastGrid', 'addColorToTray', 'colorTray']) assert.match(panel, new RegExp(`id="${id}"`));
  // No empty second column where the strip used to be.
  assert.match(studioStyles, /\.shade-panel-body\{display:block\}/);
  assert.doesNotMatch(studioStyles, /\.shade-panel-body\{[^}]*grid-template-columns/);
  // The inline strip is the one shade path, with its own keyboard handling.
  assert.match(app, /data-inline-role-shade="\$\{index\}"/);
  assert.match(app, /const tone = event\.target\.closest\('\[data-inline-role-shade\]'\);/);
  assert.doesNotMatch(app, /\$\('#colorLab'\)\?\.addEventListener\('click', event => \{\n  const shade/);
});

test('Selected color states where it is used on the Skincare photo, and only there', () => {
  const panel = studio.slice(studio.indexOf('<aside class="color-lab"'), studio.indexOf('</aside>', studio.indexOf('<aside class="color-lab"')));
  assert.match(panel, /<span id="selectedColorUse" hidden><\/span>/);
  const hint = functionBody('renderColorUseHint');
  // Hidden outside Products → Skincare, so no stale photo claim survives a context or product switch.
  assert.match(hint, /if \(context !== 'landing' \|\| productKind !== 'skincare'\) \{\n    hint\.hidden = true;\n    hint\.textContent = '';\n    return;\n  \}/);
  // An unassigned extra member (role < 0) is not one of the five colors the photo can use.
  assert.match(hint, /const role = roleOfMember\(current\.workspace, activeColorIndex\);/);
  assert.match(hint, /role < 0\s*\n\s*\? `\$\{label\} isn't one of the five preview colors, so the photo doesn't use it\. Give it a role above to apply it\.`/);
  // Assigned members are checked against the live careAssignment map, not a fixed guess.
  assert.match(hint, /const surfaces = PHOTO_SURFACE_CONTROLS\.filter\(\(\[part\]\) => careAssignment\[part\] === role\)\.map\(\(\[, title\]\) => title\);/);
  assert.match(hint, /if \(role === 4\) surfaces\.push\('Print'\)/);
  assert.match(hint, /Colors \$\{surfaces\.join\(' & '\)\} in the photo\. Background and clear glass base stay fixed\./);
  assert.match(hint, /Not applied to the photo\. Choose \$\{label\} for Label, Body, Accent or Cap above\./);
  // Updated on member/color selection, and on context, product-kind and care-assignment changes.
  assert.match(functionBody('renderColorLab'), /renderColorUseHint\(\);/);
  assert.match(app, /setupTabs\('\[data-context\]', button => \{ context = button\.dataset\.context;.*renderColorUseHint\(\);/);
  assert.match(app, /setupTabs\('\[data-product-kind\]', button => \{ productKind = button\.dataset\.productKind;.*renderColorUseHint\(\);/);
  assert.match(app, /careAssignment\[select\.dataset\.carePart\] = index;\n  persistPalette\(current\);\n  renderMockup\(\);\n  renderColorUseHint\(\);/);
});

test('Studio assets are cache-busted', () => {
  assert.match(studio, /\/app\.js\?v=100/);
  assert.match(studio, /\/studio-editor\.css\?v=12/);
  assert.match(studio, /\/report-preview\.css\?v=2/);
  assert.match(app, /'\.\/color-alternatives\.js\?v=1'/);
});
