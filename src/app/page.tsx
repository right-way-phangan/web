import type { Metadata } from "next";
import { Hero } from "@/components/sections/hero";
import { Values } from "@/components/sections/values";
import { FeaturedListings } from "@/components/sections/featured-listings";
import { IslandCta } from "@/components/sections/island-cta";

export const metadata: Metadata = {
  alternates: { canonical: "/", languages: { en: "/", ru: "/ru" } },
};

export const revalidate = 300;

export default function HomePage() {
  return (
    <>
      <Hero />
      <Values />
      <FeaturedListings />
      <IslandCta />
    </>
  );
}
