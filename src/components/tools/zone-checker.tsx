"use client";

import { useCallback, useState } from "react";
import dynamic from "next/dynamic";
import Link from "next/link";
import type { Route } from "next";
import { lookupZoneRules, type ZoneRulesLookupResult } from "@/lib/actions/zone-rules-lookup";
import type { ZoneSignals, RuleLocale } from "@/lib/data/zone-rules";
import { cn } from "@/lib/utils/cn";

/**
 * Standalone "paste a location → building rules" checker. Shared by the admin
 * tool (/admin/zoning) and the public page (/tools/zoning); the locale prop
 * switches copy and the DD link target. Pure wrapper over the lookupZoneRules
 * server action — no data of its own. Always indicative, links to DD.
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
    disclaimerLead:
      "Indicative, read from the Phangan city-plan colour (May 2025). The exact height, footprint, setbacks and permitted use for a plot are verified in our ",
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
    disclaimerLead:
      "Индикативно, по цвету городского плана Пангана (май 2025). Точные высота, пятно застройки, отступы и разрешённое использование для конкретного участка проверяются в нашем ",
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

  // Single lookup path — text input, map click and signal toggles all funnel
  // through here so the result always matches the current point + signals.
  const run = useCallback(
    async (location: string, sig: ZoneSignals) => {
      const loc = location.trim();
      if (!loc) return;
      setStatus("busy");
      const r = await lookupZoneRules(loc, locale, sig);
      setResult(r);
      if (r.ok && r.lat != null && r.lng != null) setMarker({ lat: r.lat, lng: r.lng });
      setStatus("done");
    },
    [locale],
  );

  function onMapPick(lat: number, lng: number) {
    const loc = `${lat.toFixed(6)}, ${lng.toFixed(6)}`;
    setInput(loc);
    setMarker({ lat, lng });
    void run(loc, signals);
  }

  // Apply changed signals and re-run against the current point so the warnings
  // update live (no need to press the button again).
  function applySignals(next: ZoneSignals) {
    setSignals(next);
    const loc = marker ? `${marker.lat}, ${marker.lng}` : input;
    if (loc.trim()) void run(loc, next);
  }

  const rules = result?.ok ? result.rules : null;

  return (
    <div className="grid gap-6 lg:grid-cols-[1.05fr_1fr]">
      {/* Left: input + map + signal toggles */}
      <div className="space-y-3">
        <form
          onSubmit={(e) => {
            e.preventDefault();
            void run(input, signals);
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
          <div className="rounded-sm border border-amber-600/25 bg-amber-50/70 p-4 text-base text-amber-800 dark:bg-amber-500/10 dark:text-amber-200">
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

            {result.lat != null && result.lng != null ? (
              <p className="num text-sm text-forest-500/55">
                {t.coords}: {result.lat.toFixed(5)}, {result.lng.toFixed(5)}
              </p>
            ) : null}

            {rules && rules.lines.length > 0 ? (
              <dl className="space-y-3">
                {rules.lines.map((line) => (
                  <div key={line.label} className="grid grid-cols-[7rem_1fr] gap-x-4 sm:grid-cols-[9rem_1fr]">
                    <dt className="text-sm font-medium text-forest-500/70">{line.label}</dt>
                    <dd className="text-base leading-relaxed text-forest-500/85">{line.text}</dd>
                  </div>
                ))}
              </dl>
            ) : (
              <p className="text-base leading-relaxed text-forest-500/70">{t.noRules}</p>
            )}

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
