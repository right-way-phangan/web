import type { Metadata } from "next";
import Link from "next/link";
import type { Route } from "next";
import { ObjectForm } from "@/components/forms/object-form";
import { AdminNav } from "@/components/admin/admin-nav";

export const metadata: Metadata = {
  title: "Новый объект",
  robots: { index: false, follow: false },
};

// Admin intake is dynamic + never cached — it writes to the own DB.
export const dynamic = "force-dynamic";

export default function NewObjectPage() {
  return (
    <section className="container-prose py-12 md:py-16">
      <AdminNav active="new" />
      <div className="mb-8">
        <p className="text-xs font-medium uppercase tracking-[0.2em] text-brass-500">
          Admin · приём объектов
        </p>
        <h1 className="mt-2 text-2xl font-semibold text-forest-900 md:text-3xl">
          Новый объект
        </h1>
        <p className="mt-2 max-w-2xl text-sm text-forest-900/70">
          Заполните поля, нажмите «Предпросмотр», проверьте карточку и опубликуйте. Карточка
          создаётся в своей БД и попадает в каталог сайта. RW-номер присваивается автоматически.
        </p>
        {/* Подсказка в момент действия: ключевые правила приёма + ссылка на регламент */}
        <div className="mt-4 max-w-2xl rounded-xl border border-brass-500/30 bg-brass-500/[0.06] px-4 py-3 text-sm text-forest-900/80">
          <p className="font-semibold text-forest-900">Перед заполнением — коротко:</p>
          <ul className="mt-1.5 space-y-1">
            <li>📸 Фото идут в <strong>PHOTOS</strong> (публично), документы/чертежи — в <strong>DOCS</strong> (непублично).</li>
            <li>🔴 Скриншоты прайсов и комиссий застройщика — <strong>не загружать никуда</strong> (конфиденциально).</li>
            <li>📍 Заполняй координаты, площадь и дату — без них объект «слепой» (см. <Link href={"/admin/health" as Route} className="text-forest-500 hover:text-brass-500">Здоровье каталога</Link>).</li>
          </ul>
          <p className="mt-2">
            Полный регламент —{" "}
            <Link href={"/admin/guide/objects" as Route} className="font-medium text-forest-500 hover:text-brass-500">
              справочник · Объекты
            </Link>
            .
          </p>
        </div>
      </div>
      <ObjectForm />
    </section>
  );
}
