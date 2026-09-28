import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import test from 'node:test';
import { reportData, reportEntering, reportPreview } from '../dist/report-preview.js';

const app = await readFile(new URL('../dist/app.js', import.meta.url), 'utf8');
const studio = await readFile(new URL('../dist/studio/index.html', import.meta.url), 'utf8');
const inspiration = await readFile(new URL('../dist/inspiration/index.html', import.meta.url), 'utf8');
const styles = await readFile(new URL('../dist/context-kits.css', import.meta.url), 'utf8');
const studioStyles = await readFile(new URL('../dist/studio-editor.css', import.meta.url), 'utf8');
const store = await readFile(new URL('../dist/project-store.js', import.meta.url), 'utf8');
const reportStyles = await readFile(new URL('../dist/report-preview.css', import.meta.url), 'utf8');

test('Studio groups live applications as Products, Screens, and Campaigns', () => {
  const contexts = [...studio.matchAll(/data-context="([^"]+)"/g)].map(match => match[1]);
  assert.deepEqual(contexts, ['landing', 'interface', 'social', 'presentation']);
  for (const label of ['Products', 'Screens', 'Campaigns']) assert.match(studio, new RegExp(`>${label}<`));
  // The visible label changed; the saved context key did not.
  assert.match(studio, /data-context="landing">Products<\/button>/);
  assert.doesNotMatch(studio, />Objects</);
  assert.match(studio, /<option value="brand">Products<\/option>/);
  assert.match(studio, /data-context="presentation" hidden>Report \(legacy\)<\/button>/);
  assert.match(app, /interface: reportPreview\(\),/);
  assert.match(app, /import \{ reportPreview \} from '\.\/report-preview\.js\?v=\d+'/);
  assert.match(app, /landing: productPreview/);
  assert.match(app, /social:\s*`<div class="mockup context-kit campaign-kit">/);
});

test('Product preview offers directions without retired images', () => {
  for (const kind of ['footwear', 'skincare', 'object']) assert.match(studio, new RegExp(`data-product-kind="${kind}"`));
  assert.match(app, /product-preview-kit/);
  assert.match(app, /Reference image pending/);
  assert.doesNotMatch(app, /\/assets\/(?:editions|palette-library)\//);
});

test('Skincare keeps approved serum mappings without an extra assignment panel', () => {
  assert.match(app, /mountPhotoColorway/);
  assert.match(app, /\['label', 'Label'\], \['bottle', 'Body'\], \['carton', 'Accent'\], \['cap', 'Cap'\]/);
  assert.match(app, /tube: assignment\.label, bottle: assignment\.bottle, jar: assignment\.carton, cap: assignment\.cap/);
  assert.match(app, /data-photo-host/);
  assert.match(app, /mountPhotoColorway\(host, \{ profile: KATRE_SERUM_PROFILE, colorway, baseline \}\)/);
  assert.doesNotMatch(app, /Apply palette colors|data-care-part|class="care-map"/);
  assert.match(app, /if \(role === 4\) surfaces\.push\('Print'\)/);
  assert.doesNotMatch(app, /class="care-bottle"|const careStage/);
  assert.match(studio, /photo-colorway\.css/);
});

test('Screens report owns a neutral canvas; palette colors stay accents and swatches', () => {
  const root = reportStyles.match(/\.bi-report\{([^}]*)\}/)[1];
  assert.match(root, /background:var\(--bi-canvas\)/);
  assert.match(root, /color:var\(--bi-ink\)/);
  // At most a faint tint of the palette background reaches the canvas.
  const tint = Number(root.match(/--bi-canvas:color-mix\(in srgb,var\(--p-bg\) (\d+)%/)[1]);
  assert.ok(tint <= 6, `canvas tint ${tint}%`);
  assert.match(root, /--bi-card:white/);
  // Text and labels never take a palette member that may be pale or saturated.
  assert.doesNotMatch(reportStyles, /(?:^|[;{])color:var\(--p-/m);
  assert.doesNotMatch(reportStyles, /\.bi-axis\{fill:var\(--p-/);
  // Pale primaries keep a darker edge on white; the swatch strip shows all five roles honestly.
  assert.match(reportStyles, /\.bi-line-case\{[^}]*stroke:var\(--bi-edge\)/);
  assert.match(reportStyles, /\.bi-bar\{[^}]*box-shadow:inset 0 0 0 1px var\(--bi-edge\)/);
  ['bg', 'surface', 'primary', 'accent', 'text'].forEach((role, index) => assert.match(reportStyles, new RegExp(`\\.bi-swatches li:nth-child\\(${index + 1}\\)\\{background:var\\(--p-${role}\\)\\}`)));
  const html = reportPreview();
  assert.equal(html.match(/<ul class="bi-swatches"[^>]*>(.*?)<\/ul>/)[1].match(/<li /g).length, 5);
  assert.equal(html.match(/<article>/g).length, 4, 'four KPIs');
  assert.match(html, /class="bi-trend"/);
  assert.match(html, /class="bi-bars"/);
  // Narrow previews stack header, KPIs and charts; the footer wraps.
  const narrow = reportStyles.slice(reportStyles.indexOf('@container (max-width:560px)'));
  assert.match(narrow, /\.bi-kpis\{grid-template-columns:repeat\(2,minmax\(0,1fr\)\)/);
  assert.match(narrow, /\.bi-charts\{grid-template-columns:1fr\}/);
  assert.match(reportStyles, /\.bi-foot\{[^}]*flex-wrap:wrap/);
});

test('Screens charts animate once on entrance and respect reduced motion', () => {
  // A mounted report means a palette edit re-render: no replay. No DOM: no motion class.
  assert.equal(reportEntering({ querySelector: () => null }), true);
  assert.equal(reportEntering({ querySelector: () => ({}) }), false);
  assert.equal(reportEntering(undefined), false);
  assert.match(reportPreview(reportData, { enter: true }), /^<div class="mockup context-kit bi-report bi-enter">/);
  assert.match(reportPreview(reportData, { enter: false }), /^<div class="mockup context-kit bi-report">/);
  const html = reportPreview(reportData, { enter: true });
  assert.equal(html.match(/class="bi-line-(?:case|current)"[^>]*pathLength="1"/g).length, 2);
  assert.deepEqual([...html.matchAll(/<li style="--i:(\d)">/g)].map(match => Number(match[1])), [0, 1, 2, 3, 4]);
  const motion = reportStyles.slice(0, reportStyles.indexOf('@media (prefers-reduced-motion'));
  const animated = [...motion.matchAll(/\.bi-enter [^{]*\{animation:([^}]*)\}/g)].map(match => match[1]);
  assert.ok(animated.length >= 5);
  for (const rule of animated) {
    assert.match(rule, /^bi-(?:draw|grow|fade) /);
    assert.match(rule, /backwards$/, 'motion releases to the static final state');
  }
  assert.doesNotMatch(reportStyles, /infinite|alternate|animation-iteration-count/);
  // Static styles are the finished chart; no dash or scale is left behind.
  assert.doesNotMatch(reportStyles.replace(/@keyframes[^{]*\{(?:[^{}]*\{[^}]*\})*[^}]*\}/g, ''), /stroke-dashoffset|scaleX/);
  const reduced = reportStyles.match(/@media \(prefers-reduced-motion:reduce\)\{([^]*?)\n\}/)[1];
  for (const part of ['bi-line-case', 'bi-line-current', 'bi-line-previous', 'bi-area', 'bi-point', 'bi-bar', 'bi-target']) assert.match(reduced, new RegExp(`\\.bi-enter \\.${part}[,{]`), part);
  assert.match(reduced, /\{animation:none\}/);
});

test('older report projects keep their original preview', () => {
  assert.match(app, /presentation:\s*`<div class="mockup context-kit report-kit">/);
  assert.match(app, /legacyReport\.hidden = context !== 'presentation'/);
  assert.match(store, /slides: 'presentation'/);
});

test('Palette rows select; visible right-side tools apply shades', () => {
  assert.match(app, /data-select-member/);
  assert.match(studio, /id="colorShadeGrid"/);
  assert.match(app, /data-color-shade/);
  assert.doesNotMatch(app, /role-shade-overlay|data-inline-role-shade/);
  assert.doesNotMatch(studioStyles, /role-shade-in|role-shade-out/);
  assert.doesNotMatch(studio, /shadeStudio|openShadeStudio|shade-studio\.css/);
  assert.doesNotMatch(app, /createShadeStudio|openShadeStudio/);
});

test('the material study compares one selected role across five named surfaces', () => {
  for (const name of ['Mineral paint', 'Woven textile', 'Uncoated paper', 'Matte polymer', 'Brushed metal']) {
    assert.match(app, new RegExp(name));
  }
  assert.match(app, /panel\.style\.setProperty\('--p-material', activeColor\(\)\)/);
  assert.match(app, /Visual comparison only\.<\/b> Check physical samples before production\./);
  assert.match(styles, /\.material-plaster/);
  assert.match(styles, /\.material-textile/);
  assert.match(styles, /\.material-paper/);
  assert.match(styles, /\.material-polymer/);
  assert.match(styles, /\.material-metal/);
});

test('the first Edition keeps its packaging identity inside Studio', () => {
  assert.match(app, /current\.id === 'skincare-system-01'/);
  assert.match(app, /Soft Structure palette applied to five care objects/);
  assert.match(app, /<strong>Cleanse<\/strong>/);
  assert.match(app, /<strong>Night<\/strong>/);
  assert.match(styles, /\.edition-pack-scene/);
  assert.match(styles, /\.edition-tube-5/);
});

test('the footwear Edition keeps its independent brand identity inside Studio', () => {
  assert.match(app, /id: 'drift-field-01'/);
  assert.match(app, /name: 'Field 01'/);
  assert.match(app, /brand: 'DRIFT'/);
  assert.match(app, /current\.id === 'drift-field-01'/);
  assert.match(app, /edition-footwear-image visual-pending/);
  assert.match(app, /edition-footwear-kit/);
  assert.match(styles, /\.edition-footwear-scene/);
});

test('Inspiration exposes supplied AI studies rather than placeholder editions', () => {
  assert.match(inspiration, /data-study-gallery="inspiration"/);
  assert.match(inspiration, /AI-generated concepts/);
  assert.match(inspiration, /not manufacturer specifications or approved Library palettes/);
  assert.match(inspiration, /study-gallery\.js/);
  assert.doesNotMatch(inspiration, /Image awaiting curation|CV \/ SS|DRIFT \/ F01/);
});

test('Inspiration presents RoomKit as an in-house experiment with a Lab path', () => {
  assert.match(inspiration, /class="study-tool-link" href="\/lab\/#roomKitTitle"/);
  assert.match(inspiration, /<strong>RoomKit<\/strong>/);
  assert.doesNotMatch(inspiration, /ROOMKIT \/ 01|RoomKit example direction/);
  assert.match(inspiration, /private upload/);
});

test('Focused Studio contexts map cleanly into project snapshots', () => {
  assert.match(app, /context,\n    productKind/);
  assert.match(store, /interface: 'website'/);
  assert.match(store, /brand: 'landing'/);
  assert.match(store, /productKind: version\.editor_state\?\.productKind \|\| 'skincare'/);
  // One shared editor-state builder keeps the four original fields and adds the optional workspace.
  assert.match(store, /\nconst editorStateFor = snapshot => \(\{\n  context: snapshot\.context, productKind: snapshot\.productKind, careAssignment: snapshot\.careAssignment, colorwayBaseline: snapshot\.colorwayBaseline,\n  \.\.\.\(snapshot\.workspace \? \{ workspace: snapshot\.workspace \} : \{\}\),\n\}\);/);
  assert.equal(store.match(/p_editor_state: editorStateFor\(snapshot\)/g)?.length, 2);
  assert.match(store, /p_defaults: editorStateFor\(snapshot\)/);
  assert.match(store, /landing: 'Products'/);
  assert.doesNotMatch(store, /'Objects'/);
});

test('Studio exposes private reusable template actions', () => {
  assert.match(studio, /projectTemplateForm/);
  assert.match(studio, /Save as template/);
  assert.match(studio, /templateList/);
  assert.match(store, /save_template_snapshot/);
  assert.match(store, /template_use/);
  assert.match(store, /rename_template/);
  assert.match(store, /delete_template/);
  assert.match(store, /colorverse:trayerror/);
  assert.match(store, /archive_project/);
  assert.match(store, /restore_project/);
});
