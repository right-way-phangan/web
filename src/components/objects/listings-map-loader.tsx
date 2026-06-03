"use client";

import dynamic from "next/dynamic";
import type { RealEstateObject } from "@/types/object";
import type { MapPoint } from "./listings-map";

// Leaflet touches `window`, so the map is client-only (ssr:false). next/dynamic
// with ssr:false must live in a client component — hence this thin loader.
const ListingsMap = dynamic(() => import("./listings-map"), {
  ssr: false,
  loading: () => (
    <div className="mt-8 flex h-[70vh] w-full items-center justify-center rounded-sm border border-forest-500/10 bg-forest-500/5 text-sm text-forest-500/50">
      Loading map…
    </div>
  ),
});

export function ListingsMapLoader({ objects }: { objects: RealEstateObject[] }) {
  const points: MapPoint[] = objects
    .filter((o) => o.lat != null && o.lng != null)
    .map((o) => ({
      rw: o.rwNumber,
      title: o.titleEn,
      type: o.type,
      lat: o.lat!,
      lng: o.lng!,
      priceThb: o.priceThb,
      cover: o.coverImage,
    }));

  if (points.length === 0) {
    return (
      <div className="mt-8 flex h-[40vh] w-full items-center justify-center rounded-sm border border-forest-500/10 bg-forest-500/5 text-sm text-forest-500/50">
        No mapped locations for the current filters.
      </div>
    );
  }

  return <ListingsMap points={points} />;
}
