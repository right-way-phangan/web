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
