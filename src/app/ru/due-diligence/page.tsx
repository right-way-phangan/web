import type { Metadata } from "next";
import { jsonLdHtml } from "@/lib/seo/json-ld";
import Link from "next/link";
import type { Route } from "next";
import {
  FileCheck,
  Landmark,
  Map,
  Route as RouteIcon,
  Ruler,
  ScrollText,
  UserCheck,
  Zap,
} from "lucide-react";
import { PageHero } from "@/components/sections/page-hero";
import { Button } from "@/components/ui/button";
import { getSiteUrl } from "@/lib/site-url";

export const metadata: Metadata = {
  title: "Что мы проверяем — due diligence по каждому объекту",
  description:
    "Проверки за каждым объектом Right Way на Пангане: титул в Земельном управлении, обременения, зонирование, легальный доступ к дороге, границы по GPS, коммуникации, полномочия продавца и разрешения на строительство.",
  alternates: {
    canonical: "/ru/due-diligence",
    languages: { en: "/due-diligence", ru: "/ru/due-diligence", "x-default": "/due-diligence" },
  },
};

const CHECKS = [
  {
    icon: ScrollText,
    title: "Титул, проверенный в Земельном управлении",
    text: "Читаем сам документ — Chanote или NS3K — в Земельном управлении, а не его фото. Класс документа, зарегистрированная площадь и цепочка владения должны совпадать с тем, что заявляет продавец, ещё до публикации объекта.",
  },
  {
    icon: FileCheck,
    title: "Обременения и залоги",
    text: "Ипотеки, уже зарегистрированные на земле аренды, сервитуты, узуфрукты. Всё, что записано против титула, всплывает здесь — и всё, что находим, идёт в примечания к объекту, а не под ковёр.",
  },
  {
    icon: Map,
    title: "Зонирование и правила застройки",
    text: "Что зона участка действительно разрешает: максимальная высота, коэффициент застройки, отступы, экологические ограничения. Красивый участок на склоне, на котором нельзя строить, — это не инвестиция.",
  },
  {
    icon: RouteIcon,
    title: "Легальный доступ к дороге",
    text: "Физический доступ — не то же, что юридический. Проверяем, является ли дорога к участку публичной, оформленной в документах или пересекающей чужую землю, и зарегистрировано ли право проезда.",
  },
  {
    icon: Ruler,
    title: "Границы по GPS",
    text: "Заборы врут; координаты — нет. Обходим участок по точкам межевания из документа и отмечаем любое расхождение между тем, что огорожено, что обрабатывается и что действительно в собственности.",
  },
  {
    icon: Zap,
    title: "Коммуникации на месте",
    text: "Государственное электричество или удлинитель от соседа? Реальный источник воды — муниципальный, скважина или сезонный? Варианты интернета? Проверяем на месте, а не по объявлению, которое написал продавец.",
  },
  {
    icon: UserCheck,
    title: "Личность и полномочия продавца",
    text: "Продающий должен быть тем, кто указан в документе, — или иметь проверяемую доверенность. Земля на компании проходит проверку компании: статус, директора, право на продажу.",
  },
  {
    icon: Landmark,
    title: "Разрешения по построенному",
    text: "Для вилл и домов: разрешение на строительство, домовая книга и соответствие построенного разрешённому. Несанкционированные постройки — повод для скидки, а не сюрприз.",
  },
] as const;

export default function DueDiligencePageRu() {
  const siteUrl = getSiteUrl();

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "HowTo",
    name: "Как Right Way проверяет объект на Пангане",
    description:
      "Чек-лист due diligence, применяемый к каждому объекту Right Way до публикации.",
    inLanguage: "ru",
    step: CHECKS.map((c, i) => ({
      "@type": "HowToStep",
      position: i + 1,
      name: c.title,
      text: c.text,
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
        eyebrow="Due diligence"
        title="Что мы проверяем до публикации объекта."
        lede="Каждый объект на этом сайте несёт один и тот же бейдж — и бейдж означает одни и те же восемь проверок, проведённых лично, каждый раз. Вот что именно за ним стоит."
      />

      <section className="container-prose py-16 md:py-24">
        <div className="grid gap-10 md:grid-cols-2 md:gap-x-14">
          {CHECKS.map((c, i) => (
            <div key={c.title} className="flex gap-5">
              <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-sm border border-forest-500/15 text-forest-500">
                <c.icon className="h-5 w-5" />
              </div>
              <div>
                <p className="text-xs font-medium uppercase tracking-[0.25em] text-brass-500">
                  {String(i + 1).padStart(2, "0")}
                </p>
                <h2 className="mt-1 font-serif text-2xl text-forest-900">{c.title}</h2>
                <p className="mt-2 text-base leading-relaxed text-forest-500/75">
                  {c.text}
                </p>
              </div>
            </div>
          ))}
        </div>

        <div className="mt-16 rounded-sm border border-forest-500/10 bg-cream-50 p-8 md:mt-20 md:p-10">
          <h2 className="font-serif text-3xl text-forest-900">
            Что это — и чем это не является.
          </h2>
          <p className="mt-4 max-w-prose text-base leading-relaxed text-forest-500/75">
            Наша проверка — это фильтр, который не пускает плохие объекты на сайт.
            Она не заменяет вашего юриста — и мы первыми настоим, чтобы вы его
            наняли. Независимая юридическая проверка перед передачей права — часть
            каждой нашей сделки, и если своего юриста у вас нет, мы познакомим вас
            с теми, кому доверяем.
          </p>
          <p className="mt-4 max-w-prose text-sm leading-relaxed text-forest-500/60">
            Бейдж{" "}
            <strong className="font-medium text-forest-500/80">Vetted by Right Way</strong>{" "}
            означает, что объект прошёл эти проверки уровня листинга на указанную
            дату — добросовестный фильтр по документам и публичным записям,
            доступным нам на тот момент. Это не юридическая гарантия титула, границ
            или возможности застройки, и условия могут измениться после даты
            проверки. Обязывающая проверка — это due diligence уровня сделки и
            независимая юридическая экспертиза перед любой передачей права.
          </p>
          <div className="mt-8 flex flex-col gap-3 sm:flex-row sm:gap-4">
            <Button asChild variant="primary" size="md">
              <Link href={"/ru/listings" as Route}>Смотреть проверенные объекты</Link>
            </Button>
            <Button asChild variant="outline" size="md">
              <Link href={"/ru/process" as Route}>Как проходит сделка</Link>
            </Button>
          </div>
        </div>
      </section>
    </>
  );
}
