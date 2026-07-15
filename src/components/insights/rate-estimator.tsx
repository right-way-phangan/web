"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { track } from "@vercel/analytics";
import { Calculator, Waves, Eye, Lock, TrendingUp } from "lucide-react";
import { LeadForm } from "@/components/forms/lead-form";
import { useLocale } from "@/lib/i18n/use-locale";
import { type RentalMarket, type MoneyFmt } from "@/lib/data/rental-market";
import {
  estimateRate,
  forecastMonths,
  type OccScenario,
  type RateEstimate,
} from "@/lib/insights/rate-estimate";
import { SectionHead, CONF_COLOR } from "./ins-shared";

/**
 * "Rate check" — the interactive hook of /insights. A property owner picks their
 * district, type, bedrooms and features and gets an instant nightly-rate + income
 * estimate (FREE). The deeper breakdown — 12-month forecast, district comparison,
 * net view — sits behind the shared lead gate (freemium). Pure client math over
 * the bundled snapshot (rate-estimate.ts); no API, instant, free at any traffic.
 */

const RE = {
  en: {
    eyebrow: "Rate check",
    title: "What could your place earn?",
    note: "Pick your property below for an instant nightly-rate and income estimate from the live market — then unlock the month-by-month forecast.",
    district: "District",
    type: "Property type",
    bedrooms: "Bedrooms",
    any: "Any",
    studio: "Studio",
    br: (n: number) => `${n} BR`,
    pool: "Pool",
    seaView: "Sea view",
    occupancy: "Occupancy",
    scen: { conservative: "Conservative", base: "Base", high: "High", measured: "Measured" } as Record<
      OccScenario,
      string
    >,
    pickDistrict: "Choose a district to see the estimate.",
    perNight: "/night",
    estRate: "Estimated nightly rate",
    range: (lo: string, hi: string) => `Typical range ${lo}–${hi}`,
    atOcc: (pct: number) => `at ${pct}% occupancy`,
    perMonth: "Income / month",
    perYear: "Income / year (gross)",
    conf: { low: "Low sample", medium: "Fair sample", high: "Strong sample" } as Record<
      "low" | "medium" | "high",
      string
    >,
    basisLabel: {
      districtBedrooms: (d: string, br: string) => `${br} comps in ${d}`,
      districtType: (d: string) => `type-adjusted district median, ${d}`,
      district: (d: string) => `district median, ${d}`,
      islandBedrooms: () => "island median by bedrooms",
      island: () => "island-wide median",
    } as Record<RateEstimate["basis"], (d: string, br: string) => string>,
    basisFoot: (basis: string, n: number) => `Basis: ${basis} · ${n} listings. Occupancy assumed — see method.`,
    demandCue: (peak: string, pct: number) =>
      `Demand rises toward ${peak} — peak nightly runs about +${pct}% vs now.`,
    demandFlat: "Demand is fairly even across the coming months.",
    // gated
    unlockTitle: "Unlock your full projection",
    unlockNote:
      "Leave your email to see the month-by-month income forecast, how your district compares island-wide, and the net-of-costs view — plus a human read on your specific place.",
    unlockSubmit: "Show my forecast",
    forecastTitle: "Projected income by month",
    forecastNote: (occ: number) =>
      `Monthly income at ${occ}% occupancy, shaped by seasonal demand. A demand-based indication, not a guaranteed rate.`,
    compareTitle: "Your district vs the island",
    islandMed: "Island median",
    netTitle: "After costs",
    netAnnual: "Net / year",
    netAfter: "after 25% management",
    longTerm: "Long-term rent / mo",
    longTermNote: "if let unfurnished, long-term",
    leadMsg: (summary: string) => `Rate check — ${summary}. Please send my full projection and a read on this property.`,
    summary: (p: { config: string; district: string; feats: string; nightly: string; monthly: string }) =>
      `${p.config} in ${p.district}${p.feats} — est. ${p.nightly}/night (~${p.monthly}/mo)`,
  },
  ru: {
    eyebrow: "Проверка ставки",
    title: "Сколько может приносить ваш объект?",
    note: "Выберите объект ниже — и получите мгновенную оценку ставки за ночь и дохода по живому рынку, а затем откройте помесячный прогноз.",
    district: "Район",
    type: "Тип объекта",
    bedrooms: "Спальни",
    any: "Любой",
    studio: "Студия",
    br: (n: number) => `${n} спал.`,
    pool: "Бассейн",
    seaView: "Вид на море",
    occupancy: "Загрузка",
    scen: {
      conservative: "Консерв.",
      base: "Базовая",
      high: "Высокая",
      measured: "Измеренная",
    } as Record<OccScenario, string>,
    pickDistrict: "Выберите район, чтобы увидеть оценку.",
    perNight: "/ночь",
    estRate: "Оценка ставки за ночь",
    range: (lo: string, hi: string) => `Типичный диапазон ${lo}–${hi}`,
    atOcc: (pct: number) => `при загрузке ${pct}%`,
    perMonth: "Доход / месяц",
    perYear: "Доход / год (валовый)",
    conf: { low: "Малая выборка", medium: "Средняя выборка", high: "Большая выборка" } as Record<
      "low" | "medium" | "high",
      string
    >,
    basisLabel: {
      districtBedrooms: (d: string, br: string) => `${br}: компсы в ${d}`,
      districtType: (d: string) => `медиана района с поправкой на тип, ${d}`,
      district: (d: string) => `медиана района, ${d}`,
      islandBedrooms: () => "медиана острова по спальням",
      island: () => "медиана по острову",
    } as Record<RateEstimate["basis"], (d: string, br: string) => string>,
    basisFoot: (basis: string, n: number) =>
      `Основа: ${basis} · ${n} объявлений. Загрузка — допущение, см. метод.`,
    demandCue: (peak: string, pct: number) =>
      `Спрос растёт к ${peak} — на пике ставка примерно на +${pct}% выше, чем сейчас.`,
    demandFlat: "Спрос в ближайшие месяцы примерно ровный.",
    unlockTitle: "Откройте полный прогноз",
    unlockNote:
      "Оставьте email — увидите помесячный прогноз дохода, как ваш район выглядит на фоне острова, и вид за вычетом расходов, плюс живой разбор именно вашего объекта.",
    unlockSubmit: "Показать прогноз",
    forecastTitle: "Прогноз дохода по месяцам",
    forecastNote: (occ: number) =>
      `Доход в месяц при загрузке ${occ}%, с учётом сезонности спроса. Ориентир по спросу, а не гарантированная ставка.`,
    compareTitle: "Ваш район против острова",
    islandMed: "Медиана острова",
    netTitle: "После расходов",
    netAnnual: "Чистыми / год",
    netAfter: "после 25% управления",
    longTerm: "Долгосрочная аренда / мес",
    longTermNote: "если сдавать вдолгую, без мебели",
    leadMsg: (summary: string) =>
      `Проверка ставки — ${summary}. Пришлите, пожалуйста, полный прогноз и разбор по объекту.`,
    summary: (p: { config: string; district: string; feats: string; nightly: string; monthly: string }) =>
      `${p.config} в ${p.district}${p.feats} — оценка ${p.nightly}/ночь (~${p.monthly}/мес)`,
  },
};

type ReDict = (typeof RE)["en"];

export function RateEstimator({
  market,
  fmt,
  unlocked,
  onUnlock,
}: {
  market: RentalMarket;
  fmt: MoneyFmt;
  unlocked: boolean;
  onUnlock: () => void;
}) {
  const locale = useLocale();
  const t = RE[locale];

  const districts = useMemo(
    () => [...market.districts].sort((a, b) => a.name.localeCompare(b.name)),
    [market.districts],
  );
  const types = useMemo(() => market.byType.filter((x) => x.n >= 3), [market.byType]);
  const bedroomOpts = useMemo(
    () => [...market.byBedrooms].filter((b) => b.n >= 3).sort((a, b) => a.bedrooms - b.bedrooms),
    [market.byBedrooms],
  );

  const [district, setDistrict] = useState("");
  const [type, setType] = useState("");
  const [bedrooms, setBedrooms] = useState("");
  const [pool, setPool] = useState(false);
  const [seaView, setSeaView] = useState(false);
  const [scenario, setScenario] = useState<OccScenario>("base");

  const est = useMemo<RateEstimate | null>(() => {
    if (!district) return null;
    return estimateRate(
      {
        district,
        type: type || undefined,
        bedrooms: bedrooms === "" ? null : Number(bedrooms),
        pool,
        seaView,
      },
      market,
      scenario,
    );
  }, [district, type, bedrooms, pool, seaView, scenario, market]);

  const forecast = useMemo(
    () => (est ? forecastMonths(est, market, 12) : null),
    [est, market],
  );

  // Fire once when the user gets their first estimate — funnel signal per surface.
  const tracked = useRef(false);
  useEffect(() => {
    if (est && !tracked.current) {
      tracked.current = true;
      track("rate_check", { district, basis: est.basis });
    }
  }, [est, district]);

  const measuredAvailable = est?.occMeasured != null;
  const scenarios: OccScenario[] = ["conservative", "base", "high"];
  if (measuredAvailable) scenarios.push("measured");

  const brLabel = bedrooms === "" ? t.any : bedrooms === "0" ? t.studio : t.br(Number(bedrooms));
  const configWord = bedrooms === ""
    ? types.find((x) => x.type === type)?.label ?? t.any
    : `${brLabel}${type ? ` ${types.find((x) => x.type === type)?.label ?? ""}` : ""}`;
  const basisText = est ? t.basisLabel[est.basis](district, brLabel) : "";
  const feats = [pool ? t.pool : null, seaView ? t.seaView : null].filter(Boolean);
  const summary = est
    ? t.summary({
        config: configWord,
        district,
        feats: feats.length ? ` (${feats.join(", ").toLowerCase()})` : "",
        nightly: fmt(est.nightly),
        monthly: fmt(est.monthly, true),
      })
    : "";

  return (
    <section id="rate-check" className="scroll-mt-32">
      <SectionHead
        icon={<Calculator className="h-4 w-4" />}
        eyebrow={t.eyebrow}
        title={t.title}
        note={t.note}
      />

      <div className="mt-6 overflow-hidden rounded-sm border border-brass-300/50 bg-cream-50">
        {/* Inputs */}
        <div className="border-b border-forest-500/10 bg-brass-500/[0.04] p-5 md:p-6">
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
            <Select label={t.district} value={district} onChange={setDistrict} placeholder={`— ${t.district} —`}>
              {districts.map((d) => (
                <option key={d.name} value={d.name}>
                  {d.name}
                </option>
              ))}
            </Select>
            <Select label={t.type} value={type} onChange={setType} placeholder={t.any}>
              {types.map((x) => (
                <option key={x.type} value={x.type}>
                  {x.label}
                </option>
              ))}
            </Select>
            <Select label={t.bedrooms} value={bedrooms} onChange={setBedrooms} placeholder={t.any}>
              {bedroomOpts.map((b) => (
                <option key={b.bedrooms} value={String(b.bedrooms)}>
                  {b.bedrooms === 0 ? t.studio : t.br(b.bedrooms)}
                </option>
              ))}
            </Select>
          </div>
          <div className="mt-3 flex flex-wrap items-center gap-2">
            <Toggle active={pool} onClick={() => setPool((v) => !v)} icon={<Waves className="h-3.5 w-3.5" />}>
              {t.pool}
            </Toggle>
            <Toggle active={seaView} onClick={() => setSeaView((v) => !v)} icon={<Eye className="h-3.5 w-3.5" />}>
              {t.seaView}
            </Toggle>
            <span className="ml-auto flex flex-wrap items-center gap-1.5 text-[11px] text-forest-500/60">
              <span className="uppercase tracking-wide">{t.occupancy}</span>
              {scenarios.map((s) => (
                <button
                  key={s}
                  type="button"
                  onClick={() => setScenario(s)}
                  className={`rounded-full px-2.5 py-0.5 transition-colors ${
                    scenario === s
                      ? "bg-panel text-panel-fg"
                      : "bg-forest-500/8 text-forest-500/70 hover:bg-forest-500/15"
                  }`}
                >
                  {t.scen[s]}
                </button>
              ))}
            </span>
          </div>
        </div>

        {/* Result */}
        <div className="p-5 md:p-6">
          {!est ? (
            <p className="py-6 text-center text-sm text-forest-500/60">{t.pickDistrict}</p>
          ) : (
            <>
              <FreeResult
                est={est}
                fmt={fmt}
                t={t}
                basisText={basisText}
                forecastPeakPct={forecast?.deltaToPeakPct ?? 0}
                peakMonth={forecast?.peakMonth ?? ""}
              />

              {/* Gated deep-dive */}
              <div className="mt-6 border-t border-forest-500/10 pt-6">
                {unlocked ? (
                  <DeepDive est={est} market={market} fmt={fmt} forecast={forecast} t={t} />
                ) : (
                  <GatePreview est={est} market={market} fmt={fmt} forecast={forecast} t={t} locale={locale} summary={summary} onUnlock={onUnlock} />
                )}
              </div>
            </>
          )}
        </div>
      </div>
    </section>
  );
}

/* ------------------------------ Free result ------------------------------ */

function FreeResult({
  est,
  fmt,
  t,
  basisText,
  forecastPeakPct,
  peakMonth,
}: {
  est: RateEstimate;
  fmt: MoneyFmt;
  t: ReDict;
  basisText: string;
  forecastPeakPct: number;
  peakMonth: string;
}) {
  return (
    <div>
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <div className="text-[11px] uppercase tracking-wider text-forest-500/55">{t.estRate}</div>
          <div className="mt-1 flex items-baseline gap-1.5">
            <span className="font-serif text-4xl text-forest-900 md:text-5xl">{fmt(est.nightly)}</span>
            <span className="text-sm text-forest-500/60">{t.perNight}</span>
          </div>
          {est.p25 != null && est.p75 != null ? (
            <div className="mt-1 text-xs text-forest-500/60">{t.range(fmt(est.p25), fmt(est.p75))}</div>
          ) : null}
        </div>
        <div className="flex items-center gap-1.5 text-xs text-forest-500/70">
          <span className={`h-2 w-2 rounded-full ${CONF_COLOR[est.confidence]}`} />
          {t.conf[est.confidence]}
        </div>
      </div>

      <div className="mt-5 grid grid-cols-2 gap-3">
        <div className="rounded-sm bg-forest-500/[0.05] p-4">
          <div className="text-[11px] uppercase tracking-wide text-forest-500/55">{t.perMonth}</div>
          <div className="mt-0.5 font-serif text-2xl text-forest-900">{fmt(est.monthly)}</div>
          <div className="text-[11px] text-forest-500/50">{t.atOcc(est.occPct)}</div>
        </div>
        <div className="rounded-sm bg-forest-500/[0.05] p-4">
          <div className="text-[11px] uppercase tracking-wide text-forest-500/55">{t.perYear}</div>
          <div className="mt-0.5 font-serif text-2xl text-forest-900">{fmt(est.annualGross, true)}</div>
          <div className="text-[11px] text-forest-500/50">{t.atOcc(est.occPct)}</div>
        </div>
      </div>

      {forecastPeakPct > 3 && peakMonth ? (
        <p className="mt-4 inline-flex items-center gap-2 rounded-sm bg-brass-200/40 px-3.5 py-2 text-sm text-forest-500">
          <TrendingUp className="h-4 w-4 text-brass-500" />
          {t.demandCue(peakMonth, forecastPeakPct)}
        </p>
      ) : (
        <p className="mt-4 text-sm text-forest-500/60">{t.demandFlat}</p>
      )}

      <p className="mt-3 text-[11px] text-forest-500/45">{t.basisFoot(basisText, est.n)}</p>
    </div>
  );
}

/* --------------------------- Gated: preview + form --------------------------- */

function GatePreview({
  est,
  market,
  fmt,
  forecast,
  t,
  locale,
  summary,
  onUnlock,
}: {
  est: RateEstimate;
  market: RentalMarket;
  fmt: MoneyFmt;
  forecast: ReturnType<typeof forecastMonths>;
  t: ReDict;
  locale: "en" | "ru";
  summary: string;
  onUnlock: () => void;
}) {
  return (
    <div className="grid gap-6 lg:grid-cols-[1fr_minmax(17rem,20rem)] lg:items-center">
      {/* blurred teaser of the deep dive */}
      <div className="relative">
        <div className="select-none blur-[5px] pointer-events-none" aria-hidden>
          <DeepDive est={est} market={market} fmt={fmt} forecast={forecast} t={t} />
        </div>
        <div className="absolute inset-0 flex items-center justify-center">
          <span className="inline-flex items-center gap-2 rounded-full bg-panel/90 px-4 py-2 text-sm font-medium text-panel-fg">
            <Lock className="h-4 w-4" />
            {t.unlockTitle}
          </span>
        </div>
      </div>
      <div className="rounded-sm border border-brass-300/50 bg-brass-500/[0.05] p-5">
        <p className="text-sm text-forest-500/80">{t.unlockNote}</p>
        <div className="mt-4">
          <LeadForm
            source="contact"
            kind="market-report"
            layout="card"
            locale={locale}
            submitLabel={t.unlockSubmit}
            defaultMessage={t.leadMsg(summary)}
            onSuccess={onUnlock}
          />
        </div>
      </div>
    </div>
  );
}

/* ------------------------------ Deep dive ------------------------------ */

function DeepDive({
  est,
  market,
  fmt,
  forecast,
  t,
}: {
  est: RateEstimate;
  market: RentalMarket;
  fmt: MoneyFmt;
  forecast: ReturnType<typeof forecastMonths>;
  t: ReDict;
}) {
  return (
    <div className="space-y-8">
      {/* 12-month income forecast */}
      {forecast ? (
        <div>
          <h4 className="font-medium text-forest-500">{t.forecastTitle}</h4>
          <p className="mt-1 text-sm text-forest-500/70">{t.forecastNote(est.occPct)}</p>
          <ForecastBars months={forecast.months} fmt={fmt} />
        </div>
      ) : null}

      {/* District comparison */}
      <DistrictCompare market={market} fmt={fmt} t={t} />

      {/* Net view */}
      <div>
        <h4 className="font-medium text-forest-500">{t.netTitle}</h4>
        <div className="mt-3 grid grid-cols-2 gap-3">
          <div className="rounded-sm bg-forest-500/[0.05] p-4">
            <div className="text-[11px] uppercase tracking-wide text-forest-500/55">{t.netAnnual}</div>
            <div className="mt-0.5 font-serif text-2xl text-forest-900">{fmt(est.annualNet, true)}</div>
            <div className="text-[11px] text-forest-500/50">{t.netAfter}</div>
          </div>
          <div className="rounded-sm bg-forest-500/[0.05] p-4">
            <div className="text-[11px] uppercase tracking-wide text-forest-500/55">{t.longTerm}</div>
            <div className="mt-0.5 font-serif text-2xl text-forest-900">{fmt(est.longTermMonthly)}</div>
            <div className="text-[11px] text-forest-500/50">{t.longTermNote}</div>
          </div>
        </div>
      </div>
    </div>
  );
}

function ForecastBars({
  months,
  fmt,
}: {
  months: NonNullable<ReturnType<typeof forecastMonths>>["months"];
  fmt: MoneyFmt;
}) {
  const max = Math.max(...months.map((m) => m.monthly), 1);
  return (
    <div className="mt-4 rounded-sm border border-forest-500/10 bg-cream-50 p-4">
      <div className="flex items-end gap-1 sm:gap-1.5" style={{ height: 140 }}>
        {months.map((m, i) => {
          const h = Math.max(6, Math.round((m.monthly / max) * 108));
          return (
            <div key={i} className="flex min-w-0 flex-1 flex-col items-center justify-end gap-1">
              <div
                className={`w-full rounded-t-sm ${
                  m.tone === "peak"
                    ? "bg-brass-500"
                    : m.tone === "low"
                      ? "bg-forest-500/25"
                      : m.tone === "high"
                        ? "bg-forest-500/55"
                        : "bg-forest-500/40"
                }`}
                style={{ height: h }}
                title={fmt(m.monthly)}
              />
              <span className="text-[9px] text-forest-500/55">{m.month}</span>
            </div>
          );
        })}
      </div>
    </div>
  );
}

function DistrictCompare({
  market,
  fmt,
  t,
}: {
  market: RentalMarket;
  fmt: MoneyFmt;
  t: ReDict;
}) {
  const top = market.districts.slice(0, 5);
  const island = market.meta.adrMedianAll;
  const rows = [
    ...top.map((d) => ({ name: d.name, adr: d.adrMedian, ours: false })),
    ...(island != null ? [{ name: t.islandMed, adr: island, ours: true }] : []),
  ];
  const max = Math.max(...rows.map((r) => r.adr), 1);
  return (
    <div>
      <h4 className="font-medium text-forest-500">{t.compareTitle}</h4>
      <div className="mt-3 space-y-2">
        {rows.map((r) => (
          <div key={r.name} className="grid grid-cols-[8rem_1fr_auto] items-center gap-3">
            <span className={`truncate text-sm ${r.ours ? "text-brass-600" : "text-forest-900"}`}>
              {r.name}
            </span>
            <div className="h-2 overflow-hidden rounded-full bg-forest-500/8">
              <div
                className={`h-full rounded-full ${r.ours ? "bg-brass-400" : "bg-forest-500/70"}`}
                style={{ width: `${Math.max(4, Math.round((r.adr / max) * 100))}%` }}
              />
            </div>
            <span className="w-16 text-right text-sm font-semibold tabular-nums text-forest-900">
              {fmt(r.adr)}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}

/* ------------------------------ Inputs ------------------------------ */

function Select({
  label,
  value,
  onChange,
  placeholder,
  children,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  placeholder: string;
  children: React.ReactNode;
}) {
  return (
    <label className="block">
      <span className="mb-1 block text-[11px] font-medium text-forest-500/70">{label}</span>
      <select
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="w-full rounded-sm border border-forest-500/20 bg-cream-50 px-2.5 py-2 text-sm text-forest-900 outline-none focus:border-brass-500"
      >
        <option value="">{placeholder}</option>
        {children}
      </select>
    </label>
  );
}

function Toggle({
  active,
  onClick,
  icon,
  children,
}: {
  active: boolean;
  onClick: () => void;
  icon: React.ReactNode;
  children: React.ReactNode;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-pressed={active}
      className={`inline-flex items-center gap-1.5 rounded-full border px-3 py-1 text-xs font-medium transition-colors ${
        active
          ? "border-brass-400 bg-brass-400 text-forest-900"
          : "border-forest-500/20 text-forest-500/70 hover:border-brass-300"
      }`}
    >
      {icon}
      {children}
    </button>
  );
}
