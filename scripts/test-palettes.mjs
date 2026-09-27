import test from 'node:test';
import assert from 'node:assert/strict';
import { existsSync } from 'node:fs';
import { palettes } from '../dist/palettes.js';
import { approvedPaletteIds, isApprovedPalette, reviewCandidates, homeStudies, homeStudyIds, homeCandidateFor } from '../dist/curation.js';
import { editorialNameKey, paletteNameLibrary } from '../dist/palette-name-library.js';
import { contrast } from '../dist/color.js';
import { retiredReviewPalettes } from '../dist/retired-review-palettes.js';

const hexPattern = /^#[0-9A-F]{6}$/;

test('the legacy archive retains 100 complete palettes for existing references', () => {
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
    assert.equal(palette.image, null, `${palette.name} is awaiting a handpicked image`);
    assert.equal(palette.credit, null, palette.name);
  });
});

test('nothing enters the public selection without explicit approval', () => {
  assert.deepEqual(approvedPaletteIds, []);
  assert.equal(palettes.filter(isApprovedPalette).length, 0);
});

test('review candidates are complete and separate from the approved catalog', () => {
  assert.equal(reviewCandidates.length, 8);
  for (const candidate of reviewCandidates) {
    assert.equal(isApprovedPalette(candidate), false);
    assert.ok(!palettes.some(palette => palette.id === candidate.id));
    assert.equal(candidate.colors.length, 5);
    candidate.colors.forEach(color => assert.match(color, hexPattern));
    assert.ok(contrast(candidate.colors[0], candidate.colors[4]) >= 4.5, `${candidate.name}: text on background`);
    assert.ok(existsSync(new URL(`../dist${candidate.image}`, import.meta.url)));
    assert.equal(candidate.credit.kind, 'ai');
    assert.equal(candidate.credit.origin, 'owner-supplied');
    assert.equal(candidate.paletteStatus, 'proposed');
    assert.equal(candidate.sourcePaletteId, null);
    assert.match(candidate.imageAlt, /AI concept/);
  }
});

test('Explore keeps one Katre representative and the new Lorien care study without deleting experiments', () => {
  assert.equal(homeStudies.length, 4);
  assert.equal(new Set(homeStudyIds).size, homeStudyIds.length);
  assert.deepEqual(homeStudies.map(study => study.id), [...homeStudyIds]);
  assert.deepEqual(homeStudies.filter(study => study.family === 'Katre').map(study => study.id), ['concept-katre-room']);
  assert.equal(homeStudies.filter(study => study.family === 'Lorien').length, 2);
  assert.equal(reviewCandidates.filter(study => study.family === 'Katre').length, 5);
  for (const host of ['localhost', 'colorverse.byigit.dev']) {
    for (const study of reviewCandidates) {
      assert.equal(homeCandidateFor(study.id, reviewCandidates, host), homeStudyIds.includes(study.id) ? study : undefined);
    }
  }
  const care = homeStudies.find(study => study.id === 'concept-lorien-care');
  assert.equal(care.name, 'Clay Veil');
  assert.ok(care.tags.includes('brand'));
  assert.ok(care.tags.includes('packaging'));
  assert.notDeepEqual(care.colors, reviewCandidates.find(study => study.id === 'concept-lorien').colors);
  assert.ok(Object.isFrozen(homeStudies));
});

test('editorial names are short, ASCII, unique, and joined by stable palette ID', () => {
  const ids = [...reviewCandidates, ...retiredReviewPalettes].map(candidate => candidate.id);
  assert.deepEqual(Object.keys(paletteNameLibrary).sort(), [...ids].sort());
  const keys = new Set();
  for (const candidate of reviewCandidates) {
    const record = paletteNameLibrary[candidate.id];
    assert.equal(record.status, 'proposed');
    assert.equal(candidate.name, record.label);
    assert.match(record.label, /^[A-Za-z]+(?: [A-Za-z]+)?$/);
    assert.ok(record.label.length <= 18, record.label);
    assert.ok(record.aliases.length > 0, record.label);
    const key = editorialNameKey(record.label);
    assert.ok(!keys.has(key), key);
    assert.ok(!palettes.some(palette => editorialNameKey(palette.name) === key), key);
    keys.add(key);
  }
});

test('palette identifiers and names are unique', () => {
  assert.equal(new Set(palettes.map(palette => palette.id)).size, palettes.length);
  assert.equal(new Set(palettes.map(palette => palette.name)).size, palettes.length);
});

test('the collection has no retired visual sources', () => {
  palettes.forEach(palette => {
    assert.equal(palette.image, null, palette.name);
    assert.equal(palette.source, null, palette.name);
  });
});

test('the first ColorVerse Edition is an applied packaging system', () => {
  const edition = palettes.find(palette => palette.id === 'skincare-system-01');
  assert.ok(edition);
  assert.deepEqual(edition.colors, ['#E9E3D8', '#9B9F83', '#B66F56', '#AAA2AC', '#252B2F']);
  assert.equal(edition.name, 'Soft Structure');
  assert.equal(edition.seriesCode, 'CV / SS');
  assert.equal(edition.category, 'Care objects');
  assert.equal(edition.image, null);
});
