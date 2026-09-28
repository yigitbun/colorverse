// Shared bottom-of-page tool shelf. Pages opt in with a placeholder:
// <section class="tool-catalog" data-tool-catalog data-current="studio"></section>
// data-current marks the page's own tool; data-tone="quiet" softens it.

export const TOOLS = [
  { id: 'globe', href: '/', title: 'Explore globe', outcome: 'Find a starting color by moving through hue and light.', action: 'Open the globe' },
  { id: 'extract', href: '/extract/', title: 'Image to palette', outcome: 'Turn a reference photo into five usable colors.', action: 'Read an image' },
  { id: 'studio', href: '/studio/', title: 'Palette Studio', outcome: 'Refine a palette and test it in real contexts.', action: 'Open Studio' },
  { id: 'inspiration', href: '/inspiration/', title: 'Inspiration', outcome: 'See palettes applied to products and spaces.', action: 'Browse studies' },
  { id: 'library', href: '/explore/', title: 'Library', outcome: 'Search named palettes by mood and use.', action: 'Browse the library' },
];

const THUMB_PARTS = { globe: 1, extract: 6, studio: 5, inspiration: 3, library: 3 };

function thumb(id) {
  return `<span class="tool-thumb tool-thumb-${id}" aria-hidden="true">${'<i></i>'.repeat(THUMB_PARTS[id])}</span>`;
}

function card(tool, current) {
  const copy = `<strong>${tool.title}</strong><span class="tool-card-outcome">${tool.outcome}</span>`;
  if (tool.id === current) {
    return `<li class="tool-card is-current" aria-current="page">${thumb(tool.id)}<span class="tool-card-copy"><span class="tool-card-here">You are here</span>${copy}<a class="tool-card-action" href="#main">Back to top <span aria-hidden="true">↑</span></a></span></li>`;
  }
  return `<li class="tool-card"><a class="tool-card-link" href="${tool.href}">${thumb(tool.id)}<span class="tool-card-copy">${copy}<span class="tool-card-action">${tool.action} <span aria-hidden="true">→</span></span></span></a></li>`;
}

export function catalogMarkup(current = '') {
  return `<div class="tool-catalog-head"><span class="eyebrow">ColorVerse tools</span><h2 id="toolCatalogTitle">Keep working with color</h2></div>`
    + `<ul class="tool-catalog-list">${TOOLS.map((tool) => card(tool, current)).join('')}</ul>`;
}

export function mountToolCatalog(root = document) {
  for (const shelf of root.querySelectorAll('[data-tool-catalog]')) {
    if (shelf.childElementCount) continue;
    shelf.setAttribute('aria-labelledby', 'toolCatalogTitle');
    shelf.innerHTML = catalogMarkup(shelf.dataset.current || '');
  }
}

if (typeof document !== 'undefined') mountToolCatalog();
