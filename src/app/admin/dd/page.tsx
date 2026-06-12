import type { Metadata } from "next";
import { getAllObjects } from "@/lib/data/objects";
import { AdminNav } from "@/components/admin/admin-nav";
import { DdQueue, type DdRow } from "@/components/admin/dd-queue";

export const metadata: Metadata = {
  title: "DD · Проверки",
  robots: { index: false, follow: false },
};

export const dynamic = "force-dynamic";

/** Off-plan unit sub-rows (RW-P0001-3) — DD делается по родительскому проекту. */
function isUnit(rw: string): boolean {
  return /^RW-P\d+-\d+$/i.test(rw);
}

/**
 * DD-очередь (чек-лист DD v0.2, Phase 1.5 Listing Vetting): вердикт юриста по
 * каждому объекту каталога. Vetted/Full DD включают публичный бейдж на
 * странице объекта; Red flag — внутренний стоп. Сортировка: сначала видимые на
 * сайте без вердикта (они уже публичны — hero обещает "personally vetted").
 */
export default async function AdminDdPage() {
  const objects = await getAllObjects();

  const rows: DdRow[] = objects
    .filter((o) => !isUnit(o.rwNumber))
    .filter((o) => ["Active", "Reserved", "Hold"].includes(o.status))
    .map((o) => ({
      rwNumber: o.rwNumber,
      titleEn: o.titleEn,
      type: o.type,
      status: o.status,
      district: o.district,
      onSite: o.status === "Active" && !!o.coverImage,
      ddStatus: o.ddStatus,
      ddDate: o.ddDate,
      ddLawyer: o.ddLawyer,
    }))
    .sort((a, b) => {
      // публичные без вердикта — наверх: они уже на сайте, где hero обещает
      // "personally vetted"
      const aUrgent = a.onSite && !a.ddStatus ? 0 : 1;
      const bUrgent = b.onSite && !b.ddStatus ? 0 : 1;
      if (aUrgent !== bUrgent) return aUrgent - bUrgent;
      return a.rwNumber.localeCompare(b.rwNumber);
    });

  return (
    <section className="px-4 py-8 md:px-8">
      <AdminNav active="dd" />
      <h1 className="text-2xl font-semibold text-forest-900">DD · Проверки объектов</h1>
      <p className="mt-3 max-w-2xl text-sm text-forest-900/70">
        Listing Vetting (L1) по чек-листу DD v0.2: вердикт юриста по каждому
        объекту. Vetted и Full DD включают публичный бейдж на странице объекта;
        Red flag — внутренний стоп-сигнал. Дата ставится автоматически (Бангкок).
      </p>
      <div className="mt-6">
        <DdQueue rows={rows} defaultLawyer="Anas" />
      </div>
    </section>
  );
}
