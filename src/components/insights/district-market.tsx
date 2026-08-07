import Link from "next/link";
import type { Route } from "next";
import { TrendingUp, ArrowRight } from "lucide-react";
import {
  getRentalMarket,
  type DistrictMarket as DistrictMarketData,
  fmtThb,
} from "@/lib/data/rental-market";
import type { Locale } from "@/lib/i18n/dictionaries";

const DM = {
  en: {
    eyebrow: "Rental market here",
    title: (name: string) => `What homes earn in ${name}`,
    rank: (rank: number, count: number) => `#${rank} of ${count} on the island`,
    medianNightly: "Median nightly rate",
    comps: (n: number) => `${n} comps`,
    annualIncome: "Est. annual income",
    perYr: (v: string) => `${v}/yr`,
    atOcc: (pct: number, booked: number | null) =>
      `at ${pct}% base occupancy${booked != null ? ` · ${booked}% booked now` : ""}`,
    landPrice: "Land price",
    perSqm: (v: string) => `${v}/m²`,
    fromLand: "from our land listings",
    noLand: "no land comps yet",
    byBedrooms: "By bedrooms:",
    studio: "Studio",
    br: (n: number) => `${n} BR`,
    fullData: "Full market data",
    modelRoi: "Model the ROI",
    footnote: (sample: number, date: string) =>
      `Median of ${sample} Airbnb listings · ${date}. Annual income uses a base occupancy assumption; “booked now” is current forward-90d availability of active listings. See the full report for method.`,
  },
  ru: {
    eyebrow: "Рынок аренды здесь",
    title: (name: string) => `Сколько зарабатывают объекты в ${name}`,
    rank: (rank: number, count: number) => `#${rank} из ${count} на острове`,
    medianNightly: "Медианная ставка за ночь",
    comps: (n: number) => `${n} ${pluralComps(n)}`,
    annualIncome: "Ориент. годовой доход",
    perYr: (v: string) => `${v}/год`,
    atOcc: (pct: number, booked: number | null) =>
      `при ${pct}% базовой загрузке${booked != null ? ` · занято ${booked}%` : ""}`,
    landPrice: "Цена земли",
    perSqm: (v: string) => `${v}/м²`,
    fromLand: "по нашим земельным объявлениям",
    noLand: "пока нет земельных данных",
    byBedrooms: "По спальням:",
    studio: "Студия",
    br: (n: number) => `${n} спал.`,
    fullData: "Все данные рынка",
    modelRoi: "Смоделировать ROI",
    footnote: (sample: number, date: string) =>
      `Медиана по ${sample} объявлениям Airbnb · ${date}. Годовой доход — при допущении базовой загрузки; «занято» — текущая доступность активных объектов на 90 дней вперёд. Метод — в полном отчёте.`,
  },
} as const;

function pluralComps(n: number): string {
  const mod10 = n % 10;
  const mod100 = n % 100;
  if (mod10 === 1 && mod100 !== 11) return "объект";
  if (mod10 >= 2 && mod10 <= 4 && (mod100 < 12 || mod100 > 14)) return "объекта";
  return "объектов";
}

/**
 * Rental-market panel for a /districts/[slug] page: how much homes here earn
 * per night, where the district ranks on the island, estimated annual income,
 * and the local land price per m² (own listings). Bridges the district guide to
 * the full /insights report and the ROI calculator.
 */
export function DistrictMarketPanel({
  dm,
  locale = "en",
}: {
  dm: DistrictMarketData;
  locale?: Locale;
}) {
  const t = DM[locale];
  const base = locale === "ru" ? "/ru" : "";
  const meta = getRentalMarket().meta;
  const { district: d } = dm;

  return (
    <section className="container-prose pb-16 md:pb-20">
      <div className="rounded-sm border border-brass-300/40 bg-gradient-to-br from-cream-50 to-brass-200/15 p-7 md:p-9">
        <div className="flex flex-wrap items-end justify-between gap-3">
          <div>
            <p className="inline-flex items-center gap-1.5 text-[0.8125rem] font-medium uppercase tracking-eyebrow text-brass-500">
              <TrendingUp className="h-4 w-4" />
              {t.eyebrow}
            </p>
            <h2 className="mt-3 font-serif text-2xl text-forest-900 md:text-3xl">{t.title(d.name)}</h2>
          </div>
          <span className="rounded-full bg-forest-500/8 px-3 py-1 text-xs font-medium text-forest-900">
            {t.rank(dm.islandRank, dm.islandCount)}
          </span>
        </div>

        <div className="mt-6 grid gap-4 sm:grid-cols-3">
          <Stat
            label={t.medianNightly}
            value={fmtThb(d.adrMedian)}
            sub={`${t.comps(d.n)}${d.adrP25 && d.adrP75 ? ` · ${fmtThb(d.adrP25)}–${fmtThb(d.adrP75)}` : ""}`}
          />
          <Stat
            label={t.annualIncome}
            value={t.perYr(fmtThb(dm.annualThb, true))}
            sub={t.atOcc(dm.baseOccPct, dm.measuredOcc != null ? Math.round(dm.measuredOcc * 100) : null)}
          />
          <Stat
            label={t.landPrice}
            value={dm.landPerSqm ? t.perSqm(fmtThb(dm.landPerSqm)) : "—"}
            sub={dm.landPerSqm ? t.fromLand : t.noLand}
          />
        </div>

        {dm.bedroomConfigs.length > 0 ? (
          <div className="mt-5 flex flex-wrap items-center gap-2">
            <span className="text-xs text-forest-500/60">{t.byBedrooms}</span>
            {dm.bedroomConfigs.map((b) => (
              <span
                key={b.bedrooms}
                className="rounded-full bg-cream-50 px-3 py-1 text-xs font-medium text-forest-900 ring-1 ring-forest-500/10"
              >
                {b.bedrooms === 0 ? t.studio : t.br(b.bedrooms)} {fmtThb(b.adrMedian)}
              </span>
            ))}
          </div>
        ) : null}

        <div className="mt-6 flex flex-wrap gap-4">
          <Link
            href={`${base}/insights` as Route}
            className="inline-flex items-center gap-1.5 text-sm font-medium text-forest-500 hover:text-brass-500"
          >
            {t.fullData}
            <ArrowRight className="h-3.5 w-3.5" />
          </Link>
          <Link
            href={`${base}/calculator?mode=rent` as Route}
            className="inline-flex items-center gap-1.5 text-sm font-medium text-forest-500 hover:text-brass-500"
          >
            {t.modelRoi}
            <ArrowRight className="h-3.5 w-3.5" />
          </Link>
        </div>
        <p className="mt-3 text-[11px] text-forest-500/45">{t.footnote(meta.sample, meta.date)}</p>
      </div>
    </section>
  );
}

function Stat({ label, value, sub }: { label: string; value: string; sub?: string }) {
  return (
    <div className="rounded-sm bg-cream-50/70 p-4">
      <div className="text-[11px] uppercase tracking-wider text-forest-500/55">{label}</div>
      <div className="mt-1 text-xl font-semibold tabular-nums text-forest-900">{value}</div>
      {sub ? <div className="mt-0.5 text-[11px] text-forest-500/55">{sub}</div> : null}
    </div>
  );
}
