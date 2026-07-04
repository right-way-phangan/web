"use client";

// Мелкие презентационные элементы калькулятора (вынесено из roi-calculator.tsx, 2026-07-04).

import { Info } from "lucide-react";
import { CURRENCIES, type Currency } from "@/lib/calculator/currency";
import type { RoiResult } from "@/lib/calculator/roi";
import type { CalcDict } from "@/lib/i18n/calculator";
import { fmtPct, type Money } from "./roi-shared";

export function PhaseTab({ active, onClick, label }: { active: boolean; onClick: () => void; label: string }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`flex-1 rounded-sm px-3 py-1.5 text-xs font-medium transition-colors ${
        active ? "bg-panel text-panel-fg" : "text-forest-500/70 hover:text-forest-500"
      }`}
    >
      {label}
    </button>
  );
}

export function TenureTab({ active, onClick, label }: { active: boolean; onClick: () => void; label: string }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`flex-1 rounded-sm px-3 py-1.5 text-xs font-medium transition-colors ${
        active ? "bg-brass-500 text-panel-fg" : "text-forest-500/70 hover:text-forest-500"
      }`}
    >
      {label}
    </button>
  );
}

export function CurrencyPicker({ currency, onChange }: { currency: Currency; onChange: (c: Currency) => void }) {
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

export function WarnBox({ text }: { text: string }) {
  return (
    <p className="flex gap-1.5 rounded-sm border border-red-600/25 bg-red-600/[0.06] px-2.5 py-2 text-[11px] leading-relaxed text-red-700">
      <span aria-hidden>⚠</span>
      <span>{text}</span>
    </p>
  );
}

export function Kpi({ label, value, accent, tip }: { label: string; value: string; accent?: boolean; tip?: string }) {
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
export function InfoTip({ text }: { text: string }) {
  return (
    <span className="group relative ml-1 inline-flex cursor-help align-middle" tabIndex={0}>
      <Info className="h-3 w-3 text-forest-500/40" />
      <span className="pointer-events-none absolute bottom-full left-1/2 z-20 mb-1 w-44 -translate-x-1/2 rounded-sm border border-forest-500/15 bg-panel px-2 py-1.5 text-[10px] font-normal normal-case leading-snug tracking-normal text-panel-fg opacity-0 shadow-lg transition-opacity group-hover:opacity-100 group-focus:opacity-100">
        {text}
      </span>
    </span>
  );
}

/** Deal score from benchmark margins, growth and (rent) cash-on-cash. */
export function dealGrade(r: RoiResult, isRent: boolean): "strong" | "fair" | "weak" {
  let score = 0;
  if (r.vsBankThb > 0) score += 1;
  if (r.vsAltThb > 0) score += 1;
  if (r.cagrPct >= 8) score += 2;
  else if (r.cagrPct >= 5) score += 1;
  if (isRent) {
    if (r.cashOnCashPct >= 6) score += 2;
    else if (r.cashOnCashPct >= 3) score += 1;
  }
  const max = isRent ? 6 : 4;
  const ratio = score / max;
  return ratio >= 0.66 ? "strong" : ratio >= 0.4 ? "fair" : "weak";
}

export function DealBadge({ grade, t }: { grade: "strong" | "fair" | "weak"; t: CalcDict }) {
  const map = {
    strong: { label: t.dealStrong, cls: "border-forest-500/30 bg-forest-500/10 text-forest-500" },
    fair: { label: t.dealFair, cls: "border-brass-500/30 bg-brass-500/10 text-brass-600" },
    weak: { label: t.dealWeak, cls: "border-red-500/30 bg-red-500/10 text-red-600" },
  } as const;
  const m = map[grade];
  return (
    <span className={`inline-flex items-center gap-1.5 rounded-full border px-3 py-1 text-xs font-medium ${m.cls}`}>
      <span className="text-[9px] uppercase tracking-wide opacity-70">{t.dealTitle}</span>
      {m.label}
    </span>
  );
}

export function Row({ label, value, muted }: { label: string; value: string; muted?: boolean }) {
  return (
    <div className="flex items-baseline justify-between border-b border-forest-500/10 pb-2 last:border-0">
      <span className={`text-sm ${muted ? "text-forest-500/60" : "text-forest-900"}`}>{label}</span>
      <span className={`text-sm font-medium tabular-nums ${muted ? "text-forest-500/60" : "text-forest-900"}`}>{value}</span>
    </div>
  );
}

/** One-line plain-language verdict under the headline (deal · vs bank · payback · CAGR). */
export function Verdict({
  r,
  grade,
  money,
  t,
}: {
  r: RoiResult;
  grade: "strong" | "fair" | "weak";
  money: Money;
  t: CalcDict;
}) {
  const dealWord = grade === "strong" ? t.dealStrong : grade === "fair" ? t.dealFair : t.dealWeak;
  const bank = r.vsBankThb >= 0 ? t.verdictBeats(money(r.vsBankThb)) : t.verdictTrails(money(Math.abs(r.vsBankThb)));
  const pay = r.paybackYears != null ? t.verdictProfitFrom(r.paybackYears.toFixed(1)) : t.verdictNoProfit;
  const dot = grade === "strong" ? "bg-panel" : grade === "fair" ? "bg-brass-500" : "bg-red-500/70";
  return (
    <p className="mt-3 flex flex-wrap items-center gap-x-1.5 gap-y-0.5 text-sm leading-relaxed text-forest-500/75">
      <span className={`inline-block h-2 w-2 shrink-0 rounded-full ${dot}`} />
      <span className="font-medium text-forest-900">{dealWord}.</span>
      <span>
        {bank} · {pay} · CAGR {fmtPct(r.cagrPct)}/{t.unitYr}.
      </span>
    </p>
  );
}
