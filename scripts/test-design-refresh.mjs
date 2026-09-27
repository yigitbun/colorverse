import test from 'node:test';
import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import { imagePoint, sampleImageColor } from '../dist/image-sampling.js';
import { createLibraryEngine, paletteDistance } from '../dist/library-engine.js';
import { cleanDiscussion } from '../dist/community-feed.js';
import { freezeColorway, sanitizeColorway, colorwaySVG } from '../dist/colorway-kit.js';

const colors = ['#F2ECE4', '#D7C7B1', '#8F9A88', '#A87956', '#31362F'];
test('image coordinates use contained-image bounds and clamp outside points', () => {
  const bounds = { left: 100, top: 50, width: 200, height: 400 };
  assert.deepEqual(imagePoint(bounds, 200, 250), { x: 50, y: 50 });
  assert.deepEqual(imagePoint(bounds, 0, 999), { x: 0, y: 100 });
});
test('manual sampling reads original pixel coordinates, weights alpha, ignores transparent pixels', () => {
  let coordinates;
  const context = { getImageData(...args) { coordinates = args; return { data: [255,0,0,255, 0,0,255,255, 0,255,0,0] }; } };
  assert.equal(sampleImageColor(context, 6000, 4000, 100, 100), '#800080');
  assert.deepEqual(coordinates, [5998, 3998, 2, 2]);
  assert.equal(sampleImageColor({ getImageData: () => ({ data: [0,0,0,0] }) }, 1, 1, 0, 0), null);
});
test('library gates approval, rejects duplicates and invalid five-color entries', () => {
  const record = { id: 'a', name: 'Mosswood', colors, category: 'Space', tags: ['quiet'], useCases: ['interior'] };
  assert.equal(createLibraryEngine([record]).size, 0);
  const engine = createLibraryEngine([record, record, { id:'b', colors:['bad'] }], { approvedIds:['a','b'], aliases:{ a:['Old green'] } });
  assert.equal(engine.size, 1);
  assert.equal(engine.search({ query:'OLD GREEN', use:'lifestyle', feeling:'quiet' })[0].palette.id, 'a');
  assert.equal(engine.search({ query:'Old nonexistent' }).length, 0);
});
test('palette matching is permutation-independent and cannot reuse a target swatch', () => {
  assert.equal(paletteDistance(colors, [...colors].reverse()), 0);
  assert.equal(paletteDistance([], colors), Infinity);
  assert.ok(paletteDistance(['#000000','#000000'], ['#000000','#FFFFFF']) > 0);
  const engine = createLibraryEngine([{ id:'dark',name:'Dark',colors:Array(5).fill('#000000') },{ id:'light',name:'Light',colors:Array(5).fill('#FFFFFF') }], { approvedIds:['dark','light'] });
  assert.equal(engine.search({ query:'#FFFFFF' })[0].palette.id, 'light');
});
test('baseline is a validated deep-frozen copy, not a pointer to active colors', () => {
  const source = { colors:[...colors], assignment:{ bottle:2, carton:3 } };
  const frozen = freezeColorway(source);
  source.colors[0]='#000000'; source.assignment.bottle=4;
  assert.equal(frozen.colors[0], colors[0]); assert.equal(frozen.assignment.bottle,2);
  assert.throws(() => { frozen.colors[0]='#FFFFFF'; }, TypeError);
  assert.equal(sanitizeColorway({ colors:['invalid'] }),null);
  assert.equal(sanitizeColorway({ colors, assignment:{cap:-1} }).assignment.cap,4);
});
test('PNG source is self-contained vector work, escapes names, and uses each mapped surface', () => {
  const svg = colorwaySVG({colors,assignment:{carton:3}}, '<script>&test');
  assert.match(svg, /width="1600" height="1100"/);
  assert.match(svg, /&lt;script&gt;&amp;test/);
  assert.doesNotMatch(svg, /<script|<image|href=/);
  for (const color of colors) assert.ok(svg.includes(color));
});
test('private discussions reject invalid data and bound comments without interpreting markup', () => {
  const draft=cleanDiscussion({id:'draft-abc',type:'question',text:'<img onerror=x>',colors,comments:Array(50).fill('x'.repeat(600))});
  assert.equal(draft.text,'<img onerror=x>'); assert.equal(draft.comments.length,30);
  assert.equal(draft.comments[0].length,500);
  assert.equal(cleanDiscussion({id:'public-post',type:'question',text:'x',colors}),null);
  assert.equal(cleanDiscussion({id:'draft-x',type:'vote',text:'x',colors}),null);
});
test('database draft separates discovery approval from legacy references and denies browser writes', async () => {
  const sql=await readFile(new URL('../supabase/drafts/editorial_library.sql',import.meta.url),'utf8');
  assert.match(sql, /using \(status = 'approved'\)/);
  assert.match(sql, /security invoker set search_path = ''/);
  assert.match(sql, /rights_verified_at is null/);
  assert.match(sql, /Exactly five valid HEX/);
  assert.doesNotMatch(sql, /update public\.palettes|grant (?:insert|update|delete|all) /i);
});
