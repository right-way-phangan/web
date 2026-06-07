"use client";

import dynamic from "next/dynamic";
import { MapSkeleton } from "@/components/objects/map-skeleton";
import type { DistrictPoint } from "./districts-map-leaflet";

const Leaflet = dynamic(() => import("./districts-map-leaflet"), {
  ssr: false,
  loading: () => <MapSkeleton label="Loading island map" />,
});

/** Client loader for the interactive districts map (ssr:false). */
export function DistrictsMap({ points }: { points: DistrictPoint[] }) {
  if (points.length === 0) return null;
  return (
    <div className="h-[420px] w-full md:h-[520px]">
      <Leaflet points={points} />
    </div>
  );
}
