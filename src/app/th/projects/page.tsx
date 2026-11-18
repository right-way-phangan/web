import type { Metadata } from "next";
import { ProjectsIndex } from "@/components/projects/projects-index";

export const metadata: Metadata = {
  title: "โครงการของผู้พัฒนา",
  description:
    "โครงการก่อนสร้างเสร็จและโครงการพร้อมอยู่บนเกาะพะงัน — วิลล่าพร้อมสระว่ายน้ำและคอมเพล็กซ์: ยูนิต ราคา ตารางการชำระเงิน และประมาณการผลตอบแทน",
  alternates: {
    canonical: "/th/projects",
    languages: { en: "/projects", ru: "/ru/projects", th: "/th/projects", "x-default": "/projects" },
  },
};

export const revalidate = 3600;

export default function ThaiProjectsPage() {
  return <ProjectsIndex locale="th" />;
}
