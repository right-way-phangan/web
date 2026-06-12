import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { ObjectCard } from "@/components/objects/object-card";
import { getPublicObjects, slimObjectForCard } from "@/lib/data/objects";

/**
 * Homepage showcase — the six most photogenic active listings. getPublicObjects()
 * already sorts cover-photo + premium objects to the top, so we prefer ones with
 * a real photo and fall back to the head of the list if the catalog is thin.
 * Renders nothing when the catalog is empty (amoCRM down) so the page degrades.
 * Cards are slimmed to ObjectCard fields — full objects would put six galleries
 * and raw descriptions into the homepage RSC payload.
 */
export async function FeaturedListings() {
  const all = await getPublicObjects();
  if (all.length === 0) return null;

  const withPhotos = all.filter((o) => o.coverImage);
  const featured = (withPhotos.length >= 6 ? withPhotos : all)
    .slice(0, 6)
    .map(slimObjectForCard);

  return (
    <section className="container-prose py-24 md:py-32">
      <div className="flex flex-wrap items-end justify-between gap-6">
        <div>
          <p className="text-xs font-medium uppercase tracking-[0.3em] text-brass-500">
            Featured
          </p>
          <h2 className="mt-4 max-w-3xl text-balance">
            A few on the island right now.
          </h2>
          <p className="mt-6 max-w-xl text-lg text-forest-500/70">
            Hand-picked land and homes across Phangan&apos;s best districts.
          </p>
        </div>

        <Button asChild variant="outline" size="lg" className="hidden sm:inline-flex">
          <Link href="/listings">
            All {all.length} listings
            <ArrowRight className="h-4 w-4" />
          </Link>
        </Button>
      </div>

      <div className="mt-12 grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {featured.map((object) => (
          <ObjectCard key={object.id} object={object} />
        ))}
      </div>

      <div className="mt-12 sm:hidden">
        <Button asChild variant="primary" size="lg" className="w-full">
          <Link href="/listings">
            All {all.length} listings
            <ArrowRight className="h-4 w-4" />
          </Link>
        </Button>
      </div>
    </section>
  );
}
