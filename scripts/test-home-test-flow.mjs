import test from 'node:test';
import assert from 'node:assert/strict';
import { applyPaletteStep, suggestRemaining, rankPaletteReferences } from '../dist/home-test/palette-flow.js';
import { reviewCandidates } from '../dist/curation.js';

test('apply advances, updates suggestions and preserves every confirmed choice', () => {
  let colors = ['#F7F6F2','#DFE0DC','#A9AAA7','#6E7374','#252B2F'];
  let confirmed = new Set();
  const picked = ['#E38B18','#216A80','#AA44BB','#DEE5CA','#212121'];
  for (let index=0; index<5; index++) {
    const previous = [...colors];
    const step = applyPaletteStep(colors,confirmed,index,picked[index]);
    colors=step.colors; confirmed=step.confirmed;
    assert.equal(step.nextIndex,Math.min(index+1,4));
    assert.equal(confirmed.size,index+1);
    for(let i=0;i<=index;i++) assert.equal(colors[i],picked[i]);
    assert.ok(colors.every(color=>/^#[0-9A-F]{6}$/i.test(color)));
    if(index===0) assert.notDeepEqual(colors.slice(1),previous.slice(1));
    const applied = [...previous]; applied[index] = picked[index];
    assert.deepEqual(colors,suggestRemaining(applied,confirmed));
  }
  const revised = applyPaletteStep(colors,confirmed,1,'#F04444');
  assert.equal(revised.colors[1],'#F04444');
  for(const i of [0,2,3,4]) assert.equal(revised.colors[i],picked[i]);
});

test('accepting an unchanged suggestion still counts as a choice', () => {
  const colors=['#112233','#445566','#778899','#AABBCC','#DDEEFF'];
  const step=applyPaletteStep(colors,new Set(),0,colors[0]);
  assert.ok(step.confirmed.has(0)); assert.equal(step.nextIndex,1);
});

test('suggestions use exact existing reference colors, not generated shades', () => {
  const source=reviewCandidates[0];
  const colors=[source.colors[1],'#DFE0DC','#A9AAA7','#6E7374','#252B2F'];
  const confirmed=new Set([0]);
  const best=rankPaletteReferences(colors,confirmed)[0];
  assert.equal(best.palette.id,source.id);
  assert.equal(best.score,0);
  const proposed=suggestRemaining(colors,confirmed);
  assert.equal(proposed[0],colors[0]);
  assert.ok(proposed.slice(1).every(color=>source.colors.includes(color)));
  assert.equal(new Set(best.assignment).size,confirmed.size);
});

test('matching several selected colors uses distinct source swatches', () => {
  const colors=['#E0A76E','#E0A76E','#A9AAA7','#6E7374','#252B2F'];
  for(const match of rankPaletteReferences(colors,new Set([0,1]))) assert.equal(new Set(match.assignment).size,2);
});
