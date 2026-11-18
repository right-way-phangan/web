import type { Metadata } from "next";
import Link from "next/link";
import type { Route } from "next";
import { PageHero } from "@/components/sections/page-hero";
import { FaqExplorer } from "@/components/faq/faq-explorer";
import { WhatsIncluded } from "@/components/faq/whats-included";
import { FaqJsonLd } from "@/components/seo/faq-json-ld";
import { Button } from "@/components/ui/button";
import { FAQ_CATEGORIES_TH } from "@/content/faq.th";
import { ALL_FAQ_ITEMS_TH } from "@/content/faq-derived.th";

export const metadata: Metadata = {
  title: "คำถามที่พบบ่อย",
  description:
    "คำตอบสำหรับคำถามที่ผู้ซื้อต่างชาติถามจริงเกี่ยวกับอสังหาริมทรัพย์บนเกาะพะงัน: โฉนดกับ น.ส.3 ฟรีโฮลด์กับลีสโฮลด์ โครงสร้างบริษัท ภาษี สาธารณูปโภค และการตรวจสอบสถานะ (Due Diligence)",
  alternates: { canonical: "/th/faq", languages: { en: "/faq", ru: "/ru/faq", th: "/th/faq", "x-default": "/faq" } },
};

export default function ThaiFaqPage() {
  return (
    <>
      {/* Top 40 for rich results: all 161 Q&A made the RU page a 1 MB document. */}
      <FaqJsonLd items={ALL_FAQ_ITEMS_TH.slice(0, 40)} />
      <PageHero
        eyebrow="คำถามที่พบบ่อย"
        title="ซื้ออสังหาริมทรัพย์บนเกาะพะงัน อธิบายให้ชัด"
        lede={`${ALL_FAQ_ITEMS_TH.length} คำตอบสำหรับคำถามที่ผู้ซื้อต่างชาติถามจริง แบ่งเป็นหกหมวด ค้นหาด้วยคำสำคัญ กรองตามหมวด หรือเลื่อนดูได้เลย`}
        image="/images/scenes/faq.jpg"
        imageAlt="ชายหาดริมทิวมะพร้าวยามพลบค่ำบนเกาะพะงัน"
      />

      <section className="container-prose py-12 md:py-16">
        <FaqExplorer items={ALL_FAQ_ITEMS_TH} categories={FAQ_CATEGORIES_TH} locale="th" />
      </section>

      <WhatsIncluded locale="th" />

      <section className="border-t border-forest-500/10 bg-cream-200/30">
        <div className="container-prose py-16 md:py-20">
          <div className="max-w-2xl">
            <h2 className="font-serif text-3xl text-forest-900 md:text-4xl">ยังมีคำถามอยู่ใช่ไหม?</h2>
            <p className="mt-4 text-lg text-forest-500/70">
              คำตอบเหล่านี้ครอบคลุมเรื่องที่พบบ่อยที่สุด แต่ผู้ซื้อแต่ละคนมีกรณีเฉพาะของตัวเอง
              ส่งคำถามของคุณมา — เราจะตอบโดยตรง และหากเป็นคำถามที่มีประโยชน์กับหลายคน
              เราจะเพิ่มไว้ในหน้านี้
            </p>
            <div className="mt-8 flex flex-wrap gap-3">
              <Button asChild variant="primary" size="md">
                <Link href={"/th/contact" as Route}>ถามเราได้ทุกเรื่อง</Link>
              </Button>
              <Button asChild variant="outline" size="md">
                <Link href={"/th/process" as Route}>ดูขั้นตอนของเรา</Link>
              </Button>
            </div>
          </div>
        </div>
      </section>
    </>
  );
}
