import type { Metadata } from "next";
import { getAllObjects } from "@/lib/data/objects";
import { OutreachList, type OutreachRow } from "@/components/admin/outreach-list";

export const metadata: Metadata = {
  title: "Обзвон собственников",
  robots: { index: false, follow: false },
};

export const dynamic = "force-dynamic";

function nf(n: number): string {
  return new Intl.NumberFormat("en-US").format(Math.round(n));
}

/**
 * Колл-режим кампании актуализации RW-L лотов (задача из «мои задачи»):
 * подтвердить актуальность/цену, неактуальные → Archive, согласных — в
 * leasehold-трек. Приоритет: лоты с дырами в данных (район/фото/цена) —
 * наверх, их уточнять в первую очередь.
 */
export default async function AdminOutreachPage() {
  const objects = await getAllObjects();

  const rows: OutreachRow[] = objects
    .filter((o) => o.type === "Land")
    .filter((o) => ["Active", "Reserved", "Hold"].includes(o.status))
    .map((o) => {
      const missing: string[] = [];
      if (!o.district) missing.push("район");
      if (!o.coverImage) missing.push("фото");
      if (!o.priceThb && !o.pricePerRai && !o.rentPerMonth && !o.rentPerRaiMonth) missing.push("цена");
      if (!o.areaRai && !o.areaSqm && !o.areaNote) missing.push("площадь");
      return {
        rwNumber: o.rwNumber,
        titleEn: o.titleEn,
        district: o.district,
        areaLabel: o.areaRai
          ? `${o.areaRai} rai`
          : o.areaSqm
            ? `${nf(o.areaSqm)} m²`
            : (o.areaNote ?? "площадь?"),
        priceLabel: o.priceThb
          ? `฿${nf(o.priceThb)}`
          : o.pricePerRai
            ? `฿${nf(o.pricePerRai)}/rai`
            : o.rentPerMonth
              ? `฿${nf(o.rentPerMonth)}/mo`
              : o.rentPerRaiMonth
                ? `฿${nf(o.rentPerRaiMonth)}/rai·mo`
                : "цена?",
        contacts: o.contacts ?? [],
        onSite: o.status === "Active" && !!o.coverImage,
        missing,
        outreachStatus: o.outreachStatus,
        outreachNote: o.outreachNote,
        outreachDate: o.outreachDate,
        outreachAttempts: o.outreachAttempts,
      };
    })
    .sort((a, b) => {
      // не звонили — раньше отработанных; внутри: больше дыр в данных — выше
      const aDone = a.outreachStatus && a.outreachStatus !== "no_answer" ? 1 : 0;
      const bDone = b.outreachStatus && b.outreachStatus !== "no_answer" ? 1 : 0;
      if (aDone !== bDone) return aDone - bDone;
      if (a.missing.length !== b.missing.length) return b.missing.length - a.missing.length;
      return a.rwNumber.localeCompare(b.rwNumber);
    });

  return (
    <section className="px-4 py-8 md:px-8">
      <h1 className="text-2xl font-semibold text-forest-900">Обзвон собственников</h1>
      <p className="mt-3 max-w-2xl text-sm text-forest-900/70">
        Кампания актуализации земельных лотов: подтвердить продажу и цену,
        неактуальные — в архив (объект уходит с сайта), согласных на аренду — в
        leasehold-трек. Красным — что уточнить в звонке. Контакт собственника
        сохраняется при выходе из поля; заметка прикрепляется к итогу звонка.
      </p>
      <div className="mt-6">
        <OutreachList rows={rows} />
      </div>
    </section>
  );
}
