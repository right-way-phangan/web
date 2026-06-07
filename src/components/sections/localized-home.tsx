import Link from "next/link";
import Image from "next/image";
import type { Route } from "next";
import { ArrowRight, MapPin, ShieldCheck, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import { FeaturedListings } from "@/components/sections/featured-listings";
import type { HomeDict, Locale } from "@/lib/i18n/dictionaries";

const VALUE_ICONS = [MapPin, ShieldCheck, Sparkles] as const;

/**
 * Dictionary-driven home page, shared by the EN root (`/`) and RU (`/ru`).
 * Listing cards stay in their source language (amoCRM) for now; the marketing
 * chrome localizes. Keeping one component avoids the markup drift you'd get from
 * a parallel RU copy.
 */
export function LocalizedHome({ dict, locale }: { dict: HomeDict; locale: Locale }) {
  // Render the single optional <em> in the hero title without a markdown parser.
  const [titleBefore, titleEm, titleAfter] = splitEm(dict.hero.titleHtml);
  const browseHref = "/listings" as Route;
  const processHref = "/process" as Route;
  const contactHref = "/contact" as Route;

  return (
    <>
      {dict.inProgress ? (
        <p className="bg-forest-900 px-6 py-2 text-center text-xs text-cream-100/80">
          {dict.inProgress}
        </p>
      ) : null}

      {/* Hero */}
      <section aria-label="Hero" className="relative isolate overflow-hidden bg-forest-900">
        <Image
          src="/hero-phangan.jpg"
          alt="Aerial view of a beachfront on Koh Phangan"
          fill
          priority
          sizes="100vw"
          className="object-cover"
        />
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
            {dict.hero.eyebrow}
          </p>
          <h1 className="mt-6 max-w-4xl text-balance text-5xl leading-[1.05] text-cream-50 md:text-7xl md:leading-[1.02]">
            {titleBefore}
            {titleEm ? <span className="italic text-cream-100/80">{titleEm}</span> : null}
            {titleAfter}
          </h1>
          <p className="mt-8 max-w-xl text-lg leading-relaxed text-cream-100/85 md:text-xl">
            {dict.hero.lede}
          </p>
          <div className="mt-12 flex flex-col gap-3 sm:flex-row sm:gap-4">
            <Button asChild variant="primary" size="lg">
              <Link href={browseHref}>
                {dict.hero.ctaBrowse}
                <ArrowRight className="h-4 w-4" />
              </Link>
            </Button>
            <Button
              asChild
              variant="outline"
              size="lg"
              className="border-cream-100/40 text-cream-50 hover:border-cream-50 hover:bg-cream-50 hover:text-forest-900"
            >
              <Link href={processHref}>{dict.hero.ctaProcess}</Link>
            </Button>
          </div>
        </div>
      </section>

      {/* Values */}
      <section className="container-prose py-24 md:py-32">
        <p className="text-xs font-medium uppercase tracking-[0.3em] text-brass-500">
          {dict.values.eyebrow}
        </p>
        <h2 className="mt-4 max-w-3xl text-balance">{dict.values.title}</h2>
        <p className="mt-6 max-w-xl text-lg text-forest-500/70">{dict.values.lede}</p>
        <div className="mt-16 grid gap-12 md:grid-cols-3 md:gap-8">
          {dict.values.items.map((item, i) => {
            const Icon = VALUE_ICONS[i] ?? Sparkles;
            return (
              <div key={item.title} className="flex flex-col">
                <div className="flex h-12 w-12 items-center justify-center rounded-sm border border-forest-500/15 text-forest-500">
                  <Icon className="h-5 w-5" />
                </div>
                <h3 className="mt-6 font-serif text-2xl text-forest-900">{item.title}</h3>
                <p className="mt-3 text-base leading-relaxed text-forest-500/75">{item.text}</p>
              </div>
            );
          })}
        </div>
      </section>

      <FeaturedListings />

      {/* Closing CTA */}
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
            {dict.cta.eyebrow}
          </p>
          <h2 className="mt-4 max-w-2xl text-balance text-cream-50">{dict.cta.title}</h2>
          <p className="mt-6 max-w-xl text-lg leading-relaxed text-cream-100/85">
            {dict.cta.lede}
          </p>
          <div className="mt-10 flex flex-col gap-3 sm:flex-row sm:gap-4">
            <Button asChild variant="primary" size="lg">
              <Link href={browseHref}>
                {dict.cta.browse}
                <ArrowRight className="h-4 w-4" />
              </Link>
            </Button>
            <Button
              asChild
              variant="outline"
              size="lg"
              className="border-cream-100/40 text-cream-50 hover:border-cream-50 hover:bg-cream-50 hover:text-forest-900"
            >
              <Link href={contactHref}>{dict.cta.talk}</Link>
            </Button>
          </div>
        </div>
      </section>
      {/* locale kept for future per-section deep links */}
      <span className="hidden" data-locale={locale} />
    </>
  );
}

/** Split "a <em>b</em> c" → ["a ", "b", " c"]. No <em> → [whole, "", ""]. */
function splitEm(html: string): [string, string, string] {
  const m = /^(.*?)<em>(.*?)<\/em>(.*)$/s.exec(html);
  if (!m) return [html, "", ""];
  return [m[1], m[2], m[3]];
}
