import assert from 'node:assert/strict';
import test from 'node:test';
import { colorAlternatives, colorCoordinates, NEUTRAL_CHROMA } from '../dist/color-alternatives.js';

const neutrals = ['#F7F6F2', '#DFE0DC', '#A9AAA7', '#808080', '#6E7374', '#252B2F', '#E8E1D5', '#8A927C', '#FFFFFF', '#000000'];
const colors = ['#E85D75', '#2F6FDE', '#B68B70', '#F2C14E', '#3D7A5A'];

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
