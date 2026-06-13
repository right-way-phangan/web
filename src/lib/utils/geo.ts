/**
 * Spherical area of a [lat, lng] ring (м²) — the classic spherical-excess
 * approximation used by Leaflet.GeometryUtil/turf for small polygons. Exact
 * enough for plot-size shapes (centimetre-level error at Phangan scale).
 */
export function polygonAreaSqm(pts: Array<[number, number]>): number {
  if (pts.length < 3) return 0;
  const R = 6378137;
  const rad = Math.PI / 180;
  let sum = 0;
  for (let i = 0; i < pts.length; i++) {
    const [lat1, lng1] = pts[i];
    const [lat2, lng2] = pts[(i + 1) % pts.length];
    sum += (lng2 - lng1) * rad * (2 + Math.sin(lat1 * rad) + Math.sin(lat2 * rad));
  }
  return Math.abs((sum * R * R) / 2);
}

/** «3 540 м² ≈ 2.21 рая» — admin-facing readout for a traced contour. */
export function formatAreaRu(sqm: number): string {
  const rai = sqm / 1600;
  const sqmStr = Math.round(sqm).toLocaleString("ru-RU");
  return `${sqmStr} м² ≈ ${rai.toFixed(2)} рая`;
}

/**
 * Pull lat/lng out of a Google Maps URL (or a bare "lat, lng" string). Mirrors
 * what the backend derives for the catalog pin; used client-side by the
 * zoning helper and the admin map pickers.
 */
export function parseLatLngText(s: string): { lat: number; lng: number } | null {
  const m =
    s.match(/@(-?\d{1,2}\.\d+),(-?\d{1,3}\.\d+)/) ??
    s.match(/[?&](?:q|query|ll|center)=(-?\d{1,2}\.\d+)\s*,\s*(-?\d{1,3}\.\d+)/) ??
    s.match(/!3d(-?\d{1,2}\.\d+)!4d(-?\d{1,3}\.\d+)/) ??
    s.match(/^\s*(-?\d{1,2}\.\d+)\s*[, ]\s*(-?\d{1,3}\.\d+)\s*$/);
  if (!m) return null;
  const lat = Number(m[1]);
  const lng = Number(m[2]);
  return Number.isFinite(lat) && Number.isFinite(lng) ? { lat, lng } : null;
}
