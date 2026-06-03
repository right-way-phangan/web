"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import type { Route } from "next";
import { ChevronDown, TrendingUp, ArrowRight, Home, Hotel, Download } from "lucide-react";
import {
  computeRoi,
  DEFAULT_INPUTS,
  SCENARIOS,
  solveMaxPrice,
  type RoiInputs,
  type RoiResult,
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
import { buildCalcReportHtml } from "@/lib/calculator/report";
import type { RealEstateObject } from "@/types/object";

const fmtPct = (n: number) =>
  !isFinite(n) ? "—" : `${n >= 0 ? "+" : ""}${n.toLocaleString("en-US", { maximumFractionDigits: 1 })}%`;

const SOLVE_LABELS: Record<SolveMetric, string> = {
  roi: "total ROI",
  cap: "cap rate",
  coc: "cash-on-cash",
  irr: "IRR / year",
};

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
}

export function RoiCalculator({
  initialPriceThb,
  initialMode,
  initialTenure,
  initialLeaseTermYears,
  initialOffplan,
  catalog = [],
  excludeRw,
}: Props) {
  const [inputs, setInputs] = useState<RoiInputs>({
    ...DEFAULT_INPUTS,
    purchasePriceThb: initialPriceThb ?? DEFAULT_INPUTS.purchasePriceThb,
    mode: initialMode ?? DEFAULT_INPUTS.mode,
    tenure: initialTenure ?? DEFAULT_INPUTS.tenure,
    leaseTermYears: initialLeaseTermYears ?? DEFAULT_INPUTS.leaseTermYears,
    offplan: initialOffplan ?? DEFAULT_INPUTS.offplan,
  });
  const [showAdvanced, setShowAdvanced] = useState(false);
  const [showYears, setShowYears] = useState(false);
  const [showSolver, setShowSolver] = useState(false);
  const [solverMetric, setSolverMetric] = useState<SolveMetric>("roi");
  const [solverTarget, setSolverTarget] = useState(60);
  const [currency, setCurrency] = useState<Currency>("THB");
  const [rates, setRates] = useState<Record<Currency, number>>(DEFAULT_RATES);

  // Best-effort live FX once mounted.
  useEffect(() => {
    fetchRates().then((r) => r && setRates(r));
  }, []);

  const r = useMemo(() => computeRoi(inputs), [inputs]);
  const solvedMaxPrice = useMemo(
    () => (showSolver ? solveMaxPrice(inputs, solverMetric, solverTarget) : null),
    [showSolver, inputs, solverMetric, solverTarget],
  );
  const set = (patch: Partial<RoiInputs>) => setInputs((p) => ({ ...p, ...patch }));
  const money: Money = (thb, full) => formatMoney(thb, currency, rates, { compact: !full });

  // Money inputs are entered in the selected currency; state stays in THB.
  const fx = rates[currency] ?? 1; // foreign units per 1 THB
  const toCcy = (thb: number) => (currency === "THB" ? thb : Math.round(thb * fx));
  const fromCcy = (v: number) => (currency === "THB" ? v : Math.round(v / fx));
  const moneyStep = (thbStep: number) => (currency === "THB" ? thbStep : Math.max(1, Math.round(thbStep * fx)));
  const thbHint = (thb: number) =>
    currency === "THB" ? money(thb) : `≈ ${formatMoney(thb, "THB", rates, { compact: true })}`;

  const openReport = () => {
    const html = buildCalcReportHtml({ inputs, result: r, currency, rates, rwNumber: excludeRw });
    const w = window.open("", "_blank");
    if (!w) return; // popup blocked — silently ignore
    w.document.open();
    w.document.write(html);
    w.document.close();
  };

  const activeScenario = SCENARIOS.find((s) => s.growthPct === inputs.annualGrowthPct)?.key;
  const isOffplan = inputs.offplan;
  const isRent = inputs.mode === "rent" && !isOffplan;
  const isLeasehold = inputs.tenure === "leasehold";
  const isSeasonal = inputs.seasonality;
  const installmentPct = Math.max(0, 100 - inputs.downPaymentPct - inputs.handoverPaymentPct);

  const strategyLabel = isOffplan ? "Off-plan (new build)" : isRent ? "Buy & Rent" : "Buy & Hold";
  const calcSummary = [
    `Investment calculation${excludeRw ? ` — ${excludeRw}` : ""} (${strategyLabel})`,
    `Tenure: ${isLeasehold ? `Leasehold, ${inputs.leaseTermYears}-yr term` : "Freehold"}`,
    `${isOffplan ? "Contract price" : "Purchase price"}: ${formatMoney(inputs.purchasePriceThb, "THB", rates, { compact: false })}`,
    isOffplan
      ? `Plan: ${inputs.downPaymentPct}% down · ${installmentPct.toFixed(0)}% during ${inputs.constructionMonths}mo build · ${inputs.handoverPaymentPct}% at handover`
      : "",
    isOffplan ? `Value at handover (+${inputs.handoverUpliftPct}%): ${formatMoney(r.handoverValue, "THB", rates, { compact: false })}` : "",
    `Annual growth: ${inputs.annualGrowthPct}% over ${inputs.years} years`,
    `Projected value: ${formatMoney(r.projectedValue, "THB", rates, { compact: false })}`,
    `Total ROI: ${fmtPct(r.roiPct)} · CAGR ${fmtPct(r.cagrPct)}/yr${isRent || isOffplan ? ` · IRR ${fmtPct(r.irrPct)}` : ""}`,
    isRent ? `Cap rate ${fmtPct(r.capRatePct)} · Cash-on-cash ${fmtPct(r.cashOnCashPct)}` : "",
    isRent && isSeasonal
      ? `Seasonality: ${inputs.highSeasonMonths}mo high @ ${inputs.highSeasonOccupancyPct}% (+${inputs.highSeasonRateUpliftPct}% rate) · low @ ${inputs.lowSeasonOccupancyPct}%`
      : "",
    isRent ? `Net rental income: ${formatMoney(r.rentNetTotal, "THB", rates, { compact: false })}` : "",
    `Net profit: ${formatMoney(r.netProfit, "THB", rates, { compact: false })}`,
    `vs bank (${inputs.bankRatePct}%): ${formatMoney(r.vsBankThb, "THB", rates)} more`,
    ``,
    `Please send me this calculation and get in touch.`,
  ]
    .filter(Boolean)
    .join("\n");

  return (
    <div className="grid gap-10 lg:grid-cols-[380px_1fr] lg:gap-14">
      {/* ---- Parameters ---- */}
      <div>
        {/* Phase — completed resale vs off-plan new build (RW-P projects) */}
        <div className="flex gap-1 rounded-sm border border-forest-500/15 bg-cream-50 p-1">
          <PhaseTab active={!isOffplan} onClick={() => set({ offplan: false })} label="Completed" />
          <PhaseTab active={isOffplan} onClick={() => set({ offplan: true })} label="Off-plan (new build)" />
        </div>

        {/* Mode tabs (completed only) */}
        {!isOffplan ? (
          <div className="mt-3 flex gap-2 rounded-sm border border-forest-500/15 bg-cream-50 p-1">
            <ModeTab active={!isRent} onClick={() => set({ mode: "hold" as CalcMode })} icon={Home} label="Buy & Hold" />
            <ModeTab active={isRent} onClick={() => set({ mode: "rent" as CalcMode })} icon={Hotel} label="Buy & Rent" />
          </div>
        ) : null}

        {/* Tenure — Thailand-specific. Leasehold value decays as the lease runs down. */}
        <div className="mt-3 flex gap-1 rounded-sm border border-forest-500/15 bg-cream-50 p-1">
          <TenureTab active={!isLeasehold} onClick={() => set({ tenure: "freehold" as Tenure })} label="Freehold" />
          <TenureTab active={isLeasehold} onClick={() => set({ tenure: "leasehold" as Tenure })} label="Leasehold" />
        </div>

        <p className="mt-6 text-xs font-medium uppercase tracking-[0.2em] text-brass-500">
          Your assumptions
        </p>
        <p className="mt-1 text-[11px] text-forest-500/50">
          Pre-filled with typical Koh Phangan figures — adjust to your case.
        </p>

        <div className="mt-6 space-y-5">
          <NumberField
            label={`${isOffplan ? "Contract price" : "Purchase price"} (${currency})`}
            value={toCcy(inputs.purchasePriceThb)}
            step={moneyStep(100000)}
            onChange={(v) => set({ purchasePriceThb: fromCcy(v) })}
            hint={thbHint(inputs.purchasePriceThb)}
          />

          <div>
            <label className="text-sm text-forest-500/70">Expected annual price growth (%)</label>
            <div className="mt-2 flex gap-2">
              {SCENARIOS.map((s) => (
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
                  {s.labelEn}
                  <span className="block text-[10px] opacity-70">{s.growthPct}%</span>
                </button>
              ))}
            </div>
            <input
              type="number"
              value={inputs.annualGrowthPct}
              min={-10}
              max={30}
              step={0.5}
              onChange={(e) => set({ annualGrowthPct: Number(e.target.value) })}
              className="mt-2 w-full rounded-sm border border-forest-500/20 bg-cream-50 px-3 py-2 text-sm text-forest-900 focus:border-forest-500 focus:outline-none"
            />
            <p className="mt-1 text-[11px] text-forest-500/50">You set this — adjust to your own outlook.</p>
          </div>

          <NumberField label="Holding period (years)" value={inputs.years} step={1} min={1} max={40} onChange={(v) => set({ years: v })} />

          {/* Leasehold-only: total lease term + decay note */}
          {isLeasehold ? (
            <div className="space-y-2 rounded-sm border border-forest-500/10 bg-forest-500/[0.03] p-4">
              <NumberField label="Total lease term (years)" value={inputs.leaseTermYears} step={1} min={1} max={90} onChange={(v) => set({ leaseTermYears: v })} small />
              <p className="text-[11px] leading-relaxed text-forest-500/55">
                A leasehold&apos;s resale value falls as the term runs down — we
                discount the projection by the remaining years of the lease.
              </p>
            </div>
          ) : null}

          {/* Off-plan-only inputs */}
          {isOffplan ? (
            <div className="space-y-4 rounded-sm border border-brass-500/20 bg-brass-500/[0.04] p-4">
              <p className="text-[11px] font-medium uppercase tracking-wide text-brass-600">Construction & payment plan</p>
              <NumberField label="Construction period (months)" value={inputs.constructionMonths} step={1} min={1} max={84} onChange={(v) => set({ constructionMonths: v })} small />
              <NumberField label="Down payment (% now)" value={inputs.downPaymentPct} step={5} min={0} max={100} onChange={(v) => set({ downPaymentPct: v })} small />
              <NumberField label="Balance at handover (%)" value={inputs.handoverPaymentPct} step={5} min={0} max={100} onChange={(v) => set({ handoverPaymentPct: v })} small />
              <NumberField label="Value uplift to handover (%)" value={inputs.handoverUpliftPct} step={1} onChange={(v) => set({ handoverUpliftPct: v })} small />
              <p className="text-[11px] leading-relaxed text-forest-500/55">
                {installmentPct.toFixed(0)}% paid in instalments during construction.
                Price growth above applies after handover. &ldquo;Years&rdquo; is the
                total horizon from contract.
              </p>
            </div>
          ) : null}

          {/* Rent-only inputs */}
          {isRent ? (
            <div className="space-y-4 rounded-sm border border-brass-500/20 bg-brass-500/[0.04] p-4">
              <div className="flex items-center justify-between">
                <p className="text-[11px] font-medium uppercase tracking-wide text-brass-600">Rental assumptions</p>
                <label className="flex cursor-pointer items-center gap-1.5 text-[11px] text-forest-500/70">
                  <input
                    type="checkbox"
                    checked={isSeasonal}
                    onChange={(e) => set({ seasonality: e.target.checked })}
                    className="h-3.5 w-3.5 accent-brass-500"
                  />
                  High/low season
                </label>
              </div>
              <NumberField label={`Nightly rate (${currency})`} value={toCcy(inputs.nightlyRateThb)} step={moneyStep(500)} onChange={(v) => set({ nightlyRateThb: fromCcy(v) })} hint={thbHint(inputs.nightlyRateThb)} small />
              {isSeasonal ? (
                <div className="space-y-4 rounded-sm border border-brass-500/15 bg-cream-50/60 p-3">
                  <NumberField label="High season length (months)" value={inputs.highSeasonMonths} step={1} min={0} max={12} onChange={(v) => set({ highSeasonMonths: v })} small />
                  <NumberField label="High season occupancy (%)" value={inputs.highSeasonOccupancyPct} step={5} min={0} max={100} onChange={(v) => set({ highSeasonOccupancyPct: v })} small />
                  <NumberField label="High season rate uplift (%)" value={inputs.highSeasonRateUpliftPct} step={5} min={0} onChange={(v) => set({ highSeasonRateUpliftPct: v })} small />
                  <NumberField label="Low season occupancy (%)" value={inputs.lowSeasonOccupancyPct} step={5} min={0} max={100} onChange={(v) => set({ lowSeasonOccupancyPct: v })} small />
                </div>
              ) : (
                <NumberField label="Occupancy (%)" value={inputs.occupancyPct} step={5} min={0} max={100} onChange={(v) => set({ occupancyPct: v })} small />
              )}
              <NumberField label="Management fee (% of rent)" value={inputs.mgmtFeePct} step={1} min={0} max={100} onChange={(v) => set({ mgmtFeePct: v })} small />
              <NumberField label="Operating expenses (% of price/yr)" value={inputs.opexPct} step={0.5} min={0} onChange={(v) => set({ opexPct: v })} small />
              <NumberField label="Annual rate growth (%)" value={inputs.rentGrowthPct} step={0.5} onChange={(v) => set({ rentGrowthPct: v })} small />
            </div>
          ) : null}

          <button
            type="button"
            onClick={() => setShowAdvanced((v) => !v)}
            className="flex items-center gap-1.5 text-xs font-medium text-forest-500/70 hover:text-forest-500"
          >
            <ChevronDown className={`h-3.5 w-3.5 transition-transform ${showAdvanced ? "rotate-180" : ""}`} />
            Advanced costs
          </button>
          {showAdvanced ? (
            <div className="space-y-4 rounded-sm border border-forest-500/10 bg-forest-500/[0.03] p-4">
              <NumberField label="Entry costs — DD + transfer (%)" value={inputs.closingCostsPct} step={0.5} onChange={(v) => set({ closingCostsPct: v })} small />
              <NumberField label="Exit costs — transfer + commission (%)" value={inputs.saleCostsPct} step={0.5} onChange={(v) => set({ saleCostsPct: v })} small />
              <NumberField label="Annual holding costs (% of price)" value={inputs.annualHoldingPct} step={0.1} onChange={(v) => set({ annualHoldingPct: v })} small />
              <NumberField label="Bank deposit rate (%)" value={inputs.bankRatePct} step={0.25} onChange={(v) => set({ bankRatePct: v })} small />
            </div>
          ) : null}
        </div>
      </div>

      {/* ---- Results ---- */}
      <div>
        <div className="rounded-sm border border-forest-500/10 bg-cream-50 p-6 md:p-8">
          <div className="flex items-start justify-between gap-4">
            <p className="text-xs font-medium uppercase tracking-[0.2em] text-brass-500">
              Projected value in {inputs.years} years
            </p>
            <CurrencyPicker currency={currency} onChange={setCurrency} />
          </div>
          <p className="mt-2 font-serif text-4xl text-forest-900 md:text-5xl">{money(r.projectedValue, true)}</p>

          <div className="mt-6 grid grid-cols-3 gap-4 border-t border-forest-500/10 pt-6">
            <Kpi label="Total ROI" value={fmtPct(r.roiPct)} accent />
            <Kpi label="CAGR / year" value={fmtPct(r.cagrPct)} />
            <Kpi label="Net profit" value={money(r.netProfit)} />
          </div>

          {isOffplan ? (
            <div className="mt-4 grid grid-cols-3 gap-4 border-t border-forest-500/10 pt-4">
              <Kpi label="Value at handover" value={money(r.handoverValue)} />
              <Kpi label="IRR / year" value={fmtPct(r.irrPct)} accent />
              <Kpi label="Total invested" value={money(r.initialInvestment)} />
            </div>
          ) : isRent ? (
            <div className="mt-4 grid grid-cols-3 gap-4 border-t border-forest-500/10 pt-4">
              <Kpi label="Cap rate" value={fmtPct(r.capRatePct)} />
              <Kpi label="Cash-on-cash" value={fmtPct(r.cashOnCashPct)} />
              <Kpi label="IRR / year" value={fmtPct(r.irrPct)} />
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
              Download PDF report
            </button>
          </div>
        </div>

        <BankCompare r={r} years={inputs.years} bankRate={inputs.bankRatePct} money={money} />

        <div className="mt-6 rounded-sm border border-forest-500/10 bg-cream-50 p-6">
          <div className="flex items-center gap-2 text-xs font-medium uppercase tracking-[0.2em] text-brass-500">
            <TrendingUp className="h-4 w-4" />
            Capital growth
          </div>
          <GrowthChart r={r} money={money} />
        </div>

        <div className="mt-6">
          <button
            type="button"
            onClick={() => setShowYears((v) => !v)}
            className="flex items-center gap-1.5 text-sm font-medium text-forest-500/80 hover:text-forest-500"
          >
            <ChevronDown className={`h-4 w-4 transition-transform ${showYears ? "rotate-180" : ""}`} />
            Show year-by-year
          </button>
          {showYears ? <YearTable r={r} money={money} isRent={isRent} /> : null}
        </div>

        {/* Reverse: solve max price for a target return */}
        <div className="mt-4">
          <button
            type="button"
            onClick={() => setShowSolver((v) => !v)}
            className="flex items-center gap-1.5 text-sm font-medium text-forest-500/80 hover:text-forest-500"
          >
            <ChevronDown className={`h-4 w-4 transition-transform ${showSolver ? "rotate-180" : ""}`} />
            Find max price for a target return
          </button>
          {showSolver ? (
            <div className="mt-4 space-y-4 rounded-sm border border-forest-500/10 bg-cream-50 p-6">
              <div className="flex flex-wrap items-end gap-3">
                <div>
                  <label className="text-xs text-forest-500/70">Target metric</label>
                  <select
                    value={solverMetric}
                    onChange={(e) => setSolverMetric(e.target.value as SolveMetric)}
                    className="mt-1.5 block rounded-sm border border-forest-500/20 bg-cream-50 px-3 py-2 text-sm text-forest-900 focus:border-forest-500 focus:outline-none"
                  >
                    <option value="roi">Total ROI</option>
                    <option value="cap">Cap rate</option>
                    <option value="coc">Cash-on-cash</option>
                    <option value="irr">IRR / year</option>
                  </select>
                </div>
                <div>
                  <label className="text-xs text-forest-500/70">Target (%)</label>
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
                  <p className="text-xs font-medium uppercase tracking-[0.2em] text-brass-500">Max purchase price</p>
                  <p className="mt-1 font-serif text-3xl text-forest-900">{money(solvedMaxPrice, true)}</p>
                  <p className="mt-1 text-[11px] text-forest-500/50">
                    Pay up to this and you still hit {solverTarget}% {SOLVE_LABELS[solverMetric]}.
                  </p>
                  <button
                    type="button"
                    onClick={() => set({ purchasePriceThb: Math.round(solvedMaxPrice) })}
                    className="mt-3 inline-flex items-center gap-2 rounded-sm border border-forest-500/25 px-4 py-2 text-sm font-medium text-forest-500 transition-colors hover:border-forest-500/50 hover:bg-forest-500/[0.04]"
                  >
                    Apply this price
                  </button>
                </div>
              ) : (
                <p className="text-sm leading-relaxed text-forest-500/60">
                  {isRent
                    ? "That target isn't reachable in a sensible price range — try a lower target."
                    : "Appreciation-only return doesn't depend on price (every figure scales with it). Switch to Buy & Rent — where rent is a fixed amount — to solve for a max price."}
                </p>
              )}
            </div>
          ) : null}
        </div>

        <SimilarObjects price={inputs.purchasePriceThb} catalog={catalog} excludeRw={excludeRw} money={money} />

        <p className="mt-6 text-[11px] leading-relaxed text-forest-500/50">
          Illustrative projection based on the assumptions you enter — not a
          forecast or guarantee of future returns.{" "}
          {isLeasehold
            ? "Leasehold value is discounted by the remaining lease term (a simplified linear model). "
            : ""}
          Currency conversion is for display only; figures are computed in THB.
          Speak with Right Way for a property-specific assessment.
        </p>
      </div>
    </div>
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

function Kpi({ label, value, accent }: { label: string; value: string; accent?: boolean }) {
  return (
    <div>
      <p className="text-[11px] uppercase tracking-wide text-forest-500/50">{label}</p>
      <p className={`mt-1 font-serif text-xl ${accent ? "text-brass-600" : "text-forest-900"}`}>{value}</p>
    </div>
  );
}

function NumberField({
  label,
  value,
  onChange,
  step = 1,
  min,
  max,
  hint,
  small,
}: {
  label: string;
  value: number;
  onChange: (v: number) => void;
  step?: number;
  min?: number;
  max?: number;
  hint?: string;
  small?: boolean;
}) {
  return (
    <div>
      <div className="flex items-baseline justify-between">
        <label className={small ? "text-xs text-forest-500/70" : "text-sm text-forest-500/70"}>{label}</label>
        {hint ? <span className="text-xs font-medium text-forest-900">{hint}</span> : null}
      </div>
      <input
        type="number"
        value={Number.isFinite(value) ? value : ""}
        step={step}
        min={min}
        max={max}
        onChange={(e) => onChange(Number(e.target.value))}
        className="mt-1.5 w-full rounded-sm border border-forest-500/20 bg-cream-50 px-3 py-2 text-sm text-forest-900 focus:border-forest-500 focus:outline-none"
      />
    </div>
  );
}

function BankCompare({ r, years, bankRate, money }: { r: RoiResult; years: number; bankRate: number; money: Money }) {
  const better = r.vsBankThb >= 0;
  return (
    <div className="mt-6 rounded-sm border border-forest-500/10 bg-cream-50 p-6">
      <p className="text-xs font-medium uppercase tracking-[0.2em] text-brass-500">vs a bank deposit</p>
      <div className="mt-4 space-y-2">
        <Row label={`Bank deposit (${bankRate}%)`} value={money(r.bankFinal, true)} muted />
        <Row label="This property" value={money(r.totalReturn, true)} />
      </div>
      <p className="mt-4 font-serif text-lg text-forest-900">
        {better ? (
          <>
            <span className="text-brass-600">{money(r.vsBankThb)}</span> more than the bank over {years} years
          </>
        ) : (
          <>{money(Math.abs(r.vsBankThb))} less than the bank — try a higher growth rate or longer horizon</>
        )}
      </p>
    </div>
  );
}

function Row({ label, value, muted }: { label: string; value: string; muted?: boolean }) {
  return (
    <div className="flex items-baseline justify-between border-b border-forest-500/10 pb-2 last:border-0">
      <span className={`text-sm ${muted ? "text-forest-500/60" : "text-forest-900"}`}>{label}</span>
      <span className={`text-sm font-medium ${muted ? "text-forest-500/60" : "text-forest-900"}`}>{value}</span>
    </div>
  );
}

function GrowthChart({ r, money }: { r: RoiResult; money: Money }) {
  const W = 640;
  const H = 220;
  const pad = { l: 8, r: 8, t: 12, b: 22 };
  const pts = r.series;
  const maxV = Math.max(...pts.map((p) => Math.max(p.propertyValue, p.bankValue)), 1);
  const n = pts.length - 1 || 1;
  const x = (i: number) => pad.l + (i / n) * (W - pad.l - pad.r);
  const y = (v: number) => pad.t + (1 - v / maxV) * (H - pad.t - pad.b);
  const line = (sel: (p: (typeof pts)[number]) => number) => pts.map((p, i) => `${x(i)},${y(sel(p))}`).join(" ");
  const propLine = line((p) => p.propertyValue);
  const area = `${pad.l},${y(0)} ${propLine} ${x(n)},${y(0)}`;

  return (
    <div className="mt-4">
      <svg viewBox={`0 0 ${W} ${H}`} className="h-auto w-full" preserveAspectRatio="none" role="img" aria-label="Projected property value vs bank deposit over time">
        <defs>
          <linearGradient id="propFill" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#B5651D" stopOpacity="0.18" />
            <stop offset="100%" stopColor="#B5651D" stopOpacity="0" />
          </linearGradient>
        </defs>
        <polygon points={area} fill="url(#propFill)" />
        <polyline points={line((p) => p.bankValue)} fill="none" stroke="#3f4a40" strokeOpacity="0.35" strokeWidth="2" strokeDasharray="5 4" />
        <polyline points={propLine} fill="none" stroke="#B5651D" strokeWidth="2.5" />
        {pts.map((p, i) => (i === 0 || i === n ? <circle key={i} cx={x(i)} cy={y(p.propertyValue)} r="3.5" fill="#B5651D" /> : null))}
      </svg>
      <div className="mt-2 flex justify-between text-[11px] text-forest-500/50">
        <span>Now · {money(pts[0].propertyValue)}</span>
        <span className="text-brass-600">Year {n} · {money(pts[n].propertyValue)}</span>
      </div>
      <div className="mt-3 flex gap-4 text-[11px] text-forest-500/60">
        <span className="inline-flex items-center gap-1.5"><span className="h-0.5 w-4 bg-brass-500" /> Property</span>
        <span className="inline-flex items-center gap-1.5"><span className="h-0.5 w-4 border-t-2 border-dashed border-forest-500/40" /> Bank deposit</span>
      </div>
    </div>
  );
}

function YearTable({ r, money, isRent }: { r: RoiResult; money: Money; isRent: boolean }) {
  return (
    <div className="mt-4 overflow-hidden rounded-sm border border-forest-500/10">
      <table className="w-full text-sm">
        <thead className="bg-forest-500/5 text-left text-xs uppercase tracking-wide text-forest-500/60">
          <tr>
            <th className="px-4 py-2 font-medium">Year</th>
            <th className="px-4 py-2 text-right font-medium">Value</th>
            {isRent ? <th className="px-4 py-2 text-right font-medium">Net rent</th> : null}
            <th className="px-4 py-2 text-right font-medium">Cumulative profit</th>
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
}: {
  price: number;
  catalog: RealEstateObject[];
  excludeRw?: string;
  money: Money;
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
      <p className="text-xs font-medium uppercase tracking-[0.2em] text-brass-500">Properties for this budget</p>
      <h3 className="mt-3 font-serif text-2xl text-forest-900">
        Around {money(price)} — {matches.length} match{matches.length === 1 ? "" : "es"}
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
        Find properties for this budget
        <ArrowRight className="h-4 w-4" />
      </Link>
    </div>
  );
}
