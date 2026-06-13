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
  title: "Аналитика рынка — цены на землю и аренду на Ко Пангане",
  description:
    "Медианная цена земли за рай по районам Ко Пангана, сколько вилла зарабатывает за ночь, какую наценку даёт бассейн или вид на море, и какую конфигурацию выгодно строить под аренду. По живым объявлениям.",
  alternates: { canonical: "/ru/insights", languages: { en: "/insights", ru: "/ru/insights" } },
};

export const revalidate = 300;

export default async function RussianInsightsPage() {
  const data = getRentalMarket();
  const objects = await getPublicObjects();
  const inventory = buildInventoryYield(objects, data);
  const salePrices = buildSalePriceByDistrict(objects);

  return (
    <section className="pb-24">
      <DatasetJsonLd siteUrl={getSiteUrl()} meta={data.meta} locale="ru" />
      <PageHero
        eyebrow="Аналитика рынка"
        title="Рынок Пангана — в цифрах."
        lede="Сколько стоит земля за рай по районам, сколько вилла зарабатывает за ночь, что добавляет бассейн или вид на море и какая конфигурация окупается быстрее. Живые данные, чтобы не гадать — а потом посчитайте своё в калькуляторе."
      />
      <div className="container-prose mt-12 space-y-14 md:mt-16 md:space-y-20">
        <SalePrices stats={salePrices} locale="ru" />
        <RentalInsights data={data} inventory={inventory} />
        <Disclaimer locale="ru" />
      </div>
    </section>
  );
}
