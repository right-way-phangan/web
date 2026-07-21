import data from "@/content/rental-market.json";
import type { RealEstateObject } from "@/types/object";

/**
 * Rental-market analytics, generated offline by `analytics/rental_market/`
 * (Airbnb snapshot → district × config medians). Bundled as static JSON — no
 * runtime scrape. Regenerate with `python3 analytics/rental_market/run.py`.
 *
 * Occupancy is an assumption (Airbnb doesn't publish it); annual revenue is
 * ADR × 365 × occupancy across three scenarios. Surface that caveat in the UI.
 */

export interface RmSource {
  key: string;
  label: string;
  n: number;
  adrMedian: number | null;
}

export interface RmMeta {
  date: string;
  currency: string;
  source: string;
  /** Per-platform breakdown (Airbnb/Booking/Agoda/Vrbo) for the source-mix strip. */
  sources?: RmSource[];
  /** Total listings collected across sources vs unique after cross-source dedup. */
  dedup?: { total: number; unique: number };
  window: string;
  sample: number;
  withDistrict: number;
  adrMedianAll: number | null;
  occupancy: { conservative: number; base: number; high: number };
  occupancyMeasuredAll?: number | null;
  nOccupancyAll?: number;
  thbPerUsd: number;
  /** How many listings got the occupancy/bedrooms enrich pass (method transparency). */
  enriched?: number;
  /**
   * Data-anchored capital-appreciation band (%/yr) for the ROI calculator's
   * "Expected growth" presets, so the figure is sourced rather than guessed.
   * `base` is the headline; `source`/`asOf` document provenance. Computed in
   * `analytics/rental_market/export_web.py` — from measured ADR YoY once the
   * snapshot history spans ≥12 months, otherwise an external macro anchor
   * (Thailand house-price index + island demand premium). Still an estimate,
   * never a forecast (see calculator disclaimer).
   */
  appreciation?: { conservative: number; base: number; high: number; source: string; asOf: string };
}

export interface RmDistrict {
  name: string;
  slug: string | null;
  n: number;
  adrMedian: number;
  adrP25: number | null;
  adrP75: number | null;
  reviewsMedian: number | null;
  guestFavoriteShare: number | null;
  annual: { conservative?: number; base?: number; high?: number };
  occupancyMeasured?: number | null;
  nOccupancy?: number;
  annualMeasured?: number | null;
  /** Supply signal vs island median: "under" (niche) / "saturated" (competitive). */
  supplyTag?: "under" | "saturated" | null;
  /** Indicative income ÷ reference-plot land cost (build excluded), %. */
  yieldOnLandPct?: number | null;
}

/** Per-platform ADR triangulation: agreement across sources raises confidence. */
export interface RmCrossCheck {
  sources: { key: string; label: string; n: number; nPriced: number; adrMedian: number | null }[];
  spreadPct: number | null;
  agree: boolean;
  /** spreadPct is size-controlled (median of per-bedroom villa spreads), not the
   * raw island-median spread — so the verdict isn't skewed by sample composition. */
  sizeControlled?: boolean;
}

/** Villa nightly rate by bedroom count, Airbnb vs Booking — a second source
 * validating the price×bedrooms curve. Only bedroom counts where both
 * platforms have ≥8 villas. */
export interface RmBedroomCrossCheck {
  bedrooms: number;
  airbnb: { adrMedian: number | null; n: number };
  booking: { adrMedian: number | null; n: number };
}

export interface RmType {
  type: string;
  label: string;
  n: number;
  adrMedian: number;
  reviewsMedian: number | null;
  ratingMedian: number | null;
}

export interface RmBedrooms {
  bedrooms: number;
  n: number;
  adrMedian: number;
  reviewsMedian: number | null;
}

export interface RmDistrictBedrooms {
  district: string;
  slug: string | null;
  bedrooms: number;
  n: number;
  adrMedian: number;
  /** p25–p75 nightly band for this district×bedroom cell (pipeline, n≥5). */
  adrP25?: number | null;
  adrP75?: number | null;
}

export interface RmFeaturePremium {
  key: string;
  label: string;
  premiumPct: number | null;
  adrWith: number | null;
  adrWithout: number | null;
  nWith: number;
  nWithout: number;
}

export interface RmSeasonal {
  dates: string[];
  overall: (number | null)[];
  districts: Record<string, (number | null)[]>;
  points: number;
}

/** Search-demand seasonality from Google Trends (monthly index, peak = 100). */
export interface RmSeasonality {
  months: string[];
  index: (number | null)[];
  peakMonth: string;
  lowMonth: string;
  keywords: string[];
  source: string;
  asOf: string;
}

/** Market asking land price per m² (FazWaz) — context to the own-base CapEx. */
export interface RmCapexMarket {
  pricePerSqmMedian: number | null;
  n: number;
  source?: string;
  byDistrict?: Record<string, number>;
}

export interface RentalMarket {
  meta: RmMeta;
  ranking: string[];
  districts: RmDistrict[];
  byType: RmType[];
  byBedrooms: RmBedrooms[];
  districtBedrooms: RmDistrictBedrooms[];
  featurePremiums: RmFeaturePremium[];
  capex: {
    pricePerSqmMedian: number | null;
    nSale: number;
    source?: string;
    byDistrict?: Record<string, number>;
    market?: RmCapexMarket | null;
  };
  seasonal: RmSeasonal;
  seasonality?: RmSeasonality | null;
  crossCheck?: RmCrossCheck | null;
  bedroomCrossCheck?: RmBedroomCrossCheck[] | null;
}

/**
 * Fallback appreciation band when the snapshot history can't yet derive one.
 * Anchored to Thailand's nationwide house-price index (BoT/REIC, broadly
 * 3–5%/yr over recent years) with an island demand premium on the high end —
 * an indicative range the user can override, not a Right Way forecast.
 */
export const DEFAULT_APPRECIATION = {
  conservative: 3,
  base: 5,
  high: 8,
  source: "TH house-price index (BoT/REIC) + Phangan demand premium",
  asOf: "2026",
} as const;

/** Appreciation band for the calculator — always returns a usable block. */
export function getAppreciation(m: RentalMarket): {
  conservative: number;
  base: number;
  high: number;
  source: string;
  asOf: string;
} {
  return m.meta.appreciation ?? DEFAULT_APPRECIATION;
}

const EMPTY_MARKET: RentalMarket = {
  meta: {
    date: "—",
    currency: "THB",
    source: "Airbnb",
    window: "—",
    sample: 0,
    withDistrict: 0,
    adrMedianAll: null,
    occupancy: { conservative: 0.4, base: 0.55, high: 0.7 },
    occupancyMeasuredAll: null,
    nOccupancyAll: 0,
    thbPerUsd: 36.5,
    appreciation: DEFAULT_APPRECIATION,
  },
  ranking: [],
  districts: [],
  byType: [],
  byBedrooms: [],
  districtBedrooms: [],
  featurePremiums: [],
  capex: { pricePerSqmMedian: null, nSale: 0, source: "none", byDistrict: {}, market: null },
  seasonal: { dates: [], overall: [], districts: {}, points: 0 },
  seasonality: null,
  crossCheck: null,
};

export interface DistrictMarket {
  district: RmDistrict;
  landPerSqm: number | null;
  bedroomConfigs: RmDistrictBedrooms[];
  annualThb: number;
  baseOccPct: number;
  measuredOcc: number | null;
  islandRank: number; // 1-based position by nightly rate
  islandCount: number;
}

/**
 * Market view for a single district, keyed by amoCRM district name (amoName on
 * the district content). Used by /districts/[slug]. Null if no rental data.
 */
export function getDistrictMarket(amoName: string): DistrictMarket | null {
  const m = getRentalMarket();
  const idx = m.districts.findIndex((d) => d.name === amoName);
  if (idx === -1) return null;
  const district = m.districts[idx];
  return {
    district,
    landPerSqm: m.capex.byDistrict?.[amoName] ?? null,
    bedroomConfigs: m.districtBedrooms
      .filter((x) => x.district === amoName)
      .sort((a, b) => a.bedrooms - b.bedrooms),
    annualThb: effectiveAnnualThb(district, m.meta),
    baseOccPct: Math.round(m.meta.occupancy.base * 100),
    measuredOcc: measuredOccupancy(district, m.meta),
    islandRank: idx + 1,
    islandCount: m.districts.length,
  };
}

export function getRentalMarket(): RentalMarket {
  const d = data as Partial<RentalMarket> | undefined;
  // Defensive: if the generated JSON is ever empty/missing, degrade to an empty
  // shape so /insights and the calculator render instead of crashing.
  if (!d || !Array.isArray(d.districts) || d.districts.length === 0) {
    return EMPTY_MARKET;
  }
  return d as RentalMarket;
}

export function hasRentalMarket(): boolean {
  return getRentalMarket().districts.length > 0;
}

/** Site district slugs that actually have a /districts/[slug] page. */
export const DISTRICT_PAGE_SLUGS = new Set([
  "sri-thanu",
  "haad-salad",
  "madeau-wan",
  "ban-tai",
  "chaloklum",
  "haad-yao",
  "ban-khai",
]);

/** THB → "฿1,234" / "฿1.2M" compact. */
export function fmtThb(v: number | null | undefined, compact = false): string {
  if (v == null) return "—";
  if (compact && v >= 1_000_000) return `฿${(v / 1_000_000).toFixed(1)}M`;
  if (compact && v >= 1_000) return `฿${Math.round(v / 1000)}k`;
  return `฿${Math.round(v).toLocaleString("en-US")}`;
}

export type DisplayCurrency = "THB" | "USD";

/** Build a money formatter that renders THB values in THB or USD (via snapshot FX). */
export function makeMoneyFmt(currency: DisplayCurrency, thbPerUsd: number) {
  return (thb: number | null | undefined, compact = false): string => {
    if (thb == null) return "—";
    if (currency === "THB") return fmtThb(thb, compact);
    const usd = thb / (thbPerUsd || 36.5);
    if (compact && usd >= 1_000_000) return `$${(usd / 1_000_000).toFixed(1)}M`;
    if (compact && usd >= 1_000) return `$${Math.round(usd / 1000)}k`;
    return `$${Math.round(usd).toLocaleString("en-US")}`;
  };
}

export type MoneyFmt = ReturnType<typeof makeMoneyFmt>;

/* --------------------- Occupancy / yield helpers ------------------------ */

/** STR running-cost defaults (mirror the ROI calculator). */
export const MGMT_FEE = 0.25; // % of gross rent
export const OPEX_PCT = 0.03; // % of price / year
const OCC_MIN_SAMPLE = 5;

/**
 * Annual income projection uses the BASE scenario occupancy — a single forward
 * 90-day snapshot (often low season) can't represent yearly occupancy, so we
 * don't let it drive the headline. Measured occupancy is surfaced separately
 * (see measuredOccupancy) as a current-demand indicator.
 */
export function effectiveAnnualThb(d: RmDistrict, meta: RmMeta): number {
  return Math.round(d.adrMedian * 365 * meta.occupancy.base);
}

/** Measured forward-90d occupancy of *active* listings in a district, or null. */
export function measuredOccupancy(d: RmDistrict | null, _meta: RmMeta): number | null {
  if (d && d.occupancyMeasured != null && (d.nOccupancy ?? 0) >= OCC_MIN_SAMPLE) {
    return d.occupancyMeasured;
  }
  return null;
}

/** Sample-size confidence for a group. */
export function confidenceOf(n: number): "low" | "medium" | "high" {
  if (n < 5) return "low";
  if (n < 12) return "medium";
  return "high";
}


/* ----------------- Inventory × market overlay (calc) -------------------- */

export interface InventoryYieldRow {
  rwNumber: string;
  title: string;
  type: string;
  district: string;
  slug: string | null;
  priceThb: number;
  bedrooms?: number;
  districtAdr: number;
  occUsed: number;
  measuredOcc: number | null; // current 90d demand of active listings (indicator)
  annualGrossThb: number;
  grossYieldPct: number;
  netYieldPct: number;
  paybackYears: number;
}

/** Property types that can be rented out (exclude bare land). */
const RENTABLE_TYPES = new Set(["Villa", "House", "Apartment", "Project"]);

/**
 * Cross our active listings (amoCRM) with district nightly rates: for each
 * rentable listing in a district we have ADR for, estimate gross rental yield
 * and payback at base occupancy. Bridges /insights ↔ real inventory.
 */
export function buildInventoryYield(
  objects: RealEstateObject[],
  market: RentalMarket,
  limit = 8,
): InventoryYieldRow[] {
  const adrByDistrict = new Map(market.districts.map((d) => [d.name, d]));
  const rows: InventoryYieldRow[] = [];

  for (const o of objects) {
    if (!o.district || o.priceThb == null || o.priceThb <= 0) continue;
    if (!RENTABLE_TYPES.has(o.type)) continue;
    const d = adrByDistrict.get(o.district);
    if (!d) continue;
    const occ = market.meta.occupancy.base; // annual basis = scenario, not 90d
    const annualGrossThb = Math.round(d.adrMedian * 365 * occ);
    if (annualGrossThb <= 0) continue;
    // Net = gross rent after management, minus annual opex (% of price).
    const annualNet = annualGrossThb * (1 - MGMT_FEE) - o.priceThb * OPEX_PCT;
    rows.push({
      rwNumber: o.rwNumber,
      title: o.titleEn,
      type: o.type,
      district: o.district,
      slug: d.slug,
      priceThb: o.priceThb,
      bedrooms: o.bedrooms,
      districtAdr: d.adrMedian,
      occUsed: occ,
      measuredOcc: measuredOccupancy(d, market.meta),
      annualGrossThb,
      grossYieldPct: Math.round((annualGrossThb / o.priceThb) * 1000) / 10,
      netYieldPct: Math.round((annualNet / o.priceThb) * 1000) / 10,
      paybackYears: annualNet > 0 ? Math.round((o.priceThb / annualNet) * 10) / 10 : 0,
    });
  }
  rows.sort((a, b) => b.netYieldPct - a.netYieldPct);
  return rows.slice(0, limit);
}
