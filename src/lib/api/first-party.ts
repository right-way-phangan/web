/**
 * Same-origin check for public beacons (track-*). A browser always sends
 * Origin on a cross-context POST, so a request without a matching one is a
 * script inflating counters, not a visitor. Shared by every /api/track-* route
 * so a new beacon can't forget the guard.
 */
export function isFirstParty(req: Request): boolean {
  const origin = req.headers.get("origin");
  if (!origin) return false;
  try {
    return new URL(origin).host === (req.headers.get("host") ?? new URL(req.url).host);
  } catch {
    return false;
  }
}
