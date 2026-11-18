import type { Metadata } from "next";
import { jsonLdHtml } from "@/lib/seo/json-ld";
import Link from "next/link";
import type { Route } from "next";
import {
  FileCheck,
  Landmark,
  Map,
  Route as RouteIcon,
  Ruler,
  ScrollText,
  UserCheck,
  Zap,
} from "lucide-react";
import { PageHero } from "@/components/sections/page-hero";
import { Button } from "@/components/ui/button";
import { getSiteUrl } from "@/lib/site-url";

export const metadata: Metadata = {
  title: "สิ่งที่เราตรวจสอบ — การตรวจสอบสถานะ (Due Diligence) ทุกประกาศ",
  description:
    "การตรวจสอบเบื้องหลังทุกประกาศของ Right Way บนเกาะพะงัน: โฉนดที่สำนักงานที่ดิน ภาระผูกพัน ผังเมือง ทางเข้าออกตามกฎหมาย แนวเขตที่รังวัดด้วย GPS สาธารณูปโภค อำนาจของผู้ขาย และใบอนุญาตก่อสร้าง",
  alternates: {
    canonical: "/th/due-diligence",
    languages: { en: "/due-diligence", ru: "/ru/due-diligence", th: "/th/due-diligence", "x-default": "/due-diligence" },
  },
};

const CHECKS = [
  {
    icon: ScrollText,
    title: "เอกสารสิทธิ์ ตรวจสอบที่สำนักงานที่ดิน",
    text: "เราอ่านเอกสารสิทธิ์ฉบับจริง — โฉนดหรือ น.ส.3 ก. — ที่สำนักงานที่ดิน ไม่ใช่แค่ภาพถ่าย ประเภทเอกสาร ขนาดที่จดทะเบียน และสายกรรมสิทธิ์ต้องตรงกับที่ผู้ขายแจ้ง ก่อนประกาศจะเผยแพร่",
  },
  {
    icon: FileCheck,
    title: "ภาระผูกพันและการจำนอง",
    text: "การจำนอง การเช่าที่จดทะเบียนไว้บนที่ดินแล้ว ภาระจำยอม สิทธิเก็บกิน ทุกอย่างที่จดทะเบียนไว้กับเอกสารสิทธิ์จะปรากฏที่นี่ — และสิ่งที่เราพบจะระบุไว้ในหมายเหตุของประกาศ ไม่ถูกซ่อนไว้",
  },
  {
    icon: Map,
    title: "ผังเมืองและข้อกำหนดการก่อสร้าง",
    text: "สิ่งที่โซนของแปลงอนุญาตจริง: ความสูงสูงสุด อัตราส่วนพื้นที่อาคาร ระยะร่น ข้อจำกัดด้านสิ่งแวดล้อม แปลงบนเนินที่สวยงามแต่สร้างไม่ได้ไม่ใช่การลงทุน",
  },
  {
    icon: RouteIcon,
    title: "ทางเข้าออกตามกฎหมาย",
    text: "การเข้าถึงได้จริงไม่เท่ากับสิทธิ์ตามกฎหมาย เราตรวจว่าถนนเข้าแปลงเป็นทางสาธารณะ มีเอกสารสิทธิ์ หรือผ่านที่ดินของผู้อื่น — และสิทธิ์ทางผ่านจดทะเบียนแล้วหรือไม่",
  },
  {
    icon: Ruler,
    title: "แนวเขต รังวัดด้วย GPS",
    text: "รั้วอาจหลอกตา แต่พิกัดไม่โกหก เราเดินตรวจแปลงตามหมุดรังวัดในเอกสารสิทธิ์ และระบุทุกความต่างระหว่างส่วนที่ล้อมรั้ว ส่วนที่ใช้ทำประโยชน์ และส่วนที่เป็นกรรมสิทธิ์จริง",
  },
  {
    icon: Zap,
    title: "สาธารณูปโภคในพื้นที่จริง",
    text: "ไฟฟ้าจากการไฟฟ้าหรือพ่วงสายจากเพื่อนบ้าน? แหล่งน้ำจริง — ประปา บ่อ หรือตามฤดูกาล? อินเทอร์เน็ตมีตัวเลือกอะไร? เราตรวจสอบที่หน้างาน ไม่ใช่จากประกาศที่ผู้ขายเขียน",
  },
  {
    icon: UserCheck,
    title: "ตัวตนและอำนาจของผู้ขาย",
    text: "ผู้ขายต้องเป็นบุคคลที่มีชื่อในเอกสารสิทธิ์ — หรือถือหนังสือมอบอำนาจที่ตรวจสอบได้ ที่ดินที่ถือในนามบริษัทจะได้รับการตรวจสอบบริษัท: สถานะ กรรมการ และอำนาจในการขาย",
  },
  {
    icon: Landmark,
    title: "ใบอนุญาตของสิ่งปลูกสร้าง",
    text: "สำหรับวิลล่าและบ้าน: ใบอนุญาตก่อสร้าง ทะเบียนบ้าน และสิ่งที่สร้างจริงตรงกับที่ได้รับอนุญาตหรือไม่ สิ่งปลูกสร้างที่ไม่ได้รับอนุญาตคือเหตุผลในการต่อรองราคา ไม่ใช่เรื่องที่ทำให้ประหลาดใจ",
  },
] as const;

export default function ThaiDueDiligencePage() {
  const siteUrl = getSiteUrl();

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "HowTo",
    name: "Right Way ตรวจสอบประกาศทรัพย์บนเกาะพะงันอย่างไร",
    description:
      "รายการตรวจสอบสถานะ (Due Diligence) ที่ใช้กับทุกประกาศของ Right Way ก่อนเผยแพร่",
    inLanguage: "th",
    step: CHECKS.map((c, i) => ({
      "@type": "HowToStep",
      position: i + 1,
      name: c.title,
      text: c.text,
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
        eyebrow="Due Diligence"
        title="สิ่งที่เราตรวจสอบก่อนประกาศจะเผยแพร่"
        lede="ทรัพย์ทุกรายการบนเว็บไซต์นี้มีตราเดียวกัน — และตรานั้นหมายถึงการตรวจสอบแปดข้อเดียวกัน ทำด้วยตัวเองทุกครั้ง นี่คือสิ่งที่อยู่เบื้องหลังตรานั้น"
      />

      <section className="container-prose py-14 md:py-20">
        <div className="grid gap-10 md:grid-cols-2 md:gap-x-14">
          {CHECKS.map((c, i) => (
            <div key={c.title} className="flex gap-5">
              <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-sm border border-forest-500/15 text-forest-500">
                <c.icon className="h-5 w-5" />
              </div>
              <div>
                <p className="text-[0.8125rem] font-medium uppercase tracking-eyebrow text-brass-500">
                  {String(i + 1).padStart(2, "0")}
                </p>
                <h2 className="mt-1 font-serif text-2xl text-forest-900">{c.title}</h2>
                <p className="mt-2 text-base leading-relaxed text-forest-500/75">
                  {c.text}
                </p>
              </div>
            </div>
          ))}
        </div>

        <div className="mt-16 rounded-sm border border-forest-500/10 bg-cream-50 p-8 md:mt-20 md:p-10">
          <h2 className="font-serif text-3xl text-forest-900">
            สิ่งนี้คืออะไร — และไม่ใช่อะไร
          </h2>
          <p className="mt-4 max-w-prose text-base leading-relaxed text-forest-500/75">
            การตรวจสอบของเราคือตัวกรองที่กันประกาศที่ไม่ดีออกจากเว็บไซต์นี้
            แต่ไม่ได้แทนที่ทนายความของคุณเอง — และเราจะเป็นคนแรกที่ยืนยันให้คุณจ้างทนาย
            การตรวจสอบทางกฎหมายโดยอิสระก่อนการโอนเป็นส่วนหนึ่งของทุกดีลที่เราดูแล
            และหากคุณยังไม่มีทนาย เราจะแนะนำทนายที่เราไว้วางใจให้
          </p>
          <p className="mt-4 max-w-prose text-sm leading-relaxed text-forest-500/60">
            ตรา{" "}
            <strong className="font-medium text-forest-500/80">Vetted by Right Way</strong>{" "}
            หมายความว่าทรัพย์ผ่านการตรวจสอบระดับประกาศเหล่านี้ ณ วันที่ระบุ —
            เป็นการคัดกรองโดยสุจริตจากเอกสารและบันทึกสาธารณะที่เรามี ณ เวลานั้น
            ไม่ใช่การรับประกันทางกฎหมายเรื่องกรรมสิทธิ์ แนวเขต หรือความสามารถในการก่อสร้าง
            และเงื่อนไขอาจเปลี่ยนแปลงได้หลังวันที่ตรวจสอบ การตรวจสอบที่มีผลผูกพันคือ
            Due Diligence ระดับธุรกรรมและการตรวจสอบทางกฎหมายโดยอิสระก่อนการโอนทุกครั้ง
          </p>
          <div className="mt-8 flex flex-col gap-3 sm:flex-row sm:gap-4">
            <Button asChild variant="primary" size="md">
              <Link href={"/th/listings" as Route}>ดูประกาศที่ตรวจสอบแล้ว</Link>
            </Button>
            <Button asChild variant="outline" size="md">
              <Link href={"/th/process" as Route}>ขั้นตอนการซื้อขาย</Link>
            </Button>
          </div>
        </div>
      </section>
    </>
  );
}
