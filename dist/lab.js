import { palettes } from './palettes.js?v=27';
import { validateImageFile } from './image-file.js?v=1';

const $ = selector => document.querySelector(selector);
const roles = [
  { id: 'wall', label: 'Wall', color: 0 },
  { id: 'floor', label: 'Floor', color: 1 },
  { id: 'furniture', label: 'Furniture', color: 2 },
  { id: 'textile', label: 'Textile', color: 3 },
  { id: 'accent', label: 'Accent', color: 4 },
];
const roomPalettes = ['nordic-calm', 'warm-cafe', 'forest-floor', 'after-rain'].map(id => palettes.find(palette => palette.id === id)).filter(Boolean);
let activePalette = roomPalettes[0];
let activeRole = 'wall';
let photoURL = '';
let photoSequence = 0;
let feedback = {};

try { feedback = JSON.parse(localStorage.getItem('colorverse-lab-feedback') || '{}'); } catch {}

function setRoomColors() {
  const stage = $('#roomStage');
  if (!stage || !activePalette) return;
  const [wall, floor, furniture, textile, accent] = activePalette.colors;
  stage.style.setProperty('--room-wall', wall);
  stage.style.setProperty('--room-floor', floor);
  stage.style.setProperty('--room-furniture', furniture);
  stage.style.setProperty('--room-textile', textile);
  stage.style.setProperty('--room-accent', accent);
  stage.style.setProperty('--room-primary', accent);
  stage.style.setProperty('--room-warm', activePalette.colors[3]);
  stage.style.setProperty('--room-rug', activePalette.colors[1]);
  stage.style.setProperty('--room-table', activePalette.colors[4]);
  stage.style.setProperty('--room-green', activePalette.colors[2]);
  stage.style.setProperty('--room-pot', activePalette.colors[3]);
  stage.style.setProperty('--room-lamp', activePalette.colors[3]);
  $('#roomPaletteName').textContent = activePalette.name;
  $('#roomCaption').textContent = activePalette.description.replace(/ —.*/, '.') || 'A palette applied across broad room surfaces.';
  document.querySelectorAll('.room-legend i').forEach((dot, index) => { dot.style.setProperty('--swatch', activePalette.colors[[0, 2, 4][index]]); });
}

function renderPalettes() {
  const container = $('#roomPalettes');
  if (!container) return;
  container.innerHTML = roomPalettes.map(palette => `<button class="lab-palette-choice" type="button" role="listitem" data-palette="${palette.id}" aria-pressed="${palette.id === activePalette.id}"><i>${palette.colors.map(color => `<b style="--c:${color}"></b>`).join('')}</i><span>${palette.name}</span></button>`).join('');
  container.addEventListener('click', event => {
    const choice = event.target.closest('[data-palette]');
    if (!choice) return;
    activePalette = roomPalettes.find(palette => palette.id === choice.dataset.palette) || activePalette;
    container.querySelectorAll('[data-palette]').forEach(button => button.setAttribute('aria-pressed', String(button === choice)));
    setRoomColors();
    renderColorChoices();
  });
}

function renderRoles() {
  const container = $('#roomRoles');
  if (!container) return;
  container.innerHTML = roles.map(role => `<button type="button" role="option" data-role="${role.id}" aria-selected="${role.id === activeRole}">${role.label}</button>`).join('');
  container.addEventListener('click', event => {
    const button = event.target.closest('[data-role]');
    if (!button) return;
    activeRole = button.dataset.role;
    container.querySelectorAll('[data-role]').forEach(item => item.setAttribute('aria-selected', String(item === button)));
    const visual = $('#roomIllustration');
    const photo = $('#roomPhoto');
    if (visual) visual.dataset.focus = activeRole === 'textile' ? 'furniture' : activeRole;
    if (photo) photo.dataset.focus = activeRole;
    $('#roomHint').textContent = `${button.textContent} selected · choose a color from the direction above.`;
    renderColorChoices();
  });
}

function renderColorChoices() {
  const container = $('#roomColorChoices');
  if (!container || !activePalette) return;
  const selectedIndex = roles.find(role => role.id === activeRole)?.color ?? 0;
  container.innerHTML = activePalette.colors.map((color, index) => `<button type="button" data-room-color="${color}" style="--choice:${color}" aria-selected="${index === selectedIndex}" aria-label="Use ${color} for ${activeRole}"><span>${color}</span></button>`).join('');
}

function applyFeedback(kind) {
  feedback.roomkit = kind;
  try { localStorage.setItem('colorverse-lab-feedback', JSON.stringify(feedback)); } catch {}
  document.querySelectorAll('[data-feedback]').forEach(button => button.classList.toggle('is-selected', button.dataset.feedback === kind));
  $('#feedbackCount').textContent = '1 response · prototype';
  window.colorverseTrack?.('lab_feedback', { experiment: 'roomkit', response: kind });
}

function bindFeedback() {
  document.querySelectorAll('[data-feedback]').forEach(button => button.addEventListener('click', () => applyFeedback(button.dataset.feedback)));
  if (feedback.roomkit) applyFeedback(feedback.roomkit);
  $('#openLabComment')?.addEventListener('click', () => $('#labCommentDialog')?.showModal());
  $('#labCommentForm')?.addEventListener('submit', event => {
    event.preventDefault();
    const text = $('#labComment')?.value.trim();
    if (!text) return;
    try { localStorage.setItem('colorverse-lab-comment', text); } catch {}
    $('#labCommentDialog')?.close();
    $('#labComment').value = '';
    $('#openLabComment').innerHTML = 'Note saved on this device <span>✓</span>';
  });
}

async function setPhoto(file) {
  const status = $('#roomStatus');
  if (!file) return;
  const sequence = ++photoSequence;
  let metadata;
  try {
    metadata = await validateImageFile(file);
  } catch (error) {
    status.textContent = error.message;
    return;
  }
  if (sequence !== photoSequence) return;
  if (metadata.width < 480 || metadata.height < 320) {
    status.textContent = 'Try a wider room photo with walls and furniture visible.';
    return;
  }
  const nextURL = URL.createObjectURL(file);
  const image = new Image();
  image.onload = () => {
    if (sequence !== photoSequence) {
      URL.revokeObjectURL(nextURL);
      return;
    }
    if (photoURL) URL.revokeObjectURL(photoURL);
    photoURL = nextURL;
    $('#roomImage').src = photoURL;
    $('#roomIllustration').hidden = true;
    $('#roomPhoto').hidden = false;
    $('#resetRoom').hidden = false;
    $('#roomSource').textContent = 'Your private room photo';
    status.textContent = 'Private preview only · this image is not published or uploaded.';
    $('#roomHint').textContent = 'Broad surface approximation · choose a role to inspect it.';
  };
  image.onerror = () => { URL.revokeObjectURL(nextURL); status.textContent = 'This image could not be read. Try another room photo.'; };
  image.src = nextURL;
}

function resetRoom() {
  photoSequence += 1;
  if (photoURL) URL.revokeObjectURL(photoURL);
  photoURL = '';
  $('#roomImage').removeAttribute('src');
  $('#roomIllustration').hidden = false;
  $('#roomPhoto').hidden = true;
  $('#resetRoom').hidden = true;
  $('#roomSource').textContent = 'Curated sample room';
  $('#roomStatus').textContent = 'Your photo stays in this browser. It is not published.';
  $('#roomHint').textContent = 'Choose a surface, then click a color to test it.';
}

$('#uploadRoom')?.addEventListener('click', () => $('#roomInput')?.click());
$('#roomInput')?.addEventListener('change', event => { setPhoto(event.target.files?.[0]); event.target.value = ''; });
$('#resetRoom')?.addEventListener('click', resetRoom);
$('#compareRoom')?.addEventListener('click', event => {
  const pressed = event.currentTarget.getAttribute('aria-pressed') === 'true';
  event.currentTarget.setAttribute('aria-pressed', String(!pressed));
  $('#roomStage').classList.toggle('is-original', !pressed);
  $('#roomOriginal').hidden = pressed;
});

document.addEventListener('click', event => {
  const swatch = event.target.closest('[data-room-color]');
  if (!swatch || !activePalette) return;
  const role = roles.find(item => item.id === activeRole);
  if (!role) return;
  activePalette = { ...activePalette, colors: activePalette.colors.map((color, index) => index === role.color ? swatch.dataset.roomColor : color) };
  setRoomColors();
  renderColorChoices();
});

renderPalettes();
renderRoles();
renderColorChoices();
setRoomColors();
bindFeedback();
