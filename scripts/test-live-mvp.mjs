import assert from 'node:assert/strict';

const base = (process.env.COLORVERSE_LIVE_URL || 'https://colorverse.byigit.dev').replace(/\/$/, '');
const supabaseUrl = 'https://ayzymeogptrqtouwnahh.supabase.co';
const publishableKey = 'sb_publishable_TY49mfQAzRXvIWjlXKi9Ow_gTCaGid_';
const publicRoutes = ['/', '/explore/', '/extract/', '/studio/', '/inspiration/', '/community/', '/lab/', '/about/', '/privacy/'];

async function get(path, options = {}) {
  return fetch(`${base}${path}`, options);
}

const home = await get('/');
assert.equal(home.status, 200, 'production home must be reachable');
for (const header of ['content-security-policy', 'strict-transport-security', 'x-frame-options', 'x-content-type-options', 'permissions-policy', 'referrer-policy']) {
  assert.ok(home.headers.get(header), `production must send ${header}`);
}

const homeHtml = await home.text();
assert.match(homeHtml, /app\.js\?v=49/);
assert.match(homeHtml, /analytics\.js\?v=4/);

for (const route of publicRoutes.slice(1)) {
  const response = await get(route);
  assert.equal(response.status, 200, `public route ${route} must be reachable`);
  const html = await response.text();
  assert.doesNotMatch(html, /chatgpt\.site|Sign in to ChatGPT/i, `public route ${route} must not be a ChatGPT Sites gate`);
}

const inspiration = await get('/inspiration/');
assert.equal(inspiration.status, 200, 'inspiration page must be reachable');
const inspirationHtml = await inspiration.text();
assert.match(inspirationHtml, /drift-field-01-colorways-v1\.png/);
assert.match(inspirationHtml, /One runner\.<br>Three directions\./);

const studio = await get('/studio/');
assert.equal(studio.status, 200, 'studio page must be reachable');
const studioHtml = await studio.text();
assert.match(studioHtml, /app\.js\?v=58/);
assert.match(studioHtml, /studio-editor\.css\?v=7/);
assert.match(studioHtml, /context-kits\.css\?v=5/);
assert.match(studioHtml, /data-context="landing"[^>]*>Product/);
assert.match(studioHtml, /data-context="interface"[^>]*>Interface/);
assert.match(studioHtml, /data-context="presentation"[^>]*>Report/);
assert.doesNotMatch(studioHtml, /data-context="(?:social|shop|material)"/);
assert.doesNotMatch(studioHtml, /shadeStudio|openShadeStudio|shade-studio\.css/);
assert.match(studioHtml, /Private workspace/);
assert.match(studioHtml, /Email me a sign-in link/);
assert.match(studioHtml, /Palette collections/);
assert.match(studioHtml, /Save palette/);
assert.match(studioHtml, /Prototype bench/);
assert.match(studioHtml, /project-store\.css\?v=5/);

const analytics = await get('/analytics.js?v=4');
const analyticsSource = await analytics.text();
assert.match(analyticsSource, /G-TJG8M3VE03/);
assert.match(analyticsSource, /send_page_view: false/);
assert.match(analyticsSource, /allow_google_signals: false/);
assert.match(analyticsSource, /allow_ad_personalization_signals: false/);

const authSettingsResponse = await fetch(`${supabaseUrl}/auth/v1/settings`, {
  headers: { apikey: publishableKey },
});
assert.equal(authSettingsResponse.status, 200, 'Supabase Auth settings must be readable');
const authSettings = await authSettingsResponse.json();
assert.equal(authSettings.external?.email, true, 'email sign-up must be enabled');
assert.equal(authSettings.disable_signup, false, 'account creation must be enabled');

async function supabaseGet(path, headers = {}) {
  return fetch(`${supabaseUrl}${path}`, { headers: { apikey: publishableKey, ...headers } });
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

console.log(`Live MVP checks passed for ${base}`);
