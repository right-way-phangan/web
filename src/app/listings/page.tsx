import type { Metadata } from "next";
import { getPublicObjects } from "@/lib/data/objects";
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

  const all = await getPublicObjects();
  const options = deriveFilterOptions(all);
  const filtered = all.filter(makeFilterPredicate(filter));
  const sorted = applySort(filtered, filter.sort);
  const isAnyFilter = isFiltered(filter);
  const qRaw = sp.q;
  const q = (Array.isArray(qRaw) ? qRaw[0] : qRaw) ?? "";

  return (
    <section className="container-prose py-10 md:py-14">
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
          filtered={isAnyFilter}
          clearHref="/listings"
          briefMessage={summarizeForBrief(filter, q)}
        />
      ) : (
        <ListingsSplit objects={sorted} />
      )}

      <RecentlyViewed catalog={all} />
    </section>
  );
}
