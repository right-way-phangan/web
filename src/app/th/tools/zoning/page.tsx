import type { Metadata } from "next";
import { jsonLdHtml } from "@/lib/seo/json-ld";
import { PageHero } from "@/components/sections/page-hero";
import { ZoneChecker } from "@/components/tools/zone-checker";
import { getSiteUrl } from "@/lib/site-url";

export const metadata: Metadata = {
  title: "สร้างอะไรได้บ้างที่นี่? — ตรวจสอบผังเมืองเกาะพะงัน",
  description:
    "วางตำแหน่งบนเกาะพะงันแล้วดูข้อกำหนดการก่อสร้างเบื้องต้น — โซนผังเมือง การใช้ประโยชน์ที่ได้รับอนุญาต และสิ่งที่ต้องตรวจสอบก่อนสร้าง ฟรี ตัวเลขที่แน่นอนยืนยันในการตรวจสอบสถานะ (Due Diligence) ของเรา",
  alternates: {
    canonical: "/th/tools/zoning",
    languages: { en: "/tools/zoning", ru: "/ru/tools/zoning", th: "/th/tools/zoning", "x-default": "/tools/zoning" },
  },
  openGraph: {
    title: "แปลงนี้บนเกาะพะงันสร้างอะไรได้บ้าง?",
    description:
      "วางตำแหน่ง → ดูโซนผังเมือง การใช้ประโยชน์ที่ได้รับอนุญาต และข้อควรระวังในการก่อสร้างของทุกจุดบนเกาะพะงัน ฟรี ข้อมูลเบื้องต้น",
    url: "/th/tools/zoning",
  },
};

export const revalidate = 3600;

export default function ThaiZoningPage() {
  const siteUrl = getSiteUrl();
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "WebApplication",
    name: "Right Way — เครื่องตรวจสอบผังเมืองและข้อกำหนดการก่อสร้างเกาะพะงัน",
    applicationCategory: "BusinessApplication",
    operatingSystem: "Web",
    url: `${siteUrl}/th/tools/zoning`,
    offers: { "@type": "Offer", price: "0", priceCurrency: "THB" },
    description:
      "ข้อกำหนดการก่อสร้างเบื้องต้นของทุกจุดบนเกาะพะงัน อ่านจากโซนการใช้ประโยชน์ที่ดินตามผังเมืองไทย: การใช้ประโยชน์ที่ได้รับอนุญาต รูปแบบอาคารโดยทั่วไป และข้อควรระวังที่ต้องตรวจสอบในการตรวจสอบสถานะ",
    publisher: { "@type": "Organization", name: "Right Way Phangan Group", url: siteUrl },
  };

  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: jsonLdHtml(jsonLd) }} />
      <PageHero
        eyebrow="ตรวจสอบผังเมืองฟรี"
        title="แปลงนี้สร้างอะไรได้บ้าง?"
        lede="วางตำแหน่งบนเกาะพะงัน — หรือคลิกแปลงบนแผนที่ — แล้วเราจะอ่านโซนผังเมืองไทย ณ จุดนั้น: การใช้ประโยชน์ที่ได้รับอนุญาต รูปแบบอาคารโดยทั่วไป และสิ่งที่ต้องตรวจสอบก่อน เป็นข้อมูลเบื้องต้น ความสูง พื้นที่อาคาร และระยะร่นที่แน่นอนสำหรับเอกสารสิทธิ์ของคุณจะยืนยันในการตรวจสอบสถานะ (Due Diligence) ของเรา"
      />
      <section className="container-prose mt-10 md:mt-14">
        <ZoneChecker locale="th" />
      </section>
    </>
  );
}
