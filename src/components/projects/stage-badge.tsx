import { cn } from "@/lib/utils/cn";
import type { Stage } from "@/types/object";
import type { Locale } from "@/lib/i18n/dictionaries";
import { getProjectsDict } from "@/lib/i18n/dictionaries";

const STAGE_STYLE: Record<string, string> = {
  Ready: "bg-forest-500/10 text-forest-700",
  "Under construction": "bg-brass-500/15 text-brass-600",
  "Off-plan": "bg-forest-900/8 text-forest-500",
};

/** Localized construction-stage pill (Ready / Under construction / Off-plan). */
export function StageBadge({
  stage,
  locale,
  className,
}: {
  stage?: Stage;
  locale: Locale;
  className?: string;
}) {
  if (!stage) return null;
  const t = getProjectsDict(locale);
  return (
    <span
      className={cn(
        "inline-flex items-center rounded-sm px-2.5 py-1 text-[11px] font-medium uppercase tracking-[0.15em]",
        STAGE_STYLE[stage] ?? "bg-forest-500/10 text-forest-500",
        className,
      )}
    >
      {t.stage[stage] ?? stage}
    </span>
  );
}
