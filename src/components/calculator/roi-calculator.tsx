"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import type { Route } from "next";
import { ChevronDown, TrendingUp, ArrowRight } from "lucide-react";
import {
  computeRoi,
  DEFAULT_INPUTS,
  SCENARIOS,
  type RoiInputs,
  type RoiResult,
} from "@/lib/calculator/roi";
import { formatPriceTHB, formatPriceCompact } from "@/lib/utils/price";
import { ObjectCard } from "@/components/objects/object-card";
import type { RealEstateObject } from "@/types/object";

const fmtPct = (n: number) =>
  `${n >= 0 ? "+" : ""}${n.toLocaleString("en-US", { maximumFractionDigits: 1 })}%`;

interface Props {
  initialPriceThb?: number;
  /** Catalog for the "similar objects" lead-gen block. */
  catalog?: RealEstateObject[];
  /** RW number to exclude from "similar objects" (the object being viewed). */
  excludeRw?: string;
  /** Tighter layout when embedded on an object page. */
  compact?: boolean;
}

export function RoiCalculator({ initialPriceThb, catalog = [], excludeRw, compact = false }: Props) {
  const [inputs, setInputs] = useState<RoiInputs>({
    ...DEFAULT_INPUTS,
    purchasePriceThb: initialPriceThb ?? DEFAULT_INPUTS.purchasePriceThb,
  });
  const [showAdvanced, setShowAdvanced] = useState(false);
  const [showYears, setShowYears] = useState(false);

  const r = useMemo(() => computeRoi(inputs), [inputs]);
  const set = (patch: Partial<RoiInputs>) => setInputs((p) => ({ ...p, ...patch }));

  const activeScenario = SCENARIOS.find((s) => s.growthPct === inputs.annualGrowthPct)?.key;

  return (
    <div className={compact ? "" : "grid gap-10 lg:grid-cols-[380px_1fr] lg:gap-14"}>
      {/* ---- Parameters ---- */}
      <div className={compact ? "rounded-sm border border-forest-500/10 bg-cream-50 p-6" : ""}>
        <p className="text-xs font-medium uppercase tracking-[0.2em] text-brass-500">
          Your assumptions
        </p>

        <div className="mt-6 space-y-5">
          <NumberField
            label="Purchase price (THB)"
            value={inputs.purchasePriceThb}
            step={100000}
            onChange={(v) => set({ purchasePriceThb: v })}
            hint={formatPriceCompact(inputs.purchasePriceThb)}
          />

          {/* Scenario presets — editable, never asserted as our claim */}
          <div>
            <label className="text-sm text-forest-500/70">
              Expected annual price growth (%)
            </label>
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
            <p className="mt-1 text-[11px] text-forest-500/50">
              You set this — adjust to your own outlook.
            </p>
          </div>

          <NumberField
            label="Holding period (years)"
            value={inputs.years}
            step={1}
            min={1}
            max={40}
            onChange={(v) => set({ years: v })}
          />

          {/* Advanced */}
          <button
            type="button"
            onClick={() => setShowAdvanced((v) => !v)}
            className="flex items-center gap-1.5 text-xs font-medium text-forest-500/70 hover:text-forest-500"
          >
            <ChevronDown
              className={`h-3.5 w-3.5 transition-transform ${showAdvanced ? "rotate-180" : ""}`}
            />
            Advanced costs
          </button>
          {showAdvanced ? (
            <div className="space-y-4 rounded-sm border border-forest-500/10 bg-forest-500/[0.03] p-4">
              <NumberField label="Entry costs — DD + transfer (%)" value={inputs.closingCostsPct} step={0.5} onChange={(v) => set({ closingCostsPct: v })} small />
              <NumberField label="Exit costs — transfer + commission (%)" value={inputs.saleCostsPct} step={0.5} onChange={(v) => set({ saleCostsPct: v })} small />
              <NumberField label="Annual holding costs (THB)" value={inputs.annualHoldingThb} step={5000} onChange={(v) => set({ annualHoldingThb: v })} small />
              <NumberField label="Bank deposit rate (%)" value={inputs.bankRatePct} step={0.25} onChange={(v) => set({ bankRatePct: v })} small />
            </div>
          ) : null}
        </div>
      </div>

      {/* ---- Results ---- */}
      <div className={compact ? "mt-8" : ""}>
        {/* Headline projected value */}
        <div className="rounded-sm border border-forest-500/10 bg-cream-50 p-6 md:p-8">
          <p className="text-xs font-medium uppercase tracking-[0.2em] text-brass-500">
            Projected value in {inputs.years} years
          </p>
          <p className="mt-2 font-serif text-4xl text-forest-900 md:text-5xl">
            {formatPriceTHB(r.projectedValue)}
          </p>

          <div className="mt-6 grid grid-cols-3 gap-4 border-t border-forest-500/10 pt-6">
            <Kpi label="Total ROI" value={fmtPct(r.roiPct)} accent />
            <Kpi label="CAGR / year" value={fmtPct(r.cagrPct)} />
            <Kpi label="Net profit" value={formatPriceCompact(r.netProfit)} />
          </div>
        </div>

        {/* Bank comparison */}
        <BankCompare r={r} years={inputs.years} bankRate={inputs.bankRatePct} />

        {/* Growth chart */}
        <div className="mt-6 rounded-sm border border-forest-500/10 bg-cream-50 p-6">
          <div className="flex items-center gap-2 text-xs font-medium uppercase tracking-[0.2em] text-brass-500">
            <TrendingUp className="h-4 w-4" />
            Capital growth
          </div>
          <GrowthChart r={r} />
        </div>

        {/* Year-by-year (collapsible) */}
        <div className="mt-6">
          <button
            type="button"
            onClick={() => setShowYears((v) => !v)}
            className="flex items-center gap-1.5 text-sm font-medium text-forest-500/80 hover:text-forest-500"
          >
            <ChevronDown className={`h-4 w-4 transition-transform ${showYears ? "rotate-180" : ""}`} />
            Show year-by-year
          </button>
          {showYears ? <YearTable r={r} /> : null}
        </div>

        {/* Lead-gen: similar objects */}
        <SimilarObjects price={inputs.purchasePriceThb} catalog={catalog} excludeRw={excludeRw} />

        <p className="mt-6 text-[11px] leading-relaxed text-forest-500/50">
          Illustrative projection based on the assumptions you enter — not a
          forecast or guarantee of future returns. Past or projected growth does
          not predict actual results. Speak with Right Way for a property-specific
          assessment.
        </p>
      </div>
    </div>
  );
}

function Kpi({ label, value, accent }: { label: string; value: string; accent?: boolean }) {
  return (
    <div>
      <p className="text-[11px] uppercase tracking-wide text-forest-500/50">{label}</p>
      <p className={`mt-1 font-serif text-xl ${accent ? "text-brass-600" : "text-forest-900"}`}>
        {value}
      </p>
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
        <label className={small ? "text-xs text-forest-500/70" : "text-sm text-forest-500/70"}>
          {label}
        </label>
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

function BankCompare({ r, years, bankRate }: { r: RoiResult; years: number; bankRate: number }) {
  const better = r.vsBankThb >= 0;
  return (
    <div className="mt-6 rounded-sm border border-forest-500/10 bg-cream-50 p-6">
      <p className="text-xs font-medium uppercase tracking-[0.2em] text-brass-500">
        vs a bank deposit
      </p>
      <div className="mt-4 space-y-2">
        <Row label={`Bank deposit (${bankRate}%)`} value={formatPriceTHB(r.bankFinal)} muted />
        <Row label="This property" value={formatPriceTHB(r.netProceeds)} />
      </div>
      <p className="mt-4 font-serif text-lg text-forest-900">
        {better ? (
          <>
            <span className="text-brass-600">{formatPriceCompact(r.vsBankThb)}</span> more than
            the bank over {years} years
          </>
        ) : (
          <>{formatPriceCompact(Math.abs(r.vsBankThb))} less than the bank — try a higher growth rate or longer horizon</>
        )}
      </p>
    </div>
  );
}

function Row({ label, value, muted }: { label: string; value: string; muted?: boolean }) {
  return (
    <div className="flex items-baseline justify-between border-b border-forest-500/10 pb-2 last:border-0">
      <span className={`text-sm ${muted ? "text-forest-500/60" : "text-forest-900"}`}>{label}</span>
      <span className={`text-sm font-medium ${muted ? "text-forest-500/60" : "text-forest-900"}`}>
        {value}
      </span>
    </div>
  );
}

function GrowthChart({ r }: { r: RoiResult }) {
  const W = 640;
  const H = 220;
  const pad = { l: 8, r: 8, t: 12, b: 22 };
  const pts = r.series;
  const maxV = Math.max(...pts.map((p) => Math.max(p.propertyValue, p.bankValue)), 1);
  const n = pts.length - 1 || 1;
  const x = (i: number) => pad.l + (i / n) * (W - pad.l - pad.r);
  const y = (v: number) => pad.t + (1 - v / maxV) * (H - pad.t - pad.b);
  const line = (sel: (p: (typeof pts)[number]) => number) =>
    pts.map((p, i) => `${x(i)},${y(sel(p))}`).join(" ");
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
        {pts.map((p, i) =>
          i === 0 || i === n ? (
            <circle key={i} cx={x(i)} cy={y(p.propertyValue)} r="3.5" fill="#B5651D" />
          ) : null,
        )}
      </svg>
      <div className="mt-2 flex justify-between text-[11px] text-forest-500/50">
        <span>Now · {formatPriceCompact(pts[0].propertyValue)}</span>
        <span className="text-brass-600">
          Year {n} · {formatPriceCompact(pts[n].propertyValue)}
        </span>
      </div>
      <div className="mt-3 flex gap-4 text-[11px] text-forest-500/60">
        <span className="inline-flex items-center gap-1.5">
          <span className="h-0.5 w-4 bg-brass-500" /> Property
        </span>
        <span className="inline-flex items-center gap-1.5">
          <span className="h-0.5 w-4 border-t-2 border-dashed border-forest-500/40" /> Bank deposit
        </span>
      </div>
    </div>
  );
}

function YearTable({ r }: { r: RoiResult }) {
  return (
    <div className="mt-4 overflow-hidden rounded-sm border border-forest-500/10">
      <table className="w-full text-sm">
        <thead className="bg-forest-500/5 text-left text-xs uppercase tracking-wide text-forest-500/60">
          <tr>
            <th className="px-4 py-2 font-medium">Year</th>
            <th className="px-4 py-2 text-right font-medium">Value</th>
            <th className="px-4 py-2 text-right font-medium">Cumulative profit</th>
          </tr>
        </thead>
        <tbody>
          {r.series.slice(1).map((p) => (
            <tr key={p.year} className="border-t border-forest-500/10">
              <td className="px-4 py-2 text-forest-500/70">{p.year}</td>
              <td className="px-4 py-2 text-right text-forest-900">{formatPriceCompact(p.propertyValue)}</td>
              <td className="px-4 py-2 text-right text-forest-900">{formatPriceCompact(p.profit)}</td>
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
}: {
  price: number;
  catalog: RealEstateObject[];
  excludeRw?: string;
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
      <p className="text-xs font-medium uppercase tracking-[0.2em] text-brass-500">
        Properties for this budget
      </p>
      <h3 className="mt-3 font-serif text-2xl text-forest-900">
        Around {formatPriceCompact(price)} — {matches.length} match{matches.length === 1 ? "" : "es"}
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
