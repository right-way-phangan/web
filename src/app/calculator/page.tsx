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
  alternates: { canonical: "/calculator", languages: { en: "/calculator", ru: "/ru/calculator", "x-default": "/calculator" } },
  title: "Investment calculator",
  description:
    "Project the value, ROI, and capital growth of a Koh Phangan property over time — and see matching listings for your budget.",
};

export const revalidate = 300;

export default async function CalculatorPage({
  searchParams,
}: {
  searchParams: Promise<{ price?: string; mode?: string; tenure?: string; lease?: string; phase?: string }>;
}) {
  const catalog = (await getPublicObjects()).map(slimObjectForCard);
  const market = getRentalMarket();
  const params = await searchParams;

  // Deep-link params (e.g. from the Telegram Mini App):
  // ?price=<thb>&mode=hold|rent&tenure=freehold|leasehold&lease=<years>&phase=offplan
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
        eyebrow="Investment calculator"
        title="See what a Phangan property could be worth."
        lede="Set your own growth outlook and horizon. We'll project the value, ROI, and capital curve — then surface listings that fit the budget."
      />
      <CalculatorOnboarding locale="en" />
      <div className="container-prose mt-12 md:mt-16">
        <Appear delay={0}>
          <RoiCalculator
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
          eyebrow="Also"
          title="Thinking of building instead of buying?"
          lede="Open the build-to-rent pro-forma — land plus construction cost against the rental yield it earns."
        >
          <BuildProForma market={market} />
        </CollapsedSection>
        <CalculatorFaq locale="en" />
        <Disclaimer locale="en" />
      </div>
    </section>
  );
}
