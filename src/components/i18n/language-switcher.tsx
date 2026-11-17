"use client";

import Link from "next/link";
import type { Route } from "next";
import { Fragment, useEffect, useState } from "react";
import { Globe } from "lucide-react";
import { useAppPathname } from "@/lib/hooks/use-app-pathname";
import { cn } from "@/lib/utils/cn";
import { LOCALES } from "@/lib/i18n/dictionaries";
import { localeFromPath, localePath, stripLocale } from "@/lib/i18n/locale-path";

// The RU and TH trees mirror EN under /ru and /th with identical slugs (objects,
// projects, blog posts, districts), so locale switching is a prefix swap. Only
// routes listed here have no mirror and fall back to the locale home.
const EN_ONLY = ["/due-diligence"];

export function LanguageSwitcher({
  className,
  tone = "default",
}: {
  className?: string;
  tone?: "default" | "light";
}) {
  const pathname = useAppPathname();
  const current = localeFromPath(pathname);
  const light = tone === "light";

  // Carry query/hash (calculator deep-links, listing filters) across the
  // switch. Read from window instead of useSearchParams, which would demand a
  // Suspense boundary around the header on every page.
  const [suffix, setSuffix] = useState("");
  useEffect(() => {
    setSuffix(window.location.search + window.location.hash);
  }, [pathname]);

  const enPath = stripLocale(pathname);
  const hasMirror = !EN_ONLY.some((p) => enPath === p || enPath.startsWith(`${p}/`));

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
      {LOCALES.map((l, i) => {
        const active = l === current;
        const href =
          l === "en" || hasMirror ? localePath(l, enPath) + suffix : localePath(l, "/");
        return (
          <Fragment key={l}>
            {i > 0 && (
              <span aria-hidden className={light ? "text-panel-fg/30" : "text-forest-500/25"}>/</span>
            )}
            <Link
              href={href as Route}
              hrefLang={l}
              aria-current={active ? "page" : undefined}
              className={cn(
                // Надпись остаётся мелкой, но нажимается по площади 44px: невидимый
                // псевдоэлемент расширяет цель, не трогая вёрстку строки.
                "relative rounded-sm px-1.5 py-0.5 transition-colors before:absolute before:-inset-x-1.5 before:-inset-y-[0.6875rem] before:content-['']",
                light ? "hover:text-brass-300" : "hover:text-brass-500",
                active && (light ? "text-panel-fg" : "text-forest-500"),
              )}
            >
              {l.toUpperCase()}
            </Link>
          </Fragment>
        );
      })}
    </div>
  );
}
