// Real-browser check for STU-09: dragging a Studio palette member by its grip
// lifts a card that travels with the pointer/finger, swaps on drop, and leaves
// no temporary state after cancel, Escape, release outside, or a rerender.
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
    name: 'Drag check', colors, roleIndex: colors.length > 5 ? [0, 1, 2, 3, 4] : undefined,
  })), colors);
  await page.goto(`${origin}/studio/?saved=1`);
  await page.locator('#paletteRoles [data-select-member]').first().waitFor();
  // Decline optional analytics so the consent banner does not cover the rail.
  const decline = page.locator('[data-consent="no"]:visible').first();
  if (await decline.isVisible()) await decline.click();
  assert.deepEqual(await hexes(page), colors, 'Studio rail shows the seeded colors in order');
  return { context, page, errors };
}

const hexes = page => page.locator('#paletteRoles [data-select-member] code').evaluateAll(nodes => nodes.map(node => node.textContent.trim().toUpperCase()));

// Everything temporary the drag may create, read from the live DOM.
const dragState = page => page.evaluate(() => {
  const rail = document.querySelector('#paletteRoles');
  const proxy = rail.querySelector('.palette-member-proxy');
  const box = proxy?.getBoundingClientRect();
  return {
    proxy: proxy ? { left: box.left, top: box.top, width: box.width, height: box.height, hidden: proxy.getAttribute('aria-hidden'), inert: proxy.inert,
      tabIndex: proxy.tabIndex, member: proxy.hasAttribute('data-select-member'), label: proxy.hasAttribute('aria-label'),
      hits: getComputedStyle(proxy).pointerEvents, hex: proxy.querySelector('code')?.textContent.trim().toUpperCase() } : null,
    proxies: document.querySelectorAll('.palette-member-proxy').length,
    dragging: [...rail.querySelectorAll('.is-dragging')].map(node => Number(node.dataset.selectMember)),
    targets: [...rail.querySelectorAll('.is-drop-target')].map(node => Number(node.dataset.selectMember)),
    railDragging: rail.classList.contains('is-member-dragging'),
    pressed: [...rail.querySelectorAll('[aria-pressed="true"]')].map(node => Number(node.dataset.selectMember)),
    members: rail.querySelectorAll('[data-select-member]').length,
  };
});

async function assertClean(page, label) {
  const state = await dragState(page);
  assert.equal(state.proxies, 0, `${label}: no lifted card remains`);
  assert.deepEqual(state.dragging, [], `${label}: no member stays in the dragging state`);
  assert.deepEqual(state.targets, [], `${label}: no stuck drop target`);
  assert.equal(state.railDragging, false, `${label}: rail leaves drag mode`);
  return state;
}

const center = box => ({ x: box.x + box.width / 2, y: box.y + box.height / 2 });
const grip = (page, index) => page.locator(`#paletteRoles [data-select-member="${index}"] .palette-member-grip`);
const card = (page, index) => page.locator(`#paletteRoles [data-select-member="${index}"]`);

// Presses a grip and moves in steps toward `to`; returns proxy readings along the way.
async function mouseDragToward(page, from, to, steps = 6) {
  await grip(page, from).scrollIntoViewIfNeeded();
  const start = center(await grip(page, from).boundingBox());
  await page.mouse.move(start.x, start.y);
  await page.mouse.down();
  const readings = [];
  for (let step = 1; step <= steps; step++) {
    const point = { x: start.x + (to.x - start.x) * step / steps, y: start.y + (to.y - start.y) * step / steps };
    await page.mouse.move(point.x, point.y);
    await page.evaluate(() => new Promise(requestAnimationFrame));
    readings.push({ point, state: await dragState(page) });
  }
  return { start, readings };
}

function assertTravels(readings, source, label) {
  const lifted = readings.filter(reading => reading.state.proxy);
  assert.ok(lifted.length >= 2, `${label}: card lifts once the pointer passes the threshold`);
  const first = lifted[0], last = lifted.at(-1);
  const moved = Math.hypot(last.state.proxy.left - first.state.proxy.left, last.state.proxy.top - first.state.proxy.top);
  const pointer = Math.hypot(last.point.x - first.point.x, last.point.y - first.point.y);
  assert.ok(moved > 20 && Math.abs(moved - pointer) < 2, `${label}: card travels with the pointer (${moved.toFixed(1)}px vs ${pointer.toFixed(1)}px)`);
  for (const { point, state } of lifted) {
    const { proxy } = state;
    assert.ok(point.x >= proxy.left && point.x <= proxy.left + proxy.width && point.y >= proxy.top && point.y <= proxy.top + proxy.height, `${label}: pointer stays on the lifted card`);
    assert.equal(proxy.hex, source, `${label}: the lifted card is the dragged color`);
    assert.equal(proxy.hidden, 'true', `${label}: lifted card is hidden from assistive tech`);
    assert.equal(proxy.inert, true, `${label}: lifted card is inert`);
    assert.equal(proxy.tabIndex, -1, `${label}: lifted card is unfocusable`);
    assert.equal(proxy.member, false, `${label}: lifted card is not a rail member`);
    assert.equal(proxy.label, false, `${label}: lifted card announces nothing`);
    assert.equal(proxy.hits, 'none', `${label}: lifted card never covers hit-testing of targets`);
    assert.equal(state.proxies, 1, `${label}: exactly one lifted card`);
  }
}

test('desktop: lifted card follows the mouse, drop swaps, clicks still select', async () => {
  const colors = palette(5);
  const { context, page, errors } = await openStudio({ viewport: { width: 1280, height: 900 }, colors });
  try {
    const target = center(await card(page, 2).boundingBox());
    const { readings } = await mouseDragToward(page, 0, target);
    assertTravels(readings, colors[0], 'desktop');
    const during = readings.at(-1).state;
    assert.deepEqual(during.dragging, [0], 'source slot stays in place, marked as dragging');
    assert.deepEqual(during.targets, [2], 'hovered member is the only drop target');
    assert.deepEqual(during.pressed, [0], 'dragging does not change the selection');
    assert.deepEqual(await hexes(page), colors, 'nothing is swapped before drop');
    const slot = await card(page, 0).evaluate(node => getComputedStyle(node.querySelector('i')).visibility);
    assert.equal(slot, 'hidden', 'source position is left clear while its card travels');
    await page.mouse.up();
    const swapped = [...colors];
    [swapped[0], swapped[2]] = [swapped[2], swapped[0]];
    assert.deepEqual(await hexes(page), swapped, 'drop swaps the two members');
    const after = await assertClean(page, 'after drop');
    assert.deepEqual(after.pressed, [2], 'the moved color stays selected at its new position');
    assert.match(await page.locator('#paletteOrderStatus').textContent(), /Swapped Color 1 and Color 3/);

    await card(page, 4).locator('code').click();
    assert.deepEqual((await dragState(page)).pressed, [4], 'a plain click still selects a color');
    assert.deepEqual(await hexes(page), swapped, 'a plain click does not reorder');
    assert.deepEqual(errors, [], 'no uncaught page errors');
  } finally { await context.close(); }
});

test('desktop: Escape, release outside, and rerender leave no drag state', async () => {
  const colors = palette(8);
  const { context, page, errors } = await openStudio({ viewport: { width: 1280, height: 900 }, colors });
  try {
    await mouseDragToward(page, 1, center(await card(page, 3).boundingBox()));
    assert.deepEqual((await dragState(page)).targets, [3], 'target is highlighted before Escape');
    await page.keyboard.press('Escape');
    await assertClean(page, 'Escape');
    await page.mouse.move(...Object.values(center(await card(page, 5).boundingBox())));
    await page.mouse.up();
    await assertClean(page, 'release after Escape');
    assert.deepEqual(await hexes(page), colors, 'Escape cancels the swap');

    await mouseDragToward(page, 2, { x: 700, y: 820 });
    assert.ok((await dragState(page)).proxy, 'card lifted outside the rail');
    assert.deepEqual((await dragState(page)).targets, [], 'no target outside the rail');
    await page.mouse.up();
    await assertClean(page, 'release outside');
    assert.deepEqual(await hexes(page), colors, 'release outside a target does not swap');

    // A keyboard selection rerenders the rail mid-drag.
    await card(page, 6).focus();
    await mouseDragToward(page, 0, center(await card(page, 4).boundingBox()));
    assert.deepEqual((await dragState(page)).targets, [4], 'target is highlighted before rerender');
    await page.keyboard.press('ArrowRight');
    await page.waitForFunction(() => document.querySelector('#paletteRoles [data-select-member="7"]')?.getAttribute('aria-pressed') === 'true');
    await assertClean(page, 'rerender');
    await page.mouse.up();
    await assertClean(page, 'release after rerender');
    assert.deepEqual(await hexes(page), colors, 'a rerender cancels the swap');
    assert.deepEqual(errors, [], 'no uncaught page errors');
  } finally { await context.close(); }
});

test('desktop: 2 and 24 members swap by drag', async () => {
  for (const count of [2, 24]) {
    const colors = palette(count);
    const { context, page, errors } = await openStudio({ viewport: { width: 1280, height: 900 }, colors });
    try {
      const last = count - 1;
      await card(page, last).scrollIntoViewIfNeeded();
      const { readings } = await mouseDragToward(page, last, center(await card(page, last - 1).boundingBox()));
      assertTravels(readings, colors[last], `${count} members`);
      await page.mouse.up();
      const swapped = [...colors];
      [swapped[last], swapped[last - 1]] = [swapped[last - 1], swapped[last]];
      assert.deepEqual(await hexes(page), swapped, `${count} members: drop swaps the neighbours`);
      await assertClean(page, `${count} members after drop`);
      assert.deepEqual(errors, [], 'no uncaught page errors');
    } finally { await context.close(); }
  }
});

test('390px touch: card follows the finger along the horizontal rail; touch cancel cleans up', async t => {
  const colors = palette(6);
  const { context, page, errors } = await openStudio({ viewport: { width: 390, height: 844 }, colors, touch: true });
  const cdp = await context.newCDPSession(page);
  const touch = (type, point) => cdp.send('Input.dispatchTouchEvent', { type, touchPoints: point ? [{ x: point.x, y: point.y }] : [] });
  const touchDrag = async (from, to, steps = 6) => {
    await grip(page, from).scrollIntoViewIfNeeded();
    const start = center(await grip(page, from).boundingBox());
    await touch('touchStart', start);
    const readings = [];
    for (let step = 1; step <= steps; step++) {
      // A finger wanders a little off the rail's axis.
      const point = { x: start.x + (to.x - start.x) * step / steps, y: start.y + (to.y - start.y) * step / steps + (step % 2 ? 6 : -4) };
      await touch('touchMove', point);
      await page.evaluate(() => new Promise(requestAnimationFrame));
      readings.push({ point, state: await dragState(page) });
    }
    return readings;
  };
  try {
    const overflowX = await page.locator('#paletteRoles').evaluate(node => getComputedStyle(node).overflowX);
    assert.ok(['auto', 'scroll'].includes(overflowX), `rail is horizontal at 390px (overflow-x: ${overflowX})`);
    const target = center(await card(page, 1).boundingBox());
    const readings = await touchDrag(0, target);
    assertTravels(readings, colors[0], '390px touch');
    assert.deepEqual(readings.at(-1).state.targets, [1], 'finger over the neighbour highlights it');
    await touch('touchEnd');
    const swapped = [colors[1], colors[0], ...colors.slice(2)];
    assert.deepEqual(await hexes(page), swapped, 'lifting the finger swaps');
    await assertClean(page, 'touch drop');

    await touchDrag(0, center(await card(page, 1).boundingBox()));
    assert.ok((await dragState(page)).proxy, 'card lifted before touch cancel');
    await touch('touchCancel');
    await assertClean(page, 'pointercancel');
    assert.deepEqual(await hexes(page), swapped, 'touch cancel does not swap');
    const size = await page.evaluate(() => ({ scroll: document.documentElement.scrollWidth, client: document.documentElement.clientWidth }));
    assert.ok(size.scroll <= size.client, `no horizontal page overflow after dragging (${JSON.stringify(size)})`);
    assert.deepEqual(errors, [], 'no uncaught page errors');
    t.diagnostic(`blocked remote origins: ${[...blocked].sort().join(', ') || 'none requested'}`);
  } finally { await context.close(); }
});
