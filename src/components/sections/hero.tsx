import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";

export function Hero() {
  return (
    <section
      aria-label="Hero"
      className="relative isolate overflow-hidden bg-cream-100"
    >
      <TopographyBackdrop />

      <div className="container-prose relative z-10 flex min-h-[80vh] flex-col justify-center py-24 md:min-h-[88vh] md:py-32">
        <p className="text-xs font-medium uppercase tracking-[0.3em] text-brass-500">
          Koh Phangan · Thailand
        </p>

        <h1 className="mt-6 max-w-4xl text-balance text-5xl leading-[1.05] md:text-7xl md:leading-[1.02]">
          Land, villas, and homes —{" "}
          <span className="italic text-forest-500/70">curated</span> on
          Phangan.
        </h1>

        <p className="mt-8 max-w-xl text-lg leading-relaxed text-forest-500/75 md:text-xl">
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
          <Button asChild variant="outline" size="lg">
            <Link href="/process">How we work</Link>
          </Button>
        </div>
      </div>

      <div className="pointer-events-none absolute inset-x-0 bottom-0 h-32 bg-gradient-to-b from-transparent to-cream-100" />
    </section>
  );
}

/**
 * Subtle topographic-line backdrop — evokes elevation maps without a real photo.
 * Replace later with a hero photo / drone footage when assets are ready.
 */
function TopographyBackdrop() {
  return (
    <svg
      className="pointer-events-none absolute inset-0 h-full w-full text-forest-500/[0.06]"
      aria-hidden="true"
      preserveAspectRatio="none"
      viewBox="0 0 1200 800"
      xmlns="http://www.w3.org/2000/svg"
    >
      <defs>
        <radialGradient id="hero-glow" cx="80%" cy="20%" r="60%">
          <stop offset="0%" stopColor="#B5651D" stopOpacity="0.08" />
          <stop offset="100%" stopColor="#B5651D" stopOpacity="0" />
        </radialGradient>
      </defs>
      <rect width="1200" height="800" fill="url(#hero-glow)" />
      <g fill="none" stroke="currentColor" strokeWidth="1">
        <path d="M -50 600 Q 300 540 600 600 T 1250 600" />
        <path d="M -50 560 Q 300 480 600 560 T 1250 560" />
        <path d="M -50 520 Q 300 420 600 520 T 1250 520" />
        <path d="M -50 480 Q 300 360 600 480 T 1250 480" />
        <path d="M -50 440 Q 300 300 600 440 T 1250 440" />
        <path d="M -50 400 Q 300 240 600 400 T 1250 400" />
        <path d="M -50 360 Q 300 180 600 360 T 1250 360" />
        <path d="M -50 320 Q 300 140 600 320 T 1250 320" />
        <path d="M -50 280 Q 300 120 600 280 T 1250 280" />
        <path d="M -50 240 Q 300 100 600 240 T 1250 240" />
      </g>
    </svg>
  );
}
