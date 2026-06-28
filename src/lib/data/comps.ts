import "server-only";
import { backendFetch } from "@/lib/api/backend";
import type { ExternalComp } from "@/lib/actions/valuation";

/**
 * Competitor sale listings (backend GET /valuation/comps). Same table that
 * feeds RW Estimate, read here for competitive-market intelligence: price/rai &
 * price/sqm by district, days-on-market (liquidity), active/sold/gone mix.
 * Filled by the analytics/comps import pipeline (scrape + manual CSV).
 */
export type { ExternalComp };

export async function getComps(): Promise<ExternalComp[]> {
  if (!process.env.OBJECTS_API_URL) return [];
  try {
    const r = await backendFetch("/valuation/comps", { cache: "no-store" });
    return r.ok ? ((await r.json()) as ExternalComp[]) : [];
  } catch (err) {
    console.error("[comps] list failed:", err);
    return [];
  }
}

/** Days a listing has been on market: first seen (createdAt) → last seen
 * (seenAt for closed, today for active). */
export function daysOnMarket(c: ExternalComp): number | null {
  const start = c.createdAt ? new Date(c.createdAt) : null;
  if (!start || Number.isNaN(start.getTime())) return null;
  const endStr = c.status === "active" ? null : c.seenAt;
  const end = endStr ? new Date(endStr) : new Date();
  const dom = Math.round((end.getTime() - start.getTime()) / 86_400_000);
  return dom >= 0 ? dom : 0;
}

export function median(xs: number[]): number | null {
  const v = xs.filter((x) => Number.isFinite(x) && x >= 0).sort((a, b) => a - b);
  if (!v.length) return null;
  const m = Math.floor(v.length / 2);
  return v.length % 2 ? v[m] : (v[m - 1] + v[m]) / 2;
}

export interface DistrictComp {
  district: string;
  landCount: number;
  pricePerRai: number | null; // median, Land
  builtCount: number;
  pricePerSqm: number | null; // median, Villa/House/Apartment
  medianDom: number | null;
}

const isBuilt = (t: string) => t === "Villa" || t === "House" || t === "Apartment";

/** Per-district market summary across active comps. */
export function byDistrict(comps: ExternalComp[]): DistrictComp[] {
  const groups = new Map<string, ExternalComp[]>();
  for (const c of comps) {
    if (c.status !== "active") continue;
    const d = c.district || "—";
    (groups.get(d) ?? groups.set(d, []).get(d)!).push(c);
  }
  const rows: DistrictComp[] = [];
  for (const [district, cs] of groups) {
    const landPpr = cs
      .filter((c) => c.type === "Land" && c.areaRai && c.areaRai > 0)
      .map((c) => c.priceThb / (c.areaRai as number));
    const builtPps = cs
      .filter((c) => isBuilt(c.type) && c.builtSqm && c.builtSqm > 0)
      .map((c) => c.priceThb / (c.builtSqm as number));
    const doms = cs.map(daysOnMarket).filter((x): x is number => x != null);
    rows.push({
      district,
      landCount: landPpr.length,
      pricePerRai: median(landPpr),
      builtCount: builtPps.length,
      pricePerSqm: median(builtPps),
      medianDom: median(doms),
    });
  }
  return rows.sort((a, b) => b.landCount + b.builtCount - (a.landCount + a.builtCount));
}
