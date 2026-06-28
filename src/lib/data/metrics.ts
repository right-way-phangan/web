import "server-only";
import { backendFetch } from "@/lib/api/backend";

/**
 * Daily metric series (backend GET /metrics/series) — the time dimension the
 * snapshot panels lack. Powers /admin/trends: "are we growing?" via sparklines
 * + week-over-week deltas, from the existing day-grained first-party tables.
 */
export interface SeriesPoint {
  day: string;
  views: number;
  engagement: number;
  visits: number;
  leads: number;
}

export async function getMetricsSeries(days = 56): Promise<SeriesPoint[]> {
  if (!process.env.OBJECTS_API_URL) return [];
  try {
    const r = await backendFetch(`/metrics/series?days=${days}`, { cache: "no-store" });
    return r.ok ? ((await r.json()) as SeriesPoint[]) : [];
  } catch (err) {
    console.error("[metrics] series failed:", err);
    return [];
  }
}

/** Sum the last `n` points of a numeric series. */
export function sumLast(xs: number[], n: number, offset = 0): number {
  const end = xs.length - offset;
  return xs.slice(Math.max(0, end - n), end).reduce((s, x) => s + x, 0);
}

/** Week-over-week: last 7 days vs the 7 before. null delta if no prior signal. */
export function weekOverWeek(xs: number[]): { last: number; prev: number; deltaPct: number | null } {
  const last = sumLast(xs, 7);
  const prev = sumLast(xs, 7, 7);
  return { last, prev, deltaPct: prev > 0 ? Math.round(((last - prev) / prev) * 100) : null };
}
