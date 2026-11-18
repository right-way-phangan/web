import type { Metadata } from "next";
import { PageHero } from "@/components/sections/page-hero";
import { PrivacyContent } from "@/components/legal/privacy-content";

export const metadata: Metadata = {
  title: { absolute: "นโยบายความเป็นส่วนตัว — Right Way Phangan" },
  description:
    "Right Way Phangan จัดการข้อมูลส่วนบุคคลอย่างไร — เราเก็บอะไร เพื่ออะไร ใครเห็น เก็บไว้นานเท่าไร และสิทธิ์ของคุณตาม พ.ร.บ.คุ้มครองข้อมูลส่วนบุคคล (PDPA) ของไทย",
  alternates: { canonical: "/th/privacy", languages: { en: "/privacy", ru: "/ru/privacy", th: "/th/privacy", "x-default": "/privacy" } },
};

export default function ThaiPrivacyPage() {
  return (
    <>
      <PageHero
        eyebrow="ความเป็นส่วนตัว"
        title="เราจัดการข้อมูลของคุณอย่างไร"
        lede="สรุปด้วยภาษาที่เข้าใจง่ายว่าเราเก็บอะไร เพื่ออะไร ใครเห็น และคุณมีสิทธิ์อะไรบ้าง จัดทำตามพระราชบัญญัติคุ้มครองข้อมูลส่วนบุคคล (PDPA) ของไทย"
      />
      <PrivacyContent locale="th" />
    </>
  );
}
