import assert from 'node:assert/strict';
import test from 'node:test';
import { colorAlternatives, colorCoordinates, paletteAlternatives, quickColorAdjustments, INDISTINGUISHABLE, NEUTRAL_CHROMA } from '../dist/color-alternatives.js';
import { contrast, oklab, oklabDistance, extractPaletteVariants } from '../dist/color.js';

const neutrals = ['#F7F6F2', '#DFE0DC', '#A9AAA7', '#808080', '#6E7374', '#252B2F', '#E8E1D5', '#8A927C', '#FFFFFF', '#000000'];
const colors = ['#E85D75', '#2F6FDE', '#B68B70', '#F2C14E', '#3D7A5A'];

test('one-click edits are bounded and honest, including black, white and neutral limits', () => {
  assert.deepEqual(quickColorAdjustments('invalid'), []);
  for (const hex of [...neutrals, ...colors]) {
    const actions = quickColorAdjustments(hex), source = colorCoordinates(hex);
    assert.deepEqual(actions.map(action => action.id), ['lighter', 'darker', 'softer', 'richer']);
    assert.deepEqual(quickColorAdjustments(hex.toLowerCase()), actions);
    for (const action of actions) assert.match(action.color, /^#[0-9A-F]{6}$/);
    if (!actions[0].disabled) assert.ok(colorCoordinates(actions[0].color).lightness >= source.lightness - .003);
    if (!actions[1].disabled) assert.ok(colorCoordinates(actions[1].color).lightness <= source.lightness + .003);
    if (!actions[2].disabled) assert.ok(colorCoordinates(actions[2].color).chroma <= source.chroma + .003);
  }
  assert.equal(quickColorAdjustments('#FFFFFF')[0].disabled, true);
  assert.equal(quickColorAdjustments('#000000')[1].disabled, true);
  for (const hex of ['#808080', '#FFFFFF', '#000000']) {
    assert.equal(quickColorAdjustments(hex)[2].disabled, true);
    assert.equal(quickColorAdjustments(hex)[3].disabled, true);
  }
});

test('alternatives are deterministic, valid, unique, and exclude the selected color', () => {
  for (const hex of [...neutrals, ...colors]) {
    const first = colorAlternatives(hex);
    assert.deepEqual(colorAlternatives(hex.toLowerCase()), first);
    assert.ok(first.length >= 4 && first.length <= 8, `${hex} gives ${first.length} alternatives`);
    assert.equal(new Set(first).size, first.length);
    assert.ok(!first.includes(hex.toUpperCase()));
    for (const value of first) assert.match(value, /^#[0-9A-F]{6}$/);
  }
  assert.deepEqual(colorAlternatives('not-a-color'), []);
});

test('near-neutral colors stay neutral and close in lightness', () => {
  for (const hex of neutrals) {
    const source = colorCoordinates(hex);
    assert.ok(source.chroma < NEUTRAL_CHROMA, `${hex} is treated as a neutral`);
    for (const value of colorAlternatives(hex)) {
      const next = colorCoordinates(value);
      assert.ok(next.chroma < NEUTRAL_CHROMA, `${hex} → ${value} keeps neutral chroma (${next.chroma.toFixed(3)})`);
      assert.ok(Math.abs(next.lightness - source.lightness) <= .09, `${hex} → ${value} keeps lightness`);
    }
  }
});

test('chromatic colors keep lightness and never gain intensity', () => {
  for (const hex of colors) {
    const source = colorCoordinates(hex);
    for (const value of colorAlternatives(hex)) {
      const next = colorCoordinates(value);
      assert.ok(next.chroma <= source.chroma + .012, `${hex} → ${value} does not jump in intensity`);
      assert.ok(Math.abs(next.lightness - source.lightness) <= .07, `${hex} → ${value} keeps lightness`);
    }
  }
});

// Realistic authored palettes; each case selects one member to replace.
const palettes = {
  pair: ['#E85D75', '#2F6FDE'],
  five: ['#F7F6F2', '#E8E1D5', '#2F6FDE', '#E85D75', '#252B2F'],
  ten: ['#F7F6F2', '#DFE0DC', '#2F6FDE', '#E85D75', '#252B2F', '#F2C14E', '#3D7A5A', '#B68B70', '#8A927C', '#6E7374'],
};
const cases = Object.entries(palettes).flatMap(([name, members]) => members.map((hex, index) => ({ name, members, hex, index })));

test('palette-aware alternatives stay distinct from the other authored colors and keep their separations', () => {
  for (const { name, members, hex, index } of cases) {
    const result = paletteAlternatives(hex, members, index);
    const others = members.filter((_, position) => position !== index);
    assert.deepEqual(paletteAlternatives(hex.toLowerCase(), members.map(value => value.toLowerCase()), index), result, `${name} ${hex} is deterministic`);
    assert.ok(result.length <= 8);
    assert.equal(new Set(result).size, result.length);
    assert.ok(!result.includes(hex));
    const source = colorCoordinates(hex);
    for (const value of result) {
      assert.match(value, /^#[0-9A-F]{6}$/);
      const next = colorCoordinates(value);
      assert.ok(Math.abs(next.lightness - source.lightness) <= .09, `${name} ${hex} → ${value} stays nearby`);
      if (source.chroma < NEUTRAL_CHROMA) assert.ok(next.chroma < NEUTRAL_CHROMA, `${name} ${hex} → ${value} stays neutral`);
      else assert.ok(next.chroma <= source.chroma + .012, `${name} ${hex} → ${value} does not gain intensity`);
      for (const other of others) {
        assert.ok(oklabDistance(value, other) >= INDISTINGUISHABLE, `${name} ${hex} → ${value} is distinct from ${other}`);
        for (const level of [4.5, 3]) {
          if (contrast(hex, other) >= level) assert.ok(contrast(value, other) >= level, `${name} ${hex} → ${value} keeps ${level}:1 with ${other}`);
        }
      }
    }
  }
});

test('palette-aware alternatives drop near-duplicates and fall back honestly', () => {
  // A nearby candidate that is already another member is never offered.
  const [taken] = colorAlternatives('#E85D75');
  assert.ok(!paletteAlternatives('#E85D75', ['#E85D75', taken], 0).includes(taken));
  // Without other authored colors there is nothing to check against.
  assert.deepEqual(paletteAlternatives('#E85D75', ['#E85D75'], 0), colorAlternatives('#E85D75'));
  assert.deepEqual(paletteAlternatives('#E85D75'), colorAlternatives('#E85D75'));
  assert.deepEqual(paletteAlternatives('not-a-color', palettes.five, 0), []);
  // Invalid entries are ignored and a missing index falls back to the matching member.
  assert.deepEqual(paletteAlternatives('#2F6FDE', [...palettes.five, 'oops', null], 2), paletteAlternatives('#2F6FDE', palettes.five, 2));
  assert.deepEqual(paletteAlternatives('#2F6FDE', palettes.five, 99), paletteAlternatives('#2F6FDE', palettes.five, 2));
  // Two near-identical greys: whatever is offered still reads as a different swatch.
  for (const value of paletteAlternatives('#808080', ['#808080', '#838383'], 0)) assert.ok(oklabDistance(value, '#838383') >= INDISTINGUISHABLE);
  // Realistic palettes still get suggestions for their main colors.
  for (const index of [0, 2, 3]) assert.ok(paletteAlternatives(palettes.five[index], palettes.five, index).length >= 1, `five-color member ${index}`);
});

// Deterministic synthetic image pixels (RGBA) for the three image readings.
function image(width, height, colorAt) {
  const pixels = new Uint8ClampedArray(width * height * 4);
  let seed = 7;
  const jitter = amount => { seed = (seed * 1103515245 + 12345) % 2147483648; return Math.round((seed / 2147483648 - .5) * 2 * amount); };
  for (let y = 0; y < height; y++) for (let x = 0; x < width; x++) {
    const [hex, amount = 0, alpha = 255] = colorAt(x, y), shift = jitter(amount);
    pixels.set([...hex.match(/\w\w/g).map(v => parseInt(v, 16) + shift + jitter(amount / 2)), alpha], (y * width + x) * 4);
  }
  return pixels;
}
// A pale sales dashboard: a large, slightly noisy near-white/grey page with
// navy headings, blue and light-blue charts, and small green/coral/rose/purple bars.
const dashboardAccents = ['#1C3A5E', '#3E71AE', '#BBD0EA', '#4D8B6B', '#E9956B', '#C45E6E', '#B28BC4'];
const dashboard = image(180, 120, (x, y) => {
  if (y < 12 && x > 20 && x < 90) return ['#1C3A5E', 3];
  if (y > 30 && y < 70 && x > 20 && x < 110 && x % 9 < 5) return y > 44 ? ['#BBD0EA', 3] : ['#3E71AE', 3];
  if (y > 30 && y < 70 && x > 125 && x < 160) return (x + y) % 3 ? ['#3E71AE', 3] : ['#1C3A5E', 3];
  if (y > 82 && y < 88 && x > 30 && x < 90) return ['#4D8B6B', 3];
  if (y > 90 && y < 96 && x > 30 && x < 80) return ['#E9956B', 3];
  if (y > 98 && y < 102 && x > 30 && x < 70) return ['#C45E6E', 3];
  if (y > 104 && y < 107 && x > 30 && x < 60) return ['#B28BC4', 3];
  if (y > 110 && x > 120) return ['#8A9099', 4];
  if (x < 18) return ['#F1F3F6', 6];
  if (y % 40 === 25 || x % 60 === 55) return ['#E2E6EB', 6];
  return ['#FAFBFC', 7];
});
const chroma = hex => Math.hypot(...oklab(hex).slice(1));
const nearestSource = hex => Math.min(...dashboardAccents.map(source => oklabDistance(hex, source)));

test('image readings are valid, unique, deterministic and labeled by origin', () => {
  const result = extractPaletteVariants(dashboard);
  assert.deepEqual(extractPaletteVariants(dashboard), result);
  assert.ok(result.sampled >= 5 && result.sampled <= 8);
  assert.deepEqual(result.variants.map(variant => variant.key), ['observed', 'focused', 'applied']);
  for (const variant of result.variants) {
    assert.equal(variant.colors.length, 5);
    assert.equal(new Set(variant.colors).size, 5, `${variant.key} has duplicate colors`);
    for (const value of variant.colors) assert.match(value, /^#[0-9A-F]{6}$/);
    assert.equal(variant.origins.length, 5);
    assert.ok(variant.name && variant.detail && variant.description);
  }
  const [observed, focused, applied] = result.variants.map(variant => variant.colors);
  for (const [a, b] of [[observed, focused], [focused, applied], [observed, applied]]) assert.ok(a.filter(value => !b.includes(value)).length >= 2, `${a} vs ${b}`);
});

test('Observed keeps colored regions of a pale dashboard instead of five near-neutrals', () => {
  const { colors, description } = extractPaletteVariants(dashboard).variants[0];
  assert.ok(colors.filter(value => chroma(value) < .04).length <= 2, `${colors} has too many neutrals`);
  assert.ok(colors.some(value => chroma(value) < .04 && oklab(value)[0] > .95), 'the dominant pale page is still observed');
  assert.ok(colors.filter(value => nearestSource(value) < .05).length >= 3, `${colors} misses the large chart colors`);
  assert.match(description, /neutral area condensed/);
  // A colorful scene with a small grey detail does not spend a slot on it.
  const scene = image(120, 90, (x, y) => [y < 40 ? '#6FA8DC' : y < 70 ? (x < 60 ? '#4F8A3C' : '#8FB85A') : x === 5 && y < 80 ? '#7A7A7A' : '#D9B77E', 6]);
  const photo = extractPaletteVariants(scene).variants[0];
  assert.ok(photo.colors.every(value => chroma(value) >= .04), `${photo.colors} shows a tiny neutral`);
  assert.doesNotMatch(photo.description, /condensed/);
});

test('Focused shows distinct sampled accents; Applied is a labeled working system', () => {
  const [, focused, applied] = extractPaletteVariants(dashboard).variants;
  assert.ok(focused.origins.every(origin => origin === 'sampled'), 'no adjusted tone poses as a sample');
  assert.ok(focused.colors.every(value => chroma(value) >= .04 && nearestSource(value) < .05), `${focused.colors} are source accents`);
  for (const accent of ['#4D8B6B', '#E9956B']) assert.ok(focused.colors.some(value => oklabDistance(value, accent) < .05), `Focused misses ${accent}`);
  const [background, surface, primary, accent, text] = applied.colors;
  assert.ok(oklab(background)[0] > .93 && chroma(background) < .03, 'quiet background');
  assert.ok(oklab(surface)[0] > .82 && chroma(surface) < .06, 'quiet surface');
  assert.ok(contrast(text, background) >= 7 && contrast(text, surface) >= 4.5, 'readable ink');
  for (const value of [primary, accent]) assert.ok(chroma(value) >= .04 && nearestSource(value) < .05, `${value} is a source accent`);
  assert.ok(oklabDistance(primary, accent) > .15);
  assert.match(applied.description, /^A derived working system/);
  const roleNames = ['background', 'surface', 'primary', 'accent', 'text'];
  applied.origins.forEach((origin, index) => {
    assert.match(applied.description, new RegExp(`${origin === 'sampled' ? 'Sampled' : 'Derived'}: [a-z, ]*${roleNames[index]}`));
  });
});

test('a monochrome image stays neutral in every reading', () => {
  const grey = image(120, 90, x => [['#F4F4F4', '#D0D0D0', '#9A9A9A', '#5E5E5E', '#1E1E1E'][Math.floor(x / 24)], 5]);
  const { variants } = extractPaletteVariants(grey);
  for (const variant of variants) {
    for (const value of variant.colors) assert.ok(chroma(value) < .012, `${variant.key} invents a hue: ${value}`);
    assert.equal(new Set(variant.colors).size, 5);
  }
  assert.match(variants[1].description, /no accent is invented/);
  assert.ok(contrast(variants[2].colors[4], variants[2].colors[0]) >= 7);
  // Two tones only: support tones are neutral and openly called derived.
  for (const variant of extractPaletteVariants(image(40, 40, x => [x < 30 ? '#FFFFFF' : '#000000'])).variants) {
    for (const value of variant.colors) assert.ok(chroma(value) < .012, `${variant.key} invents a hue: ${value}`);
    assert.equal(new Set(variant.colors).size, 5);
    assert.equal(variant.origins.filter(origin => origin === 'derived').length, 3);
    assert.match(variant.description, variant.key === 'applied' ? /Derived: / : /3 supporting tones are derived/);
  }
});

test('transparent pixels are ignored and a fully transparent image is refused', () => {
  const cutout = image(60, 60, (x, y) => x < 30 ? ['#E0303A', 0, 0] : [y < 30 ? '#6A6A6A' : '#C8C8C8', 3]);
  for (const variant of extractPaletteVariants(cutout).variants) for (const value of variant.colors) assert.ok(chroma(value) < .012, `${variant.key} shows hidden red ${value}`);
  assert.throws(() => extractPaletteVariants(image(20, 20, () => ['#E0303A', 0, 0])), /no visible pixels/);
});

test('extraction stays fast on a noisy full-size sample', () => {
  const hex = value => (value % 256).toString(16).padStart(2, '0');
  const noise = image(180, 180, (x, y) => [`#${hex(x * 131 + y * 71)}${hex(x * 37 + y * 193)}${hex(x * y)}`, 20]);
  const start = performance.now();
  const result = extractPaletteVariants(noise);
  const elapsed = performance.now() - start;
  assert.ok(elapsed < 1500, `took ${elapsed}ms`);
  for (const variant of result.variants) assert.equal(new Set(variant.colors).size, 5);
});
