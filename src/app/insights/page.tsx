import type { Metadata } from "next";
import { PageHero } from "@/components/sections/page-hero";
import { Disclaimer } from "@/components/legal/disclaimer";
import { RentalInsights } from "@/components/insights/rental-insights";
import { SalePrices } from "@/components/insights/sale-prices";
import { DatasetJsonLd } from "@/components/seo/dataset-json-ld";
import { getRentalMarket, buildInventoryYield } from "@/lib/data/rental-market";
import { getPublicObjects } from "@/lib/data/objects";
import { buildSalePriceByDistrict } from "@/lib/data/sale-prices";
import { getSiteUrl } from "@/lib/site-url";

export const metadata: Metadata = {
  alternates: { canonical: "/insights", languages: { en: "/insights", ru: "/ru/insights", "x-default": "/insights" } },
  title: "Market insights — Koh Phangan land prices & rental data",
  description:
    "Median land price per rai by district on Koh Phangan, what a villa earns per night, the premium a pool or sea view commands, and which configuration is worth building for rental. Based on live listings.",
};

export const revalidate = 300;

export default async function InsightsPage() {
  const data = getRentalMarket();
  const objects = await getPublicObjects();
  const inventory = buildInventoryYield(objects, data);
  const salePrices = buildSalePriceByDistrict(objects);

  return (
    <section className="pb-24">
      <DatasetJsonLd siteUrl={getSiteUrl()} meta={data.meta} />
      <PageHero
        eyebrow="Market insights"
        title="The Phangan market — in numbers."
        lede="What land costs per rai by district, how much a villa earns a night, what a pool or sea view adds, and which configuration pays back fastest. Live data, so you don't have to guess — then run your own numbers in the calculator."
      />
      <div className="container-prose mt-12 space-y-14 md:mt-16 md:space-y-20">
        <SalePrices stats={salePrices} />
        <RentalInsights data={data} inventory={inventory} />
        <Disclaimer locale="en" />
      </div>
    </section>
  );
}
