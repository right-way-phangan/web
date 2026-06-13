"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import dynamic from "next/dynamic";
import { track } from "@vercel/analytics";
import { LayoutGrid, Map as MapIcon } from "lucide-react";
import type { RealEstateObject } from "@/types/object";
import { ObjectCard } from "./object-card";
import { MapSkeleton } from "./map-skeleton";
import type { MapPoint, MapBounds } from "./listings-map";
import { useMediaQuery } from "@/lib/hooks/use-media-query";
import { useLocale } from "@/lib/i18n/use-locale";
import { getListingsDict } from "@/lib/i18n/dictionaries";
import { cn } from "@/lib/utils/cn";

// Leaflet touches `window`, so the map is client-only (ssr:false).
const ListingsMap = dynamic(() => import("./listings-map"), {
  ssr: false,
  loading: () => <MapSkeleton />,
});

/**
 * Split listings view: a scrollable card column on the left and a sticky map on
 * the right (desktop). Hovering a card highlights its pin; clicking a pin selects
 * and scrolls to the matching card. On mobile it collapses to a List/Map toggle.
 */
export function ListingsSplit({ objects }: { objects: RealEstateObject[] }) {
  const t = getListingsDict(useLocale());
  // Stable identity — recomputing each render would re-trigger the map's
  // FitBounds (deps on `points`) and snap the zoom back on every state change.
  const points: MapPoint[] = useMemo(
    () =>
      objects
        .filter((o) => o.lat != null && o.lng != null)
        .map((o) => ({
          rw: o.rwNumber,
          title: o.titleEn,
          type: o.type,
          lat: o.lat!,
          lng: o.lng!,
          priceThb: o.priceThb,
          cover: o.coverImage,
        })),
    [objects],
  );

  const [activeRw, setActiveRw] = useState<string | null>(null);
  const [hoveredRw, setHoveredRw] = useState<string | null>(null);
  const [mobileView, setMobileView] = useState<"list" | "map">("list");
  // Auto-sync: once the visitor engages the map, the card list shows only the
  // pins currently in view. "Show all" turns it back off.
  const [areaSync, setAreaSync] = useState(false);
  const [bounds, setBounds] = useState<MapBounds | null>(null);
  const listRef = useRef<HTMLDivElement>(null);

  const isDesktop = useMediaQuery("(min-width: 1024px)");
  // Desktop: defer the Leaflet chunk until the browser is idle so its hydration
  // doesn't compete with the photo-grid LCP. The map area shows a skeleton until
  // then. `{ timeout }` guarantees it still mounts under sustained load.
  const [mapReady, setMapReady] = useState(false);
  useEffect(() => {
    if (typeof window.requestIdleCallback === "function") {
      const id = window.requestIdleCallback(() => setMapReady(true), { timeout: 2000 });
      return () => window.cancelIdleCallback(id);
    }
    const id = window.setTimeout(() => setMapReady(true), 1200);
    return () => window.clearTimeout(id);
  }, []);
  // Don't load the Leaflet chunk on mobile until the map tab is actually opened.
  const mountMap = (isDesktop && mapReady) || mobileView === "map";

  // Pin click → select the card and bring it into view.
  const handleSelect = useCallback((rw: string) => {
    setActiveRw(rw);
    track("map_pin_click", { rw });
    const el = listRef.current?.querySelector<HTMLElement>(`[data-rw="${rw}"]`);
    el?.scrollIntoView({ behavior: "smooth", block: "center" });
  }, []);

  const enableAreaSync = useCallback(() => {
    setAreaSync((on) => {
      if (!on) track("search_in_area", { on: true });
      return true;
    });
  }, []);

  // When area-sync is on, the card list shows only objects whose pin falls in
  // the current map view. The map keeps every pin, so panning never re-fits.
  const visibleObjects = useMemo(() => {
    if (!areaSync || !bounds) return objects;
    return objects.filter(
      (o) =>
        o.lat != null &&
        o.lng != null &&
        o.lat <= bounds.north &&
        o.lat >= bounds.south &&
        o.lng <= bounds.east &&
        o.lng >= bounds.west,
    );
  }, [objects, areaSync, bounds]);

  const mappedCount = points.length;
  const unmappedCount = objects.length - mappedCount;

  return (
    <div className="mt-8">
      {/* Mobile-only List/Map toggle */}
      <div className="mb-4 flex justify-end lg:hidden">
        <div className="inline-flex rounded-sm border border-forest-500/20 bg-cream-50 p-0.5">
          <MobileTab
            active={mobileView === "list"}
            onClick={() => setMobileView("list")}
            icon={LayoutGrid}
            label={t.list}
          />
          <MobileTab
            active={mobileView === "map"}
            onClick={() => setMobileView("map")}
            icon={MapIcon}
            label={t.map}
          />
        </div>
      </div>

      <div className="lg:grid lg:grid-cols-[minmax(0,1fr)_minmax(360px,40%)] lg:gap-6 lg:items-start">
        {/* Cards */}
        <div className={cn(mobileView === "map" && "hidden lg:block")}>
          {areaSync ? (
            <p className="mb-4 flex flex-wrap items-center gap-x-2 gap-y-1 text-sm text-forest-500/70">
              <span>{t.inMapArea(visibleObjects.length)}</span>
              <button
                type="button"
                onClick={() => setAreaSync(false)}
                className="text-forest-500 underline-offset-4 hover:text-brass-500 hover:underline"
              >
                {t.showAll}
              </button>
            </p>
          ) : null}
          {visibleObjects.length === 0 ? (
            <div className="rounded-sm border border-forest-500/10 bg-forest-500/5 px-6 py-12 text-center text-sm text-forest-500/70">
              {t.noneInArea}
            </div>
          ) : (
            <div ref={listRef} className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-2">
              {visibleObjects.map((o, i) => (
                <div
                  key={o.id}
                  data-rw={o.rwNumber}
                  onMouseEnter={() => setHoveredRw(o.rwNumber)}
                  onMouseLeave={() => setHoveredRw(null)}
                  className={cn(
                    "scroll-mt-24 rounded-sm transition-shadow",
                    activeRw === o.rwNumber &&
                      "ring-2 ring-brass-500 ring-offset-2 ring-offset-cream-100",
                  )}
                >
                  <ObjectCard object={o} priority={i < 4} />
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Map */}
        <div
          className={cn(
            "lg:sticky lg:top-24 lg:h-[calc(100vh-8rem)]",
            mobileView === "map"
              ? "block h-[70vh]"
              : "hidden h-[70vh] lg:block",
          )}
        >
          {mappedCount === 0 ? (
            <div className="flex h-full w-full items-center justify-center rounded-sm border border-forest-500/10 bg-forest-500/5 px-6 text-center text-sm text-forest-500/50">
              {t.noMapped}
            </div>
          ) : (
            <div className="relative h-full w-full">
              {mountMap ? (
                <ListingsMap
                  points={points}
                  activeRw={activeRw}
                  hoveredRw={hoveredRw}
                  onSelect={handleSelect}
                  onHover={setHoveredRw}
                  onBoundsChange={setBounds}
                  onInteract={enableAreaSync}
                />
              ) : (
                <MapSkeleton />
              )}
              {/* Area-sync status (auto-on once the map is used). When active it's
                  a filter that hides listings, so make it unmistakable + easy to clear. */}
              {areaSync ? (
                <span className="absolute right-3 top-3 z-[500] inline-flex items-center gap-2 rounded-sm border border-brass-500/40 bg-brass-500/15 px-3 py-1.5 text-[12px] font-semibold text-forest-900 shadow-sm backdrop-blur-sm">
                  <MapIcon className="h-3.5 w-3.5 text-brass-500" />
                  {t.filteredToArea}
                  <button
                    type="button"
                    onClick={() => setAreaSync(false)}
                    className="ml-1 rounded-sm bg-forest-500 px-2 py-0.5 text-[11px] font-medium text-cream-100 hover:bg-forest-400"
                  >
                    {t.showAll}
                  </button>
                </span>
              ) : (
                <span className="pointer-events-none absolute right-3 top-3 z-[500] rounded-sm bg-cream-50/90 px-3 py-1.5 text-[11px] text-forest-500/70 shadow-sm backdrop-blur-sm">
                  {t.moveMapHint}
                </span>
              )}
              {unmappedCount > 0 ? (
                <span className="pointer-events-none absolute bottom-3 left-3 z-[500] rounded-sm bg-cream-50/90 px-2.5 py-1 text-[11px] text-forest-500/70 backdrop-blur-sm">
                  {t.withoutPin(unmappedCount)}
                </span>
              ) : null}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

function MobileTab({
  active,
  onClick,
  icon: Icon,
  label,
}: {
  active: boolean;
  onClick: () => void;
  icon: typeof MapIcon;
  label: string;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-pressed={active}
      className={cn(
        "inline-flex items-center gap-1.5 rounded-sm px-3 py-1.5 text-xs font-medium transition-colors",
        active ? "bg-forest-500 text-cream-100" : "text-forest-500/70 hover:text-forest-500",
      )}
    >
      <Icon className="h-3.5 w-3.5" />
      {label}
    </button>
  );
}
