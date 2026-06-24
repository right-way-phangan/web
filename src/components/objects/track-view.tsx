"use client";

import { useEffect } from "react";
import { recordView } from "@/lib/recently-viewed";
import { track, objectTypeFromRw } from "@/lib/analytics/track";
import { getVid } from "@/lib/analytics/visitor";

/**
 * Records the current listing into recently-viewed + emits a marketing view
 * event + a first-party view beacon. `recents={false}` skips the recently-viewed
 * rail (used on project pages so a project RW-P#### doesn't appear among object
 * cards) while still feeding the own-DB view counter / funnel.
 */
export function TrackView({ rw, recents = true }: { rw: string; recents?: boolean }) {
  useEffect(() => {
    if (recents) recordView(rw);
    // Powers Meta retargeting audiences / ViewContent (content_ids = rw).
    track("view_listing", { rw, type: objectTypeFromRw(rw) });
    // First-party view counter (own DB, ad-blocker-independent). Headless
    // crawlers announce themselves via webdriver — don't count them. vid =
    // anonymous browser id for unique-viewer + cross-shopping counts.
    if (navigator.webdriver) return;
    const body = new Blob([JSON.stringify({ rw, vid: getVid() })], { type: "application/json" });
    if (!navigator.sendBeacon?.("/api/track-view", body)) {
      fetch("/api/track-view", { method: "POST", body, keepalive: true }).catch(() => {});
    }
  }, [rw, recents]);
  return null;
}
