import type { Metadata } from "next";
import { LocalizedHome } from "@/components/sections/localized-home";
import { getHomeDict } from "@/lib/i18n/dictionaries";

export const revalidate = 3600;

export const metadata: Metadata = {
  // absolute: the title already carries the brand — otherwise the "%s · Right Way Phangan"
  // template would add it a second time.
  title: { absolute: "Right Way Phangan — อสังหาริมทรัพย์บนเกาะพะงัน" },
  description:
    "เอเจนซีอสังหาริมทรัพย์บนเกาะพะงันสำหรับผู้ซื้อต่างชาติ: ที่ดิน วิลล่า และบ้าน ทุกทรัพย์ผ่านการตรวจสอบด้วยตัวเอง กระบวนการโปร่งใส ตัวเลขตรงไปตรงมา",
  alternates: {
    canonical: "/th",
    languages: { en: "/", ru: "/ru", th: "/th", "x-default": "/" },
  },
};

export default function ThaiHomePage() {
  return <LocalizedHome dict={getHomeDict("th")} locale="th" />;
}
