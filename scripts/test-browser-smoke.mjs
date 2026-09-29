// Local browser smoke for the static app in dist/ (HQ-05A).
// Starts its own static server and a disposable headless Chromium profile,
// blocks every request that leaves the local origin (Supabase, analytics,
// fonts), and drives Explore → Library → Studio, 390px overflow, and keyboard selection
// of Studio palette members. Nothing here touches hosted data or accounts.
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
    // Directory routes need their trailing slash for relative asset URLs.
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
  // A fresh, temporary profile per launch: no owner session, drafts, or cookies.
  browser = await chromium.launch({ headless: true, executablePath: await browserExecutable() });
});

after(async () => {
  await browser?.close();
  await new Promise(done => server ? server.close(done) : done());
});

async function openContext(viewport) {
  const context = await browser.newContext({ viewport, serviceWorkers: 'block', reducedMotion: 'reduce' });
  // Only the local server is reachable; account, analytics, and CDN calls fail closed.
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
  return { context, page, errors };
}

// Follow a real Library concept card after the homepage points to Library.
async function handOffFromLibrary(page) {
  await page.goto(`${origin}/`);
  assert.equal((await page.locator('[data-tool-catalog] h2').textContent()).trim(), 'Color is a decision, not a swatch.');
  assert.equal(await page.locator('#homeExploreGrid').count(), 0, 'homepage no longer repeats Library examples');
  await Promise.all([page.waitForURL(url => url.pathname === '/explore/'), page.locator('.hero-actions a[href="/explore/"]').click()]);
  const card = page.locator('[data-study-shelf="library"] .study-card').first();
  await card.scrollIntoViewIfNeeded();
  const link = card.locator('a[href^="/studio/?p="]');
  await assert.doesNotReject(link.waitFor({ state: 'visible' }), 'Library shows a concept study with a visible Studio link');
  const id = await card.getAttribute('data-study-id');
  const colors = await card.locator('.study-palette i').evaluateAll(nodes => nodes.map(node => node.title.toUpperCase()));
  assert.ok(id, 'concept card carries an id');
  assert.equal(colors.length, 5, 'Library concept card shows five palette colors');
  await Promise.all([page.waitForURL(url => url.pathname === '/studio/'), link.click()]);
  assert.equal(new URL(page.url()).searchParams.get('p'), id, 'Studio opened with the chosen Library concept id');
  await page.locator('#paletteRoles [data-select-member]').first().waitFor();
  return { id, colors };
}

const members = page => page.locator('#paletteRoles [data-select-member]').evaluateAll(nodes => nodes.map(node => ({
  index: Number(node.dataset.selectMember),
  hex: node.querySelector('code')?.textContent.trim().toUpperCase(),
  pressed: node.getAttribute('aria-pressed') === 'true',
})));

async function assertStudioShows(page, expected) {
  const rail = await members(page);
  assert.deepEqual(rail.map(member => member.hex), expected.colors, 'Studio rail members match the Explore card colors in order');
  assert.deepEqual(rail.filter(member => member.pressed).map(member => member.index), [0], 'first member starts selected');
  assert.ok((await page.locator('#paletteName').textContent()).trim(), 'Studio shows a palette name');
  assert.equal((await page.locator('#selectedColorHex').textContent()).trim().toUpperCase(), expected.colors[0], 'selected-color panel shows the first member');
  const handoff = await page.evaluate(() => JSON.parse(sessionStorage.getItem('colorverse-current-palette') || 'null'));
  if (handoff) assert.equal(handoff.id, expected.id, 'any stored handoff belongs to the chosen palette');
}

async function assertKeyboardSelection(page, expected) {
  const first = page.locator('#paletteRoles [data-select-member="0"]');
  await first.focus();
  await page.keyboard.press('ArrowRight');
  const second = page.locator('#paletteRoles [data-select-member="1"]');
  await assert.doesNotReject(page.waitForFunction(() => document.querySelector('#paletteRoles [data-select-member="1"]')?.getAttribute('aria-pressed') === 'true'), 'ArrowRight selects the next member');
  const rail = await members(page);
  assert.deepEqual(rail.filter(member => member.pressed).map(member => member.index), [1], 'exactly one member is selected');
  assert.equal(await second.evaluate(node => node === document.activeElement), true, 'focus follows the newly selected member');
  assert.equal(await page.locator('#colorGlobe').evaluate(node => node.open), false, 'arrow selection does not open Color Globe');
  assert.equal((await page.locator('#selectedColorHex').textContent()).trim().toUpperCase(), expected.colors[1], 'selected-color panel shows the new member hex');
  assert.match(await page.locator('#selectedColorLabel').textContent(), /\S/, 'selected-color panel has a label');
  await page.keyboard.press('End');
  await assert.doesNotReject(page.waitForFunction(last => document.querySelector(`#paletteRoles [data-select-member="${last}"]`)?.getAttribute('aria-pressed') === 'true', expected.colors.length - 1), 'End selects the last member');
  assert.equal((await page.locator('#selectedColorHex').textContent()).trim().toUpperCase(), expected.colors.at(-1), 'selected-color panel follows End');
}

test('Library → Studio handoff and keyboard member selection (desktop)', async t => {
  const { context, page, errors } = await openContext({ width: 1280, height: 900 });
  try {
    await page.goto(`${origin}/`);
    // Guard self-check on a reserved host: off-origin fetches never leave the browser.
    const guarded = await page.evaluate(() => fetch('https://guard-check.invalid/').then(() => 'sent', () => 'blocked'));
    assert.equal(guarded, 'blocked', 'off-origin requests are aborted');
    assert.ok(blocked.has('https://guard-check.invalid'), 'route guard saw the off-origin request');
    const expected = await handOffFromLibrary(page);
    t.diagnostic(`palette ${expected.id}: ${expected.colors.join(' ')}`);
    await assertStudioShows(page, expected);
    await assertKeyboardSelection(page, expected);
    assert.deepEqual(errors, [], 'no uncaught page errors');
  } finally { await context.close(); }
});

test('390px: no page overflow, Studio rail scrolls in place, keyboard selection', async t => {
  const { context, page, errors } = await openContext({ width: 390, height: 844 });
  const noPageOverflow = async label => {
    const size = await page.evaluate(() => ({ scroll: document.documentElement.scrollWidth, client: document.documentElement.clientWidth, body: document.body.scrollWidth }));
    assert.ok(size.scroll <= size.client && size.body <= size.client, `${label}: no horizontal document overflow (${JSON.stringify(size)})`);
  };
  try {
    await page.goto(`${origin}/`);
    await noPageOverflow('Explore');
    const expected = await handOffFromLibrary(page);
    await assertStudioShows(page, expected);
    await noPageOverflow('Studio');

    const rail = page.locator('#paletteRoles');
    await rail.scrollIntoViewIfNeeded();
    const box = await rail.evaluate(node => {
      const rect = node.getBoundingClientRect(), style = getComputedStyle(node);
      return { left: rect.left, right: rect.right, client: node.clientWidth, scroll: node.scrollWidth, overflowX: style.overflowX, viewport: document.documentElement.clientWidth };
    });
    assert.ok(box.left >= 0 && box.right <= box.viewport, `rail stays inside the viewport (${JSON.stringify(box)})`);
    assert.ok(['auto', 'scroll'].includes(box.overflowX), `rail scrolls on its own axis (overflow-x: ${box.overflowX})`);
    t.diagnostic(`rail ${box.client}px wide, content ${box.scroll}px, overflow-x ${box.overflowX}`);
    if (box.scroll > box.client) {
      const moved = await rail.evaluate(node => { node.scrollLeft = node.scrollWidth; return { rail: node.scrollLeft, page: window.scrollX }; });
      assert.ok(moved.rail > 0, 'rail scrolls horizontally inside itself');
      assert.equal(moved.page, 0, 'scrolling the rail does not scroll the page sideways');
      await rail.evaluate(node => { node.scrollLeft = 0; });
    }

    await assertKeyboardSelection(page, expected);
    const selected = await page.locator('#paletteRoles [aria-pressed="true"]').evaluate(node => {
      const item = node.getBoundingClientRect(), rail = node.parentElement.getBoundingClientRect();
      return { visible: item.right > rail.left && item.left < rail.right };
    });
    assert.ok(selected.visible, 'keyboard-selected member is scrolled into the rail view');
    await noPageOverflow('Studio after keyboard selection');
    assert.deepEqual(errors, [], 'no uncaught page errors');
    // The route guard aborts these before any network I/O.
    t.diagnostic(`blocked remote origins: ${[...blocked].sort().join(', ') || 'none requested'}`);
  } finally { await context.close(); }
});
