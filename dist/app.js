import { palettes } from './palettes.js?v=20';
import { roles, clamp, contrast, textOn, paletteFromColor, exportPalette, extractPaletteVariants, oklabDistance } from './color.js';
import { createAtlas, atlasWorlds } from './globe.js';

const $ = selector => document.querySelector(selector);
const $$ = selector => [...document.querySelectorAll(selector)];
const escape = value => String(value).replace(/[&<>"']/g, character => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[character]));
const reduceMotion = matchMedia('(prefers-reduced-motion: reduce)');
const route = location.pathname.replace(/\/+$/, '') || '/';
const page = ({ '/explore': 'explore', '/extract': 'extract', '/studio': 'studio', '/about': 'about' })[route] || 'home';
const titles = {
  home: 'ColorVerse — Find color in context',
  explore: 'Palette library — ColorVerse',
  extract: 'Image to palette — ColorVerse',
  studio: 'Studio — ColorVerse',
  about: 'About ColorVerse',
};
const params = new URLSearchParams(location.search);
let toastTimer;

function readStoredPalette() {
  try {
    const stored = JSON.parse(sessionStorage.getItem('colorverse-current-palette') || 'null');
    if (stored && Array.isArray(stored.colors) && stored.colors.length >= 5 && stored.colors.every(color => /^#[0-9a-f]{6}$/i.test(color))) return stored;
  } catch {}
  return null;
}

const requestedPalette = palettes.find(palette => palette.id === params.get('p'));
const storedPalette = readStoredPalette();
let current = requestedPalette || (storedPalette && (!params.get('p') || storedPalette.id === params.get('p')) ? storedPalette : palettes[0]);
let context = 'landing';
let format = 'css';
let extracted = null;
let extractedVariants = [];
let selectedExtraction = 0;
let imageURL = null;
document.body.dataset.page = page;
document.title = titles[page];

function persistPalette(palette) {
  try { sessionStorage.setItem('colorverse-current-palette', JSON.stringify(palette)); } catch {}
}

function toast(message) {
  const notice = $('#toast');
  if (!notice) return;
  notice.textContent = message;
  notice.classList.add('is-visible');
  clearTimeout(toastTimer);
  toastTimer = setTimeout(() => notice.classList.remove('is-visible'), 2600);
}

async function copy(text, message = 'Copied to clipboard.') {
  try {
    if (navigator.clipboard && window.isSecureContext) await navigator.clipboard.writeText(text);
    else {
      const area = document.createElement('textarea');
      area.value = text;
      area.style.cssText = 'position:fixed;left:-9999px;top:0';
      document.body.append(area);
      area.select();
      const copied = document.execCommand('copy');
      area.remove();
      if (!copied) throw new Error('Clipboard unavailable');
    }
    toast(message);
  } catch { toast('Copy is unavailable here. Select the code to copy it manually.'); }
}

function swatch(hex, className = '', label = '') {
  return `<button class="${className}" style="--swatch:${hex};--on:${textOn(hex)}" data-copy="${hex}" aria-label="Copy ${label ? `${label} ` : ''}${hex}" title="Copy ${hex}"><code>${hex}</code></button>`;
}

const signatureSources = palettes.map(palette => ({ name: palette.name, image: palette.image, category: palette.category, tags: palette.tags || [], colors: palette.colors }));
function signatureFor(hex) {
  return signatureSources.reduce((best, source) => {
    const score = Math.min(...source.colors.map(color => oklabDistance(hex, color)));
    return score < best.score ? { source, score } : best;
  }, { source: signatureSources[0], score: Infinity }).source;
}

function setPaletteURL() {
  const url = new URL(location.href);
  if (current?.id) url.searchParams.set('p', current.id);
  history.replaceState(null, '', url);
}

function renderSelection(updateURL = false) {
  const name = $('#paletteName');
  const heroName = $('#heroPaletteName');
  const description = $('#paletteDescription');
  const heroSwatches = $('#heroSwatches');
  const paletteRoles = $('#paletteRoles');
  const ratio = $('#contrastRatio');
  const verdict = $('#contrastVerdict');
  if (name) name.textContent = current.name;
  if (heroName) heroName.textContent = current.name;
  if (description) description.textContent = current.description || 'A five-color direction ready to test.';
  if (heroSwatches) heroSwatches.innerHTML = current.colors.slice(0, 5).map(color => swatch(color)).join('');
  if (paletteRoles) paletteRoles.innerHTML = current.colors.slice(0, 5).map((color, index) => `<button class="role-swatch" style="--swatch:${color}" data-copy="${color}" aria-label="Copy ${roles[index]} ${color}"><i aria-hidden="true"></i><span>${roles[index]}</span><code>${color}</code></button>`).join('');
  if (ratio) {
    const value = contrast(current.colors[0], current.colors[4]);
    ratio.textContent = `${value.toFixed(2)}:1 · ${value >= 7 ? 'AAA contrast' : value >= 4.5 ? 'AA contrast' : value >= 3 ? 'Large text only' : 'Low contrast'}`;
  }
  if (verdict) verdict.textContent = 'Text on background';
  $$('.palette-card').forEach(card => {
    const active = card.dataset.palette === current.id;
    card.classList.toggle('is-active', active);
    const link = card.querySelector('[data-select]');
    if (link) {
      if (active) link.setAttribute('aria-current', 'true');
      else link.removeAttribute('aria-current');
    }
  });
  renderMockup();
  renderExport();
  if (updateURL) setPaletteURL();
}

function choosePalette(palette, notify = true) {
  if (!palette || !Array.isArray(palette.colors) || palette.colors.length < 5) return;
  current = palette;
  persistPalette(palette);
  renderSelection(true);
  if (notify) toast(`${palette.name} selected.`);
}

function renderPaletteRail() {
  const rail = $('#paletteRail');
  if (!rail) return;
  rail.innerHTML = palettes.map((palette, index) => `<article class="palette-card" data-palette="${palette.id}" style="--cover:${palette.colors[1]}">
    <div class="palette-card-image"><img src="${escape(palette.image)}" alt="${escape(palette.name)} inspiration" width="900" height="450" loading="${index < 3 ? 'eager' : 'lazy'}" decoding="async" draggable="false"><span class="palette-number">${String(index + 1).padStart(2, '0')}</span><span class="palette-category">${escape(palette.category)}</span></div>
    <div class="palette-card-colors" aria-label="Five palette colors">${palette.colors.slice(0, 5).map(color => swatch(color)).join('')}</div>
    <a class="palette-card-select" data-select="${palette.id}" href="/studio/?p=${encodeURIComponent(palette.id)}#studio" aria-label="Use ${escape(palette.name)} palette"><span>${escape(palette.name)}</span><span>Use palette</span></a>
  </article>`).join('');
  $$('.palette-card-image img').forEach(image => image.addEventListener('error', () => {
    image.hidden = true;
    const fallback = document.createElement('span');
    fallback.className = 'image-fallback';
    fallback.textContent = 'Color study';
    image.parentElement.append(fallback);
  }));
}

let atlasHover = null;
let atlasPinned = null;
let atlasSelected = [];

function setAtlasReadout(payload, selected = false) {
  const hex = payload?.hex || '#FF7658';
  const label = $('#atlasReadoutLabel');
  const value = $('#hoverHex');
  const dot = $('#hoverDot');
  const copyButton = $('#copyAtlasColor');
  const coordinates = $('#atlasCoordinates');
  if (label) label.textContent = selected ? 'Selected' : 'Hover';
  if (value) value.textContent = hex;
  if (dot) dot.style.background = hex;
  if (copyButton) {
    copyButton.textContent = selected ? 'Copy selected' : 'Copy';
    copyButton.disabled = !payload;
    copyButton.setAttribute('aria-label', selected ? `Copy selected color ${hex}` : `Copy hovered color ${hex}`);
  }
  if (coordinates) {
    const position = payload?.coordinates;
    coordinates.textContent = position ? `L ${position.l}  C ${position.c}  H ${position.h}°` : 'L —  C —  H —';
  }
}

function suggestedPalettes(hex) {
  return palettes.map(palette => ({ palette, score: Math.min(...palette.colors.map(color => oklabDistance(hex, color))) }))
    .sort((a, b) => a.score - b.score).slice(0, 3).map(({ palette }) => palette);
}

function renderAtlasSelection() {
  const panel = $('#atlasSelectionPanel');
  if (!panel) return;
  panel.hidden = atlasSelected.length === 0;
  const count = $('#atlasSelectionCount');
  const colors = $('#atlasSelectedSwatches');
  const suggestions = $('#atlasSuggestions');
  const action = $('#useAtlasPalette');
  if (count) count.textContent = `${atlasSelected.length} / 5`;
  if (colors) colors.innerHTML = atlasSelected.map(({ hex }) => `<span class="atlas-selected-swatch" style="--swatch:${hex};--on:${textOn(hex)}" title="${hex}"><code>${hex}</code></span>`).join('');
  const suggested = atlasSelected.length === 1 ? suggestedPalettes(atlasSelected[0].hex) : [];
  if (suggestions) suggestions.innerHTML = suggested.length ? `<span class="atlas-suggestions-label">Suggested palettes</span>${suggested.map(palette => `<button type="button" class="atlas-suggestion" data-atlas-suggestion="${palette.id}" aria-label="Try ${escape(palette.name)} palette"><span class="atlas-suggestion-swatches">${palette.colors.map(color => `<i style="--swatch:${color}"></i>`).join('')}</span><span>${escape(palette.name)}</span></button>`).join('')}` : '';
  if (action) action.textContent = atlasSelected.length === 1 ? 'Build around this color' : 'Use selected colors';
}

function addAtlasSelection(payload) {
  if (!payload) return;
  atlasHover = payload;
  const existing = atlasSelected.findIndex(item => item.index === payload.index);
  if (existing >= 0) atlasSelected.splice(existing, 1);
  else if (atlasSelected.length >= 5) { toast('You can select up to five colors.'); return; }
  else atlasSelected.push(payload);
  atlasPinned = atlasSelected.at(-1) || null;
  setAtlasReadout(atlasPinned, Boolean(atlasPinned));
  renderAtlasSelection();
  toast(atlasPinned ? `${atlasSelected.length} color${atlasSelected.length === 1 ? '' : 's'} selected.` : 'Selection cleared.');
}

function buildAtlasPalette() {
  if (!atlasSelected.length) return null;
  const seed = atlasSelected[0].hex;
  const generated = paletteFromColor(seed);
  const colors = [...atlasSelected.map(item => item.hex)];
  for (const color of generated) if (!colors.includes(color) && colors.length < 5) colors.push(color);
  let generatedIndex = 0;
  while (colors.length < 5) colors.push(generated[generatedIndex++ % generated.length]);
  const source = signatureFor(seed);
  return { id: 'atlas-custom', name: 'Custom palette', description: `${atlasSelected.length} selected color${atlasSelected.length === 1 ? '' : 's'} with generated supporting tones.`, colors: colors.slice(0, 5), image: source.image, category: source.category, tags: source.tags };
}

function renderMockup() {
  const panel = $('#mockup');
  if (!panel) return;
  const [bg, surface, primary, accent, ink] = current.colors;
  for (const [name, value] of Object.entries({ bg, surface, primary, accent, text: ink })) panel.style.setProperty(`--p-${name}`, value);
  panel.style.setProperty('--on-primary', textOn(primary));
  panel.style.setProperty('--on-accent', textOn(accent));
  panel.setAttribute('aria-labelledby', `tab-${context}`);
  const photo = current.image || palettes[0].image;
  const image = (alt = 'Palette inspiration') => `<img src="${escape(photo)}" alt="${alt}" decoding="async">`;
  const browser = '<div class="mock-browser" aria-hidden="true"><i></i><i></i><i></i><span>forma.studio</span></div>';
  const nav = '<div class="mock-nav"><b>forma.</b><span>Our work <span>About us</span></span><span class="mock-cta">Let’s talk ↗</span></div>';
  const layouts = {
    landing: `<div class="mockup landing-mockup">${browser}${nav}<div class="landing-layout"><div class="landing-copy"><span class="mock-kicker">Design & strategy</span><h4>Clear ideas.<br>Considered design.</h4><p>Brand identities and digital products for teams building their next chapter.</p><span class="mock-cta">View projects <span>→</span></span></div><div class="landing-photo">${image()}<span class="photo-tag">Selected work / 2026</span></div></div><div class="mock-features"><span><i>01</i>Research</span><span><i>02</i>Design systems</span><span><i>03</i>Digital products</span></div></div>`,
    presentation: `<div class="mockup slides-layout"><div class="slide-top"><span>FORMA / QUARTERLY REVIEW</span><span>2026 — 04</span></div><div class="slide-main"><div><span class="mock-kicker">Progress at a glance</span><h4>A clearer<br>view of growth.</h4><p>A sample presentation showing your palette across text, surfaces, and data.</p></div><div class="slide-chart" role="img" aria-label="Illustrative bar chart with four sample values"><i style="--height:38%"></i><i style="--height:57%"></i><i style="--height:71%"></i><i style="--height:94%"></i></div></div><div class="slide-bottom"><span>Quarterly overview</span><span>Illustrative data · 04 / 12</span></div></div>`,
    social: `<div class="mockup social-layout"><div class="social-card"><div class="social-top"><i class="social-avatar"></i><span>forma.studio</span></div><div class="social-photo">${image()}<span>Selected work.</span></div><div class="social-foot"><span>♡ &nbsp; ↗</span><span>Project journal</span></div></div><div class="social-card"><div class="social-top"><i class="social-avatar"></i><span>forma.studio</span></div><div class="social-quote">A new look.<br>The same<br>clear purpose.</div><div class="social-foot"><span>♡ &nbsp; ↗</span><span>Brand update</span></div></div></div>`,
    shop: `<div class="mockup">${browser}<div class="shop-layout"><div class="shop-heading"><h4>Everyday editions.</h4><span>Art for your space ↗</span></div><div class="shop-grid">${['The field study', 'Another perspective', 'The quiet moment'].map((title, index) => `<div class="shop-product"><div class="product-image">${image('Example art print')}<span class="photo-tag">${index === 0 ? 'NEW EDITION' : 'FINE ART PRINT'}</span></div><h5>${title}</h5><div class="shop-price"><span>€${[28, 36, 32][index]}.00</span><span>↗</span></div></div>`).join('')}</div><div class="shop-bottom">Small editions. Lasting impressions. &nbsp; • &nbsp; Example shop</div></div></div>`,
  };
  panel.innerHTML = layouts[context] || layouts.landing;
}

function renderExport() {
  const code = $('#exportCode');
  if (!code) return;
  code.textContent = exportPalette(current, format);
  code.setAttribute('aria-labelledby', `format-${format}`);
}

function setupTabs(selector, callback) {
  const tabs = $$(selector);
  if (!tabs.length) return;
  const select = button => {
    tabs.forEach(tab => {
      const active = tab === button;
      tab.setAttribute('aria-selected', String(active));
      tab.tabIndex = active ? 0 : -1;
    });
    callback(button);
  };
  tabs.forEach((button, index) => {
    button.addEventListener('click', () => select(button));
    button.addEventListener('keydown', event => {
      let next;
      if (event.key === 'ArrowRight') next = (index + 1) % tabs.length;
      if (event.key === 'ArrowLeft') next = (index - 1 + tabs.length) % tabs.length;
      if (event.key === 'Home') next = 0;
      if (event.key === 'End') next = tabs.length - 1;
      if (next !== undefined) { event.preventDefault(); select(tabs[next]); tabs[next].focus(); }
    });
  });
}

setupTabs('[data-context]', button => { context = button.dataset.context; renderMockup(); });
setupTabs('[data-format]', button => { format = button.dataset.format; renderExport(); });

document.addEventListener('click', event => {
  const color = event.target.closest('[data-copy]');
  if (color) copy(color.dataset.copy, `${color.dataset.copy} copied.`);
  const selection = event.target.closest('[data-select]');
  if (selection) {
    const palette = palettes.find(item => item.id === selection.dataset.select);
    if (palette) choosePalette(palette);
  }
});

const copyCode = $('#copyCode');
if (copyCode) copyCode.addEventListener('click', () => copy(exportPalette(current, format), `${format === 'hex' ? 'Hex list' : format.toUpperCase()} copied.`));
const copyPalette = $('#copyPalette');
if (copyPalette) copyPalette.addEventListener('click', () => copy(current.colors.join(', '), 'All five colors copied.'));
const shufflePalette = $('#shufflePalette');
if (shufflePalette) shufflePalette.addEventListener('click', () => {
  const index = palettes.findIndex(palette => palette.id === current.id);
  choosePalette(palettes[(index + 1 + palettes.length) % palettes.length]);
});

renderPaletteRail();
const rail = $('#paletteRail');
if (rail) {
  let railFrame = 0;
  const updateRail = () => {
    if (!rail.clientWidth) return;
    const cards = $$('.palette-card');
    if (!cards.length) return;
    const stride = cards[1] ? cards[1].offsetLeft - cards[0].offsetLeft : cards[0].offsetWidth;
    const max = Math.max(0, rail.scrollWidth - rail.clientWidth);
    const index = clamp(Math.round(rail.scrollLeft / Math.max(stride, 1)), 0, palettes.length - 1);
    const collectionIndex = $('#collectionIndex');
    const previous = $('#palettePrev');
    const next = $('#paletteNext');
    const progress = $('#railProgress');
    if (collectionIndex) collectionIndex.textContent = `${String(index + 1).padStart(2, '0')} / ${palettes.length}`;
    if (previous) previous.disabled = rail.scrollLeft < 5;
    if (next) next.disabled = rail.scrollLeft >= max - 5;
    if (progress) progress.style.width = `${max ? 15 + rail.scrollLeft / max * 85 : 100}%`;
    cards.forEach(card => {
      const distance = (card.offsetLeft - cards[0].offsetLeft - rail.scrollLeft) / rail.clientWidth;
      card.style.setProperty('--turn', `${clamp(distance * -1.2, -1.5, 1.5)}deg`);
    });
    railFrame = 0;
  };
  const scheduleRail = () => { if (!railFrame) railFrame = requestAnimationFrame(updateRail); };
  rail.addEventListener('scroll', scheduleRail, { passive: true });
  if (window.ResizeObserver) new ResizeObserver(scheduleRail).observe(rail);
  function moveRail(direction) {
    const cards = $$('.palette-card');
    if (!cards[0]) return;
    const stride = cards[1] ? cards[1].offsetLeft - cards[0].offsetLeft : cards[0].offsetWidth;
    rail.scrollBy({ left: stride * direction, behavior: reduceMotion.matches ? 'instant' : 'smooth' });
  }
  const previous = $('#palettePrev');
  const next = $('#paletteNext');
  if (previous) previous.addEventListener('click', () => moveRail(-1));
  if (next) next.addEventListener('click', () => moveRail(1));
  rail.addEventListener('keydown', event => {
    if (event.target !== rail) return;
    if (event.key === 'ArrowRight' || event.key === 'ArrowLeft') { event.preventDefault(); moveRail(event.key === 'ArrowRight' ? 1 : -1); }
    if (event.key === 'Home' || event.key === 'End') { event.preventDefault(); rail.scrollTo({ left: event.key === 'Home' ? 0 : rail.scrollWidth, behavior: reduceMotion.matches ? 'instant' : 'smooth' }); }
  });
  let railDrag = null;
  let suppressClick = false;
  rail.addEventListener('pointerdown', event => {
    if (event.pointerType !== 'mouse' || event.button !== 0) return;
    suppressClick = false;
    railDrag = { x: event.clientX, scroll: rail.scrollLeft, moved: false };
  });
  rail.addEventListener('pointermove', event => {
    if (!railDrag) return;
    const distance = event.clientX - railDrag.x;
    if (Math.abs(distance) > 5) { railDrag.moved = true; rail.classList.add('is-dragging'); rail.setPointerCapture(event.pointerId); }
    if (railDrag.moved) { event.preventDefault(); rail.scrollLeft = railDrag.scroll - distance; }
  });
  const finishDrag = () => { if (!railDrag) return; suppressClick = railDrag.moved; railDrag = null; rail.classList.remove('is-dragging'); };
  rail.addEventListener('pointerup', finishDrag);
  rail.addEventListener('pointercancel', finishDrag);
  rail.addEventListener('lostpointercapture', finishDrag);
  rail.addEventListener('click', event => { if (suppressClick) { event.preventDefault(); event.stopPropagation(); suppressClick = false; } }, true);
  scheduleRail();
}

let savedTheme;
try { savedTheme = localStorage.getItem('colorverse-theme'); } catch {}
function setTheme(theme) {
  document.documentElement.dataset.theme = theme;
  const toggle = $('#themeToggle');
  const meta = document.querySelector('meta[name="theme-color"]');
  if (toggle) toggle.setAttribute('aria-label', theme === 'light' ? 'Switch to dark theme' : 'Switch to light theme');
  if (meta) meta.content = theme === 'light' ? '#fafaf8' : '#1c1f22';
  try { localStorage.setItem('colorverse-theme', theme); } catch {}
}
setTheme(savedTheme === 'light' || savedTheme === 'dark' ? savedTheme : (matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light'));
const themeToggle = $('#themeToggle');
if (themeToggle) themeToggle.addEventListener('click', () => setTheme(document.documentElement.dataset.theme === 'light' ? 'dark' : 'light'));
$$('.desktop-nav a').forEach(link => { if (link.pathname.replace(/\/+$/, '') === route) link.setAttribute('aria-current', 'page'); });

if (page === 'home') {
  let savedAtlasWorld;
  try { savedAtlasWorld = localStorage.getItem('colorverse-world'); } catch {}
  let activeAtlasWorld = atlasWorlds.find(world => world.id === savedAtlasWorld) || atlasWorlds[0];
  const atlasWorldSwitch = $('#atlasWorldSwitch');
  if (atlasWorldSwitch) {
    atlasWorldSwitch.innerHTML = `<span class="atlas-world-label">Worlds</span>${atlasWorlds.map((world, index) => `<button type="button" role="tab" data-atlas-world="${world.id}" aria-selected="${world.id === activeAtlasWorld.id}" tabindex="${world.id === activeAtlasWorld.id ? '0' : '-1'}" title="${escape(world.name)}"><span class="atlas-world-index">${String(index + 1).padStart(2, '0')}</span><span class="atlas-world-copy"><strong>${escape(world.shortName)}</strong><small>${escape(world.name)}</small></span><i class="atlas-world-chip" style="--world-accent:${world.accent}"></i></button>`).join('')}`;
    const renderAtlasWorld = () => {
      $$('#atlasWorldSwitch [data-atlas-world]').forEach(button => {
        const selected = button.dataset.atlasWorld === activeAtlasWorld.id;
        button.setAttribute('aria-selected', String(selected));
        button.tabIndex = selected ? 0 : -1;
      });
      $('.atlas-scene')?.style.setProperty('--atlas-field', activeAtlasWorld.accent);
      const label = $('#atlasWorldLabel');
      if (label) label.textContent = `${activeAtlasWorld.name} field`;
    };
    renderAtlasWorld();
    const globe = createAtlas($('#globe'), {
      initialWorld: activeAtlasWorld.id,
      imageFor(hex) { const source = signatureFor(hex); return { image: source.image, name: source.name, category: source.category, tags: source.tags }; },
      onSelect(payload) { addAtlasSelection(payload); globe.setSelection(atlasSelected.map(item => item.index)); },
      onHover(payload) { atlasHover = payload; if (payload && !atlasPinned) setAtlasReadout(payload); },
    });
    const selectAtlasWorld = (id, notify = true) => {
      const nextWorld = atlasWorlds.find(world => world.id === id);
      if (!nextWorld || nextWorld.id === activeAtlasWorld.id) return;
      activeAtlasWorld = nextWorld;
      globe.setWorld(nextWorld.id);
      atlasSelected = [];
      atlasPinned = null;
      atlasHover = null;
      globe.setSelection([]);
      renderAtlasSelection();
      setAtlasReadout(null);
      renderAtlasWorld();
      try { localStorage.setItem('colorverse-world', nextWorld.id); } catch {}
      if (notify) toast(`${nextWorld.name} world selected.`);
    };
    atlasWorldSwitch.addEventListener('click', event => {
      const button = event.target.closest('[data-atlas-world]');
      if (button) selectAtlasWorld(button.dataset.atlasWorld);
    });
    atlasWorldSwitch.addEventListener('keydown', event => {
      if (!['ArrowLeft', 'ArrowRight', 'Home', 'End'].includes(event.key)) return;
      event.preventDefault();
      const buttons = $$('#atlasWorldSwitch [data-atlas-world]');
      const currentIndex = buttons.findIndex(button => button === document.activeElement);
      const nextIndex = event.key === 'Home' ? 0 : event.key === 'End' ? buttons.length - 1 : (currentIndex + (event.key === 'ArrowRight' ? 1 : -1) + buttons.length) % buttons.length;
      buttons[nextIndex].focus();
      selectAtlasWorld(buttons[nextIndex].dataset.atlasWorld);
    });
    setAtlasReadout(null);
    const copyAtlasColor = $('#copyAtlasColor');
    if (copyAtlasColor) copyAtlasColor.addEventListener('click', () => {
      const colors = atlasPinned ? [atlasPinned.hex] : atlasHover ? [atlasHover.hex] : [];
      if (colors.length) copy(colors.join(', '), `${colors[0]} copied.`);
    });
    const clearAtlasSelection = $('#clearAtlasSelection');
    if (clearAtlasSelection) clearAtlasSelection.addEventListener('click', () => { atlasSelected = []; atlasPinned = null; globe.setSelection([]); renderAtlasSelection(); setAtlasReadout(atlasHover); });
    const useAtlasPalette = $('#useAtlasPalette');
    if (useAtlasPalette) useAtlasPalette.addEventListener('click', () => {
      const palette = buildAtlasPalette();
      if (!palette) return;
      persistPalette(palette);
      location.href = `/studio/?p=${encodeURIComponent(palette.id)}#studio`;
    });
    const atlasSuggestions = $('#atlasSuggestions');
    if (atlasSuggestions) atlasSuggestions.addEventListener('click', event => {
      const button = event.target.closest('[data-atlas-suggestion]');
      if (!button) return;
      const palette = palettes.find(item => item.id === button.dataset.atlasSuggestion);
      if (palette) choosePalette(palette);
    });
    const zoomIn = $('#zoomIn');
    const zoomOut = $('#zoomOut');
    if (zoomIn) zoomIn.addEventListener('click', () => globe.zoom(.08));
    if (zoomOut) zoomOut.addEventListener('click', () => globe.zoom(-.08));
    let paused = reduceMotion.matches;
    const pauseAtlas = $('#pauseAtlas');
    const updatePause = () => {
      if (!pauseAtlas) return;
      pauseAtlas.setAttribute('aria-pressed', String(paused));
      pauseAtlas.setAttribute('aria-label', paused ? 'Resume globe rotation' : 'Pause globe rotation');
      pauseAtlas.innerHTML = paused ? '<svg viewBox="0 0 20 20" aria-hidden="true"><path d="m7 4 8 6-8 6Z"/></svg>' : '<svg viewBox="0 0 20 20" aria-hidden="true"><path d="M7 5v10M13 5v10"/></svg>';
    };
    updatePause();
    if (pauseAtlas) pauseAtlas.addEventListener('click', () => { paused = !paused; globe.pause(paused); updatePause(); });
    reduceMotion.addEventListener('change', () => { paused = reduceMotion.matches; globe.pause(paused); updatePause(); });
  }
}

const input = $('#imageInput');
const dropzone = $('#dropzone');
if (input && dropzone) {
  let extractionSequence = 0;
  function selectExtractionVariant(index) {
    if (!extractedVariants[index]) return;
    selectedExtraction = index;
    extracted = extractedVariants[index];
    $$('#extractedSwatches [data-extraction-variant]').forEach((button, buttonIndex) => button.setAttribute('aria-pressed', String(buttonIndex === index)));
    const info = $('#extractionInfo');
    const action = $('#useExtraction');
    if (info) info.textContent = `${extracted.variantName} · ${extracted.detail}`;
    if (action) action.textContent = `Use ${extracted.variantName.toLowerCase()}`;
  }
  function renderExtractionVariants() {
    const container = $('#extractedSwatches');
    if (!container) return;
    container.innerHTML = extractedVariants.map((variant, index) => `<button type="button" class="extraction-variant" data-extraction-variant="${index}" aria-pressed="${index === selectedExtraction}" aria-label="Choose ${escape(variant.variantName)} palette"><span class="extraction-variant-head"><strong>${escape(variant.variantName)}</strong><small>${escape(variant.detail)}</small></span><span class="extraction-variant-colors" aria-hidden="true">${variant.colors.map(color => `<i style="--swatch:${color}"></i>`).join('')}</span></button>`).join('');
  }
  async function extract(file) {
    if (!file) return;
    const sequence = ++extractionSequence;
    const status = $('#extractStatus');
    if (!['image/png', 'image/jpeg', 'image/webp'].includes(file.type)) { if (status) status.textContent = 'Choose a JPG, PNG, or WebP image.'; return; }
    if (file.size > 20 * 1024 * 1024) { if (status) status.textContent = 'This image is a little large. Choose one smaller than 20 MB.'; return; }
    if (status) status.textContent = 'Finding the colors in your image…';
    const nextURL = URL.createObjectURL(file);
    try {
      const image = new Image();
      image.src = nextURL;
      await image.decode();
      if (sequence !== extractionSequence) { URL.revokeObjectURL(nextURL); return; }
      if (!image.width || !image.height) throw new Error('This image could not be read. Try another one.');
      const sample = document.createElement('canvas');
      const size = 180 / Math.max(image.width, image.height);
      sample.width = Math.max(1, Math.round(image.width * size));
      sample.height = Math.max(1, Math.round(image.height * size));
      const sampleContext = sample.getContext('2d', { willReadFrequently: true });
      sampleContext.drawImage(image, 0, 0, sample.width, sample.height);
      const result = extractPaletteVariants(sampleContext.getImageData(0, 0, sample.width, sample.height).data);
      const preview = document.createElement('canvas');
      const previewScale = Math.min(1, 720 / image.width, 480 / image.height);
      preview.width = Math.max(1, Math.round(image.width * previewScale));
      preview.height = Math.max(1, Math.round(image.height * previewScale));
      preview.getContext('2d').drawImage(image, 0, 0, preview.width, preview.height);
      const previewData = preview.toDataURL('image/jpeg', .82);
      if (imageURL) URL.revokeObjectURL(imageURL);
      imageURL = nextURL;
      extractedVariants = result.variants.map(variant => ({ id: `your-image-${variant.key}`, name: `Image · ${variant.name}`, variantName: variant.name, detail: variant.detail, description: variant.description, colors: variant.colors, image: previewData }));
      selectedExtraction = 0;
      const extractedImage = $('#extractedImage');
      if (extractedImage) extractedImage.src = imageURL;
      renderExtractionVariants();
      selectExtractionVariant(0);
      dropzone.classList.add('has-result');
      const resultPanel = $('#extractionResult');
      if (resultPanel) resultPanel.hidden = false;
      if (status) status.textContent = `Three readings ready from ${result.sampled} color clusters.`;
    } catch (error) {
      URL.revokeObjectURL(nextURL);
      if (status) status.textContent = error.message?.includes('visible pixels') ? error.message : 'This image could not be read. Try another JPG, PNG, or WebP.';
    } finally { input.value = ''; }
  }
  input.addEventListener('change', () => extract(input.files?.[0]));
  const changeImage = $('.change-image');
  if (changeImage) {
    changeImage.tabIndex = 0;
    changeImage.setAttribute('role', 'button');
    changeImage.addEventListener('keydown', event => { if (event.key === 'Enter' || event.key === ' ') { event.preventDefault(); input.click(); } });
  }
  for (const eventName of ['dragenter', 'dragover']) dropzone.addEventListener(eventName, event => { event.preventDefault(); dropzone.classList.add('is-over'); });
  for (const eventName of ['dragleave', 'drop']) dropzone.addEventListener(eventName, event => { event.preventDefault(); dropzone.classList.remove('is-over'); });
  dropzone.addEventListener('drop', event => extract(event.dataTransfer.files?.[0]));
  const extractedSwatches = $('#extractedSwatches');
  if (extractedSwatches) extractedSwatches.addEventListener('click', event => { const button = event.target.closest('[data-extraction-variant]'); if (button) selectExtractionVariant(Number(button.dataset.extractionVariant)); });
  const useExtraction = $('#useExtraction');
  if (useExtraction) useExtraction.addEventListener('click', () => {
    if (!extracted) return;
    persistPalette(extracted);
    location.href = `/studio/?p=${encodeURIComponent(extracted.id)}#studio`;
  });
}

renderSelection();
document.documentElement.classList.add('js');
if (window.IntersectionObserver) {
  const reveal = new IntersectionObserver(entries => {
    for (const entry of entries) if (entry.isIntersecting) { entry.target.classList.add('is-visible'); reveal.unobserve(entry.target); }
  }, { threshold: .06, rootMargin: '0px 0px 30px 0px' });
  $$('.reveal').forEach(element => reveal.observe(element));
}
const hashTarget = location.hash ? document.getElementById(decodeURIComponent(location.hash.slice(1))) : null;
if (hashTarget) requestAnimationFrame(() => hashTarget.scrollIntoView({ behavior: 'instant' }));
