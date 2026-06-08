"use client";

import Link from "next/link";
import type { Route } from "next";
import { X } from "lucide-react";
import type { RealEstateObject } from "@/types/object";
import { useSaved } from "@/lib/saved/saved-context";
import { formatPriceCompact } from "@/lib/utils/price";
import { cn } from "@/lib/utils/cn";
import { useLocale, localeHref } from "@/lib/i18n/use-locale";

interface Row {
  label: string;
  get: (o: RealEstateObject) => string;
  /** Lower-is-better numeric for "best" marking (e.g. price). Optional. */
  rank?: (o: RealEstateObject) => number | null;
}

const CT = {
  en: {
    heading: "Compare",
    lede: "Rows that differ are highlighted; matching specs are dimmed.",
    spec: "Spec",
    best: "Best",
    remove: (rw: string) => `Remove ${rw}`,
    onRequest: "On request",
    perRai: "/rai",
    perRaiMo: "/rai/mo",
    rai: "rai",
    yr: "yr",
    rPrice: "Price",
    rPricePerRai: "Price / rai",
    rType: "Type",
    rDistrict: "District",
    rArea: "Area",
    rTenure: "Tenure",
    rDocument: "Document",
    rLease: "Lease term",
    rBedrooms: "Bedrooms",
    rView: "View",
    vBeachfront: "Beachfront",
    vSeaView: "Sea view",
    vMountain: "Mountain",
    vJungle: "Jungle",
  },
  ru: {
    heading: "Сравнение",
    lede: "Различающиеся строки выделены; совпадающие характеристики приглушены.",
    spec: "Параметр",
    best: "Лучшее",
    remove: (rw: string) => `Убрать ${rw}`,
    onRequest: "По запросу",
    perRai: "/рай",
    perRaiMo: "/рай/мес",
    rai: "рай",
    yr: "лет",
    rPrice: "Цена",
    rPricePerRai: "Цена / рай",
    rType: "Тип",
    rDistrict: "Район",
    rArea: "Площадь",
    rTenure: "Владение",
    rDocument: "Документ",
    rLease: "Срок аренды",
    rBedrooms: "Спальни",
    rView: "Вид",
    vBeachfront: "Первая линия",
    vSeaView: "Вид на море",
    vMountain: "На горы",
    vJungle: "На джунгли",
  },
} as const;

function buildRows(t: (typeof CT)[keyof typeof CT]): Row[] {
  return [
    {
      label: t.rPrice,
      get: (o) =>
        o.priceThb
          ? formatPriceCompact(o.priceThb)
          : o.pricePerRai
            ? `${formatPriceCompact(o.pricePerRai)}${t.perRai}`
            : o.rentPerRaiMonth
              ? `${formatPriceCompact(o.rentPerRaiMonth)}${t.perRaiMo}`
              : t.onRequest,
      rank: (o) => o.priceThb ?? null,
    },
    {
      label: t.rPricePerRai,
      get: (o) => (o.pricePerRai ? `${formatPriceCompact(o.pricePerRai)}` : "—"),
      rank: (o) => o.pricePerRai ?? null,
    },
    { label: t.rType, get: (o) => o.type },
    { label: t.rDistrict, get: (o) => o.district ?? "—" },
    {
      label: t.rArea,
      get: (o) =>
        o.areaRai
          ? `${o.areaRai.toLocaleString(undefined, { maximumFractionDigits: 2 })} ${t.rai}`
          : o.areaSqm
            ? `${o.areaSqm.toLocaleString()} m²`
            : "—",
    },
    { label: t.rTenure, get: (o) => o.tenure?.join(", ") ?? "—" },
    { label: t.rDocument, get: (o) => o.documentType ?? "—" },
    { label: t.rLease, get: (o) => (o.leaseTermYears ? `${o.leaseTermYears} ${t.yr}` : "—") },
    { label: t.rBedrooms, get: (o) => (o.bedrooms ? String(o.bedrooms) : "—") },
    {
      label: t.rView,
      get: (o) =>
        o.beachfront
          ? t.vBeachfront
          : o.seaView
            ? t.vSeaView
            : o.mountainView
              ? t.vMountain
              : o.jungleView
                ? t.vJungle
                : "—",
    },
  ];
}

/**
 * Side-by-side comparison of saved listings with difference highlighting:
 * rows where every value is identical are dimmed; rows that differ stay full
 * contrast so the trade-offs jump out. The best price/rai cell gets a marker.
 * Feature parity with the Mini App's compare view (bot/scripts/compare.py).
 */
export function CompareTable({ items }: { items: RealEstateObject[] }) {
  const locale = useLocale();
  const t = CT[locale];
  const ROWS = buildRows(t);
  const { remove } = useSaved();
  if (items.length < 2) return null;

  return (
    <section>
      <h2 className="font-serif text-2xl text-forest-900">{t.heading}</h2>
      <p className="mt-1 text-sm text-forest-500/60">{t.lede}</p>
      <div className="mt-6 overflow-x-auto rounded-sm border border-forest-500/10">
        <table className="w-full min-w-[640px] border-collapse text-sm">
          <thead>
            <tr className="border-b border-forest-500/10 bg-cream-50">
              <th className="sticky left-0 z-10 bg-cream-50 p-3 text-left text-xs font-medium uppercase tracking-wide text-forest-500/50">
                {t.spec}
              </th>
              {items.map((o) => (
                <th key={o.id} className="min-w-[160px] p-3 text-left align-top">
                  <div className="flex items-start justify-between gap-2">
                    <Link
                      href={localeHref(locale, `/object/${o.rwNumber}`) as Route}
                      className="font-serif text-base leading-snug text-forest-900 hover:text-brass-500"
                    >
                      {o.rwNumber}
                    </Link>
                    <button
                      type="button"
                      onClick={() => remove(o.rwNumber)}
                      aria-label={t.remove(o.rwNumber)}
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
                            {t.best}
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
