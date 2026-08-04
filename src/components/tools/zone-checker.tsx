"use client";

import { useCallback, useState } from "react";
import dynamic from "next/dynamic";
import Link from "next/link";
import type { Route } from "next";
import {
  lookupZoneRules,
  type ZoneRulesLookupResult,
  type NormOverrides,
} from "@/lib/actions/zone-rules-lookup";
import type { ZoneSignals, RuleLocale } from "@/lib/data/zone-rules";
import { cn } from "@/lib/utils/cn";

/**
 * Standalone "paste a location → building rules" checker. Shared by the admin
 * tool (/admin/zoning) and the public page (/tools/zoning); the locale prop
 * switches copy and the DD link target. Wrapper over the lookupZoneRules server
 * action — no data of its own. Shows the qualitative zone use AND the precise
 * quantitative norms (height/area/%/min plot) driven by sea distance, elevation
 * and slope. Always indicative, links to DD.
 */

// Leaflet touches `window` → map is client-only (ssr:false in a client file).
const ZoneMapPicker = dynamic(() => import("./zone-map-picker"), {
  ssr: false,
  loading: () => <div className="h-full w-full animate-pulse bg-forest-500/[0.06]" />,
});

const COPY = {
  en: {
    placeholder: "Paste coordinates (9.73, 100.02) or a Google Maps link…",
    mapHint: "…or click the plot on the map — the colours are the city plan.",
    check: "Check rules",
    checking: "Checking…",
    signalsHeading: "Plot details (optional — sharpens the warnings)",
    beachfront: "Beachfront / right by the sea",
    seaView: "Sea view",
    mountainView: "Hillside / mountain view",
    dirtRoad: "Dirt track / no real road access",
    detected: "Detected zone",
    coords: "Point",
    noRules: "No specific land-use rule was detected for this point — the zone is confirmed in due diligence.",
    checkBeforeBuild: "Check before you build",
    precise: "What you can build — precise limits",
    notBuildable: "Building not permitted at this point",
    geoSea: "Distance to sea",
    geoElev: "Elevation",
    geoSlope: "Slope",
    geoPlot: "Plot area",
    aboveSea: "m a.s.l.",
    metres: "m",
    deg: "°",
    unitSqm: "m²",
    unitRai: "rai",
    estimatedNote:
      "Sea/elevation/slope are estimated from open data (~30 m). Edit elevation or slope if you have survey data; enter the plot area to get the footprint in m².",
    disclaimerLead:
      "Indicative. Zone use is read from the Phangan city-plan colour; the precise limits come from the May-2025 environmental protection law applied to the estimated sea distance, elevation and slope. Exact figures for a plot are verified in our ",
    ddLink: "due diligence",
    disclaimerTail: " before any offer.",
    ddHref: "/due-diligence",
    idleHint: "Paste a location or click the map to see what you can build there.",
  },
  ru: {
    placeholder: "Вставьте координаты (9.73, 100.02) или ссылку Google Maps…",
    mapHint: "…или кликните по участку на карте — цвета это городской план.",
    check: "Проверить правила",
    checking: "Определяем…",
    signalsHeading: "Детали участка (необязательно — уточняют предупреждения)",
    beachfront: "У моря / на первой линии",
    seaView: "Вид на море",
    mountainView: "Склон / вид на горы",
    dirtRoad: "Грунтовка / нет реального подъезда",
    detected: "Определённая зона",
    coords: "Точка",
    noRules: "Для этой точки конкретное правило использования не определено — зона уточняется в due diligence.",
    checkBeforeBuild: "Проверить до стройки",
    precise: "Что можно строить — точные лимиты",
    notBuildable: "Строительство в этой точке запрещено",
    geoSea: "До моря",
    geoElev: "Высота",
    geoSlope: "Уклон",
    geoPlot: "Площадь участка",
    aboveSea: "м н.у.м.",
    metres: "м",
    deg: "°",
    unitSqm: "м²",
    unitRai: "рай",
    estimatedNote:
      "Море/высота/уклон оценены по открытым данным (~30 м). Впишите высоту или уклон, если есть топосъёмка; впишите площадь участка — посчитаем пятно застройки в м².",
    disclaimerLead:
      "Индикативно. Использование зоны — по цвету городского плана Пангана; точные лимиты — из закона об охране среды (май 2025), применённого к оценённым расстоянию до моря, высоте и уклону. Точные цифры для участка проверяются в нашем ",
    ddLink: "due diligence",
    disclaimerTail: " до сделки.",
    ddHref: "/ru/due-diligence",
    idleHint: "Вставьте локацию или кликните карту, чтобы увидеть, что здесь можно строить.",
  },
} as const;

type BoolSignal = "beachfront" | "seaView" | "mountainView";
type Status = "idle" | "busy" | "done";

export function ZoneChecker({ locale }: { locale: RuleLocale }) {
  const t = COPY[locale];
  const [input, setInput] = useState("");
  const [signals, setSignals] = useState<ZoneSignals>({});
  const [marker, setMarker] = useState<{ lat: number; lng: number } | null>(null);
  const [status, setStatus] = useState<Status>("idle");
  const [result, setResult] = useState<ZoneRulesLookupResult | null>(null);
  // Manual overrides (survey beats DEM); empty string = use the estimate.
  const [elevStr, setElevStr] = useState("");
  const [slopeStr, setSlopeStr] = useState("");
  // Plot size — nothing to estimate here, it only ever comes from the user.
  const [plotStr, setPlotStr] = useState("");
  const [plotUnit, setPlotUnit] = useState<"sqm" | "rai">("sqm");

  // Single lookup path — text input, map click, signal toggles and geo
  // overrides all funnel through here so the result always matches the inputs.
  const run = useCallback(
    async (location: string, sig: ZoneSignals, ov: NormOverrides) => {
      const loc = location.trim();
      if (!loc) return;
      setStatus("busy");
      const r = await lookupZoneRules(loc, locale, sig, ov);
      setResult(r);
      if (r.ok && r.lat != null && r.lng != null) setMarker({ lat: r.lat, lng: r.lng });
      setStatus("done");
    },
    [locale],
  );

  const toSqm = (value: string, unit: "sqm" | "rai") =>
    value.trim() === "" ? undefined : Number(value) * (unit === "rai" ? 1600 : 1);

  const parseOverrides = (
    elev: string,
    slope: string,
    plot: string = plotStr,
    unit: "sqm" | "rai" = plotUnit,
  ): NormOverrides => ({
    elevationM: elev.trim() === "" ? undefined : Number(elev),
    slopeDeg: slope.trim() === "" ? undefined : Number(slope),
    plotSqm: toSqm(plot, unit),
  });

  function onMapPick(lat: number, lng: number) {
    const loc = `${lat.toFixed(6)}, ${lng.toFixed(6)}`;
    setInput(loc);
    setMarker({ lat, lng });
    // New location → drop any prior survey overrides, re-estimate from DEM.
    // The plot area survives: it describes the plot, not the sampled point.
    setElevStr("");
    setSlopeStr("");
    void run(loc, signals, { plotSqm: toSqm(plotStr, plotUnit) });
  }

  function onSubmitLocation() {
    setElevStr("");
    setSlopeStr("");
    void run(input, signals, { plotSqm: toSqm(plotStr, plotUnit) });
  }

  // Re-run against the current point with new signals or geo overrides.
  function rerun(sig: ZoneSignals, ov: NormOverrides) {
    const loc = marker ? `${marker.lat}, ${marker.lng}` : input;
    if (loc.trim()) void run(loc, sig, ov);
  }
  function applySignals(next: ZoneSignals) {
    setSignals(next);
    rerun(next, parseOverrides(elevStr, slopeStr));
  }
  function applyOverrides() {
    rerun(signals, parseOverrides(elevStr, slopeStr));
  }

  const rules = result?.ok ? result.rules : null;
  const norms = result?.ok ? result.norms : null;
  // Thai regulations quote gradients in percent, our DEM in degrees — show both.
  const shownSlopeDeg = slopeStr.trim() !== "" ? Number(slopeStr) : result?.ok ? result.slopeDeg : undefined;
  const slopePct =
    shownSlopeDeg != null && Number.isFinite(shownSlopeDeg)
      ? Math.round(Math.tan((shownSlopeDeg * Math.PI) / 180) * 100)
      : null;

  return (
    <div className="grid gap-6 lg:grid-cols-[1.05fr_1fr]">
      {/* Left: input + map + signal toggles */}
      <div className="space-y-3">
        <form
          onSubmit={(e) => {
            e.preventDefault();
            onSubmitLocation();
          }}
          className="flex flex-col gap-2 sm:flex-row"
        >
          <label className="sr-only" htmlFor="zone-location">
            {t.detected}
          </label>
          <input
            id="zone-location"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder={t.placeholder}
            className="min-w-0 flex-1 rounded-sm border border-forest-500/20 bg-cream-50 px-3 py-2.5 text-base text-forest-900 placeholder:text-forest-500/40 focus:border-brass-500/60 focus:outline-none focus:ring-1 focus:ring-brass-500/40"
          />
          <button
            type="submit"
            disabled={status === "busy" || !input.trim()}
            className="shrink-0 rounded-sm bg-forest-500 px-5 py-2.5 text-base font-medium text-cream-100 transition hover:bg-forest-700 disabled:opacity-50"
          >
            {status === "busy" ? t.checking : t.check}
          </button>
        </form>

        <div className="relative h-[320px] overflow-hidden rounded-sm border border-forest-500/15 sm:h-[400px]">
          <ZoneMapPicker marker={marker} onPick={onMapPick} />
        </div>
        <p className="text-sm text-forest-500/60">{t.mapHint}</p>

        <fieldset className="mt-1 rounded-sm border border-forest-500/10 bg-cream-50 p-3">
          <legend className="px-1 text-xs font-medium uppercase tracking-[0.12em] text-forest-500/70">
            {t.signalsHeading}
          </legend>
          <div className="mt-1 grid gap-2 sm:grid-cols-2">
            {(
              [
                ["beachfront", t.beachfront],
                ["seaView", t.seaView],
                ["mountainView", t.mountainView],
              ] as [BoolSignal, string][]
            ).map(([key, label]) => (
              <label key={key} className="flex cursor-pointer items-start gap-2 text-sm text-forest-500/85">
                <input
                  type="checkbox"
                  checked={Boolean(signals[key])}
                  onChange={() => applySignals({ ...signals, [key]: !signals[key] })}
                  className="mt-0.5 h-4 w-4 shrink-0 accent-forest-500"
                />
                <span>{label}</span>
              </label>
            ))}
            <label className="flex cursor-pointer items-start gap-2 text-sm text-forest-500/85">
              <input
                type="checkbox"
                checked={signals.roadType === "Dirt"}
                onChange={() =>
                  applySignals({ ...signals, roadType: signals.roadType === "Dirt" ? undefined : "Dirt" })
                }
                className="mt-0.5 h-4 w-4 shrink-0 accent-forest-500"
              />
              <span>{t.dirtRoad}</span>
            </label>
          </div>
        </fieldset>
      </div>

      {/* Right: result */}
      <div className="lg:pl-2">
        {status === "idle" ? (
          <div className="flex h-full min-h-[200px] items-center justify-center rounded-sm border border-dashed border-forest-500/15 p-6 text-center text-sm text-forest-500/50">
            {t.idleHint}
          </div>
        ) : result && !result.ok ? (
          // Soft result (no city-plan coverage) reads as neutral info, not an
          // error; genuine failures keep the amber treatment.
          <div
            className={cn(
              "rounded-sm border p-4 text-base",
              result.soft
                ? "border-forest-500/15 bg-cream-50 text-forest-500/80"
                : "border-amber-600/25 bg-amber-50/70 text-amber-800 dark:bg-amber-500/10 dark:text-amber-200",
            )}
          >
            {result.error}
          </div>
        ) : result?.ok ? (
          <div className="space-y-5">
            <div className="flex flex-wrap items-center gap-3">
              {result.colorHex ? (
                <span
                  aria-hidden
                  className="inline-block h-7 w-7 shrink-0 rounded-sm border border-forest-500/20"
                  style={{ background: result.colorHex }}
                />
              ) : null}
              <div>
                <p className="text-xs font-medium uppercase tracking-[0.12em] text-forest-500/60">{t.detected}</p>
                <p className="font-serif text-xl leading-tight text-forest-900">
                  {result.zoneLabel ?? result.zone ?? "—"}
                </p>
              </div>
            </div>

            {/* Geographic drivers — sea read-only, elevation/slope/plot editable. */}
            <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
              <div className="rounded-sm border border-forest-500/10 bg-cream-50 px-3 py-2">
                <p className="text-[11px] uppercase tracking-wide text-forest-500/55">{t.geoSea}</p>
                <p className="num text-base text-forest-900">
                  {result.seaDistanceM != null ? `${result.seaDistanceM} ${t.metres}` : "—"}
                </p>
              </div>
              <label className="rounded-sm border border-forest-500/10 bg-cream-50 px-3 py-2">
                <span className="block text-[11px] uppercase tracking-wide text-forest-500/55">{t.geoElev}</span>
                <span className="flex items-baseline gap-1">
                  <input
                    type="number"
                    inputMode="numeric"
                    value={elevStr}
                    placeholder={result.elevationM != null ? String(result.elevationM) : ""}
                    onChange={(e) => setElevStr(e.target.value)}
                    onBlur={applyOverrides}
                    onKeyDown={(e) => e.key === "Enter" && applyOverrides()}
                    className="num w-full min-w-0 bg-transparent text-base text-forest-900 placeholder:text-forest-500/45 focus:outline-none"
                  />
                  <span className="text-xs text-forest-500/55">{t.aboveSea}</span>
                </span>
              </label>
              <label className="rounded-sm border border-forest-500/10 bg-cream-50 px-3 py-2">
                <span className="block text-[11px] uppercase tracking-wide text-forest-500/55">{t.geoSlope}</span>
                <span className="flex items-baseline gap-1">
                  <input
                    type="number"
                    inputMode="numeric"
                    value={slopeStr}
                    placeholder={result.slopeDeg != null ? String(result.slopeDeg) : ""}
                    onChange={(e) => setSlopeStr(e.target.value)}
                    onBlur={applyOverrides}
                    onKeyDown={(e) => e.key === "Enter" && applyOverrides()}
                    className="num w-full min-w-0 bg-transparent text-base text-forest-900 placeholder:text-forest-500/45 focus:outline-none"
                  />
                  <span className="text-xs text-forest-500/55">
                    {t.deg}
                    {slopePct != null ? ` ≈ ${slopePct}%` : ""}
                  </span>
                </span>
              </label>
              <label className="rounded-sm border border-forest-500/10 bg-cream-50 px-3 py-2">
                <span className="block text-[11px] uppercase tracking-wide text-forest-500/55">{t.geoPlot}</span>
                <span className="flex items-baseline gap-1">
                  <input
                    type="number"
                    inputMode="numeric"
                    value={plotStr}
                    placeholder="—"
                    onChange={(e) => setPlotStr(e.target.value)}
                    onBlur={applyOverrides}
                    onKeyDown={(e) => e.key === "Enter" && applyOverrides()}
                    className="num w-full min-w-0 bg-transparent text-base text-forest-900 placeholder:text-forest-500/45 focus:outline-none"
                  />
                  <select
                    value={plotUnit}
                    onChange={(e) => {
                      const unit = e.target.value as "sqm" | "rai";
                      setPlotUnit(unit);
                      rerun(signals, parseOverrides(elevStr, slopeStr, plotStr, unit));
                    }}
                    className="shrink-0 bg-transparent text-xs text-forest-500/55 focus:outline-none"
                  >
                    <option value="sqm">{t.unitSqm}</option>
                    <option value="rai">{t.unitRai}</option>
                  </select>
                </span>
              </label>
            </div>
            <p className="-mt-2 text-xs text-forest-500/50">{t.estimatedNote}</p>

            {/* PRECISE NORMS — the quantitative answer. */}
            {norms ? (
              norms.buildable ? (
                <div className="rounded-lg border border-forest-500/15 bg-forest-500/[0.03] p-4">
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
                  <p className="mt-3 text-xs leading-relaxed text-forest-500/50">{norms.source}</p>
                </div>
              ) : (
                <div className="rounded-lg border border-red-600/25 bg-red-50/70 p-4 dark:bg-red-500/10">
                  <p className="text-sm font-semibold text-red-800 dark:text-red-300">⛔ {t.notBuildable}</p>
                  <p className="mt-1 text-base leading-relaxed text-forest-500/85">{norms.noBuildReason}</p>
                  <p className="mt-3 text-xs leading-relaxed text-forest-500/50">{norms.source}</p>
                </div>
              )
            ) : null}

            {/* Qualitative zone use rules. */}
            {rules && rules.lines.length > 0 ? (
              <dl className="space-y-3">
                {rules.lines.map((line) => (
                  <div key={line.label} className="grid grid-cols-[7rem_1fr] gap-x-4 sm:grid-cols-[9rem_1fr]">
                    <dt className="text-sm font-medium text-forest-500/70">{line.label}</dt>
                    <dd className="text-base leading-relaxed text-forest-500/85">{line.text}</dd>
                  </div>
                ))}
              </dl>
            ) : !norms ? (
              <p className="text-base leading-relaxed text-forest-500/70">{t.noRules}</p>
            ) : null}

            {rules && rules.flags.length > 0 ? (
              <div className="rounded-lg border border-amber-600/20 bg-amber-50/60 p-4 dark:border-amber-500/25 dark:bg-amber-500/10">
                <p className="text-xs font-medium uppercase tracking-[0.15em] text-amber-700 dark:text-amber-300">
                  {t.checkBeforeBuild}
                </p>
                <ul className="mt-2 space-y-2">
                  {rules.flags.map((f) => (
                    <li key={f.text} className="flex gap-2 text-base leading-relaxed text-forest-500/85">
                      <span
                        aria-hidden
                        className={cn(
                          "mt-0.5 shrink-0",
                          f.level === "warn" ? "text-amber-600 dark:text-amber-400" : "text-forest-500/50",
                        )}
                      >
                        {f.level === "warn" ? "▲" : "▸"}
                      </span>
                      <span>{f.text}</span>
                    </li>
                  ))}
                </ul>
              </div>
            ) : null}

            <p className="text-sm leading-relaxed text-forest-500/60">
              {t.disclaimerLead}
              <Link
                href={t.ddHref as Route}
                className="underline decoration-brass-500/40 underline-offset-2 hover:text-forest-700"
              >
                {t.ddLink}
              </Link>
              {t.disclaimerTail}
            </p>
          </div>
        ) : (
          <div className="flex h-full min-h-[200px] items-center justify-center rounded-sm border border-dashed border-forest-500/15 p-6 text-center text-sm text-forest-500/50">
            {t.checking}
          </div>
        )}
      </div>
    </div>
  );
}
