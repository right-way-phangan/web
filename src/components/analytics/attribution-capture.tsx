"use client";

import { useEffect } from "react";
import { captureAttribution } from "@/lib/analytics/attribution";

/**
 * Records the landing visit's traffic source (utm / gclid / fbclid / referrer)
 * into localStorage so the lead form can attach it to the lead even when the
 * form is submitted pages later. Mounted once in the root layout.
 */
export function AttributionCapture() {
  useEffect(() => {
    captureAttribution();
  }, []);
  return null;
}
