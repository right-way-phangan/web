"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import Link from "next/link";
import type { Route } from "next";
import { ChevronDown, TrendingUp, ArrowRight, Home, Hotel, Download, RotateCcw, Link2, Check, Pin, Info } from "lucide-react";
import {
  computeRoi,
  DEFAULT_INPUTS,
  solveMaxPrice,
  solveBreakEven,
  type RoiInputs,
  type RoiResult,
  type RoiYearPoint,
  type CalcMode,
  type Tenure,
  type SolveMetric,
} from "@/lib/calculator/roi";
import {
  CURRENCIES,
  DEFAULT_RATES,
  fetchRates,
  formatMoney,
  type Currency,
} from "@/lib/calculator/currency";
import { ObjectCard } from "@/components/objects/object-card";
import { CalcLeadButton } from "@/components/calculator/calc-lead-button";
import { MarketPreset } from "@/components/calculator/market-preset";
import { buildCalcReportHtml } from "@/lib/calculator/report";
import type { RealEstateObject } from "@/types/object";
import { getAppreciation, type RentalMarket } from "@/lib/data/rental-market";
import { calcDict, type CalcDict, type CalcLocale } from "@/lib/i18n/calculator";
import { useLocale } from "@/lib/i18n/use-locale";

const fmtPct = (n: number) =>
  !isFinite(n) ? "—" : `${n >= 0 ? "+" : ""}${n.toLocaleString("en-US", { maximumFractionDigits: 1 })}%`;

const solveLabels = (t: CalcDict): Record<SolveMetric, string> => ({
  roi: t.solveRoi,
  cap: t.solveCap,
  coc: t.solveCoc,
  irr: t.solveIrr,
});

type Money = (thb: number, full?: boolean) => string;

interface Props {
  initialPriceThb?: number;
  initialMode?: CalcMode;
  initialTenure?: Tenure;
  initialLeaseTermYears?: number;
  initialOffplan?: boolean;
  catalog?: RealEstateObject[];
  excludeRw?: string;
  compact?: boolean;
  /** Rental-market snapshot — powers the "fill from market data" preset in rent mode. */
  market?: RentalMarket;
}

export function RoiCalculator({
  initialPriceThb,
  initialMode,
  initialTenure,
  initialLeaseTermYears,
  initialOffplan,
  catalog = [],
  excludeRw,
  market,
}: Props) {
  // Seed the calculator language from the URL (/ru/* → RU), but keep the manual
  // EN/RU toggle so a visitor can switch either tool independently.
  const urlLocale = useLocale();
  const [locale, setLocale] = useState<CalcLocale>(urlLocale);
  const t = calcDict(locale);

  // Data-anchored expected-growth band (sourced, not guessed). Falls back to an
  // external macro anchor when the rental-market snapshot history can't derive one.
  const appr = market ? getAppreciation(market) : getAppreciation({ meta: {} } as RentalMarket);
  const growthScenarios = [
    { key: "conservative", label: t.scenarioConservative, growthPct: appr.conservative },
    { key: "base", label: t.scenarioBase, growthPct: appr.base },
    { key: "optimistic", label: t.scenarioOptimistic, growthPct: appr.high },
  ] as const;

  const [inputs, setInputs] = useState<RoiInputs>({
    ...DEFAULT_INPUTS,
    purchasePriceThb: initialPriceThb ?? DEFAULT_INPUTS.purchasePriceThb,
    // Default the headline growth to the data-anchored "base" so the projection
    // starts from market context, not a hardcoded guess.
    annualGrowthPct: appr.base,
    mode: initialMode ?? DEFAULT_INPUTS.mode,
    tenure: initialTenure ?? DEFAULT_INPUTS.tenure,
    leaseTermYears: initialLeaseTermYears ?? DEFAULT_INPUTS.leaseTermYears,
    offplan: initialOffplan ?? DEFAULT_INPUTS.offplan,
  });
  const [showAdvanced, setShowAdvanced] = useState(false);
  const [showYears, setShowYears] = useState(false);
  const [showSolver, setShowSolver] = useState(false);
  const [showSens, setShowSens] = useState(false);
  const [solverMetric, setSolverMetric] = useState<SolveMetric>("roi");
  const [solverTarget, setSolverTarget] = useState(60);
  const [pinned, setPinned] = useState<{ proj: number; roi: number; profit: number; label: string } | null>(null);
  const [currency, setCurrency] = useState<Currency>("THB");
  const [rates, setRates] = useState<Record<Currency, number>>(DEFAULT_RATES);
  const [copied, setCopied] = useState(false);

  // Mobile: a sticky result bar so the headline stays visible while the user
  // edits assumptions above it. Shown only while the calculator is on screen.
  const rootRef = useRef<HTMLDivElement>(null);
  const [showMobileBar, setShowMobileBar] = useState(false);

  // Best-effort live FX once mounted.
  useEffect(() => {
    fetchRates().then((r) => r && setRates(r));
  }, []);

  useEffect(() => {
    const el = rootRef.current;
    if (!el || typeof IntersectionObserver === "undefined") return;
    const obs = new IntersectionObserver(([e]) => setShowMobileBar(e.isIntersecting), {
      rootMargin: "-100px 0px -45% 0px",
    });
    obs.observe(el);
    return () => obs.disconnect();
  }, []);

  const r = useMemo(() => computeRoi(inputs), [inputs]);
  const solvedMaxPrice = useMemo(
    () => (showSolver ? solveMaxPrice(inputs, solverMetric, solverTarget) : null),
    [showSolver, inputs, solverMetric, solverTarget],
  );
  const breakEven = useMemo(() => solveBreakEven(inputs), [inputs]);
  const set = (patch: Partial<RoiInputs>) => setInputs((p) => ({ ...p, ...patch }));
  const money: Money = (thb, full) => formatMoney(thb, currency, rates, { compact: !full });

  // Money inputs are entered in the selected currency; state stays in THB.
  const fx = rates[currency] ?? 1; // foreign units per 1 THB
  const thbHint = (thb: number) =>
    currency === "THB" ? money(thb) : `≈ ${formatMoney(thb, "THB", rates, { compact: true })}`;

  const openReport = () => {
    const html = buildCalcReportHtml({ inputs, result: r, currency, rates, rwNumber: excludeRw, locale });
    const w = window.open("", "_blank");
    if (w) {
      w.document.open();
      w.document.write(html);
      w.document.close();
      return;
    }
    // Popup blocked (common on mobile) — fall back to a downloadable HTML file
    // the user can open and print to PDF.
    const blob = new Blob([html], { type: "text/html" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `right-way-investment${excludeRw ? `-${excludeRw}` : ""}.html`;
    document.body.appendChild(a);
    a.click();
    a.remove();
    setTimeout(() => URL.revokeObjectURL(url), 10_000);
  };

  // Full reset to defaults (keeps the data-anchored "base" growth).
  const resetInputs = () => setInputs({ ...DEFAULT_INPUTS, annualGrowthPct: appr.base });

  const copyLink = async () => {
    try {
      await navigator.clipboard.writeText(window.location.href);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      /* clipboard unavailable — ignore */
    }
  };

  // Keep the URL in sync with the inputs the calculator page can deep-link from
  // (price, mode, tenure, lease, phase) so "Copy link" reproduces the scenario.
  useEffect(() => {
    if (typeof window === "undefined") return;
    const p = new URLSearchParams();
    p.set("price", String(Math.round(inputs.purchasePriceThb || 0)));
    if (inputs.offplan) p.set("phase", "offplan");
    else p.set("mode", inputs.mode);
    p.set("tenure", inputs.tenure);
    if (inputs.tenure === "leasehold") p.set("lease", String(inputs.leaseTermYears));
    window.history.replaceState(null, "", `${window.location.pathname}?${p.toString()}`);
  }, [inputs.purchasePriceThb, inputs.offplan, inputs.mode, inputs.tenure, inputs.leaseTermYears]);

  const activeScenario = growthScenarios.find((s) => s.growthPct === inputs.annualGrowthPct)?.key;
  const isOffplan = inputs.offplan;
  const isRent = inputs.mode === "rent" && !isOffplan;
  const isLeasehold = inputs.tenure === "leasehold";
  const isSeasonal = inputs.seasonality;
  const installmentPct = Math.max(0, 100 - inputs.downPaymentPct - inputs.handoverPaymentPct);

  // Cross-input sanity checks — surfaced inline so a silently-degenerate result
  // (lease decayed to ~0, payment plan over 100%) is never shown without a flag.
  const leaseExpiry = isLeasehold && !inputs.leaseRenewable && inputs.years >= inputs.leaseTermYears;
  const offplanOverpay = isOffplan && inputs.downPaymentPct + inputs.handoverPaymentPct > 100;

  const strategyLabel = isOffplan ? "Off-plan (new build)" : isRent ? "Buy & Rent" : "Buy & Hold";
  // Lead summary in the buyer's display currency (THB equivalent in parens when
  // it isn't THB) so the message matches the figures they were looking at.
  const disp = (thb: number) =>
    currency === "THB"
      ? formatMoney(thb, "THB", rates, { compact: false })
      : `${formatMoney(thb, currency, rates, { compact: false })} (≈ ${formatMoney(thb, "THB", rates, { compact: false })})`;
  const calcSummary = [
    `Investment calculation${excludeRw ? ` — ${excludeRw}` : ""} (${strategyLabel})`,
    `Tenure: ${isLeasehold ? `Leasehold, ${inputs.leaseTermYears}-yr term` : "Freehold"}`,
    `${isOffplan ? "Contract price" : "Purchase price"}: ${disp(inputs.purchasePriceThb)}`,
    isOffplan
      ? `Plan: ${inputs.downPaymentPct}% down · ${installmentPct.toFixed(0)}% during ${inputs.constructionMonths}mo build · ${inputs.handoverPaymentPct}% at handover`
      : "",
    isOffplan ? `Value at handover (+${inputs.handoverUpliftPct}%): ${disp(r.handoverValue)}` : "",
    `Annual growth: ${inputs.annualGrowthPct}% over ${inputs.years} years`,
    `Projected value: ${disp(r.projectedValue)}`,
    `Total ROI: ${fmtPct(r.roiPct)} · CAGR ${fmtPct(r.cagrPct)}/yr${isRent || isOffplan ? ` · IRR ${fmtPct(r.irrPct)}` : ""}`,
    isRent ? `Cap rate ${fmtPct(r.capRatePct)} · Cash-on-cash ${fmtPct(r.cashOnCashPct)} · Gross yield ${fmtPct(r.grossYieldPct)}` : "",
    isRent && isSeasonal
      ? `Seasonality: ${inputs.highSeasonMonths}mo high @ ${inputs.highSeasonOccupancyPct}% (+${inputs.highSeasonRateUpliftPct}% rate) · low @ ${inputs.lowSeasonOccupancyPct}%`
      : "",
    isRent ? `Net rental income: ${disp(r.rentNetTotal)}` : "",
    `Net profit: ${disp(r.netProfit)}`,
    `vs bank (${inputs.bankRatePct}%): ${disp(r.vsBankThb)} ${r.vsBankThb >= 0 ? "more" : "less"}`,
    ``,
    `Please send me this calculation and get in touch.`,
  ]
    .filter(Boolean)
    .join("\n");

  return (
    <>
    <div ref={rootRef} className="grid gap-10 pb-16 lg:grid-cols-[380px_1fr] lg:gap-14 lg:pb-0">
      {/* ---- Parameters ---- */}
      <div>
        {/* Toolbar — reset / share on the left, language toggle on the right. */}
        <div className="mb-3 flex items-center justify-between gap-2">
          <div className="flex items-center gap-1">
            <button
              type="button"
              onClick={resetInputs}
              className="inline-flex items-center gap-1 rounded-sm border border-forest-500/20 px-2 py-1 text-[11px] font-medium text-forest-500/70 transition-colors hover:border-forest-500/50 hover:text-forest-500"
            >
              <RotateCcw className="h-3 w-3" />
              {t.resetDefaults}
            </button>
            <button
              type="button"
              onClick={copyLink}
              className="inline-flex items-center gap-1 rounded-sm border border-forest-500/20 px-2 py-1 text-[11px] font-medium text-forest-500/70 transition-colors hover:border-forest-500/50 hover:text-forest-500"
            >
              {copied ? <Check className="h-3 w-3 text-brass-500" /> : <Link2 className="h-3 w-3" />}
              {copied ? t.linkCopied : t.copyLink}
            </button>
          </div>
          <div className="inline-flex overflow-hidden rounded-sm border border-forest-500/20 text-[11px] font-medium" role="group" aria-label={t.langLabel}>
            <button type="button" onClick={() => setLocale("en")} className={`px-2.5 py-1 transition-colors ${locale === "en" ? "bg-forest-500 text-cream-50" : "text-forest-500/60 hover:bg-forest-500/8"}`}>EN</button>
            <button type="button" onClick={() => setLocale("ru")} className={`px-2.5 py-1 transition-colors ${locale === "ru" ? "bg-forest-500 text-cream-50" : "text-forest-500/60 hover:bg-forest-500/8"}`}>RU</button>
          </div>
        </div>

        {/* Phase — completed resale vs off-plan new build (RW-P projects) */}
        <div className="flex gap-1 rounded-sm border border-forest-500/15 bg-cream-50 p-1">
          <PhaseTab active={!isOffplan} onClick={() => set({ offplan: false })} label={t.completed} />
          <PhaseTab active={isOffplan} onClick={() => set({ offplan: true })} label={t.offplan} />
        </div>

        {/* Mode tabs (completed only) */}
        {!isOffplan ? (
          <div className="mt-3 flex gap-2 rounded-sm border border-forest-500/15 bg-cream-50 p-1">
            <ModeTab active={!isRent} onClick={() => set({ mode: "hold" as CalcMode })} icon={Home} label={t.buyHold} />
            <ModeTab active={isRent} onClick={() => set({ mode: "rent" as CalcMode })} icon={Hotel} label={t.buyRent} />
          </div>
        ) : null}

        {/* Tenure — Thailand-specific. Leasehold value decays as the lease runs down. */}
        <div className="mt-3 flex gap-1 rounded-sm border border-forest-500/15 bg-cream-50 p-1">
          <TenureTab active={!isLeasehold} onClick={() => set({ tenure: "freehold" as Tenure })} label={t.freehold} />
          <TenureTab active={isLeasehold} onClick={() => set({ tenure: "leasehold" as Tenure })} label={t.leasehold} />
        </div>

        <p className="mt-6 text-xs font-medium uppercase tracking-[0.2em] text-brass-500">
          {t.assumptionsTitle}
        </p>
        <p className="mt-1 text-[11px] text-forest-500/50">
          {t.assumptionsHint}
        </p>

        <div className="mt-6 space-y-5">
          <MoneyField
            label={`${isOffplan ? t.contractPrice : t.purchasePrice} (${currency})`}
            thbValue={inputs.purchasePriceThb}
            currency={currency}
            fx={fx}
            onChangeThb={(thb) => set({ purchasePriceThb: thb })}
            hint={thbHint(inputs.purchasePriceThb)}
          />

          <div>
            <label className="text-sm text-forest-500/70">{t.growthLabel}</label>
            <div className="mt-2 flex gap-2">
              {growthScenarios.map((s) => (
                <button
                  key={s.key}
                  type="button"
                  onClick={() => set({ annualGrowthPct: s.growthPct })}
                  className={`flex-1 rounded-sm border px-2 py-2 text-xs font-medium transition-colors ${
                    activeScenario === s.key
                      ? "border-forest-500 bg-forest-500 text-cream-100"
                      : "border-forest-500/20 bg-cream-50 text-forest-500 hover:border-forest-500/50"
                  }`}
                >
                  {s.label}
                  <span className="block text-[10px] opacity-70">{s.growthPct}%</span>
                </button>
              ))}
            </div>
            <div className="mt-3">
              <SliderField
                label={t.growthFineTune}
                value={inputs.annualGrowthPct}
                min={-10}
                max={30}
                step={0.5}
                onChange={(v) => set({ annualGrowthPct: v })}
                small
              />
            </div>
            <p className="mt-1.5 text-[11px] leading-relaxed text-forest-500/50">
              {t.growthSource(appr.source, appr.asOf)}
            </p>
          </div>

          <SliderField label={t.holdingPeriod} value={inputs.years} unit={t.unitYr} step={1} min={1} max={40} onChange={(v) => set({ years: v })} />

          {/* Leasehold-only: total lease term + renewal toggle + decay note */}
          {isLeasehold ? (
            <div className="space-y-2 rounded-sm border border-forest-500/10 bg-forest-500/[0.03] p-4">
              <SliderField label={t.leaseTerm} value={inputs.leaseTermYears} unit={t.unitYr} step={1} min={1} max={90} onChange={(v) => set({ leaseTermYears: v })} small />
              <label className="flex cursor-pointer items-center gap-1.5 text-[11px] text-forest-500/70">
                <input
                  type="checkbox"
                  checked={inputs.leaseRenewable}
                  onChange={(e) => set({ leaseRenewable: e.target.checked })}
                  className="h-3.5 w-3.5 accent-brass-500"
                />
                {t.leaseRenewableLabel}
              </label>
              {!inputs.leaseRenewable ? (
                <p className="text-[11px] leading-relaxed text-forest-500/55">{t.leaseDecayNote}</p>
              ) : null}
              {leaseExpiry ? <WarnBox text={t.leaseExpiryWarn(inputs.years, inputs.leaseTermYears)} /> : null}
            </div>
          ) : null}

          {/* Off-plan-only inputs */}
          {isOffplan ? (
            <div className="space-y-4 rounded-sm border border-brass-500/20 bg-brass-500/[0.04] p-4">
              <p className="text-[11px] font-medium uppercase tracking-wide text-brass-600">{t.constructionPlan}</p>
              <SliderField label={t.constructionPeriod} value={inputs.constructionMonths} unit={t.unitMo} step={1} min={1} max={84} onChange={(v) => set({ constructionMonths: v })} small />
              <SliderField label={t.downPaymentNow} value={inputs.downPaymentPct} step={5} min={0} max={100} onChange={(v) => set({ downPaymentPct: v })} small />
              <SliderField label={t.balanceHandover} value={inputs.handoverPaymentPct} step={5} min={0} max={100} onChange={(v) => set({ handoverPaymentPct: v })} small />
              <SliderField label={t.valueUplift} value={inputs.handoverUpliftPct} step={1} min={0} max={50} onChange={(v) => set({ handoverUpliftPct: v })} small />
              <p className="text-[11px] leading-relaxed text-forest-500/55">
                {t.offplanNote(installmentPct.toFixed(0))}
              </p>
              {offplanOverpay ? (
                <WarnBox text={t.offplanOverpayWarn(inputs.downPaymentPct + inputs.handoverPaymentPct)} />
              ) : null}
              <label className="flex cursor-pointer items-center gap-1.5 border-t border-brass-500/15 pt-3 text-[11px] text-forest-500/70">
                <input
                  type="checkbox"
                  checked={inputs.rentAfterHandover}
                  onChange={(e) => set({ rentAfterHandover: e.target.checked })}
                  className="h-3.5 w-3.5 accent-brass-500"
                />
                {t.rentAfterHandoverLabel}
              </label>
              {inputs.rentAfterHandover ? (
                <div className="space-y-4 rounded-sm border border-brass-500/15 bg-cream-50/60 p-3">
                  <MoneyField label={`${t.nightlyRate} (${currency})`} thbValue={inputs.nightlyRateThb} currency={currency} fx={fx} onChangeThb={(thb) => set({ nightlyRateThb: thb })} hint={thbHint(inputs.nightlyRateThb)} small />
                  <SliderField label={t.occupancy} value={inputs.occupancyPct} step={5} min={0} max={100} onChange={(v) => set({ occupancyPct: v })} small />
                  <SliderField label={t.mgmtFee} value={inputs.mgmtFeePct} step={1} min={0} max={100} onChange={(v) => set({ mgmtFeePct: v })} small />
                  <SliderField label={t.opex} value={inputs.opexPct} step={0.5} min={0} max={15} onChange={(v) => set({ opexPct: v })} small />
                  <SliderField label={t.rentGrowth} value={inputs.rentGrowthPct} step={0.5} min={-5} max={15} onChange={(v) => set({ rentGrowthPct: v })} small />
                  <SliderField label={t.rentTaxLabel} value={inputs.rentTaxPct} step={1} min={0} max={40} onChange={(v) => set({ rentTaxPct: v })} small />
                  <MoneyField label={`${t.furnishingLabel} (${currency})`} thbValue={inputs.furnishingThb} currency={currency} fx={fx} onChangeThb={(thb) => set({ furnishingThb: thb })} hint={thbHint(inputs.furnishingThb)} small />
                </div>
              ) : null}
            </div>
          ) : null}

          {/* Rent-only inputs */}
          {isRent ? (
            <div className="space-y-4 rounded-sm border border-brass-500/20 bg-brass-500/[0.04] p-4">
              <div className="flex items-center justify-between">
                <p className="text-[11px] font-medium uppercase tracking-wide text-brass-600">{t.rentalAssumptions}</p>
                <label className="flex cursor-pointer items-center gap-1.5 text-[11px] text-forest-500/70">
                  <input
                    type="checkbox"
                    checked={isSeasonal}
                    onChange={(e) => set({ seasonality: e.target.checked })}
                    className="h-3.5 w-3.5 accent-brass-500"
                  />
                  {t.highLowSeason}
                </label>
              </div>
              {market ? (
                <MarketPreset
                  market={market}
                  t={t}
                  onApply={({ nightlyRateThb, occupancyPct }) =>
                    set({ nightlyRateThb, occupancyPct, seasonality: false })
                  }
                />
              ) : null}
              <MoneyField label={`${t.nightlyRate} (${currency})`} thbValue={inputs.nightlyRateThb} currency={currency} fx={fx} onChangeThb={(thb) => set({ nightlyRateThb: thb })} hint={thbHint(inputs.nightlyRateThb)} small />
              {isSeasonal ? (
                <div className="space-y-4 rounded-sm border border-brass-500/15 bg-cream-50/60 p-3">
                  <SliderField label={t.highSeasonLength} value={inputs.highSeasonMonths} unit={t.unitMo} step={1} min={0} max={12} onChange={(v) => set({ highSeasonMonths: v })} small />
                  <SliderField label={t.highSeasonOccupancy} value={inputs.highSeasonOccupancyPct} step={5} min={0} max={100} onChange={(v) => set({ highSeasonOccupancyPct: v })} small />
                  <SliderField label={t.highSeasonUplift} value={inputs.highSeasonRateUpliftPct} step={5} min={0} max={100} onChange={(v) => set({ highSeasonRateUpliftPct: v })} small />
                  <SliderField label={t.lowSeasonOccupancy} value={inputs.lowSeasonOccupancyPct} step={5} min={0} max={100} onChange={(v) => set({ lowSeasonOccupancyPct: v })} small />
                </div>
              ) : (
                <SliderField label={t.occupancy} value={inputs.occupancyPct} step={5} min={0} max={100} onChange={(v) => set({ occupancyPct: v })} small />
              )}
              <SliderField label={t.mgmtFee} value={inputs.mgmtFeePct} step={1} min={0} max={100} onChange={(v) => set({ mgmtFeePct: v })} small />
              <SliderField label={t.opex} value={inputs.opexPct} step={0.5} min={0} max={15} onChange={(v) => set({ opexPct: v })} small />
              <SliderField label={t.rentGrowth} value={inputs.rentGrowthPct} step={0.5} min={-5} max={15} onChange={(v) => set({ rentGrowthPct: v })} small />
              <SliderField label={t.rentTaxLabel} value={inputs.rentTaxPct} step={1} min={0} max={40} onChange={(v) => set({ rentTaxPct: v })} small />
              <MoneyField label={`${t.furnishingLabel} (${currency})`} thbValue={inputs.furnishingThb} currency={currency} fx={fx} onChangeThb={(thb) => set({ furnishingThb: thb })} hint={thbHint(inputs.furnishingThb)} small />
              <p className="text-[11px] leading-relaxed text-forest-500/55">{t.furnishingHint}</p>
            </div>
          ) : null}

          <button
            type="button"
            onClick={() => setShowAdvanced((v) => !v)}
            className="flex items-center gap-1.5 text-xs font-medium text-forest-500/70 hover:text-forest-500"
          >
            <ChevronDown className={`h-3.5 w-3.5 transition-transform ${showAdvanced ? "rotate-180" : ""}`} />
            {t.advancedCosts}
          </button>
          {showAdvanced ? (
            <div className="space-y-4 rounded-sm border border-forest-500/10 bg-forest-500/[0.03] p-4">
              <p className="text-[11px] text-forest-500/55">{t.costsToggleHint(currency)}</p>
              <PctOrMoneyField label={t.entryCosts} t={t} pctValue={inputs.closingCostsPct} priceThb={inputs.purchasePriceThb} currency={currency} fx={fx} rates={rates} min={0} max={20} step={0.5} onChangePct={(v) => set({ closingCostsPct: v })} small />
              <PctOrMoneyField label={t.exitCosts} t={t} pctValue={inputs.saleCostsPct} priceThb={inputs.purchasePriceThb} currency={currency} fx={fx} rates={rates} min={0} max={20} step={0.5} onChangePct={(v) => set({ saleCostsPct: v })} small />
              <PctOrMoneyField label={t.annualHolding} t={t} pctValue={inputs.annualHoldingPct} priceThb={inputs.purchasePriceThb} currency={currency} fx={fx} rates={rates} min={0} max={10} step={0.1} onChangePct={(v) => set({ annualHoldingPct: v })} small />
              <SliderField label={t.bankRate} value={inputs.bankRatePct} step={0.25} min={0} max={10} onChange={(v) => set({ bankRatePct: v })} small />
              <SliderField label={t.inflationLabel} value={inputs.inflationPct} step={0.5} min={0} max={15} onChange={(v) => set({ inflationPct: v })} small />
            </div>
          ) : null}
        </div>
      </div>

      {/* ---- Results ---- */}
      <div id="calc-results" className="scroll-mt-24">
        <div className="rounded-sm border border-forest-500/10 bg-cream-50 p-6 md:p-8">
          <div className="flex items-start justify-between gap-4">
            <p className="text-xs font-medium uppercase tracking-[0.2em] text-brass-500">
              {t.projectedValueIn(inputs.years)}
            </p>
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => setPinned({ proj: r.projectedValue, roi: r.roiPct, profit: r.netProfit, label: isOffplan ? t.offplan : isRent ? t.buyRent : t.buyHold })}
                title={t.pinScenario}
                aria-label={t.pinScenario}
                className="inline-flex items-center rounded-sm border border-forest-500/20 p-1.5 text-forest-500/60 transition-colors hover:border-forest-500/50 hover:text-forest-500"
              >
                <Pin className="h-3.5 w-3.5" />
              </button>
              <CurrencyPicker currency={currency} onChange={setCurrency} />
            </div>
          </div>
          <p className="num mt-2 text-4xl text-forest-900 md:text-5xl">{money(r.projectedValue, true)}</p>
          {inputs.inflationPct > 0 ? (
            <p className="num mt-1 text-sm text-forest-500/55">≈ {money(r.realProjectedValue, true)} {t.inTodaysMoney}</p>
          ) : null}

          <div className="mt-6 grid grid-cols-3 gap-4 border-t border-forest-500/10 pt-6">
            <Kpi label={t.totalRoi} value={fmtPct(r.roiPct)} accent tip={t.defRoi} />
            <Kpi label={t.cagrYear} value={fmtPct(r.cagrPct)} tip={t.defCagr} />
            <Kpi label={t.netProfit} value={money(r.netProfit)} />
          </div>
          {inputs.inflationPct > 0 ? (
            <p className="mt-2 text-[11px] text-forest-500/50">{t.realCagrNote(inputs.inflationPct, fmtPct(r.realCagrPct))}</p>
          ) : null}

          {isOffplan ? (
            <div className="mt-4 grid grid-cols-3 gap-4 border-t border-forest-500/10 pt-4">
              <Kpi label={t.valueAtHandover} value={money(r.handoverValue)} />
              <Kpi label={t.irrYear} value={fmtPct(r.irrPct)} accent tip={t.defIrr} />
              <Kpi label={t.totalInvested} value={money(r.initialInvestment)} />
            </div>
          ) : isRent ? (
            <div className="mt-4 grid grid-cols-2 gap-4 border-t border-forest-500/10 pt-4 sm:grid-cols-4">
              <Kpi label={t.capRate} value={fmtPct(r.capRatePct)} tip={t.defCapRate} />
              <Kpi label={t.cashOnCash} value={fmtPct(r.cashOnCashPct)} tip={t.defCashOnCash} />
              <Kpi label={t.grossYield} value={fmtPct(r.grossYieldPct)} tip={t.defGrossYield} />
              <Kpi label={t.irrYear} value={fmtPct(r.irrPct)} tip={t.defIrr} />
            </div>
          ) : null}

          {pinned ? (
            <div className="mt-4 rounded-sm border border-forest-500/15 bg-forest-500/[0.03] p-4">
              <div className="flex items-center justify-between">
                <span className="text-[11px] uppercase tracking-wide text-forest-500/55">{t.pinnedLabel}: {pinned.label}</span>
                <button type="button" onClick={() => setPinned(null)} className="text-[11px] text-forest-500/60 hover:text-forest-500">{t.clearPin}</button>
              </div>
              <div className="mt-3 grid grid-cols-3 gap-3">
                <CompareCell label={t.projectedValueIn(inputs.years)} pinned={money(pinned.proj)} current={money(r.projectedValue)} delta={r.projectedValue - pinned.proj} money={money} />
                <CompareCell label={t.totalRoi} pinned={fmtPct(pinned.roi)} current={fmtPct(r.roiPct)} deltaPct={r.roiPct - pinned.roi} />
                <CompareCell label={t.netProfit} pinned={money(pinned.profit)} current={money(r.netProfit)} delta={r.netProfit - pinned.profit} money={money} />
              </div>
            </div>
          ) : null}

          <div className="mt-6 space-y-2">
            <CalcLeadButton message={calcSummary} rwNumber={excludeRw} />
            <button
              type="button"
              onClick={openReport}
              className="flex w-full items-center justify-center gap-2 rounded-sm border border-forest-500/25 bg-transparent px-5 py-2.5 text-sm font-medium text-forest-500 transition-colors hover:border-forest-500/50 hover:bg-forest-500/[0.04]"
            >
              <Download className="h-4 w-4" />
              {t.downloadPdf}
            </button>
          </div>
        </div>

        <BankCompare r={r} years={inputs.years} bankRate={inputs.bankRatePct} money={money} t={t} />

        <BreakEven be={breakEven} beatsNow={r.vsBankThb >= 0} t={t} />

        <div className="mt-6 rounded-sm border border-forest-500/10 bg-cream-50 p-6">
          <div className="flex items-center gap-2 text-xs font-medium uppercase tracking-[0.2em] text-brass-500">
            <TrendingUp className="h-4 w-4" />
            {isOffplan && !inputs.rentAfterHandover ? t.capitalGrowth : t.returnVsBankTitle}
          </div>
          <GrowthChart r={r} money={money} t={t} mode={isOffplan && !inputs.rentAfterHandover ? "asset" : "owner"} />
        </div>

        <div className="mt-6">
          <button
            type="button"
            onClick={() => setShowYears((v) => !v)}
            className="flex items-center gap-1.5 text-sm font-medium text-forest-500/80 hover:text-forest-500"
          >
            <ChevronDown className={`h-4 w-4 transition-transform ${showYears ? "rotate-180" : ""}`} />
            {t.showYearByYear}
          </button>
          {showYears ? <YearTable r={r} money={money} isRent={isRent} t={t} /> : null}
        </div>

        {/* Sensitivity — ROI as the main driver moves around the base case */}
        <div className="mt-4">
          <button
            type="button"
            onClick={() => setShowSens((v) => !v)}
            className="flex items-center gap-1.5 text-sm font-medium text-forest-500/80 hover:text-forest-500"
          >
            <ChevronDown className={`h-4 w-4 transition-transform ${showSens ? "rotate-180" : ""}`} />
            {t.sensitivityTitle}
          </button>
          {showSens ? <Sensitivity inputs={inputs} isRent={isRent} t={t} /> : null}
        </div>

        {/* Reverse: solve max price for a target return */}
        <div className="mt-4">
          <button
            type="button"
            onClick={() => setShowSolver((v) => !v)}
            className="flex items-center gap-1.5 text-sm font-medium text-forest-500/80 hover:text-forest-500"
          >
            <ChevronDown className={`h-4 w-4 transition-transform ${showSolver ? "rotate-180" : ""}`} />
            {t.findMaxPrice}
          </button>
          {showSolver ? (
            <div className="mt-4 space-y-4 rounded-sm border border-forest-500/10 bg-cream-50 p-6">
              <div className="flex flex-wrap items-end gap-3">
                <div>
                  <label className="text-xs text-forest-500/70">{t.targetMetric}</label>
                  <select
                    value={solverMetric}
                    onChange={(e) => setSolverMetric(e.target.value as SolveMetric)}
                    className="mt-1.5 block rounded-sm border border-forest-500/20 bg-cream-50 px-3 py-2 text-sm text-forest-900 focus:border-forest-500 focus:outline-none"
                  >
                    <option value="roi">{t.solveRoi}</option>
                    <option value="cap">{t.solveCap}</option>
                    <option value="coc">{t.solveCoc}</option>
                    <option value="irr">{t.solveIrr}</option>
                  </select>
                </div>
                <div>
                  <label className="text-xs text-forest-500/70">{t.targetPct}</label>
                  <input
                    type="number"
                    value={solverTarget}
                    step={1}
                    onChange={(e) => setSolverTarget(Number(e.target.value))}
                    className="mt-1.5 block w-28 rounded-sm border border-forest-500/20 bg-cream-50 px-3 py-2 text-sm text-forest-900 focus:border-forest-500 focus:outline-none"
                  />
                </div>
              </div>
              {solvedMaxPrice != null ? (
                <div>
                  <p className="text-xs font-medium uppercase tracking-[0.2em] text-brass-500">{t.maxPurchasePrice}</p>
                  <p className="num mt-1 text-3xl text-forest-900">{money(solvedMaxPrice, true)}</p>
                  <p className="mt-1 text-[11px] text-forest-500/50">
                    {t.payUpTo(solverTarget, solveLabels(t)[solverMetric])}
                  </p>
                  <button
                    type="button"
                    onClick={() => set({ purchasePriceThb: Math.round(solvedMaxPrice) })}
                    className="mt-3 inline-flex items-center gap-2 rounded-sm border border-forest-500/25 px-4 py-2 text-sm font-medium text-forest-500 transition-colors hover:border-forest-500/50 hover:bg-forest-500/[0.04]"
                  >
                    {t.applyThisPrice}
                  </button>
                </div>
              ) : (
                <p className="text-sm leading-relaxed text-forest-500/60">
                  {isRent ? t.unreachableRent : t.unreachableHold}
                </p>
              )}
            </div>
          ) : null}
        </div>

        <SimilarObjects price={inputs.purchasePriceThb} catalog={catalog} excludeRw={excludeRw} money={money} t={t} />

        <p className="mt-6 text-[11px] leading-relaxed text-forest-500/50">
          {t.disclaimerMain}
          {isLeasehold ? t.disclaimerLease : ""}
          {t.disclaimerCurrency}
        </p>
      </div>
    </div>

    {/* Mobile sticky headline — keeps the payoff visible while editing inputs. */}
    {showMobileBar ? (
      <div className="fixed inset-x-0 bottom-0 z-40 border-t border-forest-500/15 bg-cream-100/95 px-4 py-2.5 shadow-[0_-4px_16px_rgba(0,0,0,0.08)] backdrop-blur lg:hidden">
        <div className="flex items-center justify-between gap-3">
          <div>
            <p className="text-[10px] uppercase tracking-wide text-forest-500/55">{t.inYr(inputs.years)}</p>
            <p className="num text-lg leading-tight text-forest-900">{money(r.projectedValue, true)}</p>
          </div>
          <div className="text-center">
            <p className="text-[10px] uppercase tracking-wide text-forest-500/55">{t.totalRoi}</p>
            <p className="num text-lg leading-tight text-brass-600">{fmtPct(r.roiPct)}</p>
          </div>
          <a
            href="#calc-results"
            className="rounded-sm bg-forest-500 px-3 py-2 text-xs font-medium text-cream-100"
          >
            {t.resultsBtn}
          </a>
        </div>
      </div>
    ) : null}
    </>
  );
}

function ModeTab({ active, onClick, icon: Icon, label }: { active: boolean; onClick: () => void; icon: typeof Home; label: string }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`flex flex-1 items-center justify-center gap-2 rounded-sm px-3 py-2 text-sm font-medium transition-colors ${
        active ? "bg-forest-500 text-cream-100" : "text-forest-500/70 hover:text-forest-500"
      }`}
    >
      <Icon className="h-4 w-4" />
      {label}
    </button>
  );
}

function PhaseTab({ active, onClick, label }: { active: boolean; onClick: () => void; label: string }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`flex-1 rounded-sm px-3 py-1.5 text-xs font-medium transition-colors ${
        active ? "bg-forest-500 text-cream-100" : "text-forest-500/70 hover:text-forest-500"
      }`}
    >
      {label}
    </button>
  );
}

function TenureTab({ active, onClick, label }: { active: boolean; onClick: () => void; label: string }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`flex-1 rounded-sm px-3 py-1.5 text-xs font-medium transition-colors ${
        active ? "bg-brass-500 text-cream-100" : "text-forest-500/70 hover:text-forest-500"
      }`}
    >
      {label}
    </button>
  );
}

function CurrencyPicker({ currency, onChange }: { currency: Currency; onChange: (c: Currency) => void }) {
  return (
    <select
      aria-label="Display currency"
      value={currency}
      onChange={(e) => onChange(e.target.value as Currency)}
      className="rounded-sm border border-forest-500/20 bg-cream-50 px-2 py-1 text-xs font-medium text-forest-500 focus:border-forest-500 focus:outline-none"
    >
      {CURRENCIES.map((c) => (
        <option key={c} value={c}>
          {c}
        </option>
      ))}
    </select>
  );
}

function WarnBox({ text }: { text: string }) {
  return (
    <p className="flex gap-1.5 rounded-sm border border-red-600/25 bg-red-600/[0.06] px-2.5 py-2 text-[11px] leading-relaxed text-red-700">
      <span aria-hidden>⚠</span>
      <span>{text}</span>
    </p>
  );
}

function Kpi({ label, value, accent, tip }: { label: string; value: string; accent?: boolean; tip?: string }) {
  return (
    <div>
      <p className="flex items-center text-[11px] uppercase tracking-wide text-forest-500/50">
        {label}
        {tip ? <InfoTip text={tip} /> : null}
      </p>
      <p className={`num mt-1 text-xl ${accent ? "text-brass-600" : "text-forest-900"}`}>{value}</p>
    </div>
  );
}

/** Hover/focus info bubble with a plain-language definition of a metric. */
function InfoTip({ text }: { text: string }) {
  return (
    <span className="group relative ml-1 inline-flex cursor-help align-middle" tabIndex={0}>
      <Info className="h-3 w-3 text-forest-500/40" />
      <span className="pointer-events-none absolute bottom-full left-1/2 z-20 mb-1 w-44 -translate-x-1/2 rounded-sm border border-forest-500/15 bg-forest-900 px-2 py-1.5 text-[10px] font-normal normal-case leading-snug tracking-normal text-cream-50 opacity-0 shadow-lg transition-opacity group-hover:opacity-100 group-focus:opacity-100">
        {text}
      </span>
    </span>
  );
}

/** One metric in the pinned-vs-current comparison strip. */
function CompareCell({
  label,
  pinned,
  current,
  delta,
  deltaPct,
  money,
}: {
  label: string;
  pinned: string;
  current: string;
  delta?: number;
  deltaPct?: number;
  money?: Money;
}) {
  const isPct = deltaPct !== undefined;
  const raw = isPct ? deltaPct! : delta ?? 0;
  const up = raw >= 0;
  const deltaText = isPct
    ? `${up ? "+" : ""}${deltaPct!.toLocaleString("en-US", { maximumFractionDigits: 1 })}pp`
    : money
      ? `${up ? "+" : "−"}${money(Math.abs(delta ?? 0))}`
      : "";
  return (
    <div>
      <p className="text-[10px] uppercase tracking-wide text-forest-500/50">{label}</p>
      <p className="num mt-1 text-sm text-forest-500/55">{pinned}</p>
      <p className="num text-sm text-forest-900">{current}</p>
      {deltaText ? <p className={`num text-[11px] ${up ? "text-brass-600" : "text-red-600"}`}>{deltaText}</p> : null}
    </div>
  );
}

/** Break-even readout: the occupancy / growth at which the deal matches a deposit. */
function BreakEven({
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

/** One-dimensional sensitivity: total ROI as the main driver moves off the base. */
function Sensitivity({ inputs, isRent, t }: { inputs: RoiInputs; isRent: boolean; t: CalcDict }) {
  const driverIsOcc = isRent;
  const base = driverIsOcc ? inputs.occupancyPct : inputs.annualGrowthPct;
  const steps = driverIsOcc ? [-20, -10, 0, 10, 20] : [-3, -1.5, 0, 1.5, 3];
  const rows = steps.map((d) => {
    const v = driverIsOcc ? Math.min(100, Math.max(0, base + d)) : base + d;
    const rr = computeRoi(
      driverIsOcc ? { ...inputs, seasonality: false, occupancyPct: v } : { ...inputs, annualGrowthPct: v },
    );
    return { v, d, roi: rr.roiPct };
  });
  return (
    <div className="mt-4 overflow-hidden rounded-sm border border-forest-500/10">
      <div className="bg-forest-500/5 px-4 py-2 text-[11px] text-forest-500/60">{t.sensHint}</div>
      <table className="w-full text-sm tabular-nums">
        <thead className="text-left text-xs uppercase tracking-wide text-forest-500/60">
          <tr>
            <th className="px-4 py-2 font-medium">{driverIsOcc ? t.sensDriverOccupancy : t.sensDriverGrowth}</th>
            <th className="px-4 py-2 text-right font-medium">{t.totalRoi}</th>
          </tr>
        </thead>
        <tbody>
          {rows.map((row) => (
            <tr key={row.d} className={`border-t border-forest-500/10 ${row.d === 0 ? "bg-brass-500/[0.06] font-medium" : ""}`}>
              <td className="px-4 py-2 text-forest-500/80">
                {row.v.toLocaleString("en-US", { maximumFractionDigits: 1 })}%
              </td>
              <td className="px-4 py-2 text-right text-forest-900">{fmtPct(row.roi)}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

/**
 * Slider + precise numeric input bound to the same value. Dragging is fast for
 * exploring; the number lets power users type an exact figure. Used for every
 * bounded assumption (percentages, years, months).
 */
function SliderField({
  label,
  value,
  onChange,
  min = 0,
  max = 100,
  step = 1,
  unit = "%",
  small,
}: {
  label: string;
  value: number;
  onChange: (v: number) => void;
  min?: number;
  max?: number;
  step?: number;
  unit?: string;
  small?: boolean;
}) {
  const clamp = (v: number) => Math.min(max, Math.max(min, v));
  return (
    <div>
      <div className="flex items-baseline justify-between gap-2">
        <label className={small ? "text-xs text-forest-500/70" : "text-sm text-forest-500/70"}>{label}</label>
        <div className="flex items-baseline gap-1">
          <input
            type="number"
            value={Number.isFinite(value) ? value : ""}
            step={step}
            min={min}
            max={max}
            onChange={(e) => onChange(Number(e.target.value))}
            onBlur={(e) => {
              // Commit a clamped value on leave — free typing stays unobstructed,
              // but an out-of-range figure can't persist into the engine.
              const v = Number(e.target.value);
              if (Number.isFinite(v)) onChange(clamp(v));
            }}
            className="w-16 rounded-sm border border-forest-500/20 bg-cream-50 px-2 py-1 text-right text-sm tabular-nums text-forest-900 focus:border-forest-500 focus:outline-none"
          />
          {unit ? <span className="text-xs text-forest-500/55">{unit}</span> : null}
        </div>
      </div>
      <input
        type="range"
        min={min}
        max={max}
        step={step}
        value={Number.isFinite(value) ? clamp(value) : min}
        onChange={(e) => onChange(Number(e.target.value))}
        className="mt-2 w-full cursor-pointer accent-forest-500"
        aria-label={label}
      />
    </div>
  );
}

/**
 * A cost field that the user can express either as a percentage of price or as
 * an absolute amount in the selected currency. State upstream stays a percent
 * (the engine is %-based); money entry is converted via the live price. The
 * other unit is always shown as an equivalent so both worlds stay visible.
 */
function PctOrMoneyField({
  label,
  t,
  pctValue,
  onChangePct,
  priceThb,
  currency,
  fx,
  rates,
  min = 0,
  max = 30,
  step = 0.5,
  small,
}: {
  label: string;
  t: CalcDict;
  pctValue: number;
  onChangePct: (pct: number) => void;
  priceThb: number;
  currency: Currency;
  fx: number;
  rates: Record<Currency, number>;
  min?: number;
  max?: number;
  step?: number;
  small?: boolean;
}) {
  const [mode, setMode] = useState<"pct" | "money">("pct");
  const amountThb = (priceThb || 0) * ((pctValue || 0) / 100);
  const toMoneyText = (thb: number) =>
    Number.isFinite(thb) ? String(currency === "THB" ? Math.round(thb) : Math.round(thb * fx)) : "";
  const [moneyText, setMoneyText] = useState(() => toMoneyText(amountThb));
  const [focused, setFocused] = useState(false);

  // Resync money text from the canonical percent when idle.
  useEffect(() => {
    if (mode === "money" && !focused) setMoneyText(toMoneyText(amountThb));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [amountThb, currency, fx, mode]);

  const onMoneyInput = (raw: string) => {
    setMoneyText(raw);
    const v = Number(raw);
    if (raw === "" || !Number.isFinite(v) || !priceThb) {
      onChangePct(0);
      return;
    }
    const thb = currency === "THB" ? v : v / fx;
    onChangePct((thb / priceThb) * 100);
  };

  const labelClass = small ? "text-xs text-forest-500/70" : "text-sm text-forest-500/70";

  return (
    <div>
      <div className="flex items-baseline justify-between gap-2">
        <label className={labelClass}>{label}</label>
        <div className="inline-flex overflow-hidden rounded-sm border border-forest-500/20 text-[10px] font-medium">
          <button
            type="button"
            onClick={() => setMode("pct")}
            className={`px-1.5 py-0.5 transition-colors ${mode === "pct" ? "bg-forest-500 text-cream-50" : "text-forest-500/60 hover:bg-forest-500/8"}`}
          >
            %
          </button>
          <button
            type="button"
            onClick={() => {
              setMoneyText(toMoneyText(amountThb));
              setMode("money");
            }}
            className={`px-1.5 py-0.5 transition-colors ${mode === "money" ? "bg-forest-500 text-cream-50" : "text-forest-500/60 hover:bg-forest-500/8"}`}
          >
            {currency}
          </button>
        </div>
      </div>

      {mode === "pct" ? (
        <>
          <div className="mt-1.5 flex items-center gap-3">
            <input
              type="range"
              min={min}
              max={max}
              step={step}
              value={Number.isFinite(pctValue) ? Math.min(max, Math.max(min, pctValue)) : min}
              onChange={(e) => onChangePct(Number(e.target.value))}
              className="w-full cursor-pointer accent-forest-500"
              aria-label={label}
            />
            <input
              type="number"
              value={Number.isFinite(pctValue) ? pctValue : ""}
              step={step}
              min={min}
              max={max}
              onChange={(e) => onChangePct(Number(e.target.value))}
              className="w-16 shrink-0 rounded-sm border border-forest-500/20 bg-cream-50 px-2 py-1 text-right text-sm tabular-nums text-forest-900 focus:border-forest-500 focus:outline-none"
            />
          </div>
          <p className="mt-1 text-[11px] text-forest-500/50">
            ≈ {formatMoney(amountThb, currency, rates, { compact: false })}
          </p>
        </>
      ) : (
        <>
          <input
            type="number"
            inputMode="numeric"
            min={0}
            value={moneyText}
            onFocus={() => setFocused(true)}
            onBlur={() => {
              setFocused(false);
              setMoneyText(toMoneyText(amountThb));
            }}
            onChange={(e) => onMoneyInput(e.target.value)}
            className="mt-1.5 w-full rounded-sm border border-forest-500/20 bg-cream-50 px-3 py-2 text-sm text-forest-900 focus:border-forest-500 focus:outline-none"
          />
          <p className="mt-1 text-[11px] text-forest-500/50">
            {t.pctOfPrice((Number.isFinite(pctValue) ? pctValue : 0).toLocaleString("en-US", { maximumFractionDigits: 2 }))}
          </p>
        </>
      )}
    </div>
  );
}

/**
 * Money input entered in the selected currency. Keeps its own text state so
 * typing isn't clobbered by the THB round-trip; state upstream stays in THB.
 * Resyncs the display when the currency or the external THB value changes.
 */
function MoneyField({
  label,
  thbValue,
  currency,
  fx,
  onChangeThb,
  hint,
  small,
}: {
  label: string;
  thbValue: number;
  currency: Currency;
  fx: number;
  onChangeThb: (thb: number) => void;
  hint?: string;
  small?: boolean;
}) {
  // Grouped (1,000,000) at rest for readability; bare digits while typing so the
  // caret never jumps. Parsing strips separators, so a pasted "1,000,000" works.
  const toText = (thb: number, grouped = true) => {
    if (!Number.isFinite(thb)) return "";
    const v = currency === "THB" ? Math.round(thb) : Math.round(thb * fx);
    return grouped ? v.toLocaleString("en-US") : String(v);
  };
  const [text, setText] = useState(() => toText(thbValue));
  const [focused, setFocused] = useState(false);

  // Resync from outside (currency switch, "Apply this price", etc.) when idle.
  useEffect(() => {
    if (!focused) setText(toText(thbValue));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [thbValue, currency, fx]);

  const onInput = (raw: string) => {
    setText(raw);
    const clean = raw.replace(/[^\d.]/g, "");
    const v = Number(clean);
    if (clean === "" || !Number.isFinite(v)) {
      onChangeThb(NaN);
      return;
    }
    onChangeThb(currency === "THB" ? v : v / fx);
  };

  return (
    <div>
      <div className="flex items-baseline justify-between">
        <label className={small ? "text-xs text-forest-500/70" : "text-sm text-forest-500/70"}>{label}</label>
        {hint ? <span className="text-xs font-medium text-forest-900">{hint}</span> : null}
      </div>
      <input
        type="text"
        inputMode="numeric"
        value={text}
        onFocus={() => {
          setFocused(true);
          setText(toText(thbValue, false));
        }}
        onBlur={() => {
          setFocused(false);
          setText(toText(thbValue, true));
        }}
        onChange={(e) => onInput(e.target.value)}
        className="mt-1.5 w-full rounded-sm border border-forest-500/20 bg-cream-50 px-3 py-2 text-sm tabular-nums text-forest-900 focus:border-forest-500 focus:outline-none"
      />
    </div>
  );
}

function BankCompare({ r, years, bankRate, money, t }: { r: RoiResult; years: number; bankRate: number; money: Money; t: CalcDict }) {
  const better = r.vsBankThb >= 0;
  return (
    <div className="mt-6 rounded-sm border border-forest-500/10 bg-cream-50 p-6">
      <p className="text-xs font-medium uppercase tracking-[0.2em] text-brass-500">{t.vsBank}</p>
      <div className="mt-4 space-y-2">
        <Row label={t.bankDeposit(bankRate)} value={money(r.bankFinal, true)} muted />
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
    </div>
  );
}

function Row({ label, value, muted }: { label: string; value: string; muted?: boolean }) {
  return (
    <div className="flex items-baseline justify-between border-b border-forest-500/10 pb-2 last:border-0">
      <span className={`text-sm ${muted ? "text-forest-500/60" : "text-forest-900"}`}>{label}</span>
      <span className={`text-sm font-medium tabular-nums ${muted ? "text-forest-500/60" : "text-forest-900"}`}>{value}</span>
    </div>
  );
}

/**
 * Value-over-time chart. In "owner" mode (hold/rent) the headline line is the
 * owner's total return if they sold that year — sale proceeds net of costs plus
 * rent collected (= profit + initial), so it agrees with the "vs bank" box and
 * the bank line (which also includes interest). In "asset" mode (off-plan) it
 * plots the asset value ramp instead, where the staggered-payment story lives in
 * the IRR/invested KPIs rather than this curve.
 */
function GrowthChart({
  r,
  money,
  t,
  mode,
}: {
  r: RoiResult;
  money: Money;
  t: CalcDict;
  mode: "owner" | "asset";
}) {
  const W = 640;
  const H = 220;
  const pad = { l: 8, r: 8, t: 12, b: 22 };
  const pts = r.series;
  const valueOf = (p: RoiYearPoint) => (mode === "owner" ? p.profit + r.initialInvestment : p.propertyValue);
  const maxV = Math.max(...pts.map((p) => Math.max(valueOf(p), p.bankValue)), 1);
  const n = pts.length - 1 || 1;
  const x = (i: number) => pad.l + (i / n) * (W - pad.l - pad.r);
  const y = (v: number) => pad.t + (1 - v / maxV) * (H - pad.t - pad.b);
  const propLine = pts.map((p, i) => `${x(i)},${y(valueOf(p))}`).join(" ");
  const bankLine = pts.map((p, i) => `${x(i)},${y(p.bankValue)}`).join(" ");
  const area = `${pad.l},${y(0)} ${propLine} ${x(n)},${y(0)}`;
  const grid = [0.25, 0.5, 0.75].map((f) => y(maxV * f));

  const wrapRef = useRef<HTMLDivElement>(null);
  const [hover, setHover] = useState<number | null>(null);
  const onMove = (clientX: number) => {
    const el = wrapRef.current;
    if (!el) return;
    const rect = el.getBoundingClientRect();
    const frac = Math.min(1, Math.max(0, (clientX - rect.left) / rect.width));
    setHover(Math.round(frac * n));
  };
  const hp = hover != null ? pts[Math.min(hover, n)] : null;
  const hi = hover != null ? Math.min(hover, n) : null;

  const lineLabel = mode === "owner" ? t.legendReturn : t.legendProperty;

  return (
    <div className="mt-4">
      <div
        ref={wrapRef}
        className="relative"
        onMouseMove={(e) => onMove(e.clientX)}
        onMouseLeave={() => setHover(null)}
        onTouchMove={(e) => onMove(e.touches[0].clientX)}
        onTouchEnd={() => setHover(null)}
      >
        <svg
          viewBox={`0 0 ${W} ${H}`}
          className="h-auto w-full select-none"
          role="img"
          aria-label="Projected return vs bank deposit over time"
        >
          <defs>
            <linearGradient id="propFill" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#B5651D" stopOpacity="0.18" />
              <stop offset="100%" stopColor="#B5651D" stopOpacity="0" />
            </linearGradient>
          </defs>
          {grid.map((gy, i) => (
            <line key={i} x1={pad.l} y1={gy} x2={W - pad.r} y2={gy} stroke="#3f4a40" strokeOpacity="0.08" strokeWidth="1" />
          ))}
          <polygon points={area} fill="url(#propFill)" />
          <polyline points={bankLine} fill="none" stroke="#3f4a40" strokeOpacity="0.35" strokeWidth="2" strokeDasharray="5 4" />
          <polyline points={propLine} fill="none" stroke="#B5651D" strokeWidth="2.5" />
          {pts.map((p, i) => (i === 0 || i === n ? <circle key={i} cx={x(i)} cy={y(valueOf(p))} r="3.5" fill="#B5651D" /> : null))}
          {hi != null && hp ? (
            <g>
              <line x1={x(hi)} y1={pad.t} x2={x(hi)} y2={H - pad.b} stroke="#3f4a40" strokeOpacity="0.25" strokeWidth="1" />
              <circle cx={x(hi)} cy={y(valueOf(hp))} r="4" fill="#B5651D" />
              <circle cx={x(hi)} cy={y(hp.bankValue)} r="3.5" fill="#3f4a40" fillOpacity="0.5" />
            </g>
          ) : null}
        </svg>
        {hi != null && hp ? (
          <div
            className="pointer-events-none absolute top-0 z-10 -translate-x-1/2 rounded-sm border border-forest-500/15 bg-cream-50/95 px-2.5 py-1.5 text-[11px] shadow-sm backdrop-blur"
            style={{ left: `${(hi / n) * 100}%` }}
          >
            <p className="font-medium text-forest-900">{hi === 0 ? t.now : t.chartTipYear(hi)}</p>
            <p className="mt-0.5 text-brass-600">{money(valueOf(hp), true)}</p>
            <p className="text-forest-500/55">{t.legendBank}: {money(hp.bankValue, true)}</p>
          </div>
        ) : null}
      </div>
      <div className="mt-2 flex justify-between text-[11px] text-forest-500/50">
        <span>{t.now} · {money(valueOf(pts[0]))}</span>
        <span className="text-brass-600">{t.yearN(n)} · {money(valueOf(pts[n]))}</span>
      </div>
      <div className="mt-3 flex flex-wrap gap-x-4 gap-y-1 text-[11px] text-forest-500/60">
        <span className="inline-flex items-center gap-1.5"><span className="h-0.5 w-4 bg-brass-500" /> {lineLabel}</span>
        <span className="inline-flex items-center gap-1.5"><span className="h-0.5 w-4 border-t-2 border-dashed border-forest-500/40" /> {t.legendBank}</span>
      </div>
    </div>
  );
}

function YearTable({ r, money, isRent, t }: { r: RoiResult; money: Money; isRent: boolean; t: CalcDict }) {
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

function SimilarObjects({
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
      <div className="mt-6 grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {matches.map((o) => (
          <ObjectCard key={o.id} object={o} />
        ))}
      </div>
      <Link
        href={href}
        className="mt-6 inline-flex items-center gap-2 rounded-sm bg-forest-500 px-5 py-2.5 text-sm font-medium text-cream-100 transition-colors hover:bg-forest-400"
      >
        {t.findForBudget}
        <ArrowRight className="h-4 w-4" />
      </Link>
    </div>
  );
}
