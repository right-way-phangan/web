/**
 * Quantitative Koh Phangan building norms — the "precise rules" layer on top of
 * the city-plan colour (zone-rules.ts gives qualitative use; this gives numbers:
 * max height, footprint/area, open-space %, min plot, buildable y/n).
 *
 * SOURCE OF TRUTH — Ministry of Natural Resources & Environment environmental
 * protection regulation for Surat Thani (incl. Ko Samui / Ko Phangan / Ko Tao),
 * in force 21 May 2025. The numbers are driven by three geographic facts we can
 * estimate from coordinates: distance to sea, elevation (m a.s.l.) and slope.
 *
 * Deliberately INDICATIVE. Caveats baked in and surfaced in the UI:
 *  - Sea distance / elevation / slope are estimated from open data (OSM
 *    coastline ~30m, SRTM elevation ~30m); not a substitute for a survey.
 *  - Slope thresholds are in DEGREES (sources sometimes loosely say "%").
 *  - City-plan FAR/OSR per Phangan zone is not publicly published (DPT
 *    ministerial reg behind WAF) → density caps confirmed in DD, not asserted.
 *  - Enforcement varies; every figure is verified in Transaction DD.
 */

export type RuleLocale = "en" | "ru";

/** Which geographic layer a constraint came from — for provenance in the UI. */
export type NormLayer = "sea" | "elevation" | "slope" | "general";

export interface NormLine {
  /** Localized label, e.g. "Max height" / "Макс. высота". */
  label: string;
  /** Localized value, e.g. "12 m" / "≤ 6 м · 1 этаж". */
  value: string;
  /** Which layer bound this value (most-restrictive wins). */
  layer: NormLayer;
}

export interface BuildingNorms {
  /** False when any layer forbids building (≤10m from sea, slope >50°). */
  buildable: boolean;
  /** Localized reason when not buildable. */
  noBuildReason?: string;
  /** The binding numeric/qualitative rules, deduped to the strictest each. */
  lines: NormLine[];
  /** Extra conditions ("hotels: 50% green", "10+ units: wastewater") to flag. */
  notes: string[];
  /** Localized source line shown under the block. */
  source: string;
}

export interface NormInputs {
  /** Distance to the nearest coastline, metres (estimated). */
  seaDistanceM?: number;
  /** Elevation above sea level, metres (estimated or user-entered). */
  elevationM?: number;
  /** Ground slope in DEGREES (estimated or user-entered). */
  slopeDeg?: number;
}

const T = {
  en: {
    maxHeight: "Max height",
    maxArea: "Max building area",
    maxFootprint: "Max footprint",
    minOpen: "Min open space",
    minGreen: "Min green space",
    minPlot: "Min plot size",
    use: "Allowed use",
    singleHome: "single-family home only",
    style: "Thai / tropical style, natural-colour roof",
    noBuildSea: "No construction within 10 m of the shoreline.",
    noBuildSlope: "No construction on slopes steeper than 50°.",
    m: (n: number) => `${n} m`,
    floors1: " · 1 storey",
    sqm: (n: number) => `${n.toLocaleString("en-US")} m²`,
    pct: (n: number) => `${n}%`,
    hotelGreen: "Hotels must leave ≥ 50% of the plot as green space.",
    units10: "Developments of 10+ units need wastewater treatment.",
    noTerrain: "No terrain/slope alteration, retaining walls or land subdivision.",
    source:
      "Source: MNRE environmental protection regulation for Surat Thani (Ko Samui / Ko Phangan / Ko Tao), in force 21 May 2025 — indicative, confirmed in due diligence.",
  },
  ru: {
    maxHeight: "Макс. высота",
    maxArea: "Макс. площадь здания",
    maxFootprint: "Макс. пятно застройки",
    minOpen: "Мин. свободная площадь",
    minGreen: "Мин. озеленение",
    minPlot: "Мин. размер участка",
    use: "Разрешённое использование",
    singleHome: "только одиночный жилой дом",
    style: "тайский / тропический стиль, крыша натурального цвета",
    noBuildSea: "Строительство в пределах 10 м от береговой линии запрещено.",
    noBuildSlope: "Строительство на склонах круче 50° запрещено.",
    m: (n: number) => `${n} м`,
    floors1: " · 1 этаж",
    sqm: (n: number) => `${n.toLocaleString("ru-RU")} м²`,
    pct: (n: number) => `${n}%`,
    hotelGreen: "Отель — оставить ≥ 50% участка под озеленение.",
    units10: "Застройка 10+ юнитов — нужны очистные сооружения.",
    noTerrain: "Запрет на изменение рельефа/склона, подпорные стены и деление участка.",
    source:
      "Источник: регламент Минприроды Таиланда об охране окружающей среды Сурат-Тани (Самуи / Панган / Тао), в силе с 21 мая 2025 — индикативно, подтверждается в due diligence.",
  },
} as const;

// Internal accumulator of strictest constraints with their binding layer.
interface Acc {
  maxHeightM?: { v: number; layer: NormLayer };
  maxAreaSqm?: { v: number; layer: NormLayer; footprint: boolean };
  minOpenPct?: { v: number; layer: NormLayer };
  minGreenPct?: { v: number; layer: NormLayer };
  minPlotSqm?: { v: number; layer: NormLayer };
  singleHomeLayer?: NormLayer;
  styleRequired?: boolean;
}

function tighten<T extends { v: number }>(cur: T | undefined, next: T): T {
  return cur === undefined || next.v < cur.v ? next : cur;
}
function loosen<T extends { v: number }>(cur: T | undefined, next: T): T {
  return cur === undefined || next.v > cur.v ? next : cur;
}

/**
 * Combine the three geographic layers (+ general island cap) into the strictest
 * applicable rule set. Returns null when there are no inputs at all.
 */
export function combineBuildingNorms(inputs: NormInputs, locale: RuleLocale): BuildingNorms | null {
  const { seaDistanceM, elevationM, slopeDeg } = inputs;
  if (seaDistanceM == null && elevationM == null && slopeDeg == null) return null;

  const t = T[locale];
  const notes: string[] = [];
  const acc: Acc = {};

  // Hard "cannot build" gates first.
  if (seaDistanceM != null && seaDistanceM < 10) {
    return { buildable: false, noBuildReason: t.noBuildSea, lines: [], notes: [], source: t.source };
  }
  if (slopeDeg != null && slopeDeg > 50) {
    return { buildable: false, noBuildReason: t.noBuildSlope, lines: [], notes: [], source: t.source };
  }

  // General island-wide cap.
  acc.maxHeightM = tighten(acc.maxHeightM, { v: 12, layer: "general" as const });

  // ── Sea distance ──
  if (seaDistanceM != null) {
    if (seaDistanceM < 50) {
      acc.maxHeightM = tighten(acc.maxHeightM, { v: 6, layer: "sea" as const });
      acc.maxAreaSqm = tighten(acc.maxAreaSqm, { v: 75, layer: "sea" as const, footprint: false });
    } else if (seaDistanceM < 200) {
      acc.maxHeightM = tighten(acc.maxHeightM, { v: 12, layer: "sea" as const });
      acc.maxAreaSqm = tighten(acc.maxAreaSqm, { v: 2000, layer: "sea" as const, footprint: false });
    } else {
      acc.maxHeightM = tighten(acc.maxHeightM, { v: 12, layer: "sea" as const });
    }
  }

  // ── Elevation above sea level ──
  if (elevationM != null) {
    if (elevationM > 140) {
      acc.singleHomeLayer = "elevation";
      acc.maxHeightM = tighten(acc.maxHeightM, { v: 6, layer: "elevation" as const });
      acc.maxAreaSqm = tighten(acc.maxAreaSqm, { v: 90, layer: "elevation" as const, footprint: true });
      acc.minGreenPct = loosen(acc.minGreenPct, { v: 50, layer: "elevation" as const });
      acc.minPlotSqm = loosen(acc.minPlotSqm, { v: 400, layer: "elevation" as const });
      acc.styleRequired = true;
    } else if (elevationM >= 80) {
      acc.singleHomeLayer = "elevation";
      acc.maxHeightM = tighten(acc.maxHeightM, { v: 6, layer: "elevation" as const });
      acc.minGreenPct = loosen(acc.minGreenPct, { v: 50, layer: "elevation" as const });
      acc.minPlotSqm = loosen(acc.minPlotSqm, { v: 400, layer: "elevation" as const });
      acc.styleRequired = true;
    } else {
      notes.push(t.hotelGreen, t.units10);
    }
  }

  // ── Slope (degrees) ──
  if (slopeDeg != null && slopeDeg >= 35) {
    acc.singleHomeLayer = "slope";
    acc.maxHeightM = tighten(acc.maxHeightM, { v: 6, layer: "slope" as const });
    acc.maxAreaSqm = tighten(acc.maxAreaSqm, { v: 80, layer: "slope" as const, footprint: true });
    acc.minOpenPct = loosen(acc.minOpenPct, { v: 75, layer: "slope" as const });
    acc.minGreenPct = loosen(acc.minGreenPct, { v: 50, layer: "slope" as const });
    acc.minPlotSqm = loosen(acc.minPlotSqm, { v: 480, layer: "slope" as const });
    notes.push(t.noTerrain);
  }

  // Build the display lines from the accumulator.
  const lines: NormLine[] = [];
  if (acc.singleHomeLayer) lines.push({ label: t.use, value: t.singleHome, layer: acc.singleHomeLayer });
  if (acc.maxHeightM)
    lines.push({
      label: t.maxHeight,
      value: t.m(acc.maxHeightM.v) + (acc.maxHeightM.v <= 6 ? t.floors1 : ""),
      layer: acc.maxHeightM.layer,
    });
  if (acc.maxAreaSqm)
    lines.push({
      label: acc.maxAreaSqm.footprint ? t.maxFootprint : t.maxArea,
      value: t.sqm(acc.maxAreaSqm.v),
      layer: acc.maxAreaSqm.layer,
    });
  if (acc.minOpenPct) lines.push({ label: t.minOpen, value: t.pct(acc.minOpenPct.v), layer: acc.minOpenPct.layer });
  if (acc.minGreenPct) lines.push({ label: t.minGreen, value: t.pct(acc.minGreenPct.v), layer: acc.minGreenPct.layer });
  if (acc.minPlotSqm) lines.push({ label: t.minPlot, value: t.sqm(acc.minPlotSqm.v), layer: acc.minPlotSqm.layer });
  if (acc.styleRequired) notes.push(t.style);

  // De-dupe notes while preserving order.
  const uniqNotes = [...new Set(notes)];

  return { buildable: true, lines, notes: uniqNotes, source: t.source };
}
