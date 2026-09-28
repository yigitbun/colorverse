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
  const selection = app.slice(app.indexOf("paletteRoles.addEventListener('click'"), app.indexOf("paletteRoles.addEventListener('keydown'"));
  assert.match(selection, /activeColorIndex = Number/);
  assert.match(selection, /renderColorLab\(\)/);
  assert.doesNotMatch(selection, /replacePaletteColor|commitWorkspace|persistPalette|studiochange|colorGlobe\.open/);
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
  assert.match(app, /const alternatives = colorAlternatives\(color\);/);
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
  assert.match(studioStyles, /\.color-shade-grid\{display:grid;grid-template-columns:repeat\(7,minmax\(0,1fr\)\)/);
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
  assert.match(app, /previewPlacement'\)\.hidden = !isCompact\(current\.workspace\)/);
  assert.match(app, /assignPreviewRole\(activeColorIndex, role\)/);
});

test('Studio assets are cache-busted', () => {
  assert.match(studio, /\/app\.js\?v=103/);
  assert.match(studio, /\/studio-editor\.css\?v=16/);
  assert.match(studio, /\/report-preview\.css\?v=2/);
  assert.match(app, /'\.\/color-alternatives\.js\?v=3'/);
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

test('small screens keep a scrollable horizontal palette rather than squeezing the result', () => {
  assert.match(studioStyles, /\.studio-workspace,\.studio-workspace\.is-palette-collapsed\{grid-template-columns:minmax\(0,1fr\)\}/);
  assert.match(studioStyles, /display:flex;gap:5px;max-height:none;overflow-x:auto;overflow-y:hidden/);
  assert.match(studioStyles, /\.is-palette-collapsed \.palette-member\{flex-basis:44px\}/);
});
