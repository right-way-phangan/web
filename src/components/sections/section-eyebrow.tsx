import { cn } from "@/lib/utils/cn";

/**
 * The canonical section eyebrow — a tiny uppercase label preceded by a short
 * hairline rule. One helper so the ~15 hand-rolled headers across the site stay
 * consistent and AA-correct: deep amber (brass-700) on the light sand surface,
 * vivid sunset gold (brass-300) on dark teal sections. Pure server component.
 */
export function SectionEyebrow({
  children,
  tone = "light",
  className,
}: {
  children: React.ReactNode;
  tone?: "light" | "dark";
  className?: string;
}) {
  return (
    <p
      className={cn(
        "flex items-center gap-3 text-xs font-medium uppercase tracking-eyebrow",
        tone === "dark" ? "text-brass-300" : "text-brass-700",
        className,
      )}
    >
      <span
        className={cn(
          "h-px w-10",
          tone === "dark" ? "bg-brass-300/70" : "bg-brass-600/60",
        )}
        aria-hidden
      />
      {children}
    </p>
  );
}
