"use client";

import { useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import type { Route } from "next";
import { track } from "@vercel/analytics";
import { MapContainer, TileLayer, Marker, useMap } from "react-leaflet";
import L, { type Map as LeafletMap } from "leaflet";
import "leaflet/dist/leaflet.css";
import { useLeafletStrictModeFix } from "@/lib/leaflet/strict-mode-fix";

export interface DistrictPoint {
  slug: string;
  amoName: string;
  name: string;
  lat: number;
  lng: number;
  count: number;
}

const COLORS = { forest: "#1F3A2E", brass: "#B5651D", cream: "#FEFCF9" };

// District label pin — name + listing count, navigates to the filtered listings.
function districtIcon(p: DistrictPoint): L.DivIcon {
  const badge =
    p.count > 0
      ? `<span style="margin-left:6px;padding:1px 6px;border-radius:9999px;background:${COLORS.brass};color:${COLORS.cream};font-size:10px;">${p.count}</span>`
      : "";
  return L.divIcon({
    className: "rw-district-icon",
    html: `<span style="
      position:absolute;left:0;top:0;transform:translate(-50%,-100%);
      display:inline-flex;align-items:center;white-space:nowrap;
      padding:4px 10px;border-radius:9999px;
      font:600 12px/1.3 var(--font-sans),system-ui,sans-serif;
      color:${COLORS.cream};background:${COLORS.forest};
      border:1.5px solid ${COLORS.cream};box-shadow:0 1px 5px rgba(0,0,0,.35);
      cursor:pointer;
    ">${p.name}${badge}</span>`,
    iconSize: [0, 0],
    iconAnchor: [0, 0],
  });
}

function FitBounds({ points }: { points: DistrictPoint[] }) {
  const map = useMap();
  useEffect(() => {
    if (points.length === 0) return;
    const bounds = L.latLngBounds(points.map((p) => [p.lat, p.lng] as [number, number]));
    map.fitBounds(bounds, { padding: [56, 56] });
  }, [map, points]);
  return null;
}

export default function DistrictsMapLeaflet({ points }: { points: DistrictPoint[] }) {
  const router = useRouter();
  const mapRef = useRef<LeafletMap | null>(null);
  const wrapperRef = useRef<HTMLDivElement | null>(null);
  useLeafletStrictModeFix(wrapperRef);
  useEffect(() => () => {
    mapRef.current?.remove();
    mapRef.current = null;
  }, []);

  return (
    <div ref={wrapperRef} className="h-full w-full overflow-hidden rounded-sm border border-forest-500/10">
      <MapContainer
        ref={mapRef}
        center={[9.75, 100.0]}
        zoom={12}
        scrollWheelZoom={false}
        className="h-full w-full"
        style={{ background: "#e8e4da" }}
      >
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
        <FitBounds points={points} />
        {points.map((p) => (
          <Marker
            key={p.slug}
            position={[p.lat, p.lng]}
            icon={districtIcon(p)}
            eventHandlers={{
              click: () => {
                track("district_map_click", { district: p.amoName });
                router.push(
                  `/listings?district=${encodeURIComponent(p.amoName)}` as Route,
                );
              },
            }}
          />
        ))}
      </MapContainer>
    </div>
  );
}
