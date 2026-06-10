// Create master project cards (RW-P####, TYPE=Project) in amoCRM catalog 9077.
// Mirrors the field set of existing project cards (P0001–P0008). Read-only
// unless --write. Photos are NOT set here — use publish-project.mjs afterwards.
//
//   node scripts/create-projects.mjs                 # dry-run all
//   node scripts/create-projects.mjs --write         # create all
//   node scripts/create-projects.mjs p0009 --write   # one project
//
// Env (.env.local): AMOCRM_DOMAIN, AMOCRM_TOKEN, AMOCRM_OBJECTS_CATALOG_ID
import { readFile } from "node:fs/promises";
import { fileURLToPath } from "node:url";
import { dirname, join } from "node:path";

const __dirname = dirname(fileURLToPath(import.meta.url));
const raw = await readFile(join(__dirname, "..", ".env.local"), "utf8").catch(() => "");
for (const line of raw.split("\n")) { const m = line.match(/^\s*([A-Z0-9_]+)\s*=\s*(.*)\s*$/); if (m && !(m[1] in process.env)) process.env[m[1]] = m[2].trim().replace(/^["']|["']$/g, ""); }
const DOMAIN = process.env.AMOCRM_DOMAIN, TOKEN = process.env.AMOCRM_TOKEN, CATALOG = process.env.AMOCRM_OBJECTS_CATALOG_ID;
if (!DOMAIN || !TOKEN || !CATALOG) { console.error("Missing AMOCRM_* in .env.local"); process.exit(1); }
const API = `https://${DOMAIN}/api/v4`;
const headers = { Authorization: `Bearer ${TOKEN}`, "Content-Type": "application/json" };
async function amo(method, path, body) { const r = await fetch(`${API}${path}`, { method, headers, body: body ? JSON.stringify(body) : undefined }); if (r.status === 204) return null; const t = await r.text(); if (!r.ok) throw new Error(`${method} ${path} → ${r.status}: ${t.slice(0, 400)}`); return t ? JSON.parse(t) : null; }
async function all(kind) { const o = []; let p = 1; while (true) { const d = await amo("GET", `/catalogs/${CATALOG}/${kind}?page=${p}&limit=250`); const b = d?._embedded?.[kind] ?? []; o.push(...b); if (b.length < 250) break; p++; } return o; }

// ---- project datasets ----
const D = {
  // 7 Palms — Chaloklum sea-view apartments. Completion Aug 2025 (delivered).
  p0009: {
    rw: "RW-P0009", type: "Project", status: "Active", stage: "Ready",
    title: "7 Palms Chaloklum — sea-view apartments",
    district: "Chaloklum",
    area: "Studio apartments from 34.73 m² · communal pool · sea & mountain views",
    price: 3200000, bedrooms: 0, pool: true, furnishing: "Full",
    completion: "Delivered August 2025",
    payment: "Interest-free installments · deposit 96,000 THB · extra 5% discount for fast payment",
    desc: "7 Palms is a boutique sea-view apartment building in Chaloklum, on the quiet northern coast of Koh Phangan. Fully furnished, turn-key apartments from 34.73 m², priced from 3,200,000 THB. Combine two or three units into a larger residence (discounts of 200,000–400,000 THB apply). Interest-free installment plans available. A 3D virtual tour of a sample unit is available on request. Walking distance to Chaloklum village, fishing pier and beach.",
  },

  // Ocean Dream House — French architect-designed 4-bedroom villa. Price on request.
  p0010: {
    rw: "RW-P0010", type: "Project", status: "Active", stage: "Off-plan",
    title: "Ocean Dream House — 4-bedroom designer villa",
    area: "4 bedrooms · 4 en-suite bathrooms · indoor & outdoor kitchen · living · private pool",
    bedrooms: 4, bathrooms: 4, pool: true,
    desc: "Ocean Dream House is a French architect-designed four-bedroom villa on Koh Phangan. Each of the four bedrooms has its own en-suite bathroom; the home features an indoor and an outdoor kitchen, a spacious open living area and a private swimming pool, finished to a high European specification. Designed by CONCEPT building pack. Price and plot details on request.",
  },

  // Ban Nok hillside pool villas (same development as RW-P0008 2BR) — 1BR option.
  p0011: {
    rw: "RW-P0011", type: "Project", status: "Active", stage: "Off-plan",
    title: "Ban Nok Hillside — 1-bedroom pool villa",
    district: "Ban Nok",
    area: "1-bedroom pool villa 120 m² · choice of plot 347 / 350 / 353 m² · private pool",
    price: 7700000, bedrooms: 1, pool: true, docType: "Nor Sor 3 Gor",
    completion: "~1 year after signing the developer contract",
    desc: "A single-bedroom pool villa of 120 m² on the green hillside of Ban Nok, southern Koh Phangan, with distant sea views, mountain views and quiet jungle surroundings. Choose your plot (347, 350 or 353 m²). From 7,700,000 THB unfurnished, or 8,100,000 THB fully furnished. Land on Nor Sor 3 Gor title (upgradable to Chanote within ~4 months). Elevation 100–140 m; yellow building zone (footprint up to 1,000 m², height 6 m, 70% coverage). 4.7 km / 9 min to Thong Sala centre, 2.3 km / 5 min to Ban Tai beach. Part of the same hillside development as the 2-bedroom villas (RW-P0008).",
  },

  // Ban Nok hillside pool villas — 3BR & 4BR option.
  p0012: {
    rw: "RW-P0012", type: "Project", status: "Active", stage: "Off-plan",
    title: "Ban Nok Hillside — 3 & 4-bedroom pool villas",
    district: "Ban Nok",
    area: "3BR & 4BR pool villas 272 m² · choice of plot 475 / 486 m² · private pool",
    price: 13406530, bedrooms: 3, pool: true, docType: "Nor Sor 3 Gor",
    completion: "~1 year after signing the developer contract",
    desc: "Spacious 3- and 4-bedroom pool villas of 272 m² on the green hillside of Ban Nok, southern Koh Phangan, with distant sea views, mountain views and quiet jungle surroundings. Choose your plot (475 or 486 m²). 3-bedroom villas from 13,406,530 THB; 4-bedroom villas from 14,356,230 THB (unfurnished). Land on Nor Sor 3 Gor title (upgradable to Chanote within ~4 months). 4.7 km / 9 min to Thong Sala centre, 2.3 km / 5 min to Ban Tai beach. Part of the same hillside development as the 1- and 2-bedroom villas (RW-P0011, RW-P0008).",
  },

  // K Villas — live modern pool-villa project (more data to be supplied by owner).
  p0013: {
    rw: "RW-P0013", type: "Project", status: "Active", stage: "Off-plan",
    title: "K Villas — modern pool villas",
    area: "Modern single-storey pool villas with covered terraces and tropical garden",
    pool: true,
    desc: "K Villas is a collection of contemporary single-storey pool villas on Koh Phangan, with clean white architecture, private swimming pools, covered outdoor lounge and dining pergolas, and landscaped tropical gardens. Several layouts available, including a long-pool design. Pricing, plot sizes and availability on request.",
  },

  // --- Hidden drafts (Withdrawn): photos/thin data only, awaiting owner details ---
  p0014: { rw: "RW-P0014", type: "Villa", status: "Withdrawn", stage: "Off-plan", title: "Alona Villas (draft — awaiting data)", desc: "Draft listing. Renders on file; price, area, district and tenure to be confirmed with the owner before publication." },
  p0015: { rw: "RW-P0015", type: "Villa", status: "Withdrawn", stage: "Off-plan", title: "Dennis Project / Estate Island (draft — awaiting data)", desc: "Draft listing (\"7 raevy\" / Dennis Project, Estate Island). Only a topographic survey and a few photos on file; full project details to be confirmed with the developer before publication." },
  p0016: { rw: "RW-P0016", type: "Villa", status: "Withdrawn", stage: "Off-plan", title: "Project Nu (draft — awaiting data)", desc: "Draft listing. Only a draft PDF on file; all project details to be confirmed before publication." },
};

const fields = await all("custom_fields");
const codeId = {}, enumId = {};
for (const f of fields) { if (!f.code) continue; codeId[f.code] = f.id; for (const e of f.enums ?? []) enumId[`${f.code} ${String(e.value).toLowerCase()}`] = e.id; }
const cfText = (c, v) => (v == null || v === "" ? null : { field_id: codeId[c], values: [{ value: v }] });
const cfNum = (c, v) => (v == null ? null : { field_id: codeId[c], values: [{ value: Math.round(v) }] });
const cfEnum = (c, v) => { const i = enumId[`${c} ${String(v).toLowerCase()}`]; return i ? { field_id: codeId[c], values: [{ enum_id: i }] } : null; };
const cfBool = (c, on) => (on ? { field_id: codeId[c], values: [{ value: true }] } : null);

function build(s) {
  const cf = [
    cfText("RW_NUMBER", s.rw),
    cfEnum("STATUS", s.status),
    cfEnum("TYPE", s.type),
    cfText("TITLE_EN", s.title),
    cfText("DESCRIPTION_RAW", s.desc),
    s.district ? cfEnum("DISTRICT", s.district) : null,
    s.docType ? cfEnum("DOC_TYPE", s.docType) : null,
    cfText("AREA", s.area),
    cfNum("PRICE_THB", s.price),
    cfNum("BEDROOMS", s.bedrooms),
    cfNum("BATHROOMS", s.bathrooms),
    cfEnum("STAGE", s.stage),
    s.completion ? cfText("COMPLETION", s.completion) : null,
    s.payment ? cfText("PAYMENT_TERMS", s.payment) : null,
    s.furnishing ? cfEnum("FURNISHING", s.furnishing) : null,
    s.pool ? cfBool("POOL", true) : null,
    cfNum("DATE_ADDED", Math.floor(Date.now() / 1000)),
  ].filter(Boolean);
  return { name: `${s.rw} Project ${s.district ?? "Koh Phangan"}`, custom_fields_values: cf };
}

const WRITE = process.argv.includes("--write");
let keys = process.argv.slice(2).filter(a => !a.startsWith("--"));
if (!keys.length) keys = Object.keys(D);

for (const k of keys) {
  const s = D[k]; if (!s) { console.error(`Unknown "${k}"`); continue; }
  const p = build(s);
  console.log(`\n### ${k} → ${s.rw} [${s.status}/${s.stage}] ${s.title}`);
  console.log(`  price: ${s.price ? "฿" + (s.price / 1e6).toFixed(2) + "M" : "on request"}  district: ${s.district ?? "—"}  beds: ${s.bedrooms ?? "—"}`);
  console.log(`  fields: ${p.custom_fields_values.map(c => Object.keys(codeId).find(x => codeId[x] === c.field_id)).join(", ")}`);
  if (!WRITE) { console.log("  (dry-run — add --write)"); continue; }
  const r = await amo("POST", `/catalogs/${CATALOG}/elements`, [{ name: p.name, custom_fields_values: p.custom_fields_values }]);
  console.log(`  ✓ created id=${r?._embedded?.elements?.[0]?.id}`);
  await new Promise(res => setTimeout(res, 200));
}
