/**
 * Shared basemap tiles for every Leaflet map on the site.
 *
 * CARTO "Voyager" — a clean, labelled, Google-Maps-like raster style. Free for
 * reasonable use, no API key, retina-aware ({r}). Centralised here so the look
 * can be swapped in one place (e.g. to a satellite layer, or to Google's Map
 * Tiles API once a billed key is provisioned).
 *
 * Note: Google's own tile servers require the paid Map Tiles API + key and may
 * not be hit directly per their Terms — hence CARTO as the no-key default.
 */
export const TILE_URL =
  "https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png";

export const TILE_ATTRIBUTION =
  '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors &copy; <a href="https://carto.com/attributions">CARTO</a>';

export const TILE_SUBDOMAINS = "abcd";

/**
 * Satellite basemap — Esri World Imagery. Free with attribution; native tiles
 * down to z19 over Koh Phangan (verified 2026-06). Note the {z}/{y}/{x} order.
 */
export const SATELLITE_TILE_URL =
  "https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}";
export const SATELLITE_ATTRIBUTION =
  "Imagery &copy; <a href=\"https://www.esri.com/\">Esri</a>, Maxar, Earthstar Geographics";
export const SATELLITE_MAX_NATIVE_ZOOM = 19;

/**
 * DOL cadastral parcel outlines (โฉนด boundaries) served by Longdo Map — the
 * same layer map.longdo.com renders. Undocumented but openly served endpoint
 * (no key/referer required; verified from a datacenter IP 2026-06). landsmaps
 * .dol.go.th itself sits behind Incapsula and cannot be used directly, so this
 * is the only practical web source until the official DOL API (requires a Thai
 * juristic person) is provisioned. Tiles exist z17–19; 512px covering the
 * standard z/x/y extent (@2x), so plain 256 grid works — Leaflet downscales.
 * If the endpoint ever closes, the overlay degrades to blank tiles — no crash.
 */
export const PARCEL_TILE_URL =
  "https://ms.longdo.com/mmmap/img.php?mode=dol_hd&proj=epsg3857&zoom={z}&x={x}&y={y}";
export const PARCEL_MIN_ZOOM = 17;
export const PARCEL_MAX_NATIVE_ZOOM = 19;

/**
 * DPT city-plan zoning colours (ผังเมือง) via the same Longdo tile service.
 * Native z14–16 (z17+ redirects). Palette over Phangan: dark green = rural &
 * agricultural, bright-green/white hatch = conservation rural, pale green =
 * recreation/open space, yellow = low-density residential, gray = other.
 */
export const CITYPLAN_TILE_URL =
  "https://ms.longdo.com/mmmap/img.php?mode=cityplan_thailand&proj=epsg3857&zoom={z}&x={x}&y={y}";
export const CITYPLAN_MIN_NATIVE_ZOOM = 14;
export const CITYPLAN_MAX_NATIVE_ZOOM = 16;

export const LONGDO_ATTRIBUTION =
  '&copy; <a href="https://map.longdo.com/">Longdo Map</a> · DOL · DPT';
