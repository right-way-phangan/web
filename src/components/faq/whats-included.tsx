import { Check } from "lucide-react";
import type { Locale } from "@/lib/i18n/dictionaries";

/**
 * «Что входит в нашу работу» — таблица-разъяснение ценности для FAQ. Фокус на
 * том, что покупатель получает (двухуровневый DD, юрист, сопровождение, бейдж
 * Vetted), без конкретной ставки комиссии (она seller-paid и зашита в цену —
 * по запросу). Отстройка от конкурентов прозрачностью процесса, не цифрами.
 * Server-safe, канон forest/brass/cream, двуязычно EN+RU.
 */
type Row = { label: string; value: string; check?: boolean };

const COPY: Record<Locale, { title: string; lede: string; rows: Row[]; note: string }> = {
  en: {
    title: "What’s included when you work with us",
    lede: "One fee, paid by the seller and built into the price — and it already covers the work that protects you as a buyer. No separate due-diligence invoice, no surprise add-ons.",
    rows: [
      { label: "Listing vetting — zone, title type and access checked at intake (DD Level 1)", value: "Included", check: true },
      { label: "Transaction due diligence — full legal report by our lawyer (DD Level 2)", value: "Included", check: true },
      { label: "Deal support — from offer to transfer at the Land Office", value: "Included", check: true },
      { label: "“Vetted” badge — every active listing clears Level 1 first", value: "Included", check: true },
      { label: "Terms for partner agents — co-agency · referral", value: "50/50 · 20%" },
      { label: "Commission", value: "Seller-paid · on request" },
    ],
    note: "Commission is charged to the seller only and is already reflected in the listed price. Ask us for the exact terms on any specific deal.",
  },
  ru: {
    title: "Что входит в работу с нами",
    lede: "Одна комиссия, которую платит продавец и которая зашита в цену, — и она уже покрывает работу, защищающую вас как покупателя. Без отдельного счёта за проверку и доплат-сюрпризов.",
    rows: [
      { label: "Проверка объекта при приёме — зона, тип документа, доступ (DD уровень 1)", value: "Входит", check: true },
      { label: "Юридическая проверка сделки — полный отчёт нашего юриста (DD уровень 2)", value: "Входит", check: true },
      { label: "Сопровождение сделки — от оффера до передачи в Земельном офисе", value: "Входит", check: true },
      { label: "Бейдж «Vetted» — каждый активный объект сперва проходит уровень 1", value: "Входит", check: true },
      { label: "Условия для агентов-партнёров — co-agency · реферал", value: "50/50 · 20%" },
      { label: "Комиссия", value: "Платит продавец · по запросу" },
    ],
    note: "Комиссию платит только продавец, и она уже заложена в указанную цену. Точные условия по конкретной сделке — по запросу.",
  },
};

export function WhatsIncluded({ locale }: { locale: Locale }) {
  const t = COPY[locale];
  return (
    <section className="border-t border-forest-500/10">
      <div className="container-prose py-16 md:py-20">
        <div className="max-w-2xl">
          <h2 className="font-serif text-3xl text-forest-900 md:text-4xl">{t.title}</h2>
          <p className="mt-4 text-lg text-forest-500/70">{t.lede}</p>
        </div>

        <dl className="mt-8 divide-y divide-forest-500/10 border-y border-forest-500/10">
          {t.rows.map((row) => (
            <div
              key={row.label}
              className="flex items-start justify-between gap-6 py-4"
            >
              <dt className="text-base text-forest-900">{row.label}</dt>
              <dd className="shrink-0 text-right">
                {row.check ? (
                  <span className="inline-flex items-center gap-1.5 text-sm font-medium text-brass-600">
                    <Check className="h-4 w-4" strokeWidth={2.5} />
                    {row.value}
                  </span>
                ) : (
                  <span className="num text-sm text-forest-500/80">{row.value}</span>
                )}
              </dd>
            </div>
          ))}
        </dl>

        <p className="mt-5 max-w-2xl text-sm text-forest-500/60">{t.note}</p>
      </div>
    </section>
  );
}
