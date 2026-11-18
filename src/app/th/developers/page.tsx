import type { Metadata } from "next";
import { DevelopersIndex } from "@/components/projects/developers-index";

export const metadata: Metadata = {
  title: "ผู้พัฒนาโครงการบนเกาะพะงัน",
  description:
    "ผู้พัฒนาโครงการที่ผ่านการตรวจสอบซึ่งกำลังสร้างบนเกาะพะงัน — ประวัติผลงาน โครงการปัจจุบัน และช่องทางส่งคำขอโดยตรง",
  alternates: {
    canonical: "/th/developers",
    languages: {
      en: "/developers",
      ru: "/ru/developers",
      th: "/th/developers",
      "x-default": "/developers",
    },
  },
};

export const revalidate = 3600;

export default function ThaiDevelopersPage() {
  return <DevelopersIndex locale="th" />;
}
