import Link from "next/link";
import type { Route } from "next";
import { ShieldCheck } from "lucide-react";

/**
 * FAQ block under the calculator. Two jobs:
 *  - SEO/AEO: visible Q&A + FAQPage JSON-LD so "what return can I expect from a
 *    Koh Phangan property" surfaces in search and AI answers and funnels here.
 *  - Trust: a due-diligence line at the projection (decision) moment.
 * Bilingual in one place so EN/RU stay in parity.
 */

type FaqItem = { q: string; a: string };

const CONTENT: Record<
  "en" | "ru",
  { title: string; ddLine: string; ddCta: string; items: FaqItem[] }
> = {
  en: {
    title: "Koh Phangan property returns — FAQ",
    ddLine: "Every listing passes our Listing-Vetting due diligence before we publish it.",
    ddCta: "See what we check",
    items: [
      {
        q: "What return can I expect from a Koh Phangan property?",
        a: "It depends on the price you pay, how long you hold, and whether you rent it out — so this calculator lets you set your own growth outlook and horizon instead of quoting a single number. The capital-growth presets are anchored to market data, and you can adjust every input.",
      },
      {
        q: "How is the projection calculated?",
        a: "Projected value compounds your annual growth rate over the holding period. ROI is total profit divided by the cash you invested; CAGR is that return annualised. In rental mode it adds net rental income; for leasehold it reflects the value falling as the lease runs down. Entry, exit and holding costs are included.",
      },
      {
        q: "Does it handle off-plan and leasehold?",
        a: "Yes. Switch to Full mode: off-plan models the construction payment plan and handover, and leasehold reflects the lease shortening over time. Freehold resale is the default.",
      },
      {
        q: "Can I model buying several units or plots?",
        a: "Yes. On a project or a land collection, tick the units or plots you would buy and the calculator combines their cost and projection. Percentage returns (ROI, CAGR) are per unit and do not change with quantity.",
      },
      {
        q: "Are these numbers guaranteed?",
        a: "No — every figure is illustrative and follows your assumptions. We list only personally vetted properties and show honest numbers, but markets vary. Use it to compare scenarios, then talk to us before you decide.",
      },
    ],
  },
  ru: {
    title: "Доходность недвижимости на Ко Пангане — вопросы",
    ddLine: "Каждый объект проходит нашу проверку Listing-Vetting (DD) до публикации.",
    ddCta: "Что мы проверяем",
    items: [
      {
        q: "Какую доходность ждать от недвижимости на Ко Пангане?",
        a: "Зависит от цены покупки, срока владения и того, сдаёте ли вы объект. Поэтому калькулятор не называет одну цифру, а даёт задать свой темп роста и горизонт. Пресеты роста капитала привязаны к рыночным данным, и любой параметр можно поменять.",
      },
      {
        q: "Как считается прогноз?",
        a: "Прогнозная стоимость складывается из вашего годового роста за срок владения. ROI — это вся прибыль, делённая на вложенные деньги; CAGR — та же доходность в годовых. В режиме аренды добавляется чистый арендный доход; для leasehold учитывается падение стоимости по мере сокращения срока аренды. Расходы входа, выхода и владения включены.",
      },
      {
        q: "Считает ли off-plan и leasehold?",
        a: "Да. В режиме «Полный»: off-plan моделирует план платежей по стройке и передачу, а leasehold отражает сокращение срока аренды. По умолчанию — перепродажа freehold.",
      },
      {
        q: "Можно ли посчитать покупку нескольких юнитов или участков?",
        a: "Да. На странице проекта или подборки участков отметьте юниты/участки, которые берёте, — калькулятор сложит их стоимость и прогноз. Доходность в процентах (ROI, CAGR) — на один объект и не зависит от количества.",
      },
      {
        q: "Эти цифры гарантированы?",
        a: "Нет — каждая цифра иллюстративна и следует вашим допущениям. Мы публикуем только лично проверенные объекты и показываем честные цифры, но рынок меняется. Используйте калькулятор, чтобы сравнить сценарии, и обсудите с нами перед решением.",
      },
    ],
  },
};

export function CalculatorFaq({ locale }: { locale: "en" | "ru" }) {
  const d = CONTENT[locale];
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: d.items.map((it) => ({
      "@type": "Question",
      name: it.q,
      acceptedAnswer: { "@type": "Answer", text: it.a },
    })),
  };

  return (
    <section
      aria-labelledby="calc-faq-heading"
      className="mt-16 border-t border-forest-500/10 pt-12 md:mt-20 md:pt-16"
    >
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />
      <h2 id="calc-faq-heading" className="font-serif text-3xl text-forest-900">
        {d.title}
      </h2>
      <Link
        href={"/due-diligence" as Route}
        className="mt-3 inline-flex items-center gap-1.5 text-sm font-medium text-forest-500/80 transition-colors hover:text-brass-600"
      >
        <ShieldCheck className="h-4 w-4 text-brass-500" />
        <span>
          {d.ddLine} <span className="font-semibold text-brass-600">{d.ddCta} →</span>
        </span>
      </Link>
      <dl className="mt-8 max-w-3xl space-y-7">
        {d.items.map((it) => (
          <div key={it.q}>
            <dt className="font-medium text-forest-900">{it.q}</dt>
            <dd className="mt-2 leading-relaxed text-forest-500/85">{it.a}</dd>
          </div>
        ))}
      </dl>
    </section>
  );
}
