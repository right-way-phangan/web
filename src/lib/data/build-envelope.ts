import type { RealEstateObject, ObjectType } from "@/types/object";
import type { RuleLocale } from "./building-norms";
import { seaDistanceMeters } from "@/lib/geo/sea-distance";

/**
 * Compact "build envelope" teaser for a grid card — the regulatory MAXIMUM a
 * private dwelling may occupy on the plot, framed as an upper bound
 * ("up to 70% · 12 m"). The plot-specific tightened figures (50% / 25% coverage
 * on hillsides, single-home limits, no-build gates) live on the object detail
 * page's "What you can build here" block, which the card links to.
 *
 * Cheap BY DESIGN: distance to sea is a pure geometric calc over the in-memory
 * OSM coastline — no Open-Meteo / DEM round-trip — so this runs server-side per
 * card with zero network cost. Coverage ceiling (70%) and the island height cap
 * (12 m) come from the Building Control Act baseline; the May-2025 environmental
 * layers only ever REDUCE them, so the "up to" framing stays truthful even
 * without knowing elevation/slope. Always indicative → confirmed in DD.
 *
 * Only for buildable land / villa / house — the inventory where "what can I
 * build" is the question. Returns null for other types or when ungeolocated.
 */
export interface BuildBadge {
  /** Localized compact text, e.g. "up to 70% · 12 m" / "до 70% · 12 м". */
  text: string;
  /** True when the pin sits in the protected coastal strip (<10 m to sea). */
  restricted: boolean;
}

const BUILDABLE: ReadonlySet<ObjectType> = new Set(["Land", "Villa", "House"]);

export function buildEnvelopeBadge(o: RealEstateObject, locale: RuleLocale): BuildBadge | null {
  if (o.lat == null || o.lng == null) return null;
  if (!BUILDABLE.has(o.type)) return null;

  const sea = seaDistanceMeters(o.lat, o.lng);
  if (sea < 10) {
    return {
      text: locale === "ru" ? "берег · стройка ограничена" : "coastal · build restricted",
      restricted: true,
    };
  }
  // Island/BCA height cap is 12 m; the sea-setback tier drops it to 6 m within 50 m.
  const heightM = sea < 50 ? 6 : 12;
  const text = locale === "ru" ? `до 70% · ${heightM} м` : `up to 70% · ${heightM} m`;
  return { text, restricted: false };
}
