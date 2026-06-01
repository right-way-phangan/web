import Link from "next/link";
import { cn } from "@/lib/utils/cn";

export function Logo({ className, size = "md" }: { className?: string; size?: "sm" | "md" | "lg" }) {
  const sizes = {
    sm: "text-lg",
    md: "text-xl",
    lg: "text-2xl",
  };
  return (
    <Link
      href="/"
      className={cn(
        "group flex items-baseline gap-2 font-serif tracking-tight text-forest-500",
        sizes[size],
        className,
      )}
      aria-label="Right Way Phangan — home"
    >
      <span className="font-semibold">Right Way</span>
      <span className="text-xs uppercase tracking-[0.2em] text-forest-500/50 group-hover:text-brass-500 transition-colors">
        Phangan
      </span>
    </Link>
  );
}
