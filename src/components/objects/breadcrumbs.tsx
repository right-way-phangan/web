"use client";

import Link from "next/link";
import type { Route } from "next";
import { useRouter } from "next/navigation";
import { ChevronRight } from "lucide-react";
import { useLocale } from "@/lib/i18n/use-locale";
import { getObjectDict } from "@/lib/i18n/dictionaries";

interface Props {
  /** Middle crumb — the collection this object belongs to. */
  trailHref: string;
  trailLabel: string;
  current: string;
}

/**
 * Visible breadcrumb trail for object pages (the JSON-LD twin lives in
 * seo/breadcrumb-json-ld.tsx). The middle crumb prefers history.back() so an
 * in-tab return to /listings keeps NL-search / filters from the query string;
 * in a fresh tab it falls back to a plain link.
 */
export function Breadcrumbs({ trailHref, trailLabel, current }: Props) {
  const router = useRouter();
  const locale = useLocale();
  const t = getObjectDict(locale);
  const homeHref = (locale === "ru" ? "/ru" : "/") as Route;

  const onTrailClick = (e: React.MouseEvent) => {
    if (
      window.history.length > 1 &&
      document.referrer.startsWith(window.location.origin)
    ) {
      e.preventDefault();
      router.back();
    }
  };

  return (
    <nav aria-label="Breadcrumb" className="mb-6 print:hidden">
      <ol className="flex flex-wrap items-center gap-1.5 text-sm text-forest-500/70">
        <li>
          <Link href={homeHref} className="inline-block -my-1.5 py-1.5 transition-colors hover:text-brass-500">
            {t.bcHome}
          </Link>
        </li>
        <li aria-hidden>
          <ChevronRight className="h-3.5 w-3.5 text-forest-500/40" />
        </li>
        <li>
          <Link
            href={trailHref as Route}
            onClick={onTrailClick}
            className="inline-block -my-1.5 py-1.5 transition-colors hover:text-brass-500"
          >
            {trailLabel}
          </Link>
        </li>
        <li aria-hidden>
          <ChevronRight className="h-3.5 w-3.5 text-forest-500/40" />
        </li>
        <li aria-current="page" className="font-medium text-forest-900">
          {current}
        </li>
      </ol>
    </nav>
  );
}
