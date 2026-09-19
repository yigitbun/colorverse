import assert from 'node:assert/strict';
import test from 'node:test';
import { isAtlasInteractionPoint } from '../dist/globe.js';

test('the atlas captures only points inside its visible circular ring', () => {
  assert.equal(isAtlasInteractionPoint(390, 400, 1, 195, 200), true);
  assert.equal(isAtlasInteractionPoint(390, 400, 1, 195, 22), true);
  assert.equal(isAtlasInteractionPoint(390, 400, 1, 12, 12), false);
  assert.equal(isAtlasInteractionPoint(390, 400, 1, 378, 388), false);
});

test('the interaction radius follows zoom without becoming rectangular', () => {
  assert.equal(isAtlasInteractionPoint(400, 400, .85, 360, 200), false);
  assert.equal(isAtlasInteractionPoint(400, 400, 1.3, 360, 200), true);
  assert.equal(isAtlasInteractionPoint(400, 400, 1.3, 395, 395), false);
});
