import Link from "next/link";
import Image from "next/image";
import type { Route } from "next";
import { ArrowRight, BarChart3, Calculator, Scale } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Hero } from "@/components/sections/hero";
import { HeroFall } from "@/components/sections/hero-fall";
import { FeaturedListings } from "@/components/sections/featured-listings";
import { DistrictsBento } from "@/components/sections/districts-bento";
import { Testimonials } from "@/components/sections/testimonials";
import { HomeArticles } from "@/components/sections/home-articles";
import { Reveal } from "@/components/sections/reveal";
import { Appear } from "@/components/motion/appear";
import { Magnetic } from "@/components/motion/magnetic";
import type { HomeDict, Locale } from "@/lib/i18n/dictionaries";
import { SectionEyebrow } from "@/components/sections/section-eyebrow";

const TOOL_ICONS = [Calculator, Scale, BarChart3] as const;

/**
 * The single home page, shared by the EN root (`/`) and RU (`/ru`) — one
 * dict-driven component, so the two locales can never drift in markup. Listing
 * cards stay in their source language (own DB) for now; the marketing chrome
 * localizes. Redesign "Coastal Twilight": immersive hero, double-bezel value
 * cards, cinematic scroll reveals, sand/teal/amber palette.
 */
export function LocalizedHome({ dict, locale }: { dict: HomeDict; locale: Locale }) {
  const base = locale === "ru" ? "/ru" : "";
  const browseHref = `${base}/listings` as Route;
  const contactHref = `${base}/contact` as Route;

  // Скролл-падение «небо → джунгли → бухта» — прогрессивное улучшение поверх
  // обычного hero. Включено по умолчанию; NEXT_PUBLIC_HERO_FALL=0 (инлайнится
  // при билде) — аварийный выключатель. HeroFall сам решает включаться
  // (десктоп, точный указатель, без reduced-motion, кадры декодированы) —
  // иначе рендерит ровно children, т.е. сегодняшнюю страницу.
  const fallEnabled = process.env.NEXT_PUBLIC_HERO_FALL !== "0";

  return (
    <>
      {fallEnabled ? (
        <HeroFall dict={dict.heroFlight}>
          <Hero locale={locale} fill />
        </HeroFall>
      ) : (
        <Hero locale={locale} />
      )}

      {/* Values — double-bezel cards, machined like physical hardware */}
      <section className="container-prose relative isolate py-14 md:py-20">
        {/* Тихий teal-перелив за секцией — снимает «плоскость» песчаного поля */}
        <div
          className="pointer-events-none absolute -inset-x-16 inset-y-0 -z-10 bg-[radial-gradient(70%_90%_at_88%_8%,rgba(21,168,168,0.07),transparent_62%)]"
          aria-hidden
        />
        <SectionEyebrow>{dict.values.eyebrow}</SectionEyebrow>
        <h2 className="mt-5 max-w-3xl text-balance">{dict.values.title}</h2>
        <p className="mt-5 max-w-xl text-lg text-forest-600/70">{dict.values.lede}</p>

        {/* Манифест, а не каталог фич: набран типографикой без карточек.
            Раньше эта секция и «инструменты» ниже шли подряд одинаковыми
            тройками карточек с иконкой в кружке — с двух метров страница
            читалась как одна длинная полоса. Разные задачи требуют разной
            формы: во что мы верим — читают один раз, инструменты — сканируют
            и кликают. Заодно из-под трёх кремовых плит наконец виден
            teal-перелив секции. */}
        <div className="mt-16 grid gap-x-10 gap-y-12 md:grid-cols-3">
          {dict.values.items.map((item, i) => (
            <Appear key={item.title} delay={i * 0.1}>
              <div className="max-w-sm">
                <span className="rule-draw block h-px w-12 bg-brass-600/50" aria-hidden />
                <h3 className="mt-6 font-serif text-[1.75rem] leading-tight text-forest-900">
                  {item.title}
                </h3>
                <p className="mt-4 text-lg leading-relaxed text-forest-600/75">{item.text}</p>
              </div>
            </Appear>
          ))}
        </div>
      </section>

      {/* Tools — the calculator, valuation and market data that power every listing */}
      <section className="container-prose relative isolate py-14 md:py-20">
        {/* Тёплый янтарный отсвет слева-снизу — парный к teal-переливу выше */}
        <div
          className="pointer-events-none absolute -inset-x-16 inset-y-0 -z-10 bg-[radial-gradient(70%_90%_at_10%_95%,rgba(217,138,30,0.07),transparent_62%)]"
          aria-hidden
        />
        <SectionEyebrow>{dict.tools.eyebrow}</SectionEyebrow>
        <h2 className="mt-5 max-w-3xl text-balance">{dict.tools.title}</h2>
        <p className="mt-5 max-w-xl text-lg text-forest-600/70">{dict.tools.lede}</p>

        <div className="mt-16 grid gap-6 md:grid-cols-3">
          {dict.tools.items.map((item, i) => {
            const Icon = TOOL_ICONS[i] ?? Calculator;
            return (
              <Appear key={item.title} delay={i * 0.1} className="h-full">
                <Link
                  href={`${base}${item.href}` as Route}
                  className="group block h-full rounded-bezel bg-cream-200/50 p-1.5 ring-1 ring-forest-900/5 transition-shadow duration-500 ease-[cubic-bezier(0.32,0.72,0,1)] hover:shadow-soft"
                >
                  <div className="flex h-full flex-col rounded-core bg-cream-50 p-8 shadow-bezel">
                    <div className="flex h-12 w-12 items-center justify-center rounded-full bg-forest-900 text-cream-50 transition-transform duration-500 ease-[cubic-bezier(0.32,0.72,0,1)] group-hover:-translate-y-0.5">
                      <Icon className="h-5 w-5" strokeWidth={1.5} />
                    </div>
                    <h3 className="mt-7 flex items-center gap-2 font-serif text-2xl text-forest-900">
                      {item.title}
                      <ArrowRight
                        className="h-4 w-4 -translate-x-1 text-brass-700 opacity-0 transition-[transform,opacity] duration-300 group-hover:translate-x-0 group-hover:opacity-100"
                        aria-hidden
                      />
                    </h3>
                    <p className="mt-3 flex-1 text-base leading-relaxed text-forest-600/75">{item.text}</p>
                  </div>
                </Link>
              </Appear>
            );
          })}
        </div>

        <p className="mt-10 text-sm text-forest-600/70">
          <span className="text-forest-500/60">{dict.tools.moreLabel}: </span>
          {dict.tools.more.map((m, i) => (
            <span key={m.href}>
              {i > 0 ? <span className="text-forest-500/40"> · </span> : null}
              <Link
                href={`${base}${m.href}` as Route}
                className="nav-underline text-forest-700 hover:text-brass-700"
              >
                {m.label}
              </Link>
            </span>
          ))}
        </p>
      </section>

      {/* Один Reveal на все четыре секции прятал 2800px разом: блок раскрывался
          целиком, когда его верх входил в кадр, — нижние секции успевали
          «проявиться» задолго до того, как читатель до них доедет. Появление
          посекционное: каждая встречает своего зрителя. */}
      <Reveal>
        <DistrictsBento locale={locale} />
      </Reveal>

      <Reveal>
        <FeaturedListings locale={locale} />
      </Reveal>

      {/* Без Reveal: пока в content/testimonials.ts пусто, секция возвращает
          null, а обёртка оставляла в разметке пустой div. Появятся отзывы —
          их карточки въезжают своими <Appear>. */}
      <Testimonials locale={locale} />

      <Reveal>
        <HomeArticles locale={locale} />
      </Reveal>

      {/* Closing CTA — full-bleed coastal scene bookending the dark hero */}
      <section className="relative isolate overflow-hidden bg-panel">
        <Image
          src="/images/scenes/home-closing.jpg"
          alt="Aerial view of a tropical islet at sunset over the Gulf of Thailand"
          fill
          sizes="100vw"
          className="object-cover"
        />
        {/* Лёгкий общий градиент: сажает подпись внизу и низ кадра, фотографию
            не глушит. Затемнять всю секцию ради читаемости текста — плата
            закатом, который тут и продаёт. */}
        <div
          className="absolute inset-0 bg-gradient-to-t from-panel/90 via-panel/45 to-panel/35"
          aria-hidden
        />
        {/* Скрим ровно под текстовым блоком. Градиент на всю высоту упирался в
            потолок: солнечная дорожка настолько яркая, что даже panel/60 сверху
            держал надзаголовок около 3:1 при норме 4.5:1. Локальное пятно
            добирает контраст там, где лежат слова, и отпускает остальной кадр.
            Через токен, а не хардкод: в тёмной теме --c-panel другой. */}
        <div
          className="pointer-events-none absolute inset-0 bg-[radial-gradient(58%_48%_at_50%_44%,rgb(var(--c-panel)/0.80),transparent_70%)]"
          aria-hidden
        />
        {/* Тёплый ореол-«бук-энд» к герою — снизу: сверху он клал амбер поверх
            и без того амберного неба. */}
        <div
          className="pointer-events-none absolute inset-0 bg-[radial-gradient(120%_60%_at_50%_100%,rgb(var(--c-orange)/0.16),transparent_60%)]"
          aria-hidden
        />

        <Appear className="container-prose relative z-10 flex min-h-[60vh] flex-col items-center justify-center py-24 text-center md:min-h-[68vh] md:py-32">
          {/* tone="dark" даёт brass-300 — светлое закатное золото, которое на
              фото читается (золото среднего тона тут проваливалось). */}
          <SectionEyebrow tone="dark">{dict.cta.eyebrow}</SectionEyebrow>
          <h2 className="mt-5 max-w-2xl text-balance text-panel-fg">{dict.cta.title}</h2>
          <p className="mt-6 max-w-xl text-lg leading-relaxed text-panel-fg/85">
            {dict.cta.lede}
          </p>

          {/* 1-col grid on mobile forces BOTH CTAs to equal full width
              (grid items stretch); inline at content width on sm+. */}
          <div className="mt-10 grid w-full max-w-sm grid-cols-1 gap-3 sm:flex sm:w-auto sm:max-w-none sm:flex-row sm:gap-4">
            <Magnetic>
              <Button asChild variant="accent" size="lg" className="w-full sm:w-auto">
                <Link href={browseHref}>
                  {dict.cta.browse}
                  <ArrowRight className="h-4 w-4" />
                </Link>
              </Button>
            </Magnetic>
            <Button
              asChild
              variant="outline"
              size="lg"
              className="w-full border-panel-fg/40 text-panel-fg hover:border-panel-fg hover:bg-panel-fg hover:text-panel sm:w-auto"
            >
              <Link href={contactHref}>{dict.cta.talk}</Link>
            </Button>
          </div>
        </Appear>
      </section>
    </>
  );
}
