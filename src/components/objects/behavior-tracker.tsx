"use client";

import { useEffect } from "react";
import { trackObjectEvent } from "@/lib/analytics/track-event";

/**
 * On-page engagement signals for object detail pages (own-DB beacons):
 * dwell (30s on page) + scroll depth (50% / 90% of the page read). Each fires
 * at most once per page view. Sibling to TrackView; gallery_open and
 * contact_reach are emitted from their own components (object-gallery /
 * inquiry-form). Skips headless crawlers (they announce via webdriver).
 */
export function BehaviorTracker({ rw }: { rw: string }) {
  useEffect(() => {
    if (navigator.webdriver) return;

    const fired = new Set<string>();
    const fire = (kind: string) => {
      if (fired.has(kind)) return;
      fired.add(kind);
      trackObjectEvent(kind, rw);
    };

    const dwell = window.setTimeout(() => fire("dwell_30s"), 30_000);

    const onScroll = () => {
      const max = document.documentElement.scrollHeight - window.innerHeight;
      if (max <= 0) return;
      const pct = (window.scrollY / max) * 100;
      if (pct >= 50) fire("scroll_50");
      if (pct >= 90) {
        fire("scroll_90");
        window.removeEventListener("scroll", onScroll);
      }
    };
    window.addEventListener("scroll", onScroll, { passive: true });

    return () => {
      window.clearTimeout(dwell);
      window.removeEventListener("scroll", onScroll);
    };
  }, [rw]);

  return null;
}
