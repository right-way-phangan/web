"use client";

import { useEffect } from "react";
import { MapContainer, TileLayer, Marker, AttributionControl, useMap, useMapEvents } from "react-leaflet";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import {
  TILE_URL,
  TILE_ATTRIBUTION,
  CITYPLAN_TILE_URL,
  CITYPLAN_MIN_NATIVE_ZOOM,
  CITYPLAN_MAX_NATIVE_ZOOM,
  LONGDO_ATTRIBUTION,
} from "@/lib/leaflet/tiles";

/**
 * Click-to-pick map for the standalone zoning checker. Shows the DPT city-plan
 * colour overlay so the user sees the zones while choosing a point; a click
 * (or a coord typed into the parent) drops the pin and reports lat/lng up.
 * Leaflet touches `window`, so the parent imports this with ssr:false.
 */

const MAX_ZOOM = 20;

// Brass dot — same visual language as the object map pin (divIcon avoids the
// default Leaflet marker image assets entirely).
const pinIcon = L.divIcon({
  className: "",
  html: `<span style="display:block;width:14px;height:14px;border-radius:50%;background:#B5651D;border:2px solid #FEFCF9;box-shadow:0 1px 4px rgba(0,0,0,.35)"></span>`,
  iconSize: [14, 14],
  iconAnchor: [7, 7],
});

function ClickCapture({ onPick }: { onPick: (lat: number, lng: number) => void }) {
  useMapEvents({ click: (e) => onPick(e.latlng.lat, e.latlng.lng) });
  return null;
}

// Recenter on a pin set from the text input (not from a map click — those are
// already in view). Zooms in to at least z16 so the zone colour is readable.
function Recenter({ marker }: { marker: { lat: number; lng: number } | null }) {
  const map = useMap();
  useEffect(() => {
    if (marker) map.flyTo([marker.lat, marker.lng], Math.max(map.getZoom(), 16));
  }, [marker?.lat, marker?.lng]); // eslint-disable-line react-hooks/exhaustive-deps
  return null;
}

export default function ZoneMapPicker({
  marker,
  onPick,
}: {
  marker: { lat: number; lng: number } | null;
  onPick: (lat: number, lng: number) => void;
}) {
  return (
    <MapContainer
      center={[9.75, 100.02]}
      zoom={12}
      maxZoom={MAX_ZOOM}
      scrollWheelZoom={false}
      className="h-full w-full cursor-crosshair"
      style={{ background: "#e8e4da" }}
      attributionControl={false}
    >
      <AttributionControl prefix={false} />
      <TileLayer
        attribution={TILE_ATTRIBUTION}
        url={TILE_URL}
        maxNativeZoom={19}
        maxZoom={MAX_ZOOM}
      />
      {/* City-plan zone colours so the user can see what they're clicking. */}
      <TileLayer
        url={CITYPLAN_TILE_URL}
        attribution={LONGDO_ATTRIBUTION}
        opacity={0.5}
        zIndex={5}
        minNativeZoom={CITYPLAN_MIN_NATIVE_ZOOM}
        maxNativeZoom={CITYPLAN_MAX_NATIVE_ZOOM}
        maxZoom={MAX_ZOOM}
      />
      <ClickCapture onPick={onPick} />
      <Recenter marker={marker} />
      {marker ? <Marker position={[marker.lat, marker.lng]} icon={pinIcon} /> : null}
    </MapContainer>
  );
}
