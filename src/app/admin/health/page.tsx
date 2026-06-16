import type { Metadata } from "next";
import Link from "next/link";
import type { Route } from "next";
import { AdminNav } from "@/components/admin/admin-nav";
import { getCatalogHealth } from "@/lib/data/catalog-health";

export const metadata: Metadata = {
  title: "Здоровье каталога",
  robots: { index: false, follow: false },
};

export const dynamic = "force-dynamic";

export default async function HealthPage() {
  const { checked, okObjects, checks } = await getCatalogHealth();
  const criticalCount = checks
    .filter((c) => c.severity === "critical")
    .reduce((n, c) => n + c.objects.length, 0);

  return (
    <section className="px-4 py-8 md:px-8">
      <AdminNav active="health" />
      <div className="max-w-4xl">
        <p className="text-xs font-medium uppercase tracking-[0.2em] text-brass-500">
          Admin · качество данных
        </p>
        <h1 className="mt-2 font-serif text-3xl text-forest-900">Здоровье каталога</h1>
        <p className="mt-3 max-w-2xl text-sm leading-relaxed text-forest-900/70">
          Пробелы в данных объектов «в обороте» (Active / Reserved / Hold), которые тихо ломают
          сайт или снижают доверие. Красное — чинить в первую очередь.
        </p>

        {/* Сводка */}
        <div className="mt-6 flex flex-wrap gap-3">
          <div className="rounded-2xl border border-forest-900/10 bg-white px-5 py-3">
            <p className="font-serif text-2xl text-forest-900">{okObjects}</p>
            <p className="text-xs text-forest-900/55">без замечаний из {checked}</p>
          </div>
          <div className="rounded-2xl border border-forest-900/10 bg-white px-5 py-3">
            <p className={"font-serif text-2xl " + (criticalCount ? "text-red-600" : "text-forest-500")}>
              {criticalCount}
            </p>
            <p className="text-xs text-forest-900/55">критичных пометок</p>
          </div>
        </div>

        {checks.length === 0 ? (
          <p className="mt-8 rounded-2xl border border-forest-500/30 bg-forest-500/[0.06] px-5 py-4 text-sm text-forest-900/80">
            ✓ Все объекты в обороте заполнены — пробелов не найдено.
          </p>
        ) : (
          <div className="mt-8 space-y-4">
            {checks.map((c) => {
              const crit = c.severity === "critical";
              return (
                <div
                  key={c.key}
                  className={
                    "rounded-2xl border bg-white p-5 " +
                    (crit ? "border-red-500/40" : "border-forest-900/10")
                  }
                >
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <h2 className="font-semibold text-forest-900">
                        <span className={crit ? "text-red-600" : "text-brass-600"}>
                          {crit ? "● " : "○ "}
                        </span>
                        {c.label}
                      </h2>
                      <p className="mt-1 text-sm text-forest-900/60">{c.hint}</p>
                    </div>
                    <span
                      className={
                        "shrink-0 rounded-full px-2.5 py-1 text-xs font-semibold " +
                        (crit ? "bg-red-50 text-red-600" : "bg-forest-900/5 text-forest-900/60")
                      }
                    >
                      {c.objects.length}
                    </span>
                  </div>
                  <div className="mt-3 flex flex-wrap gap-1.5">
                    {c.objects.map((o) => (
                      <Link
                        key={o.rwNumber}
                        href={{ pathname: "/admin/objects", query: { q: o.rwNumber } }}
                        title={`${o.titleEn} — открыть в Базе объектов для правки`}
                        className="inline-block rounded-full bg-forest-900/5 px-2.5 py-1 text-xs text-forest-900/75 transition hover:bg-forest-900/10 hover:text-forest-900"
                      >
                        {o.rwNumber}
                      </Link>
                    ))}
                  </div>
                </div>
              );
            })}
          </div>
        )}

        <p className="mt-8 text-xs text-forest-900/45">
          Клик по объекту открывает его в{" "}
          <Link href={"/admin/objects" as Route} className="text-forest-500 hover:text-brass-500">
            Базе объектов
          </Link>{" "}
          с правкой прямо в строке (✎). Как заводить и какие поля обязательны — в{" "}
          <Link href={"/admin/guide/objects" as Route} className="text-forest-500 hover:text-brass-500">
            справочнике
          </Link>
          .
        </p>
      </div>
    </section>
  );
}
