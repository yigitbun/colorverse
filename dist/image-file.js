export const IMAGE_FILE_LIMITS = Object.freeze({
  maxBytes: 20 * 1024 * 1024,
  maxPixels: 25_000_000,
  maxEdge: 12_000,
  headerBytes: 1024 * 1024,
});

export const SUPPORTED_IMAGE_TYPES = new Set(['image/png', 'image/jpeg', 'image/webp']);

const mimeForFormat = Object.freeze({ png: 'image/png', jpeg: 'image/jpeg', webp: 'image/webp' });
const jpegSofMarkers = new Set([0xc0, 0xc1, 0xc2, 0xc3, 0xc5, 0xc6, 0xc7, 0xc9, 0xca, 0xcb, 0xcd, 0xce, 0xcf]);

function imageError(code, message) {
  const error = new Error(message);
  error.code = code;
  return error;
}

function isPng(bytes) {
  return bytes.length >= 24
    && bytes[0] === 0x89 && bytes[1] === 0x50 && bytes[2] === 0x4e && bytes[3] === 0x47
    && bytes[4] === 0x0d && bytes[5] === 0x0a && bytes[6] === 0x1a && bytes[7] === 0x0a
    && bytes[12] === 0x49 && bytes[13] === 0x48 && bytes[14] === 0x44 && bytes[15] === 0x52;
}

function pngDimensions(bytes) {
  if (!isPng(bytes)) return null;
  const view = new DataView(bytes.buffer, bytes.byteOffset, bytes.byteLength);
  return { format: 'png', width: view.getUint32(16), height: view.getUint32(20) };
}

function jpegDimensions(bytes) {
  if (bytes.length < 4 || bytes[0] !== 0xff || bytes[1] !== 0xd8) return null;
  let offset = 2;
  while (offset + 8 < bytes.length) {
    while (offset < bytes.length && bytes[offset] === 0xff) offset += 1;
    if (offset >= bytes.length) break;
    const marker = bytes[offset++];
    if (marker === 0xd9 || marker === 0xda) break;
    if (marker === 0x01 || (marker >= 0xd0 && marker <= 0xd7)) continue;
    if (offset + 1 >= bytes.length) break;
    const length = (bytes[offset] << 8) | bytes[offset + 1];
    if (length < 2 || offset + length > bytes.length) break;
    if (jpegSofMarkers.has(marker) && length >= 7) {
      return {
        format: 'jpeg',
        width: (bytes[offset + 5] << 8) | bytes[offset + 6],
        height: (bytes[offset + 3] << 8) | bytes[offset + 4],
      };
    }
    offset += length;
  }
  return null;
}

function fourCc(bytes, offset) {
  return String.fromCharCode(...bytes.slice(offset, offset + 4));
}

function uint24le(bytes, offset) {
  return bytes[offset] | (bytes[offset + 1] << 8) | (bytes[offset + 2] << 16);
}

function webpDimensions(bytes) {
  if (bytes.length < 30 || fourCc(bytes, 0) !== 'RIFF' || fourCc(bytes, 8) !== 'WEBP') return null;
  const chunk = fourCc(bytes, 12);
  if (chunk === 'VP8X') {
    return { format: 'webp', width: uint24le(bytes, 24) + 1, height: uint24le(bytes, 27) + 1 };
  }
  if (chunk === 'VP8L' && bytes[20] === 0x2f && bytes.length >= 25) {
    return {
      format: 'webp',
      width: 1 + bytes[21] + ((bytes[22] & 0x3f) << 8),
      height: 1 + (bytes[22] >> 6) + (bytes[23] << 2) + ((bytes[24] & 0x0f) << 10),
    };
  }
  if (chunk === 'VP8 ' && bytes.length >= 30 && bytes[23] === 0x9d && bytes[24] === 0x01 && bytes[25] === 0x2a) {
    return {
      format: 'webp',
      width: (bytes[26] | (bytes[27] << 8)) & 0x3fff,
      height: (bytes[28] | (bytes[29] << 8)) & 0x3fff,
    };
  }
  return null;
}

export function imageDimensionsFromHeader(bytes) {
  return pngDimensions(bytes) || jpegDimensions(bytes) || webpDimensions(bytes);
}

export async function validateImageFile(file, limits = IMAGE_FILE_LIMITS) {
  if (!file || typeof file.slice !== 'function') throw imageError('missing', 'Choose a JPG, PNG, or WebP image.');
  if (!file.size) throw imageError('empty', 'This image is empty. Choose another file.');
  if (file.size > limits.maxBytes) throw imageError('bytes', 'This image is too large. Choose one smaller than 20 MB.');
  if (!SUPPORTED_IMAGE_TYPES.has(file.type)) throw imageError('type', 'Choose a JPG, PNG, or WebP image.');

  const header = new Uint8Array(await file.slice(0, Math.min(file.size, limits.headerBytes)).arrayBuffer());
  const metadata = imageDimensionsFromHeader(header);
  if (!metadata?.width || !metadata?.height) throw imageError('signature', 'This file is not a readable JPG, PNG, or WebP image.');
  if (mimeForFormat[metadata.format] !== file.type) throw imageError('mismatch', 'This file type does not match its image contents. Choose the original image file.');

  const pixels = metadata.width * metadata.height;
  if (metadata.width > limits.maxEdge || metadata.height > limits.maxEdge || pixels > limits.maxPixels) {
    throw imageError('dimensions', 'This image is too large to process safely. Use one under 25 megapixels.');
  }
  return { ...metadata, pixels, bytes: file.size };
}
