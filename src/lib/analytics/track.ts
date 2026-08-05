/**
 * Marketing analytics — thin wrapper over GTM's dataLayer, mirrored to PostHog.
 *
 * GTM (loaded by components/analytics/gtm.tsx) reads window.dataLayer and fans
 * events out to GA4 / Meta Pixel / Google Ads. We never call those pixels
 * directly — tags are configured in the GTM UI, so adding a destination needs
 * no code change. See docs/marketing playbook "Приложение A".
 *
 * PostHog gets the same events — that is what turns its autocaptured clicks into
 * named funnel steps like inquiry_submitted. Reached through window.posthog so
 * that the SDK stays a lazy chunk owned by instrumentation-client.ts instead of
 * being bundled into every page that tracks anything; undefined (and so skipped)
 * when the key is unset, on /admin, or in the first ms before the chunk lands.
 *
 * SSR-safe: no-ops on the server. dataLayer is initialised here too, so events
 * fired before the GTM snippet runs are still queued and not lost.
 */

type EventParams = Record<string, unknown>;

declare global {
  interface Window {
    dataLayer?: EventParams[];
    /** Defined only in GA4-direct mode (components/analytics/ga4.tsx). */
    gtag?: (...args: unknown[]) => void;
    /** Published by src/instrumentation-client.ts after posthog.init(). */
    posthog?: { capture: (event: string, params?: EventParams) => void };
  }
}

export function track(event: string, params: EventParams = {}): void {
  if (typeof window === "undefined") return;
  window.dataLayer = window.dataLayer ?? [];
  window.dataLayer.push({ event, ...params });
  // GA4-direct mode (no GTM container yet): gtag.js only processes
  // `arguments`-style pushes, so mirror the event through gtag(). Once GTM is
  // live window.gtag is undefined and the dataLayer push above is the only path.
  window.gtag?.("event", event, params);
  window.posthog?.capture(event, params);
}

/** Map an RW number prefix to a coarse object type (best-effort; legacy RW-05xx → undefined). */
export function objectTypeFromRw(rw: string): string | undefined {
  if (rw.startsWith("RW-L")) return "land";
  if (rw.startsWith("RW-V")) return "villa";
  if (rw.startsWith("RW-A")) return "apartment";
  if (rw.startsWith("RW-P")) return "project";
  return undefined;
}
