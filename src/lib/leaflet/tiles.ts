/**
 * Shared basemap tiles for every Leaflet map on the site.
 *
 * Esri "World Topo Map" — light, labelled, quiet: roads and buildings read
 * clearly while the background stays pale, so the red cadastral outlines and
 * amber pins we draw on top are the loudest thing on the map. No API key.
 *
 * Replaced CARTO Voyager on 2026-08-27. CARTO closed its keyless basemaps and
 * started serving, with HTTP 200, a placeholder tile stamped "API KEY
 * REQUIRED" — so every map on the site silently turned into that text. Esri
 * was the natural landing spot: the satellite, relief and hillshade layers
 * below already come from the same host, so it adds no new dependency.
 *
 * Two things differ from CARTO and are easy to get wrong:
 *  - axis order is {z}/{y}/{x}, not {z}/{x}/{y};
 *  - no retina variant — an `@2x` suffix returns the same 256px tile
 *    (verified), so `{r}` is deliberately absent, and there are no subdomains
 *    to rotate through.
 *
 * Native tiles reach z19 over Koh Phangan — enough for the parcel overlay.
 */
export const TILE_URL =
  "https://server.arcgisonline.com/ArcGIS/rest/services/World_Topo_Map/MapServer/tile/{z}/{y}/{x}";

export const TILE_ATTRIBUTION =
  '&copy; <a href="https://www.esri.com/">Esri</a>, HERE, Garmin, FAO, NOAA, USGS &copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors';

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
 * Terrain layer — a two-tile composite of Esri relief, built in the map
 * components. Goal (per user feedback): relief is the star — strong and clean,
 * land vs. water obvious, and nothing else on it (no roads, no labels). An
 * earlier OpenTopoMap base was dropped: its roads/contours/Thai labels buried
 * the relief and read as clutter.
 *
 *  1. BASE — Esri World Shaded Relief (below): coloured shaded relief on land +
 *     a flat blue ocean, so the coastline / land↔water boundary reads at a
 *     glance. No labels, no roads.
 *  2. SHADE — Esri World Hillshade (above, `mix-blend-mode: multiply`): darkens
 *     the slopes so ridges and valleys pop. Multiply barely touches the flat
 *     ocean, so the sea stays blue.
 *
 * Both are SRTM-derived and native only to z13 over Koh Phangan (z14+ return a
 * grey "Map data not yet available" placeholder — verified 2026-06-16), so
 * maxNativeZoom is 13: Leaflet upscales the z13 relief for closer zooms (soft,
 * but relief reads fine). Sharp close-ups are the satellite layer's job.
 */
export const TERRAIN_RELIEF_TILE_URL =
  "https://server.arcgisonline.com/ArcGIS/rest/services/World_Shaded_Relief/MapServer/tile/{z}/{y}/{x}";
export const TERRAIN_RELIEF_ATTRIBUTION =
  'Relief &copy; <a href="https://www.esri.com/">Esri</a>';
export const TERRAIN_RELIEF_MAX_NATIVE_ZOOM = 13;

export const TERRAIN_TILE_URL =
  "https://server.arcgisonline.com/ArcGIS/rest/services/Elevation/World_Hillshade/MapServer/tile/{z}/{y}/{x}";
export const TERRAIN_ATTRIBUTION =
  "Hillshade &copy; <a href=\"https://www.esri.com/\">Esri</a>, USGS, NGA";
export const TERRAIN_MAX_NATIVE_ZOOM = 13;
// Strength of the multiply hillshade over the shaded-relief base. ~0.6 makes
// slopes pop without darkening the blue ocean.
export const TERRAIN_HILLSHADE_OPACITY = 0.6;

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
