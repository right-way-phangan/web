import { TrendingDown, TrendingUp, Minus } from "lucide-react";
import type { RealEstateObject } from "@/types/object";
import { computePriceContext } from "@/lib/insights/price-context";

const METRIC_NOUN: Record<string, string> = {
  "per-rai": "per rai",
  "per-sqm": "per m²",
  total: "asking price",
};

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
  const ctx = computePriceContext(object, catalog);
  if (!ctx) return null;

  const pct = Math.round(Math.abs(ctx.deltaPct));
  const inLine = pct < 3;
  const below = ctx.deltaPct < 0;
  const Icon = inLine ? Minus : below ? TrendingDown : TrendingUp;
  const sampleNote = `${ctx.sampleSize} comparable ${ctx.type.toLowerCase()}${ctx.sampleSize === 1 ? "" : "s"} in ${ctx.district}`;

  return (
    <p
      className="mt-3 inline-flex items-center gap-1.5 text-sm text-forest-500/70"
      title={`Based on ${sampleNote}, ${METRIC_NOUN[ctx.metric]}.`}
    >
      <Icon className={`h-4 w-4 ${below && !inLine ? "text-brass-500" : "text-forest-500/50"}`} />
      {inLine ? (
        <span>≈ in line with the {ctx.district} average ({METRIC_NOUN[ctx.metric]})</span>
      ) : (
        <span>
          ≈ {pct}% {below ? "below" : "above"} the {ctx.district} average{" "}
          {METRIC_NOUN[ctx.metric]}
        </span>
      )}
    </p>
  );
}
