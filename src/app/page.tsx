import { Hero } from "@/components/sections/hero";
import { Values } from "@/components/sections/values";
import { FeaturedListings } from "@/components/sections/featured-listings";
import { IslandCta } from "@/components/sections/island-cta";

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
