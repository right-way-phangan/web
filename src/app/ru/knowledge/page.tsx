import type { Metadata } from "next";
import Link from "next/link";
import type { Route } from "next";
import { ArrowRight } from "lucide-react";
import { PageHero } from "@/components/sections/page-hero";
import { KB_ARTICLES_RU } from "@/content/knowledge-base.ru";

export const metadata: Metadata = {
  title: "База знаний",
  description:
    "Понятные гиды по покупке недвижимости на Ко Пангане — владение для иностранцев, структуры аренды, строительные зоны и правила, которые реально влияют на сделку.",
  alternates: { canonical: "/ru/knowledge", languages: { en: "/knowledge", ru: "/ru/knowledge" } },
};

export default function RussianKnowledgePage() {
  return (
    <>
      <PageHero
        eyebrow="База знаний"
        title="Что действительно нужно знать перед покупкой на Пангане."
        lede="Короткие, понятные разборы юридических и практических вопросов, которые решают сделку — структуры владения, строительные зоны и правила за ними. Мы держим их актуальными; юридическая проверка по каждой сделке — часть нашей работы, а не доп. опция."
      />

      <section className="container-prose py-16 md:py-24">
        <div className="grid gap-6 md:grid-cols-2 md:gap-8">
          {KB_ARTICLES_RU.map((a) => (
            <Link
              key={a.slug}
              href={`/ru/knowledge/${a.slug}` as Route}
              className="group flex flex-col rounded-sm border border-forest-500/10 bg-cream-50 p-6 transition-all hover:border-forest-500/30 hover:shadow-lg md:p-8"
            >
              <p className="text-xs font-medium uppercase tracking-[0.2em] text-brass-500">{a.topic}</p>
              <h2 className="mt-3 font-serif text-xl text-forest-900 md:text-2xl">{a.title}</h2>
              <p className="mt-3 text-sm leading-relaxed text-forest-500/85 md:text-base">{a.short}</p>
              <span className="mt-auto inline-flex items-center gap-1.5 pt-5 text-sm font-medium text-forest-500 transition-colors group-hover:text-brass-500">
                Читать
                <ArrowRight className="h-3.5 w-3.5" />
              </span>
            </Link>
          ))}
        </div>
      </section>

      <section className="border-t border-forest-500/10 bg-cream-200/30">
        <div className="container-prose py-16 md:py-20">
          <div className="max-w-2xl">
            <h2 className="font-serif text-3xl text-forest-900 md:text-4xl">
              Есть вопрос, которого мы не разобрали?
            </h2>
            <p className="mt-4 text-lg text-forest-500/70">
              В{" "}
              <Link
                href={"/ru/faq" as Route}
                className="text-forest-500 underline-offset-4 hover:underline hover:text-brass-500"
              >
                разделе вопросов
              </Link>{" "}
              — самые частые. По всему, что относится к конкретному участку или сделке, короткий звонок
              быстрее чтения — и это как раз тот вопрос, на который мы отвечаем бесплатно в рамках
              работы с вами.
            </p>
            <div className="mt-8 flex flex-wrap gap-3">
              <Link
                href={"/ru/contact" as Route}
                className="inline-flex items-center gap-2 rounded-sm bg-forest-500 px-6 py-3 text-sm font-medium text-cream-100 transition-colors hover:bg-forest-400"
              >
                Спросить нас
                <ArrowRight className="h-4 w-4" />
              </Link>
            </div>
          </div>
        </div>
      </section>
    </>
  );
}
