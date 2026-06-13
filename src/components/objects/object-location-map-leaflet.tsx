"use client";

import { useEffect, useRef, useState } from "react";
import { MapContainer, TileLayer, Marker, Circle, Polygon, Polyline, useMapEvents } from "react-leaflet";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import { LocateFixed } from "lucide-react";
import {
  TILE_URL,
  TILE_ATTRIBUTION,
  TILE_SUBDOMAINS,
  SATELLITE_TILE_URL,
  SATELLITE_ATTRIBUTION,
  SATELLITE_MAX_NATIVE_ZOOM,
  TERRAIN_TILE_URL,
  TERRAIN_ATTRIBUTION,
  TERRAIN_MAX_NATIVE_ZOOM,
  PARCEL_TILE_URL,
  PARCEL_MIN_ZOOM,
  PARCEL_MAX_NATIVE_ZOOM,
  CITYPLAN_TILE_URL,
  CITYPLAN_MIN_NATIVE_ZOOM,
  CITYPLAN_MAX_NATIVE_ZOOM,
  LONGDO_ATTRIBUTION,
} from "@/lib/leaflet/tiles";
import { sunsetBearing, offsetPoint } from "@/lib/utils/geo";
import {
  type BaseLayer,
  type LayerPrefs,
  loadLayerPrefs,
  saveLayerPrefs,
} from "@/lib/leaflet/layer-prefs";
import { useLocale } from "@/lib/i18n/use-locale";
import { getObjectDict } from "@/lib/i18n/dictionaries";
import { cn } from "@/lib/utils/cn";
import { MapLegend } from "./map-legend";

const MAX_ZOOM = 20;

// Brass teardrop pin (matches the listings map's idle pin shape).
const pinIcon = L.divIcon({
  className: "",
  html: `<span style="display:block;width:22px;height:22px;border-radius:50% 50% 50% 0;background:#B5651D;border:2px solid #FEFCF9;transform:rotate(-45deg);box-shadow:0 1px 5px rgba(0,0,0,.4)"></span>`,
  iconSize: [22, 22],
  iconAnchor: [11, 22],
});

// Blue "you are here" dot for browser geolocation.
const meIcon = L.divIcon({
  className: "",
  html: `<span style="display:block;width:14px;height:14px;border-radius:50%;background:#2A81CB;border:2px solid #fff;box-shadow:0 0 6px rgba(42,129,203,.7)"></span>`,
  iconSize: [14, 14],
  iconAnchor: [7, 7],
});

// Sunset marker at the tip of the direction arrow (sea-view / beachfront plots).
function sunsetIcon(label: string) {
  return L.divIcon({
    className: "",
    html: `<span style="display:inline-flex;align-items:center;gap:3px;white-space:nowrap;padding:1px 6px;border-radius:9px;background:rgba(181,101,29,.92);color:#FEFCF9;font-size:11px;font-weight:600;box-shadow:0 1px 4px rgba(0,0,0,.35)">🌅 ${label}</span>`,
    iconSize: [0, 0],
    iconAnchor: [-6, 8],
  });
}

function ZoomWatcher({ onZoom }: { onZoom: (z: number) => void }) {
  useMapEvents({ zoomend: (e) => onZoom((e.target as L.Map).getZoom()) });
  return null;
}

interface Props {
  lat: number;
  lng: number;
  plotPolygon?: Array<[number, number]>;
  // Sea-view / beachfront plots get a sunset-direction arrow from the pin.
  showSunset?: boolean;
}

export default function ObjectLocationMapLeaflet({ lat, lng, plotPolygon, showSunset }: Props) {
  const t = getObjectDict(useLocale()).map;
  const mapRef = useRef<L.Map | null>(null);
  const watchId = useRef<number | null>(null);

  const hasPolygon = (plotPolygon?.length ?? 0) >= 3;
  // Restore the visitor's last layer choice; otherwise a contour reads best
  // over imagery, so default to satellite when one is present.
  const prefs = useRef<Partial<LayerPrefs>>(loadLayerPrefs()).current;
  const [base, setBase] = useState<BaseLayer>(prefs.base ?? (hasPolygon ? "sat" : "map"));
  const [parcels, setParcels] = useState(prefs.parcels ?? false);
  const [zoning, setZoning] = useState(prefs.zoning ?? false);
  const [zoom, setZoom] = useState(15);
  const [me, setMe] = useState<{ lat: number; lng: number; acc: number } | null>(null);
  const [geoBusy, setGeoBusy] = useState(false);
  const [geoError, setGeoError] = useState<string | null>(null);

  // Parcel tiles only exist at z17+; bring the user there when they ask for them.
  function toggleParcels() {
    const next = !parcels;
    setParcels(next);
    const map = mapRef.current;
    if (next && map && map.getZoom() < PARCEL_MIN_ZOOM) {
      map.flyTo([lat, lng], PARCEL_MIN_ZOOM);
    }
  }

  function stopWatch() {
    if (watchId.current != null) {
      navigator.geolocation.clearWatch(watchId.current);
      watchId.current = null;
    }
  }

  function toggleLocate() {
    if (watchId.current != null || me) {
      stopWatch();
      setMe(null);
      setGeoBusy(false);
      return;
    }
    if (typeof navigator === "undefined" || !("geolocation" in navigator)) {
      setGeoError(t.locateError);
      return;
    }
    setGeoBusy(true);
    setGeoError(null);
    let first = true;
    watchId.current = navigator.geolocation.watchPosition(
      (pos) => {
        const fix = { lat: pos.coords.latitude, lng: pos.coords.longitude, acc: pos.coords.accuracy };
        setGeoBusy(false);
        setMe(fix);
        if (first) {
          first = false;
          // Frame the plot and the visitor together — on-site this zooms right
          // onto the land; from elsewhere it shows both at a sensible distance.
          mapRef.current?.fitBounds(
            L.latLngBounds([
              [lat, lng],
              [fix.lat, fix.lng],
            ]).pad(0.25),
            { maxZoom: 18 },
          );
        }
      },
      () => {
        setGeoBusy(false);
        setGeoError(t.locateError);
        stopWatch();
      },
      { enableHighAccuracy: true, maximumAge: 5000, timeout: 15000 },
    );
  }

  useEffect(() => stopWatch, []);

  // Remember the layer choice for the next map (object detail / listings).
  useEffect(() => {
    saveLayerPrefs({ base, parcels, zoning });
  }, [base, parcels, zoning]);

  // Sunset-direction arrow from the pin (sea-view / beachfront plots).
  const sunset = showSunset ? sunsetBearing(lat) : null;
  const sunsetTip = sunset != null ? offsetPoint(lat, lng, sunset, 300) : null;

  const pill =
    "px-2.5 py-2 text-xs font-medium transition-colors focus-visible:outline focus-visible:outline-2 focus-visible:outline-brass-500";
  const pillOn = "bg-forest-500 text-cream-100";
  const pillOff = "bg-cream-100/95 text-forest-900 hover:bg-cream-100";

  return (
    <div className="relative h-full w-full overflow-hidden rounded-sm border border-forest-500/10">
      <MapContainer
        ref={mapRef}
        center={[lat, lng]}
        zoom={15}
        // With a traced contour, open framed on the plot itself.
        {...(hasPolygon
          ? { bounds: L.latLngBounds(plotPolygon!).pad(0.6), boundsOptions: { maxZoom: 18 } }
          : {})}
        maxZoom={MAX_ZOOM}
        scrollWheelZoom={false}
        className="h-full w-full"
        style={{ background: "#e8e4da" }}
      >
        <ZoomWatcher onZoom={setZoom} />
        {base === "sat" ? (
          <TileLayer
            key="base-sat"
            attribution={SATELLITE_ATTRIBUTION}
            url={SATELLITE_TILE_URL}
            maxNativeZoom={SATELLITE_MAX_NATIVE_ZOOM}
            maxZoom={MAX_ZOOM}
          />
        ) : base === "terrain" ? (
          <TileLayer
            key="base-terrain"
            attribution={TERRAIN_ATTRIBUTION}
            url={TERRAIN_TILE_URL}
            maxNativeZoom={TERRAIN_MAX_NATIVE_ZOOM}
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
        {zoning ? (
          <TileLayer
            key="cityplan"
            url={CITYPLAN_TILE_URL}
            attribution={LONGDO_ATTRIBUTION}
            opacity={0.5}
            zIndex={5}
            minNativeZoom={CITYPLAN_MIN_NATIVE_ZOOM}
            maxNativeZoom={CITYPLAN_MAX_NATIVE_ZOOM}
            maxZoom={MAX_ZOOM}
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
            maxZoom={MAX_ZOOM}
          />
        ) : null}
        {hasPolygon ? (
          <Polygon
            positions={plotPolygon!}
            pathOptions={{ color: "#B5651D", weight: 2.5, opacity: 0.9, fillColor: "#B5651D", fillOpacity: 0.14 }}
          />
        ) : null}
        {sunsetTip ? (
          <>
            <Polyline
              positions={[[lat, lng], sunsetTip]}
              pathOptions={{ color: "#B5651D", weight: 2, opacity: 0.85, dashArray: "5 5" }}
            />
            <Marker position={sunsetTip} icon={sunsetIcon(t.sunset)} interactive={false} />
          </>
        ) : null}
        <Marker position={[lat, lng]} icon={pinIcon} />
        {me ? (
          <>
            <Circle
              center={[me.lat, me.lng]}
              radius={me.acc}
              pathOptions={{ color: "#2A81CB", weight: 1, opacity: 0.6, fillOpacity: 0.12 }}
            />
            <Marker position={[me.lat, me.lng]} icon={meIcon} />
          </>
        ) : null}
      </MapContainer>

      {/* Layer + locate controls (above Leaflet panes). */}
      <div className="absolute right-2 top-2 z-[1000] flex flex-col items-end gap-1.5">
        <div className="flex overflow-hidden rounded-sm border border-forest-500/20 shadow-sm">
          <button
            type="button"
            aria-pressed={base === "map"}
            className={cn(pill, base === "map" ? pillOn : pillOff)}
            onClick={() => setBase("map")}
          >
            {t.baseMap}
          </button>
          <button
            type="button"
            aria-pressed={base === "sat"}
            className={cn(pill, base === "sat" ? pillOn : pillOff)}
            onClick={() => setBase("sat")}
          >
            {t.baseSatellite}
          </button>
          <button
            type="button"
            aria-pressed={base === "terrain"}
            className={cn(pill, base === "terrain" ? pillOn : pillOff)}
            onClick={() => setBase("terrain")}
          >
            {t.baseTerrain}
          </button>
        </div>
        <button
          type="button"
          aria-pressed={parcels}
          className={cn(pill, "rounded-sm border border-forest-500/20 shadow-sm", parcels ? pillOn : pillOff)}
          onClick={toggleParcels}
        >
          {t.parcels}
        </button>
        <button
          type="button"
          aria-pressed={zoning}
          className={cn(pill, "rounded-sm border border-forest-500/20 shadow-sm", zoning ? pillOn : pillOff)}
          onClick={() => setZoning(!zoning)}
        >
          {t.zoning}
        </button>
        <button
          type="button"
          aria-label={me ? t.locateStop : t.locate}
          aria-pressed={me != null}
          className={cn(
            "rounded-sm border border-forest-500/20 p-2.5 shadow-sm transition-colors focus-visible:outline focus-visible:outline-2 focus-visible:outline-brass-500",
            me ? pillOn : pillOff,
          )}
          onClick={toggleLocate}
        >
          <LocateFixed size={16} className={geoBusy ? "animate-pulse" : undefined} aria-hidden />
        </button>
      </div>

      {/* Zoning legend + source note (collapsible, shared with /listings). */}
      {zoning || parcels ? <MapLegend zoning={zoning} t={t} /> : null}

      {/* Transient hints: geolocation error / zoom-in prompt. */}
      {geoError || (parcels && zoom < PARCEL_MIN_ZOOM) ? (
        <div className="absolute bottom-2 left-1/2 z-[1000] -translate-x-1/2 rounded-sm bg-forest-900/85 px-3 py-1.5 text-[11px] text-cream-100 shadow-sm">
          {geoError ?? t.parcelZoomHint}
        </div>
      ) : null}
    </div>
  );
}
