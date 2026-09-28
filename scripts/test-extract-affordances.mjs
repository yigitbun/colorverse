import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import test from 'node:test';

const read = path => readFile(new URL(`../dist/${path}`, import.meta.url), 'utf8');
const [html, app, css] = await Promise.all([
  read('extract/index.html'), read('app.js'), read('extract-workspace.css'),
]);

test('readings explain initial sampled versus derived colors without suggesting edits are source samples', () => {
  assert.match(html, /id="extractionReading"[^>]*aria-describedby="extractionReadingDescription"/);
  assert.match(html, /id="extractionReadingDescription" aria-live="polite"/);
  assert.match(app, /origins: variant\.origins/);
  assert.match(app, /Starting reading: \$\{sampled\} sampled · \$\{derived\} derived\. Edits are yours\./);
  assert.match(app, /readingDescription\.textContent =/);
});

test('every color has explicit copy and edit tools with keyboard and touch visibility', () => {
  assert.match(app, /class="extract-color-copy" data-copy="\$\{color\}"/);
  assert.match(app, /class="extract-color-edit"/);
  assert.match(app, /data-extract-color="\$\{index\}" aria-label="Edit color of sample/);
  assert.match(css, /\.extract-color-row:focus-within \.extract-color-tools\{opacity:1\}/);
  assert.match(css, /@media\(pointer:coarse\)\{\.extract-color-tools\{opacity:1\}\}/);
  assert.doesNotMatch(app, /data-extract-(?:lock|favorite|ai)/);
});

test('image editor still exposes undo, reset, insertion, point sampling and Studio handoff', () => {
  for (const hook of ['undoExtraction', 'resetExtraction', 'imagePickers', 'useExtraction']) {
    assert.match(html, new RegExp(`id="${hook}"`));
  }
  for (const hook of ['data-extract-insert', 'data-extract-remove', 'updatePicker', 'editExtractionMembers']) {
    assert.ok(app.includes(hook), hook);
  }
  assert.match(html, /\/extract-workspace\.css\?v=5/);
  assert.match(html, /\/app\.js\?v=107/);
});
