import {
  type RentalMarket,
  MGMT_FEE,
  confidenceOf,
  getAppreciation,
} from "@/lib/data/rental-market";

/**
 * Pure rate-estimation math for the /insights "Rate check" widget. No React, no
 * fetch — runs entirely over the bundled rental-market snapshot, so results are
 * instant and free at any traffic.
 *
 * The ADR resolve chain mirrors the valuation engine's `pickAdr`
 * (engine.ts:886): district×bedrooms (n≥3) → district median → island×bedrooms →
 * island median, then conservative feature multipliers. IMPORTANT: it applies
 * the engine's *conservative* premiums (pool ×1.25, sea view ×1.2 — the
 * income.adr_pool_premium / income.adr_seaview_premium defaults), NOT the raw
 * measured featurePremiums (+138% pool etc. are with/without-median comparisons
 * confounded by size and class). The measured premium is context, not a driver.
 */

/** Mirror of engine.ts income.adr_*_premium defaults — keep the two in sync. */
export const POOL_PREMIUM = 1.25;
export const SEAVIEW_PREMIUM = 1.2;
/** Long-term monthly ≈ short-term annual × this (engine income.longterm_factor). */
export const LONGTERM_FACTOR = 0.65;
const DAYS_PER_MONTH = 30.4;
/** districtBedrooms cells below this sample fall back to the district median. */
const DB_MIN_SAMPLE = 3;

export type OccScenario = "conservative" | "base" | "high" | "measured";
export type RateBasis =
  | "districtBedrooms"
  | "districtType"
  | "district"
  | "islandBedrooms"
  | "island";

export interface RateSubject {
  district: string; // join key = RmDistrict.name
  type?: string; // byType key ("villa" | "house" | ...)
  bedrooms?: number | null; // 0 = studio, null = not specified
  pool?: boolean;
  seaView?: boolean;
}

export interface RateEstimate {
  nightly: number; // THB, feature premiums applied
  nightlyBase: number; // before premiums
  p25: number | null;
  p75: number | null;
  basis: RateBasis;
  n: number;
  confidence: "low" | "medium" | "high";
  occPct: number; // resolved occupancy for the chosen scenario, %
  occMeasured: number | null; // district measured 90d occupancy, if any
  monthly: number; // nightly × 30.4 × occ
  annualGross: number; // nightly × 365 × occ
  annualNet: number; // gross after 25% management
  longTermMonthly: number; // long-term-rent equivalent
  premiumApplied: number; // combined feature multiplier (1 = none)
}

export interface MonthForecast {
  month: string; // 3-letter month label
  index: number; // Google-Trends demand index for that month
  nightly: number; // projected nightly rate
  monthly: number; // projected monthly income at chosen occupancy
  tone: "peak" | "high" | "mid" | "low";
}

export interface RateForecast {
  months: MonthForecast[];
  peakMonth: string;
  lowMonth: string;
  /** Highest projected nightly in the window vs the current rate, %. */
  deltaToPeakPct: number;
}

function occForScenario(
  m: RentalMarket,
  scenario: OccScenario,
  measured: number | null,
): number {
  if (scenario === "measured" && measured != null) return measured;
  const key = scenario === "measured" ? "base" : scenario;
  return m.meta.occupancy[key];
}

/**
 * Resolve a nightly rate + income for a subject. Returns null only when the
 * market has no usable figure at all (empty snapshot).
 */
export function estimateRate(
  s: RateSubject,
  m: RentalMarket,
  scenario: OccScenario,
): RateEstimate | null {
  const district = s.district
    ? m.districts.find((d) => d.name.toLowerCase() === s.district.toLowerCase())
    : undefined;

  let base: number | null = null;
  let basis: RateBasis = "island";
  let n = 0;
  let p25: number | null = null;
  let p75: number | null = null;

  const br = s.bedrooms == null ? null : Math.round(s.bedrooms);

  // 1. district × bedrooms (n ≥ 3)
  const db =
    br != null && s.district
      ? m.districtBedrooms.find(
          (x) =>
            x.district.toLowerCase() === s.district.toLowerCase() &&
            x.bedrooms === br &&
            x.n >= DB_MIN_SAMPLE,
        )
      : undefined;

  if (db) {
    base = db.adrMedian;
    basis = "districtBedrooms";
    n = db.n;
    // districtBedrooms p25/p75 arrive with the pipeline (optional); until then
    // scale the district band to the cell median.
    if (db.adrP25 != null && db.adrP75 != null) {
      p25 = db.adrP25;
      p75 = db.adrP75;
    } else if (district?.adrP25 != null && district.adrP75 != null && district.adrMedian) {
      const k = db.adrMedian / district.adrMedian;
      p25 = Math.round(district.adrP25 * k);
      p75 = Math.round(district.adrP75 * k);
    }
  } else if (district) {
    // 2. district median × type factor (when a type is chosen), else district median
    const typeRow = s.type ? m.byType.find((x) => x.type === s.type) : undefined;
    if (typeRow && m.meta.adrMedianAll) {
      base = Math.round(district.adrMedian * (typeRow.adrMedian / m.meta.adrMedianAll));
      basis = "districtType";
    } else {
      base = district.adrMedian;
      basis = "district";
    }
    n = district.n;
    if (district.adrP25 != null && district.adrP75 != null && district.adrMedian) {
      const k = base / district.adrMedian;
      p25 = Math.round(district.adrP25 * k);
      p75 = Math.round(district.adrP75 * k);
    }
  } else if (br != null) {
    // 3. island × bedrooms
    const bb = m.byBedrooms.find((x) => x.bedrooms === br);
    if (bb?.adrMedian) {
      base = bb.adrMedian;
      basis = "islandBedrooms";
      n = bb.n;
    }
  }

  // 4. island median fallback
  if (base == null) {
    if (m.meta.adrMedianAll == null) return null;
    base = m.meta.adrMedianAll;
    basis = "island";
    n = m.meta.sample;
  }

  const premium = (s.pool ? POOL_PREMIUM : 1) * (s.seaView ? SEAVIEW_PREMIUM : 1);
  const nightly = Math.round(base * premium);
  if (p25 != null) p25 = Math.round(p25 * premium);
  if (p75 != null) p75 = Math.round(p75 * premium);

  const occMeasured =
    district && district.occupancyMeasured != null && (district.nOccupancy ?? 0) >= 5
      ? district.occupancyMeasured
      : null;
  const occ = occForScenario(m, scenario, occMeasured);
  const occPct = Math.round(occ * 100);

  const annualGross = Math.round(nightly * 365 * occ);
  const monthly = Math.round(nightly * DAYS_PER_MONTH * occ);
  const annualNet = Math.round(annualGross * (1 - MGMT_FEE));
  const longTermMonthly = Math.round((annualGross * LONGTERM_FACTOR) / 12);

  return {
    nightly,
    nightlyBase: base,
    p25,
    p75,
    basis,
    n,
    confidence: confidenceOf(n),
    occPct,
    occMeasured,
    monthly,
    annualGross,
    annualNet,
    longTermMonthly,
    premiumApplied: premium,
  };
}

/** Month index (0=Jan) of the snapshot date; defaults to current-ish if unparseable. */
function snapshotMonthIndex(m: RentalMarket): number {
  const md = /^\d{4}-(\d{2})-\d{2}/.exec(m.meta.date);
  if (md) return Math.max(0, Math.min(11, Number(md[1]) - 1));
  return 0;
}

/**
 * Project the nightly rate over the coming `monthsAhead` months using the
 * Google-Trends demand index as a seasonal pricing-power proxy, plus the
 * data-anchored appreciation band pro-rated monthly. This is a demand-shaped
 * indication, NOT a guaranteed rate — surface that caveat in the UI.
 */
export function forecastMonths(
  est: RateEstimate,
  m: RentalMarket,
  monthsAhead: number,
): RateForecast | null {
  const seas = m.seasonality;
  if (!seas || !seas.index.some((v) => v != null)) return null;

  const cur = snapshotMonthIndex(m);
  const curIndex = seas.index[cur] ?? null;
  if (curIndex == null || curIndex === 0) return null;

  const apprMonthly = getAppreciation(m).base / 100 / 12;
  const occFrac = est.occPct / 100;

  const months: MonthForecast[] = [];
  const vals = seas.index.filter((v): v is number => v != null);
  const avg = vals.reduce((s, v) => s + v, 0) / vals.length;
  const maxV = Math.max(...vals);
  const minV = Math.min(...vals);

  for (let step = 1; step <= monthsAhead; step++) {
    const mi = (cur + step) % 12;
    const idx = seas.index[mi];
    if (idx == null) continue;
    const seasonal = idx / curIndex;
    const growth = 1 + apprMonthly * step;
    const nightly = Math.round(est.nightly * seasonal * growth);
    months.push({
      month: (seas.months[mi] ?? "").slice(0, 3),
      index: idx,
      nightly,
      monthly: Math.round(nightly * DAYS_PER_MONTH * occFrac),
      tone: idx === maxV ? "peak" : idx === minV ? "low" : idx > avg ? "high" : "mid",
    });
  }
  if (months.length === 0) return null;

  const peakNightly = Math.max(...months.map((x) => x.nightly));
  const deltaToPeakPct = est.nightly ? Math.round(((peakNightly - est.nightly) / est.nightly) * 100) : 0;

  return {
    months,
    peakMonth: seas.peakMonth,
    lowMonth: seas.lowMonth,
    deltaToPeakPct,
  };
}
