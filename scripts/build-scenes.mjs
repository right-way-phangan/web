// Rebuild the hero scene manifest (public/scenes.json) from our own catalog.
//
// The homepage hero crossfades through a handful of Phangan scenes. Rather than
// hand-curate them, this script picks the most photogenic *cover photos* from
// live Active listings — aerials and beachfront/sea-view scenes first — so the
// hero refreshes itself as inventory turns over. Runs weekly via GitHub Action
// (.github/workflows/refresh-scenes.yml); commit the result.
//
// Publication rule (mirrors src/lib/amocrm/mapper.ts): only image/* from PHOTOS
// is public. Anything in DOCS, or any URL with a document extension, is dropped
// — title-deed scans / cadastral maps must never surface as a hero scene.
//
// Usage:
//   node scripts/build-scenes.mjs            # dry-run: print the manifest
//   node scripts/build-scenes.mjs --write    # write public/scenes.json
//
// Env (from .env.local or CI secrets):
//   AMOCRM_DOMAIN, AMOCRM_TOKEN, AMOCRM_OBJECTS_CATALOG_ID

import { readFile, writeFile } from "node:fs/promises";
import { fileURLToPath } from "node:url";
import { dirname, join } from "node:path";

const __dirname = dirname(fileURLToPath(import.meta.url));
const WRITE = process.argv.includes("--write");
const MAX_SCENES = 6;
const OUT_PATH = join(__dirname, "..", "public", "scenes.json");

// ---- minimal .env.local loader (no dependency on dotenv) ----
async function loadEnv() {
  const path = join(__dirname, "..", ".env.local");
  const raw = await readFile(path, "utf8").catch(() => "");
  for (const line of raw.split("\n")) {
    const m = line.match(/^\s*([A-Z0-9_]+)\s*=\s*(.*)\s*$/);
    if (!m) continue;
    let v = m[2].trim();
    if ((v.startsWith('"') && v.endsWith('"')) || (v.startsWith("'") && v.endsWith("'"))) {
      v = v.slice(1, -1);
    }
    if (!(m[1] in process.env)) process.env[m[1]] = v;
  }
}
await loadEnv();

const DOMAIN = process.env.AMOCRM_DOMAIN;
const TOKEN = process.env.AMOCRM_TOKEN;
const CATALOG_ID = process.env.AMOCRM_OBJECTS_CATALOG_ID;
if (!DOMAIN || !TOKEN || !CATALOG_ID) {
  console.error("Missing AMOCRM_DOMAIN / AMOCRM_TOKEN / AMOCRM_OBJECTS_CATALOG_ID");
  process.exit(1);
}

const API = `https://${DOMAIN}/api/v4`;
const headers = { Authorization: `Bearer ${TOKEN}`, "Content-Type": "application/json" };

async function amo(path) {
  const res = await fetch(`${API}${path}`, { headers });
  const text = await res.text();
  if (!res.ok) throw new Error(`amo GET ${path} → ${res.status}: ${text.slice(0, 200)}`);
  return text ? JSON.parse(text) : null;
}

async function listElements() {
  const out = [];
  let page = 1;
  while (true) {
    const data = await amo(`/catalogs/${CATALOG_ID}/elements?page=${page}&limit=250`);
    const batch = data?._embedded?.elements ?? [];
    out.push(...batch);
    if (batch.length < 250) break;
    page += 1;
  }
  return out;
}

// ---- field access by code (amoCRM exposes field_code on each value) ----
const valueOf = (el, code) => {
  for (const cf of el.custom_fields_values ?? []) {
    if (cf.field_code === code) {
      return cf.values?.[0]?.value != null ? String(cf.values[0].value) : undefined;
    }
  }
  return undefined;
};
const boolOf = (el, code) => {
  const v = valueOf(el, code);
  return v === "true" || v === "1" || v === "Yes" || v === "yes";
};

// ---- publication guards (mirror of mapper.ts) ----
const DOC_URL_EXT = /\.(pdf|docx?|xlsx?|pptx?|zip|rar|7z)(\?|$)/i;

function parseUrlArray(raw) {
  if (!raw) return [];
  try {
    const parsed = JSON.parse(raw);
    if (!Array.isArray(parsed)) return [];
    return parsed
      .map((x) => (typeof x === "string" ? x : x?.url))
      .filter((x) => typeof x === "string" && x.startsWith("http"));
  } catch {
    return [];
  }
}

function coverFor(el) {
  const docUrls = new Set(parseUrlArray(valueOf(el, "DOCS")));
  const photos = parseUrlArray(valueOf(el, "PHOTOS")).filter(
    (u) => !DOC_URL_EXT.test(u) && !docUrls.has(u),
  );
  return photos[0]; // first photo = cover
}

// ---- scenic scoring: aerials + beachfront/sea-view read best as a backdrop ----
function score(el) {
  const type = valueOf(el, "TYPE") ?? "Land";
  return (
    (boolOf(el, "BEACHFRONT") ? 5 : 0) +
    (boolOf(el, "SEA_VIEW") ? 3 : 0) +
    (type === "Land" ? 3 : 0) + // land covers are aerials
    (boolOf(el, "MOUNTAIN_VIEW") ? 1 : 0)
  );
}

function altFor(el) {
  const district = valueOf(el, "DISTRICT");
  const type = (valueOf(el, "TYPE") ?? "Land").toLowerCase();
  const where = district ? `${district}, Koh Phangan` : "Koh Phangan";
  return `A ${type} on ${where}`;
}

async function main() {
  const elements = await listElements();
  const candidates = [];
  const seen = new Set();

  for (const el of elements) {
    if ((valueOf(el, "STATUS") ?? "Active") !== "Active") continue;
    if (!valueOf(el, "RW_NUMBER")) continue;
    // Skip off-plan projects: their covers are often renders / floor-plans /
    // marketing graphics that read poorly as a full-bleed island backdrop.
    if ((valueOf(el, "TYPE") ?? "Land") === "Project") continue;
    const src = coverFor(el);
    if (!src || seen.has(src)) continue;
    seen.add(src);
    candidates.push({
      src,
      alt: altFor(el),
      _score: score(el),
      _added: valueOf(el, "DATE_ADDED") ?? "",
    });
  }

  candidates.sort((a, b) => b._score - a._score || b._added.localeCompare(a._added));
  const scenes = candidates
    .slice(0, MAX_SCENES)
    .map(({ src, alt }) => ({ src, alt }));

  const manifest = {
    generatedAt: new Date().toISOString(),
    source: "catalog",
    scenes,
  };

  console.error(
    `Каталог: ${elements.length} элементов · кандидатов с фото: ${candidates.length} · в манифест: ${scenes.length}`,
  );
  for (const s of scenes) console.error(`  • ${s.alt}\n    ${s.src}`);

  if (scenes.length === 0) {
    console.error("\nНи одного подходящего фото — манифест НЕ перезаписан (оставляем прежний/seed).");
    process.exit(WRITE ? 2 : 0);
  }

  if (!WRITE) {
    console.error("\nDRY-RUN. Запись: node scripts/build-scenes.mjs --write");
    return;
  }

  await writeFile(OUT_PATH, JSON.stringify(manifest, null, 2) + "\n", "utf8");
  console.error(`\nЗаписано → ${OUT_PATH}`);
}

main().catch((err) => {
  console.error("FATAL:", err);
  process.exit(1);
});
