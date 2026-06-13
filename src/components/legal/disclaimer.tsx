import type { Locale } from "@/lib/i18n/dictionaries";

/**
 * Reusable legal disclaimer for pages that show figures, projections or yields
 * (calculator, insights, investment articles). Keeps us out of "we guaranteed
 * a return" / "this was investment advice" territory — every number on those
 * pages is illustrative, sourced from public + our own market data, and not an
 * offer. Copy is centralised here so the wording stays consistent and reviewed.
 */
const COPY: Record<"investment", Record<Locale, string>> = {
  investment: {
    en: "Figures and projections shown here are illustrative estimates based on public and our own market data, for general information only. They are not financial, investment, legal or tax advice, not an offer, and not a guarantee of any return. Property values and rental income can fall as well as rise. Take independent professional advice before you buy.",
    ru: "Приведённые цифры и прогнозы — иллюстративные оценки на основе публичных и наших рыночных данных, только для общего сведения. Это не финансовая, инвестиционная, юридическая или налоговая консультация, не оферта и не гарантия какой-либо доходности. Стоимость недвижимости и доход от аренды могут как расти, так и снижаться. Перед покупкой получите независимую профессиональную консультацию.",
  },
};

export function Disclaimer({
  variant = "investment",
  locale = "en",
}: {
  variant?: keyof typeof COPY;
  locale?: Locale;
}) {
  return (
    <p className="mx-auto mt-12 max-w-prose border-t border-forest-500/10 pt-6 text-xs leading-relaxed text-forest-500/55">
      {COPY[variant][locale]}
    </p>
  );
}
