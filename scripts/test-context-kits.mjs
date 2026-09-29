import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import test from 'node:test';
import { reportData, reportEntering, reportKpis, reportPreview, reportTakeaways, shares } from '../dist/report-preview.js';

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
  // Region bars, category bars, channel slices and takeaways each stagger from zero.
  const staggers = list => [...(list ?? '').matchAll(/style="--i:(\d)"/g)].map(match => Number(match[1]));
  assert.deepEqual(staggers(html.match(/aria-label="Illustrative revenue by region[^]*?<\/ul>/)?.[0]), [0, 1, 2, 3, 4]);
  assert.deepEqual(staggers(html.match(/class="bi-bars bi-categories"[^]*?<\/ul>/)?.[0]), [0, 1, 2, 3]);
  assert.deepEqual(staggers(html.match(/<svg viewBox="0 0 42 42"[^]*?<\/svg>/)?.[0]), [0, 1, 2, 3]);
  assert.deepEqual(staggers(html.match(/class="bi-takeaways"[^]*?<\/ul>/)?.[0]), [0, 1, 2]);
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
  for (const part of ['bi-line-case', 'bi-line-current', 'bi-line-previous', 'bi-area', 'bi-point', 'bi-bar', 'bi-target', 'bi-slice', 'bi-takeaways li']) assert.match(reduced, new RegExp(`\\.bi-enter \\.${part}[,{]`), part);
  assert.match(reduced, /\{animation:none\}/);
});

test('Screens report figures reconcile across KPIs, charts and takeaways', () => {
  const sum = values => values.reduce((total, value) => total + value, 0);
  const cents = value => Math.round(value * 100);
  const growth = (now, before) => ((now / before - 1) * 100).toFixed(1);
  const revenue = sum(reportData.current), previous = sum(reportData.previous);
  // Every breakdown sums to the revenue KPI (€M at two decimals); categories also match the previous year.
  assert.equal(revenue, 4820);
  for (const rows of [reportData.regions, reportData.channels, reportData.categories]) assert.equal(cents(sum(rows.map(row => row[1]))), revenue / 10);
  assert.equal(cents(sum(reportData.categories.map(([, , before]) => before))), previous / 10);
  // KPI strings follow from the base figures, including AOV = revenue / orders.
  const aov = revenue * 1000 / reportData.orders.current, aovPrevious = previous * 1000 / reportData.orders.previous;
  assert.deepEqual(reportKpis().map(({ value, change, up }) => [value, change, up]), [
    ['€4.82M', `${growth(revenue, previous)}% vs PY`, true],
    ['38.2%', '1.1 pt vs PY', true],
    ['12,480', `${growth(reportData.orders.current, reportData.orders.previous)}% vs PY`, true],
    [`€${Math.round(aov)}`, `${growth(aov, aovPrevious)}% vs PY`, true],
  ]);
  assert.deepEqual(reportKpis().map(kpi => kpi.change), ['6.4% vs PY', '1.1 pt vs PY', '3.9% vs PY', '2.4% vs PY']);
  // Shown whole-percent shares total 100 and are within rounding of the exact share.
  for (const rows of [reportData.channels, reportData.categories]) {
    const percent = shares(rows.map(row => row[1]));
    assert.equal(sum(percent), 100);
    percent.forEach((share, index) => assert.ok(Math.abs(share - rows[index][1] / (revenue / 1000) * 100) < 1));
  }
  assert.deepEqual(shares(reportData.channels.map(row => row[1])), [42, 29, 18, 11]);
  assert.deepEqual(shares(reportData.categories.map(row => row[1])), [36, 27, 22, 15]);
  assert.deepEqual(shares([1, 1, 1]), [34, 33, 33]);
  // Each takeaway is checkable against a visible chart.
  const takeaways = reportTakeaways();
  assert.equal(takeaways.length, 3);
  assert.equal(Math.max(...reportData.current), reportData.current[11]);
  assert.deepEqual(takeaways[0], { title: 'Revenue +6.4% vs PY', detail: 'December was the strongest month at €482k.' });
  const categoryGrowth = reportData.categories.map(([name, now, before]) => [name, Number(growth(now, before))]);
  assert.deepEqual(categoryGrowth, [['Apparel', 3.6], ['Footwear', 12.1], ['Accessories', 5.9], ['Equipment', 4.5]]);
  assert.deepEqual(takeaways[1], { title: 'Footwear grew fastest', detail: '+12.1% vs PY to €1.30M, ahead of every other category.' });
  assert.deepEqual(reportData.regions.filter(([, actual, target]) => actual < target).map(([name, actual, target]) => [name, cents(target - actual)]), [['South', 7], ['East', 7]]);
  assert.deepEqual(takeaways[2], { title: '2 of 5 regions below target', detail: 'Gaps: South €0.07M, East €0.07M.' });
});

test('Screens report markup shows channel, category and takeaway panels with static scope', () => {
  const html = reportPreview(reportData, { enter: false });
  assert.deepEqual([...html.matchAll(/<h5[^>]*>([^<]+)<\/h5>/g)].map(match => match[1]), ['Revenue trend', 'Revenue by channel', 'Revenue by category', 'Revenue by region', 'Key takeaways']);
  // Channel ring: one slice per channel whose dash lengths are the shown shares, laid end to end.
  const slices = [...html.matchAll(/class="bi-slice"[^>]*stroke-dasharray="(\d+) (\d+)" stroke-dashoffset="(-?\d+)"/g)].map(match => match.slice(1).map(Number));
  assert.deepEqual(slices, [[42, 58, 0], [29, 71, -42], [18, 82, -71], [11, 89, -89]]);
  assert.match(html, /<div class="bi-donut">[^]*<strong>€4\.82M<\/strong><span>Revenue<\/span>/);
  assert.deepEqual([...html.matchAll(/<li><i aria-hidden="true"><\/i><span>([^<]+)<\/span><b>(\d+)%<\/b><small>([^<]+)<\/small><\/li>/g)].map(match => match.slice(1)), [
    ['Online store', '42', '€2.03M'], ['Retail stores', '29', '€1.40M'], ['Marketplace', '18', '€0.87M'], ['Wholesale', '11', '€0.52M'],
  ]);
  assert.deepEqual([...html.matchAll(/<span class="bi-bar-value">(€[\d.]+M) <small>(\d+)%<\/small><\/span>\s*<span class="bi-growth">([^<]+)</g)].map(match => match.slice(1)), [
    ['€1.74M', '36', '+3.6%'], ['€1.30M', '27', '+12.1%'], ['€1.08M', '22', '+5.9%'], ['€0.70M', '15', '+4.5%'],
  ]);
  assert.equal(html.match(/<ul>[^]*?<\/ul>/g).at(-1).match(/<li /g).length, 3, 'three takeaways');
  // Scope reads as a fixed statement: no controls, chevrons or live-data claims.
  assert.match(html, /<div class="bi-scope"><span>Scope<\/span><ul class="bi-filters" aria-label="Report scope, fixed for this preview">/);
  assert.doesNotMatch(html, /<(?:button|select|input|a)\b|▾|⌄|chevron|Last refresh|Updated/i);
  assert.match(html, /<footer class="bi-foot"><span>Illustrative data · not a live report or Power BI connection<\/span>/);
  assert.doesNotMatch(html, /<img|<script|<iframe|https?:|fetch/i);
  // Palette-derived series colors and responsive rules.
  assert.match(reportStyles, /--bi-c1:var\(--p-primary\);--bi-c2:var\(--p-accent\)/);
  [1, 2, 3, 4].forEach(index => {
    assert.match(reportStyles, new RegExp(`\\.bi-slice:nth-of-type\\(${index + 1}\\)\\{stroke:var\\(--bi-c${index}\\)\\}`));
    assert.match(reportStyles, new RegExp(`\\.bi-mix-list li:nth-child\\(${index}\\) i\\{background:var\\(--bi-c${index}\\)\\}`));
  });
  assert.match(reportStyles, /\.bi-panel\{container:bi-panel\/inline-size;/);
  const narrow = reportStyles.slice(reportStyles.indexOf('@container (max-width:560px)'));
  assert.match(narrow, /\.bi-takeaways ul\{grid-template-columns:1fr\}/);
  // Trend axis labels step up as the panel narrows so they stay legible on screen.
  const axis = [...reportStyles.matchAll(/@container bi-panel \(max-width:(\d+)px\)\{\.bi-axis\{font-size:(\d+)px\}/g)].map(match => [Number(match[1]), Number(match[2])]);
  assert.deepEqual(axis, [[420, 11], [340, 13], [280, 15]]);
  // Rendered size = font-size × panel width / 400 viewBox units, checked at each band's narrow edge.
  const bands = [[420, 9], ...axis.map(([, size], index) => [axis[index + 1]?.[0] ?? 240, size])];
  for (const [edge, size] of bands) assert.ok(size * edge / 400 >= 9, `axis ${size}px at ${edge}px panel`);
  assert.match(reportStyles, /\.bi-axis\{fill:var\(--bi-muted\);font:9px /);
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
