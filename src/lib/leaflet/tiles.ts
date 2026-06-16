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
 * Terrain layer — a two-tile composite (built in the map components):
 *
 *  1. BASE — OpenTopoMap (below): a coloured topographic map. Gives three
 *     things the bare hillshade never did: contour lines (slope reads down to
 *     parcel zoom), a crisp coastline with blue sea (land↔water boundary the
 *     land buyer asked for), and native tiles to z17 (sharp close-up). Served
 *     through our /tiles proxy for CDN caching + OTM's tile-usage policy.
 *  2. SHADE — Esri World Hillshade (above, `mix-blend-mode: multiply`): darkens
 *     the slopes so relief pops over OTM's pale shading ("more visible relief").
 *
 * Esri hillshade native data over Koh Phangan stops at z13 — the free global
 * hillshade is SRTM-derived (~30 m) and Esri has no higher-res DEM here, so
 * z14+ return a grey "Map data not yet available" placeholder (verified
 * 2026-06-16). maxNativeZoom must therefore be 13: Leaflet upscales the real
 * z13 relief for closer zooms (soft, but the OTM contours carry the detail).
 */
export const TERRAIN_TOPO_TILE_URL = "/tiles/topo/{z}/{x}/{y}";
export const TERRAIN_TOPO_ATTRIBUTION =
  'Topo &copy; <a href="https://opentopomap.org/">OpenTopoMap</a> (<a href="https://creativecommons.org/licenses/by-sa/3.0/">CC-BY-SA</a>)';
export const TERRAIN_TOPO_MAX_NATIVE_ZOOM = 17;

export const TERRAIN_TILE_URL =
  "https://server.arcgisonline.com/ArcGIS/rest/services/Elevation/World_Hillshade/MapServer/tile/{z}/{y}/{x}";
export const TERRAIN_ATTRIBUTION =
  "Hillshade &copy; <a href=\"https://www.esri.com/\">Esri</a>, USGS, NGA";
export const TERRAIN_MAX_NATIVE_ZOOM = 13;
// Strength of the multiply hillshade over the topo base. ~0.65 makes slopes
// read clearly without muddying OTM's blue water and contour lines.
export const TERRAIN_HILLSHADE_OPACITY = 0.65;

/**
 * DOL cadastral parcel outlines (โฉนด boundaries) — Longdo's dol_hd layer (the
 * one map.longdo.com renders), served through our caching proxy /tiles (see
 * app/tiles/.../route.ts): Vercel CDN keeps tiles warm through upstream
 * hiccups and gives a single switch-off point if the undocumented endpoint
 * ever closes (landsmaps.dol.go.th is behind Incapsula; official DOL API
 * needs a Thai juristic person). Tiles exist z17–19; 512px covering the
 * standard z/x/y extent (@2x), so plain 256 grid works — Leaflet downscales.
 * On failure the overlay degrades to blank tiles — no crash.
 */
export const PARCEL_TILE_URL = "/tiles/parcels/{z}/{x}/{y}";
export const PARCEL_MIN_ZOOM = 17;
export const PARCEL_MAX_NATIVE_ZOOM = 19;

/**
 * DPT city-plan zoning colours (ผังเมือง) — Longdo cityplan_thailand layer via
 * the same /tiles proxy. Native z14–16 (z17+ redirects). Palette over Phangan:
 * dark green = rural & agricultural, bright-green/white hatch = conservation
 * rural, pale green = recreation/open space, yellow = low-density residential,
 * gray = other.
 */
export const CITYPLAN_TILE_URL = "/tiles/zoning/{z}/{x}/{y}";
export const CITYPLAN_MIN_NATIVE_ZOOM = 14;
export const CITYPLAN_MAX_NATIVE_ZOOM = 16;

export const LONGDO_ATTRIBUTION =
  '&copy; <a href="https://map.longdo.com/">Longdo Map</a> · DOL · DPT';
