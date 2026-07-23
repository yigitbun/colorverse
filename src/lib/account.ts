const ACCOUNT_STORAGE_KEY = "colorverse_account_v1";

export interface Account {
  email: string;
  signedUpAt: number;
}

export function getAccount(): Account | null {
  try {
    const raw = localStorage.getItem(ACCOUNT_STORAGE_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw);
    return typeof parsed?.email === "string" ? parsed : null;
  } catch {
    return null;
  }
}

export function saveAccount(email: string): Account {
  const account: Account = { email, signedUpAt: Date.now() };
  try {
    localStorage.setItem(ACCOUNT_STORAGE_KEY, JSON.stringify(account));
  } catch {
    /* localStorage unavailable — account just won't persist */
  }
  return account;
}

export function hasAccount(): boolean {
  return getAccount() !== null;
}

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export function isValidEmail(email: string): boolean {
  return EMAIL_RE.test(email.trim());
}
