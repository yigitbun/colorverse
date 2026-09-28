// A shared ColorVerse journey: find a direction, read a reference, then see
// whether the colors work in an actual design. Pages opt in at the footer.

export const TOOLS = [
  { id: 'globe', href: '/', title: 'Explore the globe', action: 'Find a direction' },
  { id: 'extract', href: '/extract/', title: 'Image to palette', action: 'Read an image' },
  { id: 'studio', href: '/studio/', title: 'Palette Studio', action: 'Try it in a design' },
  { id: 'inspiration', href: '/inspiration/', title: 'Inspiration', action: 'See applied studies' },
  { id: 'library', href: '/explore/', title: 'Library', action: 'Browse palettes' },
];

const PATHS = TOOLS.slice(0, 3);
const pathText = {
  globe: { note: 'Begin with a hue', description: 'Move through colour until a direction feels right.' },
  extract: { note: 'Begin with a reference', description: 'Read the colors in an image, then shape the set.' },
  studio: { note: 'Begin with a design', description: 'Put the palette on a product or screen and see what holds.' },
};

function visual(id) {
  if (id === 'globe') return '<span class="journey-visual journey-visual-globe" aria-hidden="true"><i></i><b></b></span>';
  if (id === 'extract') return '<span class="journey-visual journey-visual-read" aria-hidden="true"><i></i><b></b><em></em><small></small></span>';
  return '<span class="journey-visual journey-visual-apply" aria-hidden="true"><img src="/assets/studies/katre-serum-v3.png" alt="" loading="lazy"><i>KATRE · CONCEPT</i></span>';
}

function pathCard(tool, current) {
  const here = current === tool.id;
  const content = `<span class="journey-visual-wrap"><span class="journey-index">0${PATHS.indexOf(tool) + 1}</span>${visual(tool.id)}</span><span class="journey-copy"><span class="journey-note">${pathText[tool.id].note}</span><strong>${tool.action}</strong><span class="journey-description">${pathText[tool.id].description}</span>${here ? '<span class="journey-current">You are here</span>' : `<span class="journey-link">${tool.title} <span aria-hidden="true">↗</span></span>`}</span>`;
  if (here) return `<li class="journey-step is-current" aria-current="step">${content}</li>`;
  return `<li class="journey-step"><a class="journey-step-link" href="${tool.href}">${content}</a></li>`;
}

function referenceLink(tool, current) {
  if (current === tool.id) return `<span class="journey-reference is-current" aria-current="page">${tool.action} <small>You are here</small></span>`;
  return `<a class="journey-reference" href="${tool.href}">${tool.action} <span aria-hidden="true">↗</span></a>`;
}

export function catalogMarkup(current = '') {
  const resourceLinks = TOOLS.slice(3).map(tool => referenceLink(tool, current)).join('');
  return `<div class="journey-intro"><span class="eyebrow">From color to context</span><h2 id="toolCatalogTitle">Color is a decision, not a swatch.</h2><p>Find a direction. Read a reference. See how the whole palette works in a design.</p></div>`
    + `<ol class="color-journey" aria-label="From a color direction to a finished design">${PATHS.map(tool => pathCard(tool, current)).join('')}</ol>`
    + `<div class="journey-more"><span>Want examples or a starting palette?</span><nav aria-label="Explore ColorVerse palettes and studies">${resourceLinks}</nav></div>`;
}

export function mountToolCatalog(root = document) {
  for (const shelf of root.querySelectorAll('[data-tool-catalog]')) {
    if (shelf.childElementCount) continue;
    shelf.setAttribute('aria-labelledby', 'toolCatalogTitle');
    shelf.innerHTML = catalogMarkup(shelf.dataset.current || '');
  }
}

if (typeof document !== 'undefined') mountToolCatalog();
