import type { Metadata } from "next";
import { PageHero } from "@/components/sections/page-hero";
import { Appear } from "@/components/motion/appear";
import { Disclaimer } from "@/components/legal/disclaimer";
import { RoiCalculator } from "@/components/calculator/roi-calculator";
import { CalculatorOnboarding } from "@/components/calculator/calculator-onboarding";
import { MarketMiniBlock } from "@/components/calculator/market-preset";
import { CollapsedSection } from "@/components/calculator/collapsed-section";
import { BuildProForma } from "@/components/calculator/build-proforma";
import { CalculatorFaq } from "@/components/calculator/calculator-faq";
import { getPublicObjects, slimObjectForCard } from "@/lib/data/objects";
import { getRentalMarket } from "@/lib/data/rental-market";

export const metadata: Metadata = {
  title: "Инвестиционный калькулятор",
  description:
    "Спрогнозируйте стоимость, ROI и рост капитала по объекту на Ко Пангане во времени — и посмотрите подходящие объекты под бюджет.",
  alternates: { canonical: "/ru/calculator", languages: { en: "/calculator", ru: "/ru/calculator", "x-default": "/calculator" } },
};

export const revalidate = 300;

export default async function RussianCalculatorPage({
  searchParams,
}: {
  searchParams: Promise<{ price?: string; mode?: string; tenure?: string; lease?: string; phase?: string }>;
}) {
  const catalog = (await getPublicObjects()).map(slimObjectForCard);
  const market = getRentalMarket();
  const params = await searchParams;

  const priceRaw = Number(params.price);
  const initialPriceThb = Number.isFinite(priceRaw) && priceRaw > 0 ? priceRaw : undefined;
  const initialMode = params.mode === "rent" ? "rent" : params.mode === "hold" ? "hold" : undefined;
  const initialTenure =
    params.tenure === "leasehold" ? "leasehold" : params.tenure === "freehold" ? "freehold" : undefined;
  const leaseRaw = Number(params.lease);
  const initialLeaseTermYears = Number.isFinite(leaseRaw) && leaseRaw > 0 ? leaseRaw : undefined;
  const initialOffplan = params.phase === "offplan" ? true : undefined;

  return (
    <section className="pb-24">
      <PageHero
        eyebrow="Инвестиционный калькулятор"
        title="Узнайте, сколько может стоить объект на Пангане."
        lede="Задайте свой темп роста и горизонт. Мы спрогнозируем стоимость, ROI и кривую капитала — и подберём объекты под бюджет."
      />
      <CalculatorOnboarding locale="ru" />
      <div className="container-prose mt-12 md:mt-16">
        <Appear delay={0}>
          <RoiCalculator
            entry
            catalog={catalog}
            market={market}
            initialPriceThb={initialPriceThb}
            initialMode={initialMode}
            initialTenure={initialTenure}
            initialLeaseTermYears={initialLeaseTermYears}
            initialOffplan={initialOffplan}
          />
        </Appear>
        <Appear delay={0.1} className="mt-16 md:mt-24">
          <MarketMiniBlock market={market} />
        </Appear>
        <CollapsedSection
          id="build"
          eyebrow="Ещё"
          title="Думаете строить, а не покупать?"
          lede="Откройте pro-forma «построй и сдавай» — земля плюс стройка против арендной доходности, которую она приносит."
        >
          <BuildProForma market={market} />
        </CollapsedSection>
        <CalculatorFaq locale="ru" />
        <Disclaimer locale="ru" />
      </div>
    </section>
  );
}
