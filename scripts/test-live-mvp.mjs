import assert from 'node:assert/strict';
import { productionAccount } from '../dist/account-config.js';
import { EMAIL_CODE_LENGTH } from '../dist/email-access.js';

const base = (process.env.COLORVERSE_LIVE_URL || 'https://colorverse.byigit.dev').replace(/\/$/, '');
const supabaseUrl = productionAccount.url;
const publishableKey = productionAccount.key;
const candidate = process.argv.includes('--candidate');
const publicRoutes = ['/', '/explore/', '/extract/', '/studio/', '/inspiration/', '/community/', '/lab/', '/about/', '/privacy/', '/account/'];

async function get(path, options = {}) {
  return fetch(`${base}${path}`, { signal: AbortSignal.timeout(15_000), ...options });
}

const home = await get('/');
assert.equal(home.status, 200, 'production home must be reachable');
for (const header of ['content-security-policy', 'strict-transport-security', 'x-frame-options', 'cross-origin-opener-policy', 'cross-origin-resource-policy', 'origin-agent-cluster', 'x-content-type-options', 'permissions-policy', 'referrer-policy']) {
  assert.ok(home.headers.get(header), `production must send ${header}`);
}

const homeHtml = await home.text();
assert.match(homeHtml, /src="\/app\.js(?:\?[^"\s]+)?"/);
assert.match(homeHtml, /src="\/analytics\.js(?:\?[^"\s]+)?"/);
assert.match(homeHtml, /href="\/studio\/"/);

for (const route of publicRoutes.slice(1)) {
  const response = await get(route);
  assert.equal(response.status, 200, `public route ${route} must be reachable`);
  const html = await response.text();
  assert.doesNotMatch(html, /chatgpt\.site|Sign in to ChatGPT/i, `public route ${route} must not be a ChatGPT Sites gate`);
}

const privacy = await get('/privacy/');
const privacyHtml = await privacy.text();

const inspiration = await get('/inspiration/');
assert.equal(inspiration.status, 200, 'inspiration page must be reachable');
const inspirationHtml = await inspiration.text();
assert.match(inspirationHtml, /ColorVerse/);

const studio = await get('/studio/');
assert.equal(studio.status, 200, 'studio page must be reachable');
const studioHtml = await studio.text();
assert.match(studioHtml, /src="\/app\.js(?:\?[^"\s]+)?"/);

const account = await get('/account/');
const accountHtml = await account.text();
assert.match(accountHtml, /<meta name="robots" content="noindex,nofollow">/);

const projectStore = await get('/project-store.js');
assert.equal(projectStore.status, 200, 'private workspace script must be reachable');
const projectStoreSource = await projectStore.text();
assert.match(projectStoreSource, /getAccountClient/);

if (candidate) {
  assert.match(homeHtml, /id="heroSwatches"/);
  assert.doesNotMatch(homeHtml, /hero-palette-context|heroPaletteImage/);
  assert.match(privacyHtml, /Prototype 1\/2 versions/);
  assert.match(privacyHtml, /remove this private workspace data/);
  assert.match(studioHtml, /studio-editor\.css/);
  assert.match(studioHtml, /context-kits\.css/);
  assert.match(studioHtml, /data-context="landing"[^>]*>Objects/);
  assert.match(studioHtml, /data-context="interface"[^>]*>Screens/);
  assert.match(studioHtml, /data-context="social"[^>]*>Campaigns/);
  assert.doesNotMatch(studioHtml, /data-context="(?:shop|material)"/);
  assert.doesNotMatch(studioHtml, /shadeStudio|openShadeStudio|shade-studio\.css/);
  for (const label of ['Private workspace', 'Palette collections', 'Save palette', 'Prototype bench', 'Save to My palettes']) assert.ok(studioHtml.includes(label));
  assert.match(studioHtml, /project-store\.css/);
  assert.match(accountHtml, /My palettes/);
  assert.match(accountHtml, /Choose five colors/);
  for (const html of [accountHtml, studioHtml]) {
    assert.match(html, /autocomplete="one-time-code"/);
    assert.match(html, new RegExp(`pattern="\\[0-9\\]\\{${EMAIL_CODE_LENGTH}\\}"`));
    assert.doesNotMatch(html, /type="password"/);
    assert.match(html, /No password/i);
  }
  assert.match(projectStoreSource, /initEmailCodeFlow/);
  const access = await get('/email-access.js');
  assert.equal(access.status, 200);
  assert.match(await access.text(), new RegExp(`EMAIL_CODE_LENGTH = ${EMAIL_CODE_LENGTH}`));
  const flow = await get('/email-code-flow.js');
  assert.equal(flow.status, 200);
  assert.match(await flow.text(), /verifyEmailCode/);
  const community = await get('/community/');
  assert.match(await community.text(), /public sharing is not open yet/);
  // Assert the current site's required assets, not old cache-version numbers.
  const assets = new Set([...homeHtml.matchAll(/(?:src|href)="(\/[^"\s]+\.(?:js|css)(?:\?[^"\s]*)?)"/g),
    ...studioHtml.matchAll(/(?:src|href)="(\/[^"\s]+\.(?:js|css)(?:\?[^"\s]*)?)"/g),
    ...accountHtml.matchAll(/(?:src|href)="(\/[^"\s]+\.(?:js|css)(?:\?[^"\s]*)?)"/g)].map(match => match[1]));
  await Promise.all([...assets].map(async path => assert.equal((await get(path)).status, 200, `required asset ${path}`)));
}

const analyticsPath = homeHtml.match(/src="(\/analytics\.js(?:\?[^"\s]+)?)"/)?.[1];
const analytics = await get(analyticsPath);
const analyticsSource = await analytics.text();
assert.match(analyticsSource, /G-TJG8M3VE03/);
assert.match(analyticsSource, /send_page_view: false/);
assert.match(analyticsSource, /allow_google_signals: false/);
assert.match(analyticsSource, /allow_ad_personalization_signals: false/);

const authSettingsResponse = await fetch(`${supabaseUrl}/auth/v1/settings`, {
  signal: AbortSignal.timeout(15_000),
  headers: { apikey: publishableKey },
});
assert.equal(authSettingsResponse.status, 200, 'Supabase Auth settings must be readable');
const authSettings = await authSettingsResponse.json();
assert.equal(authSettings.external?.email, true, 'email sign-up must be enabled');
assert.equal(authSettings.disable_signup, false, 'account creation must be enabled');

async function supabaseGet(path, headers = {}) {
  return fetch(`${supabaseUrl}${path}`, { signal: AbortSignal.timeout(15_000), headers: { apikey: publishableKey, ...headers } });
}

const palettes = await supabaseGet('/rest/v1/palettes?select=id', { Prefer: 'count=exact' });
assert.equal(palettes.status, 200, 'published palette catalog must be readable anonymously');
assert.equal(palettes.headers.get('content-range'), '0-99/100', 'published catalog must contain 100 palettes');

const colors = await supabaseGet('/rest/v1/palette_colors?select=palette_id', { Prefer: 'count=exact' });
assert.equal(colors.status, 200, 'palette colors must be readable anonymously');
assert.equal(colors.headers.get('content-range'), '0-499/500', 'catalog must contain five colors per palette');

const projects = await supabaseGet('/rest/v1/projects?select=id&limit=1');
assert.equal(projects.status, 401, 'private projects must reject anonymous reads');

const templates = await supabaseGet('/rest/v1/templates?select=id&limit=1');
assert.equal(templates.status, 401, 'private templates must reject anonymous reads');

const tray = await supabaseGet('/rest/v1/color_tray_items?select=id&limit=1');
assert.equal(tray.status, 401, 'private color tray must reject anonymous reads');

const extractionHistory = await supabaseGet('/rest/v1/extraction_runs?select=id&limit=1');
assert.equal(extractionHistory.status, 401, 'reserved extraction history must reject anonymous reads');

const trayRpc = await fetch(`${supabaseUrl}/rest/v1/rpc/sync_color_tray`, {
  method: 'POST',
  headers: { apikey: publishableKey, 'content-type': 'application/json' },
  body: JSON.stringify({ p_colors: ['#000000'] }),
});
assert.equal(trayRpc.status, 401, 'color tray RPC must reject anonymous writes');

const collectionRpc = await fetch(`${supabaseUrl}/rest/v1/rpc/save_palette_to_collection`, {
  method: 'POST',
  headers: { apikey: publishableKey, 'content-type': 'application/json' },
  body: JSON.stringify({
    p_collection_name: 'Anonymous collection probe',
    p_name: 'Anonymous palette probe',
    p_palette_id: null,
    p_colors: ['#000000', '#111111', '#222222', '#333333', '#444444'],
  }),
});
assert.equal(collectionRpc.status, 401, 'palette collection RPC must reject anonymous writes');

const collectionDeleteRpc = await fetch(`${supabaseUrl}/rest/v1/rpc/delete_saved_palette_item`, {
  method: 'POST',
  headers: { apikey: publishableKey, 'content-type': 'application/json' },
  body: JSON.stringify({ p_item_id: '00000000-0000-4000-8000-000000000000' }),
});
assert.equal(collectionDeleteRpc.status, 401, 'palette collection delete RPC must reject anonymous writes');

const memberPaletteRpc = await fetch(`${supabaseUrl}/rest/v1/rpc/save_member_palette`, {
  method: 'POST',
  headers: { apikey: publishableKey, 'content-type': 'application/json' },
  body: JSON.stringify({
    p_item_id: null,
    p_name: 'Anonymous member palette probe',
    p_collection_name: 'Anonymous probe',
    p_colors: ['#000000', '#111111'],
    p_reference_key: null,
  }),
});
assert.equal(memberPaletteRpc.status, 401, 'member palette RPC must reject anonymous writes');

const workspaceDeleteRpc = await fetch(`${supabaseUrl}/rest/v1/rpc/delete_my_private_workspace`, {
  method: 'POST',
  headers: { apikey: publishableKey, 'content-type': 'application/json' },
});
assert.equal(workspaceDeleteRpc.status, 401, 'private workspace deletion must reject anonymous writes');

const prototypeRpc = await fetch(`${supabaseUrl}/rest/v1/rpc/save_project_prototype`, {
  method: 'POST',
  headers: { apikey: publishableKey, 'content-type': 'application/json' },
  body: JSON.stringify({
    p_project_id: null,
    p_variant_key: 'baseline',
    p_project_name: 'Anonymous prototype probe',
    p_version_name: 'Prototype 1',
    p_context_type: 'custom',
    p_source_palette_id: null,
    p_colors: ['#000000', '#111111', '#222222', '#333333', '#444444'],
    p_roles: {},
    p_editor_state: {},
    p_parent_version_id: null,
    p_lock: true,
  }),
});
assert.equal(prototypeRpc.status, 401, 'prototype RPC must reject anonymous writes');

const templateDeleteRpc = await fetch(`${supabaseUrl}/rest/v1/rpc/delete_template`, {
  method: 'POST',
  headers: { apikey: publishableKey, 'content-type': 'application/json' },
  body: JSON.stringify({ p_template_id: '00000000-0000-4000-8000-000000000000' }),
});
assert.equal(templateDeleteRpc.status, 401, 'template delete RPC must reject anonymous writes');

const projectArchiveRpc = await fetch(`${supabaseUrl}/rest/v1/rpc/archive_project`, {
  method: 'POST',
  headers: { apikey: publishableKey, 'content-type': 'application/json' },
  body: JSON.stringify({ p_project_id: '00000000-0000-4000-8000-000000000000' }),
});
assert.equal(projectArchiveRpc.status, 401, 'project archive RPC must reject anonymous writes');

const projectRestoreRpc = await fetch(`${supabaseUrl}/rest/v1/rpc/restore_project`, {
  method: 'POST',
  headers: { apikey: publishableKey, 'content-type': 'application/json' },
  body: JSON.stringify({ p_project_id: '00000000-0000-4000-8000-000000000000' }),
});
assert.equal(projectRestoreRpc.status, 401, 'project restore RPC must reject anonymous writes');

const templateRpc = await fetch(`${supabaseUrl}/rest/v1/rpc/save_template_snapshot`, {
  method: 'POST',
  headers: { apikey: publishableKey, 'content-type': 'application/json' },
  body: JSON.stringify({
    p_template_id: null,
    p_name: 'Anonymous template probe',
    p_context_type: 'custom',
    p_source_project_id: null,
    p_colors: ['#000000', '#111111', '#222222', '#333333', '#444444'],
    p_roles: {},
    p_defaults: {},
  }),
});
assert.equal(templateRpc.status, 401, 'template snapshot RPC must reject anonymous writes');

const rpc = await fetch(`${supabaseUrl}/rest/v1/rpc/save_project_snapshot`, {
  method: 'POST',
  headers: { apikey: publishableKey, 'content-type': 'application/json' },
  body: JSON.stringify({
    p_project_id: null,
    p_name: 'Anonymous probe',
    p_context_type: 'custom',
    p_source_palette_id: null,
    p_colors: ['#000000', '#111111', '#222222', '#333333', '#444444'],
    p_roles: {},
    p_editor_state: {},
  }),
});
assert.equal(rpc.status, 401, 'snapshot RPC must reject anonymous writes');

console.log(`${candidate ? 'Release candidate' : 'Live infrastructure'} checks passed for ${base}. Real inbox authentication is a separate release gate.`);
