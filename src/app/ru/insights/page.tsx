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
    "Узнайте, сколько ваша вилла на Ко Пангане может приносить за ночь, посмотрите медианные цены на землю по районам, какую наценку даёт бассейн или вид на море и какую конфигурацию выгодно строить под аренду. По живым объявлениям.",
  alternates: { canonical: "/ru/insights", languages: { en: "/insights", ru: "/ru/insights", "x-default": "/insights" } },
};

export const revalidate = 300;

export default async function RussianInsightsPage() {
  const data = getRentalMarket();
  const objects = await getPublicObjects();
  const inventory = buildInventoryYield(objects, data);
  const salePrices = buildSalePriceByDistrict(objects);

  return (
    <section className="pb-24 md:pb-32">
      <DatasetJsonLd siteUrl={getSiteUrl()} meta={data.meta} locale="ru" />
      <PageHero
        eyebrow="Аналитика рынка"
        title="Рынок Пангана — в цифрах."
        lede="Узнайте, сколько ваш объект может приносить за ночь — вставьте ссылку на Airbnb или выберите параметры, — а также сколько стоит земля по районам, что добавляет бассейн или вид на море и какая конфигурация окупается быстрее. Живые данные, чтобы не гадать."
      />
      <RentalInsights
        data={data}
        inventory={inventory}
        landSlot={<SalePrices stats={salePrices} locale="ru" />}
      />
      <div className="container-prose mt-16">
        <Disclaimer locale="ru" />
      </div>
    </section>
  );
}
