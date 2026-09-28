import assert from 'node:assert/strict';
import test from 'node:test';
import { isAtlasInteractionPoint } from '../dist/globe.js';

test('the atlas captures only points inside its visible circular ring', () => {
  assert.equal(isAtlasInteractionPoint(390, 400, 1, 195, 200), true);
  assert.equal(isAtlasInteractionPoint(390, 400, 1, 195, 22), true);
  assert.equal(isAtlasInteractionPoint(390, 400, 1, 12, 12), false);
  assert.equal(isAtlasInteractionPoint(390, 400, 1, 378, 388), false);
});

test('the interaction radius follows zoom without becoming rectangular', () => {
  assert.equal(isAtlasInteractionPoint(400, 400, .85, 360, 200), false);
  assert.equal(isAtlasInteractionPoint(400, 400, 1.3, 360, 200), true);
  assert.equal(isAtlasInteractionPoint(400, 400, 1.3, 395, 395), false);
});

function stubBrowser() {
  const noop = () => {};
  const context = new Proxy({}, { get: (_, key) => key === 'createRadialGradient' ? () => ({ addColorStop: noop }) : noop, set: () => true });
  Object.assign(globalThis, {
    matchMedia: () => ({ matches: true, addEventListener: noop }),
    ResizeObserver: class { observe() {} disconnect() {} },
    IntersectionObserver: class { observe() {} disconnect() {} },
    requestAnimationFrame: () => 0, cancelAnimationFrame: noop, devicePixelRatio: 1,
  });
  const listeners = {};
  const canvas = {
    getContext: () => context, classList: { add: noop, remove: noop },
    getBoundingClientRect: () => ({ left: 0, top: 0, width: 400, height: 400 }),
    addEventListener: (type, callback) => { listeners[type] = callback; },
  };
  return { canvas, press: key => listeners.keydown({ key, preventDefault: noop }) };
}

test('homepage startup seed is the front-facing cell of the active world with its exact HEX', async () => {
  const { createAtlas, atlasWorlds } = await import('../dist/globe.js');
  for (const world of atlasWorlds) {
    const { canvas, press } = stubBrowser();
    let centre = null;
    const atlas = createAtlas(canvas, { initialWorld: world.id, radiusScale: .76, onSelect: payload => { centre = payload; } });
    const seed = atlas.frontCell();
    press('Enter');
    assert.ok(centre, `${world.id}: a visible cell sits at the globe centre`);
    assert.equal(seed.index, centre.index, `${world.id}: the seed is the visible cell at the centre`);
    assert.equal(seed.hex, centre.hex);
    assert.match(seed.hex, /^#[0-9A-F]{6}$/i);
    assert.equal(atlas.getWorld().id, world.id);
    assert.ok(!world.starters.some(starter => starter.colors.includes(seed.hex)), `${world.id}: not a starter HEX`);
    atlas.destroy();
  }
});

test('homepage seeds one silent selection only at startup; Clear and deselect do not reseed', async () => {
  const { readFile } = await import('node:fs/promises');
  const app = await readFile(new URL('../dist/app.js', import.meta.url), 'utf8');
  const seed = app.match(/if \(!atlasSelected\.length\) \{\n([\s\S]*?)\n    \}\n/);
  assert.ok(seed, 'startup seed block exists');
  assert.match(seed[1], /atlasSelected = \[\{ \.\.\.globe\.frontCell\(\), worldId: activeAtlasWorld\.id, seeded: true \}\]/);
  assert.doesNotMatch(seed[1], /toast|colorverseTrack|localStorage|persistPalette/);
  assert.equal(app.match(/globe\.frontCell\(\)/g).length, 1, 'seeded only once, never from Clear or deselect');
  assert.match(app, /const wasEmpty = !atlasSelected\.some\(item => !item\.seeded\);/);
  assert.match(app, /if \(wasEmpty && atlasSelected\.some\(item => !item\.seeded\)\) window\.colorverseTrack\?\.\('palette_started'/);
  assert.match(app, /clearAtlasSelection\.addEventListener\('click', \(\) => \{ atlasSelected = \[\];/);
  assert.match(app, /from '\.\/globe\.js\?v=30'/);
});
