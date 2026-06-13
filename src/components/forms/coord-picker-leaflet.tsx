"use client";

/**
 * Admin map editor for /admin/new: drop/drag the object pin and trace the plot
 * contour over the DOL cadastral layer. Admin-only — labels are RU by design
 * (the whole intake form is RU), no dictionary indirection.
 */

import { useState } from "react";
import { MapContainer, TileLayer, Marker, Polygon, Polyline, useMapEvents } from "react-leaflet";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import {
  TILE_URL,
  TILE_ATTRIBUTION,
  TILE_SUBDOMAINS,
  SATELLITE_TILE_URL,
  SATELLITE_ATTRIBUTION,
  SATELLITE_MAX_NATIVE_ZOOM,
  PARCEL_TILE_URL,
  PARCEL_MIN_ZOOM,
  PARCEL_MAX_NATIVE_ZOOM,
  LONGDO_ATTRIBUTION,
} from "@/lib/leaflet/tiles";
import { polygonAreaSqm, formatAreaRu } from "@/lib/utils/geo";
import { cn } from "@/lib/utils/cn";

const MAX_ZOOM = 20;
const PHANGAN_CENTER: [number, number] = [9.738, 100.0135];

const pinIcon = L.divIcon({
  className: "",
  html: `<span style="display:block;width:22px;height:22px;border-radius:50% 50% 50% 0;background:#B5651D;border:2px solid #FEFCF9;transform:rotate(-45deg);box-shadow:0 1px 5px rgba(0,0,0,.4)"></span>`,
  iconSize: [22, 22],
  iconAnchor: [11, 22],
});

const vertexIcon = L.divIcon({
  className: "",
  html: `<span style="display:block;width:12px;height:12px;border-radius:50%;background:#FEFCF9;border:2px solid #B5651D;box-shadow:0 1px 3px rgba(0,0,0,.4)"></span>`,
  iconSize: [12, 12],
  iconAnchor: [6, 6],
});

export interface CoordPickerLeafletProps {
  pin: { lat: number; lng: number } | null;
  polygon: Array<[number, number]>;
  onPin: (lat: number, lng: number) => void;
  onPolygon: (pts: Array<[number, number]>) => void;
}

function ClickHandler({
  mode,
  onPick,
}: {
  mode: "pin" | "poly";
  onPick: (mode: "pin" | "poly", lat: number, lng: number) => void;
}) {
  useMapEvents({
    click: (e) => onPick(mode, e.latlng.lat, e.latlng.lng),
  });
  return null;
}

export default function CoordPickerLeaflet({ pin, polygon, onPin, onPolygon }: CoordPickerLeafletProps) {
  const [base, setBase] = useState<"map" | "sat">("sat");
  const [cadastre, setCadastre] = useState(true);
  const [mode, setMode] = useState<"pin" | "poly">("pin");

  const areaSqm = polygonAreaSqm(polygon);

  function handlePick(m: "pin" | "poly", lat: number, lng: number) {
    if (m === "pin") onPin(lat, lng);
    else onPolygon([...polygon, [lat, lng]]);
  }

  function moveVertex(i: number, lat: number, lng: number) {
    const next = polygon.slice();
    next[i] = [lat, lng];
    onPolygon(next);
  }

  const pill =
    "px-2.5 py-1.5 text-xs font-medium transition-colors focus-visible:outline focus-visible:outline-2 focus-visible:outline-brass-500";
  const pillOn = "bg-forest-500 text-cream-100";
  const pillOff = "bg-cream-100/95 text-forest-900 hover:bg-cream-100";

  return (
    <div className="space-y-2">
      <div className="relative h-[420px] w-full overflow-hidden rounded-sm border border-forest-500/15">
        <MapContainer
          center={pin ? [pin.lat, pin.lng] : PHANGAN_CENTER}
          zoom={pin ? 17 : 11}
          maxZoom={MAX_ZOOM}
          className="h-full w-full"
          style={{ background: "#e8e4da" }}
        >
          <ClickHandler mode={mode} onPick={handlePick} />
          {base === "sat" ? (
            <TileLayer
              key="base-sat"
              attribution={SATELLITE_ATTRIBUTION}
              url={SATELLITE_TILE_URL}
              maxNativeZoom={SATELLITE_MAX_NATIVE_ZOOM}
              maxZoom={MAX_ZOOM}
            />
          ) : (
            <TileLayer
              key="base-map"
              attribution={TILE_ATTRIBUTION}
              url={TILE_URL}
              subdomains={TILE_SUBDOMAINS}
              maxNativeZoom={19}
              maxZoom={MAX_ZOOM}
            />
          )}
          {cadastre ? (
            <TileLayer
              key="parcels"
              url={PARCEL_TILE_URL}
              attribution={LONGDO_ATTRIBUTION}
              zIndex={6}
              minZoom={PARCEL_MIN_ZOOM}
              maxNativeZoom={PARCEL_MAX_NATIVE_ZOOM}
              maxZoom={MAX_ZOOM}
            />
          ) : null}

          {polygon.length >= 3 ? (
            <Polygon
              positions={polygon}
              pathOptions={{ color: "#B5651D", weight: 2, opacity: 0.9, fillColor: "#B5651D", fillOpacity: 0.12 }}
            />
          ) : polygon.length === 2 ? (
            <Polyline positions={polygon} pathOptions={{ color: "#B5651D", weight: 2, dashArray: "4 4" }} />
          ) : null}
          {polygon.map(([la, ln], i) => (
            <Marker
              key={`v-${i}`}
              position={[la, ln]}
              icon={vertexIcon}
              draggable
              eventHandlers={{
                dragend: (e) => {
                  const ll = (e.target as L.Marker).getLatLng();
                  moveVertex(i, ll.lat, ll.lng);
                },
              }}
            />
          ))}

          {pin ? (
            <Marker
              position={[pin.lat, pin.lng]}
              icon={pinIcon}
              draggable
              eventHandlers={{
                dragend: (e) => {
                  const ll = (e.target as L.Marker).getLatLng();
                  onPin(ll.lat, ll.lng);
                },
              }}
            />
          ) : null}
        </MapContainer>

        <div className="absolute right-2 top-2 z-[1000] flex flex-col items-end gap-1.5">
          <div className="flex overflow-hidden rounded-sm border border-forest-500/20 shadow-sm">
            <button type="button" aria-pressed={base === "map"} className={cn(pill, base === "map" ? pillOn : pillOff)} onClick={() => setBase("map")}>
              Карта
            </button>
            <button type="button" aria-pressed={base === "sat"} className={cn(pill, base === "sat" ? pillOn : pillOff)} onClick={() => setBase("sat")}>
              Спутник
            </button>
          </div>
          <button
            type="button"
            aria-pressed={cadastre}
            className={cn(pill, "rounded-sm border border-forest-500/20 shadow-sm", cadastre ? pillOn : pillOff)}
            onClick={() => setCadastre(!cadastre)}
          >
            Кадастр (z17+)
          </button>
        </div>

        <div className="absolute left-2 top-2 z-[1000] flex overflow-hidden rounded-sm border border-forest-500/20 shadow-sm">
          <button type="button" aria-pressed={mode === "pin"} className={cn(pill, mode === "pin" ? pillOn : pillOff)} onClick={() => setMode("pin")}>
            📍 Пин
          </button>
          <button type="button" aria-pressed={mode === "poly"} className={cn(pill, mode === "poly" ? pillOn : pillOff)} onClick={() => setMode("poly")}>
            ⬠ Контур
          </button>
        </div>
      </div>

      <div className="flex flex-wrap items-center gap-3 text-xs text-forest-900/80">
        <span>
          {mode === "pin"
            ? "Клик по карте — поставить пин (или перетащите его)."
            : "Клик — добавить вершину; вершины можно перетаскивать."}
        </span>
        {polygon.length > 0 ? (
          <>
            <button
              type="button"
              className="rounded-sm border border-forest-500/20 px-2 py-1 hover:bg-forest-500/5"
              onClick={() => onPolygon(polygon.slice(0, -1))}
            >
              ← Убрать точку
            </button>
            <button
              type="button"
              className="rounded-sm border border-forest-500/20 px-2 py-1 text-red-700 hover:bg-red-50"
              onClick={() => onPolygon([])}
            >
              Очистить контур
            </button>
          </>
        ) : null}
        {polygon.length >= 3 ? (
          <span className="font-medium text-forest-900">Контур: {polygon.length} точек · {formatAreaRu(areaSqm)}</span>
        ) : polygon.length > 0 ? (
          <span>Вершин: {polygon.length} (нужно ≥ 3)</span>
        ) : null}
      </div>
    </div>
  );
}
