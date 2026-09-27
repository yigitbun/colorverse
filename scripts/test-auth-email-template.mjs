import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import path from 'node:path';

const dir = path.dirname(fileURLToPath(import.meta.url));
const html = readFileSync(
  path.join(dir, '..', 'supabase', 'email-templates', 'sign-in-code.html'),
  'utf8',
);
const text = readFileSync(
  path.join(dir, '..', 'supabase', 'email-templates', 'sign-in-code.txt'),
  'utf8',
);

test('HTML template contains exactly one contiguous {{ .Token }} placeholder', () => {
  const matches = html.match(/\{\{\s*\.Token\s*\}\}/g) ?? [];
  assert.equal(matches.length, 1);
  assert.ok(html.includes('{{ .Token }}'));
});

test('plain-text companion contains the {{ .Token }} placeholder', () => {
  assert.ok(text.includes('{{ .Token }}'));
});

test('HTML template has no sign-in link or link-based auth variables', () => {
  assert.ok(!html.includes('ConfirmationURL'));
  assert.ok(!html.includes('TokenHash'));
  assert.ok(!/<a\b[^>]*href=["']\{\{/i.test(html));
});

test('HTML template has no scripts, forms, or tracking/remote resources', () => {
  assert.ok(!/<script/i.test(html));
  assert.ok(!/<form/i.test(html));
  assert.ok(!/<img\b/i.test(html));
  assert.ok(!/<link\b/i.test(html));
  assert.ok(!/@import/i.test(html));
});

test('HTML template only links to the real ColorVerse privacy page', () => {
  const hrefs = [...html.matchAll(/href=["']([^"']+)["']/gi)].map((m) => m[1]);
  assert.ok(hrefs.length > 0);
  for (const href of hrefs) {
    assert.equal(href, 'https://colorverse.byigit.dev/privacy/');
  }
});

test('HTML template mentions one-time use and one-hour expiry', () => {
  assert.match(html, /one-time/i);
  assert.match(html, /one hour/i);
});

test('plain-text companion mentions one-time use and one-hour expiry, with no HTML tags', () => {
  assert.match(text, /one-time/i);
  assert.match(text, /one hour/i);
  assert.ok(!/<[a-z][\s\S]*>/i.test(text));
});

test('HTML and plain-text templates tell an unrequested recipient to ignore the email', () => {
  assert.match(html, /didn.t request it[\s\S]*?ignore this email/i);
  assert.match(text, /didn.t request it[\s\S]*?ignore this email/i);
});

test('the hidden preheader is hidden from Outlook desktop as well as other clients', () => {
  const preheader = html.match(/<div style="([^"]*)">\s*Your ColorVerse sign-in code is ready\.[\s\S]*?<\/div>/);
  assert.ok(preheader, 'preheader div not found');
  assert.match(preheader[1], /display:\s*none/);
  assert.match(preheader[1], /mso-hide:\s*all/);
});

test('core layout relies on inline styles, not the head stylesheet, for the wordmark, code and label', () => {
  const withoutHead = html.replace(/<style>[\s\S]*?<\/style>/g, '');
  assert.ok(!/<style>/.test(withoutHead));
  assert.match(withoutHead, /class="cv-word"[^>]*style="[^"]*font-size:22px/);
  assert.match(withoutHead, /class="cv-code"[^>]*style="[^"]*letter-spacing:\.3em/);
  assert.match(withoutHead, /text-transform:uppercase[^>]*>\s*Sign-in code/);
});
