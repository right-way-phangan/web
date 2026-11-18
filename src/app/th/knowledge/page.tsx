import type { Metadata } from "next";
import Link from "next/link";
import type { Route } from "next";
import { ArrowRight } from "lucide-react";
import { PageHero } from "@/components/sections/page-hero";
import { KnowledgeBrowser } from "@/components/knowledge/knowledge-browser";
import { KB_ARTICLES } from "@/content/knowledge-base";
import { getKbArticleThBySlug } from "@/content/knowledge-base.th";

const MONTHS_TH = [
  "ม.ค.", "ก.พ.", "มี.ค.", "เม.ย.", "พ.ค.", "มิ.ย.",
  "ก.ค.", "ส.ค.", "ก.ย.", "ต.ค.", "พ.ย.", "ธ.ค.",
];

// Все EN-статьи; переведённые — на тайском, остальные — EN-фолбэк.
const ARTICLES = KB_ARTICLES.map((a) => getKbArticleThBySlug(a.slug) ?? a);

export const metadata: Metadata = {
  title: "คลังความรู้",
  description:
    "คู่มือที่เข้าใจง่ายเรื่องการซื้ออสังหาริมทรัพย์บนเกาะพะงัน — โฉนดและเอกสารสิทธิ์ ค่าโอนและภาษี ผังเมืองสำหรับการก่อสร้าง การถือครองของชาวต่างชาติ และกฎที่มีผลต่อดีลจริง",
  alternates: { canonical: "/th/knowledge", languages: { en: "/knowledge", ru: "/ru/knowledge", th: "/th/knowledge", "x-default": "/knowledge" } },
};

export default function ThaiKnowledgePage() {
  return (
    <>
      <PageHero
        eyebrow="คลังความรู้"
        title="สิ่งที่คุณต้องรู้จริงก่อนซื้อบนเกาะพะงัน"
        lede="คำอธิบายสั้น เข้าใจง่าย ในประเด็นทางกฎหมายและเชิงปฏิบัติที่ชี้ขาดการซื้อ — โครงสร้างการถือครอง ผังเมืองสำหรับการก่อสร้าง และกฎเบื้องหลัง เราอัปเดตให้เป็นปัจจุบันเสมอ การตรวจสอบสถานะ (Due Diligence) ในทุกดีลเป็นส่วนหนึ่งของวิธีทำงานของเรา ไม่ใช่บริการเสริม"
      />

      <section className="container-prose py-14 md:py-20">
        <KnowledgeBrowser
          basePath="/th/knowledge"
          articles={ARTICLES.map((a) => ({
            slug: a.slug,
            topic: a.topic,
            title: a.title,
            short: a.short,
            updated: a.updated,
          }))}
          labels={{
            all: "ทั้งหมด",
            read: "อ่าน",
            searchPlaceholder: "ค้นหาคู่มือ…",
            empty: "ยังไม่มีคู่มือที่ตรงกับคำค้นหา",
            clear: "ล้างการค้นหา",
            updatedPrefix: "อัปเดต",
            months: MONTHS_TH,
          }}
        />
      </section>

      <section className="border-t border-forest-500/10 bg-cream-200/30">
        <div className="container-prose py-16 md:py-20">
          <div className="max-w-2xl">
            <h2 className="font-serif text-3xl text-forest-900 md:text-4xl">
              มีคำถามที่เรายังไม่ได้ตอบใช่ไหม?
            </h2>
            <p className="mt-4 text-lg text-forest-500/70">
              <Link
                href={"/th/faq" as Route}
                className="text-forest-500 underline-offset-4 hover:underline hover:text-brass-500"
              >
                คำถามที่พบบ่อย
              </Link>{" "}
              รวบรวมคำถามยอดนิยมไว้แล้ว สำหรับเรื่องเฉพาะของที่ดินหรือดีลใดดีลหนึ่ง โทรคุยสั้น ๆ
              เร็วกว่าการอ่าน — และนี่คือคำถามแบบที่เราตอบให้ฟรีเมื่อทำงานร่วมกับคุณ
            </p>
            <div className="mt-8 flex flex-wrap gap-3">
              <Link
                href={"/th/contact" as Route}
                className="inline-flex items-center gap-2 rounded-sm bg-panel px-6 py-3 text-sm font-medium text-panel-fg transition-colors hover:bg-forest-400"
              >
                สอบถามเรา
                <ArrowRight className="h-4 w-4" />
              </Link>
            </div>
          </div>
        </div>
      </section>
    </>
  );
}
