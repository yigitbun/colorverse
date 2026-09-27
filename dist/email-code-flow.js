import { normalizeAccountEmail, normalizeEmailCode, requestEmailAccess, verifyEmailCode, emailAccessMessage, EMAIL_RESEND_DELAY, EMAIL_CODE_LENGTH } from './email-access.js?v=3';

// The same email -> code controller is used on Account and inside Studio.
// Codes stay only in the input: never URL, analytics, storage, or console.
export function initEmailCodeFlow({ root, emailForm, email, send, codePanel, codeForm, code, verify, sentEmail, resend, changeEmail, getClient, status, onAuthenticated = () => {} }) {
  let busy = false, address = '', cooldownUntil = 0, timer;
  code.maxLength = EMAIL_CODE_LENGTH;
  code.minLength = EMAIL_CODE_LENGTH;
  code.pattern = `[0-9]{${EMAIL_CODE_LENGTH}}`;

  function update() {
    let validEmail = false, validCode = false;
    try { normalizeAccountEmail(email.value); validEmail = true; } catch {}
    try { normalizeEmailCode(code.value); validCode = true; } catch {}
    send.disabled = busy || !validEmail;
    verify.disabled = busy || !validCode;
    changeEmail.disabled = busy;
    email.readOnly = busy;
    code.readOnly = busy;
    const seconds = Math.max(0, Math.ceil((cooldownUntil - Date.now()) / 1000));
    resend.disabled = busy || seconds > 0;
    resend.textContent = seconds ? `Resend in ${seconds}s` : 'Resend code';
    if (!seconds && timer) { clearInterval(timer); timer = undefined; }
  }

  function showCode() {
    emailForm.hidden = true;
    codePanel.hidden = false;
    root.classList.add('email-requested');
    sentEmail.textContent = address;
    code.value = '';
    update();
    code.focus();
  }

  async function request(target) {
    if (busy) return;
    if (Date.now() < cooldownUntil) { status('Please wait a minute before requesting another code.', 'error'); return; }
    busy = true; update(); status('Sending your sign-in code…');
    try {
      const client = await getClient();
      const result = await requestEmailAccess(client, target);
      if (result.error) throw result.error;
      globalThis.window?.colorverseTrack?.('account_access', { step: 'requested' });
      address = normalizeAccountEmail(target);
      cooldownUntil = Date.now() + EMAIL_RESEND_DELAY;
      clearInterval(timer); timer = setInterval(update, 1000);
      showCode(); status('');
    } catch (error) { status(emailAccessMessage(error), 'error'); }
    finally { busy = false; update(); if (!codePanel.hidden) code.focus(); }
  }

  email.addEventListener('input', update);
  code.addEventListener('input', () => { code.value = code.value.replace(/\s/g, ''); update(); });
  code.addEventListener('paste', event => {
    const pasted = event.clipboardData?.getData('text');
    if (!pasted) return;
    try { const token = normalizeEmailCode(pasted); event.preventDefault(); code.value = token; update(); } catch {}
  });
  emailForm.addEventListener('submit', async event => {
    event.preventDefault();
    if (!emailForm.reportValidity()) return;
    try { await request(normalizeAccountEmail(email.value)); }
    catch { status('Enter a valid email address.', 'error'); }
  });
  resend.addEventListener('click', () => { if (address && !busy && Date.now() >= cooldownUntil) return request(address); });
  changeEmail.addEventListener('click', () => {
    if (busy) return;
    code.value = ''; address = '';
    emailForm.hidden = false; codePanel.hidden = true;
    root.classList.remove('email-requested'); status(''); update(); email.focus();
  });
  codeForm.addEventListener('submit', async event => {
    event.preventDefault();
    if (busy || !address || !codeForm.reportValidity()) return;
    let token;
    try { token = normalizeEmailCode(code.value); }
    catch { status(`Enter the ${EMAIL_CODE_LENGTH}-digit code from your email.`, 'error'); return; }
    busy = true; update(); status('Verifying your code…');
    try {
      const client = await getClient();
      const result = await verifyEmailCode(client, address, token);
      if (result.error) throw result.error;
      if (!result.data?.session?.user) throw new Error('No authenticated session.');
      globalThis.window?.colorverseTrack?.('account_access', { step: 'verified' });
      code.value = ''; clearInterval(timer); timer = undefined;
      status('You’re signed in.'); onAuthenticated(result.data.session);
    } catch (error) { status(emailAccessMessage(error), 'error'); }
    finally { busy = false; update(); }
  });

  update();
  return {
    reset() {
      code.value = ''; email.value = ''; address = '';
      clearInterval(timer); timer = undefined;
      emailForm.hidden = false; codePanel.hidden = true;
      root.classList.remove('email-requested'); update();
    },
    stop() { code.value = ''; clearInterval(timer); timer = undefined; },
  };
}
