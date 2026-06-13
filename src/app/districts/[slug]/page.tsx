import type { Metadata } from "next";
import { notFound } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import type { Route } from "next";
import { ArrowLeft, ArrowRight, Check } from "lucide-react";
import { DISTRICTS, getDistrictBySlug, districtHasHero } from "@/content/districts";
import { Button } from "@/components/ui/button";
import { ObjectCard } from "@/components/objects/object-card";
import { getPublicObjects, slimObjectForCard } from "@/lib/data/objects";
import { ItemListJsonLd } from "@/components/seo/item-list-json-ld";
import { getDistrictMarket } from "@/lib/data/rental-market";
import { DistrictMarketPanel } from "@/components/insights/district-market";
import { BreadcrumbJsonLd } from "@/components/seo/breadcrumb-json-ld";
import { getSiteUrl } from "@/lib/site-url";

interface Props {
  params: Promise<{ slug: string }>;
}

export const revalidate = 300;

export function generateStaticParams() {
  return DISTRICTS.map((d) => ({ slug: d.slug }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const d = getDistrictBySlug(slug);
  if (!d) return { title: "District not found" };
  return {
    title: d.title.split(" — ")[0],
    description: d.short,
    alternates: {
      canonical: `/districts/${d.slug}`,
      languages: { en: `/districts/${d.slug}`, ru: `/ru/districts/${d.slug}`, "x-default": `/districts/${d.slug}` },
    },
  };
}

export default async function DistrictPage({ params }: Props) {
  const { slug } = await params;
  const d = getDistrictBySlug(slug);
  if (!d) notFound();

  const listingsHref = `/listings?district=${encodeURIComponent(d.amoName)}` as Route;
  const [name, subtitle] = d.title.split(" — ");
  const siteUrl = getSiteUrl();

  // Live inventory in this district (photos-first ordering from getPublicObjects).
  const all = await getPublicObjects();
  const inDistrict = all.filter((o) => o.district === d.amoName);
  const preview = inDistrict.slice(0, 6).map(slimObjectForCard);

  // Rental-market panel data for this district (null if no Airbnb comps).
  const districtMarket = getDistrictMarket(d.amoName);

  // Other districts for the bottom strip
  const others = DISTRICTS.filter((x) => x.slug !== d.slug).slice(0, 3);

  return (
    <article>
      <ItemListJsonLd name={`Properties in ${name}, Koh Phangan — Right Way`} objects={inDistrict} />
      <BreadcrumbJsonLd
        crumbs={[
          { name: "Home", url: `${siteUrl}/` },
          { name: "Districts", url: `${siteUrl}/districts` },
          { name: name, url: `${siteUrl}/districts/${d.slug}` },
        ]}
      />
      <div className="container-prose pt-8">
        <Button asChild variant="ghost" size="sm">
          <Link href="/districts">
            <ArrowLeft className="h-4 w-4" />
            All districts
          </Link>
        </Button>
      </div>

      <header className="container-prose pt-6 md:pt-8">
        <div className="relative isolate overflow-hidden rounded-sm bg-forest-900">
          {districtHasHero(d.slug) ? (
            <Image
              src={`/images/districts/${d.slug}.jpg`}
              alt={`${name}, Koh Phangan`}
              fill
              priority
              sizes="(min-width: 1280px) 1216px, 100vw"
              className="object-cover"
            />
          ) : null}
          <div
            className="absolute inset-0 bg-gradient-to-t from-forest-900/92 via-forest-900/55 to-forest-900/25"
            aria-hidden
          />
          <div
            className="absolute inset-0 bg-gradient-to-r from-forest-900/75 via-forest-900/30 to-transparent"
            aria-hidden
          />
          <div className="relative z-10 flex min-h-[42vh] flex-col justify-end p-7 md:min-h-[48vh] md:p-12">
            <p className="text-xs font-medium uppercase tracking-[0.3em] text-brass-300">
              District
            </p>
            <h1 className="mt-3 max-w-3xl text-balance text-cream-50">{name}</h1>
            <p className="mt-3 max-w-2xl text-lg text-cream-100/85 md:text-xl">
              {subtitle}
            </p>
          </div>
        </div>
      </header>

      <section className="container-prose py-12 md:py-16">
        <div className="max-w-prose space-y-5 text-base leading-relaxed text-forest-500/85 md:text-lg">
          {d.paragraphs.map((p, i) => (
            <p key={i}>{p}</p>
          ))}
        </div>
      </section>

      <section className="container-prose pb-16 md:pb-20">
        <div className="grid gap-12 md:grid-cols-2 md:gap-16">
          <div>
            <p className="text-xs font-medium uppercase tracking-[0.2em] text-brass-500">
              Who buys here
            </p>
            <p className="mt-4 text-base leading-relaxed text-forest-500/85 md:text-lg">
              {d.audience}
            </p>
          </div>
          <div>
            <p className="text-xs font-medium uppercase tracking-[0.2em] text-brass-500">
              What to expect
            </p>
            <ul className="mt-4 space-y-2.5">
              {d.expect.map((item) => (
                <li
                  key={item}
                  className="flex items-start gap-2.5 text-base text-forest-500/85 md:text-lg"
                >
                  <Check className="h-4 w-4 mt-1 shrink-0 text-forest-500/50" />
                  <span>{item}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </section>

      {districtMarket ? <DistrictMarketPanel dm={districtMarket} /> : null}

      <section className="border-t border-forest-500/10 bg-cream-200/30">
        <div className="container-prose py-16 md:py-20">
          <div className="max-w-2xl">
            <h2 className="font-serif text-3xl text-forest-900 md:text-4xl">
              {inDistrict.length > 0
                ? `Available in ${name}.`
                : `See available listings in ${name}.`}
            </h2>
            <p className="mt-4 text-lg text-forest-500/70">
              {inDistrict.length > 0
                ? `${inDistrict.length} ${inDistrict.length === 1 ? "property" : "properties"} in this district right now — filtered live from the catalogue.`
                : "Our current inventory in this district, filtered live from the catalogue."}
            </p>
          </div>

          {preview.length > 0 ? (
            <div className="mt-10 grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {preview.map((object) => (
                <ObjectCard key={object.id} object={object} />
              ))}
            </div>
          ) : null}

          <div className="mt-10 flex flex-wrap gap-3">
            <Button asChild variant="primary" size="md">
              <Link href={listingsHref}>
                {inDistrict.length > preview.length
                  ? `See all ${inDistrict.length} ${name} listings`
                  : `See ${name} listings`}
                <ArrowRight className="h-4 w-4" />
              </Link>
            </Button>
            <Button asChild variant="outline" size="md">
              <Link href="/contact">Ask about off-market plots</Link>
            </Button>
          </div>
        </div>
      </section>

      <section className="container-prose py-16 md:py-24">
        <p className="text-xs font-medium uppercase tracking-[0.3em] text-brass-500">
          More districts
        </p>
        <div className="mt-8 grid gap-6 md:grid-cols-3">
          {others.map((o) => (
            <Link
              key={o.slug}
              href={`/districts/${o.slug}` as Route}
              className="group flex flex-col rounded-sm border border-forest-500/10 bg-cream-50 p-6 transition-colors hover:border-forest-500/30"
            >
              <h3 className="font-serif text-xl text-forest-900">
                {o.title.split(" — ")[0]}
              </h3>
              <p className="mt-2 text-sm leading-relaxed text-forest-500/70 line-clamp-3">
                {o.short}
              </p>
              <span className="mt-4 inline-flex items-center gap-1.5 text-xs font-medium text-forest-500 transition-colors group-hover:text-brass-500">
                Read
                <ArrowRight className="h-3 w-3" />
              </span>
            </Link>
          ))}
        </div>
      </section>
    </article>
  );
}
