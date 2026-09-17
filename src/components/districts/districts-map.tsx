"use client";

import { lazyMap } from "@/components/objects/lazy-map";
import { MapSkeleton } from "@/components/objects/map-skeleton";
import type { DistrictPoint } from "./districts-map-leaflet";

const Leaflet = lazyMap("districts", () => import("./districts-map-leaflet"), () => (
  <MapSkeleton label="Loading island map" />
));

/** Client loader for the interactive districts map (ssr:false). */
export function DistrictsMap({ points }: { points: DistrictPoint[] }) {
  if (points.length === 0) return null;
  return (
    <div className="h-[420px] w-full md:h-[520px]">
      <Leaflet points={points} />
    </div>
  );
}
