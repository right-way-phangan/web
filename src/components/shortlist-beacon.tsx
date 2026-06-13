"use client";

import { useEffect } from "react";

/** Fires once on mount: tells the backend the client opened their shortlist. */
export function ShortlistBeacon({ token }: { token: string }) {
  useEffect(() => {
    fetch(`/s/${encodeURIComponent(token)}/seen`, { method: "POST", keepalive: true }).catch(
      () => {},
    );
  }, [token]);
  return null;
}
