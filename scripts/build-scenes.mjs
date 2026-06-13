// Rebuild the hero scene manifest (public/scenes.json) from our own catalog.
//
// The homepage hero crossfades through a handful of Phangan scenes. Rather than
// hand-curate them, this script picks the most photogenic *cover photos* from
// live Active listings — aerials and beachfront/sea-view scenes first — so the
// hero refreshes itself as inventory turns over. Runs weekly via GitHub Action
// (.github/workflows/refresh-scenes.yml); commit the result.
//
// Source: the own backend catalog API (Neon, post-cutover). /objects already
// returns the public, sanitized set — Active listings that have a cover photo —
// so the document/price-screenshot guards that used to live here are no longer
// needed: confidential media never reaches this endpoint.
//
// Usage:
//   node scripts/build-scenes.mjs            # dry-run: print the manifest
//   node scripts/build-scenes.mjs --write    # write public/scenes.json
//
// Env (from .env.local or CI secrets):
//   OBJECTS_API_URL, OBJECTS_API_TOKEN

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

const API = (process.env.OBJECTS_API_URL || "").replace(/\/$/, "");
const TOKEN = process.env.OBJECTS_API_TOKEN;
if (!API || !TOKEN) {
  console.error("Missing OBJECTS_API_URL / OBJECTS_API_TOKEN");
  process.exit(1);
}

async function getObjects() {
  const res = await fetch(`${API}/objects`, {
    headers: { Authorization: `Bearer ${TOKEN}` },
  });
  const text = await res.text();
  if (!res.ok) throw new Error(`GET /objects → ${res.status}: ${text.slice(0, 200)}`);
  const data = text ? JSON.parse(text) : [];
  return Array.isArray(data) ? data : [];
}

// ---- scenic scoring: aerials + beachfront/sea-view read best as a backdrop ----
function score(o) {
  return (
    (o.beachfront ? 5 : 0) +
    (o.seaView ? 3 : 0) +
    ((o.type ?? "Land") === "Land" ? 3 : 0) + // land covers are aerials
    (o.mountainView ? 1 : 0)
  );
}

function altFor(o) {
  const type = (o.type ?? "Land").toLowerCase();
  const where = o.district ? `${o.district}, Koh Phangan` : "Koh Phangan";
  return `A ${type} on ${where}`;
}

async function main() {
  const objects = await getObjects();
  const candidates = [];
  const seen = new Set();

  for (const o of objects) {
    // /objects is already Active + has coverImage; skip off-plan projects, whose
    // covers are often renders / floor-plans that read poorly as a backdrop.
    if ((o.type ?? "Land") === "Project") continue;
    const src = o.coverImage;
    if (!src || seen.has(src)) continue;
    seen.add(src);
    candidates.push({
      src,
      alt: altFor(o),
      _score: score(o),
      _added: o.dateAdded ?? "",
    });
  }

  candidates.sort((a, b) => b._score - a._score || String(b._added).localeCompare(String(a._added)));
  const scenes = candidates.slice(0, MAX_SCENES).map(({ src, alt }) => ({ src, alt }));

  const manifest = {
    generatedAt: new Date().toISOString(),
    source: "catalog",
    scenes,
  };

  console.error(
    `Каталог: ${objects.length} публичных объектов · кандидатов с фото: ${candidates.length} · в манифест: ${scenes.length}`,
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
