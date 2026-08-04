import Link from "next/link";
import type { Route } from "next";
import type { RealEstateObject } from "@/types/object";
import { zoneBuildInfo } from "@/lib/data/zone-rules";
import { combineBuildingNorms, type PlanZone } from "@/lib/data/building-norms";
import { seaDistanceMeters } from "@/lib/geo/sea-distance";
import { fetchTerrain } from "@/lib/geo/terrain";
import type { Locale } from "@/lib/i18n/dictionaries";
import { Appear } from "@/components/motion/appear";
import { cn } from "@/lib/utils/cn";

/**
 * "What you can build here" — indicative building rules for the plot:
 *  - QUALITATIVE: the DPT city-plan zone use + coastal/hillside flags
 *    (zone-rules.ts) and the agent's own note.
 *  - QUANTITATIVE: precise limits (max height / footprint / open-space % / min
 *    plot) computed from the plot's coordinates — distance to sea (coastline),
 *    elevation and slope (DEM) — via the May-2025 environmental law engine
 *    (building-norms.ts). Same engine as the /tools/zoning checker.
 *
 * Async server component (the object page is dynamic; the terrain fetch is
 * cached). Always indicative + linked to DD; the exact figures for a plot are
 * confirmed in Transaction due diligence. Renders nothing when there is no
 * derivable rule, no precise norm and no agent note.
 */
const COPY = {
  en: {
    heading: "What you can build here",
    zone: "Zone",
    check: "Check before you build",
    note: "Agent note for this plot",
    precise: "Estimated build limits",
    notBuildable: "Building not permitted at this point",
    basis: "Based on",
    sea: "to sea",
    elev: "elevation",
    slope: "slope",
    estimated: "estimated",
    disclaimer:
      "Indicative. Zone use is read from the Phangan city-plan; the precise limits come from the May-2025 environmental protection law applied to the estimated sea distance, elevation and slope. The exact figures for this plot are verified in our",
    ddLink: "due diligence",
    disclaimerTail: "before any offer.",
  },
  ru: {
    heading: "Что здесь можно строить",
    zone: "Зона",
    check: "Проверить до стройки",
    note: "Заметка агента по участку",
    precise: "Расчётные лимиты застройки",
    notBuildable: "Строительство в этой точке запрещено",
    basis: "Расчёт по",
    sea: "до моря",
    elev: "высота",
    slope: "уклон",
    estimated: "оценка",
    disclaimer:
      "Индикативно. Использование зоны — по городскому плану Пангана; точные лимиты — из закона об охране среды (май 2025), применённого к оценённым расстоянию до моря, высоте и уклону. Точные цифры для этого участка проверяются в нашем",
    ddLink: "due diligence",
    disclaimerTail: "до любого предложения.",
  },
} as const;

/** CRM Zone value → city-plan colour tier used by the norms engine. */
const PLAN_ZONE_BY_CARD: Record<string, PlanZone | undefined> = {
  Green: "green",
  Yellow: "yellow",
  Orange: "orange",
  Red: "red",
  Purple: "purple",
};

export async function BuildingRules({
  object,
  locale,
}: {
  object: RealEstateObject;
  locale: Locale;
}) {
  const info = zoneBuildInfo(object, locale);
  const manual = object.buildingRules?.trim();

  // Precise quantitative norms — only when the plot is geolocated. Sea distance
  // is a pure calc; elevation/slope come from the DEM (cached, may be absent on
  // a network blip — then norms fall back to the sea-distance tier alone).
  let norms = null;
  let seaDistanceM: number | undefined;
  let elevationM: number | undefined;
  let slopePct: number | undefined;
  if (object.lat != null && object.lng != null) {
    seaDistanceM = seaDistanceMeters(object.lat, object.lng);
    const terrain = await fetchTerrain(object.lat, object.lng);
    elevationM = terrain?.elevationM;
    slopePct = terrain?.slopePct;
    // The card's own zone drives the city-plan size cap; the three greens are
    // not distinguished in the CRM field, so Green maps to the plain rural tier.
    const planZone = PLAN_ZONE_BY_CARD[object.zone ?? ""];
    // On Land, rai and m² describe the SAME plot in two units — take m² first.
    // On a villa card areaSqm is the BUILT area, so only rai can mean the plot.
    const plotSqm =
      object.type === "Land"
        ? (object.areaSqm ?? (object.areaRai != null ? object.areaRai * 1600 : undefined))
        : object.areaRai != null
          ? object.areaRai * 1600
          : undefined;
    // A listing has no survey attached, so its slope is always the DEM estimate.
    norms = combineBuildingNorms(
      { seaDistanceM, elevationM, slopePct, slopeEstimated: true, planZone, plotSqm },
      locale,
    );
  }

  if (!info && !manual && !norms) return null;

  const t = COPY[locale];
  const ddHref = (locale === "ru" ? "/ru/due-diligence" : "/due-diligence") as Route;

  // "Based on ~120 m to sea · ~45 m elevation · ~22% slope (estimated)"
  const basisParts: string[] = [];
  if (seaDistanceM != null) basisParts.push(`~${seaDistanceM} m ${t.sea}`);
  if (elevationM != null) basisParts.push(`~${elevationM} m ${t.elev}`);
  if (slopePct != null) basisParts.push(`~${slopePct}% ${t.slope}`);

  return (
    <Appear>
    <section>
      <h2 className="font-serif text-3xl text-forest-900">{t.heading}</h2>

      {info?.zone ? (
        <p className="mt-4 inline-flex items-center gap-2 rounded-full border border-forest-500/15 bg-forest-500/[0.04] px-3 py-1 text-sm text-forest-700">
          <span className="text-forest-500/60">{t.zone}:</span>
          <span className="font-medium">{info.zone}</span>
        </p>
      ) : null}

      {/* Precise quantitative limits — the concrete answer. */}
      {norms ? (
        norms.buildable && norms.lines.length > 0 ? (
          <div className="mt-5 max-w-prose rounded-lg border border-forest-500/15 bg-forest-500/[0.03] p-4">
            <p className="text-xs font-medium uppercase tracking-[0.15em] text-forest-700">{t.precise}</p>
            <dl className="mt-3 space-y-2.5">
              {norms.lines.map((line, i) => (
                <div key={i} className="grid grid-cols-[8rem_1fr] gap-x-4 sm:grid-cols-[10rem_1fr]">
                  <dt className="text-sm font-medium text-forest-500/70">{line.label}</dt>
                  <dd className="num text-base font-semibold text-forest-900">{line.value}</dd>
                </div>
              ))}
            </dl>
            {norms.notes.length > 0 ? (
              <ul className="mt-3 space-y-1.5 border-t border-forest-500/10 pt-3">
                {norms.notes.map((n) => (
                  <li key={n} className="flex gap-2 text-sm leading-relaxed text-forest-500/75">
                    <span aria-hidden className="mt-0.5 shrink-0 text-forest-500/45">▸</span>
                    <span>{n}</span>
                  </li>
                ))}
              </ul>
            ) : null}
            {basisParts.length > 0 ? (
              <p className="mt-3 text-xs text-forest-500/50">
                {t.basis}: {basisParts.join(" · ")} ({t.estimated})
              </p>
            ) : null}
            <p className="mt-1 text-xs leading-relaxed text-forest-500/50">{norms.source}</p>
          </div>
        ) : !norms.buildable ? (
          <div className="mt-5 max-w-prose rounded-lg border border-red-600/25 bg-red-50/70 p-4 dark:bg-red-500/10">
            <p className="text-sm font-semibold text-red-800 dark:text-red-300">⛔ {t.notBuildable}</p>
            <p className="mt-1 text-base leading-relaxed text-forest-500/85">{norms.noBuildReason}</p>
            {basisParts.length > 0 ? (
              <p className="mt-3 text-xs text-forest-500/50">
                {t.basis}: {basisParts.join(" · ")} ({t.estimated})
              </p>
            ) : null}
          </div>
        ) : null
      ) : null}

      {info && info.lines.length > 0 ? (
        <dl className="mt-5 max-w-prose space-y-3">
          {info.lines.map((line) => (
            <div key={line.label} className="grid grid-cols-[8rem_1fr] gap-x-4 gap-y-1 sm:grid-cols-[10rem_1fr]">
              <dt className="text-sm font-medium text-forest-500/70">{line.label}</dt>
              <dd className="text-base leading-relaxed text-forest-500/85">{line.text}</dd>
            </div>
          ))}
        </dl>
      ) : null}

      {info && info.flags.length > 0 ? (
        <div className="mt-6 max-w-prose rounded-lg border border-amber-600/20 bg-amber-50/60 p-4 dark:border-amber-500/25 dark:bg-amber-500/10">
          <p className="text-xs font-medium uppercase tracking-[0.15em] text-amber-700 dark:text-amber-300">
            {t.check}
          </p>
          <ul className="mt-2 space-y-2">
            {info.flags.map((f) => (
              <li key={f.text} className="flex gap-2 text-base leading-relaxed text-forest-500/85">
                <span aria-hidden className={cn("mt-0.5 shrink-0", f.level === "warn" ? "text-amber-600 dark:text-amber-400" : "text-forest-500/50")}>
                  {f.level === "warn" ? "▲" : "▸"}
                </span>
                <span>{f.text}</span>
              </li>
            ))}
          </ul>
        </div>
      ) : null}

      {manual ? (
        <div className="mt-6 max-w-prose rounded-lg border border-forest-500/10 bg-cream-50 p-4">
          <p className="text-xs font-medium uppercase tracking-[0.15em] text-brass-500">{t.note}</p>
          <p className="mt-2 whitespace-pre-line text-base leading-relaxed text-forest-500/85">{manual}</p>
        </div>
      ) : null}

      <p className="mt-5 max-w-prose text-sm leading-relaxed text-forest-500/60">
        {t.disclaimer}{" "}
        <Link href={ddHref} className="underline decoration-brass-500/40 underline-offset-2 hover:text-forest-700">
          {t.ddLink}
        </Link>{" "}
        {t.disclaimerTail}
      </p>
    </section>
    </Appear>
  );
}
