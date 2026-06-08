"use client";

import Link from "next/link";
import type { Route } from "next";
import { Button } from "@/components/ui/button";
import { useLocale, localeHref } from "@/lib/i18n/use-locale";
import { getListingsDict } from "@/lib/i18n/dictionaries";

interface Props {
  filtered: boolean;
  clearHref: Route;
  /** Pre-filled brief message carried to /contact when a search finds nothing. */
  briefMessage?: string;
}

export function ListingsEmpty({ filtered, clearHref, briefMessage }: Props) {
  const locale = useLocale();
  const t = getListingsDict(locale);
  const contactBase = localeHref(locale, "/contact");
  const briefHref = (
    briefMessage ? `${contactBase}?brief=${encodeURIComponent(briefMessage)}` : contactBase
  ) as Route;

  if (filtered) {
    return (
      <div className="mt-12 rounded-sm border border-forest-500/10 bg-cream-200/40 p-12 text-center">
        <h2 className="font-serif text-2xl text-forest-500">{t.emptyFilteredTitle}</h2>
        <p className="mx-auto mt-3 max-w-md text-sm text-forest-500/70">{t.emptyFilteredText}</p>
        <div className="mt-8 flex flex-wrap justify-center gap-3">
          <Button asChild variant="outline" size="md">
            <Link href={clearHref}>{t.clearFilters}</Link>
          </Button>
          <Button asChild variant="primary" size="md">
            <Link href={briefHref}>{t.sendBrief}</Link>
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="mt-12 rounded-sm border border-forest-500/10 bg-cream-200/40 p-12 text-center">
      <h2 className="font-serif text-2xl text-forest-500">{t.emptyTitle}</h2>
      <p className="mx-auto mt-3 max-w-md text-sm text-forest-500/70">{t.emptyText}</p>
      <div className="mt-8">
        <Button asChild variant="primary" size="md">
          <Link href={contactBase as Route}>{t.sendBrief}</Link>
        </Button>
      </div>
    </div>
  );
}
