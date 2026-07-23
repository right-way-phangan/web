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
    "Check what your Koh Phangan villa could earn per night, see median land prices by district, the premium a pool or sea view commands, and which configuration is worth building for rental. Based on live listings.",
};

export const revalidate = 300;

export default async function InsightsPage() {
  const data = getRentalMarket();
  const objects = await getPublicObjects();
  const inventory = buildInventoryYield(objects, data);
  const salePrices = buildSalePriceByDistrict(objects);

  return (
    <section className="pb-24 md:pb-32">
      <DatasetJsonLd siteUrl={getSiteUrl()} meta={data.meta} />
      <PageHero
        eyebrow="Market insights"
        title="The Phangan market — in numbers."
        lede="Check what your place could earn a night, see what land costs by district, what a pool or sea view adds, and which configuration pays back fastest. Live data, so you don't have to guess."
      />
      <RentalInsights
        data={data}
        inventory={inventory}
        landSlot={<SalePrices stats={salePrices} />}
      />
      <div className="container-prose mt-16">
        <Disclaimer locale="en" />
      </div>
    </section>
  );
}
