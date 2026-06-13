/**
 * Shared layer-choice memory for every Leaflet map on the site (object detail +
 * /listings). One localStorage key so a visitor's base/overlay choice carries
 * across pages. Client-only; callers already run in client components.
 */

export type BaseLayer = "map" | "sat" | "terrain";
export type LayerPrefs = { base: BaseLayer; parcels: boolean; zoning: boolean };

const LS_KEY = "rw-map-layers";

export function loadLayerPrefs(): Partial<LayerPrefs> {
  if (typeof window === "undefined") return {};
  try {
    return JSON.parse(localStorage.getItem(LS_KEY) || "{}") as Partial<LayerPrefs>;
  } catch {
    return {};
  }
}

export function saveLayerPrefs(prefs: LayerPrefs): void {
  try {
    localStorage.setItem(LS_KEY, JSON.stringify(prefs));
  } catch {
    /* private mode / quota — non-essential */
  }
}
