/**
 * Generates a 48x48 book icon PNG for use as the app favicon.
 * Run with: node scripts/generate-favicon.js
 * No npm dependencies — uses only built-in Node.js modules.
 */
const zlib = require('zlib');
const fs = require('fs');
const path = require('path');

const W = 48, H = 48;
const pixels = new Uint8Array(W * H * 4); // RGBA, default transparent

// ── CRC32 ────────────────────────────────────────────────────────────────────
const crcTable = (() => {
  const t = new Uint32Array(256);
  for (let i = 0; i < 256; i++) {
    let c = i;
    for (let j = 0; j < 8; j++) c = (c & 1) ? 0xedb88320 ^ (c >>> 1) : c >>> 1;
    t[i] = c;
  }
  return t;
})();

function crc32(buf) {
  let c = 0xffffffff;
  for (let i = 0; i < buf.length; i++) c = crcTable[(c ^ buf[i]) & 0xff] ^ (c >>> 8);
  return (c ^ 0xffffffff) >>> 0;
}

function pngChunk(type, data) {
  const typeBuf = Buffer.from(type, 'ascii');
  const lenBuf = Buffer.alloc(4);
  lenBuf.writeUInt32BE(data.length);
  const crcInput = Buffer.concat([typeBuf, data]);
  const crcBuf = Buffer.alloc(4);
  crcBuf.writeUInt32BE(crc32(crcInput));
  return Buffer.concat([lenBuf, crcInput, crcBuf]);
}

// ── Drawing helpers ──────────────────────────────────────────────────────────
function setPixel(x, y, r, g, b, a = 255) {
  if (x < 0 || x >= W || y < 0 || y >= H) return;
  const i = (y * W + x) * 4;
  pixels[i] = r; pixels[i + 1] = g; pixels[i + 2] = b; pixels[i + 3] = a;
}

function fillRect(x1, y1, x2, y2, r, g, b, a = 255) {
  for (let y = y1; y < y2; y++)
    for (let x = x1; x < x2; x++)
      setPixel(x, y, r, g, b, a);
}

// ── Background: dark rounded square #3D2510 ──────────────────────────────────
const [bgR, bgG, bgB] = [0x3d, 0x25, 0x10];
const RADIUS = 9;
for (let y = 0; y < H; y++) {
  for (let x = 0; x < W; x++) {
    // Clamp to nearest corner circle center
    const cx = x < RADIUS ? RADIUS : (x >= W - RADIUS ? W - RADIUS - 1 : x);
    const cy = y < RADIUS ? RADIUS : (y >= H - RADIUS ? H - RADIUS - 1 : y);
    const dx = x - cx, dy = y - cy;
    if (dx * dx + dy * dy <= RADIUS * RADIUS) {
      setPixel(x, y, bgR, bgG, bgB);
    }
  }
}

// ── Book geometry (centered in 48×48) ───────────────────────────────────────
//  x: 9–39  (30px wide)  y: 10–38  (28px tall)
//  Left page:  x 9–21   (13px)
//  Spine:      x 21–27  ( 6px)
//  Right page: x 27–39  (12px)

const PAGE  = [0xf0, 0xe8, 0xd8]; // warm cream
const SPINE = [0xc0, 0x71, 0x4f]; // terracotta
const EDGE  = [0x7a, 0x40, 0x20]; // dark spine edge
const LINE  = [0xb8, 0xa8, 0x96]; // faint page lines

// Pages
fillRect(9,  10, 22, 38, ...PAGE);   // left page
fillRect(26, 10, 39, 38, ...PAGE);   // right page

// Spine
fillRect(21, 9, 27, 39, ...SPINE);

// Spine edge shading (left & right edges of spine)
for (let y = 9; y < 39; y++) {
  setPixel(21, y, ...EDGE);
  setPixel(26, y, ...EDGE);
}

// Horizontal lines on left page
for (const ly of [16, 20, 24, 28, 32]) {
  fillRect(11, ly, 21, ly + 1, ...LINE);
}

// Horizontal lines on right page
for (const ly of [16, 20, 24, 28, 32]) {
  fillRect(27, ly, 37, ly + 1, ...LINE);
}

// Subtle page shadow along inner edge (left page right side, right page left side)
for (let y = 10; y < 38; y++) {
  setPixel(20, y, 0xd0, 0xc0, 0xaa);
  setPixel(27, y, 0xd0, 0xc0, 0xaa);
}

// ── Encode to PNG ────────────────────────────────────────────────────────────
// Scanlines: 1 filter byte (0 = None) + W*4 RGBA bytes each row
const scanlines = Buffer.alloc(H * (1 + W * 4));
for (let y = 0; y < H; y++) {
  scanlines[y * (1 + W * 4)] = 0; // filter type: None
  for (let x = 0; x < W; x++) {
    const src = (y * W + x) * 4;
    const dst = y * (1 + W * 4) + 1 + x * 4;
    scanlines[dst]     = pixels[src];
    scanlines[dst + 1] = pixels[src + 1];
    scanlines[dst + 2] = pixels[src + 2];
    scanlines[dst + 3] = pixels[src + 3];
  }
}

const compressed = zlib.deflateSync(scanlines, { level: 9 });

const ihdr = Buffer.alloc(13);
ihdr.writeUInt32BE(W, 0);
ihdr.writeUInt32BE(H, 4);
ihdr[8]  = 8; // bit depth
ihdr[9]  = 6; // RGBA
ihdr[10] = 0; ihdr[11] = 0; ihdr[12] = 0;

const png = Buffer.concat([
  Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]), // PNG signature
  pngChunk('IHDR', ihdr),
  pngChunk('IDAT', compressed),
  pngChunk('IEND', Buffer.alloc(0)),
]);

const outPath = path.join(__dirname, '..', 'assets', 'favicon.png');
fs.writeFileSync(outPath, png);
console.log('✅  Book favicon written to', outPath);
