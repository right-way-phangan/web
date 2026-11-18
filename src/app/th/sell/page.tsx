import type { Metadata } from "next";
import { jsonLdHtml } from "@/lib/seo/json-ld";
import Link from "next/link";
import type { Route } from "next";
import { ShieldCheck, LineChart, Megaphone, FileCheck } from "lucide-react";
import { PageHero } from "@/components/sections/page-hero";
import { SellPreviewCard } from "@/components/sections/sell-preview-card";
import { SectionEyebrow } from "@/components/sections/section-eyebrow";
import { Reveal } from "@/components/sections/reveal";
import { Appear } from "@/components/motion/appear";
import { Button } from "@/components/ui/button";
import { SellerListingForm } from "@/components/forms/seller-listing-form";
import { getSiteUrl } from "@/lib/site-url";

export const metadata: Metadata = {
  title: "ฝากขายที่ดินหรือวิลล่าบนเกาะพะงัน",
  description:
    "ฝากขายที่ดิน วิลล่า หรือบ้านบนเกาะพะงันกับเอเจนซีที่ตรวจสอบทุกทรัพย์ที่ขาย การประเมินราคาที่ตรงไปตรงมาจากข้อมูลจริง การเข้าถึงผู้ซื้อผ่านช่องทางที่ใช่ และดูแลการตรวจสอบสถานะพร้อมเอกสารครบวงจร",
  alternates: {
    canonical: "/th/sell",
    languages: { en: "/sell", ru: "/ru/sell", th: "/th/sell", "x-default": "/sell" },
  },
};

const REASONS = [
  {
    icon: ShieldCheck,
    title: "ทรัพย์ของคุณได้รับความใส่ใจอย่างจริงจัง",
    text: "เราไม่ได้มีฟีดประกาศ 600 รายการ ทุกทรัพย์ที่เราเป็นตัวแทนผ่านการตรวจสอบด้วยตัวเอง ผู้ซื้อจึงเชื่อมั่นในสิ่งที่เห็นตั้งแต่แรก — และทรัพย์ของคุณจะอยู่ท่ามกลางคุณภาพ ไม่ใช่ความวุ่นวาย",
  },
  {
    icon: LineChart,
    title: "ตั้งราคาจากตัวเลขจริง",
    text: "เราประเมินที่ดินหรือวิลล่าของคุณเทียบกับการซื้อขายที่เปรียบเทียบได้จริงและข้อมูลตลาดปัจจุบันบนเกาะพะงัน — ไม่ใช่การคาดเดาด้วยความหวัง ราคาที่สมเหตุสมผลขายได้ ราคาที่เกินจริงขายไม่ออก",
  },
  {
    icon: Megaphone,
    title: "เข้าถึงผู้ซื้อจริง ผ่านช่องทางที่ใช่",
    text: "ประกาศของคุณเข้าถึงผู้ซื้อในที่ที่พวกเขาค้นหาจริง — เว็บไซต์ของเรา Telegram, Facebook Marketplace และพอร์ทัลอสังหาริมทรัพย์ — เป็นภาษาอังกฤษ นำเสนอตามมาตรฐานสากล",
  },
  {
    icon: FileCheck,
    title: "ดูแลเอกสารครบวงจร",
    text: "ตรวจสอบเอกสารสิทธิ์ ตรวจแนวเขต สัญญาซื้อขาย และเป็นตัวแทนที่สำนักงานที่ดิน — เราดำเนินการตรวจสอบสถานะและกระบวนการทั้งหมด เพื่อไม่ให้การขายของคุณสะดุดเพราะเอกสารขาด",
  },
] as const;

const STEPS = [
  {
    title: "ประเมินราคาฟรี",
    text: "บอกเราเกี่ยวกับทรัพย์ของคุณ เราจะให้การประเมินที่ตรงไปตรงมาจากข้อมูลจริงว่าทรัพย์มีมูลค่าเท่าไรในตลาดวันนี้ — โดยไม่มีข้อผูกมัด",
  },
  {
    title: "ตรวจสอบและนำเสนอประกาศ",
    text: "หากเรารับทรัพย์ เราจะตรวจสอบเอกสารสิทธิ์และรายละเอียด จากนั้นนำเสนออย่างเหมาะสม — ถ่ายภาพ ข้อมูลจำเพาะที่ถูกต้อง และตำแหน่งที่แน่นอนบนแผนที่",
  },
  {
    title: "เผยแพร่ในที่ที่ผู้ซื้อค้นหา",
    text: "ทรัพย์ของคุณเผยแพร่ในทุกช่องทางของเราพร้อมข้อมูลครบถ้วนและตรงไปตรงมา — แบบที่ผู้ซื้อตัวจริงตัดสินใจได้ ไม่ต้องคอยสงสัย",
  },
  {
    title: "เราปิดการขาย",
    text: "เรารับการสอบถาม ดำเนินการตรวจสอบสถานะระดับธุรกรรมและเอกสาร และเป็นตัวแทนผลประโยชน์ของคุณจนถึงการโอนที่สำนักงานที่ดิน",
  },
] as const;

export default function ThaiSellPage() {
  const siteUrl = getSiteUrl();

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "HowTo",
    name: "วิธีขายทรัพย์กับ Right Way บนเกาะพะงัน",
    description:
      "ขั้นตอนการฝากขายที่ดิน วิลล่า หรือบ้านกับ Right Way Phangan Group — ตั้งแต่การประเมินราคาฟรีจนถึงการโอนที่สำนักงานที่ดิน",
    inLanguage: "th",
    step: STEPS.map((s, i) => ({
      "@type": "HowToStep",
      position: i + 1,
      name: s.title,
      text: s.text,
    })),
    publisher: {
      "@type": "Organization",
      name: "Right Way Phangan Group",
      url: siteUrl,
    },
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: jsonLdHtml(jsonLd) }}
      />

      <PageHero
        eyebrow="สำหรับเจ้าของ"
        title="ขายที่ดินหรือวิลล่าของคุณ อย่างถูกวิธี"
        lede="ฝากขายกับเอเจนซีที่ตรวจสอบทุกทรัพย์ที่ขาย — เพื่อให้ผู้ซื้อตัวจริงให้ความสำคัญกับทรัพย์ของคุณ หนึ่งเกาะ ทำอย่างถูกต้อง: ราคาที่ตรงไปตรงมา การเข้าถึงผู้ซื้อจริง และดูแลเอกสารตั้งแต่การสอบถามครั้งแรกจนถึงการโอน"
        aside={
          <SellPreviewCard
            tag="ตรวจสอบแล้ว"
            title="วิลล่าของคุณ นำเสนออย่างเหมาะสม"
            meta="ภาพถ่าย แปลน และสรุปเอกสารสิทธิ์ที่ชัดเจน — แบบที่ผู้ซื้อตัวจริงคาดหวัง"
            foot="ตรวจสอบแล้ว · ราคาจากข้อมูล · พร้อมสำหรับ DD"
          />
        }
      />

      <section className="container-prose py-14 md:py-20">
        <Reveal>
          <div className="grid gap-10 md:grid-cols-2 md:gap-x-14">
            {REASONS.map((r, i) => (
              <Appear key={r.title} delay={(i % 2) * 0.08} className="h-full">
                <div className="flex gap-5">
                  <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-sm border border-forest-500/15 text-forest-500">
                    <r.icon className="h-5 w-5" />
                  </div>
                  <div>
                    <h2 className="font-serif text-2xl text-forest-900">{r.title}</h2>
                    <p className="mt-2 text-base leading-relaxed text-forest-500/75">
                      {r.text}
                    </p>
                  </div>
                </div>
              </Appear>
            ))}
          </div>
        </Reveal>
      </section>

      <section className="bg-cream-200/30">
        <div className="container-prose py-14 md:py-20">
          <Reveal>
            <SectionEyebrow>ขั้นตอนการทำงาน</SectionEyebrow>
            <h2 className="mt-3 font-serif text-3xl text-forest-900 md:text-4xl">
              จากการประเมินราคาสู่การโอน
            </h2>
          </Reveal>
          <div className="mt-10 grid gap-8 md:grid-cols-2 md:gap-x-14">
            {STEPS.map((s, i) => (
              <div key={s.title} className="flex gap-5">
                <p className="num shrink-0 text-2xl text-brass-700">
                  {String(i + 1).padStart(2, "0")}
                </p>
                <div>
                  <h3 className="font-serif text-2xl text-forest-900">{s.title}</h3>
                  <p className="mt-2 text-base leading-relaxed text-forest-500/75">
                    {s.text}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="container-prose py-14 md:py-20">
        <div className="grid items-start gap-10 md:grid-cols-2 md:gap-x-16">
          <div>
            <h2 className="font-serif text-3xl text-forest-900 md:text-4xl">
              ทรัพย์ของคุณมีมูลค่าเท่าไร?
            </h2>
            <p className="mt-4 max-w-prose text-lg leading-relaxed text-forest-500/75">
              เริ่มต้นด้วยการประเมินราคาฟรีโดยไม่มีข้อผูกมัด รับการประเมินทันทีจากข้อมูลจริง
              ภายในไม่กี่นาที หรือส่งรายละเอียดมาให้เรา แล้วเราจะกลับไปพร้อมตัวเลขที่ผ่านการพิจารณา
              และแนวทางการขายที่ชัดเจน
            </p>
            <div className="mt-8 flex flex-col gap-3 sm:flex-row sm:gap-4">
              <Button asChild variant="primary" size="md">
                <Link href={"/th/tools/estimate" as Route}>
                  รับการประเมินราคาฟรี
                </Link>
              </Button>
              <Button asChild variant="outline" size="md">
                <Link href={"/th/process" as Route}>ขั้นตอนการซื้อขาย</Link>
              </Button>
            </div>
          </div>

          <div className="rounded-bezel bg-cream-200/50 p-1.5 ring-1 ring-forest-900/5">
            <div className="rounded-core bg-cream-50 p-6 shadow-bezel md:p-8">
              <h3 className="font-serif text-2xl text-forest-900">ฝากขายทรัพย์กับเรา</h3>
              <p className="mt-2 text-sm leading-relaxed text-forest-500/70">
                บอกเราเกี่ยวกับที่ดิน วิลล่า หรือบ้านของคุณ เราตรวจดูทุกคำขอด้วยตัวเอง
                และตอบกลับภายในวันทำการ
              </p>
              <div className="mt-6">
                <SellerListingForm locale="th" />
              </div>
            </div>
          </div>
        </div>
      </section>
    </>
  );
}
