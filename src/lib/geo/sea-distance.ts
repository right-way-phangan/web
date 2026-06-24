import { PHANGAN_COASTLINE } from "@/lib/data/phangan-coastline";

/**
 * Estimated distance from a point to the nearest coastline, in metres.
 * Min point-to-segment distance over the simplified OSM coastline polylines,
 * using a local equirectangular projection (exact enough at island scale).
 * Drives the sea-setback tiers in building-norms.ts. Indicative (~30m).
 */
export function seaDistanceMeters(lat: number, lng: number): number {
  const rad = Math.PI / 180;
  const kx = Math.cos(lat * rad) * 111320; // metres per ° lng at this latitude
  const ky = 110540; // metres per ° lat
  let min = Infinity;
  for (const line of PHANGAN_COASTLINE) {
    for (let i = 0; i < line.length - 1; i++) {
      const a = line[i];
      const b = line[i + 1];
      const ax = (a[1] - lng) * kx;
      const ay = (a[0] - lat) * ky;
      const bx = (b[1] - lng) * kx;
      const by = (b[0] - lat) * ky;
      const dx = bx - ax;
      const dy = by - ay;
      let t = dx || dy ? (-(ax * dx + ay * dy)) / (dx * dx + dy * dy) : 0;
      t = Math.max(0, Math.min(1, t));
      const d = Math.hypot(ax + t * dx, ay + t * dy);
      if (d < min) min = d;
    }
  }
  return Math.round(min);
}
