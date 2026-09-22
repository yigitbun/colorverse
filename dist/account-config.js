// Public connection settings only. Never put a secret/service-role key here.
export const productionAccount = {
  url: 'https://ayzymeogptrqtouwnahh.supabase.co',
  key: 'sb_publishable_TY49mfQAzRXvIWjlXKi9Ow_gTCaGid_',
};

export function accountConfig(hostname) {
  if (['colorverse.byigit.dev', 'colorverse-85o.pages.dev'].includes(hostname)) return productionAccount;
  if (['127.0.0.1', 'localhost'].includes(hostname)) return productionAccount;
  return null;
}
