"use client";

import { useState } from "react";
import Link from "next/link";
import type { Route } from "next";
import {
  Lock,
  TrendingUp,
  Waves,
  BedDouble,
  Home,
  ArrowRight,
  Info,
  CheckCircle2,
  Award,
  Hammer,
  Building2,
} from "lucide-react";
import { LeadForm } from "@/components/forms/lead-form";
import {
  type RentalMarket,
  type RmSeasonal,
  type DisplayCurrency,
  type MoneyFmt,
  type InventoryYieldRow,
  DISTRICT_PAGE_SLUGS,
  makeMoneyFmt,
  effectiveAnnualThb,
  measuredOccupancy,
  confidenceOf,
} from "@/lib/data/rental-market";

/**
 * /insights rental-market view. Public teaser (top districts + one premium),
 * then the full report gated behind a lead form. On submit success the gate
 * lifts (client-side reveal — a lead magnet, not secret data). The same data
 * powers the ROI calculator's rent presets, so we deep-link there too.
 */
export function RentalInsights({
  data,
  inventory = [],
}: {
  data: RentalMarket;
  inventory?: InventoryYieldRow[];
}) {
  const [unlocked, setUnlocked] = useState(false);
  const [currency, setCurrency] = useState<DisplayCurrency>("THB");
  const { meta } = data;
  const fmt = makeMoneyFmt(currency, meta.thbPerUsd);

  const top3 = data.districts.slice(0, 3);
  const maxAdr = Math.max(...data.districts.map((d) => d.adrMedian), 1);
  const poolPremium = data.featurePremiums.find((f) => f.key === "pool")?.premiumPct ?? null;

  if (data.districts.length === 0) {
    return (
      <p className="rounded-sm border border-forest-500/15 bg-cream-50 p-6 text-forest-500/80">
        Market data is being refreshed — check back shortly.
      </p>
    );
  }

  return (
    <div className="space-y-14 md:space-y-20">
      {/* Snapshot strip + currency toggle */}
      <div className="flex flex-wrap items-center justify-between gap-x-8 gap-y-3 rounded-sm border border-forest-500/10 bg-cream-50 px-6 py-5 text-sm">
        <div className="flex flex-wrap gap-x-8 gap-y-3">
          <Stat label="Listings analysed" value={meta.sample.toLocaleString("en-US")} />
          <Stat label="Source" value={meta.source} />
          <Stat label="Snapshot" value={meta.date} />
          {meta.occupancyMeasuredAll != null ? (
            <Stat
              label="Active occupancy (90d)"
              value={`${Math.round(meta.occupancyMeasuredAll * 100)}%`}
            />
          ) : null}
          {data.crossCheck?.bookingVillaNightly ? (
            <Stat
              label="Booking cross-check"
              value={`${fmt(data.crossCheck.bookingVillaNightly)}/night`}
            />
          ) : null}
        </div>
        <CurrencyToggle currency={currency} onChange={setCurrency} />
      </div>

      {/* What to build — the synthesised answer */}
      <BuildRecommendation data={data} fmt={fmt} />

      {/* Inventory × market — our active listings against district ADR */}
      {inventory.length > 0 ? (
        <InventoryYield rows={inventory} fmt={fmt} meta={meta} />
      ) : null}

      {/* TEASER — always visible */}
      <section>
        <SectionHead
          icon={<TrendingUp className="h-4 w-4" />}
          eyebrow="Free preview"
          title="Top districts to build for rental"
          note="Median nightly rate (ADR) of entire-home listings, by district."
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
              sub={`${d.n} listings · est. ${fmt(effectiveAnnualThb(d, meta), true)}/yr at ${Math.round(
                meta.occupancy.base * 100,
              )}% base${
                measuredOccupancy(d, meta) != null
                  ? ` · ${Math.round((measuredOccupancy(d, meta) as number) * 100)}% booked now`
                  : ""
              }`}
              highlight
              badge={i === 0 ? "Top pick" : undefined}
            />
          ))}
        </div>
        {poolPremium != null ? (
          <p className="mt-6 inline-flex items-center gap-2 rounded-sm bg-brass-200/40 px-4 py-2.5 text-sm text-forest-500">
            <Waves className="h-4 w-4 text-brass-500" />
            Listings with a pool command a{" "}
            <strong className="text-forest-900">+{poolPremium}%</strong> nightly premium.
          </p>
        ) : null}
      </section>

      {/* GATE + FULL REPORT */}
      <section className="relative">
        <SectionHead
          icon={<Lock className="h-4 w-4" />}
          eyebrow={unlocked ? "Full report" : "Unlock the full report"}
          title="The complete build-to-rent picture"
          note="All districts, premiums by feature, rates by property type and bedroom count, plus the assumptions behind every number."
        />

        {!unlocked ? (
          <UnlockCard onSuccess={() => setUnlocked(true)} meta={meta} />
        ) : (
          <div className="mt-4 inline-flex items-center gap-2 rounded-sm border border-forest-500/20 bg-forest-50/40 px-4 py-2 text-sm text-forest-500">
            <CheckCircle2 className="h-4 w-4 text-forest-500" />
            Report unlocked — thanks. We&apos;ll be in touch.
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
    </div>
  );
}

/* ------------------------- Build recommendation ------------------------ */

const FEATURE_PHRASE: Record<string, string> = {
  pool: "a pool",
  private_pool: "a private pool",
  sea_view: "a sea view",
  beachfront: "a beachfront location",
  luxury: "a luxury finish",
};

function BuildRecommendation({ data, fmt }: { data: RentalMarket; fmt: MoneyFmt }) {
  const topD = data.districts[0];
  const bestType = data.byType.find((t) => t.n >= 3);
  const topFeat = [...data.featurePremiums]
    .filter((f) => f.premiumPct != null)
    .sort((a, b) => (b.premiumPct ?? 0) - (a.premiumPct ?? 0))[0];
  const bestConfig = [...data.districtBedrooms]
    .filter((x) => x.district === topD.name)
    .sort((a, b) => b.adrMedian - a.adrMedian)[0];

  if (!topD) return null;
  const config = bestConfig
    ? `${bestConfig.bedrooms === 0 ? "studio" : `${bestConfig.bedrooms}-bedroom`} ${
        bestType?.label.toLowerCase() ?? "home"
      }`
    : (bestType?.label.toLowerCase() ?? "home");

  return (
    <div className="rounded-sm border border-brass-300/50 bg-gradient-to-br from-cream-50 to-brass-200/20 p-7 md:p-9">
      <p className="inline-flex items-center gap-1.5 text-xs font-medium uppercase tracking-[0.2em] text-brass-500">
        <Hammer className="h-4 w-4" />
        What the data suggests
      </p>
      <p className="mt-4 max-w-3xl text-pretty text-lg leading-relaxed text-forest-900 md:text-xl">
        Build a <strong>{config}</strong>
        {topFeat ? (
          <>
            {" "}
            with <strong>{FEATURE_PHRASE[topFeat.key] ?? topFeat.label.toLowerCase()}</strong>
          </>
        ) : null}{" "}
        in <strong>{topD.name}</strong>. It&apos;s the island&apos;s strongest nightly market —
        a median of <strong>{fmt(bestConfig?.adrMedian ?? topD.adrMedian)}/night</strong>, an
        estimated <strong>{fmt(effectiveAnnualThb(topD, data.meta), true)}/year</strong> at{" "}
        {Math.round(data.meta.occupancy.base * 100)}% base occupancy
        {measuredOccupancy(topD, data.meta) != null
          ? ` (currently ${Math.round((measuredOccupancy(topD, data.meta) as number) * 100)}% booked)`
          : ""}
        .
      </p>
      <div className="mt-5 flex flex-wrap gap-2.5">
        {topFeat?.premiumPct != null ? (
          <Pill>{topFeat.label} adds +{topFeat.premiumPct}%</Pill>
        ) : null}
        {bestType ? <Pill>{bestType.label} = highest ADR type</Pill> : null}
        <Pill>{topD.n} comps in {topD.name}</Pill>
      </div>
      <Link
        href={"/calculator?mode=rent" as Route}
        className="mt-6 inline-flex items-center gap-2 text-sm font-medium text-forest-500 hover:text-brass-500"
      >
        Model this in the ROI calculator
        <ArrowRight className="h-4 w-4" />
      </Link>
    </div>
  );
}

function Pill({ children }: { children: React.ReactNode }) {
  return (
    <span className="rounded-full bg-forest-500/8 px-3 py-1 text-xs font-medium text-forest-500">
      {children}
    </span>
  );
}

/* --------------------- Inventory × market overlay ---------------------- */

function InventoryYield({
  rows,
  fmt,
  meta,
}: {
  rows: InventoryYieldRow[];
  fmt: MoneyFmt;
  meta: RentalMarket["meta"];
}) {
  return (
    <section>
      <SectionHead
        icon={<Building2 className="h-4 w-4" />}
        eyebrow="Our listings × the market"
        title="What our listings could earn"
        note="Active Right Way listings matched to their district's nightly rate — gross and net yield (net is after 25% management + 3% opex). An indication, not a guarantee."
      />
      <div className="mt-6 grid gap-3 sm:grid-cols-2">
        {rows.map((r) => (
          <Link
            key={r.rwNumber}
            href={`/object/${r.rwNumber}` as Route}
            className="group rounded-sm border border-forest-500/10 bg-cream-50 p-4 transition-colors hover:border-brass-300/60"
          >
            <div className="flex items-start justify-between gap-3">
              <div className="min-w-0">
                <div className="truncate text-sm font-medium text-forest-900 group-hover:text-brass-500">
                  {r.title || r.rwNumber}
                </div>
                <div className="text-[11px] text-forest-500/60">
                  {r.rwNumber} · {r.type} · {r.district}
                  {r.bedrooms ? ` · ${r.bedrooms} BR` : ""}
                  {r.measuredOcc != null ? ` · ${Math.round(r.measuredOcc * 100)}% booked now` : ""}
                </div>
              </div>
              <div className="shrink-0 rounded-full bg-forest-500 px-2.5 py-0.5 text-xs font-semibold text-cream-50">
                {r.netYieldPct}% net
              </div>
            </div>
            <div className="mt-3 grid grid-cols-4 gap-2 text-center">
              <Metric label="Price" value={fmt(r.priceThb, true)} />
              <Metric label="Gross" value={`${r.grossYieldPct}%`} />
              <Metric label="Net" value={`${r.netYieldPct}%`} />
              <Metric label="Payback" value={r.paybackYears > 0 ? `${r.paybackYears}y` : "—"} />
            </div>
          </Link>
        ))}
      </div>
      <p className="mt-3 text-[11px] text-forest-500/50">
        Gross = district median ADR × 365 × base occupancy ÷ price. Net deducts 25% management + 3%
        opex. &ldquo;Booked now&rdquo; = current forward-90d availability of active listings. Land
        excluded.
      </p>
    </section>
  );
}

function Metric({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-sm bg-forest-500/[0.04] py-1.5">
      <div className="text-[10px] uppercase tracking-wide text-forest-500/50">{label}</div>
      <div className="text-sm font-semibold tabular-nums text-forest-900">{value}</div>
    </div>
  );
}

/* ----------------------------- Full report ----------------------------- */

type DistrictSort = "adr" | "annual" | "sample" | "name";

const SORT_LABELS: Record<DistrictSort, string> = {
  adr: "Nightly rate",
  annual: "Annual income",
  sample: "Sample size",
  name: "Name A–Z",
};

function FullReport({ data, fmt }: { data: RentalMarket; fmt: MoneyFmt }) {
  const { meta } = data;
  const [sort, setSort] = useState<DistrictSort>("adr");
  const maxAdr = Math.max(...data.districts.map((d) => d.adrMedian), 1);
  const maxType = Math.max(...data.byType.map((t) => t.adrMedian), 1);
  const maxPremium = Math.max(...data.featurePremiums.map((f) => f.premiumPct ?? 0), 1);
  const bedrooms = [...data.byBedrooms].sort((a, b) => a.bedrooms - b.bedrooms);
  const maxBed = Math.max(...bedrooms.map((b) => b.adrMedian), 1);
  const districtBedrooms = [...data.districtBedrooms].sort((a, b) => b.adrMedian - a.adrMedian);

  const topPick = data.districts[0]?.name;
  const sortedDistricts = [...data.districts].sort((a, b) => {
    if (sort === "annual") return (b.annual.base ?? 0) - (a.annual.base ?? 0);
    if (sort === "sample") return b.n - a.n;
    if (sort === "name") return a.name.localeCompare(b.name);
    return b.adrMedian - a.adrMedian;
  });

  return (
    <>
      {/* All districts */}
      <div>
        <div className="flex flex-wrap items-center justify-between gap-3">
          <SubHead title="Nightly rate by district — all districts" />
          <div className="inline-flex flex-wrap gap-1 text-[11px]">
            {(Object.keys(SORT_LABELS) as DistrictSort[]).map((k) => (
              <button
                key={k}
                type="button"
                onClick={() => setSort(k)}
                className={`rounded-full px-2.5 py-0.5 transition-colors ${
                  sort === k
                    ? "bg-forest-500 text-cream-50"
                    : "bg-forest-500/8 text-forest-500/70 hover:bg-forest-500/15"
                }`}
              >
                {SORT_LABELS[k]}
              </button>
            ))}
          </div>
        </div>
        <div className="mt-5 space-y-2.5">
          {sortedDistricts.map((d) => (
            <BarRow
              key={d.name}
              label={d.name}
              slug={d.slug}
              value={d.adrMedian}
              max={maxAdr}
              right={fmt(d.adrMedian)}
              sub={`${d.n} listings · ${
                d.adrP25 && d.adrP75 ? `${fmt(d.adrP25)}–${fmt(d.adrP75)} p25–p75 · ` : ""
              }est. ${fmt(effectiveAnnualThb(d, meta), true)}/yr${
                measuredOccupancy(d, meta) != null
                  ? ` · ${Math.round((measuredOccupancy(d, meta) as number) * 100)}% booked now`
                  : ""
              }`}
              badge={d.name === topPick ? "Top pick" : undefined}
              highlight={d.name === topPick}
              confidence={confidenceOf(d.n)}
            />
          ))}
        </div>
      </div>

      {/* By property type */}
      <div>
        <SubHead title="Nightly rate by property type" icon={<Home className="h-4 w-4" />} />
        <div className="mt-5 space-y-2.5">
          {data.byType
            .filter((t) => t.n >= 2)
            .map((t) => (
              <BarRow
                key={t.type}
                label={t.label}
                value={t.adrMedian}
                max={maxType}
                right={fmt(t.adrMedian)}
                sub={`${t.n} listings${t.ratingMedian ? ` · ★ ${t.ratingMedian}` : ""}`}
              />
            ))}
        </div>
      </div>

      {/* By bedrooms */}
      {bedrooms.length > 0 ? (
        <div>
          <SubHead title="Nightly rate by bedroom count" icon={<BedDouble className="h-4 w-4" />} />
          <div className="mt-5 space-y-2.5">
            {bedrooms.map((b) => (
              <BarRow
                key={b.bedrooms}
                label={b.bedrooms === 0 ? "Studio" : `${b.bedrooms} bedroom${b.bedrooms > 1 ? "s" : ""}`}
                value={b.adrMedian}
                max={maxBed}
                right={fmt(b.adrMedian)}
                sub={`${b.n} listings`}
              />
            ))}
          </div>
          <p className="mt-3 text-xs text-forest-500/60">
            Bedroom counts are parsed from listing text where stated — a partial sample.
          </p>
        </div>
      ) : null}

      {/* Feature premiums */}
      <div>
        <SubHead title="What raises the nightly rate" icon={<Waves className="h-4 w-4" />} />
        <div className="mt-5 space-y-2.5">
          {data.featurePremiums
            .filter((f) => f.premiumPct != null)
            .sort((a, b) => (b.premiumPct ?? 0) - (a.premiumPct ?? 0))
            .map((f) => (
              <BarRow
                key={f.key}
                label={f.label}
                value={f.premiumPct ?? 0}
                max={maxPremium}
                right={`+${f.premiumPct}%`}
                sub={`${fmt(f.adrWith)} vs ${fmt(f.adrWithout)} · ${f.nWith} with / ${f.nWithout} without`}
                tone="brass"
              />
            ))}
        </div>
      </div>

      {/* District × bedrooms — table on desktop, cards on mobile */}
      {districtBedrooms.length > 0 ? (
        <div>
          <SubHead title="District × bedroom configurations (sample ≥2)" />
          {/* desktop table */}
          <div className="mt-5 hidden md:block">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-forest-500/15 text-left text-xs uppercase tracking-wider text-forest-500/60">
                  <th className="py-2 pr-4 font-medium">District</th>
                  <th className="py-2 pr-4 font-medium">Bedrooms</th>
                  <th className="py-2 pr-4 text-right font-medium">ADR median</th>
                  <th className="py-2 text-right font-medium">n</th>
                </tr>
              </thead>
              <tbody>
                {districtBedrooms.map((r) => (
                  <tr key={`${r.district}-${r.bedrooms}`} className="border-b border-forest-500/[0.08]">
                    <td className="py-2 pr-4">{r.district}</td>
                    <td className="py-2 pr-4">{r.bedrooms === 0 ? "Studio" : `${r.bedrooms} BR`}</td>
                    <td className="py-2 pr-4 text-right font-medium">{fmt(r.adrMedian)}</td>
                    <td className="py-2 text-right text-forest-500/70">{r.n}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          {/* mobile cards */}
          <div className="mt-5 grid grid-cols-2 gap-2.5 md:hidden">
            {districtBedrooms.map((r) => (
              <div
                key={`${r.district}-${r.bedrooms}`}
                className="rounded-sm border border-forest-500/10 bg-cream-50 p-3"
              >
                <div className="text-sm font-medium text-forest-900">{r.district}</div>
                <div className="text-[11px] text-forest-500/60">
                  {r.bedrooms === 0 ? "Studio" : `${r.bedrooms} bedroom${r.bedrooms > 1 ? "s" : ""}`} ·{" "}
                  {r.n} listings
                </div>
                <div className="mt-1.5 text-base font-semibold tabular-nums text-forest-900">
                  {fmt(r.adrMedian)}
                  <span className="text-[11px] font-normal text-forest-500/55"> /night</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      ) : null}

      {/* Seasonality */}
      <Seasonality seasonal={data.seasonal} fmt={fmt} />

      {/* CapEx — land price per m² */}
      {data.capex.pricePerSqmMedian ? (
        <p className="text-sm text-forest-500/80">
          <strong>CapEx reference:</strong>{" "}
          {data.capex.source === "own_land" ? "median land price" : "median sale price"}{" "}
          {fmt(data.capex.pricePerSqmMedian)}/m²
          {data.capex.source === "own_land"
            ? ` across ${data.capex.nSale} Right Way land listings`
            : ` (${data.capex.nSale} listings)`}
          . Land is the big build-to-rent CapEx line — pair it with the annual-revenue column
          above for a rough yield-on-cost.
        </p>
      ) : null}

      {/* CTA into the calculator */}
      <div className="rounded-sm border border-forest-500/15 bg-forest-900 p-7 text-cream-50 md:p-9">
        <h3 className="font-serif text-2xl text-cream-50">Turn this into your own projection</h3>
        <p className="mt-2 max-w-xl text-cream-100/80">
          The ROI calculator is wired to this data — pick a district and property type and it
          fills in the nightly rate and occupancy automatically.
        </p>
        <Link
          href={"/calculator?mode=rent" as Route}
          className="mt-5 inline-flex items-center gap-2 rounded-sm bg-brass-400 px-5 py-2.5 text-sm font-medium text-forest-900 transition-colors hover:bg-brass-300"
        >
          Open the ROI calculator
          <ArrowRight className="h-4 w-4" />
        </Link>
      </div>

      {/* Methodology */}
      <Methodology meta={meta} />
    </>
  );
}

const SEASON_COLORS = ["#1F3A2E", "#C77929", "#2F5546", "#B5651D"];

function Seasonality({ seasonal, fmt }: { seasonal: RmSeasonal; fmt: MoneyFmt }) {
  if (!seasonal || seasonal.points < 2) {
    return (
      <div>
        <SubHead title="Seasonal trend" />
        <p className="mt-3 rounded-sm border border-forest-500/10 bg-cream-200/30 p-4 text-sm text-forest-500/75">
          Collecting monthly snapshots — <strong>{seasonal?.points ?? 0}</strong> so far. The
          seasonal ADR trend (high vs low season) appears once we have at least two months. A fresh
          snapshot runs on the 1st of each month.
        </p>
      </div>
    );
  }

  // Series: island overall + up to 3 districts. Scale to combined min/max.
  const series: { name: string; values: (number | null)[]; color: string }[] = [
    { name: "Island", values: seasonal.overall, color: SEASON_COLORS[0] },
  ];
  Object.entries(seasonal.districts)
    .slice(0, 3)
    .forEach(([name, values], i) => series.push({ name, values, color: SEASON_COLORS[i + 1] }));

  const all = series.flatMap((s) => s.values).filter((v): v is number => v != null);
  const min = Math.min(...all);
  const max = Math.max(...all);
  const W = 640;
  const H = 200;
  const padX = 8;
  const padY = 16;
  const n = seasonal.dates.length;
  const x = (i: number) => padX + (i * (W - 2 * padX)) / Math.max(1, n - 1);
  const y = (v: number) =>
    H - padY - ((v - min) / Math.max(1, max - min)) * (H - 2 * padY);

  return (
    <div>
      <SubHead title="Seasonal trend — nightly rate over time" />
      <div className="mt-5 overflow-x-auto rounded-sm border border-forest-500/10 bg-cream-50 p-4">
        <svg viewBox={`0 0 ${W} ${H}`} className="h-48 w-full min-w-[28rem]" role="img">
          {series.map((s) => {
            const pts = s.values
              .map((v, i) => (v == null ? null : `${x(i)},${y(v)}`))
              .filter(Boolean)
              .join(" ");
            return (
              <polyline
                key={s.name}
                points={pts}
                fill="none"
                stroke={s.color}
                strokeWidth={2}
                strokeLinejoin="round"
              />
            );
          })}
        </svg>
      </div>
      <div className="mt-3 flex flex-wrap gap-x-4 gap-y-1.5 text-xs">
        {series.map((s) => {
          const last = [...s.values].reverse().find((v) => v != null) ?? null;
          return (
            <span key={s.name} className="inline-flex items-center gap-1.5 text-forest-500/75">
              <span className="h-2 w-3 rounded-sm" style={{ backgroundColor: s.color }} />
              {s.name} {last != null ? fmt(last) : ""}
            </span>
          );
        })}
        <span className="text-forest-500/45">
          {seasonal.dates[0]} → {seasonal.dates[seasonal.dates.length - 1]}
        </span>
      </div>
    </div>
  );
}

function Methodology({ meta }: { meta: RentalMarket["meta"] }) {
  return (
    <details className="rounded-sm border border-forest-500/10 bg-cream-200/30 p-5 text-sm text-forest-500/80">
      <summary className="cursor-pointer font-medium text-forest-500">
        Method &amp; assumptions
      </summary>
      <ul className="mt-3 list-disc space-y-1.5 pl-5">
        <li>
          Data is a snapshot of <strong>{meta.sample}</strong> entire-home Airbnb listings on Koh
          Phangan ({meta.date}), priced in {meta.currency}. Internal research, not republished data.
        </li>
        <li>
          <strong>Annual income uses an assumed base occupancy</strong> of{" "}
          {Math.round(meta.occupancy.base * 100)}% — one forward 90-day window (often low season)
          can&apos;t stand in for a full year, so we don&apos;t let it drive the headline. Scenarios:{" "}
          {Math.round(meta.occupancy.conservative * 100)}/{Math.round(meta.occupancy.base * 100)}/
          {Math.round(meta.occupancy.high * 100)}%.
        </li>
        <li>
          <strong>&ldquo;Booked now&rdquo;</strong> is a current-demand signal: the share of the
          next ~90 days that&apos;s unavailable, measured from each listing&apos;s calendar, across{" "}
          <em>active</em> listings only (≥5 reviews). The long tail of dormant listings (no reviews)
          sits near 0% and is excluded — including them understates real demand.
        </li>
        <li>
          <strong>Net yield</strong> deducts 25% management and 3% opex from gross. Demand is also
          proxied by review counts and guest-favorite share.
        </li>
        <li>
          Confidence dots reflect sample size per district (
          <span className="inline-block h-1.5 w-1.5 rounded-full bg-forest-500 align-middle" /> high
          ≥12 ·{" "}
          <span className="inline-block h-1.5 w-1.5 rounded-full bg-brass-400 align-middle" /> medium
          ≥5 ·{" "}
          <span className="inline-block h-1.5 w-1.5 rounded-full bg-brass-400/50 align-middle" /> low
          &lt;5). Treat low-sample districts as indicative only.
        </li>
        <li>
          District is assigned by listing coordinates (nearest centroid); Airbnb coarsens some
          coordinates, so it&apos;s approximate. Bedrooms/features come from listing text.
        </li>
        <li>Prices reflect the snapshot date and season — re-run monthly for seasonal trends.</li>
      </ul>
    </details>
  );
}

/* ----------------------------- Primitives ------------------------------ */

function CurrencyToggle({
  currency,
  onChange,
}: {
  currency: DisplayCurrency;
  onChange: (c: DisplayCurrency) => void;
}) {
  return (
    <div className="inline-flex overflow-hidden rounded-full border border-forest-500/15 text-xs">
      {(["THB", "USD"] as DisplayCurrency[]).map((c) => (
        <button
          key={c}
          type="button"
          onClick={() => onChange(c)}
          className={`px-3 py-1 font-medium transition-colors ${
            currency === c ? "bg-forest-500 text-cream-50" : "text-forest-500/70 hover:bg-forest-500/8"
          }`}
        >
          {c}
        </button>
      ))}
    </div>
  );
}

function Stat({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <div className="text-[11px] uppercase tracking-wider text-forest-500/55">{label}</div>
      <div className="mt-0.5 font-medium text-forest-900">{value}</div>
    </div>
  );
}

function SectionHead({
  icon,
  eyebrow,
  title,
  note,
}: {
  icon: React.ReactNode;
  eyebrow: string;
  title: string;
  note?: string;
}) {
  return (
    <div>
      <p className="inline-flex items-center gap-1.5 text-xs font-medium uppercase tracking-[0.2em] text-brass-500">
        {icon}
        {eyebrow}
      </p>
      <h2 className="mt-3 font-serif text-2xl text-forest-900 md:text-3xl">{title}</h2>
      {note ? <p className="mt-2 max-w-2xl text-forest-500/75">{note}</p> : null}
    </div>
  );
}

function SubHead({ title, icon }: { title: string; icon?: React.ReactNode }) {
  return (
    <h3 className="inline-flex items-center gap-2 font-medium text-forest-500">
      {icon ? <span className="text-brass-500">{icon}</span> : null}
      {title}
    </h3>
  );
}

const CONF_COLOR: Record<"low" | "medium" | "high", string> = {
  low: "bg-brass-400/50",
  medium: "bg-brass-400",
  high: "bg-forest-500",
};

function BarRow({
  label,
  slug,
  value,
  max,
  right,
  sub,
  highlight,
  badge,
  confidence,
  tone = "forest",
}: {
  label: string;
  slug?: string | null;
  value: number;
  max: number;
  right: string;
  sub?: string;
  highlight?: boolean;
  badge?: string;
  confidence?: "low" | "medium" | "high";
  tone?: "forest" | "brass";
}) {
  const pct = Math.max(4, Math.round((value / max) * 100));
  const barColor =
    tone === "brass" ? "bg-brass-400" : highlight ? "bg-brass-500" : "bg-forest-500/70";
  const hasPage = slug && DISTRICT_PAGE_SLUGS.has(slug);

  return (
    <div className="grid grid-cols-[minmax(7rem,9rem)_1fr_auto] items-center gap-3 md:gap-4">
      <div className="min-w-0">
        <span className="flex items-center gap-1.5">
          {confidence ? (
            <span
              className={`h-1.5 w-1.5 shrink-0 rounded-full ${CONF_COLOR[confidence]}`}
              title={`${confidence} confidence`}
            />
          ) : null}
          {badge ? (
            <Award className="h-3.5 w-3.5 shrink-0 text-brass-500" aria-label={badge} />
          ) : null}
          {hasPage ? (
            <Link
              href={`/districts/${slug}` as Route}
              className="truncate text-sm font-medium text-forest-900 underline-offset-2 hover:text-brass-500 hover:underline"
            >
              {label}
            </Link>
          ) : (
            <span className="block truncate text-sm font-medium text-forest-900">{label}</span>
          )}
        </span>
        {sub ? <div className="truncate text-[11px] text-forest-500/55">{sub}</div> : null}
      </div>
      <div className="h-2.5 overflow-hidden rounded-full bg-forest-500/8">
        <div className={`h-full rounded-full ${barColor}`} style={{ width: `${pct}%` }} />
      </div>
      <div className="w-16 text-right text-sm font-semibold tabular-nums text-forest-900 md:w-20">
        {right}
      </div>
    </div>
  );
}

/* ------------------------------- Gate ---------------------------------- */

function UnlockCard({ onSuccess, meta }: { onSuccess: () => void; meta: RentalMarket["meta"] }) {
  return (
    <div className="mt-6 rounded-sm border border-brass-300/50 bg-cream-50 p-6 shadow-sm md:p-8">
      <div className="grid gap-8 md:grid-cols-[1fr_minmax(18rem,22rem)] md:items-center">
        <div>
          <p className="inline-flex items-center gap-2 text-sm font-medium text-forest-500">
            <Info className="h-4 w-4 text-brass-500" />
            Get the full {meta.sample}-listing breakdown
          </p>
          <p className="mt-3 text-forest-500/80">
            Leave your email and the complete report opens instantly — every district, the premium
            each feature commands, rates by type and bedroom count, and the method behind it. No
            marketing emails; we&apos;ll only follow up about your project if you ask.
          </p>
        </div>
        <LeadForm
          source="contact"
          kind="market-report"
          layout="card"
          submitLabel="Unlock the report"
          defaultMessage="Please send me the Koh Phangan rental-market report. I'm interested in building / buying for rental."
          onSuccess={onSuccess}
        />
      </div>
    </div>
  );
}
