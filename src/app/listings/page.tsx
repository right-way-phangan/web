import type { Metadata } from "next";
import { getPublicObjects } from "@/lib/data/objects";
import { ObjectCard } from "@/components/objects/object-card";
import { ListingsFilterBar } from "@/components/objects/listings-filter-bar";
import { ListingsEmpty } from "@/components/objects/listings-empty";
import {
  parseListingsSearchParams,
  makeFilterPredicate,
  applySort,
  deriveFilterOptions,
  isFiltered,
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

  return (
    <section className="container-prose py-16 md:py-24">
      <p className="text-xs font-medium uppercase tracking-[0.3em] text-brass-500">
        Listings
      </p>
      <h1 className="mt-4 max-w-3xl text-balance">
        Every active property on Phangan.
      </h1>
      <p className="mt-6 max-w-xl text-lg text-forest-500/70">
        {isAnyFilter
          ? `${sorted.length} ${sorted.length === 1 ? "match" : "matches"} from ${all.length} total listings.`
          : `${all.length} ${all.length === 1 ? "property" : "properties"} ready to view.`}{" "}
        Map view arrives next.
      </p>

      <ListingsFilterBar
        current={filter}
        options={options}
        totalCount={sorted.length}
      />

      {sorted.length === 0 ? (
        <ListingsEmpty filtered={isAnyFilter} clearHref="/listings" />
      ) : (
        <div className="mt-8 grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {sorted.map((object) => (
            <ObjectCard key={object.id} object={object} />
          ))}
        </div>
      )}
    </section>
  );
}
