import { TESTIMONIALS } from "@/content/testimonials";
import { SectionEyebrow } from "./section-eyebrow";
import { Appear } from "@/components/motion/appear";
import type { Locale } from "@/lib/i18n/dictionaries";

const COPY = {
  en: { eyebrow: "In their words", title: "What clients say." },
  ru: { eyebrow: "Их словами", title: "Что говорят клиенты." },
} as const;

/**
 * Тихая editorial-секция отзывов: serif-цитата, тонкая brass-линия, имя и
 * контекст. Рендерится только когда в content/testimonials.ts есть настоящие
 * цитаты текущей локали — до тех пор секции на странице нет вовсе.
 */
export function Testimonials({ locale }: { locale: Locale }) {
  const items = TESTIMONIALS.filter((t) => t.lang === locale).slice(0, 3);
  if (!items.length) return null;
  const t = COPY[locale];

  return (
    <section className="container-prose relative isolate py-14 md:py-20">
      <div
        className="pointer-events-none absolute -inset-x-16 inset-y-0 -z-10 bg-[radial-gradient(70%_90%_at_50%_0%,rgba(21,168,168,0.06),transparent_60%)]"
        aria-hidden
      />
      <SectionEyebrow>{t.eyebrow}</SectionEyebrow>
      <h2 className="mt-5 max-w-3xl text-balance font-serif text-3xl text-forest-900 md:text-4xl">
        {t.title}
      </h2>
      <div
        className={`mt-12 grid gap-6 ${
          items.length >= 3 ? "md:grid-cols-3" : items.length === 2 ? "md:grid-cols-2" : "max-w-2xl"
        }`}
      >
        {items.map((item, i) => (
          <Appear key={item.name} delay={(i % 3) * 0.05} className="h-full">
            <figure className="flex h-full flex-col rounded-lg border border-forest-500/10 bg-cream-50 p-7">
              <blockquote className="font-serif text-xl leading-snug text-forest-900">
                &ldquo;{item.quote}&rdquo;
              </blockquote>
              <figcaption className="mt-6 border-t border-brass-500/25 pt-4">
                <div className="text-sm font-medium text-forest-900">{item.name}</div>
                <div className="mt-0.5 text-xs uppercase tracking-[0.15em] text-forest-500/60">
                  {item.role}
                </div>
              </figcaption>
            </figure>
          </Appear>
        ))}
      </div>
    </section>
  );
}
