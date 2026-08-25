"use client";

// Поля ввода калькулятора: слайдеры, деньги, выбор юнитов (вынесено из roi-calculator.tsx, 2026-07-04).

import { useEffect, useId, useState } from "react";
import { Check } from "lucide-react";
import { formatMoney, type Currency } from "@/lib/calculator/currency";
import type { CalcDict } from "@/lib/i18n/calculator";
import type { Money, ProjectUnit } from "./roi-shared";

/**
 * Slider + precise numeric input bound to the same value. Dragging is fast for
 * exploring; the number lets power users type an exact figure. Used for every
 * bounded assumption (percentages, years, months).
 */
export function SliderField({
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
  const fieldId = useId();
  return (
    <div>
      <div className="flex items-baseline justify-between gap-2">
        <label
          htmlFor={fieldId}
          className={small ? "text-xs text-forest-500/70" : "text-sm text-forest-500/70"}
        >
          {label}
        </label>
        <div className="flex items-baseline gap-1">
          <input
            id={fieldId}
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
export function PctOrMoneyField({
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
            className={`px-1.5 py-0.5 transition-colors ${mode === "pct" ? "bg-panel text-panel-fg" : "text-forest-500/60 hover:bg-forest-500/8"}`}
          >
            %
          </button>
          <button
            type="button"
            onClick={() => {
              setMoneyText(toMoneyText(amountThb));
              setMode("money");
            }}
            className={`px-1.5 py-0.5 transition-colors ${mode === "money" ? "bg-panel text-panel-fg" : "text-forest-500/60 hover:bg-forest-500/8"}`}
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
export function MoneyField({
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

  const fieldId = useId();
  return (
    <div>
      <div className="flex items-baseline justify-between">
        <label
          htmlFor={fieldId}
          className={small ? "text-xs text-forest-500/70" : "text-sm text-forest-500/70"}
        >
          {label}
        </label>
        {hint ? <span className="text-xs font-medium text-forest-900">{hint}</span> : null}
      </div>
      <input
        id={fieldId}
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

/** Multi-unit picker (project pages): tick the units being bought; the combined
    price and count flow into the engine. Returns (ROI/CAGR) stay per-unit. */
export function UnitsPicker({
  units,
  selected,
  onToggle,
  onSelectAll,
  onClear,
  money,
  t,
}: {
  units: ProjectUnit[];
  selected: string[];
  onToggle: (rw: string) => void;
  onSelectAll: () => void;
  onClear: () => void;
  money: Money;
  t: CalcDict;
}) {
  const allOn = units.length > 0 && selected.length === units.length;
  // Running total of the ticked units — buyer sees the combined cost grow live.
  const total = units.reduce((sum, u) => (selected.includes(u.rwNumber) ? sum + u.priceThb : sum), 0);
  const actionCls =
    "text-[11px] text-forest-500/60 underline-offset-2 hover:text-forest-500 hover:underline";
  return (
    <div className="rounded-sm border border-forest-500/15 bg-cream-50 p-3">
      <div className="mb-1 flex items-center justify-between gap-3">
        <p className="text-[11px] font-medium uppercase tracking-wide text-brass-600">{t.unitsTitle}</p>
        <div className="flex shrink-0 items-center gap-3">
          {!allOn && units.length > 1 ? (
            <button type="button" onClick={onSelectAll} className={actionCls}>
              {t.unitsSelectAll}
            </button>
          ) : null}
          {selected.length > 0 ? (
            <button type="button" onClick={onClear} className={actionCls}>
              {t.unitsClear}
            </button>
          ) : null}
        </div>
      </div>
      <p className="mb-2 text-[11px] leading-relaxed text-forest-500/55">{t.unitsHint}</p>
      <div className="max-h-48 space-y-1 overflow-y-auto">
        {units.map((u) => {
          const on = selected.includes(u.rwNumber);
          return (
            <button
              key={u.rwNumber}
              type="button"
              onClick={() => onToggle(u.rwNumber)}
              aria-pressed={on}
              className={`flex w-full items-center justify-between gap-3 rounded-sm border px-2.5 py-1.5 text-left text-sm transition-colors ${
                on
                  ? "border-brass-500/60 bg-brass-500/10 text-forest-900"
                  : "border-forest-500/15 text-forest-500/80 hover:border-forest-500/30"
              }`}
            >
              <span className="flex items-center gap-2">
                <span
                  className={`flex h-4 w-4 shrink-0 items-center justify-center rounded-[3px] border ${
                    on ? "border-brass-500 bg-brass-500 text-panel-fg" : "border-forest-500/30"
                  }`}
                >
                  {on ? <Check className="h-3 w-3" /> : null}
                </span>
                <span className="font-medium">{u.label}</span>
                {u.badge ? (
                  <span className="rounded-full bg-brass-500/15 px-1.5 py-0.5 text-[9px] font-semibold uppercase tracking-wide text-brass-600">
                    {u.badge}
                  </span>
                ) : null}
              </span>
              <span className="num text-forest-500/70">{money(u.priceThb)}</span>
            </button>
          );
        })}
      </div>
      {selected.length > 0 ? (
        <div className="mt-2 flex items-center justify-between border-t border-forest-500/10 pt-2 text-[11px] font-medium text-brass-600">
          <span>{t.unitsSelected(selected.length)}</span>
          <span className="num">{money(total)}</span>
        </div>
      ) : null}
    </div>
  );
}
