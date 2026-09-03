/**
 * Hosts a pasted "short maps link" may resolve through. The public zoning
 * checker follows redirects server-side, so without this list the site would
 * fetch any URL a visitor typed (SSRF). Google's shorteners and maps domains
 * only — every redirect hop must stay inside the list.
 */
const ALLOWED_SUFFIXES = ["goo.gl", "google.com", "google.co.th", "google.ru"];

export function isAllowedShortLinkHost(host: string): boolean {
  const h = host.toLowerCase();
  return ALLOWED_SUFFIXES.some((s) => h === s || h.endsWith(`.${s}`));
}

/** True when `url` is http(s) and its host is on the allow-list. */
export function isAllowedShortLinkUrl(url: string): boolean {
  try {
    const u = new URL(url);
    return (u.protocol === "https:" || u.protocol === "http:") && isAllowedShortLinkHost(u.hostname);
  } catch {
    return false;
  }
}
