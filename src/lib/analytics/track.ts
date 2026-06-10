/**
 * Marketing analytics — thin wrapper over GTM's dataLayer.
 *
 * GTM (loaded by components/analytics/gtm.tsx) reads window.dataLayer and fans
 * events out to GA4 / Meta Pixel / Google Ads. We never call those pixels
 * directly — tags are configured in the GTM UI, so adding a destination needs
 * no code change. See docs/marketing playbook "Приложение A".
 *
 * SSR-safe: no-ops on the server. dataLayer is initialised here too, so events
 * fired before the GTM snippet runs are still queued and not lost.
 */

type EventParams = Record<string, unknown>;

declare global {
  interface Window {
    dataLayer?: EventParams[];
  }
}

export function track(event: string, params: EventParams = {}): void {
  if (typeof window === "undefined") return;
  window.dataLayer = window.dataLayer ?? [];
  window.dataLayer.push({ event, ...params });
}

/** Map an RW number prefix to a coarse object type (best-effort; legacy RW-05xx → undefined). */
export function objectTypeFromRw(rw: string): string | undefined {
  if (rw.startsWith("RW-L")) return "land";
  if (rw.startsWith("RW-V")) return "villa";
  if (rw.startsWith("RW-A")) return "apartment";
  if (rw.startsWith("RW-P")) return "project";
  return undefined;
}
