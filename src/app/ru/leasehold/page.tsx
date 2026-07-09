import type { Metadata } from "next";
import { jsonLdHtml } from "@/lib/seo/json-ld";
import Link from "next/link";
import type { Route } from "next";
import {
  Building2,
  ShieldCheck,
  FileSignature,
  CalendarClock,
  Landmark,
  ClipboardCheck,
  MessageCircle,
} from "lucide-react";
import { PageHero } from "@/components/sections/page-hero";
import { LeaseholdListings } from "@/components/sections/leasehold-listings";
import { Button } from "@/components/ui/button";
import { getSiteUrl } from "@/lib/site-url";
import { whatsappLink } from "@/lib/site-config";

export const metadata: Metadata = {
  title: "Лизхолд-виллы на Пангане — дом ваш, земля в аренде",
  description:
    "Безопасный способ для иностранца владеть виллой на Пангане: здание — на вас, земля — в зарегистрированной долгосрочной аренде, без номиналов и тайской компании-прокладки. Зарегистрированная аренда, задаток на счёте юрфирмы, двухуровневый due diligence.",
  alternates: {
    canonical: "/ru/leasehold",
    languages: { en: "/leasehold", ru: "/ru/leasehold", "x-default": "/leasehold" },
  },
};

const PILLARS = [
  {
    icon: Building2,
    title: "Вилла — ваша, земля — в аренде",
    text: "В Таиланде здание и земля — это разные титулы. Виллу вы держите как строение на своё имя — разрешение на строительство и, где уместно, зарегистрированный superficies, — а земля под ней идёт по долгосрочной аренде, которую вы контролируете. Два чистых титула, а не один запутанный.",
  },
  {
    icon: ShieldCheck,
    title: "Без номиналов и компании-прокладки",
    text: "Схема «фрихолд через тайскую компанию» — иностранец контролирует меньшинство, а тайские номиналы держат остальное — это ровно то, что сейчас проверяют на острове. Зарегистрированной аренде ничего из этого не нужно.",
  },
  {
    icon: FileSignature,
    title: "Регистрация в Земельном управлении",
    text: "Тридцать лет — максимальный единый срок, на который тайская аренда земли регистрируется. Мы регистрируем её на титул — ваше имя в записи, — а не устное обещание, лежащее в ящике.",
  },
  {
    icon: CalendarClock,
    title: "Продление прописано (30+30)",
    text: "Аренда структурируется с договорными продлениями — обычно в формате 30+30 — и, на правильной сделке, с зарегистрированным правом продлить или выкупить землю позже. Горизонт уходит далеко за первый срок.",
  },
  {
    icon: Landmark,
    title: "Деньги защищены до регистрации",
    text: "Задаток держит партнёрская юрфирма на отдельном клиентском счёте — не уходит продавцу заранее — и высвобождается только когда аренда и здание зарегистрированы на ваше имя. Вы платите, когда это действительно ваше по бумагам.",
  },
  {
    icon: ClipboardCheck,
    title: "Двухуровневый due diligence",
    text: "Проверка уровня листинга до публикации объекта, затем полный due diligence сделки с юристом до подписания. Аренда, разрешение на строительство и титул земли — всё читается в первоисточнике.",
  },
] as const;

const FAQ = [
  {
    q: "Может ли иностранец легально владеть недвижимостью в Таиланде?",
    a: "Иностранцу нельзя владеть землёй напрямую, но можно владеть зданием и держать землю в зарегистрированной долгосрочной аренде. Лизхолд — путь, которым большинство международных покупателей берут виллу: дом вы держите как строение, а землю под ним арендуете. Второй путь иностранного владения — квартира в кондо, но на Пангане подходящих кондо почти нет.",
  },
  {
    q: "Что будет, когда аренда закончится?",
    a: "Тайская аренда земли регистрируется на срок до 30 лет за раз. Договоры пишутся с опциями продления — обычно в формате 30+30 — и, на правильной сделке, с зарегистрированным правом продлить или выкупить. Что именно подлежит исполнению, зависит от формулировок и собственника земли — поэтому аренда входит в due diligence сделки и в проверку вашего юриста до подписания.",
  },
  {
    q: "Я действительно владею виллой или только арендую её?",
    a: "Виллой вы владеете. Здание и земля в Таиланде — разные титулы: иностранец может держать здание на своё имя, с разрешением на строительство и, где используется, зарегистрированным superficies, а земля под ним арендуется. Здание можно продать, передав оставшийся срок аренды следующему покупателю.",
  },
  {
    q: "Почему лизхолд, а не тайская компания с фрихолдом?",
    a: "Схема через компанию — тайская Co., Ltd., где иностранец контролирует меньшинство, а тайские номиналы держат остальное, — это конструкция, которую сейчас проверяют на острове. Она несёт риск номиналов и постоянные расходы на компанию. Зарегистрированная аренда проще, дешевле в содержании и не опирается на номиналов.",
  },
  {
    q: "Есть ли смысл в лизхолде как в инвестиции?",
    a: "Может быть. Наш калькулятор считает его честно: стоимость аренды при перепродаже падает по мере сокращения срока, плата за землю индексируется год к году, а прогноз дисконтируется оставшимися годами аренды. Просчитайте свои цифры — срок, аренда, рост — и увидите денежный поток до того, как решитесь.",
  },
] as const;

export default function LeaseholdPageRu() {
  const siteUrl = getSiteUrl();

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    inLanguage: "ru",
    mainEntity: FAQ.map((f) => ({
      "@type": "Question",
      name: f.q,
      acceptedAnswer: { "@type": "Answer", text: f.a },
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
        eyebrow="Лизхолд"
        title="Вилла — ваша. Земля — в аренде. Без номиналов."
        lede="Лизхолд — это как международные покупатели держат дом на Пангане без тайской компании-прокладки: здание на ваше имя, земля в зарегистрированной долгосрочной аренде, задаток под защитой у юриста до регистрации. Вот как именно это работает."
      />

      <section className="container-prose py-16 md:py-24">
        <div className="grid gap-10 md:grid-cols-2 md:gap-x-14">
          {PILLARS.map((p, i) => (
            <div key={p.title} className="flex gap-5">
              <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-sm border border-forest-500/15 text-forest-500">
                <p.icon className="h-5 w-5" />
              </div>
              <div>
                <p className="text-xs font-medium uppercase tracking-[0.25em] text-brass-500">
                  {String(i + 1).padStart(2, "0")}
                </p>
                <h2 className="mt-1 font-serif text-2xl text-forest-900">{p.title}</h2>
                <p className="mt-2 text-base leading-relaxed text-forest-500/75">{p.text}</p>
              </div>
            </div>
          ))}
        </div>

        {/* Просчитать — калькулятор уже умеет лизхолд (decay срока, индексация
            аренды, дисконт по истечению). Дип-линк прямо в этот режим. */}
        <div className="mt-16 rounded-bezel bg-cream-200/50 p-1.5 ring-1 ring-forest-900/5 md:mt-20">
          <div className="rounded-core bg-cream-50 p-8 shadow-bezel md:p-10">
            <h2 className="font-serif text-3xl text-forest-900">Увидьте денежный поток до решения.</h2>
            <p className="mt-4 max-w-prose text-base leading-relaxed text-forest-500/75">
              Наш калькулятор доходности считает лизхолд честно: стоимость перепродажи падает по
              мере сокращения срока, плата за землю индексируется год к году, а прогноз
              дисконтируется оставшимися годами аренды. Задайте срок, аренду и ожидаемый рост — и
              смотрите, как двигаются цифры.
            </p>
            <div className="mt-8 flex flex-col gap-3 sm:flex-row sm:gap-4">
              <Button asChild variant="primary" size="md">
                <Link href={"/ru/calculator?tenure=leasehold" as Route}>Просчитать доходность</Link>
              </Button>
              <Button asChild variant="outline" size="md">
                <Link href={"/ru/projects" as Route}>Лизхолд-проекты застройщиков</Link>
              </Button>
            </div>
          </div>
        </div>

        {/* Живой инвентарь лизинга — реальные карточки, индексируемые, в один клик. */}
        <LeaseholdListings locale="ru" />

        {/* FAQ — видимые Q&A зеркалят FAQPage JSON-LD выше (AEO). */}
        <div className="mt-16 md:mt-20">
          <h2 className="font-serif text-3xl text-forest-900">Лизхолд — по пунктам.</h2>
          <dl className="mt-8 grid gap-8 md:grid-cols-2 md:gap-x-14">
            {FAQ.map((f) => (
              <div key={f.q}>
                <dt className="font-serif text-xl text-forest-900">{f.q}</dt>
                <dd className="mt-2 text-base leading-relaxed text-forest-500/75">{f.a}</dd>
              </div>
            ))}
          </dl>
        </div>

        {/* Что это — и чем это не является (зеркалит блок доверия due-diligence). */}
        <div className="mt-16 rounded-sm border border-forest-500/10 bg-cream-50 p-8 md:mt-20 md:p-10">
          <h2 className="font-serif text-3xl text-forest-900">Лизхолд, сделанный правильно.</h2>
          <p className="mt-4 max-w-prose text-base leading-relaxed text-forest-500/75">
            Зарегистрированная аренда, здание на ваше имя, задаток под защитой до регистрации и те же
            двухуровневые проверки за каждым объектом —{" "}
            <Link href={"/ru/due-diligence" as Route} className="underline decoration-brass-500/40 underline-offset-4 hover:decoration-brass-500">
              что мы проверяем
            </Link>{" "}
            на уровне листинга, затем полный due diligence сделки с юристом.
          </p>
          <p className="mt-4 max-w-prose text-sm leading-relaxed text-forest-500/60">
            Эта страница объясняет, как работает лизхолд на Пангане, — это не юридическая
            консультация. Условия аренды, права продления и их исполнимость различаются от сделки к
            сделке и от собственника к собственнику. Мы первыми настоим, чтобы вы наняли своего
            юриста, и независимая юридическая проверка перед любой регистрацией — часть каждой нашей
            сделки.
          </p>
          <div className="mt-8 flex flex-col gap-3 sm:flex-row sm:gap-4">
            <Button asChild variant="primary" size="md">
              <Link href={"/ru/projects" as Route}>Лизхолд-проекты застройщиков</Link>
            </Button>
            <Button asChild variant="outline" size="md">
              <a href={whatsappLink("Здравствуйте! Хочу разобраться с лизхолдом на Пангане.")} target="_blank" rel="noopener noreferrer">
                <MessageCircle className="h-4 w-4" />
                Связаться с нами
              </a>
            </Button>
          </div>
        </div>
      </section>
    </>
  );
}
