/**
 * Client → own-DB event beacon. Fire-and-forget; SSR-safe. Posts to the Next
 * proxy routes (which add the backend bearer token server-side). Use for
 * engagement events (save/calc/brochure/share), messenger clicks, forms.
 */

import { getVid } from "@/lib/analytics/visitor";

function beacon(path: string, payload: Record<string, unknown>): void {
  if (typeof window === "undefined") return;
  try {
    const body = new Blob([JSON.stringify(payload)], { type: "application/json" });
    if (!navigator.sendBeacon?.(path, body)) {
      fetch(path, { method: "POST", body, keepalive: true }).catch(() => {});
    }
  } catch {
    /* best-effort */
  }
}

/** Record an engagement event in our own DB. rw omitted → site-level ('__site__').
 * vid (anonymous browser id) lets high-signal actions be stitched into a journey. */
export function trackObjectEvent(kind: string, rw?: string): void {
  beacon("/api/track-event", { kind, rw: rw ?? "", vid: getVid() });
}

/** Record a classified referral source (once per session). `path` (landing
 * pathname) lets the backend log which page AI assistants cited. */
export function trackReferral(source: string, path?: string): void {
  beacon("/api/track-referral", path ? { source, path } : { source });
}
