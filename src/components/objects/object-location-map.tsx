"use client";

import dynamic from "next/dynamic";
import { MapSkeleton } from "./map-skeleton";
import { useInView } from "@/lib/hooks/use-in-view";
import { useLocale } from "@/lib/i18n/use-locale";
import { getObjectDict } from "@/lib/i18n/dictionaries";

// Leaflet touches `window`, so the map is client-only (ssr:false). next/dynamic
// with ssr:false must live in a client component — hence this thin loader.
const Leaflet = dynamic(() => import("./object-location-map-leaflet"), {
  ssr: false,
  loading: () => <MapSkeleton />,
});

/**
 * Neighbourhood mini-map for an object detail page. Renders a single brass pin
 * at the listing's coordinates. Returns null when the object has no coordinates,
 * so the section simply doesn't appear.
 */
export function ObjectLocationMap({
  lat,
  lng,
  district,
  mapsUrl,
  plotPolygon,
}: {
  lat?: number;
  lng?: number;
  district?: string;
  mapsUrl?: string;
  plotPolygon?: Array<[number, number]>;
}) {
  // Defer the Leaflet chunk + tiles until the section scrolls near — it sits
  // well below the fold on the object page.
  const [ref, inView] = useInView<HTMLDivElement>("300px");
  const t = getObjectDict(useLocale());

  if (lat == null || lng == null) return null;

  return (
    <section className="print:hidden">
      <div className="flex flex-wrap items-baseline justify-between gap-3">
        <h2 className="font-serif text-3xl text-forest-900">{t.location}</h2>
        <div className="flex flex-wrap gap-4">
          <a
            href={`https://www.google.com/maps/dir/?api=1&destination=${lat},${lng}`}
            target="_blank"
            rel="noopener noreferrer"
            className="text-sm font-medium text-brass-500 underline-offset-4 hover:underline"
          >
            {t.directions}
          </a>
          {mapsUrl ? (
            <a
              href={mapsUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="text-sm text-forest-500 underline-offset-4 hover:underline"
            >
              {t.openInGoogleMaps}
            </a>
          ) : null}
        </div>
      </div>
      {district ? (
        <p className="mt-2 text-sm text-forest-500/70">
          {district} · {t.locationCountry}
        </p>
      ) : null}
      <div ref={ref} className="mt-6 h-[360px] w-full">
        {inView ? <Leaflet lat={lat} lng={lng} plotPolygon={plotPolygon} /> : <MapSkeleton />}
      </div>
    </section>
  );
}
