import type { Metadata } from "next";
import { jsonLdHtml } from "@/lib/seo/json-ld";
import { PageHero } from "@/components/sections/page-hero";
import { ZoneChecker } from "@/components/tools/zone-checker";
import { getSiteUrl } from "@/lib/site-url";

export const metadata: Metadata = {
  title: "Что здесь можно строить? — проверка зоны застройки на Пангане",
  description:
    "Вставьте локацию на Ко Пангане и узнайте индикативные правила застройки — зону городского плана (ผังเมือง), разрешённое использование и что проверить до стройки. Бесплатно; точные цифры подтверждаются в нашем due diligence.",
  alternates: {
    canonical: "/ru/tools/zoning",
    languages: { en: "/tools/zoning", ru: "/ru/tools/zoning", "x-default": "/tools/zoning" },
  },
  openGraph: {
    title: "Что можно построить на этом участке на Пангане?",
    description:
      "Вставьте локацию → зона городского плана, разрешённое использование и предупреждения для любой точки Ко Пангана. Бесплатно, индикативно.",
    url: "/ru/tools/zoning",
  },
};

export const revalidate = 300;

export default function RussianZoningPage() {
  const siteUrl = getSiteUrl();
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "WebApplication",
    name: "Right Way — проверка зон и правил застройки на Ко Пангане",
    applicationCategory: "BusinessApplication",
    operatingSystem: "Web",
    url: `${siteUrl}/ru/tools/zoning`,
    offers: { "@type": "Offer", price: "0", priceCurrency: "THB" },
    description:
      "Индикативные правила застройки для любой точки Ко Пангана по зоне тайского городского плана (ผังเมือง): разрешённое использование, типовая застройка и что проверить в due diligence.",
    publisher: { "@type": "Organization", name: "Right Way Phangan Group", url: siteUrl },
  };

  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: jsonLdHtml(jsonLd) }} />
      <PageHero
        eyebrow="Бесплатная проверка зоны"
        title="Что можно построить на участке?"
        lede="Вставьте локацию на Ко Пангане — или кликните участок на карте — и мы прочитаем зону тайского городского плана (ผังเมือง) в этой точке: разрешённое использование, типовую застройку и что проверить в первую очередь. Индикативно; точные высота, пятно застройки и отступы для вашего документа подтверждаются в нашем due diligence."
      />
      <section className="container-prose mt-10 md:mt-14">
        <ZoneChecker locale="ru" />
      </section>
    </>
  );
}
