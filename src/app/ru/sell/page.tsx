import type { Metadata } from "next";
import { jsonLdHtml } from "@/lib/seo/json-ld";
import Link from "next/link";
import type { Route } from "next";
import { ShieldCheck, LineChart, Megaphone, FileCheck } from "lucide-react";
import { PageHero } from "@/components/sections/page-hero";
import { Button } from "@/components/ui/button";
import { SellerListingForm } from "@/components/forms/seller-listing-form";
import { getSiteUrl } from "@/lib/site-url";

export const metadata: Metadata = {
  title: "Продать землю или виллу на Пангане",
  description:
    "Разместите землю, виллу или дом на Пангане в агентстве, которое проверяет каждый объект. Честная оценка по данным, реальный охват в нужных каналах, due diligence и все документы — под ключ.",
  alternates: {
    canonical: "/ru/sell",
    languages: { en: "/sell", ru: "/ru/sell", "x-default": "/sell" },
  },
};

const REASONS = [
  {
    icon: ShieldCheck,
    title: "Ваш объект — всерьёз",
    text: "Мы не держим ленту из 600 объявлений. Каждый объект, который мы представляем, проверен лично — поэтому покупатель приходит уже с доверием, а ваш объект стоит среди качества, а не шума.",
  },
  {
    icon: LineChart,
    title: "Цена по реальным цифрам",
    text: "Оцениваем землю или виллу по фактическим сопоставимым сделкам и текущим данным рынка Пангана — без гадания на удачу. Адекватная цена продаёт; завышенная — висит.",
  },
  {
    icon: Megaphone,
    title: "Реальный охват, правильные каналы",
    text: "Объявление попадает туда, где покупатели действительно смотрят — наш сайт, Telegram, Facebook Marketplace и профильные порталы — на английском, по международным стандартам подачи.",
  },
  {
    icon: FileCheck,
    title: "Все документы — под ключ",
    text: "Проверка титула, сверка границ, договор купли-продажи и представление в Земельном управлении — мы ведём due diligence и процесс, чтобы сделка не встала из-за недостающей бумаги.",
  },
] as const;

const STEPS = [
  {
    title: "Бесплатная оценка",
    text: "Расскажите об объекте. Дадим честную оценку на основе данных — сколько он стоит на сегодняшнем рынке, без обязательств.",
  },
  {
    title: "Проверка и подача",
    text: "Если берём объект, проверяем титул и детали, затем подаём как надо — фотосъёмка, точные характеристики и расположение на карте.",
  },
  {
    title: "Публикация там, где смотрят",
    text: "Объект выходит во всех наших каналах с полной и честной информацией — той, по которой серьёзные покупатели действуют, а не гадают.",
  },
  {
    title: "Закрываем сделку",
    text: "Принимаем обращения, ведём transaction due diligence и документы, представляем ваши интересы вплоть до передачи в Земельном управлении.",
  },
] as const;

export default function SellPageRu() {
  const siteUrl = getSiteUrl();

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "HowTo",
    name: "Как продать объект с Right Way на Пангане",
    description:
      "Шаги, чтобы разместить и продать землю, виллу или дом с Right Way Phangan Group — от бесплатной оценки до передачи права в Земельном управлении.",
    inLanguage: "ru",
    step: STEPS.map((s, i) => ({
      "@type": "HowToStep",
      position: i + 1,
      name: s.title,
      text: s.text,
    })),
    publisher: {
      "@type": "Organization",
      name: "Right Way Phangan Group",
      url: siteUrl,
    },
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: jsonLdHtml(jsonLd) }}
      />

      <PageHero
        eyebrow="Собственникам"
        title="Продайте землю или виллу — как надо."
        lede="Разместите объект в агентстве, которое проверяет каждый объект, который представляет, — чтобы серьёзные покупатели отнеслись к вашему серьёзно. Один остров, всё по-честному: адекватная цена, реальный охват и все документы — от первого обращения до передачи права."
      />

      <section className="container-prose py-16 md:py-24">
        <div className="grid gap-10 md:grid-cols-2 md:gap-x-14">
          {REASONS.map((r) => (
            <div key={r.title} className="flex gap-5">
              <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-sm border border-forest-500/15 text-forest-500">
                <r.icon className="h-5 w-5" />
              </div>
              <div>
                <h2 className="font-serif text-2xl text-forest-900">{r.title}</h2>
                <p className="mt-2 text-base leading-relaxed text-forest-500/75">
                  {r.text}
                </p>
              </div>
            </div>
          ))}
        </div>
      </section>

      <section className="bg-cream-200/30">
        <div className="container-prose py-16 md:py-24">
          <p className="text-xs font-medium uppercase tracking-[0.3em] text-brass-500">
            Как это работает
          </p>
          <h2 className="mt-3 font-serif text-3xl text-forest-900 md:text-4xl">
            От оценки до передачи права.
          </h2>
          <div className="mt-10 grid gap-8 md:grid-cols-2 md:gap-x-14">
            {STEPS.map((s, i) => (
              <div key={s.title} className="flex gap-5">
                <p className="num shrink-0 text-2xl text-brass-500">
                  {String(i + 1).padStart(2, "0")}
                </p>
                <div>
                  <h3 className="font-serif text-2xl text-forest-900">{s.title}</h3>
                  <p className="mt-2 text-base leading-relaxed text-forest-500/75">
                    {s.text}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="container-prose py-16 md:py-24">
        <div className="grid items-start gap-10 md:grid-cols-2 md:gap-x-16">
          <div>
            <h2 className="font-serif text-3xl text-forest-900 md:text-4xl">
              Сколько стоит ваш объект?
            </h2>
            <p className="mt-4 max-w-prose text-lg leading-relaxed text-forest-500/75">
              Начните с бесплатной оценки без обязательств. Получите мгновенную
              оценку на основе данных за пару минут — или пришлите детали, и мы
              вернёмся со взвешенной цифрой и понятным планом продажи.
            </p>
            <div className="mt-8 flex flex-col gap-3 sm:flex-row sm:gap-4">
              <Button asChild variant="primary" size="md">
                <Link href={"/ru/tools/estimate" as Route}>
                  Получить бесплатную оценку
                </Link>
              </Button>
              <Button asChild variant="outline" size="md">
                <Link href={"/ru/process" as Route}>Как проходит сделка</Link>
              </Button>
            </div>
          </div>

          <div className="rounded-sm border border-forest-500/10 bg-cream-50 p-6 md:p-8">
            <h3 className="font-serif text-2xl text-forest-900">Разместить объект</h3>
            <p className="mt-2 text-sm leading-relaxed text-forest-500/70">
              Расскажите о вашей земле, вилле или доме. Каждую заявку смотрим
              лично и отвечаем в течение рабочего дня.
            </p>
            <div className="mt-6">
              <SellerListingForm locale="ru" />
            </div>
          </div>
        </div>
      </section>
    </>
  );
}
