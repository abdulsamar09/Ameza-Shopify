const fs = require('fs');
const zlib = require('zlib');

function decodePNG(filePath) {
  const buf = fs.readFileSync(filePath);
  let pos = 8;
  const idatParts = [];
  let w = 0, h = 0;
  while (pos < buf.length) {
    const len = buf.readUInt32BE(pos);
    const type = buf.slice(pos + 4, pos + 8).toString('ascii');
    if (type === 'IHDR') {
      w = buf.readUInt32BE(pos + 8);
      h = buf.readUInt32BE(pos + 12);
    } else if (type === 'IDAT') {
      idatParts.push(buf.slice(pos + 8, pos + 8 + len));
    }
    pos += 12 + len;
  }
  const decompressed = zlib.inflateSync(Buffer.concat(idatParts));
  const bpp = 4;
  const stride = 1 + w * bpp;
  const raw = Buffer.alloc(w * h * bpp);

  for (let y = 0; y < h; y++) {
    const filter = decompressed[y * stride];
    const rowIn = decompressed.slice(y * stride + 1, (y + 1) * stride);
    const rowOut = raw.slice(y * w * bpp, (y + 1) * w * bpp);

    for (let x = 0; x < w * bpp; x++) {
      const left = x >= bpp ? rowOut[x - bpp] : 0;
      const up = y > 0 ? raw[(y - 1) * w * bpp + x] : 0;
      const upLeft = (y > 0 && x >= bpp) ? raw[(y - 1) * w * bpp + x - bpp] : 0;

      let val = rowIn[x];
      if (filter === 0) {}
      else if (filter === 1) val = (val + left) & 0xff;
      else if (filter === 2) val = (val + up) & 0xff;
      else if (filter === 3) val = (val + Math.floor((left + up) / 2)) & 0xff;
      else if (filter === 4) {
        const p = left + up - upLeft;
        const pa = Math.abs(p - left);
        const pb = Math.abs(p - up);
        const pc = Math.abs(p - upLeft);
        let pr = left;
        if (pb < pa && pb <= pc) pr = up;
        else if (pc < pa && pc < pb) pr = upLeft;
        val = (val + pr) & 0xff;
      }
      rowOut[x] = val;
    }
  }
  return { w, h, raw };
}

function crc32(buf) {
  let crc = 0xffffffff;
  for (let i = 0; i < buf.length; i++) {
    crc ^= buf[i];
    for (let j = 0; j < 8; j++) {
      crc = (crc >>> 1) ^ (crc & 1 ? 0xedb88320 : 0);
    }
  }
  return (crc ^ 0xffffffff) >>> 0;
}

function makeChunk(type, data) {
  const typeBuf = Buffer.from(type, 'ascii');
  const lenBuf = Buffer.alloc(4);
  lenBuf.writeUInt32BE(data.length, 0);
  const toCrc = Buffer.concat([typeBuf, data]);
  const crcBuf = Buffer.alloc(4);
  crcBuf.writeUInt32BE(crc32(toCrc), 0);
  return Buffer.concat([lenBuf, typeBuf, data, crcBuf]);
}

function encodePNG(w, h, rawRGBA) {
  const stride = 1 + w * 4;
  const filtered = Buffer.alloc(h * stride);
  for (let y = 0; y < h; y++) {
    filtered[y * stride] = 0; // Filter 0
    rawRGBA.copy(filtered, y * stride + 1, y * w * 4, (y + 1) * w * 4);
  }
  const compressed = zlib.deflateSync(filtered, { level: 9 });

  const sig = Buffer.from([0x89, 0x50, 0x4E, 0x47, 0x0D, 0x0A, 0x1A, 0x0A]);
  const ihdr = Buffer.alloc(13);
  ihdr.writeUInt32BE(w, 0);
  ihdr.writeUInt32BE(h, 4);
  ihdr[8] = 8;
  ihdr[9] = 6;
  ihdr[10] = 0;
  ihdr[11] = 0;
  ihdr[12] = 0;

  return Buffer.concat([
    sig,
    makeChunk('IHDR', ihdr),
    makeChunk('IDAT', compressed),
    makeChunk('IEND', Buffer.alloc(0))
  ]);
}

module.exports = { decodePNG, encodePNG };
