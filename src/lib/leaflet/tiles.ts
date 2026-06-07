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
