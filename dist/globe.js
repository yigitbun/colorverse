import { createHexSphere, dot, norm, mix } from './geometry.js';
import { hsv, rgb, toHex, clamp } from './color.js';

export function createAtlas(canvas, { onSelect, onHover, onReady }) {
  const ctx = canvas.getContext('2d', { alpha: true });
  const cells = createHexSphere(3);
  const reduced = matchMedia('(prefers-reduced-motion: reduce)');
  let width = 0, height = 0, ratio = 1, frame = 0, last = 0;
  let rotation = -.09, tilt = -.12, targetRotation = rotation, targetTilt = tilt;
  let zoom = 1, targetZoom = 1, pointer = null, dragging = false, moved = false;
  let hover = -1, selected = -1, visible = true, paused = reduced.matches, idleUntil = 0;
  let painted = [], needsDraw = true;
  const light = norm([-.55, .8, 1.4]), halfLight = norm([-.28, .4, 2.2]);
  cells.forEach(cell => {
    const [cx, cy, cz] = cell.center, longitude = Math.atan2(cx, cz);
    const h = 16 + Math.sin(longitude) * 32 + (1 - Math.cos(longitude)) * 95 + cy * 14;
    cell.hex = hsv(h, .76, .98); cell.rgb = rgb(cell.hex);
  });
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
      path(face); ctx.fillStyle = toHex(faceColor); ctx.fill();
      if (index === hover || index === selected) {
        ctx.strokeStyle = index === hover ? '#FFFFFFD9' : '#FFFFFF80'; ctx.lineWidth = 1.2; ctx.stroke();
      }
      painted.push({ index, face, point: project(normal) });
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
      if (!paused && !dragging && time > idleUntil) { targetRotation += delta * .000024; needsDraw = true; }
      if (Math.abs(rotation - targetRotation) > .00005 || Math.abs(tilt - targetTilt) > .00005 || Math.abs(zoom - targetZoom) > .00005) {
        const damping = reduced.matches ? 1 : 1 - Math.exp(-delta / 75);
        rotation += (targetRotation - rotation) * damping; tilt += (targetTilt - tilt) * damping; zoom += (targetZoom - zoom) * damping; needsDraw = true;
      }
      if (needsDraw) { draw(); needsDraw = false; }
    }
    frame = requestAnimationFrame(tick);
  }
  function resize() {
    const box = canvas.getBoundingClientRect(); width = box.width; height = box.height;
    ratio = Math.min(devicePixelRatio || 1, 2); canvas.width = Math.round(width * ratio); canvas.height = Math.round(height * ratio);
    ctx.setTransform(ratio, 0, 0, ratio, 0, 0); needsDraw = true;
  }
  canvas.addEventListener('pointerdown', event => {
    pointer = { x: event.clientX, y: event.clientY, startX: event.clientX, startY: event.clientY };
    dragging = true; moved = false; hover = -1; canvas.setPointerCapture(event.pointerId); canvas.classList.add('is-dragging');
  });
  canvas.addEventListener('pointermove', event => {
    if (dragging && pointer) {
      const dx = event.clientX - pointer.x, dy = event.clientY - pointer.y;
      moved ||= Math.hypot(event.clientX - pointer.startX, event.clientY - pointer.startY) > 5;
      targetRotation += dx * .006; targetTilt = clamp(targetTilt + dy * .004, -.85, .85);
      pointer.x = event.clientX; pointer.y = event.clientY; needsDraw = true;
    } else {
      const box = canvas.getBoundingClientRect(); const next = hit(event.clientX - box.left, event.clientY - box.top);
      if (next !== hover) { hover = next; needsDraw = true; onHover?.(next < 0 ? null : cells[next].hex); }
      idleUntil = performance.now() + 2200;
    }
  });
  canvas.addEventListener('pointerup', event => {
    if (!moved) { const box = canvas.getBoundingClientRect(); selected = hit(event.clientX - box.left, event.clientY - box.top); if (selected >= 0) onSelect(cells[selected].hex); }
    dragging = false; pointer = null; idleUntil = performance.now() + 5000; needsDraw = true; canvas.classList.remove('is-dragging');
  });
  const cancel = () => { dragging = false; pointer = null; canvas.classList.remove('is-dragging'); };
  canvas.addEventListener('pointercancel', cancel); canvas.addEventListener('lostpointercapture', cancel);
  canvas.addEventListener('pointerleave', () => { hover = -1; onHover?.(null); needsDraw = true; });
  canvas.addEventListener('keydown', event => {
    if (['ArrowLeft', 'ArrowRight', 'ArrowUp', 'ArrowDown', 'Enter', ' '].includes(event.key)) event.preventDefault();
    if (event.key === 'ArrowLeft') targetRotation -= .13;
    if (event.key === 'ArrowRight') targetRotation += .13;
    if (event.key === 'ArrowUp') targetTilt = clamp(targetTilt + .13, -.85, .85);
    if (event.key === 'ArrowDown') targetTilt = clamp(targetTilt - .13, -.85, .85);
    if (event.key === 'Enter' || event.key === ' ') { const index = hit(width / 2, height / 2); if (index >= 0) { selected = index; onSelect(cells[index].hex); } }
    idleUntil = performance.now() + 5000; needsDraw = true;
  });
  const observer = new ResizeObserver(resize); observer.observe(canvas);
  const visibilityObserver = new IntersectionObserver(([entry]) => { visible = entry.isIntersecting; if (visible) needsDraw = true; }); visibilityObserver.observe(canvas);
  reduced.addEventListener('change', () => { paused = reduced.matches; needsDraw = true; });
  resize(); draw(); frame = requestAnimationFrame(tick); onReady?.(cells.length);
  return {
    zoom(delta) { targetZoom = clamp(targetZoom + delta, .85, 1.3); needsDraw = true; },
    pause(value) { paused = value; },
    reset() { targetRotation = -.09; targetTilt = -.12; targetZoom = 1; needsDraw = true; },
    destroy() { cancelAnimationFrame(frame); observer.disconnect(); visibilityObserver.disconnect(); },
  };
}
