import { seek, LOOP } from './reference.js?v=1';
const viewport = document.querySelector('#motionViewport'), stage = document.querySelector('#stage');
const control = document.querySelector('#playMotion'), timeline = document.querySelector('#motionTime'), readout = document.querySelector('#motionTimeValue');
const reducedMotion = matchMedia('(prefers-reduced-motion: reduce)');
let playing = false, time = 0, last = 0, frame;
function fit() { stage.style.transform = `scale(${viewport.clientWidth / 1440})`; draw(); }
function draw() { seek(time); timeline.value = time; readout.textContent = `${time.toFixed(1)} / ${LOOP.toFixed(1)} s`; }
function setPlaying(value) {
  playing = value; control.textContent = playing ? 'Pause' : 'Play'; control.setAttribute('aria-pressed', String(playing));
  document.querySelector('#motionNote').textContent = playing ? 'Playing the scripted reference.' : reducedMotion.matches ? 'Paused. Reduced motion is enabled; the timeline works without autoplay.' : 'Paused. Drag the timeline to inspect a state.';
  cancelAnimationFrame(frame);
  if (playing) { last = performance.now(); frame = requestAnimationFrame(tick); }
}
function tick(now) { if (!playing) return; time = (time + Math.min((now - last) / 1000, .1)) % LOOP; last = now; draw(); frame = requestAnimationFrame(tick); }
control.addEventListener('click', () => setPlaying(!playing));
document.querySelector('#restartMotion').addEventListener('click', () => { time = 0; draw(); setPlaying(!reducedMotion.matches); });
timeline.addEventListener('input', () => { setPlaying(false); time = Number(timeline.value); draw(); });
document.addEventListener('visibilitychange', () => { if (document.hidden) setPlaying(false); });
window.addEventListener('pagehide', () => setPlaying(false));
reducedMotion.addEventListener('change', () => { if (reducedMotion.matches) setPlaying(false); });
new ResizeObserver(fit).observe(viewport);
document.fonts.ready.then(fit);
fit();
