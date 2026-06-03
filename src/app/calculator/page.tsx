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

export default async function CalculatorPage() {
  const catalog = await getPublicObjects();

  return (
    <section className="pb-24">
      <PageHero
        eyebrow="Investment calculator"
        title="See what a Phangan property could be worth."
        lede="Set your own growth outlook and horizon. We'll project the value, ROI, and capital curve — then surface listings that fit the budget."
      />
      <div className="container-prose mt-12 md:mt-16">
        <RoiCalculator catalog={catalog} />
      </div>
    </section>
  );
}
