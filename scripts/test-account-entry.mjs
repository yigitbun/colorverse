import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { normalizeAccountEmail, normalizeEmailCode, requestEmailAccess, verifyEmailCode, EMAIL_CODE_LENGTH, EMAIL_RESEND_DELAY } from '../dist/email-access.js';
import { initEmailCodeFlow } from '../dist/email-code-flow.js';

function harness(t, auth = {}) {
  const element = () => ({ value: '', hidden: false, disabled: false, events: {}, textContent: '', focus() {}, reportValidity: () => true,
    classList: { add() {}, remove() {} }, addEventListener(name, fn) { this.events[name] = fn; } });
  const names = ['root','emailForm','email','send','codePanel','codeForm','code','verify','sentEmail','resend','changeEmail'];
  const ui = Object.fromEntries(names.map(name => [name, element()]));
  ui.codePanel.hidden = true;
  const calls = [], statuses = [], sessions = [];
  const client = { auth: {
    signInWithOtp: async args => { calls.push(args); return { error: null }; },
    verifyOtp: async args => { calls.push(args); return { data: { session: { user: { id: 'fixture' } } }, error: null }; },
    ...auth,
  } };
  const flow = initEmailCodeFlow({ ...ui, getClient: async () => client,
    status: (text, kind) => statuses.push({ text, kind }), onAuthenticated: session => sessions.push(session) });
  t.after(() => flow.stop());
  return { ...ui, flow, calls, statuses, sessions,
    event: (name, event, extra = {}) => ui[name].events[event]?.({ preventDefault() {}, ...extra }),
    async request() { ui.email.value = ' preview@example.invalid '; await ui.emailForm.events.submit({ preventDefault() {} }); },
  };
}

test('email and eight-digit codes are bounded and preserve leading zeroes', () => {
  assert.equal(normalizeAccountEmail(' a@example.com '), 'a@example.com');
  for (const email of ['', 'a@b', 'a b@example.com', 'x'.repeat(255)+'@example.com']) assert.throws(() => normalizeAccountEmail(email));
  assert.equal(EMAIL_CODE_LENGTH, 8); assert.equal(EMAIL_RESEND_DELAY, 60000);
  assert.equal(normalizeEmailCode('0123 4567'), '01234567');
  for (const code of ['', '123456', '123456789', '1234abcd']) assert.throws(() => normalizeEmailCode(code));
});
test('new and returning members use the same OTP request and email verification', async () => {
  const calls = [];
  const client = { auth: { signInWithOtp: async args => calls.push(args), verifyOtp: async args => calls.push(args) } };
  await requestEmailAccess(client, ' a@example.com ');
  await verifyEmailCode(client, ' a@example.com ', '0123 4567');
  assert.deepEqual(calls, [ { email: 'a@example.com', options: { shouldCreateUser: true } },
    { email: 'a@example.com', token: '01234567', type: 'email' } ]);
});
test('accepted requests reveal code entry but do not claim authentication', async t => {
  const ui = harness(t);
  assert.equal(ui.send.disabled, true); assert.equal(ui.codePanel.hidden, true);
  await ui.request();
  assert.equal(ui.emailForm.hidden, true); assert.equal(ui.codePanel.hidden, false);
  assert.equal(ui.sentEmail.textContent, 'preview@example.invalid');
  assert.equal(ui.verify.disabled, true); assert.equal(ui.resend.disabled, true);
  assert.equal(ui.sessions.length, 0);
});
test('send failure does not show misleading inbox confirmation', async t => {
  const ui = harness(t, { signInWithOtp: async () => ({ error: { status: 429 } }) });
  await ui.request();
  assert.equal(ui.emailForm.hidden, false); assert.equal(ui.codePanel.hidden, true);
  assert.match(ui.statuses.at(-1).text, /Too many attempts/);
});
test('wrong or expired code retains verification stage', async t => {
  const ui = harness(t, { verifyOtp: async () => ({ error: { code: 'otp_expired' } }) });
  await ui.request(); ui.code.value = '12345678'; await ui.event('codeForm', 'submit');
  assert.equal(ui.codePanel.hidden, false); assert.equal(ui.sessions.length, 0);
  assert.match(ui.statuses.at(-1).text, /incorrect or expired/);
});
test('verification requires a session and clears the code', async t => {
  const ui = harness(t); await ui.request();
  let prevented = false;
  await ui.event('code', 'paste', { clipboardData: { getData: () => '0123 4567' }, preventDefault: () => { prevented = true; } });
  assert.equal(prevented, true); assert.equal(ui.code.value, '01234567'); assert.equal(ui.verify.disabled, false);
  await ui.event('codeForm', 'submit');
  assert.equal(ui.sessions.length, 1); assert.equal(ui.code.value, '');
  assert.deepEqual(ui.calls.at(-1), { email: 'preview@example.invalid', token: '01234567', type: 'email' });
});
test('a response without a session is not presented as signed in', async t => {
  const ui = harness(t, { verifyOtp: async () => ({ data: { session: null }, error: null }) });
  await ui.request(); ui.code.value = '12345678'; await ui.event('codeForm', 'submit');
  assert.equal(ui.sessions.length, 0); assert.equal(ui.statuses.at(-1).kind, 'error');
});
test('resend and changing email cannot bypass cooldown', async t => {
  const ui = harness(t); await ui.request();
  await ui.event('resend', 'click'); assert.equal(ui.calls.length, 1);
  ui.code.value = '12345678'; await ui.event('changeEmail', 'click');
  assert.equal(ui.code.value, ''); assert.equal(ui.codePanel.hidden, true);
  await ui.request(); assert.equal(ui.calls.length, 1);
  assert.match(ui.statuses.at(-1).text, /wait a minute/);
});
test('concurrent submits send only one request', async t => {
  let release, count = 0;
  const ui = harness(t, { signInWithOtp: () => { count++; return new Promise(resolve => { release = resolve; }); } });
  const pending = ui.request(); await new Promise(resolve => setImmediate(resolve));
  await ui.request(); assert.equal(count, 1);
  release({ error: null }); await pending;
});
test('Account and Studio share passwordless controller and code template', () => {
  for (const page of ['account/index.html', 'studio/index.html']) {
    const html = readFileSync(new URL(`../dist/${page}`, import.meta.url), 'utf8');
    assert.match(html, /autocomplete="one-time-code"/); assert.doesNotMatch(html, /type="password"/);
  }
  for (const file of ['account.js', 'project-store.js']) {
    const js = readFileSync(new URL(`../dist/${file}`, import.meta.url), 'utf8');
    assert.match(js, /initEmailCodeFlow/); assert.doesNotMatch(js, /signInWithPassword|requestPasswordAccess|resetPasswordForEmail/);
  }
  const template = readFileSync(new URL('../supabase/email-templates/sign-in-code.html', import.meta.url), 'utf8');
  assert.match(template, /\{\{ \.Token \}\}/); assert.doesNotMatch(template, /ConfirmationURL/);
});
