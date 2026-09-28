import assert from 'node:assert/strict';
import test from 'node:test';
import { colorAlternatives, colorCoordinates, quickColorAdjustments, NEUTRAL_CHROMA } from '../dist/color-alternatives.js';

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
