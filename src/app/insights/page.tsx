import type { Metadata } from "next";
import { PageHero } from "@/components/sections/page-hero";
import { RentalInsights } from "@/components/insights/rental-insights";
import { getRentalMarket, buildInventoryYield } from "@/lib/data/rental-market";
import { getPublicObjects } from "@/lib/data/objects";

export const metadata: Metadata = {
  title: "Market insights — Koh Phangan rental data",
  description:
    "What a villa earns per night by district on Koh Phangan, the premium a pool or sea view commands, and which configuration is worth building for rental. Based on a live snapshot of Airbnb listings.",
};

export const revalidate = 300;

export default async function InsightsPage() {
  const data = getRentalMarket();
  const objects = await getPublicObjects();
  const inventory = buildInventoryYield(objects, data);

  return (
    <section className="pb-24">
      <PageHero
        eyebrow="Market insights"
        title="What to build for rental — the data."
        lede="We track nightly rates across the island so you don't have to guess. See how much a villa earns by district, what a pool or sea view adds, and which configuration pays back fastest — then run your own numbers in the calculator."
      />
      <div className="container-prose mt-12 md:mt-16">
        <RentalInsights data={data} inventory={inventory} />
      </div>
    </section>
  );
}
