"use client";

import Link from "next/link";
import type { Route } from "next";
import { usePathname } from "next/navigation";
import { Globe } from "lucide-react";
import { cn } from "@/lib/utils/cn";

/**
 * Compact EN/RU switch. Russian currently has a localized home at /ru; other
 * routes fall back to EN, so the switch points at the home of the other locale
 * rather than a per-page mapping (which arrives as routes are ported).
 */
export function LanguageSwitcher({ className }: { className?: string }) {
  const pathname = usePathname();
  const isRu = pathname === "/ru" || pathname.startsWith("/ru/");

  return (
    <div
      className={cn(
        "inline-flex items-center gap-1 text-xs font-medium text-forest-500/70",
        className,
      )}
    >
      <Globe className="h-3.5 w-3.5 text-forest-500/50" aria-hidden />
      <Link
        href={"/" as Route}
        aria-current={!isRu ? "page" : undefined}
        className={cn(
          "rounded-sm px-1.5 py-0.5 transition-colors hover:text-brass-500",
          !isRu && "text-forest-500",
        )}
      >
        EN
      </Link>
      <span aria-hidden className="text-forest-500/25">/</span>
      <Link
        href={"/ru" as Route}
        aria-current={isRu ? "page" : undefined}
        className={cn(
          "rounded-sm px-1.5 py-0.5 transition-colors hover:text-brass-500",
          isRu && "text-forest-500",
        )}
      >
        RU
      </Link>
    </div>
  );
}
