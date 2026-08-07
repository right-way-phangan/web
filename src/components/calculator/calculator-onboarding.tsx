/**
 * Three-step "how to use it" strip under the calculator hero. Static and
 * server-rendered (follows the page URL locale, like the FAQ) so it reads for
 * first-time visitors and for crawlers. Copy lives here to keep EN/RU in parity.
 */
import { SectionEyebrow } from "@/components/sections/section-eyebrow";

const CONTENT: Record<"en" | "ru", { eyebrow: string; steps: string[] }> = {
  en: {
    eyebrow: "How it works",
    steps: [
      "Set a price — or start from one of our listings, or your own property.",
      "Adjust the growth outlook, horizon and rent to match your case.",
      "Read the projection. Share the link or save a PDF.",
    ],
  },
  ru: {
    eyebrow: "Как пользоваться",
    steps: [
      "Задайте цену — или начните с нашего объекта, или со своего.",
      "Настройте темп роста, горизонт и аренду под свой случай.",
      "Смотрите прогноз. Поделитесь ссылкой или сохраните PDF.",
    ],
  },
};

export function CalculatorOnboarding({ locale }: { locale: "en" | "ru" }) {
  const d = CONTENT[locale];
  return (
    <section aria-label={d.eyebrow} className="container-prose mt-10 md:mt-12">
      <SectionEyebrow>{d.eyebrow}</SectionEyebrow>
      <ol className="mt-6 grid gap-6 sm:grid-cols-3">
        {d.steps.map((step, i) => (
          <li key={i} className="flex gap-4 border-t border-forest-500/10 pt-4">
            <span className="font-serif text-3xl leading-none text-brass-500">{i + 1}</span>
            <span className="text-sm leading-relaxed text-forest-600/80">{step}</span>
          </li>
        ))}
      </ol>
    </section>
  );
}
