import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync, existsSync } from 'node:fs';
import { suggestPaletteName } from '../dist/palette-names.js';
import { sanitizeDraft } from '../dist/member-palette.js';
import { aiStudies } from '../dist/ai-studies.js';
import { retiredReviewPalettes } from '../dist/retired-review-palettes.js';
import { SANDBOX_KEY, initialSandbox, sanitizeSandbox, readSandbox, writeSandbox } from '../dist/sandbox/state.js';
import { freezeColorway, colorwaySVG } from '../dist/colorway-kit.js';
const read = path => readFileSync(new URL(`../${path}`, import.meta.url), 'utf8');

test('palette suggestions are short ASCII, stable, color-derived and offer alternatives', () => {
  for (const input of [null, [], ['#000000', '#FFFFFF'], ...aiStudies.map(study => study.colors)]) {
    const name = suggestPaletteName(input);
    assert.match(name, /^[A-Za-z]+ [A-Za-z]+$/);
    assert.ok(name.length <= 18);
    assert.equal(suggestPaletteName(input), name);
    assert.notEqual(suggestPaletteName(input, 1), name);
  }
  assert.notEqual(suggestPaletteName(['#FF0000']), suggestPaletteName(['#0000FF']));
  assert.equal(suggestPaletteName(['invalid', '#FF0000']), suggestPaletteName(['#FF0000']));
});
test('draft defaults suggest a name while existing and multilingual member names remain intact', () => {
  const colors = [...aiStudies[0].colors];
  assert.equal(sanitizeDraft({ colors }).name, suggestPaletteName(colors));
  for (const name of ['My Client', 'Untitled palette', 'Benim Renklerim', 'Gökyüzü']) assert.equal(sanitizeDraft({ colors, name }).name, name);
});
test('Sandbox has its own bounded versioned storage and does not leak image URLs', () => {
  const initial = initialSandbox(), clean = sanitizeSandbox({ ...initial, name: 'x'.repeat(200), active: -1, conceptId: 'unknown', image: 'https://example.org', assignment: { cap: 99 } });
  assert.equal(clean.name.length, 120); assert.equal(clean.active, 0); assert.equal(clean.conceptId, null); assert.equal(clean.image, undefined); assert.equal(clean.assignment.cap, 4);
  assert.equal(sanitizeSandbox({ ...initial, version: 2 }), null);
  assert.equal(sanitizeSandbox({ ...initial, colors: ['red'] }), null);
  let record;
  const getStorage = () => ({ setItem(key, value) { record = { key, value }; }, getItem() { return record.value; } });
  assert.equal(writeSandbox(initial, getStorage), true); assert.equal(record.key, SANDBOX_KEY);
  assert.notEqual(SANDBOX_KEY, 'colorverse-current-palette');
  assert.deepEqual(readSandbox(getStorage), initial);
});
test('denied or corrupt Sandbox storage cannot break the workbench', () => {
  for (const getStorage of [() => { throw new Error('denied'); }, () => ({ getItem() { return 'bad'; }, setItem() { throw new Error('quota'); } })]) {
    assert.deepEqual(readSandbox(getStorage), initialSandbox());
    assert.equal(writeSandbox(initialSandbox(), getStorage), false);
  }
});
test('baseline survives working changes and each product part accepts an independent swatch', () => {
  const working = initialSandbox(), baseline = freezeColorway(working), before = colorwaySVG(baseline);
  working.colors[2] = '#FF0000'; working.assignment.cap = 2;
  assert.equal(colorwaySVG(baseline), before);
  assert.notEqual(colorwaySVG(working), before);
  assert.match(colorwaySVG(working), /fill="#FF0000"/);
});
const retiredPhotos = ['meeting-room-mike-van-schoonderwalt.jpg', 'orange-pink-conference.jpg', 'modern-lobby.jpg', 'pink-yellow-cafe.jpg', 'orange-green-retail.jpg', 'mustard-coral-chairs.jpg', 'colorful-chair-hall.jpg'];
test('retired photos have no deployable copies or active card records', () => {
  assert.equal(retiredReviewPalettes.length, 7);
  for (const retired of retiredReviewPalettes) { assert.equal(retired.image, null); assert.equal(retired.credit, null); assert.ok(!aiStudies.some(study => study.id === retired.id)); }
  for (const file of retiredPhotos) {
    assert.ok(!existsSync(new URL(`../dist/assets/curation/${file}`, import.meta.url)));
  }
});
// The rights/provenance backup is deliberately not in the public repository.
// Check it when available locally; a fresh checkout still runs all app checks.
const localBackupAvailable = existsSync(new URL('../backups/curation/external-2026-09-27/', import.meta.url));
test('local retired-photo backup retains all assets and source provenance', { skip: !localBackupAvailable }, () => {
  for (const file of retiredPhotos) assert.ok(existsSync(new URL(`../backups/curation/external-2026-09-27/assets/${file}`, import.meta.url)));
  const original = read('backups/curation/external-2026-09-27/curation-before.js');
  assert.match(original, /Mike van Schoonderwalt/); assert.match(original, /licenseUrl/);
});
test('Sandbox is unpassworded, CSP-safe, local-only and not indexed', () => {
  for (const path of ['dist/sandbox/index.html', 'dist/sandbox/one-shape/index.html']) {
    const html = read(path); assert.match(html, /noindex,nofollow/);
    assert.doesNotMatch(html, /<script(?![^>]*\bsrc=)[^>]*>|\son[a-z]+\s*=/i);
    assert.doesNotMatch(html, /type="password"|<iframe|account-client|analytics\.js/);
  }
  const controller = read('dist/sandbox/sandbox.js');
  assert.doesNotMatch(controller, /supabase|signIn|\.rpc\(|fetch\(/);
  assert.match(controller, /savePaletteHandoff/);
});
test('motion reference keeps its seekable timeline without embedded fonts or endless autoplay', () => {
  const reference = read('dist/sandbox/one-shape/reference.js'), player = read('dist/sandbox/one-shape/player.js');
  assert.match(reference, /const LOOP = 14/); assert.match(reference, /function seek\(T\)/);
  assert.doesNotMatch(reference, /window\.seek|requestAnimationFrame/);
  assert.doesNotMatch(read('dist/sandbox/one-shape/reference.css'), /base64|Geist/);
  assert.match(player, /prefers-reduced-motion/); assert.match(player, /visibilitychange/); assert.match(player, /cancelAnimationFrame/);
});
test('Explore has compact explicit AI indicators without photographer claims', () => {
  const source = read('dist/app.js');
  assert.match(source, /ai-concept-badge/); assert.match(source, /Not a real product photograph/);
  assert.doesNotMatch(source, /Photo by|Photo: \$\{escape\(palette.credit.photographer/);
  assert.match(source, /palette studies, not manufacturer colors/);
});
