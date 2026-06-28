import "server-only";
import { backendFetch } from "@/lib/api/backend";

/** Per (object, kind) engagement counts (backend GET /events/summary). */
export interface EventRow {
  rwNumber: string;
  kind: string;
  d7: number;
  d30: number;
}

/** Per-object engagement aggregated across kinds (30-day window). */
export interface ObjectEngagement {
  rwNumber: string;
  save: number;
  calc: number;
  brochure: number;
  share: number;
  clicks: number; // wa+tg+phone+email
  score: number; // weighted interest index
}

const API = process.env.OBJECTS_API_URL;
const CLICK_KINDS = new Set(["wa_click", "tg_click", "phone_click", "email_click"]);
// Weights: a messenger click / calc is worth more than a view-adjacent signal.
const WEIGHT: Record<string, number> = { click: 5, calc: 4, save: 3, brochure: 3, share: 2 };

async function fetchEvents(): Promise<EventRow[]> {
  if (!API) return [];
  try {
    const r = await backendFetch("/events/summary", { cache: "no-store" });
    return r.ok ? ((await r.json()) as EventRow[]) : [];
  } catch (err) {
    console.error("[events] summary failed:", err);
    return [];
  }
}

/** rw → engagement (excludes the '__site__' bucket of form events). */
export async function getEngagementByRw(): Promise<Map<string, ObjectEngagement>> {
  const rows = await fetchEvents();
  const map = new Map<string, ObjectEngagement>();
  for (const r of rows) {
    if (r.rwNumber === "__site__") continue;
    const e =
      map.get(r.rwNumber) ??
      { rwNumber: r.rwNumber, save: 0, calc: 0, brochure: 0, share: 0, clicks: 0, score: 0 };
    if (CLICK_KINDS.has(r.kind)) e.clicks += r.d30;
    else if (r.kind in e) (e as unknown as Record<string, number>)[r.kind] += r.d30;
    map.set(r.rwNumber, e);
  }
  for (const e of map.values()) {
    e.score =
      e.clicks * WEIGHT.click +
      e.calc * WEIGHT.calc +
      e.save * WEIGHT.save +
      e.brochure * WEIGHT.brochure +
      e.share * WEIGHT.share;
  }
  return map;
}

export interface FormFunnel {
  starts: number;
  submits: number;
}
export interface ClicksByKind {
  wa: number;
  tg: number;
  phone: number;
  email: number;
  total: number;
}

/** On-page engagement, summed across all objects (30d). The behavior funnel
 * step between "viewed" and "clicked a messenger": did they stay, read deep,
 * open the gallery, reach the contact form. Collected by BehaviorTracker /
 * object-gallery / inquiry-form (kinds dwell_30s/scroll_50/scroll_90/
 * gallery_open/contact_reach). */
export interface OnPageFunnel {
  dwell30: number;
  scroll50: number;
  scroll90: number;
  galleryOpen: number;
  contactReach: number;
}

export async function getOnPageFunnel(): Promise<OnPageFunnel> {
  const rows = await fetchEvents();
  const f: OnPageFunnel = { dwell30: 0, scroll50: 0, scroll90: 0, galleryOpen: 0, contactReach: 0 };
  for (const r of rows) {
    if (r.rwNumber === "__site__") continue;
    if (r.kind === "dwell_30s") f.dwell30 += r.d30;
    else if (r.kind === "scroll_50") f.scroll50 += r.d30;
    else if (r.kind === "scroll_90") f.scroll90 += r.d30;
    else if (r.kind === "gallery_open") f.galleryOpen += r.d30;
    else if (r.kind === "contact_reach") f.contactReach += r.d30;
  }
  return f;
}

/** Site-wide form funnel (30d) + total messenger clicks (30d), from events. */
export async function getSiteEventStats(): Promise<{ form: FormFunnel; clicks: ClicksByKind }> {
  const rows = await fetchEvents();
  const form: FormFunnel = { starts: 0, submits: 0 };
  const clicks: ClicksByKind = { wa: 0, tg: 0, phone: 0, email: 0, total: 0 };
  for (const r of rows) {
    if (r.kind === "form_start") form.starts += r.d30;
    else if (r.kind === "form_submit") form.submits += r.d30;
    else if (r.kind === "wa_click") { clicks.wa += r.d30; clicks.total += r.d30; }
    else if (r.kind === "tg_click") { clicks.tg += r.d30; clicks.total += r.d30; }
    else if (r.kind === "phone_click") { clicks.phone += r.d30; clicks.total += r.d30; }
    else if (r.kind === "email_click") { clicks.email += r.d30; clicks.total += r.d30; }
  }
  return { form, clicks };
}
