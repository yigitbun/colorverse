import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { normalizeHex, validColors, sanitizeDraft, readDraft, studioColors } from '../dist/member-palette.js';
import { accountConfig } from '../dist/account-config.js';
const color = '#AABBCC';

test('personal palettes accept 2–24 HEX colors including 5/8/10', () => {
  for (const count of [2, 5, 8, 10, 24]) assert.equal(validColors(Array(count).fill(color)), true);
  for (const bad of [null, {}, [], [color], Array(25).fill(color), ['red',color], [null,color], [123,color]]) assert.equal(validColors(bad), false);
  assert.equal(normalizeHex(' aabbcc '), color);
  assert.equal(normalizeHex('#abc'), null);
});
test('drafts are bounded and cannot carry arbitrary image or callback URLs', () => {
  const draft = sanitizeDraft({colors:Array(8).fill(color), name:'x'.repeat(130), image:'https://evil.example', referenceKey:'https://evil.example'});
  assert.equal(draft.name.length, 120); assert.equal(draft.referenceKey, null); assert.equal(draft.image, undefined);
  assert.equal(readDraft({getItem:()=>'{broken'}), null);
});
test('Studio uses exactly five explicit distinct positions without changing the saved palette', () => {
  const colors = Array.from({length:10},(_,i)=>`#00000${i}`);
  assert.deepEqual(studioColors(colors,[4,3,2,1,0]), colors.slice(0,5).reverse());
  assert.equal(colors.length,10);
  for (const indices of [[0,0,1,2,3],[0,1,2,3,10],[0,1,2,3,-1],[0,1,2,3],null]) assert.equal(studioColors(colors,indices),null);
});
test('only approved origins connect to the account database', () => {
  assert.ok(accountConfig('colorverse.byigit.dev')); assert.ok(accountConfig('dev.colorverse.byigit.dev'));
  assert.equal(accountConfig('dev.colorverse-85o.pages.dev'),null);
  assert.equal(accountConfig('colorverse-dev.pages.dev'),null);
  assert.equal(accountConfig('random.colorverse-85o.pages.dev'),null); assert.equal(accountConfig('evil.example'),null);
});
test('membership RPC validates every value and scopes edits to the authenticated owner', () => {
  const sql = readFileSync(new URL('../supabase/migrations/20260922000100_member_palettes.sql',import.meta.url),'utf8');
  assert.match(sql,/v_user_id is null/); assert.match(sql,/p_colors is null/); assert.match(sql,/jsonb_typeof\(color.value\) <> 'string'/);
  assert.match(sql,/collection.user_id = v_user_id/); assert.match(sql,/for update of item/);
  assert.match(sql,/revoke all on function[^;]+from public, anon/); assert.match(sql,/set search_path = ''/);
  assert.doesNotMatch(sql,/delete from|drop table|truncate/i);
});
test('account page is CSP-safe and private library is not indexed', () => {
  const html = readFileSync(new URL('../dist/account/index.html',import.meta.url),'utf8');
  assert.match(html,/noindex,nofollow/); assert.match(html,/autocomplete="current-password"/);
  assert.doesNotMatch(html,/<script(?![^>]*\bsrc=)[^>]*>|\son[a-z]+\s*=/i);
});
