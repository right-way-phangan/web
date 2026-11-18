import type { Metadata } from "next";
import { jsonLdHtml } from "@/lib/seo/json-ld";
import { PageHero } from "@/components/sections/page-hero";
import { EstimateTool } from "@/components/tools/estimate-tool";
import { getSiteUrl } from "@/lib/site-url";

export const metadata: Metadata = {
  title: "ทรัพย์ของคุณบนเกาะพะงันมีมูลค่าเท่าไร? — ประเมินราคาทันที",
  description:
    "รับการประเมินราคาตลาดทันทีจากข้อมูลจริงสำหรับที่ดินหรือวิลล่าบนเกาะพะงัน จากข้อมูลการซื้อขายของ Right Way เอง ฟรี ไม่มีข้อผูกมัด — จากนั้นทีมของเราจะประเมินราคาอย่างแม่นยำ",
  alternates: {
    canonical: "/th/tools/estimate",
    languages: { en: "/tools/estimate", ru: "/ru/tools/estimate", th: "/th/tools/estimate", "x-default": "/tools/estimate" },
  },
  openGraph: {
    title: "ทรัพย์ของคุณบนเกาะพะงันมีมูลค่าเท่าไร?",
    description:
      "ประเมินราคาตลาดทันทีจากข้อมูลจริงสำหรับที่ดินหรือวิลล่าบนเกาะพะงัน — ฟรี จากข้อมูลการซื้อขายของ Right Way เอง",
    url: "/th/tools/estimate",
  },
};

export const revalidate = 3600;

export default function ThaiEstimatePage() {
  const siteUrl = getSiteUrl();
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "WebApplication",
    name: "Right Way — เครื่องประเมินราคาอสังหาริมทรัพย์เกาะพะงัน",
    applicationCategory: "BusinessApplication",
    operatingSystem: "Web",
    url: `${siteUrl}/th/tools/estimate`,
    offers: { "@type": "Offer", price: "0", priceCurrency: "THB" },
    description:
      "การประเมินราคาตลาดเบื้องต้นทันทีสำหรับที่ดินและวิลล่าบนเกาะพะงัน จากรายการทรัพย์ ข้อมูลการขายที่เปรียบเทียบได้ และการวิเคราะห์ค่าเช่าของ Right Way เอง",
    publisher: { "@type": "Organization", name: "Right Way Phangan Group", url: siteUrl },
  };

  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: jsonLdHtml(jsonLd) }} />
      <PageHero
        eyebrow="ประเมินราคาฟรี"
        title="ทรัพย์ของคุณบนเกาะพะงันมีมูลค่าเท่าไร?"
        lede="การประเมินราคาตลาดทันทีจากข้อมูลการซื้อขายของเราเอง — แปลงที่ขายแล้ว ประกาศที่มีอยู่ และผลตอบแทนค่าเช่าทั่วเกาะ ฟรี ไม่มีข้อผูกมัด จากนั้นทีมของเราจะยืนยันตัวเลขตามเอกสารสิทธิ์และทำเลของคุณ"
      />
      <section className="container-prose mt-10 md:mt-14">
        <EstimateTool lang="th" />
      </section>
    </>
  );
}
