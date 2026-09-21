import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import test from 'node:test';

const migrationUrl = new URL('../supabase/migrations/20260911000000_initial_colorverse_schema.sql', import.meta.url);
const sql = await readFile(migrationUrl, 'utf8');
const rpcUrl = new URL('../supabase/migrations/20260919000100_project_snapshot_rpc.sql', import.meta.url);
const rpc = await readFile(rpcUrl, 'utf8');
const paletteSyncUrl = new URL('../supabase/migrations/20260919000200_sync_palette_library.sql', import.meta.url);
const paletteSync = await readFile(paletteSyncUrl, 'utf8');
const templateRpcUrl = new URL('../supabase/migrations/20260921000100_template_snapshot_rpc.sql', import.meta.url);
const templateRpc = await readFile(templateRpcUrl, 'utf8');
const trayRpcUrl = new URL('../supabase/migrations/20260921000200_sync_color_tray.sql', import.meta.url);
const trayRpc = await readFile(trayRpcUrl, 'utf8');
const lifecycleRpcUrl = new URL('../supabase/migrations/20260921000300_template_lifecycle_rpc.sql', import.meta.url);
const lifecycleRpc = await readFile(lifecycleRpcUrl, 'utf8');

const privateTables = [
  'projects',
  'project_versions',
  'templates',
  'collections',
  'saved_palette_items',
  'extraction_runs',
];

test('every private MVP table enables row level security', () => {
  for (const table of privateTables) {
    assert.match(sql, new RegExp(`alter table public\\.${table} enable row level security;`));
  }
});

test('anonymous access is revoked from every private table', () => {
  for (const table of privateTables) {
    assert.match(sql, new RegExp(`revoke all on table public\\.${table} from anon, authenticated;`));
  }
  assert.doesNotMatch(sql, /grant\s+(?:insert|update|delete|all)[^;]*\bto\s+anon\b/i);
});

test('private policies are scoped to authenticated owners', () => {
  assert.match(sql, /on public\.projects for select\s+to authenticated/i);
  assert.match(sql, /projects\.user_id = \(select auth\.uid\(\)\)/i);
  assert.match(sql, /on public\.project_versions for insert\s+to authenticated/i);
  assert.match(sql, /on public\.templates for all\s+to authenticated/i);
  assert.match(sql, /on public\.saved_palette_items for all\s+to authenticated/i);
});

test('the MVP has no public upload or community write table', () => {
  assert.doesNotMatch(sql, /create table public\.(?:uploads|comments|votes|community_posts)\b/i);
});

test('project snapshots always contain five colors', () => {
  const checks = sql.match(/jsonb_array_length\(colors\) = 5/g) || [];
  assert.ok(checks.length >= 3, 'versions, templates, and saved items should require five colors');
});

test('functions use an explicit empty search path', () => {
  assert.match(sql, /security invoker\s+set search_path = ''/i);
  assert.match(rpc, /security invoker\s+set search_path = ''/i);
});

test('project saving is atomic and unavailable to anonymous visitors', () => {
  assert.match(rpc, /create or replace function public\.save_project_snapshot/i);
  assert.match(rpc, /insert into public\.projects/i);
  assert.match(rpc, /insert into public\.project_versions/i);
  assert.match(rpc, /revoke all on function public\.save_project_snapshot[^;]+from public, anon/i);
  assert.match(rpc, /grant execute on function public\.save_project_snapshot[^;]+to authenticated/i);
});

test('the hosted catalog migration contains all 100 palettes and five role colors each', () => {
  assert.match(paletteSync, /-- palette-count: 100/);
  assert.equal((paletteSync.match(/^  \('[^']+', \d, '(?:background|surface|primary|accent|text)', '#[0-9A-F]{6}'\)/gm) || []).length, 500);
});

test('the current snapshot function validates every browser-controlled structure', () => {
  assert.match(paletteSync, /p_context_type not in \('custom', 'website', 'slides', 'social', 'shop', 'brand', 'roomkit', 'editorial'\)/i);
  assert.match(paletteSync, /color\.value !~ '\^#\[0-9A-Fa-f\]\{6\}\$'/i);
  assert.match(paletteSync, /octet_length\(p_roles::text\) > 4096/i);
  assert.match(paletteSync, /octet_length\(p_editor_state::text\) > 16384/i);
  assert.match(paletteSync, /palettes\.id = p_source_palette_id and palettes\.is_published = true/i);
  assert.match(paletteSync, /security definer\s+set search_path = ''/i);
  assert.match(paletteSync, /revoke all on function public\.save_project_snapshot[^;]+from public, anon/i);
});

test('project mutations are available only through the validated snapshot RPC', () => {
  assert.match(paletteSync, /revoke insert, update, delete on table public\.projects, public\.project_versions from authenticated/i);
  assert.match(paletteSync, /grant select on table public\.projects, public\.project_versions to authenticated/i);
  assert.doesNotMatch(paletteSync, /p_user_id/i);
  assert.match(paletteSync, /values \(\(select auth\.uid\(\)\), trim\(p_name\)/i);
  assert.match(paletteSync, /where id = p_project_id and user_id = \(select auth\.uid\(\)\)/i);
});

test('template saves are validated and private', () => {
  assert.match(templateRpc, /create or replace function public\.save_template_snapshot/i);
  assert.match(templateRpc, /p_context_type not in \('custom', 'website', 'slides', 'social', 'shop', 'brand', 'roomkit', 'editorial'\)/i);
  assert.match(templateRpc, /jsonb_array_length\(p_colors\) <> 5/i);
  assert.match(templateRpc, /color\.value !~ '\^#\[0-9A-Fa-f\]\{6\}\$'/i);
  assert.match(templateRpc, /projects\.user_id = \(select auth\.uid\(\)\)/i);
  assert.match(templateRpc, /revoke insert, update, delete on table public\.templates from authenticated/i);
  assert.match(templateRpc, /grant execute on function public\.save_template_snapshot[^;]+to authenticated/i);
});

test('color tray sync stores only bounded private HEX values', () => {
  assert.match(trayRpc, /create table public\.color_tray_items/i);
  assert.match(trayRpc, /alter table public\.color_tray_items enable row level security/i);
  assert.match(trayRpc, /revoke all on table public\.color_tray_items from anon, authenticated/i);
  assert.match(trayRpc, /create policy "Owners read color tray"/i);
  assert.match(trayRpc, /hex text not null check \(hex ~ '\^#\[0-9A-Fa-f\]\{6\}\$'\)/i);
  assert.match(trayRpc, /position between 1 and 18/i);
  assert.match(trayRpc, /jsonb_array_length\(coalesce\(p_colors, '\[\]'::jsonb\)\) > 18/i);
  assert.match(trayRpc, /delete from public\.color_tray_items where user_id = v_user_id/i);
  assert.match(trayRpc, /revoke all on function public\.sync_color_tray\(jsonb\) from public, anon/i);
  assert.match(trayRpc, /grant execute on function public\.sync_color_tray\(jsonb\) to authenticated/i);
});

test('template lifecycle mutations remain owner-scoped RPCs', () => {
  assert.match(lifecycleRpc, /create or replace function public\.rename_template\(p_template_id uuid, p_name text\)/i);
  assert.match(lifecycleRpc, /create or replace function public\.delete_template\(p_template_id uuid\)/i);
  assert.match(lifecycleRpc, /where id = p_template_id and user_id = \(select auth\.uid\(\)\)/i);
  assert.match(lifecycleRpc, /revoke all on function public\.rename_template\(uuid, text\) from public, anon/i);
  assert.match(lifecycleRpc, /grant execute on function public\.rename_template\(uuid, text\) to authenticated/i);
  assert.match(lifecycleRpc, /revoke all on function public\.delete_template\(uuid\) from public, anon/i);
  assert.match(lifecycleRpc, /grant execute on function public\.delete_template\(uuid\) to authenticated/i);
});
