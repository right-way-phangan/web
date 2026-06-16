import { cn } from "@/lib/utils/cn";

/**
 * Thin progress bar of sold/available units. Pure presentational — drives both
 * the project card and the units section. `available` of 0 renders fully filled
 * (sold out); undefined counts render nothing.
 */
export function AvailabilityBar({
  total,
  available,
  className,
}: {
  total?: number;
  available?: number;
  className?: string;
}) {
  if (!total || total <= 0) return null;
  const avail = Math.max(0, Math.min(available ?? 0, total));
  const soldPct = Math.round(((total - avail) / total) * 100);
  return (
    <div
      className={cn("h-1.5 w-full overflow-hidden rounded-full bg-forest-500/10", className)}
      role="progressbar"
      aria-valuenow={total - avail}
      aria-valuemin={0}
      aria-valuemax={total}
    >
      <div
        className="h-full rounded-full bg-brass-500/70 transition-[width] dark:bg-bronze/85"
        style={{ width: `${soldPct}%` }}
      />
    </div>
  );
}
