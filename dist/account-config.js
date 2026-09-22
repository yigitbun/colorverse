// Public connection settings only. Never put a secret/service-role key here.
export const productionAccount = {
  url: 'https://ayzymeogptrqtouwnahh.supabase.co',
  key: 'sb_publishable_TY49mfQAzRXvIWjlXKi9Ow_gTCaGid_',
};

// Temporary shared backend explicitly approved by the owner on 2026-09-22.
// Authentication/storage are still isolated by origin. Data is shared, not cloned.
export const developmentAccount = productionAccount;

export function accountConfig(hostname) {
  if (['colorverse.byigit.dev', 'colorverse-85o.pages.dev'].includes(hostname)) return productionAccount;
  if (['dev.colorverse.byigit.dev', 'dev.colorverse-85o.pages.dev', '127.0.0.1', 'localhost'].includes(hostname)) return developmentAccount;
  return null;
}
