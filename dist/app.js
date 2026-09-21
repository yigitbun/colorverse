import { palettes } from './palettes.js?v=27';
import { roles, clamp, contrast, textOn, rgb, toHex, oklab, oklch, paletteFromColor, exportPalette, extractPaletteVariants, oklabDistance } from './color.js';
import { createAtlas, atlasWorlds } from './globe.js?v=27';
import { buildShadeFamilies } from './shade-studio.js?v=1';
import { createColorGlobe } from './color-globe.js?v=2';
import { SUPPORTED_IMAGE_TYPES, validateImageFile } from './image-file.js?v=1';

const $ = selector => document.querySelector(selector);
const $$ = selector => [...document.querySelectorAll(selector)];
const escape = value => String(value).replace(/[&<>"']/g, character => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[character]));
const reduceMotion = matchMedia('(prefers-reduced-motion: reduce)');
const route = location.pathname.replace(/\/+$/, '') || '/';
const page = ({ '/explore': 'explore', '/extract': 'extract', '/studio': 'studio', '/about': 'about', '/community': 'community', '/lab': 'lab', '/inspiration': 'inspiration', '/editions/skincare-system-01': 'edition', '/editions/drift-field-01': 'editionDrift' })[route] || 'home';
const titles = {
  home: 'Explore palettes in context — ColorVerse',
  explore: 'Palette library — ColorVerse',
  extract: 'Image to palette — ColorVerse',
  studio: 'Studio — ColorVerse',
  about: 'Color guide — ColorVerse',
  community: 'Community — ColorVerse',
  lab: 'Lab — ColorVerse',
  inspiration: 'Inspiration — ColorVerse',
  edition: 'Soft Structure — ColorVerse Editions',
  editionDrift: 'Field 01 — DRIFT — ColorVerse Editions',
};
const params = new URLSearchParams(location.search);
const track = (name, detail) => window.colorverseTrack?.(name, detail);
let toastTimer;

function readStoredPalette() {
  try {
    const stored = JSON.parse(sessionStorage.getItem('colorverse-current-palette') || 'null');
    if (stored && Array.isArray(stored.colors) && stored.colors.length >= 5 && stored.colors.every(color => /^#[0-9a-f]{6}$/i.test(color))) return stored;
  } catch {}
  return null;
}

const specialEditions = [{
  id: 'drift-field-01',
  sourcePaletteId: 'drift-field-01',
  name: 'Field 01',
  brand: 'DRIFT',
  series: 'DRIFT / Field 01',
  description: 'A quiet footwear system built from mineral tones, tactile materials, and one precise silhouette.',
  colors: ['#E8E1D5', '#8A927C', '#B68B70', '#A8A0AD', '#34383A'],
  image: '/assets/editions/drift-field-01-colorways-v1.png',
  category: 'ColorVerse Edition · Footwear study',
  tags: ['footwear', 'cmf', 'product'],
  useCases: ['footwear · product', 'retail · campaign'],
}];
const editionPalettes = [...palettes, ...specialEditions];
const requestedPalette = editionPalettes.find(palette => palette.id === params.get('p'));
const storedPalette = readStoredPalette();
let current = requestedPalette || (storedPalette && (!params.get('p') || storedPalette.id === params.get('p')) ? storedPalette : palettes[0]);
let context = 'landing';
let productKind = current.id === 'skincare-system-01' ? 'skincare' : current.id === 'drift-field-01' ? 'footwear' : 'footwear';
let format = 'css';
let extracted = null;
let extractedVariants = [];
let selectedExtraction = 0;
let imageURL = null;
let roleDrag = null;
let activeColorIndex = 0;
let pendingSwapIndex = null;
let openShadeIndex = null;
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
  if (page === 'studio') window.dispatchEvent(new CustomEvent('colorverse:studiochange'));
}

function choosePalette(palette, notify = true) {
  if (!palette || !Array.isArray(palette.colors) || palette.colors.length < 5) return;
  current = palette;
  if (palette.id === 'skincare-system-01') productKind = 'skincare';
  else if (palette.id === 'drift-field-01') productKind = 'footwear';
  shadeSourceColors = current.colors.slice(0, 5);
  persistPalette(palette);
  renderSelection(true);
  track('palette_open', { source: page === 'community' ? 'community' : 'library' });
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
  track('color_edit', { method: 'swap' });
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

function studioSnapshot() {
  const sourcePaletteId = current.sourcePaletteId || (palettes.some(palette => palette.id === current.id) ? current.id : null);
  return {
    name: current.name || 'Untitled palette',
    sourcePaletteId,
    colors: current.colors.slice(0, 5).map(color => color.toUpperCase()),
    roles: Object.fromEntries(roles.map((role, index) => [role.toLowerCase(), current.colors[index].toUpperCase()])),
    context,
    productKind,
  };
}

function loadStudioSnapshot(snapshot) {
  if (!snapshot || !Array.isArray(snapshot.colors) || snapshot.colors.length !== 5 || !snapshot.colors.every(color => /^#[0-9a-f]{6}$/i.test(color))) return;
  const colors = snapshot.colors.map(color => color.toUpperCase());
  const source = signatureFor(colors[2]);
  current = {
    id: `project-${snapshot.id || Date.now()}`,
    name: snapshot.name || 'Saved project',
    description: 'A private ColorVerse project restored from your latest saved version.',
    colors,
    image: source.image,
    category: 'Saved project',
    tags: ['project'],
    sourcePaletteId: snapshot.sourcePaletteId || null,
  };
  context = ['landing', 'interface', 'presentation'].includes(snapshot.context) ? snapshot.context : 'landing';
  productKind = snapshot.productKind && ['footwear', 'skincare', 'object'].includes(snapshot.productKind) ? snapshot.productKind : 'footwear';
  activeColorIndex = 0;
  pendingSwapIndex = null;
  openShadeIndex = null;
  shadeSourceColors = [...colors];
  $$('[data-context]').forEach(button => {
    const selected = button.dataset.context === context;
    button.setAttribute('aria-selected', String(selected));
    button.tabIndex = selected ? 0 : -1;
  });
  renderProductPicker();
  renderContextCaption();
  persistPalette(current);
  renderSelection(false);
  toast(`${current.name} resumed.`);
}

window.colorverseStudio = { getSnapshot: studioSnapshot, loadSnapshot: loadStudioSnapshot };

function announcePaletteOrder(color, index) {
  const status = $('#paletteOrderStatus');
  if (status) status.textContent = `${color} is now ${roles[index]}.`;
}

let colorTray = [];
try { colorTray = [...new Set(JSON.parse(localStorage.getItem('colorverse-color-tray') || '[]').filter(color => /^#[0-9a-f]{6}$/i.test(color)).map(color => color.toUpperCase()))].slice(0, 18); } catch {}

function saveColorTray() {
  try { localStorage.setItem('colorverse-color-tray', JSON.stringify(colorTray)); } catch {}
}

function announceColorTrayChange() {
  window.dispatchEvent(new CustomEvent('colorverse:traychange', { detail: { colors: [...colorTray] } }));
}

window.addEventListener('colorverse:trayremote', event => {
  const remote = Array.isArray(event.detail?.colors) ? event.detail.colors : [];
  colorTray = [...new Set([...remote, ...colorTray])]
    .filter(color => /^#[0-9a-f]{6}$/i.test(color))
    .map(color => color.toUpperCase())
    .slice(0, 18);
  saveColorTray();
  renderColorLab();
  if (remote.length || colorTray.length) announceColorTrayChange();
});

window.addEventListener('colorverse:trayerror', () => {
  const status = $('#trayStatus');
  if (status) status.textContent = 'Account sync is unavailable. Your colors remain saved in this browser.';
  toast('Account sync is unavailable; your local tray is safe.');
});

function colorCoordinates(hex) {
  const [lightness, a, b] = oklab(hex);
  return { lightness, chroma: Math.hypot(a, b), hue: (Math.atan2(b, a) * 180 / Math.PI + 360) % 360 };
}

// Keep the tonal scale anchored while trying its shades.
let shadeSourceColors = current.colors.slice(0, 5);
const trashIcon = '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M4 7h16M9 7V4h6v3M6 7l1 13h10l1-13M10 10v7M14 10v7"/></svg>';

function inlineShadeValues(index) {
  const source = shadeSourceColors[index] || current.colors[index];
  const family = buildShadeFamilies(source)[0]?.colors || [source];
  return [...new Set(family)].sort((a, b) => colorCoordinates(b).lightness - colorCoordinates(a).lightness);
}

function renderPaletteRoles() {
  const container = $('#paletteRoles');
  if (!container) return;
  container.innerHTML = current.colors.slice(0, 5).map((color, index) => `<div class="role-swatch${activeColorIndex === index ? ' is-selected' : ''}${pendingSwapIndex === index ? ' is-swap-source' : ''}" data-role-index="${index}">
    <span class="role-grip" aria-hidden="true" title="Drag onto another color to swap"><svg viewBox="0 0 10 16"><circle cx="2" cy="3" r="1.2"/><circle cx="8" cy="3" r="1.2"/><circle cx="2" cy="8" r="1.2"/><circle cx="8" cy="8" r="1.2"/><circle cx="2" cy="13" r="1.2"/><circle cx="8" cy="13" r="1.2"/></svg></span>
    <button class="role-color-control" type="button" data-role-color="${index}" style="--swatch:${color}" title="Explore ${roles[index]} in Color Globe" aria-label="Change ${roles[index]} color in Color Globe" aria-haspopup="dialog" aria-controls="colorGlobe"><span aria-hidden="true"></span></button>
    <button class="role-select" type="button" data-role-select="${index}" aria-pressed="${activeColorIndex === index}" aria-label="Show shades for ${roles[index]}" aria-controls="paletteRoles">
      <span class="role-name">${roles[index]}</span><code>${color}</code>
    </button>
    <button class="role-action" type="button" data-role-swap="${index}" aria-label="${pendingSwapIndex === index ? 'Cancel swap' : `Swap ${roles[index]} with another role`}" title="Swap colors">↔</button>
    ${openShadeIndex === index ? `<div class="role-shade-overlay" data-shade-overlay="${index}"><div class="inline-shade-strip" role="listbox" aria-label="Choose a shade for ${roles[index]}">${inlineShadeValues(index).map(value => `<button type="button" data-inline-role-shade="${index}" data-inline-shade="${value}" aria-selected="${value === color}" title="${value}" style="--tone:${value};--tone-ink:${textOn(value)}"><span class="sr-only">${value}</span></button>`).join('')}</div></div>` : ''}
  </div>`).join('');
}

function closeInlineShade(index, after) {
  const overlay = document.querySelector(`[data-shade-overlay="${index}"]`);
  openShadeIndex = null;
  if (!overlay) { after?.(); return; }
  overlay.classList.add('is-closing');
  let finished = false;
  const finish = () => {
    if (finished) return;
    finished = true;
    after?.();
  };
  overlay.addEventListener('animationend', finish, { once: true });
  window.setTimeout(finish, 230);
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
  panel.style.setProperty('--p-material', current.colors[activeColorIndex]);
  panel.setAttribute('aria-labelledby', `tab-${context}`);
  const packagingKit = current.id === 'skincare-system-01'
    ? `<div class="mockup context-kit edition-packaging-kit">
      <header><span class="kit-kicker">ColorVerse Edition / care objects</span><b>CV / SS</b><small>Soft Structure · Series 01</small></header>
      <div class="edition-pack-scene" role="img" aria-label="Soft Structure palette applied to five care objects">
        <article class="edition-tube edition-tube-1" style="--pack:var(--p-bg);--pack-ink:var(--p-text)"><span>CV / SS</span><div><strong>Cleanse</strong><small>Balance · purify · refresh</small></div><b>100 ml</b></article>
        <article class="edition-tube edition-tube-2" style="--pack:var(--p-surface);--pack-ink:var(--p-text)"><span>CV / SS</span><div><strong>Veil</strong><small>Hydrate · support · replenish</small></div><b>75 ml</b></article>
        <article class="edition-tube edition-tube-3" style="--pack:var(--p-primary);--pack-ink:var(--on-primary)"><span>CV / SS</span><div><strong>Polish</strong><small>Refine · smooth · renew</small></div><b>60 ml</b></article>
        <article class="edition-tube edition-tube-4" style="--pack:var(--p-accent);--pack-ink:var(--p-text)"><span>CV / SS</span><div><strong>Mask</strong><small>Soothe · restore · fortify</small></div><b>75 ml</b></article>
        <article class="edition-tube edition-tube-5" style="--pack:var(--p-text);--pack-ink:var(--p-bg)"><span>CV / SS</span><div><strong>Night</strong><small>Repair · smooth · revive</small></div><b>75 ml</b></article>
      </div>
      <footer><span>Shared silhouette</span><span>Color-coded formula</span><span>Consistent hierarchy</span><span>Production study</span></footer>
    </div>`
    : current.id === 'drift-field-01'
      ? `<div class="mockup context-kit edition-footwear-kit">
      <header><span class="kit-kicker">ColorVerse Edition / footwear study</span><b>DRIFT</b><small>Field 01 · Series 01</small></header>
      <div class="edition-footwear-scene"><div class="edition-footwear-image"><img src="/assets/editions/drift-field-01-colorways-v1.png" alt="DRIFT Field 01 footwear family in stone, meadow and graphite colorways"><span>FIELD 01</span></div><aside><span class="kit-kicker">Material map</span><strong>Quiet utility.</strong><p>One silhouette, three colorways, four tactile surfaces.</p><dl><div><dt>Upper</dt><dd>Mesh · suede</dd></div><div><dt>Colorways</dt><dd>Stone · Meadow · Graphite</dd></div><div><dt>Base</dt><dd>Modular rubber</dd></div></dl></aside></div>
      <footer><span>Everyday silhouette</span><span>Material-led colour</span><span>CMF direction</span><span>Original study</span></footer>
    </div>`
      : `<div class="mockup context-kit packaging-kit"><header><span class="kit-kicker">Packaging system / small batch</span><b>Field & Form</b><small>Collection 03</small></header><div class="package-scene"><div class="package-box package-box-tall"><span>FIELD<br>& FORM</span><small>Botanical wash<br>250 ml</small><i>03</i></div><div class="package-box package-box-wide"><span>EVERYDAY<br>RITUALS</span><small>Five mineral soaps</small><i>05</i></div><div class="package-bottle"><span>F&F</span><small>01</small></div><div class="package-card"><span>Care notes</span><b>Made slowly.<br>Used daily.</b><p>Plant-based formulas / recyclable paper / batch no. 026</p><i></i></div></div><footer><span>Primary pack</span><span>Gift set</span><span>Label system</span><span>Insert card</span></footer></div>`;
  const productConfig = {
    footwear: { label: 'Footwear / Field study', title: 'Field 01', image: '/assets/editions/drift-field-01-colorways-v1.png', detail: 'One silhouette. Three directions.', specs: 'Mesh · suede · modular rubber' },
    skincare: { label: 'Skincare / Series study', title: 'Soft Structure', image: '/assets/editions/skincare-system-01-v1.jpg', detail: 'Five objects. One quiet system.', specs: 'Matte polymer · ribbed cap · mono print' },
    object: { label: 'Object / Material study', title: 'Everyday object', image: '/assets/palette-library/ceramic-still-life.jpg', detail: 'A useful object with a considered surface.', specs: 'Ceramic · dry glaze · tactile form' },
  }[productKind] || { label: 'Footwear / Field study', title: 'Field 01', image: '/assets/editions/drift-field-01-colorways-v1.png', detail: 'One silhouette. Three directions.', specs: 'Mesh · suede · modular rubber' };
  const productPreview = `<div class="mockup context-kit product-preview-kit"><header><div><span class="kit-kicker">${escape(productConfig.label)}</span><h4>${escape(productConfig.title)}</h4></div><span class="product-preview-meta">ColorVerse / product direction</span></header><div class="product-preview-stage"><div class="product-preview-image"><img src="${productConfig.image}" alt="${escape(productConfig.title)} product preview"><span>Palette in context</span></div><aside><strong>${escape(productConfig.detail)}</strong><p>${escape(productConfig.specs)}</p><div class="product-preview-swatches" aria-label="Applied product colors">${current.colors.slice(0, 5).map((color, index) => `<i style="--swatch:${color}" title="${roles[index]} ${color}"></i>`).join('')}</div><small>Click a color to tune the direction.</small></aside></div><footer><span>Product study</span><span>Colour / material direction</span><span>Original ColorVerse concept</span></footer></div>`;
  const layouts = {
    landing: productPreview,
    interface: `<div class="mockup context-kit product-kit">
      <header class="product-kit-head"><b>Northstar</b><label aria-hidden="true">Search workspace <span>⌘ K</span></label><i class="product-avatar">AY</i></header>
      <div class="product-kit-shell"><aside><strong>Overview</strong><span>Projects</span><span>Customers</span><span>Reports</span><small>Workspace</small><span>Team</span><span>Settings</span></aside>
      <main><div class="product-title"><div><span class="kit-kicker">Monday, September 19</span><h4>Good morning.</h4></div><button type="button">New report <b>＋</b></button></div>
      <div class="metric-row"><article><span>Active projects</span><strong>24</strong><small>+4 this month</small></article><article><span>Completion</span><strong>78%</strong><small>On target</small></article><article class="metric-accent"><span>Next milestone</span><strong>08d</strong><small>Brand handoff</small></article></div>
      <div class="product-grid"><section class="product-chart"><header><div><span>Project momentum</span><strong>Last 8 weeks</strong></div><b>+18.4%</b></header><div class="chart-bars" aria-label="Illustrative project momentum chart"><i style="--h:34%"></i><i style="--h:48%"></i><i style="--h:43%"></i><i style="--h:61%"></i><i style="--h:56%"></i><i style="--h:74%"></i><i style="--h:82%"></i><i style="--h:92%"></i></div></section><section class="product-list"><header><span>Today</span><b>View all</b></header><p><i></i><span><strong>Review design system</strong><small>10:30 · Product</small></span></p><p><i></i><span><strong>Client workshop</strong><small>14:00 · Strategy</small></span></p><p><i></i><span><strong>Publish report</strong><small>16:45 · Research</small></span></p></section></div></main></div></div>`,
    presentation: `<div class="mockup context-kit report-kit"><header><span>North Region / Operations</span><b>Q3 REVIEW · 08 / 16</b></header><div class="report-body"><section class="report-copy"><span class="kit-kicker">Performance summary</span><h4>Strong demand.<br><em>Smarter pace.</em></h4><p>Revenue grew while delivery time fell across three core markets.</p><div class="report-stat"><strong>+24%</strong><span>Year-over-year<br>revenue growth</span></div></section><section class="report-data"><div class="report-legend"><span><i></i>Current period</span><span><i></i>Previous period</span></div><div class="report-numbers"><p><span>Conversion</span><strong>6.8%</strong><em class="trend-up">↑ 1.4%</em></p><p><span>Retention</span><strong>91%</strong><em class="trend-up">↑ 3.2%</em></p><p><span>Delivery</span><strong>4.2d</strong><em class="trend-down">↓ 0.6d</em></p></div><div class="report-lines" role="img" aria-label="Illustrative performance line chart"><svg viewBox="0 0 360 180" preserveAspectRatio="none" aria-hidden="true"><path d="M4 150 C58 142 72 116 112 121 S176 80 211 91 S267 50 356 24"/><path d="M4 164 C51 148 87 150 121 137 S187 124 218 113 S293 91 356 82"/></svg><span>Jan</span><span>Mar</span><span>May</span><span>Jul</span></div></section></div><footer><span>Internal working document</span><span>ColorVerse palette preview</span></footer></div>`,
    social: `<div class="mockup context-kit campaign-kit"><section class="campaign-poster"><span class="kit-kicker">A one-day gathering</span><div class="campaign-orbit"><i></i><i></i><i></i></div><h4>Common<br>Ground</h4><p>Ideas for kinder cities<br>19.09 — Berlin</p></section><section class="campaign-stack"><article class="campaign-story"><span>COMMON GROUND</span><div><b>19</b><i>SEP</i></div><p>Talks · workshops · food</p></article><article class="campaign-ticket"><span>ADMIT ONE</span><strong>CG / 026</strong><i></i><small>Berlin · 10:00—18:00</small></article><article class="campaign-caption"><b>One palette.<br>Three campaign formats.</b><span>Poster / story / ticket</span></article></section></div>`,
    shop: packagingKit,
    material: `<div class="mockup context-kit material-kit">
      <header class="material-kit-head"><div><span class="kit-kicker">Bridge colour / screen study</span><h4>One color.<br><em>Five surfaces.</em></h4></div><div class="material-role"><span>Selected role</span><strong>${escape(roles[activeColorIndex])}</strong><code>${current.colors[activeColorIndex]}</code></div></header>
      <div class="material-samples" role="img" aria-label="Simulated appearance of ${current.colors[activeColorIndex]} on five material surfaces">
        <article class="material-sample material-plaster"><i aria-hidden="true"></i><div><strong>Mineral paint</strong><span>soft scatter · low sheen</span></div></article>
        <article class="material-sample material-textile"><i aria-hidden="true"></i><div><strong>Woven textile</strong><span>absorbed light · visible fibre</span></div></article>
        <article class="material-sample material-paper"><i aria-hidden="true"></i><div><strong>Uncoated paper</strong><span>warm base · dry finish</span></div></article>
        <article class="material-sample material-polymer"><i aria-hidden="true"></i><div><strong>Matte polymer</strong><span>even body · soft highlight</span></div></article>
        <article class="material-sample material-metal"><i aria-hidden="true"></i><div><strong>Brushed metal</strong><span>directional light · cool reflection</span></div></article>
      </div>
      <footer class="material-kit-foot"><div class="material-palette" aria-label="Current palette">${current.colors.map(color => `<i style="--swatch:${color}" title="${color}"></i>`).join('')}</div><p><b>Visual comparison only.</b> Check physical samples before production.</p></footer>
    </div>`,
  };
  panel.innerHTML = layouts[context] || layouts.landing;
}

function renderExport() {
  const code = $('#exportCode');
  if (!code) return;
  code.textContent = exportPalette(current, format);
  code.setAttribute('aria-labelledby', `format-${format}`);
}

function renderProductPicker() {
  const picker = $('#productContextPicker');
  if (!picker) return;
  picker.hidden = context !== 'landing';
  picker.querySelectorAll('[data-product-kind]').forEach(button => {
    const selected = button.dataset.productKind === productKind;
    button.setAttribute('aria-selected', String(selected));
    button.tabIndex = selected ? 0 : -1;
  });
}

function renderContextCaption() {
  const label = $('#contextCaptionLabel');
  if (!label) return;
  label.textContent = context === 'presentation' ? 'Report preview' : context === 'interface' ? 'Interface preview' : 'Product preview';
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

setupTabs('[data-context]', button => { context = button.dataset.context; renderProductPicker(); renderContextCaption(); renderMockup(); track('context_preview', { context }); });
setupTabs('[data-product-kind]', button => { productKind = button.dataset.productKind; renderProductPicker(); renderMockup(); track('product_preview', { product: productKind }); });
setupTabs('[data-format]', button => { format = button.dataset.format; renderExport(); });
renderProductPicker();
renderContextCaption();

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
if (copyCode) copyCode.addEventListener('click', () => { copy(exportPalette(current, format), `${format === 'hex' ? 'Hex list' : format.toUpperCase()} copied.`); track('palette_export', { format }); });
const copyPalette = $('#copyPalette');
if (copyPalette) copyPalette.addEventListener('click', () => copy(current.colors.join(', '), 'All five colors copied.'));
const paletteRoles = $('#paletteRoles');
const colorGlobe = createColorGlobe({
  getPalette: () => current,
  onPreview(index, color) {
    const colors = [...current.colors];
    colors[index] = color;
    // Only the visual preview changes until the user applies the draft.
    const panel = $('#mockup');
    if (!panel) return;
    ['bg', 'surface', 'primary', 'accent', 'text'].forEach((role, position) => panel.style.setProperty(`--p-${role}`, colors[position]));
    panel.style.setProperty('--on-primary', textOn(colors[2]));
    panel.style.setProperty('--on-accent', textOn(colors[3]));
  },
  onApply(index, color) { replacePaletteColor(index, color); track('color_edit', { method: 'globe' }); toast(`${roles[index]} updated to ${color}.`); },
  onClose(index) {
    renderMockup();
    paletteRoles?.querySelector(`[data-role-color="${index}"]`)?.focus({ preventScroll: true });
  },
});
if (paletteRoles) {
  paletteRoles.addEventListener('click', event => {
    const inlineShade = event.target.closest('[data-inline-role-shade]');
    if (inlineShade) {
      const index = Number(inlineShade.dataset.inlineRoleShade);
      const color = inlineShade.dataset.inlineShade;
      closeInlineShade(index, () => {
        activeColorIndex = index;
        replacePaletteColor(index, color, { keepShadeSource: true });
        track('color_edit', { method: 'inline-shade' });
      });
      return;
    }
    const edit = event.target.closest('[data-role-color]');
    if (edit) {
      activeColorIndex = Number(edit.dataset.roleColor);
      pendingSwapIndex = null;
      openShadeIndex = null;
      renderSelection();
      colorGlobe.open(activeColorIndex);
      return;
    }
    const swap = event.target.closest('[data-role-swap]');
    if (swap) {
      const index = Number(swap.dataset.roleSwap);
      if (pendingSwapIndex === null) {
        pendingSwapIndex = index;
        activeColorIndex = index;
        openShadeIndex = null;
        renderSelection();
        toast(`Choose another role to swap with ${roles[index]}.`);
      } else if (pendingSwapIndex === index) {
        pendingSwapIndex = null;
        renderSelection();
      } else {
        const from = pendingSwapIndex;
        pendingSwapIndex = null;
        openShadeIndex = null;
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
      openShadeIndex = null;
      activeColorIndex = index;
      swapPaletteColors(from, index);
      announcePaletteOrder(current.colors[index], index);
    } else {
      activeColorIndex = index;
      if (openShadeIndex === index) closeInlineShade(index, () => renderSelection());
      else {
        openShadeIndex = index;
        renderSelection();
      }
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
    announceColorTrayChange();
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
    announceColorTrayChange();
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
    'skincare-system-01': { title: 'Soft Structure', image: '/assets/editions/skincare-system-01-v1.jpg', category: 'ColorVerse Edition · Series 01', context: 'care objects · packaging', href: '/editions/skincare-system-01/' },
    'warm-cafe': { title: 'Quiet House', image: '/assets/community/quiet-house-editorial.jpg', category: 'Brand system', context: 'hospitality · packaging' },
    'reef-current': { title: 'After Rain', image: '/assets/community/after-rain-editorial.jpg', category: 'Editorial system', context: 'print · culture' },
    'archive-green': { title: 'Archive Green', image: '/assets/community/archive-green-editorial.jpg', category: 'Material study', context: 'publishing · interiors' },
    'civic-shadow': { title: 'Civic Shadow', image: '/assets/home-explore/civic-shadow-project.jpg', category: 'Architecture identity', context: 'architecture · portfolio' },
    'market-signal': { title: 'Market Signal', image: '/assets/home-explore/market-signal-project.jpg', category: 'Retail identity', context: 'food · retail' },
    'after-hours': { title: 'After Hours', image: '/assets/home-explore/after-hours-project.jpg', category: 'Cultural identity', context: 'music · digital' },
  };
  const homeExploreGroups = {
    all: ['skincare-system-01', 'reef-current', 'archive-green', 'civic-shadow', 'market-signal', 'after-hours'],
    brand: ['skincare-system-01', 'market-signal', 'archive-green'],
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
      const studioHref = `/studio/?p=${encodeURIComponent(palette.id)}#studio`;
      const mediaHref = presentation.href || studioHref;
      return `<article class="home-explore-card" style="--cover:${palette.colors[1]}">
      <a class="home-explore-media" href="${escape(mediaHref)}"${presentation.href ? '' : ` data-select="${palette.id}"`} aria-label="${presentation.href ? 'View' : 'Open'} ${escape(title)}${presentation.href ? ' case study' : ' in Studio'}">
        <img src="${escape(presentation.image || palette.image)}" alt="${escape(title)} project presentation" width="1280" height="800" loading="${index < 3 ? 'eager' : 'lazy'}" decoding="async">
        <span class="home-explore-index">${String(index + 1).padStart(2, '0')}</span><span class="home-explore-category">${escape(presentation.category || palette.category)}</span>
        <span class="home-explore-caption"><strong>${escape(title)}</strong><span>${escape(presentation.context || (palette.useCases || []).slice(0, 2).join(' · '))}</span></span>
      </a>
      <div class="home-explore-colors" aria-label="${escape(title)} colors">${palette.colors.slice(0, 5).map(color => swatch(color)).join('')}</div>
      <div class="home-explore-copy"><p>${escape(palette.description)}</p><a href="${studioHref}" data-select="${palette.id}">Use palette →</a></div>
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
  const atlasWorldSelect = $('#atlasWorldSelect');
  if (atlasWorldSwitch) {
    atlasWorldSwitch.innerHTML = `<span class="atlas-world-label">Worlds</span>${atlasWorlds.map((world, index) => `<button type="button" role="tab" data-atlas-world="${world.id}" aria-selected="${world.id === activeAtlasWorld.id}" tabindex="${world.id === activeAtlasWorld.id ? '0' : '-1'}" title="${escape(world.name)}"><span class="atlas-world-index">${String(index + 1).padStart(2, '0')}</span><span class="atlas-world-copy"><strong>${escape(world.shortName)}</strong><small>${escape(world.name)}</small></span><i class="atlas-world-chip" style="--world-accent:${world.accent}"></i></button>`).join('')}`;
    if (atlasWorldSelect) atlasWorldSelect.innerHTML = atlasWorlds.map(world => `<option value="${world.id}">${escape(world.name)}</option>`).join('');
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
      if (atlasWorldSelect) atlasWorldSelect.value = activeAtlasWorld.id;
      $('.atlas-scene')?.style.setProperty('--atlas-field', activeAtlasWorld.accent);
      applyWorldAtmosphere(activeAtlasWorld);
      const label = $('#atlasWorldLabel');
      if (label) label.textContent = `${activeAtlasWorld.name} field`;
    };
    renderAtlasWorld();
    if (!params.get('p') && (!storedPalette || storedPalette.id?.startsWith('world-'))) useWorldStarter(0);
    const globe = createAtlas($('#globe'), {
      interactionTarget: $('#atlasTouchZone'),
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
    if (atlasWorldSelect) atlasWorldSelect.addEventListener('change', () => selectAtlasWorld(atlasWorldSelect.value));
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
  $$('.community-filter').forEach(filter => filter.addEventListener('click', () => {
    $$('.community-filter').forEach(item => {
      const active = item === filter;
      item.classList.toggle('is-active', active);
      item.setAttribute('aria-pressed', String(active));
    });
    const value = filter.dataset.filter;
    $$('.community-card').forEach(card => { card.hidden = value !== 'all' && card.dataset.category !== value; });
  }));
}

const input = $('#imageInput');
const dropzone = $('#dropzone');
if (input && dropzone) {
  let extractionSequence = 0;
  let extractionSample = null;
  let pickerPositions = [];
  let pickerDrag = null;
  const isSupportedImage = file => Boolean(file && SUPPORTED_IMAGE_TYPES.has(file.type));
  const imageFileFromBlob = (blob, name = 'pasted-image') => new File([blob], name, { type: blob.type, lastModified: Date.now() });
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
      const imageType = item.types.find(type => SUPPORTED_IMAGE_TYPES.has(type));
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
    if (status) status.textContent = 'Finding the colors in your image…';
    try {
      await validateImageFile(file);
    } catch (error) {
      if (status) status.textContent = error.message;
      track('image_extract', { result: 'error' });
      input.value = '';
      return;
    }
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
      track('image_extract', { result: 'success' });
    } catch (error) {
      URL.revokeObjectURL(nextURL);
      if (status) status.textContent = error.message?.includes('visible pixels') ? error.message : 'This image could not be read. Try another JPG, PNG, or WebP.';
      track('image_extract', { result: 'error' });
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
if (page === 'studio') {
  import('./project-store.js?v=14')
    .then(({ initProjectWorkspace }) => initProjectWorkspace(window.colorverseStudio))
    .catch(() => { const label = $('#projectSyncLabel'); if (label) label.textContent = 'Local draft'; });
}
document.documentElement.classList.add('js');
if (window.IntersectionObserver) {
  const reveal = new IntersectionObserver(entries => {
    for (const entry of entries) if (entry.isIntersecting) { entry.target.classList.add('is-visible'); reveal.unobserve(entry.target); }
  }, { threshold: .06, rootMargin: '0px 0px 30px 0px' });
  $$('.reveal').forEach(element => reveal.observe(element));
}
const hashTarget = location.hash ? document.getElementById(decodeURIComponent(location.hash.slice(1))) : null;
if (hashTarget) requestAnimationFrame(() => hashTarget.scrollIntoView({ behavior: 'instant' }));
