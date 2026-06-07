"use client";

import Link from "next/link";
import type { Route } from "next";
import { X } from "lucide-react";
import type { RealEstateObject } from "@/types/object";
import { useSaved } from "@/lib/saved/saved-context";
import { formatPriceCompact } from "@/lib/utils/price";
import { cn } from "@/lib/utils/cn";

interface Row {
  label: string;
  get: (o: RealEstateObject) => string;
  /** Lower-is-better numeric for "best" marking (e.g. price). Optional. */
  rank?: (o: RealEstateObject) => number | null;
}

const ROWS: Row[] = [
  {
    label: "Price",
    get: (o) =>
      o.priceThb
        ? formatPriceCompact(o.priceThb)
        : o.pricePerRai
          ? `${formatPriceCompact(o.pricePerRai)}/rai`
          : o.rentPerRaiMonth
            ? `${formatPriceCompact(o.rentPerRaiMonth)}/rai/mo`
            : "On request",
    rank: (o) => o.priceThb ?? null,
  },
  { label: "Price / rai", get: (o) => (o.pricePerRai ? `${formatPriceCompact(o.pricePerRai)}` : "—"), rank: (o) => o.pricePerRai ?? null },
  { label: "Type", get: (o) => o.type },
  { label: "District", get: (o) => o.district ?? "—" },
  {
    label: "Area",
    get: (o) =>
      o.areaRai
        ? `${o.areaRai.toLocaleString(undefined, { maximumFractionDigits: 2 })} rai`
        : o.areaSqm
          ? `${o.areaSqm.toLocaleString()} m²`
          : "—",
  },
  { label: "Tenure", get: (o) => o.tenure?.join(", ") ?? "—" },
  { label: "Document", get: (o) => o.documentType ?? "—" },
  { label: "Lease term", get: (o) => (o.leaseTermYears ? `${o.leaseTermYears} yr` : "—") },
  { label: "Bedrooms", get: (o) => (o.bedrooms ? String(o.bedrooms) : "—") },
  {
    label: "View",
    get: (o) =>
      o.beachfront
        ? "Beachfront"
        : o.seaView
          ? "Sea view"
          : o.mountainView
            ? "Mountain"
            : o.jungleView
              ? "Jungle"
              : "—",
  },
];

/**
 * Side-by-side comparison of saved listings with difference highlighting:
 * rows where every value is identical are dimmed; rows that differ stay full
 * contrast so the trade-offs jump out. The best price/rai cell gets a marker.
 * Feature parity with the Mini App's compare view (bot/scripts/compare.py).
 */
export function CompareTable({ items }: { items: RealEstateObject[] }) {
  const { remove } = useSaved();
  if (items.length < 2) return null;

  return (
    <section>
      <h2 className="font-serif text-2xl text-forest-900">Compare</h2>
      <p className="mt-1 text-sm text-forest-500/60">
        Rows that differ are highlighted; matching specs are dimmed.
      </p>
      <div className="mt-6 overflow-x-auto rounded-sm border border-forest-500/10">
        <table className="w-full min-w-[640px] border-collapse text-sm">
          <thead>
            <tr className="border-b border-forest-500/10 bg-cream-50">
              <th className="sticky left-0 z-10 bg-cream-50 p-3 text-left text-xs font-medium uppercase tracking-wide text-forest-500/50">
                Spec
              </th>
              {items.map((o) => (
                <th key={o.id} className="min-w-[160px] p-3 text-left align-top">
                  <div className="flex items-start justify-between gap-2">
                    <Link
                      href={`/object/${o.rwNumber}` as Route}
                      className="font-serif text-base leading-snug text-forest-900 hover:text-brass-500"
                    >
                      {o.rwNumber}
                    </Link>
                    <button
                      type="button"
                      onClick={() => remove(o.rwNumber)}
                      aria-label={`Remove ${o.rwNumber}`}
                      className="shrink-0 text-forest-500/40 hover:text-forest-500"
                    >
                      <X className="h-4 w-4" />
                    </button>
                  </div>
                  <span className="mt-1 block text-xs font-normal text-forest-500/60 line-clamp-2">
                    {o.titleEn}
                  </span>
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {ROWS.map((row) => {
              const values = items.map(row.get);
              const allSame = values.every((v) => v === values[0]);
              // Best (lowest) rank for this row, if the row ranks.
              let bestIdx = -1;
              if (row.rank) {
                let best = Infinity;
                items.forEach((o, i) => {
                  const r = row.rank!(o);
                  if (r != null && r < best) {
                    best = r;
                    bestIdx = i;
                  }
                });
                // Only mark a winner if more than one has a value and they differ.
                const ranked = items.map(row.rank).filter((r) => r != null);
                if (ranked.length < 2 || ranked.every((r) => r === ranked[0])) bestIdx = -1;
              }
              return (
                <tr
                  key={row.label}
                  className={cn(
                    "border-b border-forest-500/5 last:border-b-0",
                    allSame && "opacity-55",
                  )}
                >
                  <td className="sticky left-0 z-10 bg-cream-50 p-3 text-xs font-medium uppercase tracking-wide text-forest-500/50">
                    {row.label}
                  </td>
                  {items.map((o, i) => (
                    <td
                      key={o.id}
                      className={cn(
                        "p-3 text-forest-900",
                        !allSame && "font-medium",
                        i === bestIdx && "text-forest-900",
                      )}
                    >
                      <span className="inline-flex items-center gap-1.5">
                        {values[i]}
                        {i === bestIdx ? (
                          <span className="rounded-full bg-brass-500/15 px-1.5 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-brass-500">
                            Best
                          </span>
                        ) : null}
                      </span>
                    </td>
                  ))}
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </section>
  );
}
