import Link from "next/link";
import Image from "next/image";
import { ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";

/**
 * Closing call-to-action for the homepage. Deliberately a *light*, contained
 * panel with a framed image accent — the page already opens on a full-bleed
 * dark hero, so repeating that composition here would feel like an echo. The
 * cream band gives the eye a rest before the footer.
 */
export function IslandCta() {
  return (
    <section className="container-prose py-24 md:py-32">
      <div className="overflow-hidden rounded-2xl border border-forest-500/10 bg-cream-200/60">
        <div className="grid items-center gap-10 p-8 md:grid-cols-2 md:gap-14 md:p-14">
          <div>
            <p className="text-xs font-medium uppercase tracking-[0.3em] text-brass-500">
              Ready when you are
            </p>
            <h2 className="mt-4 max-w-md text-balance text-forest-900">
              Find your place on Phangan.
            </h2>
            <p className="mt-6 max-w-md text-lg leading-relaxed text-forest-500/70">
              Tell us what matters — a sunset view, walking distance to the
              beach, a buildable plot in a quiet district — and we&rsquo;ll
              narrow the island down to the handful worth seeing.
            </p>

            <div className="mt-10 flex flex-col gap-3 sm:flex-row sm:gap-4">
              <Button asChild variant="primary" size="lg">
                <Link href="/listings">
                  Browse listings
                  <ArrowRight className="h-4 w-4" />
                </Link>
              </Button>
              <Button asChild variant="outline" size="lg">
                <Link href="/contact">Talk to us</Link>
              </Button>
            </div>
          </div>

          {/* Framed scene — an accent, not a backdrop. Hidden on the narrowest
              screens where the text alone carries the band. */}
          <div className="relative hidden aspect-[4/3] overflow-hidden rounded-xl ring-1 ring-forest-500/10 sm:block">
            <Image
              src="/images/scenes/cove-portrait.jpg"
              alt="A quiet cove on Koh Phangan"
              fill
              sizes="(min-width: 768px) 40vw, 90vw"
              className="object-cover object-center"
            />
          </div>
        </div>
      </div>
    </section>
  );
}
