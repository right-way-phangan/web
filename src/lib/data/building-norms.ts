/**
 * Quantitative Koh Phangan building norms — the "precise rules" layer on top of
 * the city-plan colour (zone-rules.ts gives qualitative use; this gives numbers:
 * max height, max house size, plot coverage, footprint, setback, buildable y/n).
 *
 * SOURCES OF TRUTH (three laws, most-restrictive wins):
 *  1. Thai Building Control Act / Ministerial Regulation No. 55 (B.E. 2543) —
 *     the BASELINE for an ordinary private dwelling (villa / house): plot
 *     coverage ≤ 70% (open space ≥ 30%), boundary setback ≥ 2 m for walls with
 *     openings (≥ 0.5 m for a blank wall / eaves). Applies to every buildable plot.
 *  2. Koh Phangan comprehensive city plan — Ministerial Regulation B.E. 2558
 *     (Royal Gazette vol. 132/79 ก, 24 Aug 2015; amended by the Phet Phangan
 *     municipal ordinance B.E. 2566). This is where the MAX HOUSE SIZE lives:
 *     each colour caps the combined building area (พื้นที่อาคารรวมกัน, all
 *     floors) and height, with a stricter tier inside 50 m of the shoreline.
 *  3. MNRE environmental protection regulation for Surat Thani (incl. Ko Samui /
 *     Ko Phangan / Ko Tao), in force 21 May 2025 — extra limits driven by three
 *     geographic facts we estimate from coordinates: distance to sea, elevation
 *     (m a.s.l.) and slope (height 6/12 m, footprint caps, green %, no-build gates).
 *     Its slope thresholds are PERCENT gradients (35% / 50%), not degrees —
 *     verified against the clause text quoted in a lawyer's DD report (deed
 *     13681, First Consultants 47, June 2026).
 *
 * Deliberately INDICATIVE. Caveats baked in and surfaced in the UI:
 *  - Sea distance / elevation / slope are estimated from open data (OSM
 *    coastline ~30m, SRTM elevation ~30m) and SRTM reads the forest canopy, so
 *    on Phangan it overstates both; a survey overrides it in the UI.
 *  - The city-plan cap is read from the tile COLOUR, so a mis-read colour means
 *    a wrong tier — the exact zone number is confirmed against landsmaps in DD.
 *  - Enforcement varies; every figure is verified in Transaction DD.
 */

export type RuleLocale = "en" | "ru";

/** City-plan colour class (mirrors the classifier in zone-lookup.ts). */
export type PlanZone =
  | "green"
  | "greenBright"
  | "greenLight"
  | "yellow"
  | "orange"
  | "red"
  | "purple"
  | "blue"
  | "water"
  | "olive"
  | "brown"
  | "gray";

/** Which layer a constraint came from — for provenance in the UI. */
export type NormLayer = "sea" | "elevation" | "slope" | "general" | "bca" | "cityplan";

export interface NormLine {
  /** Localized label, e.g. "Max height" / "Макс. высота". */
  label: string;
  /** Localized value, e.g. "12 m" / "≤ 6 м · 1 этаж". */
  value: string;
  /** Which layer bound this value (most-restrictive wins). */
  layer: NormLayer;
}

export interface BuildingNorms {
  /** False when a layer forbids building outright (within 10 m of the shore). */
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
  /** Ground slope in PERCENT — the unit the regulation uses (estimated or surveyed). */
  slopePct?: number;
  /**
   * True when the slope came from the DEM rather than a survey. The DEM takes
   * the steepest neighbour gradient over 60 m of canopy-topped SRTM, which runs
   * far above the surveyed average (51% vs 27% on deed 13681), and the
   * regulation is read at the building spot anyway — so an estimated slope only
   * warns, it never binds the limits.
   */
  slopeEstimated?: boolean;
  /** City-plan colour class at the point — drives the ผังเมือง size caps. */
  planZone?: PlanZone;
  /** Plot area in m² — turns the % coverage into an actual buildable footprint. */
  plotSqm?: number;
}

/**
 * Koh Phangan city plan (MR B.E. 2558) — combined building area (all floors)
 * and height per colour, plus the stricter tier inside 50 m of the shoreline.
 * `livingSharePct` is the separate cap on how much of the plot may be used for
 * housing in the two protection zones. `ref` is the clause, for provenance.
 */
const CITY_PLAN: Partial<
  Record<
    PlanZone,
    {
      totalAreaSqm: number;
      heightM: number;
      coast?: { totalAreaSqm: number; heightM: number };
      livingSharePct?: number;
      ref: string;
    }
  >
> = {
  // ข้อ 7 · ที่อยู่อาศัยหนาแน่นน้อย (yellow)
  yellow: { totalAreaSqm: 1000, heightM: 12, coast: { totalAreaSqm: 300, heightM: 6 }, ref: "ข้อ 7" },
  // ข้อ 8 · ที่อยู่อาศัยหนาแน่นปานกลาง (orange)
  orange: { totalAreaSqm: 2000, heightM: 12, coast: { totalAreaSqm: 200, heightM: 6 }, ref: "ข้อ 8" },
  // ข้อ 9 · พาณิชยกรรมและที่อยู่อาศัยหนาแน่นมาก (red)
  red: { totalAreaSqm: 2000, heightM: 12, coast: { totalAreaSqm: 150, heightM: 6 }, ref: "ข้อ 9" },
  // ข้อ 10 · ชนบทและเกษตรกรรม (green)
  green: { totalAreaSqm: 300, heightM: 12, coast: { totalAreaSqm: 150, heightM: 6 }, ref: "ข้อ 10" },
  // ข้อ 11 · ที่โล่งเพื่อนันทนาการและการรักษาคุณภาพสิ่งแวดล้อม (pale green)
  greenLight: {
    totalAreaSqm: 150,
    heightM: 12,
    coast: { totalAreaSqm: 100, heightM: 6 },
    livingSharePct: 30,
    ref: "ข้อ 11",
  },
  // ข้อ 12 · อนุรักษ์ป่าไม้ — pale green with white hatching (private land only)
  greenBright: { totalAreaSqm: 300, heightM: 12, livingSharePct: 30, ref: "ข้อ 12" },
};

const T = {
  en: {
    maxHeight: "Max height",
    coverage: "Max plot coverage",
    maxTotalArea: "Max house size",
    maxFootprint: "Max footprint",
    setback: "Setback from boundary",
    setbackVal: "≥ 2 m (walls with windows) · ≥ 0.5 m (blank wall, eaves)",
    use: "Allowed use",
    villa: "private villa / house",
    singleHome: "single-family home only",
    style: "Thai / tropical style, natural-colour roof",
    noBuildSea: "No construction within 10 m of the shoreline.",
    m: (n: number) => `${n} m`,
    floors1: " · 1 storey",
    sqm: (n: number) => `${Math.round(n).toLocaleString("en-US")} m²`,
    allFloors: " (all floors, per building)",
    pct: (n: number) => `${n}%`,
    ofPlot: (pct: number, sqm: number) => `${pct}% · up to ${Math.round(sqm).toLocaleString("en-US")} m²`,
    greenNote: (n: number) => `Of the open space, ≥ ${n}% must be planted (native trees).`,
    hotelGreen: "Hotels must leave ≥ 50% of the plot as green space.",
    units10: "Developments of 10+ units need wastewater treatment.",
    coastFree: "Inside 50 m of the shore: a ≥ 12 m strip along the beach must stay clear.",
    waterway: "A ≥ 6 m strip along canals and public water bodies must stay clear.",
    livingShare: (n: number) => `Protection zone — housing may take at most ${n}% of the plot.`,
    slopeGrading: "Steep ground: regrading limited to 3:1 (horizontal:vertical); no cut or fill deeper than 1 m except for foundations, basements and water tanks.",
    slopeSmallPlot: "On a plot under 400 m² the footprint cap drops to 70 m² and 50% of the plot must stay permeable.",
    slopeTrees: "Slope 50%+: mature trees (trunk ≥ 50 cm around at 1.3 m) must not be damaged — roots or trunk.",
    slopeSurvey: "Slope is judged at the building spot, not as a plot average — a contour survey decides whether these limits apply.",
    slopeMaybe: (n: number) =>
      `Slope here estimates at ~${n}% from open data, which reads high. If a survey confirms 35%+: single house only, ≤ 6 m tall, footprint ≤ 90 m² (≤ 70 m² on a plot under 400 m²), ≥ 70% of the plot left permeable.`,
    source:
      "Source: Thai Building Control Act (Ministerial Reg. 55) + Koh Phangan city plan (Ministerial Reg. B.E. 2558, amended B.E. 2566) + MNRE environmental protection regulation for Surat Thani (Ko Samui / Ko Phangan / Ko Tao, in force 21 May 2025) — indicative, confirmed in due diligence.",
  },
  ru: {
    maxHeight: "Макс. высота",
    coverage: "Макс. застройка участка",
    maxTotalArea: "Макс. площадь дома",
    maxFootprint: "Макс. пятно застройки",
    setback: "Отступ от границы",
    setbackVal: "≥ 2 м (стена с окнами) · ≥ 0.5 м (глухая стена, свесы)",
    use: "Разрешённое использование",
    villa: "частная вилла / дом",
    singleHome: "только одиночный жилой дом",
    style: "тайский / тропический стиль, крыша натурального цвета",
    noBuildSea: "Строительство в пределах 10 м от береговой линии запрещено.",
    m: (n: number) => `${n} м`,
    floors1: " · 1 этаж",
    sqm: (n: number) => `${Math.round(n).toLocaleString("ru-RU")} м²`,
    allFloors: " (все этажи, на здание)",
    pct: (n: number) => `${n}%`,
    ofPlot: (pct: number, sqm: number) => `${pct}% · до ${Math.round(sqm).toLocaleString("ru-RU")} м²`,
    greenNote: (n: number) => `Из свободной площади ≥ ${n}% — озеленение (местные деревья).`,
    hotelGreen: "Отель — оставить ≥ 50% участка под озеленение.",
    units10: "Застройка 10+ юнитов — нужны очистные сооружения.",
    coastFree: "В 50 м от моря: полоса ≥ 12 м вдоль берега остаётся свободной.",
    waterway: "Вдоль каналов и водоёмов — свободная полоса ≥ 6 м.",
    livingShare: (n: number) => `Охранная зона — под жильё не более ${n}% участка.`,
    slopeGrading: "Крутой склон: планировка грунта не круче 3:1 (гориз.:верт.), выемка и насыпь не глубже и не выше 1 м — кроме фундамента, подвала и подземных резервуаров.",
    slopeSmallPlot: "На участке меньше 400 м² пятно застройки падает до 70 м², водопроницаемыми должны остаться 50% участка.",
    slopeTrees: "Уклон 50%+: нельзя повреждать корни и стволы взрослых деревьев (обхват ≥ 50 см на высоте 1,3 м).",
    slopeSurvey: "Уклон считается по месту постройки, а не в среднем по участку — попадание под эти лимиты решает топосъёмка.",
    slopeMaybe: (n: number) =>
      `Уклон здесь оценивается в ~${n}% по открытым данным, а они завышают. Если топосъёмка подтвердит 35%+: только одиночный дом, ≤ 6 м, пятно ≤ 90 м² (≤ 70 м² на участке меньше 400 м²), ≥ 70% участка — водопроницаемые.`,
    source:
      "Источник: Закон Таиланда о контроле строительства (регламент №55) + городской план Ко Пангана (регламент 2558, ред. 2566) + регламент Минприроды об охране среды Сурат-Тани (Самуи / Панган / Тао, в силе с 21 мая 2025) — индикативно, подтверждается в due diligence.",
  },
} as const;

// Internal accumulator of strictest constraints with their binding layer.
interface Acc {
  maxHeightM?: { v: number; layer: NormLayer };
  /** Combined area of all floors (city plan + sea tiers). */
  maxTotalAreaSqm?: { v: number; layer: NormLayer };
  /** Ground footprint (environmental hillside/slope tiers). */
  maxFootprintSqm?: { v: number; layer: NormLayer };
  // Strictest required open space (% of plot left unbuilt) → coverage = 100 − this.
  minOpenPct?: { v: number; layer: NormLayer };
  // Of that, how much must be planted greenery (env tiers only).
  minGreenPct?: { v: number; layer: NormLayer };
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
 * Combine the baseline dwelling code (Building Control Act) + the city-plan
 * zone caps + the three geographic environmental layers into the strictest
 * applicable rule set for a private villa/house. Null when no inputs at all.
 */
export function combineBuildingNorms(inputs: NormInputs, locale: RuleLocale): BuildingNorms | null {
  const { seaDistanceM, elevationM, slopePct, slopeEstimated, planZone, plotSqm } = inputs;
  if (seaDistanceM == null && elevationM == null && slopePct == null && planZone == null) return null;

  const t = T[locale];
  const notes: string[] = [];
  const acc: Acc = {};

  // Hard "cannot build" gate. Steep ground is NOT one: the regulation caps what
  // may be built on a 35%+ / 50%+ slope, it does not forbid building there.
  if (seaDistanceM != null && seaDistanceM < 10) {
    return { buildable: false, noBuildReason: t.noBuildSea, lines: [], notes: [], source: t.source };
  }

  // ── Baseline for any private dwelling (Building Control Act / MR 55) ──
  // Coverage ≤ 70% (open space ≥ 30%); setback handled as a constant line below.
  acc.maxHeightM = tighten(acc.maxHeightM, { v: 12, layer: "general" as const }); // island-wide cap
  acc.minOpenPct = loosen(acc.minOpenPct, { v: 30, layer: "bca" as const });

  // ── City plan (ผังเมือง) — the size of the house itself ──
  const plan = planZone ? CITY_PLAN[planZone] : undefined;
  if (plan) {
    // The shoreline tier only applies when we actually know we are inside 50 m.
    const tier = plan.coast && seaDistanceM != null && seaDistanceM < 50 ? plan.coast : plan;
    acc.maxTotalAreaSqm = tighten(acc.maxTotalAreaSqm, { v: tier.totalAreaSqm, layer: "cityplan" as const });
    acc.maxHeightM = tighten(acc.maxHeightM, { v: tier.heightM, layer: "cityplan" as const });
    if (plan.livingSharePct != null) {
      acc.minOpenPct = loosen(acc.minOpenPct, { v: 100 - plan.livingSharePct, layer: "cityplan" as const });
      notes.push(t.livingShare(plan.livingSharePct));
    }
    if (tier !== plan) notes.push(t.coastFree);
    notes.push(t.waterway);
  }

  // ── Sea distance ──
  if (seaDistanceM != null) {
    if (seaDistanceM < 50) {
      acc.maxHeightM = tighten(acc.maxHeightM, { v: 6, layer: "sea" as const });
      acc.maxTotalAreaSqm = tighten(acc.maxTotalAreaSqm, { v: 75, layer: "sea" as const });
    } else if (seaDistanceM < 200) {
      acc.maxHeightM = tighten(acc.maxHeightM, { v: 12, layer: "sea" as const });
      acc.maxTotalAreaSqm = tighten(acc.maxTotalAreaSqm, { v: 2000, layer: "sea" as const });
    } else {
      acc.maxHeightM = tighten(acc.maxHeightM, { v: 12, layer: "sea" as const });
    }
  }

  // ── Elevation above sea level ──
  // Below 80 m the environmental regulation adds no size limits of its own —
  // the city plan governs (confirmed in the DD report for deed 13681).
  if (elevationM != null) {
    if (elevationM > 140) {
      acc.singleHomeLayer = "elevation";
      acc.maxHeightM = tighten(acc.maxHeightM, { v: 6, layer: "elevation" as const });
      acc.maxFootprintSqm = tighten(acc.maxFootprintSqm, { v: 90, layer: "elevation" as const });
      acc.minOpenPct = loosen(acc.minOpenPct, { v: 70, layer: "elevation" as const });
      acc.minGreenPct = loosen(acc.minGreenPct, { v: 50, layer: "elevation" as const });
      acc.styleRequired = true;
    } else if (elevationM >= 80) {
      acc.singleHomeLayer = "elevation";
      acc.maxHeightM = tighten(acc.maxHeightM, { v: 6, layer: "elevation" as const });
      acc.minOpenPct = loosen(acc.minOpenPct, { v: 50, layer: "elevation" as const });
      acc.minGreenPct = loosen(acc.minGreenPct, { v: 50, layer: "elevation" as const });
      acc.styleRequired = true;
    } else {
      notes.push(t.hotelGreen, t.units10);
    }
  }

  // ── Slope, PERCENT gradient (35% ≈ 19°, 50% ≈ 27°) ──
  // 35%+: single house ≤ 6 m; footprint ≤ 90 m² on a plot over 100 sq.wah
  // (400 m²), ≤ 70 m² below it; permeable open space ≥ 70% / 50% respectively;
  // greenery ≥ 50% of that open space; grading limited to 3:1 and ±1 m.
  if (slopePct != null && slopePct >= 35 && slopeEstimated) {
    // Estimate only — flag what would apply, don't cut the limits on a guess.
    notes.push(t.slopeMaybe(slopePct), t.slopeSurvey);
  } else if (slopePct != null && slopePct >= 35) {
    const smallPlot = plotSqm != null && plotSqm < 400;
    acc.singleHomeLayer = "slope";
    acc.maxHeightM = tighten(acc.maxHeightM, { v: 6, layer: "slope" as const });
    acc.maxFootprintSqm = tighten(acc.maxFootprintSqm, { v: smallPlot ? 70 : 90, layer: "slope" as const });
    acc.minOpenPct = loosen(acc.minOpenPct, { v: smallPlot ? 50 : 70, layer: "slope" as const });
    acc.minGreenPct = loosen(acc.minGreenPct, { v: 50, layer: "slope" as const });
    notes.push(t.slopeGrading, t.slopeSurvey);
    if (plotSqm == null) notes.push(t.slopeSmallPlot);
    if (slopePct >= 50) notes.push(t.slopeTrees);
  }

  // Build the display lines from the accumulator.
  const lines: NormLine[] = [];
  // Frame the answer as a private dwelling (the case Right Way sells most).
  lines.push({ label: t.use, value: acc.singleHomeLayer ? t.singleHome : t.villa, layer: acc.singleHomeLayer ?? "bca" });
  if (acc.maxHeightM)
    lines.push({
      label: t.maxHeight,
      value: t.m(acc.maxHeightM.v) + (acc.maxHeightM.v <= 6 ? t.floors1 : ""),
      layer: acc.maxHeightM.layer,
    });
  // The answer to "how big a villa can I build here?" — combined floor area.
  if (acc.maxTotalAreaSqm)
    lines.push({
      label: t.maxTotalArea,
      value: t.sqm(acc.maxTotalAreaSqm.v) + t.allFloors,
      layer: acc.maxTotalAreaSqm.layer,
    });
  // Plot coverage = 100 − strictest required open space; in m² once we know the plot.
  const coveragePct = acc.minOpenPct ? 100 - acc.minOpenPct.v : undefined;
  if (acc.minOpenPct && coveragePct != null)
    lines.push({
      label: t.coverage,
      value:
        plotSqm != null && plotSqm > 0
          ? t.ofPlot(coveragePct, (plotSqm * coveragePct) / 100)
          : t.pct(coveragePct),
      layer: acc.minOpenPct.layer,
    });
  // Footprint: the strictest of the environmental cap and the coverage share.
  const coverageFootprint =
    plotSqm != null && plotSqm > 0 && coveragePct != null ? (plotSqm * coveragePct) / 100 : undefined;
  const footprint =
    acc.maxFootprintSqm && coverageFootprint != null
      ? Math.min(acc.maxFootprintSqm.v, coverageFootprint)
      : acc.maxFootprintSqm?.v;
  if (footprint != null)
    lines.push({
      label: t.maxFootprint,
      value: t.sqm(footprint),
      layer: acc.maxFootprintSqm?.layer ?? "bca",
    });
  // Boundary setback — Building Control Act, applies to every dwelling.
  lines.push({ label: t.setback, value: t.setbackVal, layer: "bca" });

  // Notes: greenery share of the open space, plus the conditional flags.
  if (acc.minGreenPct) notes.unshift(t.greenNote(acc.minGreenPct.v));
  if (acc.styleRequired) notes.push(t.style);

  // De-dupe notes while preserving order.
  const uniqNotes = [...new Set(notes)];

  return { buildable: true, lines, notes: uniqNotes, source: t.source };
}
