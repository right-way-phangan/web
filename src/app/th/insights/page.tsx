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
  title: "ข้อมูลเชิงลึกตลาด — ราคาที่ดินและข้อมูลค่าเช่าบนเกาะพะงัน",
  description:
    "ดูว่าวิลล่าของคุณบนเกาะพะงันอาจทำรายได้ต่อคืนเท่าไร ดูราคาที่ดินมัธยฐานตามย่าน ส่วนเพิ่มของราคาจากสระว่ายน้ำหรือวิวทะเล และรูปแบบใดคุ้มค่าที่จะสร้างเพื่อปล่อยเช่า จากประกาศที่มีอยู่จริง",
  alternates: { canonical: "/th/insights", languages: { en: "/insights", ru: "/ru/insights", th: "/th/insights", "x-default": "/insights" } },
};

export const revalidate = 3600;

export default async function ThaiInsightsPage() {
  const data = getRentalMarket();
  const objects = await getPublicObjects();
  const inventory = buildInventoryYield(objects, data);
  const salePrices = buildSalePriceByDistrict(objects);

  return (
    <section className="pb-24 md:pb-32">
      <DatasetJsonLd siteUrl={getSiteUrl()} meta={data.meta} locale="th" />
      <PageHero
        eyebrow="ข้อมูลเชิงลึกตลาด"
        title="ตลาดเกาะพะงัน — ในรูปตัวเลข"
        lede="ดูว่าที่พักของคุณอาจทำรายได้ต่อคืนเท่าไร — วางลิงก์ Airbnb หรือเลือกรายละเอียด — พร้อมราคาที่ดินตามย่าน สระว่ายน้ำหรือวิวทะเลเพิ่มมูลค่าเท่าไร และรูปแบบใดคืนทุนเร็วที่สุด ข้อมูลจริงล่าสุด ไม่ต้องคาดเดา"
      />
      <RentalInsights
        data={data}
        inventory={inventory}
        landSlot={<SalePrices stats={salePrices} locale="th" />}
      />
      <div className="container-prose mt-16">
        <Disclaimer locale="th" />
      </div>
    </section>
  );
}
