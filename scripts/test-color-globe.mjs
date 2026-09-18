import assert from 'node:assert/strict';
import test from 'node:test';
import { toHsl, fromHsl, globePoint } from '../dist/color-globe.js';

test('HEX colors survive conversion without changing an existing palette color', () => {
  for (let r = 0; r <= 255; r += 17) {
    for (let g = 0; g <= 255; g += 17) {
      for (let b = 0; b <= 255; b += 17) {
        const hex = '#' + [r, g, b].map(value => value.toString(16).padStart(2, '0')).join('').toUpperCase();
        assert.equal(fromHsl(toHsl(hex)), hex);
      }
    }
  }
});

test('the picker reaches saturated primaries, secondaries, black, white, and neutrals', () => {
  for (const [h, hex] of [[0, '#FF0000'], [60, '#FFFF00'], [120, '#00FF00'], [180, '#00FFFF'], [240, '#0000FF'], [300, '#FF00FF'], [360, '#FF0000']]) {
    assert.equal(fromHsl({ h, s: 1, l: .5 }), hex);
    assert.equal(fromHsl({ h, s: 1, l: 0 }), '#000000');
    assert.equal(fromHsl({ h, s: 1, l: 1 }), '#FFFFFF');
    assert.equal(fromHsl({ h, s: 0, l: .5 }), '#808080');
  }
  assert.equal(toHsl('#808080', 240).h, 240, 'a neutral color preserves the last chosen hue');
});

test('the marker maps hue and lightness to the globe without losing either coordinate', () => {
  for (let h = 0; h < 360; h += 15) {
    for (let l = 0; l <= 1; l += .125) {
      const [x, y, z] = globePoint({ h, l });
      assert(Math.abs(Math.hypot(x, y, z) - 1) < 1e-10);
      assert(Math.abs((y + 1) / 2 - l) < 1e-10);
      if (l > 0 && l < 1) {
        const recoveredHue = (Math.atan2(x, z) * 180 / Math.PI + 360) % 360;
        assert(Math.abs(recoveredHue - h) < 1e-10);
      }
    }
  }
});
