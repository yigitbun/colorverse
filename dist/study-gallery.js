import { aiStudies } from './ai-studies.js?v=2';
import { homeStudies } from './curation.js?v=8';
import { createLibraryEngine } from './library-engine.js?v=1';
import { paletteNameLibrary } from './palette-name-library.js?v=3';

// Owner-supplied AI concept studies for Inspiration and a separate Library
// shelf. Display eligibility is NOT editorial approval: the approved-ID list and
// the approved Library rail (app.js) stay untouched. No storage is written.
const hex = /^#[0-9a-f]{6}$/i;
const safeImage = /^\/assets\/studies\/[a-z0-9-]+\.jpg$/;
const escape = value => String(value).replace(/[&<>"']/g, character => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[character]));

export const isDisplayableStudy = study => Boolean(study && typeof study.id === 'string' && study.id
  && Array.isArray(study.colors) && study.colors.length === 5 && study.colors.every(color => hex.test(color))
  && safeImage.test(study.image) && study.credit?.kind === 'ai');
export const studyHref = id => `/studio/?p=${encodeURIComponent(id)}#studio`;

export function groupStudiesByFamily(studies = aiStudies) {
  const groups = new Map();
  for (const study of studies.filter(isDisplayableStudy)) {
    if (!groups.has(study.family)) groups.set(study.family, []);
    groups.get(study.family).push(study);
  }
  return [...groups].map(([family, items]) => ({ family, studies: items }));
}

export function studyCardHtml(study, { heading = 'h3' } = {}) {
  const name = escape(study.name), family = escape(study.family);
  return `<article class="study-card" data-study-id="${escape(study.id)}">
    <div class="study-palette" role="img" aria-label="${name} palette: ${study.colors.join(', ')}">${study.colors.map(color => `<i style="background:${color}" title="${color}"></i>`).join('')}</div>
    <div class="study-visual"><img src="${escape(study.image)}" alt="${escape(study.imageAlt)}" loading="lazy" decoding="async"><span class="study-ai-badge">AI concept</span></div>
    <div class="study-meta"><div><small>${family} · ${escape(study.category)}</small><${heading}>${name}</${heading}></div><a href="${escape(studyHref(study.id))}" aria-label="Open ${name} (${family} AI concept) in Studio">Studio ↗</a></div>
  </article>`;
}

export function inspirationGalleryHtml(studies = aiStudies) {
  return groupStudiesByFamily(studies).map(({ family, studies: items }) => {
    const slug = escape(family.toLowerCase().replace(/[^a-z0-9]+/g, '-'));
    const note = items.length > 1 ? `${items.length} related AI concepts from one fictional family` : 'Single AI concept';
    return `<section class="study-family" aria-labelledby="studyFamily-${slug}">
    <div class="study-family-head"><h2 id="studyFamily-${slug}">${escape(family)}</h2><small>${note}</small></div>
    <div class="study-shelf">${items.map(study => studyCardHtml(study)).join('')}</div>
  </section>`;
  }).join('');
}

// Display eligibility comes from the owner-selected homeStudies set only.
export function createStudyShelfIndex(studies = homeStudies) {
  const displayable = studies.filter(isDisplayableStudy);
  const aliases = Object.fromEntries(displayable.map(study => [study.id, paletteNameLibrary[study.id]?.aliases || [study.family]]));
  return createLibraryEngine(displayable, { approvedIds: displayable.map(study => study.id), aliases });
}

export function readCurrentColors(storage) {
  try {
    const stored = JSON.parse(storage?.getItem('colorverse-current-palette') || 'null');
    if (stored && Array.isArray(stored.colors) && stored.colors.length === 5 && stored.colors.every(color => hex.test(color))) return stored.colors;
    const workspace = stored?.workspace;
    if (workspace?.v === 1 && Array.isArray(workspace.members) && workspace.members.length >= 5 && workspace.members.length <= 24 && workspace.members.every(color => hex.test(color))
      && Array.isArray(workspace.roleIndex) && workspace.roleIndex.length === 5 && new Set(workspace.roleIndex).size === 5 && workspace.roleIndex.every(index => Number.isInteger(index) && index >= 0 && index < workspace.members.length)) return workspace.roleIndex.map(index => workspace.members[index]);
  } catch {}
  return [];
}

export function studyShelfSummary(count, total, ranked, { currentUnavailable = false } = {}) {
  const note = currentUnavailable ? ' · no current palette to match yet; open one in Studio first' : '';
  return `${count} of ${total} concept stud${total === 1 ? 'y' : 'ies'} · ${ranked ? 'nearest colors' : 'display order'}${note}`;
}

export function initInspirationGallery(root, studies = aiStudies) {
  root.innerHTML = inspirationGalleryHtml(studies);
  root.setAttribute('aria-busy', 'false');
}

// No app.js current-palette hook yet: the default only reads the Studio session copy.
export function initLibraryStudyShelf(root, { doc = document, getCurrentColors = () => readCurrentColors(globalThis.sessionStorage) } = {}) {
  const shelf = createStudyShelfIndex();
  const grid = root.querySelector('[data-study-results]');
  const summary = root.querySelector('[data-study-summary]');
  const empty = root.querySelector('[data-study-empty]');
  const $ = id => doc.getElementById(id);
  let feeling = doc.querySelector('.palette-filter.is-active')?.dataset.paletteFilter || 'all';
  const apply = () => {
    const query = $('paletteSearch')?.value || '';
    const matchCurrent = Boolean($('libraryMatchPalette')?.checked);
    const colors = (matchCurrent ? getCurrentColors() : $('libraryColorEnabled')?.checked ? [$('libraryColor')?.value] : []).filter(Boolean);
    const results = shelf.search({ query, use: $('paletteUse')?.value || 'all', feeling, colors });
    grid.innerHTML = results.map(({ palette }) => studyCardHtml(palette)).join('');
    if (summary) summary.textContent = studyShelfSummary(results.length, shelf.size, colors.length > 0 || /#[0-9a-f]{6}/i.test(query), { currentUnavailable: matchCurrent && colors.length === 0 });
    if (empty) empty.hidden = results.length > 0;
  };
  // Read the shared controls directly; never depend on app.js listener order.
  ['paletteSearch', 'libraryColor', 'libraryColorEnabled', 'libraryMatchPalette'].forEach(id => $(id)?.addEventListener('input', apply));
  $('paletteUse')?.addEventListener('change', apply);
  doc.querySelectorAll('[data-palette-filter]').forEach(button => button.addEventListener('click', () => { feeling = button.dataset.paletteFilter || 'all'; apply(); }));
  doc.body?.classList.add('has-study-shelf');
  root.hidden = false;
  apply();
  return { shelf, apply };
}

export function initStudyGallery(doc = document) {
  const gallery = doc.querySelector('[data-study-gallery="inspiration"]');
  if (gallery) initInspirationGallery(gallery);
  const library = doc.querySelector('[data-study-shelf="library"]');
  if (library) initLibraryStudyShelf(library, { doc });
}

if (typeof document !== 'undefined') initStudyGallery(document);
