import type { Metadata } from "next";
import Link from "next/link";
import type { Route } from "next";
import { ArrowRight } from "lucide-react";
import { PageHero } from "@/components/sections/page-hero";
import { getAllBlogPosts } from "@/lib/data/articles";
import { intlLocale } from "@/lib/i18n/locale-path";

export const metadata: Metadata = {
  title: "บล็อก",
  description:
    "บทความที่ใช้งานได้จริงและเข้าใจง่ายเรื่องการซื้อและการสร้างบนเกาะพะงัน — การตรวจสอบสถานะที่ดิน ผลตอบแทนค่าเช่า และกลไกที่แท้จริงของตลาด",
  alternates: { canonical: "/th/blog", languages: { en: "/blog", ru: "/ru/blog", th: "/th/blog", "x-default": "/blog" } },
};

function fmtDate(iso: string): string {
  return new Date(iso).toLocaleDateString(intlLocale("th"), {
    day: "numeric",
    month: "long",
    year: "numeric",
  });
}

export const revalidate = 3600;

export default async function ThaiBlogPage() {
  const posts = await getAllBlogPosts("th");

  return (
    <>
      <PageHero
        eyebrow="บล็อก"
        title="บันทึกเรื่องการซื้อและการสร้างบนเกาะพะงัน"
        lede="คำถามที่ผู้ซื้อถามเราจริง พร้อมคำตอบแบบเปิดเผย — การตรวจสอบสถานะที่ดินทำงานอย่างไร วิลล่าสร้างรายได้เท่าไร และวิธีอ่านตลาดที่ให้รางวัลกับคนที่ทำการบ้านมาดี"
      />

      <section className="container-prose py-14 md:py-20">
        <div className="grid gap-6 md:grid-cols-2 md:gap-8">
          {posts.map((p) => (
            <Link
              key={p.slug}
              href={`/th/blog/${p.slug}` as Route}
              className="group flex flex-col rounded-sm border border-forest-500/10 bg-cream-50 p-6 transition-[border-color,box-shadow] duration-300 hover:border-forest-500/30 hover:shadow-lg md:p-8"
            >
              <div className="flex items-center gap-2 text-[0.8125rem] font-medium uppercase tracking-eyebrow text-brass-500">
                <span>{p.topic}</span>
                <span aria-hidden className="text-forest-500/30">·</span>
                <span className="text-forest-500/50">{p.readMins} นาที</span>
              </div>
              <h2 className="mt-3 font-serif text-xl text-forest-900 md:text-2xl">{p.title}</h2>
              <p className="mt-3 text-sm leading-relaxed text-forest-500/85 md:text-base">
                {p.excerpt}
              </p>
              <div className="mt-auto flex items-center justify-between pt-5">
                <span className="text-xs text-forest-500/50">{fmtDate(p.published)}</span>
                <span className="inline-flex items-center gap-1.5 text-sm font-medium text-forest-500 transition-colors group-hover:text-brass-500">
                  อ่าน
                  <ArrowRight className="h-3.5 w-3.5" />
                </span>
              </div>
            </Link>
          ))}
        </div>
      </section>
    </>
  );
}
