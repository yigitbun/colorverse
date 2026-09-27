import { textOn } from './color.js';
const parts = { backdrop: 0, bottle: 2, cap: 4, label: 1, carton: 1 };
export function sanitizeColorway(value) {
  if (!value || !Array.isArray(value.colors) || value.colors.length !== 5 || !value.colors.every(color => /^#[0-9a-f]{6}$/i.test(color))) return null;
  return { colors: value.colors.map(color => color.toUpperCase()), assignment: Object.fromEntries(Object.entries(parts).map(([part, fallback]) => [part, Number.isInteger(value.assignment?.[part]) && value.assignment[part] >= 0 && value.assignment[part] < 5 ? value.assignment[part] : fallback])) };
}
export function freezeColorway(value) {
  const clean = sanitizeColorway(value);
  return clean ? Object.freeze({ colors: Object.freeze(clean.colors), assignment: Object.freeze(clean.assignment) }) : null;
}
const escapeXML = value => String(value).replace(/[&<>"']/g, char => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&apos;' }[char]));
export function colorwaySVG(value, name = 'ColorwayKit') {
  const snapshot = sanitizeColorway(value);
  if (!snapshot) throw new Error('A valid five-color colorway is required.');
  const color = part => snapshot.colors[snapshot.assignment[part]], labelInk = textOn(color('label')), boxInk = textOn(color('carton'));
  return `<svg xmlns="http://www.w3.org/2000/svg" width="1600" height="1100" viewBox="0 0 1600 1100"><defs><linearGradient id="body"><stop stop-color="#000" stop-opacity=".16"/><stop offset=".28" stop-color="#fff" stop-opacity=".10"/><stop offset=".6" stop-color="#fff" stop-opacity=".18"/><stop offset="1" stop-color="#000" stop-opacity=".14"/></linearGradient><filter id="shadow"><feGaussianBlur stdDeviation="18"/></filter></defs><rect width="1600" height="1100" fill="${color('backdrop')}"/><path d="M0 830L1600 750V1100H0Z" fill="#000" opacity=".04"/><text x="60" y="76" font-family="sans-serif" font-size="28" fill="${textOn(color('backdrop'))}">${escapeXML(String(name).slice(0, 80))}</text><ellipse cx="900" cy="875" rx="275" ry="38" fill="#000" opacity=".2" filter="url(#shadow)"/><rect x="865" y="300" width="270" height="570" rx="8" fill="${color('carton')}"/><path d="M1110 300H1135V870H1110Z" fill="#000" opacity=".10"/><text x="910" y="450" font-family="sans-serif" font-size="24" letter-spacing="5" fill="${boxInk}">CV / CARE</text><text x="910" y="530" font-family="sans-serif" font-size="36" fill="${boxInk}">Daily</text><text x="910" y="570" font-family="sans-serif" font-size="36" fill="${boxInk}">Balance</text><rect x="610" y="310" width="150" height="65" fill="${color('cap')}"/><rect x="584" y="224" width="202" height="100" rx="14" fill="${color('cap')}"/><rect x="548" y="370" width="276" height="500" rx="48" fill="${color('bottle')}"/><rect x="548" y="370" width="276" height="500" rx="48" fill="url(#body)"/><rect x="573" y="480" width="225" height="246" fill="${color('label')}"/><text x="685" y="532" text-anchor="middle" font-family="sans-serif" font-size="17" letter-spacing="3" fill="${labelInk}">CV / CARE</text><text x="685" y="593" text-anchor="middle" font-family="sans-serif" font-size="40" fill="${labelInk}">Daily</text><text x="685" y="638" text-anchor="middle" font-family="sans-serif" font-size="40" fill="${labelInk}">Balance</text><text x="685" y="693" text-anchor="middle" font-family="sans-serif" font-size="13" fill="${labelInk}">SKINCARE · 100 ML</text>${snapshot.colors.map((hex, index) => `<rect x="${60 + index * 134}" y="950" width="125" height="52" rx="5" fill="${hex}"/><text x="${60 + index * 134}" y="1030" font-family="monospace" font-size="18" fill="${textOn(color('backdrop'))}">${hex}</text>`).join('')}<text x="1540" y="1030" text-anchor="end" font-family="sans-serif" font-size="16" fill="${textOn(color('backdrop'))}">ColorwayKit · concept, not a physical color proof</text></svg>`;
}
export async function downloadColorway(value, name) {
  const url = URL.createObjectURL(new Blob([colorwaySVG(value, name)], { type: 'image/svg+xml' }));
  try {
    const image = new Image(); image.src = url; await image.decode();
    const canvas = document.createElement('canvas'); canvas.width = 1600; canvas.height = 1100;
    canvas.getContext('2d').drawImage(image, 0, 0);
    const blob = await new Promise(resolve => canvas.toBlob(resolve, 'image/png'));
    if (!blob) throw new Error('Could not export this colorway.');
    const downloadURL = URL.createObjectURL(blob), link = document.createElement('a');
    link.href = downloadURL; link.download = 'colorverse-colorway.png'; document.body.append(link); link.click(); link.remove();
    setTimeout(() => URL.revokeObjectURL(downloadURL), 1000);
  } finally { URL.revokeObjectURL(url); }
}
