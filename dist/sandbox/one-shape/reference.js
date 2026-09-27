// Adapted from the owner's one-shape.html. Scripted motion, not live widgets.
// Original timeline/math retained; embedded font and autoplay globals removed.
"use strict";
/* ───────────────────────── spring math (closed form) ───────────────────────── */
const LOOP = 14, BEAT = 0.5;
function hom(x0, v0, tau, w, z) {           // free response from (x0,v0) toward 0
  if (tau <= 0) return x0;
  if (z >= 1) { const e = Math.exp(-w * tau); return e * (x0 + (v0 + w * x0) * tau); }
  const wd = w * Math.sqrt(1 - z * z), e = Math.exp(-z * w * tau);
  return e * (x0 * Math.cos(wd * tau) + (v0 + z * w * x0) / wd * Math.sin(wd * tau));
}
const step = (tau, w, z) => tau <= 0 ? 0 : 1 - hom(1, 0, tau, w, z);
const SP = {
  shape: [20, 0.86], color: [24, 1], knob: [22, 0.86], fast: [34, 0.9], slow: [15, 0.92],
  cam: [10, 1], cur: [19, 1], ui: [24, 1], soft: [15, 0.95], draw: [11, 1], quick: [36, 1]
};
/* A channel = sum of one spring per target change, plus direct-manipulation windows.
   It is a pure function of t. The previous loop is replayed so t=0 equals t=14. */
class Ch {
  constructor(sp = SP.shape) { this.sp = sp; this.S = []; this.D = []; this.memo = new Map(); }
  set(t, v, sp) { this.S.push({ t, v, sp: sp || this.sp }); return this; }
  direct(t0, t1, f) { this.D.push({ t0, t1, f }); return this; }
  fin() {
    const S = this.S.sort((a, b) => a.t - b.t);
    this.base = S[S.length - 1].v;
    const ext = [...S.map(s => ({ ...s, t: s.t - LOOP })), ...S];
    let prev = this.base;
    for (const s of ext) { s.d = s.v - prev; prev = s.v; }
    this.E = ext;
    this.DD = [...this.D.map(d => ({ t0: d.t0 - LOOP, t1: d.t1 - LOOP, f: t => d.f(t + LOOP) })), ...this.D];
    return this;
  }
  tgt(a) { let v = this.base; for (const s of this.E) { if (s.t <= a) v = s.v; else break; } return v; }
  ev(t) {
    for (const d of this.DD) if (t >= d.t0 && t < d.t1) return d.f(t);
    let a = -LOOP - 1, x0 = this.base, v0 = 0, dd = null;
    for (const d of this.DD) if (d.t1 <= t && d.t1 > a) { a = d.t1; dd = d; }
    if (dd) {
      let m = this.memo.get(a);
      if (!m) { const h = 0.002, x = dd.f(a - 1e-6); m = [x, (x - dd.f(a - h)) / h]; this.memo.set(a, m); }
      [x0, v0] = m;
    }
    const T = this.tgt(a);
    let v = T + hom(x0 - T, v0, t - a, this.sp[0], this.sp[1]);
    for (const s of this.E) { if (s.t <= a) continue; if (s.t > t) break; v += s.d * step(t - s.t, s.sp[0], s.sp[1]); }
    return v;
  }
}
const chans = [];
const ch = (sp) => { const c = new Ch(sp); chans.push(c); return c; };
const col = (sp = SP.color) => [ch(sp), ch(sp), ch(sp)];
const setCol = (c, t, rgb, sp) => c.forEach((k, i) => k.set(t, rgb[i], sp));
const evCol = (c, t) => `rgb(${c.map(k => Math.round(Math.min(255, Math.max(0, k.ev(t))))).join(",")})`;
const clamp = (x, a = 0, b = 1) => Math.min(b, Math.max(a, x));
const mix = (a, b, k) => a + (b - a) * k;

const INK = [17, 17, 16], WHITE = [255, 255, 255], GRAY = [216, 212, 206], ORANGE = [255, 90, 31], ROW = [240, 238, 234];

/* ───────────────────────── cursor ───────────────────────── */
const cx = ch(SP.cur), cy = ch(SP.cur), cpress = ch(SP.quick);
[[0.15, 42, 12], [0.75, 70, 62], [2.12, 40, 4], [2.62, 172, -28], [3.62, -78.4, 38], [4.05, 109.8, 38], [4.5, 54.9, 38],
 [5.62, -1.9, 0], [6.05, 152, 0], [6.5, 262, 0], [7.62, 12, 8], [8.6, 136, 6], [9.12, -136, 6], [10.1, -30, 236],
 [10.62, 67.6, 60], [11.42, 202.9, 12], [11.72, 244, -160], [12.15, 170, 60], [13.62, 120, 70]]
  .forEach(([t, x, y]) => { cx.set(t, x); cy.set(t, y); });
const CLICKS = [[0.5, 0.6], [2.5, 2.6], [3.0, 3.1], [4.0, 5.0], [6.0, 7.0], [8.0, 8.1], [9.0, 9.1], [9.5, 9.6], [12.0, 12.1]];
cpress.set(0, 0); CLICKS.forEach(([a, b]) => { cpress.set(a, 1); cpress.set(b, 0); });
cx.fin(); cy.fin();

/* ───────────────────────── shape ───────────────────────── */
const W = ch(), H = ch(), R = ch(), SY = ch(), EL = ch(SP.color), SC = col();
const shapeKeys = [
  // t, w, h, r, color
  [0.5, 210, 60, 30, INK], [0.6, 64, 64, 32, INK], [2.0, 250, 44, 22, INK], [2.5, 440, 156, 32, WHITE],
  [5.5, 360, 60, 30, WHITE], [7.5, 104, 60, 30, GRAY], [8.0, null, null, null, ORANGE], [8.5, 420, 56, 28, WHITE],
  [10.0, 560, 400, 32, WHITE], [12.0, 480, 293, 22, WHITE], [12.5, null, 249], [12.625, null, 117],
  [13.0, 300, 56, 28, INK], [13.5, 220, 64, 32, INK]];
for (const [t, w, h, r, c] of shapeKeys) {
  if (w != null) W.set(t, w); if (h != null) H.set(t, h); if (r != null) R.set(t, r); if (c) setCol(SC, t, c);
}
SY.set(0, 0).set(12.0, 0.5).set(12.5, -21.5).set(12.625, -87.5).set(13.0, 0);
EL.set(2.5, 1).set(13.0, 0);

/* camera (log scale) */
const CS = ch(SP.cam), CY = ch(SP.cam);
[[0, 3.2], [0.6, 3.4], [2.0, 3.0], [2.5, 2.15], [5.5, 2.5], [7.5, 3.4], [8.5, 2.15], [10.0, 1.62], [12.0, 1.85],
 [12.625, 1.95], [13.0, 2.9], [13.5, 3.2]].forEach(([t, s]) => CS.set(t, Math.log(s)));
CY.set(0, 0).set(12.625, -58).set(13.0, 0);

/* ───────────────────────── player: progress ───────────────────────── */
const BAR_L = -196, BAR_W = 392;
let _cx4, _cx6;
const cx4 = () => _cx4 ?? (_cx4 = cx.ev(4.0));
const cx6 = () => _cx6 ?? (_cx6 = cx.ev(6.0));
function pAt(t) {
  if (t < 3.0) return 0.28;
  if (t < 4.0) return 0.28 + 0.02 * (t - 3);
  if (t < 5.0) return clamp(0.30 + (cx.ev(t) - cx4()) / BAR_W);
  return pAt(5.0 - 1e-6) + 0.02 * (t - 5);
}
const KR = ch(SP.knob); KR.set(2.5, 7).set(4.0, 11).set(5.0, 7);
const PLAY = ch(SP.ui); PLAY.set(2.5, 0).set(3.0, 1).set(5.5, 0);

/* ───────────────────────── volume: rubber band ───────────────────────── */
const V_L = -118, V_MAX = 140;
function rawV(t) { return -1.9 + (cx.ev(t) - cx6()); }
function stF(t) { const over = Math.max(0, rawV(t) - V_MAX); return 64 * (1 - Math.exp(-over / 150)); }
function vAt(t) {
  if (t < 6.0) return 0.45;
  if (t < 7.0) return clamp((Math.min(rawV(t), V_MAX) - V_L) / (V_MAX - V_L));
  return vAt(7.0 - 1e-6);
}
const ST = ch(SP.knob); ST.set(0, 0).direct(6.0, 7.0, stF);

/* ───────────────────────── the knob (progress → volume → toggle → tab → row → toast dot) ─── */
const KL = ch(SP.knob), KRt = ch(SP.knob), KT = ch(SP.knob), KB = ch(SP.knob), KRAD = ch(SP.knob), KOP = ch(SP.ui), KSH = ch(SP.color), KC = col();
const bx = p => BAR_L + p * BAR_W;
KL.direct(2.4, 5.5, t => bx(pAt(t)) - KR.ev(t)); KRt.direct(2.4, 5.5, t => bx(pAt(t)) + KR.ev(t));
KT.direct(2.4, 5.5, t => 38 - KR.ev(t)); KB.direct(2.4, 5.5, t => 38 + KR.ev(t));
const kv = t => (KB.ev(t) - KT.ev(t)) / 2;
const knobX = t => Math.min(rawV(t), V_MAX) + stF(t);
KL.direct(6.0, 7.0, t => knobX(t) - kv(t)); KRt.direct(6.0, 7.0, t => knobX(t) + kv(t));
const K = (t, l, r, top, b, sl, sr) => { if (l != null) KL.set(t, l, sl); if (r != null) KRt.set(t, r, sr); if (top != null) KT.set(t, top); if (b != null) KB.set(t, b); };
K(5.5, -14.9, 11.1, -13, 13);
KT.set(6.0, -15); KB.set(6.0, 15); KT.set(7.0, -13); KB.set(7.0, 13);
K(7.5, -46, 2, -24, 24, SP.fast, SP.slow);
K(8.0, -2, 46, null, null, SP.slow, SP.fast);
K(8.5, -68, 68, -22, 22, SP.fast, SP.fast);
K(9.0, 68, 204, null, null, SP.slow, SP.fast);
K(9.5, -204, -68, null, null, SP.fast, SP.slow);
K(10.0, null, null, -184, -140);
K(12.0, -232, 232, -81, -37);
K(13.0, -133, -111, -11, 11);
K(13.5, -122, -122, 0, 0);
KRAD.direct(2.4, 5.5, t => KR.ev(t)); KRAD.set(2.5, 7).set(5.5, 13).set(7.5, 24).set(8.5, 22).set(12.0, 10).set(13.0, 11);
KOP.set(2.55, 1).set(13.5, 0); KSH.set(2.5, 0).set(5.5, 1).set(8.5, 0);
setCol(KC, 2.4, INK); setCol(KC, 5.5, WHITE); setCol(KC, 8.5, INK); setCol(KC, 12.0, ROW); setCol(KC, 13.0, ORANGE);

/* track (progress bar → volume track) */
const TL = ch(), TR = ch(), TY = ch(), TH = ch(), FC = col();
TL.set(2.5, BAR_L).set(5.5, V_L); TR.set(2.5, BAR_L + BAR_W).set(5.5, V_MAX); TY.set(2.5, 38).set(5.5, 0); TH.set(2.5, 4).set(5.5, 8);
setCol(FC, 2.5, ORANGE); setCol(FC, 5.5, INK);

/* album art + EQ (island → player) */
const AX = ch(), AY = ch(), AS = ch(), AR = ch(), EX = ch(), EY = ch(), EC = col();
AX.set(2.0, -104).set(2.5, -166); AY.set(2.0, 0).set(2.5, -28); AS.set(2.0, 28).set(2.5, 60); AR.set(2.0, 8).set(2.5, 12);
EX.set(2.0, 100).set(2.5, 119); EY.set(2.0, 0).set(2.5, -28); setCol(EC, 2.0, WHITE); setCol(EC, 2.5, INK);

/* tabs */
const TABY = ch(); TABY.set(0, 0).set(10.0, -162);
const TABX = [-136, 0, 136];

/* chart */
const DATA = [22, 26, 24, 31, 29, 35, 33, 41, 38, 44, 52, 48], MON = ["Jan","Feb","Mar","Apr","May","Jun","Jul","Aug","Sep","Oct","Nov","Dec"];
const PX = i => -248 + i * 496 / 11, PY = v => 150 - (v - 15) / 40 * 186;
const DRAW = ch(SP.draw); DRAW.set(0, 0).set(10.45, 1).set(12.3, 0);
const DOTX = ch(SP.ui), DOTY = ch(SP.ui), TIPX = ch(SP.soft), TIPY = ch(SP.soft);
const idxEvents = [];
{ // tooltip index changes are found by sampling the cursor path (pure: fixed once)
  let last = -1;
  for (let t = 10.6; t <= 11.75; t += 0.001) {
    const i = Math.round(clamp((cx.ev(t) + 248) / (496 / 11), 0, 11));
    if (i !== last) { idxEvents.push([t, i]); last = i; }
  }
  const [t0, i0] = idxEvents[0];
  for (const [t, i] of idxEvents) {
    const tt = t === t0 ? 1.0 : t;
    DOTX.set(tt, PX(i)); DOTY.set(tt, PY(DATA[i])); TIPX.set(tt, PX(i)); TIPY.set(tt, PY(DATA[i]));
  }
}
const idxAt = t => { let i = idxEvents[0][1]; for (const [a, b] of idxEvents) if (a <= t) i = b; return i; };

/* palette */
const CMDS = [["Search docs", "search"], ["Toggle notifications", "bell"], ["Open analytics", "chart"], ["New project", "plus"], ["Invite teammate", "user"]];
const KEYS = [[12.5, "t"], [12.625, "to"], [12.75, "tog"]];
const ROWTOP = -59;
const RY = CMDS.map(() => ch(SP.knob)), ROP = CMDS.map(() => ch(SP.ui));
function ranks(q) { let r = 0; return CMDS.map(([n]) => n.toLowerCase().includes(q) ? r++ : -1); }
RY.forEach((c, i) => c.set(0, ROWTOP + i * 44)); ROP.forEach(c => c.set(0, 1));
KEYS.forEach(([t, q]) => ranks(q).forEach((r, i) => { if (r >= 0) RY[i].set(t, ROWTOP + r * 44); ROP[i].set(t, r >= 0 ? 1 : 0); }));
const ENTER = ch(SP.quick); ENTER.set(0, 0).set(13.0, 1).set(13.1, 0);

chans.forEach(c => c.fin());

/* ───────────────────────── DOM ───────────────────────── */
const $ = s => document.querySelector(s);
const stage = $("#stage"), inner = $("#inner"), clip = $("#clip"), world = $("#world"), cursor = $("#cursor");
const ICON = {
  speaker: '<path d="M11 5 6 9H2v6h4l5 4z"/><path class="w1" d="M15.5 8.5a5 5 0 0 1 0 7"/><path class="w2" d="M19 5a10 10 0 0 1 0 14"/>',
  search: '<circle cx="11" cy="11" r="7"/><path d="m20 20-3.5-3.5"/>',
  bell: '<path d="M6 8a6 6 0 0 1 12 0c0 7 3 9 3 9H3s3-2 3-9"/><path d="M10.3 21a1.94 1.94 0 0 0 3.4 0"/>',
  chart: '<path d="M3 3v18h18"/><path d="m19 9-5 5-4-4-3 3"/>',
  plus: '<path d="M12 5v14M5 12h14"/>',
  user: '<path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M19 8v6M22 11h-6"/>',
};
const icon = (n, size = 20) => `<svg class="ic" width="${size}" height="${size}" viewBox="0 0 24 24">${ICON[n]}</svg>`;
function mk(html, css = "", parent = inner) {
  const d = document.createElement("div"); d.className = "a"; d.innerHTML = html; d.style.cssText = css; parent.appendChild(d); return d;
}
/* layers: every content group has its own enter/exit timing so swaps never overlap */
const layers = [];
function layer(tin, tout, dIn = 0.08) { const g = mk("", "left:0;top:0"); layers.push({ g, tin, tout, dIn }); return g; }
function lay(t, tin, tout, dIn) {
  let o = 0;
  for (const k of [-LOOP, 0, LOOP]) {
    const a = tin + k, b = tout + k;
    const e = step(t - a - dIn, 26, 1), x = step(t - b, 42, 1);
    o += e * (1 - x);
  }
  return clamp(o);
}
const at = (el, x, y, ax = 0.5, ay = 0.5, extra = "") => { el.style.left = x + "px"; el.style.top = y + "px"; el.style.transform = `translate(${-ax * 100}%,${-ay * 100}%) ${extra}`; };

/* button */
const gBtn = layer(-0.5, 0.6);
const btnLabel = mk("Get started", "font-size:21px;font-weight:540;color:#fff;letter-spacing:-0.01em", gBtn); at(btnLabel, 0, 0);

/* loader + check */
const gLoad = layer(0.6, 1.5, 0.06);
const loadSvg = mk(`<svg width="64" height="64" viewBox="-32 -32 64 64"><circle r="17" fill="none" stroke="rgba(255,255,255,.18)" stroke-width="3.5"/><circle id="arc" r="17" fill="none" stroke="#fff" stroke-width="3.5" stroke-linecap="round"/></svg>`, "", gLoad); at(loadSvg, 0, 0);
const gCheck = layer(1.5, 2.0, 0.02);
const checkSvg = mk(`<svg width="64" height="64" viewBox="-32 -32 64 64"><path id="chk" d="M-9 1 L-3 7 L9 -6" fill="none" stroke="#fff" stroke-width="3.5" stroke-linecap="round" stroke-linejoin="round"/></svg>`, "", gCheck); at(checkSvg, 0, 0);
const arc = $("#arc"), chk = $("#chk"); const ARC = 2 * Math.PI * 17, CHK = chk.getTotalLength();

/* album art + EQ (persistent island → player) */
const gArt = layer(2.0, 5.5, 0.1);
const art = mk(`<div style="position:absolute;inset:0;background:#FF5A1F"></div><div style="position:absolute;width:44px;height:44px;right:-10px;bottom:-12px;border-radius:50%;background:#111110"></div><div style="position:absolute;width:14px;height:14px;left:12px;top:12px;border-radius:50%;background:#fff"></div>`, "width:60px;height:60px;overflow:hidden", gArt);
const gEq = layer(2.0, 5.5, 0.1);
const eq = mk([0, 1, 2, 3].map(i => `<i style="position:absolute;bottom:0;left:${i * 6}px;width:3px;border-radius:2px;background:currentColor"></i>`).join(""), "width:21px;height:20px", gEq);
const eqBars = [...eq.querySelectorAll("i")];

/* player */
const gPlayer = layer(2.5, 5.5, 0.1);
const title = mk("Night Drive", "font-size:18px;font-weight:600;letter-spacing:-0.015em", gPlayer); at(title, -120, -44, 0, 0.5);
const artist = mk("Lumen Park", "font-size:15px;font-weight:450;color:#8C877F", gPlayer); at(artist, -120, -20, 0, 0.5);
const playBtn = mk(`<svg width="44" height="44" viewBox="-22 -22 44 44"><circle r="22" fill="#111110"/><path id="pp" fill="#fff" stroke="#fff" stroke-width="1.6" stroke-linejoin="round"/></svg>`, "", gPlayer); at(playBtn, 172, -28);
const pp = $("#pp");
const tLeft = mk("0:00", "font-size:12.5px;font-weight:500;color:#8C877F", gPlayer); at(tLeft, BAR_L, 60, 0, 0.5);
const tRight = mk("-0:00", "font-size:12.5px;font-weight:500;color:#8C877F", gPlayer); at(tRight, BAR_L + BAR_W, 60, 1, 0.5);

/* track + fill (persistent player → volume) */
const gTrack = layer(2.5, 7.5, 0.1);
const track = mk("", "background:#ECE9E5;height:4px", gTrack), fill = mk("", "height:4px", gTrack);

/* volume */
const gVol = layer(5.5, 7.5, 0.12);
const spk = mk(icon("speaker", 22), "color:#111110", gVol); at(spk, -150, 0);
const w1 = spk.querySelector(".w1"), w2 = spk.querySelector(".w2");

/* the knob */
const gKnob = mk("", "left:0;top:0");
const knob = mk("", "", gKnob);

/* toast glyph */
const gToast = layer(13.0, 13.5, 0.1);
const tCheck = mk(`<svg width="22" height="22" viewBox="-11 -11 22 22"><path d="M-4.5 0.5 L-1.5 3.5 L4.5 -3" fill="none" stroke="#fff" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"/></svg>`, "", gToast); at(tCheck, -122, 0);
const tText = mk("Notifications on", "font-size:16px;font-weight:540;color:#fff;letter-spacing:-0.01em", gToast); at(tText, -100, 0, 0, 0.5);
const tUndo = mk("Undo", "font-size:15px;font-weight:500;color:#8C877F", gToast); at(tUndo, 128, 0, 1, 0.5);

/* tabs + chart */
const gChart = layer(10.0, 12.0, 0.1);
const tabBg = mk("", "width:420px;height:56px;border-radius:28px;background:#F2F0EC", gChart); at(tabBg, 0, -162);
// the knob must sit above the pill but below the labels: move knob group before tab labels
inner.appendChild(gKnob); inner.appendChild(gToast);
const gTabs = layer(8.5, 12.0, 0.1);
const tabLabels = ["Overview", "Revenue", "Users"].map(n => mk(n, "font-size:16px;font-weight:540;letter-spacing:-0.01em", gTabs));
const gChart2 = layer(10.0, 12.0, 0.14);
const kLabel = mk("Revenue · last 12 months", "font-size:14px;font-weight:450;color:#8C877F", gChart2); at(kLabel, -248, -114, 0, 0.5);
const kNum = mk(`$48.2k <span style="font-size:15px;font-weight:500;color:#8C877F;letter-spacing:0">+12.4%</span>`, "font-size:36px;font-weight:600;letter-spacing:-0.03em", gChart2); at(kNum, -250, -80, 0, 0.5);
const chip = mk("⌘K", "font-size:13px;font-weight:540;color:#6F6B66;width:46px;height:32px;border-radius:9px;box-shadow:inset 0 0 0 1px #E2DED8;display:flex;align-items:center;justify-content:center", gChart2); at(chip, 245, -162);
const pts = DATA.map((v, i) => [PX(i), PY(v)]);
const lineD = "M" + pts.map(p => p.join(" ")).join(" L");
const areaD = lineD + ` L${PX(11)} 150 L${PX(0)} 150 Z`;
const grid = [20, 30, 40, 50].map(v => `<line x1="-248" x2="248" y1="${PY(v)}" y2="${PY(v)}" stroke="#EFECE8" stroke-width="1"/>`).join("");
const chartSvg = mk(`<svg width="560" height="400" viewBox="-280 -200 560 400" style="overflow:visible">
  <defs><clipPath id="cp"><rect id="cpr" x="-260" y="-60" width="0" height="230"/></clipPath></defs>${grid}
  <line x1="-248" x2="248" y1="150" y2="150" stroke="#E2DED8" stroke-width="1"/>
  <g clip-path="url(#cp)"><path d="${areaD}" fill="rgba(255,90,31,.08)"/><path d="${lineD}" fill="none" stroke="#FF5A1F" stroke-width="3" stroke-linejoin="round" stroke-linecap="round"/></g>
  <circle id="head" r="4.5" fill="#FF5A1F"/>
  </svg>`, "", gChart2); at(chartSvg, 0, 0);
const cpr = $("#cpr"), head = $("#head");
[0, 2, 4, 6, 8, 10].forEach(i => { const m = mk(MON[i], "font-size:12px;font-weight:500;color:#A39E97", gChart2); at(m, PX(i), 174); });
const gTip = layer(10.92, 11.74, 0.02);
const guide = mk("", "width:0;border-left:1.5px dashed #D6D1CA", gTip);
const dot = mk("", "width:14px;height:14px;border-radius:50%;background:#fff;box-shadow:inset 0 0 0 3.5px #FF5A1F", gTip);
const tip = mk(`<span id="tm" style="color:#9A958E;font-weight:500"></span>&nbsp;&nbsp;<span id="tv"></span>`, "font-size:14px;font-weight:600;color:#fff;background:#111110;padding:8px 12px;border-radius:10px", gTip);
const tm = $("#tm"), tv = $("#tv");

/* palette */
const gPal = layer(12.0, 13.0, 0.1);
const sIcon = mk(icon("search", 20), "color:#8C877F", gPal); at(sIcon, -214, -118);
const ph = mk("Type a command…", "font-size:17px;font-weight:450;color:#A39E97", gPal); at(ph, -192, -118, 0, 0.5);
const typed = mk("", "font-size:17px;font-weight:500;color:#111110", gPal); at(typed, -192, -118, 0, 0.5);
const caret = mk("", "width:2px;height:22px;background:#FF5A1F;border-radius:1px", gPal);
const esc = mk("esc", "font-size:12px;font-weight:540;color:#8C877F;padding:3px 7px;border-radius:6px;box-shadow:inset 0 0 0 1px #E2DED8", gPal); at(esc, 222, -118, 1, 0.5);
const sep = mk("", "width:480px;height:1px;background:#EEEBE7", gPal); at(sep, 0, -90);
const rows = CMDS.map(([n, ic]) => mk(`<span style="color:#6F6B66;display:inline-flex;vertical-align:middle;margin-right:14px">${icon(ic, 19)}</span><span style="vertical-align:middle">${n}</span>`, "font-size:16px;font-weight:500;letter-spacing:-0.005em", gPal));
const enterK = mk("↵", "font-size:13px;font-weight:600;color:#6F6B66;width:26px;height:24px;border-radius:7px;background:#fff;box-shadow:inset 0 0 0 1px #DDD9D3;display:flex;align-items:center;justify-content:center", gPal);

/* ───────────────────────── seek(t): everything computed from time ───────────────────────── */
const f2 = x => x.toFixed(2);
function mmss(s) { s = Math.max(0, Math.round(s)); return Math.floor(s / 60) + ":" + String(s % 60).padStart(2, "0"); }
function seek(T) {
  const t = ((T % LOOP) + LOOP) % LOOP;
  // camera
  const s = Math.exp(CS.ev(t)), camY = CY.ev(t);
  world.style.transform = `translate(720px,720px) scale(${s}) translate(0px,${-camY}px)`;
  // shape
  const st = ST.ev(t);
  const w = W.ev(t) + st, h = H.ev(t) - 0.2 * st, scx = st / 2, scy = SY.ev(t);
  const r = Math.min(R.ev(t), w / 2, h / 2), el = clamp(EL.ev(t));
  const L = scx - w / 2, T0 = scy - h / 2;
  Object.assign(clip.style, {
    left: f2(L) + "px", top: f2(T0) + "px", width: f2(w) + "px", height: f2(h) + "px", borderRadius: f2(r) + "px",
    background: evCol(SC, t),
    boxShadow: `0 0 0 1px rgba(17,17,16,${(0.05 * el).toFixed(3)}), 0 1px 2px rgba(17,17,16,${(0.05 * el).toFixed(3)}), 0 10px 30px -6px rgba(17,17,16,${(0.10 * el + 0.10 * (1 - el)).toFixed(3)})`
  });
  inner.style.left = f2(-L) + "px"; inner.style.top = f2(-T0) + "px";
  // layers
  for (const ly of layers) {
    const o = lay(t, ly.tin, ly.tout, ly.dIn);
    ly.g.style.display = o < 0.003 ? "none" : "block";
    ly.g.style.opacity = o.toFixed(3);
    const b = (1 - o) * 7;
    ly.g.style.filter = b > 0.05 ? `blur(${b.toFixed(2)}px)` : "none";
  }
  // loader / check
  const fillA = 0.22 + 0.78 * step(t - 1.0, 12, 1);
  arc.setAttribute("stroke-dasharray", `${(fillA * ARC).toFixed(2)} ${ARC}`);
  arc.setAttribute("transform", `rotate(${(-90 + (t - 0.6) * 520 * (1 - 0.6 * step(t - 1.0, 8, 1))).toFixed(2)})`);
  chk.setAttribute("stroke-dasharray", `${CHK}`); chk.setAttribute("stroke-dashoffset", `${(CHK * (1 - step(t - 1.52, 20, 1))).toFixed(2)}`);
  // art + eq
  const as = AS.ev(t);
  at(art, AX.ev(t), AY.ev(t), 0.5, 0.5, `scale(${(as / 60).toFixed(4)})`); art.style.borderRadius = f2(AR.ev(t) * 60 / as) + "px";
  at(eq, EX.ev(t), EY.ev(t)); eq.style.color = evCol(EC, t);
  const pl = PLAY.ev(t);
  eqBars.forEach((b, i) => { const ph = [0, 0.5, 0.25, 0.75][i]; const e = Math.pow(0.5 + 0.5 * Math.cos(2 * Math.PI * (t / BEAT - ph)), 3); b.style.height = f2(4 + pl * 14 * e) + "px"; });
  // play ↔ pause morph
  const m = pl;
  const A = [[-4.5, -8], [2, -4.4], [2, 4.4], [-4.5, 8]], B = [[2, -4.4], [8.5, 0], [8.5, 0], [2, 4.4]];
  const C = [[-7, -8], [-2, -8], [-2, 8], [-7, 8]], D = [[2, -8], [7, -8], [7, 8], [2, 8]];
  const poly = (P, Q) => "M" + P.map((p, i) => `${f2(mix(p[0], Q[i][0], m))} ${f2(mix(p[1], Q[i][1], m))}`).join(" L") + "Z";
  pp.setAttribute("d", poly(A, C) + poly(B, D));
  const p = pAt(t);
  tLeft.textContent = mmss(p * 214); tRight.textContent = "-" + mmss((1 - p) * 214);
  // track
  const tl = TL.ev(t), tr = TR.ev(t) + st, ty = TY.ev(t), th = TH.ev(t);
  const kl = KL.ev(t), kr = KRt.ev(t), kt = KT.ev(t), kb = KB.ev(t), kc = (kl + kr) / 2;
  Object.assign(track.style, { left: f2(tl) + "px", top: f2(ty - th / 2) + "px", width: f2(Math.max(0, tr - tl)) + "px", height: f2(th) + "px", borderRadius: f2(th / 2) + "px" });
  Object.assign(fill.style, { left: f2(tl) + "px", top: f2(ty - th / 2) + "px", width: f2(clamp(kc - tl, 0, 1e4)) + "px", height: f2(th) + "px", borderRadius: f2(th / 2) + "px", background: evCol(FC, t) });
  const v = vAt(t);
  w1.style.opacity = clamp((v - 0.15) / 0.2); w2.style.opacity = clamp((v - 0.6) / 0.2);
  // knob
  const kh = kb - kt, kw = kr - kl, ksh = clamp(KSH.ev(t));
  Object.assign(knob.style, {
    left: f2(kl) + "px", top: f2(kt) + "px", width: f2(Math.max(0, kw)) + "px", height: f2(Math.max(0, kh)) + "px",
    borderRadius: f2(Math.min(KRAD.ev(t), kw / 2, kh / 2)) + "px", background: evCol(KC, t), opacity: clamp(KOP.ev(t)).toFixed(3),
    boxShadow: `0 1px 2px rgba(17,17,16,${(0.14 * ksh).toFixed(3)}), 0 3px 8px rgba(17,17,16,${(0.10 * ksh).toFixed(3)})`
  });
  // tabs: label color from overlap with the indicator
  const tyy = TABY.ev(t);
  tabLabels.forEach((el, i) => {
    const a = TABX[i] - 60, b = TABX[i] + 60, ov = clamp((Math.min(kr, b) - Math.max(kl, a)) / 120);
    const g = Math.round(mix(111, 255, ov)), gg = Math.round(mix(107, 255, ov)), bb = Math.round(mix(102, 255, ov));
    el.style.color = `rgb(${g},${gg},${bb})`; at(el, TABX[i], tyy);
  });
  // chart
  const d = DRAW.ev(t);
  cpr.setAttribute("width", f2(20 + 500 * d));
  const hx = -248 + 496 * clamp(d), hi = clamp((hx + 248) / (496 / 11), 0, 10.999), i0 = Math.floor(hi), fr = hi - i0;
  head.setAttribute("cx", f2(hx)); head.setAttribute("cy", f2(mix(pts[i0][1], pts[i0 + 1][1], fr)));
  head.setAttribute("opacity", f2(clamp(d * 20) * clamp((0.995 - d) * 60)));
  const dx = DOTX.ev(t), dy = DOTY.ev(t), txx = TIPX.ev(t), tyv = TIPY.ev(t), ii = idxAt(t);
  at(dot, dx, dy); at(guide, dx, (dy + 150) / 2); guide.style.height = f2(Math.max(0, 150 - dy)) + "px";
  tm.textContent = MON[ii]; tv.textContent = "$" + DATA[ii].toFixed(1) + "k"; at(tip, txx, tyv - 26, 0.5, 1);
  chip.style.transform = `translate(-50%,-50%) scale(${(1 - 0.08 * cpress.ev(t) * (t > 11.9 && t < 12.3 ? 1 : 0)).toFixed(3)})`;
  // palette
  let q = ""; for (const [kt2, qq] of KEYS) if (t >= kt2) q = qq;
  typed.textContent = q; ph.style.opacity = q ? 0 : 1;
  const tw = q ? typed.getBoundingClientRect().width / s / (stage.getBoundingClientRect().width / 1440) : 0;
  const lastKey = KEYS.reduce((a, [k]) => (t >= k ? k : a), 12.0);
  caret.style.opacity = ((t - lastKey) % 0.5 < 0.3) ? 1 : 0; at(caret, -191 + tw + 2, -118);
  rows.forEach((el, i) => { const o = clamp(ROP[i].ev(t)); el.style.opacity = o.toFixed(3); el.style.filter = o < 0.98 ? `blur(${((1 - o) * 6).toFixed(2)}px)` : "none"; at(el, -216, RY[i].ev(t), 0, 0.5); });
  const en = ENTER.ev(t);
  at(enterK, 208, ROWTOP, 0.5, 0.5, `scale(${(1 - 0.12 * en).toFixed(3)})`); enterK.style.background = `rgb(${Math.round(255 - 30 * en)},${Math.round(255 - 30 * en)},${Math.round(255 - 30 * en)})`;
  // cursor (screen space, projected from world)
  const X = cx.ev(t), Y = cy.ev(t), pr = clamp(cpress.ev(t), -0.2, 1.2);
  const sx = 720 + X * s, sy = 720 + (Y - camY) * s;
  cursor.style.transform = `translate(${f2(sx - 4.7)}px,${f2(sy - 4.2)}px) scale(${(1 - 0.14 * pr).toFixed(3)})`;
}

export { seek, LOOP };
