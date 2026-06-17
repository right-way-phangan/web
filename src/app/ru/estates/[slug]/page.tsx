import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { getEstateBySlug, getPublishedEstates } from "@/content/land-estates";
import { LandEstateLanding } from "@/components/estates/land-estate-landing";
import { BreadcrumbJsonLd } from "@/components/seo/breadcrumb-json-ld";
import { EstateJsonLd } from "@/components/estates/estate-json-ld";
import { getSiteUrl } from "@/lib/site-url";

interface Props {
  params: Promise<{ slug: string }>;
}

export const revalidate = 300;

export function generateStaticParams() {
  return getPublishedEstates().map((e) => ({ slug: e.slug }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const estate = getEstateBySlug(slug);
  if (!estate) return { title: "Подборка не найдена" };
  return {
    title: estate.name.ru,
    description: estate.tagline.ru,
    alternates: {
      canonical: `/ru/estates/${slug}`,
      languages: { en: `/estates/${slug}`, ru: `/ru/estates/${slug}`, "x-default": `/estates/${slug}` },
    },
  };
}

export default async function RuEstateLandingPage({ params }: Props) {
  const { slug } = await params;
  const estate = getEstateBySlug(slug);
  if (!estate) notFound();
  const siteUrl = getSiteUrl();
  const pageUrl = `${siteUrl}/ru/estates/${slug}`;
  return (
    <>
      <EstateJsonLd estate={estate} url={pageUrl} locale="ru" />
      <BreadcrumbJsonLd
        crumbs={[
          { name: "Главная", url: `${siteUrl}/ru` },
          { name: "Земельные проекты", url: `${siteUrl}/ru/estates` },
          { name: estate.name.ru, url: pageUrl },
        ]}
      />
      <LandEstateLanding estate={estate} locale="ru" />
    </>
  );
}
