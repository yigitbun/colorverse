// Real-browser check for STU-14: a labelled Shuffle control sits above Color 1,
// stays visible and tappable at 390px, remains an accessible icon control when
// the rail is collapsed, mixes the visible member order on click without a page
// reload, announces the change, offers a one-step Undo, and never disturbs card
// click/Globe or grip-drag behavior.
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
async function openStudio({ viewport, colors, touch = false }) {
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
  await page.evaluate(colors => sessionStorage.setItem('colorverse-member-palette', JSON.stringify({
    name: 'Shuffle check', colors, roleIndex: colors.length > 5 ? [0, 1, 2, 3, 4] : undefined,
  })), colors);
  // A page-load marker proves a later "shuffle" never triggers a navigation/reload.
  await page.goto(`${origin}/studio/?saved=1`);
  await page.evaluate(() => { window.__loadCount = (window.__loadCount || 0) + 1; });
  await page.locator('#paletteRoles [data-select-member]').first().waitFor();
  const decline = page.locator('[data-consent="no"]:visible').first();
  if (await decline.isVisible()) await decline.click();
  assert.deepEqual(await hexes(page), colors, 'Studio rail shows the seeded colors in order');
  return { context, page, errors };
}

const hexes = page => page.locator('#paletteRoles [data-select-member] code').evaluateAll(nodes => nodes.map(node => node.textContent.trim().toUpperCase()));
const shuffleButton = page => page.locator('#paletteShuffle');
const undoButton = page => page.locator('#paletteShuffleUndo');

test('desktop: Shuffle sits above Color 1, mixes order without reload, announces, and offers one-step Undo', async () => {
  const colors = palette(8);
  const { context, page, errors } = await openStudio({ viewport: { width: 1280, height: 900 }, colors });
  try {
    // Visible, above the rail, with icon + label + tooltip.
    const shuffleBox = await shuffleButton(page).boundingBox();
    const firstCardBox = await page.locator('#paletteRoles [data-select-member="0"]').boundingBox();
    assert.ok(shuffleBox, 'Shuffle button renders');
    assert.ok(shuffleBox.y < firstCardBox.y, 'Shuffle sits above Color 1');
    assert.equal(await shuffleButton(page).innerText(), 'Shuffle');
    assert.equal(await shuffleButton(page).getAttribute('title'), 'Mix order · keep colors');
    assert.ok(await shuffleButton(page).locator('svg').count() >= 1, 'has a recognizable icon');
    assert.equal(await undoButton(page).isVisible(), false, 'no undo affordance before the first shuffle');

    const before = await hexes(page);
    await shuffleButton(page).click();
    const after = await hexes(page);
    assert.deepEqual([...after].sort(), [...before].sort(), 'same colors after shuffle');
    assert.notDeepEqual(after, before, 'shuffle visibly changes the order');
    assert.equal(await page.evaluate(() => window.__loadCount), 1, 'no page reload/navigation happened');
    assert.match(await page.locator('#paletteOrderStatus').textContent(), /^Shuffled 8 colors into a new order\. Colors are unchanged\.$/);

    // One-step Undo appears, restores the exact pre-shuffle order, then disappears.
    assert.equal(await undoButton(page).isVisible(), true, 'Undo appears right after a shuffle');
    await undoButton(page).click();
    assert.deepEqual(await hexes(page), before, 'Undo restores the pre-shuffle order exactly');
    assert.equal(await undoButton(page).isVisible(), false, 'Undo consumes itself (one step, no redo stack)');
    assert.match(await page.locator('#paletteOrderStatus').textContent(), /^Shuffle undone\. Order restored\.$/);
    assert.ok(await shuffleButton(page).evaluate(node => node === document.activeElement), 'focus returns to Shuffle after Undo disappears');

    // A second shuffle keeps a fresh, single-step Undo (not a stack).
    await shuffleButton(page).click();
    assert.equal(await undoButton(page).isVisible(), true);
    const onceShuffled = await hexes(page);
    await shuffleButton(page).click();
    assert.notDeepEqual(await hexes(page), onceShuffled, 'shuffling again changes order again');
    await undoButton(page).click();
    assert.deepEqual(await hexes(page), onceShuffled, 'Undo only reverts the most recent shuffle');

    assert.deepEqual(errors, [], 'no uncaught page errors');
  } finally { await context.close(); }
});

test('desktop: shuffle does not disturb card click/Globe or grip drag; other edits clear a pending Undo', async () => {
  const colors = palette(5);
  const { context, page, errors } = await openStudio({ viewport: { width: 1280, height: 900 }, colors });
  try {
    await shuffleButton(page).click();
    assert.equal(await undoButton(page).isVisible(), true);

    // Any other palette-changing action (here: a grip drag swap) clears the pending shuffle Undo.
    const grip = page.locator('#paletteRoles [data-select-member="0"] .palette-member-grip');
    const targetBox = await page.locator('#paletteRoles [data-select-member="2"]').boundingBox();
    const start = await grip.boundingBox();
    await page.mouse.move(start.x + start.width / 2, start.y + start.height / 2);
    await page.mouse.down();
    await page.mouse.move(targetBox.x + targetBox.width / 2, targetBox.y + targetBox.height / 2, { steps: 6 });
    await page.mouse.up();
    assert.equal(await undoButton(page).isVisible(), false, 'a subsequent edit clears the one-step shuffle Undo');

    // A plain card click still selects and opens Color Globe after a shuffle.
    await shuffleButton(page).click();
    await page.locator('#paletteRoles [data-select-member="3"] code').click();
    assert.equal(await page.locator('#colorGlobe').evaluate(node => node.open), true, 'card click still opens Color Globe after a shuffle');
    await page.keyboard.press('Escape');
    assert.deepEqual(errors, [], 'no uncaught page errors');
  } finally { await context.close(); }
});

test('collapsed rail: Shuffle stays an accessible icon control, never a squeezed or decorative-only label', async () => {
  const colors = palette(6);
  const { context, page, errors } = await openStudio({ viewport: { width: 1280, height: 900 }, colors });
  try {
    await page.locator('#togglePaletteRail').click();
    assert.equal(await page.locator('.studio-workspace.is-palette-collapsed').count(), 1, 'rail is collapsed');
    assert.equal(await shuffleButton(page).isVisible(), true, 'Shuffle remains visible while collapsed');
    const accessibleName = await shuffleButton(page).evaluate(node => node.textContent.trim() || node.getAttribute('aria-label') || node.getAttribute('title'));
    assert.ok(accessibleName, 'Shuffle keeps a real accessible name while collapsed');
    const labelBox = await shuffleButton(page).locator('span').boundingBox();
    assert.ok(labelBox.width <= 1 && labelBox.height <= 1, 'the visible label is clipped to nothing, not merely styled small (never squeezed/ambiguous)');
    await shuffleButton(page).click();
    const status = await page.locator('#paletteOrderStatus').textContent();
    assert.match(status, /^Shuffled 6 colors/, 'Shuffle still works while the rail is collapsed');
    assert.deepEqual(errors, [], 'no uncaught page errors');
  } finally { await context.close(); }
});

test('390px touch: Shuffle remains visible and easy to tap', async () => {
  const colors = palette(7);
  const { context, page, errors } = await openStudio({ viewport: { width: 390, height: 844 }, colors, touch: true });
  try {
    const box = await shuffleButton(page).boundingBox();
    assert.ok(box, 'Shuffle renders at 390px');
    assert.ok(box.width > 0 && box.x >= 0 && box.x + box.width <= 390, 'Shuffle fits within the 390px viewport');
    assert.ok(box.height >= 40, `Shuffle meets a touch-friendly minimum height (${box.height}px)`);
    const before = await hexes(page);
    await shuffleButton(page).tap();
    assert.notDeepEqual(await hexes(page), before, 'tapping Shuffle at 390px reorders the palette');
    const size = await page.evaluate(() => ({ scroll: document.documentElement.scrollWidth, client: document.documentElement.clientWidth }));
    assert.ok(size.scroll <= size.client, `no horizontal page overflow after shuffling (${JSON.stringify(size)})`);
    assert.deepEqual(errors, [], 'no uncaught page errors');
  } finally { await context.close(); }
});
