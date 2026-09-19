try {
  const preference = localStorage.getItem('colorverse-theme');
  document.documentElement.dataset.theme = preference === 'dark' || preference === 'light' ? preference : (matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light');
} catch { document.documentElement.dataset.theme = 'light'; }
