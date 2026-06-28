import "server-only";
import { backendFetch } from "@/lib/api/backend";

/**
 * Visitor journeys (backend GET /journey/summary). Stitches a converting lead
 * to its anonymous browse path via the shared vid: objects viewed
 * (object_view_visitors) + funnel actions (visitor_events) before the lead.
 * Answers "what did a visitor do before they became a lead" — beyond the
 * aggregate first-touch attribution.
 */
export interface JourneyAction {
  kind: string;
  rwNumber: string | null;
  ts: string;
}
export interface JourneyLead {
  leadId: number;
  name: string;
  status: string;
  createdAt: string;
  rwNumber: string | null;
  viewedRw: string[];
  actions: JourneyAction[];
}
export interface JourneySummary {
  totalLeads: number;
  attributable: number;
  avgViewsBeforeLead: number | null;
  topObjects: { rwNumber: string; count: number }[];
  recent: JourneyLead[];
}

const EMPTY: JourneySummary = {
  totalLeads: 0,
  attributable: 0,
  avgViewsBeforeLead: null,
  topObjects: [],
  recent: [],
};

export async function getJourneys(): Promise<JourneySummary> {
  if (!process.env.OBJECTS_API_URL) return EMPTY;
  try {
    const r = await backendFetch("/journey/summary", { cache: "no-store" });
    return r.ok ? ((await r.json()) as JourneySummary) : EMPTY;
  } catch (err) {
    console.error("[journey] summary failed:", err);
    return EMPTY;
  }
}

/** Hot open leads — "who to call first" by pre-inquiry engagement. */
export interface HotLead {
  leadId: number;
  name: string;
  createdAt: string;
  rwNumber: string | null;
  score: number;
  viewedCount: number;
  calc: number;
  saves: number;
  clicks: number;
  why: string;
}

export async function getHotLeads(): Promise<HotLead[]> {
  if (!process.env.OBJECTS_API_URL) return [];
  try {
    const r = await backendFetch("/leads/hot", { cache: "no-store" });
    return r.ok ? ((await r.json()) as HotLead[]) : [];
  } catch (err) {
    console.error("[journey] hot leads failed:", err);
    return [];
  }
}
