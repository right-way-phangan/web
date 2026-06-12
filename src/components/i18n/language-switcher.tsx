"use client";

import Link from "next/link";
import type { Route } from "next";
import { usePathname } from "next/navigation";
import { Globe } from "lucide-react";
import { cn } from "@/lib/utils/cn";

// EN ↔ RU page pairs. Routes with a Russian version map across directly; anything
// else falls back to the other locale's home (RU listings/districts/etc. aren't
// ported yet — their content is EN-sourced).
const PAIRS: Record<string, string> = {
  "/": "/ru",
  "/about": "/ru/about",
  "/services": "/ru/services",
  "/process": "/ru/process",
  "/contact": "/ru/contact",
  "/listings": "/ru/listings",
  "/districts": "/ru/districts",
  "/calculator": "/ru/calculator",
  "/insights": "/ru/insights",
  "/saved": "/ru/saved",
  "/faq": "/ru/faq",
  "/knowledge": "/ru/knowledge",
  "/blog": "/ru/blog",
};
const EN_OF = Object.fromEntries(Object.entries(PAIRS).map(([en, ru]) => [ru, en]));

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

  // Target hrefs that keep the visitor on the equivalent page where one exists.
  const enHref = isRu ? (EN_OF[pathname] ?? "/") : pathname;
  const ruHref = isRu ? pathname : (PAIRS[pathname] ?? "/ru");

  return (
    <div
      className={cn(
        "inline-flex items-center gap-1 text-xs font-medium",
        light ? "text-cream-100/70" : "text-forest-500/70",
        className,
      )}
    >
      <Globe
        className={cn("h-3.5 w-3.5", light ? "text-cream-100/50" : "text-forest-500/50")}
        aria-hidden
      />
      <Link
        href={enHref as Route}
        aria-current={!isRu ? "page" : undefined}
        className={cn(
          "rounded-sm px-1.5 py-0.5 transition-colors",
          light ? "hover:text-brass-300" : "hover:text-brass-500",
          !isRu && (light ? "text-cream-50" : "text-forest-500"),
        )}
      >
        EN
      </Link>
      <span aria-hidden className={light ? "text-cream-100/30" : "text-forest-500/25"}>/</span>
      <Link
        href={ruHref as Route}
        aria-current={isRu ? "page" : undefined}
        className={cn(
          "rounded-sm px-1.5 py-0.5 transition-colors",
          light ? "hover:text-brass-300" : "hover:text-brass-500",
          isRu && (light ? "text-cream-50" : "text-forest-500"),
        )}
      >
        RU
      </Link>
    </div>
  );
}
