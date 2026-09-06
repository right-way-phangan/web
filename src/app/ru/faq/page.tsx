import type { Metadata } from "next";
import Link from "next/link";
import type { Route } from "next";
import { PageHero } from "@/components/sections/page-hero";
import { FaqExplorer } from "@/components/faq/faq-explorer";
import { WhatsIncluded } from "@/components/faq/whats-included";
import { FaqJsonLd } from "@/components/seo/faq-json-ld";
import { Button } from "@/components/ui/button";
import { FAQ_CATEGORIES_RU } from "@/content/faq.ru";
import { ALL_FAQ_ITEMS_RU } from "@/content/faq-derived.ru";
import { pluralRu } from "@/lib/i18n/dictionaries";

export const metadata: Metadata = {
  title: "Вопросы и ответы",
  description:
    "Ответы на вопросы, которые иностранные покупатели реально задают про недвижимость на Ко Пангане: Chanote vs NS3, фрихолд vs лизхолд, корпоративные структуры, налоги, коммуникации, юридическая проверка.",
  alternates: { canonical: "/ru/faq", languages: { en: "/faq", ru: "/ru/faq", "x-default": "/faq" } },
};

export default function RussianFaqPage() {
  return (
    <>
      {/* Top 40 for rich results: all 161 Q&A made the RU page a 1 MB document. */}
      <FaqJsonLd items={ALL_FAQ_ITEMS_RU.slice(0, 40)} />
      <PageHero
        eyebrow="Вопросы и ответы"
        title="Покупка недвижимости на Пангане — начистоту."
        lede={`${ALL_FAQ_ITEMS_RU.length} ${pluralRu(ALL_FAQ_ITEMS_RU.length, "ответ", "ответа", "ответов")} на реальные вопросы иностранных покупателей — по шести категориям. Ищите по слову, фильтруйте или просто листайте.`}
        image="/images/scenes/faq.jpg"
        imageAlt="Окаймлённый пальмами пляж на закате, Ко Панган"
      />

      <section className="container-prose py-12 md:py-16">
        <FaqExplorer items={ALL_FAQ_ITEMS_RU} categories={FAQ_CATEGORIES_RU} locale="ru" />
      </section>

      <WhatsIncluded locale="ru" />

      <section className="border-t border-forest-500/10 bg-cream-200/30">
        <div className="container-prose py-16 md:py-20">
          <div className="max-w-2xl">
            <h2 className="font-serif text-3xl text-forest-900 md:text-4xl">Остался вопрос?</h2>
            <p className="mt-4 text-lg text-forest-500/70">
              Здесь — самое частое, но у каждого покупателя свой нюанс. Пришлите свой — ответим
              напрямую, а если вопрос полезен многим, добавим его на эту страницу.
            </p>
            <div className="mt-8 flex flex-wrap gap-3">
              <Button asChild variant="primary" size="md">
                <Link href={"/ru/contact" as Route}>Спросить что угодно</Link>
              </Button>
              <Button asChild variant="outline" size="md">
                <Link href={"/ru/process" as Route}>Посмотреть наш процесс</Link>
              </Button>
            </div>
          </div>
        </div>
      </section>
    </>
  );
}
