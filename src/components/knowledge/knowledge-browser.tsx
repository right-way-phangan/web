"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import type { Route } from "next";
import { ArrowRight, Search, X } from "lucide-react";

export interface KbCard {
  slug: string;
  topic: string;
  title: string;
  short: string;
  updated: string;
}

export interface KnowledgeBrowserLabels {
  all: string;
  read: string;
  searchPlaceholder: string;
  empty: string;
  clear: string;
  updatedPrefix: string;
  /** 12 month names in display language, January-first. */
  months: string[];
}

interface KnowledgeBrowserProps {
  articles: KbCard[];
  basePath: string;
  labels: KnowledgeBrowserLabels;
}

function formatUpdated(iso: string, prefix: string, months: string[]): string {
  const m = iso.match(/^(\d{4})-(\d{2})/);
  if (!m) return "";
  const month = months[Number(m[2]) - 1] ?? "";
  return `${prefix} ${month} ${m[1]}`.trim();
}

export function KnowledgeBrowser({ articles, basePath, labels }: KnowledgeBrowserProps) {
  const [topic, setTopic] = useState<string>("all");
  const [query, setQuery] = useState("");

  const topics = useMemo(() => {
    const counts = new Map<string, number>();
    for (const a of articles) counts.set(a.topic, (counts.get(a.topic) ?? 0) + 1);
    return Array.from(counts.entries())
      .map(([name, count]) => ({ name, count }))
      .sort((a, b) => b.count - a.count || a.name.localeCompare(b.name));
  }, [articles]);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    return articles.filter((a) => {
      if (topic !== "all" && a.topic !== topic) return false;
      if (!q) return true;
      return (
        a.title.toLowerCase().includes(q) ||
        a.short.toLowerCase().includes(q) ||
        a.topic.toLowerCase().includes(q)
      );
    });
  }, [articles, topic, query]);

  const chipBase =
    "inline-flex min-h-[44px] items-center gap-1.5 rounded-full px-4 py-1.5 text-sm font-medium transition-colors whitespace-nowrap";

  return (
    <div>
      {/* Toolbar: filters + search */}
      <div className="flex flex-col gap-5 lg:flex-row lg:items-center lg:justify-between">
        <div className="-mx-1 flex flex-nowrap gap-2 overflow-x-auto px-1 pb-1 lg:flex-wrap lg:overflow-visible lg:pb-0">
          <button
            type="button"
            onClick={() => setTopic("all")}
            className={`${chipBase} ${
              topic === "all"
                ? "bg-panel text-panel-fg"
                : "border border-forest-500/15 text-forest-500/80 hover:border-forest-500/40 hover:text-forest-900"
            }`}
          >
            {labels.all}
            <span className="text-xs opacity-70">{articles.length}</span>
          </button>
          {topics.map((t) => (
            <button
              key={t.name}
              type="button"
              onClick={() => setTopic(t.name)}
              className={`${chipBase} ${
                topic === t.name
                  ? "bg-panel text-panel-fg"
                  : "border border-forest-500/15 text-forest-500/80 hover:border-forest-500/40 hover:text-forest-900"
              }`}
            >
              {t.name}
              <span className="text-xs opacity-70">{t.count}</span>
            </button>
          ))}
        </div>

        <div className="relative w-full lg:w-72 lg:flex-none">
          <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-forest-500/40" />
          <input
            type="search"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder={labels.searchPlaceholder}
            aria-label={labels.searchPlaceholder}
            className="w-full rounded-full border border-forest-500/15 bg-cream-50 py-2 pl-9 pr-9 text-sm text-forest-900 placeholder:text-forest-500/40 focus:border-forest-500/40 focus:outline-none focus:ring-1 focus:ring-forest-500/20"
          />
          {query && (
            <button
              type="button"
              onClick={() => setQuery("")}
              aria-label={labels.clear}
              className="absolute right-2.5 top-1/2 -translate-y-1/2 text-forest-500/40 transition-colors hover:text-forest-900"
            >
              <X className="h-4 w-4" />
            </button>
          )}
        </div>
      </div>

      {/* Grid */}
      {filtered.length === 0 ? (
        <p className="mt-16 text-center text-forest-500/60">{labels.empty}</p>
      ) : (
        <div className="mt-10 grid gap-5 sm:grid-cols-2 sm:gap-6 lg:grid-cols-3">
          {filtered.map((a) => (
            <Link
              key={a.slug}
              href={`${basePath}/${a.slug}` as Route}
              className="group flex flex-col rounded-sm border border-forest-500/10 bg-cream-50 card-elevated p-6 hover:-translate-y-1.5 hover:border-forest-500/30 hover:shadow-2xl hover:shadow-panel/15 motion-reduce:hover:translate-y-0 md:p-7"
            >
              <p className="text-xs font-medium uppercase tracking-[0.18em] text-brass-500">
                {a.topic}
              </p>
              <h2 className="mt-3 font-serif text-lg leading-snug text-forest-900 md:text-xl">
                {a.title}
              </h2>
              <p className="mt-3 line-clamp-3 text-sm leading-relaxed text-forest-500/85">
                {a.short}
              </p>
              <div className="mt-auto flex items-center justify-between gap-3 pt-6">
                <span className="text-xs text-forest-500/50">
                  {formatUpdated(a.updated, labels.updatedPrefix, labels.months)}
                </span>
                <span className="inline-flex items-center gap-1.5 text-sm font-medium text-forest-500 transition-colors group-hover:text-brass-500">
                  {labels.read}
                  <ArrowRight className="h-3.5 w-3.5 transition-transform group-hover:translate-x-0.5" />
                </span>
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
