import type { Metadata } from "next";
import { AdminNav } from "@/components/admin/admin-nav";
import { getMetricsSeries, weekOverWeek, type SeriesPoint } from "@/lib/data/metrics";

export const metadata: Metadata = {
  title: "Тренды",
  robots: { index: false, follow: false },
};
export const dynamic = "force-dynamic";

const nf = new Intl.NumberFormat("ru-RU");

/** Inline SVG sparkline — no chart lib (matches FinanceTrend). */
function Sparkline({ values, w = 240, h = 44 }: { values: number[]; w?: number; h?: number }) {
  const max = Math.max(1, ...values);
  const n = values.length;
  const pts = values
    .map((v, i) => `${((i / Math.max(1, n - 1)) * w).toFixed(1)},${(h - (v / max) * (h - 4) - 2).toFixed(1)}`)
    .join(" ");
  const lastX = w;
  const lastY = h - (values[n - 1] / max) * (h - 4) - 2;
  return (
    <svg viewBox={`0 0 ${w} ${h}`} className="w-full" preserveAspectRatio="none" height={h}>
      <polyline points={pts} fill="none" stroke="currentColor" strokeWidth="1.5" className="text-brass-500" />
      <circle cx={lastX} cy={lastY} r="2.5" className="fill-brass-600" />
    </svg>
  );
}

function Delta({ pct }: { pct: number | null }) {
  if (pct === null) return <span className="text-forest-900/40">— нет базы</span>;
  const up = pct >= 0;
  return (
    <span className={up ? "text-emerald-600" : "text-rose-600"}>
      {up ? "▲" : "▼"} {Math.abs(pct)}% WoW
    </span>
  );
}

function MetricCard({
  label,
  hint,
  values,
}: {
  label: string;
  hint: string;
  values: number[];
}) {
  const { last, deltaPct } = weekOverWeek(values);
  return (
    <div className="rounded-2xl border border-forest-900/10 bg-cream-50 p-5">
      <div className="flex items-baseline justify-between">
        <p className="text-xs font-medium uppercase tracking-wide text-forest-900/45">{label}</p>
        <p className="text-xs font-medium"><Delta pct={deltaPct} /></p>
      </div>
      <p className="mt-1 text-3xl font-semibold text-forest-900">{nf.format(last)}</p>
      <p className="text-xs text-forest-900/50">за 7 дней · {hint}</p>
      <div className="mt-3">
        <Sparkline values={values} />
      </div>
    </div>
  );
}

export default async function TrendsPage() {
  const series = await getMetricsSeries(56);
  const col = (k: keyof SeriesPoint) => series.map((p) => Number(p[k] ?? 0));
  const hasData = series.some((p) => p.views || p.engagement || p.visits || p.leads);

  // Weekly buckets (last 8 weeks) for the summary table.
  const weeks: { label: string; views: number; engagement: number; visits: number; leads: number }[] = [];
  for (let w = 7; w >= 0; w--) {
    const slice = series.slice(Math.max(0, series.length - (w + 1) * 7), series.length - w * 7);
    if (!slice.length) continue;
    const sum = (k: keyof SeriesPoint) => slice.reduce((s, p) => s + Number(p[k] ?? 0), 0);
    weeks.push({
      label: w === 0 ? "эта неделя" : `−${w} нед`,
      views: sum("views"),
      engagement: sum("engagement"),
      visits: sum("visits"),
      leads: sum("leads"),
    });
  }

  return (
    <section className="px-4 py-8 md:px-8">
      <AdminNav active="trends" />

      <h1 className="font-serif text-3xl text-forest-900">Тренды</h1>
      <p className="mt-2 max-w-2xl text-sm text-forest-900/60">
        Растём или нет — временно́е измерение, которого нет на снимках-панелях. 56 дней по первичной
        телеметрии: просмотры объектов, целевые действия, заходы по каналам, новые лиды. WoW = эта
        неделя против прошлой.
      </p>

      {!hasData ? (
        <p className="mt-8 text-sm text-forest-900/50">
          Данных пока недостаточно для тренда — накопятся с трафиком за ближайшие дни.
        </p>
      ) : (
        <>
          <div className="mt-6 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
            <MetricCard label="Просмотры объектов" hint="карточки на сайте" values={col("views")} />
            <MetricCard label="Целевые действия" hint="клики в мессенджер · сохранения · формы" values={col("engagement")} />
            <MetricCard label="Заходы по каналам" hint="ИИ · поиск · соцсети · прямые" values={col("visits")} />
            <MetricCard label="Новые лиды" hint="во все воронки" values={col("leads")} />
          </div>

          <div className="mt-10">
            <h2 className="mb-3 text-lg font-semibold text-forest-900">По неделям</h2>
            <div className="overflow-x-auto">
              <table className="w-full min-w-[520px] text-sm">
                <thead>
                  <tr className="border-b border-forest-900/15 text-left text-xs uppercase tracking-wide text-forest-900/50">
                    <th className="py-2 pr-3">Неделя</th>
                    <th className="py-2 pr-3">Просмотры</th>
                    <th className="py-2 pr-3">Действия</th>
                    <th className="py-2 pr-3">Заходы</th>
                    <th className="py-2 pr-3">Лиды</th>
                  </tr>
                </thead>
                <tbody>
                  {weeks.map((wk) => (
                    <tr key={wk.label} className="border-b border-forest-900/5">
                      <td className="py-2 pr-3 font-medium text-forest-900">{wk.label}</td>
                      <td className="py-2 pr-3 text-forest-900/70">{nf.format(wk.views)}</td>
                      <td className="py-2 pr-3 text-forest-900/70">{nf.format(wk.engagement)}</td>
                      <td className="py-2 pr-3 text-forest-900/70">{nf.format(wk.visits)}</td>
                      <td className="py-2 pr-3 text-forest-900/70">{nf.format(wk.leads)}</td>
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
