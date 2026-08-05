/**
 * PostHog — product analytics alongside the GA4/GTM marketing stack.
 *
 * Division of labour: GA4 answers "how many came and from where", our own
 * first-party beacons answer "what happened on an object page" (aggregates in
 * object_events_daily), PostHog answers "what did this particular visitor do" —
 * funnels, session replay, heatmaps. No overlap in purpose, only in raw hits.
 *
 * Runs from Next's client instrumentation entry point, before the app hydrates.
 * Inert without NEXT_PUBLIC_POSTHOG_KEY, so this ships dark and lights up the
 * moment the key lands in Vercel — same pattern as gtm.tsx.
 *
 * /admin is deliberately excluded: the panel carries client PII (lead names,
 * phones, owner notes) that has no business inside a session replay.
 */
import posthog from "posthog-js";

const KEY = process.env.NEXT_PUBLIC_POSTHOG_KEY;
// Region is chosen when the project is created; US is PostHog's own default.
const HOST = process.env.NEXT_PUBLIC_POSTHOG_HOST ?? "https://us.i.posthog.com";

if (KEY && !window.location.pathname.startsWith("/admin")) {
  posthog.init(KEY, {
    api_host: HOST,
    // Modern default set — most importantly capture_pageview: 'history_change',
    // which is what makes App Router client navigations count as pageviews.
    defaults: "2026-06-25",
  });
}
