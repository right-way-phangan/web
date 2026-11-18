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
  title: "เครื่องคำนวณการลงทุน",
  description:
    "ประมาณการมูลค่า ROI และการเติบโตของเงินทุนของอสังหาริมทรัพย์บนเกาะพะงันตามช่วงเวลา — และดูประกาศที่ตรงกับงบประมาณของคุณ",
  alternates: { canonical: "/th/calculator", languages: { en: "/calculator", ru: "/ru/calculator", th: "/th/calculator", "x-default": "/calculator" } },
};

export const revalidate = 3600;

export default async function ThaiCalculatorPage({
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
        eyebrow="เครื่องคำนวณการลงทุน"
        title="ดูว่าอสังหาริมทรัพย์บนเกาะพะงันอาจมีมูลค่าเท่าไร"
        lede="กำหนดแนวโน้มการเติบโตและระยะเวลาของคุณเอง เราจะประมาณการมูลค่า ROI และเส้นโค้งเงินทุน — แล้วแสดงประกาศที่เหมาะกับงบประมาณ"
      />
      <CalculatorOnboarding locale="th" />
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
          eyebrow="เพิ่มเติม"
          title="คิดจะสร้างเองแทนการซื้อ?"
          lede="เปิด pro-forma สร้างเพื่อปล่อยเช่า — ค่าที่ดินบวกค่าก่อสร้าง เทียบกับผลตอบแทนค่าเช่าที่ได้รับ"
        >
          <BuildProForma market={market} />
        </CollapsedSection>
        <CalculatorFaq locale="th" />
        <Disclaimer locale="th" />
      </div>
    </section>
  );
}
