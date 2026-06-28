import type { Metadata } from "next";
import { AdminNav } from "@/components/admin/admin-nav";
import { getComps, byDistrict, daysOnMarket, median, type ExternalComp } from "@/lib/data/comps";

export const metadata: Metadata = {
  title: "Рынок · компсы конкурентов",
  robots: { index: false, follow: false },
};
export const dynamic = "force-dynamic";

const nf = new Intl.NumberFormat("ru-RU");
const thb = (n: number) => `฿${nf.format(Math.round(n))}`;
/** Compact millions for per-rai land prices. */
const thbM = (n: number | null) => (n == null ? "—" : `฿${(n / 1_000_000).toFixed(2)}M`);

function Card({ label, value, hint }: { label: string; value: string; hint?: string }) {
  return (
    <div className="rounded-xl border border-forest-900/10 bg-cream-50 p-4">
      <div className="text-xs text-forest-900/50">{label}</div>
      <div className="mt-1 text-2xl font-semibold text-forest-900">{value}</div>
      {hint ? <div className="mt-0.5 text-xs text-forest-900/45">{hint}</div> : null}
    </div>
  );
}

function domBadge(dom: number | null): string {
  if (dom == null) return "—";
  if (dom >= 180) return `${dom} дн 🐌`;
  if (dom >= 90) return `${dom} дн`;
  return `${dom} дн`;
}

export default async function CompsPage() {
  const comps = await getComps();
  const active = comps.filter((c) => c.status === "active");
  const sold = comps.filter((c) => c.status === "sold");
  const gone = comps.filter((c) => c.status === "gone");
  const districts = byDistrict(comps);

  const landPpr = active
    .filter((c) => c.type === "Land" && c.areaRai && c.areaRai > 0)
    .map((c) => c.priceThb / (c.areaRai as number));
  const allDom = active.map(daysOnMarket).filter((x): x is number => x != null);

  const sorted = [...comps].sort((a, b) => (b.createdAt || "").localeCompare(a.createdAt || ""));

  return (
    <section className="px-4 py-8 md:px-8">
      <AdminNav active="comps" />

      <h1 className="font-serif text-3xl text-forest-900">Рынок · компсы конкурентов</h1>
      <p className="mt-2 max-w-2xl text-sm text-forest-900/60">
        Объявления конкурентов на продажу (Панган) — по чём выставлены аналоги и как долго висят.
        Кормит <a href="/admin/valuation" className="underline">RW Оценку</a> и переговоры с продавцами.
        Наполняется пайплайном <code className="text-xs">analytics/comps</code> (скрейп + ручной CSV).
      </p>

      {comps.length === 0 ? (
        <p className="mt-8 text-sm text-forest-900/50">
          Компсов пока нет. Заполни через пайплайн <code>analytics/comps/run.py</code> или вручную
          на <a href="/admin/valuation" className="underline">/admin/valuation</a>.
        </p>
      ) : (
        <>
          <div className="mt-6 grid grid-cols-2 gap-3 md:grid-cols-4">
            <Card label="Активных объявлений" value={nf.format(active.length)} hint={`продано ${sold.length} · ушло ${gone.length}`} />
            <Card label="Медиана цены земли" value={thbM(median(landPpr))} hint="฿/рай, активные" />
            <Card label="Медиана на рынке" value={allDom.length ? `${median(allDom)} дн` : "—"} hint="дней в листинге (активные)" />
            <Card label="Районов охвачено" value={nf.format(districts.length)} hint="с активными компсами" />
          </div>

          {/* По районам: цена и ликвидность */}
          <div className="mt-10">
            <h2 className="mb-1 text-lg font-semibold text-forest-900">Районы · цена и ликвидность</h2>
            <p className="mb-3 text-xs text-forest-900/50">
              Медианы по активным объявлениям. Долгий «на рынке» = низкая ликвидность сегмента (или
              переоценка). Земля — ฿/рай, строения — ฿/м².
            </p>
            <div className="overflow-x-auto">
              <table className="w-full min-w-[640px] text-sm">
                <thead>
                  <tr className="border-b border-forest-900/15 text-left text-xs uppercase tracking-wide text-forest-900/50">
                    <th className="py-2 pr-3">Район</th>
                    <th className="py-2 pr-3">Земля ฿/рай</th>
                    <th className="py-2 pr-3">Участков</th>
                    <th className="py-2 pr-3">Строения ฿/м²</th>
                    <th className="py-2 pr-3">Объектов</th>
                    <th className="py-2 pr-3">Медиана на рынке</th>
                  </tr>
                </thead>
                <tbody>
                  {districts.map((d) => (
                    <tr key={d.district} className="border-b border-forest-900/5">
                      <td className="py-2 pr-3 font-medium text-forest-900">{d.district}</td>
                      <td className="py-2 pr-3">{thbM(d.pricePerRai)}</td>
                      <td className="py-2 pr-3 text-forest-900/60">{d.landCount || "—"}</td>
                      <td className="py-2 pr-3">{d.pricePerSqm ? thb(d.pricePerSqm) : "—"}</td>
                      <td className="py-2 pr-3 text-forest-900/60">{d.builtCount || "—"}</td>
                      <td className="py-2 pr-3 text-forest-900/60">{d.medianDom != null ? `${d.medianDom} дн` : "—"}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Лента объявлений */}
          <div className="mt-10">
            <h2 className="mb-3 text-lg font-semibold text-forest-900">Объявления · {nf.format(comps.length)}</h2>
            <div className="overflow-x-auto">
              <table className="w-full min-w-[760px] text-sm">
                <thead>
                  <tr className="border-b border-forest-900/15 text-left text-xs uppercase tracking-wide text-forest-900/50">
                    <th className="py-2 pr-3">Тип</th>
                    <th className="py-2 pr-3">Район</th>
                    <th className="py-2 pr-3">Площадь</th>
                    <th className="py-2 pr-3">Цена</th>
                    <th className="py-2 pr-3">Статус</th>
                    <th className="py-2 pr-3">На рынке</th>
                    <th className="py-2 pr-3">Источник</th>
                  </tr>
                </thead>
                <tbody>
                  {sorted.slice(0, 200).map((c: ExternalComp) => (
                    <tr key={c.id} className="border-b border-forest-900/5">
                      <td className="py-2 pr-3 text-forest-900/80">{c.type}</td>
                      <td className="py-2 pr-3 text-forest-900/80">{c.district || "—"}</td>
                      <td className="py-2 pr-3 text-forest-900/60">
                        {c.type === "Land"
                          ? c.areaRai
                            ? `${c.areaRai} рай`
                            : "—"
                          : c.builtSqm
                            ? `${c.builtSqm} м²${c.bedrooms ? ` · ${c.bedrooms} сп` : ""}`
                            : c.bedrooms
                              ? `${c.bedrooms} сп`
                              : "—"}
                      </td>
                      <td className="py-2 pr-3 font-medium text-forest-900">{thb(c.priceThb)}</td>
                      <td className="py-2 pr-3 text-forest-900/60">
                        {c.status === "active" ? "🟢 активно" : c.status === "sold" ? "🔴 продано" : "⚪ ушло"}
                      </td>
                      <td className="py-2 pr-3 text-forest-900/60">{domBadge(daysOnMarket(c))}</td>
                      <td className="py-2 pr-3">
                        {c.sourceUrl ? (
                          <a href={c.sourceUrl} target="_blank" rel="noopener noreferrer" className="text-brass-600 underline">
                            ссылка
                          </a>
                        ) : (
                          <span className="text-forest-900/40">ручной</span>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </>
      )}
    </section>
  );
}
