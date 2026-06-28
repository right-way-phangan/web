import "server-only";
import { backendFetch } from "@/lib/api/backend";

/** Referral source counts (backend GET /referrals/summary). */
export interface ReferralRow {
  source: string; // ai:perplexity | search:google | social:telegram | ref:host | direct
  d7: number;
  d30: number;
}

const API = process.env.OBJECTS_API_URL;

export async function getReferrals(): Promise<ReferralRow[]> {
  if (!API) return [];
  try {
    const r = await backendFetch("/referrals/summary", { cache: "no-store" });
    return r.ok ? ((await r.json()) as ReferralRow[]) : [];
  } catch (err) {
    console.error("[referrals] summary failed:", err);
    return [];
  }
}

/** Pages cited by AI assistants (backend GET /ai-citations/summary). Which of
 * our pages answer engines actually surface — the per-page GEO/AEO signal. */
export interface AiCitationRow {
  path: string;
  d7: number;
  d30: number;
  sources: string[]; // ai:perplexity | ai:chatgpt | …
}

export async function getAiCitations(): Promise<AiCitationRow[]> {
  if (!API) return [];
  try {
    const r = await backendFetch("/ai-citations/summary", { cache: "no-store" });
    return r.ok ? ((await r.json()) as AiCitationRow[]) : [];
  } catch (err) {
    console.error("[referrals] ai-citations failed:", err);
    return [];
  }
}

/** AI-citation trend (backend GET /ai-citations/trend) — the GEO/AEO KPI over
 * time: weekly citation volume + per-assistant split. null when backend down. */
export interface AiCitationTrend {
  windowDays: number;
  total7: number;
  total30: number;
  weekly: { week: string; count: number }[]; // oldest → newest, Monday of each week
  bySource: { source: string; d7: number; d30: number }[];
}

export async function getAiCitationTrend(): Promise<AiCitationTrend | null> {
  if (!API) return null;
  try {
    const r = await backendFetch("/ai-citations/trend", { cache: "no-store" });
    return r.ok ? ((await r.json()) as AiCitationTrend) : null;
  } catch (err) {
    console.error("[referrals] ai-citation trend failed:", err);
    return null;
  }
}

/** Human label for a source token. */
export function referralLabel(source: string): string {
  const [group, name] = source.split(":");
  if (group === "ai") return `🤖 ${cap(name)}`;
  if (group === "search") return `🔍 ${cap(name)}`;
  if (group === "social") return `📣 ${cap(name)}`;
  if (group === "feed") return `📡 ${cap(name)}`;
  if (group === "referral" || group === "ref") return `🔗 ${name ?? "переход"}`;
  if (source === "direct") return "↪︎ прямой";
  return source;
}

function cap(s: string | undefined): string {
  if (!s) return "";
  return s.charAt(0).toUpperCase() + s.slice(1);
}
