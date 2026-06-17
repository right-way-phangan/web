import type { Metadata } from "next";
import { getPublicObjects, slimObjectForList } from "@/lib/data/objects";
import { ItemListJsonLd } from "@/components/seo/item-list-json-ld";
import { isProjectUnit } from "@/lib/data/projects";
import { ListingsFilterBar } from "@/components/objects/listings-filter-bar";
import { ListingsEmpty } from "@/components/objects/listings-empty";
import { ListingsSplit } from "@/components/objects/listings-split";
import { NlSearch } from "@/components/objects/nl-search";
import { RecentlyViewed } from "@/components/objects/recently-viewed";
import {
  parseListingsSearchParams,
  makeFilterPredicate,
  applySort,
  deriveFilterOptions,
  isFiltered,
  summarizeForBrief,
} from "@/lib/filters/listings";

export const metadata: Metadata = {
  alternates: { canonical: "/listings", languages: { en: "/listings", ru: "/ru/listings", "x-default": "/listings" } },
  title: "Listings",
  description:
    "Every active property on Koh Phangan: land, villas, and houses. Filter by district, type, and key features.",
};

export const revalidate = 300;

interface PageProps {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}

export default async function ListingsPage({ searchParams }: PageProps) {
  const sp = await searchParams;
  const filter = parseListingsSearchParams(sp);

  // Developer projects (off-plan, RW-P) and their per-unit cards (RW-P####-N)
  // have their own section at /projects — keep both out of the listings grid.
  // Slim once at the source so sorted/filtered share the same instances —
  // mapping per-prop would break reference sharing and double the RSC payload.
  const all = (await getPublicObjects())
    .filter((o) => o.type !== "Project" && !isProjectUnit(o.rwNumber))
    .map(slimObjectForList);
  const options = deriveFilterOptions(all);
  const filtered = all.filter(makeFilterPredicate(filter));
  const sorted = applySort(filtered, filter.sort, filter.mode);
  const isAnyFilter = isFiltered(filter);
  const qRaw = sp.q;
  const q = (Array.isArray(qRaw) ? qRaw[0] : qRaw) ?? "";

  return (
    <section className="container-prose py-10 md:py-14">
      {/* Map tiles (CARTO) load as soon as the split map mounts — warm the
          connection up front to shave the handshake (Lighthouse flagged it). */}
      <link rel="preconnect" href="https://a.basemaps.cartocdn.com" crossOrigin="" />
      <link rel="dns-prefetch" href="https://b.basemaps.cartocdn.com" />
      <ItemListJsonLd name="Koh Phangan property listings — Right Way" objects={sorted} />
      <p className="text-xs font-medium uppercase tracking-[0.3em] text-brass-500">
        Listings
      </p>
      <h1 className="mt-3 max-w-3xl text-balance scroll-mt-24">
        Every active property on Phangan.
      </h1>
      <p className="mt-3 max-w-xl text-base text-forest-500/70">
        {isAnyFilter
          ? `${sorted.length} ${sorted.length === 1 ? "match" : "matches"} from ${all.length} total listings.`
          : `${all.length} ${all.length === 1 ? "property" : "properties"} ready to view.`}
      </p>

      <div className="mt-5">
        <NlSearch initialQuery={q} />
      </div>

      <ListingsFilterBar
        current={filter}
        options={options}
        totalCount={sorted.length}
      />

      {sorted.length === 0 ? (
        <ListingsEmpty
          // Rent has no inventory yet — treat an empty Rent view as "filtered"
          // so visitors get the "send a brief" prompt, not "catalogue refreshing".
          filtered={isAnyFilter || filter.mode === "rent"}
          clearHref="/listings"
          briefMessage={summarizeForBrief(filter, q)}
        />
      ) : (
        <ListingsSplit objects={sorted} mode={filter.mode} />
      )}

      <RecentlyViewed catalog={all} />
    </section>
  );
}
