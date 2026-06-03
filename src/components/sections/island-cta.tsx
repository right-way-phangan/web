import Link from "next/link";
import Image from "next/image";
import { ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";

/**
 * Full-bleed closing band for the homepage — a Phangan scene with a final
 * call to action. Sits at the bottom of the page after the featured listings.
 */
export function IslandCta() {
  return (
    <section className="relative isolate overflow-hidden bg-forest-900">
      <Image
        src="/images/scenes/cove-portrait.jpg"
        alt="A quiet cove on Koh Phangan"
        fill
        sizes="100vw"
        className="object-cover object-center"
      />
      <div
        className="absolute inset-0 bg-gradient-to-r from-forest-900/90 via-forest-900/70 to-forest-900/40"
        aria-hidden
      />

      <div className="container-prose relative z-10 py-24 md:py-32">
        <p className="text-xs font-medium uppercase tracking-[0.3em] text-brass-300">
          Ready when you are
        </p>
        <h2 className="mt-4 max-w-2xl text-balance text-cream-50">
          Find your place on Phangan.
        </h2>
        <p className="mt-6 max-w-xl text-lg leading-relaxed text-cream-100/85">
          Tell us what matters — a sunset view, walking distance to the beach, a
          buildable plot in a quiet district — and we&rsquo;ll narrow the island
          down to the handful worth seeing.
        </p>

        <div className="mt-10 flex flex-col gap-3 sm:flex-row sm:gap-4">
          <Button asChild variant="primary" size="lg">
            <Link href="/listings">
              Browse listings
              <ArrowRight className="h-4 w-4" />
            </Link>
          </Button>
          <Button
            asChild
            variant="outline"
            size="lg"
            className="border-cream-100/40 text-cream-50 hover:border-cream-50 hover:bg-cream-50 hover:text-forest-900"
          >
            <Link href="/contact">Talk to us</Link>
          </Button>
        </div>
      </div>
    </section>
  );
}
