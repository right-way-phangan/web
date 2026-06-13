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
 * Sunset compass bearing (degrees from North, clockwise) for a latitude on a
 * given date — the classic "amplitude" formula: cos(A) = sin(δ) / cos(φ), with
 * the sun on the western half so the bearing is 360 − A. δ is the solar
 * declination (standard day-of-year approximation, ~0.5° accuracy). Refraction
 * and observer elevation shift it ~1°, irrelevant for a directional arrow.
 * Phangan (9.7°N): ~294° (WNW) at June solstice, ~270° (W) at equinox, ~246°
 * (WSW) in December. Returns null only at polar latitudes (no sunset).
 */
export function sunsetBearing(lat: number, date = new Date()): number | null {
  const rad = Math.PI / 180;
  const start = Date.UTC(date.getUTCFullYear(), 0, 0);
  const dayOfYear = Math.floor((date.getTime() - start) / 86400000);
  const decl = 23.44 * Math.sin(((360 / 365) * (dayOfYear + 284)) * rad);
  const c = Math.sin(decl * rad) / Math.cos(lat * rad);
  if (c < -1 || c > 1) return null;
  return 360 - Math.acos(c) / rad;
}

/**
 * Destination point `meters` away from [lat, lng] along a compass `bearing`
 * (degrees from North). Equirectangular offset — exact enough for a short
 * on-map arrow at Phangan scale.
 */
export function offsetPoint(
  lat: number,
  lng: number,
  bearing: number,
  meters: number,
): [number, number] {
  const R = 6378137;
  const rad = Math.PI / 180;
  const b = bearing * rad;
  const dLat = (meters * Math.cos(b)) / R / rad;
  const dLng = (meters * Math.sin(b)) / (R * Math.cos(lat * rad)) / rad;
  return [lat + dLat, lng + dLng];
}

/** Great-circle distance between two points, in metres (haversine). */
export function haversineMeters(
  aLat: number,
  aLng: number,
  bLat: number,
  bLng: number,
): number {
  const R = 6371000;
  const rad = Math.PI / 180;
  const dLat = (bLat - aLat) * rad;
  const dLng = (bLng - aLng) * rad;
  const s =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(aLat * rad) * Math.cos(bLat * rad) * Math.sin(dLng / 2) ** 2;
  return 2 * R * Math.asin(Math.sqrt(s));
}

/** «350 м» / «4.2 км» (ru) · «350 m» / «4.2 km» (en) — straight-line readout. */
export function formatDistance(meters: number, locale: "en" | "ru"): string {
  if (meters < 950) {
    const m = Math.round(meters / 10) * 10;
    return locale === "ru" ? `${m} м` : `${m} m`;
  }
  const km = (meters / 1000).toFixed(1);
  return locale === "ru" ? `${km} км` : `${km} km`;
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
