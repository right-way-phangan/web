import { cn } from "@/lib/utils/cn";

/**
 * The canonical section eyebrow — a small uppercase label, nothing else.
 * The hairline rule that used to precede it is gone on purpose: rule + caps +
 * wide tracking is the single most templated header pattern on the web, and it
 * was the loudest generic tell on the site. Tracking is 0.12em, not the old
 * 0.3em, which read as decoration rather than typography.
 *
 * Colours stay AA-correct: deep amber (brass-700) on the light sand surface,
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
        "text-[0.8125rem] font-medium uppercase tracking-eyebrow",
        tone === "dark" ? "text-brass-300" : "text-brass-700",
        className,
      )}
    >
      {children}
    </p>
  );
}
