/**
 * Canonical UTM tagging for OUR OWN outbound links.
 *
 * The lead form already captures + persists incoming utm (lib/analytics/
 * attribution.ts). That machinery stays empty unless the links WE publish carry
 * utm tags — so every owned channel (RSS→Telegram autopost, peer shares, FB
 * Marketplace, bio links) tags its links through here. Keep sources consistent
 * so /admin/crm/stats groups them cleanly; ad campaigns use their own scheme
 * from the marketing playbook (utm_campaign per ad set).
 */

export interface Utm {
  source: string; // telegram | facebook | share | instagram | youtube | bio …
  medium: string; // social | feed | referral | cpc | profile …
  campaign?: string;
  content?: string;
}

/** Append utm_* params to a URL, preserving any existing query. Idempotent-ish:
 *  existing utm_source is left untouched so we never overwrite a real campaign. */
export function appendUtm(url: string, utm: Utm): string {
  try {
    const u = new URL(url, "https://rightwaygroup.co");
    if (u.searchParams.has("utm_source")) return url; // don't clobber existing
    u.searchParams.set("utm_source", utm.source);
    u.searchParams.set("utm_medium", utm.medium);
    if (utm.campaign) u.searchParams.set("utm_campaign", utm.campaign);
    if (utm.content) u.searchParams.set("utm_content", utm.content);
    // Return absolute when given absolute, relative when given relative.
    return /^https?:\/\//i.test(url) ? u.toString() : u.pathname + u.search;
  } catch {
    return url;
  }
}

/** Preset taggers for the channels we post to most. */
export const UTM = {
  /** Link shared by a visitor (native share / copy). */
  share: (url: string): string =>
    appendUtm(url, { source: "share", medium: "referral", campaign: "listing-share" }),
  /** Object link inside the RSS feed that seeds Telegram autoposts. */
  feed: (url: string): string =>
    appendUtm(url, { source: "telegram", medium: "feed", campaign: "listing-feed" }),
};
