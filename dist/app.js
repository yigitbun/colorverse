import { palettes } from './palettes.js?v=22';
import { roles, clamp, contrast, textOn, rgb, toHex, oklab, oklch, paletteFromColor, exportPalette, extractPaletteVariants, oklabDistance } from './color.js';
import { createAtlas, atlasWorlds } from './globe.js?v=24';
import { buildShadeFamilies, createShadeStudio } from './shade-studio.js?v=1';

const $ = selector => document.querySelector(selector);
const $$ = selector => [...document.querySelectorAll(selector)];
const escape = value => String(value).replace(/[&<>"']/g, character => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[character]));
const reduceMotion = matchMedia('(prefers-reduced-motion: reduce)');
const route = location.pathname.replace(/\/+$/, '') || '/';
const page = ({ '/explore': 'explore', '/extract': 'extract', '/studio': 'studio', '/about': 'about', '/community': 'community', '/lab': 'lab' })[route] || 'home';
const titles = {
  home: 'Explore palettes in context — ColorVerse',
  explore: 'Palette library — ColorVerse',
  extract: 'Image to palette — ColorVerse',
  studio: 'Studio — ColorVerse',
  about: 'Color guide — ColorVerse',
  community: 'Community — ColorVerse',
  lab: 'Lab — ColorVerse',
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
let roleDrag = null;
let activeColorIndex = 0;
let pendingSwapIndex = null;
document.body.dataset.page = page;
document.title = titles[page];

let savedAtlasWorldId;
try { savedAtlasWorldId = localStorage.getItem('colorverse-world'); } catch {}
const savedAtlasWorld = atlasWorlds.find(world => world.id === savedAtlasWorldId) || atlasWorlds[0];
function applyWorldAtmosphere(world) {
  document.documentElement.dataset.world = world?.id || atlasWorlds[0].id;
}
applyWorldAtmosphere(savedAtlasWorld);

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
  renderPaletteRoles();
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
  renderColorLab();
  if (updateURL) setPaletteURL();
}

function choosePalette(palette, notify = true) {
  if (!palette || !Array.isArray(palette.colors) || palette.colors.length < 5) return;
  current = palette;
  shadeSourceColors = current.colors.slice(0, 5);
  persistPalette(palette);
  renderSelection(true);
  if (notify) toast(`${palette.name} selected.`);
}

function swapPaletteColors(from, to) {
  if (from === to || from < 0 || to < 0 || from > 4 || to > 4) return;
  const colors = [...current.colors];
  [colors[from], colors[to]] = [colors[to], colors[from]];
  current = { ...current, id: current.id.startsWith('custom-') ? current.id : `custom-${current.id}`, colors };
  [shadeSourceColors[from], shadeSourceColors[to]] = [shadeSourceColors[to], shadeSourceColors[from]];
  persistPalette(current);
  renderSelection(true);
}

function replacePaletteColor(index, color, { keepShadeSource = false } = {}) {
  if (index < 0 || index > 4 || !/^#[0-9a-f]{6}$/i.test(color)) return;
  const colors = [...current.colors];
  colors[index] = color.toUpperCase();
  current = { ...current, id: current.id.startsWith('custom-') ? current.id : `custom-${current.id}`, name: current.name.replace(/^Custom · /, '') };
  current.colors = colors;
  if (!keepShadeSource) shadeSourceColors[index] = colors[index];
  persistPalette(current);
  renderSelection(true);
}

function announcePaletteOrder(color, index) {
  const status = $('#paletteOrderStatus');
  if (status) status.textContent = `${color} is now ${roles[index]}.`;
}

let colorTray = [];
try { colorTray = [...new Set(JSON.parse(localStorage.getItem('colorverse-color-tray') || '[]').filter(color => /^#[0-9a-f]{6}$/i.test(color)).map(color => color.toUpperCase()))].slice(0, 18); } catch {}

function saveColorTray() {
  try { localStorage.setItem('colorverse-color-tray', JSON.stringify(colorTray)); } catch {}
}

function colorCoordinates(hex) {
  const [lightness, a, b] = oklab(hex);
  return { lightness, chroma: Math.hypot(a, b), hue: (Math.atan2(b, a) * 180 / Math.PI + 360) % 360 };
}

// Keep the tonal scale anchored while trying its shades.
let shadeSourceColors = current.colors.slice(0, 5);
const trashIcon = '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M4 7h16M9 7V4h6v3M6 7l1 13h10l1-13M10 10v7M14 10v7"/></svg>';

function renderPaletteRoles() {
  const container = $('#paletteRoles');
  if (!container) return;
  container.innerHTML = current.colors.slice(0, 5).map((color, index) => `<div class="role-swatch${activeColorIndex === index ? ' is-selected' : ''}${pendingSwapIndex === index ? ' is-swap-source' : ''}" data-role-index="${index}">
    <span class="role-grip" aria-hidden="true" title="Drag onto another color to swap"><svg viewBox="0 0 10 16"><circle cx="2" cy="3" r="1.2"/><circle cx="8" cy="3" r="1.2"/><circle cx="2" cy="8" r="1.2"/><circle cx="8" cy="8" r="1.2"/><circle cx="2" cy="13" r="1.2"/><circle cx="8" cy="13" r="1.2"/></svg></span>
    <label class="role-color-control" style="--swatch:${color}" title="Click to change ${roles[index]} color"><input type="color" data-role-color="${index}" value="${color}" aria-label="Change ${roles[index]} color"><span aria-hidden="true"></span></label>
    <button class="role-select" type="button" data-role-select="${index}" aria-pressed="${activeColorIndex === index}" aria-label="Select ${roles[index]} for shades" aria-controls="colorLab">
      <span class="role-name">${roles[index]}</span><code>${color}</code>
    </button>
    <button class="role-action" type="button" data-role-swap="${index}" aria-label="${pendingSwapIndex === index ? 'Cancel swap' : `Swap ${roles[index]} with another role`}" title="Swap colors">↔</button>
  </div>`).join('');
}

function renderColorTray() {
  const tray = $('#colorTray');
  if (!tray) return;
  tray.innerHTML = colorTray.length ? colorTray.map(value => `<div class="tray-item">
    <button type="button" class="tray-use" style="--choice:${value}" data-use-color="${value}" aria-label="Use saved color ${value}"><i aria-hidden="true"></i><code>${value}</code></button>
    <button type="button" class="tray-remove" data-remove-color="${value}" aria-label="Remove ${value} from color tray" title="Remove color">${trashIcon}</button>
  </div>`).join('') : '<p>Keep colors here for later.</p>';
  $('#trayCount').textContent = `${colorTray.length} / 18`;
  const add = $('#addColorToTray');
  const saved = colorTray.includes(current.colors[activeColorIndex].toUpperCase());
  add.disabled = saved;
  add.querySelector('span').textContent = saved ? 'Added to color tray' : 'Add to color tray';
}

function renderColorLab() {
  const lab = $('#colorLab');
  if (!lab || !current.colors[activeColorIndex]) return;
  const color = current.colors[activeColorIndex].toUpperCase();
  const source = shadeSourceColors[activeColorIndex];
  const coordinates = colorCoordinates(source);
  $('#shadeRoleNameInline').textContent = roles[activeColorIndex];
  $('#shadeCurrentHex').textContent = color;
  const family = buildShadeFamilies(source)[0].colors;
  const shades = [...new Set([...family.filter((_, index) => index % 2 === 0), source])]
    .sort((a, b) => colorCoordinates(b).lightness - colorCoordinates(a).lightness);
  const shadeGrid = $('#colorShadeGrid');
  shadeGrid.innerHTML = shades.map(value => `<button type="button" style="--tone:${value};--tone-ink:${textOn(value)}" data-inline-shade="${value}" aria-pressed="${value === color}" aria-label="Apply shade ${value} to ${roles[activeColorIndex]}" title="${value}"><code>${value}</code><span aria-hidden="true">${value === color ? '✓' : ''}</span></button>`).join('');
  $('#shadeOptionCount').textContent = `${shades.length} tones`;
  const alternatives = [...new Set([-60, -45, -30, -15, 15, 30, 45, 60, -80, 80, -100, 100].map(offset =>
    oklch(clamp(coordinates.lightness, .3, .82), clamp(coordinates.chroma * 1.04, .06, .2), coordinates.hue + offset)))];
  $('#colorAlternativeGrid').innerHTML = alternatives.map(value => `<button type="button" style="--choice:${value};--on:${textOn(value)}" data-use-color="${value}" aria-label="Use alternative ${value}" title="${value}"><code>${value.slice(1)}</code></button>`).join('');
  const pairIndex = activeColorIndex === 0 ? 4 : 0;
  const pair = current.colors[pairIndex];
  $('#colorContrastPair').textContent = `vs ${roles[pairIndex].toLowerCase()}`;
  const candidates = [...new Set([...[.15, .3, .45, .6, .8, .92, .98].flatMap(lightness =>
    [0, 180].map(offset => oklch(lightness, Math.min(coordinates.chroma, .08), coordinates.hue + offset))), '#000000', '#FFFFFF'])]
    .filter(value => contrast(value, pair) >= 4.5)
    .sort((a, b) => oklabDistance(a, color) - oklabDistance(b, color));
  const contrastColors = [candidates[0], candidates.find(value => oklabDistance(value, candidates[0]) > .08) || candidates[1]].filter(Boolean);
  $('#colorContrastGrid').innerHTML = contrastColors.map(value => {
    const ratio = contrast(value, pair).toFixed(2);
    return `<button type="button" class="contrast-choice" data-use-color="${value}" title="${value} against ${pair}" aria-label="Use ${value}, contrast ${ratio} to 1 against ${roles[pairIndex]}"><span style="background:${activeColorIndex === 0 ? value : pair};color:${activeColorIndex === 0 ? pair : value}" aria-hidden="true">Aa</span><code>${ratio}:1</code></button>`;
  }).join('');
  renderColorTray();
}

let visiblePalettes = [...palettes];
function renderPaletteRail(items = visiblePalettes) {
  const rail = $('#paletteRail');
  if (!rail) return;
  rail.innerHTML = items.map((palette, index) => `<article class="palette-card" data-palette="${palette.id}">
    <div class="palette-card-head"><span>${escape(palette.category)}</span><span>${String(index + 1).padStart(2, '0')}</span></div>
    <div class="palette-card-colors" aria-label="Five palette colors">${palette.colors.slice(0, 5).map(color => swatch(color)).join('')}</div>
    <div class="palette-card-body"><h2><a data-select="${palette.id}" href="/studio/?p=${encodeURIComponent(palette.id)}#studio">${escape(palette.name)}</a></h2><p>${escape(palette.description)}</p><div class="palette-card-foot"><div class="palette-card-tags">${(palette.useCases || []).slice(0, 2).map(item => `<span>${escape(item)}</span>`).join('')}</div><a data-select="${palette.id}" href="/studio/?p=${encodeURIComponent(palette.id)}#studio" aria-label="Open ${escape(palette.name)} in Studio">Open ↗</a></div></div>
  </article>`).join('');
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
  if (color && !event.target.closest('.role-grip')) copy(color.dataset.copy, `${color.dataset.copy} copied.`);
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
const paletteRoles = $('#paletteRoles');
const shadeStudio = createShadeStudio({
  getPalette: () => current,
  onApply(index, color) { replacePaletteColor(index, color); toast(`${roles[index]} updated to ${color}.`); },
  onClose(index) { paletteRoles?.querySelector(`[data-role-select="${index}"]`)?.focus({ preventScroll: true }); },
});
$('#openShadeStudio')?.addEventListener('click', event => shadeStudio.open(activeColorIndex, event.currentTarget));
if (paletteRoles) {
  paletteRoles.addEventListener('click', event => {
    const swap = event.target.closest('[data-role-swap]');
    if (swap) {
      const index = Number(swap.dataset.roleSwap);
      if (pendingSwapIndex === null) {
        pendingSwapIndex = index;
        activeColorIndex = index;
        renderSelection();
        toast(`Choose another role to swap with ${roles[index]}.`);
      } else if (pendingSwapIndex === index) {
        pendingSwapIndex = null;
        renderSelection();
      } else {
        const from = pendingSwapIndex;
        pendingSwapIndex = null;
        activeColorIndex = index;
        swapPaletteColors(from, index);
        announcePaletteOrder(current.colors[index], index);
      }
      return;
    }
    const select = event.target.closest('[data-role-select]');
    if (!select) return;
    const index = Number(select.dataset.roleSelect);
    if (pendingSwapIndex !== null && pendingSwapIndex !== index) {
      const from = pendingSwapIndex;
      pendingSwapIndex = null;
      activeColorIndex = index;
      swapPaletteColors(from, index);
      announcePaletteOrder(current.colors[index], index);
    } else {
      activeColorIndex = index;
      renderSelection();
    }
    paletteRoles.querySelector(`[data-role-select="${index}"]`)?.focus({ preventScroll: true });
  });

  paletteRoles.addEventListener('keydown', event => {
    const select = event.target.closest('[data-role-select]');
    if (!select) return;
    const index = Number(select.dataset.roleSelect);
    let next = index;
    if (event.key === 'ArrowUp' || event.key === 'ArrowLeft') next = Math.max(0, index - 1);
    if (event.key === 'ArrowDown' || event.key === 'ArrowRight') next = Math.min(4, index + 1);
    if (event.key === 'Home') next = 0;
    if (event.key === 'End') next = 4;
    if (next === index) return;
    event.preventDefault();
    paletteRoles.querySelector(`[data-role-select="${next}"]`)?.focus();
  });

  paletteRoles.addEventListener('pointerdown', event => {
    const grip = event.target.closest('.role-grip');
    const swatch = grip?.closest('[data-role-index]');
    if (!swatch || event.button > 0) return;
    event.preventDefault();
    const index = Number(swatch.dataset.roleIndex);
    roleDrag = { from: index, target: index, color: current.colors[index] };
    document.body.classList.add('is-reordering-palette');
    swatch.classList.add('is-dragging');
  });

  window.addEventListener('pointermove', event => {
    if (!roleDrag) return;
    event.preventDefault();
    const target = document.elementFromPoint(event.clientX, event.clientY)?.closest?.('[data-role-index]');
    if (!target || !paletteRoles.contains(target)) return;
    const to = Number(target.dataset.roleIndex);
    roleDrag.target = to;
    paletteRoles.querySelectorAll('.is-drop-target').forEach(item => item.classList.remove('is-drop-target'));
    if (to !== roleDrag.from) target.classList.add('is-drop-target');
  }, { passive: false });

  const finishRoleDrag = () => {
    if (!roleDrag) return;
    const { color, from, target } = roleDrag;
    roleDrag = null;
    document.body.classList.remove('is-reordering-palette');
    paletteRoles.querySelector('.is-dragging')?.classList.remove('is-dragging');
    paletteRoles.querySelector('.is-drop-target')?.classList.remove('is-drop-target');
    if (from !== target) {
      activeColorIndex = target;
      swapPaletteColors(from, target);
      announcePaletteOrder(color, target);
    }
  };
  window.addEventListener('pointerup', finishRoleDrag);
  window.addEventListener('pointercancel', finishRoleDrag);
}

paletteRoles?.addEventListener('change', event => {
  const input = event.target.closest('[data-role-color]');
  if (!input) return;
  const index = Number(input.dataset.roleColor);
  const color = '#' + input.value.trim().replace(/^#/, '').toUpperCase();
  if (!/^#[0-9A-F]{6}$/.test(color)) {
    return;
  }
  input.setCustomValidity('');
  activeColorIndex = index;
  pendingSwapIndex = null;
  replacePaletteColor(index, color);
});
$('#colorLab')?.addEventListener('click', event => {
  const shade = event.target.closest('[data-inline-shade]');
  if (shade) {
    const color = shade.dataset.inlineShade;
    replacePaletteColor(activeColorIndex, color, { keepShadeSource: true });
    $('#colorShadeGrid').querySelector(`[data-inline-shade="${color}"]`)?.focus({ preventScroll: true });
    return;
  }
  const choice = event.target.closest('[data-use-color]');
  if (choice) {
    const containerId = choice.closest('[id]')?.id;
    const index = [...choice.parentElement.children].indexOf(choice);
    const color = choice.dataset.useColor;
    replacePaletteColor(activeColorIndex, color);
    const container = document.getElementById(containerId);
    (container?.querySelector(`[data-use-color="${color}"]`) || container?.children[index])?.focus?.({ preventScroll: true });
  }
  const remove = event.target.closest('[data-remove-color]');
  if (remove) {
    const buttons = [...$('#colorTray').querySelectorAll('[data-remove-color]')];
    const index = buttons.indexOf(remove);
    colorTray = colorTray.filter(color => color !== remove.dataset.removeColor);
    saveColorTray();
    renderColorTray();
    const next = [...$('#colorTray').querySelectorAll('[data-remove-color]')];
    (next[Math.min(index, next.length - 1)] || $('#addColorToTray')).focus({ preventScroll: true });
    $('#trayStatus').textContent = `${remove.dataset.removeColor} removed from color tray.`;
  }
});
$('#colorShadeGrid')?.addEventListener('keydown', event => {
  const buttons = [...event.currentTarget.querySelectorAll('button')];
  const index = buttons.indexOf(event.target);
  if (index < 0 || !['ArrowUp', 'ArrowDown', 'Home', 'End'].includes(event.key)) return;
  event.preventDefault();
  const next = event.key === 'Home' ? 0 : event.key === 'End' ? buttons.length - 1 : clamp(index + (event.key === 'ArrowDown' ? 1 : -1), 0, buttons.length - 1);
  buttons[next].focus();
});
$('#addColorToTray')?.addEventListener('click', () => {
  const color = current.colors[activeColorIndex].toUpperCase();
  if (!colorTray.includes(color)) {
    colorTray.unshift(color);
    colorTray = colorTray.slice(0, 18);
    saveColorTray();
    renderColorLab();
    toast(`${color} added to your color tray.`);
  }
});

function makeRandomPalette() {
  const randomValue = globalThis.crypto?.getRandomValues ? globalThis.crypto.getRandomValues(new Uint32Array(1))[0] : Math.floor(Math.random() * 0xFFFFFF);
  const seed = `#${(randomValue & 0xFFFFFF).toString(16).padStart(6, '0').toUpperCase()}`;
  const source = signatureFor(seed);
  return { id: `random-${seed.slice(1).toLowerCase()}`, name: 'Random direction', description: `A new five-color system generated around ${seed}.`, colors: paletteFromColor(seed), image: source.image, category: 'Generated', tags: ['random', 'generated'] };
}
const randomPaletteButton = $('#randomPalette');
if (randomPaletteButton) randomPaletteButton.addEventListener('click', () => {
  const palette = makeRandomPalette();
  persistPalette(palette);
  location.href = `/studio/?p=${encodeURIComponent(palette.id)}#studio`;
});

renderPaletteRail();
const rail = $('#paletteRail');
if (rail) {
  const search = $('#paletteSearch');
  const use = $('#paletteUse');
  let feeling = 'all';
  const useGroups = {
    digital: ['software', 'data', 'technology', 'gaming', 'digital products'],
    brand: ['retail', 'hospitality', 'packaging', 'campaigns', 'craft'],
    editorial: ['editorial', 'publishing', 'education'],
    lifestyle: ['wellness', 'beauty', 'fashion', 'food', 'travel', 'music', 'arts', 'events'],
  };
  const feelingGroups = {
    quiet: ['quiet', 'calm', 'minimal', 'soft', 'grounded', 'atmospheric'],
    vivid: ['vivid', 'bright', 'electric', 'neon', 'energetic', 'playful', 'high-contrast'],
    warm: ['warm', 'sunset', 'earthy', 'sun-baked', 'citrus', 'comforting'],
    cool: ['cool', 'aquatic', 'fresh', 'rain-washed', 'nocturnal'],
    dark: ['dark', 'nocturnal', 'mysterious', 'precise'],
  };
  const applyPaletteFilters = () => {
    const query = (search?.value || '').trim().toLowerCase();
    const useValue = use?.value || 'all';
    visiblePalettes = palettes.filter(palette => {
      const tags = palette.tags || [], useCases = palette.useCases || [];
      const searchable = [palette.name, palette.description, palette.category, ...tags, ...useCases, ...palette.colors].join(' ').toLowerCase();
      const matchesQuery = !query || query.split(/\s+/).every(token => searchable.includes(token));
      const matchesFeeling = feeling === 'all' || (feelingGroups[feeling] || []).some(tag => tags.includes(tag));
      const matchesUse = useValue === 'all' || useCases.some(item => useGroups[useValue]?.includes(item));
      return matchesQuery && matchesFeeling && matchesUse;
    });
    renderPaletteRail(visiblePalettes);
    const empty = $('#paletteEmpty');
    if (empty) empty.hidden = visiblePalettes.length > 0;
    const collectionIndex = $('#collectionIndex');
    if (collectionIndex) collectionIndex.textContent = `${visiblePalettes.length} palette${visiblePalettes.length === 1 ? '' : 's'}`;
  };
  search?.addEventListener('input', applyPaletteFilters);
  use?.addEventListener('change', applyPaletteFilters);
  $$('.palette-filter').forEach(button => button.addEventListener('click', () => {
    feeling = button.dataset.paletteFilter;
    $$('.palette-filter').forEach(item => {
      const active = item === button;
      item.classList.toggle('is-active', active);
      item.setAttribute('aria-pressed', String(active));
    });
    applyPaletteFilters();
  }));
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
  const homeExplorePresentation = {
    'warm-cafe': { title: 'Quiet House', image: '/assets/community/quiet-house-editorial.jpg', category: 'Brand system', context: 'hospitality · packaging' },
    'reef-current': { title: 'After Rain', image: '/assets/community/after-rain-editorial.jpg', category: 'Editorial system', context: 'print · culture' },
    'archive-green': { title: 'Archive Green', image: '/assets/community/archive-green-editorial.jpg', category: 'Material study', context: 'publishing · interiors' },
    'civic-shadow': { title: 'Civic Shadow', image: '/assets/home-explore/civic-shadow-project.jpg', category: 'Architecture identity', context: 'architecture · portfolio' },
    'market-signal': { title: 'Market Signal', image: '/assets/home-explore/market-signal-project.jpg', category: 'Retail identity', context: 'food · retail' },
    'after-hours': { title: 'After Hours', image: '/assets/home-explore/after-hours-project.jpg', category: 'Cultural identity', context: 'music · digital' },
  };
  const homeExploreGroups = {
    all: ['warm-cafe', 'reef-current', 'archive-green', 'civic-shadow', 'market-signal', 'after-hours'],
    brand: ['warm-cafe', 'market-signal', 'archive-green'],
    digital: ['after-hours', 'civic-shadow', 'reef-current'],
    spaces: ['civic-shadow', 'archive-green', 'warm-cafe'],
    editorial: ['reef-current', 'archive-green', 'after-hours', 'civic-shadow'],
  };
  const renderHomeExplore = (group = 'all') => {
    const grid = $('#homeExploreGrid');
    if (!grid) return;
    const items = (homeExploreGroups[group] || homeExploreGroups.all).map(id => palettes.find(palette => palette.id === id)).filter(Boolean);
    grid.innerHTML = items.length ? items.map((palette, index) => {
      const presentation = homeExplorePresentation[palette.id] || {};
      const title = presentation.title || palette.name;
      return `<article class="home-explore-card" style="--cover:${palette.colors[1]}">
      <a class="home-explore-media" href="/studio/?p=${encodeURIComponent(palette.id)}#studio" data-select="${palette.id}" aria-label="Open ${escape(title)} in Studio">
        <img src="${escape(presentation.image || palette.image)}" alt="${escape(title)} project presentation" width="1280" height="800" loading="${index < 3 ? 'eager' : 'lazy'}" decoding="async">
        <span class="home-explore-index">${String(index + 1).padStart(2, '0')}</span><span class="home-explore-category">${escape(presentation.category || palette.category)}</span>
        <span class="home-explore-caption"><strong>${escape(title)}</strong><span>${escape(presentation.context || (palette.useCases || []).slice(0, 2).join(' · '))}</span></span>
      </a>
      <div class="home-explore-colors" aria-label="${escape(title)} colors">${palette.colors.slice(0, 5).map(color => swatch(color)).join('')}</div>
      <div class="home-explore-copy"><p>${escape(palette.description)}</p><a href="/studio/?p=${encodeURIComponent(palette.id)}#studio" data-select="${palette.id}">Use palette →</a></div>
    </article>`;
    }).join('') : '<p class="home-explore-empty">No directions in this view yet.</p>';
    grid.querySelectorAll('img').forEach(image => image.addEventListener('error', () => {
      image.hidden = true;
      image.parentElement.classList.add('has-image-fallback');
    }));
  };
  renderHomeExplore();
  $$('.home-explore-filters [data-home-filter]').forEach(button => button.addEventListener('click', () => {
    $$('.home-explore-filters [data-home-filter]').forEach(item => item.setAttribute('aria-pressed', String(item === button)));
    renderHomeExplore(button.dataset.homeFilter);
  }));
  let activeAtlasWorld = savedAtlasWorld;
  let worldVariantIndex = 0;
  const atlasWorldSwitch = $('#atlasWorldSwitch');
  if (atlasWorldSwitch) {
    atlasWorldSwitch.innerHTML = `<span class="atlas-world-label">Worlds</span>${atlasWorlds.map((world, index) => `<button type="button" role="tab" data-atlas-world="${world.id}" aria-selected="${world.id === activeAtlasWorld.id}" tabindex="${world.id === activeAtlasWorld.id ? '0' : '-1'}" title="${escape(world.name)}"><span class="atlas-world-index">${String(index + 1).padStart(2, '0')}</span><span class="atlas-world-copy"><strong>${escape(world.shortName)}</strong><small>${escape(world.name)}</small></span><i class="atlas-world-chip" style="--world-accent:${world.accent}"></i></button>`).join('')}`;
    const useWorldStarter = (index = 0, notify = false) => {
      const starters = activeAtlasWorld.starters || [];
      if (!starters.length) return;
      worldVariantIndex = (index + starters.length) % starters.length;
      const starter = starters[worldVariantIndex];
      const source = signatureFor(starter.colors[2]);
      current = {
        id: `world-${activeAtlasWorld.id}-${worldVariantIndex + 1}`,
        name: starter.name,
        description: `${activeAtlasWorld.name} · starter ${worldVariantIndex + 1} of ${starters.length}.`,
        colors: [...starter.colors],
        image: source.image,
        category: activeAtlasWorld.type,
        tags: [activeAtlasWorld.id, 'world starter'],
      };
      persistPalette(current);
      renderSelection();
      const variation = $('#worldVariationLabel');
      if (variation) variation.textContent = `${String(worldVariantIndex + 1).padStart(2, '0')} / ${String(starters.length).padStart(2, '0')}`;
      if (notify) toast(`${starter.name} ready.`);
    };
    const renderAtlasWorld = () => {
      $$('#atlasWorldSwitch [data-atlas-world]').forEach(button => {
        const selected = button.dataset.atlasWorld === activeAtlasWorld.id;
        button.setAttribute('aria-selected', String(selected));
        button.tabIndex = selected ? 0 : -1;
      });
      $('.atlas-scene')?.style.setProperty('--atlas-field', activeAtlasWorld.accent);
      applyWorldAtmosphere(activeAtlasWorld);
      const label = $('#atlasWorldLabel');
      if (label) label.textContent = `${activeAtlasWorld.name} field`;
    };
    renderAtlasWorld();
    if (!params.get('p') && (!storedPalette || storedPalette.id?.startsWith('world-'))) useWorldStarter(0);
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
      useWorldStarter(0);
      try { localStorage.setItem('colorverse-world', nextWorld.id); } catch {}
      if (notify) toast(`${nextWorld.name} world selected.`);
    };
    atlasWorldSwitch.addEventListener('click', event => {
      const button = event.target.closest('[data-atlas-world]');
      if (button) selectAtlasWorld(button.dataset.atlasWorld);
    });
    atlasWorldSwitch.addEventListener('keydown', event => {
      if (!['ArrowLeft', 'ArrowRight', 'ArrowUp', 'ArrowDown', 'Home', 'End'].includes(event.key)) return;
      event.preventDefault();
      const buttons = $$('#atlasWorldSwitch [data-atlas-world]');
      const currentIndex = buttons.findIndex(button => button === document.activeElement);
      const nextIndex = event.key === 'Home' ? 0 : event.key === 'End' ? buttons.length - 1 : (currentIndex + (event.key === 'ArrowRight' || event.key === 'ArrowDown' ? 1 : -1) + buttons.length) % buttons.length;
      buttons[nextIndex].focus();
      selectAtlasWorld(buttons[nextIndex].dataset.atlasWorld);
    });
    setAtlasReadout(null);
    const clearAtlasSelection = $('#clearAtlasSelection');
    if (clearAtlasSelection) clearAtlasSelection.addEventListener('click', () => { atlasSelected = []; atlasPinned = null; globe.setSelection([]); renderAtlasSelection(); setAtlasReadout(atlasHover); });
    const useAtlasPalette = $('#useAtlasPalette');
    if (useAtlasPalette) useAtlasPalette.addEventListener('click', () => {
      const palette = buildAtlasPalette();
      if (!palette) return;
      persistPalette(palette);
      location.href = `/studio/?p=${encodeURIComponent(palette.id)}#studio`;
    });
    const nextWorldPalette = $('#nextWorldPalette');
    if (nextWorldPalette) nextWorldPalette.addEventListener('click', () => useWorldStarter(worldVariantIndex + 1, true));
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

if (page === 'community') {
  const projectInput = $('#projectInput');
  const submitProject = $('#submitProject');
  const composer = $('#projectComposer');
  const composerForm = $('#projectComposerForm');
  const composerPreview = $('#projectComposerPreview');
  const composerSource = $('#projectPaletteSource');
  const paletteEditor = $('#projectPaletteEditor');
  const projectTitle = $('#projectTitle');
  const projectPaletteName = $('#projectPaletteName');
  const communityNote = $('#communityNote');
  const communityGrid = $('.community-grid');
  let projectImageData = '';

  const renderProjectColors = colors => {
    if (!paletteEditor) return;
    paletteEditor.innerHTML = colors.slice(0, 5).map((color, index) => `<label><span>${roles[index]}</span><input type="color" value="${color}" aria-label="${roles[index]} color"><code>${color}</code></label>`).join('');
    paletteEditor.querySelectorAll('input').forEach(input => input.addEventListener('input', () => { input.nextElementSibling.textContent = input.value.toUpperCase(); }));
  };

  const readImagePalette = async file => {
    const url = URL.createObjectURL(file);
    try {
      const image = new Image();
      image.src = url;
      await image.decode();
      const canvas = document.createElement('canvas');
      const scale = 160 / Math.max(image.width, image.height);
      canvas.width = Math.max(1, Math.round(image.width * scale));
      canvas.height = Math.max(1, Math.round(image.height * scale));
      const imageContext = canvas.getContext('2d', { willReadFrequently: true });
      imageContext.drawImage(image, 0, 0, canvas.width, canvas.height);
      return extractPaletteVariants(imageContext.getImageData(0, 0, canvas.width, canvas.height).data).variants[0].colors;
    } finally { URL.revokeObjectURL(url); }
  };

  const readAsDataURL = file => new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result);
    reader.onerror = () => reject(new Error('This image could not be read.'));
    reader.readAsDataURL(file);
  });

  submitProject?.addEventListener('click', () => projectInput?.click());
  projectInput?.addEventListener('change', async () => {
    const file = projectInput.files?.[0];
    if (!file || !['image/png', 'image/jpeg', 'image/webp'].includes(file.type)) return;
    if (file.size > 20 * 1024 * 1024) {
      if (communityNote) communityNote.textContent = 'Choose an image under 20 MB so the review stays fast.';
      projectInput.value = '';
      return;
    }
    submitProject.disabled = true;
    submitProject.textContent = 'Preparing…';
    try {
      projectImageData = await readAsDataURL(file);
      if (composerPreview) composerPreview.src = projectImageData;
      const previous = readStoredPalette();
      const known = palettes.find(palette => palette.id === previous?.id);
      const colors = previous?.colors?.slice(0, 5) || await readImagePalette(file);
      renderProjectColors(colors);
      if (projectPaletteName) {
        projectPaletteName.value = known?.name || (previous && !/^Custom palette$/i.test(previous.name) ? previous.name : '');
        projectPaletteName.placeholder = previous ? 'Name this palette' : 'Name the suggested palette';
      }
      if (composerSource) composerSource.textContent = previous ? `Using ${known?.name || 'your latest Studio palette'}. Check every color before sharing.` : 'Suggested from the image. Check every color before sharing.';
      if (projectTitle) projectTitle.value = '';
      composer?.showModal();
      requestAnimationFrame(() => projectTitle?.focus());
    } catch {
      if (communityNote) communityNote.textContent = 'This image could not be prepared. Try another JPG, PNG, or WebP.';
    } finally {
      submitProject.disabled = false;
      submitProject.innerHTML = 'Share your work <span>↗</span>';
      projectInput.value = '';
    }
  });

  $('#closeProjectComposer')?.addEventListener('click', () => composer?.close());
  composer?.addEventListener('click', event => { if (event.target === composer) composer.close(); });
  composerForm?.addEventListener('submit', event => {
    event.preventDefault();
    if (!composerForm.reportValidity() || !projectImageData || !communityGrid) return;
    const title = projectTitle.value.trim();
    const paletteName = projectPaletteName.value.trim();
    const category = $('#projectCategory').value;
    const colors = [...paletteEditor.querySelectorAll('input')].map(input => input.value.toUpperCase());
    const id = `guest-${Date.now()}`;
    const card = document.createElement('article');
    card.className = 'community-card community-card-new';
    card.dataset.category = category.toLowerCase();
    card.dataset.project = id;
    card.innerHTML = `<div class="community-art"><img src="${projectImageData}" alt="${escape(title)} project preview"><span>${escape(title)}</span></div><div class="community-card-meta"><div><span class="eyebrow">${escape(category)} · ${escape(paletteName)}</span><h2>${escape(title)}</h2><small>Guest preview · review pending</small></div><button class="vote-button" data-vote="${id}" aria-label="Upvote ${escape(title)} project"><span>↑</span><b>0</b></button></div><div class="community-card-actions"><button type="button" class="community-use" data-community-colors="${colors.join(',')}" data-community-name="${escape(paletteName)}">Use palette →</button><span>5 colors · palette confirmed</span></div><div class="community-palette">${colors.map(color => `<i style="--swatch:${color}"></i>`).join('')}</div>`;
    communityGrid.prepend(card);
    window.dispatchEvent(new CustomEvent('colorverse:community-card', { detail: { card } }));
    if (communityNote) communityNote.textContent = 'Your reviewed project is saved on this device as a community preview.';
    composer.close();
    composerForm.reset();
  });

  document.addEventListener('click', event => {
    const use = event.target.closest('[data-community-colors]');
    if (!use) return;
    const colors = use.dataset.communityColors.split(',');
    const palette = { id: 'community-custom', name: use.dataset.communityName || 'Community palette', description: 'A palette taken from a community project.', colors, image: projectImageData || palettes[0].image, category: 'Community', tags: ['community'] };
    persistPalette(palette);
    location.href = `/studio/?p=${palette.id}#studio`;
  });
}

const input = $('#imageInput');
const dropzone = $('#dropzone');
if (input && dropzone) {
  let extractionSequence = 0;
  let extractionSample = null;
  let pickerPositions = [];
  let pickerDrag = null;
  const supportedImageTypes = new Set(['image/png', 'image/jpeg', 'image/webp']);
  const isSupportedImage = file => Boolean(file && supportedImageTypes.has(file.type));
  const imageFileFromBlob = (blob, name = 'pasted-image.png') => new File([blob], name, { type: blob.type || 'image/png', lastModified: Date.now() });
  const clipboardImageFromItems = items => {
    const imageItem = [...(items || [])].find(item => item.kind === 'file' && isSupportedImage({ type: item.type }));
    return imageItem?.getAsFile?.() || null;
  };
  const clipboardImageFromData = clipboardData => clipboardImageFromItems(clipboardData?.items)
    || [...(clipboardData?.files || [])].find(isSupportedImage)
    || null;
  async function readClipboardImage() {
    if (!navigator.clipboard?.read) return null;
    const clipboardItems = await navigator.clipboard.read();
    for (const item of clipboardItems) {
      const imageType = item.types.find(type => supportedImageTypes.has(type));
      if (imageType) return imageFileFromBlob(await item.getType(imageType));
    }
    return null;
  }
  function locatePickerPositions(colors) {
    if (!extractionSample) return [];
    const { width, height, pixels } = extractionSample;
    const used = [];
    return colors.map(color => {
      const target = rgb(color);
      let best = { score: Infinity, x: width / 2, y: height / 2 };
      for (let y = 0; y < height; y++) {
        for (let x = 0; x < width; x++) {
          const offset = (y * width + x) * 4;
          if (pixels[offset + 3] < 128) continue;
          const distance = (pixels[offset] - target[0]) ** 2 + (pixels[offset + 1] - target[1]) ** 2 + (pixels[offset + 2] - target[2]) ** 2;
          const crowded = used.some(point => Math.hypot(point.x - x, point.y - y) < Math.max(5, Math.min(width, height) * .06));
          const score = distance + (crowded ? 5400 : 0);
          if (score < best.score) best = { score, x, y };
        }
      }
      used.push(best);
      return { x: (best.x + .5) / width * 100, y: (best.y + .5) / height * 100 };
    });
  }
  function renderImagePickers(reposition = false) {
    const layer = $('#imagePickers');
    if (!layer || !extracted?.colors) return;
    if (reposition || pickerPositions.length !== extracted.colors.length) pickerPositions = locatePickerPositions(extracted.colors);
    layer.innerHTML = extracted.colors.map((color, index) => {
      const point = pickerPositions[index] || { x: 50, y: 50 };
      return `<button type="button" class="image-picker" data-image-picker="${index}" style="--picker:${color};--picker-on:${textOn(color)};left:${point.x}%;top:${point.y}%" aria-label="Move sample ${index + 1}, currently ${color}"><b>${index + 1}</b><span>${color}</span></button>`;
    }).join('');
  }
  function sampleColorAt(xPercent, yPercent) {
    if (!extractionSample) return null;
    const { width, height, pixels } = extractionSample;
    const centerX = clamp(Math.round(xPercent / 100 * (width - 1)), 0, width - 1);
    const centerY = clamp(Math.round(yPercent / 100 * (height - 1)), 0, height - 1);
    const sum = [0, 0, 0];
    let count = 0;
    for (let y = Math.max(0, centerY - 2); y <= Math.min(height - 1, centerY + 2); y++) {
      for (let x = Math.max(0, centerX - 2); x <= Math.min(width - 1, centerX + 2); x++) {
        const offset = (y * width + x) * 4;
        if (pixels[offset + 3] < 128) continue;
        for (let channel = 0; channel < 3; channel++) sum[channel] += pixels[offset + channel];
        count++;
      }
    }
    return count ? toHex(sum.map(value => value / count)) : null;
  }
  function updatePicker(index, event) {
    const wrap = $('#extractedImageWrap');
    const variant = extractedVariants[selectedExtraction];
    if (!wrap || !variant) return;
    const bounds = wrap.getBoundingClientRect();
    const x = clamp((event.clientX - bounds.left) / bounds.width * 100, 0, 100);
    const y = clamp((event.clientY - bounds.top) / bounds.height * 100, 0, 100);
    const color = sampleColorAt(x, y);
    if (!color) return;
    pickerPositions[index] = { x, y };
    variant.colors[index] = color;
    extracted = variant;
    const picker = $(`[data-image-picker="${index}"]`);
    if (picker) {
      picker.style.left = `${x}%`;
      picker.style.top = `${y}%`;
      picker.style.setProperty('--picker', color);
      picker.style.setProperty('--picker-on', textOn(color));
      picker.querySelector('span').textContent = color;
      picker.setAttribute('aria-label', `Move sample ${index + 1}, currently ${color}`);
    }
    const variantButton = $(`[data-extraction-variant="${selectedExtraction}"]`);
    const colorChip = variantButton?.querySelectorAll('.extraction-variant-colors i')[index];
    const colorValue = variantButton?.querySelectorAll('.extraction-variant-values code')[index];
    if (colorChip) colorChip.style.setProperty('--swatch', color);
    if (colorValue) colorValue.textContent = color;
  }
  function selectExtractionVariant(index) {
    if (!extractedVariants[index]) return;
    const changed = selectedExtraction !== index || pickerPositions.length === 0;
    selectedExtraction = index;
    extracted = extractedVariants[index];
    $$('#extractedSwatches [data-extraction-variant]').forEach((button, buttonIndex) => button.setAttribute('aria-pressed', String(buttonIndex === index)));
    const info = $('#extractionInfo');
    const action = $('#useExtraction');
    if (info) info.textContent = `${extracted.variantName} · ${extracted.detail}`;
    if (action) action.textContent = `Use ${extracted.variantName.toLowerCase()}`;
    renderImagePickers(changed);
  }
  function renderExtractionVariants() {
    const container = $('#extractedSwatches');
    if (!container) return;
    container.innerHTML = extractedVariants.map((variant, index) => `<button type="button" class="extraction-variant" data-extraction-variant="${index}" aria-pressed="${index === selectedExtraction}" aria-label="Choose ${escape(variant.variantName)} palette"><span class="extraction-variant-head"><strong>${escape(variant.variantName)}</strong><small>${escape(variant.detail)}</small></span><span class="extraction-variant-colors" aria-hidden="true">${variant.colors.map(color => `<i style="--swatch:${color}"></i>`).join('')}</span><span class="extraction-variant-values" aria-hidden="true">${variant.colors.map(color => `<code>${color}</code>`).join('')}</span></button>`).join('');
  }
  async function extract(file) {
    if (!file) return;
    const sequence = ++extractionSequence;
    const status = $('#extractStatus');
    if (!isSupportedImage(file)) { if (status) status.textContent = 'Choose a JPG, PNG, or WebP image.'; return; }
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
      const sampleData = sampleContext.getImageData(0, 0, sample.width, sample.height);
      const result = extractPaletteVariants(sampleData.data);
      const preview = document.createElement('canvas');
      const previewScale = Math.min(1, 720 / image.width, 480 / image.height);
      preview.width = Math.max(1, Math.round(image.width * previewScale));
      preview.height = Math.max(1, Math.round(image.height * previewScale));
      preview.getContext('2d').drawImage(image, 0, 0, preview.width, preview.height);
      const previewData = preview.toDataURL('image/jpeg', .82);
      if (imageURL) URL.revokeObjectURL(imageURL);
      imageURL = nextURL;
      extractionSample = { width: sample.width, height: sample.height, pixels: sampleData.data };
      extractedVariants = result.variants.map(variant => ({ id: `your-image-${variant.key}`, name: `Image · ${variant.name}`, variantName: variant.name, detail: variant.detail, description: variant.description, colors: variant.colors, image: previewData }));
      selectedExtraction = 0;
      pickerPositions = [];
      const extractedImage = $('#extractedImage');
      // Use the generated local preview instead of the temporary blob URL. This
      // is more reliable in embedded browsers and keeps the preview browser-local.
      if (extractedImage) extractedImage.src = previewData;
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
  const pasteImage = $('#pasteImage');
  async function pasteFromClipboard() {
    const status = $('#extractStatus');
    if (status) status.textContent = 'Reading the image from your clipboard…';
    try {
      const file = await readClipboardImage();
      if (!file) throw new Error('No image found');
      await extract(file);
    } catch {
      if (status) status.textContent = 'No supported image found. Copy an image, then try again.';
    }
  }
  pasteImage?.addEventListener('click', pasteFromClipboard);
  window.addEventListener('paste', event => {
    const file = clipboardImageFromData(event.clipboardData);
    if (!file) return;
    event.preventDefault();
    extract(file);
  }, true);
  const changeImage = $('.change-image');
  if (changeImage) {
    changeImage.tabIndex = 0;
    changeImage.setAttribute('role', 'button');
    changeImage.addEventListener('keydown', event => { if (event.key === 'Enter' || event.key === ' ') { event.preventDefault(); input.click(); } });
  }
  for (const eventName of ['dragenter', 'dragover']) dropzone.addEventListener(eventName, event => { event.preventDefault(); dropzone.classList.add('is-over'); });
  for (const eventName of ['dragleave', 'drop']) dropzone.addEventListener(eventName, event => { event.preventDefault(); dropzone.classList.remove('is-over'); });
  dropzone.addEventListener('drop', event => extract(event.dataTransfer.files?.[0] || clipboardImageFromData(event.dataTransfer)));
  const extractedSwatches = $('#extractedSwatches');
  if (extractedSwatches) extractedSwatches.addEventListener('click', event => { const button = event.target.closest('[data-extraction-variant]'); if (button) selectExtractionVariant(Number(button.dataset.extractionVariant)); });
  const imagePickers = $('#imagePickers');
  if (imagePickers) {
    imagePickers.addEventListener('pointerdown', event => {
      const picker = event.target.closest('[data-image-picker]');
      if (!picker || event.button > 0) return;
      event.preventDefault();
      const index = Number(picker.dataset.imagePicker);
      pickerDrag = { index, pointerId: event.pointerId };
      picker.setPointerCapture(event.pointerId);
      picker.classList.add('is-dragging');
      updatePicker(index, event);
    });
    imagePickers.addEventListener('pointermove', event => {
      if (!pickerDrag || pickerDrag.pointerId !== event.pointerId) return;
      event.preventDefault();
      updatePicker(pickerDrag.index, event);
    }, { passive: false });
    const finishPickerDrag = event => {
      if (!pickerDrag || (event.pointerId !== undefined && pickerDrag.pointerId !== event.pointerId)) return;
      imagePickers.querySelector('.is-dragging')?.classList.remove('is-dragging');
      pickerDrag = null;
      renderExtractionVariants();
      selectExtractionVariant(selectedExtraction);
      const status = $('#extractStatus');
      if (status) status.textContent = 'Custom sample updated. Drag another point or continue to Studio.';
    };
    imagePickers.addEventListener('pointerup', finishPickerDrag);
    imagePickers.addEventListener('pointercancel', finishPickerDrag);
    imagePickers.addEventListener('lostpointercapture', finishPickerDrag);
  }
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
