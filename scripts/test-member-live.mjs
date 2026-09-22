// Explicit integration test against the approved shared backend. Creates only
// tagged disposable users; removes their cascading workspace data in finally.
// Never log API keys, bearer tokens or passwords.
import assert from 'node:assert/strict';
import { execFileSync } from 'node:child_process';
import { randomUUID, randomBytes } from 'node:crypto';
import { createClient } from '@supabase/supabase-js';
import { productionAccount } from '../dist/account-config.js';

const keys = JSON.parse(execFileSync('npx', ['--no-install', 'supabase', 'projects', 'api-keys', '--project-ref', 'ayzymeogptrqtouwnahh', '--output-format', 'json'], { encoding: 'utf8' })).keys;
// Supabase's newer `sb_secret_…` key works for PostgREST but GoTrue's admin
// endpoint currently expects the legacy service-role JWT. Prefer that key so
// the disposable auth-user checks exercise the real browser login flow.
const key = keys.find(item => item.name === 'service_role')?.api_key || keys.find(item => item.type === 'secret')?.api_key;
assert.ok(key, 'A server-only test credential is required');
const options = { auth: { persistSession: false, autoRefreshToken: false } };
const admin = createClient(productionAccount.url, key, options);
const cleanupIndex = process.argv.indexOf('--cleanup-test-user');
if (cleanupIndex >= 0) {
  const id = process.argv[cleanupIndex + 1];
  const { data, error } = await admin.auth.admin.getUserById(id);
  assert.ifError(error); assert.equal(data.user.app_metadata.colorverse_membership_qa, true);
  const result = await admin.auth.admin.deleteUser(id); assert.ifError(result.error);
  console.log('Disposable test user and its test workspace removed.');
  process.exit(0);
}
const keep = process.argv.includes('--keep-browser-user');
if (keep) assert.ok(process.env.COLORVERSE_TEST_PASSWORD?.length >= 12, 'Use a disposable browser-test password');
const created = [];
try {
  const clients = [];
  for (let index = 0; index < 2; index++) {
    const email = `colorverse-qa-${randomUUID()}@example.com`;
    const password = index === 0 && keep ? process.env.COLORVERSE_TEST_PASSWORD : randomBytes(28).toString('base64url');
    const { data, error } = await admin.auth.admin.createUser({ email, password, email_confirm: true, app_metadata: { colorverse_membership_qa: true } });
    assert.ifError(error); created.push(data.user);
    const client = createClient(productionAccount.url, productionAccount.key, options);
    const result = await client.auth.signInWithPassword({ email, password }); assert.ifError(result.error); clients.push(client);
  }
  const [owner, other] = clients;
  const colors = ['#F1ECE4','#C9C5B6','#75826F','#AC7760','#303936','#D6BA85','#596C80','#C79589','#ABBBB1','#4A434C'];
  const args = { p_item_id: null, p_name: 'Membership QA · ten colors', p_collection_name: 'QA collection', p_colors: colors, p_reference_key: 'skincare-system-01' };
  const { data: id, error: saveError } = await owner.rpc('save_member_palette', args); assert.ifError(saveError); assert.ok(id);
  const own = await owner.from('saved_palette_items').select('id,colors,source_metadata,collections(name)').eq('id', id).single();
  assert.ifError(own.error); assert.equal(own.data.colors.length, 10); assert.equal(own.data.source_metadata.reference_key, 'skincare-system-01');
  const foreign = await other.from('saved_palette_items').select('id').eq('id', id); assert.ifError(foreign.error); assert.equal(foreign.data.length, 0);
  assert.ok((await other.rpc('save_member_palette', { ...args, p_item_id: id })).error, 'Cross-user edit must fail');
  assert.ok((await other.rpc('delete_saved_palette_item', { p_item_id: id })).error, 'Cross-user delete must fail');
  assert.ok((await owner.from('saved_palette_items').update({ name: 'bypass' }).eq('id', id)).error, 'Direct browser writes must fail');
  for (const invalid of [null, {}, [null, '#FFFFFF'], ['red', '#FFFFFF'], ['#FFFFFF'], Array(25).fill('#FFFFFF')]) {
    assert.ok((await owner.rpc('save_member_palette', { ...args, p_colors: invalid })).error, 'Invalid input must be rejected');
  }
  assert.ok((await owner.rpc('save_member_palette', { ...args, p_reference_key: 'https://example.com/image.jpg' })).error);
  const updated = await owner.rpc('save_member_palette', { ...args, p_item_id: id, p_name: 'Ten colors · saved privately' }); assert.ifError(updated.error); assert.equal(updated.data, id);
  for (let index = 0; index < 25; index++) {
    const result = await owner.rpc('save_member_palette', { ...args, p_name: `Direction ${index + 1}`, p_colors: colors.slice(0, index % 2 ? 8 : 5), p_reference_key: null }); assert.ifError(result.error);
  }
  const first = await owner.from('saved_palette_items').select('id').order('created_at', { ascending: false }).order('id', { ascending: false }).range(0, 23);
  const second = await owner.from('saved_palette_items').select('id').order('created_at', { ascending: false }).order('id', { ascending: false }).range(24, 47);
  assert.ifError(first.error); assert.ifError(second.error); assert.equal(first.data.length,24); assert.equal(second.data.length,2);
  assert.equal(new Set([...first.data,...second.data].map(item=>item.id)).size,26);
  const anon = createClient(productionAccount.url, productionAccount.key, options);
  assert.ok((await anon.rpc('save_member_palette',args)).error, 'Anonymous save must fail');
  assert.ok((await anon.from('saved_palette_items').select('id')).error, 'Anonymous read must fail');
  const deleted = await owner.rpc('delete_saved_palette_item', {p_item_id:id}); assert.ifError(deleted.error);
  const after = await owner.from('saved_palette_items').select('id').eq('id',id); assert.deepEqual(after.data,[]);
  console.log('PASS: password login, 5/8/10-color save/read/update/delete, reference retention, pagination, anonymous rejection, cross-user read/edit/delete rejection, direct-write rejection and malformed input checks.');
  if (keep) { const user = created.shift(); console.log(JSON.stringify({ browserTestUser: user.id, email: user.email })); }
} finally {
  for (const user of created) {
    const result = await admin.auth.admin.deleteUser(user.id);
    if (result.error) console.error(`Cleanup required for tagged test user ${user.id}`);
  }
}
