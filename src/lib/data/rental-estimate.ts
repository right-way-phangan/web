import type { RentalMarket } from "./rental-market";

export type Scenario = "conservative" | "base" | "high" | "measured";

export type NightlyEstimate = {
  nightlyRateThb: number;
  occupancyPct: number;
  basis: string;
  n: number;
  measuredOk: boolean;
  p25?: number | null;
  p75?: number | null;
  nUsed: number;
};

/** Districts with fewer measured listings than this don't get a measured occupancy. */
export const OCC_MIN_SAMPLE = 15;

/**
 * Nightly rate + occupancy for a district, straight from the rental-market
 * snapshot. Priority: district×bedroom median (most specific) → district median
 * scaled by property-type factor → district median. Pure so server pages can
 * seed the calculator from it; the in-calculator preset re-exports it.
 */
export function estimateNightly(
  market: RentalMarket,
  district: string,
  bedrooms: number | null,
  type = "",
  scenario: Scenario = "base",
): NightlyEstimate | null {
  const d = market.districts.find((x) => x.name === district);
  if (!d) return null;
  let nightly = d.adrMedian;
  let basis = "district median";

  const br = bedrooms;
  const db =
    br != null && market.districtBedrooms.find((x) => x.district === district && x.bedrooms === br);
  if (db) {
    nightly = db.adrMedian;
    basis = `${br === 0 ? "studio" : `${br}-bedroom`} comps in ${district}`;
  } else if (type) {
    const tt = market.byType.find((x) => x.type === type);
    if (tt && market.meta.adrMedianAll) {
      nightly = Math.round(d.adrMedian * (tt.adrMedian / market.meta.adrMedianAll));
      basis = `${tt.label.toLowerCase()} in ${district}`;
    }
  }
  const measuredOk = d.occupancyMeasured != null && (d.nOccupancy ?? 0) >= OCC_MIN_SAMPLE;
  const occupancyPct =
    scenario === "measured" && measuredOk
      ? Math.round((d.occupancyMeasured as number) * 100)
      : Math.round(market.meta.occupancy[scenario === "measured" ? "base" : scenario] * 100);
  const nUsed = db ? db.n : d.n;
  return {
    nightlyRateThb: nightly,
    occupancyPct,
    basis,
    n: d.n,
    measuredOk,
    p25: db ? db.adrP25 : d.adrP25,
    p75: db ? db.adrP75 : d.adrP75,
    nUsed,
  };
}

/**
 * Calculator seed for an object page: nightly from the district comps, and the
 * MOST CAUTIOUS occupancy we can defend — measured forward-90d when the sample
 * is big enough, otherwise the conservative scenario. The generic defaults
 * (฿8 000 × 50%) rated every villa "strong" regardless of price or district.
 */
export function objectCalcSeed(
  market: RentalMarket,
  district: string | null | undefined,
  bedrooms: number | null | undefined,
  type = "",
): { nightlyRateThb: number; occupancyPct: number; basis: string; n: number } | null {
  if (!district) return null;
  const est = estimateNightly(market, district, bedrooms ?? null, type, "measured");
  if (!est) return null;
  const occupancyPct = est.measuredOk
    ? est.occupancyPct
    : Math.round(market.meta.occupancy.conservative * 100);
  return { nightlyRateThb: est.nightlyRateThb, occupancyPct, basis: est.basis, n: est.nUsed };
}
