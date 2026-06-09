"use client";

import type { Route } from "next";
import Link from "next/link";
import type { RealEstateObject } from "@/types/object";
import type { ProjectAvailability } from "@/lib/data/projects";
import { formatPriceCompact } from "@/lib/utils/price";
import { useLocale, localeHref } from "@/lib/i18n/use-locale";
import { getProjectsDict } from "@/lib/i18n/dictionaries";
import { cn } from "@/lib/utils/cn";
import { AvailabilityBar } from "./availability-bar";

interface Props {
  units: RealEstateObject[];
  availability: ProjectAvailability;
}

/**
 * Units & availability block. Hybrid: when no per-unit cards exist, shows the
 * headline counters + progress bar from the project's own figures. Once unit
 * cards are entered, renders a per-unit table with live status and links.
 */
export function UnitsTable({ units, availability }: Props) {
  const locale = useLocale();
  const t = getProjectsDict(locale);
  const { total, available } = availability;
  const sold = total != null && available != null ? total - available : undefined;

  return (
    <div className="space-y-6">
      {/* Headline counters */}
      <div className="grid grid-cols-2 gap-4 sm:grid-cols-3">
        {total != null ? <Stat value={total} label={t.units} /> : null}
        {available != null ? (
          <Stat value={available} label={t.availableLabel} highlight={available > 0} />
        ) : null}
        {sold != null && sold > 0 ? <Stat value={sold} label={t.takenLabel} muted /> : null}
      </div>

      {total ? (
        <div className="space-y-2">
          <AvailabilityBar total={total} available={available} />
          {(available ?? 0) <= 0 ? (
            <p className="text-sm text-forest-500/70">{t.soldOut}</p>
          ) : (available ?? 0) <= 2 ? (
            <p className="text-sm font-medium text-brass-600">{t.unitsLeft(available ?? 0)}</p>
          ) : (
            <p className="text-sm text-forest-500/70">{t.available(available ?? 0, total)}</p>
          )}
        </div>
      ) : null}

      {/* Per-unit rows — only once real unit cards exist */}
      {units.length > 0 ? (
        <UnitRows units={units} locale={locale} />
      ) : null}
    </div>
  );
}

function Stat({
  value,
  label,
  highlight,
  muted,
}: {
  value: number;
  label: string;
  highlight?: boolean;
  muted?: boolean;
}) {
  return (
    <div className="rounded-sm border border-forest-500/10 bg-cream-50 p-4">
      <div
        className={cn(
          "num text-3xl",
          highlight ? "text-brass-500" : muted ? "text-forest-500/50" : "text-forest-900",
        )}
      >
        {value}
      </div>
      <div className="mt-1 text-xs uppercase tracking-[0.15em] text-forest-500/55">{label}</div>
    </div>
  );
}

function UnitRows({ units, locale }: { units: RealEstateObject[]; locale: "en" | "ru" }) {
  const priceOnRequest = locale === "ru" ? "Цена по запросу" : "Price on request";
  const statusLabel: Record<string, string> = {
    Active: locale === "ru" ? "Доступен" : "Available",
    Reserved: locale === "ru" ? "Резерв" : "Reserved",
    Sold: locale === "ru" ? "Продан" : "Sold",
    Hold: locale === "ru" ? "Холд" : "On hold",
    Withdrawn: locale === "ru" ? "Снят" : "Withdrawn",
  };
  const rowClass =
    "grid grid-cols-[1fr_auto] items-center gap-2 py-3 sm:grid-cols-[auto_1fr_auto_auto]";
  return (
    <dl className="divide-y divide-forest-500/10 border-y border-forest-500/10">
      {units.map((u) => {
        const inner = (
          <>
            <dt className="text-sm font-medium text-forest-900">{u.rwNumber}</dt>
            <dd className="hidden text-sm text-forest-500/70 sm:block">
              {u.areaSqm ? `${u.areaSqm.toLocaleString()} m²` : u.titleEn}
            </dd>
            <dd className="num text-sm text-forest-900">
              {u.priceThb ? formatPriceCompact(u.priceThb) : priceOnRequest}
            </dd>
            <dd
              className={cn(
                "justify-self-end rounded-sm px-2 py-0.5 text-[11px] font-medium uppercase tracking-[0.1em]",
                u.status === "Active"
                  ? "bg-brass-500/15 text-brass-600"
                  : "bg-forest-500/10 text-forest-500/60",
              )}
            >
              {statusLabel[u.status] ?? u.status}
            </dd>
          </>
        );
        // Only link units that have their own public detail page. A unit detail
        // page exists only when the unit is Active AND has a photo (publication
        // gate in getObjectByRwNumber) — linking a photo-less / sold unit would
        // 404. Those render as a plain, non-clickable row.
        const reachable = u.status === "Active" && !!u.coverImage;
        return reachable ? (
          <Link
            key={u.rwNumber}
            href={localeHref(locale, `/object/${u.rwNumber}`) as Route}
            className={cn(rowClass, "transition-colors hover:bg-forest-500/5")}
          >
            {inner}
          </Link>
        ) : (
          <div key={u.rwNumber} className={rowClass}>
            {inner}
          </div>
        );
      })}
    </dl>
  );
}
