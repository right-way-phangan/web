import type { Metadata } from "next";
import { LocalizedHome } from "@/components/sections/localized-home";
import { getHomeDict } from "@/lib/i18n/dictionaries";

export const revalidate = 3600;

export const metadata: Metadata = {
  // absolute: the title already carries the brand — otherwise the "%s · Right Way Phangan"
  // template would add it a second time.
  title: { absolute: "Right Way Phangan — อสังหาริมทรัพย์บนเกาะพะงัน" },
  description:
    "ซื้อที่ดินโฉนด วิลล่า และบ้านบนเกาะพะงัน ตรวจสอบโฉนดและผังเมืองทุกแปลง ราคาต่อไร่ชัดเจน ดูแลจนโอนกรรมสิทธิ์ที่สำนักงานที่ดิน",
  alternates: {
    canonical: "/th",
    languages: { en: "/", ru: "/ru", th: "/th", "x-default": "/" },
  },
};

export default function ThaiHomePage() {
  return <LocalizedHome dict={getHomeDict("th")} locale="th" />;
}
