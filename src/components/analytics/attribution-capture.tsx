"use client";

import { useEffect } from "react";
import { captureAttribution, captureReferralOncePerSession } from "@/lib/analytics/attribution";

/**
 * Records the landing visit's traffic source (utm / gclid / fbclid / referrer)
 * into localStorage so the lead form can attach it to the lead even when the
 * form is submitted pages later, and once per session counts the arrival
 * channel (AI assistant / search / social / direct) in referrals_daily.
 * Mounted once in the root layout.
 */
export function AttributionCapture() {
  useEffect(() => {
    captureAttribution();
    captureReferralOncePerSession();
  }, []);
  return null;
}
