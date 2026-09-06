"use client";

import { useState, useEffect, type ReactNode } from "react";
import Link from "next/link";
import type { Route } from "next";
import {
  Lock,
  TrendingUp,
  Waves,
  ArrowRight,
  Info,
  CheckCircle2,
  Hammer,
  Building2,
  Scale,
  CheckCircle,
  AlertTriangle,
  Gauge,
  ChevronDown,
  BedDouble,
} from "lucide-react";
import { LeadForm } from "@/components/forms/lead-form";
import { useLocale, localeHref } from "@/lib/i18n/use-locale";
import {
  type RentalMarket,
  type RmCrossCheck,
  type RmBedroomCrossCheck,
  type RmSeasonal,
  type DisplayCurrency,
  type MoneyFmt,
  type InventoryYieldRow,
  makeMoneyFmt,
  matchedCross,
  effectiveAnnualRangeThb,
  formatAnnualRange,
  measuredOccupancy,
} from "@/lib/data/rental-market";
import { EXTERNAL_BENCHMARKS, BENCHMARKS_REFRESHED } from "@/lib/data/external-benchmarks";
import { AnimatedNumber } from "@/components/motion/animated-number";
import { INS } from "./insights-i18n";
import { SectionHead, SubHead, Stat, CurrencyToggle, BarRow, Metric, Pill } from "./ins-shared";
import { FullReport, Methodology } from "./full-report";
import { InsightsNav } from "./insights-nav";
import { RateEstimator } from "./rate-estimator";
import { DistrictDemand } from "./district-demand";

type Tab = "owner" | "investor";

/**
 * /insights rental-market view. Reworked 2026-07-15 into an audience-segmented,
 * navigable page:
 *   #pulse (shared) → [owners] #rate-check + #rents → #trust (shared)
 *   → [investors] #land + #build → #report (gated) → #method (shared, ungated).
 * The interactive rate estimator (#rate-check) is the hook; the full report is
 * still gated behind a lead form (client-side reveal — a lead magnet, not secret
 * data). `landSlot` receives the server-rendered <SalePrices/> so land prices sit
 * in the investor zone without lifting currency state out of this component.
 */
export function RentalInsights({
  data,
  inventory = [],
  landSlot,
}: {
  data: RentalMarket;
  inventory?: InventoryYieldRow[];
  landSlot?: ReactNode;
}) {
  const t = INS[useLocale()];
  const [unlocked, setUnlocked] = useState(false);
  const [currency, setCurrency] = useState<DisplayCurrency>("THB");
  const [tab, setTab] = useState<Tab>("owner");
  const { meta } = data;
  const fmt = makeMoneyFmt(currency, meta.thbPerUsd);

  const top3 = data.districts.slice(0, 3);
  const maxAdr = Math.max(...data.districts.map((d) => d.adrMedian), 1);
  const poolPremium = data.featurePremiums.find((f) => f.key === "pool")?.premiumPct ?? null;

  if (data.districts.length === 0) {
    return (
      <p className="rounded-sm border border-forest-500/15 bg-cream-50 p-6 text-forest-500/80">
        {t.dataRefreshing}
      </p>
    );
  }

  return (
    <div className="container-prose">
      {/* #pulse — market pulse (shared header, always visible) */}
      <MarketPulse data={data} currency={currency} onCurrency={setCurrency} fmt={fmt} />

      {/* Trust — one compact line, full cards on demand (shared) */}
      <div className="mt-6">
        <TrustStrip data={data} fmt={fmt} />
      </div>

      {/* Audience split — owners see rent & income; investors see land, build & report */}
      <AudienceTabs value={tab} onChange={setTab} />
      <InsightsNav key={tab} tab={tab} />

      <div className="mt-8 space-y-16 md:mt-10 md:space-y-20">
        {tab === "owner" ? (
          <>
            {/* #rate-check — interactive estimator (the hook) */}
            <RateEstimator
              market={data}
              fmt={fmt}
              unlocked={unlocked}
              onUnlock={() => setUnlocked(true)}
            />

            {/* #rents — what homes earn: teaser + demand quality */}
            <section id="rents" className="scroll-mt-32">
              <SectionHead
                icon={<TrendingUp className="h-4 w-4" />}
                eyebrow={t.freePreview}
                title={t.teaserTitle}
                note={t.teaserNote}
              />
              <div className="mt-6 space-y-3">
                {top3.map((d, i) => (
                  <BarRow
                    key={d.name}
                    label={d.name}
                    slug={d.slug}
                    value={d.adrMedian}
                    max={maxAdr}
                    right={fmt(d.adrMedian)}
                    band={d.adrP25 != null && d.adrP75 != null ? { p25: d.adrP25, p75: d.adrP75 } : null}
                    sub={t.teaserSub(
                      d.n,
                      formatAnnualRange(d, meta, fmt),
                      effectiveAnnualRangeThb(d, meta).lowPct,
                      Math.round(meta.occupancy.base * 100),
                      measuredOccupancy(d, meta) != null
                        ? Math.round((measuredOccupancy(d, meta) as number) * 100)
                        : null,
                    )}
                    highlight
                    badge={i === 0 ? t.topPick : undefined}
                  />
                ))}
              </div>
              {poolPremium != null ? (
                <p className="mt-6 inline-flex items-center gap-2 rounded-sm bg-brass-200/40 px-4 py-2.5 text-sm text-forest-500">
                  <Waves className="h-4 w-4 text-brass-500" />
                  {t.poolPremium(poolPremium)}
                </p>
              ) : null}

              <DistrictDemand data={data} />
            </section>
          </>
        ) : (
          <>
            {/* #land — land prices by district (server-rendered slot) */}
            {landSlot ? (
              <section id="land" className="scroll-mt-32">
                {landSlot}
              </section>
            ) : null}

            {/* #build — what to build + our inventory against the market */}
            <section id="build" className="scroll-mt-32 space-y-16 md:space-y-20">
              <BuildRecommendation data={data} fmt={fmt} />
              {inventory.length > 0 ? <InventoryYield rows={inventory} fmt={fmt} /> : null}
            </section>

            {/* #report — gate + full report */}
            <section id="report" className="relative scroll-mt-32">
              <SectionHead
                icon={<Lock className="h-4 w-4" />}
                eyebrow={unlocked ? t.fullReportEyebrow : t.unlockEyebrow}
                title={t.gateTitle}
                note={t.gateNote}
              />

              {!unlocked ? (
                <UnlockCard onSuccess={() => setUnlocked(true)} meta={meta} />
              ) : (
                <div className="mt-4 inline-flex items-center gap-2 rounded-sm border border-forest-500/20 bg-forest-50/40 px-4 py-2 text-sm text-forest-500">
                  <CheckCircle2 className="h-4 w-4 text-forest-500" />
                  {t.unlockedConfirm}
                </div>
              )}

              {/* Full content — blurred + inert until unlocked */}
              <div
                className={
                  unlocked
                    ? "mt-10 space-y-14"
                    : "mt-10 space-y-14 select-none blur-[6px] pointer-events-none"
                }
                aria-hidden={!unlocked}
              >
                <FullReport data={data} fmt={fmt} />
              </div>
            </section>
          </>
        )}
      </div>

      {/* #method — methodology (shared footer, never gated) */}
      <div id="method" className="mt-16 scroll-mt-32 md:mt-20">
        <Methodology meta={meta} dates={data.seasonal?.dates} />
      </div>
    </div>
  );
}

/* ------------------------ Cross-check wording -------------------------- */

/** Matched same-property pairs beat median-vs-median: use them when available. */
function crossAgree(cross: RmCrossCheck): boolean {
  return matchedCross(cross)?.agree ?? cross.agree;
}
function crossLabel(cross: RmCrossCheck, t: (typeof INS)[keyof typeof INS]): string {
  const m = matchedCross(cross);
  if (m) return t.matchedPairs(m.nPairs, m.diffMedianPct);
  const pct = cross.spreadPct ?? 0;
  return crossAgree(cross)
    ? (cross.sizeControlled ? t.agreeSized : t.agree)(pct)
    : (cross.sizeControlled ? t.divergeSized : t.diverge)(pct);
}

/* --------------------------- Zone divider ------------------------------ */

function AudienceTabs({ value, onChange }: { value: Tab; onChange: (t: Tab) => void }) {
  const t = INS[useLocale()];
  const tabs: { id: Tab; label: string; hint: string }[] = [
    { id: "owner", label: t.tabOwners, hint: t.tabOwnersHint },
    { id: "investor", label: t.tabInvestors, hint: t.tabInvestorsHint },
  ];
  return (
    <div
      role="tablist"
      aria-label={t.audienceAria}
      className="mx-auto mt-8 grid max-w-lg grid-cols-2 gap-1.5 rounded-sm border border-forest-500/12 bg-cream-50 p-1.5"
    >
      {tabs.map((tb) => {
        const on = value === tb.id;
        return (
          <button
            key={tb.id}
            type="button"
            role="tab"
            aria-selected={on}
            onClick={() => onChange(tb.id)}
            className={`rounded-sm px-4 py-2.5 text-center transition-colors ${
              on ? "bg-panel text-panel-fg" : "text-forest-500/70 hover:bg-forest-500/5"
            }`}
          >
            <span className="block text-sm font-medium">{tb.label}</span>
            <span className={`block text-[11px] ${on ? "text-panel-fg/70" : "text-forest-500/50"}`}>
              {tb.hint}
            </span>
          </button>
        );
      })}
    </div>
  );
}

/* ------------------------------- Trust strip ------------------------------- */

/**
 * Trust, compacted: one line ("how the price checks out" + a platform-agreement
 * pill) that expands on demand to the full triangulation + external-benchmark
 * cards. Keeps the reassurance without a heavy always-open section.
 */
function TrustStrip({ data, fmt }: { data: RentalMarket; fmt: MoneyFmt }) {
  const t = INS[useLocale()];
  const showTriangulation = data.crossCheck && data.crossCheck.sources.length >= 2;
  const showBenchmarks = data.meta.adrMedianAll != null;
  const bedroomCheck = data.bedroomCrossCheck ?? [];
  const showBedroom = bedroomCheck.length > 0;
  if (!showTriangulation && !showBenchmarks && !showBedroom) return null;
  const cross = data.crossCheck;

  return (
    <details className="group rounded-sm border border-forest-500/10 bg-cream-50">
      <summary className="flex cursor-pointer list-none items-center gap-2.5 px-5 py-3.5 text-sm [&::-webkit-details-marker]:hidden">
        <Scale className="h-4 w-4 shrink-0 text-brass-500" />
        <span className="font-medium text-forest-900">{t.trustTitle}</span>
        {showTriangulation && cross && cross.spreadPct != null ? (
          <span
            className={`hidden rounded-full px-2.5 py-0.5 text-xs font-medium sm:inline-flex ${
              crossAgree(cross)
                ? "bg-forest-500/10 text-forest-500"
                : "bg-brass-200/50 text-brass-600 dark:bg-brass-500/15 dark:text-brass-300"
            }`}
          >
            {crossLabel(cross, t)}
          </span>
        ) : null}
        <span className="ml-auto flex shrink-0 items-center gap-1 text-xs text-forest-500/60">
          {t.trustDetails}
          <ChevronDown className="h-4 w-4 transition-transform group-open:rotate-180" />
        </span>
      </summary>
      <div className="grid gap-4 border-t border-forest-500/10 px-5 py-5 lg:grid-cols-2">
        {showTriangulation ? (
          <TriangulationCard cross={data.crossCheck as RmCrossCheck} fmt={fmt} />
        ) : null}
        {showBenchmarks ? <BenchmarksCard meta={data.meta} fmt={fmt} /> : null}
        {showBedroom ? (
          <div className="lg:col-span-2">
            <BedroomCrossCheckCard rows={bedroomCheck} fmt={fmt} />
          </div>
        ) : null}
      </div>
    </details>
  );
}

/* ---------------------- Bedroom-level cross-check ---------------------- */

// Villa-к-villa по спальням: Airbnb vs Booking. Второй источник валидирует
// кривую цена×спальни (только спальни, где у обоих ≥8 вилл — фильтруется в пайплайне).
function BedroomCrossCheckCard({
  rows,
  fmt,
}: {
  rows: RmBedroomCrossCheck[];
  fmt: MoneyFmt;
}) {
  const t = INS[useLocale()];
  return (
    <div className="rounded-sm border border-forest-500/10 bg-cream-50 p-6">
      <SubHead title={t.bedroomCheckTitle} icon={<BedDouble className="h-4 w-4" />} />
      <p className="mt-1 text-sm text-forest-500/70">{t.bedroomCheckNote}</p>
      <div className="mt-4 overflow-x-auto">
        <table className="w-full min-w-[22rem] text-sm">
          <thead>
            <tr className="text-left text-xs uppercase tracking-wider text-forest-500/55">
              <th className="py-1 pr-4 font-medium">{t.bedroomCheckTitle}</th>
              <th className="py-1 pr-4 font-medium">Airbnb</th>
              <th className="py-1 font-medium">Booking</th>
            </tr>
          </thead>
          <tbody>
            {rows.map((r) => (
              <tr key={r.bedrooms} className="border-t border-forest-500/5">
                <td className="py-1.5 pr-4 text-forest-500/80">{t.bedroomCheckCol(r.bedrooms)}</td>
                <td className="py-1.5 pr-4 font-medium text-forest-900 tabular-nums">
                  {fmt(r.airbnb.adrMedian)}{" "}
                  <span className="text-xs font-normal text-forest-500/50">· {r.airbnb.n}</span>
                </td>
                <td className="py-1.5 font-medium text-forest-900 tabular-nums">
                  {fmt(r.booking.adrMedian)}{" "}
                  <span className="text-xs font-normal text-forest-500/50">· {r.booking.n}</span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

/* ---------------------------- Market pulse ----------------------------- */

function MarketPulse({
  data,
  currency,
  onCurrency,
  fmt,
}: {
  data: RentalMarket;
  currency: DisplayCurrency;
  onCurrency: (c: DisplayCurrency) => void;
  fmt: MoneyFmt;
}) {
  const t = INS[useLocale()];
  const { meta } = data;
  return (
    <section id="pulse" className="scroll-mt-32">
      <div className="flex flex-wrap items-start justify-between gap-x-8 gap-y-4 rounded-sm border border-forest-500/10 bg-cream-50 px-6 py-5 text-sm">
        <div className="flex flex-wrap items-start gap-x-8 gap-y-4">
          <div>
            <div className="text-[11px] uppercase tracking-wider text-forest-500/55">
              {t.listingsAnalysed}
            </div>
            <div className="mt-0.5 font-serif text-2xl text-forest-900">
              <AnimatedNumber value={meta.sample} />
            </div>
          </div>
          <SourceMix meta={meta} />
          <div className="flex flex-col gap-1">
            <Stat label={t.snapshot} value={meta.date} />
            <Freshness date={meta.date} />
          </div>
          {meta.occupancyMeasuredAll != null ? (
            <Stat label={t.activeOcc} value={`${Math.round(meta.occupancyMeasuredAll * 100)}%`} />
          ) : null}
          <AdrSparkline seasonal={data.seasonal} fmt={fmt} label={t.trendLabel} />
        </div>
        <CurrencyToggle currency={currency} onChange={onCurrency} />
      </div>
    </section>
  );
}

/**
 * Inline ADR-over-snapshots sparkline for the pulse strip. Renders only once the
 * pipeline has ≥2 snapshots; before that the strip simply omits it.
 */
function AdrSparkline({
  seasonal,
  fmt,
  label,
}: {
  seasonal: RmSeasonal;
  fmt: MoneyFmt;
  label: string;
}) {
  const pts = seasonal.overall
    .map((v, i) => ({ v, i }))
    .filter((p): p is { v: number; i: number } => p.v != null);
  if (pts.length < 2) return null;
  const vals = pts.map((p) => p.v);
  const min = Math.min(...vals);
  const max = Math.max(...vals);
  const first = vals[0];
  const last = vals[vals.length - 1];
  const deltaPct = first ? Math.round(((last - first) / first) * 100) : 0;
  const W = 168;
  const H = 44;
  const n = pts.length - 1 || 1;
  const x = (i: number) => (i / n) * W;
  const y = (v: number) => H - 2 - ((v - min) / Math.max(1, max - min)) * (H - 4);
  const line = pts.map((p, i) => `${x(i)},${y(p.v)}`).join(" ");
  const area = `0,${H} ${line} ${W},${H}`;
  return (
    <div>
      <div className="text-[11px] uppercase tracking-wider text-forest-500/55">{label}</div>
      <div className="mt-1 flex items-center gap-2">
        <svg viewBox={`0 0 ${W} ${H}`} width={W} height={H} className="shrink-0" role="img" aria-label={label}>
          <polygon points={area} fill="var(--chart-accent)" opacity={0.12} />
          <polyline
            points={line}
            fill="none"
            style={{ stroke: "var(--chart-accent)" }}
            strokeWidth={1.5}
            strokeLinejoin="round"
            strokeLinecap="round"
          />
        </svg>
        <span className="text-sm font-medium tabular-nums text-forest-900">{fmt(last)}</span>
        {deltaPct !== 0 ? (
          <span
            className={`text-[11px] font-medium tabular-nums ${deltaPct > 0 ? "text-forest-500" : "text-brass-600"}`}
          >
            {deltaPct > 0 ? "+" : ""}
            {deltaPct}%
          </span>
        ) : null}
      </div>
    </div>
  );
}

/* ----------------------------- Freshness ------------------------------- */

// Относительная свежесть снимка. Считаем на клиенте (useEffect), чтобы избежать
// hydration-mismatch: на сервере рендерим пусто, дни проставляем в браузере.
function Freshness({ date }: { date: string }) {
  const t = INS[useLocale()];
  const [days, setDays] = useState<number | null>(null);
  useEffect(() => {
    const d = new Date(`${date}T00:00:00`);
    if (!Number.isNaN(d.getTime())) {
      setDays(Math.max(0, Math.round((Date.now() - d.getTime()) / 86_400_000)));
    }
  }, [date]);
  if (days === null) return null;
  const stale = days > 10;
  return (
    <span
      className={`inline-flex w-fit items-center gap-1.5 rounded-full px-2 py-0.5 text-[11px] font-medium ${
        stale ? "bg-brass-200/50 text-brass-600" : "bg-forest-500/10 text-forest-500"
      }`}
    >
      <span className={`h-1.5 w-1.5 rounded-full ${stale ? "bg-brass-500" : "bg-forest-500"}`} />
      {days === 0 ? t.freshToday : t.freshDaysAgo(days)}
    </span>
  );
}

/* ----------------------------- Source mix ------------------------------ */

function SourceMix({ meta }: { meta: RentalMarket["meta"] }) {
  const t = INS[useLocale()];
  const sources = meta.sources ?? [];
  if (sources.length === 0) {
    return <Stat label={t.source} value={meta.source} />;
  }
  return (
    <div>
      <div className="text-[11px] uppercase tracking-wider text-forest-500/55">{t.source}</div>
      <div className="mt-1 flex flex-wrap items-center gap-1.5">
        {sources.map((s) => (
          <span
            key={s.key}
            className="inline-flex items-center gap-1 rounded-full bg-forest-500/8 px-2.5 py-0.5 text-xs font-medium text-forest-900"
            title={t.sourceN(s.n)}
          >
            {s.label}
            <span className="tabular-nums text-forest-500/55">{s.n.toLocaleString("en-US")}</span>
          </span>
        ))}
      </div>
      {meta.dedup && meta.dedup.total !== meta.dedup.unique ? (
        <div className="mt-1 text-[10px] text-forest-500/45">
          {t.dedupNote(meta.dedup.total, meta.dedup.unique)}
        </div>
      ) : null}
    </div>
  );
}

/* ------------------- Trust cards (triangulation + benchmarks) ------------------- */

function TriangulationCard({ cross, fmt }: { cross: RmCrossCheck; fmt: MoneyFmt }) {
  const t = INS[useLocale()];
  const priced = cross.sources.filter((s) => s.adrMedian != null);
  const maxAdr = Math.max(...priced.map((s) => s.adrMedian ?? 0), 1);

  return (
    <div className="rounded-sm border border-forest-500/10 bg-cream-50 p-6">
      <SubHead title={t.triangulationTitle} icon={<Scale className="h-4 w-4" />} />
      <p className="mt-1 text-sm text-forest-500/70">{t.triangulationNote}</p>
      <div className="mt-4 space-y-3">
        {priced.map((s) => (
          <BarRow
            key={s.key}
            label={s.label}
            value={s.adrMedian ?? 0}
            max={maxAdr}
            right={fmt(s.adrMedian)}
            sub={t.sourceN(s.nPriced || s.n)}
          />
        ))}
      </div>
      {cross.spreadPct != null ? (
        <div
          className={`mt-5 inline-flex items-center gap-2 rounded-full px-3.5 py-1.5 text-sm font-medium ${
            crossAgree(cross) ? "bg-forest-50/60 text-forest-500" : "bg-brass-200/50 text-brass-600"
          }`}
        >
          {crossAgree(cross) ? <CheckCircle className="h-4 w-4" /> : <AlertTriangle className="h-4 w-4" />}
          {crossLabel(cross, t)}
        </div>
      ) : null}
    </div>
  );
}

function BenchmarksCard({ meta, fmt }: { meta: RentalMarket["meta"]; fmt: MoneyFmt }) {
  const t = INS[useLocale()];
  if (meta.adrMedianAll == null) return null;
  const rows = [
    {
      key: "ours",
      label: t.extOurs,
      adr: meta.adrMedianAll,
      listings: meta.sample,
      occ: null as number | null,
      asOf: meta.date,
      note: undefined as string | undefined,
      ours: true,
    },
    ...EXTERNAL_BENCHMARKS.map((b) => ({
      key: b.key,
      label: b.label,
      adr: b.adrThb,
      listings: b.listings,
      occ: b.occupancyPct,
      asOf: b.asOf,
      note: b.note,
      ours: false,
    })),
  ];
  const maxAdr = Math.max(...rows.map((r) => r.adr), 1);

  return (
    <div className="rounded-sm border border-forest-500/10 bg-cream-50 p-6">
      <SubHead title={t.extTitle} icon={<Gauge className="h-4 w-4" />} />
      <p className="mt-1 text-sm text-forest-500/70">{t.extNote}</p>
      <div className="mt-4 space-y-3">
        {rows.map((r) => (
          <BarRow
            key={r.key}
            label={r.label}
            value={r.adr}
            max={maxAdr}
            right={fmt(r.adr)}
            sub={t.extRowSub(r.listings, r.occ, r.asOf, r.note)}
            highlight={r.ours}
            tag={r.ours ? { label: t.extOursTag, tone: "good" } : undefined}
          />
        ))}
      </div>
      <p className="mt-4 text-sm text-forest-500">{t.extWithin(fmt(meta.adrMedianAll), meta.sample)}</p>
      <p className="mt-2 text-[11px] text-forest-500/45">{t.extRefreshed(BENCHMARKS_REFRESHED)}</p>
    </div>
  );
}

/* ------------------------- Build recommendation ------------------------ */

function BuildRecommendation({ data, fmt }: { data: RentalMarket; fmt: MoneyFmt }) {
  const locale = useLocale();
  const t = INS[locale];
  const topD = data.districts[0];
  const bestType = data.byType.find((ty) => ty.n >= 3);
  const topFeat = [...data.featurePremiums]
    .filter((f) => f.premiumPct != null)
    .sort((a, b) => (b.premiumPct ?? 0) - (a.premiumPct ?? 0))[0];
  const bestConfig = [...data.districtBedrooms]
    .filter((x) => x.district === topD.name)
    .sort((a, b) => b.adrMedian - a.adrMedian)[0];

  if (!topD) return null;
  const config = t.configLabel(bestConfig ? bestConfig.bedrooms : null, bestType?.label ?? null);
  const feat = topFeat ? (t.featurePhrase[topFeat.key] ?? topFeat.label.toLowerCase()) : null;

  return (
    <div className="rounded-sm border border-brass-300/50 bg-gradient-to-br from-cream-50 to-brass-200/20 p-7 md:p-9">
      <p className="inline-flex items-center gap-1.5 text-[0.8125rem] font-medium uppercase tracking-eyebrow text-brass-500">
        <Hammer className="h-4 w-4" />
        {t.whatDataSuggests}
      </p>
      <p className="mt-4 max-w-3xl text-pretty text-lg leading-relaxed text-forest-900 md:text-xl">
        {t.buildSentence({
          config,
          feat,
          district: topD.name,
          nightly: fmt(bestConfig?.adrMedian ?? topD.adrMedian),
          annual: formatAnnualRange(topD, data.meta, fmt),
          lowPct: effectiveAnnualRangeThb(topD, data.meta).lowPct,
          basePct: Math.round(data.meta.occupancy.base * 100),
          booked:
            measuredOccupancy(topD, data.meta) != null
              ? Math.round((measuredOccupancy(topD, data.meta) as number) * 100)
              : null,
        })}
      </p>
      <div className="mt-5 flex flex-wrap gap-2.5">
        {topFeat?.premiumPct != null ? (
          <Pill>{t.pillAdds(topFeat.label, topFeat.premiumPct)}</Pill>
        ) : null}
        {bestType ? <Pill>{t.pillHighestType(bestType.label)}</Pill> : null}
        <Pill>{t.pillComps(topD.n, topD.name)}</Pill>
      </div>
      <Link
        href={localeHref(locale, "/calculator?mode=rent") as Route}
        className="mt-6 inline-flex items-center gap-2 text-sm font-medium text-forest-500 hover:text-brass-500"
      >
        {t.modelThisRoi}
        <ArrowRight className="h-4 w-4" />
      </Link>
    </div>
  );
}

/* --------------------- Inventory × market overlay ---------------------- */

function InventoryYield({ rows, fmt }: { rows: InventoryYieldRow[]; fmt: MoneyFmt }) {
  const locale = useLocale();
  const t = INS[locale];
  return (
    <div>
      <SectionHead
        icon={<Building2 className="h-4 w-4" />}
        eyebrow={t.ourXmarket}
        title={t.invTitle}
        note={t.invNote}
      />
      {/* grid-cols-1 on the base is load-bearing: a bare `grid` makes one auto
          column sized to its content's min-width, which the inner 4-col metric
          grid blew past → 186px horizontal overflow on mobile. An explicit
          single column is minmax(0,1fr) and stays within the viewport. */}
      <div className="mt-6 grid grid-cols-1 gap-3 sm:grid-cols-2">
        {rows.map((r) => (
          <Link
            key={r.rwNumber}
            href={localeHref(locale, `/object/${r.rwNumber}`) as Route}
            className="group rounded-sm border border-forest-500/10 bg-cream-50 p-4 transition-colors hover:border-brass-300/60"
          >
            <div className="flex items-start justify-between gap-3">
              <div className="min-w-0">
                <div className="truncate text-sm font-medium text-forest-900 group-hover:text-brass-500">
                  {r.title || r.rwNumber}
                </div>
                <div className="text-[11px] text-forest-500/60">
                  {r.rwNumber} · {r.type} · {r.district}
                  {r.bedrooms ? t.brSuffix(r.bedrooms) : ""}
                  {r.measuredOcc != null ? t.bookedNow(Math.round(r.measuredOcc * 100)) : ""}
                </div>
              </div>
              <div className="shrink-0 rounded-full bg-panel px-2.5 py-0.5 text-xs font-semibold text-panel-fg">
                {t.netSuffix(r.netYieldPct)}
              </div>
            </div>
            <div className="mt-3 grid grid-cols-4 gap-2 text-center">
              <Metric label={t.mPrice} value={fmt(r.priceThb, true)} />
              <Metric label={t.mGross} value={`${r.grossYieldPct}%`} />
              <Metric label={t.mNet} value={`${r.netYieldPct}%`} />
              <Metric label={t.mPayback} value={r.paybackYears > 0 ? t.paybackY(r.paybackYears) : "—"} />
            </div>
          </Link>
        ))}
      </div>
      <p className="mt-3 text-[11px] text-forest-500/50">{t.invFootnote}</p>
    </div>
  );
}

/* ------------------------------- Gate ---------------------------------- */

function UnlockCard({ onSuccess, meta }: { onSuccess: () => void; meta: RentalMarket["meta"] }) {
  const locale = useLocale();
  const t = INS[locale];
  return (
    <div className="mt-6 rounded-sm border border-brass-300/50 bg-cream-50 p-6 shadow-sm md:p-8">
      <div className="grid gap-8 md:grid-cols-[1fr_minmax(18rem,22rem)] md:items-center">
        <div>
          <p className="inline-flex items-center gap-2 text-sm font-medium text-forest-500">
            <Info className="h-4 w-4 text-brass-500" />
            {t.unlockHeadline(meta.sample)}
          </p>
          <p className="mt-3 text-forest-500/80">{t.unlockBody}</p>
        </div>
        <LeadForm
          source="contact"
          kind="market-report"
          layout="card"
          locale={locale}
          submitLabel={t.unlockSubmit}
          defaultMessage={t.unlockDefaultMessage}
          onSuccess={onSuccess}
        />
      </div>
    </div>
  );
}
