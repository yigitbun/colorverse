import assert from 'node:assert/strict';
import { existsSync } from 'node:fs';
import { readFile } from 'node:fs/promises';
import test from 'node:test';
import { aiStudies } from '../dist/ai-studies.js?v=2';
import { approvedPaletteIds, homeStudyIds } from '../dist/curation.js?v=8';
import {
  createStudyShelfIndex, groupStudiesByFamily, initLibraryStudyShelf, inspirationGalleryHtml,
  isDisplayableStudy, readCurrentColors, studyCardHtml, studyHref, studyShelfSummary,
} from '../dist/study-gallery.js';

const read = path => readFile(new URL(`../${path}`, import.meta.url), 'utf8');
const inspiration = await read('dist/inspiration/index.html');
const explore = await read('dist/explore/index.html');
const source = await read('dist/study-gallery.js');
const cardIds = html => [...html.matchAll(/data-study-id="([^"]+)"/g)].map(match => match[1]);

test('Inspiration replaces empty placeholders with the supplied AI study gallery', () => {
  assert.doesNotMatch(inspiration, /CV \/ SS|DRIFT \/ F01|ROOMKIT \/ 01|Image awaiting curation/);
  assert.match(inspiration, /data-study-gallery="inspiration"/);
  assert.match(inspiration, /<script type="module" src="\/study-gallery\.js\?v=2"><\/script>/);
  assert.match(inspiration, /<script type="module" src="\/app\.js\?v=96"><\/script>/);
  assert.match(inspiration, /href="\/inspiration\.css\?v=6"/);
  assert.match(inspiration, /AI-generated concepts\.<\/strong>[^<]*fictional[^<]*provisional[^<]*not manufacturer specifications or approved Library palettes/);
  assert.match(inspiration, /<noscript>[\s\S]*Enable JavaScript[\s\S]*<\/noscript>/);
  assert.doesNotMatch(inspiration, /ColorVerse Originals?|Original ColorVerse|approved corpus/i);
});

test('RoomKit stays a compact Lab tool link, not an image study card', () => {
  const link = inspiration.match(/<a class="study-tool-link" href="\/lab\/#roomKitTitle">[\s\S]*?<\/a>/);
  assert.ok(link);
  assert.match(link[0], /RoomKit/);
  assert.doesNotMatch(link[0], /study-card|<img/);
});

test('Inspiration gallery shows all eight studies with exact IDs, names, colors and families', () => {
  const html = inspirationGalleryHtml();
  assert.deepEqual(cardIds(html).sort(), aiStudies.map(study => study.id).sort());
  for (const study of aiStudies) {
    const card = html.match(new RegExp(`<article class="study-card" data-study-id="${study.id}">[\\s\\S]*?</article>`))[0];
    assert.match(card, new RegExp(`<h3>${study.name}</h3>`));
    assert.match(card, new RegExp(`<small>${study.family} · `));
    assert.deepEqual([...card.matchAll(/background:(#[0-9A-F]{6})/gi)].map(match => match[1]), [...study.colors]);
    assert.ok(card.indexOf('study-palette') < card.indexOf('<img'), 'palette comes before the image');
    assert.match(card, new RegExp(`<div class="study-visual"><img src="${study.image}" alt="${study.imageAlt.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}" loading="lazy" decoding="async">`));
    assert.match(card, /<span class="study-ai-badge">AI concept<\/span>/);
    assert.match(card, new RegExp(`<a href="/studio/\\?p=${study.id}#studio" aria-label="Open ${study.name} \\(${study.family} AI concept\\) in Studio">`));
    assert.doesNotMatch(card, /data-select|https?:/);
  }
});

test('study image alt text reaches screen readers and each card has one keyboard Studio link', () => {
  const html = inspirationGalleryHtml();
  assert.doesNotMatch(html, /aria-hidden|tabindex/);
  for (const card of html.match(/<article class="study-card"[\s\S]*?<\/article>/g)) {
    const links = card.match(/<a\s[^>]*>/g);
    assert.equal(links.length, 1, 'exactly one link per card');
    assert.match(links[0], /href="\/studio\/\?p=[a-z0-9-]+#studio"/);
    const image = card.match(/<div class="study-visual">([\s\S]*?)<\/div>/)[1];
    assert.match(image, /<img src="\/assets\/studies\/[a-z0-9-]+\.jpg" alt="AI concept of [^"]+"/);
    assert.doesNotMatch(image, /<a\s/);
  }
});

test('related studies are grouped by family instead of eight unrelated brands', () => {
  const groups = groupStudiesByFamily();
  assert.deepEqual(groups.map(group => [group.family, group.studies.length]), [['Piera', 1], ['Lorien', 2], ['Katre', 5]]);
  const html = inspirationGalleryHtml();
  assert.match(html, /<h2 id="studyFamily-katre">Katre<\/h2><small>5 related AI concepts from one fictional family<\/small>/);
  assert.match(html, /<h2 id="studyFamily-lorien">Lorien<\/h2><small>2 related AI concepts/);
  assert.doesNotMatch(html, /manufacturer product|official/i);
});

test('study images are existing same-origin assets', () => {
  for (const study of aiStudies) {
    assert.match(study.image, /^\/assets\/studies\/[a-z0-9-]+\.jpg$/);
    assert.ok(existsSync(new URL(`../dist${study.image}`, import.meta.url)), study.image);
    assert.equal(isDisplayableStudy(study), true);
  }
});

test('unsafe or malformed records are rejected and copy is escaped', () => {
  const base = aiStudies[0];
  assert.equal(isDisplayableStudy({ ...base, image: 'https://example.com/x.jpg' }), false);
  assert.equal(isDisplayableStudy({ ...base, image: '/assets/studies/../../x.jpg' }), false);
  assert.equal(isDisplayableStudy({ ...base, colors: ['#FFF', ...base.colors.slice(1)] }), false);
  assert.equal(isDisplayableStudy({ ...base, credit: { kind: 'photo' } }), false);
  const card = studyCardHtml({ ...base, id: 'x"y', name: '<script>x</script>', imageAlt: '" onerror="x', category: '&' });
  assert.doesNotMatch(card, /<script>|" onerror=|x"y/);
  assert.match(card, /href="\/studio\/\?p=x%22y#studio"/);
  assert.match(card, /&lt;script&gt;x&lt;\/script&gt;/);
  assert.equal(studyHref('a b&c'), '/studio/?p=a%20b%26c#studio');
});

test('Library concept shelf uses homeStudies display eligibility without approving corpus records', () => {
  assert.deepEqual([...approvedPaletteIds], []);
  assert.ok(Object.isFrozen(approvedPaletteIds));
  const shelf = createStudyShelfIndex();
  assert.equal(shelf.size, 4);
  assert.deepEqual(shelf.search().map(result => result.palette.id), [...homeStudyIds]);
  assert.deepEqual(shelf.search({ query: 'katre' }).map(result => result.palette.id), ['concept-katre-room']);
  assert.deepEqual(shelf.search({ query: 'lorien' }).map(result => result.palette.id), ['concept-lorien', 'concept-lorien-care']);
  assert.deepEqual(shelf.search({ colors: ['#EAC843'] })[0].palette.id, 'concept-piera');
  assert.ok(shelf.search({ use: 'brand' }).every(result => result.palette.tags.includes('brand')));
  assert.equal(studyShelfSummary(1, 4, true), '1 of 4 concept studies · nearest colors');
});

test('Library markup keeps the concept shelf separate from the approved rail', () => {
  assert.match(explore, /<div class="palette-rail palette-library-grid" id="paletteRail" aria-label="Palette library" aria-live="polite"><\/div>/);
  const shelf = explore.match(/<section class="study-concept-shelf" data-study-shelf="library"[\s\S]*?<\/section>/)[0];
  assert.match(shelf, / hidden>/);
  assert.match(shelf, /Supplied studies · AI concepts/);
  assert.match(shelf, /Provisional AI-generated concepts[^<]*Not approved Library palettes/);
  assert.doesNotMatch(shelf, /id="paletteRail"|palette-library-grid|collectionIndex/);
  assert.match(explore, /<script type="module" src="\/study-gallery\.js\?v=2"><\/script>/);
  assert.match(explore, /href="\/palette-library\.css\?v=5"/);
  assert.match(explore, /No approved palettes yet\./);
});

function fakeLibrary({ storageColors } = {}) {
  const listeners = {};
  const control = (id, value, extra = {}) => ({ id, value, checked: false, ...extra, addEventListener: (type, handler) => { (listeners[`${id}:${type}`] ||= []).push(handler); } });
  const controls = { paletteSearch: control('paletteSearch', ''), paletteUse: control('paletteUse', 'all'), libraryColor: control('libraryColor', '#EAC843'), libraryColorEnabled: control('libraryColorEnabled'), libraryMatchPalette: control('libraryMatchPalette') };
  const feelings = ['all', 'vivid'].map(name => ({ dataset: { paletteFilter: name }, addEventListener: (type, handler) => { (listeners[`feeling-${name}:${type}`] ||= []).push(handler); } }));
  const parts = { '[data-study-results]': { innerHTML: '' }, '[data-study-summary]': { textContent: '' }, '[data-study-empty]': { hidden: true } };
  const classes = new Set(['is-curation-hold']);
  const doc = {
    getElementById: id => controls[id] || null,
    querySelector: selector => (selector === '.palette-filter.is-active' ? feelings[0] : null),
    querySelectorAll: () => feelings,
    body: { classList: { add: name => classes.add(name) } },
  };
  const root = { hidden: true, querySelector: selector => parts[selector] };
  const writes = [];
  const storage = { getItem: () => (storageColors ? JSON.stringify({ colors: storageColors }) : null), setItem: key => writes.push(key) };
  const fire = key => (listeners[key] || []).forEach(handler => handler());
  initLibraryStudyShelf(root, { doc, getCurrentColors: () => readCurrentColors(storage) });
  return { root, parts, controls, classes, fire, writes };
}

test('Library shelf initializes, follows shared filters and writes no storage', () => {
  const view = fakeLibrary({ storageColors: ['#E5D7C1', '#B8AA88', '#B27D50', '#8B4938', '#4B2B1C'] });
  assert.equal(view.root.hidden, false);
  assert.ok(view.classes.has('has-study-shelf'));
  assert.deepEqual(cardIds(view.parts['[data-study-results]'].innerHTML), [...homeStudyIds]);
  assert.equal(view.parts['[data-study-summary]'].textContent, '4 of 4 concept studies · display order');

  view.controls.paletteSearch.value = 'piera';
  view.fire('paletteSearch:input');
  assert.deepEqual(cardIds(view.parts['[data-study-results]'].innerHTML), ['concept-piera']);

  view.controls.paletteSearch.value = 'no-such-study';
  view.fire('paletteSearch:input');
  assert.equal(view.parts['[data-study-empty]'].hidden, false);
  assert.equal(view.parts['[data-study-summary]'].textContent, '0 of 4 concept studies · display order');

  view.controls.paletteSearch.value = '';
  view.controls.libraryMatchPalette.checked = true;
  view.fire('libraryMatchPalette:input');
  assert.equal(cardIds(view.parts['[data-study-results]'].innerHTML)[0], 'concept-lorien-care');
  assert.match(view.parts['[data-study-summary]'].textContent, /nearest colors/);

  assert.doesNotMatch(view.parts['[data-study-summary]'].textContent, /no current palette/);

  view.fire('feeling-vivid:click');
  assert.equal(view.parts['[data-study-empty]'].hidden, cardIds(view.parts['[data-study-results]'].innerHTML).length > 0);
  assert.deepEqual(view.writes, []);
});

test('matching the current palette explains when no stored palette exists', () => {
  const view = fakeLibrary();
  view.controls.libraryMatchPalette.checked = true;
  view.fire('libraryMatchPalette:input');
  const summary = view.parts['[data-study-summary]'].textContent;
  assert.equal(summary, '4 of 4 concept studies · display order · no current palette to match yet; open one in Studio first');
  assert.doesNotMatch(summary, /nearest colors/);
  assert.deepEqual(cardIds(view.parts['[data-study-results]'].innerHTML), [...homeStudyIds]);
  assert.deepEqual(view.writes, []);
  assert.match(source, /getCurrentColors = \(\) => readCurrentColors\(globalThis\.sessionStorage\)/);
});

test('concept-only Library hides Feeling filters but keeps them for an approved Library', async () => {
  const css = (await read('dist/palette-library.css')).replace(/\/\*[\s\S]*?\*\//g, '');
  // app.js's hold rule hides the Feeling row; the concept shelf must not re-show it.
  assert.match(css, /body\.is-curation-hold [^{]*\.palette-filter-row[^{]*\{display:none\}/);
  const shelfRules = css.match(/[^{}]*has-study-shelf[^{}]*\{[^}]*\}/g);
  assert.ok(shelfRules.length > 0);
  for (const rule of shelfRules) {
    assert.match(rule, /body\.is-curation-hold\.has-study-shelf/, 'shelf overrides apply only in concept-only hold mode');
    assert.doesNotMatch(rule, /palette-filter-row|palette-feeling|palette-filter\b|collectionIndex/);
  }
  // Without the hold class, the approved Library keeps its Feeling row visible.
  assert.doesNotMatch(css, /(?:^|})\s*(?:body)?\.has-study-shelf[^{]*palette-filter/);
  assert.match(explore, /<div class="palette-filter-row" aria-label="Filter by feeling">/);
});

test('study gallery module stays local, read-only and scoped to its hooks', () => {
  assert.doesNotMatch(source, /setItem|removeItem|localStorage|fetch\(|XMLHttpRequest|https?:\/\/|approvedPaletteIds|paletteRail|collectionIndex/);
  assert.match(source, /data-study-gallery="inspiration"/);
  assert.match(source, /data-study-shelf="library"/);
});
