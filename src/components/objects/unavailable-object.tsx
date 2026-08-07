import Link from "next/link";
import Image from "next/image";
import type { Route } from "next";
import { ArrowRight } from "lucide-react";
import type { RealEstateObject } from "@/types/object";
import { Button } from "@/components/ui/button";
import { RelatedListings } from "@/components/objects/related-listings";
import { getObjectDict, type Locale } from "@/lib/i18n/dictionaries";
import { BLUR_PLACEHOLDER } from "@/lib/utils/blur";

interface Props {
  /** Sanitized, gallery-less object (getAnyObjectByRwNumber). */
  object: RealEstateObject;
  catalog: RealEstateObject[];
  locale: Locale;
}

/**
 * Detail page body for a listing that is off the market (Sold/Reserved) or
 * temporarily hidden. Served with HTTP 200 so links shared in Telegram posts
 * and chats keep working — the visitor lands on the status plus live
 * alternatives instead of a dead 404. Indexing is off (page metadata).
 */
export function UnavailableObject({ object, catalog, locale }: Props) {
  const t = getObjectDict(locale);
  const badge =
    object.status === "Sold"
      ? t.unavail.sold
      : object.status === "Reserved"
        ? t.unavail.reserved
        : t.unavail.generic;
  const listingsHref = (locale === "ru" ? "/ru/listings" : "/listings") as Route;
  const contactHref = (locale === "ru" ? "/ru/contact" : "/contact") as Route;

  return (
    <article className="container-prose py-12 md:py-16">
      <div className="grid items-center gap-10 lg:grid-cols-[1fr_420px]">
        <div>
          <p className="inline-flex items-center rounded-sm bg-panel px-3 py-1 text-[0.8125rem] font-medium uppercase tracking-eyebrow text-panel-fg">
            {badge} · {object.rwNumber}
          </p>
          <h1 className="mt-5 max-w-2xl text-balance">{t.unavail.title}</h1>
          <p className="mt-3 text-lg text-forest-500/70">{object.titleEn}</p>
          <p className="mt-5 max-w-prose text-base leading-relaxed text-forest-500/85">
            {t.unavail.lede}
          </p>
          <div className="mt-8 flex flex-wrap gap-3">
            <Button asChild size="lg">
              <Link href={listingsHref}>
                {t.unavail.browse}
                <ArrowRight className="h-4 w-4" />
              </Link>
            </Button>
            <Button asChild variant="outline" size="lg">
              <Link href={contactHref}>{t.unavail.contact}</Link>
            </Button>
          </div>
        </div>

        {object.coverImage ? (
          <div className="relative hidden aspect-[4/3] overflow-hidden rounded-sm lg:block">
            <Image
              src={object.coverImage}
              alt={`${object.titleEn} (${object.rwNumber})`}
              fill
              sizes="420px"
              className="object-cover opacity-80 saturate-[0.85]"
              placeholder="blur"
              blurDataURL={BLUR_PLACEHOLDER}
            />
            <div className="absolute inset-0 bg-forest-900/20" aria-hidden />
          </div>
        ) : null}
      </div>

      <RelatedListings current={object} catalog={catalog} />
    </article>
  );
}
