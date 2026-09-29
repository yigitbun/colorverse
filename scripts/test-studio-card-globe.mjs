// Real-browser check for STU-13: clicking, tapping, or pressing Enter/Space on a
// Studio rail card opens Color Globe for that exact member; arrow keys and grip
// drags never open it; Cancel/Escape change nothing and return focus to the card;
// Apply edits only that member.
// Uses its own static server and a disposable headless Chromium profile; every
// request leaving the local origin (Supabase, analytics, fonts) is aborted.
//
// Browser: set CHROME_PATH, or use Playwright's bundled Chromium, a cached
// ms-playwright Chromium, or a system Chrome/Chromium install.
import { createServer } from 'node:http';
import { readFile, stat, readdir } from 'node:fs/promises';
import { existsSync } from 'node:fs';
import { homedir } from 'node:os';
import { extname, join, normalize, resolve, sep } from 'node:path';
import { fileURLToPath } from 'node:url';
import test, { after, before } from 'node:test';
import assert from 'node:assert/strict';
import { chromium } from 'playwright-core';

const root = resolve(fileURLToPath(new URL('../dist/', import.meta.url)));
const types = {
  '.html': 'text/html; charset=utf-8', '.js': 'text/javascript; charset=utf-8', '.mjs': 'text/javascript; charset=utf-8',
  '.css': 'text/css; charset=utf-8', '.json': 'application/json', '.svg': 'image/svg+xml', '.png': 'image/png',
  '.jpg': 'image/jpeg', '.jpeg': 'image/jpeg', '.webp': 'image/webp', '.avif': 'image/avif', '.ico': 'image/x-icon',
  '.woff2': 'font/woff2', '.txt': 'text/plain; charset=utf-8',
};

async function resolveFile(pathname) {
  const target = normalize(join(root, decodeURIComponent(pathname)));
  if (target !== root && !target.startsWith(root + sep)) return null;
  const info = await stat(target).catch(() => null);
  if (info?.isDirectory()) return (await stat(join(target, 'index.html')).catch(() => null)) ? join(target, 'index.html') : null;
  return info?.isFile() ? target : null;
}

function startServer() {
  const server = createServer(async (request, response) => {
    const { pathname } = new URL(request.url, 'http://local');
    if (!pathname.endsWith('/') && !extname(pathname) && await resolveFile(`${pathname}/`)) {
      response.writeHead(301, { location: `${pathname}/` }).end();
      return;
    }
    const file = await resolveFile(pathname);
    if (!file) { response.writeHead(404).end('Not found'); return; }
    response.writeHead(200, { 'content-type': types[extname(file)] || 'application/octet-stream', 'cache-control': 'no-store' });
    response.end(await readFile(file));
  });
  return new Promise(done => server.listen(0, '127.0.0.1', () => done(server)));
}

async function browserExecutable() {
  if (process.env.CHROME_PATH) return process.env.CHROME_PATH;
  const bundled = chromium.executablePath();
  if (bundled && existsSync(bundled)) return undefined;
  const candidates = [];
  const cache = process.env.PLAYWRIGHT_BROWSERS_PATH || (process.platform === 'darwin' ? join(homedir(), 'Library/Caches/ms-playwright')
    : process.platform === 'win32' ? join(homedir(), 'AppData/Local/ms-playwright') : join(homedir(), '.cache/ms-playwright'));
  const cached = (await readdir(cache).catch(() => [])).filter(name => /^chromium_headless_shell-\d+$/.test(name)).sort().reverse();
  for (const dir of cached) {
    for (const build of await readdir(join(cache, dir)).catch(() => [])) {
      candidates.push(join(cache, dir, build, 'chrome-headless-shell'), join(cache, dir, build, 'chrome-headless-shell.exe'));
    }
  }
  candidates.push(
    '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome',
    '/Applications/Chromium.app/Contents/MacOS/Chromium',
    '/usr/bin/google-chrome', '/usr/bin/google-chrome-stable', '/usr/bin/chromium', '/usr/bin/chromium-browser',
  );
  const found = candidates.find(path => existsSync(path));
  if (!found) throw new Error('No Chromium found. Set CHROME_PATH or run `npx playwright-core install chromium-headless-shell`.');
  return found;
}

let server, origin, browser;
const blocked = new Set();

before(async () => {
  server = await startServer();
  origin = `http://127.0.0.1:${server.address().port}`;
  browser = await chromium.launch({ headless: true, executablePath: await browserExecutable() });
});

after(async () => {
  await browser?.close();
  await new Promise(done => server ? server.close(done) : done());
});

const palette = count => Array.from({ length: count }, (_, index) => {
  const channel = value => value.toString(16).padStart(2, '0');
  return `#${channel((index * 53 + 40) % 256)}${channel((index * 97 + 90) % 256)}${channel((index * 29 + 150) % 256)}`.toUpperCase();
});

// Opens Studio on a local-only working copy of `colors` via the saved-palette handoff.
async function openStudio({ viewport, colors, roleIndex, touch = false }) {
  const context = await browser.newContext({ viewport, hasTouch: touch, isMobile: touch, serviceWorkers: 'block', reducedMotion: 'reduce' });
  await context.route('**/*', route => {
    const url = route.request().url();
    if (url.startsWith(`${origin}/`) || url.startsWith('data:') || url.startsWith('blob:')) return route.continue();
    blocked.add(new URL(url).origin);
    return route.abort('blockedbyclient');
  });
  await context.routeWebSocket(url => !String(url).startsWith(origin.replace('http', 'ws')), ws => {
    blocked.add(new URL(ws.url()).origin);
    ws.close();
  });
  const page = await context.newPage();
  const errors = [];
  page.on('pageerror', error => errors.push(error.message));
  await page.goto(`${origin}/404-seed`);
  await page.evaluate(({ colors, roleIndex }) => sessionStorage.setItem('colorverse-member-palette', JSON.stringify({
    name: 'Card globe check', colors, roleIndex: roleIndex ?? (colors.length > 5 ? [0, 1, 2, 3, 4] : undefined),
  })), { colors, roleIndex });
  await page.goto(`${origin}/studio/?saved=1`);
  await page.locator('#paletteRoles [data-select-member]').first().waitFor();
  await declineConsent(page);
  assert.deepEqual(await hexes(page), colors, 'Studio rail shows the seeded colors in order');
  return { context, page, errors };
}

// Decline optional analytics so the consent banner does not cover the rail.
async function declineConsent(page) {
  const decline = page.locator('[data-consent="no"]:visible').first();
  if (await decline.isVisible()) await decline.click();
}

const hexes = page => page.locator('#paletteRoles [data-select-member] code').evaluateAll(nodes => nodes.map(node => node.textContent.trim().toUpperCase()));
const stored = page => page.evaluate(() => JSON.parse(sessionStorage.getItem('colorverse-current-palette')));
const card = (page, index) => page.locator(`#paletteRoles [data-select-member="${index}"]`);
const globe = page => page.locator('#colorGlobe');
const globeState = page => page.evaluate(() => ({
  open: document.querySelector('#colorGlobe').open,
  role: document.querySelector('#globeRole').textContent.trim(),
  original: document.querySelector('#globeOriginalHex').textContent.trim().toUpperCase(),
  editing: [...document.querySelectorAll('#globePalette span')].findIndex(node => node.classList.contains('is-editing')),
  pressed: [...document.querySelectorAll('#paletteRoles [aria-pressed="true"]')].map(node => Number(node.dataset.selectMember)),
  focused: document.activeElement?.id || document.activeElement?.dataset?.selectMember || document.activeElement?.tagName,
}));
const center = box => ({ x: box.x + box.width / 2, y: box.y + box.height / 2 });

async function assertOpenFor(page, index, colors, label) {
  await page.waitForFunction(() => document.querySelector('#colorGlobe').open);
  const now = await globeState(page);
  assert.equal(now.open, true, `${label}: Color Globe opens`);
  assert.equal(now.role, `Color ${index + 1}`, `${label}: Globe names the chosen member`);
  assert.equal(now.original, colors[index], `${label}: Globe starts from the chosen member's color`);
  assert.equal(now.editing, index, `${label}: Globe marks the chosen member`);
  assert.deepEqual(now.pressed, [index], `${label}: the card is selected`);
}

// The dialog's close event, which restores focus, fires as a separate task.
const closed = page => page.waitForFunction(() => !document.querySelector('#colorGlobe').open && !document.querySelector('#colorGlobe').contains(document.activeElement));

async function assertClosedOn(page, index, colors, label) {
  await closed(page);
  const now = await globeState(page);
  assert.equal(now.open, false, `${label}: Globe closed`);
  assert.equal(now.focused, String(index), `${label}: focus returns to the opening card`);
  assert.deepEqual(await hexes(page), colors, `${label}: palette unchanged`);
}

test('desktop, 8 colors: click/Enter/Space open the exact member; arrows only select; cancel and apply', async () => {
  const colors = palette(8), roleIndex = [6, 0, 2, 4, 1];
  const { context, page, errors } = await openStudio({ viewport: { width: 1280, height: 900 }, colors, roleIndex });
  try {
    const before = await stored(page);
    assert.equal(await card(page, 5).getAttribute('aria-haspopup'), 'dialog');
    assert.match(await card(page, 5).getAttribute('aria-label'), /^Edit Color 6, #[0-9A-F]{6}, not in preview, in Color Globe\./);
    assert.equal(await card(page, 5).evaluate(node => getComputedStyle(node).cursor), 'pointer', 'card shows a pointer');
    assert.equal(await card(page, 5).locator('.palette-member-grip').evaluate(node => getComputedStyle(node).cursor), 'grab', 'grip keeps its grab cursor');

    // Pointer click on a card, then Cancel.
    await card(page, 5).click();
    await assertOpenFor(page, 5, colors, 'click');
    await page.locator('#colorGlobe [data-globe-close]', { hasText: 'Cancel' }).click();
    await assertClosedOn(page, 5, colors, 'Cancel');

    // Arrow keys move selection and focus without the modal.
    await page.keyboard.press('ArrowRight');
    let now = await globeState(page);
    assert.equal(now.open, false, 'ArrowRight does not open Color Globe');
    assert.deepEqual(now.pressed, [6], 'ArrowRight selects the next member');
    assert.equal(now.focused, '6', 'focus follows the selection');
    for (const key of ['ArrowLeft', 'ArrowDown', 'ArrowUp', 'Home', 'End']) {
      await page.keyboard.press(key);
      assert.equal((await globeState(page)).open, false, `${key} does not open Color Globe`);
    }
    assert.deepEqual((await globeState(page)).pressed, [7], 'End selects the last member');

    // Enter opens the focused card; Escape closes it with nothing changed.
    await page.keyboard.press('Home');
    await page.keyboard.press('ArrowRight');
    await page.keyboard.press('Enter');
    await assertOpenFor(page, 1, colors, 'Enter');
    await page.keyboard.press('Escape');
    await assertClosedOn(page, 1, colors, 'Escape');

    // Space opens too; the close button restores focus the same way.
    await page.keyboard.press('ArrowRight');
    await page.keyboard.press('Space');
    await assertOpenFor(page, 2, colors, 'Space');
    await page.locator('#colorGlobe [data-globe-close][aria-label="Close Color Globe"]').click();
    await assertClosedOn(page, 2, colors, 'close button');
    assert.deepEqual(await stored(page), before, 'opening and cancelling persisted nothing');

    // Apply changes only that member and keeps the preview mapping.
    await card(page, 3).click();
    await assertOpenFor(page, 3, colors, 'apply');
    await page.locator('#globeHex').fill('#2A9D8F');
    await page.locator('#globeHex').press('Enter');
    await page.locator('#applyGlobeColor').click();
    const edited = [...colors];
    edited[3] = '#2A9D8F';
    await assertClosedOn(page, 3, edited, 'Apply');
    const saved = await stored(page);
    assert.deepEqual(saved.workspace.members, edited, 'only Color 4 changed');
    assert.deepEqual(saved.workspace.roleIndex, roleIndex, 'preview role map unchanged');
    assert.deepEqual(saved.colors, roleIndex.map(index => edited[index]), 'preview colors follow the mapping');

    // The right-side button still opens the selected member and gets focus back.
    await page.locator('#openSelectedGlobe').click();
    await assertOpenFor(page, 3, edited, 'right button');
    await page.keyboard.press('Escape');
    await closed(page);
    now = await globeState(page);
    assert.equal(now.open, false);
    assert.equal(now.focused, 'openSelectedGlobe', 'focus returns to the right-side button');
    assert.deepEqual(await hexes(page), edited);
    assert.deepEqual(errors, [], 'no uncaught page errors');
  } finally { await context.close(); }
});

test('desktop: grip drag swaps without opening; a grip press alone opens nothing', async () => {
  const colors = palette(6);
  const { context, page, errors } = await openStudio({ viewport: { width: 1280, height: 900 }, colors });
  try {
    const grip = card(page, 0).locator('.palette-member-grip');
    await grip.click();
    assert.equal((await globeState(page)).open, false, 'clicking the grip does not open Color Globe');
    assert.deepEqual(await hexes(page), colors);

    const start = center(await grip.boundingBox()), end = center(await card(page, 2).boundingBox());
    await page.mouse.move(start.x, start.y);
    await page.mouse.down();
    for (let step = 1; step <= 6; step++) await page.mouse.move(start.x + (end.x - start.x) * step / 6, start.y + (end.y - start.y) * step / 6);
    await page.mouse.up();
    const swapped = [...colors];
    [swapped[0], swapped[2]] = [swapped[2], swapped[0]];
    assert.deepEqual(await hexes(page), swapped, 'drop swaps the members');
    await page.evaluate(() => new Promise(done => setTimeout(done, 50)));
    assert.equal((await globeState(page)).open, false, 'drop does not open Color Globe');

    // A drag released on its own card does not count as a click.
    const own = center(await card(page, 4).locator('.palette-member-grip').boundingBox());
    await page.mouse.move(own.x, own.y);
    await page.mouse.down();
    await page.mouse.move(own.x - 30, own.y + 4);
    await page.mouse.move(own.x - 10, own.y);
    await page.mouse.up();
    await page.evaluate(() => new Promise(done => setTimeout(done, 50)));
    assert.equal((await globeState(page)).open, false, 'drag back to its own card does not open Color Globe');
    assert.deepEqual(await hexes(page), swapped, 'no swap onto itself');

    // The add-color plus is separate.
    await page.locator('#paletteAddToggle').click();
    assert.equal((await globeState(page)).open, false, 'the plus does not open Color Globe');
    assert.equal(await page.locator('#paletteAddForm').isHidden(), false, 'the plus opens its own form');
    assert.deepEqual(errors, [], 'no uncaught page errors');
  } finally { await context.close(); }
});

test('390px touch: tapping a card in the horizontal rail opens its Globe; cancel keeps colors', async t => {
  const colors = palette(7);
  const { context, page, errors } = await openStudio({ viewport: { width: 390, height: 844 }, colors, touch: true });
  try {
    const overflowX = await page.locator('#paletteRoles').evaluate(node => getComputedStyle(node).overflowX);
    assert.ok(['auto', 'scroll'].includes(overflowX), `rail is horizontal at 390px (overflow-x: ${overflowX})`);
    await card(page, 6).scrollIntoViewIfNeeded();
    await card(page, 6).locator('code').tap();
    await assertOpenFor(page, 6, colors, 'tap');
    const box = await globe(page).boundingBox();
    assert.ok(box.x >= 0 && box.x + box.width <= 391, 'Globe fits the 390px viewport');
    await page.locator('#colorGlobe [data-globe-close]', { hasText: 'Cancel' }).tap();
    await assertClosedOn(page, 6, colors, 'tap Cancel');
    const size = await page.evaluate(() => ({ scroll: document.documentElement.scrollWidth, client: document.documentElement.clientWidth }));
    assert.ok(size.scroll <= size.client, `no horizontal page overflow (${JSON.stringify(size)})`);

    // Touch drag on a grip still swaps without opening.
    const grip = card(page, 1).locator('.palette-member-grip');
    await grip.scrollIntoViewIfNeeded();
    const start = center(await grip.boundingBox()), end = center(await card(page, 0).boundingBox());
    const cdp = await context.newCDPSession(page);
    const touch = (type, point) => cdp.send('Input.dispatchTouchEvent', { type, touchPoints: point ? [{ x: point.x, y: point.y }] : [] });
    await touch('touchStart', start);
    for (let step = 1; step <= 6; step++) await touch('touchMove', { x: start.x + (end.x - start.x) * step / 6, y: start.y + (end.y - start.y) * step / 6 });
    await touch('touchEnd');
    await page.evaluate(() => new Promise(done => setTimeout(done, 50)));
    const swapped = [...colors];
    [swapped[0], swapped[1]] = [swapped[1], swapped[0]];
    assert.deepEqual(await hexes(page), swapped, 'touch grip drag swaps');
    assert.equal((await globeState(page)).open, false, 'touch grip drag does not open Color Globe');
    assert.deepEqual(errors, [], 'no uncaught page errors');
    t.diagnostic(`blocked remote origins: ${[...blocked].sort().join(', ') || 'none requested'}`);
  } finally { await context.close(); }
});
