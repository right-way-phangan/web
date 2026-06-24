// Regenerate raster brand assets from the Coastal-Twilight-recoloured avatar SVG.
// Source of truth: brand/avatar_1024.svg (ink #04262E bg + white RW monogram).
// Run from the web worktree (sharp is a dependency). One-off — not in CI.
import sharp from "sharp";
import { readFileSync, writeFileSync } from "node:fs";
import { resolve } from "node:path";

const HUB = "/Users/burik/Documents/Claude/Projects/Right Way - сбор компании";
const PUBLIC = resolve(process.cwd(), "public");
const svg = readFileSync(`${HUB}/brand/avatar_1024.svg`);

const png = (size) =>
  sharp(svg, { density: 384 }).resize(size, size, { fit: "cover" }).png().toBuffer();

// Wrap a PNG buffer in a single-image .ico container (PNG-in-ICO, IE/Vista+).
function pngToIco(pngBuf, dim) {
  const header = Buffer.alloc(6);
  header.writeUInt16LE(0, 0); // reserved
  header.writeUInt16LE(1, 2); // type = icon
  header.writeUInt16LE(1, 4); // image count
  const entry = Buffer.alloc(16);
  entry.writeUInt8(dim >= 256 ? 0 : dim, 0); // width  (0 => 256)
  entry.writeUInt8(dim >= 256 ? 0 : dim, 1); // height
  entry.writeUInt8(0, 2); // palette
  entry.writeUInt8(0, 3); // reserved
  entry.writeUInt16LE(1, 4); // colour planes
  entry.writeUInt16LE(32, 6); // bits per pixel
  entry.writeUInt32LE(pngBuf.length, 8); // image size
  entry.writeUInt32LE(22, 12); // offset (6 + 16)
  return Buffer.concat([header, entry, pngBuf]);
}

const targets = [
  { buf: () => png(32), out: `${PUBLIC}/icon-32.png` },
  { buf: () => png(180), out: `${PUBLIC}/apple-touch-icon.png` },
  { buf: () => png(192), out: `${PUBLIC}/icon-192.png` },
  { buf: () => png(512), out: `${PUBLIC}/icon-512.png` },
  { buf: () => png(1024), out: `${HUB}/brand/avatar_1024.png` },
];

for (const t of targets) {
  const b = await t.buf();
  writeFileSync(t.out, b);
  console.log(`✓ ${t.out} (${b.length} B)`);
}

// favicon.ico — embed a crisp 32px PNG.
const ico32 = await png(32);
const ico = pngToIco(ico32, 32);
writeFileSync(`${PUBLIC}/favicon.ico`, ico);
console.log(`✓ ${PUBLIC}/favicon.ico (${ico.length} B, ico-wrapped 32px)`);
