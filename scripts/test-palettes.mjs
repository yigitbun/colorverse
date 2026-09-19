import test from 'node:test';
import assert from 'node:assert/strict';
import { palettes } from '../dist/palettes.js';

const hexPattern = /^#[0-9A-F]{6}$/;

test('the public library contains 100 complete palettes', () => {
  assert.equal(palettes.length, 100);
  palettes.forEach(palette => {
    assert.ok(palette.id);
    assert.ok(palette.name);
    assert.ok(palette.description.length >= 24, palette.name);
    assert.equal(palette.colors.length, 5, palette.name);
    palette.colors.forEach(color => assert.match(color, hexPattern, `${palette.name}: ${color}`));
    assert.ok(palette.category);
    assert.ok(palette.tags.length >= 3, palette.name);
    assert.ok(palette.useCases.length >= 3, palette.name);
    assert.ok(palette.image, palette.name);
    assert.match(palette.credit, /^Unsplash/, palette.name);
  });
});

test('palette identifiers and names are unique', () => {
  assert.equal(new Set(palettes.map(palette => palette.id)).size, palettes.length);
  assert.equal(new Set(palettes.map(palette => palette.name)).size, palettes.length);
});

test('the complete collection uses documented local visual sources', () => {
  palettes.forEach(palette => {
    assert.match(palette.image, /^\/assets\/palette-library\/.+\.jpg$/, palette.name);
    assert.match(palette.source, /^https:\/\/(?:images\.)?unsplash\.com\//, palette.name);
  });
});
