"use client";

import { useMemo, useState } from "react";
import { Search, X, ChevronDown } from "lucide-react";
import {
  FAQ_CATEGORIES,
  buildFaqSearchText,
  type FaqCategoryId,
  type FaqItem,
} from "@/content/faq";
import { ALL_FAQ_ITEMS } from "@/content/faq-derived";
import { FaqAnswer } from "./faq-blocks";
import { cn } from "@/lib/utils/cn";

// Pre-compute search index once at module load (server bundle).
// ALL_FAQ_ITEMS = hand-written FAQ + entries auto-derived from the KB library.
const INDEX: Array<{ item: FaqItem; text: string }> = ALL_FAQ_ITEMS.map(
  (item) => ({
    item,
    text: buildFaqSearchText(item),
  }),
);
const TOTAL = ALL_FAQ_ITEMS.length;

export function FaqExplorer() {
  const [query, setQuery] = useState("");
  const [activeCat, setActiveCat] = useState<FaqCategoryId | "all">("all");

  const trimmed = query.trim().toLowerCase();

  const filtered = useMemo(() => {
    return INDEX.filter(({ item, text }) => {
      if (activeCat !== "all" && item.category !== activeCat) return false;
      if (trimmed && !text.includes(trimmed)) return false;
      return true;
    }).map((r) => r.item);
  }, [trimmed, activeCat]);

  // Group filtered items by category
  const grouped = useMemo(() => {
    const byCat: Partial<Record<FaqCategoryId, FaqItem[]>> = {};
    for (const it of filtered) {
      (byCat[it.category] ??= []).push(it);
    }
    return byCat;
  }, [filtered]);

  return (
    <>
      {/* Sticky filter bar */}
      <div className="sticky top-16 z-30 -mx-6 mb-12 border-y border-forest-500/10 bg-cream-100/90 px-6 py-4 backdrop-blur-md md:top-20 md:-mx-8 md:px-8">
        <div className="flex flex-col gap-3 md:flex-row md:items-center">
          <div className="relative flex-1">
            <Search
              className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-forest-500/40"
              aria-hidden="true"
            />
            <input
              type="search"
              placeholder={`Search ${TOTAL} questions…`}
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              className="h-10 w-full rounded-sm border border-forest-500/20 bg-cream-50 pl-9 pr-9 text-sm text-forest-900 placeholder:text-forest-500/40 focus:border-forest-500 focus:outline-none focus:ring-2 focus:ring-forest-500/30"
              aria-label="Search FAQ"
            />
            {query ? (
              <button
                type="button"
                onClick={() => setQuery("")}
                aria-label="Clear search"
                className="absolute right-2 top-1/2 -translate-y-1/2 rounded-sm p-1 text-forest-500/50 hover:bg-forest-500/5 hover:text-forest-500"
              >
                <X className="h-3.5 w-3.5" />
              </button>
            ) : null}
          </div>

          <div className="flex flex-wrap gap-1.5">
            <CatChip
              active={activeCat === "all"}
              onClick={() => setActiveCat("all")}
            >
              All
            </CatChip>
            {FAQ_CATEGORIES.map((c) => (
              <CatChip
                key={c.id}
                active={activeCat === c.id}
                onClick={() => setActiveCat(c.id)}
              >
                {c.title}
              </CatChip>
            ))}
          </div>
        </div>

        <p className="mt-3 text-xs text-forest-500/50">
          {filtered.length} of {TOTAL}{" "}
          {filtered.length === 1 ? "question" : "questions"} shown
        </p>
      </div>

      {/* Results */}
      {filtered.length === 0 ? (
        <div className="mt-12 rounded-sm border border-forest-500/10 bg-cream-200/40 p-12 text-center">
          <h2 className="font-serif text-2xl text-forest-500">
            Nothing matches that search.
          </h2>
          <p className="mx-auto mt-3 max-w-md text-sm text-forest-500/70">
            Try fewer or different words, or clear the filter to see all{" "}
            {TOTAL} questions.
          </p>
        </div>
      ) : (
        <div className="space-y-16">
          {FAQ_CATEGORIES.map((cat) => {
            const items = grouped[cat.id];
            if (!items || items.length === 0) return null;
            return (
              <section key={cat.id} id={cat.id}>
                <p className="text-xs font-medium uppercase tracking-[0.2em] text-brass-500">
                  {cat.title}
                </p>
                <h2 className="mt-2 font-serif text-3xl text-forest-900 md:text-4xl">
                  {cat.lead}
                </h2>
                <div className="mt-8 divide-y divide-forest-500/10 border-y border-forest-500/10">
                  {items.map((item) => (
                    <FaqRow key={item.id} item={item} />
                  ))}
                </div>
              </section>
            );
          })}
        </div>
      )}
    </>
  );
}

function CatChip({
  active,
  onClick,
  children,
}: {
  active: boolean;
  onClick: () => void;
  children: React.ReactNode;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        "rounded-sm border px-3 py-1.5 text-xs font-medium transition-colors",
        active
          ? "border-forest-500 bg-forest-500 text-cream-100"
          : "border-forest-500/20 bg-cream-50 text-forest-500 hover:border-forest-500/50",
      )}
    >
      {children}
    </button>
  );
}

function FaqRow({ item }: { item: FaqItem }) {
  // Native <details> for accessibility + simplicity. State stays in the DOM.
  return (
    <details className="group py-5">
      <summary
        className="flex cursor-pointer list-none items-start justify-between gap-4 [&::-webkit-details-marker]:hidden"
        id={item.id}
      >
        <h3 className="flex-1 font-serif text-lg leading-snug text-forest-900 md:text-xl">
          {item.question}
        </h3>
        <ChevronDown
          className="mt-1 h-5 w-5 shrink-0 text-forest-500/50 transition-transform duration-200 group-open:rotate-180"
          aria-hidden="true"
        />
      </summary>
      <FaqAnswer blocks={item.answer} />
    </details>
  );
}
