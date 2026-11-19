import type { Metadata } from "next";
import { currentAdminLang } from "@/lib/auth/admin-lang";

export const metadata: Metadata = { title: "Help · CRM", robots: { index: false, follow: false } };
export const dynamic = "force-dynamic";

type Block = { h: string; items: string[] };
const TEXT: Record<"en" | "th" | "ru", { title: string; blocks: Block[] }> = {
  en: {
    title: "How to work in the CRM",
    blocks: [
      { h: "Every morning", items: [
        "Open Today: it shows urgent tasks, hot leads to call and leads that need a move.",
        "Reply to a new lead within 1 hour during working time, the same day at the latest.",
      ] },
      { h: "Working a lead", items: [
        "Open the lead card. After each call or message press Called / Messaged / Met: this is the contact log.",
        "Change the stage when the deal moves: Contacted → Qualified → Viewing → Offer → Reservation…",
        "Always set the next task with a date, so no lead is forgotten.",
        "Write notes: budget, area, timeframe, what the client liked.",
      ] },
      { h: "Properties", items: [
        "Properties shows the catalogue with prices and photos. Use What to show on the lead card to build a shortlist.",
        "New property: add a listing you found. It goes to the admin for checking.",
        "Owner contacts are kept by the admin. Ask the admin to arrange a viewing.",
      ] },
      { h: "Rules", items: [
        "Client data is confidential (PDPA): do not copy or share it outside the CRM.",
        "You see only the leads assigned to you. New leads you create are yours automatically.",
        "Never promise prices or terms the owner has not confirmed.",
      ] },
    ],
  },
  th: {
    title: "วิธีใช้งาน CRM",
    blocks: [
      { h: "ทุกเช้า", items: [
        "เปิดหน้า “วันนี้”: จะเห็นงานด่วน ลูกค้าร้อนที่ต้องโทร และลูกค้าที่ต้องดำเนินการ",
        "ตอบลูกค้าใหม่ภายใน 1 ชั่วโมงในเวลาทำงาน อย่างช้าภายในวันเดียวกัน",
      ] },
      { h: "การดูแลลูกค้า", items: [
        "เปิดการ์ดลูกค้า หลังโทรหรือส่งข้อความทุกครั้ง กด “โทรแล้ว / ส่งข้อความแล้ว / พบแล้ว” เพื่อบันทึกการติดต่อ",
        "เปลี่ยนขั้นตอนเมื่อดีลคืบหน้า: ติดต่อแล้ว → คัดกรองแล้ว → นัดชม → เสนอราคา → จอง…",
        "ตั้งงานถัดไปพร้อมวันที่ทุกครั้ง เพื่อไม่ให้ลืมลูกค้า",
        "เขียนบันทึก: งบประมาณ ย่าน ระยะเวลา สิ่งที่ลูกค้าชอบ",
      ] },
      { h: "ทรัพย์", items: [
        "หน้า “ทรัพย์” แสดงรายการพร้อมราคาและรูป ใช้ “ทรัพย์ที่ควรเสนอ” ในการ์ดลูกค้าเพื่อทำรายการคัดเลือก",
        "“ทรัพย์ใหม่”: เพิ่มทรัพย์ที่คุณหามาได้ แอดมินจะตรวจสอบก่อน",
        "ข้อมูลติดต่อเจ้าของเก็บไว้ที่แอดมิน หากต้องการนัดชมให้แจ้งแอดมิน",
      ] },
      { h: "กฎ", items: [
        "ข้อมูลลูกค้าเป็นความลับ (PDPA): ห้ามคัดลอกหรือส่งต่อนอก CRM",
        "คุณจะเห็นเฉพาะลูกค้าที่มอบหมายให้คุณ ลูกค้าที่คุณสร้างเองจะเป็นของคุณอัตโนมัติ",
        "ห้ามสัญญาราคาหรือเงื่อนไขที่เจ้าของยังไม่ยืนยัน",
      ] },
    ],
  },
  ru: {
    title: "Как работать в CRM (памятка агента)",
    blocks: [
      { h: "Каждое утро", items: ["Открыть «Сегодня».", "Новому лиду — ответ в течение часа, максимум в тот же день."] },
      { h: "Лид", items: ["После каждого контакта — кнопка касания.", "Меняй стадию, ставь следующую задачу с датой, пиши заметки."] },
      { h: "Объекты", items: ["Каталог без контактов собственников; показ — через администратора.", "Новый объект — через «+ Новый объект»."] },
      { h: "Правила", items: ["Данные клиентов конфиденциальны (PDPA).", "Агент видит только свои лиды."] },
    ],
  },
};

/** Памятка агента на его языке (справочник /admin/guide агенту закрыт). */
export default async function AgentHelpPage() {
  const t = TEXT[await currentAdminLang()];
  return (
    <section className="max-w-2xl px-4 py-8 md:px-8" data-no-translate>
      <h1 className="text-2xl font-semibold text-forest-900">{t.title}</h1>
      {t.blocks.map((b) => (
        <div key={b.h} className="mt-6">
          <h2 className="text-sm font-semibold uppercase tracking-wide text-forest-900/60">{b.h}</h2>
          <ul className="mt-2 list-disc space-y-1.5 pl-5 text-sm text-forest-900/80">
            {b.items.map((i) => (
              <li key={i}>{i}</li>
            ))}
          </ul>
        </div>
      ))}
    </section>
  );
}
