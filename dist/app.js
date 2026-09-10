import { palettes } from './palettes.js';
import { roles, rgb, toHex, clamp, contrast, textOn, paletteFromColor, exportPalette, extractColors } from './color.js';
import { createAtlas } from './globe.js';

const $ = selector => document.querySelector(selector);
const $$ = selector => [...document.querySelectorAll(selector)];
const escape = text => String(text).replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
const reduceMotion = matchMedia('(prefers-reduced-motion: reduce)');
let current = palettes.find(p => p.id === new URLSearchParams(location.search).get('p')) || palettes[0];
let context = 'landing', format = 'css', extracted = null, imageURL = null, toastTimer;
const route = location.pathname.replace(/\/+$/, '') || '/';
const page = ({ '/explore': 'explore', '/extract': 'extract', '/about': 'about' })[route] || 'home';
document.body.dataset.page = page;
const titles = { home: 'ColorVerse — Palettes for your next project', explore: 'Palette library — ColorVerse', extract: 'Image to palette — ColorVerse', about: 'About ColorVerse' };
document.title = titles[page];
$$('.desktop-nav a').forEach(link => { if (link.pathname.replace(/\/+$/, '') === route) link.setAttribute('aria-current', 'page'); });

function toast(message) {
  $('#toast').textContent = message; $('#toast').classList.add('is-visible');
  clearTimeout(toastTimer); toastTimer = setTimeout(() => $('#toast').classList.remove('is-visible'), 2600);
}
async function copy(text, message = 'Copied to clipboard.') {
  try {
    if (navigator.clipboard && window.isSecureContext) await navigator.clipboard.writeText(text);
    else {
      const area = document.createElement('textarea'); area.value = text; area.style.cssText = 'position:fixed;left:-9999px;top:0'; document.body.append(area); area.select();
      const ok = document.execCommand('copy'); area.remove(); if (!ok) throw new Error('Clipboard unavailable');
    }
    toast(message);
  } catch { toast('Copy is unavailable here. Select the code to copy it manually.'); }
}

function swatch(hex, className = '', label = '') {
  return `<button class="${className}" style="--swatch:${hex};--on:${textOn(hex)}" data-copy="${hex}" aria-label="Copy ${label ? label + ' ' : ''}${hex}" title="Copy ${hex}"><code>${hex}</code></button>`;
}

const rail = $('#paletteRail');
rail.innerHTML = palettes.map((p, i) => `<article class="palette-card" data-palette="${p.id}" style="--cover:${p.colors[1]}">
  <div class="palette-card-image"><img src="${p.image}" alt="${escape(p.name)} inspiration" width="900" height="450" loading="${i < 3 ? 'eager' : 'lazy'}" decoding="async" draggable="false"><span class="palette-number">${String(i + 1).padStart(2, '0')}</span><span class="palette-category">${p.category}</span></div>
  <div class="palette-card-colors" aria-label="Five palette colors">${p.colors.map(hex => swatch(hex)).join('')}</div>
  <button class="palette-card-select" data-select="${p.id}" aria-label="Use ${escape(p.name)} palette"><span>${escape(p.name)}</span><span>Use palette</span></button>
</article>`).join('');
$$('.palette-card-image img').forEach(img => img.addEventListener('error', () => { img.hidden = true; const note = document.createElement('span'); note.className = 'image-fallback'; note.textContent = 'Color study'; img.parentElement.append(note); }));

function renderSelection(updateURL = false) {
  $('#paletteName').textContent = current.name; $('#heroPaletteName').textContent = current.name; $('#paletteDescription').textContent = current.description;
  $('#heroSwatches').innerHTML = current.colors.map(hex => swatch(hex)).join('');
  $('#paletteRoles').innerHTML = current.colors.map((hex, i) => `<button class="role-swatch" style="--swatch:${hex}" data-copy="${hex}" aria-label="Copy ${roles[i]} ${hex}"><i aria-hidden="true"></i><span>${roles[i]}</span><code>${hex}</code></button>`).join('');
  const ratio = contrast(current.colors[0], current.colors[4]);
  $('#contrastRatio').textContent = `${ratio.toFixed(2)}:1 · ${ratio >= 7 ? 'AAA contrast' : ratio >= 4.5 ? 'AA contrast' : ratio >= 3 ? 'Large text only' : 'Low contrast'}`;
  $('#contrastVerdict').textContent = 'Text on background';
  $$('.palette-card').forEach(card => { const active = card.dataset.palette === current.id; card.classList.toggle('is-active', active); card.querySelector('[data-select]').setAttribute('aria-pressed', String(active)); });
  renderMockup(); renderExport();
  if (updateURL) { const url = new URL(location.href); if (palettes.some(p => p.id === current.id)) url.searchParams.set('p', current.id); else url.searchParams.delete('p'); history.replaceState(null, '', url); }
}

function choosePalette(palette, notify = true) {
  current = palette; renderSelection(true);
  if (notify) toast(`${palette.name} selected.`);
}

function renderMockup() {
  const panel = $('#mockup');
  const [bg, surface, primary, accent, ink] = current.colors;
  for (const [name, value] of Object.entries({ bg, surface, primary, accent, text: ink })) panel.style.setProperty(`--p-${name}`, value);
  panel.style.setProperty('--on-primary', textOn(primary)); panel.style.setProperty('--on-accent', textOn(accent));
  panel.setAttribute('aria-labelledby', `tab-${context}`);
  const photo = current.image || palettes[0].image;
  const img = (alt = 'Palette inspiration') => `<img src="${photo}" alt="${alt}" decoding="async">`;
  const browser = '<div class="mock-browser" aria-hidden="true"><i></i><i></i><i></i><span>forma.studio</span></div>';
  const nav = '<div class="mock-nav"><b>forma.</b><span>Our work <span>About us</span></span><span class="mock-cta">Let’s talk ↗</span></div>';
  const layouts = {
    landing: `<div class="mockup landing-mockup">${browser}${nav}<div class="landing-layout"><div class="landing-copy"><span class="mock-kicker">Design & strategy</span><h4>Clear ideas.<br>Considered design.</h4><p>Brand identities and digital products for teams building their next chapter.</p><span class="mock-cta">View projects <span>→</span></span></div><div class="landing-photo">${img()}<span class="photo-tag">Selected work / 2026</span></div></div><div class="mock-features"><span><i>01</i>Research</span><span><i>02</i>Design systems</span><span><i>03</i>Digital products</span></div></div>`,
    presentation: `<div class="mockup slides-layout"><div class="slide-top"><span>FORMA / QUARTERLY REVIEW</span><span>2026 — 04</span></div><div class="slide-main"><div><span class="mock-kicker">Progress at a glance</span><h4>A clearer<br>view of growth.</h4><p>A sample presentation showing your palette across text, surfaces, and data.</p></div><div class="slide-chart" role="img" aria-label="Illustrative bar chart with four sample values"><i style="--height:38%"></i><i style="--height:57%"></i><i style="--height:71%"></i><i style="--height:94%"></i></div></div><div class="slide-bottom"><span>Quarterly overview</span><span>Illustrative data · 04 / 12</span></div></div>`,
    social: `<div class="mockup social-layout"><div class="social-card"><div class="social-top"><i class="social-avatar"></i><span>forma.studio</span></div><div class="social-photo">${img()}<span>Selected work.</span></div><div class="social-foot"><span>♡ &nbsp; ↗</span><span>Project journal</span></div></div><div class="social-card"><div class="social-top"><i class="social-avatar"></i><span>forma.studio</span></div><div class="social-quote">A new look.<br>The same<br>clear purpose.</div><div class="social-foot"><span>♡ &nbsp; ↗</span><span>Brand update</span></div></div></div>`,
    shop: `<div class="mockup">${browser}<div class="shop-layout"><div class="shop-heading"><h4>Everyday editions.</h4><span>Art for your space ↗</span></div><div class="shop-grid">${['The field study', 'Another perspective', 'The quiet moment'].map((title, i) => `<div class="shop-product"><div class="product-image">${img('Example art print')}<span class="photo-tag">${i === 0 ? 'NEW EDITION' : 'FINE ART PRINT'}</span></div><h5>${title}</h5><div class="shop-price"><span>€${[28, 36, 32][i]}.00</span><span>↗</span></div></div>`).join('')}</div><div class="shop-bottom">Small editions. Lasting impressions. &nbsp; • &nbsp; Example shop</div></div></div>`,
  };
  panel.innerHTML = layouts[context];
}

function renderExport() { $('#exportCode').textContent = exportPalette(current, format); $('#exportCode').setAttribute('aria-labelledby', `format-${format}`); }

function setupTabs(selector, callback) {
  const tabs = $$(selector);
  const select = button => { tabs.forEach(b => { const active = b === button; b.setAttribute('aria-selected', String(active)); b.tabIndex = active ? 0 : -1; }); callback(button); };
  tabs.forEach((button, i) => {
    button.addEventListener('click', () => select(button));
    button.addEventListener('keydown', event => {
      let next; if (event.key === 'ArrowRight') next = (i + 1) % tabs.length; if (event.key === 'ArrowLeft') next = (i - 1 + tabs.length) % tabs.length; if (event.key === 'Home') next = 0; if (event.key === 'End') next = tabs.length - 1;
      if (next !== undefined) { event.preventDefault(); select(tabs[next]); tabs[next].focus(); }
    });
  });
}
setupTabs('[data-context]', button => { context = button.dataset.context; renderMockup(); });
setupTabs('[data-format]', button => { format = button.dataset.format; renderExport(); });
document.addEventListener('click', event => {
  const color = event.target.closest('[data-copy]'); if (color) copy(color.dataset.copy, `${color.dataset.copy} copied.`);
  const selection = event.target.closest('[data-select]'); if (selection) choosePalette(palettes.find(p => p.id === selection.dataset.select));
});
$('#copyCode').addEventListener('click', () => copy(exportPalette(current, format), `${format === 'hex' ? 'Hex list' : format.toUpperCase()} copied.`));
$('#copyPalette').addEventListener('click', () => copy(current.colors.join(', '), 'All five colors copied.'));
$('#shufflePalette').addEventListener('click', () => { const index = palettes.findIndex(p => p.id === current.id); choosePalette(palettes[(index + 1) % palettes.length]); });

let railFrame = 0;
function updateRail() {
  if (!rail.clientWidth) return;
  const cards = $$('.palette-card'), stride = cards[1] ? cards[1].offsetLeft - cards[0].offsetLeft : 368;
  const max = rail.scrollWidth - rail.clientWidth;
  const index = clamp(Math.round(rail.scrollLeft / stride), 0, palettes.length - 1);
  $('#collectionIndex').textContent = `${String(index + 1).padStart(2, '0')} / ${palettes.length}`;
  $('#palettePrev').disabled = rail.scrollLeft < 5;
  $('#paletteNext').disabled = rail.scrollLeft >= max - 5;
  $('#railProgress').style.width = `${max > 0 ? 15 + rail.scrollLeft / max * 85 : 100}%`;
  cards.forEach(card => {
    const distance = (card.offsetLeft - cards[0].offsetLeft - rail.scrollLeft) / rail.clientWidth;
    card.style.setProperty('--turn', `${clamp(distance * -1.2, -1.5, 1.5)}deg`);
  });
  railFrame = 0;
}
const scheduleRail = () => { if (!railFrame) railFrame = requestAnimationFrame(updateRail); };
rail.addEventListener('scroll', scheduleRail, { passive: true });
new ResizeObserver(scheduleRail).observe(rail);
function moveRail(direction) { const cards = $$('.palette-card'); const stride = cards[1].offsetLeft - cards[0].offsetLeft; rail.scrollBy({ left: stride * direction, behavior: reduceMotion.matches ? 'instant' : 'smooth' }); }
$('#palettePrev').addEventListener('click', () => moveRail(-1)); $('#paletteNext').addEventListener('click', () => moveRail(1));
rail.addEventListener('keydown', event => { if (event.target !== rail) return; if (event.key === 'ArrowRight' || event.key === 'ArrowLeft') { event.preventDefault(); moveRail(event.key === 'ArrowRight' ? 1 : -1); } if (event.key === 'Home' || event.key === 'End') { event.preventDefault(); rail.scrollTo({ left: event.key === 'Home' ? 0 : rail.scrollWidth, behavior: reduceMotion.matches ? 'instant' : 'smooth' }); } });
let railDrag = null, suppressClick = false;
rail.addEventListener('pointerdown', event => {
  if (event.pointerType !== 'mouse' || event.button !== 0) return;
  suppressClick = false; railDrag = { x: event.clientX, scroll: rail.scrollLeft, moved: false, id: event.pointerId };
});
rail.addEventListener('pointermove', event => {
  if (!railDrag) return; const dx = event.clientX - railDrag.x;
  if (Math.abs(dx) > 5) { railDrag.moved = true; rail.classList.add('is-dragging'); rail.setPointerCapture(event.pointerId); }
  if (railDrag.moved) { event.preventDefault(); rail.scrollLeft = railDrag.scroll - dx; }
});
function finishDrag() { if (!railDrag) return; suppressClick = railDrag.moved; railDrag = null; rail.classList.remove('is-dragging'); }
rail.addEventListener('pointerup', finishDrag); rail.addEventListener('pointercancel', finishDrag); rail.addEventListener('lostpointercapture', finishDrag);
rail.addEventListener('click', event => { if (suppressClick) { event.preventDefault(); event.stopPropagation(); suppressClick = false; } }, true);

let savedTheme; try { savedTheme = localStorage.getItem('colorverse-theme'); } catch {}
function setTheme(theme) {
  document.documentElement.dataset.theme = theme;
  $('#themeToggle').setAttribute('aria-label', theme === 'light' ? 'Switch to dark theme' : 'Switch to light theme');
  document.querySelector('meta[name="theme-color"]').content = theme === 'light' ? '#fafaf8' : '#1c1f22';
  try { localStorage.setItem('colorverse-theme', theme); } catch {}
}
setTheme(savedTheme === 'light' || savedTheme === 'dark' ? savedTheme : (matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light'));
$('#themeToggle').addEventListener('click', () => setTheme(document.documentElement.dataset.theme === 'light' ? 'dark' : 'light'));

if (page === 'home') {
  const globe = createAtlas($('#globe'), {
    onSelect(hex) { choosePalette({ id: 'atlas-study', name: 'Custom color palette', description: 'Five colors built around your selection on the globe.', colors: paletteFromColor(hex), image: null }); },
    onHover(hex) { if (hex) { $('#hoverHex').textContent = hex; $('#hoverDot').style.background = hex; } },
  });
  $('#zoomIn').addEventListener('click', () => globe.zoom(.08)); $('#zoomOut').addEventListener('click', () => globe.zoom(-.08));
  let paused = reduceMotion.matches;
  function updatePause() { $('#pauseAtlas').setAttribute('aria-pressed', String(paused)); $('#pauseAtlas').setAttribute('aria-label', paused ? 'Resume globe rotation' : 'Pause globe rotation'); $('#pauseAtlas').innerHTML = paused ? '<svg viewBox="0 0 20 20" aria-hidden="true"><path d="m7 4 8 6-8 6Z"/></svg>' : '<svg viewBox="0 0 20 20" aria-hidden="true"><path d="M7 5v10M13 5v10"/></svg>'; }
  updatePause(); $('#pauseAtlas').addEventListener('click', () => { paused = !paused; globe.pause(paused); updatePause(); });
  reduceMotion.addEventListener('change', () => { paused = reduceMotion.matches; globe.pause(paused); updatePause(); });
}

const input = $('#imageInput'), dropzone = $('#dropzone');
let extractionSequence = 0;
async function extract(file) {
  if (!file) return;
  const sequence = ++extractionSequence;
  const status = $('#extractStatus');
  if (!['image/png', 'image/jpeg', 'image/webp'].includes(file.type)) { status.textContent = 'Choose a JPG, PNG, or WebP image.'; return; }
  if (file.size > 20 * 1024 * 1024) { status.textContent = 'This image is a little large. Choose one smaller than 20 MB.'; return; }
  status.textContent = 'Finding the colors in your image…';
  const nextURL = URL.createObjectURL(file);
  try {
    const image = new Image(); image.src = nextURL; await image.decode();
    if (sequence !== extractionSequence) { URL.revokeObjectURL(nextURL); return; }
    if (!image.width || !image.height) throw new Error('This image could not be read. Try another one.');
    const sample = document.createElement('canvas'); const size = 180 / Math.max(image.width, image.height);
    sample.width = Math.max(1, Math.round(image.width * size)); sample.height = Math.max(1, Math.round(image.height * size));
    const ctx = sample.getContext('2d', { willReadFrequently: true }); ctx.drawImage(image, 0, 0, sample.width, sample.height);
    const result = extractColors(ctx.getImageData(0, 0, sample.width, sample.height).data);
    const replaceCurrent = current.image === imageURL && imageURL !== null;
    if (imageURL) URL.revokeObjectURL(imageURL); imageURL = nextURL;
    extracted = { id: 'your-image', name: 'Image palette', description: 'Five colors from your image, assigned to background, surface, primary, accent, and text.', colors: result.colors, image: imageURL };
    if (replaceCurrent) choosePalette(extracted, false);
    $('#extractedImage').src = imageURL;
    $('#extractedSwatches').innerHTML = extracted.colors.map(hex => swatch(hex)).join('');
    $('#extractionInfo').textContent = result.sampled < 5 ? `${result.sampled} sampled · ${5 - result.sampled} tonal variations` : 'Five extracted colors';
    dropzone.classList.add('has-result'); $('#extractionResult').hidden = false;
    status.textContent = 'Palette ready. Select “Use this palette” to preview it.';
  } catch (error) { URL.revokeObjectURL(nextURL); status.textContent = error.message?.includes('visible pixels') ? error.message : 'This image could not be read. Try another JPG, PNG, or WebP.'; }
  finally { input.value = ''; }
}
input.addEventListener('change', () => extract(input.files?.[0]));
$('.change-image').tabIndex = 0;
$('.change-image').setAttribute('role', 'button');
$('.change-image').addEventListener('keydown', event => { if (event.key === 'Enter' || event.key === ' ') { event.preventDefault(); input.click(); } });
for (const eventName of ['dragenter', 'dragover']) dropzone.addEventListener(eventName, event => { event.preventDefault(); dropzone.classList.add('is-over'); });
for (const eventName of ['dragleave', 'drop']) dropzone.addEventListener(eventName, event => { event.preventDefault(); dropzone.classList.remove('is-over'); });
dropzone.addEventListener('drop', event => extract(event.dataTransfer.files?.[0]));
$('#useExtraction').addEventListener('click', () => {
  if (!extracted) return; choosePalette(extracted, false); $('#studio').scrollIntoView({ behavior: reduceMotion.matches ? 'instant' : 'smooth', block: 'start' }); toast('Image palette selected.');
});

renderSelection(); updateRail();
document.documentElement.classList.add('js');
const reveal = new IntersectionObserver(entries => { for (const entry of entries) if (entry.isIntersecting) { entry.target.classList.add('is-visible'); reveal.unobserve(entry.target); } }, { threshold: .06, rootMargin: '0px 0px 30px 0px' });
$$('.reveal').forEach(element => reveal.observe(element));

// Hash links work on first load and when moving between studio routes.
const hashTarget = location.hash ? document.getElementById(decodeURIComponent(location.hash.slice(1))) : null;
if (hashTarget) requestAnimationFrame(() => hashTarget.scrollIntoView({ behavior: 'instant' }));
