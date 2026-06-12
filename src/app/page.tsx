import type { Metadata } from "next";
import { Hero } from "@/components/sections/hero";
import { HeroStats } from "@/components/sections/hero-stats";
import { Values } from "@/components/sections/values";
import { FeaturedListings } from "@/components/sections/featured-listings";
import { IslandCta } from "@/components/sections/island-cta";
import { Reveal } from "@/components/sections/reveal";

export const metadata: Metadata = {
  alternates: {
    canonical: "/",
    languages: { en: "/", ru: "/ru" },
    types: { "application/rss+xml": "/feed.xml" },
  },
};

export const revalidate = 300;

export default function HomePage() {
  return (
    <>
      <Hero />
      <HeroStats locale="en" />
      <Reveal>
        <Values />
      </Reveal>
      <Reveal>
        <FeaturedListings />
      </Reveal>
      <IslandCta />
    </>
  );
}
