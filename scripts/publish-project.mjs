// Upload project photos (and optional floorplans) to Vercel Blob and write them
// into the amoCRM card: PHOTOS (JSON array, [0]=cover), FLOORPLAN_URLS (one URL
// per line), and optionally flip STATUS. Photos must be exterior-first per the
// publication rule. NEVER pass developer price/commission screenshots.
//
//   node scripts/publish-project.mjs --rw RW-P0005 --status Active \
//     --photos a.jpg b.jpg ... [--floorplans p1.png p2.png] [--dry]
//
// Env (.env.local): AMOCRM_*, BLOB_READ_WRITE_TOKEN
import { put } from "@vercel/blob";
import { readFile } from "node:fs/promises";
import { fileURLToPath } from "node:url";
import { dirname, join, extname, basename } from "node:path";

const __dirname = dirname(fileURLToPath(import.meta.url));
const raw = await readFile(join(__dirname, "..", ".env.local"), "utf8").catch(() => "");
for (const line of raw.split("\n")) { const m = line.match(/^\s*([A-Z0-9_]+)\s*=\s*(.*)\s*$/); if (m && !(m[1] in process.env)) process.env[m[1]] = m[2].trim().replace(/^["']|["']$/g, ""); }
const DOMAIN = process.env.AMOCRM_DOMAIN, TOKEN = process.env.AMOCRM_TOKEN, CATALOG = process.env.AMOCRM_OBJECTS_CATALOG_ID, BLOB = process.env.BLOB_READ_WRITE_TOKEN;
if (!DOMAIN || !TOKEN || !CATALOG || !BLOB) { console.error("Missing AMOCRM_* / BLOB_READ_WRITE_TOKEN"); process.exit(1); }

// ---- args ----
const a = process.argv.slice(2);
const DRY = a.includes("--dry");
const get = (flag) => { const i = a.indexOf(flag); return i < 0 ? null : a[i + 1]; };
const getList = (flag) => { const i = a.indexOf(flag); if (i < 0) return []; const out = []; for (let j = i + 1; j < a.length && !a[j].startsWith("--"); j++) out.push(a[j]); return out; };
const RW = get("--rw"); const STATUS = get("--status");
const photos = getList("--photos"); const floors = getList("--floorplans");
if (!RW || (!photos.length && !floors.length && !STATUS)) { console.error("need --rw and at least --photos/--floorplans/--status"); process.exit(1); }

const headers = { Authorization: `Bearer ${TOKEN}`, "Content-Type": "application/json" };
async function amo(method, path, body) { const r = await fetch(`https://${DOMAIN}/api/v4${path}`, { method, headers, body: body ? JSON.stringify(body) : undefined }); if (r.status === 204) return null; const t = await r.text(); if (!r.ok) throw new Error(`${method} ${path} → ${r.status}: ${t.slice(0,300)}`); return t ? JSON.parse(t) : null; }
async function all(kind) { const o = []; let p = 1; while (true) { const d = await amo("GET", `/catalogs/${CATALOG}/${kind}?page=${p}&limit=250`); const b = d?._embedded?.[kind] ?? []; o.push(...b); if (b.length < 250) break; p++; } return o; }

const fields = await all("custom_fields");
const id = Object.fromEntries(fields.filter(f => f.code).map(f => [f.code, f.id]));
const statusEnum = STATUS ? (fields.find(f => f.code === "STATUS")?.enums ?? []).find(e => String(e.value).toLowerCase() === STATUS.toLowerCase())?.id : null;
if (STATUS && !statusEnum) { console.error(`Unknown STATUS "${STATUS}"`); process.exit(1); }

const els = await all("elements");
const valRw = (el) => { for (const cf of el.custom_fields_values ?? []) if (cf.field_id === id.RW_NUMBER) return String(cf.values?.[0]?.value ?? ""); return ""; };
const el = els.find(e => valRw(e).toUpperCase() === RW.toUpperCase());
if (!el) { console.error(`Card ${RW} not found`); process.exit(1); }
console.log(`${RW} → element id=${el.id} ("${el.name}")`);
console.log(`  photos: ${photos.length}, floorplans: ${floors.length}, status→${STATUS ?? "(unchanged)"}`);
photos.forEach((f, i) => console.log(`    [${i === 0 ? "cover" : i}] ${basename(f)}`));
if (DRY) { console.log("  --dry: nothing uploaded/written"); process.exit(0); }

async function upload(file, prefix, n) {
  const buf = await readFile(file);
  const ext = (extname(file) || ".jpg").toLowerCase();
  const ct = ext === ".png" ? "image/png" : ext === ".webp" ? "image/webp" : "image/jpeg";
  const res = await put(`${prefix}/${String(n).padStart(2, "0")}${ext}`, buf, { access: "public", addRandomSuffix: true, token: BLOB, contentType: ct });
  console.log(`  ✓ ${basename(file)} → ${res.url}`);
  return res.url;
}

const photoUrls = [];
for (let i = 0; i < photos.length; i++) photoUrls.push(await upload(photos[i], RW, i + 1));
const floorUrls = [];
for (let i = 0; i < floors.length; i++) floorUrls.push(await upload(floors[i], `${RW}/floorplan`, i + 1));

const cf = [];
if (photoUrls.length) cf.push({ field_id: id.PHOTOS, values: [{ value: JSON.stringify(photoUrls) }] });
if (floorUrls.length) cf.push({ field_id: id.FLOORPLAN_URLS, values: [{ value: floorUrls.join("\n") }] });
if (statusEnum) cf.push({ field_id: id.STATUS, values: [{ enum_id: statusEnum }] });
await amo("PATCH", `/catalogs/${CATALOG}/elements`, [{ id: el.id, custom_fields_values: cf }]);
console.log(`\nГотово: ${RW} ← PHOTOS=${photoUrls.length}, FLOORPLAN_URLS=${floorUrls.length}${STATUS ? `, STATUS=${STATUS}` : ""}`);
