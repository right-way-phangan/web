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
        light ? "text-panel-fg" : "text-forest-500",
        sizes[size],
        className,
      )}
    >
      <span className="whitespace-nowrap font-semibold">Right Way</span>
      {/* font-sans поверх серифного логотипа: капс 12px засечками теряет
          штрихи в рендере. Разрядка снижена с 0.2em — на гротеске столько
          не нужно, чтобы слово читалось как подпись к марке. */}
      <span
        className={cn(
          "font-sans text-[0.8125rem] uppercase tracking-[0.12em] transition-colors group-hover:text-brass-500",
          light ? "text-panel-fg/80 group-hover:text-brass-300" : "text-forest-500/80",
        )}
      >
        Phangan
      </span>
    </Link>
  );
}
