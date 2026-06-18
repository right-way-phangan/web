"use client";

import { MapPin, ExternalLink } from "lucide-react";
import type { Locale } from "@/lib/i18n/dictionaries";
import { getEstatesDict } from "@/lib/i18n/dictionaries";

interface Props {
  lat: number;
  lng: number;
  mapsUrl?: string;
  locale: Locale;
}

/**
 * «Спутник»-режим плана: реальный аэроснимок участка (Esri World Imagery,
 * статический export) с пином по центру и ссылкой в Google Maps. Расположение —
 * на уровне подборки (per-lot геопривязки пока нет, поэтому контуры лотов сюда не
 * накладываем — это честно отражено в подписи). Лёгкий: один <img>, без Leaflet.
 */
export function EstateSatelliteView({ lat, lng, mapsUrl, locale }: Props) {
  const t = getEstatesDict(locale);
  const d = 0.004; // ≈ ±400 м
  const bbox = `${lng - d},${lat - d},${lng + d},${lat + d}`;
  const src = `https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/export?bbox=${bbox}&bboxSR=4326&imageSR=4326&size=1000,640&format=jpg&f=image`;
  const maps = mapsUrl ?? `https://maps.google.com/?q=${lat},${lng}`;

  return (
    <figure className="overflow-hidden rounded-sm border border-forest-500/15 bg-forest-900 shadow-md">
      <div className="relative aspect-[1000/640] w-full">
        {/* Внешний тайл Esri — обычный <img> (без next/image-домена/оптимизатора). */}
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src={src} alt="" className="h-full w-full object-cover" loading="lazy" />
        {/* Пин по центру */}
        <span className="pointer-events-none absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-full drop-shadow-lg">
          <MapPin className="h-8 w-8 fill-brass-500/90 text-cream-50" strokeWidth={1.5} />
        </span>
        <span className="absolute bottom-1 right-2 text-[9px] text-cream-50/70">© Esri</span>
        <a
          href={maps}
          target="_blank"
          rel="noopener noreferrer"
          className="absolute bottom-2 left-2 inline-flex items-center gap-1.5 rounded-full bg-forest-900/70 px-3 py-1.5 text-[11px] font-medium text-cream-50 backdrop-blur transition-colors hover:bg-forest-900/90"
        >
          <ExternalLink className="h-3 w-3" />
          {t.openInMaps}
        </a>
      </div>
      <figcaption className="border-t border-forest-500/10 px-4 py-2.5 text-[11px] italic text-forest-500/55">
        {t.satelliteHint}
      </figcaption>
    </figure>
  );
}
