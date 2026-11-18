import type { Metadata } from "next";
import { PageHero } from "@/components/sections/page-hero";
import { MatchChat } from "@/components/match/match-chat";

export const metadata: Metadata = {
  title: "AI จับคู่อสังหาริมทรัพย์",
  description:
    "บอก AI ของเราว่าคุณกำลังมองหาอะไรบนเกาะพะงัน — ในบทสนทนาสั้น ๆ — แล้วรับรายการคัดสรรที่จัดอันดับพร้อมคะแนนความเหมาะสมของแต่ละทรัพย์",
  alternates: {
    canonical: "/th/match",
    languages: { en: "/match", ru: "/ru/match", th: "/th/match", "x-default": "/match" },
  },
};

export const revalidate = 3600;
export const maxDuration = 30;

export default function ThaiMatchPage() {
  return (
    <section className="pb-16">
      <PageHero
        eyebrow="AI จับคู่อสังหาริมทรัพย์"
        title="บอกเราว่าคุณต้องการอะไรจริง ๆ"
        lede="บทสนทนาสั้น ๆ กับ AI ของเรา แล้วรับรายการคัดสรรที่จัดอันดับพร้อมคะแนนความเหมาะสมของทุกทรัพย์ ฟรี ไม่ต้องลงทะเบียน"
      />
      <div className="mt-12 md:mt-16">
        <MatchChat locale="th" />
      </div>
    </section>
  );
}
