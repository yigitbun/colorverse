import assert from 'node:assert/strict';
import test from 'node:test';
import { colorAlternatives, colorCoordinates, paletteAlternatives, quickColorAdjustments, INDISTINGUISHABLE, NEUTRAL_CHROMA } from '../dist/color-alternatives.js';
import { contrast, oklabDistance } from '../dist/color.js';

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
