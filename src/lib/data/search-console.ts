import data from "@/content/search-console.json";

/**
 * Google Search Console snapshot — organic queries & pages from Google's index.
 * Computed offline by analytics/search_console (service account), committed as
 * this JSON and bundled at build (same pattern as rental-market.json). Answers
 * "what does Google actually show us for, and which pages" — the SEO side of the
 * GEO/AEO bet, complementing the AI-citation panel (the answer-engine side).
 */
export interface GscRow {
  query?: string;
  page?: string;
  clicks: number;
  impressions: number;
  ctr: number; // 0..1
  position: number;
}
export interface GscData {
  updated: string | null;
  range: string;
  totals: { clicks: number; impressions: number; ctr: number; position: number };
  queries: GscRow[];
  pages: GscRow[];
}

export function getSearchConsole(): GscData {
  return data as GscData;
}

/** High-impression, low-rank queries (pos 5–20) = quick-win SEO opportunities:
 * Google already shows us, we're just not high enough to get the click. */
export function opportunities(d: GscData): GscRow[] {
  return d.queries
    .filter((q) => q.impressions >= 20 && q.position >= 5 && q.position <= 20)
    .sort((a, b) => b.impressions - a.impressions)
    .slice(0, 15);
}
