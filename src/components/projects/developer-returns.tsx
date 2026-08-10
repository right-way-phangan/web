"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import type { Route } from "next";
import { ArrowRight } from "lucide-react";
import { cn } from "@/lib/utils/cn";
import type { Locale } from "@/lib/i18n/dictionaries";
import { getProjectsDict } from "@/lib/i18n/dictionaries";
import { computeRoi, DEFAULT_INPUTS } from "@/lib/calculator/roi";
import { formatMoney, DEFAULT_RATES } from "@/lib/calculator/currency";

/** Юнит проекта, по которому считаем: подпись + цена входа. */
export interface ReturnsUnit {
  id: string;
  label: string;
  priceThb: number;
  /** Что застройщик обещает по этому формату — печатаем рядом, не подменяя наш расчёт. */
  claimedYieldPct?: number;
  claimedPaybackYears?: number;
}

/** Рыночные допущения аренды — считаются на сервере из нашей же аналитики. */
export interface ReturnsMarket {
  nightlyRateThb: number;
  occupancyPct: number;
  /** Район, по которому взята медиана, — источник под цифрами. */
  districtLabel: string;
}

/**
 * Доходность проекта застройщика прямо на его странице: выбираешь формат,
 * крутишь горизонт и рост цены — считает тот же движок, что и полный
 * калькулятор ([[roi]]), а не отдельная упрощённая формула.
 *
 * Полный RoiCalculator сюда не встраивается сознательно: он переписывает URL
 * страницы через history.replaceState и пишет в localStorage сессию
 * standalone-калькулятора. На чужой странице это чужие побочные эффекты.
 */
export function DeveloperReturns({
  units,
  market,
  fullCalcHref,
  locale,
}: {
  units: ReturnsUnit[];
  market: ReturnsMarket | null;
  fullCalcHref: string;
  locale: Locale;
}) {
  const t = getProjectsDict(locale).developers.returns;
  const [unitId, setUnitId] = useState(units[0]?.id ?? "");
  const [years, setYears] = useState(10);
  const [growth, setGrowth] = useState(5);

  const unit = units.find((u) => u.id === unitId) ?? units[0];

  const result = useMemo(() => {
    if (!unit) return null;
    return computeRoi({
      ...DEFAULT_INPUTS,
      purchasePriceThb: unit.priceThb,
      years,
      annualGrowthPct: growth,
      mode: "rent",
      tenure: "leasehold",
      leaseTermYears: 30,
      // Off-plan: 30% на старте, остаток равными траншами за стройку —
      // опубликованная схема проекта, а не наше допущение.
      offplan: true,
      constructionMonths: 12,
      downPaymentPct: 30,
      handoverPaymentPct: 0,
      handoverUpliftPct: 0,
      rentAfterHandover: true,
      nightlyRateThb: market?.nightlyRateThb ?? DEFAULT_INPUTS.nightlyRateThb,
      occupancyPct: market?.occupancyPct ?? DEFAULT_INPUTS.occupancyPct,
      rentGrowthPct: 0,
      rentTaxPct: 0,
    });
  }, [unit, years, growth, market]);

  if (!unit || !result) return null;

  const money = (v: number) => formatMoney(v, "THB", DEFAULT_RATES, { compact: true });
  const pct = (v: number) => `${v >= 0 ? "" : "−"}${Math.abs(v).toFixed(1)}%`;

  // «Окупаемость» из движка здесь не показываем: при поэтапной оплате это год,
  // когда накопленная прибыль выходит в плюс, а не возврат вложенного, — на
  // витрине такая цифра читается как обещание, которого никто не давал.
  const kpis = [
    { label: t.kpiRoi, value: pct(result.roiPct) },
    { label: t.kpiCagr, value: pct(result.cagrPct) },
    { label: t.kpiRentYear, value: money(result.rentNetTotal / Math.max(1, years)) },
    { label: t.kpiProfit, value: money(result.netProfit) },
  ];

  return (
    <div className="rounded-sm border border-forest-500/15 bg-cream-50 p-6 md:p-8">
      {units.length > 1 ? (
        <div className="flex flex-wrap gap-2">
          {units.map((u) => {
            const on = u.id === unit.id;
            return (
              <button
                key={u.id}
                type="button"
                onClick={() => setUnitId(u.id)}
                aria-pressed={on}
                className={cn(
                  "rounded-sm px-3 py-2 text-sm transition-colors",
                  on
                    ? "bg-forest-900 text-cream-50"
                    : "bg-forest-900/[0.06] text-forest-600 hover:bg-forest-900/10",
                )}
              >
                {u.label}
                <span className={cn("num ml-2 text-xs", on ? "text-cream-50/70" : "text-forest-500/60")}>
                  {money(u.priceThb)}
                </span>
              </button>
            );
          })}
        </div>
      ) : null}

      <dl className="mt-6 grid grid-cols-2 gap-x-6 gap-y-5 lg:grid-cols-4">
        {kpis.map((k) => (
          <div key={k.label}>
            <dd className="num text-2xl text-forest-900">{k.value}</dd>
            <dt className="mt-1 text-xs font-medium uppercase tracking-eyebrow text-forest-600">
              {k.label}
            </dt>
          </div>
        ))}
      </dl>

      <div className="mt-7 grid gap-5 sm:grid-cols-2">
        <label className="block">
          <span className="flex items-baseline justify-between text-sm text-forest-500/80">
            {t.yearsLabel}
            <span className="num text-forest-900">{t.yearsValue(years)}</span>
          </span>
          <input
            type="range"
            min={5}
            max={30}
            step={1}
            value={years}
            onChange={(e) => setYears(Number(e.target.value))}
            className="mt-2 w-full accent-brass-500"
          />
        </label>
        <label className="block">
          <span className="flex items-baseline justify-between text-sm text-forest-500/80">
            {t.growthLabel}
            <span className="num text-forest-900">{growth}%</span>
          </span>
          <input
            type="range"
            min={3}
            max={8}
            step={0.5}
            value={growth}
            onChange={(e) => setGrowth(Number(e.target.value))}
            className="mt-2 w-full accent-brass-500"
          />
        </label>
      </div>

      {unit.claimedYieldPct ? (
        <p className="mt-6 border-t border-forest-500/10 pt-4 text-sm text-forest-500/75">
          {t.claimed(unit.label, unit.claimedYieldPct, unit.claimedPaybackYears ?? 0)}
        </p>
      ) : null}

      <p className="mt-3 text-xs text-forest-500/60">
        {market ? t.marketSource(market.districtLabel, market.nightlyRateThb, market.occupancyPct) : t.noMarket}
      </p>

      <Link
        href={fullCalcHref as Route}
        className="mt-4 inline-flex items-center gap-1.5 text-sm font-medium text-forest-900 underline-offset-4 hover:underline"
      >
        {t.fullCta}
        <ArrowRight className="h-3.5 w-3.5" />
      </Link>
    </div>
  );
}
