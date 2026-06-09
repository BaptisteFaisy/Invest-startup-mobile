const fs   = require('fs');
const path = require('path');
const zlib = require('zlib');

function crc32(buf) {
  const table = new Uint32Array(256);
  for (let n = 0; n < 256; n++) {
    let c = n;
    for (let k = 0; k < 8; k++) c = (c & 1) ? (0xEDB88320 ^ (c >>> 1)) : (c >>> 1);
    table[n] = c;
  }
  let crc = 0xFFFFFFFF;
  for (let i = 0; i < buf.length; i++) crc = table[(crc ^ buf[i]) & 0xFF] ^ (crc >>> 8);
  return (crc ^ 0xFFFFFFFF) >>> 0;
}

function chunk(type, data) {
  const len  = Buffer.alloc(4); len.writeUInt32BE(data.length);
  const t    = Buffer.from(type, 'ascii');
  const crc  = Buffer.alloc(4); crc.writeUInt32BE(crc32(Buffer.concat([t, data])));
  return Buffer.concat([len, t, data, crc]);
}

function makePNG(w, h, r, g, b) {
  const sig  = Buffer.from([0x89,0x50,0x4E,0x47,0x0D,0x0A,0x1A,0x0A]);

  // IHDR
  const ihdrData = Buffer.alloc(13);
  ihdrData.writeUInt32BE(w, 0);
  ihdrData.writeUInt32BE(h, 4);
  ihdrData[8] = 8; ihdrData[9] = 2;

  // Raw pixel rows: filter(0) + RGB * w
  const raw = Buffer.alloc(h * (1 + w * 3));
  for (let y = 0; y < h; y++) {
    const base = y * (1 + w * 3);
    raw[base] = 0;
    for (let x = 0; x < w; x++) {
      raw[base + 1 + x*3] = r;
      raw[base + 2 + x*3] = g;
      raw[base + 3 + x*3] = b;
    }
  }

  const idat = zlib.deflateSync(raw);
  return Buffer.concat([
    sig,
    chunk('IHDR', ihdrData),
    chunk('IDAT', idat),
    chunk('IEND', Buffer.alloc(0)),
  ]);
}

const assetsDir = path.join(__dirname, '..', 'assets');
fs.mkdirSync(assetsDir, { recursive: true });

// 1024x1024 dark blue icon with "L+" text not possible in raw PNG – solid colour is enough for dev
fs.writeFileSync(path.join(assetsDir, 'icon.png'),          makePNG(1024, 1024, 8, 12, 20));
fs.writeFileSync(path.join(assetsDir, 'splash.png'),        makePNG(1024, 1024, 8, 12, 20));
fs.writeFileSync(path.join(assetsDir, 'adaptive-icon.png'), makePNG(1024, 1024, 59, 130, 246));
fs.writeFileSync(path.join(assetsDir, 'favicon.png'),       makePNG(32,   32,   59, 130, 246));

console.log('Assets created in', assetsDir);
