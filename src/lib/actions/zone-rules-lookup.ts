"use server";

/**
 * Standalone "paste a location → get its building rules" lookup. Wires the
 * existing city-plan zone classifier (zone-lookup.ts) into the shared rules
 * engine (zone-rules.ts) so the admin tool and the public /tools/zoning page
 * can answer for ANY point, not just a saved object.
 *
 * Input may be: bare "lat, lng", a full Google Maps URL (@lat,lng / ?q=…), or
 * a SHORT maps.app.goo.gl / goo.gl/maps link — short links hide coordinates
 * behind redirects, so we follow them server-side (same trick the catalog
 * write path uses in backend resolveLatLngFromUrl).
 *
 * Always indicative — the answer points to DD, never asserts hard figures.
 */

import { lookupZoneByLocation } from "./zone-lookup";
import { parseLatLngText } from "@/lib/utils/geo";
import {
  zoneRulesFromSignals,
  type ZoneSignals,
  type ZoneBuildInfo,
  type RuleLocale,
} from "@/lib/data/zone-rules";
import { combineBuildingNorms, type BuildingNorms } from "@/lib/data/building-norms";
import { seaDistanceMeters } from "@/lib/geo/sea-distance";
import { fetchTerrain } from "@/lib/geo/terrain";
import { notifyZoneLookupError } from "@/lib/notify/telegram";

// De-spam admin alerts: at most one Telegram ping per window across all genuine
// failures (clicks are user-paced, so this only guards against a burst while
// the city-plan service is flapping). Module state is best-effort in
// serverless — a cold start resets it, which is fine for a heads-up.
const ALERT_THROTTLE_MS = 10 * 60_000;
let lastAlertAt = 0;

async function alertOnce(opts: Parameters<typeof notifyZoneLookupError>[0]): Promise<void> {
  const now = Date.now();
  if (now - lastAlertAt < ALERT_THROTTLE_MS) return;
  lastAlertAt = now;
  await notifyZoneLookupError(opts);
}

// Koh Phangan bounding box — reject points outside it early so a mis-pasted
// link doesn't classify some random pixel on the planet as a Phangan zone.
const PHANGAN_BBOX = { latMin: 9.6, latMax: 9.85, lngMin: 99.95, lngMax: 100.13 };

function inPhangan(lat: number, lng: number): boolean {
  return (
    lat >= PHANGAN_BBOX.latMin &&
    lat <= PHANGAN_BBOX.latMax &&
    lng >= PHANGAN_BBOX.lngMin &&
    lng <= PHANGAN_BBOX.lngMax
  );
}

/** Follow up to 5 redirect hops of a short maps link, reading lat/lng from each. */
async function expandShortLink(url: string): Promise<{ lat: number; lng: number } | null> {
  if (!/^https?:\/\//i.test(url)) return null;
  try {
    let target = url;
    for (let i = 0; i < 5; i++) {
      const res = await fetch(target, {
        redirect: "manual",
        headers: { "user-agent": "Mozilla/5.0 (compatible; RightWayBot/1.0)" },
      });
      const loc = res.headers.get("location");
      if (!loc) return parseLatLngText(res.url);
      const found = parseLatLngText(loc);
      if (found) return found;
      target = new URL(loc, target).href;
    }
  } catch {
    return null;
  }
  return null;
}

/** Optional manual overrides for the geographic inputs (survey beats DEM). */
export interface NormOverrides {
  elevationM?: number;
  slopeDeg?: number;
  seaDistanceM?: number;
  /** Plot area in m² — turns the coverage % into an actual buildable footprint. */
  plotSqm?: number;
}

export interface ZoneRulesLookupResult {
  ok: boolean;
  lat?: number;
  lng?: number;
  /** Suggested zone enum value (Green/Yellow/…/Unknown). */
  zone?: string;
  /** Human zone label (RU), e.g. «Жилая малой плотности (жёлтая)». */
  zoneLabel?: string;
  /** Dominant sampled colour for the UI chip. */
  colorHex?: string;
  /** Localized indicative building rules, or null if nothing useful to say. */
  rules?: ZoneBuildInfo | null;
  /** Estimated distance to the nearest coastline, metres. */
  seaDistanceM?: number;
  /** Elevation above sea level, metres (DEM or user override). */
  elevationM?: number;
  /** Ground slope, degrees (DEM or user override). */
  slopeDeg?: number;
  /** True when elevation/slope were estimated from DEM (vs. user-entered). */
  terrainEstimated?: boolean;
  /** Precise quantitative norms (height/area/%/min plot), or null. */
  norms?: BuildingNorms | null;
  /** True when !ok is a benign informational answer (no city-plan coverage), not a failure. */
  soft?: boolean;
  error?: string;
}

/**
 * Resolve a pasted location to its indicative building rules.
 * `signals` are optional plot facts the user ticks (beachfront / sea view /
 * mountain view / dirt access) to sharpen the "check before you build" flags.
 */
export async function lookupZoneRules(
  input: string,
  locale: RuleLocale,
  signals: ZoneSignals = {},
  overrides: NormOverrides = {},
): Promise<ZoneRulesLookupResult> {
  const raw = (input ?? "").trim();
  if (!raw) return { ok: false, error: locale === "ru" ? "Вставьте локацию" : "Paste a location" };

  // 1) Direct coords / full URL, then short-link redirect chase.
  let coords = parseLatLngText(raw);
  if (!coords) coords = await expandShortLink(raw);
  if (!coords) {
    return {
      ok: false,
      error:
        locale === "ru"
          ? "Не удалось распознать координаты. Вставьте «широта, долгота» или ссылку Google Maps."
          : "Couldn't read coordinates. Paste “lat, lng” or a Google Maps link.",
    };
  }

  if (!inPhangan(coords.lat, coords.lng)) {
    return {
      ok: false,
      lat: coords.lat,
      lng: coords.lng,
      error:
        locale === "ru"
          ? "Точка вне Ко Пангана — карта зон покрывает только остров."
          : "Point is outside Koh Phangan — the zoning map only covers the island.",
    };
  }

  // 2) Classify the city-plan colour at that point. Network (city-plan tile +
  //    terrain DEM) lives below, so this is the stretch that can fail for a
  //    real reason — guard it and ping the admin chat (throttled) when it does.
  //    The benign returns above (bad input / outside Phangan) stay silent.
  try {
    const zone = await lookupZoneByLocation(coords.lat, coords.lng);
    if (!zone.ok) {
      // No city-plan colour at this point is a normal answer (most rural Phangan
      // land isn't zoned) — return it as a soft, informational result, in the
      // caller's language, and stay silent. The DD step confirms the zone.
      if (zone.noCoverage) {
        return {
          ok: false,
          soft: true,
          lat: coords.lat,
          lng: coords.lng,
          error:
            locale === "ru"
              ? "Городской план (ผังเมือง) эту точку не покрывает — зона уточняется в due diligence."
              : "The city plan (ผังเมือง) doesn’t cover this point — the zone is confirmed in due diligence.",
        };
      }
      // Anything else from the classifier = a genuine service outage (Longdo
      // unreachable / non-PNG) → alert the admin chat (throttled).
      void alertOnce({
        kind: "service",
        input: raw,
        error: zone.error ?? "",
        lat: coords.lat,
        lng: coords.lng,
      });
      return {
        ok: false,
        lat: coords.lat,
        lng: coords.lng,
        error:
          locale === "ru"
            ? "Сервис зон сейчас недоступен — попробуйте ещё раз чуть позже."
            : "The zoning service is unavailable right now — please try again shortly.",
      };
    }

    // 3) Turn the zone + ticked signals into indicative (qualitative) rules.
    const rules = zoneRulesFromSignals(zone.zone ?? "", signals, locale);

    // 4) Geographic drivers of the precise numeric norms.
    //    Sea distance is always computed (coastline geometry). Elevation/slope
    //    come from the DEM unless the user supplied a survey override.
    const seaDistanceM = overrides.seaDistanceM ?? seaDistanceMeters(coords.lat, coords.lng);

    let elevationM = overrides.elevationM;
    let slopeDeg = overrides.slopeDeg;
    let terrainEstimated = false;
    if (elevationM == null || slopeDeg == null) {
      const terrain = await fetchTerrain(coords.lat, coords.lng);
      if (terrain) {
        if (elevationM == null) {
          elevationM = terrain.elevationM;
          terrainEstimated = true;
        }
        if (slopeDeg == null) {
          slopeDeg = terrain.slopeDeg;
          terrainEstimated = true;
        }
      }
    }

    // 5) Combine the layers into the strictest quantitative rule set.
    const norms = combineBuildingNorms(
      { seaDistanceM, elevationM, slopeDeg, planZone: zone.planZone, plotSqm: overrides.plotSqm },
      locale,
    );

    return {
      ok: true,
      lat: coords.lat,
      lng: coords.lng,
      zone: zone.zone,
      zoneLabel: zone.label,
      colorHex: zone.colorHex,
      rules,
      seaDistanceM,
      elevationM,
      slopeDeg,
      terrainEstimated,
      norms,
    };
  } catch (err) {
    // Unexpected throw — previously a stuck spinner with no feedback. Turn it
    // into a clear message AND a heads-up so a recurring break gets noticed.
    void alertOnce({
      kind: "exception",
      input: raw,
      error: err instanceof Error ? err.message : String(err),
      lat: coords.lat,
      lng: coords.lng,
    });
    return {
      ok: false,
      lat: coords.lat,
      lng: coords.lng,
      error:
        locale === "ru"
          ? "Не удалось определить зону — попробуйте ещё раз."
          : "Couldn't determine the zone — please try again.",
    };
  }
}
