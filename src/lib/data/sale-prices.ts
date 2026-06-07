import type { RealEstateObject } from "@/types/object";

/**
 * Sale-price aggregation by district, derived live from the public catalog
 * (amoCRM). Mirrors the logic of `bot/scripts/price_benchmark.py` but runs in
 * the web app so /insights stays self-contained — no external data file, no
 * paid service. Per-listing prices are public by policy; only the segment
 * *range* stays out of marketing copy, so medians are fine to show.
 */

export interface DistrictPriceRow {
  district: string;
  /** Median asking price per rai (THB) across land listings with a per-rai figure. */
  landPerRaiMedian: number | null;
  landCount: number;
  /** Median total asking price (THB) across villa/house listings. */
  buildMedian: number | null;
  buildCount: number;
}

export interface SalePriceStats {
  rows: DistrictPriceRow[];
  /** Island-wide median land price per rai — the headline benchmark. */
  landPerRaiMedianAll: number | null;
  landSampleAll: number;
  buildSampleAll: number;
}

function median(values: number[]): number | null {
  if (values.length === 0) return null;
  const sorted = [...values].sort((a, b) => a - b);
  const mid = Math.floor(sorted.length / 2);
  return sorted.length % 2 === 0
    ? (sorted[mid - 1] + sorted[mid]) / 2
    : sorted[mid];
}

/** Best available per-rai figure for a land listing: explicit, else derived from total + area. */
function landPerRai(o: RealEstateObject): number | null {
  if (o.pricePerRai && o.pricePerRai > 0) return o.pricePerRai;
  // AREA_RAI is a rounded int (display only) — derive from sqm when we have a total.
  if (o.priceThb && o.areaSqm && o.areaSqm > 0) {
    return o.priceThb / (o.areaSqm / 1600);
  }
  return null;
}

export function buildSalePriceByDistrict(objects: RealEstateObject[]): SalePriceStats {
  const byDistrict = new Map<string, { land: number[]; build: number[] }>();
  const allLand: number[] = [];
  const allBuild: number[] = [];

  for (const o of objects) {
    const district = o.district?.trim();
    if (!district) continue;
    const bucket =
      byDistrict.get(district) ?? { land: [] as number[], build: [] as number[] };

    if (o.type === "Land") {
      const ppr = landPerRai(o);
      if (ppr) {
        bucket.land.push(ppr);
        allLand.push(ppr);
      }
    } else if ((o.type === "Villa" || o.type === "House") && o.priceThb) {
      bucket.build.push(o.priceThb);
      allBuild.push(o.priceThb);
    }

    byDistrict.set(district, bucket);
  }

  const rows: DistrictPriceRow[] = [...byDistrict.entries()]
    .map(([district, b]) => ({
      district,
      landPerRaiMedian: median(b.land),
      landCount: b.land.length,
      buildMedian: median(b.build),
      buildCount: b.build.length,
    }))
    // Keep only districts that contribute at least one priced listing.
    .filter((r) => r.landCount > 0 || r.buildCount > 0)
    // Headline view ranks by land price/rai; build-only districts sink below.
    .sort((a, b) => (b.landPerRaiMedian ?? 0) - (a.landPerRaiMedian ?? 0));

  return {
    rows,
    landPerRaiMedianAll: median(allLand),
    landSampleAll: allLand.length,
    buildSampleAll: allBuild.length,
  };
}
