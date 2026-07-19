import type { ReactNode } from "react";
import { pluralRu } from "@/lib/i18n/dictionaries";
import type { DisplayCurrency, RentalMarket } from "@/lib/data/rental-market";

/* eslint-disable react/no-unescaped-entities */

/**
 * i18n dictionary for the /insights rental report, split out of
 * rental-insights.tsx (2026-07-15) so the orchestrator, the gated full report
 * and the new blocks all read from one place. New interactive widgets
 * (rate-estimator, district-demand) carry their OWN local dictionaries, matching
 * the market-preset.tsx / sale-prices.tsx convention — INS stays focused on the
 * report itself.
 */

export type DistrictSort = "adr" | "annual" | "yield" | "sample" | "name";

/** Translate an English property-type label to a Russian noun for the build sentence. */
export function typeWordRu(label: string | null): string {
  if (!label) return "дом";
  const l = label.toLowerCase();
  if (l.includes("villa")) return "виллу";
  if (l.includes("apart") || l.includes("condo")) return "апартаменты";
  if (l.includes("house")) return "дом";
  if (l.includes("land")) return "участок";
  return label.toLowerCase();
}

export const INS = {
  en: {
    dataRefreshing: "Market data is being refreshed — check back shortly.",
    // zone dividers
    zoneOwnersEyebrow: "For owners & hosts",
    zoneOwners: "What your place could earn",
    zoneInvestorsEyebrow: "For buyers & investors",
    zoneInvestors: "Where to buy and what to build",
    tabOwners: "For owners",
    tabOwnersHint: "What your place earns",
    tabInvestors: "For investors",
    tabInvestorsHint: "Where to buy & build",
    audienceAria: "Choose your view",
    trustDetails: "Details",
    // snapshot strip
    marketPulse: "Market pulse",
    listingsAnalysed: "Listings analysed",
    source: "Sources",
    snapshot: "Snapshot",
    activeOcc: "Active occupancy (90d)",
    trendLabel: "Island ADR trend",
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
    // trust group
    trustEyebrow: "Why trust the numbers",
    trustTitle: "How the price checks out",
    trustNote:
      "Two independent cross-checks sit behind the headline rate: platforms measured against each other, and our figure against outside trackers.",
    // bedroom-level cross-check (Airbnb vs Booking)
    bedroomCheckTitle: "By bedroom, both platforms",
    bedroomCheckNote:
      "Villa nightly rate per bedroom count — Airbnb vs Booking, where both list ≥8 villas. A second source on the size curve, not just the island median.",
    bedroomCheckCol: (br: number) => (br === 0 ? "Studio" : `${br} BR`),
    // freshness
    freshToday: "updated today",
    freshDaysAgo: (n: number) => `updated ${n} day${n === 1 ? "" : "s"} ago`,
    // external benchmarks (independent trackers)
    extEyebrow: "Independent trackers",
    extTitle: "How others measure the market",
    extNote:
      "Independent rental trackers count Koh Phangan differently — sampling, what they call “active”, Airbnb-only vs +Vrbo — so their figures diverge. Ours sits inside that range, on the largest transparent sample.",
    extOurs: "Right Way (measured)",
    extOursTag: "ours",
    extRowSub: (listings: number, occ: number | null, asOf: string, note?: string) =>
      `${listings.toLocaleString("en-US")} listings${occ != null ? ` · ${occ}% occ` : ""} · ${asOf}${note ? ` · ${note}` : ""}`,
    extWithin: (adr: string, n: number) =>
      `Our ${adr} median (${n.toLocaleString("en-US")} listings) sits inside the independent range.`,
    extRefreshed: (date: string) =>
      `External figures read on ${date} · shown for cross-check only, never blended into our median.`,
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
    heatmapNote:
      "Median nightly rate at each district × bedroom count. Darker = higher rate; empty = too few comps (n<2). Hover a cell for the sample size.",
    heatmapLegendLow: "Lower",
    heatmapLegendHigh: "Higher",
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
    capexMarket: (perSqm: string, n: number, ratio: string | null): ReactNode => (
      <>
        {" "}
        <strong>Market asking</strong> is {perSqm}/m² across {n} land listings (FazWaz)
        {ratio ? <> — about <strong>{ratio}</strong> the basis above</> : null}.
      </>
    ),
    ctaTitle: "Turn this into your own projection",
    ctaBody:
      "The ROI calculator is wired to this data — pick a district and property type and it fills in the nightly rate and occupancy automatically.",
    ctaButton: "Open the ROI calculator",
    // demand seasonality (Google Trends)
    demandEyebrow: "Demand seasonality",
    demandTitle: "When demand peaks",
    demandNote:
      "Worldwide Google-search interest in Koh Phangan by month (5-year average) — a forward demand signal: peak months are when guests plan and book, so build, furnish and price for them.",
    demandPeakLow: (peak: string, low: string): ReactNode => (
      <>
        Peak <strong className="text-forest-900">{peak}</strong> · low{" "}
        <strong className="text-forest-900">{low}</strong>
      </>
    ),
    demandVsAvg: (pct: number) => `${pct > 0 ? "+" : ""}${pct}% vs avg`,
    demandSource: (src: string, asOf: string) => `${src} · ${asOf}`,
    // seasonality
    seasonalTrend: "Seasonal trend",
    collecting: (n: number): ReactNode => (
      <>
        Collecting snapshots — <strong>{n}</strong> so far. The seasonal ADR trend (high vs low
        season) appears once we have at least two. A fresh snapshot runs weekly.
      </>
    ),
    island: "Island",
    seasonalOverTime: "Seasonal trend — nightly rate over time",
    seasonalMeasured: (n: number): string =>
      `Measured from our own snapshots (${n} so far) — the line thickens with every run.`,
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
        <span className="inline-block h-1.5 w-1.5 rounded-full bg-panel align-middle" /> high
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
      <>Prices reflect the snapshot date and season — re-run weekly for seasonal trends.</>,
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
    zoneOwnersEyebrow: "Для владельцев",
    zoneOwners: "Сколько может приносить ваш объект",
    zoneInvestorsEyebrow: "Для покупателей и инвесторов",
    zoneInvestors: "Где покупать и что строить",
    tabOwners: "Владельцу",
    tabOwnersHint: "Сколько принесёт объект",
    tabInvestors: "Инвестору",
    tabInvestorsHint: "Где купить и что строить",
    audienceAria: "Выберите раздел",
    trustDetails: "Подробнее",
    marketPulse: "Пульс рынка",
    listingsAnalysed: "Проанализировано объявлений",
    source: "Источники",
    snapshot: "Срез",
    activeOcc: "Активная загрузка (90д)",
    trendLabel: "Тренд ADR по острову",
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
    trustEyebrow: "Почему цифрам можно верить",
    trustTitle: "Как сходится цена",
    trustNote:
      "За итоговой ставкой стоят две независимые кросс-проверки: площадки сверены друг с другом, а наша цифра — с внешними трекерами.",
    // bedroom-level cross-check (Airbnb vs Booking)
    bedroomCheckTitle: "По спальням — обе площадки",
    bedroomCheckNote:
      "Ночная ставка виллы по числу спален — Airbnb против Booking, где у обеих ≥8 вилл. Второй источник по кривой размера, а не только островная медиана.",
    bedroomCheckCol: (br: number) => (br === 0 ? "Студия" : `${br} сп.`),
    // freshness
    freshToday: "обновлено сегодня",
    freshDaysAgo: (n: number) =>
      `обновлено ${n} ${pluralRu(n, "день", "дня", "дней")} назад`,
    // external benchmarks (independent trackers)
    extEyebrow: "Независимые трекеры",
    extTitle: "Как рынок оценивают другие",
    extNote:
      "Независимые трекеры аренды считают Панган по-разному — выборка, что считать «активным», только Airbnb или с Vrbo — поэтому их цифры расходятся. Наша — внутри этого диапазона и на самой большой прозрачной выборке.",
    extOurs: "Right Way (измерено)",
    extOursTag: "наши",
    extRowSub: (listings: number, occ: number | null, asOf: string, note?: string) =>
      `${listings.toLocaleString("ru-RU")} ${pluralRu(listings, "объявление", "объявления", "объявлений")}${occ != null ? ` · загрузка ${occ}%` : ""} · ${asOf}${note ? ` · ${note}` : ""}`,
    extWithin: (adr: string, n: number) =>
      `Наша медиана ${adr} (${n.toLocaleString("ru-RU")} ${pluralRu(n, "объявление", "объявления", "объявлений")}) — внутри диапазона независимых оценок.`,
    extRefreshed: (date: string) =>
      `Внешние цифры считаны ${date} · только для кросс-проверки, в нашу медиану не подмешиваются.`,
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
    heatmapNote:
      "Медианная ставка за ночь по каждой паре район × число спален. Темнее — выше ставка; пусто — слишком мало компсов (n<2). Наведите на ячейку для размера выборки.",
    heatmapLegendLow: "Ниже",
    heatmapLegendHigh: "Выше",
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
    capexMarket: (perSqm: string, n: number, ratio: string | null): ReactNode => (
      <>
        {" "}
        <strong>Рыночный asking</strong> — {perSqm}/м² по {n}{" "}
        {pluralRu(n, "участку", "участкам", "участкам")} (FazWaz)
        {ratio ? <> — примерно <strong>{ratio}</strong> к базе выше</> : null}.
      </>
    ),
    ctaTitle: "Превратите это в свой прогноз",
    ctaBody:
      "ROI-калькулятор связан с этими данными — выберите район и тип объекта, и он сам подставит ставку за ночь и загрузку.",
    ctaButton: "Открыть ROI-калькулятор",
    demandEyebrow: "Сезонность спроса",
    demandTitle: "Когда пик спроса",
    demandNote:
      "Мировой интерес к «Koh Phangan» в Google по месяцам (среднее за 5 лет) — опережающий сигнал спроса: в пиковые месяцы гости планируют и бронируют, под них и строить, обставлять и ставить цену.",
    demandPeakLow: (peak: string, low: string): ReactNode => (
      <>
        Пик <strong className="text-forest-900">{peak}</strong> · низ{" "}
        <strong className="text-forest-900">{low}</strong>
      </>
    ),
    demandVsAvg: (pct: number) => `${pct > 0 ? "+" : ""}${pct}% к среднему`,
    demandSource: (src: string, asOf: string) => `${src} · ${asOf}`,
    seasonalTrend: "Сезонный тренд",
    collecting: (n: number): ReactNode => (
      <>
        Собираем срезы — пока <strong>{n}</strong>. Сезонный тренд ставки (высокий vs низкий сезон)
        появится, когда наберётся хотя бы два. Новый срез снимается еженедельно.
      </>
    ),
    island: "Остров",
    seasonalOverTime: "Сезонный тренд — ставка за ночь во времени",
    seasonalMeasured: (n: number): string =>
      `Измерено по нашим собственным срезам (пока ${n}) — линия уплотняется с каждым прогоном.`,
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
        <span className="inline-block h-1.5 w-1.5 rounded-full bg-panel align-middle" /> высокая
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
      <>Цены отражают дату среза и сезон — перезапускайте еженедельно для сезонных трендов.</>,
    ],
    unlockHeadline: (n: number) => `Получите полную разбивку по ${n} объявлениям`,
    unlockBody:
      "Оставьте email — и полный отчёт откроется сразу: каждый район, наценка за каждую характеристику, ставки по типам и числу спален, и метод за ними. Без рекламных рассылок; напишем по вашему проекту только если попросите.",
    unlockSubmit: "Открыть отчёт",
    unlockDefaultMessage:
      "Пришлите, пожалуйста, отчёт по рынку аренды Ко Пангана. Интересует строительство / покупка под аренду.",
  },
} as const;

export type InsLocale = keyof typeof INS;
export type InsDict = (typeof INS)[InsLocale];

/** DisplayCurrency re-exported for local components that only import from here. */
export type { DisplayCurrency };
