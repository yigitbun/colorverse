import { aiStudies } from '../ai-studies.js?v=2';
import { colorwaySVG, freezeColorway, downloadColorway } from '../colorway-kit.js?v=1';
import { textOn, contrast } from '../color.js';
import { toHsl, fromHsl } from '../color-globe.js?v=2';
import { suggestPaletteName } from '../palette-names.js?v=1';
import { savePaletteHandoff } from '../palette-handoff.js?v=1';
import { initialSandbox, readSandbox, writeSandbox } from './state.js?v=2';

const $ = selector => document.querySelector(selector);
const getStorage = () => localStorage;
const clone = value => JSON.parse(JSON.stringify(value));
const parts = { backdrop: 'Backdrop', bottle: 'Bottle', cap: 'Cap', label: 'Label', carton: 'Carton' };
let state = readSandbox(getStorage), history = [], nameVariation = 0, selectedPart = null;
let darkPreview = false, gesture = false, nameGesture = false, toastTimer;
let tonePoint, toneHex, toneIndex;
const options = (colors, selected) => colors.map((color, index) => `<option value="${index}"${index === selected ? ' selected' : ''}>${index + 1} · ${color}</option>`).join('');
function persist() {
  $('#sandboxStorageStatus').textContent = writeSandbox(state, getStorage)
    ? 'Local Sandbox draft · independent of your saved palettes'
    : 'Browser storage is unavailable. This experiment works, but changes will not survive a reload.';
}
function remember() { history.push(clone(state)); if (history.length > 30) history.shift(); }
function change(update, message) { remember(); update(); render(); persist(); if (message) notify(message, true); }
function notify(message, undo = false) {
  clearTimeout(toastTimer);
  $('#sandboxToastMessage').textContent = message;
  $('#toastUndo').hidden = !undo || !history.length;
  $('#sandboxToast').hidden = false;
  toastTimer = setTimeout(() => { $('#sandboxToast').hidden = true; }, 6000);
}
function undo() {
  if (!history.length) return;
  state = history.pop(); gesture = false; render(); persist(); notify('Previous experiment restored.');
}
function render() {
  $('#sandboxName').value = state.name;
  $('#sandboxSwatches').innerHTML = state.colors.map((color, index) => `<button type="button" data-color="${index}" aria-pressed="${index === state.active}" aria-label="Select color ${index + 1}: ${color}" style="--color:${color};--on:${textOn(color)}">${color}</button>`).join('');
  $('#undoChange').disabled = !history.length;
  $('#productPreview').innerHTML = colorwaySVG(state, state.name);
  $('#conceptPreset').value = state.conceptId || '';
  for (const part of Object.keys(parts)) $(`#part-${part}`).value = String(state.assignment[part]);
  const study = aiStudies.find(item => item.id === state.conceptId);
  $('#sourceLink').hidden = !study;
  if (study) {
    $('#sourceImage').src = study.image; $('#sourceImage').alt = study.imageAlt;
    $('#sourceName').textContent = `${study.family} · source concept`;
    $('#sourceLink').href = `/#discover`;
  }
  $('#baselinePreview').innerHTML = state.baseline ? colorwaySVG(state.baseline, 'Baseline') : '<span>No baseline yet</span>';
  $('#comparisonPreview').innerHTML = colorwaySVG(state, 'Working version');
  $('#restoreBaseline').disabled = !state.baseline;
  $('#baselineHint').textContent = state.baseline ? 'Baseline stays frozen as you edit the working version.' : 'Capture the current colorway, then make a change.';
  $('#roleSegments').innerHTML = Object.entries(parts).map(([part, label]) => `<button type="button" data-part="${part}" aria-pressed="${part === selectedPart}">${label}</button>`).join('');
  const part = selectedPart || 'bottle', roleColor = state.colors[state.assignment[part]];
  $('#roleSample').style.background = roleColor; $('#roleSample').style.color = textOn(roleColor);
  $('#roleSampleName').textContent = parts[part]; $('#roleSampleHex').textContent = roleColor;
  renderTone(); renderSurface();
}
function renderTone() {
  const color = state.colors[state.active];
  if (toneHex !== color || toneIndex !== state.active) {
    tonePoint = toHsl(color, tonePoint?.h || 0); toneHex = color; toneIndex = state.active;
  }
  const point = tonePoint;
  $('#tunerHex').textContent = color; $('#tunerInput').value = color;
  $('#tunerLabel').textContent = `Color ${state.active + 1} · ${color}`;
  $('#tunerPreview').style.background = color; $('#tunerPreview').style.color = textOn(color);
  for (const [key, value, unit] of [['Hue', point.h, '°'], ['Intensity', point.s * 100, '%'], ['Lightness', point.l * 100, '%']]) {
    $(`#tuner${key}`).value = Math.round(value); $(`#tuner${key}Value`).textContent = `${Math.round(value)}${unit}`;
  }
  $('#tunerHue').style.setProperty('--track', 'linear-gradient(90deg,#f55,#ff5,#5f5,#5ff,#55f,#f5f,#f55)');
  $('#tunerIntensity').style.setProperty('--track', `linear-gradient(90deg,${fromHsl({ ...point, s: 0 })},${fromHsl({ ...point, s: 1 })})`);
  $('#tunerLightness').style.setProperty('--track', `linear-gradient(90deg,#000,${fromHsl({ ...point, l: .5 })},#fff)`);
  $('#tunerInput').removeAttribute('aria-invalid'); $('#tunerError').textContent = '';
  for (const part of Object.keys(parts)) $(`#part-${part}`).innerHTML = options(state.colors, state.assignment[part]);
}
function renderSurface() {
  const bg = state.colors[darkPreview ? 4 : 0], ink = textOn(bg), accent = state.colors[2];
  const preview = $('#surfacePreview');
  for (const [key, value] of Object.entries({ bg, ink, accent, on: textOn(accent) })) preview.style.setProperty(`--sample-${key}`, value);
  $('#previewTheme').setAttribute('aria-checked', String(darkPreview));
  $('#contrastHint').textContent = `Text on this surface: ${contrast(bg, ink).toFixed(2)}:1 contrast. Preview only.`;
  $('#motionButton').style.setProperty('--sample-accent', accent);
  $('#motionButton').style.setProperty('--sample-on', textOn(accent));
}
$('#conceptPreset').innerHTML = '<option value="" disabled>Custom working palette</option>' + aiStudies.map(study => `<option value="${study.id}">${study.name} · ${study.family}</option>`).join('');
$('#productAssignments').innerHTML = Object.entries(parts).map(([part, label]) => `<label for="part-${part}">${label}<select id="part-${part}" data-assignment="${part}">${options(state.colors, state.assignment[part])}</select></label>`).join('');
$('#conceptPreset').addEventListener('change', event => {
  const study = aiStudies.find(item => item.id === event.target.value);
  if (study) change(() => { state.colors = [...study.colors]; state.conceptId = study.id; state.name = study.name; }, `${study.name} loaded. Source image stays unchanged.`);
});
$('#sandboxSwatches').addEventListener('click', event => {
  const button = event.target.closest('[data-color]'); if (!button) return;
  const index = Number(button.dataset.color);
  if (selectedPart) change(() => { state.active = index; state.assignment[selectedPart] = index; }, `${parts[selectedPart]} now uses color ${index + 1}.`);
  else { state.active = index; render(); persist(); }
});
$('#productAssignments').addEventListener('change', event => {
  const part = event.target.dataset.assignment; if (!parts[part]) return;
  change(() => { state.assignment[part] = Number(event.target.value); }, `${parts[part]} updated.`);
});
$('#roleSegments').addEventListener('click', event => {
  const button = event.target.closest('[data-part]'); if (!button) return;
  selectedPart = selectedPart === button.dataset.part ? null : button.dataset.part;
  if (selectedPart) state.active = state.assignment[selectedPart];
  render(); persist();
});
for (const key of ['Hue', 'Intensity', 'Lightness']) {
  $(`#tuner${key}`).addEventListener('input', () => {
    if (!gesture) { remember(); gesture = true; }
    // Keep the user's HSL coordinates during manipulation. Quantized HEX may
    // round 359° to red/0° or erase a neutral's hue; don't move their thumb.
    tonePoint = { h: Number($('#tunerHue').value), s: Number($('#tunerIntensity').value) / 100, l: Number($('#tunerLightness').value) / 100 };
    state.colors[state.active] = toneHex = fromHsl(tonePoint); toneIndex = state.active;
    render(); persist();
  });
  $(`#tuner${key}`).addEventListener('change', () => { gesture = false; });
}
function applyHex(event) {
  if (!/^#[a-f0-9]{6}$/i.test(event.target.value)) {
    event.target.setAttribute('aria-invalid', 'true'); $('#tunerError').textContent = 'Enter six HEX digits, for example #203147.'; return;
  }
  if (state.colors[state.active] !== event.target.value.toUpperCase()) change(() => { state.colors[state.active] = event.target.value.toUpperCase(); });
}
$('#tunerInput').addEventListener('input', applyHex);
$('#tunerInput').addEventListener('change', applyHex);
$('#sandboxName').addEventListener('input', event => {
  if (!nameGesture) { remember(); nameGesture = true; }
  state.name = event.target.value.slice(0, 120);
  $('#productPreview').innerHTML = colorwaySVG(state, state.name);
  $('#undoChange').disabled = !history.length; persist();
});
$('#sandboxName').addEventListener('blur', () => {
  nameGesture = false;
  state.name = state.name.trim() || suggestPaletteName(state.colors); render(); persist();
});
$('#suggestName').addEventListener('click', () => change(() => { state.name = suggestPaletteName(state.colors, ++nameVariation); }, 'A new name to try. You can edit it.'));
$('#lockBaseline').addEventListener('click', () => change(() => { state.baseline = freezeColorway(state); }, 'Baseline captured. Keep experimenting.'));
$('#restoreBaseline').addEventListener('click', () => { if (state.baseline) change(() => { state.colors = [...state.baseline.colors]; state.assignment = { ...state.baseline.assignment }; }, 'Baseline restored.'); });
$('#undoChange').addEventListener('click', undo); $('#toastUndo').addEventListener('click', undo);
$('#resetSandbox').addEventListener('click', () => change(() => { state = initialSandbox(); selectedPart = null; }, 'Only this Sandbox draft was reset.'));
$('#previewTheme').addEventListener('click', () => { darkPreview = !darkPreview; renderSurface(); });
$('#surfaceAction').addEventListener('click', () => notify('This direction is ready to try in Studio. No account data was changed.'));
$('#sandboxToStudio').addEventListener('click', () => {
  const palette = { id: 'sandbox-working', name: state.name, colors: [...state.colors], careAssignment: { ...state.assignment }, colorwayBaseline: state.baseline, image: null, sourcePaletteId: null, category: 'Sandbox draft', description: 'A working palette from the experimental Sandbox.', tags: ['custom', 'sandbox'] };
  if (savePaletteHandoff(palette, () => sessionStorage, notify)) location.assign('/studio/?p=sandbox-working#studio');
});
$('#exportProduct').addEventListener('click', async () => {
  const button = $('#exportProduct'); button.disabled = true;
  try { await downloadColorway(state, state.name); notify('PNG prepared. This is a digital concept, not a physical color proof.'); }
  catch { notify('Export failed. Your experiment is still here; try again.'); }
  finally { button.disabled = false; }
});
$('#motionButton').addEventListener('click', () => {
  const button = $('#motionButton'); button.disabled = true; button.dataset.phase = 'busy'; button.innerHTML = '<span></span>'; button.setAttribute('aria-label', 'Simulating an action');
  $('#motionStatus').textContent = 'Testing the feedback animation…';
  setTimeout(() => { button.dataset.phase = 'done'; button.textContent = 'Done ✓'; $('#motionStatus').textContent = 'Demo complete. No account data was changed.'; }, 650);
  setTimeout(() => { button.dataset.phase = ''; button.innerHTML = 'Try the motion <span>↗</span>'; button.disabled = false; button.removeAttribute('aria-label'); }, 1800);
});
const commands = [
  ['Product colorway', () => $('#product').scrollIntoView({ block: 'start' })],
  ['Tone controls', () => $('#controls').scrollIntoView({ block: 'start' })],
  ['Capture baseline', () => $('#lockBaseline').click()],
  ['Suggest a name', () => $('#suggestName').click()],
  ['Undo last change', undo], ['Export product PNG', () => $('#exportProduct').click()],
  ['One Shape motion study', () => location.assign('/sandbox/one-shape/')],
];
function renderCommands() {
  const query = $('#commandSearch').value.toLowerCase().trim(), results = $('#commandResults'); results.replaceChildren();
  for (const [label, action] of commands.filter(([label]) => label.toLowerCase().includes(query))) {
    const button = document.createElement('button'); button.type = 'button'; button.textContent = label;
    button.addEventListener('click', () => { $('#commandDialog').close(); action(); }); results.append(button);
  }
  if (!results.children.length) results.textContent = 'No matching experiment.';
}
function openCommands() { $('#commandSearch').value = ''; renderCommands(); $('#commandDialog').showModal(); $('#commandSearch').focus(); }
$('#openCommands').addEventListener('click', openCommands);
$('#closeCommands').addEventListener('click', () => $('#commandDialog').close());
$('#commandSearch').addEventListener('input', renderCommands);
$('#commandSearch').addEventListener('keydown', event => { if (event.key === 'Enter') { event.preventDefault(); $('#commandResults button')?.click(); } if (event.key === 'ArrowDown') { event.preventDefault(); $('#commandResults button')?.focus(); } });
document.addEventListener('keydown', event => { if ((event.metaKey || event.ctrlKey) && event.key.toLowerCase() === 'k') { event.preventDefault(); if (!$('#commandDialog').open) openCommands(); } });
render(); persist();
