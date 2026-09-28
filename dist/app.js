import { palettes } from './palettes.js?v=28';
import { approvedPaletteIds, isApprovedPalette, reviewCandidates, homeStudies, homeCandidateFor } from './curation.js?v=8';
import { retiredReviewPalettes } from './retired-review-palettes.js?v=1';
import { suggestPaletteName } from './palette-names.js?v=1';
import { savePaletteHandoff } from './palette-handoff.js?v=1';
import { createLibraryEngine } from './library-engine.js?v=1';
import { paletteNameLibrary } from './palette-name-library.js?v=3';
import { roles, clamp, contrast, textOn, rgb, toHex, oklab, oklch, paletteFromColor, exportPalette, extractPaletteVariants, oklabDistance } from './color.js?v=2';
import { createAtlas, atlasWorlds } from './globe.js?v=30';
import { buildShadeFamilies } from './shade-studio.js?v=1';
import { createColorGlobe, toHsl, fromHsl } from './color-globe.js?v=3';
import { SUPPORTED_IMAGE_TYPES, validateImageFile } from './image-file.js?v=1';
import { imagePoint, sampleImageColor } from './image-sampling.js?v=1';
import { initCommunity } from './community-feed.js?v=1';
import { freezeColorway } from './colorway-kit.js?v=3';
import { mountPhotoColorway, PHOTO_COLORWAY_NOTE } from './photo-colorway.js?v=3';
import { KATRE_SERUM_PROFILE, SERUM_SOURCE_COLORS } from './katre-serum.js?v=1';
import { colorAlternatives, quickColorAdjustments, NEUTRAL_CHROMA } from './color-alternatives.js?v=3';
import { reportPreview } from './report-preview.js?v=1';
import { withWorkspace, workspaceFromColors, sanitizeWorkspace, roleColors, roleOfMember, memberLabel, previewColorLabel, isCompact, setMember, assignRole, swapRoles, insertMember, removeMember, EXTRACT_MAX_MEMBERS } from './studio-members.js?v=4';
import { initAccountNavigation } from './account-client.js?v=4';
import { DRAFT_KEY, STUDIO_HANDOFF_KEY, readDraft, sanitizeDraft } from './member-palette.js?v=2';

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
  image: null,
  category: 'ColorVerse Edition · Footwear study',
  tags: ['footwear', 'cmf', 'product'],
  useCases: ['footwear · product', 'retail · campaign'],
}];
const editionPalettes = [...palettes, ...reviewCandidates, ...retiredReviewPalettes, ...specialEditions];
const workingDraft = {
  id: 'working-draft', name: page === 'studio' ? 'Citrus Muse' : suggestPaletteName(),
  description: 'A starting colorway to shape; not part of the curated library.',
  colors: page === 'studio' ? [...SERUM_SOURCE_COLORS] : ['#F7F6F2', '#DFE0DC', '#A9AAA7', '#6E7374', '#252B2F'],
  image: null, category: 'Draft', tags: ['working draft'], sourcePaletteId: null,
};
const requestedPalette = editionPalettes.find(palette => palette.id === params.get('p'));
const storedPalette = readStoredPalette();
const resumablePalette = storedPalette?.id?.startsWith('world-') ? null : storedPalette;
let current = requestedPalette && resumablePalette?.id === requestedPalette.id ? resumablePalette : requestedPalette || (resumablePalette && (!params.get('p') || resumablePalette.id === params.get('p')) ? resumablePalette : workingDraft);
if (page === 'studio' && params.get('saved') === '1') {
  const saved = readDraft(sessionStorage, STUDIO_HANDOFF_KEY);
  // Every saved color arrives; the five explicitly chosen positions drive the preview.
  const workspace = saved && workspaceFromColors(saved.colors, saved.roleIndex || (saved.colors.length === 5 ? undefined : null));
  if (workspace) {
    const reference = editionPalettes.find(palette => palette.id === saved.referenceKey);
    current = { ...(reference || workingDraft), id: `saved-${Date.now()}`, name: saved.name, collection: saved.collection,
      description: 'A working copy of your private palette.', colors: roleColors(workspace), workspace, sourcePaletteId: reference?.id || null };
    try { sessionStorage.removeItem(STUDIO_HANDOFF_KEY); sessionStorage.setItem('colorverse-current-palette', JSON.stringify(current)); } catch {}
    history.replaceState(null, '', '/studio/');
  }
}
current = withWorkspace(current) || withWorkspace(workingDraft);
let context = 'landing';
let productKind = params.get('tool') === 'colorway' ? 'skincare' : current.id === 'drift-field-01' ? 'footwear' : 'skincare';
const DEFAULT_CARE_ASSIGNMENT = Object.freeze({ backdrop: 0, bottle: 2, cap: 1, label: 0, carton: 3 });
const careAssignment = { ...DEFAULT_CARE_ASSIGNMENT };
let colorwayBaseline = freezeColorway(current.colorwayBaseline);
if (current.careAssignment) for (const part of Object.keys(careAssignment)) {
  const value = current.careAssignment[part];
  if (Number.isInteger(value) && value >= 0 && value < 5) careAssignment[part] = value;
}
let format = 'css';
let extracted = null;
let extractedVariants = [];
let selectedExtraction = 0;
let imageURL = null;
let activeColorIndex = 0;
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
  const saved = page === 'studio' ? { ...palette, careAssignment: { ...careAssignment }, colorwayBaseline } : palette;
  // Stay on the working page if a custom palette cannot survive navigation.
  return savePaletteHandoff(saved, () => sessionStorage, message => toast(message));
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
  const description = $('#paletteDescription');
  const heroSwatches = $('#heroSwatches');
  const paletteRoles = $('#paletteRoles');
  const ratio = $('#contrastRatio');
  const verdict = $('#contrastVerdict');
  if (name) name.textContent = current.name;
  if (description) description.textContent = current.description || 'A five-color direction ready to test.';
  if (heroSwatches) {
    const preview = miniStudioColors();
    heroSwatches.innerHTML = Array.from({ length: 5 }, (_, index) => {
      const color = preview[index];
      if (!color) return '<span class="hero-empty-swatch" aria-hidden="true"></span>';
      if (index >= atlasSelected.length) return `<button type="button" class="hero-suggested-swatch" data-mini-accept="${color}" style="--swatch:${color};--on:${textOn(color)}" title="Add suggested ${color}" aria-label="Add suggested color ${color}">+</button>`;
      return `<button type="button" class="hero-picked-swatch${atlasActiveSlot === index ? ' is-editing' : ''}${atlasRecentSlot === index ? ' is-new' : ''}" data-mini-slot="${index}" style="--swatch:${color};--on:${textOn(color)}" aria-pressed="${atlasActiveSlot === index}" aria-label="Color ${index + 1}: ${color}. ${atlasActiveSlot === index ? 'Choose its replacement on the globe' : 'Select to replace on the globe'}" title="${color} · select to replace"><code>${color}</code></button>`;
    }).join('');
    heroSwatches.setAttribute('aria-label', `${atlasSelected.length} chosen colors and ${atlasSelected.length ? 5 - atlasSelected.length : 0} suggested colors`);
  }
  renderPaletteRoles();
  if (ratio) {
    const value = contrast(current.colors[0], current.colors[4]);
    ratio.textContent = `${value.toFixed(2)}:1 · ${value >= 7 ? 'AAA contrast' : value >= 4.5 ? 'AA contrast' : value >= 3 ? 'Large text only' : 'Low contrast'}`;
  }
  if (verdict) verdict.textContent = `${previewLabel(4)} on ${previewLabel(0)}`;
  // Opening a palette can change the product direction; keep the rail in step.
  renderProductPicker();
  renderContextCaption();
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
  const next = palette && Array.isArray(palette.colors) && palette.colors.length >= 5 ? withWorkspace(palette) : null;
  if (!next) return;
  current = next;
  if (palette.id === 'skincare-system-01') productKind = 'skincare';
  else if (palette.id === 'drift-field-01') productKind = 'footwear';
  activeColorIndex = 0;
  shadeSourceColors = [...current.workspace.members];
  persistPalette(current);
  renderSelection(true);
  track('palette_open', { source: page === 'community' ? 'community' : 'library' });
  if (notify) toast(`${palette.name} selected.`);
}

// All edits go through the workspace; `current.colors` is re-derived as the five role colors.
function commitWorkspace(workspace, extra = {}) {
  current = { ...current, ...extra, id: current.id.startsWith('custom-') ? current.id : `custom-${current.id}`, workspace, colors: roleColors(workspace) };
  persistPalette(current);
  renderSelection(true);
}

// `from`/`to` are preview roles. Five-color palettes swap the colors themselves
// (as before); larger palettes swap which members fill the roles, keeping member order.
function swapPaletteColors(from, to) {
  if (from === to || from < 0 || to < 0 || from > 4 || to > 4) return;
  if (!isCompact(current.workspace)) [shadeSourceColors[from], shadeSourceColors[to]] = [shadeSourceColors[to], shadeSourceColors[from]];
  commitWorkspace(swapRoles(current.workspace, from, to));
  track('color_edit', { method: 'swap' });
}

// `index` is a palette member; the preview changes only if that member holds a role.
function replacePaletteColor(index, color, { keepShadeSource = false } = {}) {
  if (index < 0 || index >= current.workspace.members.length || !/^#[0-9a-f]{6}$/i.test(color)) return;
  const workspace = setMember(current.workspace, index, color);
  if (!keepShadeSource) shadeSourceColors[index] = workspace.members[index];
  commitWorkspace(workspace, { name: current.name.replace(/^Custom · /, '') });
}

function assignPreviewRole(member, role) {
  const before = current.workspace.roleIndex[role];
  commitWorkspace(assignRole(current.workspace, role, member));
  const status = $('#paletteOrderStatus');
  if (status) status.textContent = `Color ${member + 1} now fills preview slot ${role + 1}${current.workspace.roleIndex.includes(before) ? '' : `; Color ${before + 1} is no longer in the preview`}.`;
  track('color_edit', { method: 'assign-role' });
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
    careAssignment: { ...careAssignment },
    colorwayBaseline,
    // Five-color RPC fields above stay role colors; the complete palette rides in editor state.
    workspace: isCompact(current.workspace) ? { ...current.workspace, members: [...current.workspace.members], roleIndex: [...current.workspace.roleIndex] } : null,
    collection: current.collection || null,
  };
}

function loadStudioSnapshot(snapshot) {
  if (!snapshot || !Array.isArray(snapshot.colors) || snapshot.colors.length !== 5 || !snapshot.colors.every(color => /^#[0-9a-f]{6}$/i.test(color))) return;
  const colors = snapshot.colors.map(color => color.toUpperCase());
  const source = editionPalettes.find(palette => palette.id === snapshot.sourcePaletteId) || signatureFor(colors[2]);
  // Old five-color snapshots (no or inconsistent workspace) load with identity mapping.
  const workspace = sanitizeWorkspace(snapshot.workspace, colors) || workspaceFromColors(colors);
  current = {
    id: `project-${snapshot.id || Date.now()}`,
    name: snapshot.name || 'Saved project',
    description: 'A private ColorVerse project restored from your latest saved version.',
    colors: roleColors(workspace),
    workspace,
    image: source.image,
    category: 'Saved project',
    tags: ['project'],
    sourcePaletteId: snapshot.sourcePaletteId || null,
    collection: snapshot.collection || null,
  };
  context = ['landing', 'interface', 'social', 'presentation'].includes(snapshot.context) ? snapshot.context : 'landing';
  productKind = snapshot.productKind && ['footwear', 'skincare', 'object'].includes(snapshot.productKind) ? snapshot.productKind : 'skincare';
  colorwayBaseline = freezeColorway(snapshot.colorwayBaseline);
  for (const [part, defaultIndex] of Object.entries(DEFAULT_CARE_ASSIGNMENT)) {
    const value = snapshot.careAssignment?.[part];
    careAssignment[part] = Number.isInteger(value) && value >= 0 && value < 5 ? value : defaultIndex;
  }
  activeColorIndex = 0;
  shadeSourceColors = [...workspace.members];
  const legacyReport = $('#tab-presentation');
  if (legacyReport) legacyReport.hidden = context !== 'presentation';
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
let shadeSourceColors = [...current.workspace.members];
const trashIcon = '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M4 7h16M9 7V4h6v3M6 7l1 13h10l1-13M10 10v7M14 10v7"/></svg>';

function selectedShadeValues(index) {
  const source = shadeSourceColors[index] || current.workspace.members[index];
  const family = buildShadeFamilies(source)[0]?.colors || [source];
  return [...new Set(family)].sort((a, b) => colorCoordinates(b).lightness - colorCoordinates(a).lightness);
}

const activeColor = () => current.workspace.members[activeColorIndex] || current.colors[0];
const activeLabel = () => memberLabel(current.workspace, activeColorIndex);
const previewLabel = role => previewColorLabel(current.workspace, role);

// A single select button per member. Selection is not a palette edit.
function renderPaletteRoles() {
  const container = $('#paletteRoles');
  if (!container) return;
  const { workspace } = current;
  // Larger palettes use a compact two-column rail with a visible count, so 8–10 colors fit without scrolling.
  container.classList.toggle('is-scrolling', workspace.members.length > 5);
  container.classList.toggle('is-compact-grid', workspace.members.length > 5);
  container.setAttribute('aria-label', `${workspace.members.length} palette colors. Select a color to edit it on the right.`);
  container.innerHTML = workspace.members.map((color, index) => {
    const label = memberLabel(workspace, index), assigned = roleOfMember(workspace, index) >= 0;
    return `<button class="palette-member${activeColorIndex === index ? ' is-selected' : ''}${assigned ? '' : ' is-unassigned'}" type="button" data-select-member="${index}" style="--swatch:${color};--on:${textOn(color)}" aria-pressed="${activeColorIndex === index}" aria-label="Select ${label}, ${color}${assigned ? '' : ', not in preview'}" title="${label} · ${color}${assigned ? '' : ' · not in preview'}"><i aria-hidden="true"></i><span class="palette-member-label">${label}<code>${color}</code></span></button>`;
  }).join('');
  const count = $('#paletteCount');
  if (count) {
    count.hidden = workspace.members.length <= 5;
    count.innerHTML = `<b>${workspace.members.length}</b><span> colors</span><small></small>`;
  }
  updatePaletteOverflow();
}

// A contained rail that still hides colors says so and fades toward them.
function updatePaletteOverflow() {
  const container = $('#paletteRoles');
  if (!container) return;
  const across = container.scrollWidth > container.clientWidth + 1, down = container.scrollHeight > container.clientHeight + 1;
  const atEnd = across ? container.scrollLeft + container.clientWidth >= container.scrollWidth - 2 : container.scrollTop + container.clientHeight >= container.scrollHeight - 2;
  container.classList.toggle('has-more-down', down && !across && !atEnd);
  container.classList.toggle('has-more-across', across && !atEnd);
  const cue = $('#paletteCount small');
  if (cue) cue.textContent = across || down ? (across ? ' · swipe for all' : ' · scroll for all') : '';
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
  const saved = colorTray.includes(activeColor().toUpperCase());
  add.disabled = saved;
  add.querySelector('span').textContent = saved ? 'Added to color tray' : 'Add to color tray';
}

function renderColorLab() {
  const lab = $('#colorLab');
  if (!lab) return;
  if (!current.workspace.members[activeColorIndex]) activeColorIndex = 0;
  const color = activeColor().toUpperCase();
  const source = shadeSourceColors[activeColorIndex] || color;
  const coordinates = colorCoordinates(source);
  const label = activeLabel();
  // Obvious, always-visible tools; member selection on the left never edits it.
  $('#selectedColorLabel').textContent = label;
  $('#selectedColorHex').textContent = color;
  $('#selectedColorSwatch')?.style.setProperty('--swatch', color);
  const shades = selectedShadeValues(activeColorIndex);
  $('#colorShadeGrid').innerHTML = shades.map(value => `<button type="button" data-use-color="${value}" data-color-shade aria-label="Use shade ${value} for ${label}" aria-pressed="${value === color}" title="${value}" style="--choice:${value};--on:${textOn(value)}"><span class="sr-only">${value}</span></button>`).join('');
  $('#colorQuickActions').innerHTML = quickColorAdjustments(color).map(({ id, label: action, color: value, disabled }) => `<button type="button" data-use-color="${value}" data-quick-action="${id}"${disabled ? ' disabled' : ''} aria-label="Make ${label} ${action.toLowerCase()}"><i style="background:${value}" aria-hidden="true"></i>${action}</button>`).join('') + (!isCompact(current.workspace) ? `<button type="button" data-swap-next>Swap with ${memberLabel(current.workspace, (activeColorIndex + 1) % 5)} ↔</button>` : '');
  $('#previewPlacement').hidden = !isCompact(current.workspace);
  $('#previewSlotChoices').innerHTML = current.colors.map((value, role) => `<button type="button" data-assign-slot="${role}" aria-pressed="${roleOfMember(current.workspace, activeColorIndex) === role}" aria-label="Use ${label} instead of ${previewLabel(role)} in preview" title="Replace ${previewLabel(role)} in preview"><i style="background:${value}" aria-hidden="true"></i><span>${previewLabel(role)}</span></button>`).join('');
  const scope = $('#alternativeScope');
  if (scope) scope.textContent = `${coordinates.chroma < NEUTRAL_CHROMA ? 'Nearby neutrals' : 'Nearby hues'} · changes ${label} only`;
  const alternatives = colorAlternatives(color);
  $('#colorAlternativeGrid').innerHTML = alternatives.map(value => `<button type="button" style="--choice:${value};--on:${textOn(value)}" data-use-color="${value}" aria-label="Replace ${label} with ${value}" title="${value} · ${label} only"><code>${value.slice(1)}</code></button>`).join('');
  const activeRole = roleOfMember(current.workspace, activeColorIndex);
  const pairIndex = activeRole === 0 ? 4 : 0;
  const pair = current.colors[pairIndex];
  $('#colorContrastPair').textContent = `vs ${previewLabel(pairIndex)}`;
  const candidates = [...new Set([...[.15, .3, .45, .6, .8, .92, .98].flatMap(lightness =>
    [0, 180].map(offset => oklch(lightness, Math.min(coordinates.chroma, .08), coordinates.hue + offset))), '#000000', '#FFFFFF'])]
    .filter(value => contrast(value, pair) >= 4.5)
    .sort((a, b) => oklabDistance(a, color) - oklabDistance(b, color));
  const contrastColors = [candidates[0], candidates.find(value => oklabDistance(value, candidates[0]) > .08) || candidates[1]].filter(Boolean);
  $('#colorContrastGrid').innerHTML = contrastColors.map(value => {
    const ratio = contrast(value, pair).toFixed(2);
    return `<button type="button" class="contrast-choice" data-use-color="${value}" title="${value} against ${pair}" aria-label="Use ${value}, contrast ${ratio} to 1 against ${previewLabel(pairIndex)}"><span style="background:${activeRole === 0 ? value : pair};color:${activeRole === 0 ? pair : value}" aria-hidden="true">Aa</span><code>${ratio}:1</code></button>`;
  }).join('');
  renderColorTray();
  renderColorUseHint();
}

// Only the Skincare photo has annotated surfaces to report on; other product
// kinds and contexts show no product-application claim at all.
function renderColorUseHint() {
  const hint = $('#selectedColorUse');
  if (!hint) return;
  if (context !== 'landing' || productKind !== 'skincare') {
    hint.hidden = true;
    hint.textContent = '';
    return;
  }
  const role = roleOfMember(current.workspace, activeColorIndex);
  const label = activeLabel();
  const text = role < 0
    ? `${label} isn't in the preview. Choose a color under Use in preview to replace it.`
    : (() => {
      const surfaces = PHOTO_SURFACE_CONTROLS.filter(([part]) => careAssignment[part] === role).map(([, title]) => title);
      if (role === 4) surfaces.push('Print');
      return surfaces.length
        ? `Colors ${surfaces.join(' & ')} in the photo. Background and clear glass base stay fixed.`
        : 'Not used on this product. Editing it still updates your palette.';
    })();
  hint.hidden = false;
  hint.textContent = text;
}

const libraryEngine = createLibraryEngine(editionPalettes, { approvedIds: approvedPaletteIds, aliases: Object.fromEntries(Object.entries(paletteNameLibrary).map(([id, record]) => [id, record.aliases])) });
let visiblePalettes = libraryEngine.search().map(result => result.palette);
if (page === 'explore' && visiblePalettes.length === 0) {
  document.body.classList.add('is-curation-hold');
  const hold = $('#libraryCurationHold');
  if (hold) hold.hidden = false;
}
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
let atlasActiveSlot = null;
let atlasRecentSlot = null;
let miniHueMemory = 0;

function miniStudioColors() {
  if (!atlasSelected.length) return [];
  const colors = atlasSelected.map(item => item.hex);
  const generated = paletteFromColor(colors[0]);
  for (const color of generated) if (!colors.includes(color) && colors.length < 5) colors.push(color);
  return colors.slice(0, 5);
}

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
  return visiblePalettes.map(palette => ({ palette, score: Math.min(...palette.colors.map(color => oklabDistance(hex, color))) }))
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
  const clear = $('#clearAtlasSelection');
  if (count) count.textContent = `${atlasSelected.length} / 5`;
  if (clear) clear.hidden = atlasSelected.length === 0;
  const remove = $('#removeAtlasColor');
  if (remove) remove.hidden = atlasActiveSlot === null;
  const hint = $('#miniStudioHint');
  if (hint) hint.textContent = atlasActiveSlot !== null ? `Pick a replacement for color ${atlasActiveSlot + 1} on the globe.` : atlasSelected.length ? 'Tap a chosen color to replace it. Faded swatches are suggestions.' : 'Pick a color on the globe.';
  if (colors) colors.innerHTML = atlasSelected.map(({ hex }) => `<span class="atlas-selected-swatch" style="--swatch:${hex};--on:${textOn(hex)}" title="${hex}"><code>${hex}</code></span>`).join('');
  const suggested = atlasSelected.length === 1 ? suggestedPalettes(atlasSelected[0].hex) : [];
  if (suggestions) suggestions.innerHTML = suggested.length ? `<span class="atlas-suggestions-label">Suggested palettes</span>${suggested.map(palette => `<button type="button" class="atlas-suggestion" data-atlas-suggestion="${palette.id}" aria-label="Try ${escape(palette.name)} palette"><span class="atlas-suggestion-swatches">${palette.colors.map(color => `<i style="--swatch:${color}"></i>`).join('')}</span><span>${escape(palette.name)}</span></button>`).join('')}` : '';
  if (action) action.textContent = atlasSelected.length === 5 ? 'Continue in Studio ↗' : 'Complete in Studio ↗';
  renderMiniEditor();
}

function renderMiniEditor() {
  const controls = $('#miniEditorControls');
  if (!controls) return;
  const index = atlasActiveSlot ?? atlasSelected.length - 1;
  const selected = atlasSelected[index];
  $('.atlas-scene')?.classList.toggle('has-mini-color', Boolean(selected));
  controls.hidden = !selected;
  $('#miniEditorEmpty').hidden = Boolean(selected);
  if (!selected) return;
  const point = toHsl(selected.hex, miniHueMemory);
  miniHueMemory = point.h;
  $('#miniEditingLabel').textContent = `Color ${index + 1}`;
  $('#miniHex').value = selected.hex;
  $('#miniHue').style.setProperty('--mini-track', 'linear-gradient(90deg,#FF0000,#FFFF00,#00FF00,#00FFFF,#0000FF,#FF00FF,#FF0000)');
  $('#miniIntensity').style.setProperty('--mini-track', `linear-gradient(90deg,${fromHsl({ ...point, s: 0 })},${fromHsl({ ...point, s: 1 })})`);
  $('#miniLightness').style.setProperty('--mini-track', `linear-gradient(90deg,#000,${fromHsl({ ...point, l: .5 })},#fff)`);
  for (const [key, id, scale] of [['h', 'Hue', 1], ['s', 'Intensity', 100], ['l', 'Lightness', 100]]) {
    $(`#mini${id}`).value = point[key] * scale;
    $(`#mini${id}Value`).textContent = `${Math.round(point[key] * scale)}${key === 'h' ? '°' : '%'}`;
  }
  const suggestions = miniStudioColors().slice(atlasSelected.length, atlasSelected.length + 3);
  $('#miniColorSuggestions').innerHTML = suggestions.map(color => `<button type="button" data-mini-accept="${color}" style="--swatch:${color};--on:${textOn(color)}" aria-label="Add suggested color ${color}">+</button>`).join('');
  $('#miniEditorStatus').textContent = atlasSelected.length === 5 ? 'Five colors selected. Ready for Studio.' : 'Tap + to accept a suggestion.';
}

function addAtlasSelection(payload) {
  if (!payload) return;
  // The automatic startup seed does not count as the user starting a palette.
  const wasEmpty = !atlasSelected.some(item => !item.seeded);
  atlasHover = payload;
  const existing = atlasSelected.findIndex(item => item.worldId === payload.worldId && item.index === payload.index);
  if (atlasActiveSlot !== null) {
    if (existing !== -1 && existing !== atlasActiveSlot) atlasSelected[existing] = atlasSelected[atlasActiveSlot];
    atlasSelected[atlasActiveSlot] = payload;
    atlasRecentSlot = atlasActiveSlot;
    atlasActiveSlot = null;
  } else if (existing >= 0) {
    atlasSelected.splice(existing, 1);
    atlasRecentSlot = null;
  } else if (atlasSelected.length >= 5) { toast('Select a palette color to replace it, or clear the palette.'); return; }
  else { atlasRecentSlot = atlasSelected.length; atlasSelected.push(payload); }
  if (wasEmpty && atlasSelected.some(item => !item.seeded)) window.colorverseTrack?.('palette_started', { source: 'globe' });
  atlasPinned = atlasSelected.at(-1) || null;
  setAtlasReadout(atlasPinned, Boolean(atlasPinned));
  renderAtlasSelection();
  renderSelection();
  toast(atlasPinned ? `${atlasSelected.length} color${atlasSelected.length === 1 ? '' : 's'} selected.` : 'Selection cleared.');
}

function buildAtlasPalette() {
  if (!atlasSelected.length) return null;
  const colors = miniStudioColors();
  return { id: 'atlas-custom', name: suggestPaletteName(colors), description: `${atlasSelected.length} selected color${atlasSelected.length === 1 ? '' : 's'} with generated supporting tones.`, colors: colors.slice(0, 5), image: null, category: 'Your palette', tags: ['custom'] };
}

function renderMockup() {
  const panel = $('#mockup');
  if (!panel) return;
  const [bg, surface, primary, accent, ink] = current.colors;
  for (const [name, value] of Object.entries({ bg, surface, primary, accent, text: ink })) panel.style.setProperty(`--p-${name}`, value);
  panel.style.setProperty('--on-primary', textOn(primary));
  panel.style.setProperty('--on-accent', textOn(accent));
  panel.style.setProperty('--p-material', activeColor());
  panel.setAttribute('aria-labelledby', `tab-${context}`);
  const packagingKit = current.id === 'skincare-system-01'
    ? `<div class="mockup context-kit edition-packaging-kit">
      <header><span class="kit-kicker">ColorVerse Edition / care objects</span><b>KATRE</b><small>Soft Structure · Series 01</small></header>
      <div class="edition-pack-scene" role="img" aria-label="Soft Structure palette applied to five care objects">
        <article class="edition-tube edition-tube-1" style="--pack:var(--p-bg);--pack-ink:var(--p-text)"><span>KATRE</span><div><strong>Cleanse</strong><small>Balance · purify · refresh</small></div><b>100 ml</b></article>
        <article class="edition-tube edition-tube-2" style="--pack:var(--p-surface);--pack-ink:var(--p-text)"><span>KATRE</span><div><strong>Veil</strong><small>Hydrate · support · replenish</small></div><b>75 ml</b></article>
        <article class="edition-tube edition-tube-3" style="--pack:var(--p-primary);--pack-ink:var(--on-primary)"><span>KATRE</span><div><strong>Polish</strong><small>Refine · smooth · renew</small></div><b>60 ml</b></article>
        <article class="edition-tube edition-tube-4" style="--pack:var(--p-accent);--pack-ink:var(--p-text)"><span>KATRE</span><div><strong>Mask</strong><small>Soothe · restore · fortify</small></div><b>75 ml</b></article>
        <article class="edition-tube edition-tube-5" style="--pack:var(--p-text);--pack-ink:var(--p-bg)"><span>KATRE</span><div><strong>Night</strong><small>Repair · smooth · revive</small></div><b>75 ml</b></article>
      </div>
      <footer><span>Shared silhouette</span><span>Color-coded formula</span><span>Consistent hierarchy</span><span>Production study</span></footer>
    </div>`
    : current.id === 'drift-field-01'
      ? `<div class="mockup context-kit edition-footwear-kit">
      <header><span class="kit-kicker">ColorVerse Edition / footwear study</span><b>DRIFT</b><small>Field 01 · Series 01</small></header>
      <div class="edition-footwear-scene"><div class="edition-footwear-image visual-pending"><span>Reference image pending</span></div><aside><span class="kit-kicker">Material map</span><strong>Quiet utility.</strong><p>One silhouette, three colorways, four tactile surfaces.</p><dl><div><dt>Upper</dt><dd>Mesh · suede</dd></div><div><dt>Colorways</dt><dd>Stone · Meadow · Graphite</dd></div><div><dt>Base</dt><dd>Modular rubber</dd></div></dl></aside></div>
      <footer><span>Everyday silhouette</span><span>Material-led colour</span><span>CMF direction</span><span>Original study</span></footer>
    </div>`
      : `<div class="mockup context-kit packaging-kit"><header><span class="kit-kicker">Packaging system / small batch</span><b>Field & Form</b><small>Collection 03</small></header><div class="package-scene"><div class="package-box package-box-tall"><span>FIELD<br>& FORM</span><small>Botanical wash<br>250 ml</small><i>03</i></div><div class="package-box package-box-wide"><span>EVERYDAY<br>RITUALS</span><small>Five mineral soaps</small><i>05</i></div><div class="package-bottle"><span>F&F</span><small>01</small></div><div class="package-card"><span>Care notes</span><b>Made slowly.<br>Used daily.</b><p>Plant-based formulas / recyclable paper / batch no. 026</p><i></i></div></div><footer><span>Primary pack</span><span>Gift set</span><span>Label system</span><span>Insert card</span></footer></div>`;
  const productConfig = {
    footwear: { label: 'Footwear / Field study', title: 'Field 01', detail: 'One silhouette. Three directions.', specs: 'Mesh · suede · modular rubber' },
    skincare: { label: 'Skincare / Series study', title: 'Soft Structure', detail: 'Five objects. One quiet system.', specs: 'Matte polymer · ribbed cap · mono print' },
    object: { label: 'Object / Material study', title: 'Everyday object', detail: 'A useful object with a considered surface.', specs: 'Ceramic · dry glaze · tactile form' },
  }[productKind] || { label: 'Footwear / Field study', title: 'Field 01', detail: 'One silhouette. Three directions.', specs: 'Mesh · suede · modular rubber' };
  // One approved Katre serum design: four surface assignments plus print from
  // the Text role. The mounted photo renderer survives ordinary palette edits.
  const carePreview = `<div class="mockup context-kit care-preview-kit photo-preview-kit${colorwayBaseline ? ' is-comparing' : ''}">
    <header><div><span class="kit-kicker">Skincare concept · glass serum</span><h4>Katre</h4></div><div class="colorway-toolbar"><button type="button" data-colorway="lock">${colorwayBaseline ? 'Update comparison' : 'Keep for comparison'}</button>${colorwayBaseline ? '<button type="button" data-colorway="restore">Use comparison colors</button><button type="button" data-colorway="clear">Clear comparison</button>' : ''}<button type="button" data-colorway="retry" hidden>Reload photo</button><button type="button" data-colorway="export" disabled>Export PNG ↗</button></div></header>
    <div class="care-preview-body">
      <div class="care-photo-host" data-photo-host></div>
    </div><footer><span>Label / body / accent / cap / print</span><span>Katre is a design concept · approximate digital preview</span></footer></div>`;
  const productPreview = productKind === 'skincare' ? carePreview : `<div class="mockup context-kit product-preview-kit"><header><div><span class="kit-kicker">${escape(productConfig.label)}</span><h4>${escape(productConfig.title)}</h4></div><span class="product-preview-meta">ColorVerse / product direction</span></header><div class="product-preview-stage"><div class="product-preview-image visual-pending"><span>Reference image pending</span></div><aside><strong>${escape(productConfig.detail)}</strong><p>${escape(productConfig.specs)}</p><div class="product-preview-swatches" aria-label="Applied product colors">${current.colors.slice(0, 5).map((color, index) => `<i style="--swatch:${color}" title="${roles[index]} ${color}"></i>`).join('')}</div><small>Palette colors shown at left.</small></aside></div><footer><span>Product study</span><span>Colour / material direction</span><span>Original ColorVerse concept</span></footer></div>`;
  const layouts = {
    landing: productPreview,
    interface: reportPreview(),
    social: `<div class="mockup context-kit campaign-kit"><section class="campaign-poster"><span class="kit-kicker">A one-day gathering</span><div class="campaign-orbit"><i></i><i></i><i></i></div><h4>Common<br>Ground</h4><p>Ideas for kinder cities<br>19.09 — Berlin</p></section><section class="campaign-stack"><article class="campaign-story"><span>COMMON GROUND</span><div><b>19</b><i>SEP</i></div><p>Talks · workshops · food</p></article><article class="campaign-ticket"><span>ADMIT ONE</span><strong>CG / 026</strong><i></i><small>Berlin · 10:00—18:00</small></article><article class="campaign-caption"><b>One palette.<br>Three campaign formats.</b><span>Poster / story / ticket</span></article></section></div>`,
    presentation: `<div class="mockup context-kit report-kit"><header><span>North Region / Operations</span><b>Q3 REVIEW · 08 / 16</b></header><div class="report-body"><section class="report-copy"><span class="kit-kicker">Performance summary</span><h4>Strong demand.<br><em>Smarter pace.</em></h4><p>Revenue grew while delivery time fell across three core markets.</p><div class="report-stat"><strong>+24%</strong><span>Year-over-year<br>revenue growth</span></div></section><section class="report-data"><div class="report-legend"><span><i></i>Current period</span><span><i></i>Previous period</span></div><div class="report-numbers"><p><span>Conversion</span><strong>6.8%</strong><em class="trend-up">↑ 1.4%</em></p><p><span>Retention</span><strong>91%</strong><em class="trend-up">↑ 3.2%</em></p><p><span>Delivery</span><strong>4.2d</strong><em class="trend-down">↓ 0.6d</em></p></div><div class="report-lines" role="img" aria-label="Illustrative performance line chart"><svg viewBox="0 0 360 180" preserveAspectRatio="none" aria-hidden="true"><path d="M4 150 C58 142 72 116 112 121 S176 80 211 91 S267 50 356 24"/><path d="M4 164 C51 148 87 150 121 137 S187 124 218 113 S293 91 356 82"/></svg><span>Jan</span><span>Mar</span><span>May</span><span>Jul</span></div></section></div><footer><span>Internal working document</span><span>ColorVerse palette preview</span></footer></div>`,
    shop: packagingKit,
    material: `<div class="mockup context-kit material-kit">
      <header class="material-kit-head"><div><span class="kit-kicker">Bridge colour / screen study</span><h4>One color.<br><em>Five surfaces.</em></h4></div><div class="material-role"><span>Selected role</span><strong>${escape(activeLabel())}</strong><code>${activeColor()}</code></div></header>
      <div class="material-samples" role="img" aria-label="Simulated appearance of ${activeColor()} on five material surfaces">
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
  syncPhotoPreview();
}

// Saved careAssignment field names/indexes remain intact. The serum profile
// maps their old renderer keys onto this bottle's physical surfaces; print
// follows Text (role 4), and backdrop remains stored compatibility data only.
const PHOTO_SURFACE_CONTROLS = [['label', 'Label'], ['bottle', 'Body'], ['carton', 'Accent'], ['cap', 'Cap']];
const photoColorwayFor = (colors, assignment) => ({ colors: colors.slice(0, 5), assignment: { tube: assignment.label, bottle: assignment.bottle, jar: assignment.carton, cap: assignment.cap } });
let photoPreview = null;

function destroyPhotoPreview() {
  photoPreview?.destroy();
  photoPreview = null;
}

function syncPhotoControls() {
  const state = photoPreview?.state;
  const exportButton = $('#mockup [data-colorway="export"]');
  const retry = $('#mockup [data-colorway="retry"]');
  if (exportButton && !exportButton.dataset.busy) {
    exportButton.disabled = state !== 'ready';
    exportButton.title = state === 'ready' ? 'Export the visible photo preview' : state === 'error' ? 'The photo could not be loaded' : 'Loading the photo…';
  }
  if (retry) retry.hidden = state !== 'error';
}

// One mounted renderer per visit: palette edits only update it (no new decode);
// leaving the skincare view destroys it.
function syncPhotoPreview(previewColors = current.colors) {
  const host = $('#mockup [data-photo-host]');
  if (!host) { destroyPhotoPreview(); return; }
  const colorway = photoColorwayFor(previewColors, careAssignment);
  const baseline = colorwayBaseline ? photoColorwayFor(colorwayBaseline.colors, colorwayBaseline.assignment) : null;
  if (!photoPreview) {
    const mounted = mountPhotoColorway(host, { profile: KATRE_SERUM_PROFILE, colorway, baseline });
    photoPreview = mounted;
    mounted.ready.then(() => { if (photoPreview === mounted) syncPhotoControls(); });
  } else {
    if (photoPreview.element.parentNode !== host) host.append(photoPreview.element);
    photoPreview.update(colorway);
    photoPreview.setBaseline(baseline);
  }
  syncPhotoControls();
}

// Exports exactly the visible photo stages (current, or baseline + current).
async function exportPhotoPreview(name) {
  const preview = photoPreview;
  if (preview?.state !== 'ready') throw new Error('The photo preview is not ready.');
  await new Promise(resolve => requestAnimationFrame(() => requestAnimationFrame(resolve)));
  if (preview !== photoPreview || preview.state !== 'ready') throw new Error('The photo preview changed.');
  const stages = [...preview.element.querySelectorAll('.photo-colorway-stage:not([hidden])')]
    .map(stage => ({ canvas: stage.querySelector('canvas'), label: stage.querySelector('.photo-colorway-tag')?.textContent || '' }))
    .filter(stage => stage.canvas?.width);
  if (!stages.length) throw new Error('Nothing to export.');
  const pad = 56, gap = 32, top = 110, bottom = 96, height = stages[0].canvas.height;
  const canvas = document.createElement('canvas');
  canvas.width = pad * 2 + stages.reduce((sum, stage) => sum + stage.canvas.width, 0) + gap * (stages.length - 1);
  canvas.height = top + height + bottom;
  const context = canvas.getContext('2d');
  context.fillStyle = '#FAFAF8'; context.fillRect(0, 0, canvas.width, canvas.height);
  context.fillStyle = '#17171B'; context.font = '32px sans-serif'; context.fillText(String(name || 'Katre colorway').slice(0, 80), pad, 64);
  let x = pad;
  for (const stage of stages) {
    context.font = '20px monospace'; context.fillText(stage.label.toUpperCase(), x, top - 16);
    context.drawImage(stage.canvas, x, top);
    x += stage.canvas.width + gap;
  }
  context.font = '20px sans-serif'; context.fillStyle = '#55555C';
  context.fillText(`${PHOTO_COLORWAY_NOTE}. Katre is a design concept.`, pad, top + height + 56);
  const blob = await new Promise(resolve => canvas.toBlob(resolve, 'image/png'));
  canvas.width = 0; canvas.height = 0;
  if (!blob) throw new Error('Could not export this colorway.');
  const url = URL.createObjectURL(blob), link = document.createElement('a');
  link.href = url; link.download = 'katre-photo-colorway.png'; document.body.append(link); link.click(); link.remove();
  setTimeout(() => URL.revokeObjectURL(url), 1000);
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
  picker.closest('.mockup-stage')?.classList.toggle('has-product-rail', !picker.hidden);
  picker.querySelectorAll('[data-product-kind]').forEach(button => {
    const selected = button.dataset.productKind === productKind;
    button.setAttribute('aria-selected', String(selected));
    button.tabIndex = selected ? 0 : -1;
  });
}

function renderContextCaption() {
  const label = $('#contextCaptionLabel');
  if (!label) return;
  label.textContent = context === 'presentation' ? 'Legacy report preview' : context === 'social' ? 'Campaign preview' : context === 'interface' ? 'Screen preview' : `${productKind === 'skincare' ? 'Skincare' : productKind === 'footwear' ? 'Footwear' : 'Object'} product preview`;
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
  tabs.forEach(button => {
    button.addEventListener('click', () => select(button));
    button.addEventListener('keydown', event => {
      const available = tabs.filter(tab => !tab.hidden);
      const position = available.indexOf(button);
      const vertical = button.parentElement?.getAttribute('aria-orientation') === 'vertical';
      let next;
      if (event.key === 'ArrowRight' || (vertical && event.key === 'ArrowDown')) next = (position + 1) % available.length;
      if (event.key === 'ArrowLeft' || (vertical && event.key === 'ArrowUp')) next = (position - 1 + available.length) % available.length;
      if (event.key === 'Home') next = 0;
      if (event.key === 'End') next = available.length - 1;
      if (next !== undefined) { event.preventDefault(); select(available[next]); available[next].focus(); }
    });
  });
}

setupTabs('[data-context]', button => { context = button.dataset.context; renderProductPicker(); renderContextCaption(); renderMockup(); renderColorUseHint(); window.dispatchEvent(new CustomEvent('colorverse:studiochange')); track('context_preview', { context }); });
setupTabs('[data-product-kind]', button => { productKind = button.dataset.productKind; renderProductPicker(); renderContextCaption(); renderMockup(); renderColorUseHint(); window.dispatchEvent(new CustomEvent('colorverse:studiochange')); track('product_preview', { product: productKind }); });
setupTabs('[data-format]', button => { format = button.dataset.format; renderExport(); });
$('#mockup')?.addEventListener('click', async event => {
  const button = event.target.closest('[data-colorway]');
  if (!button) return;
  const action = button.dataset.colorway;
  if (action === 'export') {
    if (button.disabled) return;
    button.disabled = true;
    button.dataset.busy = 'true';
    try { await exportPhotoPreview(current.name); toast('Photo PNG ready · download requested.'); }
    catch { toast('Could not export the image. Your palette has not changed.'); }
    finally { delete button.dataset.busy; syncPhotoControls(); }
    return;
  }
  if (action === 'retry') {
    destroyPhotoPreview();
    syncPhotoPreview();
    return;
  }
  if (action === 'lock') colorwayBaseline = freezeColorway({ colors: current.colors, assignment: careAssignment });
  if (action === 'clear') colorwayBaseline = null;
  if (action === 'restore' && colorwayBaseline) {
    // The baseline holds five role colors; write them back into the members that fill those roles.
    const workspace = current.workspace.roleIndex.reduce((next, member, role) => setMember(next, member, colorwayBaseline.colors[role]), current.workspace);
    current = { ...current, workspace, colors: roleColors(workspace) };
    Object.assign(careAssignment, colorwayBaseline.assignment);
    shadeSourceColors = [...workspace.members];
  }
  persistPalette(current);
  renderSelection();
});
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
if (copyPalette) copyPalette.addEventListener('click', () => {
  const members = current.workspace?.members || current.colors;
  copy(members.join(', '), `All ${members.length} colors copied.`);
});
const paletteRoles = $('#paletteRoles');
// The Globe edits one palette member; labels keep its neutral palette identity.
const colorGlobe = createColorGlobe({
  getPalette: () => ({ ...current, members: current.workspace.members, labels: current.workspace.members.map((_, index) => memberLabel(current.workspace, index)) }),
  onPreview(index, color) {
    const role = roleOfMember(current.workspace, index);
    const colors = [...current.colors];
    if (role >= 0) colors[role] = color;
    // Only the visual preview changes until the user applies the draft; unassigned members leave it untouched.
    const panel = $('#mockup');
    if (!panel) return;
    ['bg', 'surface', 'primary', 'accent', 'text'].forEach((name, position) => panel.style.setProperty(`--p-${name}`, colors[position]));
    panel.style.setProperty('--on-primary', textOn(colors[2]));
    panel.style.setProperty('--on-accent', textOn(colors[3]));
    if (index === activeColorIndex) panel.style.setProperty('--p-material', color);
    if (role >= 0) photoPreview?.update(photoColorwayFor(colors, careAssignment));
  },
  onApply(index, color) { const label = memberLabel(current.workspace, index); replacePaletteColor(index, color); track('color_edit', { method: 'globe' }); toast(`${label} updated to ${color}.`); },
  onClose(index) {
    renderMockup();
    $('#openSelectedGlobe')?.focus({ preventScroll: true });
  },
});
if (paletteRoles) {
  paletteRoles.addEventListener('click', event => {
    const button = event.target.closest('[data-select-member]');
    if (!button) return;
    activeColorIndex = Number(button.dataset.selectMember);
    renderPaletteRoles();
    renderColorLab();
    // Material preview follows the selected member; no palette mutation/event.
    renderMockup();
    const selected = paletteRoles.querySelector(`[data-select-member="${activeColorIndex}"]`);
    selected?.focus({ preventScroll: true });
    // Keyboard selection in a scrolled rail keeps the chosen color in view.
    selected?.scrollIntoView?.({ block: 'nearest', inline: 'nearest' });
  });
  paletteRoles.addEventListener('keydown', event => {
    const button = event.target.closest('[data-select-member]');
    if (!button) return;
    const index = Number(button.dataset.selectMember), last = current.workspace.members.length - 1;
    // Up/Down move by a row in the two-column rail.
    const style = getComputedStyle(paletteRoles);
    const columns = style.display === 'grid' ? style.gridTemplateColumns.split(' ').filter(Boolean).length : 1;
    const next = { ArrowUp: Math.max(0, index - columns), ArrowLeft: Math.max(0, index - 1), ArrowDown: Math.min(last, index + columns), ArrowRight: Math.min(last, index + 1), Home: 0, End: last }[event.key];
    if (next === undefined) return;
    event.preventDefault();
    const target = paletteRoles.querySelector(`[data-select-member="${next}"]`);
    target?.click();
  });
}
$('#togglePaletteRail')?.addEventListener('click', event => {
  const button = event.currentTarget;
  const collapsed = $('.studio-workspace').classList.toggle('is-palette-collapsed');
  button.setAttribute('aria-expanded', String(!collapsed));
  button.setAttribute('aria-label', collapsed ? 'Expand palette' : 'Collapse palette');
  button.title = collapsed ? 'Expand palette' : 'Collapse palette';
  updatePaletteOverflow();
});
$('#paletteRoles')?.addEventListener('scroll', updatePaletteOverflow, { passive: true });
if (page === 'studio') window.addEventListener('resize', updatePaletteOverflow);
$('#openSelectedGlobe')?.addEventListener('click', () => colorGlobe.open(activeColorIndex));

$('#colorLab')?.addEventListener('click', event => {
  const slot = event.target.closest('[data-assign-slot]');
  if (slot) {
    const role = Number(slot.dataset.assignSlot);
    if (roleOfMember(current.workspace, activeColorIndex) === role) return;
    assignPreviewRole(activeColorIndex, role);
    $('#previewSlotChoices').querySelector(`[data-assign-slot="${role}"]`)?.focus({ preventScroll: true });
    return;
  }
  if (event.target.closest('[data-swap-next]')) {
    const next = (activeColorIndex + 1) % 5;
    swapPaletteColors(activeColorIndex, next);
    activeColorIndex = next;
    renderPaletteRoles();
    renderColorLab();
    $('#colorQuickActions [data-swap-next]')?.focus({ preventScroll: true });
    return;
  }
  const choice = event.target.closest('[data-use-color]');
  if (choice) {
    const containerId = choice.closest('[id]')?.id;
    const index = [...choice.parentElement.children].indexOf(choice);
    const color = choice.dataset.useColor;
    if (color === activeColor().toUpperCase()) return;
    replacePaletteColor(activeColorIndex, color, { keepShadeSource: choice.hasAttribute('data-color-shade') });
    const container = document.getElementById(containerId);
    const target = container?.querySelector(`[data-use-color="${color}"]`) || container?.children[index];
    (target?.disabled ? $('#openSelectedGlobe') : target)?.focus?.({ preventScroll: true });
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
$('#addColorToTray')?.addEventListener('click', () => {
  const color = activeColor().toUpperCase();
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
  const colors = paletteFromColor(seed);
  return { id: `random-${seed.slice(1).toLowerCase()}`, name: suggestPaletteName(colors), description: `A new five-color system generated around ${seed}.`, colors, image: source.image, category: 'Generated', tags: ['random', 'generated'] };
}
const randomPaletteButton = $('#randomPalette');
if (randomPaletteButton) randomPaletteButton.addEventListener('click', () => {
  const palette = makeRandomPalette();
  if (persistPalette(palette)) location.href = `/studio/?p=${encodeURIComponent(palette.id)}#studio`;
});

renderPaletteRail();
const rail = $('#paletteRail');
if (rail) {
  const search = $('#paletteSearch');
  const use = $('#paletteUse');
  let feeling = 'all';
  const applyPaletteFilters = () => {
    const color = $('#libraryColor');
    const useColor = $('#libraryColorEnabled')?.checked;
    const usePalette = $('#libraryMatchPalette')?.checked;
    const match = usePalette ? current.colors : useColor ? [color.value] : [];
    visiblePalettes = libraryEngine.search({ query: search?.value || '', use: use?.value || 'all', feeling, colors: match }).map(result => result.palette);
    renderPaletteRail(visiblePalettes);
    const empty = $('#paletteEmpty');
    if (empty) empty.hidden = visiblePalettes.length > 0 || libraryEngine.size === 0;
    const collectionIndex = $('#collectionIndex');
    if (collectionIndex) collectionIndex.textContent = `${visiblePalettes.length} palette${visiblePalettes.length === 1 ? '' : 's'}`;
    const ranking = $('#libraryRanking');
    if (ranking) ranking.textContent = match.length || /#[0-9a-f]{6}/i.test(search?.value || '') ? 'Nearest colors · approved selection only' : 'Editorial order · approved selection only';
  };
  ['libraryColor', 'libraryColorEnabled', 'libraryMatchPalette'].forEach(id => $(`#${id}`)?.addEventListener('input', applyPaletteFilters));
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
document.addEventListener('click', event => {
  const link = event.target.closest('a[href^="/studio/"]');
  if (!link) return;
  const source = link.closest('.hero-actions') ? 'homepage_hero'
    : link.closest('.header-actions') ? 'header'
      : link.dataset.select ? 'palette_card'
        : link.closest('.hero-palette-foot') ? 'palette_footer' : 'other';
  track('studio_entry', { source });
});

if (page === 'home') {
  const globeScaleStudy = params.get('globe-scale-test') === '1';
  document.body.classList.toggle('is-globe-scale-lab', globeScaleStudy);
  const homeExplorePresentation = {
    'skincare-system-01': { title: 'Soft Structure', category: 'ColorVerse Edition · Series 01', context: 'care objects · packaging', href: '/editions/skincare-system-01/' },
    'warm-cafe': { title: 'Quiet House', category: 'Brand system', context: 'hospitality · packaging' },
    'reef-current': { title: 'After Rain', category: 'Editorial system', context: 'print · culture' },
    'archive-green': { title: 'Archive Green', category: 'Material study', context: 'publishing · interiors' },
    'civic-shadow': { title: 'Civic Shadow', category: 'Architecture identity', context: 'architecture · portfolio' },
    'market-signal': { title: 'Market Signal', category: 'Retail identity', context: 'food · retail' },
    'after-hours': { title: 'After Hours', category: 'Cultural identity', context: 'music · digital' },
  };
  const homeExploreGroups = {
    all: [...homeStudies.map(palette => palette.id), 'skincare-system-01', 'reef-current', 'archive-green', 'civic-shadow', 'market-signal', 'after-hours'],
    brand: [...homeStudies.filter(palette => palette.tags.includes('brand')).map(palette => palette.id), 'skincare-system-01', 'market-signal', 'archive-green'],
    digital: ['after-hours', 'civic-shadow', 'reef-current'],
    spaces: [...homeStudies.filter(palette => palette.tags.includes('space')).map(palette => palette.id), 'civic-shadow', 'archive-green', 'warm-cafe'],
    editorial: [...homeStudies.filter(palette => palette.tags.includes('editorial')).map(palette => palette.id), 'reef-current', 'archive-green', 'after-hours', 'civic-shadow'],
  };
  const renderHomeExplore = (group = 'all') => {
    const grid = $('#homeExploreGrid');
    if (!grid) return;
    const items = (homeExploreGroups[group] || homeExploreGroups.all)
      .map(id => homeCandidateFor(id, palettes, location.hostname))
      .filter(Boolean);
    grid.classList.toggle('is-pair', items.length === 2);
    grid.innerHTML = items.length ? items.map((palette, index) => {
      const presentation = homeExplorePresentation[palette.id] || {};
      const title = presentation.title || palette.name;
      const studioHref = `/studio/?p=${encodeURIComponent(palette.id)}#studio`;
      const mediaHref = presentation.href || studioHref;
      if (palette.credit?.kind === 'ai') return `<article class="home-explore-card home-explore-review home-explore-ai" data-palette="${escape(palette.id)}">
        <div class="home-explore-colors" role="group" aria-label="${escape(title)} palette colors">${palette.colors.slice(0, 5).map((color, roleIndex) => swatch(color, '', roles[roleIndex])).join('')}</div>
        <a class="home-explore-media is-reference" href="${studioHref}" data-select="${escape(palette.id)}" aria-label="Open ${escape(title)} in Studio"><img src="${escape(palette.image)}" alt="${escape(palette.imageAlt)}" loading="lazy" decoding="async"><span class="ai-concept-badge" title="Owner-supplied AI-generated concept. Not a real product photograph."><svg viewBox="0 0 20 20" aria-hidden="true"><path d="m10 2 2.2 5.8L18 10l-5.8 2.2L10 18l-2.2-5.8L2 10l5.8-2.2Z"/><path d="M17 1v4M15 3h4"/></svg>AI concept</span></a>
        <div class="home-explore-review-footer">
          <div class="home-explore-review-identity"><span class="home-explore-review-meta">${escape(palette.category)}</span><h2><a href="${studioHref}" data-select="${escape(palette.id)}">${escape(title)}</a></h2></div>
          <a class="home-explore-review-cta" href="${studioHref}" data-select="${escape(palette.id)}" aria-label="Open ${escape(title)} in Studio">Studio →</a>
        </div>
      </article>`;
      return `<article class="home-explore-card" style="--cover:${palette.colors[1]}">
      <div class="home-explore-colors" role="group" aria-label="${escape(title)} palette colors">${palette.colors.slice(0, 5).map(color => swatch(color)).join('')}</div>
      <a class="home-explore-media visual-pending" href="${escape(mediaHref)}"${presentation.href ? '' : ` data-select="${palette.id}"`} aria-label="${presentation.href ? 'View' : 'Open'} ${escape(title)}${presentation.href ? ' case study' : ' in Studio'}">
        <span class="visual-pending-label">Image awaiting curation</span>
        <span class="home-explore-index">${String(index + 1).padStart(2, '0')}</span><span class="home-explore-category">${escape(presentation.category || palette.category)}</span>
        <span class="home-explore-caption"><strong>${escape(title)}</strong><span>${escape(presentation.context || (palette.useCases || []).slice(0, 2).join(' · '))}</span></span>
      </a>
      <div class="home-explore-copy"><p>${escape(palette.description)}</p><a href="${studioHref}" data-select="${palette.id}">Use palette →</a></div>
    </article>`;
    }).join('') : '<div class="home-explore-empty"><span class="eyebrow">More studies to come</span><p>No concept studies in this category yet. Try another category, or start a palette on the globe.</p><a href="#atlas">Explore colors on the globe ↑</a></div>';
  };
  renderHomeExplore();
  $('#discover')?.setAttribute('aria-label', 'AI concept palette studies');
  const reviewNote = $('.home-explore-foot > span');
  if (reviewNote) reviewNote.textContent = 'AI product concepts · palette studies, not manufacturer colors. Final selection in progress.';
  $$('.home-explore-filters [data-home-filter]').forEach(button => button.addEventListener('click', () => {
    $$('.home-explore-filters [data-home-filter]').forEach(item => item.setAttribute('aria-pressed', String(item === button)));
    renderHomeExplore(button.dataset.homeFilter);
  }));
  let activeAtlasWorld = savedAtlasWorld;
  const atlasWorldSwitch = $('#atlasWorldSwitch');
  const atlasWorldSelect = $('#atlasWorldSelect');
  const setupGlobeScaleStudy = () => {
    const section = $('#globeScaleLab');
    const list = $('#globeScaleLabList');
    const sourceHeader = document.querySelector('body > .header');
    const sourceHero = document.querySelector('body > main > .hero');
    if (!globeScaleStudy || !section || !list || !sourceHeader || !sourceHero) return;
    section.hidden = false;
    sourceHeader.style.display = 'none';
    sourceHero.style.display = 'none';
    const studies = [
      { scale: 1, label: '100%', note: 'Current reference' },
      { scale: .88, label: '88%', note: 'Slightly lighter' },
      { scale: .76, label: '76%', note: 'Balanced' },
      { scale: .64, label: '64%', note: 'Compact' },
      { scale: .52, label: '52%', note: 'Quiet' },
    ];
    list.replaceChildren(...studies.map((study, index) => {
      const frame = document.createElement('article');
      frame.className = 'globe-scale-frame';
      const header = sourceHeader.cloneNode(true);
      header.classList.add('globe-scale-study-header');
      header.style.display = '';
      const hero = sourceHero.cloneNode(true);
      hero.classList.add('globe-scale-study-hero');
      hero.style.display = 'block';
      [header, hero].forEach(root => root.querySelectorAll('[id]').forEach(element => element.removeAttribute('id')));
      const canvas = hero.querySelector('canvas');
      const worldRail = hero.querySelector('.atlas-world-rail');
      const worldSelect = hero.querySelector('.atlas-world-mobile select');
      const worldLabel = hero.querySelector('.atlas-world-rail');
      if (worldRail) worldRail.innerHTML = `<span class="atlas-world-label">Worlds</span>${atlasWorlds.map((world, worldIndex) => `<button type="button" role="tab" aria-selected="${world.id === savedAtlasWorld.id}" title="${escape(world.name)}"><span class="atlas-world-index">${String(worldIndex + 1).padStart(2, '0')}</span><span class="atlas-world-copy"><strong>${escape(world.shortName)}</strong><small>${escape(world.name)}</small></span><i class="atlas-world-chip" style="--world-accent:${world.accent}"></i></button>`).join('')}`;
      if (worldSelect) worldSelect.innerHTML = atlasWorlds.map(world => `<option value="${world.id}">${escape(world.name)}</option>`).join('');
      if (worldLabel) worldLabel.setAttribute('aria-label', 'Choose a color world');
      if (canvas) {
        canvas.classList.add('globe-scale-study-canvas');
        canvas.setAttribute('tabindex', '0');
        canvas.setAttribute('role', 'application');
        canvas.setAttribute('aria-label', `Homepage globe at ${study.label} scale`);
      }
      frame.append(header, hero);
      return frame;
    }));
    list.querySelectorAll('.globe-scale-study-canvas').forEach((canvas, index) => {
      const hero = canvas.closest('.globe-scale-study-hero');
      createAtlas(canvas, {
        initialWorld: savedAtlasWorld.id,
        interactionTarget: hero?.querySelector('.atlas-touch-zone'),
        radiusScale: studies[index].scale,
        autoRotate: false,
        trueColor: false,
      });
    });
  };
  setupGlobeScaleStudy();
  if (!globeScaleStudy && atlasWorldSwitch) {
    atlasWorldSwitch.innerHTML = atlasWorlds.map(world => `<button type="button" role="tab" data-atlas-world="${world.id}" aria-selected="${world.id === activeAtlasWorld.id}" tabindex="${world.id === activeAtlasWorld.id ? '0' : '-1'}" title="${escape(world.name)}" aria-label="${escape(world.name)}"><span class="atlas-world-name">${escape(world.shortName)}</span></button>`).join('');
    if (atlasWorldSelect) atlasWorldSelect.innerHTML = atlasWorlds.map(world => `<option value="${world.id}">${escape(world.name)}</option>`).join('');
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
    const globe = createAtlas($('#globe'), {
      interactionTarget: $('#atlasTouchZone'),
      initialWorld: activeAtlasWorld.id,
      radiusScale: .76,
      onSelect(payload) { addAtlasSelection({ ...payload, worldId: activeAtlasWorld.id }); globe.setSelection(atlasSelected.filter(item => item.worldId === activeAtlasWorld.id).map(item => item.index)); },
      onHover(payload) { atlasHover = payload; if (payload && !atlasPinned) setAtlasReadout(payload); },
    });
    const selectAtlasWorld = (id, notify = true) => {
      const nextWorld = atlasWorlds.find(world => world.id === id);
      if (!nextWorld || nextWorld.id === activeAtlasWorld.id) return;
      activeAtlasWorld = nextWorld;
      globe.setWorld(nextWorld.id);
      atlasPinned = atlasSelected.at(-1) || null;
      atlasHover = null;
      globe.setSelection(atlasSelected.filter(item => item.worldId === nextWorld.id).map(item => item.index));
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
      if (!['ArrowLeft', 'ArrowRight', 'ArrowUp', 'ArrowDown', 'Home', 'End'].includes(event.key)) return;
      event.preventDefault();
      const buttons = $$('#atlasWorldSwitch [data-atlas-world]');
      const currentIndex = buttons.findIndex(button => button === document.activeElement);
      const step = event.key === 'ArrowDown' ? 3 : event.key === 'ArrowUp' ? -3 : event.key === 'ArrowRight' ? 1 : -1;
      const nextIndex = event.key === 'Home' ? 0 : event.key === 'End' ? buttons.length - 1 : (currentIndex + step + buttons.length) % buttons.length;
      buttons[nextIndex].focus();
      selectAtlasWorld(buttons[nextIndex].dataset.atlasWorld);
    });
    if (atlasWorldSelect) atlasWorldSelect.addEventListener('change', () => selectAtlasWorld(atlasWorldSelect.value));
    const syncGlobeSelection = () => globe.setSelection(atlasSelected.filter(item => item.worldId === activeAtlasWorld.id).map(item => item.index));
    // Open with one actual front-facing cell of the active world selected, silently.
    if (!atlasSelected.length) {
      atlasSelected = [{ ...globe.frontCell(), worldId: activeAtlasWorld.id, seeded: true }];
      atlasPinned = atlasSelected[0];
      syncGlobeSelection();
      renderAtlasSelection();
      renderSelection();
    }
    setAtlasReadout(atlasPinned, Boolean(atlasPinned));
    const miniStudioSwatches = $('#heroSwatches');
    if (miniStudioSwatches) miniStudioSwatches.addEventListener('click', event => {
      const button = event.target.closest('[data-mini-slot]');
      if (!button) return;
      const slot = Number(button.dataset.miniSlot);
      atlasActiveSlot = atlasActiveSlot === slot ? null : slot;
      atlasRecentSlot = null;
      renderAtlasSelection();
      renderSelection();
    });
    const acceptMiniSuggestion = event => {
      const button = event.target.closest('[data-mini-accept]');
      if (!button || atlasSelected.length >= 5) return;
      atlasRecentSlot = atlasSelected.length;
      atlasSelected.push({ hex: button.dataset.miniAccept, worldId: 'custom', index: -1 });
      atlasPinned = atlasSelected.at(-1);
      atlasActiveSlot = null;
      renderAtlasSelection();
      renderSelection();
      setAtlasReadout(atlasPinned, true);
    };
    miniStudioSwatches?.addEventListener('click', acceptMiniSuggestion);
    $('#miniColorSuggestions')?.addEventListener('click', acceptMiniSuggestion);
    const editMiniColor = hex => {
      const index = atlasActiveSlot ?? atlasSelected.length - 1;
      if (index < 0) return;
      atlasSelected[index] = { hex, worldId: 'custom', index: -1 };
      atlasPinned = atlasSelected[index];
      syncGlobeSelection();
      renderAtlasSelection();
      renderSelection();
      setAtlasReadout(atlasPinned, true);
    };
    for (const id of ['miniHue', 'miniIntensity', 'miniLightness']) {
      $(`#${id}`)?.addEventListener('input', () => {
        miniHueMemory = Number($('#miniHue').value);
        editMiniColor(fromHsl({ h: miniHueMemory, s: Number($('#miniIntensity').value) / 100, l: Number($('#miniLightness').value) / 100 }));
      });
    }
    $('#miniHex')?.addEventListener('change', event => {
      const value = event.target.value.trim();
      if (!/^#[0-9a-f]{6}$/i.test(value)) { event.target.setAttribute('aria-invalid', 'true'); $('#miniEditorStatus').textContent = 'Use six-digit HEX, for example #E38B18.'; return; }
      event.target.removeAttribute('aria-invalid');
      editMiniColor(value.toUpperCase());
    });
    const removeAtlasColor = $('#removeAtlasColor');
    if (removeAtlasColor) removeAtlasColor.addEventListener('click', () => {
      if (atlasActiveSlot === null) return;
      atlasSelected.splice(atlasActiveSlot, 1);
      atlasActiveSlot = null;
      atlasRecentSlot = null;
      atlasPinned = atlasSelected.at(-1) || null;
      syncGlobeSelection();
      renderAtlasSelection();
      renderSelection();
      setAtlasReadout(atlasPinned, Boolean(atlasPinned));
    });
    const clearAtlasSelection = $('#clearAtlasSelection');
    if (clearAtlasSelection) clearAtlasSelection.addEventListener('click', () => { atlasSelected = []; atlasPinned = null; atlasActiveSlot = null; atlasRecentSlot = null; globe.setSelection([]); renderAtlasSelection(); renderSelection(); setAtlasReadout(atlasHover); });
    const openMiniStudio = $('#openMiniStudio');
    if (openMiniStudio) openMiniStudio.addEventListener('click', event => {
      const palette = buildAtlasPalette();
      if (palette && !persistPalette(palette)) event.preventDefault();
    });
    const useAtlasPalette = $('#useAtlasPalette');
    if (useAtlasPalette) useAtlasPalette.addEventListener('click', () => {
      const palette = buildAtlasPalette();
      if (!palette) return;
      if (persistPalette(palette)) location.href = `/studio/?p=${encodeURIComponent(palette.id)}#studio`;
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

if (page === 'community') {
  initCommunity({ getPalette: () => current, openPalette: palette => { if (persistPalette(palette)) location.href = `/studio/?p=${encodeURIComponent(palette.id)}#studio`; } });
}

const input = $('#imageInput');
const dropzone = $('#dropzone');
if (input && dropzone) {
  let extractionSequence = 0;
  let extractionSample = null;
  let manualSample = null;
  let extractionOriginals = [];
  let extractionUndo = [];
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
    layer.setAttribute('aria-label', `${extracted.colors.length} draggable color sample points`);
    layer.innerHTML = extracted.colors.map((color, index) => {
      const point = pickerPositions[index] || { x: 50, y: 50 };
      return `<button type="button" class="image-picker" data-image-picker="${index}" style="--picker:${color};--picker-on:${textOn(color)};left:${point.x}%;top:${point.y}%" aria-label="Move sample ${index + 1}, currently ${color}"><b>${index + 1}</b><span>${color}</span></button>`;
    }).join('');
  }
  function sampleColorAt(xPercent, yPercent) {
    if (!manualSample) return null;
    return sampleImageColor(manualSample.context, manualSample.width, manualSample.height, xPercent, yPercent);
  }
  function rememberExtraction() {
    extractionUndo.push({ selected: selectedExtraction, colors: extractedVariants.map(variant => [...variant.colors]), roleIndex: extractedVariants.map(variant => [...variant.roleIndex]), positions: pickerPositions.map(point => ({ ...point })) });
    if (extractionUndo.length > 30) extractionUndo.shift();
    $('#undoExtraction').disabled = false;
  }
  function syncPickerBounds() {
    const image = $('#extractedImage');
    const layer = $('#imagePickers');
    if (!image || !layer || !image.naturalWidth) return;
    const scale = Math.min(image.clientWidth / image.naturalWidth, image.clientHeight / image.naturalHeight);
    const width = image.naturalWidth * scale, height = image.naturalHeight * scale;
    Object.assign(layer.style, { width: `${width}px`, height: `${height}px`, left: `${(image.clientWidth - width) / 2}px`, top: `${(image.clientHeight - height) / 2}px` });
  }
  function updatePicker(index, event) {
    const wrap = $('#imagePickers');
    const variant = extractedVariants[selectedExtraction];
    if (!wrap || !variant) return;
    const bounds = wrap.getBoundingClientRect();
    const { x, y } = imagePoint(bounds, event.clientX, event.clientY);
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
    renderExtractionVariants();
  }
  function selectExtractionVariant(index) {
    if (!extractedVariants[index]) return;
    const changed = selectedExtraction !== index || pickerPositions.length === 0;
    selectedExtraction = index;
    extracted = extractedVariants[index];
    $('#extractionReading').value = String(index);
    const info = $('#extractionInfo');
    const action = $('#useExtraction');
    if (info) info.textContent = `${extracted.variantName} · ${extracted.colors.length} colors`;
    if (action) action.textContent = 'Continue in Studio ↗';
    renderExtractionVariants();
    renderImagePickers(changed);
    syncPickerBounds();
  }
  // Row N is image point N. The five original colors keep their preview roles;
  // inserted colors are extras that can be removed again.
  function renderExtractionVariants() {
    const container = $('#extractedSwatches');
    if (!container) return;
    const variant = extractedVariants[selectedExtraction];
    const colors = variant?.colors || [];
    const canInsert = colors.length < EXTRACT_MAX_MEMBERS;
    container.setAttribute('aria-label', `${colors.length} extracted palette colors`);
    container.innerHTML = colors.map((color, index) => {
      const role = variant.roleIndex.indexOf(index), sample = index + 1;
      return `<div class="extract-color-row${role < 0 ? ' is-extra' : ''}" style="--swatch:${color};--on:${textOn(color)}"><button type="button" class="extract-color-copy" data-copy="${color}" aria-label="Copy HEX ${color}, sample ${sample}"><code>${color}</code><small>Color ${sample}</small></button><span class="extract-color-tools">${role < 0 ? `<button type="button" class="extract-remove" data-extract-remove="${index}" aria-label="Remove extra color, sample ${sample}" title="Remove this extra color">×</button>` : ''}<label class="extract-color-edit"><span aria-hidden="true" title="Image point ${sample}">${sample}</span><input type="color" value="${color}" data-extract-color="${index}" aria-label="Edit color of sample ${sample} (image point ${sample})"></label></span>${canInsert && index < colors.length - 1 ? `<button type="button" class="extract-insert" data-extract-insert="${index + 1}" aria-label="Insert a color between samples ${sample} and ${sample + 1}" title="Insert a color here">+</button>` : ''}</div>`;
    }).join('');
  }
  // Existing points stay where the user left them; only the inserted/removed point changes.
  function editExtractionMembers(change, movePoints, message) {
    const variant = extractedVariants[selectedExtraction];
    if (!variant || pickerPositions.length !== variant.colors.length) return false;
    const next = change({ members: variant.colors, roleIndex: variant.roleIndex });
    if (!next) return false;
    rememberExtraction();
    movePoints();
    variant.colors = next.members;
    variant.roleIndex = next.roleIndex;
    extracted = variant;
    renderExtractionVariants();
    renderImagePickers(false);
    const info = $('#extractionInfo');
    if (info) info.textContent = `${variant.variantName} · ${variant.colors.length} colors`;
    const status = $('#extractStatus');
    if (status) status.textContent = message;
    return true;
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
      const full = document.createElement('canvas');
      full.width = image.naturalWidth;
      full.height = image.naturalHeight;
      const fullContext = full.getContext('2d', { willReadFrequently: true });
      fullContext.drawImage(image, 0, 0);
      const preview = document.createElement('canvas');
      const previewScale = Math.min(1, 2048 / Math.max(image.width, image.height));
      preview.width = Math.max(1, Math.round(image.width * previewScale));
      preview.height = Math.max(1, Math.round(image.height * previewScale));
      preview.getContext('2d').drawImage(image, 0, 0, preview.width, preview.height);
      const previewData = preview.toDataURL('image/png');
      if (imageURL) URL.revokeObjectURL(imageURL);
      imageURL = nextURL;
      extractionSample = { width: sample.width, height: sample.height, pixels: sampleData.data };
      manualSample = { context: fullContext, width: full.width, height: full.height };
      extractedVariants = result.variants.map(variant => ({ id: `your-image-${variant.key}`, name: suggestPaletteName(variant.colors), variantName: variant.name, detail: variant.detail, description: variant.description, colors: variant.colors, roleIndex: [0, 1, 2, 3, 4], image: null }));
      const nameInput = $('#extractionName');
      if (nameInput && (!nameInput.value.trim() || nameInput.value === nameInput.dataset.suggested || nameInput.value === 'Untitled')) {
        nameInput.value = extractedVariants[0].name;
        nameInput.dataset.suggested = nameInput.value;
      }
      extractionOriginals = extractedVariants.map(variant => [...variant.colors]);
      extractionUndo = [];
      $('#undoExtraction').disabled = true;
      $('#extractionReading').innerHTML = extractedVariants.map((variant, index) => `<option value="${index}">${escape(variant.variantName)}</option>`).join('');
      selectedExtraction = 0;
      pickerPositions = [];
      const extractedImage = $('#extractedImage');
      // Original local image for display; lossless high-resolution fallback for
      // embedded browsers that cannot display a blob URL. Neither is persisted.
      if (extractedImage) { extractedImage.onerror = () => { extractedImage.onerror = null; extractedImage.src = previewData; }; extractedImage.src = nextURL; }
      renderExtractionVariants();
      selectExtractionVariant(0);
      dropzone.classList.add('has-result');
      const resultPanel = $('#extractionResult');
      if (resultPanel) resultPanel.hidden = false;
      $('#extract').classList.add('has-image');
      requestAnimationFrame(syncPickerBounds);
      if (status) status.textContent = 'Drag a point to refine a color. Your image stays private.';
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
  extractedSwatches?.addEventListener('change', event => {
    const control = event.target.closest('[data-extract-color]');
    if (!control || !extracted) return;
    rememberExtraction();
    const index = Number(control.dataset.extractColor);
    extracted.colors[index] = control.value.toUpperCase();
    // Move only the edited point to its nearest match; the other samples stay put.
    const [point] = locatePickerPositions([extracted.colors[index]]);
    if (point && pickerPositions.length === extracted.colors.length) pickerPositions[index] = point;
    renderExtractionVariants();
    renderImagePickers(false);
  });
  extractedSwatches?.addEventListener('click', event => {
    const insert = event.target.closest('[data-extract-insert]');
    const remove = event.target.closest('[data-extract-remove]');
    if (insert) {
      const position = Number(insert.dataset.extractInsert);
      const before = pickerPositions[position - 1], after = pickerPositions[position];
      const point = before && after ? { x: (before.x + after.x) / 2, y: (before.y + after.y) / 2 } : { ...(before || after || { x: 50, y: 50 }) };
      const color = sampleColorAt(point.x, point.y) || extracted?.colors[position - 1];
      if (editExtractionMembers(workspace => insertMember(workspace, position, color, EXTRACT_MAX_MEMBERS), () => pickerPositions.splice(position, 0, point), `Sample ${position + 1} added between the neighbouring points. Drag it to choose its color.`)) {
        $(`[data-image-picker="${position}"]`)?.focus({ preventScroll: true });
      }
      return;
    }
    if (remove) {
      const index = Number(remove.dataset.extractRemove);
      if (editExtractionMembers(workspace => removeMember(workspace, index), () => pickerPositions.splice(index, 1), `Extra sample ${index + 1} removed.`)) {
        (extractedSwatches.querySelector(`[data-extract-color="${Math.max(0, index - 1)}"]`))?.focus({ preventScroll: true });
      }
    }
  });
  $('#extractionReading')?.addEventListener('change', event => { rememberExtraction(); selectExtractionVariant(Number(event.target.value)); });
  $('#replaceExtractionImage')?.addEventListener('click', () => input.click());
  $('#resetExtraction')?.addEventListener('click', () => { rememberExtraction(); extractedVariants[selectedExtraction].colors = [...extractionOriginals[selectedExtraction]]; extractedVariants[selectedExtraction].roleIndex = [0, 1, 2, 3, 4]; pickerPositions = []; selectExtractionVariant(selectedExtraction); });
  $('#undoExtraction')?.addEventListener('click', () => {
    const saved = extractionUndo.pop();
    if (!saved) return;
    extractedVariants.forEach((variant, index) => { variant.colors = saved.colors[index]; variant.roleIndex = saved.roleIndex[index]; });
    selectedExtraction = saved.selected;
    pickerPositions = saved.positions;
    selectExtractionVariant(selectedExtraction);
    $('#undoExtraction').disabled = extractionUndo.length === 0;
  });
  if (globalThis.ResizeObserver) new ResizeObserver(syncPickerBounds).observe($('#extractedImageWrap'));
  $('#extractedImage')?.addEventListener('load', syncPickerBounds);
  const imagePickers = $('#imagePickers');
  if (imagePickers) {
    imagePickers.addEventListener('pointerdown', event => {
      const picker = event.target.closest('[data-image-picker]');
      if (!picker || event.button > 0) return;
      event.preventDefault();
      const index = Number(picker.dataset.imagePicker);
      rememberExtraction();
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
    imagePickers.addEventListener('keydown', event => {
      const picker = event.target.closest('[data-image-picker]');
      const direction = { ArrowLeft: [-1, 0], ArrowRight: [1, 0], ArrowUp: [0, -1], ArrowDown: [0, 1] }[event.key];
      if (!picker || !direction) return;
      event.preventDefault();
      rememberExtraction();
      const index = Number(picker.dataset.imagePicker), point = pickerPositions[index], bounds = imagePickers.getBoundingClientRect();
      updatePicker(index, { clientX: bounds.left + bounds.width * (point.x + direction[0]) / 100, clientY: bounds.top + bounds.height * (point.y + direction[1]) / 100 });
    });
  }
  const useExtraction = $('#useExtraction');
  if (useExtraction) useExtraction.addEventListener('click', () => {
    if (!extracted) return;
    // Studio receives every sample in order; the original five keep their preview roles.
    const workspace = workspaceFromColors(extracted.colors, extracted.roleIndex);
    if (!workspace) return;
    if (!persistPalette({ ...extracted, name: $('#extractionName')?.value.trim().slice(0, 120) || extracted.name, colors: roleColors(workspace), workspace })) {
      $('#extractStatus').textContent = 'Browser storage is unavailable. Your palette is still here; copy it before leaving this page.';
      return;
    }
    location.href = `/studio/?p=${encodeURIComponent(extracted.id)}#studio`;
  });
}

renderSelection();
if (page === 'studio') {
  const referenceLabel = document.querySelector('.product-preview-image span');
  const referenceNote = document.querySelector('.product-preview-stage aside small');
  if (referenceLabel) referenceLabel.textContent = 'Reference image pending';
  if (referenceNote) referenceNote.textContent = 'Palette roles update the direction; add an approved reference image later.';
}
initAccountNavigation();
if (page === 'studio') {
  $('#savePersonalPalette')?.addEventListener('click', () => {
    const snapshot = studioSnapshot();
    // My palettes keeps the complete member list (2–24), not only the five preview roles.
    const draft = sanitizeDraft({ ...snapshot, colors: [...current.workspace.members], collection: snapshot.collection || undefined, referenceKey: snapshot.sourcePaletteId });
    try { sessionStorage.setItem(DRAFT_KEY, JSON.stringify(draft)); location.assign('/account/'); }
    catch { toast('Allow browser storage to keep this palette while signing in.'); }
  });
  import('./project-store.js?v=28')
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
