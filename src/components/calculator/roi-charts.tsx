"use client";

// Графики и симуляции калькулятора (вынесено из roi-calculator.tsx, 2026-07-04).

import { useRef, useState } from "react";
import {
  computeRoi,
  type RoiInputs,
  type RoiResult,
  type RoiYearPoint,
  type MonteCarloResult,
} from "@/lib/calculator/roi";
import type { CalcDict } from "@/lib/i18n/calculator";
import { fmtPct, type Money } from "./roi-shared";
import { Kpi } from "./roi-ui";

/**
 * Value-over-time chart. In "owner" mode (hold/rent) the headline line is the
 * owner's total return if they sold that year — sale proceeds net of costs plus
 * rent collected (= profit + initial), so it agrees with the "vs bank" box and
 * the bank line (which also includes interest). In "asset" mode (off-plan) it
 * plots the asset value ramp instead, where the staggered-payment story lives in
 * the IRR/invested KPIs rather than this curve.
 */
export function GrowthChart({
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
          className="h-auto w-full select-none text-forest-500"
          role="img"
          aria-label="Projected return vs bank deposit over time"
        >
          <defs>
            <linearGradient id="propFill" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" style={{ stopColor: "var(--chart-accent)" }} stopOpacity="0.18" />
              <stop offset="100%" style={{ stopColor: "var(--chart-accent)" }} stopOpacity="0" />
            </linearGradient>
          </defs>
          {grid.map((gy, i) => (
            <line key={i} x1={pad.l} y1={gy} x2={W - pad.r} y2={gy} stroke="currentColor" strokeOpacity="0.08" strokeWidth="1" />
          ))}
          <polygon points={area} fill="url(#propFill)" />
          <polyline points={bankLine} fill="none" stroke="currentColor" strokeOpacity="0.35" strokeWidth="2" strokeDasharray="5 4" />
          <polyline points={propLine} fill="none" style={{ stroke: "var(--chart-accent)" }} strokeWidth="2.5" />
          {pts.map((p, i) => (i === 0 || i === n ? <circle key={i} cx={x(i)} cy={y(valueOf(p))} r="3.5" style={{ fill: "var(--chart-accent)" }} /> : null))}
          {hi != null && hp ? (
            <g>
              <line x1={x(hi)} y1={pad.t} x2={x(hi)} y2={H - pad.b} stroke="currentColor" strokeOpacity="0.25" strokeWidth="1" />
              <circle cx={x(hi)} cy={y(valueOf(hp))} r="4" style={{ fill: "var(--chart-accent)" }} />
              <circle cx={x(hi)} cy={y(hp.bankValue)} r="3.5" fill="currentColor" fillOpacity="0.5" />
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
        <span className="inline-flex items-center gap-1.5"><span className="h-0.5 w-4" style={{ backgroundColor: "var(--chart-accent)" }} /> {lineLabel}</span>
        <span className="inline-flex items-center gap-1.5"><span className="h-0.5 w-4 border-t-2 border-dashed border-forest-500/40" /> {t.legendBank}</span>
      </div>
    </div>
  );
}

/** Fan chart: P10–P90 band of owner return over time, with the median line. */
export function FanChart({ band, money, t }: { band: { year: number; p10: number; p50: number; p90: number }[]; money: Money; t: CalcDict }) {
  if (band.length < 2) return null;
  const W = 640;
  const H = 180;
  const pad = { l: 8, r: 8, t: 10, b: 20 };
  const n = band.length - 1 || 1;
  const maxV = Math.max(...band.map((b) => b.p90), 1);
  const x = (i: number) => pad.l + (i / n) * (W - pad.l - pad.r);
  const y = (v: number) => pad.t + (1 - v / maxV) * (H - pad.t - pad.b);
  const topPts = band.map((b, i) => `${x(i)},${y(b.p90)}`);
  const botPts = band.map((b, i) => `${x(i)},${y(b.p10)}`).reverse();
  const areaPoints = [...topPts, ...botPts].join(" ");
  const midLine = band.map((b, i) => `${x(i)},${y(b.p50)}`).join(" ");
  const last = band[band.length - 1];
  return (
    <div className="mt-4">
      <p className="text-[11px] text-forest-500/60">{t.fanHint}</p>
      <svg viewBox={`0 0 ${W} ${H}`} className="mt-2 h-auto w-full select-none" role="img" aria-label="Range of outcomes over time">
        <polygon points={areaPoints} style={{ fill: "var(--chart-accent)" }} fillOpacity="0.15" />
        <polyline points={band.map((b, i) => `${x(i)},${y(b.p90)}`).join(" ")} fill="none" style={{ stroke: "var(--chart-accent)" }} strokeOpacity="0.4" strokeWidth="1" />
        <polyline points={band.map((b, i) => `${x(i)},${y(b.p10)}`).join(" ")} fill="none" style={{ stroke: "var(--chart-accent)" }} strokeOpacity="0.4" strokeWidth="1" />
        <polyline points={midLine} fill="none" style={{ stroke: "var(--chart-accent)" }} strokeWidth="2.5" />
      </svg>
      <div className="mt-2 flex flex-wrap items-center justify-between gap-x-4 gap-y-1 text-[11px] text-forest-500/60">
        <span className="inline-flex items-center gap-1.5"><span className="h-0.5 w-4" style={{ backgroundColor: "var(--chart-accent)" }} /> {t.fanMid}</span>
        <span className="inline-flex items-center gap-1.5"><span className="h-2 w-4" style={{ backgroundColor: "var(--chart-accent)", opacity: 0.2 }} /> {t.fanBand}</span>
        <span className="tabular-nums">{t.yearN(last.year)}: {money(last.p10)} … {money(last.p90)}</span>
      </div>
    </div>
  );
}

/** Monte Carlo panel: P10/P50/P90 ROI, odds of beating benchmarks, histogram. */
export function MonteCarlo({ mc, rent, altRate, t }: { mc: MonteCarloResult; rent: boolean; altRate: number; t: CalcDict }) {
  const maxH = Math.max(...mc.hist, 1);
  return (
    <div className="mt-4 rounded-sm border border-forest-500/10 bg-cream-50 p-5">
      <p className="text-[11px] leading-relaxed text-forest-500/60">{t.mcHint(mc.samples, rent)}</p>
      <div className="mt-4 grid grid-cols-3 gap-4">
        <Kpi label={t.mcLow} value={fmtPct(mc.p10)} />
        <Kpi label={t.mcMid} value={fmtPct(mc.p50)} accent />
        <Kpi label={t.mcHigh} value={fmtPct(mc.p90)} />
      </div>
      <div className="mt-4 flex h-20 items-end gap-0.5" role="img" aria-label="ROI distribution">
        {mc.hist.map((h, i) => (
          <div key={i} className="flex-1 rounded-t-sm bg-brass-500/60" style={{ height: `${Math.max(2, (h / maxH) * 100)}%` }} />
        ))}
      </div>
      <div className="mt-1.5 flex justify-between text-[10px] text-forest-500/50">
        <span>{fmtPct(mc.histMin)}</span>
        <span>{fmtPct(mc.histMax)}</span>
      </div>
      <div className="mt-3 space-y-1 text-sm text-forest-900">
        <p>{t.mcBeatBank(Math.round(mc.probBeatBank * 100))}</p>
        {altRate > 0 ? <p>{t.mcBeatIndex(Math.round(mc.probBeatAlt * 100))}</p> : null}
        <p className={mc.probLoss > 0 ? "text-red-600" : "text-forest-500/70"}>{t.mcProbLoss(Math.round(mc.probLoss * 100))}</p>
        <p className="text-forest-500/70">{t.mcVar(fmtPct(mc.p05))}</p>
      </div>
    </div>
  );
}

/** Tornado-style sensitivity: total ROI as the main driver moves off the base. */
export function Sensitivity({ inputs, isRent, t }: { inputs: RoiInputs; isRent: boolean; t: CalcDict }) {
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
  const maxAbs = Math.max(...rows.map((r) => Math.abs(r.roi)), 1);
  return (
    <div className="mt-4 rounded-sm border border-forest-500/10 bg-cream-50 p-5">
      <p className="text-[11px] text-forest-500/60">{t.sensHint}</p>
      <p className="mt-1 text-xs font-medium text-forest-500/70">{driverIsOcc ? t.sensDriverOccupancy : t.sensDriverGrowth}</p>
      <div className="mt-3 space-y-2">
        {rows.map((row) => {
          const isBase = row.d === 0;
          return (
            <div key={row.d} className="flex items-center gap-3">
              <span className="w-12 shrink-0 text-right text-xs tabular-nums text-forest-500/70">
                {row.v.toLocaleString("en-US", { maximumFractionDigits: 1 })}%
              </span>
              <div className="h-4 flex-1 overflow-hidden rounded-sm bg-forest-500/5">
                <div
                  className={`h-full rounded-sm ${isBase ? "bg-brass-500" : row.roi >= 0 ? "bg-forest-500/70" : "bg-red-500/60"}`}
                  style={{ width: `${Math.max(2, (Math.abs(row.roi) / maxAbs) * 100)}%` }}
                />
              </div>
              <span className={`w-14 shrink-0 text-right text-xs tabular-nums ${isBase ? "font-semibold text-brass-600" : "text-forest-900"}`}>
                {fmtPct(row.roi)}
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
}

/** Tornado: ROI swing when each driver alone moves low→high. Longest bar = biggest lever. */
export function Tornado({
  inputs,
  isRent,
  isLet,
  t,
}: {
  inputs: RoiInputs;
  isRent: boolean;
  isLet: boolean;
  t: CalcDict;
}) {
  const base = computeRoi(inputs).roiPct;
  const clamp = (v: number, lo: number, hi: number) => Math.min(hi, Math.max(lo, v));
  const roiAt = (patch: Partial<RoiInputs>) => computeRoi({ ...inputs, ...patch }).roiPct;
  const rentish = isRent || isLet;

  const drivers: { label: string; lo: number; hi: number }[] = [];
  drivers.push({ label: t.driverGrowth, lo: roiAt({ annualGrowthPct: inputs.annualGrowthPct - 3 }), hi: roiAt({ annualGrowthPct: inputs.annualGrowthPct + 3 }) });
  if (rentish) {
    drivers.push({ label: t.driverOccupancy, lo: roiAt({ seasonality: false, occupancyPct: clamp(inputs.occupancyPct - 15, 0, 100) }), hi: roiAt({ seasonality: false, occupancyPct: clamp(inputs.occupancyPct + 15, 0, 100) }) });
    drivers.push(
      inputs.longTermRent
        ? { label: t.driverMonthlyRent, lo: roiAt({ monthlyRentThb: inputs.monthlyRentThb * 0.75 }), hi: roiAt({ monthlyRentThb: inputs.monthlyRentThb * 1.25 }) }
        : { label: t.driverNightly, lo: roiAt({ nightlyRateThb: inputs.nightlyRateThb * 0.75 }), hi: roiAt({ nightlyRateThb: inputs.nightlyRateThb * 1.25 }) },
    );
    drivers.push({ label: t.driverMgmt, lo: roiAt({ mgmtFeePct: clamp(inputs.mgmtFeePct + 10, 0, 100) }), hi: roiAt({ mgmtFeePct: clamp(inputs.mgmtFeePct - 10, 0, 100) }) });
  }
  drivers.push({ label: t.driverExit, lo: roiAt({ saleCostsPct: clamp(inputs.saleCostsPct + 3, 0, 30) }), hi: roiAt({ saleCostsPct: clamp(inputs.saleCostsPct - 3, 0, 30) }) });
  drivers.push({ label: t.driverHorizon, lo: roiAt({ years: Math.max(1, inputs.years - 3) }), hi: roiAt({ years: inputs.years + 3 }) });

  const rows = drivers
    .map((d) => ({ ...d, swing: Math.abs(d.hi - d.lo) }))
    .sort((a, b) => b.swing - a.swing);
  const domainLo = Math.min(base, ...rows.map((r) => Math.min(r.lo, r.hi)));
  const domainHi = Math.max(base, ...rows.map((r) => Math.max(r.lo, r.hi)));
  const span = domainHi - domainLo || 1;
  const xPct = (v: number) => ((v - domainLo) / span) * 100;

  return (
    <div className="mt-4 rounded-sm border border-forest-500/10 bg-cream-50 p-5">
      <p className="text-[11px] text-forest-500/60">{t.tornadoHint}</p>
      <div className="mt-4 space-y-2.5">
        {rows.map((d) => {
          const left = Math.min(d.lo, d.hi);
          const right = Math.max(d.lo, d.hi);
          return (
            <div key={d.label} className="grid grid-cols-[6.5rem_1fr_auto] items-center gap-3">
              <span className="truncate text-xs text-forest-500/70">{d.label}</span>
              <div className="relative h-4 rounded-sm bg-forest-500/[0.04]">
                <div className="absolute top-0 z-10 h-full w-px bg-panel/40" style={{ left: `${xPct(base)}%` }} />
                <div className="absolute top-0 h-full rounded-sm bg-brass-500/55" style={{ left: `${xPct(left)}%`, width: `${Math.max(1, xPct(right) - xPct(left))}%` }} />
              </div>
              <span className="w-24 shrink-0 text-right text-[11px] tabular-nums text-forest-500/70">
                {fmtPct(left)} … {fmtPct(right)}
              </span>
            </div>
          );
        })}
      </div>
      <p className="mt-3 text-[10px] text-forest-500/45">{t.sensDriverGrowth}: {fmtPct(base)} (base)</p>
    </div>
  );
}

/** Two-way sensitivity heatmap — growth (rows) × occupancy/horizon (cols). */
export function Matrix({ inputs, isRent, t }: { inputs: RoiInputs; isRent: boolean; t: CalcDict }) {
  const clamp = (v: number, lo: number, hi: number) => Math.min(hi, Math.max(lo, v));
  const rowSteps = [-3, -1.5, 0, 1.5, 3];
  const colSteps = isRent ? [-20, -10, 0, 10, 20] : [-4, -2, 0, 2, 4];
  const rowBase = inputs.annualGrowthPct;
  const colBase = isRent ? inputs.occupancyPct : inputs.years;
  const colVals = colSteps.map((c) => (isRent ? clamp(colBase + c, 0, 100) : Math.max(1, Math.round(colBase + c))));
  const cells = rowSteps.map((rs) =>
    colVals.map((cv) => {
      const patch: Partial<RoiInputs> = { annualGrowthPct: rowBase + rs };
      if (isRent) {
        patch.seasonality = false;
        patch.occupancyPct = cv;
      } else {
        patch.years = cv;
      }
      return computeRoi({ ...inputs, ...patch }).roiPct;
    }),
  );
  const flat = cells.flat().filter((v) => Number.isFinite(v));
  const min = Math.min(...flat);
  const max = Math.max(...flat);
  const tone = (v: number) => {
    const f = max > min ? (v - min) / (max - min) : 0.5;
    // red (low) → cream → forest (high)
    return f < 0.5
      ? `rgba(220,80,60,${0.12 + (0.5 - f) * 0.5})`
      : `rgba(63,74,64,${0.1 + (f - 0.5) * 0.5})`;
  };

  return (
    <div className="mt-4 rounded-sm border border-forest-500/10 bg-cream-50 p-5">
      <p className="text-[11px] text-forest-500/60">{t.matrixHint(isRent ? t.sensDriverOccupancy : t.holdingPeriod)}</p>
      <div className="mt-3 overflow-x-auto">
        <table className="w-full border-collapse text-center text-[11px] tabular-nums">
          <thead>
            <tr>
              <th className="p-1 text-left font-medium text-forest-500/50">{t.matrixGrowthAxis}</th>
              {colVals.map((cv, i) => (
                <th key={i} className="p-1 font-medium text-forest-500/60">{isRent ? `${cv}%` : `${cv}${t.unitYr}`}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {cells.map((row, ri) => (
              <tr key={ri}>
                <td className="p-1 text-left font-medium text-forest-500/60">{(rowBase + rowSteps[ri]).toLocaleString("en-US", { maximumFractionDigits: 1 })}%</td>
                {row.map((v, ci) => (
                  <td key={ci} className="rounded-sm p-1.5 text-forest-900" style={{ backgroundColor: tone(v) }}>
                    {fmtPct(v)}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

/** Capital flow waterfall — from cash invested to net profit over the hold. */
export function Waterfall({ r, money, isRent, t }: { r: RoiResult; money: Money; isRent: boolean; t: CalcDict }) {
  const steps: { label: string; delta: number }[] = [
    { label: t.wfInvested, delta: -r.initialInvestment },
    { label: t.wfSale, delta: r.netProceeds },
  ];
  if (isRent && r.rentNetTotal !== 0) steps.push({ label: t.wfRent, delta: r.rentNetTotal });
  if (r.holdingCostsTotal > 0) steps.push({ label: t.wfHolding, delta: -r.holdingCostsTotal });
  if (r.leasePaymentsTotal > 0) steps.push({ label: t.wfLease, delta: -r.leasePaymentsTotal });
  if (r.capitalGainsTax > 0) steps.push({ label: t.wfCgt, delta: -r.capitalGainsTax });

  let run = 0;
  const bars = steps.map((s) => {
    const start = run;
    run += s.delta;
    return { ...s, start, end: run };
  });
  const total = run; // == netProfit
  const lo = Math.min(0, ...bars.map((b) => Math.min(b.start, b.end)));
  const hi = Math.max(0, ...bars.map((b) => Math.max(b.start, b.end)), total);
  const span = hi - lo || 1;
  const xPct = (v: number) => ((v - lo) / span) * 100;
  const rows = [...bars, { label: t.wfProfit, delta: total, start: 0, end: total, isTotal: true } as (typeof bars)[number] & { isTotal?: boolean }];

  return (
    <div className="mt-6 rounded-sm border border-forest-500/10 bg-cream-50 p-6">
      <p className="text-[0.8125rem] font-medium uppercase tracking-eyebrow text-brass-500">{t.waterfallTitle}</p>
      <p className="mt-1 text-[11px] text-forest-500/55">{t.waterfallHint}</p>
      <div className="mt-4 space-y-2">
        {rows.map((b, i) => {
          const left = Math.min(b.start, b.end);
          const right = Math.max(b.start, b.end);
          const isTotal = "isTotal" in b && b.isTotal;
          const positive = b.delta >= 0;
          const color = isTotal
            ? total >= 0
              ? "bg-panel"
              : "bg-red-500/70"
            : positive
              ? "bg-forest-500/65"
              : "bg-red-500/55";
          return (
            <div key={i} className="grid grid-cols-[7rem_1fr_auto] items-center gap-3">
              <span className={`truncate text-xs ${isTotal ? "font-semibold text-forest-900" : "text-forest-500/70"}`}>{b.label}</span>
              <div className="relative h-4 rounded-sm bg-forest-500/[0.04]">
                <div className="absolute top-0 h-full w-px bg-forest-500/20" style={{ left: `${xPct(0)}%` }} />
                <div
                  className={`absolute top-0 h-full rounded-sm ${color}`}
                  style={{ left: `${xPct(left)}%`, width: `${Math.max(0.8, xPct(right) - xPct(left))}%` }}
                />
              </div>
              <span className={`w-20 shrink-0 text-right text-xs tabular-nums ${isTotal ? "font-semibold text-forest-900" : positive ? "text-forest-900" : "text-red-600"}`}>
                {positive ? "" : "−"}{money(Math.abs(b.delta))}
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
}
