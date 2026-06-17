import type { LucideIcon } from "lucide-react";
import { cn } from "@/lib/utils/cn";

/**
 * EmptyState — единый branded плейсхолдер для пустых списков/секций админки
 * (вместо разрозненных «Пока нет …»). Server-safe (без хуков), канон
 * forest/cream, токены через --c-* → корректен в тёмной теме.
 */
export function EmptyState({
  icon: Icon,
  title,
  hint,
  action,
  className,
}: {
  icon?: LucideIcon;
  title: string;
  hint?: string;
  action?: React.ReactNode;
  className?: string;
}) {
  return (
    <div
      className={cn(
        "flex flex-col items-center justify-center gap-3 rounded-sm border border-dashed border-forest-500/15 bg-forest-500/[0.03] px-6 py-12 text-center",
        className,
      )}
    >
      {Icon ? (
        <span className="flex h-12 w-12 items-center justify-center rounded-full bg-forest-500/5 text-forest-500/40">
          <Icon className="h-6 w-6" strokeWidth={1.5} />
        </span>
      ) : null}
      <div>
        <p className="font-serif text-lg text-forest-900">{title}</p>
        {hint ? <p className="mt-1 text-sm text-forest-500/60">{hint}</p> : null}
      </div>
      {action ? <div className="mt-1">{action}</div> : null}
    </div>
  );
}
