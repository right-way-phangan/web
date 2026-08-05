import type { Metadata } from "next";
import Link from "next/link";
import { CRM_ENABLED } from "@/lib/data/leads";
import { ImportLeadsForm } from "@/components/crm/import-leads-form";

export const metadata: Metadata = {
  title: "CRM — импорт лидов",
  robots: { index: false, follow: false },
};

export const dynamic = "force-dynamic";

export default function ImportLeadsPage() {
  return (
    <section className="px-4 py-8 md:px-8">
      <Link href={{ pathname: "/admin/crm" }} className="text-xs text-forest-900/50 hover:text-forest-900">
        ← Доска лидов
      </Link>
      <h1 className="mt-2 text-2xl font-semibold text-forest-900 md:text-3xl">Импорт лидов из CSV</h1>
      <p className="mt-1 max-w-2xl text-sm text-forest-900/60">
        Записная книжка, выгрузка FB lead-form, старые контакты — пачкой в CRM. Первая строка
        файла — заголовки; распознаются колонки <code className="rounded bg-forest-900/5 px-1">name/имя</code>,{" "}
        <code className="rounded bg-forest-900/5 px-1">phone/телефон</code>,{" "}
        <code className="rounded bg-forest-900/5 px-1">email</code>,{" "}
        <code className="rounded bg-forest-900/5 px-1">note/заметка</code>,{" "}
        <code className="rounded bg-forest-900/5 px-1">source/источник</code>,{" "}
        <code className="rounded bg-forest-900/5 px-1">rw</code>,{" "}
        <code className="rounded bg-forest-900/5 px-1">pipeline</code> (land / villa_house).
        Дубли по телефону/email пропускаются автоматически, лиды получают тег{" "}
        <code className="rounded bg-forest-900/5 px-1">import</code> без авто-задачи. До 300 строк за раз.
      </p>

      <div className="mt-6">
        {CRM_ENABLED ? (
          <ImportLeadsForm />
        ) : (
          <p className="text-sm text-forest-900/55">CRM-бэкенд не подключён.</p>
        )}
      </div>
    </section>
  );
}
