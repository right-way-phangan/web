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

export const revalidate = 3600;

export function generateStaticParams() {
  return getPublishedEstates().map((e) => ({ slug: e.slug }));
}

// Контент подборок (name/tagline/note) пока только EN+RU — для th берём EN.
export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const estate = getEstateBySlug(slug);
  if (!estate) return { title: "ไม่พบโครงการที่ดิน" };
  return {
    title: estate.name.en,
    description: estate.tagline.en,
    alternates: {
      canonical: `/th/estates/${slug}`,
      languages: { en: `/estates/${slug}`, ru: `/ru/estates/${slug}`, th: `/th/estates/${slug}`, "x-default": `/estates/${slug}` },
    },
  };
}

export default async function ThaiEstateLandingPage({ params }: Props) {
  const { slug } = await params;
  const estate = getEstateBySlug(slug);
  if (!estate) notFound();
  const siteUrl = getSiteUrl();
  const pageUrl = `${siteUrl}/th/estates/${slug}`;
  return (
    <>
      <EstateJsonLd estate={estate} url={pageUrl} locale="th" />
      <BreadcrumbJsonLd
        crumbs={[
          { name: "หน้าแรก", url: `${siteUrl}/th` },
          { name: "โครงการที่ดิน", url: `${siteUrl}/th/estates` },
          { name: estate.name.en, url: pageUrl },
        ]}
      />
      <LandEstateLanding estate={estate} locale="th" />
    </>
  );
}
