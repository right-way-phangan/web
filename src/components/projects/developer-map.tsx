"use client";

import dynamic from "next/dynamic";
import type { DeveloperLocation } from "@/content/developers/types";
import type { Locale } from "@/lib/i18n/dictionaries";
import { MapSkeleton } from "@/components/objects/map-skeleton";
import { useInView } from "@/lib/hooks/use-in-view";

// Leaflet touches `window` → client-only, and next/dynamic with ssr:false must
// live in a client component (same thin-loader pattern as the object map).
const Leaflet = dynamic(() => import("./developer-map-leaflet"), {
  ssr: false,
  loading: () => <MapSkeleton />,
});

/** Where a developer's projects sit on the island — lazy, it's far below the fold. */
export function DeveloperMap({
  locations,
  locale,
}: {
  locations: DeveloperLocation[];
  locale: Locale;
}) {
  const [ref, inView] = useInView<HTMLDivElement>("300px");
  return (
    <div ref={ref} className="mt-6 h-[340px] w-full md:h-[420px]">
      {inView ? <Leaflet locations={locations} locale={locale} /> : <MapSkeleton />}
    </div>
  );
}
