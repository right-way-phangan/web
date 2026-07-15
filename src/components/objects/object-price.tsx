"use client";

import { CurrencyToggle, useCurrency } from "@/components/ui/currency";
import { leaseLine, escalatedLeaseTotalThb } from "@/lib/objects/lease-format";

interface Props {
  priceThb?: number;
  pricePerRai?: number;
  rentPerMonth?: number;
  rentPerRaiMonth?: number;
  leaseTermYears?: number;
  leaseEscPercent?: number;
  leaseEscPeriodYears?: number;
  isLand?: boolean;
  locale?: "en" | "ru";
}

const LABELS = {
  en: { perRai: "/ rai", perMonth: "/ month", perRaiMonth: "/ rai / month", onRequest: "Price on request" },
  ru: { perRai: "/ рай", perMonth: "/ мес", perRaiMonth: "/ рай / мес", onRequest: "Цена по запросу" },
} as const;

/**
 * Headline price for the object page — currency-aware (฿/$/₽ via the shared
 * toggle, persisted site-wide). Amounts stay THB underneath; this only converts
 * for display with live FX. A small client island so the rest of the page keeps
 * server-rendering. Precision mirrors the previous server markup: full for the
 * sale/lease headline (formatPriceTHB), compact for the per-rai figure.
 */
export function ObjectPrice({
  priceThb,
  pricePerRai,
  rentPerMonth,
  rentPerRaiMonth,
  leaseTermYears,
  leaseEscPercent,
  leaseEscPeriodYears,
  isLand,
  locale = "en",
}: Props) {
  const { fmt, fmtFull } = useCurrency();
  const L = LABELS[locale];
  const row = "mt-4 flex flex-wrap items-center gap-x-3 gap-y-2";
  const big = "num text-3xl text-forest-900 md:text-4xl";
  const sub = "text-sm text-forest-500/70";
  const toggle = "ml-auto sm:ml-3";

  if (priceThb) {
    return (
      <div className={row}>
        <span className={big}>{fmtFull(priceThb)}</span>
        {isLand && pricePerRai ? <span className={sub}>{fmt(pricePerRai)} {L.perRai}</span> : null}
        <CurrencyToggle className={toggle} />
      </div>
    );
  }
  if (pricePerRai) {
    return (
      <div className={row}>
        <span className={big}>{fmt(pricePerRai)}</span>
        <span className={sub}>{L.perRai}</span>
        <CurrencyToggle className={toggle} />
      </div>
    );
  }
  if (rentPerMonth || rentPerRaiMonth) {
    const monthly = (rentPerMonth ?? rentPerRaiMonth)!;
    const perLabel = rentPerMonth ? L.perMonth : L.perRaiMonth;
    // Whole-plot rent yields a concrete lease total; a per-rai rent needs the
    // plot area (not carried here), so it shows the term without a total.
    const total =
      rentPerMonth && leaseTermYears
        ? escalatedLeaseTotalThb(rentPerMonth, leaseTermYears, leaseEscPercent, leaseEscPeriodYears)
        : undefined;
    return (
      <div>
        <div className={row}>
          <span className={big}>{fmtFull(monthly)}</span>
          <span className={sub}>{perLabel}</span>
          <CurrencyToggle className={toggle} />
        </div>
        {leaseTermYears ? (
          <p className="mt-2 text-sm text-forest-500/70">
            {leaseLine(locale, leaseTermYears, total != null ? fmt(total) : undefined, !!leaseEscPercent)}
          </p>
        ) : null}
      </div>
    );
  }
  return <p className="mt-4 text-lg italic text-forest-500/70">{L.onRequest}</p>;
}
