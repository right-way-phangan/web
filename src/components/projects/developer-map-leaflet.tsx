"use client";

import { MapContainer, TileLayer, Marker, Popup, AttributionControl } from "react-leaflet";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import { TILE_URL, TILE_ATTRIBUTION, TILE_SUBDOMAINS } from "@/lib/leaflet/tiles";
import type { DeveloperLocation } from "@/content/developers/types";
import type { Locale } from "@/lib/i18n/dictionaries";

// Brass teardrop pin — same shape as the object map ([[object-location-map-leaflet]]).
const pinIcon = L.divIcon({
  className: "",
  html: `<span style="display:block;width:20px;height:20px;border-radius:50% 50% 50% 0;background:#B5651D;border:2px solid #FEFCF9;transform:rotate(-45deg);box-shadow:0 1px 5px rgba(0,0,0,.4)"></span>`,
  iconSize: [20, 20],
  iconAnchor: [10, 20],
  popupAnchor: [0, -18],
});

/** Developer's projects on one map — a pin per site, framed to fit them all. */
export default function DeveloperMapLeaflet({
  locations,
  locale,
}: {
  locations: DeveloperLocation[];
  locale: Locale;
}) {
  const bounds = L.latLngBounds(locations.map((l) => [l.lat, l.lng] as [number, number]));
  return (
    <div className="h-full w-full overflow-hidden rounded-sm border border-forest-500/10 bg-cream-300">
      <MapContainer
        bounds={bounds.pad(0.45)}
        boundsOptions={{ maxZoom: 15 }}
        scrollWheelZoom={false}
        className="h-full w-full"
        style={{ background: "#e8e4da" }}
        attributionControl={false}
      >
        <AttributionControl prefix={false} />
        <TileLayer
          attribution={TILE_ATTRIBUTION}
          url={TILE_URL}
          subdomains={TILE_SUBDOMAINS}
          maxNativeZoom={19}
          maxZoom={19}
        />
        {locations.map((l) => (
          <Marker key={l.title} position={[l.lat, l.lng]} icon={pinIcon}>
            <Popup>
              <span className="block font-serif text-sm leading-snug text-forest-900">
                {l.title}
              </span>
              {l.note ? (
                <span className="mt-0.5 block text-[11px] text-forest-500/70">{l.note[locale]}</span>
              ) : null}
              <a
                href={`https://www.google.com/maps/dir/?api=1&destination=${l.lat},${l.lng}`}
                target="_blank"
                rel="noopener noreferrer"
                className="mt-1.5 block text-[11px] font-medium text-brass-500"
              >
                {locale === "ru" ? "Маршрут" : "Directions"}
              </a>
            </Popup>
          </Marker>
        ))}
      </MapContainer>
    </div>
  );
}
