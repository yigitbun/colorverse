import { createAtlas } from './globe.js?v=25';
import { clamp, rgb, toHex, textOn, roles } from './color.js';

// HSL adds an independent saturation axis to the globe's hue/lightness surface.
export function toHsl(hex, fallbackHue = 0) {
  const [r, g, b] = rgb(hex).map(channel => channel / 255);
  const high = Math.max(r, g, b), low = Math.min(r, g, b), delta = high - low;
  const l = (high + low) / 2;
  const h = delta ? (((high === r ? (g - b) / delta : high === g ? (b - r) / delta + 2 : (r - g) / delta + 4) * 60 + 360) % 360) : fallbackHue;
  return { h, s: delta ? delta / (1 - Math.abs(2 * l - 1)) : 0, l };
}

export function fromHsl({ h, s, l }) {
  const a = clamp(s) * Math.min(clamp(l), 1 - clamp(l));
  const channel = n => {
    const k = (n + ((h % 360) + 360) % 360 / 30) % 12;
    return 255 * (clamp(l) - a * Math.max(-1, Math.min(k - 3, 9 - k, 1)));
  };
  return toHex([channel(0), channel(8), channel(4)]);
}

export function globePoint({ h, l }) {
  const y = 2 * l - 1, radius = Math.sqrt(Math.max(0, 1 - y * y)), angle = h * Math.PI / 180;
  return [radius * Math.sin(angle), y, radius * Math.cos(angle)];
}

export function createColorGlobe({ getPalette, onPreview, onApply, onClose }) {
  const dialog = document.querySelector('#colorGlobe');
  if (!dialog) return { open() {} };
  const $ = selector => dialog.querySelector(selector);
  const canvas = $('#colorGlobeCanvas');
  const hexInput = $('#globeHex');
  const apply = $('#applyGlobeColor');
  const controls = { h: $('#globeHue'), s: $('#globeSaturation'), l: $('#globeLightness') };
  let atlas, index = 0, original, selected, palette, point, fieldSaturation;

  const fieldColor = cell => fromHsl({
    h: (Math.atan2(cell.center[0], cell.center[2]) * 180 / Math.PI + 360) % 360,
    s: point.s, l: (cell.center[1] + 1) / 2,
  });

  function sync({ focus = false, immediate = false } = {}) {
    hexInput.value = selected;
    hexInput.removeAttribute('aria-invalid');
    $('#globeHexError').hidden = true;
    apply.disabled = selected === original;
    $('#globeSelected').style.background = selected;
    $('#globeSelectedHex').textContent = selected;
    $('#globeStatus').textContent = selected === original ? 'Original color' : `${selected} · Preview`;
    const swatches = $('#globePalette').children;
    [...swatches].forEach((swatch, position) => {
      const color = position === index ? selected : palette[position];
      swatch.style.background = color;
      swatch.style.color = textOn(color);
      swatch.setAttribute('aria-label', `${roles[position]} ${color}${position === index ? ', editing' : ''}`);
    });
    controls.h.value = point.h;
    controls.s.value = point.s * 100;
    controls.l.value = point.l * 100;
    $('#globeHueValue').textContent = `${Math.round(point.h)}°`;
    $('#globeSaturationValue').textContent = `${Math.round(point.s * 100)}%`;
    $('#globeLightnessValue').textContent = `${Math.round(point.l * 100)}%`;
    controls.s.style.setProperty('--globe-track', `linear-gradient(90deg,${fromHsl({ ...point, s: 0 })},${fromHsl({ ...point, s: 1 })})`);
    controls.l.style.setProperty('--globe-track', `linear-gradient(90deg,#000,${fromHsl({ ...point, l: .5 })},#fff)`);
    if (atlas) {
      if (fieldSaturation !== point.s) { atlas.setColorField(fieldColor); fieldSaturation = point.s; }
      const position = globePoint(point);
      atlas.setMarker(position, selected);
      if (focus) atlas.focusPoint(position, immediate);
    }
    onPreview(index, selected);
  }

  function readHex() {
    const value = hexInput.value.trim().replace(/^#/, '');
    if (!/^(?:[0-9a-f]{3}|[0-9a-f]{6})$/i.test(value)) {
      hexInput.setAttribute('aria-invalid', 'true');
      $('#globeHexError').hidden = false;
      apply.disabled = true;
      return false;
    }
    selected = '#' + (value.length === 3 ? [...value].map(char => char + char).join('') : value).toUpperCase();
    point = toHsl(selected, point.h);
    sync({ focus: true });
    return true;
  }

  function open(roleIndex) {
    if (dialog.open) return;
    index = roleIndex;
    palette = getPalette().colors.slice(0, 5);
    original = selected = palette[index].toUpperCase();
    point = toHsl(selected);
    // Neutral colors can still explore the hue spectrum as soon as intensity rises.
    $('#globeRole').textContent = roles[index];
    $('#globeOriginal').style.background = original;
    $('#globeOriginalHex').textContent = original;
    $('#globePalette').replaceChildren(...palette.map((_, position) => {
      const swatch = document.createElement('span');
      swatch.classList.toggle('is-editing', position === index);
      if (position === index) swatch.textContent = '•';
      return swatch;
    }));
    document.body.classList.add('color-globe-open');
    dialog.showModal();
    atlas = createAtlas(canvas, {
      autoRotate: false, trueColor: true, tiltLimit: Math.PI / 2, colorFor: fieldColor,
      onSelect({ hex, point: [x, y, z] }) {
        point = { h: (Math.atan2(x, z) * 180 / Math.PI + 360) % 360, s: point.s, l: (y + 1) / 2 };
        selected = hex;
        sync();
      },
    });
    fieldSaturation = point.s;
    sync({ focus: true, immediate: true });
    canvas.focus({ preventScroll: true });
  }

  for (const [key, control] of Object.entries(controls)) {
    control.addEventListener('input', () => {
      point[key] = Number(control.value) / (key === 'h' ? 1 : 100);
      selected = fromHsl(point);
      sync({ focus: key !== 's' });
    });
  }
  hexInput.addEventListener('input', () => {
    // Do not apply a previously selected color while an incomplete HEX is entered.
    apply.disabled = true;
    hexInput.removeAttribute('aria-invalid');
    $('#globeHexError').hidden = true;
  });
  hexInput.addEventListener('change', readHex);
  hexInput.addEventListener('keydown', event => {
    if (event.key === 'Enter') { event.preventDefault(); readHex(); }
  });
  $('#globeRecenter').addEventListener('click', () => atlas?.focusPoint(globePoint(point)));
  $('#globeRestore').addEventListener('click', () => {
    selected = original; point = toHsl(original, point.h); sync({ focus: true });
  });
  apply.addEventListener('click', () => {
    if (!readHex() || selected === original) return;
    onApply(index, selected);
    dialog.close();
  });
  dialog.querySelectorAll('[data-globe-close]').forEach(button => button.addEventListener('click', () => dialog.close()));
  let backdropDown = false;
  const outsideDialog = event => {
    const box = dialog.getBoundingClientRect();
    return event.target === dialog && (event.clientX < box.left || event.clientX > box.right || event.clientY < box.top || event.clientY > box.bottom);
  };
  dialog.addEventListener('pointerdown', event => { backdropDown = outsideDialog(event); });
  dialog.addEventListener('click', event => { if (backdropDown && outsideDialog(event)) dialog.close(); });
  dialog.addEventListener('close', () => {
    atlas?.destroy(); atlas = null;
    document.body.classList.remove('color-globe-open');
    onClose(index);
  });
  return { open };
}
