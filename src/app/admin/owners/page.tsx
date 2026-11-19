import type { Metadata } from "next";
import { getOwners } from "@/lib/data/owners";
import { OwnersBoard } from "@/components/admin/owners-board";

export const metadata: Metadata = {
  title: "Собственники",
  robots: { index: false, follow: false },
};
export const dynamic = "force-dynamic";

/**
 * Справочник собственников: кто владеет объектами и как с ним связаться.
 * Ход перепроверки — статус собственника; актуальность и цена каждого объекта —
 * в обзвоне (/admin/outreach). Целиком внутреннее.
 */
export default async function AdminOwnersPage() {
  const data = await getOwners();
  return (
    <section className="px-4 py-8 md:px-8">
      <h1 className="text-2xl font-semibold text-forest-900">Собственники</h1>
      <p className="mt-3 max-w-2xl text-sm text-forest-900/70">
        Один человек — одна карточка, к ней привязаны все его объекты. Отмечай каждое касание:
        статус и заметка с датой попадут в журнал. Объекты без собственника — отдельная вкладка:
        их цену и актуальность подтвердить не у кого.
      </p>
      <div className="mt-6">
        {data ? (
          <OwnersBoard owners={data.owners} unassigned={data.unassigned} />
        ) : (
          <p className="rounded-sm bg-red-50 px-3 py-2 text-sm text-red-700">
            Не удалось загрузить справочник (backend недоступен).
          </p>
        )}
      </div>
    </section>
  );
}
