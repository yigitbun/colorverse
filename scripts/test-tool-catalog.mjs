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
    assert.ok(tool.title && tool.outcome && tool.action, `${tool.id} has label, outcome and action`);
  }
});

test('every card has one action and a decorative CSS thumbnail', () => {
  const html = catalogMarkup();
  assert.equal(html.match(/<li class="tool-card"/g).length, 5);
  assert.equal(html.match(/<a /g).length, 5);
  assert.equal(html.match(/class="tool-thumb tool-thumb-[a-z]+" aria-hidden="true"/g).length, 5);
  assert.doesNotMatch(html, /<img|<svg|url\(/);
});

test('current tool is de-emphasised instead of linking to itself', () => {
  for (const tool of TOOLS) {
    const html = catalogMarkup(tool.id);
    assert.equal(html.match(/aria-current="page"/g).length, 1);
    assert.doesNotMatch(html, new RegExp(`href="${tool.href}"`), `${tool.id} does not self-link`);
    assert.match(html, /href="#main">Back to top/);
    assert.equal(html.match(/class="tool-card-link"/g).length, 4);
  }
});

test('primary routes mount one shelf immediately before the footer', async () => {
  for (const [route, { current, tone }] of Object.entries(ROUTES)) {
    const html = await read(route);
    assert.equal(html.match(/data-tool-catalog/g)?.length, 1, `${route} has one shelf`);
    assert.match(html, /<link rel="stylesheet" href="\/tool-catalog\.css\?v=\d+">/, `${route} loads the stylesheet`);
    assert.match(html, /<script type="module" src="\/tool-catalog\.js\?v=\d+"><\/script>/, `${route} loads the module`);
    const shelf = html.match(/<section class="tool-catalog section-wrap" data-tool-catalog([^>]*)><\/section>\n\s*<footer class="footer/);
    assert.ok(shelf, `${route} shelf sits directly before the footer`);
    assert.equal(shelf[1].match(/data-current="([a-z]+)"/)?.[1], current, `${route} current tool`);
    assert.equal(shelf[1].match(/data-tone="([a-z]+)"/)?.[1], tone, `${route} tone`);
  }
});

test('stylesheet keeps mobile readable and account/legal quiet', async () => {
  const css = await read('tool-catalog.css');
  assert.match(css, /grid-template-columns:repeat\(5,minmax\(0,1fr\)\)/);
  assert.match(css, /@media\(max-width:640px\)\{[^@]*\.tool-catalog-list\{grid-template-columns:1fr/);
  assert.match(css, /\.tool-catalog\[data-tone=quiet\]/);
  assert.match(css, /\.tool-catalog:empty\{display:none\}/);
});
