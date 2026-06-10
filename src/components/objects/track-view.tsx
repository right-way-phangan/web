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
  }, [rw]);
  return null;
}
