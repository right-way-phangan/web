"use client";

import { useEffect } from "react";
import { recordView } from "@/lib/recently-viewed";

/** Records the current listing into the recently-viewed history on mount. */
export function TrackView({ rw }: { rw: string }) {
  useEffect(() => {
    recordView(rw);
  }, [rw]);
  return null;
}
