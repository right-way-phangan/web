import Link from "next/link";
import type { Route } from "next";
import { ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { ObjectCard } from "@/components/objects/object-card";
import { Appear } from "@/components/motion/appear";
import { getPublicObjects, slimObjectForCard } from "@/lib/data/objects";
import { getHomeDict, type Locale } from "@/lib/i18n/dictionaries";
import { SectionEyebrow } from "@/components/sections/section-eyebrow";

/**
 * Homepage showcase — the six most photogenic active listings. getPublicObjects()
 * already sorts cover-photo + premium objects to the top, so we prefer ones with
 * a real photo and fall back to the head of the list if the catalog is thin.
 * Renders nothing when the catalog is empty (DB down) so the page degrades.
 * Cards are slimmed to ObjectCard fields. Dict-driven for EN/RU parity.
 */
export async function FeaturedListings({ locale = "en" }: { locale?: Locale }) {
  const dict = getHomeDict(locale).featured;
  const base = locale === "ru" ? "/ru" : "";
  const allHref = `${base}/listings` as Route;

  const all = await getPublicObjects();
  if (all.length === 0) return null;

  const allLabel =
    locale === "ru" ? `Все ${all.length} объектов` : `All ${all.length} listings`;

  const withPhotos = all.filter((o) => o.coverImage);
  const featured = (withPhotos.length >= 6 ? withPhotos : all)
    .slice(0, 6)
    .map(slimObjectForCard);

  return (
    <section className="container-prose py-14 md:py-20">
      <div className="flex flex-wrap items-end justify-between gap-6">
        <div>
          <SectionEyebrow>{dict.eyebrow}</SectionEyebrow>
          <h2 className="mt-5 max-w-3xl text-balance">{dict.title}</h2>
          <p className="mt-5 max-w-xl text-lg text-forest-600/70">{dict.lede}</p>
        </div>

        <Button asChild variant="outline" size="lg" className="hidden sm:inline-flex">
          <Link href={allHref}>
            {allLabel}
            <ArrowRight className="h-4 w-4" />
          </Link>
        </Button>
      </div>

      <div className="card-rail mt-14 sm:grid-cols-2 lg:grid-cols-3">
        {featured.map((object, i) => (
          <Appear key={object.id} delay={(i % 3) * 0.05} className="h-full">
            <ObjectCard object={object} />
          </Appear>
        ))}
      </div>

      <div className="mt-12 sm:hidden">
        <Button asChild variant="primary" size="lg" className="w-full">
          <Link href={allHref}>
            {allLabel}
            <ArrowRight className="h-4 w-4" />
          </Link>
        </Button>
      </div>
    </section>
  );
}
