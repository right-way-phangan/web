import type { Metadata } from "next";
import { EstatesIndex } from "@/components/estates/estates-index";

export const metadata: Metadata = {
  title: "โครงการที่ดิน",
  description:
    "ชุดแปลงที่ดินบนเกาะพะงัน — แปลงพร้อมสร้างหลายแปลงจากเจ้าของรายเดียวภายใต้เอกสารสิทธิ์เดียวกัน ขายหรือให้เช่าแยกแปลง สถานะล่าสุด: ว่าง จองแล้ว ขายแล้ว หรือให้เช่าแล้ว",
  alternates: {
    canonical: "/th/estates",
    languages: { en: "/estates", ru: "/ru/estates", th: "/th/estates", "x-default": "/estates" },
  },
};

export const revalidate = 3600;

export default function ThaiEstatesPage() {
  return <EstatesIndex locale="th" />;
}
