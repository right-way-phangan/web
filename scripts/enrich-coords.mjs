// Enrich amoCRM objects with map coordinates.
//
// Most objects store LOCATION_URL as a short Google Maps link
// (maps.app.goo.gl/…) which carries no inline lat/lng — so the site's
// parseLatLng() can't place a pin. This script follows each short link's
// redirect to the full maps URL (which DOES contain `@lat,lng` / `!3d…!4d…`),
// extracts the coordinates, and writes the expanded URL back into LOCATION_URL.
// After that the existing mapper picks up coords with no code change.
//
// Usage:
//   node scripts/enrich-coords.mjs            # dry-run: report only, no writes
//   node scripts/enrich-coords.mjs --write    # resolve AND PATCH amoCRM
//
// Env (from .env.local): AMOCRM_DOMAIN, AMOCRM_TOKEN, AMOCRM_OBJECTS_CATALOG_ID

import { readFile } from "node:fs/promises";
import { fileURLToPath } from "node:url";
import { dirname, join } from "node:path";

const __dirname = dirname(fileURLToPath(import.meta.url));
const WRITE = process.argv.includes("--write");

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
  console.error("Missing AMOCRM_DOMAIN / AMOCRM_TOKEN / AMOCRM_OBJECTS_CATALOG_ID in .env.local");
  process.exit(1);
}

const API = `https://${DOMAIN}/api/v4`;
const headers = {
  Authorization: `Bearer ${TOKEN}`,
  "Content-Type": "application/json",
};

async function amo(method, path, body) {
  const res = await fetch(`${API}${path}`, {
    method,
    headers,
    body: body ? JSON.stringify(body) : undefined,
  });
  if (res.status === 204) return null;
  const text = await res.text();
  if (!res.ok) throw new Error(`amo ${method} ${path} → ${res.status}: ${text.slice(0, 300)}`);
  return text ? JSON.parse(text) : null;
}

// ---- read all catalog elements ----
async function listElements() {
  const out = [];
  let page = 1;
  while (true) {
    const data = await amo("GET", `/catalogs/${CATALOG_ID}/elements?page=${page}&limit=250`);
    const batch = data?._embedded?.elements ?? [];
    out.push(...batch);
    if (batch.length < 250) break;
    page += 1;
  }
  return out;
}

// ---- field map: code → field_id ----
async function fieldIdFor(code) {
  let page = 1;
  while (true) {
    const data = await amo("GET", `/catalogs/${CATALOG_ID}/custom_fields?page=${page}&limit=250`);
    const batch = data?._embedded?.custom_fields ?? [];
    for (const f of batch) if (f.code === code) return f.id;
    if (batch.length < 250) break;
    page += 1;
  }
  return null;
}

// ---- coordinate extraction ----
const PHANGAN_OK = (lat, lng) => lat >= 9 && lat <= 10.5 && lng >= 99 && lng <= 101;

// Mirror of src/lib/amocrm/mapper.ts parseLatLng — does the URL already carry
// usable coords? If so we don't need to touch it.
function hasInlineCoords(url) {
  const m = url.match(/[@?q=]?(-?\d{1,2}\.\d+),\s*(-?\d{1,3}\.\d+)/);
  if (!m) return false;
  return PHANGAN_OK(Number(m[1]), Number(m[2]));
}

// Pull the most precise coords from a full maps URL. Prefer the !3d…!4d… pair
// (the actual pin), then @lat,lng (viewport), then the /maps/search/LAT,+LNG and
// ?q=/query= forms that the "share place" short links expand into.
function extractCoords(url) {
  const d = url.match(/!3d(-?\d+\.\d+)!4d(-?\d+\.\d+)/);
  if (d && PHANGAN_OK(Number(d[1]), Number(d[2]))) {
    return { lat: Number(d[1]), lng: Number(d[2]) };
  }
  const at = url.match(/@(-?\d+\.\d+),(-?\d+\.\d+)/);
  if (at && PHANGAN_OK(Number(at[1]), Number(at[2]))) {
    return { lat: Number(at[1]), lng: Number(at[2]) };
  }
  // /maps/search/9.776,+99.969  ·  ?q=9.776,99.969  ·  query=9.776,+99.969
  const s = url.match(/(?:search\/|[?&](?:q|query|destination)=)(-?\d+\.\d+),\s*\+?\s*(-?\d+\.\d+)/);
  if (s && PHANGAN_OK(Number(s[1]), Number(s[2]))) {
    return { lat: Number(s[1]), lng: Number(s[2]) };
  }
  return null;
}

// Canonical URL the site's parser (mapper.ts parseLatLng) reads cleanly — no "+"
// between the numbers, coords right after ?q=.
function canonicalMapsUrl({ lat, lng }) {
  return `https://www.google.com/maps?q=${lat},${lng}`;
}

// Follow redirects on a short link, return the final expanded URL.
async function resolveShort(url) {
  // Manual redirect chase keeps us robust to multi-hop goo.gl → google.com.
  let current = url;
  for (let i = 0; i < 5; i++) {
    const res = await fetch(current, { method: "GET", redirect: "manual" });
    const loc = res.headers.get("location");
    if (loc) {
      current = loc.startsWith("http") ? loc : new URL(loc, current).href;
      if (extractCoords(current)) return current;
      continue;
    }
    // No redirect header: final page. If body carries coords, use the URL we have.
    return current;
  }
  return current;
}

const FIELD_CODE = "LOCATION_URL";
const RW_CODE = "RW_NUMBER";

const valueOf = (el, code) => {
  for (const cf of el.custom_fields_values ?? []) {
    if (cf.field_code === code || cf.field_id === fieldIds[code]) {
      return cf.values?.[0]?.value != null ? String(cf.values[0].value) : undefined;
    }
  }
  return undefined;
};

const fieldIds = {};

async function main() {
  fieldIds[FIELD_CODE] = await fieldIdFor(FIELD_CODE);
  if (!fieldIds[FIELD_CODE]) throw new Error(`No field for code ${FIELD_CODE}`);

  const elements = await listElements();
  console.error(`Каталог: ${elements.length} элементов. Поле LOCATION_URL = #${fieldIds[FIELD_CODE]}`);

  const stats = { noUrl: 0, alreadyInline: 0, resolved: 0, failed: 0, patched: 0 };
  const failures = [];
  const resolvedList = [];
  const noUrlList = [];

  for (const el of elements) {
    const rw = valueOf(el, RW_CODE) ?? `id${el.id}`;
    const url = valueOf(el, FIELD_CODE);
    if (!url) { stats.noUrl++; noUrlList.push({ rw, status: valueOf(el, "STATUS"), name: el.name }); continue; }
    if (hasInlineCoords(url)) { stats.alreadyInline++; continue; }

    try {
      const expanded = await resolveShort(url);
      const coords = extractCoords(expanded);
      if (!coords) {
        stats.failed++;
        failures.push({ rw, url });
        continue;
      }
      stats.resolved++;
      resolvedList.push({ id: el.id, rw, coords, expanded });
    } catch (err) {
      stats.failed++;
      failures.push({ rw, url, err: String(err).slice(0, 120) });
    }
    // Be gentle with Google's redirector.
    await new Promise((r) => setTimeout(r, 150));
  }

  console.error("\n— Резолв —");
  console.error(`  без URL:                 ${stats.noUrl}`);
  console.error(`  уже с координатами:      ${stats.alreadyInline}`);
  console.error(`  развёрнуто (новые пины): ${stats.resolved}`);
  console.error(`  не распарсилось:         ${stats.failed}`);

  if (resolvedList.length) {
    console.error("\n— Примеры развёрнутых —");
    for (const r of resolvedList.slice(0, 5)) {
      console.error(`  ${r.rw}: ${r.coords.lat.toFixed(5)}, ${r.coords.lng.toFixed(5)}`);
    }
  }
  if (failures.length) {
    console.error("\n— Не удалось (оставлены как есть) —");
    for (const f of failures.slice(0, 20)) {
      console.error(`  ${f.rw}: ${f.url.slice(0, 60)}${f.err ? "  · " + f.err : ""}`);
    }
    if (failures.length > 20) console.error(`  …и ещё ${failures.length - 20}`);
  }

  if (noUrlList.length) {
    console.error("\n— Без Location_url (геометку проставить вручную в amoCRM) —");
    for (const x of noUrlList) {
      console.error(`  ${x.rw}  [${x.status ?? "?"}]  ${x.name}`);
    }
  }

  if (!WRITE) {
    console.error(`\nDRY-RUN. Запись: node scripts/enrich-coords.mjs --write  (обновит ${resolvedList.length} карточек)`);
    return;
  }

  console.error(`\nЗапись в amoCRM: ${resolvedList.length} карточек…`);
  for (const r of resolvedList) {
    const writeUrl = canonicalMapsUrl(r.coords);
    await amo("PATCH", `/catalogs/${CATALOG_ID}/elements`, [
      { id: r.id, custom_fields_values: [{ field_id: fieldIds[FIELD_CODE], values: [{ value: writeUrl }] }] },
    ]);
    stats.patched++;
    process.stderr.write(`  ✓ ${r.rw}\r`);
    await new Promise((res) => setTimeout(res, 120));
  }
  console.error(`\nГотово. Записано: ${stats.patched}.`);
}

main().catch((err) => {
  console.error("FATAL:", err);
  process.exit(1);
});
