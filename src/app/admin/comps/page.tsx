import type { Metadata } from "next";
import Link from "next/link";
import { getComps, byDistrict, daysOnMarket, median, type ExternalComp } from "@/lib/data/comps";
import { getAllObjects } from "@/lib/data/objects";
import type { RealEstateObject } from "@/types/object";

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

const PAGE_SIZE = 100;

export default async function CompsPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const raw = await searchParams;
  const sp = Object.fromEntries(
    Object.entries(raw).map(([k, v]) => [k, Array.isArray(v) ? v[0] : v]),
  ) as Record<string, string | undefined>;
  const [comps, objects] = await Promise.all([getComps(), getAllObjects()]);
  const active = comps.filter((c) => c.status === "active");
  const sold = comps.filter((c) => c.status === "sold");
  const gone = comps.filter((c) => c.status === "gone");
  const districts = byDistrict(comps);

  // Ценовое позиционирование: наши Active-участки vs медиана рынка ฿/рай по
  // району. Только земля (pricePerRai однозначен; у строений built-площадь в
  // каталоге неоднозначна). Пусто, пока компсы не наполнены.
  const marketPpr = new Map<string, number>();
  for (const d of districts) if (d.pricePerRai) marketPpr.set(d.district, d.pricePerRai);
  const ourPpr = (o: RealEstateObject): number | null => {
    if (o.pricePerRai && o.pricePerRai > 0) return o.pricePerRai;
    if (o.priceThb && o.areaRai && o.areaRai > 0) return o.priceThb / o.areaRai;
    return null;
  };
  const pricePosition = objects
    .filter((o) => o.type === "Land" && o.status === "Active" && o.district && marketPpr.has(o.district))
    .map((o) => {
      const our = ourPpr(o);
      const market = marketPpr.get(o.district as string) as number;
      if (our == null) return null;
      return { rw: o.rwNumber, district: o.district as string, our, market, deltaPct: Math.round(((our - market) / market) * 100) };
    })
    .filter((x): x is NonNullable<typeof x> => x != null && Math.abs(x.deltaPct) >= 15)
    .sort((a, b) => Math.abs(b.deltaPct) - Math.abs(a.deltaPct))
    .slice(0, 12);

  const landPpr = active
    .filter((c) => c.type === "Land" && c.areaRai && c.areaRai > 0)
    .map((c) => c.priceThb / (c.areaRai as number));
  const allDom = active.map(daysOnMarket).filter((x): x is number => x != null);

  // Фильтры ленты живут в URL: срез переживает F5 и уходит ссылкой коллеге.
  const fType = sp.t && sp.t !== "all" ? sp.t : "";
  const fDistrict = sp.d && sp.d !== "all" ? sp.d : "";
  const fStatus = sp.s && sp.s !== "all" ? sp.s : "";
  const feedFilters: Record<string, string> = {
    ...(fType ? { t: fType } : {}),
    ...(fDistrict ? { d: fDistrict } : {}),
    ...(fStatus ? { s: fStatus } : {}),
  };
  const feedAll = [...comps]
    .filter((c) => (!fType || c.type === fType) && (!fDistrict || c.district === fDistrict) && (!fStatus || c.status === fStatus))
    .sort((a, b) => (b.createdAt || "").localeCompare(a.createdAt || ""));
  const feedPages = Math.max(1, Math.ceil(feedAll.length / PAGE_SIZE));
  const feedPage = Math.min(Math.max(1, parseInt(sp.page ?? "1", 10) || 1), feedPages);
  const sorted = feedAll.slice((feedPage - 1) * PAGE_SIZE, feedPage * PAGE_SIZE);
  const feedTypes = [...new Set(comps.map((c) => c.type).filter(Boolean))].sort();
  const feedDistricts = [...new Set(comps.map((c) => c.district).filter(Boolean))].sort() as string[];
  const feedStatuses: { key: string; label: string }[] = [
    { key: "active", label: "🟢 активно" },
    { key: "sold", label: "🔴 продано" },
    { key: "gone", label: "⚪ ушло" },
  ];

  return (
    <section className="px-4 py-8 md:px-8">

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

          {/* Ценовое позиционирование: наши участки vs рынок */}
          {pricePosition.length > 0 ? (
            <div className="mt-10">
              <h2 className="mb-1 text-lg font-semibold text-forest-900">💰 Наши участки vs рынок</h2>
              <p className="mb-3 text-xs text-forest-900/50">
                Active-земля, где наша цена за рай заметно отличается от медианы конкурентов в районе.
                🔴 выше рынка — может не продаваться (пересмотреть с продавцом); 🟢 ниже — возможно,
                оставляем деньги. Сравнение только по земле.
              </p>
              <div className="space-y-2">
                {pricePosition.map((p) => (
                  <div
                    key={p.rw}
                    className="flex items-center justify-between gap-3 rounded-lg border border-forest-900/10 bg-cream-50 px-3 py-2"
                  >
                    <div className="min-w-0">
                      <a href={`/object/${p.rw}`} className="font-medium text-forest-900 hover:underline">{p.rw}</a>
                      <span className="ml-2 text-xs text-forest-900/50">{p.district}</span>
                      <div className="text-xs text-forest-900/55">
                        наша {thbM(p.our)}/рай · рынок {thbM(p.market)}/рай
                      </div>
                    </div>
                    <div className={"shrink-0 text-sm font-semibold " + (p.deltaPct > 0 ? "text-rose-600" : "text-emerald-600")}>
                      {p.deltaPct > 0 ? "🔴 +" : "🟢 "}{p.deltaPct}%
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ) : null}

          {/* Лента объявлений */}
          <div className="mt-10">
            <h2 className="mb-3 text-lg font-semibold text-forest-900">Объявления · {nf.format(comps.length)}</h2>

            <div className="mb-3 flex flex-wrap items-center gap-1.5 text-sm">
              <FeedChip label="Все типы" href={{ pathname: "/admin/comps", query: { ...feedFilters, t: undefined } }} on={!fType} />
              {feedTypes.map((t) => (
                <FeedChip key={t} label={t} href={{ pathname: "/admin/comps", query: { ...feedFilters, t, page: undefined } }} on={fType === t} />
              ))}
              <span className="mx-1 h-4 w-px bg-forest-900/15" />
              {feedStatuses.map((s) => (
                <FeedChip key={s.key} label={s.label} href={{ pathname: "/admin/comps", query: { ...feedFilters, s: s.key, page: undefined } }} on={fStatus === s.key} />
              ))}
              {fStatus ? (
                <FeedChip label="× статус" href={{ pathname: "/admin/comps", query: { ...feedFilters, s: undefined, page: undefined } }} on={false} />
              ) : null}
            </div>

            {feedDistricts.length > 1 ? (
              <div className="mb-3 flex flex-wrap items-center gap-1.5 text-sm">
                <FeedChip label="Все районы" href={{ pathname: "/admin/comps", query: { ...feedFilters, d: undefined } }} on={!fDistrict} />
                {feedDistricts.map((d) => (
                  <FeedChip key={d} label={d} href={{ pathname: "/admin/comps", query: { ...feedFilters, d, page: undefined } }} on={fDistrict === d} />
                ))}
              </div>
            ) : null}

            <p className="mb-2 text-xs text-forest-900/50">
              {feedAll.length === 0
                ? "Под фильтр ничего не попало"
                : `Показаны ${nf.format((feedPage - 1) * PAGE_SIZE + 1)}–${nf.format(Math.min(feedPage * PAGE_SIZE, feedAll.length))} из ${nf.format(feedAll.length)}`}
            </p>

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
                  {sorted.map((c: ExternalComp) => (
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

            {feedPages > 1 ? (
              <div className="mt-3 flex items-center gap-2 text-sm">
                {feedPage > 1 ? (
                  <FeedChip
                    label="← Назад"
                    href={{ pathname: "/admin/comps", query: { ...feedFilters, page: String(feedPage - 1) } }}
                    on={false}
                  />
                ) : null}
                <span className="text-forest-900/50">
                  Страница {feedPage} из {feedPages}
                </span>
                {feedPage < feedPages ? (
                  <FeedChip
                    label="Вперёд →"
                    href={{ pathname: "/admin/comps", query: { ...feedFilters, page: String(feedPage + 1) } }}
                    on={false}
                  />
                ) : null}
              </div>
            ) : null}
          </div>
        </>
      )}
    </section>
  );
}

/** Чип-ссылка фильтра ленты объявлений. */
function FeedChip({
  label,
  href,
  on,
}: {
  label: string;
  href: { pathname: string; query: Record<string, string | undefined> };
  on: boolean;
}) {
  return (
    <Link
      href={href as never}
      className={
        "rounded-full px-2.5 py-1 font-medium transition " +
        (on ? "bg-panel text-panel-fg" : "bg-forest-900/5 text-forest-900/70 hover:bg-forest-900/10")
      }
    >
      {label}
    </Link>
  );
}
