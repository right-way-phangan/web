import type { Metadata } from "next";
import Link from "next/link";
import type { Route } from "next";
import { ArrowRight } from "lucide-react";
import { PageHero } from "@/components/sections/page-hero";
import { KnowledgeBrowser } from "@/components/knowledge/knowledge-browser";
import { KB_ARTICLES_RU } from "@/content/knowledge-base.ru";

const MONTHS_RU = [
  "янв.", "февр.", "март", "апр.", "май", "июнь",
  "июль", "авг.", "сент.", "окт.", "нояб.", "дек.",
];

export const metadata: Metadata = {
  title: "База знаний",
  description:
    "Понятные гиды по покупке недвижимости на Ко Пангане — владение для иностранцев, структуры аренды, строительные зоны и правила, которые реально влияют на сделку.",
  alternates: { canonical: "/ru/knowledge", languages: { en: "/knowledge", ru: "/ru/knowledge", "x-default": "/knowledge" } },
};

export default function RussianKnowledgePage() {
  return (
    <>
      <PageHero
        eyebrow="База знаний"
        title="Что действительно нужно знать перед покупкой на Пангане."
        lede="Короткие, понятные разборы юридических и практических вопросов, которые решают сделку — структуры владения, строительные зоны и правила за ними. Мы держим их актуальными; юридическая проверка по каждой сделке — часть нашей работы, а не доп. опция."
      />

      <section className="container-prose py-14 md:py-20">
        <KnowledgeBrowser
          basePath="/ru/knowledge"
          articles={KB_ARTICLES_RU.map((a) => ({
            slug: a.slug,
            topic: a.topic,
            title: a.title,
            short: a.short,
            updated: a.updated,
          }))}
          labels={{
            all: "Все",
            read: "Читать",
            searchPlaceholder: "Поиск по гидам…",
            empty: "По запросу пока ничего не найдено.",
            clear: "Очистить поиск",
            updatedPrefix: "Обновлено",
            months: MONTHS_RU,
          }}
        />
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
                className="inline-flex items-center gap-2 rounded-sm bg-panel px-6 py-3 text-sm font-medium text-panel-fg transition-colors hover:bg-forest-400"
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
