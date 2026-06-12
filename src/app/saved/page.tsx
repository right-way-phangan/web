import type { Metadata } from "next";
import { Suspense } from "react";
import { getPublicObjects } from "@/lib/data/objects";
import { SavedListings } from "@/components/objects/saved-listings";
import { SavedSearches } from "@/components/objects/saved-searches";

export const metadata: Metadata = {
  title: "Saved",
  description: "Your shortlist of Koh Phangan properties — compare them side by side and send the whole list to Right Way in one go.",
  robots: { index: false, follow: true },
};

export const revalidate = 300;

export default async function SavedPage() {
  // The saved set lives in the browser; we hand the full catalog to the client
  // component, which filters it to the visitor's shortlist.
  const catalog = await getPublicObjects();

  return (
    <section className="container-prose py-16 md:py-24">
      <p className="text-xs font-medium uppercase tracking-[0.3em] text-brass-500">
        Shortlist
      </p>
      <h1 className="mt-4 max-w-3xl text-balance">Your saved properties.</h1>
      <p className="mt-6 max-w-xl text-lg text-forest-500/70">
        Everything you&rsquo;ve hearted, in one place. Compare the details, then
        send us the shortlist and we&rsquo;ll take it from there.
      </p>

      {/* Suspense: SavedListings reads ?rw= (shared shortlists) via useSearchParams */}
      <Suspense
        fallback={
          <div className="mt-12 h-40 animate-pulse rounded-sm border border-forest-500/10 bg-forest-500/5" />
        }
      >
        <SavedListings catalog={catalog} />
      </Suspense>
      <SavedSearches />
    </section>
  );
}
