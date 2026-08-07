"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import Link from "next/link";
import type { Route } from "next";
import { ChevronDown, TrendingUp, ArrowRight, Download, RotateCcw, Link2, Check, Pin, Dices, MessageCircle } from "lucide-react";
import {
  computeRoi,
  monteCarlo,
  DEFAULT_INPUTS,
  solveMaxPrice,
  solveBreakEven,
  type RoiInputs,
  type CalcMode,
  type Tenure,
  type SolveMetric,
} from "@/lib/calculator/roi";
import {
  DEFAULT_RATES,
  fetchRates,
  formatMoney,
  type Currency,
} from "@/lib/calculator/currency";
import { CalcLeadButton } from "@/components/calculator/calc-lead-button";
import { whatsappLink } from "@/lib/site-config";
import { MarketPreset } from "@/components/calculator/market-preset";
import { CalcEntry } from "@/components/calculator/calc-entry";
import { buildCalcReportHtml } from "@/lib/calculator/report";
import { track } from "@/lib/analytics/track";
import { trackObjectEvent } from "@/lib/analytics/track-event";
import type { RealEstateObject } from "@/types/object";
import { getAppreciation, type RentalMarket } from "@/lib/data/rental-market";
import { calcDict, type CalcDict, type CalcLocale } from "@/lib/i18n/calculator";
import { useLocale } from "@/lib/i18n/use-locale";
import { fmtPct, type Money, type ProjectUnit, type SavedScenario } from "./roi-shared";
import { PhaseTab, TenureTab, CurrencyPicker, WarnBox, Kpi, dealGrade, DealBadge, Verdict } from "./roi-ui";
import { SliderField, PctOrMoneyField, MoneyField, UnitsPicker } from "./roi-fields";
import { GrowthChart, FanChart, Tornado, Matrix, Sensitivity, MonteCarlo, Waterfall } from "./roi-charts";
import { BreakEven, BankCompare, YearTable, RoiMatches, RealityCheck, ScenarioCompare, SimilarObjects } from "./roi-panels";

const solveLabels = (t: CalcDict): Record<SolveMetric, string> => ({
  roi: t.solveRoi,
  cap: t.solveCap,
  coc: t.solveCoc,
  irr: t.solveIrr,
});

// Compact URL keys so "Copy link" round-trips the full scenario, not just price.
const URL_NUMS: [keyof RoiInputs, string][] = [
  ["annualGrowthPct", "g"], ["years", "y"], ["closingCostsPct", "cc"], ["saleCostsPct", "sc"],
  ["capitalGainsTaxPct", "cgt"], ["annualHoldingPct", "hc"], ["bankRatePct", "br"], ["altReturnPct", "ar"],
  ["inflationPct", "inf"], ["fxDriftPct", "fx"], ["leaseTermYears", "lt"], ["nightlyRateThb", "nr"],
  ["occupancyPct", "oc"], ["mgmtFeePct", "mg"], ["opexPct", "ox"], ["rentGrowthPct", "rg"],
  ["rentTaxPct", "rt"], ["furnishingThb", "fn"], ["highSeasonMonths", "hm"], ["highSeasonOccupancyPct", "ho"],
  ["lowSeasonOccupancyPct", "lso"], ["highSeasonRateUpliftPct", "hru"], ["constructionMonths", "cm"],
  ["downPaymentPct", "dp"], ["handoverPaymentPct", "hpp"], ["handoverUpliftPct", "hup"],
  ["leaseMonthlyThb", "lm"], ["leaseIndexationPct", "li"], ["monthlyRentThb", "mr"],
];
const URL_BOOLS: [keyof RoiInputs, string][] = [
  ["leaseRenewable", "lr"], ["seasonality", "se"], ["rentAfterHandover", "rah"],
  ["leaseMonthly", "lpm"], ["longTermRent", "ltr"],
];

/** Полная сериализация сценария. Одна на запись в URL и на снимок стартового
 *  состояния — так diff «что менял посетитель» не разъедется с записью. */
function serializeInputs(v: RoiInputs): URLSearchParams {
  const p = new URLSearchParams();
  p.set("price", String(Math.round(v.purchasePriceThb || 0)));
  if (v.offplan) p.set("phase", "offplan");
  else p.set("mode", v.mode);
  p.set("tenure", v.tenure);
  for (const [k, q] of URL_NUMS) p.set(q, String(v[k]));
  for (const [k, q] of URL_BOOLS) p.set(q, v[k] ? "1" : "0");
  return p;
}

// Last-used scenario survives a page reload (a shared link still wins).
const STORAGE_KEY = "rw-roi-calc-v1";

interface Props {
  initialPriceThb?: number;
  initialMode?: CalcMode;
  initialTenure?: Tenure;
  initialLeaseTermYears?: number;
  initialOffplan?: boolean;
  /** Pre-enable rental income — villa/house/project buyers usually model a let.
   *  Off-plan: checks "rent after handover"; completed: flips "add rental income". */
  initialRent?: boolean;
  catalog?: RealEstateObject[];
  excludeRw?: string;
  compact?: boolean;
  /** Rental-market snapshot — powers the "fill from market data" preset in rent mode. */
  market?: RentalMarket;
  /** Buyable units (project pages) — enables the multi-unit picker. */
  projectUnits?: ProjectUnit[];
  /** Standalone /calculator only — shows the "what are you pricing?" chooser. */
  entry?: boolean;
}

export type { ProjectUnit } from "./roi-shared";

export function RoiCalculator({
  initialPriceThb,
  initialMode,
  initialTenure,
  initialLeaseTermYears,
  initialOffplan,
  initialRent,
  catalog = [],
  excludeRw,
  market,
  projectUnits,
  entry,
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

  const offplanInit = initialOffplan ?? DEFAULT_INPUTS.offplan;
  const [inputs, setInputs] = useState<RoiInputs>({
    ...DEFAULT_INPUTS,
    purchasePriceThb: initialPriceThb ?? DEFAULT_INPUTS.purchasePriceThb,
    // Default the headline growth to the data-anchored "optimistic" edge of the
    // band so a listing opens on its upside case; the visitor can dial it back
    // to base/conservative with one tap.
    annualGrowthPct: appr.high,
    // Villa/house/project default to a rental model (initialRent): off-plan
    // shows income after handover, a completed home flips Buy→Rent. Land is
    // left as buy-&-hold.
    mode: initialMode ?? (initialRent && !offplanInit ? "rent" : DEFAULT_INPUTS.mode),
    tenure: initialTenure ?? DEFAULT_INPUTS.tenure,
    leaseTermYears: initialLeaseTermYears ?? DEFAULT_INPUTS.leaseTermYears,
    offplan: offplanInit,
    rentAfterHandover: initialRent && offplanInit ? true : DEFAULT_INPUTS.rentAfterHandover,
  });
  // Снимок сценария, с которым страница открылась (цена объекта, его же режим
  // и владение). Всё, что совпадает с ним, в адрес не пишем — страница
  // подставит эти значения сама, а ссылка остаётся короткой и пересылаемой.
  const pristineInputs = useRef(inputs).current;
  // "My own property" context (district/bedrooms/Airbnb link) — travels with the
  // lead summary and PDF so the team sees what the buyer is actually pricing.
  const [ownNote, setOwnNote] = useState<string | null>(null);
  const [showAdvanced, setShowAdvanced] = useState(false);
  const [showYears, setShowYears] = useState(false);
  const [showSolver, setShowSolver] = useState(false);
  const [showSens, setShowSens] = useState(false);
  const [showMatrix, setShowMatrix] = useState(false);
  const [showTornado, setShowTornado] = useState(false);
  const [showMc, setShowMc] = useState(false);
  const [solverMetric, setSolverMetric] = useState<SolveMetric>("roi");
  const [solverTarget, setSolverTarget] = useState(60);
  const [scenarios, setScenarios] = useState<SavedScenario[]>([]);
  const [tab, setTab] = useState<"summary" | "returns" | "risk" | "compare">("summary");
  const scenarioId = useRef(0);
  const [targetRoi, setTargetRoi] = useState(50);
  const [currency, setCurrency] = useState<Currency>("THB");
  const [rates, setRates] = useState<Record<Currency, number>>(DEFAULT_RATES);
  const [copied, setCopied] = useState(false);
  // Simple vs full: first-time visitors land on the trimmed view so they aren't
  // buried in assumptions; power users switch to full for the analytics suite.
  const [view, setView] = useState<"simple" | "full">("simple");
  // Multi-unit picker selection (project pages): rwNumbers of units being bought.
  const [pickedUnits, setPickedUnits] = useState<string[]>([]);

  // Mobile: a sticky result bar so the headline stays visible while the user
  // edits assumptions above it. Shown only while the calculator is on screen.
  const rootRef = useRef<HTMLDivElement>(null);
  const [showMobileBar, setShowMobileBar] = useState(false);

  // Best-effort live FX once mounted.
  useEffect(() => {
    fetchRates().then((r) => r && setRates(r));
  }, []);

  // Object engagement: one "calc" event per mount when the calculator is opened
  // for a specific listing (excludeRw). The standalone /calculator (no rw) is
  // not an object signal, so it's skipped.
  useEffect(() => {
    if (excludeRw && typeof navigator !== "undefined" && !navigator.webdriver) {
      trackObjectEvent("calc", excludeRw);
    }
  }, [excludeRw]);

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
  // Conversion signal: the visitor ran their own calculation — touched an input
  // and got a result. Landing on the page with defaults is not a conversion.
  const calcTouched = useRef(false);
  const calcTracked = useRef(false);
  useEffect(() => {
    if (!calcTouched.current || calcTracked.current || !Number.isFinite(r.roiPct)) return;
    calcTracked.current = true;
    track("roi_complete", { action: "calculate", type: inputs.mode });
  }, [r, inputs.mode]);
  const solvedMaxPrice = useMemo(
    () => (showSolver ? solveMaxPrice(inputs, solverMetric, solverTarget) : null),
    [showSolver, inputs, solverMetric, solverTarget],
  );
  const breakEven = useMemo(() => solveBreakEven(inputs), [inputs]);
  // Budget-first signal: how many catalog listings sit at or below this price.
  const budgetMatchCount = useMemo(
    () => catalog.filter((o) => o.priceThb && o.priceThb <= inputs.purchasePriceThb).length,
    [catalog, inputs.purchasePriceThb],
  );
  // Island land benchmark — median ฿/rai across listings priced by area (these
  // are land; villas/condos carry no per-rai price). A soft, data-backed anchor.
  const landPerRaiMedian = useMemo(() => {
    const vals = catalog
      .map((o) => o.pricePerRai)
      .filter((v): v is number => typeof v === "number" && v > 0)
      .sort((a, b) => a - b);
    if (vals.length < 5) return null;
    const mid = Math.floor(vals.length / 2);
    return vals.length % 2 ? vals[mid] : (vals[mid - 1] + vals[mid]) / 2;
  }, [catalog]);
  const set = (patch: Partial<RoiInputs>) => {
    calcTouched.current = true;
    setInputs((p) => ({ ...p, ...patch }));
  };
  const money: Money = (thb, full) => formatMoney(thb, currency, rates, { compact: !full });

  // Multi-unit picker: selecting units drives the combined price + count into
  // the engine. Price-linear costs scale via the summed price; rental/furnishing
  // scale via unitCount. Clearing all selections reverts to a single unit.
  const applyUnits = (next: string[]) => {
    setPickedUnits(next);
    const chosen = (projectUnits ?? []).filter((u) => next.includes(u.rwNumber));
    if (chosen.length === 0) {
      set({ unitCount: 1 });
      return;
    }
    set({
      purchasePriceThb: chosen.reduce((sum, u) => sum + u.priceThb, 0),
      unitCount: chosen.length,
    });
  };
  const toggleUnit = (rw: string) =>
    applyUnits(pickedUnits.includes(rw) ? pickedUnits.filter((x) => x !== rw) : [...pickedUnits, rw]);
  const clearUnits = () => applyUnits([]);
  const selectAllUnits = () => applyUnits((projectUnits ?? []).map((u) => u.rwNumber));

  // Money inputs are entered in the selected currency; state stays in THB.
  const fx = rates[currency] ?? 1; // foreign units per 1 THB
  const thbHint = (thb: number) =>
    currency === "THB" ? money(thb) : `≈ ${formatMoney(thb, "THB", rates, { compact: true })}`;

  const openReport = () => {
    const html = buildCalcReportHtml({
      inputs,
      result: r,
      currency,
      rates,
      rwNumber: excludeRw,
      contextLabel: ownNote ?? undefined,
      locale,
    });
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

  // Full reset to defaults (keeps the data-anchored "optimistic" growth) — and forget
  // the persisted session, otherwise it would re-apply on the next visit.
  const resetInputs = () => {
    setInputs({ ...DEFAULT_INPUTS, annualGrowthPct: appr.high });
    try {
      window.localStorage.removeItem(STORAGE_KEY);
    } catch {
      /* ignore */
    }
  };

  const copyLink = async () => {
    try {
      await navigator.clipboard.writeText(window.location.href);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
      track("share_listing", { kind: "calculator", method: "copy" });
    } catch {
      /* clipboard unavailable — ignore */
    }
  };

  // On mount, hydrate the full scenario from the URL so a shared "Copy link"
  // reproduces every assumption, not just price/mode/tenure (which arrive via
  // props). With no URL scenario and no deep-linked price, restore the
  // visitor's last session from localStorage instead.
  useEffect(() => {
    if (typeof window === "undefined") return;
    const p = new URLSearchParams(window.location.search);
    const patch: Partial<RoiInputs> = {};
    for (const [k, q] of URL_NUMS) {
      const v = p.get(q);
      if (v != null && v !== "" && Number.isFinite(Number(v))) (patch as Record<string, unknown>)[k] = Number(v);
    }
    for (const [k, q] of URL_BOOLS) {
      const v = p.get(q);
      if (v != null) (patch as Record<string, unknown>)[k] = v === "1";
    }
    if (Object.keys(patch).length || p.has("price")) {
      if (Object.keys(patch).length) setInputs((s) => ({ ...s, ...patch }));
      return;
    }
    if (initialPriceThb != null) return; // object-page embed — keep the listing's figures
    try {
      const raw = window.localStorage.getItem(STORAGE_KEY);
      if (!raw) return;
      const saved = JSON.parse(raw) as {
        inputs?: Partial<RoiInputs>;
        currency?: Currency;
        view?: "simple" | "full";
      };
      if (saved.inputs && typeof saved.inputs === "object") {
        // Only accept known keys with the expected type — old/corrupt entries degrade silently.
        const safe: Partial<RoiInputs> = {};
        for (const k of Object.keys(DEFAULT_INPUTS) as (keyof RoiInputs)[]) {
          // unitCount is set only by the multi-unit picker in-session — never
          // restore it, or a standalone calculator would inherit a stale count.
          if (k === "unitCount") continue;
          const v = saved.inputs[k];
          if (v != null && typeof v === typeof DEFAULT_INPUTS[k]) (safe as Record<string, unknown>)[k] = v;
        }
        if (Object.keys(safe).length) setInputs((s) => ({ ...s, ...safe }));
      }
      if (saved.currency && saved.currency in DEFAULT_RATES) setCurrency(saved.currency);
      if (saved.view === "simple" || saved.view === "full") setView(saved.view);
    } catch {
      /* unreadable storage — start fresh */
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Persist the scenario so a reload doesn't lose the visitor's work.
  useEffect(() => {
    if (typeof window === "undefined") return;
    try {
      window.localStorage.setItem(STORAGE_KEY, JSON.stringify({ inputs, currency, view }));
    } catch {
      /* storage full/blocked — ignore */
    }
  }, [inputs, currency, view]);

  // Keep the URL in sync so "Copy link" reproduces the scenario — но только тем,
  // что посетитель реально изменил. Раньше сюда писался весь набор целиком и
  // сразу на монтировании: чистый /object/RW-0516 превращался в 282 символа с
  // 37 параметрами ещё до единого клика. Ссылку на объект отправляют в Telegram
  // и WhatsApp руками — простыня выглядит как спам. Значения, совпадающие со
  // стартовым сценарием, из адреса выкидываем: страница подставит их сама.
  useEffect(() => {
    if (typeof window === "undefined") return;
    const full = serializeInputs(inputs);
    const base = serializeInputs(pristineInputs);
    for (const [key, value] of [...full.entries()]) {
      if (base.get(key) === value) full.delete(key);
    }
    const qs = full.toString();
    const { pathname } = window.location;
    window.history.replaceState(null, "", qs ? `${pathname}?${qs}` : pathname);
  }, [inputs, pristineInputs]);

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
  // ROI only varies with price when there's rental income (rent is a fixed THB
  // amount while price moves); appreciation-only ROI is price-independent.
  const roiVariesByPrice = isRent || (isOffplan && inputs.rentAfterHandover);
  const isLet = isOffplan && inputs.rentAfterHandover;

  // Scenario snapshots for side-by-side comparison (max 3 pinned + current).
  const scenarioLabel = isOffplan ? t.offplan : isRent ? t.buyRent : t.buyHold;
  const currentScenario: SavedScenario = {
    id: -1,
    label: t.currentLabel,
    roi: r.roiPct,
    proj: r.projectedValue,
    profit: r.netProfit,
    cagr: r.cagrPct,
    payback: r.paybackYears,
    vsBank: r.vsBankThb,
  };
  const addScenario = () => {
    setScenarios((p) =>
      p.length >= 3 ? p : [...p, { ...currentScenario, id: ++scenarioId.current, label: `${scenarioLabel} ${p.length + 1}` }],
    );
    setTab("compare");
  };

  // Quick-start profiles — fill a coherent set of fields in one click.
  const applyProfile = (profile: "conservative" | "yield" | "flipper") => {
    if (profile === "conservative") {
      set({ offplan: false, mode: "hold", tenure: "freehold", annualGrowthPct: appr.conservative, years: 10 });
    } else if (profile === "yield") {
      const occ = market ? Math.round(market.meta.occupancy.base * 100) : 55;
      set({ offplan: false, mode: "rent", annualGrowthPct: appr.base, occupancyPct: occ, seasonality: false });
    } else {
      set({ offplan: true, mode: "hold", annualGrowthPct: appr.high, years: 3, rentAfterHandover: false });
    }
  };

  // Switching the rental strategy re-seeds the assumptions that mean something
  // different in each world (occupancy, management fee) — both stay editable.
  const setLongTermRent = (lt: boolean) => {
    if (lt === inputs.longTermRent) return;
    if (lt) set({ longTermRent: true, seasonality: false, mgmtFeePct: 10, occupancyPct: 95 });
    else
      set({
        longTermRent: false,
        mgmtFeePct: DEFAULT_INPUTS.mgmtFeePct,
        occupancyPct: market ? Math.round(market.meta.occupancy.base * 100) : DEFAULT_INPUTS.occupancyPct,
      });
  };

  // Monte Carlo over the data-anchored bands (growth always; occupancy + nightly
  // rate when there's rental income). Computed only while the panel is open.
  const mc = useMemo(() => {
    if (!showMc) return null;
    const bands: Parameters<typeof monteCarlo>[1] = {
      growth: { lo: appr.conservative, base: appr.base, hi: appr.high },
    };
    if (roiVariesByPrice) {
      // Market occupancy data is Airbnb-derived — it only anchors the STR band.
      const occ = !inputs.longTermRent ? market?.meta.occupancy : undefined;
      bands.occupancy = occ
        ? { lo: occ.conservative * 100, base: occ.base * 100, hi: occ.high * 100 }
        : { lo: Math.max(0, inputs.occupancyPct - 15), base: inputs.occupancyPct, hi: Math.min(100, inputs.occupancyPct + 15) };
      const nb = (inputs.longTermRent ? inputs.monthlyRentThb : inputs.nightlyRateThb) || 0;
      bands.nightly = { lo: nb * 0.75, base: nb, hi: nb * 1.3 };
    }
    return monteCarlo(inputs, bands, 1500);
  }, [showMc, inputs, appr, market, roiVariesByPrice]);

  const strategyLabel = isOffplan ? "Off-plan (new build)" : isRent ? "Buy & Rent" : "Buy & Hold";
  // Lead summary in the buyer's display currency (THB equivalent in parens when
  // it isn't THB) so the message matches the figures they were looking at.
  const disp = (thb: number) =>
    currency === "THB"
      ? formatMoney(thb, "THB", rates, { compact: false })
      : `${formatMoney(thb, currency, rates, { compact: false })} (≈ ${formatMoney(thb, "THB", rates, { compact: false })})`;
  const calcSummary = [
    `Investment calculation${excludeRw ? ` — ${excludeRw}` : ""} (${strategyLabel})`,
    ownNote ? `Property: ${ownNote}` : "",
    `Tenure: ${isLeasehold ? `Leasehold, ${inputs.leaseTermYears}-yr term` : "Freehold"}`,
    isLeasehold && inputs.leaseMonthly
      ? `Land rent: ${disp(inputs.leaseMonthlyThb)}/mo, indexed ${inputs.leaseIndexationPct}%/yr (price covers the building only)`
      : "",
    `${isOffplan ? "Contract price" : "Purchase price"}: ${disp(inputs.purchasePriceThb)}`,
    isOffplan
      ? `Plan: ${inputs.downPaymentPct}% down · ${installmentPct.toFixed(0)}% during ${inputs.constructionMonths}mo build · ${inputs.handoverPaymentPct}% at handover`
      : "",
    isOffplan ? `Value at handover (+${inputs.handoverUpliftPct}%): ${disp(r.handoverValue)}` : "",
    `Annual growth: ${inputs.annualGrowthPct}% over ${inputs.years} years`,
    `Projected value: ${disp(r.projectedValue)}`,
    `Total ROI: ${fmtPct(r.roiPct)} · CAGR ${fmtPct(r.cagrPct)}/yr${isRent || isOffplan ? ` · IRR ${fmtPct(r.irrPct)}` : ""}`,
    isRent
      ? `Rental: ${inputs.longTermRent ? `long-term @ ${disp(inputs.monthlyRentThb)}/mo` : `nightly @ ${disp(inputs.nightlyRateThb)}`} · ${inputs.occupancyPct}% occupancy`
      : "",
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
    {entry ? (
      <CalcEntry
        catalog={catalog}
        market={market}
        t={t}
        onApply={(patch) => set(patch)}
        onOwnNote={setOwnNote}
      />
    ) : null}
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
            <button type="button" onClick={() => setLocale("en")} className={`px-2.5 py-1 transition-colors ${locale === "en" ? "bg-panel text-panel-fg" : "text-forest-500/60 hover:bg-forest-500/8"}`}>EN</button>
            <button type="button" onClick={() => setLocale("ru")} className={`px-2.5 py-1 transition-colors ${locale === "ru" ? "bg-panel text-panel-fg" : "text-forest-500/60 hover:bg-forest-500/8"}`}>RU</button>
          </div>
        </div>

        {/* Simple / Full — the primary control. Most visitors stay on Simple;
            Full unlocks tenure/off-plan inputs and the analytics suite. */}
        <div
          role="group"
          aria-label={`${t.viewSimple} / ${t.viewFull}`}
          className="mb-4 inline-flex w-full overflow-hidden rounded-sm border border-forest-500/20 text-sm font-medium"
        >
          <button
            type="button"
            onClick={() => setView("simple")}
            aria-pressed={view === "simple"}
            className={`flex-1 px-3 py-1.5 transition-colors ${view === "simple" ? "bg-panel text-panel-fg" : "text-forest-500/60 hover:bg-forest-500/8"}`}
          >
            {t.viewSimple}
          </button>
          <button
            type="button"
            onClick={() => setView("full")}
            aria-pressed={view === "full"}
            className={`flex-1 px-3 py-1.5 transition-colors ${view === "full" ? "bg-panel text-panel-fg" : "text-forest-500/60 hover:bg-forest-500/8"}`}
          >
            {t.viewFull}
          </button>
        </div>

        {/* Profiles + phase/tenure tabs are power-user controls — full view only. */}
        {view === "full" ? (
          <>
        {/* Quick-start profiles — fill a coherent assumption set in one click. */}
        <div className="mb-3">
          <p className="mb-1.5 text-[11px] font-medium uppercase tracking-wide text-forest-500/50">{t.profilesLabel}</p>
          <div className="flex flex-wrap gap-1.5">
            {([
              ["conservative", t.profileConservative],
              ["yield", t.profileYield],
              ["flipper", t.profileFlipper],
            ] as const).map(([key, label]) => (
              <button
                key={key}
                type="button"
                onClick={() => applyProfile(key)}
                className="rounded-full border border-forest-500/20 px-3 py-1 text-[11px] font-medium text-forest-500/75 transition-colors hover:border-brass-500 hover:text-brass-600"
              >
                {label}
              </button>
            ))}
          </div>
        </div>

        {/* Phase — completed resale vs off-plan new build (RW-P projects) */}
        <div className="flex gap-1 rounded-sm border border-forest-500/15 bg-cream-50 p-1">
          <PhaseTab active={!isOffplan} onClick={() => set({ offplan: false })} label={t.completed} />
          <PhaseTab active={isOffplan} onClick={() => set({ offplan: true })} label={t.offplan} />
        </div>

        {/* Tenure — Thailand-specific. Leasehold value decays as the lease runs down. */}
        <div className="mt-3 flex gap-1 rounded-sm border border-forest-500/15 bg-cream-50 p-1">
          <TenureTab active={!isLeasehold} onClick={() => set({ tenure: "freehold" as Tenure })} label={t.freehold} />
          <TenureTab active={isLeasehold} onClick={() => set({ tenure: "leasehold" as Tenure })} label={t.leasehold} />
        </div>
          </>
        ) : null}

        <p className="mt-6 text-[0.8125rem] font-medium uppercase tracking-eyebrow text-brass-500">
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

          {/* Budget-first: how many real listings fit this number → browse them. */}
          {budgetMatchCount > 0 ? (
            <Link
              href={`/listings?pmax=${Math.ceil(inputs.purchasePriceThb / 1_000_000)}` as Route}
              className="inline-flex items-center gap-1 text-[11px] font-medium text-brass-600 underline-offset-2 transition-colors hover:text-brass-700 hover:underline"
            >
              {t.budgetFits(budgetMatchCount)}
              <ArrowRight className="h-3 w-3" />
            </Link>
          ) : null}

          {/* Soft data anchor: island-wide land median per rai (land scenarios). */}
          {landPerRaiMedian ? (
            <p className="mt-1.5 text-[11px] leading-relaxed text-forest-500/55">
              {t.landMedianRef(money(landPerRaiMedian))}
            </p>
          ) : null}

          {/* Multi-unit picker (project pages): tick units to buy → combined
              price + count flow into the engine; returns stay per-unit. */}
          {projectUnits && projectUnits.length > 0 ? (
            <UnitsPicker
              units={projectUnits}
              selected={pickedUnits}
              onToggle={toggleUnit}
              onSelectAll={selectAllUnits}
              onClear={clearUnits}
              money={money}
              t={t}
            />
          ) : null}

          <p className="border-t border-forest-500/10 pt-4 text-[11px] font-medium uppercase tracking-wide text-forest-500/50">
            {t.groupGrowth}
          </p>

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
                      ? "border-forest-500 bg-panel text-panel-fg"
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
          {view === "full" && isLeasehold ? (
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
              {/* Lease payment structure — prepaid (price covers the lease) vs
                  monthly land rent (the post-pivot "land lease + villa" deal). */}
              <div className="flex gap-1 rounded-sm border border-forest-500/15 bg-cream-50 p-1">
                <TenureTab active={!inputs.leaseMonthly} onClick={() => set({ leaseMonthly: false })} label={t.leasePayPrepaid} />
                <TenureTab active={inputs.leaseMonthly} onClick={() => set({ leaseMonthly: true })} label={t.leasePayMonthly} />
              </div>
              {inputs.leaseMonthly ? (
                <div className="space-y-4 rounded-sm border border-forest-500/10 bg-cream-50/60 p-3">
                  <MoneyField label={`${t.leaseMonthlyRate} (${currency})`} thbValue={inputs.leaseMonthlyThb} currency={currency} fx={fx} onChangeThb={(thb) => set({ leaseMonthlyThb: thb })} hint={thbHint(inputs.leaseMonthlyThb)} small />
                  <SliderField label={t.leaseIndexation} value={inputs.leaseIndexationPct} step={0.5} min={0} max={15} onChange={(v) => set({ leaseIndexationPct: v })} small />
                  <p className="text-[11px] leading-relaxed text-forest-500/55">{t.leaseMonthlyNote}</p>
                </div>
              ) : null}
              {!inputs.leaseRenewable ? (
                <p className="text-[11px] leading-relaxed text-forest-500/55">{t.leaseDecayNote}</p>
              ) : null}
              {leaseExpiry ? <WarnBox text={t.leaseExpiryWarn(inputs.years, inputs.leaseTermYears)} /> : null}
            </div>
          ) : null}

          {/* Off-plan-only inputs */}
          {view === "full" && isOffplan ? (
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
                  <div className="flex gap-1 rounded-sm border border-forest-500/15 bg-cream-50 p-1">
                    <TenureTab active={!inputs.longTermRent} onClick={() => setLongTermRent(false)} label={t.rentShortTerm} />
                    <TenureTab active={inputs.longTermRent} onClick={() => setLongTermRent(true)} label={t.rentLongTerm} />
                  </div>
                  {inputs.longTermRent ? (
                    <MoneyField label={`${t.monthlyRent} (${currency})`} thbValue={inputs.monthlyRentThb} currency={currency} fx={fx} onChangeThb={(thb) => set({ monthlyRentThb: thb })} hint={thbHint(inputs.monthlyRentThb)} small />
                  ) : (
                    <MoneyField label={`${t.nightlyRate} (${currency})`} thbValue={inputs.nightlyRateThb} currency={currency} fx={fx} onChangeThb={(thb) => set({ nightlyRateThb: thb })} hint={thbHint(inputs.nightlyRateThb)} small />
                  )}
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

          {/* Rental income is optional for completed properties — a single toggle
              replaces the old Buy & Hold / Buy & Rent mode tabs. */}
          {!isOffplan ? (
            <p className="border-t border-forest-500/10 pt-4 text-[11px] font-medium uppercase tracking-wide text-forest-500/50">
              {t.groupRental}
            </p>
          ) : null}
          {!isOffplan ? (
            <label className="flex cursor-pointer items-center gap-2 rounded-sm border border-forest-500/15 bg-cream-50 p-3 text-sm text-forest-500/80">
              <input
                type="checkbox"
                checked={isRent}
                onChange={(e) => set({ mode: (e.target.checked ? "rent" : "hold") as CalcMode })}
                className="h-4 w-4 accent-brass-500"
              />
              {t.addRentalIncome}
            </label>
          ) : null}

          {/* Rent-only inputs */}
          {isRent ? (
            <div className="space-y-4 rounded-sm border border-brass-500/20 bg-brass-500/[0.04] p-4">
              <div className="flex items-center justify-between">
                <p className="text-[11px] font-medium uppercase tracking-wide text-brass-600">{t.rentalAssumptions}</p>
                {!inputs.longTermRent && view === "full" ? (
                  <label className="flex cursor-pointer items-center gap-1.5 text-[11px] text-forest-500/70">
                    <input
                      type="checkbox"
                      checked={isSeasonal}
                      onChange={(e) => set({ seasonality: e.target.checked })}
                      className="h-3.5 w-3.5 accent-brass-500"
                    />
                    {t.highLowSeason}
                  </label>
                ) : null}
              </div>
              {/* Rental strategy — nightly STR vs a monthly long-term let. */}
              <div className="flex gap-1 rounded-sm border border-forest-500/15 bg-cream-50 p-1">
                <TenureTab active={!inputs.longTermRent} onClick={() => setLongTermRent(false)} label={t.rentShortTerm} />
                <TenureTab active={inputs.longTermRent} onClick={() => setLongTermRent(true)} label={t.rentLongTerm} />
              </div>
              {market && !inputs.longTermRent ? (
                <MarketPreset
                  market={market}
                  t={t}
                  onApply={({ nightlyRateThb, occupancyPct }) =>
                    set({ nightlyRateThb, occupancyPct, seasonality: false })
                  }
                />
              ) : null}
              {inputs.longTermRent ? (
                <>
                  <MoneyField label={`${t.monthlyRent} (${currency})`} thbValue={inputs.monthlyRentThb} currency={currency} fx={fx} onChangeThb={(thb) => set({ monthlyRentThb: thb })} hint={thbHint(inputs.monthlyRentThb)} small />
                  <div>
                    <SliderField label={t.occupancy} value={inputs.occupancyPct} step={5} min={0} max={100} onChange={(v) => set({ occupancyPct: v })} small />
                    <p className="mt-1 text-[11px] leading-relaxed text-forest-500/50">{t.ltOccupancyHint}</p>
                  </div>
                </>
              ) : (
                <>
                  <MoneyField label={`${t.nightlyRate} (${currency})`} thbValue={inputs.nightlyRateThb} currency={currency} fx={fx} onChangeThb={(thb) => set({ nightlyRateThb: thb })} hint={thbHint(inputs.nightlyRateThb)} small />
                  {isSeasonal && view === "full" ? (
                    <div className="space-y-4 rounded-sm border border-brass-500/15 bg-cream-50/60 p-3">
                      <SliderField label={t.highSeasonLength} value={inputs.highSeasonMonths} unit={t.unitMo} step={1} min={0} max={12} onChange={(v) => set({ highSeasonMonths: v })} small />
                      <SliderField label={t.highSeasonOccupancy} value={inputs.highSeasonOccupancyPct} step={5} min={0} max={100} onChange={(v) => set({ highSeasonOccupancyPct: v })} small />
                      <SliderField label={t.highSeasonUplift} value={inputs.highSeasonRateUpliftPct} step={5} min={0} max={100} onChange={(v) => set({ highSeasonRateUpliftPct: v })} small />
                      <SliderField label={t.lowSeasonOccupancy} value={inputs.lowSeasonOccupancyPct} step={5} min={0} max={100} onChange={(v) => set({ lowSeasonOccupancyPct: v })} small />
                    </div>
                  ) : (
                    <SliderField label={t.occupancy} value={inputs.occupancyPct} step={5} min={0} max={100} onChange={(v) => set({ occupancyPct: v })} small />
                  )}
                </>
              )}
              {view === "full" ? (
                <>
              <SliderField label={t.mgmtFee} value={inputs.mgmtFeePct} step={1} min={0} max={100} onChange={(v) => set({ mgmtFeePct: v })} small />
              <SliderField label={t.opex} value={inputs.opexPct} step={0.5} min={0} max={15} onChange={(v) => set({ opexPct: v })} small />
              <SliderField label={t.rentGrowth} value={inputs.rentGrowthPct} step={0.5} min={-5} max={15} onChange={(v) => set({ rentGrowthPct: v })} small />
              <SliderField label={t.rentTaxLabel} value={inputs.rentTaxPct} step={1} min={0} max={40} onChange={(v) => set({ rentTaxPct: v })} small />
              <MoneyField label={`${t.furnishingLabel} (${currency})`} thbValue={inputs.furnishingThb} currency={currency} fx={fx} onChangeThb={(thb) => set({ furnishingThb: thb })} hint={thbHint(inputs.furnishingThb)} small />
              <p className="text-[11px] leading-relaxed text-forest-500/55">{t.furnishingHint}</p>
                </>
              ) : null}
            </div>
          ) : null}

          {/* Advanced cost assumptions — power-user only. */}
          {view === "full" ? (
            <>
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
              <SliderField label={t.cgtLabel} value={inputs.capitalGainsTaxPct} step={1} min={0} max={40} onChange={(v) => set({ capitalGainsTaxPct: v })} small />
              <PctOrMoneyField label={t.annualHolding} t={t} pctValue={inputs.annualHoldingPct} priceThb={inputs.purchasePriceThb} currency={currency} fx={fx} rates={rates} min={0} max={10} step={0.1} onChangePct={(v) => set({ annualHoldingPct: v })} small />
              <SliderField label={t.bankRate} value={inputs.bankRatePct} step={0.25} min={0} max={10} onChange={(v) => set({ bankRatePct: v })} small />
              <SliderField label={t.altReturnLabel} value={inputs.altReturnPct} step={0.5} min={0} max={20} onChange={(v) => set({ altReturnPct: v })} small />
              <SliderField label={t.inflationLabel} value={inputs.inflationPct} step={0.5} min={0} max={15} onChange={(v) => set({ inflationPct: v })} small />
              <div>
                <SliderField label={t.fxDriftLabel} value={inputs.fxDriftPct} step={0.5} min={-10} max={10} onChange={(v) => set({ fxDriftPct: v })} small />
                <p className="mt-1 text-[11px] leading-relaxed text-forest-500/50">{t.fxDriftHint}</p>
              </div>
            </div>
          ) : null}
            </>
          ) : null}
        </div>

        {/* Mobile: keep the headline outcome pinned while editing inputs (they
            stack above the result on small screens). */}
        <a
          href="#calc-results"
          aria-label={t.resultsBtn}
          className="sticky bottom-0 z-10 -mx-4 mt-4 flex items-center justify-between gap-3 border-t border-forest-500/15 bg-cream-50/95 px-4 py-2.5 backdrop-blur lg:hidden"
        >
          <div>
            <p className="text-[10px] uppercase tracking-wide text-forest-500/55">{t.projectedValueIn(inputs.years)}</p>
            <p className="num text-lg leading-tight text-forest-900">{money(r.projectedValue, true)}</p>
          </div>
          <div className="flex items-center gap-2">
            <div className="text-right">
              <p className="text-[10px] uppercase tracking-wide text-forest-500/55">{t.totalRoi}</p>
              <p className="num text-lg leading-tight text-brass-600">{fmtPct(r.roiPct)}</p>
            </div>
            <ChevronDown className="h-4 w-4 shrink-0 text-forest-500/40" />
          </div>
        </a>
      </div>

      {/* ---- Results ---- */}
      {/* Column count / type scale key off this block's own width (container
          query), not the viewport — embedded in a narrow project/object column
          the viewport-based sm:/md: steps packed four KPIs into ~70px cells and
          the figures overlapped. */}
      <div id="calc-results" className="@container scroll-mt-24">
        <div className="rounded-sm border border-forest-500/10 bg-cream-50 p-6 @[36rem]:p-8">
          <div className="flex items-start justify-between gap-4">
            <p className="text-[0.8125rem] font-medium uppercase tracking-eyebrow text-brass-500">
              {t.projectedValueIn(inputs.years)}
            </p>
            <div className="flex items-center gap-2">
              {view === "full" ? (
                <button
                  type="button"
                  onClick={addScenario}
                  disabled={scenarios.length >= 3}
                  title={t.addScenario}
                  aria-label={t.addScenario}
                  className="inline-flex items-center rounded-sm border border-forest-500/20 p-1.5 text-forest-500/60 transition-colors hover:border-forest-500/50 hover:text-forest-500 disabled:cursor-not-allowed disabled:opacity-40"
                >
                  <Pin className="h-3.5 w-3.5" />
                </button>
              ) : null}
              <CurrencyPicker currency={currency} onChange={setCurrency} />
            </div>
          </div>
          <div className="mt-2 flex flex-wrap items-center gap-3">
            <p className="num text-4xl text-forest-900 @[40rem]:text-5xl">{money(r.projectedValue, true)}</p>
            <DealBadge grade={dealGrade(r, isRent)} t={t} />
          </div>
          {inputs.inflationPct > 0 ? (
            <p className="num mt-1 text-sm text-forest-500/55">≈ {money(r.realProjectedValue, true)} {t.inTodaysMoney}</p>
          ) : null}

          <Verdict r={r} grade={dealGrade(r, isRent)} money={money} t={t} />

          {inputs.fxDriftPct !== 0 ? (
            <div className="mt-3 rounded-sm border border-forest-500/10 bg-forest-500/[0.03] p-3">
              <p className="text-[11px] font-medium uppercase tracking-wide text-forest-500/55">{t.fxReturnTitle}</p>
              <p className="num mt-0.5 text-sm text-forest-900">{t.fxReturnLine(fmtPct(r.roiFxPct), fmtPct(r.cagrFxPct))}</p>
            </div>
          ) : null}

          <div className="mt-6 grid grid-cols-2 gap-x-4 gap-y-5 border-t border-forest-500/10 pt-6 @[26rem]:grid-cols-3">
            <Kpi label={t.totalRoi} value={fmtPct(r.roiPct)} accent tip={t.defRoi} />
            <Kpi label={t.cagrYear} value={fmtPct(r.cagrPct)} tip={t.defCagr} />
            <Kpi label={t.netProfit} value={money(r.netProfit)} />
          </div>
          {inputs.inflationPct > 0 ? (
            <p className="mt-2 text-[11px] text-forest-500/50">{t.realCagrNote(inputs.inflationPct, fmtPct(r.realCagrPct))}</p>
          ) : null}

          {isOffplan ? (
            <div className="mt-4 grid grid-cols-2 gap-x-4 gap-y-5 border-t border-forest-500/10 pt-4 @[34rem]:grid-cols-4">
              <Kpi label={t.valueAtHandover} value={money(r.handoverValue)} />
              <Kpi label={t.irrYear} value={fmtPct(r.irrPct)} accent tip={t.defIrr} />
              <Kpi label={t.totalInvested} value={money(r.initialInvestment)} />
              <Kpi label={t.paybackKpi} value={r.paybackYears != null ? t.paybackVal(r.paybackYears.toFixed(1)) : t.paybackNever} tip={t.defPayback} />
            </div>
          ) : isRent ? (
            <div className="mt-4 grid grid-cols-2 gap-x-4 gap-y-5 border-t border-forest-500/10 pt-4 @[34rem]:grid-cols-4">
              <Kpi label={t.capRate} value={fmtPct(r.capRatePct)} tip={t.defCapRate} />
              <Kpi label={t.cashOnCash} value={fmtPct(r.cashOnCashPct)} tip={t.defCashOnCash} />
              <Kpi label={t.grossYield} value={fmtPct(r.grossYieldPct)} tip={t.defGrossYield} />
              <Kpi label={t.paybackKpi} value={r.paybackYears != null ? t.paybackVal(r.paybackYears.toFixed(1)) : t.paybackNever} tip={t.defPayback} />
            </div>
          ) : (
            <div className="mt-4 grid grid-cols-2 gap-x-4 gap-y-5 border-t border-forest-500/10 pt-4 @[26rem]:grid-cols-3">
              <Kpi label={t.paybackKpi} value={r.paybackYears != null ? t.paybackVal(r.paybackYears.toFixed(1)) : t.paybackNever} tip={t.defPayback} />
            </div>
          )}

          {inputs.unitCount > 1 ? (
            <p className="mt-3 text-[11px] leading-relaxed text-forest-500/55">{t.unitsCombinedNote(inputs.unitCount)}</p>
          ) : null}

          <div className="mt-6 space-y-2">
            <CalcLeadButton message={calcSummary} rwNumber={excludeRw} />
            {/* High-intent shortcut: hand the computed scenario straight to an
                agent on WhatsApp, pre-filled — shorter than the form. */}
            <a
              href={whatsappLink(calcSummary)}
              target="_blank"
              rel="noopener noreferrer"
              className="flex w-full items-center justify-center gap-2 rounded-sm border border-brass-500/40 bg-brass-500/5 px-5 py-2.5 text-sm font-medium text-brass-700 transition-colors hover:border-brass-500 hover:bg-brass-500/10"
            >
              <MessageCircle className="h-4 w-4" />
              {t.discussWhatsApp}
            </a>
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

        {/* Full view: the four-tab analytics suite. Simple view (below): a single
            summary block + a nudge to switch to full. */}
        {view === "full" ? (
          <>
        {/* Result tabs — keep the analytical depth without a long scroll. */}
        <div className="mt-6 flex flex-wrap gap-1 border-b border-forest-500/15">
          {([
            ["summary", t.tabSummary],
            ["returns", t.tabReturns],
            ["risk", t.tabRisk],
            ["compare", scenarios.length ? `${t.tabCompare} (${scenarios.length})` : t.tabCompare],
          ] as const).map(([k, label]) => (
            <button
              key={k}
              type="button"
              onClick={() => setTab(k)}
              className={`-mb-px border-b-2 px-3 py-2 text-sm font-medium transition-colors ${
                tab === k ? "border-brass-500 text-forest-900" : "border-transparent text-forest-500/60 hover:text-forest-500"
              }`}
            >
              {label}
            </button>
          ))}
        </div>

        {tab === "summary" ? (
          <>
            <BankCompare r={r} years={inputs.years} bankRate={inputs.bankRatePct} altRate={inputs.altReturnPct} money={money} t={t} />
            <BreakEven be={breakEven} beatsNow={r.vsBankThb >= 0} t={t} />
            <div className="mt-6 rounded-sm border border-forest-500/10 bg-cream-50 p-6">
              <div className="flex items-center gap-2 text-[0.8125rem] font-medium uppercase tracking-eyebrow text-brass-500">
                <TrendingUp className="h-4 w-4" />
                {isOffplan && !inputs.rentAfterHandover ? t.capitalGrowth : t.returnVsBankTitle}
              </div>
              <GrowthChart r={r} money={money} t={t} mode={isOffplan && !inputs.rentAfterHandover ? "asset" : "owner"} />
            </div>
          </>
        ) : null}

        {tab === "returns" ? (
          <>
            <Waterfall r={r} money={money} isRent={isRent || isLet} t={t} />
            <RoiMatches
              inputs={inputs}
              targetRoi={targetRoi}
              setTargetRoi={setTargetRoi}
              roiVariesByPrice={roiVariesByPrice}
              catalog={catalog}
              market={market}
              excludeRw={excludeRw}
              t={t}
            />
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
                      <p className="text-[0.8125rem] font-medium uppercase tracking-eyebrow text-brass-500">{t.maxPurchasePrice}</p>
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
          </>
        ) : null}

        {tab === "risk" ? (
          <div className="mt-6">
            <RealityCheck inputs={inputs} market={market} t={t} />
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
            {/* Two-way sensitivity matrix */}
            <div className="mt-4">
              <button
                type="button"
                onClick={() => setShowMatrix((v) => !v)}
                className="flex items-center gap-1.5 text-sm font-medium text-forest-500/80 hover:text-forest-500"
              >
                <ChevronDown className={`h-4 w-4 transition-transform ${showMatrix ? "rotate-180" : ""}`} />
                {t.matrixTitle}
              </button>
              {showMatrix ? <Matrix inputs={inputs} isRent={isRent} t={t} /> : null}
            </div>
            {/* Tornado — biggest levers */}
            <div className="mt-4">
              <button
                type="button"
                onClick={() => setShowTornado((v) => !v)}
                className="flex items-center gap-1.5 text-sm font-medium text-forest-500/80 hover:text-forest-500"
              >
                <ChevronDown className={`h-4 w-4 transition-transform ${showTornado ? "rotate-180" : ""}`} />
                {t.tornadoTitle}
              </button>
              {showTornado ? <Tornado inputs={inputs} isRent={isRent} isLet={isLet} t={t} /> : null}
            </div>
            {/* Monte Carlo — probabilistic outcome distribution over the data bands */}
            <div className="mt-4">
              <button
                type="button"
                onClick={() => setShowMc((v) => !v)}
                className="flex items-center gap-1.5 text-sm font-medium text-forest-500/80 hover:text-forest-500"
              >
                <Dices className="h-4 w-4" />
                {t.mcTitle}
              </button>
              {showMc && mc ? (
                <>
                  <MonteCarlo mc={mc} rent={roiVariesByPrice} altRate={inputs.altReturnPct} t={t} />
                  <div className="mt-4 rounded-sm border border-forest-500/10 bg-cream-50 p-5">
                    <p className="text-[0.8125rem] font-medium uppercase tracking-eyebrow text-brass-500">{t.fanTitle}</p>
                    <FanChart band={mc.band} money={money} t={t} />
                  </div>
                </>
              ) : null}
            </div>
          </div>
        ) : null}

        {tab === "compare" ? (
          <ScenarioCompare
            scenarios={scenarios}
            current={currentScenario}
            onRemove={(id) => setScenarios((p) => p.filter((s) => s.id !== id))}
            onClear={() => setScenarios([])}
            money={money}
            t={t}
          />
        ) : null}
          </>
        ) : (
          <div className="mt-6 space-y-6">
            <BankCompare r={r} years={inputs.years} bankRate={inputs.bankRatePct} altRate={inputs.altReturnPct} money={money} t={t} />
            <BreakEven be={breakEven} beatsNow={r.vsBankThb >= 0} t={t} />
            <div className="rounded-sm border border-forest-500/10 bg-cream-50 p-6">
              <div className="flex items-center gap-2 text-[0.8125rem] font-medium uppercase tracking-eyebrow text-brass-500">
                <TrendingUp className="h-4 w-4" />
                {isOffplan && !inputs.rentAfterHandover ? t.capitalGrowth : t.returnVsBankTitle}
              </div>
              <GrowthChart r={r} money={money} t={t} mode={isOffplan && !inputs.rentAfterHandover ? "asset" : "owner"} />
            </div>
            <button
              type="button"
              onClick={() => setView("full")}
              className="flex w-full items-center justify-center gap-1.5 rounded-sm border border-dashed border-forest-500/25 px-4 py-2.5 text-sm font-medium text-forest-500/70 transition-colors hover:border-brass-500/50 hover:text-brass-600"
            >
              <span>{t.viewMorePrompt}</span>
              <span className="font-semibold text-brass-600">{t.viewSwitchFull}</span>
              <ArrowRight className="h-3.5 w-3.5" />
            </button>
          </div>
        )}

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
            className="rounded-sm bg-panel px-3 py-2 text-xs font-medium text-panel-fg"
          >
            {t.resultsBtn}
          </a>
        </div>
      </div>
    ) : null}
    </>
  );
}
