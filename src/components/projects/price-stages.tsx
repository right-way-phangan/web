import { cn } from "@/lib/utils/cn";

/**
 * Price-by-readiness ladder ("Off-plan | 4,490,000" → rows). The first row is
 * the current entry price and is highlighted; later rows show how the price
 * climbs toward completion.
 */
export function PriceStages({ stages }: { stages: Array<{ label: string; value: string }> }) {
  return (
    <ol className="overflow-hidden rounded-sm border border-forest-500/10">
      {stages.map((s, i) => (
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
          <span
            className={cn(
              "num text-sm tabular-nums",
              i === 0 ? "text-brass-600" : "text-forest-900",
            )}
          >
            {s.value}
          </span>
        </li>
      ))}
    </ol>
  );
}
