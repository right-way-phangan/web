import type { Metadata } from "next";
import { getDemandSummary, DEMAND_ENABLED, type DemandTally } from "@/lib/data/demand";
import { getAllObjects } from "@/lib/data/objects";
import type { RealEstateObject } from "@/types/object";

export const metadata: Metadata = {
  title: "Спрос",
  robots: { index: false, follow: false },
};

export const dynamic = "force-dynamic";

/**
 * Demand intelligence — what visitors search/filter for on /listings vs what we
 * actually hold. Data: backend GET /demand/summary (search_events) + own
 * catalog. The "gap" is the point: high demand + low inventory = what to acquire.
 */

const WINDOWS = [30, 90, 180] as const;

function nf(n: number): string {
  return new Intl.NumberFormat("ru-RU").format(n);
}

function Card({ label, value, hint }: { label: string; value: string; hint?: string }) {
  return (
    <div className="rounded-xl border border-forest-900/10 bg-cream-50 p-4">
      <p className="text-xs uppercase tracking-wide text-forest-900/45">{label}</p>
      <p className="mt-1.5 text-2xl font-semibold text-forest-900">{value}</p>
      {hint ? <p className="mt-1 text-xs text-forest-900/50">{hint}</p> : null}
    </div>
  );
}

function BarList({ rows, max }: { rows: DemandTally[]; max: number }) {
  if (rows.length === 0) return <p className="text-sm text-forest-900/45">Пока нет данных.</p>;
  return (
    <div className="space-y-2">
      {rows.map((r) => {
        const pct = max > 0 ? Math.max(4, Math.round((r.count / max) * 100)) : 0;
        return (
          <div key={r.name} className="flex items-center gap-3 text-sm">
            <span className="w-40 shrink-0 truncate text-forest-900/75">{r.name}</span>
            <div className="h-4 flex-1 rounded-sm bg-forest-900/[0.04]">
              <div className="h-4 rounded-sm bg-brass-500/60" style={{ width: `${pct}%` }} />
            </div>
            <span className="w-8 shrink-0 text-right font-medium text-forest-900">{r.count}</span>
          </div>
        );
      })}
    </div>
  );
}

export default async function DemandPage({
  searchParams,
}: {
  searchParams: Promise<{ days?: string }>;
}) {
  if (!DEMAND_ENABLED) {
    return (
      <section className="container-prose py-12">
        <h1 className="text-2xl font-semibold text-forest-900">Спрос</h1>
        <p className="mt-3 text-sm text-forest-900/70">Backend не подключён (OBJECTS_API_URL).</p>
      </section>
    );
  }

  const sp = await searchParams;
  const days = WINDOWS.includes(Number(sp.days) as (typeof WINDOWS)[number])
    ? Number(sp.days)
    : 90;

  const [demand, objects] = await Promise.all([getDemandSummary(days), getAllObjects()]);

  // Inventory: active, public-eligible objects per district / type.
  const live = objects.filter((o: RealEstateObject) => o.status === "Active");
  const invByDistrict = new Map<string, number>();
  const invByType = new Map<string, number>();
  for (const o of live) {
    if (o.district) invByDistrict.set(o.district, (invByDistrict.get(o.district) ?? 0) + 1);
    invByType.set(o.type, (invByType.get(o.type) ?? 0) + 1);
  }

  // Demand-vs-inventory gap by district: searched a lot, hold little = acquire.
  const gap = demand.byDistrict
    .map((d) => ({ name: d.name, demand: d.count, inventory: invByDistrict.get(d.name) ?? 0 }))
    .sort((a, b) => b.demand - a.demand);

  const maxType = demand.byType[0]?.count ?? 0;
  const maxFeature = demand.byFeature[0]?.count ?? 0;

  // Лист закупки: дефицитные районы, ранжированные по потенциалу комиссии.
  // Комиссия на сделку = max(5% от медианной цены каталога; 150k THB). Потенциал
  // = число ищущих × комиссия (верхняя оценка — не все купят, но для приоритета).
  const livePrices = live
    .map((o: RealEstateObject) => o.priceThb)
    .filter((p): p is number => typeof p === "number" && p > 0)
    .sort((a, b) => a - b);
  const avgDeal = livePrices.length ? livePrices[Math.floor(livePrices.length / 2)] : 8_000_000;
  const commissionPerDeal = Math.max(avgDeal * 0.05, 150_000);
  const wishlist = gap
    .filter((g) => g.demand >= 2 && g.inventory <= g.demand)
    .map((g) => ({ ...g, potential: g.demand * commissionPerDeal }))
    .sort((a, b) => b.potential - a.potential)
    .slice(0, 6);
  const fmtTHB = (n: number) =>
    n >= 1_000_000 ? `฿${(n / 1_000_000).toFixed(1)}M` : `฿${nf(Math.round(n / 1000))}k`;

  return (
    <section className="px-4 py-8 md:px-8">
      <div className="mb-6 flex flex-wrap items-end justify-between gap-3">
        <div>
          <p className="text-xs font-medium uppercase tracking-[0.2em] text-brass-500">
            Admin · Аналитика
          </p>
          <h1 className="mt-2 text-2xl font-semibold text-forest-900 md:text-3xl">Спрос</h1>
          <p className="mt-1 text-sm text-forest-900/60">
            Что ищут и фильтруют на сайте — против того, что у нас есть. Источник: поиск/фильтры
            (своя БД), не зависит от блокировщиков. Пусто, пока не накопятся обращения.
          </p>
        </div>
        <div className="flex shrink-0 gap-1.5">
          {WINDOWS.map((w) => (
            <a
              key={w}
              href={`/admin/demand?days=${w}`}
              className={
                "rounded-full px-3 py-1.5 text-sm font-medium transition " +
                (w === days
                  ? "bg-panel text-panel-fg"
                  : "bg-forest-900/5 text-forest-900/70 hover:bg-forest-900/10")
              }
            >
              {w}д
            </a>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-2 gap-3 md:grid-cols-4">
        <Card label="Всего запросов" value={nf(demand.total)} hint={`за ${days} дней`} />
        <Card label="NL-поиск" value={nf(demand.nlCount)} hint="фразой" />
        <Card label="Фильтры" value={nf(demand.filterCount)} hint="через панель" />
        <Card
          label="Без результата"
          value={nf(demand.zeroResultQueries.reduce((s, q) => s + q.count, 0))}
          hint="искали — у нас нет"
        />
      </div>

      {/* Лист закупки — дефицит, ранжированный по потенциалу комиссии */}
      {wishlist.length > 0 ? (
        <div className="mt-8 rounded-2xl border border-brass-500/30 bg-brass-500/[0.06] p-5">
          <h2 className="text-lg font-semibold text-forest-900">🛒 Лист закупки — что искать в первую очередь</h2>
          <p className="mb-3 text-xs text-forest-900/55">
            Где спрос есть, а инвентаря нет — ранжировано по потенциалу комиссии (ищущих × ≈
            {fmtTHB(commissionPerDeal)} за сделку, медиана каталога). Верхняя оценка — приоритет сорсинга, не прогноз.
          </p>
          <div className="space-y-2">
            {wishlist.map((g, i) => (
              <div
                key={g.name}
                className="flex items-center justify-between gap-3 rounded-lg border border-forest-900/10 bg-cream-50 px-3 py-2"
              >
                <div className="min-w-0">
                  <span className="font-medium text-forest-900">
                    {i === 0 ? "🥇 " : ""}{g.name}
                  </span>
                  <div className="text-xs text-forest-900/55">
                    {g.demand} ищут · {g.inventory} в каталоге{g.inventory === 0 ? " ⚠️" : ""}
                  </div>
                </div>
                <div className="shrink-0 text-right">
                  <div className="text-sm font-semibold text-brass-600">~{fmtTHB(g.potential)}</div>
                  <div className="text-xs text-forest-900/45">потенциал</div>
                </div>
              </div>
            ))}
          </div>
          {demand.zeroResultQueries.length > 0 ? (
            <p className="mt-3 text-xs text-forest-900/55">
              Плюс конкретные запросы без результата:{" "}
              {demand.zeroResultQueries.slice(0, 4).map((q) => `«${q.query}»`).join(", ")} — точечные цели.
            </p>
          ) : null}
        </div>
      ) : null}

      {/* Gap: demand vs inventory by district */}
      <div className="mt-8">
        <h2 className="mb-1 text-lg font-semibold text-forest-900">
          Районы: спрос против инвентаря
        </h2>
        <p className="mb-3 text-xs text-forest-900/50">
          Много спроса при малом инвентаре (красным) — кандидат на пополнение каталога.
        </p>
        {gap.length === 0 ? (
          <p className="text-sm text-forest-900/45">Пока нет запросов по районам.</p>
        ) : (
          <div className="overflow-x-auto rounded-xl border border-forest-900/10">
            <table className="w-full min-w-[480px] text-sm">
              <thead>
                <tr className="border-b border-forest-900/10 bg-forest-900/[0.03] text-left text-xs uppercase tracking-wide text-forest-900/50">
                  <th className="px-3 py-2 font-medium">Район</th>
                  <th className="px-3 py-2 text-center font-medium">Спрос</th>
                  <th className="px-3 py-2 text-center font-medium">В каталоге (Active)</th>
                  <th className="px-3 py-2 text-center font-medium">Сигнал</th>
                </tr>
              </thead>
              <tbody>
                {gap.map((g) => {
                  const shortage = g.demand >= 3 && g.inventory <= 1;
                  return (
                    <tr key={g.name} className="border-b border-forest-900/5">
                      <td className="px-3 py-2 text-forest-900/85">{g.name}</td>
                      <td className="px-3 py-2 text-center font-medium text-forest-900">{g.demand}</td>
                      <td className="px-3 py-2 text-center text-forest-900/70">{g.inventory}</td>
                      <td className="px-3 py-2 text-center">
                        {shortage ? (
                          <span className="rounded-full bg-red-100 px-2 py-0.5 text-xs font-semibold text-red-700">
                            выкупать
                          </span>
                        ) : g.inventory === 0 ? (
                          <span className="rounded-full bg-amber-100 px-2 py-0.5 text-xs font-medium text-amber-700">
                            нет в каталоге
                          </span>
                        ) : (
                          <span className="text-forest-900/30">—</span>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      <div className="mt-8 grid gap-8 lg:grid-cols-3">
        <div>
          <h2 className="mb-3 text-lg font-semibold text-forest-900">Типы объектов</h2>
          <BarList rows={demand.byType} max={maxType} />
        </div>
        <div>
          <h2 className="mb-3 text-lg font-semibold text-forest-900">Фичи</h2>
          <BarList rows={demand.byFeature} max={maxFeature} />
        </div>
        <div>
          <h2 className="mb-3 text-lg font-semibold text-forest-900">Ценовые диапазоны</h2>
          <BarList
            rows={demand.priceBands}
            max={Math.max(0, ...demand.priceBands.map((b) => b.count))}
          />
          <h3 className="mb-2 mt-5 text-sm font-semibold text-forest-900/80">Спальни</h3>
          <BarList rows={demand.byBeds} max={Math.max(0, ...demand.byBeds.map((b) => b.count))} />
        </div>
      </div>

      {/* Вид владения + язык аудитории — стратегические срезы спроса */}
      <div className="mt-8 grid gap-8 lg:grid-cols-2">
        <div>
          <h2 className="mb-1 text-lg font-semibold text-forest-900">Вид владения (спрос)</h2>
          <p className="mb-3 text-xs text-forest-900/50">
            Что фильтруют — freehold или leasehold. Сверка со ставкой на leasehold-пивот: спрос её
            подтверждает или спорит.
          </p>
          <BarList rows={demand.byTenure} max={Math.max(0, ...demand.byTenure.map((b) => b.count))} />
        </div>
        <div>
          <h2 className="mb-1 text-lg font-semibold text-forest-900">Язык аудитории</h2>
          <p className="mb-3 text-xs text-forest-900/50">
            EN/RU у тех, кто ищет — кого больше. Обе версии делаем всё равно сразу, но виден перекос
            аудитории.
          </p>
          <BarList rows={demand.byLocale} max={Math.max(0, ...demand.byLocale.map((b) => b.count))} />
        </div>
      </div>

      <div className="mt-8 grid gap-8 lg:grid-cols-2">
        <div>
          <h2 className="mb-3 text-lg font-semibold text-forest-900">Топ NL-запросов</h2>
          {demand.topQueries.length === 0 ? (
            <p className="text-sm text-forest-900/45">Пока нет запросов фразой.</p>
          ) : (
            <ul className="space-y-1.5 text-sm">
              {demand.topQueries.map((q) => (
                <li
                  key={q.query}
                  className="flex items-center justify-between gap-3 rounded-md bg-forest-900/[0.02] px-3 py-1.5"
                >
                  <span className="truncate text-forest-900/80">{q.query}</span>
                  <span className="shrink-0 text-xs text-forest-900/50">
                    {q.count}× · {q.matched}/{q.count} нашлось
                  </span>
                </li>
              ))}
            </ul>
          )}
        </div>
        <div>
          <h2 className="mb-1 text-lg font-semibold text-forest-900">Искали — не нашли</h2>
          <p className="mb-3 text-xs text-forest-900/50">
            Запросы без результата — прямой список того, чего не хватает в каталоге.
          </p>
          {demand.zeroResultQueries.length === 0 ? (
            <p className="text-sm text-forest-900/45">Все запросы что-то находили. 👍</p>
          ) : (
            <ul className="space-y-1.5 text-sm">
              {demand.zeroResultQueries.map((q) => (
                <li
                  key={q.query}
                  className="flex items-center justify-between gap-3 rounded-md bg-red-50 px-3 py-1.5"
                >
                  <span className="truncate text-red-900/80">{q.query}</span>
                  <span className="shrink-0 text-xs text-red-700/70">{q.count}×</span>
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>
    </section>
  );
}
