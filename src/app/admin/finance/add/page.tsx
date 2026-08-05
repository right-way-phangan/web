import type { Metadata } from "next";
import Link from "next/link";
import { AddTransactionForm } from "@/components/admin/add-transaction-form";

export const metadata: Metadata = {
  title: "Добавить трату",
  robots: { index: false, follow: false },
  // Отдельный PWA-фокус: иконка «RW Финансы» открывается прямо на этой форме
  // (переопределяет admin-манифест RW CRM из layout).
  manifest: "/finance-manifest.json",
  appleWebApp: {
    capable: true,
    title: "RW Финансы",
    statusBarStyle: "default",
  },
};

export const dynamic = "force-dynamic";

const ERR: Record<string, string> = {
  amount: "Введи сумму больше нуля.",
  save: "Не удалось записать. Проверь, что сервис-аккаунт — Редактор финансовой таблицы.",
};

export default async function AddTransactionPage({
  searchParams,
}: {
  searchParams: Promise<{ err?: string }>;
}) {
  const { err } = await searchParams;
  return (
    <section className="px-4 py-8 md:px-8">
      <div className="mx-auto max-w-md">
        <p className="text-xs font-medium uppercase tracking-[0.2em] text-brass-500">Admin · Финансы</p>
        <h1 className="mt-2 text-2xl font-semibold text-forest-900">Добавить трату</h1>
        <p className="mb-6 mt-1 text-sm text-forest-900/60">
          Сфера и категория задают разрез личное/бизнес в дашборде. Запись уходит в лист{" "}
          <code>Transactions</code> финансовой таблицы.
        </p>
        {err && ERR[err] && (
          <p className="mb-4 rounded-md border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-600">
            {ERR[err]}
          </p>
        )}
        <AddTransactionForm />
        <div className="mt-5 rounded-xl border border-forest-900/10 bg-cream-50 px-4 py-3 text-xs text-forest-900/55">
          📲 <strong className="text-forest-900/75">Иконка на телефон:</strong> в Safari нажми
          «Поделиться» → «На экран Домой». Появится иконка «RW Финансы», которая открывает сразу эту
          форму на весь экран — быстрый ввод текстом и диктовкой.
        </div>
        <Link
          href="/admin/finance"
          className="mt-4 inline-block text-sm text-forest-900/55 hover:text-brass-600"
        >
          ← К финансовому дашборду
        </Link>
      </div>
    </section>
  );
}
