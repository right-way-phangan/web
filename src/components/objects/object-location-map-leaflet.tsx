"use client";

import { useEffect, useRef } from "react";
import { MapContainer, TileLayer, Marker } from "react-leaflet";
import L, { type Map as LeafletMap } from "leaflet";
import "leaflet/dist/leaflet.css";

// Brass teardrop pin (matches the listings map's idle pin shape).
const pinIcon = L.divIcon({
  className: "",
  html: `<span style="display:block;width:22px;height:22px;border-radius:50% 50% 50% 0;background:#B5651D;border:2px solid #FEFCF9;transform:rotate(-45deg);box-shadow:0 1px 5px rgba(0,0,0,.4)"></span>`,
  iconSize: [22, 22],
  iconAnchor: [11, 22],
});

interface Props {
  lat: number;
  lng: number;
}

export default function ObjectLocationMapLeaflet({ lat, lng }: Props) {
  // Tear the Leaflet instance down on unmount — see listings-map.tsx for why.
  const mapRef = useRef<LeafletMap | null>(null);
  useEffect(() => () => {
    mapRef.current?.remove();
    mapRef.current = null;
  }, []);

  return (
    <div className="h-full w-full overflow-hidden rounded-sm border border-forest-500/10">
      <MapContainer
        ref={mapRef}
        center={[lat, lng]}
        zoom={15}
        scrollWheelZoom={false}
        className="h-full w-full"
        style={{ background: "#e8e4da" }}
      >
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
        <Marker position={[lat, lng]} icon={pinIcon} />
      </MapContainer>
    </div>
  );
}
