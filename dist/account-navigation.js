const person = '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="m12 2 8.7 5v10L12 22l-8.7-5V7Z"/><circle cx="12" cy="9" r="2.6"/><path d="M7.5 17a4.5 4.5 0 0 1 9 0"/></svg>';
const studio = '<svg viewBox="0 0 24 24" aria-hidden="true"><rect x="3" y="4" width="18" height="16" rx="2.5"/><path d="M9 4v16M9 12h12"/></svg>';

export function decorateAccountNavigation(actions) {
  if (!document.querySelector('link[data-header-controls]')) {
    const stylesheet = document.createElement('link');
    stylesheet.rel = 'stylesheet'; stylesheet.href = '/header-controls.css?v=2';
    stylesheet.dataset.headerControls = ''; document.head.append(stylesheet);
  }
  const studioLink = [...actions.querySelectorAll('a')].find(link => new URL(link.href).pathname === '/studio/');
  if (studioLink) {
    studioLink.classList.add('studio-link');
    studioLink.innerHTML = `${studio}<span>Studio</span>`;
  }
  let link = actions.querySelector('[data-account-link]');
  if (!link) {
    link = document.createElement('a'); link.href = '/account/';
    link.dataset.accountLink = ''; actions.append(link);
  }
  link.classList.remove('small-button');
  link.classList.add('account-link', 'account-icon-link');
  link.innerHTML = person;
  if (location.pathname.startsWith('/account/')) link.setAttribute('aria-current', 'page');
  updateAccountNavigation(link, null);
  return link;
}

export function updateAccountNavigation(link, session) {
  const label = session?.user ? 'My private palettes' : 'Account: sign in or create an account';
  link.setAttribute('aria-label', label); link.title = session?.user ? 'My palettes' : 'Your account';
  link.dataset.signedIn = String(Boolean(session?.user));
}
