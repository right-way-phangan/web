import type { Metadata } from "next";
import Link from "next/link";
import Image from "next/image";
import type { Route } from "next";
import { ArrowRight } from "lucide-react";
import { PageHero } from "@/components/sections/page-hero";
import { DISTRICTS, DISTRICT_COORDS, districtHasHero } from "@/content/districts";
import { DistrictsMap } from "@/components/districts/districts-map";
import type { DistrictPoint } from "@/components/districts/districts-map-leaflet";
import { getPublicObjects } from "@/lib/data/objects";

export const metadata: Metadata = {
  alternates: { canonical: "/districts", languages: { en: "/districts", ru: "/ru/districts" } },
  title: "Districts",
  description:
    "Every district of Koh Phangan, mapped by Right Way — each with its own character, price profile, and buyer match, from the wellness west coast to the quiet inland hills.",
};

export const revalidate = 300;

/**
 * Build map markers per district: live-catalog centroid + listing count when we
 * have mapped objects there, otherwise the hardcoded fallback centre.
 */
async function buildDistrictPoints(): Promise<DistrictPoint[]> {
  const objects = await getPublicObjects();
  const points = DISTRICTS.map((d) => {
    const mine = objects.filter(
      (o) => o.district === d.amoName && o.lat != null && o.lng != null,
    );
    const fallback = DISTRICT_COORDS[d.slug];
    const lat = mine.length
      ? mine.reduce((s, o) => s + o.lat!, 0) / mine.length
      : fallback?.lat;
    const lng = mine.length
      ? mine.reduce((s, o) => s + o.lng!, 0) / mine.length
      : fallback?.lng;
    const count = objects.filter((o) => o.district === d.amoName).length;
    if (lat == null || lng == null) return null;
    const [name] = d.title.split(" — ");
    return { slug: d.slug, amoName: d.amoName, name, lat, lng, count };
  }).filter((p): p is DistrictPoint => p !== null);

  // Real coordinates — nearby districts are grouped by the map's clustering
  // (react-leaflet-cluster) and split apart on zoom-in.
  return points;
}

export default async function DistrictsPage() {
  const districtPoints = await buildDistrictPoints();

  return (
    <>
      <PageHero
        eyebrow="Districts"
        title="Where we work — across all of Koh Phangan."
        lede="We cover the whole island. Each district has its own character, price profile, and buyer match — from the wellness west coast to the upscale east, the working north, and the quiet inland hills. This is where our network, data, and on-the-ground experience turn local knowledge into the right shortlist for you."
      />

      <section className="container-prose pt-12 md:pt-16">
        <p className="mb-6 text-sm text-forest-500/70">
          Tap a district on the map to jump straight to its live listings.
        </p>
        <DistrictsMap points={districtPoints} />
      </section>

      <section className="container-prose py-16 md:py-24">
        <div className="grid gap-6 md:grid-cols-2 md:gap-8">
          {DISTRICTS.map((d) => {
            const [name, subtitle] = d.title.split(" — ");
            return (
              <Link
                key={d.slug}
                href={`/districts/${d.slug}` as Route}
                className="group flex flex-col overflow-hidden rounded-sm border border-forest-500/10 bg-cream-50 transition-all hover:border-forest-500/30 hover:shadow-lg"
              >
                <div className="relative aspect-[16/9] overflow-hidden bg-forest-900">
                  {districtHasHero(d.slug) ? (
                    <Image
                      src={`/images/districts/${d.slug}.jpg`}
                      alt={`${name}, Koh Phangan`}
                      fill
                      sizes="(min-width: 768px) 50vw, 100vw"
                      className="object-cover transition-transform duration-700 group-hover:scale-105"
                    />
                  ) : null}
                  <div
                    className="absolute inset-0 bg-gradient-to-t from-forest-900/80 via-forest-900/10 to-transparent"
                    aria-hidden
                  />
                  <div className="absolute inset-x-0 bottom-0 p-5 md:p-6">
                    <h2 className="font-serif text-2xl text-cream-50 md:text-3xl">
                      {name}
                    </h2>
                    <p className="mt-0.5 text-sm text-cream-100/85">{subtitle}</p>
                  </div>
                </div>
                <div className="flex flex-1 flex-col gap-3 p-6 md:p-8">
                  <p className="text-sm leading-relaxed text-forest-500/85 md:text-base">
                    {d.short}
                  </p>
                  <span className="mt-auto inline-flex items-center gap-1.5 pt-2 text-sm font-medium text-forest-500 transition-colors group-hover:text-brass-500">
                    Read more
                    <ArrowRight className="h-3.5 w-3.5" />
                  </span>
                </div>
              </Link>
            );
          })}
        </div>
      </section>

      <section className="border-t border-forest-500/10 bg-cream-200/30">
        <div className="container-prose py-16 md:py-20">
          <div className="max-w-2xl">
            <h2 className="font-serif text-3xl text-forest-900 md:text-4xl">
              Not sure which district fits?
            </h2>
            <p className="mt-4 text-lg text-forest-500/70">
              A short discovery call usually narrows it down faster than
              reading through every district page. Tell us what matters most — quiet,
              community, beach access, infrastructure, build potential — and
              we&rsquo;ll point you to one or two districts to explore first.
            </p>
            <div className="mt-8 flex flex-wrap gap-3">
              <Link
                href="/contact"
                className="inline-flex items-center gap-2 rounded-sm bg-forest-500 px-6 py-3 text-sm font-medium text-cream-100 transition-colors hover:bg-forest-400"
              >
                Book a discovery call
                <ArrowRight className="h-4 w-4" />
              </Link>
            </div>
          </div>
        </div>
      </section>
    </>
  );
}
