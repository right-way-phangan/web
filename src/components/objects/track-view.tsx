"use client";

import { useEffect } from "react";
import { recordView } from "@/lib/recently-viewed";
import { track, objectTypeFromRw } from "@/lib/analytics/track";

/** Records the current listing into recently-viewed + emits a marketing view event. */
export function TrackView({ rw }: { rw: string }) {
  useEffect(() => {
    recordView(rw);
    // Powers Meta retargeting audiences / ViewContent (content_ids = rw).
    track("view_listing", { rw, type: objectTypeFromRw(rw) });
    // First-party view counter (own DB, ad-blocker-independent). Headless
    // crawlers announce themselves via webdriver — don't count them.
    if (navigator.webdriver) return;
    const body = new Blob([JSON.stringify({ rw })], { type: "application/json" });
    if (!navigator.sendBeacon?.("/api/track-view", body)) {
      fetch("/api/track-view", { method: "POST", body, keepalive: true }).catch(() => {});
    }
  }, [rw]);
  return null;
}
