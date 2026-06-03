import Link from "next/link";
import Image from "next/image";
import { ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";

export function Hero() {
  return (
    <section
      aria-label="Hero"
      className="relative isolate overflow-hidden bg-forest-900"
    >
      {/* Aerial of a Phangan beachfront plot (RW-0516 original, unwatermarked) */}
      <Image
        src="/hero-phangan.jpg"
        alt="Aerial view of a beachfront on Koh Phangan"
        fill
        priority
        sizes="100vw"
        className="object-cover"
      />
      {/* Scrim for text legibility + fade into the cream section below */}
      <div
        className="absolute inset-0 bg-gradient-to-tr from-forest-900/85 via-forest-900/55 to-forest-900/25"
        aria-hidden
      />
      <div
        className="pointer-events-none absolute inset-x-0 bottom-0 h-32 bg-gradient-to-b from-transparent to-cream-100"
        aria-hidden
      />

      <div className="container-prose relative z-10 flex min-h-[80vh] flex-col justify-center py-24 md:min-h-[88vh] md:py-32">
        <p className="text-xs font-medium uppercase tracking-[0.3em] text-brass-300">
          Koh Phangan · Thailand
        </p>

        <h1 className="mt-6 max-w-4xl text-balance text-5xl leading-[1.05] text-cream-50 md:text-7xl md:leading-[1.02]">
          Land, villas, and homes —{" "}
          <span className="italic text-cream-100/80">curated</span> on Phangan.
        </h1>

        <p className="mt-8 max-w-xl text-lg leading-relaxed text-cream-100/85 md:text-xl">
          A boutique agency for international buyers. Verified listings,
          transparent process, AI-assisted search across every district on the
          island.
        </p>

        <div className="mt-12 flex flex-col gap-3 sm:flex-row sm:gap-4">
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
            <Link href="/process">How we work</Link>
          </Button>
        </div>
      </div>
    </section>
  );
}
