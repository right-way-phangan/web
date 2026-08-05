import type { Metadata } from "next";
import Link from "next/link";
import { loadRunwayFromSheet } from "@/lib/data/finance-sheet";
import { receivablesSummary, fmtTHB } from "@/lib/data/finance";

export const metadata: Metadata = {
  title: "Дебиторка",
  robots: { index: false, follow: false },
};

export const dynamic = "force-dynamic";

function dueLabel(due: string): { text: string; soon: boolean; overdue: boolean } {
  if (!due) return { text: "—", soon: false, overdue: false };
  const d = new Date(due + "T00:00:00");
  if (Number.isNaN(d.getTime())) return { text: due, soon: false, overdue: false };
  const days = Math.round((d.getTime() - Date.now()) / 86_400_000);
  const fmt = d.toLocaleDateString("ru-RU", { day: "numeric", month: "short", year: "numeric" });
  if (days < 0) return { text: `${fmt} · просрочено`, soon: false, overdue: true };
  if (days <= 60) return { text: `${fmt} · через ${days} дн`, soon: true, overdue: false };
  return { text: fmt, soon: false, overdue: false };
}

export default async function ReceivablesPage() {
  const runway = await loadRunwayFromSheet();
  const summary = receivablesSummary(runway?.receivables ?? []);

  return (
    <section className="px-4 py-8 md:px-8">
      <div className="mx-auto max-w-2xl">
        <p className="text-xs font-medium uppercase tracking-[0.2em] text-brass-500">
          Admin · Финансы
        </p>
        <h1 className="mt-2 text-2xl font-semibold text-forest-900">Дебиторка — кто должен мне</h1>
        <p className="mb-6 mt-1 text-sm text-forest-900/60">
          Спасательный круг runway. Пришёл платёж — отметь в Telegram:{" "}
          <code className="rounded bg-cream-100 px-1">/received Игоря 325000</code> (остаток ↓, наличные ↑).
        </p>

        {runway == null || summary.count === 0 ? (
          <p className="rounded-md border border-amber-200 bg-amber-50 px-3 py-2 text-sm text-amber-700">
            {runway == null
              ? "Лист «Receivables» недоступен (нет ключей сервис-аккаунта)."
              : "✅ Непогашенной дебиторки нет."}
          </p>
        ) : (
          <>
            <div className="grid grid-cols-2 gap-3">
              <div className="rounded-xl border border-forest-900/10 bg-panel p-4">
                <p className="text-xs text-forest-900/50">Должны мне</p>
                <p className="mt-1 text-2xl font-semibold text-forest-900">{fmtTHB(summary.total)}</p>
                <p className="mt-0.5 text-xs text-forest-900/45">{summary.count} позиций</p>
              </div>
              <div className="rounded-xl border border-brass-500/30 bg-brass-500/[0.06] p-4">
                <p className="text-xs text-forest-900/50">Ближайший приход</p>
                {summary.nearest ? (
                  <>
                    <p className="mt-1 text-2xl font-semibold text-forest-900">
                      {fmtTHB(summary.nearest.thb)}
                    </p>
                    <p className="mt-0.5 text-xs text-forest-900/45">
                      {summary.nearest.from} · {dueLabel(summary.nearest.due).text}
                    </p>
                  </>
                ) : (
                  <p className="mt-1 text-forest-900/45">—</p>
                )}
              </div>
            </div>

            <ul className="mt-6 space-y-2">
              {summary.items.map((r) => {
                const dl = dueLabel(r.due);
                return (
                  <li key={r.from + r.due} className="rounded-xl border border-forest-900/10 bg-panel p-4">
                    <div className="flex items-baseline justify-between gap-3">
                      <p className="font-medium text-forest-900">{r.from}</p>
                      <p className="shrink-0 font-semibold text-forest-900">{fmtTHB(r.thb)}</p>
                    </div>
                    <p
                      className={
                        "mt-1 text-xs " +
                        (dl.overdue ? "text-red-600" : dl.soon ? "text-brass-600" : "text-forest-900/45")
                      }
                    >
                      {dl.text}
                      {r.note ? ` · ${r.note}` : ""}
                    </p>
                  </li>
                );
              })}
            </ul>
          </>
        )}

        <Link
          href="/admin/finance"
          className="mt-6 inline-block text-sm text-forest-900/55 hover:text-brass-600"
        >
          ← К финансовому дашборду
        </Link>
      </div>
    </section>
  );
}
