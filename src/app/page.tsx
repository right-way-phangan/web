import type { Metadata } from "next";
import { Hero } from "@/components/sections/hero";
import { HeroStats } from "@/components/sections/hero-stats";
import { Values } from "@/components/sections/values";
import { FeaturedListings } from "@/components/sections/featured-listings";
import { IslandCta } from "@/components/sections/island-cta";

export const metadata: Metadata = {
  alternates: {
    canonical: "/",
    languages: { en: "/", ru: "/ru", "x-default": "/" },
    types: { "application/rss+xml": "/feed.xml" },
  },
};

export const revalidate = 300;

export default function HomePage() {
  return (
    <>
      <Hero />
      <HeroStats locale="en" />
      <div className="container-prose"><hr className="section-divider" /></div>
      <Values />
      <div className="container-prose"><hr className="section-divider" /></div>
      <FeaturedListings />
      <IslandCta />
    </>
  );
}
