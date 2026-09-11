import { createHexSphere, dot, norm, mix } from '../geometry.js';
import { oklch, oklab, rgb, toHex, clamp } from '../color.js';

const $ = selector => document.querySelector(selector);
const worlds = [
  {
    id: 'spectrum', name: 'Spectrum', type: 'Core field', code: 'CV / CORE', accent: '#8EE6EC',
    description: 'The complete perceptual field, organized by lightness, chroma, and hue.',
    tags: ['perceptual', 'full gamut', 'reference'],
    palette: ['#F5F2EA', '#F2C94C', '#E5527D', '#4B88E8', '#172126'],
    reference: 'Chromatic field study',
    images: [
      'https://images.unsplash.com/photo-1500964757637-c85e8a162699?auto=format&fit=crop&w=900&q=80',
      'https://images.unsplash.com/photo-1557682250-33bd709cbe85?auto=format&fit=crop&w=900&q=80',
      'https://images.unsplash.com/photo-1470252649378-9c29740c9fa8?auto=format&fit=crop&w=900&q=80',
    ],
  },
  {
    id: 'vintage-motion', name: 'Vintage Motion', type: 'Archive study', code: 'CV / ARCHIVE 01', accent: '#C77A51',
    description: 'Weathered paint, leather, brass, and road tones translated into a complete field.',
    tags: ['vintage', 'mechanical', 'sun-worn'],
    palette: ['#F1E4C4', '#B95E3F', '#2F5A58', '#C59B4C', '#6F3E2A', '#22282A', '#D6C1A2'],
    reference: 'Motion and material archive',
    images: [
      'https://images.unsplash.com/photo-1493238792000-8113da705763?auto=format&fit=crop&w=900&q=80',
      'https://images.unsplash.com/photo-1500530855697-b586d89ba3ee?auto=format&fit=crop&w=900&q=80',
      'https://images.unsplash.com/photo-1495474472287-4d71bcdd2085?auto=format&fit=crop&w=900&q=80',
    ],
  },
  {
    id: 'botanical-nocturne', name: 'Botanical Nocturne', type: 'Seasonal study', code: 'CV / SEASONAL 01', accent: '#8DBB9A',
    description: 'Leaves, wet stone, faded flowers, and evening light gathered after dark.',
    tags: ['botanical', 'nocturnal', 'quiet'],
    palette: ['#E6E6C5', '#688C56', '#244C49', '#8E4D73', '#CF9B6B', '#101D1D', '#91B7A4'],
    reference: 'Garden after dark',
    images: [
      'https://images.unsplash.com/photo-1519608487953-e999c86e7455?auto=format&fit=crop&w=900&q=80',
      'https://images.unsplash.com/photo-1441974231531-c6227db76b6e?auto=format&fit=crop&w=900&q=80',
      'https://images.unsplash.com/photo-1500534623283-312aade485b7?auto=format&fit=crop&w=900&q=80',
    ],
  },
  {
    id: 'deep-space', name: 'Deep Space', type: 'Cosmic study', code: 'CV / COSMOS 01', accent: '#8987FF',
    description: 'Cold starlight, ion violet, solar gold, and the near-black between distant signals.',
    tags: ['cosmic', 'luminous', 'infinite'],
    palette: ['#E5EEFF', '#8CA7E8', '#4A5ECB', '#8058C8', '#C84D83', '#D5A653', '#080B17'],
    reference: 'Light beyond the atmosphere',
    images: [
      'https://images.unsplash.com/photo-1419242902214-272b3f66ee7a?auto=format&fit=crop&w=900&q=80',
      'https://images.unsplash.com/photo-1557682250-33bd709cbe85?auto=format&fit=crop&w=900&q=80',
      'https://images.unsplash.com/photo-1500964757637-c85e8a162699?auto=format&fit=crop&w=900&q=80',
    ],
  },
  {
    id: 'animal-kingdom', name: 'Animal Kingdom', type: 'Living study', code: 'CV / FAUNA 01', accent: '#D8A457',
    description: 'Plumage, fur, mineral eyes, and habitat tones gathered into one living field.',
    tags: ['fauna', 'instinctive', 'earthbound'],
    palette: ['#F2E7D0', '#D5AC63', '#C76534', '#667044', '#28505A', '#743B32', '#171C1E'],
    reference: 'Color as adaptation',
    images: [
      'https://images.unsplash.com/photo-1441974231531-c6227db76b6e?auto=format&fit=crop&w=900&q=80',
      'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?auto=format&fit=crop&w=900&q=80',
      'https://images.unsplash.com/photo-1500530855697-b586d89ba3ee?auto=format&fit=crop&w=900&q=80',
    ],
  },
];

const canvas = $('#worldGlobe'), ctx = canvas.getContext('2d', { alpha: true });
const cells = createHexSphere(3);
const reducedMotion = matchMedia('(prefers-reduced-motion: reduce)');
let width = 0, height = 0, ratio = 1, last = 0, rotation = -.18, tilt = -.13, targetRotation = rotation, targetTilt = tilt;
let pointer = null, dragging = false, moved = false, hover = -1, pinned = -1, paused = reducedMotion.matches;
let painted = [], transitionStart = 0, transitionDuration = 920, transitioning = false, toastTimer;
let activeIndex = 0;
const light = norm([-.55, .78, 1.35]), halfLight = norm([-.25, .42, 2.1]);

function labMix(a, b, amount) {
  const aa = oklab(a), bb = oklab(b);
  const lab = aa.map((value, index) => value + (bb[index] - value) * amount);
  const chroma = Math.hypot(lab[1], lab[2]);
  const hue = (Math.atan2(lab[2], lab[1]) * 180 / Math.PI + 360) % 360;
  return oklch(lab[0], chroma, hue);
}
function themedColor(world, cell, index) {
  const [x, y, z] = cell.center;
  const longitude = (Math.atan2(x, z) + Math.PI) / (Math.PI * 2);
  if (world.id === 'spectrum') {
    const hue = longitude * 360;
    const lightness = .18 + (y + 1) * .37;
    const chroma = .012 + .235 * Math.max(0, 1 - y * y) ** .56;
    return oklch(lightness, chroma, hue);
  }
  const position = longitude * world.palette.length;
  const left = Math.floor(position) % world.palette.length, right = (left + 1) % world.palette.length;
  const fraction = position - Math.floor(position), eased = fraction * fraction * (3 - 2 * fraction);
  const base = labMix(world.palette[left], world.palette[right], eased);
  const [baseL, baseA, baseB] = oklab(base);
  const baseC = Math.hypot(baseA, baseB), baseH = (Math.atan2(baseB, baseA) * 180 / Math.PI + 360) % 360;
  const lightness = clamp(baseL + y * .25 + Math.sin(index * 2.17) * .008, .14, .94);
  const chroma = baseC * (.68 + Math.max(0, 1 - y * y) * .42);
  return oklch(lightness, chroma, baseH);
}

cells.forEach((cell, index) => {
  const hex = themedColor(worlds[0], cell, index);
  cell.current = rgb(hex); cell.from = [...cell.current]; cell.target = [...cell.current]; cell.hex = hex;
});

function renderLensSwitch() {
  $('#lensSwitch').innerHTML = worlds.map((world, index) => `<button class="lens-button" type="button" role="tab" aria-selected="${index === activeIndex}" data-world="${index}"><span>${String(index + 1).padStart(2, '0')}</span><strong>${world.name}</strong><span class="lens-mini" aria-hidden="true">${world.palette.slice(0, 5).map(color => `<i style="--swatch:${color}"></i>`).join('')}</span></button>`).join('');
}

function orbitSlot(index) {
  let slot = index - activeIndex;
  if (slot > worlds.length / 2) slot -= worlds.length;
  if (slot < -worlds.length / 2) slot += worlds.length;
  return slot;
}

function drawMiniWorld(canvas, world, worldIndex) {
  const mini = canvas.getContext('2d');
  const size = 120, dpr = 2, radius = size * .405;
  canvas.width = size * dpr; canvas.height = size * dpr;
  mini.setTransform(dpr, 0, 0, dpr, 0, 0); mini.clearRect(0, 0, size, size);
  const yaw = -.7 + worldIndex * .73, pitch = -.18;
  const cy = Math.cos(yaw), sy = Math.sin(yaw), cp = Math.cos(pitch), sp = Math.sin(pitch);
  const rotateMini = ([x, y, z]) => { const X = x * cy + z * sy, Z = z * cy - x * sy; return [X, y * cp - Z * sp, y * sp + Z * cp]; };
  const projectMini = point => { const scale = 4.5 / (4.5 - point[2]); return [size / 2 + point[0] * radius * scale, size / 2 - point[1] * radius * scale]; };
  const body = mini.createRadialGradient(size * .35, size * .28, 0, size * .5, size * .5, radius * 1.05);
  body.addColorStop(0, '#30373b'); body.addColorStop(.72, '#101518'); body.addColorStop(1, '#050709');
  mini.fillStyle = body; mini.beginPath(); mini.arc(size / 2, size / 2, radius * 1.015, 0, Math.PI * 2); mini.fill();
  const visible = cells.map((cell, index) => ({ cell, index, normal: rotateMini(cell.center) })).filter(item => item.normal[2] > .025).sort((a, b) => a.normal[2] - b.normal[2]);
  visible.forEach(({ cell, index, normal }) => {
    const points = cell.face.map(point => projectMini(rotateMini(point)));
    const diffuse = Math.max(0, dot(normal, light));
    const base = rgb(themedColor(world, cell, index));
    const faceColor = base.map(value => value * (.32 + diffuse * .72));
    mini.beginPath(); mini.moveTo(points[0][0], points[0][1]);
    for (let pointIndex = 1; pointIndex < points.length; pointIndex++) mini.lineTo(points[pointIndex][0], points[pointIndex][1]);
    mini.closePath(); mini.fillStyle = toHex(faceColor); mini.fill();
    mini.strokeStyle = '#070a0c99'; mini.lineWidth = .28; mini.stroke();
  });
  mini.strokeStyle = `${world.accent}58`; mini.lineWidth = .7; mini.beginPath(); mini.arc(size / 2, size / 2, radius * 1.025, 0, Math.PI * 2); mini.stroke();
}

function renderOrbitSystem() {
  $('#orbitSystem').innerHTML = worlds.map((world, index) => `<button class="orbit-world" type="button" data-orbit-world="${index}" aria-label="Enter ${world.name}" style="--planet-accent:${world.accent}"><canvas aria-hidden="true"></canvas><span><b>${String(index + 1).padStart(2, '0')}</b>${world.name}</span></button>`).join('');
  $$('.orbit-world').forEach((button, index) => drawMiniWorld(button.querySelector('canvas'), worlds[index], index));
  updateOrbitPositions();
}

function updateOrbitPositions() {
  $$('.orbit-world').forEach((button, index) => {
    const slot = orbitSlot(index);
    button.dataset.slot = String(slot);
    button.disabled = slot === 0;
    button.setAttribute('aria-current', slot === 0 ? 'true' : 'false');
  });
}

function updateWorldText(world, index) {
  document.documentElement.style.setProperty('--field', world.accent);
  $('#worldNumber').textContent = String(index + 1).padStart(2, '0');
  $('#worldType').textContent = world.type; $('#worldName').textContent = world.name;
  $('#worldDescription').textContent = world.description; $('#fieldCode').textContent = world.code;
  $('#worldTags').innerHTML = world.tags.map(tag => `<span>${tag}</span>`).join('');
  $('#worldImage').src = world.images[0]; $('#worldImage').alt = `${world.name} visual reference`;
  $('#worldReference').textContent = world.reference;
  $$('.lens-button').forEach((button, buttonIndex) => button.setAttribute('aria-selected', String(buttonIndex === index)));
  updateOrbitPositions();
}
function setWorld(index, initial = false) {
  if (!worlds[index] || (!initial && index === activeIndex)) return;
  activeIndex = index; pinned = -1; hover = -1; $('#colorProbe').hidden = true;
  const world = worlds[index]; updateWorldText(world, index);
  cells.forEach((cell, cellIndex) => {
    cell.from = [...cell.current]; cell.target = rgb(themedColor(world, cell, cellIndex));
    if (initial) { cell.current = [...cell.target]; cell.hex = toHex(cell.current); }
  });
  transitionStart = performance.now(); transitioning = !initial && !reducedMotion.matches;
  if (reducedMotion.matches && !initial) cells.forEach(cell => { cell.current = [...cell.target]; cell.hex = toHex(cell.current); });
  $('#fieldStatus').textContent = transitioning ? 'Recalibrating field' : 'Field stable';
  try { localStorage.setItem('colorverse-world', world.id); } catch {}
}
function $$(selector) { return [...document.querySelectorAll(selector)]; }

function path(points) {
  ctx.beginPath(); ctx.moveTo(points[0][0], points[0][1]);
  for (let index = 1; index < points.length; index++) ctx.lineTo(points[index][0], points[index][1]);
  ctx.closePath();
}
function draw() {
  if (!width || !height) return;
  ctx.clearRect(0, 0, width, height);
  const radius = Math.min(width, height) * .405;
  const cr = Math.cos(rotation), sr = Math.sin(rotation), ct = Math.cos(tilt), st = Math.sin(tilt);
  const rotate = ([x, y, z]) => { const X = x * cr + z * sr, Z = z * cr - x * sr; return [X, y * ct - Z * st, y * st + Z * ct]; };
  const project = point => { const scale = 4.9 / (4.9 - point[2]); return [width / 2 + point[0] * radius * scale, height / 2 - point[1] * radius * scale]; };
  const screen = point => project(rotate(point));
  const world = worlds[activeIndex];

  ctx.save(); ctx.translate(width / 2, height / 2); ctx.rotate(rotation * .18);
  ctx.strokeStyle = `${world.accent}45`; ctx.lineWidth = 1; ctx.setLineDash([2, 8]);
  ctx.beginPath(); ctx.arc(0, 0, radius * 1.08, 0, Math.PI * 2); ctx.stroke();
  ctx.setLineDash([]); ctx.strokeStyle = `${world.accent}26`; ctx.beginPath(); ctx.ellipse(0, 0, radius * 1.16, radius * .25, -.22, 0, Math.PI * 2); ctx.stroke();
  for (let index = 0; index < 48; index++) {
    const angle = index / 48 * Math.PI * 2, inner = radius * (index % 4 ? 1.058 : 1.04), outer = radius * 1.086;
    ctx.beginPath(); ctx.moveTo(Math.cos(angle) * inner, Math.sin(angle) * inner); ctx.lineTo(Math.cos(angle) * outer, Math.sin(angle) * outer); ctx.stroke();
  }
  ctx.restore();

  const body = ctx.createRadialGradient(width * .4, height * .3, 0, width * .5, height * .51, radius * 1.05);
  body.addColorStop(0, '#30373B'); body.addColorStop(.72, '#12171A'); body.addColorStop(1, '#080B0D');
  ctx.fillStyle = body; ctx.beginPath(); ctx.arc(width / 2, height / 2, radius * 1.01, 0, Math.PI * 2); ctx.fill();
  const front = cells.map((cell, index) => ({ cell, index, normal: rotate(cell.center) })).filter(item => item.normal[2] > .02).sort((a, b) => a.normal[2] - b.normal[2]);
  painted = [];
  for (const { cell, index, normal } of front) {
    const active = index === hover || index === pinned, lift = active ? .012 : 0;
    const extra = points => lift ? points.map(point => point.map((value, axis) => value + cell.center[axis] * lift)) : points;
    const face = extra(cell.face).map(screen), rim = extra(cell.rim).map(screen), bottom = cell.bottom.map(screen);
    const diffuse = Math.max(0, dot(normal, light)), specular = Math.pow(Math.max(0, dot(normal, halfLight)), 30) * .2;
    const shade = .28 + diffuse * .72, faceColor = cell.current.map(value => value * shade + 255 * specular);
    for (let edge = 0; edge < rim.length; edge++) {
      const next = (edge + 1) % rim.length; path([bottom[edge], bottom[next], rim[next], rim[edge]]);
      ctx.fillStyle = `rgb(${cell.current.map(value => Math.round(value * (.12 + diffuse * .11))).join(' ')})`; ctx.fill();
    }
    path(rim); ctx.fillStyle = toHex(faceColor); ctx.fill();
    for (let edge = 0; edge < rim.length; edge++) {
      const next = (edge + 1) % rim.length, dx = rim[next][0] - rim[edge][0], dy = rim[next][1] - rim[edge][1];
      const edgeLight = clamp((dy * -.5 - dx * .7) / (Math.hypot(dx, dy) || 1), -.7, .7);
      path([rim[edge], rim[next], face[next], face[edge]]);
      ctx.fillStyle = toHex(faceColor.map(value => value * (.81 + edgeLight * .15) + Math.max(0, edgeLight) * 88)); ctx.fill();
    }
    path(face); ctx.fillStyle = toHex(faceColor); ctx.fill();
    if (active) { ctx.strokeStyle = index === pinned ? world.accent : '#FFFFFFD9'; ctx.lineWidth = index === pinned ? 1.6 : 1.15; ctx.stroke(); }
    painted.push({ index, face, point: project(normal) });
  }
  if (pinned >= 0) {
    const marker = painted.find(item => item.index === pinned);
    if (marker) { ctx.strokeStyle = `${world.accent}A8`; ctx.lineWidth = 1; ctx.beginPath(); ctx.arc(marker.point[0], marker.point[1], 8, 0, Math.PI * 2); ctx.stroke(); }
  }
}

function hit(x, y) {
  for (let paintIndex = painted.length - 1; paintIndex >= 0; paintIndex--) {
    const { face, index, point } = painted[paintIndex];
    if (Math.abs(point[0] - x) > width * .08 || Math.abs(point[1] - y) > height * .08) continue;
    let inside = false;
    for (let vertex = 0, previous = face.length - 1; vertex < face.length; previous = vertex++) if ((face[vertex][1] > y) !== (face[previous][1] > y) && x < (face[previous][0] - face[vertex][0]) * (y - face[vertex][1]) / (face[previous][1] - face[vertex][1]) + face[vertex][0]) inside = !inside;
    if (inside) return index;
  }
  return -1;
}
function updateProbe(index, mode = 'Hover') {
  const probe = $('#colorProbe');
  if (index < 0) { probe.hidden = true; return; }
  const cell = cells[index], world = worlds[activeIndex], [l, a, b] = oklab(cell.hex);
  const c = Math.hypot(a, b), h = (Math.atan2(b, a) * 180 / Math.PI + 360) % 360;
  probe.hidden = false; $('#probeMode').textContent = mode; $('#probeWorld').textContent = `${world.name} signal`;
  $('#probeHex').textContent = cell.hex; $('#probeCoordinates').textContent = `L ${Math.round(l * 100)}  C ${c.toFixed(3)}  H ${Math.round(h)}°`;
  $('#probeImage').src = world.images[index % world.images.length]; $('#probeImage').alt = `${world.name} reference`;
}
function resize() {
  const box = canvas.getBoundingClientRect(); width = box.width; height = box.height; ratio = Math.min(devicePixelRatio || 1, 2);
  canvas.width = Math.round(width * ratio); canvas.height = Math.round(height * ratio); ctx.setTransform(ratio, 0, 0, ratio, 0, 0);
}
function tick(time) {
  const delta = Math.min(time - last, 40); last = time;
  if (!paused && !dragging) targetRotation += delta * .000022;
  const damping = reducedMotion.matches ? 1 : 1 - Math.exp(-delta / 78);
  rotation += (targetRotation - rotation) * damping; tilt += (targetTilt - tilt) * damping;
  if (transitioning) {
    const progress = clamp((time - transitionStart) / transitionDuration), eased = 1 - (1 - progress) ** 3;
    cells.forEach(cell => { cell.current = mix(cell.from, cell.target, eased); cell.hex = toHex(cell.current); });
    if (progress >= 1) { transitioning = false; $('#fieldStatus').textContent = 'Field stable'; }
  }
  draw(); requestAnimationFrame(tick);
}
function toast(message) { $('#worldToast').textContent = message; $('#worldToast').classList.add('is-visible'); clearTimeout(toastTimer); toastTimer = setTimeout(() => $('#worldToast').classList.remove('is-visible'), 1900); }
async function copyColor() {
  const index = pinned >= 0 ? pinned : hover;
  if (index < 0) return;
  const value = cells[index].hex;
  try {
    if (navigator.clipboard && window.isSecureContext) await navigator.clipboard.writeText(value);
    else { const area = document.createElement('textarea'); area.value = value; area.style.cssText = 'position:fixed;left:-9999px'; document.body.append(area); area.select(); document.execCommand('copy'); area.remove(); }
    toast(`${value} copied.`);
  } catch { toast('Copy unavailable.'); }
}

renderLensSwitch();
let savedWorld; try { savedWorld = localStorage.getItem('colorverse-world'); } catch {}
const savedIndex = worlds.findIndex(world => world.id === savedWorld);
if (savedIndex >= 0) activeIndex = savedIndex;
renderOrbitSystem();
setWorld(activeIndex, true);
$('#cellCount').textContent = String(cells.length);

$('#lensSwitch').addEventListener('click', event => { const button = event.target.closest('[data-world]'); if (button) setWorld(Number(button.dataset.world)); });
$('#orbitSystem').addEventListener('click', event => { const button = event.target.closest('[data-orbit-world]'); if (button && !button.disabled) setWorld(Number(button.dataset.orbitWorld)); });
$('#lensSwitch').addEventListener('keydown', event => {
  if (!['ArrowLeft', 'ArrowRight', 'Home', 'End'].includes(event.key)) return;
  event.preventDefault(); const buttons = $$('.lens-button'), current = buttons.findIndex(button => button === document.activeElement);
  const next = event.key === 'Home' ? 0 : event.key === 'End' ? buttons.length - 1 : (current + (event.key === 'ArrowRight' ? 1 : -1) + buttons.length) % buttons.length;
  buttons[next].focus(); setWorld(next);
});
canvas.addEventListener('pointerdown', event => { pointer = { x:event.clientX, y:event.clientY, sx:event.clientX, sy:event.clientY }; dragging = true; moved = false; canvas.setPointerCapture(event.pointerId); canvas.classList.add('is-dragging'); });
canvas.addEventListener('pointermove', event => {
  if (dragging && pointer) {
    const dx = event.clientX - pointer.x, dy = event.clientY - pointer.y; moved ||= Math.hypot(event.clientX - pointer.sx, event.clientY - pointer.sy) > 5;
    targetRotation += dx * .006; targetTilt = clamp(targetTilt + dy * .004, -.85, .85); pointer.x = event.clientX; pointer.y = event.clientY;
  } else if (pinned < 0) {
    const box = canvas.getBoundingClientRect(), next = hit(event.clientX - box.left, event.clientY - box.top);
    if (next !== hover) { hover = next; updateProbe(hover); }
  }
});
canvas.addEventListener('pointerup', event => {
  if (!moved) { const box = canvas.getBoundingClientRect(), selected = hit(event.clientX - box.left, event.clientY - box.top); if (selected >= 0) { pinned = pinned === selected ? -1 : selected; updateProbe(pinned >= 0 ? pinned : hover, pinned >= 0 ? 'Pinned' : 'Hover'); } }
  dragging = false; pointer = null; canvas.classList.remove('is-dragging');
});
const cancelDrag = () => { dragging = false; pointer = null; canvas.classList.remove('is-dragging'); };
canvas.addEventListener('pointercancel', cancelDrag); canvas.addEventListener('lostpointercapture', cancelDrag);
canvas.addEventListener('pointerleave', () => { hover = -1; if (pinned < 0) updateProbe(-1); });
canvas.addEventListener('keydown', event => {
  if (['ArrowLeft','ArrowRight','ArrowUp','ArrowDown','Enter',' ','Escape'].includes(event.key)) event.preventDefault();
  if (event.key === 'ArrowLeft') targetRotation -= .13; if (event.key === 'ArrowRight') targetRotation += .13;
  if (event.key === 'ArrowUp') targetTilt = clamp(targetTilt + .13, -.85, .85); if (event.key === 'ArrowDown') targetTilt = clamp(targetTilt - .13, -.85, .85);
  if (event.key === 'Enter' || event.key === ' ') { const index = hit(width / 2, height / 2); if (index >= 0) { pinned = index; updateProbe(index, 'Pinned'); } }
  if (event.key === 'Escape') { pinned = -1; updateProbe(-1); }
});
$('#copyProbe').addEventListener('click', copyColor);
$('#resetWorld').addEventListener('click', () => { targetRotation = -.18; targetTilt = -.13; toast('View reset.'); });
$('#pauseWorld').addEventListener('click', () => { paused = !paused; $('#pauseWorld').setAttribute('aria-pressed', String(paused)); $('#pauseWorld').textContent = paused ? 'Resume rotation' : 'Pause rotation'; });
reducedMotion.addEventListener('change', () => { paused = reducedMotion.matches; $('#pauseWorld').setAttribute('aria-pressed', String(paused)); $('#pauseWorld').textContent = paused ? 'Resume rotation' : 'Pause rotation'; });
new ResizeObserver(resize).observe(canvas); resize(); requestAnimationFrame(tick);
