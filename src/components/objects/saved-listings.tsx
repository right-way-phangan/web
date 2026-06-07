"use client";

import { useMemo } from "react";
import Link from "next/link";
import type { Route } from "next";
import { Heart, X, ArrowRight } from "lucide-react";
import type { RealEstateObject } from "@/types/object";
import { useSaved } from "@/lib/saved/saved-context";
import { ObjectCard } from "./object-card";
import { LeadForm } from "@/components/forms/lead-form";
import { formatPriceCompact } from "@/lib/utils/price";

export function SavedListings({ catalog }: { catalog: RealEstateObject[] }) {
  const { saved, ready, clear } = useSaved();

  // Saved objects in saved-order (newest first). Drop ids no longer in catalog.
  const items = useMemo(() => {
    const byRw = new Map(catalog.map((o) => [o.rwNumber, o]));
    return saved.map((rw) => byRw.get(rw)).filter((o): o is RealEstateObject => !!o);
  }, [catalog, saved]);

  const shortlistMessage = useMemo(() => {
    if (items.length === 0) return "I'd like more information about my shortlist.";
    const lines = items.map(
      (o) =>
        `• ${o.rwNumber} — ${o.titleEn}${o.priceThb ? ` (${formatPriceCompact(o.priceThb)})` : ""}`,
    );
    return `I'd like more information about my shortlist:\n${lines.join("\n")}`;
  }, [items]);

  if (!ready) {
    return (
      <div className="mt-12 h-40 animate-pulse rounded-sm border border-forest-500/10 bg-forest-500/5" />
    );
  }

  if (items.length === 0) {
    return (
      <div className="mt-12 rounded-sm border border-forest-500/10 bg-cream-50 px-6 py-16 text-center">
        <Heart className="mx-auto h-8 w-8 text-forest-500/25" strokeWidth={1.5} />
        <p className="mt-4 text-lg text-forest-900">Your shortlist is empty.</p>
        <p className="mx-auto mt-2 max-w-md text-sm text-forest-500/70">
          Tap the heart on any listing to save it here. Compare your favourites
          side by side, then send the whole list to us in one go.
        </p>
        <Link
          href="/listings"
          className="mt-6 inline-flex items-center gap-2 rounded-sm bg-forest-500 px-6 py-3 text-sm font-medium text-cream-100 transition-colors hover:bg-forest-400"
        >
          Browse listings
          <ArrowRight className="h-4 w-4" />
        </Link>
      </div>
    );
  }

  return (
    <div className="mt-10 space-y-12">
      <div className="flex items-center justify-between">
        <p className="text-sm text-forest-500/70">
          {items.length} saved {items.length === 1 ? "property" : "properties"}
        </p>
        <button
          type="button"
          onClick={clear}
          className="text-sm text-forest-500/60 underline-offset-4 hover:text-forest-500 hover:underline"
        >
          Clear all
        </button>
      </div>

      {/* Cards */}
      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {items.map((o) => (
          <ObjectCard key={o.id} object={o} />
        ))}
      </div>

      {/* Compare table */}
      {items.length > 1 ? <CompareTable items={items} /> : null}

      {/* Send shortlist */}
      <section className="rounded-sm border border-forest-500/10 bg-cream-50 p-6 md:p-8">
        <h2 className="font-serif text-2xl text-forest-900">Send us your shortlist</h2>
        <p className="mt-2 max-w-xl text-sm text-forest-500/70">
          We&rsquo;ll review the whole list, flag anything to watch, and reply
          with availability and the best next step — usually within the working day.
        </p>
        <div className="mt-6 max-w-xl">
          <LeadForm
            source="contact"
            kind="shortlist"
            defaultMessage={shortlistMessage}
            submitLabel="Send my shortlist"
          />
        </div>
      </section>
    </div>
  );
}

function CompareTable({ items }: { items: RealEstateObject[] }) {
  const { remove } = useSaved();

  const rows: Array<{ label: string; get: (o: RealEstateObject) => string }> = [
    { label: "Price", get: (o) => (o.priceThb ? formatPriceCompact(o.priceThb) : "—") },
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

  return (
    <section>
      <h2 className="font-serif text-2xl text-forest-900">Compare</h2>
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
            {rows.map((row) => (
              <tr key={row.label} className="border-b border-forest-500/5 last:border-b-0">
                <td className="sticky left-0 z-10 bg-cream-50 p-3 text-xs font-medium uppercase tracking-wide text-forest-500/50">
                  {row.label}
                </td>
                {items.map((o) => (
                  <td key={o.id} className="p-3 text-forest-900">
                    {row.get(o)}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </section>
  );
}
