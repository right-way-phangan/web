"use client";

// Аналитические панели калькулятора: сравнения, таблицы, подборки (вынесено из roi-calculator.tsx, 2026-07-04).

import { useMemo, type ReactNode } from "react";
import Link from "next/link";
import type { Route } from "next";
import { ArrowRight } from "lucide-react";
import { computeRoi, solveBreakEven, type RoiInputs, type RoiResult } from "@/lib/calculator/roi";
import { ObjectCard } from "@/components/objects/object-card";
import type { RealEstateObject } from "@/types/object";
import type { RentalMarket } from "@/lib/data/rental-market";
import type { CalcDict } from "@/lib/i18n/calculator";
import { fmtPct, type Money, type SavedScenario } from "./roi-shared";
import { Row } from "./roi-ui";

/**
 * Лента карточек-подборок вместо сетки. Подборки живут в колонке результатов
 * калькулятора, а она на лендинге проекта/объекта узкая (~340px) — сетка там
 * вырождалась в столбик, блок вырастал на два-три экрана, и рядом с ним висела
 * пустая полоса под колонкой полей. Горизонтальный snap-скролл держит высоту в
 * одну карточку на любой ширине; край следующей карточки видно — это и есть
 * подсказка, что ленту можно листать (свайп на тач, трекпад/скроллбар на
 * десктопе). Тот же паттерн, что в [[recently-viewed]].
 */
function CardRail({
  children,
  label,
  className = "",
}: {
  children: ReactNode;
  label: string;
  className?: string;
}) {
  return (
    <div
      className={`flex snap-x snap-mandatory gap-5 overflow-x-auto overscroll-x-contain pb-2 ${className}`}
      role="region"
      aria-roledescription="carousel"
      aria-label={label}
    >
      {children}
    </div>
  );
}

/**
 * Слайд ленты. Ширина в процентах от самой ленты, а не от вьюпорта: калькулятор
 * живёт и в узкой колонке лендинга (~280px), и на широком /calculator, а
 * viewport-брейкпоинты в первом случае врут. 85% оставляют край соседа на виду,
 * потолок 300px не даёт карточке распухнуть на широком экране.
 */
function RailItem({ children }: { children: ReactNode }) {
  return <div className="w-[min(85%,300px)] shrink-0 snap-start">{children}</div>;
}

/** Break-even readout: the occupancy / growth at which the deal matches a deposit. */
export function BreakEven({
  be,
  beatsNow,
  t,
}: {
  be: ReturnType<typeof solveBreakEven>;
  beatsNow: boolean;
  t: CalcDict;
}) {
  const text =
    be == null
      ? beatsNow
        ? t.breakEvenAlways
        : t.breakEvenNever
      : be.metric === "occupancy"
        ? t.breakEvenOccupancy(be.value.toLocaleString("en-US", { maximumFractionDigits: 0 }))
        : t.breakEvenGrowth(be.value.toLocaleString("en-US", { maximumFractionDigits: 1 }));
  return (
    <div className="mt-6 rounded-sm border border-forest-500/10 bg-cream-50 p-6">
      <p className="text-xs font-medium uppercase tracking-[0.2em] text-brass-500">{t.breakEvenTitle}</p>
      <p className="mt-2 text-sm leading-relaxed text-forest-900">{text}</p>
    </div>
  );
}

export function BankCompare({ r, years, bankRate, altRate, money, t }: { r: RoiResult; years: number; bankRate: number; altRate: number; money: Money; t: CalcDict }) {
  const better = r.vsBankThb >= 0;
  const betterAlt = r.vsAltThb >= 0;
  return (
    <div className="mt-6 rounded-sm border border-forest-500/10 bg-cream-50 p-6">
      <p className="text-xs font-medium uppercase tracking-[0.2em] text-brass-500">{t.vsBank}</p>
      <div className="mt-4 space-y-2">
        <Row label={t.bankDeposit(bankRate)} value={money(r.bankFinal, true)} muted />
        {altRate > 0 ? <Row label={t.indexRow(altRate)} value={money(r.altFinal, true)} muted /> : null}
        <Row label={t.thisProperty} value={money(r.totalReturn, true)} />
      </div>
      <p className="mt-4 text-lg text-forest-900">
        {better ? (
          <>
            <span className="text-brass-600 tabular-nums">{money(r.vsBankThb)}</span> {t.moreThanBank(years)}
          </>
        ) : (
          <>{money(Math.abs(r.vsBankThb))} {t.lessThanBank}</>
        )}
      </p>
      {altRate > 0 ? (
        <p className="mt-1 text-sm text-forest-500/70">
          <span className={`tabular-nums ${betterAlt ? "text-brass-600" : "text-forest-500/70"}`}>{money(Math.abs(r.vsAltThb))}</span>{" "}
          {betterAlt ? t.moreThanIndex : t.lessThanIndex}
        </p>
      ) : null}
    </div>
  );
}

export function YearTable({ r, money, isRent, t }: { r: RoiResult; money: Money; isRent: boolean; t: CalcDict }) {
  return (
    <div className="mt-4 overflow-hidden rounded-sm border border-forest-500/10">
      <table className="w-full text-sm tabular-nums">
        <thead className="bg-forest-500/5 text-left text-xs uppercase tracking-wide text-forest-500/60">
          <tr>
            <th className="px-4 py-2 font-medium">{t.thYear}</th>
            <th className="px-4 py-2 text-right font-medium">{t.thValue}</th>
            {isRent ? <th className="px-4 py-2 text-right font-medium">{t.thNetRent}</th> : null}
            <th className="px-4 py-2 text-right font-medium">{t.thCumProfit}</th>
          </tr>
        </thead>
        <tbody>
          {r.series.slice(1).map((p) => (
            <tr key={p.year} className="border-t border-forest-500/10">
              <td className="px-4 py-2 text-forest-500/70">{p.year}</td>
              <td className="px-4 py-2 text-right text-forest-900">{money(p.propertyValue)}</td>
              {isRent ? <td className="px-4 py-2 text-right text-forest-900">{money(p.rentNet)}</td> : null}
              <td className="px-4 py-2 text-right text-forest-900">{money(p.profit)}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

/**
 * Live property finder: enter a desired total ROI and surface catalog listings
 * that hit it under the current assumptions. ROI only ranks by price when there
 * is rental income (rent is fixed THB while price varies); for appreciation-only
 * the ROI is the same for every listing, so we prompt to enable rental income.
 */
export function RoiMatches({
  inputs,
  targetRoi,
  setTargetRoi,
  roiVariesByPrice,
  catalog,
  market,
  excludeRw,
  t,
}: {
  inputs: RoiInputs;
  targetRoi: number;
  setTargetRoi: (v: number) => void;
  roiVariesByPrice: boolean;
  catalog: RealEstateObject[];
  market?: RentalMarket;
  excludeRw?: string;
  t: CalcDict;
}) {
  const matches = useMemo(() => {
    if (!roiVariesByPrice) return [];
    // Anchor each listing's rent to its own district's nightly rate (real comps)
    // rather than the global assumption — a far more realistic per-property ROI.
    const adrByDistrict = new Map((market?.districts ?? []).map((d) => [d.name, d.adrMedian]));
    return catalog
      .filter((o) => o.rwNumber !== excludeRw && o.priceThb)
      .map((o) => {
        const districtAdr = o.district ? adrByDistrict.get(o.district) : undefined;
        const patch: Partial<RoiInputs> = { purchasePriceThb: o.priceThb! };
        if (districtAdr) patch.nightlyRateThb = districtAdr;
        return { o, roi: computeRoi({ ...inputs, ...patch }).roiPct, districtAdr };
      })
      .filter((x) => Number.isFinite(x.roi) && x.roi >= targetRoi)
      .sort((a, b) => b.roi - a.roi)
      .slice(0, 6);
  }, [inputs, targetRoi, roiVariesByPrice, catalog, market, excludeRw]);

  if (catalog.length === 0) return null;

  return (
    <div className="mt-6 rounded-sm border border-forest-500/10 bg-cream-50 p-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <p className="text-xs font-medium uppercase tracking-[0.2em] text-brass-500">{t.roiTargetTitle}</p>
        <div className="flex items-center gap-2">
          <label className="text-xs text-forest-500/70">{t.roiTargetLabel}</label>
          <input
            type="number"
            value={Number.isFinite(targetRoi) ? targetRoi : ""}
            step={5}
            onChange={(e) => setTargetRoi(Number(e.target.value))}
            className="w-20 rounded-sm border border-forest-500/20 bg-cream-50 px-2 py-1 text-right text-sm tabular-nums text-forest-900 focus:border-forest-500 focus:outline-none"
          />
        </div>
      </div>

      {!roiVariesByPrice ? (
        <p className="mt-4 text-sm leading-relaxed text-forest-500/60">{t.roiTargetNeedsRent}</p>
      ) : matches.length === 0 ? (
        <p className="mt-4 text-sm leading-relaxed text-forest-500/60">{t.roiTargetNone}</p>
      ) : (
        <>
          <p className="mt-2 text-sm text-forest-500/70">{t.roiTargetMatches(matches.length)}</p>
          {/* Лента уходит под правый паддинг блока — карточка «обрезается»
              краем, а не стеной, и видно, что есть продолжение. */}
          <div className="-mr-6 mt-6">
            <CardRail label={t.roiTargetTitle} className="pr-6">
              {matches.map(({ o, roi }) => (
                <RailItem key={o.id}>
                  <div className="mb-2 inline-flex items-center rounded-sm bg-brass-500/10 px-2 py-0.5 text-xs font-medium text-brass-600">
                    ROI {fmtPct(roi)}
                  </div>
                  <ObjectCard object={o} />
                </RailItem>
              ))}
            </CardRail>
          </div>
        </>
      )}
    </div>
  );
}

/** Reality check — flags inputs that run ahead of what the market data supports. */
export function RealityCheck({ inputs, market, t }: { inputs: RoiInputs; market?: RentalMarket; t: CalcDict }) {
  if (!market) return null;
  // The snapshot is Airbnb (nightly) data — it can't sanity-check a long-term let.
  if (inputs.longTermRent) return null;
  const warns: string[] = [];
  const adrHigh = Math.max(0, ...market.districts.map((d) => d.adrP75 ?? 0));
  if (adrHigh > 0 && inputs.nightlyRateThb > adrHigh) warns.push(t.realityRateHigh(75));
  const occHigh = Math.round((market.meta.occupancy.high || 0) * 100);
  if (occHigh > 0 && inputs.occupancyPct > occHigh) warns.push(t.realityOccHigh(occHigh));
  if (warns.length === 0) return null;
  return (
    <div className="mt-4 space-y-2 rounded-sm border border-amber-500/30 bg-amber-500/[0.07] p-4">
      <p className="text-[11px] font-medium uppercase tracking-wide text-amber-700">{t.realityTitle}</p>
      {warns.map((w, i) => (
        <p key={i} className="flex gap-1.5 text-[11px] leading-relaxed text-amber-800">
          <span aria-hidden>⚑</span>
          <span>{w}</span>
        </p>
      ))}
    </div>
  );
}

export function ScenarioCompare({
  scenarios,
  current,
  onRemove,
  onClear,
  money,
  t,
}: {
  scenarios: SavedScenario[];
  current: SavedScenario;
  onRemove: (id: number) => void;
  onClear: () => void;
  money: Money;
  t: CalcDict;
}) {
  if (scenarios.length === 0) {
    return (
      <div className="mt-6 rounded-sm border border-forest-500/10 bg-cream-50 p-6">
        <p className="text-sm leading-relaxed text-forest-500/60">{t.compareEmpty}</p>
      </div>
    );
  }
  const cols = [...scenarios, { ...current, id: -1, label: t.currentLabel }];
  const rows: { label: string; fmt: (s: SavedScenario) => string }[] = [
    { label: t.totalRoi, fmt: (s) => fmtPct(s.roi) },
    { label: t.cagrYear, fmt: (s) => fmtPct(s.cagr) },
    { label: t.thValue, fmt: (s) => money(s.proj) },
    { label: t.netProfit, fmt: (s) => money(s.profit) },
    { label: t.paybackKpi, fmt: (s) => (s.payback != null ? t.paybackVal(s.payback.toFixed(1)) : "—") },
    { label: t.vsBank, fmt: (s) => money(s.vsBank) },
  ];
  return (
    <div className="mt-6 overflow-x-auto rounded-sm border border-forest-500/10 bg-cream-50 p-6">
      <div className="mb-3 flex items-center justify-between">
        <p className="text-xs font-medium uppercase tracking-[0.2em] text-brass-500">{t.compareTitle}</p>
        <button type="button" onClick={onClear} className="text-[11px] text-forest-500/60 hover:text-forest-500">{t.clearAll}</button>
      </div>
      <table className="w-full text-sm tabular-nums">
        <thead>
          <tr className="text-left text-[11px] uppercase tracking-wide text-forest-500/55">
            <th className="py-2 pr-3 font-medium" />
            {cols.map((c) => (
              <th key={c.id} className="px-3 py-2 font-medium">
                <span className={c.id === -1 ? "text-brass-600" : "text-forest-900"}>{c.label}</span>
                {c.id !== -1 ? (
                  <button type="button" onClick={() => onRemove(c.id)} className="ml-1.5 text-forest-500/40 hover:text-red-600" aria-label={t.removeScenario}>×</button>
                ) : null}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {rows.map((row) => (
            <tr key={row.label} className="border-t border-forest-500/10">
              <td className="py-2 pr-3 text-[11px] uppercase tracking-wide text-forest-500/55">{row.label}</td>
              {cols.map((c) => (
                <td key={c.id} className={`px-3 py-2 ${c.id === -1 ? "font-medium text-forest-900" : "text-forest-500/80"}`}>{row.fmt(c)}</td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

export function SimilarObjects({
  price,
  catalog,
  excludeRw,
  money,
  t,
}: {
  price: number;
  catalog: RealEstateObject[];
  excludeRw?: string;
  money: Money;
  t: CalcDict;
}) {
  const lo = price * 0.85;
  const hi = price * 1.15;
  const matches = catalog
    .filter((o) => o.rwNumber !== excludeRw && o.priceThb && o.priceThb >= lo && o.priceThb <= hi)
    .sort((a, b) => Math.abs((a.priceThb ?? 0) - price) - Math.abs((b.priceThb ?? 0) - price))
    .slice(0, 3);

  const pmin = Math.max(0, Math.floor(lo / 1_000_000));
  const pmax = Math.ceil(hi / 1_000_000);
  const href = `/listings?pmin=${pmin}&pmax=${pmax}` as Route;

  if (matches.length === 0) return null;

  return (
    <div className="mt-10 border-t border-forest-500/10 pt-10">
      <p className="text-xs font-medium uppercase tracking-[0.2em] text-brass-500">{t.propsForBudget}</p>
      <h3 className="mt-3 font-serif text-2xl text-forest-900">
        {t.aroundMatches(money(price), matches.length)}
      </h3>
      <CardRail label={t.propsForBudget} className="mt-6">
        {matches.map((o) => (
          <RailItem key={o.id}>
            <ObjectCard object={o} />
          </RailItem>
        ))}
      </CardRail>
      <Link
        href={href}
        className="mt-6 inline-flex items-center gap-2 rounded-sm bg-panel px-5 py-2.5 text-sm font-medium text-panel-fg transition-colors hover:bg-forest-400"
      >
        {t.findForBudget}
        <ArrowRight className="h-4 w-4" />
      </Link>
    </div>
  );
}
