import Link from "next/link";
import Image from "next/image";
import { ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Appear } from "@/components/motion/appear";

/**
 * Closing call-to-action — a full-bleed coastal scene that bookends the dark
 * hero, so the page ends on the island itself instead of fading out through
 * a light panel into the light footer.
 */
export function IslandCta() {
  return (
    <section className="relative isolate overflow-hidden bg-panel">
      <Image
        src="/images/scenes/coast-aerial.jpg"
        alt="Aerial view of the Koh Phangan coastline"
        fill
        sizes="100vw"
        className="object-cover"
      />
      <div
        className="absolute inset-0 bg-gradient-to-t from-panel/90 via-panel/50 to-panel/30"
        aria-hidden
      />

      <Appear className="container-prose relative z-10 flex min-h-[55vh] flex-col items-center justify-center py-24 text-center md:min-h-[65vh] md:py-32">
        <p className="text-xs font-medium uppercase tracking-[0.3em] text-brass-300">
          Ready when you are
        </p>
        <h2 className="mt-4 max-w-2xl text-balance text-panel-fg">
          Find your place on Phangan.
        </h2>
        <p className="mt-6 max-w-xl text-lg leading-relaxed text-panel-fg/85">
          Tell us what matters — a sunset view, walking distance to the beach,
          a buildable plot in a quiet district — and we&rsquo;ll narrow the
          island down to the handful worth seeing.
        </p>

        <div className="mt-10 flex w-full max-w-sm flex-col gap-3 sm:w-auto sm:max-w-none sm:flex-row sm:gap-4">
          <Button asChild variant="accent" size="lg">
            <Link href="/listings">
              Browse listings
              <ArrowRight className="h-4 w-4" />
            </Link>
          </Button>
          <Button
            asChild
            variant="outline"
            size="lg"
            className="border-panel-fg/40 text-panel-fg hover:border-panel-fg hover:bg-cream-50 hover:text-forest-900"
          >
            <Link href="/contact">Talk to us</Link>
          </Button>
        </div>
      </Appear>
    </section>
  );
}
