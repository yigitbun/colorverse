export const EMAIL_RESEND_DELAY = 60_000;
// Matches the hosted Email provider setting, inspected on 2026-09-27.
export const EMAIL_CODE_LENGTH = 8;

export function normalizeAccountEmail(value) {
  const email = String(value || '').trim();
  if (email.length > 254 || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) throw new Error('Enter a valid email address.');
  return email;
}

export function requestEmailAccess(client, email) {
  return client.auth.signInWithOtp({ email: normalizeAccountEmail(email), options: { shouldCreateUser: true } });
}

export function normalizeEmailCode(value) {
  const token = String(value || '').replace(/\s/g, '');
  if (!new RegExp(`^[0-9]{${EMAIL_CODE_LENGTH}}$`).test(token)) throw new Error(`Enter the ${EMAIL_CODE_LENGTH}-digit code from your email.`);
  return token;
}

export function verifyEmailCode(client, email, code) {
  return client.auth.verifyOtp({ email: normalizeAccountEmail(email), token: normalizeEmailCode(code), type: 'email' });
}

export function emailAccessMessage(error) {
  if (/rate_limit/.test(error?.code || '') || error?.status === 429) return 'Too many attempts. Please wait before trying again.';
  if (['otp_expired', 'otp_disabled', 'invalid_credentials'].includes(error?.code)) return 'This code is incorrect or expired. Check the latest email or request a new code.';
  if (error?.code === 'email_address_not_authorized') return 'Email delivery is not enabled for this address. Please contact the site owner.';
  return 'We could not complete that request. Please try again. Your local work is still here.';
}
