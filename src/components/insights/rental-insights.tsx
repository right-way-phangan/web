"use client";

import { useState, type ReactNode } from "react";
import Link from "next/link";
import type { Route } from "next";
import {
  Lock,
  TrendingUp,
  Waves,
  BedDouble,
  Home,
  ArrowRight,
  Info,
  CheckCircle2,
  Award,
  Hammer,
  Building2,
  Scale,
  CheckCircle,
  AlertTriangle,
} from "lucide-react";
import { LeadForm } from "@/components/forms/lead-form";
import { useLocale, localeHref } from "@/lib/i18n/use-locale";
import { pluralRu } from "@/lib/i18n/dictionaries";
import {
  type RentalMarket,
  type RmSeasonal,
  type RmCrossCheck,
  type DisplayCurrency,
  type MoneyFmt,
  type InventoryYieldRow,
  DISTRICT_PAGE_SLUGS,
  makeMoneyFmt,
  effectiveAnnualThb,
  measuredOccupancy,
  confidenceOf,
} from "@/lib/data/rental-market";

/* ------------------------------ i18n dict ------------------------------ */

const INS = {
  en: {
    dataRefreshing: "Market data is being refreshed — check back shortly.",
    // snapshot strip
    listingsAnalysed: "Listings analysed",
    source: "Sources",
    snapshot: "Snapshot",
    activeOcc: "Active occupancy (90d)",
    // source mix + triangulation
    dedupNote: (collected: number, unique: number) =>
      `${collected.toLocaleString("en-US")} collected · ${unique.toLocaleString("en-US")} unique after dedup`,
    triangulationEyebrow: "Cross-source check",
    triangulationTitle: "Price triangulation",
    triangulationNote:
      "Median nightly rate for the same villa market, by platform. When independent platforms land on the same number, trust it.",
    agree: (pct: number) => `Platforms agree — within ±${pct}%`,
    diverge: (pct: number) => `Platforms diverge — ${pct}% spread`,
    sourceN: (n: number) => `${n.toLocaleString("en-US")} listings`,
    supplyUnder: "Under-supplied",
    supplySaturated: "Saturated",
    yieldSuffix: (pct: number) => ` · ${pct}% income-on-land`,
    yieldNote:
      "“Income-on-land” = estimated annual income ÷ the cost of a reference 400 m² plot in that district (build cost excluded) — an indicative land-value signal, not a full yield.",
    // teaser
    freePreview: "Free preview",
    teaserTitle: "Top districts to build for rental",
    teaserNote: "Median nightly rate (ADR) of entire-home listings, by district.",
    topPick: "Top pick",
    poolPremium: (pct: number): ReactNode => (
      <>
        Listings with a pool command a{" "}
        <strong className="text-forest-900">+{pct}%</strong> nightly premium.
      </>
    ),
    teaserSub: (n: number, annual: string, basePct: number, booked: number | null) =>
      `${n} listings · est. ${annual}/yr at ${basePct}% base${
        booked != null ? ` · ${booked}% booked now` : ""
      }`,
    // gate
    fullReportEyebrow: "Full report",
    unlockEyebrow: "Unlock the full report",
    gateTitle: "The complete build-to-rent picture",
    gateNote:
      "All districts, premiums by feature, rates by property type and bedroom count, plus the assumptions behind every number.",
    unlockedConfirm: "Report unlocked — thanks. We'll be in touch.",
    // build recommendation
    whatDataSuggests: "What the data suggests",
    featurePhrase: {
      pool: "a pool",
      private_pool: "a private pool",
      sea_view: "a sea view",
      beachfront: "a beachfront location",
      luxury: "a luxury finish",
    } as Record<string, string>,
    homeWord: "home",
    configLabel: (bedrooms: number | null, typeLabel: string | null) => {
      const type = typeLabel ? typeLabel.toLowerCase() : "home";
      if (bedrooms == null) return type;
      return `${bedrooms === 0 ? "studio" : `${bedrooms}-bedroom`} ${type}`;
    },
    buildSentence: (p: {
      config: ReactNode;
      feat: string | null;
      district: string;
      nightly: string;
      annual: string;
      basePct: number;
      booked: number | null;
    }): ReactNode => (
      <>
        Build a <strong>{p.config}</strong>
        {p.feat ? (
          <>
            {" "}
            with <strong>{p.feat}</strong>
          </>
        ) : null}{" "}
        in <strong>{p.district}</strong>. It&apos;s the island&apos;s strongest nightly market — a
        median of <strong>{p.nightly}/night</strong>, an estimated <strong>{p.annual}/year</strong>{" "}
        at {p.basePct}% base occupancy
        {p.booked != null ? ` (currently ${p.booked}% booked)` : ""}.
      </>
    ),
    pillAdds: (label: string, pct: number) => `${label} adds +${pct}%`,
    pillHighestType: (label: string) => `${label} = highest ADR type`,
    pillComps: (n: number, district: string) => `${n} comps in ${district}`,
    modelThisRoi: "Model this in the ROI calculator",
    // inventory
    ourXmarket: "Our listings × the market",
    invTitle: "What our listings could earn",
    invNote:
      "Active Right Way listings matched to their district's nightly rate — gross and net yield (net is after 25% management + 3% opex). An indication, not a guarantee.",
    netSuffix: (pct: number) => `${pct}% net`,
    brSuffix: (n: number) => ` · ${n} BR`,
    bookedNow: (pct: number) => ` · ${pct}% booked now`,
    mPrice: "Price",
    mGross: "Gross",
    mNet: "Net",
    mPayback: "Payback",
    paybackY: (n: number) => `${n}y`,
    invFootnote:
      "Gross = district median ADR × 365 × base occupancy ÷ price. Net deducts 25% management + 3% opex. “Booked now” = current forward-90d availability of active listings. Land excluded.",
    // full report
    sortLabels: {
      adr: "Nightly rate",
      annual: "Annual income",
      yield: "Income-on-land",
      sample: "Sample size",
      name: "Name A–Z",
    } as Record<DistrictSort, string>,
    subAllDistricts: "Nightly rate by district — all districts",
    subByType: "Nightly rate by property type",
    subByBedroom: "Nightly rate by bedroom count",
    subWhatRaises: "What raises the nightly rate",
    subDistrictBedroom: "District × bedroom configurations (sample ≥2)",
    bedroomNote: "Bedroom counts are parsed from listing text where stated — a partial sample.",
    nListings: (n: number) => `${n} listings`,
    districtSub: (n: number, p25p75: string | null, annual: string, booked: number | null) =>
      `${n} listings · ${p25p75 ? `${p25p75} p25–p75 · ` : ""}est. ${annual}/yr${
        booked != null ? ` · ${booked}% booked now` : ""
      }`,
    typeSub: (n: number, rating: number | null) =>
      `${n} listings${rating ? ` · ★ ${rating}` : ""}`,
    featureSub: (withStr: string, withoutStr: string, nWith: number, nWithout: number) =>
      `${withStr} vs ${withoutStr} · ${nWith} with / ${nWithout} without`,
    bedroomLabel: (n: number) => (n === 0 ? "Studio" : `${n} bedroom${n > 1 ? "s" : ""}`),
    brShort: (n: number) => (n === 0 ? "Studio" : `${n} BR`),
    thDistrict: "District",
    thBedrooms: "Bedrooms",
    thAdrMedian: "ADR median",
    thN: "n",
    perNightShort: " /night",
    capexText: (source: string, perSqm: string, nSale: number): ReactNode => (
      <>
        <strong>CapEx reference:</strong>{" "}
        {source === "own_land" ? "median land price" : "median sale price"} {perSqm}/m²
        {source === "own_land" ? ` across ${nSale} Right Way land listings` : ` (${nSale} listings)`}.
        Land is the big build-to-rent CapEx line — pair it with the annual-revenue column above for a
        rough yield-on-cost.
      </>
    ),
    ctaTitle: "Turn this into your own projection",
    ctaBody:
      "The ROI calculator is wired to this data — pick a district and property type and it fills in the nightly rate and occupancy automatically.",
    ctaButton: "Open the ROI calculator",
    // seasonality
    seasonalTrend: "Seasonal trend",
    collecting: (n: number): ReactNode => (
      <>
        Collecting monthly snapshots — <strong>{n}</strong> so far. The seasonal ADR trend (high vs
        low season) appears once we have at least two months. A fresh snapshot runs on the 1st of
        each month.
      </>
    ),
    island: "Island",
    seasonalOverTime: "Seasonal trend — nightly rate over time",
    // methodology
    methodSummary: "Method & assumptions",
    methodBullets: (meta: RentalMarket["meta"]): ReactNode[] => [
      <>
        Data is a snapshot of <strong>{meta.sample}</strong> unique entire-home listings on Koh
        Phangan ({meta.date}), priced in {meta.currency}, collected across{" "}
        {(meta.sources ?? []).map((s) => s.label).join(", ") || "Airbnb"} and de-duplicated by
        location and name so a villa listed on several platforms counts once. Internal research, not
        republished data.
      </>,
      <>
        <strong>Price triangulation:</strong> each platform&apos;s median nightly rate is compared —
        when independent sources agree (small spread), confidence in the figure is higher. Coordinate
        data is richest on Airbnb/Vrbo, so district-level cuts lean on those; Booking/Agoda mainly
        validate the island-wide price.
      </>,
      <>
        <strong>Annual income uses an assumed base occupancy</strong> of{" "}
        {Math.round(meta.occupancy.base * 100)}% — one forward 90-day window (often low season)
        can&apos;t stand in for a full year, so we don&apos;t let it drive the headline. Scenarios:{" "}
        {Math.round(meta.occupancy.conservative * 100)}/{Math.round(meta.occupancy.base * 100)}/
        {Math.round(meta.occupancy.high * 100)}%.
      </>,
      <>
        <strong>&ldquo;Booked now&rdquo;</strong> is a current-demand signal: the share of the next
        ~90 days that&apos;s unavailable, measured from each listing&apos;s calendar, across{" "}
        <em>active</em> listings only (≥5 reviews). The long tail of dormant listings (no reviews)
        sits near 0% and is excluded — including them understates real demand.
      </>,
      <>
        <strong>Net yield</strong> deducts 25% management and 3% opex from gross. Demand is also
        proxied by review counts and guest-favorite share.
      </>,
      <>
        Confidence dots reflect sample size per district (
        <span className="inline-block h-1.5 w-1.5 rounded-full bg-forest-500 align-middle" /> high
        ≥12 ·{" "}
        <span className="inline-block h-1.5 w-1.5 rounded-full bg-brass-400 align-middle" /> medium
        ≥5 ·{" "}
        <span className="inline-block h-1.5 w-1.5 rounded-full bg-brass-400/50 align-middle" /> low
        &lt;5). Treat low-sample districts as indicative only.
      </>,
      <>
        District is assigned by listing coordinates (nearest centroid); Airbnb coarsens some
        coordinates, so it&apos;s approximate. Bedrooms/features come from listing text.
      </>,
      <>Prices reflect the snapshot date and season — re-run monthly for seasonal trends.</>,
    ],
    // unlock card
    unlockHeadline: (n: number) => `Get the full ${n}-listing breakdown`,
    unlockBody:
      "Leave your email and the complete report opens instantly — every district, the premium each feature commands, rates by type and bedroom count, and the method behind it. No marketing emails; we'll only follow up about your project if you ask.",
    unlockSubmit: "Unlock the report",
    unlockDefaultMessage:
      "Please send me the Koh Phangan rental-market report. I'm interested in building / buying for rental.",
  },
  ru: {
    dataRefreshing: "Данные рынка обновляются — загляните чуть позже.",
    listingsAnalysed: "Проанализировано объявлений",
    source: "Источники",
    snapshot: "Срез",
    activeOcc: "Активная загрузка (90д)",
    dedupNote: (collected: number, unique: number) =>
      `${collected.toLocaleString("ru-RU")} собрано · ${unique.toLocaleString("ru-RU")} уникальных после дедупа`,
    triangulationEyebrow: "Кросс-проверка источников",
    triangulationTitle: "Триангуляция цены",
    triangulationNote:
      "Медианная ставка за ночь по одному и тому же рынку вилл, по площадкам. Когда независимые площадки сходятся на одной цифре — ей можно доверять.",
    agree: (pct: number) => `Площадки сходятся — в пределах ±${pct}%`,
    diverge: (pct: number) => `Площадки расходятся — разброс ${pct}%`,
    sourceN: (n: number) => `${n.toLocaleString("ru-RU")} ${pluralRu(n, "объект", "объекта", "объектов")}`,
    supplyUnder: "Мало предложения",
    supplySaturated: "Насыщен",
    yieldSuffix: (pct: number) => ` · ${pct}% дохода к земле`,
    yieldNote:
      "«Доход к земле» = ориентировочный годовой доход ÷ стоимость эталонного участка 400 м² в районе (без стоимости стройки) — индикатор ценности земли, а не полная доходность.",
    freePreview: "Бесплатный обзор",
    teaserTitle: "Лучшие районы для строительства под аренду",
    teaserNote: "Медианная ставка за ночь (ADR) по объектам целиком, по районам.",
    topPick: "Топ-выбор",
    poolPremium: (pct: number): ReactNode => (
      <>
        Объекты с бассейном получают наценку{" "}
        <strong className="text-forest-900">+{pct}%</strong> к ставке за ночь.
      </>
    ),
    teaserSub: (n: number, annual: string, basePct: number, booked: number | null) =>
      `${n} ${pluralRu(n, "объявление", "объявления", "объявлений")} · ориент. ${annual}/год при ${basePct}% базовой${
        booked != null ? ` · занято ${booked}%` : ""
      }`,
    fullReportEyebrow: "Полный отчёт",
    unlockEyebrow: "Откройте полный отчёт",
    gateTitle: "Полная картина строительства под аренду",
    gateNote:
      "Все районы, наценки по характеристикам, ставки по типам и числу спален, плюс допущения за каждой цифрой.",
    unlockedConfirm: "Отчёт открыт — спасибо. Мы свяжемся с вами.",
    whatDataSuggests: "Что подсказывают данные",
    featurePhrase: {
      pool: "бассейном",
      private_pool: "собственным бассейном",
      sea_view: "видом на море",
      beachfront: "выходом на пляж",
      luxury: "люксовой отделкой",
    } as Record<string, string>,
    homeWord: "дом",
    configLabel: (bedrooms: number | null, typeLabel: string | null) => {
      const type = typeWordRu(typeLabel);
      if (bedrooms == null) return type;
      if (bedrooms === 0) return `${type}-студию`;
      return `${type} на ${bedrooms} ${pluralRu(bedrooms, "спальню", "спальни", "спален")}`;
    },
    buildSentence: (p: {
      config: ReactNode;
      feat: string | null;
      district: string;
      nightly: string;
      annual: string;
      basePct: number;
      booked: number | null;
    }): ReactNode => (
      <>
        Постройте <strong>{p.config}</strong>
        {p.feat ? (
          <>
            {" "}
            с <strong>{p.feat}</strong>
          </>
        ) : null}{" "}
        в районе <strong>{p.district}</strong>. Это сильнейший рынок посуточной аренды на острове —
        медиана <strong>{p.nightly}/ночь</strong>, ориентировочно <strong>{p.annual}/год</strong> при
        базовой загрузке {p.basePct}%
        {p.booked != null ? ` (сейчас занято ${p.booked}%)` : ""}.
      </>
    ),
    pillAdds: (label: string, pct: number) => `${label}: +${pct}%`,
    pillHighestType: (label: string) => `${label} — самый дорогой тип`,
    pillComps: (n: number, district: string) =>
      `${n} ${pluralRu(n, "объект", "объекта", "объектов")} в ${district}`,
    modelThisRoi: "Смоделировать в ROI-калькуляторе",
    ourXmarket: "Наши объекты × рынок",
    invTitle: "Сколько могут зарабатывать наши объекты",
    invNote:
      "Активные объекты Right Way, сопоставленные со ставкой их района — валовая и чистая доходность (чистая — после 25% управления + 3% операционных). Ориентир, не гарантия.",
    netSuffix: (pct: number) => `${pct}% чистыми`,
    brSuffix: (n: number) => ` · ${n} спал.`,
    bookedNow: (pct: number) => ` · занято ${pct}%`,
    mPrice: "Цена",
    mGross: "Валовая",
    mNet: "Чистая",
    mPayback: "Окупаемость",
    paybackY: (n: number) => `${n} ${pluralRu(n, "год", "года", "лет")}`,
    invFootnote:
      "Валовая = медианный ADR района × 365 × базовая загрузка ÷ цена. Чистая вычитает 25% управления + 3% операционных. «Занято» = текущая доступность активных объектов на 90 дней вперёд. Земля исключена.",
    sortLabels: {
      adr: "Ставка за ночь",
      annual: "Годовой доход",
      yield: "Доход к земле",
      sample: "Размер выборки",
      name: "По названию",
    } as Record<DistrictSort, string>,
    subAllDistricts: "Ставка за ночь по районам — все районы",
    subByType: "Ставка за ночь по типу объекта",
    subByBedroom: "Ставка за ночь по числу спален",
    subWhatRaises: "Что повышает ставку за ночь",
    subDistrictBedroom: "Конфигурации район × спальни (выборка ≥2)",
    bedroomNote:
      "Число спален извлечено из текста объявлений, где указано — частичная выборка.",
    nListings: (n: number) => `${n} ${pluralRu(n, "объявление", "объявления", "объявлений")}`,
    districtSub: (n: number, p25p75: string | null, annual: string, booked: number | null) =>
      `${n} ${pluralRu(n, "объявление", "объявления", "объявлений")} · ${
        p25p75 ? `${p25p75} p25–p75 · ` : ""
      }ориент. ${annual}/год${booked != null ? ` · занято ${booked}%` : ""}`,
    typeSub: (n: number, rating: number | null) =>
      `${n} ${pluralRu(n, "объявление", "объявления", "объявлений")}${rating ? ` · ★ ${rating}` : ""}`,
    featureSub: (withStr: string, withoutStr: string, nWith: number, nWithout: number) =>
      `${withStr} против ${withoutStr} · ${nWith} с / ${nWithout} без`,
    bedroomLabel: (n: number) =>
      n === 0 ? "Студия" : `${n} ${pluralRu(n, "спальня", "спальни", "спален")}`,
    brShort: (n: number) => (n === 0 ? "Студия" : `${n} спал.`),
    thDistrict: "Район",
    thBedrooms: "Спальни",
    thAdrMedian: "Медиана ADR",
    thN: "n",
    perNightShort: " /ночь",
    capexText: (source: string, perSqm: string, nSale: number): ReactNode => (
      <>
        <strong>Справка по CapEx:</strong>{" "}
        {source === "own_land" ? "медианная цена земли" : "медианная цена продажи"} {perSqm}/м²
        {source === "own_land"
          ? ` по ${nSale} ${pluralRu(nSale, "участку", "участкам", "участкам")} Right Way`
          : ` (${nSale} ${pluralRu(nSale, "объявление", "объявления", "объявлений")})`}
        . Земля — главная статья капзатрат при строительстве под аренду; сопоставьте её с колонкой
        годового дохода выше для грубой доходности на капитал.
      </>
    ),
    ctaTitle: "Превратите это в свой прогноз",
    ctaBody:
      "ROI-калькулятор связан с этими данными — выберите район и тип объекта, и он сам подставит ставку за ночь и загрузку.",
    ctaButton: "Открыть ROI-калькулятор",
    seasonalTrend: "Сезонный тренд",
    collecting: (n: number): ReactNode => (
      <>
        Собираем ежемесячные срезы — пока <strong>{n}</strong>. Сезонный тренд ставки (высокий vs
        низкий сезон) появится, когда наберётся хотя бы два месяца. Новый срез снимается 1-го числа
        каждого месяца.
      </>
    ),
    island: "Остров",
    seasonalOverTime: "Сезонный тренд — ставка за ночь во времени",
    methodSummary: "Метод и допущения",
    methodBullets: (meta: RentalMarket["meta"]): ReactNode[] => [
      <>
        Данные — срез <strong>{meta.sample}</strong> уникальных объявлений (объект целиком) на Ко
        Пангане ({meta.date}), в валюте {meta.currency}, собранных по площадкам{" "}
        {(meta.sources ?? []).map((s) => s.label).join(", ") || "Airbnb"} и схлопнутых по координатам
        и названию — вилла с нескольких площадок считается один раз. Внутреннее исследование, не
        перепубликация чужих данных.
      </>,
      <>
        <strong>Триангуляция цены:</strong> медианная ставка каждой площадки сравнивается — когда
        независимые источники сходятся (малый разброс), доверие к цифре выше. Координаты богаче всего
        у Airbnb/Vrbo, поэтому район-срезы опираются на них; Booking/Agoda в основном подтверждают
        островную цену.
      </>,
      <>
        <strong>Годовой доход берётся при допущении базовой загрузки</strong>{" "}
        {Math.round(meta.occupancy.base * 100)}% — одно окно в 90 дней вперёд (часто низкий сезон) не
        может заменить полный год, поэтому мы не делаем его заголовком. Сценарии:{" "}
        {Math.round(meta.occupancy.conservative * 100)}/{Math.round(meta.occupancy.base * 100)}/
        {Math.round(meta.occupancy.high * 100)}%.
      </>,
      <>
        <strong>«Занято»</strong> — сигнал текущего спроса: доля ближайших ~90 дней, что недоступны,
        измеренная по календарю каждого объявления, только по <em>активным</em> объектам (≥5
        отзывов). Длинный хвост спящих объявлений (без отзывов) держится около 0% и исключён — их учёт
        занижал бы реальный спрос.
      </>,
      <>
        <strong>Чистая доходность</strong> вычитает 25% управления и 3% операционных из валовой. Спрос
        также оценивается по числу отзывов и доле «гостевой выбор».
      </>,
      <>
        Точки уверенности отражают размер выборки по району (
        <span className="inline-block h-1.5 w-1.5 rounded-full bg-forest-500 align-middle" /> высокая
        ≥12 ·{" "}
        <span className="inline-block h-1.5 w-1.5 rounded-full bg-brass-400 align-middle" /> средняя
        ≥5 ·{" "}
        <span className="inline-block h-1.5 w-1.5 rounded-full bg-brass-400/50 align-middle" /> низкая
        &lt;5). Районы с малой выборкой — только как ориентир.
      </>,
      <>
        Район присваивается по координатам объявления (ближайший центроид); Airbnb огрубляет часть
        координат, поэтому приблизительно. Спальни/характеристики — из текста объявления.
      </>,
      <>Цены отражают дату среза и сезон — перезапускайте ежемесячно для сезонных трендов.</>,
    ],
    unlockHeadline: (n: number) => `Получите полную разбивку по ${n} объявлениям`,
    unlockBody:
      "Оставьте email — и полный отчёт откроется сразу: каждый район, наценка за каждую характеристику, ставки по типам и числу спален, и метод за ними. Без рекламных рассылок; напишем по вашему проекту только если попросите.",
    unlockSubmit: "Открыть отчёт",
    unlockDefaultMessage:
      "Пришлите, пожалуйста, отчёт по рынку аренды Ко Пангана. Интересует строительство / покупка под аренду.",
  },
} as const;

/** Translate an English property-type label to a Russian noun for the build sentence. */
function typeWordRu(label: string | null): string {
  if (!label) return "дом";
  const l = label.toLowerCase();
  if (l.includes("villa")) return "виллу";
  if (l.includes("apart") || l.includes("condo")) return "апартаменты";
  if (l.includes("house")) return "дом";
  if (l.includes("land")) return "участок";
  return label.toLowerCase();
}

/**
 * /insights rental-market view. Public teaser (top districts + one premium),
 * then the full report gated behind a lead form. On submit success the gate
 * lifts (client-side reveal — a lead magnet, not secret data). The same data
 * powers the ROI calculator's rent presets, so we deep-link there too.
 */
export function RentalInsights({
  data,
  inventory = [],
}: {
  data: RentalMarket;
  inventory?: InventoryYieldRow[];
}) {
  const t = INS[useLocale()];
  const [unlocked, setUnlocked] = useState(false);
  const [currency, setCurrency] = useState<DisplayCurrency>("THB");
  const { meta } = data;
  const fmt = makeMoneyFmt(currency, meta.thbPerUsd);

  const top3 = data.districts.slice(0, 3);
  const maxAdr = Math.max(...data.districts.map((d) => d.adrMedian), 1);
  const poolPremium = data.featurePremiums.find((f) => f.key === "pool")?.premiumPct ?? null;

  if (data.districts.length === 0) {
    return (
      <p className="rounded-sm border border-forest-500/15 bg-cream-50 p-6 text-forest-500/80">
        {t.dataRefreshing}
      </p>
    );
  }

  return (
    <div className="space-y-14 md:space-y-20">
      {/* Snapshot strip + currency toggle */}
      <div className="flex flex-wrap items-center justify-between gap-x-8 gap-y-3 rounded-sm border border-forest-500/10 bg-cream-50 px-6 py-5 text-sm">
        <div className="flex flex-wrap gap-x-8 gap-y-3">
          <Stat label={t.listingsAnalysed} value={meta.sample.toLocaleString("en-US")} />
          <SourceMix meta={meta} />
          <Stat label={t.snapshot} value={meta.date} />
          {meta.occupancyMeasuredAll != null ? (
            <Stat
              label={t.activeOcc}
              value={`${Math.round(meta.occupancyMeasuredAll * 100)}%`}
            />
          ) : null}
        </div>
        <CurrencyToggle currency={currency} onChange={setCurrency} />
      </div>

      {/* Cross-source price triangulation (when ≥2 platforms) */}
      {data.crossCheck && data.crossCheck.sources.length >= 2 ? (
        <Triangulation cross={data.crossCheck} fmt={fmt} />
      ) : null}

      {/* What to build — the synthesised answer */}
      <BuildRecommendation data={data} fmt={fmt} />

      {/* Inventory × market — our active listings against district ADR */}
      {inventory.length > 0 ? (
        <InventoryYield rows={inventory} fmt={fmt} meta={meta} />
      ) : null}

      {/* TEASER — always visible */}
      <section>
        <SectionHead
          icon={<TrendingUp className="h-4 w-4" />}
          eyebrow={t.freePreview}
          title={t.teaserTitle}
          note={t.teaserNote}
        />
        <div className="mt-6 space-y-3">
          {top3.map((d, i) => (
            <BarRow
              key={d.name}
              label={d.name}
              slug={d.slug}
              value={d.adrMedian}
              max={maxAdr}
              right={fmt(d.adrMedian)}
              sub={t.teaserSub(
                d.n,
                fmt(effectiveAnnualThb(d, meta), true),
                Math.round(meta.occupancy.base * 100),
                measuredOccupancy(d, meta) != null
                  ? Math.round((measuredOccupancy(d, meta) as number) * 100)
                  : null,
              )}
              highlight
              badge={i === 0 ? t.topPick : undefined}
            />
          ))}
        </div>
        {poolPremium != null ? (
          <p className="mt-6 inline-flex items-center gap-2 rounded-sm bg-brass-200/40 px-4 py-2.5 text-sm text-forest-500">
            <Waves className="h-4 w-4 text-brass-500" />
            {t.poolPremium(poolPremium)}
          </p>
        ) : null}
      </section>

      {/* GATE + FULL REPORT */}
      <section className="relative">
        <SectionHead
          icon={<Lock className="h-4 w-4" />}
          eyebrow={unlocked ? t.fullReportEyebrow : t.unlockEyebrow}
          title={t.gateTitle}
          note={t.gateNote}
        />

        {!unlocked ? (
          <UnlockCard onSuccess={() => setUnlocked(true)} meta={meta} />
        ) : (
          <div className="mt-4 inline-flex items-center gap-2 rounded-sm border border-forest-500/20 bg-forest-50/40 px-4 py-2 text-sm text-forest-500">
            <CheckCircle2 className="h-4 w-4 text-forest-500" />
            {t.unlockedConfirm}
          </div>
        )}

        {/* Full content — blurred + inert until unlocked */}
        <div
          className={
            unlocked
              ? "mt-10 space-y-14"
              : "mt-10 space-y-14 select-none blur-[6px] pointer-events-none"
          }
          aria-hidden={!unlocked}
        >
          <FullReport data={data} fmt={fmt} />
        </div>
      </section>
    </div>
  );
}

/* ----------------------------- Source mix ------------------------------ */

function SourceMix({ meta }: { meta: RentalMarket["meta"] }) {
  const t = INS[useLocale()];
  const sources = meta.sources ?? [];
  if (sources.length === 0) {
    return <Stat label={t.source} value={meta.source} />;
  }
  return (
    <div>
      <div className="text-[11px] uppercase tracking-wider text-forest-500/55">{t.source}</div>
      <div className="mt-1 flex flex-wrap items-center gap-1.5">
        {sources.map((s) => (
          <span
            key={s.key}
            className="inline-flex items-center gap-1 rounded-full bg-forest-500/8 px-2.5 py-0.5 text-xs font-medium text-forest-900"
            title={t.sourceN(s.n)}
          >
            {s.label}
            <span className="tabular-nums text-forest-500/55">{s.n.toLocaleString("en-US")}</span>
          </span>
        ))}
      </div>
      {meta.dedup && meta.dedup.total !== meta.dedup.unique ? (
        <div className="mt-1 text-[10px] text-forest-500/45">
          {t.dedupNote(meta.dedup.total, meta.dedup.unique)}
        </div>
      ) : null}
    </div>
  );
}

/* -------------------------- Triangulation card ------------------------- */

function Triangulation({ cross, fmt }: { cross: RmCrossCheck; fmt: MoneyFmt }) {
  const t = INS[useLocale()];
  const priced = cross.sources.filter((s) => s.adrMedian != null);
  const maxAdr = Math.max(...priced.map((s) => s.adrMedian ?? 0), 1);

  return (
    <section>
      <SectionHead
        icon={<Scale className="h-4 w-4" />}
        eyebrow={t.triangulationEyebrow}
        title={t.triangulationTitle}
        note={t.triangulationNote}
      />
      <div className="mt-6 rounded-sm border border-forest-500/10 bg-cream-50 p-6">
        <div className="space-y-3">
          {priced.map((s) => (
            <BarRow
              key={s.key}
              label={s.label}
              value={s.adrMedian ?? 0}
              max={maxAdr}
              right={fmt(s.adrMedian)}
              sub={t.sourceN(s.nPriced || s.n)}
            />
          ))}
        </div>
        {cross.spreadPct != null ? (
          <div
            className={`mt-5 inline-flex items-center gap-2 rounded-full px-3.5 py-1.5 text-sm font-medium ${
              cross.agree
                ? "bg-forest-50/60 text-forest-500"
                : "bg-brass-200/50 text-brass-600"
            }`}
          >
            {cross.agree ? (
              <CheckCircle className="h-4 w-4" />
            ) : (
              <AlertTriangle className="h-4 w-4" />
            )}
            {cross.agree ? t.agree(cross.spreadPct) : t.diverge(cross.spreadPct)}
          </div>
        ) : null}
      </div>
    </section>
  );
}

/* ------------------------- Build recommendation ------------------------ */

function BuildRecommendation({ data, fmt }: { data: RentalMarket; fmt: MoneyFmt }) {
  const locale = useLocale();
  const t = INS[locale];
  const topD = data.districts[0];
  const bestType = data.byType.find((ty) => ty.n >= 3);
  const topFeat = [...data.featurePremiums]
    .filter((f) => f.premiumPct != null)
    .sort((a, b) => (b.premiumPct ?? 0) - (a.premiumPct ?? 0))[0];
  const bestConfig = [...data.districtBedrooms]
    .filter((x) => x.district === topD.name)
    .sort((a, b) => b.adrMedian - a.adrMedian)[0];

  if (!topD) return null;
  const config = t.configLabel(
    bestConfig ? bestConfig.bedrooms : null,
    bestType?.label ?? null,
  );
  const feat = topFeat ? (t.featurePhrase[topFeat.key] ?? topFeat.label.toLowerCase()) : null;

  return (
    <div className="rounded-sm border border-brass-300/50 bg-gradient-to-br from-cream-50 to-brass-200/20 p-7 md:p-9">
      <p className="inline-flex items-center gap-1.5 text-xs font-medium uppercase tracking-[0.2em] text-brass-500">
        <Hammer className="h-4 w-4" />
        {t.whatDataSuggests}
      </p>
      <p className="mt-4 max-w-3xl text-pretty text-lg leading-relaxed text-forest-900 md:text-xl">
        {t.buildSentence({
          config,
          feat,
          district: topD.name,
          nightly: fmt(bestConfig?.adrMedian ?? topD.adrMedian),
          annual: fmt(effectiveAnnualThb(topD, data.meta), true),
          basePct: Math.round(data.meta.occupancy.base * 100),
          booked:
            measuredOccupancy(topD, data.meta) != null
              ? Math.round((measuredOccupancy(topD, data.meta) as number) * 100)
              : null,
        })}
      </p>
      <div className="mt-5 flex flex-wrap gap-2.5">
        {topFeat?.premiumPct != null ? (
          <Pill>{t.pillAdds(topFeat.label, topFeat.premiumPct)}</Pill>
        ) : null}
        {bestType ? <Pill>{t.pillHighestType(bestType.label)}</Pill> : null}
        <Pill>{t.pillComps(topD.n, topD.name)}</Pill>
      </div>
      <Link
        href={localeHref(locale, "/calculator?mode=rent") as Route}
        className="mt-6 inline-flex items-center gap-2 text-sm font-medium text-forest-500 hover:text-brass-500"
      >
        {t.modelThisRoi}
        <ArrowRight className="h-4 w-4" />
      </Link>
    </div>
  );
}

function Pill({ children }: { children: React.ReactNode }) {
  return (
    <span className="rounded-full bg-forest-500/8 px-3 py-1 text-xs font-medium text-forest-500">
      {children}
    </span>
  );
}

/* --------------------- Inventory × market overlay ---------------------- */

function InventoryYield({
  rows,
  fmt,
  meta,
}: {
  rows: InventoryYieldRow[];
  fmt: MoneyFmt;
  meta: RentalMarket["meta"];
}) {
  void meta;
  const locale = useLocale();
  const t = INS[locale];
  return (
    <section>
      <SectionHead
        icon={<Building2 className="h-4 w-4" />}
        eyebrow={t.ourXmarket}
        title={t.invTitle}
        note={t.invNote}
      />
      <div className="mt-6 grid gap-3 sm:grid-cols-2">
        {rows.map((r) => (
          <Link
            key={r.rwNumber}
            href={localeHref(locale, `/object/${r.rwNumber}`) as Route}
            className="group rounded-sm border border-forest-500/10 bg-cream-50 p-4 transition-colors hover:border-brass-300/60"
          >
            <div className="flex items-start justify-between gap-3">
              <div className="min-w-0">
                <div className="truncate text-sm font-medium text-forest-900 group-hover:text-brass-500">
                  {r.title || r.rwNumber}
                </div>
                <div className="text-[11px] text-forest-500/60">
                  {r.rwNumber} · {r.type} · {r.district}
                  {r.bedrooms ? t.brSuffix(r.bedrooms) : ""}
                  {r.measuredOcc != null ? t.bookedNow(Math.round(r.measuredOcc * 100)) : ""}
                </div>
              </div>
              <div className="shrink-0 rounded-full bg-forest-500 px-2.5 py-0.5 text-xs font-semibold text-cream-50">
                {t.netSuffix(r.netYieldPct)}
              </div>
            </div>
            <div className="mt-3 grid grid-cols-4 gap-2 text-center">
              <Metric label={t.mPrice} value={fmt(r.priceThb, true)} />
              <Metric label={t.mGross} value={`${r.grossYieldPct}%`} />
              <Metric label={t.mNet} value={`${r.netYieldPct}%`} />
              <Metric label={t.mPayback} value={r.paybackYears > 0 ? t.paybackY(r.paybackYears) : "—"} />
            </div>
          </Link>
        ))}
      </div>
      <p className="mt-3 text-[11px] text-forest-500/50">{t.invFootnote}</p>
    </section>
  );
}

function Metric({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-sm bg-forest-500/[0.04] py-1.5">
      <div className="text-[10px] uppercase tracking-wide text-forest-500/50">{label}</div>
      <div className="text-sm font-semibold tabular-nums text-forest-900">{value}</div>
    </div>
  );
}

/* ----------------------------- Full report ----------------------------- */

type DistrictSort = "adr" | "annual" | "yield" | "sample" | "name";

function FullReport({ data, fmt }: { data: RentalMarket; fmt: MoneyFmt }) {
  const t = INS[useLocale()];
  const { meta } = data;
  const [sort, setSort] = useState<DistrictSort>("adr");
  const maxAdr = Math.max(...data.districts.map((d) => d.adrMedian), 1);
  const maxType = Math.max(...data.byType.map((ty) => ty.adrMedian), 1);
  const maxPremium = Math.max(...data.featurePremiums.map((f) => f.premiumPct ?? 0), 1);
  const bedrooms = [...data.byBedrooms].sort((a, b) => a.bedrooms - b.bedrooms);
  const maxBed = Math.max(...bedrooms.map((b) => b.adrMedian), 1);
  const districtBedrooms = [...data.districtBedrooms].sort((a, b) => b.adrMedian - a.adrMedian);

  const topPick = data.districts[0]?.name;
  const hasYield = data.districts.some((d) => d.yieldOnLandPct != null);
  const sortedDistricts = [...data.districts].sort((a, b) => {
    if (sort === "annual") return (b.annual.base ?? 0) - (a.annual.base ?? 0);
    if (sort === "yield") return (b.yieldOnLandPct ?? 0) - (a.yieldOnLandPct ?? 0);
    if (sort === "sample") return b.n - a.n;
    if (sort === "name") return a.name.localeCompare(b.name);
    return b.adrMedian - a.adrMedian;
  });

  return (
    <>
      {/* All districts */}
      <div>
        <div className="flex flex-wrap items-center justify-between gap-3">
          <SubHead title={t.subAllDistricts} />
          <div className="inline-flex flex-wrap gap-1 text-[11px]">
            {(Object.keys(t.sortLabels) as DistrictSort[])
              .filter((k) => k !== "yield" || hasYield)
              .map((k) => (
              <button
                key={k}
                type="button"
                onClick={() => setSort(k)}
                className={`rounded-full px-2.5 py-0.5 transition-colors ${
                  sort === k
                    ? "bg-forest-500 text-cream-50"
                    : "bg-forest-500/8 text-forest-500/70 hover:bg-forest-500/15"
                }`}
              >
                {t.sortLabels[k]}
              </button>
            ))}
          </div>
        </div>
        <div className="mt-5 space-y-2.5">
          {sortedDistricts.map((d) => (
            <BarRow
              key={d.name}
              label={d.name}
              slug={d.slug}
              value={d.adrMedian}
              max={maxAdr}
              right={fmt(d.adrMedian)}
              sub={
                t.districtSub(
                  d.n,
                  d.adrP25 && d.adrP75 ? `${fmt(d.adrP25)}–${fmt(d.adrP75)}` : null,
                  fmt(effectiveAnnualThb(d, meta), true),
                  measuredOccupancy(d, meta) != null
                    ? Math.round((measuredOccupancy(d, meta) as number) * 100)
                    : null,
                ) + (sort === "yield" && d.yieldOnLandPct != null ? t.yieldSuffix(d.yieldOnLandPct) : "")
              }
              badge={d.name === topPick ? t.topPick : undefined}
              highlight={d.name === topPick}
              confidence={confidenceOf(d.n)}
              tag={
                d.supplyTag === "under"
                  ? { label: t.supplyUnder, tone: "good" }
                  : d.supplyTag === "saturated"
                    ? { label: t.supplySaturated, tone: "warn" }
                    : undefined
              }
            />
          ))}
        </div>
        {hasYield ? <p className="mt-3 text-[11px] text-forest-500/55">{t.yieldNote}</p> : null}
      </div>

      {/* By property type */}
      <div>
        <SubHead title={t.subByType} icon={<Home className="h-4 w-4" />} />
        <div className="mt-5 space-y-2.5">
          {data.byType
            .filter((ty) => ty.n >= 2)
            .map((ty) => (
              <BarRow
                key={ty.type}
                label={ty.label}
                value={ty.adrMedian}
                max={maxType}
                right={fmt(ty.adrMedian)}
                sub={t.typeSub(ty.n, ty.ratingMedian ?? null)}
              />
            ))}
        </div>
      </div>

      {/* By bedrooms */}
      {bedrooms.length > 0 ? (
        <div>
          <SubHead title={t.subByBedroom} icon={<BedDouble className="h-4 w-4" />} />
          <div className="mt-5 space-y-2.5">
            {bedrooms.map((b) => (
              <BarRow
                key={b.bedrooms}
                label={t.bedroomLabel(b.bedrooms)}
                value={b.adrMedian}
                max={maxBed}
                right={fmt(b.adrMedian)}
                sub={t.nListings(b.n)}
              />
            ))}
          </div>
          <p className="mt-3 text-xs text-forest-500/60">{t.bedroomNote}</p>
        </div>
      ) : null}

      {/* Feature premiums */}
      <div>
        <SubHead title={t.subWhatRaises} icon={<Waves className="h-4 w-4" />} />
        <div className="mt-5 space-y-2.5">
          {data.featurePremiums
            .filter((f) => f.premiumPct != null)
            .sort((a, b) => (b.premiumPct ?? 0) - (a.premiumPct ?? 0))
            .map((f) => (
              <BarRow
                key={f.key}
                label={f.label}
                value={f.premiumPct ?? 0}
                max={maxPremium}
                right={`+${f.premiumPct}%`}
                sub={t.featureSub(fmt(f.adrWith), fmt(f.adrWithout), f.nWith, f.nWithout)}
                tone="brass"
              />
            ))}
        </div>
      </div>

      {/* District × bedrooms — table on desktop, cards on mobile */}
      {districtBedrooms.length > 0 ? (
        <div>
          <SubHead title={t.subDistrictBedroom} />
          {/* desktop table */}
          <div className="mt-5 hidden md:block">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-forest-500/15 text-left text-xs uppercase tracking-wider text-forest-500/60">
                  <th className="py-2 pr-4 font-medium">{t.thDistrict}</th>
                  <th className="py-2 pr-4 font-medium">{t.thBedrooms}</th>
                  <th className="py-2 pr-4 text-right font-medium">{t.thAdrMedian}</th>
                  <th className="py-2 text-right font-medium">{t.thN}</th>
                </tr>
              </thead>
              <tbody>
                {districtBedrooms.map((r) => (
                  <tr key={`${r.district}-${r.bedrooms}`} className="border-b border-forest-500/[0.08]">
                    <td className="py-2 pr-4">{r.district}</td>
                    <td className="py-2 pr-4">{t.brShort(r.bedrooms)}</td>
                    <td className="py-2 pr-4 text-right font-medium">{fmt(r.adrMedian)}</td>
                    <td className="py-2 text-right text-forest-500/70">{r.n}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          {/* mobile cards */}
          <div className="mt-5 grid grid-cols-2 gap-2.5 md:hidden">
            {districtBedrooms.map((r) => (
              <div
                key={`${r.district}-${r.bedrooms}`}
                className="rounded-sm border border-forest-500/10 bg-cream-50 p-3"
              >
                <div className="text-sm font-medium text-forest-900">{r.district}</div>
                <div className="text-[11px] text-forest-500/60">
                  {t.bedroomLabel(r.bedrooms)} · {t.nListings(r.n)}
                </div>
                <div className="mt-1.5 text-base font-semibold tabular-nums text-forest-900">
                  {fmt(r.adrMedian)}
                  <span className="text-[11px] font-normal text-forest-500/55">{t.perNightShort}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      ) : null}

      {/* Seasonality */}
      <Seasonality seasonal={data.seasonal} fmt={fmt} />

      {/* CapEx — land price per m² */}
      {data.capex.pricePerSqmMedian ? (
        <p className="text-sm text-forest-500/80">
          {t.capexText(data.capex.source ?? "", fmt(data.capex.pricePerSqmMedian), data.capex.nSale)}
        </p>
      ) : null}

      {/* CTA into the calculator */}
      <CalculatorCta />

      {/* Methodology */}
      <Methodology meta={meta} />
    </>
  );
}

function CalculatorCta() {
  const locale = useLocale();
  const t = INS[locale];
  return (
    <div className="rounded-sm border border-forest-500/15 bg-forest-900 p-7 text-cream-50 md:p-9">
      <h3 className="font-serif text-2xl text-cream-50">{t.ctaTitle}</h3>
      <p className="mt-2 max-w-xl text-cream-100/80">{t.ctaBody}</p>
      <Link
        href={localeHref(locale, "/calculator?mode=rent") as Route}
        className="mt-5 inline-flex items-center gap-2 rounded-sm bg-brass-400 px-5 py-2.5 text-sm font-medium text-forest-900 transition-colors hover:bg-brass-300"
      >
        {t.ctaButton}
        <ArrowRight className="h-4 w-4" />
      </Link>
    </div>
  );
}

const SEASON_COLORS = ["#1F3A2E", "#C77929", "#2F5546", "#B5651D"];

function Seasonality({ seasonal, fmt }: { seasonal: RmSeasonal; fmt: MoneyFmt }) {
  const t = INS[useLocale()];
  if (!seasonal || seasonal.points < 2) {
    return (
      <div>
        <SubHead title={t.seasonalTrend} />
        <p className="mt-3 rounded-sm border border-forest-500/10 bg-cream-200/30 p-4 text-sm text-forest-500/75">
          {t.collecting(seasonal?.points ?? 0)}
        </p>
      </div>
    );
  }

  // Series: island overall + up to 3 districts. Scale to combined min/max.
  const series: { name: string; values: (number | null)[]; color: string }[] = [
    { name: t.island, values: seasonal.overall, color: SEASON_COLORS[0] },
  ];
  Object.entries(seasonal.districts)
    .slice(0, 3)
    .forEach(([name, values], i) => series.push({ name, values, color: SEASON_COLORS[i + 1] }));

  const all = series.flatMap((s) => s.values).filter((v): v is number => v != null);
  const min = Math.min(...all);
  const max = Math.max(...all);
  const W = 640;
  const H = 200;
  const padX = 8;
  const padY = 16;
  const n = seasonal.dates.length;
  const x = (i: number) => padX + (i * (W - 2 * padX)) / Math.max(1, n - 1);
  const y = (v: number) =>
    H - padY - ((v - min) / Math.max(1, max - min)) * (H - 2 * padY);

  return (
    <div>
      <SubHead title={t.seasonalOverTime} />
      <div className="mt-5 overflow-x-auto rounded-sm border border-forest-500/10 bg-cream-50 p-4">
        <svg viewBox={`0 0 ${W} ${H}`} className="h-48 w-full min-w-[28rem]" role="img">
          {series.map((s) => {
            const pts = s.values
              .map((v, i) => (v == null ? null : `${x(i)},${y(v)}`))
              .filter(Boolean)
              .join(" ");
            return (
              <polyline
                key={s.name}
                points={pts}
                fill="none"
                stroke={s.color}
                strokeWidth={2}
                strokeLinejoin="round"
              />
            );
          })}
        </svg>
      </div>
      <div className="mt-3 flex flex-wrap gap-x-4 gap-y-1.5 text-xs">
        {series.map((s) => {
          const last = [...s.values].reverse().find((v) => v != null) ?? null;
          return (
            <span key={s.name} className="inline-flex items-center gap-1.5 text-forest-500/75">
              <span className="h-2 w-3 rounded-sm" style={{ backgroundColor: s.color }} />
              {s.name} {last != null ? fmt(last) : ""}
            </span>
          );
        })}
        <span className="text-forest-500/45">
          {seasonal.dates[0]} → {seasonal.dates[seasonal.dates.length - 1]}
        </span>
      </div>
    </div>
  );
}

function Methodology({ meta }: { meta: RentalMarket["meta"] }) {
  const t = INS[useLocale()];
  return (
    <details className="rounded-sm border border-forest-500/10 bg-cream-200/30 p-5 text-sm text-forest-500/80">
      <summary className="cursor-pointer font-medium text-forest-500">{t.methodSummary}</summary>
      <ul className="mt-3 list-disc space-y-1.5 pl-5">
        {t.methodBullets(meta).map((b, i) => (
          <li key={i}>{b}</li>
        ))}
      </ul>
    </details>
  );
}

/* ----------------------------- Primitives ------------------------------ */

function CurrencyToggle({
  currency,
  onChange,
}: {
  currency: DisplayCurrency;
  onChange: (c: DisplayCurrency) => void;
}) {
  return (
    <div className="inline-flex overflow-hidden rounded-full border border-forest-500/15 text-xs">
      {(["THB", "USD"] as DisplayCurrency[]).map((c) => (
        <button
          key={c}
          type="button"
          onClick={() => onChange(c)}
          className={`px-3 py-1 font-medium transition-colors ${
            currency === c ? "bg-forest-500 text-cream-50" : "text-forest-500/70 hover:bg-forest-500/8"
          }`}
        >
          {c}
        </button>
      ))}
    </div>
  );
}

function Stat({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <div className="text-[11px] uppercase tracking-wider text-forest-500/55">{label}</div>
      <div className="mt-0.5 font-medium text-forest-900">{value}</div>
    </div>
  );
}

function SectionHead({
  icon,
  eyebrow,
  title,
  note,
}: {
  icon: React.ReactNode;
  eyebrow: string;
  title: string;
  note?: string;
}) {
  return (
    <div>
      <p className="inline-flex items-center gap-1.5 text-xs font-medium uppercase tracking-[0.2em] text-brass-500">
        {icon}
        {eyebrow}
      </p>
      <h2 className="mt-3 font-serif text-2xl text-forest-900 md:text-3xl">{title}</h2>
      {note ? <p className="mt-2 max-w-2xl text-forest-500/75">{note}</p> : null}
    </div>
  );
}

function SubHead({ title, icon }: { title: string; icon?: React.ReactNode }) {
  return (
    <h3 className="inline-flex items-center gap-2 font-medium text-forest-500">
      {icon ? <span className="text-brass-500">{icon}</span> : null}
      {title}
    </h3>
  );
}

const CONF_COLOR: Record<"low" | "medium" | "high", string> = {
  low: "bg-brass-400/50",
  medium: "bg-brass-400",
  high: "bg-forest-500",
};

function BarRow({
  label,
  slug,
  value,
  max,
  right,
  sub,
  highlight,
  badge,
  confidence,
  tag,
  tone = "forest",
}: {
  label: string;
  slug?: string | null;
  value: number;
  max: number;
  right: string;
  sub?: string;
  highlight?: boolean;
  badge?: string;
  confidence?: "low" | "medium" | "high";
  tag?: { label: string; tone: "good" | "warn" };
  tone?: "forest" | "brass";
}) {
  const locale = useLocale();
  const pct = Math.max(4, Math.round((value / max) * 100));
  const barColor =
    tone === "brass" ? "bg-brass-400" : highlight ? "bg-brass-500" : "bg-forest-500/70";
  const hasPage = slug && DISTRICT_PAGE_SLUGS.has(slug);

  return (
    <div className="grid grid-cols-[minmax(7rem,9rem)_1fr_auto] items-center gap-3 md:gap-4">
      <div className="min-w-0">
        <span className="flex items-center gap-1.5">
          {confidence ? (
            <span
              className={`h-1.5 w-1.5 shrink-0 rounded-full ${CONF_COLOR[confidence]}`}
              title={`${confidence} confidence`}
            />
          ) : null}
          {badge ? (
            <Award className="h-3.5 w-3.5 shrink-0 text-brass-500" aria-label={badge} />
          ) : null}
          {hasPage ? (
            <Link
              href={localeHref(locale, `/districts/${slug}`) as Route}
              className="truncate text-sm font-medium text-forest-900 underline-offset-2 hover:text-brass-500 hover:underline"
            >
              {label}
            </Link>
          ) : (
            <span className="block truncate text-sm font-medium text-forest-900">{label}</span>
          )}
          {tag ? (
            <span
              className={`shrink-0 rounded-full px-1.5 py-0.5 text-[9px] font-medium uppercase tracking-wide ${
                tag.tone === "good"
                  ? "bg-forest-500/10 text-forest-500"
                  : "bg-brass-200/60 text-brass-600"
              }`}
            >
              {tag.label}
            </span>
          ) : null}
        </span>
        {sub ? <div className="truncate text-[11px] text-forest-500/55">{sub}</div> : null}
      </div>
      <div className="h-2.5 overflow-hidden rounded-full bg-forest-500/8">
        <div className={`h-full rounded-full ${barColor}`} style={{ width: `${pct}%` }} />
      </div>
      <div className="w-16 text-right text-sm font-semibold tabular-nums text-forest-900 md:w-20">
        {right}
      </div>
    </div>
  );
}

/* ------------------------------- Gate ---------------------------------- */

function UnlockCard({ onSuccess, meta }: { onSuccess: () => void; meta: RentalMarket["meta"] }) {
  const locale = useLocale();
  const t = INS[locale];
  return (
    <div className="mt-6 rounded-sm border border-brass-300/50 bg-cream-50 p-6 shadow-sm md:p-8">
      <div className="grid gap-8 md:grid-cols-[1fr_minmax(18rem,22rem)] md:items-center">
        <div>
          <p className="inline-flex items-center gap-2 text-sm font-medium text-forest-500">
            <Info className="h-4 w-4 text-brass-500" />
            {t.unlockHeadline(meta.sample)}
          </p>
          <p className="mt-3 text-forest-500/80">{t.unlockBody}</p>
        </div>
        <LeadForm
          source="contact"
          kind="market-report"
          layout="card"
          locale={locale}
          submitLabel={t.unlockSubmit}
          defaultMessage={t.unlockDefaultMessage}
          onSuccess={onSuccess}
        />
      </div>
    </div>
  );
}
