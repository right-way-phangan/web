import Link from "next/link";
import type { Route } from "next";
import { TrendingUp, ArrowRight } from "lucide-react";
import {
  getRentalMarket,
  type DistrictMarket as DistrictMarketData,
  fmtThb,
} from "@/lib/data/rental-market";

/**
 * Rental-market panel for a /districts/[slug] page: how much homes here earn
 * per night, where the district ranks on the island, estimated annual income,
 * and the local land price per m² (own listings). Bridges the district guide to
 * the full /insights report and the ROI calculator.
 */
export function DistrictMarketPanel({ dm }: { dm: DistrictMarketData }) {
  const meta = getRentalMarket().meta;
  const { district: d } = dm;

  return (
    <section className="container-prose pb-16 md:pb-20">
      <div className="rounded-sm border border-brass-300/40 bg-gradient-to-br from-cream-50 to-brass-200/15 p-7 md:p-9">
        <div className="flex flex-wrap items-end justify-between gap-3">
          <div>
            <p className="inline-flex items-center gap-1.5 text-xs font-medium uppercase tracking-[0.2em] text-brass-500">
              <TrendingUp className="h-4 w-4" />
              Rental market here
            </p>
            <h2 className="mt-3 font-serif text-2xl text-forest-900 md:text-3xl">
              What homes earn in {d.name}
            </h2>
          </div>
          <span className="rounded-full bg-forest-500/8 px-3 py-1 text-xs font-medium text-forest-900">
            #{dm.islandRank} of {dm.islandCount} on the island
          </span>
        </div>

        <div className="mt-6 grid gap-4 sm:grid-cols-3">
          <Stat
            label="Median nightly rate"
            value={fmtThb(d.adrMedian)}
            sub={`${d.n} comps${d.adrP25 && d.adrP75 ? ` · ${fmtThb(d.adrP25)}–${fmtThb(d.adrP75)}` : ""}`}
          />
          <Stat
            label={`Est. annual income`}
            value={`${fmtThb(dm.annualThb, true)}/yr`}
            sub={`at ${dm.baseOccPct}% base occupancy${
              dm.measuredOcc != null ? ` · ${Math.round(dm.measuredOcc * 100)}% booked now` : ""
            }`}
          />
          <Stat
            label="Land price"
            value={dm.landPerSqm ? `${fmtThb(dm.landPerSqm)}/m²` : "—"}
            sub={dm.landPerSqm ? "from our land listings" : "no land comps yet"}
          />
        </div>

        {dm.bedroomConfigs.length > 0 ? (
          <div className="mt-5 flex flex-wrap items-center gap-2">
            <span className="text-xs text-forest-500/60">By bedrooms:</span>
            {dm.bedroomConfigs.map((b) => (
              <span
                key={b.bedrooms}
                className="rounded-full bg-cream-50 px-3 py-1 text-xs font-medium text-forest-900 ring-1 ring-forest-500/10"
              >
                {b.bedrooms === 0 ? "Studio" : `${b.bedrooms} BR`} {fmtThb(b.adrMedian)}
              </span>
            ))}
          </div>
        ) : null}

        <div className="mt-6 flex flex-wrap gap-4">
          <Link
            href={"/insights" as Route}
            className="inline-flex items-center gap-1.5 text-sm font-medium text-forest-500 hover:text-brass-500"
          >
            Full market data
            <ArrowRight className="h-3.5 w-3.5" />
          </Link>
          <Link
            href={"/calculator?mode=rent" as Route}
            className="inline-flex items-center gap-1.5 text-sm font-medium text-forest-500 hover:text-brass-500"
          >
            Model the ROI
            <ArrowRight className="h-3.5 w-3.5" />
          </Link>
        </div>
        <p className="mt-3 text-[11px] text-forest-500/45">
          Median of {meta.sample} Airbnb listings · {meta.date}. Annual income uses a base
          occupancy assumption; &ldquo;booked now&rdquo; is current forward-90d availability of
          active listings. See the full report for method.
        </p>
      </div>
    </section>
  );
}

function Stat({ label, value, sub }: { label: string; value: string; sub?: string }) {
  return (
    <div className="rounded-sm bg-cream-50/70 p-4">
      <div className="text-[11px] uppercase tracking-wider text-forest-500/55">{label}</div>
      <div className="mt-1 text-xl font-semibold tabular-nums text-forest-900">{value}</div>
      {sub ? <div className="mt-0.5 text-[11px] text-forest-500/55">{sub}</div> : null}
    </div>
  );
}
