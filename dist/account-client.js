import { accountConfig } from './account-config.js';

let pendingClient;
export function getAccountClient() {
  if (!pendingClient) pendingClient = createClient().catch(error => {
    pendingClient = null;
    throw error;
  });
  return pendingClient;
}

async function createClient() {
  const config = accountConfig(location.hostname);
  if (!config) throw new Error('This preview is not connected to a development account database yet. Your local palette is safe.');
  if (!window.supabase?.createClient) await new Promise((resolve, reject) => {
    const script = document.createElement('script');
    script.src = '/vendor/supabase.js?v=2.116.0';
    script.onload = resolve;
    script.onerror = () => { script.remove(); reject(new Error('Could not load sign-in. Please try again.')); };
    document.head.append(script);
  });
  return window.supabase.createClient(config.url, config.key, {
    auth: { flowType: 'pkce', persistSession: true, detectSessionInUrl: true, storageKey: 'colorverse-auth' },
  });
}

export const accountReturnURL = () => `${location.origin}/account/`;

export async function initAccountNavigation() {
  const actions = document.querySelector('.header-actions');
  if (!actions) return;
  let link = actions.querySelector('[data-account-link]');
  if (!link) {
    link = document.createElement('a');
    link.href = '/account/';
    link.className = 'small-button account-link';
    link.dataset.accountLink = '';
    link.textContent = 'Sign in';
    actions.append(link);
  }
  try {
    const client = await getAccountClient();
    const update = session => { link.textContent = session?.user ? 'My palettes' : 'Sign in'; };
    const { data } = await client.auth.getSession();
    update(data.session);
    client.auth.onAuthStateChange((_event, session) => update(session));
  } catch { /* Public tools remain usable without an account connection. */ }
}
