"use client";

import { useCallback, useMemo, useRef, useState } from "react";
import dynamic from "next/dynamic";
import { LayoutGrid, Map as MapIcon } from "lucide-react";
import type { RealEstateObject } from "@/types/object";
import { ObjectCard } from "./object-card";
import { MapSkeleton } from "./map-skeleton";
import type { MapPoint, MapBounds } from "./listings-map";
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
  const [searchInArea, setSearchInArea] = useState(false);
  const [bounds, setBounds] = useState<MapBounds | null>(null);
  const listRef = useRef<HTMLDivElement>(null);

  // Pin click → select the card and bring it into view.
  const handleSelect = useCallback((rw: string) => {
    setActiveRw(rw);
    const el = listRef.current?.querySelector<HTMLElement>(`[data-rw="${rw}"]`);
    el?.scrollIntoView({ behavior: "smooth", block: "center" });
  }, []);

  // "Search as I move the map": when on, the card list shows only objects whose
  // pin falls within the current map view. The map itself keeps every pin, so
  // panning never re-fits the view. Objects without coordinates drop out.
  const visibleObjects = useMemo(() => {
    if (!searchInArea || !bounds) return objects;
    return objects.filter(
      (o) =>
        o.lat != null &&
        o.lng != null &&
        o.lat <= bounds.north &&
        o.lat >= bounds.south &&
        o.lng <= bounds.east &&
        o.lng >= bounds.west,
    );
  }, [objects, searchInArea, bounds]);

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
            label="List"
          />
          <MobileTab
            active={mobileView === "map"}
            onClick={() => setMobileView("map")}
            icon={MapIcon}
            label="Map"
          />
        </div>
      </div>

      <div className="lg:grid lg:grid-cols-[minmax(0,1fr)_minmax(360px,40%)] lg:gap-6 lg:items-start">
        {/* Cards */}
        <div className={cn(mobileView === "map" && "hidden lg:block")}>
          {searchInArea ? (
            <p className="mb-4 text-sm text-forest-500/70">
              {visibleObjects.length}{" "}
              {visibleObjects.length === 1 ? "property" : "properties"} in this area
            </p>
          ) : null}
          {visibleObjects.length === 0 ? (
            <div className="rounded-sm border border-forest-500/10 bg-forest-500/5 px-6 py-12 text-center text-sm text-forest-500/60">
              No listings in the current map area. Zoom out or pan to see more.
            </div>
          ) : (
            <div ref={listRef} className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-2">
              {visibleObjects.map((o) => (
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
                  <ObjectCard object={o} />
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
              No mapped locations for the current filters.
            </div>
          ) : (
            <div className="relative h-full w-full">
              <ListingsMap
                points={points}
                activeRw={activeRw}
                hoveredRw={hoveredRw}
                onSelect={handleSelect}
                onHover={setHoveredRw}
                onBoundsChange={setBounds}
              />
              {/* Search-as-I-move toggle */}
              <label className="absolute right-3 top-3 z-[500] inline-flex cursor-pointer items-center gap-2 rounded-sm bg-cream-50/95 px-3 py-1.5 text-[12px] font-medium text-forest-500 shadow-sm backdrop-blur-sm">
                <input
                  type="checkbox"
                  checked={searchInArea}
                  onChange={(e) => setSearchInArea(e.target.checked)}
                  className="h-3.5 w-3.5 accent-forest-500"
                />
                Search as I move the map
              </label>
              {unmappedCount > 0 ? (
                <span className="pointer-events-none absolute bottom-3 left-3 z-[500] rounded-sm bg-cream-50/90 px-2.5 py-1 text-[11px] text-forest-500/70 backdrop-blur-sm">
                  {unmappedCount} listing{unmappedCount === 1 ? "" : "s"} without a map pin
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
