"use client";

import { useEffect, useRef } from "react";
import { MapContainer, TileLayer, Marker, Popup, useMap, useMapEvents } from "react-leaflet";
import type { Map as LeafletMap } from "leaflet";
import MarkerClusterGroup from "react-leaflet-cluster";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import "leaflet.markercluster/dist/MarkerCluster.css";
import { formatPriceCompact } from "@/lib/utils/price";

export interface MapPoint {
  rw: string;
  title: string;
  type: string;
  lat: number;
  lng: number;
  priceThb?: number;
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

// Airbnb-style price pill, anchored by its bottom tip at the coordinate. We size
// the icon to [0,0] and let the inner <span> grow with the label, shifting it up
// and left so the visual bottom-centre sits on the point.
function pricePin(p: MapPoint, state: PinState): L.DivIcon {
  const label = p.priceThb ? formatPriceCompact(p.priceThb) : p.type;
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
  activeRw?: string | null;
  hoveredRw?: string | null;
  onSelect?: (rw: string) => void;
  onHover?: (rw: string | null) => void;
  onBoundsChange?: (b: MapBounds) => void;
}

export default function ListingsMap({
  points,
  activeRw = null,
  hoveredRw = null,
  onSelect,
  onHover,
  onBoundsChange,
}: Props) {
  // Tear the Leaflet instance down on unmount so React 18 StrictMode's dev
  // double-mount doesn't hit "Map container is already initialized" — the
  // container div keeps its `_leaflet_id` unless we explicitly remove the map.
  const mapRef = useRef<LeafletMap | null>(null);
  useEffect(() => () => {
    mapRef.current?.remove();
    mapRef.current = null;
  }, []);

  return (
    <div className="h-full w-full overflow-hidden rounded-sm border border-forest-500/10">
      <MapContainer
        ref={mapRef}
        center={[9.75, 100.02]}
        zoom={12}
        scrollWheelZoom
        className="h-full w-full"
        style={{ background: "#e8e4da" }}
      >
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
        <FitBounds points={points} />
        <PanToActive points={points} activeRw={activeRw} />
        <BoundsWatcher onChange={onBoundsChange} />
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
                icon={pricePin(p, state)}
                eventHandlers={{
                  click: () => onSelect?.(p.rw),
                  mouseover: () => onHover?.(p.rw),
                  mouseout: () => onHover?.(null),
                }}
              >
                <Popup>
                  <a href={`/object/${p.rw}`} className="block w-44 no-underline">
                    {p.cover ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img
                        src={p.cover}
                        alt={p.title}
                        className="mb-2 h-24 w-full rounded-sm object-cover"
                      />
                    ) : null}
                    <span className="block text-[11px] uppercase tracking-wide text-forest-500/60">
                      {p.rw} · {p.type}
                    </span>
                    <span className="block font-serif text-sm leading-snug text-forest-900">
                      {p.title}
                    </span>
                    {p.priceThb ? (
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
      </MapContainer>
    </div>
  );
}
