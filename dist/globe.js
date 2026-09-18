import { createHexSphere, dot, norm, mix } from './geometry.js';
import { oklch, oklab, rgb, toHex, clamp } from './color.js';

export const atlasWorlds = [
  {
    id: 'spectrum', name: 'All Colors', shortName: 'All', type: 'Full spectrum', accent: '#75D8DF',
    palette: ['#F5F2EA', '#F2C94C', '#E5527D', '#4B88E8', '#172126'],
    starters: [
      { name: 'Open Spectrum', colors: ['#F7F4ED', '#E8EEF0', '#E5527D', '#F2C94C', '#172126'] },
      { name: 'Clear Signal', colors: ['#F5F7F4', '#DDEBE6', '#3677D2', '#F16B45', '#18252B'] },
      { name: 'Color Study', colors: ['#FFF7E8', '#E9DFF4', '#7A55C7', '#E58A32', '#201B2B'] },
    ],
  },
  {
    id: 'vintage-motion', name: 'Vintage Motion', shortName: 'Vintage', type: 'Archive study', accent: '#C77A51',
    palette: ['#F1E4C4', '#B95E3F', '#2F5A58', '#C59B4C', '#6F3E2A', '#22282A', '#D6C1A2'],
    starters: [
      { name: 'Vintage Ledger', colors: ['#F1E4C4', '#D6C1A2', '#B95E3F', '#C59B4C', '#22282A'] },
      { name: 'Patina Evening', colors: ['#EFE2C7', '#C7AF8A', '#2F5A58', '#B95E3F', '#2B2521'] },
      { name: 'Railway Poster', colors: ['#F3E8D0', '#D9B98B', '#9F4938', '#2F5A58', '#282724'] },
    ],
  },
  {
    id: 'botanical-nocturne', name: 'Botanical Nocturne', shortName: 'Botanical', type: 'Seasonal study', accent: '#8DBB9A',
    palette: ['#E6E6C5', '#688C56', '#244C49', '#8E4D73', '#CF9B6B', '#101D1D', '#91B7A4'],
    starters: [
      { name: 'Night Garden', colors: ['#E6E6C5', '#91B7A4', '#244C49', '#8E4D73', '#101D1D'] },
      { name: 'Pressed Leaf', colors: ['#F0EBD5', '#C6C99B', '#688C56', '#CF9B6B', '#172522'] },
      { name: 'Plum Canopy', colors: ['#EEE8D4', '#A7C2AE', '#8E4D73', '#688C56', '#172020'] },
    ],
  },
  {
    id: 'climate-signal', name: 'Climate Signal', shortName: 'Climate', type: 'September signal', accent: '#E56A47',
    palette: ['#DCE7D2', '#2E7D66', '#13505B', '#F2B544', '#E85D3F', '#252B30', '#A9C6B8'],
    starters: [
      { name: 'Climate Signal', colors: ['#EEF1E8', '#DCE7D2', '#2E7D66', '#E85D3F', '#252B30'] },
      { name: 'Civic Heat', colors: ['#F4EBD6', '#A9C6B8', '#13505B', '#F2B544', '#252B30'] },
      { name: 'Just Transition', colors: ['#EDF0E2', '#BCD2C6', '#E56A47', '#2E7D66', '#1E3034'] },
    ],
  },
  {
    id: 'digital-bloom', name: 'Digital Bloom', shortName: 'Digital', type: 'Future study', accent: '#B877F2',
    palette: ['#EEF1FF', '#7256E8', '#48C6D9', '#F06FAF', '#171528', '#9CE6B8', '#FFCF5C'],
    starters: [
      { name: 'Digital Bloom', colors: ['#F5F4FF', '#E3E5FF', '#7256E8', '#F06FAF', '#171528'] },
      { name: 'Soft Interface', colors: ['#F2F8FF', '#D8F1F4', '#48AFC6', '#7256E8', '#17212B'] },
      { name: 'Synthetic Spring', colors: ['#F7F5FF', '#DDF5E8', '#8B5DE0', '#FFCF5C', '#21172D'] },
    ],
  },
  {
    id: 'cinema-nocturne', name: 'Cinema Nocturne', shortName: 'Cinema', type: 'September edition', accent: '#D0A85C',
    palette: ['#F0E9DC', '#8CA3B5', '#7E2938', '#D0A85C', '#24252B', '#443C54', '#B66B4D'],
    starters: [
      { name: 'Festival Night', colors: ['#F0E9DC', '#C7CFD1', '#7E2938', '#D0A85C', '#24252B'] },
      { name: 'Silver Screen', colors: ['#F4F0E8', '#B8C5CE', '#443C54', '#B66B4D', '#202127'] },
      { name: 'Closing Credits', colors: ['#EEE7DA', '#D6C7B4', '#8CA3B5', '#7E2938', '#23242A'] },
    ],
  },
];

function labMix(a, b, amount) {
  const aa = oklab(a), bb = oklab(b);
  const lab = aa.map((value, index) => value + (bb[index] - value) * amount);
  const chroma = Math.hypot(lab[1], lab[2]);
  const hue = (Math.atan2(lab[2], lab[1]) * 180 / Math.PI + 360) % 360;
  return oklch(lab[0], chroma, hue);
}

function themedColor(world, cell, index) {
  const [x, y, z] = cell.center;
  const angle = Math.atan2(x, z);
  if (world.id === 'spectrum') {
    const hue = (angle * 180 / Math.PI + 360) % 360;
    const lightness = .18 + (y + 1) * .37;
    const chroma = .012 + .235 * Math.max(0, 1 - y * y) ** .56;
    return oklch(lightness, chroma, hue);
  }
  const longitude = (angle + Math.PI) / (Math.PI * 2);
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

function colorSpace(hex) {
  const [l, a, b] = oklab(hex);
  const c = Math.hypot(a, b), h = (Math.atan2(b, a) * 180 / Math.PI + 360) % 360;
  return { l: Math.round(l * 100), c: c.toFixed(3), h: Math.round(h) };
}

export function createAtlas(canvas, { onSelect, onHover, onReady, imageFor, initialWorld = 'spectrum', colorFor, trueColor = false, autoRotate = true, tiltLimit = .85 }) {
  const ctx = canvas.getContext('2d', { alpha: true });
  const cells = createHexSphere(3);
  const reduced = matchMedia('(prefers-reduced-motion: reduce)');
  const events = new AbortController();
  const listen = (target, type, callback) => target.addEventListener(type, callback, { signal: events.signal });
  let width = 0, height = 0, ratio = 1, frame = 0, last = 0;
  let rotation = -.09, tilt = -.12, targetRotation = rotation, targetTilt = tilt;
  let zoom = 1, targetZoom = 1, pointer = null, dragging = false, moved = false;
  let hover = -1, selected = new Set(), marker = null, visible = true, paused = !autoRotate || reduced.matches, idleUntil = 0, pulseUntil = 0;
  let painted = [], needsDraw = true, transitioning = false, transitionStart = 0;
  let activeWorld = atlasWorlds.find(world => world.id === initialWorld) || atlasWorlds[0];
  const light = norm([-.55, .8, 1.4]), halfLight = norm([-.28, .4, 2.2]);
  cells.forEach((cell, index) => {
    cell.hex = colorFor ? colorFor(cell, index) : themedColor(activeWorld, cell, index); cell.rgb = rgb(cell.hex);
    cell.from = [...cell.rgb]; cell.target = [...cell.rgb];
  });
  const payload = index => { const cell = cells[index], visual = imageFor?.(cell.hex, cell, index); return { index, hex: cell.hex, point: [...cell.center], coordinates: colorSpace(cell.hex), image: visual?.image || visual || null, name: visual?.name || '', category: visual?.category || '', tags: visual?.tags || [] }; };
  function path(points) {
    ctx.beginPath(); ctx.moveTo(points[0][0], points[0][1]);
    for (let i = 1; i < points.length; i++) ctx.lineTo(points[i][0], points[i][1]);
    ctx.closePath();
  }
  function draw() {
    if (!width || !height) return;
    ctx.clearRect(0, 0, width, height);
    const radius = Math.min(width, height) * .425 * zoom;
    const cr = Math.cos(rotation), sr = Math.sin(rotation), ct = Math.cos(tilt), st = Math.sin(tilt);
    const rotate = ([x, y, z]) => {
      const X = x * cr + z * sr, Z = z * cr - x * sr;
      return [X, y * ct - Z * st, y * st + Z * ct];
    };
    const project = p => { const scale = 4.8 / (4.8 - p[2]); return [width / 2 + p[0] * radius * scale, height / 2 - p[1] * radius * scale]; };
    const screen = p => project(rotate(p));
    ctx.save();
    ctx.translate(width / 2, height / 2);
    ctx.strokeStyle = `${activeWorld.accent}38`; ctx.lineWidth = 1; ctx.setLineDash([2, 7]);
    ctx.beginPath(); ctx.arc(0, 0, radius * 1.075, 0, Math.PI * 2); ctx.stroke();
    ctx.setLineDash([]); ctx.rotate(rotation * .22);
    ctx.strokeStyle = `${activeWorld.accent}24`; ctx.beginPath(); ctx.ellipse(0, 0, radius * 1.14, radius * .27, -.18, 0, Math.PI * 2); ctx.stroke();
    for (let i = 0; i < 36; i++) {
      const angle = i / 36 * Math.PI * 2, inner = radius * (i % 3 ? 1.055 : 1.04), outer = radius * 1.085;
      ctx.beginPath(); ctx.moveTo(Math.cos(angle) * inner, Math.sin(angle) * inner); ctx.lineTo(Math.cos(angle) * outer, Math.sin(angle) * outer); ctx.stroke();
    }
    ctx.restore();
    const shadow = ctx.createRadialGradient(width * .48, height * .9, 0, width * .48, height * .9, radius * .9);
    shadow.addColorStop(0, '#00000040'); shadow.addColorStop(1, '#00000000');
    ctx.save(); ctx.translate(0, height * .72); ctx.scale(1, .2); ctx.translate(0, -height * .72);
    ctx.fillStyle = shadow; ctx.fillRect(0, height * .1, width, height * 1.5); ctx.restore();
    const body = ctx.createRadialGradient(width * .37, height * .26, 0, width * .5, height * .51, radius * 1.04);
    body.addColorStop(0, '#302932'); body.addColorStop(.7, '#131117'); body.addColorStop(1, '#07080C');
    ctx.fillStyle = body; ctx.beginPath(); ctx.arc(width / 2, height / 2, radius * 1.009, 0, Math.PI * 2); ctx.fill();
    const front = cells.map((cell, index) => ({ cell, index, normal: rotate(cell.center) })).filter(item => item.normal[2] > .02).sort((a, b) => a.normal[2] - b.normal[2]);
    painted = [];
    for (const { cell, index, normal } of front) {
      const lift = index === hover ? .011 : 0;
      const extra = points => lift ? points.map(p => p.map((v, i) => v + cell.center[i] * lift)) : points;
      const face = extra(cell.face).map(screen), rim = extra(cell.rim).map(screen), bottom = cell.bottom.map(screen);
      const diffuse = Math.max(0, dot(normal, light));
      const specular = Math.pow(Math.max(0, dot(normal, halfLight)), 28) * .22;
      const shade = .28 + diffuse * .7;
      const faceColor = cell.rgb.map(v => v * shade + 255 * specular);
      // Actual side faces follow the surface normals instead of a flat drop shadow.
      for (let k = 0; k < rim.length; k++) {
        const j = (k + 1) % rim.length;
        path([bottom[k], bottom[j], rim[j], rim[k]]);
        ctx.fillStyle = `rgb(${cell.rgb.map(v => Math.round(v * (.13 + diffuse * .1))).join(' ')})`;
        ctx.fill();
      }
      path(rim); ctx.fillStyle = toHex(faceColor); ctx.fill();
      for (let k = 0; k < rim.length; k++) {
        const j = (k + 1) % rim.length;
        const dx = rim[j][0] - rim[k][0], dy = rim[j][1] - rim[k][1];
        const edgeLight = clamp((dy * -.5 - dx * .7) / (Math.hypot(dx, dy) || 1), -.7, .7);
        path([rim[k], rim[j], face[j], face[k]]);
        ctx.fillStyle = toHex(faceColor.map(v => v * (.82 + edgeLight * .15) + Math.max(0, edgeLight) * 95)); ctx.fill();
      }
      // Picker faces show their actual color; depth lives in the beveled edges.
      path(face); ctx.fillStyle = trueColor ? cell.hex : toHex(faceColor); ctx.fill();
      if (index === hover || selected.has(index)) {
        ctx.strokeStyle = index === hover ? '#FFFFFFD9' : `${activeWorld.accent}C4`; ctx.lineWidth = selected.has(index) ? 1.45 : 1.2; ctx.stroke();
      }
      painted.push({ index, face, point: project(normal) });
    }
    const active = painted.filter(item => selected.has(item.index));
    if (active.length) {
      ctx.save(); ctx.strokeStyle = '#A9E8ED70'; ctx.fillStyle = '#D7FBFF'; ctx.lineWidth = 1;
      if (active.length > 1) {
        ctx.setLineDash([3, 5]); ctx.beginPath(); ctx.moveTo(...active[0].point);
        for (let i = 1; i < active.length; i++) ctx.lineTo(...active[i].point);
        ctx.stroke(); ctx.setLineDash([]);
      }
      const pulse = performance.now() < pulseUntil ? 2 + (1 - (pulseUntil - performance.now()) / 1200) * 7 : 3;
      for (const item of active) { ctx.beginPath(); ctx.arc(item.point[0], item.point[1], pulse, 0, Math.PI * 2); ctx.stroke(); ctx.beginPath(); ctx.arc(item.point[0], item.point[1], 1.5, 0, Math.PI * 2); ctx.fill(); }
      ctx.restore();
    }
    if (marker) {
      const normal = rotate(marker.point);
      if (normal[2] > .02) {
        const point = project(normal.map(value => value * 1.02));
        ctx.save();
        ctx.beginPath(); ctx.arc(...point, 8, 0, Math.PI * 2);
        ctx.strokeStyle = '#10151ACC'; ctx.lineWidth = 5; ctx.stroke();
        ctx.strokeStyle = '#FFFFFF'; ctx.lineWidth = 2.5; ctx.stroke();
        ctx.fillStyle = marker.hex; ctx.fill();
        ctx.restore();
      }
    }
  }
  function hit(x, y) {
    for (let j = painted.length - 1; j >= 0; j--) {
      const { face, index, point } = painted[j];
      if (Math.abs(point[0] - x) > width * .08 || Math.abs(point[1] - y) > height * .08) continue;
      let inside = false;
      for (let i = 0, k = face.length - 1; i < face.length; k = i++) {
        if ((face[i][1] > y) !== (face[k][1] > y) && x < (face[k][0] - face[i][0]) * (y - face[i][1]) / (face[k][1] - face[i][1]) + face[i][0]) inside = !inside;
      }
      if (inside) return index;
    }
    return -1;
  }
  function tick(time) {
    const delta = Math.min(time - last, 40); last = time;
    if (visible && !document.hidden) {
      if (transitioning) {
        const progress = clamp((time - transitionStart) / 920), eased = 1 - (1 - progress) ** 3;
        cells.forEach(cell => { cell.rgb = mix(cell.from, cell.target, eased); cell.hex = toHex(cell.rgb); });
        transitioning = progress < 1; needsDraw = true;
      }
      if (!paused && !dragging && time > idleUntil) { targetRotation += delta * .000024; needsDraw = true; }
      if (Math.abs(rotation - targetRotation) > .00005 || Math.abs(tilt - targetTilt) > .00005 || Math.abs(zoom - targetZoom) > .00005) {
        const damping = reduced.matches ? 1 : 1 - Math.exp(-delta / 75);
        rotation += (targetRotation - rotation) * damping; tilt += (targetTilt - tilt) * damping; zoom += (targetZoom - zoom) * damping; needsDraw = true;
      }
      if (needsDraw) { draw(); needsDraw = time < pulseUntil; }
    }
    frame = requestAnimationFrame(tick);
  }
  function resize() {
    const box = canvas.getBoundingClientRect(); width = box.width; height = box.height;
    ratio = Math.min(devicePixelRatio || 1, 2); canvas.width = Math.round(width * ratio); canvas.height = Math.round(height * ratio);
    ctx.setTransform(ratio, 0, 0, ratio, 0, 0); needsDraw = true;
  }
  listen(canvas, 'pointerdown', event => {
    if (!event.isPrimary || event.button > 0) return;
    pointer = { x: event.clientX, y: event.clientY, startX: event.clientX, startY: event.clientY };
    dragging = true; moved = false; hover = -1; canvas.setPointerCapture(event.pointerId); canvas.classList.add('is-dragging');
  });
  listen(canvas, 'pointermove', event => {
    if (!event.isPrimary) return;
    if (dragging && pointer) {
      const dx = event.clientX - pointer.x, dy = event.clientY - pointer.y;
      moved ||= Math.hypot(event.clientX - pointer.startX, event.clientY - pointer.startY) > 5;
      targetRotation += dx * .006; targetTilt = clamp(targetTilt + dy * .004, -tiltLimit, tiltLimit);
      pointer.x = event.clientX; pointer.y = event.clientY; needsDraw = true;
    } else {
      const box = canvas.getBoundingClientRect(); const next = hit(event.clientX - box.left, event.clientY - box.top);
      if (next !== hover) { hover = next; needsDraw = true; onHover?.(next < 0 ? null : payload(next)); }
      idleUntil = performance.now() + 2200;
    }
  });
  listen(canvas, 'pointerup', event => {
    if (!event.isPrimary || !pointer) return;
    if (!moved) { const box = canvas.getBoundingClientRect(); const picked = hit(event.clientX - box.left, event.clientY - box.top); if (picked >= 0) onSelect?.(payload(picked)); }
    dragging = false; pointer = null; idleUntil = performance.now() + 5000; needsDraw = true; canvas.classList.remove('is-dragging');
  });
  const cancel = () => { dragging = false; pointer = null; canvas.classList.remove('is-dragging'); };
  listen(canvas, 'pointercancel', cancel); listen(canvas, 'lostpointercapture', cancel);
  listen(canvas, 'pointerleave', () => { hover = -1; onHover?.(null); needsDraw = true; });
  listen(canvas, 'keydown', event => {
    if (['ArrowLeft', 'ArrowRight', 'ArrowUp', 'ArrowDown', 'Enter', ' '].includes(event.key)) event.preventDefault();
    if (event.key === 'ArrowLeft') targetRotation -= .13;
    if (event.key === 'ArrowRight') targetRotation += .13;
    if (event.key === 'ArrowUp') targetTilt = clamp(targetTilt + .13, -tiltLimit, tiltLimit);
    if (event.key === 'ArrowDown') targetTilt = clamp(targetTilt - .13, -tiltLimit, tiltLimit);
    if (event.key === 'Enter' || event.key === ' ') { const index = hit(width / 2, height / 2); if (index >= 0) onSelect?.(payload(index)); }
    idleUntil = performance.now() + 5000; needsDraw = true;
  });
  const observer = new ResizeObserver(resize); observer.observe(canvas);
  const visibilityObserver = new IntersectionObserver(([entry]) => { visible = entry.isIntersecting; if (visible) needsDraw = true; }); visibilityObserver.observe(canvas);
  listen(reduced, 'change', () => { paused = !autoRotate || reduced.matches; needsDraw = true; });
  resize(); draw(); frame = requestAnimationFrame(tick); onReady?.(cells.length);
  return {
    zoom(delta) { targetZoom = clamp(targetZoom + delta, .85, 1.3); needsDraw = true; },
    pause(value) { paused = value; },
    setSelection(indices) { selected = new Set(indices); pulseUntil = performance.now() + 1200; needsDraw = true; },
    setColorField(resolveColor) {
      transitioning = false;
      cells.forEach((cell, index) => {
        cell.hex = resolveColor(cell, index); cell.rgb = rgb(cell.hex);
        cell.from = [...cell.rgb]; cell.target = [...cell.rgb];
      });
      needsDraw = true;
    },
    setMarker(point, hex) { marker = { point, hex }; needsDraw = true; },
    focusPoint([x, y, z], immediate = false) {
      const angle = -Math.atan2(x, z);
      targetRotation = rotation + Math.atan2(Math.sin(angle - rotation), Math.cos(angle - rotation));
      targetTilt = clamp(Math.asin(clamp(y, -1, 1)), -tiltLimit, tiltLimit);
      if (immediate) { rotation = targetRotation; tilt = targetTilt; draw(); }
      needsDraw = true;
    },
    setWorld(id) {
      const next = atlasWorlds.find(world => world.id === id);
      if (!next || next.id === activeWorld.id) return false;
      activeWorld = next; hover = -1; selected.clear(); onHover?.(null);
      cells.forEach((cell, index) => {
        cell.from = [...cell.rgb]; cell.target = rgb(themedColor(activeWorld, cell, index));
        if (reduced.matches) { cell.rgb = [...cell.target]; cell.hex = toHex(cell.rgb); }
      });
      transitionStart = performance.now(); transitioning = !reduced.matches; needsDraw = true;
      return true;
    },
    getWorld() { return activeWorld; },
    reset() { targetRotation = -.09; targetTilt = -.12; targetZoom = 1; needsDraw = true; },
    destroy() { cancelAnimationFrame(frame); events.abort(); observer.disconnect(); visibilityObserver.disconnect(); cancel(); },
  };
}
