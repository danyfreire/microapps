/**
 * Genera los iconos PNG de la PWA (192, 512 y maskable 512) a partir de un
 * dibujo simple (plato sobre fondo esmeralda). Sin dependencias externas:
 * usa node:zlib para codificar PNG.
 *
 * Uso: npm run generate:icons
 */
import { deflateSync } from "node:zlib";
import { mkdirSync, writeFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = dirname(fileURLToPath(import.meta.url));
const OUT_DIR = join(__dirname, "..", "public", "icons");

const CRC_TABLE = (() => {
  const table = new Uint32Array(256);
  for (let n = 0; n < 256; n++) {
    let c = n;
    for (let k = 0; k < 8; k++) {
      c = c & 1 ? 0xedb88320 ^ (c >>> 1) : c >>> 1;
    }
    table[n] = c;
  }
  return table;
})();

function crc32(buf) {
  let c = 0xffffffff;
  for (let i = 0; i < buf.length; i++) {
    c = CRC_TABLE[(c ^ buf[i]) & 0xff] ^ (c >>> 8);
  }
  return (c ^ 0xffffffff) >>> 0;
}

function chunk(type, data) {
  const len = Buffer.alloc(4);
  len.writeUInt32BE(data.length, 0);
  const typeBuf = Buffer.from(type, "ascii");
  const crc = Buffer.alloc(4);
  crc.writeUInt32BE(crc32(Buffer.concat([typeBuf, data])), 0);
  return Buffer.concat([len, typeBuf, data, crc]);
}

function encodePng(size, rgba) {
  const raw = Buffer.alloc((size * 4 + 1) * size);
  let offset = 0;
  for (let y = 0; y < size; y++) {
    raw[offset++] = 0; // filtro none
    rgba.copy(raw, offset, y * size * 4, (y + 1) * size * 4);
    offset += size * 4;
  }
  const ihdr = Buffer.alloc(13);
  ihdr.writeUInt32BE(size, 0);
  ihdr.writeUInt32BE(size, 4);
  ihdr[8] = 8; // bit depth
  ihdr[9] = 6; // color type RGBA
  const signature = Buffer.from([137, 80, 78, 71, 13, 10, 26, 10]);
  return Buffer.concat([
    signature,
    chunk("IHDR", ihdr),
    chunk("IDAT", deflateSync(raw)),
    chunk("IEND", Buffer.alloc(0)),
  ]);
}

function inRoundedRect(x, y, size, radius) {
  const r = radius;
  const cx = Math.min(Math.max(x, r), size - 1 - r);
  const cy = Math.min(Math.max(y, r), size - 1 - r);
  const dx = x - cx;
  const dy = y - cy;
  return Math.hypot(dx, dy) <= r;
}

function makeIcon(size, { maskable = false } = {}) {
  const rgba = Buffer.alloc(size * size * 4);
  const bg = [16, 185, 129]; // emerald-500
  const white = [255, 255, 255];
  const radius = maskable ? size * 0.16 : size * 0.22;
  const cx = size / 2;
  const cy = size / 2;
  const plateR = size * 0.3;
  const foodR = size * 0.14;

  for (let y = 0; y < size; y++) {
    for (let x = 0; x < size; x++) {
      if (!inRoundedRect(x, y, size, radius)) continue; // transparente
      const i = (y * size + x) * 4;
      const d = Math.hypot(x - cx, y - cy);
      let color = bg;
      if (d <= plateR) color = white;
      if (d <= foodR) color = bg;
      rgba[i] = color[0];
      rgba[i + 1] = color[1];
      rgba[i + 2] = color[2];
      rgba[i + 3] = 255;
    }
  }

  return encodePng(size, rgba);
}

mkdirSync(OUT_DIR, { recursive: true });
writeFileSync(join(OUT_DIR, "icon-192.png"), makeIcon(192));
writeFileSync(join(OUT_DIR, "icon-512.png"), makeIcon(512));
writeFileSync(join(OUT_DIR, "icon-maskable-512.png"), makeIcon(512, { maskable: true }));
console.log("Iconos generados en", OUT_DIR);
