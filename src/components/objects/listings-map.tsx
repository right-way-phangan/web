"use client";

import { useEffect } from "react";
import { MapContainer, TileLayer, Marker, Popup, useMap } from "react-leaflet";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
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

// Brass teardrop pin — avoids Leaflet's bundler-broken default marker images.
const pinIcon = L.divIcon({
  className: "",
  html: `<span style="display:block;width:18px;height:18px;border-radius:50% 50% 50% 0;background:#B5651D;border:2px solid #FdF8F0;transform:rotate(-45deg);box-shadow:0 1px 4px rgba(0,0,0,.4)"></span>`,
  iconSize: [18, 18],
  iconAnchor: [9, 18],
  popupAnchor: [0, -18],
});

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

export default function ListingsMap({ points }: { points: MapPoint[] }) {
  return (
    <div className="mt-8 h-[70vh] w-full overflow-hidden rounded-sm border border-forest-500/10">
      <MapContainer
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
        {points.map((p) => (
          <Marker key={p.rw} position={[p.lat, p.lng]} icon={pinIcon}>
            <Popup>
              <a
                href={`/object/${p.rw}`}
                className="block w-44 no-underline"
              >
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
                  <span className="mt-1 block font-serif text-sm text-forest-900">
                    {formatPriceCompact(p.priceThb)}
                  </span>
                ) : null}
              </a>
            </Popup>
          </Marker>
        ))}
      </MapContainer>
    </div>
  );
}
