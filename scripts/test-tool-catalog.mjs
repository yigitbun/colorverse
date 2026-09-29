import assert from 'node:assert/strict';
import test from 'node:test';
import { existsSync } from 'node:fs';
import { readFile } from 'node:fs/promises';
import { TOOLS, catalogMarkup } from '../dist/tool-catalog.js';

const dist = new URL('../dist/', import.meta.url);
const read = (path) => readFile(new URL(path, dist), 'utf8');

const ROUTES = {
  'index.html': { current: 'globe' },
  'studio/index.html': { current: 'studio' },
  'extract/index.html': { current: 'extract' },
  'explore/index.html': { current: 'library' },
  'inspiration/index.html': { current: 'inspiration' },
  'community/index.html': {},
  'lab/index.html': {},
  'about/index.html': {},
  'account/index.html': { tone: 'quiet' },
  'privacy/index.html': { tone: 'quiet' },
};

test('shelf lists exactly the five real destinations', () => {
  assert.deepEqual(TOOLS.map((tool) => tool.href), ['/', '/extract/', '/studio/', '/inspiration/', '/explore/']);
  for (const tool of TOOLS) {
    const target = tool.href === '/' ? 'index.html' : `${tool.href.slice(1)}index.html`;
    assert.ok(existsSync(new URL(target, dist)), `${tool.href} exists in dist`);
    assert.ok(tool.title && tool.action, `${tool.id} has a label and action`);
  }
});

test('the footer tells a distinct explore → read → apply story with product imagery', () => {
  const html = catalogMarkup();
  assert.match(html, /Color is a decision, not a swatch\./);
  assert.match(html, /From color to context/);
  assert.match(html, /Explore a color/);
  assert.equal(html.match(/class="journey-step"/g).length, 3);
  assert.equal(html.match(/class="journey-step-link"/g).length, 3);
  assert.match(html, /journey-visual-globe[^<]*<img src="\/assets\/studies\/color-globe-editor-reference\.png"/);
  assert.match(html, /journey-visual-read[^<]*<img src="\/assets\/studies\/piera\.jpg"/);
  assert.match(html, /journey-read-swatches/);
  assert.match(html, /AI CONCEPT/);
  assert.match(html, /assets\/studies\/katre-serum-v3\.png/);
  for (const image of ['color-globe-editor-reference.png', 'piera.jpg', 'katre-serum-v3.png']) {
    assert.ok(existsSync(new URL(`assets/studies/${image}`, dist)), `${image} exists in dist`);
  }
  assert.match(html, /See applied studies/);
  assert.match(html, /Browse palettes/);
  assert.match(html, /From a color direction to a finished design/);
});

test('the current destination is identified without sending the user to the same page again', () => {
  for (const tool of TOOLS) {
    const html = catalogMarkup(tool.id);
    assert.equal(html.match(/aria-current="(?:page|step)"/g).length, 1);
    assert.doesNotMatch(html, new RegExp(`href="${tool.href}"`), `${tool.id} does not self-link`);
    assert.match(html, /You are here/);
    assert.equal(html.match(/class="journey-step-link"/g).length, tool.id === 'globe' || tool.id === 'extract' || tool.id === 'studio' ? 2 : 3);
  }
});

test('primary routes mount one shelf immediately before the footer', async () => {
  for (const [route, { current, tone }] of Object.entries(ROUTES)) {
    const html = await read(route);
    assert.equal(html.match(/data-tool-catalog/g)?.length, 1, `${route} has one shelf`);
    assert.match(html, /<link rel="stylesheet" href="\/tool-catalog\.css\?v=6">/, `${route} loads the stylesheet`);
    assert.match(html, /<script type="module" src="\/tool-catalog\.js\?v=3"><\/script>/, `${route} loads the module`);
    const shelf = html.match(/<section class="tool-catalog section-wrap" data-tool-catalog([^>]*)><\/section>\n\s*<footer class="footer/);
    assert.ok(shelf, `${route} shelf sits directly before the footer`);
    assert.equal(shelf[1].match(/data-current="([a-z]+)"/)?.[1], current, `${route} current tool`);
    assert.equal(shelf[1].match(/data-tone="([a-z]+)"/)?.[1], tone, `${route} tone`);
  }
});

test('home leads from the globe hero directly to the product journey; examples stay in Library', async () => {
  const home = await read('index.html');
  const library = await read('explore/index.html');
  assert.match(home, /<a class="text-link" href="\/explore\/">Browse palettes/);
  assert.doesNotMatch(home, /id="homeExploreGrid"|id="discover-filters"/);
  assert.match(home, /<\/section>\s*<\/main>\s*<section class="tool-catalog section-wrap" data-tool-catalog data-current="globe"/);
  assert.match(library, /data-study-shelf="library"/);
});

test('stylesheet keeps mobile readable and account/legal quiet', async () => {
  const css = await read('tool-catalog.css');
  assert.match(css, /grid-template-columns:repeat\(3,minmax\(0,1fr\)\)/);
  assert.match(css, /@media\(max-width:560px\)\{[^@]*\.color-journey\{grid-template-columns:1fr/);
  assert.match(css, /\.journey-step-link,\.journey-step\.is-current\{display:grid;grid-template-columns:42% minmax\(0,1fr\);min-height:126px/);
  assert.match(css, /\.tool-catalog\[data-tone=quiet\]/);
  assert.match(css, /\.tool-catalog:empty\{display:none\}/);
});
