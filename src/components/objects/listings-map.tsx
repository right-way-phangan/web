"use client";

import { useEffect, useRef, useState } from "react";
import { MapContainer, TileLayer, Marker, Popup, Pane, AttributionControl, useMap, useMapEvents } from "react-leaflet";
import MarkerClusterGroup from "react-leaflet-cluster";
import L from "leaflet";
import { Maximize2, Minimize2 } from "lucide-react";
import "leaflet/dist/leaflet.css";
import "leaflet.markercluster/dist/MarkerCluster.css";
import { formatPriceCompact, formatRentCompact } from "@/lib/utils/price";
import type { ViewMode } from "@/lib/filters/listings";
import {
  TILE_URL,
  TILE_ATTRIBUTION,
  TILE_SUBDOMAINS,
  SATELLITE_TILE_URL,
  SATELLITE_ATTRIBUTION,
  SATELLITE_MAX_NATIVE_ZOOM,
  TERRAIN_RELIEF_TILE_URL,
  TERRAIN_RELIEF_ATTRIBUTION,
  TERRAIN_RELIEF_MAX_NATIVE_ZOOM,
  TERRAIN_TILE_URL,
  TERRAIN_ATTRIBUTION,
  TERRAIN_MAX_NATIVE_ZOOM,
  TERRAIN_HILLSHADE_OPACITY,
  PARCEL_TILE_URL,
  PARCEL_MIN_ZOOM,
  PARCEL_MAX_NATIVE_ZOOM,
  CITYPLAN_TILE_URL,
  CITYPLAN_MIN_NATIVE_ZOOM,
  CITYPLAN_MAX_NATIVE_ZOOM,
  LONGDO_ATTRIBUTION,
} from "@/lib/leaflet/tiles";
import {
  type BaseLayer,
  loadLayerPrefs,
  saveLayerPrefs,
} from "@/lib/leaflet/layer-prefs";
import { useLocale } from "@/lib/i18n/use-locale";
import { getObjectDict } from "@/lib/i18n/dictionaries";
import { cn } from "@/lib/utils/cn";
import { useFullscreen } from "@/lib/leaflet/use-fullscreen";
import { MapLegend } from "./map-legend";
import { PoiMarkers } from "./poi-markers";

const LISTINGS_MAX_ZOOM = 20;

export interface MapPoint {
  rw: string;
  title: string;
  type: string;
  lat: number;
  lng: number;
  priceThb?: number;
  rentPerRaiMonth?: number;
  rentPerMonth?: number;
  cover?: string;
}

export interface MapBounds {
  north: number;
  south: number;
  east: number;
  west: number;
}

type PinState = "idle" | "hover" | "active";

const COLORS = {
  forest: "#1F3A2E",
  brass: "#B5651D",
  cream: "#FEFCF9",
};

// The figure a pin shows, given the active view: monthly rent (Rent) or sale
// price (Buy). In Rent, buildings show whole-unit rent (฿/mo); land shows the
// per-rai lease (฿/rai·mo). Falls back to the type label when no figure is set.
function pinLabel(p: MapPoint, mode: ViewMode, perMonth: string, perRaiMonth: string): string {
  if (mode === "rent") {
    if (p.rentPerMonth) return formatRentCompact(p.rentPerMonth, perMonth);
    if (p.rentPerRaiMonth) return formatRentCompact(p.rentPerRaiMonth, perRaiMonth);
    return p.type;
  }
  return p.priceThb ? formatPriceCompact(p.priceThb) : p.type;
}

// Airbnb-style price pill, anchored by its bottom tip at the coordinate. We size
// the icon to [0,0] and let the inner <span> grow with the label, shifting it up
// and left so the visual bottom-centre sits on the point.
function pricePin(p: MapPoint, state: PinState, mode: ViewMode, perMonth: string, perRaiMonth: string): L.DivIcon {
  const label = pinLabel(p, mode, perMonth, perRaiMonth);
  const bg = state === "idle" ? COLORS.forest : COLORS.brass;
  const z = state === "active" ? "z-index:10000;" : state === "hover" ? "z-index:9000;" : "";
  const scale = state === "idle" ? "" : "transform:translate(-50%,-100%) scale(1.08);";
  return L.divIcon({
    className: "rw-pin-icon",
    html: `<span style="
      position:absolute;left:0;top:0;
      transform:translate(-50%,-100%);${scale}
      transform-origin:bottom center;
      display:inline-block;white-space:nowrap;
      padding:3px 8px;border-radius:9999px;
      font:600 11px/1.3 var(--font-sans),system-ui,sans-serif;
      color:${COLORS.cream};background:${bg};
      border:1.5px solid ${COLORS.cream};
      box-shadow:0 1px 5px rgba(0,0,0,.35);
      cursor:pointer;transition:transform .12s ease;${z}
    ">${label}</span>`,
    iconSize: [0, 0],
    iconAnchor: [0, 0],
    popupAnchor: [0, -16],
  });
}

// Branded cluster bubble (forest disc, cream count) — replaces markercluster's
// default green/yellow/orange icons so the map stays on-palette.
function clusterIcon(cluster: { getChildCount: () => number }): L.DivIcon {
  const count = cluster.getChildCount();
  const size = count < 10 ? 34 : count < 30 ? 40 : 46;
  return L.divIcon({
    className: "",
    html: `<div style="
      display:flex;align-items:center;justify-content:center;
      width:${size}px;height:${size}px;border-radius:9999px;
      background:${COLORS.forest};color:${COLORS.cream};
      border:2px solid ${COLORS.cream};box-shadow:0 1px 5px rgba(0,0,0,.35);
      font:600 ${count < 100 ? 13 : 11}px/1 var(--font-sans),system-ui,sans-serif;
    ">${count}</div>`,
    iconSize: [size, size],
  });
}

function FitBounds({ points }: { points: MapPoint[] }) {
  const map = useMap();
  useEffect(() => {
    if (points.length === 0) return;
    if (points.length === 1) {
      map.setView([points[0].lat, points[0].lng], 14);
      return;
    }
    const bounds = L.latLngBounds(points.map((p) => [p.lat, p.lng] as [number, number]));
    map.fitBounds(bounds, { padding: [48, 48] });
  }, [map, points]);
  return null;
}

// Report the map's visible bounds on pan/zoom (and once on mount) so the parent
// can offer "search as I move the map" — filtering the card list to what's shown.
function BoundsWatcher({ onChange }: { onChange?: (b: MapBounds) => void }) {
  const emit = (map: L.Map) => {
    if (!onChange) return;
    const b = map.getBounds();
    onChange({ north: b.getNorth(), south: b.getSouth(), east: b.getEast(), west: b.getWest() });
  };
  const map = useMapEvents({
    moveend: () => emit(map),
    zoomend: () => emit(map),
  });
  useEffect(() => {
    emit(map);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [map]);
  return null;
}

// Fire once the visitor actually engages the map (hovers / pans / zooms) so the
// parent can switch the card list into "only what's on the map" mode.
function InteractionWatcher({ onInteract }: { onInteract?: () => void }) {
  useMapEvents({
    mouseover: () => onInteract?.(),
    dragstart: () => onInteract?.(),
    zoomstart: () => onInteract?.(),
  });
  return null;
}

// Pan to the active listing without changing zoom — gentle recentre when a card
// is selected (from a card click) so its pin is in view.
function PanToActive({ points, activeRw }: { points: MapPoint[]; activeRw: string | null }) {
  const map = useMap();
  useEffect(() => {
    if (!activeRw) return;
    const p = points.find((x) => x.rw === activeRw);
    if (!p) return;
    map.panTo([p.lat, p.lng], { animate: true, duration: 0.4 });
  }, [map, points, activeRw]);
  return null;
}

interface Props {
  points: MapPoint[];
  mode?: ViewMode;
  activeRw?: string | null;
  hoveredRw?: string | null;
  onSelect?: (rw: string) => void;
  onHover?: (rw: string | null) => void;
  onBoundsChange?: (b: MapBounds) => void;
  onInteract?: () => void;
}

export default function ListingsMap({
  points,
  mode = "buy",
  activeRw = null,
  hoveredRw = null,
  onSelect,
  onHover,
  onBoundsChange,
  onInteract,
}: Props) {
  const locale = useLocale();
  const t = getObjectDict(locale).map;
  const mapRef = useRef<L.Map | null>(null);
  const wrapperRef = useRef<HTMLDivElement | null>(null);
  const { isFull, supported: fsSupported, toggle: toggleFull } = useFullscreen(wrapperRef, mapRef);
  // Same layer choice as the object-detail map (shared localStorage), so a
  // visitor's Satellite/Cadastre/Zoning/Nearby preference carries across the site.
  const prefs = loadLayerPrefs();
  const [base, setBase] = useState<BaseLayer>(prefs.base ?? "map");
  const [parcels, setParcels] = useState(prefs.parcels ?? false);
  const [zoning, setZoning] = useState(prefs.zoning ?? false);
  const [poi, setPoi] = useState(prefs.poi ?? false);
  useEffect(() => {
    saveLayerPrefs({ base, parcels, zoning, poi });
  }, [base, parcels, zoning, poi]);

  const pill =
    "px-2.5 py-2 text-xs font-medium transition-colors focus-visible:outline focus-visible:outline-2 focus-visible:outline-brass-500";
  const pillOn = "bg-panel text-panel-fg";
  const pillOff = "bg-cream-100/95 text-forest-900 hover:bg-cream-100";

  return (
    <div
      ref={wrapperRef}
      className="relative h-full w-full overflow-hidden rounded-sm border border-forest-500/10 bg-cream-300"
    >
      <MapContainer
        ref={mapRef}
        center={[9.75, 100.02]}
        zoom={12}
        maxZoom={LISTINGS_MAX_ZOOM}
        scrollWheelZoom
        className="h-full w-full"
        style={{ background: "#e8e4da" }}
        // Names the map region for assistive tech. The only alt-less <img>s on
        // /listings are Leaflet's decorative basemap tiles (third-party); the
        // accessible handle belongs on the map container, not each tile.
        aria-label="Interactive map of Koh Phangan property listings"
        // Tile credits are ToS-required, but kept tiny (CSS) + no "Leaflet" prefix.
        attributionControl={false}
      >
        <AttributionControl prefix={false} />
        {base === "sat" ? (
          <TileLayer
            key="base-sat"
            attribution={SATELLITE_ATTRIBUTION}
            url={SATELLITE_TILE_URL}
            maxNativeZoom={SATELLITE_MAX_NATIVE_ZOOM}
            maxZoom={LISTINGS_MAX_ZOOM}
          />
        ) : base === "terrain" ? (
          // Shaded-relief base + hillshade (multiply) — see tiles.ts. Custom
          // panes keep the shade below the zoning/parcel overlays (tilePane,
          // z 200) so it only multiplies against the relief, not the overlays.
          <>
            <Pane name="terrainBase" style={{ zIndex: 190 }}>
              <TileLayer
                key="base-relief"
                attribution={TERRAIN_RELIEF_ATTRIBUTION}
                url={TERRAIN_RELIEF_TILE_URL}
                maxNativeZoom={TERRAIN_RELIEF_MAX_NATIVE_ZOOM}
                maxZoom={LISTINGS_MAX_ZOOM}
              />
            </Pane>
            <Pane name="terrainShade" style={{ zIndex: 195, mixBlendMode: "multiply" }}>
              <TileLayer
                key="base-hillshade"
                attribution={TERRAIN_ATTRIBUTION}
                url={TERRAIN_TILE_URL}
                maxNativeZoom={TERRAIN_MAX_NATIVE_ZOOM}
                maxZoom={LISTINGS_MAX_ZOOM}
                opacity={TERRAIN_HILLSHADE_OPACITY}
              />
            </Pane>
          </>
        ) : (
          <TileLayer
            key="base-map"
            attribution={TILE_ATTRIBUTION}
            url={TILE_URL}
            subdomains={TILE_SUBDOMAINS}
            maxNativeZoom={19}
            maxZoom={LISTINGS_MAX_ZOOM}
          />
        )}
        {zoning ? (
          <TileLayer
            key="cityplan"
            url={CITYPLAN_TILE_URL}
            attribution={LONGDO_ATTRIBUTION}
            opacity={0.5}
            zIndex={5}
            minNativeZoom={CITYPLAN_MIN_NATIVE_ZOOM}
            maxNativeZoom={CITYPLAN_MAX_NATIVE_ZOOM}
            maxZoom={LISTINGS_MAX_ZOOM}
          />
        ) : null}
        {parcels ? (
          <TileLayer
            key="parcels"
            url={PARCEL_TILE_URL}
            attribution={LONGDO_ATTRIBUTION}
            zIndex={6}
            minZoom={PARCEL_MIN_ZOOM}
            maxNativeZoom={PARCEL_MAX_NATIVE_ZOOM}
            maxZoom={LISTINGS_MAX_ZOOM}
          />
        ) : null}
        <FitBounds points={points} />
        <PanToActive points={points} activeRw={activeRw} />
        <BoundsWatcher onChange={onBoundsChange} />
        <InteractionWatcher onInteract={onInteract} />
        <MarkerClusterGroup
          chunkedLoading
          showCoverageOnHover={false}
          maxClusterRadius={48}
          spiderfyOnMaxZoom
          iconCreateFunction={clusterIcon}
        >
          {points.map((p) => {
            const state: PinState =
              p.rw === activeRw ? "active" : p.rw === hoveredRw ? "hover" : "idle";
            return (
              <Marker
                key={p.rw}
                position={[p.lat, p.lng]}
                icon={pricePin(p, state, mode, t.perMonth, t.perRaiMonth)}
                eventHandlers={{
                  click: () => onSelect?.(p.rw),
                  mouseover: () => onHover?.(p.rw),
                  mouseout: () => onHover?.(null),
                }}
              >
                <Popup>
                  <a
                    href={`/object/${p.rw}`}
                    target="_blank"
                    rel="noopener"
                    className="block w-44 no-underline"
                  >
                    {p.cover ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img
                        src={p.cover}
                        alt={p.title}
                        className="mb-2 h-24 w-full rounded-sm object-cover"
                        // Hide gracefully if the cover 402s (optimizer cap) or
                        // 403s (blob store blocked) — a broken-image box in a
                        // tiny popup looks worse than no image. The title/price
                        // below still render. → memory project_image_optimization_limit
                        onError={(e) => {
                          e.currentTarget.style.display = "none";
                        }}
                      />
                    ) : null}
                    <span className="block text-[11px] uppercase tracking-wide text-forest-500/70">
                      {p.rw} · {p.type}
                    </span>
                    <span className="block font-serif text-sm leading-snug text-forest-900">
                      {p.title}
                    </span>
                    {mode === "rent" ? (
                      p.rentPerMonth ? (
                        <span className="num mt-1 block text-sm text-forest-900">
                          {formatRentCompact(p.rentPerMonth, t.perMonth)}
                        </span>
                      ) : p.rentPerRaiMonth ? (
                        <span className="num mt-1 block text-sm text-forest-900">
                          {formatRentCompact(p.rentPerRaiMonth, t.perRaiMonth)}
                        </span>
                      ) : null
                    ) : p.priceThb ? (
                      <span className="num mt-1 block text-sm text-forest-900">
                        {formatPriceCompact(p.priceThb)}
                      </span>
                    ) : null}
                  </a>
                </Popup>
              </Marker>
            );
          })}
        </MarkerClusterGroup>
        {poi ? <PoiMarkers locale={locale} t={t} /> : null}
      </MapContainer>

      {/* Layer controls — same set as the object map (shared preference). */}
      <div className="absolute right-2 top-2 z-[1000] flex flex-col items-end gap-1.5">
        <div className="flex overflow-hidden rounded-sm border border-forest-500/20 shadow-sm">
          <button type="button" aria-pressed={base === "map"} className={cn(pill, base === "map" ? pillOn : pillOff)} onClick={() => setBase("map")}>
            {t.baseMap}
          </button>
          <button type="button" aria-pressed={base === "sat"} className={cn(pill, base === "sat" ? pillOn : pillOff)} onClick={() => setBase("sat")}>
            {t.baseSatellite}
          </button>
          <button type="button" aria-pressed={base === "terrain"} className={cn(pill, base === "terrain" ? pillOn : pillOff)} onClick={() => setBase("terrain")}>
            {t.baseTerrain}
          </button>
        </div>
        <button
          type="button"
          aria-pressed={parcels}
          className={cn(pill, "rounded-sm border border-forest-500/20 shadow-sm", parcels ? pillOn : pillOff)}
          onClick={() => setParcels((v) => !v)}
        >
          {t.parcels}
        </button>
        <button
          type="button"
          aria-pressed={zoning}
          className={cn(pill, "rounded-sm border border-forest-500/20 shadow-sm", zoning ? pillOn : pillOff)}
          onClick={() => setZoning((v) => !v)}
        >
          {t.zoning}
        </button>
        <button
          type="button"
          aria-pressed={poi}
          className={cn(pill, "rounded-sm border border-forest-500/20 shadow-sm", poi ? pillOn : pillOff)}
          onClick={() => setPoi((v) => !v)}
        >
          {t.poiLayer}
        </button>
        {fsSupported ? (
          <button
            type="button"
            aria-label={isFull ? t.fullscreenExit : t.fullscreen}
            aria-pressed={isFull}
            className={cn(
              "rounded-sm border border-forest-500/20 p-2.5 shadow-sm transition-colors focus-visible:outline focus-visible:outline-2 focus-visible:outline-brass-500",
              isFull ? pillOn : pillOff,
            )}
            onClick={toggleFull}
          >
            {isFull ? <Minimize2 size={16} aria-hidden /> : <Maximize2 size={16} aria-hidden />}
          </button>
        ) : null}
      </div>

      {zoning || parcels || poi ? (
        <MapLegend zoning={zoning} poi={poi} showSource={zoning || parcels} t={t} />
      ) : null}
    </div>
  );
}
