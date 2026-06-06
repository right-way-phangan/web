// Upload ordered image files to Vercel Blob → print public URLs as JSON array.
// Usage: node scripts/upload-blob.mjs <prefix> <file1> <file2> ...
// Token: BLOB_READ_WRITE_TOKEN env.
import { put } from "@vercel/blob";
import { readFile } from "node:fs/promises";
import { basename, extname } from "node:path";

const [, , prefix, ...files] = process.argv;
const token = process.env.BLOB_READ_WRITE_TOKEN;
if (!token) {
  console.error("BLOB_READ_WRITE_TOKEN не задан");
  process.exit(1);
}

const urls = [];
let i = 0;
for (const f of files) {
  i += 1;
  const buf = await readFile(f);
  const ext = extname(f) || ".jpg";
  const name = `${prefix}/${String(i).padStart(2, "0")}${ext}`;
  const res = await put(name, buf, {
    access: "public",
    addRandomSuffix: true,
    token,
    contentType: ext.toLowerCase() === ".png" ? "image/png" : "image/jpeg",
  });
  urls.push(res.url);
  console.error(`  ✓ ${basename(f)} → ${res.url}`);
}
console.log(JSON.stringify(urls));
