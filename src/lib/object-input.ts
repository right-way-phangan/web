import type { TitleAttrs } from "@/lib/generate/object-title";

/**
 * Admin-form object input and its helpers. Was part of the amoCRM object writer
 * (src/lib/amocrm/object-writer.ts) — amoCRM removed 2026-11-16; objects are
 * created via the backend POST /objects, which takes this same shape.
 */

/** Validation error for bad admin-form input (e.g. unknown parent project).
 * Surfaced to the user verbatim, unlike unexpected/API errors. */
export class ObjectInputError extends Error {}

/** Structured seller contact captured at intake (own-DB backend stores it). */
export interface ObjectContactInput {
  role?: string; // owner | broker | caretaker | lawyer | other
  name?: string;
  phone?: string;
  line?: string;
  whatsapp?: string;
  telegram?: string;
  isPrimary?: boolean;
}

export interface NewObjectInput {
  type: string;
  district?: string;
  documentType?: string;
  tenure?: string[];
  area?: string; // free text, e.g. "5 rai 2 ngan / 8400 m²"
  pricePerRai?: number;
  rentPerRaiMonth?: number;
  rentPerMonth?: number;
  leaseTermYears?: number;
  leaseEscalation?: string; // free text, e.g. "8% каждые 5 лет"
  leaseAddTerms?: string;
  buildingRules?: string;
  priceThb?: number;
  owner?: string; // legacy free-text (amoCRM OWNER field + own-DB fallback seed)
  contacts?: ObjectContactInput[]; // structured seller contacts (own-DB backend)
  commission?: string;
  locationUrl?: string;
  // Traced plot contour ([lat, lng] ring). Stored by the own-DB backend only;
  // the amoCRM writer (legacy fallback) ignores it — no catalog field for it.
  plotPolygon?: Array<[number, number]>;
  zone?: string;
  roadType?: string;
  waterType?: string;
  internetType?: string;
  terrain?: string;
  features?: string[]; // codes from FEATURES
  bedrooms?: number;
  bathrooms?: number;
  buildYear?: number;
  condition?: string;
  villaFeatures?: string[]; // codes from VILLA_FEATURES
  // Off-plan / developer project
  stage?: string;
  developer?: string;
  completion?: string;
  paymentTerms?: string;
  furnishing?: string;
  netYieldPct?: number;
  estNetIncomeYear?: number;
  leasePrepayment?: number; // leasehold land lump sum, THB
  unitsTotal?: number;
  unitsAvailable?: number;
  // Project landing extras (textarea custom fields, one item per line)
  videoUrls?: string; // VIDEO_URLS
  floorplanUrls?: string; // FLOORPLAN_URLS
  priceStages?: string; // PRICE_STAGES — "stage | price"
  timeline?: string; // TIMELINE — "date | event"
  team?: string; // TEAM — "role | name"
  description?: string; // → DESCRIPTION_RAW
  title?: string; // manual TITLE_EN from the form; empty → auto-generated
  photoUrls?: string[]; // public images → PHOTOS
  docUrls?: Array<{ name: string; url: string }>; // non-public documents → DOCS
  // Unit-of-project intake: when set, the card is numbered RW-P####-N (a unit
  // of that project) instead of the next free number in its own type series.
  parentProjectRw?: string;
  status?: string; // STATUS enum; defaults to "Active". Units may be Sold/Reserved.
}

/**
 * Parse area free-text → {sqm, rai}. m² is the source of truth for analytics
 * (precise); rai is a rounded int for UI only. 1 rai = 1600 m², 1 ngan = 400,
 * 1 sq.wah = 4. If both rai-breakdown and m² appear, m² wins.
 */
export function parseArea(areaText?: string): { sqm?: number; rai?: number } {
  if (!areaText) return {};
  const s = String(areaText);
  const mRai = s.match(/(\d+(?:[.,]\d+)?)\s*rai\b/i);
  const mNgan = s.match(/(\d+(?:[.,]\d+)?)\s*ngan\b/i);
  const mWah = s.match(/(\d+(?:[.,]\d+)?)\s*sq\.?\s*wah\b/i);
  const mSqm = s.match(/(\d+(?:[\s,]\d{3})*(?:[.,]\d+)?)\s*m[²2]\b/i);
  const f = (m: RegExpMatchArray | null) =>
    m ? parseFloat(m[1].replace(",", ".").replace(/\s/g, "")) : 0;

  let sqm: number | undefined;
  if (mSqm) {
    const n = parseFloat(mSqm[1].replace(/[\s,]/g, ""));
    sqm = Number.isFinite(n) ? Math.round(n) : undefined;
  }
  let raiF = f(mRai) + f(mNgan) * 0.25 + f(mWah) * 0.0025;
  if (raiF === 0 && sqm != null) raiF = sqm / 1600;
  if (sqm == null && raiF > 0) sqm = Math.round(raiF * 1600);
  const rai = raiF >= 0.5 ? Math.max(1, Math.round(raiF)) : undefined;
  return { sqm, rai };
}

/** Map the admin-form input to the attribute shape the title generator wants. */
export function titleAttrsFromInput(input: NewObjectInput, rwNumber: string): TitleAttrs {
  const feat = new Set(input.features ?? []);
  const vf = new Set(input.villaFeatures ?? []);
  const { rai } = parseArea(input.area);
  return {
    rwNumber,
    type: input.type,
    district: input.district,
    rai,
    bedrooms: input.bedrooms,
    unitsTotal: input.unitsTotal,
    documentType: input.documentType,
    beachfront: feat.has("BEACHFRONT"),
    seaView: feat.has("SEA_VIEW"),
    mountainView: feat.has("MOUNTAIN_VIEW"),
    jungleView: feat.has("JUNGLE_VIEW"),
    quiet: feat.has("QUIET"),
    flat: input.terrain === "Flat",
    pool: vf.has("POOL"),
    brandNew: input.condition === "New",
    offplan: input.type === "Project" || input.stage === "Off-plan",
  };
}
