import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import test from 'node:test';

const migrationUrl = new URL('../supabase/migrations/20260911000000_initial_colorverse_schema.sql', import.meta.url);
const sql = await readFile(migrationUrl, 'utf8');
const rpcUrl = new URL('../supabase/migrations/20260919000100_project_snapshot_rpc.sql', import.meta.url);
const rpc = await readFile(rpcUrl, 'utf8');

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
