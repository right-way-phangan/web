"use client";

import { useEffect, useState, type ReactNode } from "react";
import { ChevronDown } from "lucide-react";
import type { RoiPreview } from "@/lib/calculator/preview";
import { formatPriceTHB } from "@/lib/utils/price";

const COPY = {
  en: {
    eyebrow: "Buy & hold, illustrative",
    inYears: (y: number) => `value in ${y} years`,
    growth: (g: number) => `at +${g}%/yr`,
    leaseGrowth: (g: number, eff: number) =>
      `+${g}%/yr on the asset, ≈${eff >= 0 ? "+" : ""}${eff}%/yr after the shrinking lease term`,
    show: "Show full projection",
    hide: "Hide projection",
  },
  ru: {
    eyebrow: "Купить и держать, иллюстративно",
    inYears: (y: number) => `стоимость через ${y} лет`,
    growth: (g: number) => `при +${g}%/год`,
    leaseGrowth: (g: number, eff: number) =>
      `+${g}%/год на актив, ≈${eff >= 0 ? "+" : ""}${eff}%/год с учётом тающего срока аренды`,
    show: "Показать расчёт",
    hide: "Свернуть расчёт",
  },
};

/**
 * Collapsed shell for the ROI calculator on object and project pages. The
 * full calculator ran ~2 400 px on every card (audit 2026-09-03); most
 * visitors want one number and a way to dig in. Preview comes from the same
 * defaults the calculator opens with (lib/calculator/preview.ts), so nothing
 * is invented. Opens on demand, or on arrival via `#<anchor>` / `?calc=open`
 * so the existing "See ROI projection" links keep landing on the full tool.
 * SSR renders collapsed; the calculator mounts only when opened.
 */
export function CalculatorDisclosure({
  preview,
  locale,
  anchor,
  children,
}: {
  preview: RoiPreview | null;
  locale: "en" | "ru";
  anchor: string;
  children: ReactNode;
}) {
  const [open, setOpen] = useState(false);
  const t = COPY[locale];

  useEffect(() => {
    const wantsOpen =
      window.location.hash === `#${anchor}` ||
      new URLSearchParams(window.location.search).get("calc") === "open";
    if (wantsOpen) setOpen(true);
  }, [anchor]);

  if (!preview) return <>{children}</>;

  return (
    <div className="rounded-sm border border-forest-500/10 bg-cream-50 p-5 md:p-6">
      <div className="flex flex-wrap items-end justify-between gap-x-6 gap-y-4">
        <div>
          <p className="text-[0.8125rem] font-medium uppercase tracking-eyebrow text-forest-500/55">
            {t.eyebrow}
          </p>
          <p className="num mt-1 text-2xl text-forest-900 md:text-3xl">
            ≈ {formatPriceTHB(preview.projectedValueThb)}
          </p>
          <p className="mt-1 text-sm text-forest-500/70">
            {t.inYears(preview.years)} ·{" "}
            {preview.leasehold
              ? t.leaseGrowth(preview.growthPct, preview.effectiveGrowthPct)
              : t.growth(preview.growthPct)}
          </p>
        </div>
        <button
          type="button"
          onClick={() => setOpen((o) => !o)}
          aria-expanded={open}
          aria-controls={`${anchor}-full`}
          className="inline-flex min-h-11 items-center gap-1.5 rounded-sm border border-forest-500/20 px-4 text-sm font-medium text-forest-900 transition-colors hover:border-brass-500 hover:text-brass-500"
        >
          {open ? t.hide : t.show}
          <ChevronDown className={`h-4 w-4 transition-transform ${open ? "rotate-180" : ""}`} />
        </button>
      </div>
      {open ? (
        <div id={`${anchor}-full`} className="mt-8">
          {children}
        </div>
      ) : null}
    </div>
  );
}
