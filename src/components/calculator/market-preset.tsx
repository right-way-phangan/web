"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import type { Route } from "next";
import { Sparkles, ArrowRight } from "lucide-react";
import { type RentalMarket, fmtThb } from "@/lib/data/rental-market";
import type { CalcDict } from "@/lib/i18n/calculator";
import { useLocale } from "@/lib/i18n/use-locale";

type Scenario = "conservative" | "base" | "high" | "measured";

const MM = {
  en: {
    context: "Market context",
    nightlyByDistrict: "Nightly rates by district",
    fullReport: "Full report",
    driver: (label: string, pct: number) => (
      <>
        Biggest price driver: <strong className="text-forest-900">{label}</strong> — a{" "}
        <strong className="text-forest-900">+{pct}%</strong> nightly premium.
      </>
    ),
    median: (n: number, date: string) =>
      `Median of ${n} Airbnb listings · ${date}. Occupancy is an assumption; see the full report for method.`,
  },
  ru: {
    context: "Контекст рынка",
    nightlyByDistrict: "Ставки за ночь по районам",
    fullReport: "Полный отчёт",
    driver: (label: string, pct: number) => (
      <>
        Главный драйвер цены: <strong className="text-forest-900">{label}</strong> — наценка{" "}
        <strong className="text-forest-900">+{pct}%</strong> к ставке за ночь.
      </>
    ),
    median: (n: number, date: string) =>
      `Медиана по ${n} объявлениям Airbnb · ${date}. Загрузка — допущение; метод — в полном отчёте.`,
  },
};

/**
 * In-calculator preset: pick a district (+ optional type / bedrooms) and pull
 * the nightly rate and occupancy straight from the rental-market snapshot, so
 * the rent projection starts from real comps instead of a guess. The user can
 * still override every field afterwards.
 *
 * Nightly estimate priority: district×bedroom median (most specific) → district
 * median scaled by the property-type factor → district median.
 */
export function MarketPreset({
  market,
  onApply,
  t,
}: {
  market: RentalMarket;
  onApply: (p: { nightlyRateThb: number; occupancyPct: number }) => void;
  t: CalcDict;
}) {
  const [district, setDistrict] = useState<string>("");
  const [type, setType] = useState<string>("");
  const [bedrooms, setBedrooms] = useState<string>("");
  const [scenario, setScenario] = useState<Scenario>("base");

  const estimate = useMemo(() => {
    const d = market.districts.find((x) => x.name === district);
    if (!d) return null;
    let nightly = d.adrMedian;
    let basis = "district median";

    const br = bedrooms === "" ? null : Number(bedrooms);
    const db =
      br != null && market.districtBedrooms.find((x) => x.district === district && x.bedrooms === br);
    if (db) {
      nightly = db.adrMedian;
      basis = `${br === 0 ? "studio" : `${br}-bedroom`} comps in ${district}`;
    } else if (type) {
      const t = market.byType.find((x) => x.type === type);
      if (t && market.meta.adrMedianAll) {
        nightly = Math.round(d.adrMedian * (t.adrMedian / market.meta.adrMedianAll));
        basis = `${t.label.toLowerCase()} in ${district}`;
      }
    }
    const measuredOk = d.occupancyMeasured != null && (d.nOccupancy ?? 0) >= 5;
    const occupancyPct =
      scenario === "measured" && measuredOk
        ? Math.round((d.occupancyMeasured as number) * 100)
        : Math.round(market.meta.occupancy[scenario === "measured" ? "base" : scenario] * 100);
    return { nightlyRateThb: nightly, occupancyPct, basis, n: d.n, measuredOk };
  }, [market, district, type, bedrooms, scenario]);

  return (
    <div className="space-y-3 rounded-sm border border-brass-500/25 bg-brass-500/[0.05] p-4">
      <div className="flex items-center justify-between">
        <p className="inline-flex items-center gap-1.5 text-[11px] font-medium uppercase tracking-wide text-brass-600">
          <Sparkles className="h-3.5 w-3.5" />
          {t.fillFromMarket}
        </p>
        <Link
          href={"/insights" as Route}
          className="text-[11px] text-forest-500/60 underline-offset-2 hover:text-brass-500 hover:underline"
        >
          {t.seeFullReport}
        </Link>
      </div>

      <div className="grid grid-cols-1 gap-2.5 sm:grid-cols-3">
        <Select label={t.mpDistrict} value={district} onChange={setDistrict} placeholder={t.mpChoose}>
          {market.districts.map((d) => (
            <option key={d.name} value={d.name}>
              {d.name}
            </option>
          ))}
        </Select>
        <Select label={t.mpType} value={type} onChange={setType} placeholder={t.mpAny}>
          {market.byType
            .filter((x) => x.n >= 3)
            .map((x) => (
              <option key={x.type} value={x.type}>
                {x.label}
              </option>
            ))}
        </Select>
        <Select label={t.mpBedrooms} value={bedrooms} onChange={setBedrooms} placeholder={t.mpAny}>
          {market.byBedrooms
            .slice()
            .sort((a, b) => a.bedrooms - b.bedrooms)
            .map((b) => (
              <option key={b.bedrooms} value={String(b.bedrooms)}>
                {b.bedrooms === 0 ? t.mpStudio : `${b.bedrooms} BR`}
              </option>
            ))}
        </Select>
      </div>

      {/* Occupancy scenario */}
      <div className="flex flex-wrap items-center gap-2 text-[11px]">
        <span className="text-forest-500/60">{t.mpOccupancy}</span>
        {estimate?.measuredOk ? (
          <button
            type="button"
            onClick={() => setScenario("measured")}
            className={`rounded-full px-2.5 py-0.5 transition-colors ${
              scenario === "measured"
                ? "bg-forest-500 text-cream-50"
                : "bg-forest-500/8 text-forest-500/70 hover:bg-forest-500/15"
            }`}
            title="From this district's forward availability"
          >
            {t.mpMeasured}{" "}
            {Math.round(
              (market.districts.find((x) => x.name === district)?.occupancyMeasured ?? 0) * 100,
            )}
            %
          </button>
        ) : null}
        {(["conservative", "base", "high"] as const).map((s) => (
          <button
            key={s}
            type="button"
            onClick={() => setScenario(s)}
            className={`rounded-full px-2.5 py-0.5 capitalize transition-colors ${
              scenario === s
                ? "bg-brass-500 text-cream-50"
                : "bg-forest-500/8 text-forest-500/70 hover:bg-forest-500/15"
            }`}
          >
            {s} {Math.round(market.meta.occupancy[s] * 100)}%
          </button>
        ))}
      </div>

      {estimate ? (
        <div className="flex flex-wrap items-center justify-between gap-2 rounded-sm bg-cream-50 px-3 py-2.5">
          <div className="text-sm">
            <span className="font-semibold tabular-nums text-forest-900">
              {fmtThb(estimate.nightlyRateThb)}{t.mpPerNight}
            </span>
            <span className="text-forest-500/60"> · {estimate.occupancyPct}% {t.occupancy.replace(" (%)", "").toLowerCase()}</span>
            <div className="text-[11px] text-forest-500/55">
              {t.mpFrom(estimate.basis, estimate.n)}
            </div>
          </div>
          <button
            type="button"
            onClick={() =>
              onApply({
                nightlyRateThb: estimate.nightlyRateThb,
                occupancyPct: estimate.occupancyPct,
              })
            }
            className="inline-flex items-center gap-1.5 rounded-sm bg-forest-500 px-3 py-1.5 text-xs font-medium text-cream-50 transition-colors hover:bg-forest-900"
          >
            {t.mpApply}
            <ArrowRight className="h-3.5 w-3.5" />
          </button>
        </div>
      ) : (
        <p className="text-[11px] text-forest-500/50">
          {t.mpPickDistrict}
        </p>
      )}
    </div>
  );
}

function Select({
  label,
  value,
  onChange,
  placeholder,
  children,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  placeholder: string;
  children: React.ReactNode;
}) {
  return (
    <label className="block">
      <span className="mb-1 block text-[11px] font-medium text-forest-500/70">{label}</span>
      <select
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="w-full rounded-sm border border-forest-500/20 bg-cream-50 px-2.5 py-1.5 text-sm text-forest-900 outline-none focus:border-brass-500"
      >
        <option value="">{placeholder}</option>
        {children}
      </select>
    </label>
  );
}

/**
 * Compact market summary shown beneath the calculator — top districts by nightly
 * rate + the feature that moves price most, with a link to the full /insights.
 */
export function MarketMiniBlock({ market }: { market: RentalMarket }) {
  const t = MM[useLocale()];
  const top = market.districts.slice(0, 5);
  const max = Math.max(...top.map((d) => d.adrMedian), 1);
  const topFeature = [...market.featurePremiums]
    .filter((f) => f.premiumPct != null)
    .sort((a, b) => (b.premiumPct ?? 0) - (a.premiumPct ?? 0))[0];

  return (
    <div className="rounded-sm border border-forest-500/10 bg-cream-50 p-6 md:p-7">
      <div className="flex items-start justify-between gap-4">
        <div>
          <p className="text-xs font-medium uppercase tracking-[0.2em] text-brass-500">
            {t.context}
          </p>
          <h3 className="mt-2 font-serif text-xl text-forest-900">{t.nightlyByDistrict}</h3>
        </div>
        <Link
          href={"/insights" as Route}
          className="inline-flex shrink-0 items-center gap-1.5 text-sm font-medium text-forest-500 hover:text-brass-500"
        >
          {t.fullReport}
          <ArrowRight className="h-3.5 w-3.5" />
        </Link>
      </div>

      <div className="mt-5 space-y-2.5">
        {top.map((d) => {
          const pct = Math.max(6, Math.round((d.adrMedian / max) * 100));
          return (
            <div key={d.name} className="grid grid-cols-[8rem_1fr_auto] items-center gap-3">
              <span className="truncate text-sm text-forest-900">{d.name}</span>
              <div className="h-2 overflow-hidden rounded-full bg-forest-500/8">
                <div className="h-full rounded-full bg-forest-500/70" style={{ width: `${pct}%` }} />
              </div>
              <span className="w-16 text-right text-sm font-semibold tabular-nums text-forest-900">
                {fmtThb(d.adrMedian)}
              </span>
            </div>
          );
        })}
      </div>

      {topFeature ? (
        <p className="mt-4 text-sm text-forest-500/75">
          {t.driver(topFeature.label, topFeature.premiumPct ?? 0)}
        </p>
      ) : null}
      <p className="mt-1 text-[11px] text-forest-500/50">
        {t.median(market.meta.sample, market.meta.date)}
      </p>
    </div>
  );
}
