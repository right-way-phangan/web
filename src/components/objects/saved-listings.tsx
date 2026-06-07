"use client";

import { useMemo } from "react";
import Link from "next/link";
import { Heart, ArrowRight } from "lucide-react";
import type { RealEstateObject } from "@/types/object";
import { useSaved } from "@/lib/saved/saved-context";
import { ObjectCard } from "./object-card";
import { CompareTable } from "./compare-table";
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
