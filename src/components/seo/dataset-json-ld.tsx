import { siteConfig } from "@/lib/site-config";
import { jsonLdHtml } from "@/lib/seo/json-ld";
import type { RmMeta } from "@/lib/data/rental-market";
import type { Locale } from "@/lib/i18n/dictionaries";
import { L, localePath } from "@/lib/i18n/locale-path";

/**
 * Dataset structured data for /insights. Turns our market analytics into a
 * citable, attributable data source: AI answer engines and Google Dataset
 * Search recognise schema.org/Dataset, so "Koh Phangan rental yield / land
 * price" answers can point back to Right Way as the origin (GEO/AEO — being
 * the source of unique data is the strongest cite signal we have). The creator
 * links to the sitewide RealEstateAgent entity via @id.
 */
export function DatasetJsonLd({
  siteUrl,
  meta,
  locale = "en",
}: {
  siteUrl: string;
  meta: RmMeta;
  locale?: Locale;
}) {
  const url = `${siteUrl}${localePath(locale, "/insights")}`;

  const copy = L(locale, {
    ru: {
      name: "Индекс рынка недвижимости Ко Пангана: аренда и цены на землю",
      description:
        "Медианные ставки аренды за ночь (ADR) и цены на землю за рай по районам Ко Пангана, наценка за бассейн и вид на море, доходность по конфигурациям. Снимок живого рынка от агентства Right Way.",
    },
    en: {
      name: "Koh Phangan Property Market Index: rental & land prices",
      description:
        "Median nightly rental rates (ADR) and land prices per rai by district on Koh Phangan, pool and sea-view price premiums, and rental yield by configuration. A live-market snapshot by Right Way Phangan.",
    },
    th: {
      name: "ดัชนีตลาดอสังหาริมทรัพย์เกาะพะงัน: ค่าเช่าและราคาที่ดิน",
      description:
        "ค่าห้องต่อคืนเฉลี่ยมัธยฐาน (ADR) และราคาที่ดินต่อไร่แยกตามย่านบนเกาะพะงัน ส่วนเพิ่มราคาสำหรับสระว่ายน้ำและวิวทะเล และผลตอบแทนค่าเช่าตามรูปแบบวิลล่า ภาพรวมตลาดปัจจุบันโดย Right Way Phangan",
    },
  });

  const variableMeasured = L(locale, {
    ru: [
      "Медианная ставка аренды за ночь (ADR) по районам",
      "Цена земли за рай по районам",
      "Наценка за бассейн и вид на море",
      "Годовой доход и доходность по конфигурациям вилл",
    ],
    en: [
      "Median nightly rental rate (ADR) by district",
      "Land price per rai by district",
      "Pool and sea-view price premium",
      "Annual income and rental yield by villa configuration",
    ],
    th: [
      "ค่าห้องต่อคืนมัธยฐาน (ADR) แยกตามย่าน",
      "ราคาที่ดินต่อไร่แยกตามย่าน",
      "ส่วนเพิ่มราคาสำหรับสระว่ายน้ำและวิวทะเล",
      "รายได้ต่อปีและผลตอบแทนค่าเช่าตามรูปแบบวิลล่า",
    ],
  });

  const data = {
    "@context": "https://schema.org",
    "@type": "Dataset",
    name: copy.name,
    description: copy.description,
    url,
    inLanguage: locale,
    isAccessibleForFree: true,
    creator: {
      "@type": "RealEstateAgent",
      "@id": `${siteUrl}#org`,
      name: siteConfig.name,
      url: siteUrl,
    },
    spatialCoverage: { "@type": "Place", name: "Koh Phangan, Thailand" },
    ...(meta.date && meta.date !== "—"
      ? { temporalCoverage: meta.date, dateModified: meta.date }
      : {}),
    variableMeasured,
    measurementTechnique:
      "Aggregated medians from a live snapshot of short-term-rental listings and for-sale inventory",
    keywords: [
      "Koh Phangan",
      "rental yield",
      "ADR",
      "land price per rai",
      "real estate market data",
      "Thailand property",
    ],
  };

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: jsonLdHtml(data) }}
    />
  );
}
