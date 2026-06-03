import type { Metadata } from "next";
import { PageHero } from "@/components/sections/page-hero";
import { RoiCalculator } from "@/components/calculator/roi-calculator";
import { getPublicObjects } from "@/lib/data/objects";

export const metadata: Metadata = {
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
  const catalog = await getPublicObjects();
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
      <div className="container-prose mt-12 md:mt-16">
        <RoiCalculator
          catalog={catalog}
          initialPriceThb={initialPriceThb}
          initialMode={initialMode}
          initialTenure={initialTenure}
          initialLeaseTermYears={initialLeaseTermYears}
          initialOffplan={initialOffplan}
        />
      </div>
    </section>
  );
}
