import { cn } from "@/lib/utils/cn";

/** Best-effort numeric value of a price string: "4 490 000" / "฿4.49M" → number. */
function parseNum(s: string): number | undefined {
  const lower = s.toLowerCase();
  const mult = /[mм]/.test(lower) ? 1_000_000 : 1;
  const n = parseFloat(lower.replace(/[^\d.]/g, ""));
  return Number.isFinite(n) ? n * mult : undefined;
}

/**
 * Price-by-readiness ladder ("Off-plan | 4,490,000" → rows). The first row is
 * the current entry price and is highlighted; later rows show how the price
 * climbs toward completion. Each earlier row gets a delta badge vs the final
 * (last) price, so the early-entry discount is obvious — e.g. "−21%".
 */
export function PriceStages({ stages }: { stages: Array<{ label: string; value: string }> }) {
  const finalVal = parseNum(stages[stages.length - 1]?.value ?? "");

  return (
    <ol className="overflow-hidden rounded-sm border border-forest-500/10">
      {stages.map((s, i) => {
        const isLast = i === stages.length - 1;
        const val = parseNum(s.value);
        const delta =
          !isLast && finalVal && finalVal > 0 && val != null
            ? Math.round(((val - finalVal) / finalVal) * 100)
            : undefined;
        return (
          <li
            key={`${s.label}-${i}`}
            className={cn(
              "flex items-baseline justify-between gap-4 px-4 py-3",
              i > 0 && "border-t border-forest-500/10",
              i === 0 ? "bg-brass-500/10" : "bg-cream-50",
            )}
          >
            <span
              className={cn(
                "text-sm",
                i === 0 ? "font-medium text-forest-900" : "text-forest-500/75",
              )}
            >
              {s.label}
            </span>
            <span className="flex items-baseline gap-2">
              {delta != null && delta !== 0 ? (
                <span
                  className={cn(
                    "rounded-sm px-1.5 py-0.5 text-[11px] font-medium tabular-nums",
                    delta < 0 ? "bg-forest-500/10 text-forest-700" : "bg-brass-500/15 text-brass-600",
                  )}
                >
                  {delta > 0 ? "+" : ""}
                  {delta}%
                </span>
              ) : null}
              <span
                className={cn(
                  "num text-sm tabular-nums",
                  i === 0 ? "text-brass-600" : "text-forest-900",
                )}
              >
                {s.value}
              </span>
            </span>
          </li>
        );
      })}
    </ol>
  );
}
