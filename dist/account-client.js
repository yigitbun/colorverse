import { accountConfig } from './account-config.js';
import { decorateAccountNavigation, updateAccountNavigation } from './account-navigation.js?v=2';

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
  const link = decorateAccountNavigation(actions);
  try {
    const client = await getAccountClient();
    const update = session => {
      updateAccountNavigation(link, session);
    };
    const { data } = await client.auth.getSession();
    update(data.session);
    client.auth.onAuthStateChange((_event, session) => update(session));
  } catch { /* Public tools remain usable without an account connection. */ }
}
