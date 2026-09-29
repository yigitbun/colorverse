// Real-browser check for STU-10: the plus below the Studio rail opens an inline
// picker/HEX form that appends a real palette member, selects it, keeps the five
// preview roles on their colors, persists through export and reload, and stops at 24.
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
    name: 'Add check', colors, roleIndex: roleIndex ?? (colors.length > 5 ? [0, 1, 2, 3, 4] : undefined),
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
const state = page => page.evaluate(() => ({
  selected: document.querySelector('#selectedColorLabel').textContent.trim(),
  selectedHex: document.querySelector('#selectedColorHex').textContent.trim(),
  pressed: [...document.querySelectorAll('#paletteRoles [aria-pressed="true"]')].map(node => Number(node.dataset.selectMember)),
  count: document.querySelector('#paletteCount').hidden ? null : Number(document.querySelector('#paletteCount b').textContent),
  formOpen: !document.querySelector('#paletteAddForm').hidden,
  expanded: document.querySelector('#paletteAddToggle').getAttribute('aria-expanded'),
  toggle: document.querySelector('#paletteAddToggle').textContent.trim(),
  focused: document.activeElement?.id || document.activeElement?.dataset?.selectMember || document.activeElement?.tagName,
}));
const toggle = page => page.locator('#paletteAddToggle');
const hexField = page => page.locator('#paletteAddHex');
const confirm = page => page.locator('#paletteAddConfirm');
const center = box => ({ x: box.x + box.width / 2, y: box.y + box.height / 2 });

async function assertBelowRail(page, label) {
  const [rail, plus] = await Promise.all([page.locator('#paletteRoles').boundingBox(), toggle(page).boundingBox()]);
  assert.ok(plus && plus.width > 0 && plus.height >= 32, `${label}: plus control is visible and tappable`);
  assert.ok(plus.y >= rail.y + rail.height - 1, `${label}: plus sits below the rail (${plus.y} vs ${rail.y + rail.height})`);
  assert.ok(plus.x >= rail.x - 1 && plus.x < rail.x + rail.width, `${label}: plus is aligned with the rail`);
}

async function assertNoOverflow(page, label) {
  const size = await page.evaluate(() => ({ scroll: document.documentElement.scrollWidth, client: document.documentElement.clientWidth }));
  assert.ok(size.scroll <= size.client, `${label}: no horizontal page overflow (${JSON.stringify(size)})`);
}

test('desktop: invalid HEX, Cancel and Escape change nothing; a valid HEX adds Color 6', async () => {
  const colors = palette(5);
  const { context, page, errors } = await openStudio({ viewport: { width: 1280, height: 900 }, colors });
  try {
    await assertBelowRail(page, 'desktop');
    assert.equal((await state(page)).toggle, 'Add Color 6', 'plus names the member it will create');
    const before = await stored(page);

    await toggle(page).click();
    let now = await state(page);
    assert.equal(now.formOpen, true, 'plus opens the inline form');
    assert.equal(now.expanded, 'true');
    assert.equal(now.focused, 'paletteAddHex', 'focus moves to the HEX field');
    const suggested = await hexField(page).inputValue();
    assert.match(suggested, /^#[0-9A-F]{6}$/, 'a valid starting color is prefilled');
    assert.equal(await page.locator('#paletteAddPicker').inputValue(), suggested.toLowerCase(), 'native picker shows the suggestion');
    assert.ok(!colors.includes(suggested), 'suggestion is not already a member');

    for (const bad of ['#12345G', '#1234', 'blue', '']) {
      await hexField(page).fill(bad);
      assert.equal(await confirm(page).isDisabled(), true, `"${bad}" cannot be added`);
      assert.equal(await hexField(page).getAttribute('aria-invalid'), 'true');
      assert.match(await page.locator('#paletteAddHint').textContent(), /six HEX digits/);
      await hexField(page).press('Enter');
      assert.deepEqual(await hexes(page), colors, `Enter with "${bad}" adds nothing`);
    }
    await page.locator('#paletteAddCancel').click();
    now = await state(page);
    assert.equal(now.formOpen, false, 'Cancel closes the form');
    assert.equal(now.focused, 'paletteAddToggle', 'Cancel returns focus to the plus');
    assert.deepEqual(await hexes(page), colors, 'Cancel leaves the palette unchanged');

    await page.keyboard.press('Enter');
    assert.equal((await state(page)).formOpen, true, 'keyboard Enter on the plus opens the form');
    await hexField(page).fill('#3A7BD5');
    await page.keyboard.press('Escape');
    now = await state(page);
    assert.equal(now.formOpen, false, 'Escape closes the form');
    assert.equal(now.focused, 'paletteAddToggle', 'Escape returns focus to the plus');
    assert.deepEqual(await hexes(page), colors, 'Escape leaves the palette unchanged');
    assert.deepEqual(await stored(page), before, 'nothing was persisted by Cancel/Escape');

    await toggle(page).click();
    await hexField(page).fill('3a7bd5');
    assert.equal(await page.locator('#paletteAddPicker').inputValue(), '#3a7bd5', 'picker swatch follows a valid HEX');
    assert.equal(await confirm(page).textContent(), 'Add Color 6');
    await confirm(page).click();
    assert.deepEqual(await hexes(page), [...colors, '#3A7BD5'], 'Color 6 is appended as a real member');
    now = await state(page);
    assert.equal(now.selected, 'Color 6', 'Edit panel shows the new member');
    assert.equal(now.selectedHex, '#3A7BD5');
    assert.deepEqual(now.pressed, [5], 'the new member is selected in the rail');
    assert.equal(now.focused, '5', 'focus lands on the new member');
    assert.equal(now.count, 6, 'rail count updates');
    assert.equal(now.formOpen, false, 'form closes after adding');
    assert.equal(now.toggle, 'Add Color 7');
    const saved = await stored(page);
    assert.deepEqual(saved.workspace.members, [...colors, '#3A7BD5']);
    assert.deepEqual(saved.workspace.roleIndex, [0, 1, 2, 3, 4], 'preview roles stay on Color 1–5');
    assert.deepEqual(saved.colors, colors, 'the five preview colors are unchanged');
    assert.match(await page.locator('#paletteOrderStatus').textContent(), /Color 6 added: #3A7BD5/);

    // The plus is outside the rail: dragging a member onto it swaps nothing.
    const grip = page.locator('#paletteRoles [data-select-member="1"] .palette-member-grip');
    const start = center(await grip.boundingBox()), end = center(await toggle(page).boundingBox());
    await page.mouse.move(start.x, start.y);
    await page.mouse.down();
    for (let step = 1; step <= 6; step++) await page.mouse.move(start.x + (end.x - start.x) * step / 6, start.y + (end.y - start.y) * step / 6);
    await page.mouse.up();
    assert.deepEqual(await hexes(page), [...colors, '#3A7BD5'], 'plus is not a drop target');
    assert.equal(await page.locator('.palette-member-proxy').count(), 0);
    await assertNoOverflow(page, 'desktop');
    assert.deepEqual(errors, [], 'no uncaught page errors');
  } finally { await context.close(); }
});

test('desktop: adding to a 7-color palette keeps order and role map through export and reload', async () => {
  const colors = palette(7), roleIndex = [6, 0, 2, 4, 1];
  const { context, page, errors } = await openStudio({ viewport: { width: 1280, height: 900 }, colors, roleIndex });
  try {
    const roleColors = roleIndex.map(index => colors[index]);
    await page.locator('#paletteRoles [data-select-member="3"]').click();
    await toggle(page).click();
    await page.locator('#paletteAddPicker').fill('#c04a7e');
    assert.equal(await hexField(page).inputValue(), '#C04A7E', 'native picker writes the HEX field');
    await confirm(page).click();
    const members = [...colors, '#C04A7E'];
    assert.deepEqual(await hexes(page), members, 'Color 8 is appended after the existing order');
    const now = await state(page);
    assert.equal(now.selected, 'Color 8');
    assert.deepEqual(now.pressed, [7]);
    assert.equal(now.count, 8);
    const unassigned = await page.locator('#paletteRoles [data-select-member="7"]').evaluate(node => node.classList.contains('is-unassigned'));
    assert.equal(unassigned, true, 'the new member is not placed in the preview');
    let saved = await stored(page);
    assert.deepEqual(saved.workspace.roleIndex, roleIndex, 'role map unchanged');
    assert.deepEqual(saved.colors, roleColors, 'preview colors unchanged');

    await page.locator('[data-format="json"]').click();
    const exported = JSON.parse(await page.locator('#exportCode').textContent());
    assert.deepEqual(exported.members, members, 'export includes every member in order');
    assert.deepEqual(exported.previewRoles, { background: 7, surface: 1, primary: 3, accent: 5, text: 2 }, 'export keeps the preview mapping');

    await toggle(page).click();
    await hexField(page).fill('#1F6F5C');
    await hexField(page).press('Enter');
    assert.deepEqual(await hexes(page), [...members, '#1F6F5C'], 'Enter in the HEX field adds Color 9');

    await page.reload();
    await page.locator('#paletteRoles [data-select-member]').first().waitFor();
    await declineConsent(page);
    assert.deepEqual(await hexes(page), [...members, '#1F6F5C'], 'reload keeps the added members');
    saved = await stored(page);
    assert.deepEqual(saved.workspace.roleIndex, roleIndex, 'reload keeps the role map');
    assert.deepEqual(saved.colors, roleColors);
    assert.deepEqual(errors, [], 'no uncaught page errors');
  } finally { await context.close(); }
});

test('desktop: a short palette fills its next support slot; 24 is the limit', async () => {
  let { context, page, errors } = await openStudio({ viewport: { width: 1280, height: 900 }, colors: palette(3) });
  try {
    const before = (await stored(page)).workspace.roleIndex;
    await toggle(page).click();
    await hexField(page).fill('#445566');
    await confirm(page).click();
    assert.deepEqual(await hexes(page), [...palette(3), '#445566'], 'short palette gains Color 4');
    const saved = await stored(page);
    const open = before.findIndex((index, role) => index === 'support' && saved.workspace.roleIndex[role] === 3);
    assert.ok(open >= 0, `new member takes a former support slot (${JSON.stringify(before)} -> ${JSON.stringify(saved.workspace.roleIndex)})`);
    assert.deepEqual(saved.workspace.roleIndex.filter((index, role) => index !== before[role]), [3], 'existing members keep their preview slots');
    assert.equal((await state(page)).selected, 'Color 4');
    // A fifth color completes the historic five-slot model; the new color is still the one selected.
    await toggle(page).click();
    await hexField(page).fill('#778899');
    await confirm(page).click();
    const five = await stored(page);
    assert.deepEqual(five.workspace.roleIndex, [0, 1, 2, 3, 4]);
    assert.deepEqual([...five.workspace.members].sort(), [...palette(3), '#445566', '#778899'].sort(), 'all five colors are members');
    const now = await state(page);
    assert.equal(now.selectedHex, '#778899', 'the added color is selected after the five-slot reorder');
    assert.equal(five.workspace.members[now.pressed[0]], '#778899');
    assert.deepEqual(errors, []);
  } finally { await context.close(); }

  ({ context, page, errors } = await openStudio({ viewport: { width: 1280, height: 900 }, colors: palette(23) }));
  try {
    await toggle(page).scrollIntoViewIfNeeded();
    await toggle(page).click();
    await hexField(page).fill('#ABCDEF');
    await confirm(page).click();
    assert.equal((await hexes(page)).length, 24, 'Color 24 is added');
    let now = await state(page);
    assert.equal(now.count, 24);
    assert.equal(now.toggle, 'Palette full');
    assert.equal(await toggle(page).getAttribute('aria-disabled'), 'true', 'plus reports it is unavailable');
    assert.match(await page.locator('#paletteAddLimit').textContent(), /at most 24/, 'visible limit explanation');
    assert.equal(await page.locator('#paletteAddLimit').isVisible(), true);
    // aria-disabled keeps it focusable and explained; activating it only announces the limit.
    await toggle(page).focus();
    await page.keyboard.press('Enter');
    now = await state(page);
    assert.equal(now.formOpen, false, 'a full palette never opens the form');
    assert.match(await page.locator('#paletteOrderStatus').textContent(), /maximum/);
    assert.equal((await hexes(page)).length, 24);
    assert.deepEqual(errors, []);
  } finally { await context.close(); }
});

test('desktop collapsed rail: plus stays reachable and expands the rail before opening', async () => {
  const colors = palette(6);
  const { context, page, errors } = await openStudio({ viewport: { width: 1280, height: 900 }, colors });
  try {
    await page.locator('#togglePaletteRail').click();
    assert.equal(await page.locator('.studio-workspace.is-palette-collapsed').count(), 1);
    await assertBelowRail(page, 'collapsed');
    const width = (await toggle(page).boundingBox()).width;
    assert.ok(width <= 52, `collapsed plus fits the slim rail (${width}px)`);
    assert.match(await toggle(page).evaluate(node => node.textContent.trim()), /Add Color 7/, 'collapsed plus keeps its accessible name');
    await toggle(page).click();
    assert.equal(await page.locator('.studio-workspace.is-palette-collapsed').count(), 0, 'rail expands');
    assert.equal((await state(page)).formOpen, true, 'form opens in the expanded rail');
    await page.locator('#togglePaletteRail').click();
    assert.equal((await state(page)).formOpen, false, 'collapsing closes the form');
    assert.deepEqual(await hexes(page), colors);
    assert.deepEqual(errors, []);
  } finally { await context.close(); }
});

test('390px touch: plus below the horizontal rail, keyboard add, no overflow', async t => {
  const colors = palette(6);
  const { context, page, errors } = await openStudio({ viewport: { width: 390, height: 844 }, colors, touch: true });
  try {
    const overflowX = await page.locator('#paletteRoles').evaluate(node => getComputedStyle(node).overflowX);
    assert.ok(['auto', 'scroll'].includes(overflowX), `rail is horizontal at 390px (overflow-x: ${overflowX})`);
    await assertBelowRail(page, '390px');
    await assertNoOverflow(page, '390px closed');
    await toggle(page).tap();
    assert.equal((await state(page)).formOpen, true);
    const form = await page.locator('#paletteAddForm').boundingBox();
    assert.ok(form.x >= 0 && form.x + form.width <= 390, 'form fits the viewport');
    await assertNoOverflow(page, '390px open');
    await hexField(page).fill('#D1A23B');
    await page.keyboard.press('Enter');
    assert.deepEqual(await hexes(page), [...colors, '#D1A23B']);
    const now = await state(page);
    assert.equal(now.selected, 'Color 7');
    assert.deepEqual(now.pressed, [6]);
    const added = await page.locator('#paletteRoles [data-select-member="6"]').boundingBox();
    assert.ok(added.x >= 0 && added.x + added.width <= 391, 'the rail scrolls the new member into view');
    await assertNoOverflow(page, '390px after add');
    assert.deepEqual(errors, [], 'no uncaught page errors');
    t.diagnostic(`blocked remote origins: ${[...blocked].sort().join(', ') || 'none requested'}`);
  } finally { await context.close(); }
});
