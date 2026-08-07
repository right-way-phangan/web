"use client";

import Link from "next/link";
import type { Route } from "next";
import { Award } from "lucide-react";
import { useLocale, localeHref } from "@/lib/i18n/use-locale";
import { DISTRICT_PAGE_SLUGS, type DisplayCurrency } from "@/lib/data/rental-market";

/**
 * Presentational primitives shared across the /insights report, the gated full
 * report and the interactive blocks. Kept INS-free (locale copy stays with each
 * caller) so any component can import these without pulling the whole dictionary.
 * Split out of rental-insights.tsx (2026-07-15).
 */

export function Stat({ label, value }: { label: string; value: React.ReactNode }) {
  return (
    <div>
      <div className="text-[11px] uppercase tracking-wider text-forest-500/55">{label}</div>
      <div className="mt-0.5 font-medium text-forest-900">{value}</div>
    </div>
  );
}

/**
 * Numbered section header with an anchor id for the sticky in-page nav. `index`
 * renders a two-digit ordinal ("01 ·") in the eyebrow; `scroll-mt-32` keeps the
 * heading clear of the sticky header + nav bar when deep-linked.
 */
export function SectionHead({
  icon,
  eyebrow,
  title,
  note,
  id,
  index,
}: {
  icon: React.ReactNode;
  eyebrow: string;
  title: string;
  note?: string;
  id?: string;
  index?: number;
}) {
  return (
    <div id={id} className={id ? "scroll-mt-32" : undefined}>
      <p className="inline-flex items-center gap-1.5 text-[0.8125rem] font-medium uppercase tracking-eyebrow text-brass-500">
        {icon}
        {index != null ? (
          <span className="tabular-nums text-brass-500/70">
            {String(index).padStart(2, "0")} ·
          </span>
        ) : null}
        {eyebrow}
      </p>
      <h2 className="mt-3 font-serif text-2xl text-forest-900 md:text-3xl">{title}</h2>
      {note ? <p className="mt-2 max-w-2xl text-forest-500/75">{note}</p> : null}
    </div>
  );
}

export function SubHead({ title, icon }: { title: string; icon?: React.ReactNode }) {
  return (
    <h3 className="inline-flex items-center gap-2 font-medium text-forest-500">
      {icon ? <span className="text-brass-500">{icon}</span> : null}
      {title}
    </h3>
  );
}

export const CONF_COLOR: Record<"low" | "medium" | "high", string> = {
  low: "bg-brass-400/50",
  medium: "bg-brass-400",
  high: "bg-panel",
};

export function CurrencyToggle({
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
            currency === c ? "bg-panel text-panel-fg" : "text-forest-500/70 hover:bg-forest-500/8"
          }`}
        >
          {c}
        </button>
      ))}
    </div>
  );
}

export function Metric({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-sm bg-forest-500/[0.04] py-1.5">
      <div className="text-[10px] uppercase tracking-wide text-forest-500/50">{label}</div>
      <div className="text-sm font-semibold tabular-nums text-forest-900">{value}</div>
    </div>
  );
}

export function Pill({ children }: { children: React.ReactNode }) {
  return (
    <span className="rounded-full bg-forest-500/8 px-3 py-1 text-xs font-medium text-forest-500">
      {children}
    </span>
  );
}

/**
 * Horizontal value bar. Optional `band` overlays a p25–p75 whisker (lighter
 * range around the median) and, when set, faint 25/50/75% tick marks sit in the
 * track so bars can be read against gridlines without a chart library.
 */
export function BarRow({
  label,
  slug,
  value,
  max,
  right,
  sub,
  highlight,
  badge,
  confidence,
  tag,
  tone = "forest",
  band,
  ticks,
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
  tag?: { label: string; tone: "good" | "warn" };
  tone?: "forest" | "brass";
  band?: { p25: number; p75: number } | null;
  ticks?: boolean;
}) {
  const locale = useLocale();
  const pct = Math.max(4, Math.round((value / max) * 100));
  const barColor =
    tone === "brass" ? "bg-brass-400" : highlight ? "bg-brass-500" : "bg-forest-500/70";
  const hasPage = slug && DISTRICT_PAGE_SLUGS.has(slug);
  const bandLeft = band ? Math.max(0, Math.min(100, Math.round((band.p25 / max) * 100))) : 0;
  const bandRight = band ? Math.max(0, Math.min(100, Math.round((band.p75 / max) * 100))) : 0;

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
              href={localeHref(locale, `/districts/${slug}`) as Route}
              className="truncate text-sm font-medium text-forest-900 underline-offset-2 hover:text-brass-500 hover:underline"
            >
              {label}
            </Link>
          ) : (
            <span className="block truncate text-sm font-medium text-forest-900">{label}</span>
          )}
          {tag ? (
            <span
              className={`shrink-0 rounded-full px-1.5 py-0.5 text-[9px] font-medium uppercase tracking-wide ${
                tag.tone === "good"
                  ? "bg-forest-500/10 text-forest-500"
                  : "bg-brass-200/60 text-brass-600"
              }`}
            >
              {tag.label}
            </span>
          ) : null}
        </span>
        {sub ? <div className="truncate text-[11px] text-forest-500/55">{sub}</div> : null}
      </div>
      <div className="relative h-2.5 overflow-hidden rounded-full bg-forest-500/8">
        {ticks
          ? [25, 50, 75].map((p) => (
              <span
                key={p}
                aria-hidden
                className="absolute top-0 h-full w-px bg-forest-500/15"
                style={{ left: `${p}%` }}
              />
            ))
          : null}
        {band && bandRight > bandLeft ? (
          <span
            aria-hidden
            className={`absolute top-0 h-full ${tone === "brass" ? "bg-brass-400/25" : "bg-forest-500/20"}`}
            style={{ left: `${bandLeft}%`, width: `${bandRight - bandLeft}%` }}
          />
        ) : null}
        <div className={`relative h-full rounded-full ${barColor}`} style={{ width: `${pct}%` }} />
      </div>
      <div className="w-16 text-right text-sm font-semibold tabular-nums text-forest-900 md:w-20">
        {right}
      </div>
    </div>
  );
}
