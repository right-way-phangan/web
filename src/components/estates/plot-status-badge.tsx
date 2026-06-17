import { cn } from "@/lib/utils/cn";
import type { PlotStatus } from "@/content/land-estates";
import type { Locale } from "@/lib/i18n/dictionaries";
import { getEstatesDict } from "@/lib/i18n/dictionaries";

/**
 * Статусный бейдж участка. Цвет + точка + подпись — статус читается и без цвета
 * (доступность). На палитре бренда (forest/brass): свободно — яркий brass,
 * резерв — контур brass, продано — приглушённый forest, арендовано — тёмный forest.
 */
const STYLE: Record<PlotStatus, { wrap: string; dot: string }> = {
  available: {
    wrap: "bg-brass-500/15 text-brass-700 ring-1 ring-brass-500/30",
    dot: "bg-brass-500",
  },
  reserved: {
    wrap: "bg-brass-500/5 text-brass-600 ring-1 ring-brass-500/40",
    dot: "bg-brass-400 ring-1 ring-brass-500/50",
  },
  sold: {
    wrap: "bg-forest-500/10 text-forest-500/60 ring-1 ring-forest-500/10",
    dot: "bg-forest-500/40",
  },
  rented: {
    wrap: "bg-forest-700/12 text-forest-700/80 ring-1 ring-forest-700/15",
    dot: "bg-forest-700/55",
  },
};

export function PlotStatusBadge({
  status,
  locale,
  className,
}: {
  status: PlotStatus;
  locale: Locale;
  className?: string;
}) {
  const t = getEstatesDict(locale);
  const s = STYLE[status];
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 rounded-sm px-2.5 py-0.5 text-[11px] font-medium uppercase tracking-[0.1em]",
        s.wrap,
        className,
      )}
    >
      <span className={cn("h-1.5 w-1.5 rounded-full", s.dot)} aria-hidden />
      {t.status[status]}
    </span>
  );
}
