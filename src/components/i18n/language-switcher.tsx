"use client";

import Link from "next/link";
import type { Route } from "next";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import { Globe } from "lucide-react";
import { cn } from "@/lib/utils/cn";

// The RU tree mirrors EN under /ru with identical slugs (objects, projects,
// blog posts, districts), so locale switching is a prefix swap. Only routes
// listed here have no RU counterpart and fall back to the RU home.
const EN_ONLY = ["/due-diligence"];

export function LanguageSwitcher({
  className,
  tone = "default",
}: {
  className?: string;
  tone?: "default" | "light";
}) {
  const pathname = usePathname();
  const isRu = pathname === "/ru" || pathname.startsWith("/ru/");
  const light = tone === "light";

  // Carry query/hash (calculator deep-links, listing filters) across the
  // switch. Read from window instead of useSearchParams, which would demand a
  // Suspense boundary around the header on every page.
  const [suffix, setSuffix] = useState("");
  useEffect(() => {
    setSuffix(window.location.search + window.location.hash);
  }, [pathname]);

  const enPath = isRu ? pathname.slice("/ru".length) || "/" : pathname;
  const hasRu = !EN_ONLY.some((p) => enPath === p || enPath.startsWith(`${p}/`));
  const enHref = enPath + suffix;
  const ruHref = hasRu
    ? (enPath === "/" ? "/ru" : `/ru${enPath}`) + suffix
    : "/ru";

  return (
    <div
      className={cn(
        "inline-flex items-center gap-1 text-xs font-medium",
        light ? "text-panel-fg/70" : "text-forest-500/70",
        className,
      )}
    >
      <Globe
        className={cn("h-3.5 w-3.5", light ? "text-panel-fg/50" : "text-forest-500/50")}
        aria-hidden
      />
      <Link
        href={enHref as Route}
        aria-current={!isRu ? "page" : undefined}
        className={cn(
          "rounded-sm px-1.5 py-0.5 transition-colors",
          light ? "hover:text-brass-300" : "hover:text-brass-500",
          !isRu && (light ? "text-panel-fg" : "text-forest-500"),
        )}
      >
        EN
      </Link>
      <span aria-hidden className={light ? "text-panel-fg/30" : "text-forest-500/25"}>/</span>
      <Link
        href={ruHref as Route}
        aria-current={isRu ? "page" : undefined}
        className={cn(
          "rounded-sm px-1.5 py-0.5 transition-colors",
          light ? "hover:text-brass-300" : "hover:text-brass-500",
          isRu && (light ? "text-panel-fg" : "text-forest-500"),
        )}
      >
        RU
      </Link>
    </div>
  );
}
