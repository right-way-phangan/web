import type { Metadata } from "next";
import Link from "next/link";
import { getPublicObjects } from "@/lib/data/objects";
import { ObjectCard } from "@/components/objects/object-card";
import { Button } from "@/components/ui/button";

export const metadata: Metadata = {
  title: "Listings",
  description:
    "Every active property on Koh Phangan: land, villas, and houses. Filter by district, type, and key features.",
};

// Revalidate page every 5 min (matches CATALOG_REVALIDATE_SECONDS in lib/data/objects.ts).
// Must be a literal here per Next.js segment config rules.
export const revalidate = 300;

export default async function ListingsPage() {
  const objects = await getPublicObjects();

  return (
    <section className="container-prose py-16 md:py-24">
      <p className="text-xs font-medium uppercase tracking-[0.3em] text-brass-500">
        Listings
      </p>
      <h1 className="mt-4 max-w-3xl text-balance">
        Every active property on Phangan.
      </h1>
      <p className="mt-6 max-w-xl text-lg text-forest-500/70">
        {objects.length > 0
          ? `${objects.length} ${objects.length === 1 ? "property" : "properties"} ready to view.`
          : "We're updating the catalog right now."}{" "}
        Filters and map view arrive next.
      </p>

      {objects.length === 0 ? <EmptyState /> : <ObjectsGrid objects={objects} />}
    </section>
  );
}

function ObjectsGrid({ objects }: { objects: Awaited<ReturnType<typeof getPublicObjects>> }) {
  return (
    <div className="mt-12 grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
      {objects.map((object) => (
        <ObjectCard key={object.id} object={object} />
      ))}
    </div>
  );
}

function EmptyState() {
  return (
    <div className="mt-12 rounded-sm border border-forest-500/10 bg-cream-200/40 p-12 text-center">
      <h2 className="font-serif text-2xl text-forest-500">
        Nothing to show right now.
      </h2>
      <p className="mx-auto mt-3 max-w-md text-sm text-forest-500/70">
        Our catalog refreshes every few minutes. If you're looking for
        something specific, message us and we'll send matches privately.
      </p>
      <div className="mt-8">
        <Button asChild variant="primary" size="md">
          <Link href="/contact">Send a brief</Link>
        </Button>
      </div>
    </div>
  );
}
