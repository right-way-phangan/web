/**
 * First-touch traffic attribution, persisted client-side.
 *
 * Problem it solves: the lead form used to read utm_* from the *current* URL,
 * so a visitor who landed on /listings?utm_source=facebook and submitted the
 * form three pages later arrived as "no source". Here the landing visit is
 * captured once (root layout mounts <AttributionCapture/>), stored in
 * localStorage for ATTRIBUTION_TTL_DAYS, and the form reads the stored record.
 *
 * Overwrite rule: a new click that carries utm_source / gclid / fbclid wins
 * (it's a fresh campaign touch); otherwise the first stored record is kept —
 * organic browsing never erases the campaign that brought the visitor.
 */

const KEY = "rw_attribution";
const ATTRIBUTION_TTL_DAYS = 30;

export interface Attribution {
  source?: string;
  medium?: string;
  campaign?: string;
  content?: string;
  term?: string;
  /** External referrer hostname of the landing visit (if any). */
  referrer?: string;
  /** Landing path+query of the first visit. */
  landing?: string;
  ts: number;
}

function clip(v: string | null | undefined, max = 200): string | undefined {
  const s = (v ?? "").trim();
  return s ? s.slice(0, max) : undefined;
}

/** Reads the stored record; null when absent, expired or unparsable. */
export function getAttribution(): Attribution | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = window.localStorage.getItem(KEY);
    if (!raw) return null;
    const a = JSON.parse(raw) as Attribution;
    if (!a?.ts || Date.now() - a.ts > ATTRIBUTION_TTL_DAYS * 86_400_000) return null;
    return a;
  } catch {
    return null;
  }
}

/** Call once per page load (root layout). Safe to call repeatedly. */
export function captureAttribution(): void {
  if (typeof window === "undefined") return;
  try {
    const sp = new URLSearchParams(window.location.search);
    const hasCampaign = sp.has("utm_source") || sp.has("gclid") || sp.has("fbclid");
    const existing = getAttribution();
    if (existing && !hasCampaign) return; // keep the recorded first touch

    let referrer: string | undefined;
    try {
      const ref = document.referrer ? new URL(document.referrer) : null;
      if (ref && ref.hostname !== window.location.hostname) referrer = ref.hostname;
    } catch {
      /* malformed referrer — drop it */
    }

    // Auto-click ids: a gclid/fbclid without explicit utm still names the channel.
    const source =
      clip(sp.get("utm_source")) ?? (sp.has("gclid") ? "google" : sp.has("fbclid") ? "facebook" : undefined);
    const medium =
      clip(sp.get("utm_medium")) ?? (sp.has("gclid") || sp.has("fbclid") ? "cpc" : undefined);

    const record: Attribution = {
      source,
      medium,
      campaign: clip(sp.get("utm_campaign")),
      content: clip(sp.get("utm_content")),
      term: clip(sp.get("utm_term")),
      referrer,
      landing: clip(window.location.pathname + window.location.search, 300),
      ts: Date.now(),
    };
    window.localStorage.setItem(KEY, JSON.stringify(record));
  } catch {
    /* storage unavailable (private mode etc.) — attribution is best-effort */
  }
}
