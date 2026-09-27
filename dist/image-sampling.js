// Keep display geometry and pixel sampling independent of analysis resolution.
export function imagePoint(bounds, clientX, clientY) {
  return {
    x: Math.max(0, Math.min(100, (clientX - bounds.left) / Math.max(1, bounds.width) * 100)),
    y: Math.max(0, Math.min(100, (clientY - bounds.top) / Math.max(1, bounds.height) * 100)),
  };
}

export function sampleImageColor(context, width, height, xPercent, yPercent) {
  const x = Math.max(0, Math.min(width - 1, Math.round(xPercent / 100 * (width - 1))));
  const y = Math.max(0, Math.min(height - 1, Math.round(yPercent / 100 * (height - 1))));
  const left = Math.max(0, x - 1), top = Math.max(0, y - 1);
  const pixels = context.getImageData(left, top, Math.min(width, x + 2) - left, Math.min(height, y + 2) - top).data;
  const sum = [0, 0, 0];
  let weight = 0;
  for (let i = 0; i < pixels.length; i += 4) {
    const alpha = pixels[i + 3] / 255;
    if (!alpha) continue;
    for (let channel = 0; channel < 3; channel++) sum[channel] += pixels[i + channel] * alpha;
    weight += alpha;
  }
  if (!weight) return null;
  return '#' + sum.map(value => Math.round(value / weight).toString(16).padStart(2, '0')).join('').toUpperCase();
}
