import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Magnetic } from "@/components/motion/magnetic";
import { HeroBackground } from "./hero-background";

export function Hero() {
  return (
    <section
      aria-label="Hero"
      className="relative isolate overflow-hidden bg-panel"
    >
      {/* Crossfading Phangan scenes (self-refreshing from our catalog), with the
          aerial of RW-0516 as the static LCP fallback underneath. */}
      <HeroBackground
        fallbackSrc="/hero-phangan.jpg"
        fallbackAlt="Aerial view of a beachfront on Koh Phangan"
      />

      {/* Scrim for text legibility + fade into the cream section below */}
      <div
        className="absolute inset-0 bg-gradient-to-tr from-panel/85 via-panel/55 to-panel/25"
        aria-hidden
      />
      <div
        className="pointer-events-none absolute inset-x-0 bottom-0 h-32 bg-gradient-to-b from-transparent to-cream-100"
        aria-hidden
      />
      {/* Плёночная зернистость поверх сцены */}
      <div className="grain-overlay" aria-hidden />

      <div className="container-prose relative z-10 flex min-h-[80vh] flex-col justify-center py-24 md:min-h-[88vh] md:py-32">
        {/* Каскадный entrance первого экрана — чистый CSS (.rise-in) со
            ступенчатой задержкой. Работает и без JS, ничего не прячет от
            краулеров/AT (текст в разметке, анимация лишь поверх), под
            reduced-motion гаснет. LCP — это фоновое фото (priority), не текст. */}
        <p className="rise-in text-xs font-medium uppercase tracking-[0.3em] text-brass-300">
          Koh Phangan · Thailand
        </p>

        <h1
          className="rise-in mt-6 max-w-4xl text-balance text-5xl leading-[1.05] text-panel-fg md:text-7xl md:leading-[1.02]"
          style={{ animationDelay: "0.1s" }}
        >
          Land, villas, and homes —{" "}
          <span className="italic text-panel-fg/80">curated</span> on Phangan.
        </h1>

        <p
          className="rise-in mt-8 max-w-xl text-lg leading-relaxed text-panel-fg/85 md:text-xl"
          style={{ animationDelay: "0.2s" }}
        >
          Every property we list, we&apos;ve personally vetted — title, zoning,
          the real numbers. No 600-listing feeds, no fantasy 30% returns. One
          island, done properly.
        </p>

        <div
          className="rise-in mt-12 flex flex-col gap-3 sm:flex-row sm:gap-4"
          style={{ animationDelay: "0.3s" }}
        >
          <Magnetic>
            <Button asChild variant="primary" size="lg">
              <Link href="/listings">
                Browse listings
                <ArrowRight className="h-4 w-4" />
              </Link>
            </Button>
          </Magnetic>
          <Button
            asChild
            variant="outline"
            size="lg"
            className="border-panel-fg/40 text-panel-fg hover:border-panel-fg hover:bg-cream-50 hover:text-forest-900"
          >
            <Link href="/process">How we work</Link>
          </Button>
        </div>

        {/* Direct contact path off the hero — for a DM-first audience that
            arrives ready to talk, not browse. */}
        <p
          className="rise-in mt-5 text-sm text-panel-fg/75"
          style={{ animationDelay: "0.4s" }}
        >
          Already know what you&apos;re after?{" "}
          <Link
            href="/contact"
            className="font-medium text-brass-300 underline-offset-4 hover:underline"
          >
            Talk to us →
          </Link>
        </p>
      </div>
    </section>
  );
}
