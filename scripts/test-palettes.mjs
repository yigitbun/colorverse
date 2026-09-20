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
    assert.match(palette.credit, /^(?:Unsplash|ColorVerse Editions)/, palette.name);
  });
});

test('palette identifiers and names are unique', () => {
  assert.equal(new Set(palettes.map(palette => palette.id)).size, palettes.length);
  assert.equal(new Set(palettes.map(palette => palette.name)).size, palettes.length);
});

test('the complete collection uses documented local visual sources', () => {
  palettes.forEach(palette => {
    assert.match(palette.image, /^\/assets\/(?:palette-library|editions)\/.+\.jpg$/, palette.name);
    assert.match(palette.source, /^https:\/\/(?:(?:images\.)?unsplash\.com\/|colorverse\.byigit\.dev\/editions\/)/, palette.name);
  });
});

test('the first ColorVerse Edition is an applied packaging system', () => {
  const edition = palettes.find(palette => palette.id === 'skincare-system-01');
  assert.ok(edition);
  assert.deepEqual(edition.colors, ['#E9E3D8', '#9B9F83', '#B66F56', '#AAA2AC', '#252B2F']);
  assert.equal(edition.name, 'Soft Structure');
  assert.equal(edition.seriesCode, 'CV / SS');
  assert.equal(edition.category, 'Care objects');
  assert.match(edition.credit, /^ColorVerse Editions/);
});
