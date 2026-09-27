import test from 'node:test';
import assert from 'node:assert/strict';
import { createDenseSphere } from '../dist/home-test/dense-sphere.js';

for (const frequency of [1,8,9]) {
  test(`frequency ${frequency}: only hexagons and twelve pentagons`, () => {
    const cells = createDenseSphere(frequency);
    assert.equal(cells.length,10 * frequency ** 2 + 2);
    assert.equal(cells.filter(cell => cell.corners.length === 5).length,12);
    assert.equal(cells.filter(cell => cell.corners.length === 6).length,cells.length-12);
    assert.ok(cells.every(cell => cell.corners.every(point => point.every(Number.isFinite))));
    const edges = new Map();
    const key = point => point.map(value => Math.round(value*1e9)).join(':');
    for (const cell of cells) {
      cell.corners.forEach((point,index) => {
        const edge = [key(point),key(cell.corners[(index+1)%cell.corners.length])].sort().join('|');
        edges.set(edge,(edges.get(edge)||0)+1);
      });
    }
    assert.ok([...edges.values()].every(count => count === 2),'Every edge joins exactly two cells');
  });
}
