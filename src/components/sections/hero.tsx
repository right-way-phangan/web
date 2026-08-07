import Link from "next/link";
import type { Route } from "next";
import { ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { HeroBackground } from "./hero-background";
import { SectionEyebrow } from "@/components/sections/section-eyebrow";
import { Parallax } from "@/components/motion/parallax";
import { Magnetic } from "@/components/motion/magnetic";
import { AnimatedNumber } from "@/components/motion/animated-number";
import { getHomeDict, type Locale } from "@/lib/i18n/dictionaries";
import { getPublicObjects } from "@/lib/data/objects";

/**
 * Deep-links for the hero intent chips — zipped with dict.hero.intents BY INDEX,
 * so the two arrays must stay the same length/order across locales. Each path
 * maps onto a real /listings query filter (see lib/filters/listings.ts), so a
 * chip drops the visitor straight into a pre-filtered search, not a dead link.
 * Exception: the Leasehold chip routes to /projects — leasehold land inventory
 * is zero for now, the honest leasehold offer lives in developer projects.
 */
const HERO_INTENT_PATHS = [
  "/listings?beachfront=1",
  "/listings?seaview=1",
  "/listings?type=Land",
  "/listings?type=Villa",
  "/projects",
] as const;

/**
 * Hero — "immersive depth layer". A photographic scene on a slow scroll-zoom
 * (Parallax) sits under a directional teal scrim and a warm horizon glow; the
 * foreground rises in line-by-line (CSS .mask-rise, SSR/no-JS safe). A kinetic
 * intent bar routes into filtered search, and a live ticker docked at the foot
 * proves the catalogue is real — counts only (public-copy rule). Dict-driven so
 * the EN root (/) and RU (/ru) share one component with zero markup drift.
 */
export async function Hero({
  locale = "en",
  fill = false,
}: {
  locale?: Locale;
  // Внутри скролл-падения (hero-fall) hero пинится в sticky-вьюпорт — тогда
  // секция должна занять всю высоту экрана (min-h-svh), а не 88vh.
  fill?: boolean;
}) {
  const dict = getHomeDict(locale).hero;
  const t = getHomeDict(locale).stats;
  const base = locale === "ru" ? "/ru" : "";

  // Live counts for the ticker. Degrade gracefully — if the catalog is
  // unreachable the numeric items simply drop, the hero still paints.
  let listings = 0;
  let districts = 0;
  try {
    const objects = await getPublicObjects();
    listings = objects.length;
    districts = new Set(objects.map((o) => o.district).filter(Boolean)).size;
  } catch {
    /* leave at 0 */
  }

  const [titleBefore, titleEm, titleAfter] = splitEm(dict.titleHtml);
  const browseHref = `${base}/listings` as Route;
  const processHref = `${base}/process` as Route;

  return (
    <section
      aria-label="Hero"
      className={`relative isolate flex ${fill ? "min-h-svh" : "min-h-[88vh]"} flex-col overflow-hidden bg-panel`}
    >
      {/* Layer 1 — deep photographic scene on a slow scroll-zoom. Oversized so
          the parallax shift never bares an edge. */}
      <Parallax
        speed={90}
        zoom={1.12}
        className="absolute -inset-y-[8%] inset-x-0"
      >
        <HeroBackground
          fallbackSrc="/hero-phangan.jpg"
          fallbackAlt="Aerial view of a beachfront on Koh Phangan"
        />
      </Parallax>

      {/* Layer 2 — atmosphere: directional teal scrim for legibility, a warm
          horizon glow for depth, and a fade into the sand section below. */}
      <div
        className="pointer-events-none absolute inset-0 bg-gradient-to-tr from-panel/90 via-panel/55 to-panel/20"
        aria-hidden
      />
      <div
        className="pointer-events-none absolute inset-0 bg-[radial-gradient(120%_80%_at_50%_118%,rgba(217,138,30,0.26),transparent_62%)]"
        aria-hidden
      />
      <div
        className="pointer-events-none absolute inset-x-0 bottom-0 h-40 bg-gradient-to-b from-transparent to-cream-100"
        aria-hidden
      />

      {/* Layer 3 — content */}
      <div className="container-prose relative z-10 flex flex-1 flex-col justify-center py-28 md:py-32">
        <SectionEyebrow tone="dark" className="mask-rise">
          {dict.eyebrow}
        </SectionEyebrow>

        {/* Кегль опущен на ступень против прежнего 5xl/7xl: у Source Serif 4
            крупнее строчные, и на 72px строка переставала помещаться в две. */}
        <h1
          className="mask-rise mt-7 max-w-4xl text-balance text-4xl leading-[1.06] text-panel-fg md:text-6xl md:leading-[1.03]"
          style={{ animationDelay: "0.08s" }}
        >
          {titleBefore}
          {titleEm ? <span className="italic text-brass-200">{titleEm}</span> : null}
          {titleAfter}
        </h1>

        <p
          className="mask-rise mt-7 max-w-xl text-lg leading-relaxed text-panel-fg/85 md:text-xl"
          style={{ animationDelay: "0.16s" }}
        >
          {dict.lede}
        </p>

        {/* Intent bar — label on its own line, then a tidy wrap of chips into
            pre-filtered search (kept symmetric on narrow screens). */}
        <div className="mask-rise mt-9" style={{ animationDelay: "0.24s" }}>
          <span className="text-[0.8125rem] uppercase tracking-eyebrow text-panel-fg/55">
            {dict.intentLabel}
          </span>
          <div className="mt-3 flex flex-wrap gap-2">
            {dict.intents.map((label, i) => {
              const path = HERO_INTENT_PATHS[i];
              if (!path) return null;
              const href = `${base}${path}` as Route;
              return (
                <Link
                  key={label}
                  href={href}
                  className="group/chip inline-flex min-h-[44px] items-center gap-1.5 rounded-full border border-panel-fg/25 bg-panel-fg/5 px-4 py-2 text-sm text-panel-fg transition-[color,background-color,border-color] duration-300 ease-[cubic-bezier(0.32,0.72,0,1)] hover:border-brass-300/60 hover:bg-panel-fg/10 hover:text-brass-200"
                >
                  {label}
                  <ArrowRight className="h-3.5 w-3.5 -translate-x-1 opacity-0 transition-[transform,opacity] duration-300 group-hover/chip:translate-x-0 group-hover/chip:opacity-100" />
                </Link>
              );
            })}
          </div>
        </div>

        {/* On mobile a 1-col grid forces BOTH CTAs to equal full width
            (grid items stretch); on sm+ they sit inline at content width. */}
        <div
          className="mask-rise mt-10 grid grid-cols-1 gap-3 sm:flex sm:flex-row sm:gap-4"
          style={{ animationDelay: "0.32s" }}
        >
          <Magnetic>
            <Button asChild variant="accent" size="lg" className="w-full sm:w-auto">
              <Link href={browseHref}>
                {dict.ctaBrowse}
                <ArrowRight className="h-4 w-4" />
              </Link>
            </Button>
          </Magnetic>
          <Button
            asChild
            variant="outline"
            size="lg"
            className="w-full border-panel-fg/40 text-panel-fg hover:border-panel-fg hover:bg-panel-fg hover:text-panel sm:w-auto"
          >
            <Link href={processHref}>{dict.ctaProcess}</Link>
          </Button>
        </div>
      </div>

      {/* Ticker strip docked at the hero foot — live proof on a glassy hairline */}
      <div className="relative z-10 border-t border-panel-fg/15 bg-panel/35">
        <div className="container-prose flex flex-wrap items-center justify-center gap-x-10 gap-y-3 py-5 md:justify-between">
          {listings > 0 ? (
            <TickerItem value={<AnimatedNumber value={listings} />} label={t.listings} />
          ) : null}
          {districts > 0 ? (
            <TickerItem value={<AnimatedNumber value={districts} />} label={t.districts} />
          ) : null}
          <TickerItem value={t.vettedValue} label={t.vetted} />
          <TickerItem value={t.replyValue} label={t.reply} />
        </div>
      </div>
    </section>
  );
}

function TickerItem({
  value,
  label,
}: {
  value: React.ReactNode;
  label: string;
}) {
  return (
    <div className="flex items-baseline gap-2">
      <span className="num text-lg text-panel-fg md:text-xl">{value}</span>
      <span className="text-[11px] uppercase tracking-[0.18em] text-panel-fg/80">
        {label}
      </span>
    </div>
  );
}

/** Split "a <em>b</em> c" → ["a ", "b", " c"]. No <em> → [whole, "", ""]. */
function splitEm(html: string): [string, string, string] {
  const m = /^(.*?)<em>(.*?)<\/em>(.*)$/s.exec(html);
  if (!m) return [html, "", ""];
  return [m[1], m[2], m[3]];
}
