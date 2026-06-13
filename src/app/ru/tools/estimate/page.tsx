import type { Metadata } from "next";
import { PageHero } from "@/components/sections/page-hero";
import { EstimateTool } from "@/components/tools/estimate-tool";
import { getSiteUrl } from "@/lib/site-url";

export const metadata: Metadata = {
  title: "Сколько стоит ваша недвижимость на Пангане? — мгновенная оценка",
  description:
    "Мгновенная рыночная оценка земли или виллы на Ко Пангане по собственным данным сделок Right Way. Бесплатно, без обязательств — затем точная оценка от команды.",
  alternates: {
    canonical: "/ru/tools/estimate",
    languages: { en: "/tools/estimate", ru: "/ru/tools/estimate", "x-default": "/tools/estimate" },
  },
  openGraph: {
    title: "Сколько стоит ваша недвижимость на Пангане?",
    description:
      "Мгновенная рыночная оценка земли или виллы на Ко Пангане по собственным данным сделок Right Way — бесплатно.",
    url: "/ru/tools/estimate",
  },
};

export const revalidate = 300;

export default function RussianEstimatePage() {
  const siteUrl = getSiteUrl();
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "WebApplication",
    name: "Right Way — оценщик недвижимости Ко Пангана",
    applicationCategory: "BusinessApplication",
    operatingSystem: "Web",
    url: `${siteUrl}/ru/tools/estimate`,
    offers: { "@type": "Offer", price: "0", priceCurrency: "THB" },
    description:
      "Мгновенная ориентировочная рыночная оценка земли и вилл на Ко Пангане по собственному каталогу, проданным аналогам и аналитике аренды Right Way.",
    publisher: { "@type": "Organization", name: "Right Way Phangan Group", url: siteUrl },
  };

  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />
      <PageHero
        eyebrow="Бесплатная оценка"
        title="Сколько стоит ваша недвижимость на Пангане?"
        lede="Мгновенная рыночная оценка по нашим данным сделок — проданные участки, активные объявления и доходность аренды по острову. Бесплатно, без обязательств. Затем команда подтвердит цифру под ваш документ и расположение."
      />
      <section className="container-prose mt-10 md:mt-14">
        <EstimateTool lang="ru" />
      </section>
    </>
  );
}
