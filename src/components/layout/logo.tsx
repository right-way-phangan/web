import Link from "next/link";
import { cn } from "@/lib/utils/cn";

export function Logo({
  className,
  size = "md",
  tone = "default",
}: {
  className?: string;
  size?: "sm" | "md" | "lg";
  tone?: "default" | "light";
}) {
  const sizes = {
    sm: "text-lg",
    md: "text-xl",
    lg: "text-2xl",
  };
  const light = tone === "light";
  return (
    <Link
      href="/"
      className={cn(
        "group flex items-baseline gap-2 font-serif tracking-tight transition-colors",
        light ? "text-cream-50" : "text-forest-500",
        sizes[size],
        className,
      )}
      aria-label="Right Way Phangan — home"
    >
      <span className="font-semibold">Right Way</span>
      <span
        className={cn(
          "text-xs uppercase tracking-[0.2em] transition-colors group-hover:text-brass-500",
          light ? "text-cream-100/60 group-hover:text-brass-300" : "text-forest-500/50",
        )}
      >
        Phangan
      </span>
    </Link>
  );
}
