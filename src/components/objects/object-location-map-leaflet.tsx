"use client";

import { useEffect, useRef, useState } from "react";
import { MapContainer, TileLayer, Marker, Popup, Circle, Polygon, Polyline, Pane, AttributionControl, useMapEvents } from "react-leaflet";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import { LocateFixed, Maximize2, Minimize2, Ruler } from "lucide-react";
import {
  TILE_URL,
  TILE_ATTRIBUTION,
  TILE_SUBDOMAINS,
  SATELLITE_TILE_URL,
  SATELLITE_ATTRIBUTION,
  SATELLITE_MAX_NATIVE_ZOOM,
  TERRAIN_RELIEF_TILE_URL,
  TERRAIN_RELIEF_ATTRIBUTION,
  TERRAIN_RELIEF_MAX_NATIVE_ZOOM,
  TERRAIN_TILE_URL,
  TERRAIN_ATTRIBUTION,
  TERRAIN_MAX_NATIVE_ZOOM,
  TERRAIN_HILLSHADE_OPACITY,
  PARCEL_TILE_URL,
  PARCEL_MIN_ZOOM,
  PARCEL_MAX_NATIVE_ZOOM,
  CITYPLAN_TILE_URL,
  CITYPLAN_MIN_NATIVE_ZOOM,
  CITYPLAN_MAX_NATIVE_ZOOM,
  LONGDO_ATTRIBUTION,
} from "@/lib/leaflet/tiles";
import { sunsetBearing, offsetPoint, haversineMeters, formatDistance } from "@/lib/utils/geo";
import {
  type BaseLayer,
  type LayerPrefs,
  loadLayerPrefs,
  saveLayerPrefs,
} from "@/lib/leaflet/layer-prefs";
import { useLocale } from "@/lib/i18n/use-locale";
import { getObjectDict } from "@/lib/i18n/dictionaries";
import { useCurrency } from "@/components/ui/currency";
import { cn } from "@/lib/utils/cn";
import { useFullscreen } from "@/lib/leaflet/use-fullscreen";
import type { NearbyListing } from "@/types/object";
import { MapLegend } from "./map-legend";
import { PoiMarkers } from "./poi-markers";

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

// Small forest dot for "other listings nearby" — distinct from the main brass
// pin; off-screen at the default close view, surfaces as the visitor zooms out.
const nearbyIcon = L.divIcon({
  className: "",
  html: `<span style="display:block;width:12px;height:12px;border-radius:50%;background:#1F3A2E;border:2px solid #FEFCF9;box-shadow:0 1px 4px rgba(0,0,0,.35)"></span>`,
  iconSize: [12, 12],
  iconAnchor: [6, 6],
  popupAnchor: [0, -6],
});

// Tiny vertex dot for the measuring polyline.
const measureDotIcon = L.divIcon({
  className: "",
  html: `<span style="display:block;width:8px;height:8px;border-radius:50%;background:#B5651D;border:1.5px solid #FEFCF9"></span>`,
  iconSize: [8, 8],
  iconAnchor: [4, 4],
});

function ZoomWatcher({ onZoom }: { onZoom: (z: number) => void }) {
  useMapEvents({ zoomend: (e) => onZoom((e.target as L.Map).getZoom()) });
  return null;
}

// Collects map clicks into measure points while the ruler is active.
function MeasureClicks({ active, onAdd }: { active: boolean; onAdd: (p: [number, number]) => void }) {
  useMapEvents({
    click: (e) => {
      if (active) onAdd([e.latlng.lat, e.latlng.lng]);
    },
  });
  return null;
}

interface Props {
  lat: number;
  lng: number;
  plotPolygon?: Array<[number, number]>;
  // Sea-view / beachfront plots get a sunset-direction arrow from the pin.
  showSunset?: boolean;
  // Other published listings near this plot — shown as small map pins.
  nearby?: NearbyListing[];
}

export default function ObjectLocationMapLeaflet({ lat, lng, plotPolygon, showSunset, nearby }: Props) {
  const locale = useLocale();
  const t = getObjectDict(locale).map;
  const { fmt } = useCurrency();
  const mapRef = useRef<L.Map | null>(null);
  const wrapperRef = useRef<HTMLDivElement | null>(null);
  const watchId = useRef<number | null>(null);
  const { isFull, supported: fsSupported, toggle: toggleFull } = useFullscreen(wrapperRef, mapRef);

  const hasPolygon = (plotPolygon?.length ?? 0) >= 3;
  // Restore the visitor's last layer choice; otherwise a contour reads best
  // over imagery, so default to satellite when one is present, else plain map.
  // Never *open* in terrain here: relief is native only to z13, so at the
  // parcel zoom this map uses it's blurry — it stays a manual toggle only.
  const prefs = useRef<Partial<LayerPrefs>>(loadLayerPrefs()).current;
  const initialBase: BaseLayer =
    prefs.base && prefs.base !== "terrain" ? prefs.base : hasPolygon ? "sat" : "map";
  const [base, setBase] = useState<BaseLayer>(initialBase);
  const [parcels, setParcels] = useState(prefs.parcels ?? false);
  const [zoning, setZoning] = useState(prefs.zoning ?? false);
  const [poi, setPoi] = useState(prefs.poi ?? false);
  const [zoom, setZoom] = useState(15);
  const [me, setMe] = useState<{ lat: number; lng: number; acc: number } | null>(null);
  const [geoBusy, setGeoBusy] = useState(false);
  const [geoError, setGeoError] = useState<string | null>(null);
  const [measuring, setMeasuring] = useState(false);
  const [measurePts, setMeasurePts] = useState<Array<[number, number]>>([]);

  // Running length of the measuring polyline (straight segments, haversine).
  const measureTotal = measurePts.reduce(
    (sum, p, i) => (i === 0 ? 0 : sum + haversineMeters(measurePts[i - 1][0], measurePts[i - 1][1], p[0], p[1])),
    0,
  );
  function toggleMeasure() {
    setMeasuring((m) => !m);
    setMeasurePts([]);
  }

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
    saveLayerPrefs({ base, parcels, zoning, poi });
  }, [base, parcels, zoning, poi]);

  // Sunset-direction arrow from the pin (sea-view / beachfront plots).
  const sunset = showSunset ? sunsetBearing(lat) : null;
  const sunsetTip = sunset != null ? offsetPoint(lat, lng, sunset, 300) : null;

  const pill =
    "px-2.5 py-2 text-xs font-medium transition-colors focus-visible:outline focus-visible:outline-2 focus-visible:outline-brass-500";
  // Active fills the brand accent (forest in light, gold in dark so it reads as
  // "selected" against the light map tiles, which never invert with the theme).
  const pillOn = "bg-panel text-panel-fg dark:bg-brass-500 dark:text-cream-100";
  // Inactive is a raised surface — in dark it must sit above the page background
  // (cream-50 #2E2E26), not collapse onto it (cream-100 = page bg), or every
  // control reads as dark/"pressed" over the map.
  const pillOff =
    "bg-cream-100/95 text-forest-900 hover:bg-cream-100 dark:bg-cream-50/95 dark:hover:bg-cream-300";

  return (
    <div
      ref={wrapperRef}
      className="relative h-full w-full overflow-hidden rounded-sm border border-forest-500/10 bg-cream-300"
    >
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
        className={cn("h-full w-full", measuring && "!cursor-crosshair")}
        style={{ background: "#e8e4da" }}
        // Tile credits are ToS-required, but kept tiny (CSS) + no "Leaflet" prefix.
        attributionControl={false}
      >
        <AttributionControl prefix={false} />
        <ZoomWatcher onZoom={setZoom} />
        <MeasureClicks active={measuring} onAdd={(p) => setMeasurePts((pts) => [...pts, p])} />
        {base === "sat" ? (
          <TileLayer
            key="base-sat"
            attribution={SATELLITE_ATTRIBUTION}
            url={SATELLITE_TILE_URL}
            maxNativeZoom={SATELLITE_MAX_NATIVE_ZOOM}
            maxZoom={MAX_ZOOM}
          />
        ) : base === "terrain" ? (
          // Shaded-relief base + hillshade (multiply) — see tiles.ts. Custom
          // panes keep the shade below the zoning/parcel overlays (tilePane,
          // z 200) so it only multiplies against the relief, not the overlays.
          <>
            <Pane name="terrainBase" style={{ zIndex: 190 }}>
              <TileLayer
                key="base-relief"
                attribution={TERRAIN_RELIEF_ATTRIBUTION}
                url={TERRAIN_RELIEF_TILE_URL}
                maxNativeZoom={TERRAIN_RELIEF_MAX_NATIVE_ZOOM}
                maxZoom={MAX_ZOOM}
              />
            </Pane>
            <Pane name="terrainShade" style={{ zIndex: 195, mixBlendMode: "multiply" }}>
              <TileLayer
                key="base-hillshade"
                attribution={TERRAIN_ATTRIBUTION}
                url={TERRAIN_TILE_URL}
                maxNativeZoom={TERRAIN_MAX_NATIVE_ZOOM}
                maxZoom={MAX_ZOOM}
                opacity={TERRAIN_HILLSHADE_OPACITY}
              />
            </Pane>
          </>
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
        {poi ? <PoiMarkers locale={locale} t={t} origin={{ lat, lng }} /> : null}
        {(nearby ?? []).map((n) => (
          <Marker key={n.rw} position={[n.lat, n.lng]} icon={nearbyIcon}>
            <Popup>
              <a href={`/object/${n.rw}`} className="block w-40 no-underline">
                <span className="block text-[11px] uppercase tracking-wide text-forest-500/70">
                  {n.rw} · {n.type}
                </span>
                <span className="block font-serif text-sm leading-snug text-forest-900">{n.title}</span>
                {n.priceThb ? (
                  <span className="num mt-1 block text-sm text-forest-900">{fmt(n.priceThb)}</span>
                ) : null}
              </a>
            </Popup>
          </Marker>
        ))}
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
        {measuring && measurePts.length > 0 ? (
          <>
            <Polyline
              positions={measurePts}
              pathOptions={{ color: "#B5651D", weight: 2.5, opacity: 0.9, dashArray: "6 4" }}
            />
            {measurePts.map((p, i) => (
              <Marker key={i} position={p} icon={measureDotIcon} interactive={false} />
            ))}
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
          aria-pressed={poi}
          className={cn(pill, "rounded-sm border border-forest-500/20 shadow-sm", poi ? pillOn : pillOff)}
          onClick={() => setPoi(!poi)}
        >
          {t.poiLayer}
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
        {fsSupported ? (
          <button
            type="button"
            aria-label={isFull ? t.fullscreenExit : t.fullscreen}
            aria-pressed={isFull}
            className={cn(
              "rounded-sm border border-forest-500/20 p-2.5 shadow-sm transition-colors focus-visible:outline focus-visible:outline-2 focus-visible:outline-brass-500",
              isFull ? pillOn : pillOff,
            )}
            onClick={toggleFull}
          >
            {isFull ? <Minimize2 size={16} aria-hidden /> : <Maximize2 size={16} aria-hidden />}
          </button>
        ) : null}
        <button
          type="button"
          aria-label={t.measure}
          aria-pressed={measuring}
          className={cn(
            "rounded-sm border border-forest-500/20 p-2.5 shadow-sm transition-colors focus-visible:outline focus-visible:outline-2 focus-visible:outline-brass-500",
            measuring ? pillOn : pillOff,
          )}
          onClick={toggleMeasure}
        >
          <Ruler size={16} aria-hidden />
        </button>
      </div>

      {/* Zoning + nearby legend / source note (collapsible, shared with /listings). */}
      {zoning || parcels || poi ? (
        <MapLegend zoning={zoning} poi={poi} showSource={zoning || parcels} t={t} />
      ) : null}

      {/* Measuring: hint until 2 points, then the running total. */}
      {measuring ? (
        <div className="absolute bottom-2 left-1/2 z-[1000] -translate-x-1/2 rounded-sm bg-brass-500/90 px-3 py-1.5 text-[11px] font-medium text-panel-fg shadow-sm">
          {measurePts.length < 2 ? t.measureHint : `${t.measure} ≈ ${formatDistance(measureTotal, locale)}`}
        </div>
      ) : geoError || (parcels && zoom < PARCEL_MIN_ZOOM) ? (
        <div className="absolute bottom-2 left-1/2 z-[1000] -translate-x-1/2 rounded-sm bg-panel/85 px-3 py-1.5 text-[11px] text-panel-fg shadow-sm">
          {geoError ?? t.parcelZoomHint}
        </div>
      ) : null}
    </div>
  );
}
