"use client";

import { MapContainer, TileLayer, Marker } from "react-leaflet";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import { TILE_URL, TILE_ATTRIBUTION, TILE_SUBDOMAINS } from "@/lib/leaflet/tiles";

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
  return (
    <div className="h-full w-full overflow-hidden rounded-sm border border-forest-500/10">
      <MapContainer
        center={[lat, lng]}
        zoom={15}
        scrollWheelZoom={false}
        className="h-full w-full"
        style={{ background: "#e8e4da" }}
      >
        <TileLayer attribution={TILE_ATTRIBUTION} url={TILE_URL} subdomains={TILE_SUBDOMAINS} />
        <Marker position={[lat, lng]} icon={pinIcon} />
      </MapContainer>
    </div>
  );
}
