import type { Metadata } from "next";
import Link from "next/link";
import { getSearchConsole, opportunities, type GscRow } from "@/lib/data/search-console";

export const metadata: Metadata = {
  title: "SEO · Search Console",
  robots: { index: false, follow: false },
};
export const dynamic = "force-dynamic";

const nf = new Intl.NumberFormat("ru-RU");
const pct = (x: number) => `${(x * 100).toFixed(1)}%`;
const pos = (x: number) => x.toFixed(1);

function Card({ label, value, hint }: { label: string; value: string; hint?: string }) {
  return (
    <div className="rounded-xl border border-forest-900/10 bg-cream-50 p-4">
      <div className="text-xs text-forest-900/50">{label}</div>
      <div className="mt-1 text-2xl font-semibold text-forest-900">{value}</div>
      {hint ? <div className="mt-0.5 text-xs text-forest-900/45">{hint}</div> : null}
    </div>
  );
}

function Rows({ rows, label }: { rows: GscRow[]; label: string }) {
  return (
    <div className="overflow-x-auto">
      <table className="w-full min-w-[640px] text-sm">
        <thead>
          <tr className="border-b border-forest-900/15 text-left text-xs uppercase tracking-wide text-forest-900/50">
            <th className="py-2 pr-3">{label}</th>
            <th className="py-2 pr-3">Клики</th>
            <th className="py-2 pr-3">Показы</th>
            <th className="py-2 pr-3">CTR</th>
            <th className="py-2 pr-3">Позиция</th>
          </tr>
        </thead>
        <tbody>
          {rows.map((r, i) => (
            <tr key={i} className="border-b border-forest-900/5">
              <td className="py-2 pr-3 text-forest-900/85">
                {r.page ? (
                  <a href={r.page} target="_blank" rel="noopener noreferrer" className="truncate underline">
                    {r.page}
                  </a>
                ) : (
                  r.query
                )}
              </td>
              <td className="py-2 pr-3 font-medium text-forest-900">{nf.format(r.clicks)}</td>
              <td className="py-2 pr-3 text-forest-900/60">{nf.format(r.impressions)}</td>
              <td className="py-2 pr-3 text-forest-900/60">{pct(r.ctr)}</td>
              <td className="py-2 pr-3 text-forest-900/60">{pos(r.position)}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

export default function SeoPage() {
  const d = getSearchConsole();
  const opps = opportunities(d);

  return (
    <section className="px-4 py-8 md:px-8">

      <h1 className="font-serif text-3xl text-forest-900">SEO · Search Console</h1>
      <p className="mt-2 max-w-2xl text-sm text-forest-900/60">
        По каким запросам Google нас реально показывает и какие страницы выдаёт — SEO-сторона ставки
        на GEO/AEO (дополняет блок «AI цитирует страницы» в{" "}
        <Link href="/admin/crm/stats" className="underline">метриках</Link>). Данные — из Google Search
        Console за {d.range}, обновляются пайплайном <code className="text-xs">analytics/search_console</code>.
      </p>

      {!d.updated ? (
        <div className="mt-8 rounded-xl border border-brass-500/30 bg-cream-50 p-5 text-sm text-forest-900/70">
          <p className="font-medium text-forest-900">Search Console ещё не подключён.</p>
          <p className="mt-2">Чтобы данные пошли (инструкция — в{" "}
            <Link href="/admin/guide/seo" className="underline">справочнике</Link>):</p>
          <ol className="mt-2 list-decimal space-y-1 pl-5">
            <li>Подтвердить домен rightwaygroup.co в Google Search Console.</li>
            <li>Создать service-account в Google Cloud, включить Search Console API.</li>
            <li>Добавить email сервис-аккаунта как пользователя в Search Console.</li>
            <li>Запустить <code>analytics/search_console/fetch_gsc.py</code> с ключом → JSON закоммитится → деплой.</li>
          </ol>
        </div>
      ) : (
        <>
          <div className="mt-2 text-xs text-forest-900/40">Обновлено: {d.updated}</div>
          <div className="mt-4 grid grid-cols-2 gap-3 md:grid-cols-4">
            <Card label="Клики" value={nf.format(d.totals.clicks)} hint={`за ${d.range}`} />
            <Card label="Показы" value={nf.format(d.totals.impressions)} />
            <Card label="CTR" value={pct(d.totals.ctr)} />
            <Card label="Средняя позиция" value={pos(d.totals.position)} />
          </div>

          {opps.length > 0 ? (
            <div className="mt-10">
              <h2 className="mb-1 text-lg font-semibold text-forest-900">Быстрые победы</h2>
              <p className="mb-3 text-xs text-forest-900/50">
                Много показов, позиция 5–20 — Google уже показывает нас, не хватает чуть-чуть, чтобы
                получить клик. Доработать эти страницы/запросы — самый дешёвый трафик.
              </p>
              <Rows rows={opps} label="Запрос" />
            </div>
          ) : null}

          <div className="mt-10">
            <h2 className="mb-3 text-lg font-semibold text-forest-900">Топ запросов</h2>
            <Rows rows={d.queries.slice(0, 30)} label="Запрос" />
          </div>

          <div className="mt-10">
            <h2 className="mb-3 text-lg font-semibold text-forest-900">Топ страниц</h2>
            <Rows rows={d.pages.slice(0, 30)} label="Страница" />
          </div>
        </>
      )}
    </section>
  );
}
