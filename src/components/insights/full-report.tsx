"use client";

import { useState } from "react";
import Link from "next/link";
import type { Route } from "next";
import { TrendingUp, Waves, BedDouble, Home, ArrowRight } from "lucide-react";
import { useLocale, localeHref } from "@/lib/i18n/use-locale";
import {
  type RentalMarket,
  type RmSeasonal,
  type RmSeasonality,
  type MoneyFmt,
  effectiveAnnualThb,
  measuredOccupancy,
  confidenceOf,
} from "@/lib/data/rental-market";
import { INS, type DistrictSort } from "./insights-i18n";
import { SubHead, BarRow } from "./ins-shared";

/**
 * The gated full rental report — every district, property type, bedroom count,
 * feature premium, the district×bedroom heatmap, demand seasonality and the ADR
 * trend. Split out of rental-insights.tsx (2026-07-15). Methodology is rendered
 * by the parent OUTSIDE the blur (transparency should never be gated).
 */
export function FullReport({ data, fmt }: { data: RentalMarket; fmt: MoneyFmt }) {
  const t = INS[useLocale()];
  const { meta } = data;
  const [sort, setSort] = useState<DistrictSort>("adr");
  const maxAdr = Math.max(...data.districts.map((d) => d.adrMedian), 1);
  const maxType = Math.max(...data.byType.map((ty) => ty.adrMedian), 1);
  const maxPremium = Math.max(...data.featurePremiums.map((f) => f.premiumPct ?? 0), 1);
  const bedrooms = [...data.byBedrooms].sort((a, b) => a.bedrooms - b.bedrooms);
  const maxBed = Math.max(...bedrooms.map((b) => b.adrMedian), 1);

  const topPick = data.districts[0]?.name;
  const hasYield = data.districts.some((d) => d.yieldOnLandPct != null);
  const sortedDistricts = [...data.districts].sort((a, b) => {
    if (sort === "annual") return (b.annual.base ?? 0) - (a.annual.base ?? 0);
    if (sort === "yield") return (b.yieldOnLandPct ?? 0) - (a.yieldOnLandPct ?? 0);
    if (sort === "sample") return b.n - a.n;
    if (sort === "name") return a.name.localeCompare(b.name);
    return b.adrMedian - a.adrMedian;
  });

  return (
    <>
      {/* All districts */}
      <div>
        <div className="flex flex-wrap items-center justify-between gap-3">
          <SubHead title={t.subAllDistricts} />
          <div className="inline-flex flex-wrap gap-1 text-[11px]">
            {(Object.keys(t.sortLabels) as DistrictSort[])
              .filter((k) => k !== "yield" || hasYield)
              .map((k) => (
                <button
                  key={k}
                  type="button"
                  onClick={() => setSort(k)}
                  className={`rounded-full px-2.5 py-0.5 transition-colors ${
                    sort === k
                      ? "bg-panel text-panel-fg"
                      : "bg-forest-500/8 text-forest-500/70 hover:bg-forest-500/15"
                  }`}
                >
                  {t.sortLabels[k]}
                </button>
              ))}
          </div>
        </div>
        <div className="mt-5 space-y-2.5">
          {sortedDistricts.map((d) => (
            <BarRow
              key={d.name}
              label={d.name}
              slug={d.slug}
              value={d.adrMedian}
              max={maxAdr}
              right={fmt(d.adrMedian)}
              band={d.adrP25 != null && d.adrP75 != null ? { p25: d.adrP25, p75: d.adrP75 } : null}
              sub={
                t.districtSub(
                  d.n,
                  d.adrP25 && d.adrP75 ? `${fmt(d.adrP25)}–${fmt(d.adrP75)}` : null,
                  fmt(effectiveAnnualThb(d, meta), true),
                  measuredOccupancy(d, meta) != null
                    ? Math.round((measuredOccupancy(d, meta) as number) * 100)
                    : null,
                ) + (sort === "yield" && d.yieldOnLandPct != null ? t.yieldSuffix(d.yieldOnLandPct) : "")
              }
              badge={d.name === topPick ? t.topPick : undefined}
              highlight={d.name === topPick}
              confidence={confidenceOf(d.n)}
              tag={
                d.supplyTag === "under"
                  ? { label: t.supplyUnder, tone: "good" }
                  : d.supplyTag === "saturated"
                    ? { label: t.supplySaturated, tone: "warn" }
                    : undefined
              }
            />
          ))}
        </div>
        {hasYield ? <p className="mt-3 text-[11px] text-forest-500/55">{t.yieldNote}</p> : null}
      </div>

      {/* By property type */}
      <div>
        <SubHead title={t.subByType} icon={<Home className="h-4 w-4" />} />
        <div className="mt-5 space-y-2.5">
          {data.byType
            .filter((ty) => ty.n >= 2)
            .map((ty) => (
              <BarRow
                key={ty.type}
                label={ty.label}
                value={ty.adrMedian}
                max={maxType}
                right={fmt(ty.adrMedian)}
                sub={t.typeSub(ty.n, ty.ratingMedian ?? null)}
              />
            ))}
        </div>
      </div>

      {/* By bedrooms */}
      {bedrooms.length > 0 ? (
        <div>
          <SubHead title={t.subByBedroom} icon={<BedDouble className="h-4 w-4" />} />
          <div className="mt-5 space-y-2.5">
            {bedrooms.map((b) => (
              <BarRow
                key={b.bedrooms}
                label={t.bedroomLabel(b.bedrooms)}
                value={b.adrMedian}
                max={maxBed}
                right={fmt(b.adrMedian)}
                sub={t.nListings(b.n)}
              />
            ))}
          </div>
          <p className="mt-3 text-xs text-forest-500/60">{t.bedroomNote}</p>
        </div>
      ) : null}

      {/* Feature premiums */}
      <div>
        <SubHead title={t.subWhatRaises} icon={<Waves className="h-4 w-4" />} />
        <div className="mt-5 space-y-2.5">
          {data.featurePremiums
            .filter((f) => f.premiumPct != null)
            .sort((a, b) => (b.premiumPct ?? 0) - (a.premiumPct ?? 0))
            .map((f) => (
              <BarRow
                key={f.key}
                label={f.label}
                value={f.premiumPct ?? 0}
                max={maxPremium}
                right={`+${f.premiumPct}%`}
                sub={t.featureSub(fmt(f.adrWith), fmt(f.adrWithout), f.nWith, f.nWithout)}
                tone="brass"
              />
            ))}
        </div>
      </div>

      {/* District × bedrooms heatmap */}
      <DistrictBedroomHeatmap data={data} fmt={fmt} />

      {/* Demand seasonality (Google Trends) — available immediately */}
      {data.seasonality && data.seasonality.index.some((v) => v != null) ? (
        <DemandSeasonality seasonality={data.seasonality} />
      ) : null}

      {/* Seasonality (ADR over own snapshots) */}
      <Seasonality seasonal={data.seasonal} fmt={fmt} />

      {/* CapEx — land price per m² (own basis + market asking) */}
      {data.capex.pricePerSqmMedian ? (
        <p className="text-sm text-forest-500/80">
          {t.capexText(data.capex.source ?? "", fmt(data.capex.pricePerSqmMedian), data.capex.nSale)}
          {data.capex.market?.pricePerSqmMedian
            ? t.capexMarket(
                fmt(data.capex.market.pricePerSqmMedian),
                data.capex.market.n,
                data.capex.pricePerSqmMedian
                  ? `${(data.capex.market.pricePerSqmMedian / data.capex.pricePerSqmMedian).toFixed(1)}×`
                  : null,
              )
            : null}
        </p>
      ) : null}

      {/* CTA into the calculator */}
      <CalculatorCta />
    </>
  );
}

/**
 * District × bedroom-count nightly-rate matrix. Replaces the old flat table:
 * a CSS-grid heatmap where each cell is tinted by ADR (accent color-mix). Text
 * flips to always-light `panel-fg` on strong cells and theme-aware `forest-900`
 * on faint ones so contrast holds in both light and dark themes. Empty combos
 * (n<2) render blank. Horizontally scrollable; the district column stays put.
 */
function DistrictBedroomHeatmap({ data, fmt }: { data: RentalMarket; fmt: MoneyFmt }) {
  const t = INS[useLocale()];
  const rows = data.districtBedrooms;
  if (rows.length === 0) return null;

  // Columns: distinct bedroom counts present, sorted (studio → up).
  const cols = Array.from(new Set(rows.map((r) => r.bedrooms))).sort((a, b) => a - b);
  // Rows: districts in island-ADR rank order that have ≥1 cell.
  const withData = new Set(rows.map((r) => r.district));
  const districts = data.districts.map((d) => d.name).filter((n) => withData.has(n));
  const cell = new Map(rows.map((r) => [`${r.district}|${r.bedrooms}`, r]));

  const values = rows.map((r) => r.adrMedian);
  const min = Math.min(...values);
  const max = Math.max(...values, min + 1);
  const intensity = (v: number) => (v - min) / (max - min); // 0..1

  const gridCols = `minmax(6.5rem,9rem) repeat(${cols.length}, minmax(3.5rem,1fr))`;

  return (
    <div>
      <SubHead title={t.subDistrictBedroom} />
      <div className="mt-5 overflow-x-auto rounded-sm border border-forest-500/10 bg-cream-50 p-3">
        <div className="min-w-[30rem]">
          {/* header */}
          <div className="grid gap-1" style={{ gridTemplateColumns: gridCols }}>
            <div className="text-[11px] font-medium uppercase tracking-wide text-forest-500/55">
              {t.thDistrict}
            </div>
            {cols.map((c) => (
              <div
                key={c}
                className="text-center text-[11px] font-medium text-forest-500/70"
                title={t.bedroomLabel(c)}
              >
                {t.brShort(c)}
              </div>
            ))}
          </div>
          {/* rows */}
          <div className="mt-1 space-y-1">
            {districts.map((name) => (
              <div key={name} className="grid gap-1" style={{ gridTemplateColumns: gridCols }}>
                <div className="flex items-center truncate text-xs font-medium text-forest-900">
                  {name}
                </div>
                {cols.map((c) => {
                  const r = cell.get(`${name}|${c}`);
                  if (!r) {
                    return (
                      <div
                        key={c}
                        aria-hidden
                        className="rounded-sm border border-forest-500/[0.06]"
                      />
                    );
                  }
                  const ti = intensity(r.adrMedian);
                  const strong = ti > 0.5;
                  return (
                    <div
                      key={c}
                      title={`${name} · ${t.bedroomLabel(c)} · ${fmt(r.adrMedian)} · ${t.nListings(r.n)}`}
                      className={`rounded-sm px-1 py-1.5 text-center text-[11px] font-semibold tabular-nums ${
                        strong ? "text-panel-fg" : "text-forest-900"
                      }`}
                      style={{
                        backgroundColor: `color-mix(in oklab, var(--chart-accent) ${Math.round(
                          12 + ti * 73,
                        )}%, transparent)`,
                      }}
                    >
                      {fmt(r.adrMedian, true)}
                    </div>
                  );
                })}
              </div>
            ))}
          </div>
        </div>
      </div>
      <div className="mt-2 flex flex-wrap items-center gap-x-3 gap-y-1 text-[11px] text-forest-500/55">
        <span>{t.heatmapNote}</span>
        <span className="inline-flex items-center gap-1.5">
          {t.heatmapLegendLow}
          <span className="inline-flex overflow-hidden rounded-sm">
            {[0.15, 0.4, 0.65, 0.9].map((s) => (
              <span
                key={s}
                className="h-3 w-4"
                style={{
                  backgroundColor: `color-mix(in oklab, var(--chart-accent) ${Math.round(12 + s * 73)}%, transparent)`,
                }}
              />
            ))}
          </span>
          {t.heatmapLegendHigh}
        </span>
      </div>
    </div>
  );
}

export function CalculatorCta() {
  const locale = useLocale();
  const t = INS[locale];
  return (
    <div className="rounded-sm border border-forest-500/15 bg-panel p-7 text-panel-fg md:p-9">
      <h3 className="font-serif text-2xl text-panel-fg">{t.ctaTitle}</h3>
      <p className="mt-2 max-w-xl text-panel-fg/80">{t.ctaBody}</p>
      <Link
        href={localeHref(locale, "/calculator?mode=rent") as Route}
        className="mt-5 inline-flex items-center gap-2 rounded-sm bg-brass-400 px-5 py-2.5 text-sm font-medium text-forest-900 transition-colors hover:bg-brass-300"
      >
        {t.ctaButton}
        <ArrowRight className="h-4 w-4" />
      </Link>
    </div>
  );
}

/**
 * Google-Trends demand-by-month bars. Peak and low months are tinted; each bar
 * carries its "% vs the annual average" so the seasonal swing is quantified, not
 * just shaped.
 */
function DemandSeasonality({ seasonality }: { seasonality: RmSeasonality }) {
  const t = INS[useLocale()];
  const vals = seasonality.index.filter((v): v is number => v != null);
  const avg = vals.length ? vals.reduce((s, v) => s + v, 0) / vals.length : 0;
  const peakI = seasonality.index.indexOf(Math.max(...vals));
  const lowI = seasonality.index.indexOf(Math.min(...vals));
  return (
    <div>
      <div className="mb-1">
        <p className="inline-flex items-center gap-1.5 text-[0.8125rem] font-medium uppercase tracking-eyebrow text-brass-500">
          <TrendingUp className="h-4 w-4" />
          {t.demandEyebrow}
        </p>
        <h3 className="mt-2 font-serif text-xl text-forest-900">{t.demandTitle}</h3>
        <p className="mt-1 max-w-2xl text-sm text-forest-500/75">{t.demandNote}</p>
      </div>
      <div className="mt-5 rounded-sm border border-forest-500/10 bg-cream-50 p-5">
        <div className="flex items-end gap-1.5 sm:gap-2.5" style={{ height: 150 }}>
          {seasonality.index.map((v, i) => {
            const h = v == null ? 0 : Math.max(6, Math.round((v / 100) * 116));
            const isPeak = i === peakI;
            const isLow = i === lowI;
            const vsAvg = v != null && avg ? Math.round(((v - avg) / avg) * 100) : null;
            return (
              <div key={i} className="flex min-w-0 flex-1 flex-col items-center justify-end gap-1.5">
                {/* per-bar "+X% vs avg" forces min-width — hide on mobile (12 bars
                    won't fit ≤360px), keep on ≥sm; the peak/low line below carries
                    the signal on small screens. */}
                <span
                  className={`hidden whitespace-nowrap text-[9px] tabular-nums sm:block ${isPeak ? "font-semibold text-brass-600" : "text-forest-500/45"}`}
                  title={vsAvg != null ? t.demandVsAvg(vsAvg) : undefined}
                >
                  {vsAvg == null ? "" : t.demandVsAvg(vsAvg)}
                </span>
                <div
                  className={`w-full rounded-t-sm ${
                    isPeak ? "bg-brass-500" : isLow ? "bg-forest-500/25" : "bg-forest-500/40"
                  }`}
                  style={{ height: h }}
                />
                <span
                  className={`text-[10px] ${
                    isPeak || isLow ? "font-semibold text-forest-900" : "text-forest-500/55"
                  }`}
                >
                  {seasonality.months[i]?.slice(0, 3)}
                </span>
              </div>
            );
          })}
        </div>
        <div className="mt-4 flex flex-wrap items-center justify-between gap-2 text-xs text-forest-500/70">
          <span>{t.demandPeakLow(seasonality.peakMonth, seasonality.lowMonth)}</span>
          <span className="text-forest-500/45">
            {t.demandSource(seasonality.source, seasonality.asOf)}
          </span>
        </div>
      </div>
    </div>
  );
}

// CSS vars (globals.css) so the lines stay readable in the dark theme — the
// raw forest hexes would vanish on graphite. Light = brand hexes.
const SEASON_COLORS = ["var(--season-1)", "var(--season-2)", "var(--season-3)", "var(--season-4)"];

function Seasonality({ seasonal, fmt }: { seasonal: RmSeasonal; fmt: MoneyFmt }) {
  const t = INS[useLocale()];
  if (!seasonal || seasonal.points < 2) {
    return (
      <div>
        <SubHead title={t.seasonalTrend} />
        <p className="mt-3 rounded-sm border border-forest-500/10 bg-cream-200/30 p-4 text-sm text-forest-500/75">
          {t.collecting(seasonal?.points ?? 0)}
        </p>
      </div>
    );
  }

  // Series: island overall + up to 3 districts. Scale to combined min/max.
  const series: { name: string; values: (number | null)[]; color: string }[] = [
    { name: t.island, values: seasonal.overall, color: SEASON_COLORS[0] },
  ];
  Object.entries(seasonal.districts)
    .slice(0, 3)
    .forEach(([name, values], i) => series.push({ name, values, color: SEASON_COLORS[i + 1] }));

  const all = series.flatMap((s) => s.values).filter((v): v is number => v != null);
  const min = Math.min(...all);
  const max = Math.max(...all);
  const W = 640;
  const H = 200;
  const padX = 8;
  const padY = 16;
  const n = seasonal.dates.length;
  const x = (i: number) => padX + (i * (W - 2 * padX)) / Math.max(1, n - 1);
  const y = (v: number) => H - padY - ((v - min) / Math.max(1, max - min)) * (H - 2 * padY);

  return (
    <div>
      <SubHead title={t.seasonalOverTime} />
      <div className="mt-5 overflow-x-auto rounded-sm border border-forest-500/10 bg-cream-50 p-4">
        <svg viewBox={`0 0 ${W} ${H}`} className="h-48 w-full min-w-[28rem]" role="img">
          {series.map((s) => {
            const pts = s.values
              .map((v, i) => (v == null ? null : `${x(i)},${y(v)}`))
              .filter(Boolean)
              .join(" ");
            return (
              <polyline
                key={s.name}
                points={pts}
                fill="none"
                style={{ stroke: s.color }}
                strokeWidth={2}
                strokeLinejoin="round"
              />
            );
          })}
        </svg>
      </div>
      <div className="mt-3 flex flex-wrap gap-x-4 gap-y-1.5 text-xs">
        {series.map((s) => {
          const last = [...s.values].reverse().find((v) => v != null) ?? null;
          return (
            <span key={s.name} className="inline-flex items-center gap-1.5 text-forest-500/75">
              <span className="h-2 w-3 rounded-sm" style={{ backgroundColor: s.color }} />
              {s.name} {last != null ? fmt(last) : ""}
            </span>
          );
        })}
        <span className="text-forest-500/45">
          {seasonal.dates[0]} → {seasonal.dates[seasonal.dates.length - 1]}
        </span>
      </div>
      <p className="mt-3 text-[11px] text-forest-500/45">{t.seasonalMeasured(seasonal.points)}</p>
    </div>
  );
}

export function Methodology({ meta }: { meta: RentalMarket["meta"] }) {
  const t = INS[useLocale()];
  return (
    <details className="rounded-sm border border-forest-500/10 bg-cream-200/30 p-5 text-sm text-forest-500/80">
      <summary className="cursor-pointer font-medium text-forest-500">{t.methodSummary}</summary>
      <ul className="mt-3 list-disc space-y-1.5 pl-5">
        {t.methodBullets(meta).map((b, i) => (
          <li key={i}>{b}</li>
        ))}
      </ul>
    </details>
  );
}
