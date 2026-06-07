import type { DistrictPoint } from "@/components/districts/districts-map-leaflet";

/**
 * Nudge near-coincident district markers apart so their labels don't overlap
 * (the west-coast districts sit close together). Click still routes by amoName,
 * so the small positional shift is cosmetic only. Shared by the EN and RU
 * districts pages.
 */
export function spreadDistrictOverlaps(points: DistrictPoint[], minSep = 0.02): DistrictPoint[] {
  const out = points.map((p) => ({ ...p }));
  for (let iter = 0; iter < 40; iter++) {
    let moved = false;
    for (let i = 0; i < out.length; i++) {
      for (let j = i + 1; j < out.length; j++) {
        const a = out[i];
        const b = out[j];
        let dx = a.lat - b.lat;
        let dy = a.lng - b.lng;
        const d = Math.hypot(dx, dy);
        if (d === 0) {
          a.lat += minSep / 2;
          b.lat -= minSep / 2;
          moved = true;
        } else if (d < minSep) {
          const push = (minSep - d) / 2;
          dx /= d;
          dy /= d;
          a.lat += dx * push;
          a.lng += dy * push;
          b.lat -= dx * push;
          b.lng -= dy * push;
          moved = true;
        }
      }
    }
    if (!moved) break;
  }
  return out;
}
