import { clamp, oklab, oklch, roles, textOn } from './color.js';

const coordinates = hex => {
  const [lightness, a, b] = oklab(hex);
  return { lightness, chroma: Math.hypot(a, b), hue: Math.atan2(b, a) * 180 / Math.PI };
};

// Keep a fixed source while browsing so choosing a shade never moves the scale.
export function buildShadeFamilies(hex) {
  const base = coordinates(hex);
  const neutral = base.chroma < .003;
  const families = [
    { id: 'pure', label: 'Pure', chroma: neutral ? 0 : base.chroma, description: neutral ? 'A neutral study, from chalk white to charcoal.' : 'The character of your original, from light to deep.' },
    ...(neutral ? [] : [
      { id: 'soft', label: 'Soft', chroma: base.chroma * .42, description: 'Quiet, softened color with a little more breathing room.' },
      { id: 'rich', label: 'Rich', chroma: Math.min(.34, base.chroma * 1.35 + .045), description: 'A fuller expression of the same hue.' },
    ]),
  ];
  return families.map(family => {
    const colors = Array.from({ length: 21 }, (_, index) => {
      const lightness = .98 - index * .043;
      // Leave room inside the display gamut so families do not collapse into
      // identical clipped colors at the light and dark ends of the scale.
      const availableChroma = coordinates(oklch(lightness, .4, base.hue)).chroma;
      const ceiling = { pure: .86, soft: .4, rich: .99 }[family.id];
      return oklch(lightness, Math.min(family.chroma, availableChroma * ceiling), base.hue);
    });
    if (family.id === 'pure') {
      const nearest = clamp(Math.round((.98 - base.lightness) / .043), 0, 20);
      colors[nearest] = hex.toUpperCase();
    }
    return { ...family, colors };
  });
}

export function createShadeStudio({ getPalette, onApply, onClose }) {
  const dialog = document.querySelector('#shadeStudio');
  if (!dialog) return { open() {} };
  const $ = selector => dialog.querySelector(selector);
  const grid = $('#shadeTileGrid');
  const tabs = [...dialog.querySelectorAll('[data-shade-family]')];
  let source, selected, base, families, familyId, roleIndex, previewPalette, opener;
  let fineLightness, fineChroma;

  function showSample(hex, hovering = false) {
    const sample = $('#shadeSample');
    sample.style.setProperty('--sample', hex);
    sample.style.setProperty('--sample-ink', textOn(hex));
    $('#shadeSampleHex').textContent = hex;
    $('#shadeSampleState').textContent = hovering ? 'Previewing' : 'Selected shade';
    $('#shadeSampleLightness').textContent = `${Math.round(coordinates(hex).lightness * 100)}% lightness`;
    const colors = [...previewPalette];
    colors[roleIndex] = hex;
    $('#shadePalettePreview').innerHTML = colors.map((color, index) => `<span style="--palette-color:${color};--palette-ink:${textOn(color)}" class="${index === roleIndex ? 'is-editing' : ''}" aria-label="${roles[index]} ${color}" title="${roles[index]} ${color}">${index === roleIndex ? '<span aria-hidden="true">↓</span>' : ''}</span>`).join('');
  }

  function syncSelection({ syncControls = true } = {}) {
    showSample(selected);
    $('#shadeSelectedHex').textContent = selected;
    $('#shadeChangeChip').style.background = selected;
    $('#shadeSelectionStatus').textContent = selected === source ? 'Original color' : `Ready for ${roles[roleIndex].toLowerCase()}`;
    $('#applyShade').disabled = selected === source;
    grid.querySelectorAll('[data-shade-color]').forEach(button => button.setAttribute('aria-pressed', String(button.dataset.shadeColor === selected)));
    if (syncControls) {
      const point = coordinates(selected);
      fineLightness = point.lightness;
      fineChroma = point.chroma;
      $('#shadeLightness').value = (fineLightness * 100).toFixed(1);
      $('#shadeChroma').value = (fineChroma / .4 * 100).toFixed(1);
    }
    $('#shadeLightnessValue').textContent = `${Math.round(fineLightness * 100)}%`;
    $('#shadeChromaValue').textContent = `${Math.round(fineChroma / .4 * 100)}%`;
    const lightStops = Array.from({ length: 11 }, (_, i) => oklch(i / 10, fineChroma, base.hue));
    $('#shadeLightness').style.setProperty('--range-track', `linear-gradient(90deg,${lightStops.join(',')})`);
    $('#shadeChroma').style.setProperty('--range-track', `linear-gradient(90deg,${oklch(fineLightness, 0, base.hue)},${oklch(fineLightness, .4, base.hue)})`);
  }

  function renderFamily() {
    const family = families.find(item => item.id === familyId);
    tabs.forEach(tab => {
      tab.hidden = !families.some(item => item.id === tab.dataset.shadeFamily);
      const active = tab.dataset.shadeFamily === familyId;
      tab.setAttribute('aria-selected', String(active));
      tab.tabIndex = active ? 0 : -1;
    });
    $('#shadeFamilyPanel').setAttribute('aria-labelledby', `shade-tab-${familyId}`);
    $('#shadeFamilyDescription').textContent = family.description;
    grid.innerHTML = family.colors.map((hex, index) => `<button class="shade-tile" type="button" data-shade-color="${hex}" style="--tile:${hex};--tile-ink:${textOn(hex)}" aria-label="${family.label} shade ${index + 1}, ${hex}${hex === source ? ', original color' : ''}" aria-pressed="${hex === selected}"><span class="shade-tile-top"><span>${String(index + 1).padStart(2, '0')}</span><span class="shade-tile-check" aria-hidden="true">✓</span></span><code>${hex.slice(1)}</code>${hex === source ? '<span class="shade-source-dot" title="Original color" aria-hidden="true"></span>' : ''}</button>`).join('');
    syncSelection();
  }

  function select(hex) {
    selected = hex;
    syncSelection();
  }

  function open(index, trigger = document.activeElement) {
    roleIndex = index;
    previewPalette = getPalette().colors.slice(0, 5);
    source = previewPalette[index].toUpperCase();
    selected = source;
    base = coordinates(source);
    families = buildShadeFamilies(source);
    familyId = 'pure';
    opener = trigger;
    $('#shadeRoleName').textContent = roles[index];
    $('#shadeOriginalHex').textContent = source;
    $('#shadeOriginal').style.setProperty('--original', source);
    $('#shadeOriginal').style.setProperty('--original-ink', textOn(source));
    $('#shadeLibraryCount').textContent = `${new Set(families.flatMap(family => family.colors)).size} possibilities`;
    $('#shadeChroma').disabled = families.length === 1;
    $('#shadeChroma').setAttribute('aria-label', families.length === 1 ? 'Color intensity, neutral color' : 'Color intensity');
    renderFamily();
    dialog.showModal();
    document.body.classList.add('shade-studio-open');
    tabs[0].focus({ preventScroll: true });
  }

  dialog.querySelectorAll('[data-shade-close]').forEach(button => button.addEventListener('click', () => dialog.close()));
  dialog.addEventListener('close', () => {
    document.body.classList.remove('shade-studio-open');
    if (opener?.isConnected) opener.focus({ preventScroll: true });
    else onClose?.(roleIndex);
  });
  $('#shadeOriginal').addEventListener('click', () => select(source));
  $('#applyShade').addEventListener('click', () => {
    onApply(roleIndex, selected);
    dialog.close();
  });
  tabs.forEach(tab => tab.addEventListener('click', () => { familyId = tab.dataset.shadeFamily; renderFamily(); }));
  $('.shade-family-tabs').addEventListener('keydown', event => {
    if (!['ArrowLeft', 'ArrowRight', 'Home', 'End'].includes(event.key)) return;
    event.preventDefault();
    const visible = tabs.filter(tab => !tab.hidden);
    const index = visible.indexOf(document.activeElement);
    const next = event.key === 'Home' ? 0 : event.key === 'End' ? visible.length - 1 : (index + (event.key === 'ArrowRight' ? 1 : -1) + visible.length) % visible.length;
    visible[next].click();
    visible[next].focus();
  });
  grid.addEventListener('click', event => {
    const button = event.target.closest('[data-shade-color]');
    if (button) select(button.dataset.shadeColor);
  });
  grid.addEventListener('pointerover', event => {
    const button = event.target.closest('[data-shade-color]');
    if (button && event.pointerType !== 'touch') showSample(button.dataset.shadeColor, true);
  });
  grid.addEventListener('pointerleave', () => showSample(selected));
  grid.addEventListener('focusin', event => {
    if (event.target.dataset.shadeColor) showSample(event.target.dataset.shadeColor, true);
  });
  grid.addEventListener('focusout', event => { if (!grid.contains(event.relatedTarget)) showSample(selected); });
  grid.addEventListener('keydown', event => {
    if (!['ArrowLeft', 'ArrowRight', 'ArrowUp', 'ArrowDown', 'Home', 'End'].includes(event.key)) return;
    const tiles = [...grid.querySelectorAll('button')];
    const index = tiles.indexOf(event.target);
    if (index < 0) return;
    event.preventDefault();
    const columns = getComputedStyle(grid).gridTemplateColumns.split(' ').length;
    const step = { ArrowLeft: -1, ArrowRight: 1, ArrowUp: -columns, ArrowDown: columns }[event.key];
    const next = event.key === 'Home' ? 0 : event.key === 'End' ? tiles.length - 1 : clamp(index + step, 0, tiles.length - 1);
    tiles[next].focus();
  });
  for (const id of ['shadeLightness', 'shadeChroma']) {
    $(`#${id}`).addEventListener('input', () => {
      fineLightness = Number($('#shadeLightness').value) / 100;
      fineChroma = families.length === 1 ? 0 : Number($('#shadeChroma').value) / 100 * .4;
      selected = oklch(fineLightness, fineChroma, base.hue);
      syncSelection({ syncControls: false });
    });
  }
  return { open };
}
