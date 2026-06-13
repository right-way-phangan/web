import "server-only";
import { backendFetch } from "@/lib/api/backend";

/** Demand summary shape returned by the backend GET /demand/summary. */
export interface DemandTally {
  name: string;
  count: number;
}
export interface DemandSummary {
  windowDays: number;
  total: number;
  nlCount: number;
  filterCount: number;
  byDistrict: DemandTally[];
  byType: DemandTally[];
  byTenure: DemandTally[];
  byFeature: DemandTally[];
  byBeds: DemandTally[];
  priceBands: DemandTally[];
  topQueries: Array<{ query: string; count: number; matched: number }>;
  zeroResultQueries: Array<{ query: string; count: number }>;
}

const API = process.env.OBJECTS_API_URL;
export const DEMAND_ENABLED = Boolean(API);

const EMPTY: DemandSummary = {
  windowDays: 0,
  total: 0,
  nlCount: 0,
  filterCount: 0,
  byDistrict: [],
  byType: [],
  byTenure: [],
  byFeature: [],
  byBeds: [],
  priceBands: [],
  topQueries: [],
  zeroResultQueries: [],
};

/** Aggregated demand for /admin/demand; empty shape when backend is down. */
export async function getDemandSummary(days = 90): Promise<DemandSummary> {
  if (!API) return EMPTY;
  try {
    const r = await backendFetch(`/demand/summary?days=${days}`, { cache: "no-store" });
    return r.ok ? ((await r.json()) as DemandSummary) : EMPTY;
  } catch (err) {
    console.error("[demand] summary failed:", err);
    return EMPTY;
  }
}

/** Fire-and-forget: record a search/filter event in the backend (server-side). */
export async function recordSearchEvent(input: Record<string, unknown>): Promise<void> {
  if (!API) return;
  try {
    await backendFetch("/track/search", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      cache: "no-store",
      body: JSON.stringify(input),
    });
  } catch (err) {
    console.error("[demand] record failed:", err);
  }
}
