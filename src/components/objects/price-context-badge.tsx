"use client";

import { TrendingDown, TrendingUp, Minus } from "lucide-react";
import type { RealEstateObject } from "@/types/object";
import { computePriceContext } from "@/lib/insights/price-context";
import { useLocale } from "@/lib/i18n/use-locale";
import { getObjectDict } from "@/lib/i18n/dictionaries";

/**
 * Modest "where this sits in the market" line under the price — only renders
 * when there's a real comparable sample (see computePriceContext).
 */
export function PriceContextBadge({
  object,
  catalog,
}: {
  object: RealEstateObject;
  catalog: RealEstateObject[];
}) {
  const t = getObjectDict(useLocale());
  const ctx = computePriceContext(object, catalog);
  if (!ctx) return null;

  const metricNoun: Record<string, string> = {
    "per-rai": t.pcPerRai,
    "per-sqm": t.pcPerSqm,
    total: t.pcAsking,
  };
  const metric = metricNoun[ctx.metric];
  const pct = Math.round(Math.abs(ctx.deltaPct));
  const inLine = pct < 3;
  const below = ctx.deltaPct < 0;
  const Icon = inLine ? Minus : below ? TrendingDown : TrendingUp;

  return (
    <p className="mt-3 flex items-center gap-1.5 text-sm text-forest-500/70">
      <Icon className={`h-4 w-4 ${below && !inLine ? "text-brass-500" : "text-forest-500/50"}`} />
      {inLine ? (
        <span>{t.pcInLine(ctx.district, metric)}</span>
      ) : (
        <span>{t.pcDelta(pct, below ? "below" : "above", ctx.district, metric)}</span>
      )}
    </p>
  );
}
