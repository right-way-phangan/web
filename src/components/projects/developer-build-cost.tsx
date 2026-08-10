"use client";

import { useState } from "react";
import Link from "next/link";
import type { Route } from "next";
import { ArrowRight } from "lucide-react";
import { cn } from "@/lib/utils/cn";
import type { Locale } from "@/lib/i18n/dictionaries";
import { getProjectsDict } from "@/lib/i18n/dictionaries";
import { formatMoney, DEFAULT_RATES } from "@/lib/calculator/currency";
import {
  BUILD_BANDS,
  BUILD_MONTHS,
  FEES_PCT,
  PERMIT_MONTHS,
  estimateBuildCost,
  type BuildBandKey,
} from "@/lib/data/build-cost";

/**
 * Прикидка «сколько стоит построить» прямо на странице застройщика: площадь,
 * класс отделки, бассейн, гонорары — и вилка бюджета со сроком. Считает по
 * опубликованным рыночным бэндам ([[build-cost]]), а не по смете застройщика:
 * в его смете видна маржа, наружу она не идёт. Землю сознательно не считаем —
 * это делает полная проформа на /calculator, дублировать её здесь незачем.
 */
export function DeveloperBuildCost({
  presetAreas,
  articleHref,
  calcHref,
  locale,
}: {
  presetAreas: number[];
  articleHref: string;
  calcHref: string;
  locale: Locale;
}) {
  const labels = getProjectsDict(locale).developers.build;
  const [area, setArea] = useState(presetAreas[0] ?? 120);
  const [bandKey, setBandKey] = useState<BuildBandKey>("mid");
  const [pool, setPool] = useState(true);
  const [fees, setFees] = useState(true);

  const band = BUILD_BANDS.find((b) => b.key === bandKey) ?? BUILD_BANDS[1];
  const est = estimateBuildCost({ areaSqm: area, band, pool, fees });
  const money = (v: number) => formatMoney(v, "THB", DEFAULT_RATES, { compact: true });
  const perSqmLow = area > 0 ? Math.round(est.low / area) : 0;
  const perSqmHigh = area > 0 ? Math.round(est.high / area) : 0;

  return (
    <div className="rounded-sm border border-forest-500/15 bg-cream-50 p-6 md:p-8">
      <div className="grid gap-8 lg:grid-cols-[minmax(0,1fr)_minmax(0,20rem)]">
        {/* Входы */}
        <div className="space-y-6">
          <div>
            <label
              htmlFor="build-area"
              className="block text-sm font-medium text-forest-900"
            >
              {labels.areaLabel}
            </label>
            <div className="mt-2 flex flex-wrap items-center gap-2">
              <div className="relative">
                <input
                  id="build-area"
                  type="number"
                  inputMode="numeric"
                  min={30}
                  max={800}
                  step={5}
                  value={area}
                  onChange={(e) => setArea(Math.max(0, Number(e.target.value) || 0))}
                  className="num w-32 rounded-sm border border-forest-500/20 bg-transparent px-3 py-2 pr-12 text-forest-900 outline-none focus-visible:ring-2 focus-visible:ring-brass-500/60"
                />
                <span className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-sm text-forest-500/60">
                  {labels.areaUnit}
                </span>
              </div>
              {presetAreas.map((a) => (
                <button
                  key={a}
                  type="button"
                  onClick={() => setArea(a)}
                  className={cn(
                    "num rounded-sm px-3 py-2 text-sm transition-colors",
                    area === a
                      ? "bg-forest-900 text-cream-50"
                      : "bg-forest-900/[0.06] text-forest-600 hover:bg-forest-900/10",
                  )}
                >
                  {a}
                </button>
              ))}
            </div>
          </div>

          <fieldset>
            <legend className="text-sm font-medium text-forest-900">
              {labels.finishLabel}
            </legend>
            <div className="mt-2 grid gap-2 sm:grid-cols-3">
              {BUILD_BANDS.map((b) => {
                const on = b.key === bandKey;
                return (
                  <button
                    key={b.key}
                    type="button"
                    onClick={() => setBandKey(b.key)}
                    aria-pressed={on}
                    className={cn(
                      "rounded-sm border px-3 py-3 text-left transition-colors",
                      on
                        ? "border-brass-500/50 bg-brass-500/10"
                        : "border-forest-500/15 hover:border-forest-500/30",
                    )}
                  >
                    <span className="block text-sm font-medium text-forest-900">
                      {labels.bands[b.key].name}
                    </span>
                    <span className="num mt-0.5 block text-xs text-forest-500/70">
                      {(b.low / 1000).toFixed(0)}–{(b.high / 1000).toFixed(0)}
                      {b.openEnded ? "+" : ""} k ฿/{labels.areaUnit}
                    </span>
                    <span className="mt-1 block text-xs text-forest-500/60">
                      {labels.bands[b.key].hint}
                    </span>
                  </button>
                );
              })}
            </div>
          </fieldset>

          <div className="flex flex-wrap gap-2">
            {[
              { on: pool, set: setPool, label: labels.poolLabel },
              { on: fees, set: setFees, label: labels.feesLabel },
            ].map((t) => (
              <button
                key={t.label}
                type="button"
                onClick={() => t.set(!t.on)}
                aria-pressed={t.on}
                className={cn(
                  "rounded-sm px-3 py-2 text-sm transition-colors",
                  t.on
                    ? "bg-forest-900 text-cream-50"
                    : "bg-forest-900/[0.06] text-forest-600 hover:bg-forest-900/10",
                )}
              >
                {t.label}
              </button>
            ))}
          </div>
          <p className="text-xs text-forest-500/60">
            {labels.feesHint.replace(
              "{pct}",
              `${Math.round(FEES_PCT.low * 100)}–${Math.round(FEES_PCT.high * 100)}%`,
            )}
          </p>
        </div>

        {/* Результат */}
        <div className="rounded-sm bg-forest-900/[0.04] p-5">
          <div className="text-xs font-medium uppercase tracking-eyebrow text-brass-500">
            {labels.budget}
          </div>
          <div className="num mt-2 text-2xl text-forest-900 md:text-3xl">
            {money(est.low)} – {money(est.high)}
            {est.openEnded ? <span className="text-forest-500/60">{labels.andUp}</span> : null}
          </div>
          <div className="num mt-1 text-sm text-forest-500/70">
            {money(perSqmLow)} – {money(perSqmHigh)} {labels.perSqm}
          </div>

          <dl className="mt-5 space-y-2 border-t border-forest-500/10 pt-4 text-sm">
            <div className="flex items-baseline justify-between gap-3">
              <dt className="text-forest-500/70">{labels.duration}</dt>
              <dd className="num text-forest-900">
                {labels.months(BUILD_MONTHS.low, BUILD_MONTHS.high)}
              </dd>
            </div>
          </dl>

          <div className="mt-5 border-t border-forest-500/10 pt-4">
            <div className="text-sm font-medium text-forest-900">{labels.excludedTitle}</div>
            <ul className="mt-2 space-y-1 text-sm text-forest-500/70">
              {labels.excluded.map((x) => (
                <li key={x}>— {x}</li>
              ))}
              <li>— {labels.permitLine(PERMIT_MONTHS.low, PERMIT_MONTHS.high)}</li>
            </ul>
          </div>
        </div>
      </div>

      <p className="mt-6 text-xs text-forest-500/60">{labels.disclaimer}</p>
      <div className="mt-3 flex flex-wrap gap-x-6 gap-y-2 text-sm">
        <Link
          href={articleHref as Route}
          className="inline-flex items-center gap-1.5 font-medium text-forest-900 underline-offset-4 hover:underline"
        >
          {labels.articleCta}
          <ArrowRight className="h-3.5 w-3.5" />
        </Link>
        <Link
          href={calcHref as Route}
          className="inline-flex items-center gap-1.5 font-medium text-forest-900 underline-offset-4 hover:underline"
        >
          {labels.fullCalcCta}
          <ArrowRight className="h-3.5 w-3.5" />
        </Link>
      </div>
    </div>
  );
}
