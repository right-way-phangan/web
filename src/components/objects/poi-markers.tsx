"use client";

import { Marker, Popup } from "react-leaflet";
import L from "leaflet";
import type { Locale, ObjectDict } from "@/lib/i18n/dictionaries";
import { PHANGAN_AMENITIES, type AmenityCat } from "@/lib/data/phangan-poi";
import { haversineMeters, formatDistance } from "@/lib/utils/geo";

/**
 * "Nearby" amenity overlay shared by the object-detail and /listings maps —
 * orientation markers for the ferry pier, hospital, school, shops and banks.
 * Rendered as direct children of <MapContainer> (so they sit outside the
 * listings cluster), gated behind the layer toggle. Static set from
 * phangan-poi.ts; each marker carries a localized popup.
 */

const EMOJI: Record<AmenityCat, string> = {
  pier: "⛴",
  hospital: "🏥",
  school: "🏫",
  shop: "🛒",
  atm: "🏧",
};

const CAT_LABEL: Record<AmenityCat, keyof ObjectDict["map"]> = {
  pier: "poiPier",
  hospital: "poiHospital",
  school: "poiSchool",
  shop: "poiShop",
  atm: "poiAtm",
};

function amenityIcon(cat: AmenityCat): L.DivIcon {
  return L.divIcon({
    className: "",
    html: `<span style="display:flex;align-items:center;justify-content:center;width:24px;height:24px;border-radius:50%;background:#FEFCF9;border:1.5px solid #1F3A2E;box-shadow:0 1px 4px rgba(0,0,0,.3);font-size:13px;line-height:1">${EMOJI[cat]}</span>`,
    iconSize: [24, 24],
    iconAnchor: [12, 12],
    popupAnchor: [0, -12],
  });
}

export function PoiMarkers({
  locale,
  t,
  origin,
}: {
  locale: Locale;
  t: ObjectDict["map"];
  // When set (object-detail map), each popup shows the straight-line distance
  // from this plot. Omitted on /listings (no single origin).
  origin?: { lat: number; lng: number };
}) {
  return (
    <>
      {PHANGAN_AMENITIES.map((a) => {
        const dist = origin
          ? formatDistance(haversineMeters(origin.lat, origin.lng, a.lat, a.lng), locale)
          : null;
        return (
          <Marker key={`${a.cat}-${a.en}`} position={[a.lat, a.lng]} icon={amenityIcon(a.cat)}>
            <Popup>
              <span className="block text-[11px] uppercase tracking-wide text-forest-500/70">
                {t[CAT_LABEL[a.cat]]}
              </span>
              <span className="block font-serif text-sm leading-snug text-forest-900">
                {locale === "ru" ? a.ru : a.en}
              </span>
              {dist ? (
                <span className="num mt-0.5 block text-xs text-forest-500/80">≈ {dist}</span>
              ) : null}
            </Popup>
          </Marker>
        );
      })}
    </>
  );
}
