"use client";

import { MapPin, WifiOff } from "lucide-react";
import { useLocale } from "@/lib/i18n/use-locale";

/** Shared placeholder shown while a Leaflet map chunk loads (dynamic ssr:false). */
export function MapSkeleton({ label = "Loading map" }: { label?: string }) {
  return (
    <div className="flex h-full w-full flex-col items-center justify-center gap-3 rounded-sm border border-forest-500/10 bg-forest-500/5">
      <MapPin className="h-6 w-6 animate-pulse text-forest-500/30" strokeWidth={1.5} />
      <span className="text-[0.8125rem] uppercase tracking-eyebrow text-forest-500/40">
        {label}
      </span>
    </div>
  );
}

/**
 * Карта не догрузилась даже после повторов (см. lazy-map.tsx). Раньше на этом
 * месте отказ промиса летел в error boundary и уносил всю страницу — теперь
 * остаётся только прямоугольник карты, а список объектов работает.
 */
export function MapUnavailable() {
  const ru = useLocale() === "ru";
  return (
    <div className="flex h-full w-full flex-col items-center justify-center gap-3 rounded-sm border border-forest-500/10 bg-forest-500/5 px-6 text-center">
      <WifiOff className="h-6 w-6 text-forest-500/30" strokeWidth={1.5} />
      <span className="text-[0.8125rem] uppercase tracking-eyebrow text-forest-500/40">
        {ru ? "Карта не загрузилась" : "Map didn't load"}
      </span>
      <span className="max-w-[22rem] text-sm text-forest-500/50">
        {ru
          ? "Проверьте соединение и обновите страницу. Список объектов работает."
          : "Check your connection and reload the page. The listings themselves work."}
      </span>
    </div>
  );
}
