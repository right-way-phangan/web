import type { Metadata } from "next";
import { PageHero } from "@/components/sections/page-hero";
import { COMMONS_CREDITS, PEXELS_LICENSE_URL } from "@/content/credits";

export const metadata: Metadata = {
  title: "เครดิตภาพถ่าย",
  description:
    "แหล่งที่มาของภาพและสัญญาอนุญาตของภาพถ่ายที่ใช้บนเว็บไซต์ Right Way Phangan",
  alternates: { canonical: "/th/credits", languages: { en: "/credits", ru: "/ru/credits", th: "/th/credits", "x-default": "/credits" } },
};

export default function ThaiCreditsPage() {
  return (
    <>
      <PageHero
        eyebrow="เครดิต"
        title="เครดิตภาพถ่าย"
        lede="ภาพถ่ายบางส่วนของย่านต่าง ๆ ได้รับอนุญาตจากช่างภาพผ่าน Wikimedia Commons ตามสัญญาอนุญาต Creative Commons เราจึงให้เครดิตแต่ละท่านไว้ด้านล่าง ภาพอื่น ๆ เป็นภาพบรรยากาศประกอบภายใต้สัญญาอนุญาตของ Pexels (ไม่ต้องระบุแหล่งที่มา)"
      />

      <section className="container-prose py-12 md:py-16">
        <h2 className="font-serif text-2xl text-forest-900 md:text-3xl">
          ภาพถ่ายผ่าน Wikimedia Commons
        </h2>
        <p className="mt-3 max-w-prose text-sm text-forest-500/70">
          ภาพถ่ายจริงของสถานที่ที่ระบุ ใช้ซ้ำภายใต้สัญญาอนุญาตที่แสดง ชื่อภาพลิงก์ไปยังไฟล์ต้นฉบับ
          ส่วน “สัญญาอนุญาต” ลิงก์ไปยังข้อความของสัญญาอนุญาต
        </p>

        <ul className="mt-8 divide-y divide-forest-500/10 border-y border-forest-500/10">
          {COMMONS_CREDITS.map((c) => (
            <li
              key={c.district}
              className="flex flex-col gap-1 py-4 md:flex-row md:items-baseline md:justify-between md:gap-6"
            >
              <div>
                <p className="text-sm font-medium text-forest-900">{c.district}</p>
                <a
                  href={c.fileUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-sm text-forest-500/80 underline-offset-2 hover:text-brass-500 hover:underline"
                >
                  “{c.title}”
                </a>
              </div>
              <p className="text-sm text-forest-500/70">
                {c.author} ·{" "}
                <a
                  href={c.licenseUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="underline-offset-2 hover:text-brass-500 hover:underline"
                >
                  {c.license}
                </a>
              </p>
            </li>
          ))}
        </ul>

        <h2 className="mt-14 font-serif text-2xl text-forest-900 md:text-3xl">
          ภาพประกอบผ่าน Pexels
        </h2>
        <p className="mt-3 max-w-prose text-sm leading-relaxed text-forest-500/70">
          ภาพถ่ายย่านและหน้าอื่น ๆ ที่เหลือเป็นภาพบรรยากาศประกอบของ
          เกาะพะงัน / อ่าวไทย ภายใต้{" "}
          <a
            href={PEXELS_LICENSE_URL}
            target="_blank"
            rel="noopener noreferrer"
            className="underline-offset-2 hover:text-brass-500 hover:underline"
          >
            สัญญาอนุญาตของ Pexels
          </a>{" "}
          (ใช้เชิงพาณิชย์ได้ฟรี ไม่ต้องระบุแหล่งที่มา) — เป็นภาพบรรยากาศ ไม่ใช่ภาพบันทึก
          ของแปลงหรือชายหาดใดโดยเฉพาะ
        </p>
      </section>
    </>
  );
}
