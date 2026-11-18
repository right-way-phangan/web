import type { Metadata } from "next";
import { jsonLdHtml } from "@/lib/seo/json-ld";
import Link from "next/link";
import type { Route } from "next";
import {
  Building2,
  ShieldCheck,
  FileSignature,
  CalendarClock,
  Landmark,
  ClipboardCheck,
  MessageCircle,
} from "lucide-react";
import { PageHero } from "@/components/sections/page-hero";
import { LeaseholdScheme } from "@/components/sections/leasehold-scheme";
import { LeaseholdListings } from "@/components/sections/leasehold-listings";
import { Button } from "@/components/ui/button";
import { getSiteUrl } from "@/lib/site-url";
import { whatsappLink } from "@/lib/site-config";

export const metadata: Metadata = {
  title: "วิลล่าลีสโฮลด์บนเกาะพะงัน — เป็นเจ้าของบ้าน เช่าที่ดิน",
  description:
    "วิธีที่ปลอดภัยสำหรับชาวต่างชาติในการถือวิลล่าบนเกาะพะงัน: เป็นเจ้าของอาคารเต็มสิทธิ์ เช่าที่ดินด้วยสัญญาเช่าระยะยาวที่จดทะเบียน — ไม่ใช้นอมินี ไม่ใช้บริษัทไทยบังหน้า สัญญาเช่าจดทะเบียน เงินมัดจำถือโดยทนาย การตรวจสอบสถานะสองระดับ",
  alternates: {
    canonical: "/th/leasehold",
    languages: { en: "/leasehold", ru: "/ru/leasehold", th: "/th/leasehold", "x-default": "/leasehold" },
  },
};

const PILLARS = [
  {
    icon: Building2,
    title: "วิลล่าเป็นของคุณ ที่ดินเป็นสิทธิการเช่า",
    text: "ในประเทศไทย อาคารและที่ดินเป็นกรรมสิทธิ์แยกกัน คุณถือวิลล่าในฐานะสิ่งปลูกสร้างในชื่อของคุณเอง — พร้อมใบอนุญาตก่อสร้าง และสิทธิเหนือพื้นดินที่จดทะเบียนในกรณีที่เหมาะสม — ส่วนที่ดินด้านล่างอยู่ภายใต้สัญญาเช่าระยะยาวที่คุณควบคุม กรรมสิทธิ์ที่ชัดเจนสองฉบับ ไม่ใช่ฉบับเดียวที่ยุ่งเหยิง",
  },
  {
    icon: ShieldCheck,
    title: "ไม่มีนอมินี ไม่มีบริษัทบังหน้า",
    text: "การถือกรรมสิทธิ์ (ฟรีโฮลด์) ผ่านบริษัทไทย — ชาวต่างชาติควบคุมหุ้นส่วนน้อย ขณะที่นอมินีชาวไทยถือส่วนที่เหลือ — คือสิ่งที่เจ้าหน้าที่กำลังตรวจสอบบนเกาะอยู่ในขณะนี้ สัญญาเช่าที่จดทะเบียนไม่ต้องใช้สิ่งเหล่านี้เลย",
  },
  {
    icon: FileSignature,
    title: "จดทะเบียนที่สำนักงานที่ดิน",
    text: "สามสิบปีคือระยะเวลาสูงสุดต่อครั้งที่สัญญาเช่าที่ดินในไทยจดทะเบียนได้ เราจดทะเบียนไว้กับโฉนด — ชื่อของคุณอยู่ในบันทึกกรรมสิทธิ์ — ไม่ใช่คำสัญญาปากเปล่าที่เก็บไว้ในลิ้นชัก",
  },
  {
    icon: CalendarClock,
    title: "เกิน 30 ปี — ตามที่ตกลงกับเจ้าของ",
    text: "เราเผยแพร่และคิดราคาตามระยะเช่าที่จดทะเบียน 30 ปี การขยายระยะเวลาเกินกว่านั้นตกลงกับเจ้าของที่ดินเป็นรายดีล เราทำเป็นลายลักษณ์อักษร แต่ไม่ใช่การรับประกัน",
  },
  {
    icon: Landmark,
    title: "เงินของคุณได้รับการคุ้มครองจนถึงวันจดทะเบียน",
    text: "เงินมัดจำของคุณถือโดยสำนักงานกฎหมายพันธมิตรในบัญชีลูกค้าแยกต่างหาก — ไม่จ่ายให้ผู้ขายล่วงหน้า — และจะปล่อยก็ต่อเมื่อสัญญาเช่าและอาคารจดทะเบียนในชื่อของคุณแล้ว คุณจ่ายเมื่อทรัพย์เป็นของคุณจริงตามเอกสาร",
  },
  {
    icon: ClipboardCheck,
    title: "การตรวจสอบสถานะสองระดับ",
    text: "การตรวจสอบระดับประกาศก่อนเผยแพร่ทรัพย์ จากนั้นการตรวจสอบสถานะระดับธุรกรรมเต็มรูปแบบร่วมกับทนายก่อนคุณลงนาม สัญญาเช่า ใบอนุญาตก่อสร้าง และเอกสารสิทธิ์ที่ดินล้วนตรวจจากต้นทาง",
  },
] as const;

const FAQ = [
  {
    q: "ชาวต่างชาติเป็นเจ้าของอสังหาริมทรัพย์ในไทยได้ตามกฎหมายหรือไม่?",
    a: "ชาวต่างชาติถือกรรมสิทธิ์ที่ดินโดยตรงไม่ได้ แต่เป็นเจ้าของอาคารได้ และถือที่ดินด้วยสัญญาเช่าระยะยาวที่จดทะเบียนได้ ลีสโฮลด์คือเส้นทางที่ผู้ซื้อต่างชาติส่วนใหญ่ใช้สำหรับวิลล่า: คุณเป็นเจ้าของบ้านในฐานะสิ่งปลูกสร้างและเช่าที่ดินที่บ้านตั้งอยู่ ห้องชุดคอนโดคืออีกเส้นทางหนึ่งของการถือกรรมสิทธิ์โดยชาวต่างชาติ แต่บนเกาะพะงันแทบไม่มีคอนโดที่เข้าเกณฑ์",
  },
  {
    q: "เกิดอะไรขึ้นเมื่อสัญญาเช่าสิ้นสุด?",
    a: "สัญญาเช่าที่ดินในไทยจดทะเบียนได้ครั้งละไม่เกิน 30 ปี สิ่งที่เกินกว่า 30 ปีแรกตกลงกับเจ้าของที่ดินและไม่มีการรับประกัน จึงควรประเมินมูลค่าสัญญาเช่าจาก 30 ปี สิ่งที่บังคับใช้ได้ขึ้นอยู่กับถ้อยคำและเจ้าของที่ดิน นั่นคือเหตุผลที่สัญญาเช่าเป็นส่วนหนึ่งของการตรวจสอบสถานะระดับธุรกรรมของเราและการตรวจทานของทนายคุณก่อนลงนาม",
  },
  {
    q: "ฉันเป็นเจ้าของวิลล่าจริง หรือแค่เช่า?",
    a: "คุณเป็นเจ้าของวิลล่า อาคารและที่ดินในไทยเป็นกรรมสิทธิ์แยกกัน — ชาวต่างชาติถืออาคารในชื่อตนเองได้ พร้อมใบอนุญาตก่อสร้าง และสิทธิเหนือพื้นดินที่จดทะเบียนในกรณีที่ใช้ ขณะที่ที่ดินด้านล่างเป็นการเช่า คุณขายอาคารและโอนสิทธิการเช่าที่เหลือให้ผู้ซื้อรายถัดไปได้",
  },
  {
    q: "ทำไมเลือกลีสโฮลด์แทนการให้บริษัทไทยถือฟรีโฮลด์?",
    a: "เส้นทางผ่านบริษัท — บริษัทจำกัดของไทยที่ผู้ซื้อต่างชาติควบคุมหุ้นส่วนน้อย และนอมินีชาวไทยถือส่วนที่เหลือ — คือโครงสร้างที่กำลังถูกตรวจสอบบนเกาะในขณะนี้ มีความเสี่ยงเรื่องนอมินีและค่าใช้จ่ายบริษัทต่อเนื่อง สัญญาเช่าที่จดทะเบียนเรียบง่ายกว่า ดูแลถูกกว่า และไม่ต้องพึ่งนอมินี",
  },
  {
    q: "ลีสโฮลด์คุ้มค่าในฐานะการลงทุนหรือไม่?",
    a: "เป็นไปได้ เครื่องคำนวณของเราคำนวณอย่างตรงไปตรงมา: มูลค่าขายต่อของสัญญาเช่าลดลงเมื่อระยะเวลาเหลือน้อยลง ค่าเช่าที่ดินปรับขึ้นทุกปี และประมาณการถูกคิดลดตามจำนวนปีที่เหลือของสัญญาเช่า ลองใส่ตัวเลขของคุณเอง — ระยะเวลา ค่าเช่า การเติบโต — แล้วดูกระแสเงินสดก่อนตัดสินใจ",
  },
] as const;

export default function ThaiLeaseholdPage() {
  const siteUrl = getSiteUrl();

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    inLanguage: "th",
    mainEntity: FAQ.map((f) => ({
      "@type": "Question",
      name: f.q,
      acceptedAnswer: { "@type": "Answer", text: f.a },
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
        eyebrow="ลีสโฮลด์"
        title="เป็นเจ้าของวิลล่า เช่าที่ดิน ไม่ต้องใช้นอมินี"
        lede="หน้านี้สำหรับผู้ซื้อชาวต่างชาติและคู่สมรส ผู้ซื้อสัญชาติไทยซื้อที่ดินโฉนดได้โดยตรง ลีสโฮลด์คือวิธีที่ผู้ซื้อต่างชาติถือบ้านบนเกาะพะงันโดยไม่ต้องมีบริษัทไทยบังหน้า — อาคารในชื่อของคุณ ที่ดินภายใต้สัญญาเช่าระยะยาวที่จดทะเบียน เงินมัดจำถือไว้อย่างปลอดภัยโดยทนายจนถึงวันจดทะเบียน นี่คือวิธีการทำงานอย่างละเอียด"
        aside={
          <LeaseholdScheme
            rows={[
              { icon: "home", title: "วิลล่า — ของคุณ", text: "กรรมสิทธิ์อาคารจดทะเบียนในชื่อของคุณ" },
              { icon: "land", title: "ที่ดิน — สิทธิการเช่า", text: "สัญญาเช่า 30 ปี จดทะเบียนที่สำนักงานที่ดิน" },
              { icon: "law", title: "เงิน — ได้รับการคุ้มครอง", text: "เงินมัดจำอยู่กับทนายจนถึงวันจดทะเบียน" },
            ]}
          />
        }
      />

      <section className="container-prose py-14 md:py-20">
        <div className="grid gap-10 md:grid-cols-2 md:gap-x-14">
          {PILLARS.map((p, i) => (
            <div key={p.title} className="flex gap-5">
              <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-sm border border-forest-500/15 text-forest-500">
                <p.icon className="h-5 w-5" />
              </div>
              <div>
                <p className="text-[0.8125rem] font-medium uppercase tracking-eyebrow text-brass-500">
                  {String(i + 1).padStart(2, "0")}
                </p>
                <h2 className="mt-1 font-serif text-2xl text-forest-900">{p.title}</h2>
                <p className="mt-2 text-base leading-relaxed text-forest-500/75">{p.text}</p>
              </div>
            </div>
          ))}
        </div>

        {/* Run the numbers — the calculator is leasehold-aware (term decay, indexed
            land rent, lease-expiry discount). Deep-link straight into that mode. */}
        <div className="mt-16 rounded-bezel bg-cream-200/50 p-1.5 ring-1 ring-forest-900/5 md:mt-20">
          <div className="rounded-core bg-cream-50 p-8 shadow-bezel md:p-10">
            <h2 className="font-serif text-3xl text-forest-900">ดูกระแสเงินสดก่อนตัดสินใจ</h2>
            <p className="mt-4 max-w-prose text-base leading-relaxed text-forest-500/75">
              เครื่องคำนวณ ROI ของเราคำนวณลีสโฮลด์อย่างตรงไปตรงมา: มูลค่าขายต่อลดลงเมื่อระยะเวลา
              เหลือน้อยลง ค่าเช่าที่ดินปรับขึ้นทุกปี และประมาณการถูกคิดลดตามจำนวนปีที่เหลือของสัญญาเช่า
              กำหนดระยะเวลา ค่าเช่า และการเติบโตที่คุณคาดหวัง แล้วดูตัวเลขเปลี่ยนไป
            </p>
            <div className="mt-8 flex flex-col gap-3 sm:flex-row sm:gap-4">
              <Button asChild variant="primary" size="md">
                <Link href={"/th/calculator?tenure=leasehold" as Route}>คำนวณผลตอบแทน</Link>
              </Button>
              <Button asChild variant="outline" size="md">
                <Link href={"/th/projects" as Route}>โครงการลีสโฮลด์ของผู้พัฒนาโครงการ</Link>
              </Button>
            </div>
          </div>
        </div>

        {/* Live leasehold inventory — real cards, crawlable, one click to buy. */}
        <LeaseholdListings locale="th" />

        {/* FAQ — visible Q&A mirrors the FAQPage JSON-LD above (AEO). */}
        <div className="mt-16 md:mt-20">
          <h2 className="font-serif text-3xl text-forest-900">ลีสโฮลด์ — ตอบทุกข้อสงสัย</h2>
          <dl className="mt-8 grid gap-8 md:grid-cols-2 md:gap-x-14">
            {FAQ.map((f) => (
              <div key={f.q}>
                <dt className="font-serif text-xl text-forest-900">{f.q}</dt>
                <dd className="mt-2 text-base leading-relaxed text-forest-500/75">{f.a}</dd>
              </div>
            ))}
          </dl>
        </div>

        {/* What this is — and what it isn't (mirrors the due-diligence trust block). */}
        <div className="mt-16 rounded-sm border border-forest-500/10 bg-cream-50 p-8 md:mt-20 md:p-10">
          <h2 className="font-serif text-3xl text-forest-900">ลีสโฮลด์ที่ทำอย่างถูกต้อง</h2>
          <p className="mt-4 max-w-prose text-base leading-relaxed text-forest-500/75">
            สัญญาเช่าที่จดทะเบียน อาคารในชื่อของคุณ เงินมัดจำถือไว้อย่างปลอดภัยจนถึงวันจดทะเบียน และ
            การตรวจสอบสองระดับเดียวกันเบื้องหลังทุกประกาศ —{" "}
            <Link href={"/th/due-diligence" as Route} className="underline decoration-brass-500/40 underline-offset-4 hover:decoration-brass-500">
              สิ่งที่เราตรวจสอบ
            </Link>{" "}
            ในระดับประกาศ จากนั้นการตรวจสอบสถานะระดับธุรกรรมเต็มรูปแบบร่วมกับทนาย
          </p>
          <p className="mt-4 max-w-prose text-sm leading-relaxed text-forest-500/60">
            หน้านี้อธิบายว่าลีสโฮลด์บนเกาะพะงันทำงานอย่างไร — ไม่ใช่คำปรึกษาทางกฎหมาย เงื่อนไขสัญญาเช่า
            สิทธิ์การต่ออายุ และการบังคับใช้แตกต่างกันไปตามดีลและเจ้าของที่ดิน เราจะเป็นคนแรกที่ยืนยัน
            ให้คุณจ้างทนายของคุณเอง และการตรวจสอบทางกฎหมายโดยอิสระก่อนการจดทะเบียนทุกครั้งเป็นส่วนหนึ่ง
            ของทุกดีลที่เราดูแล
          </p>
          <div className="mt-8 flex flex-col gap-3 sm:flex-row sm:gap-4">
            <Button asChild variant="primary" size="md">
              <Link href={"/th/projects" as Route}>โครงการลีสโฮลด์ของผู้พัฒนาโครงการ</Link>
            </Button>
            <Button asChild variant="outline" size="md">
              <a href={whatsappLink("สวัสดี อยากทราบเรื่องลีสโฮลด์บนเกาะพะงัน")} target="_blank" rel="noopener noreferrer">
                <MessageCircle className="h-4 w-4" />
                ติดต่อเรา
              </a>
            </Button>
          </div>
        </div>
      </section>
    </>
  );
}
