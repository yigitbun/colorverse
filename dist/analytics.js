import { CONSENT_KEY, CONSENT_VERSION, parseConsent, safePageLocation, analyticsEvent } from './privacy.js?v=3';

const measurementId = 'G-TJG8M3VE03';
const production = location.hostname === 'colorverse.byigit.dev';
let consent = null, loaded = false;
try { consent = parseConsent(localStorage.getItem(CONSENT_KEY)); } catch {}
const disableKey = `ga-disable-${measurementId}`;
window[disableKey] = true;
const safeReferrer = () => {
  try { return document.referrer ? new URL(document.referrer).origin : ''; } catch { return ''; }
};

function loadAnalytics() {
  if (loaded || !production || !consent?.analytics) return;
  loaded = true;
  window[disableKey] = false;
  window.dataLayer = window.dataLayer || [];
  window.gtag = function () { window.dataLayer.push(arguments); };
  window.gtag('consent', 'default', { analytics_storage: 'denied', ad_storage: 'denied', ad_user_data: 'denied', ad_personalization: 'denied' });
  window.gtag('consent', 'update', { analytics_storage: 'granted' });
  window.gtag('js', new Date());
  window.gtag('config', measurementId, {
    send_page_view: false,
    allow_google_signals: false,
    allow_ad_personalization_signals: false,
    cookie_domain: location.hostname,
    cookie_expires: 90 * 24 * 60 * 60,
    cookie_flags: 'SameSite=Lax;Secure',
    page_location: safePageLocation(location.href),
    page_referrer: safeReferrer(),
  });
  const script = document.createElement('script');
  script.id = 'colorverse-google-tag';
  script.async = true;
  script.src = `https://www.googletagmanager.com/gtag/js?id=${measurementId}`;
  document.head.append(script);
  window.gtag('event', 'page_view', { page_location: safePageLocation(location.href), page_title: document.title });
}

function clearAnalyticsCookies() {
  // Delete only this host's GA cookies. Do not touch other byigit.dev products.
  for (const entry of document.cookie.split(';')) {
    const name = entry.split('=')[0].trim();
    if (name !== '_ga' && !name.startsWith('_ga_')) continue;
    for (const domain of ['', `; Domain=${location.hostname}`, `; Domain=.${location.hostname}`]) {
      document.cookie = `${name}=; Max-Age=0; Path=/; SameSite=Lax${domain}`;
    }
  }
}

function updateChoice(analytics) {
  consent = { version: CONSENT_VERSION, analytics, at: Date.now() };
  try { localStorage.setItem(CONSENT_KEY, JSON.stringify(consent)); } catch {
    status.textContent = 'Your choice applies to this visit. Browser storage is unavailable.';
  }
  banner.hidden = true;
  if (preferences.open) preferences.close();
  if (analytics) loadAnalytics();
  else {
    window[disableKey] = true;
    clearAnalyticsCookies();
    // Unload Google's runtime, including any timers, when consent is withdrawn.
    if (loaded) location.reload();
  }
}

const banner = document.createElement('section');
banner.className = 'cookie-banner';
banner.setAttribute('aria-label', 'Cookie choices');
banner.innerHTML = '<div><strong>Your palette. Your privacy.</strong><p>We use optional analytics to improve ColorVerse. Your images stay in your browser. <a href="/privacy/">Privacy & cookies</a></p></div><div class="cookie-actions"><button type="button" data-consent="no">Only necessary</button><button type="button" data-consent="yes">Allow analytics</button><button type="button" data-cookie-settings>Settings</button></div>';
banner.hidden = Boolean(consent);
document.body.append(banner);

const preferences = document.createElement('dialog');
preferences.className = 'cookie-preferences';
preferences.setAttribute('aria-labelledby', 'cookiePreferencesTitle');
preferences.innerHTML = '<form method="dialog"><header><h2 id="cookiePreferencesTitle">Privacy choices</h2><button value="cancel" aria-label="Close privacy settings">×</button></header><p>Color tools work with analytics turned off.</p><div class="cookie-option"><div><strong>Necessary storage</strong><p>Your theme, palette, saved colors, projects and this choice.</p></div><span>Always on</span></div><label class="cookie-option"><div><strong>Analytics</strong><p>Google Analytics measures page visits and tool use. No photos, project names or form text are sent.</p></div><input id="analyticsConsent" type="checkbox"></label><p><a href="/privacy/">Read the privacy notice</a></p><footer><button type="button" data-consent="no">Reject analytics</button><button type="button" id="saveCookiePreferences">Save choices</button></footer></form>';
document.body.append(preferences);
const status = document.createElement('p');
status.className = 'sr-only'; status.setAttribute('role', 'status'); document.body.append(status);

document.querySelectorAll('footer nav').forEach(nav => {
  if (!nav.querySelector('[href="/privacy/"]')) { const a = document.createElement('a'); a.href = '/privacy/'; a.textContent = 'Privacy'; nav.append(a); }
  const button = document.createElement('button');
  button.type = 'button'; button.dataset.cookieSettings = ''; button.className = 'cookie-settings-link'; button.textContent = 'Cookie settings'; nav.append(button);
});
document.addEventListener('click', event => {
  const choice = event.target.closest('[data-consent]');
  if (choice) updateChoice(choice.dataset.consent === 'yes');
  if (event.target.closest('[data-cookie-settings]')) {
    preferences.querySelector('#analyticsConsent').checked = Boolean(consent?.analytics);
    preferences.showModal();
  }
});
document.querySelector('#saveCookiePreferences').addEventListener('click', () => updateChoice(preferences.querySelector('#analyticsConsent').checked));
window.addEventListener('storage', event => {
  if (event.key !== CONSENT_KEY && event.key !== null) return;
  consent = parseConsent(event.newValue);
  if (!consent?.analytics && loaded) { window[disableKey] = true; location.reload(); }
  else if (consent?.analytics) loadAnalytics();
  banner.hidden = Boolean(consent);
});
window.colorverseTrack = (name, detail) => {
  const clean = analyticsEvent(name, detail);
  if (production && loaded && consent?.analytics && clean) window.gtag('event', clean.name, { ...clean.detail, page_location: safePageLocation(location.href) });
};
if (consent?.analytics) loadAnalytics();
else clearAnalyticsCookies();
