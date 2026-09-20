import assert from 'node:assert/strict';
import test from 'node:test';
import { IMAGE_FILE_LIMITS, imageDimensionsFromHeader, validateImageFile } from '../dist/image-file.js';

function png(width, height, type = 'image/png') {
  const bytes = new Uint8Array(24);
  bytes.set([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a], 0);
  bytes.set([0x49, 0x48, 0x44, 0x52], 12);
  const view = new DataView(bytes.buffer);
  view.setUint32(16, width);
  view.setUint32(20, height);
  return new File([bytes], 'image.png', { type });
}

function jpeg(width, height, type = 'image/jpeg') {
  const bytes = new Uint8Array([
    0xff, 0xd8,
    0xff, 0xc0, 0x00, 0x11, 0x08,
    (height >> 8) & 0xff, height & 0xff,
    (width >> 8) & 0xff, width & 0xff,
    0x03, 0x01, 0x11, 0x00, 0x02, 0x11, 0x00, 0x03, 0x11, 0x00,
    0xff, 0xd9,
  ]);
  return new File([bytes], 'image.jpg', { type });
}

function webp(width, height, type = 'image/webp') {
  const bytes = new Uint8Array(30);
  bytes.set([...Buffer.from('RIFF')], 0);
  bytes.set([...Buffer.from('WEBP')], 8);
  bytes.set([...Buffer.from('VP8X')], 12);
  const w = width - 1;
  const h = height - 1;
  bytes.set([w & 0xff, (w >> 8) & 0xff, (w >> 16) & 0xff], 24);
  bytes.set([h & 0xff, (h >> 8) & 0xff, (h >> 16) & 0xff], 27);
  return new File([bytes], 'image.webp', { type });
}

test('reads dimensions from supported image signatures', async () => {
  assert.deepEqual(imageDimensionsFromHeader(new Uint8Array(await png(1600, 900).arrayBuffer())), { format: 'png', width: 1600, height: 900 });
  assert.deepEqual(imageDimensionsFromHeader(new Uint8Array(await jpeg(1200, 800).arrayBuffer())), { format: 'jpeg', width: 1200, height: 800 });
  assert.deepEqual(imageDimensionsFromHeader(new Uint8Array(await webp(640, 480).arrayBuffer())), { format: 'webp', width: 640, height: 480 });
});

test('accepts a small valid image and reports bounded metadata', async () => {
  assert.deepEqual(await validateImageFile(png(2000, 1200)), {
    format: 'png', width: 2000, height: 1200, pixels: 2_400_000, bytes: 24,
  });
});

test('rejects MIME spoofing and unreadable image contents', async () => {
  await assert.rejects(validateImageFile(png(800, 600, 'image/jpeg')), error => error.code === 'mismatch');
  await assert.rejects(validateImageFile(new File([new Uint8Array([1, 2, 3, 4])], 'fake.png', { type: 'image/png' })), error => error.code === 'signature');
  await assert.rejects(validateImageFile(new File([new Uint8Array([1])], 'note.txt', { type: 'text/plain' })), error => error.code === 'type');
});

test('rejects pixel bombs and extreme edges before browser decoding', async () => {
  await assert.rejects(validateImageFile(png(6000, 5000)), error => error.code === 'dimensions');
  await assert.rejects(validateImageFile(png(IMAGE_FILE_LIMITS.maxEdge + 1, 1000)), error => error.code === 'dimensions');
  const oversized = { size: IMAGE_FILE_LIMITS.maxBytes + 1, type: 'image/png', slice: () => { throw new Error('must not read'); } };
  await assert.rejects(validateImageFile(oversized), error => error.code === 'bytes');
});
