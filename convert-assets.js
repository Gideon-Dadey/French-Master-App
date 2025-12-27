const fs = require('fs');
const path = require('path');

// Simple PNG creator - generates solid color PNG images with proper headers
function createPNG(width, height, r, g, b) {
  // PNG signature
  const signature = Buffer.from([137, 80, 78, 71, 13, 10, 26, 10]);

  // IHDR chunk (image header)
  const ihdr = Buffer.alloc(13);
  ihdr.writeUInt32BE(width, 0);
  ihdr.writeUInt32BE(height, 4);
  ihdr[8] = 8; // bit depth
  ihdr[9] = 2; // color type (RGB)
  ihdr[10] = 0; // compression
  ihdr[11] = 0; // filter
  ihdr[12] = 0; // interlace
  const ihdrChunk = createChunk('IHDR', ihdr);

  // IDAT chunk (image data) - simple solid color
  const pixelData = Buffer.alloc(height * (width * 3 + 1));
  let idx = 0;
  for (let y = 0; y < height; y++) {
    pixelData[idx++] = 0; // filter type for this scanline
    for (let x = 0; x < width; x++) {
      pixelData[idx++] = r;
      pixelData[idx++] = g;
      pixelData[idx++] = b;
    }
  }

  const zlib = require('zlib');
  const compressed = zlib.deflateSync(pixelData);
  const idatChunk = createChunk('IDAT', compressed);

  // IEND chunk (end of PNG)
  const iendChunk = createChunk('IEND', Buffer.alloc(0));

  return Buffer.concat([signature, ihdrChunk, idatChunk, iendChunk]);
}

function createChunk(type, data) {
  const length = Buffer.alloc(4);
  length.writeUInt32BE(data.length, 0);
  const typeBuffer = Buffer.from(type);
  const crc = calculateCRC(Buffer.concat([typeBuffer, data]));
  return Buffer.concat([length, typeBuffer, data, crc]);
}

function calculateCRC(data) {
  const crc = Buffer.alloc(4);
  let c = 0xffffffff;
  for (let i = 0; i < data.length; i++) {
    c ^= data[i];
    for (let k = 0; k < 8; k++) {
      c = c & 1 ? 0xedb88320 ^ (c >>> 1) : c >>> 1;
    }
  }
  crc.writeUInt32BE((c ^ 0xffffffff) >>> 0, 0);
  return crc;
}

const assetsDir = path.join(__dirname, 'assets');

// Create icon.png (1024x1024, blue color matching app theme)
const iconPng = createPNG(1024, 1024, 30, 136, 229);
fs.writeFileSync(path.join(assetsDir, 'icon.png'), iconPng);
console.log('✓ Created assets/icon.png (1024x1024)');

// Create adaptive-icon.png foreground (1024x1024)
const adaptiveIconPng = createPNG(1024, 1024, 30, 136, 229);
fs.writeFileSync(path.join(assetsDir, 'adaptive-icon.png'), adaptiveIconPng);
console.log('✓ Created assets/adaptive-icon.png (1024x1024)');

// Create splash.png (1200x1200)
const splashPng = createPNG(1200, 1200, 30, 136, 229);
fs.writeFileSync(path.join(assetsDir, 'splash.png'), splashPng);
console.log('✓ Created assets/splash.png (1200x1200)');

console.log('\nPNG assets created successfully!');
