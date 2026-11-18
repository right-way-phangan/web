import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { getEstateBySlug, getPublishedEstates, plotPriceVisible } from "@/content/land-estates";
import { LandEstateLanding } from "@/components/estates/land-estate-landing";
import { BreadcrumbJsonLd } from "@/components/seo/breadcrumb-json-ld";
import { EstateJsonLd } from "@/components/estates/estate-json-ld";
import { getSiteUrl } from "@/lib/site-url";
import { formatPriceCompact } from "@/lib/utils/price";

interface Props {
  params: Promise<{ slug: string; lot: string }>;
}

export const revalidate = 3600;

export function generateStaticParams() {
  return getPublishedEstates().flatMap((e) => e.plots.map((p) => ({ slug: e.slug, lot: p.code })));
}

// Контент подборок (name/tagline/note) пока только EN+RU — для th берём EN.
export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug, lot } = await params;
  const estate = getEstateBySlug(slug);
  const plot = estate?.plots.find((p) => p.code === lot);
  if (!estate || !plot) return { title: "ไม่พบแปลงที่ดิน" };
  const price = plotPriceVisible(plot.status) && plot.priceThb ? ` · ${formatPriceCompact(plot.priceThb)}` : "";
  const title = `${plot.code} — ${estate.name.th}${price}`;
  const description = plot.note?.th ?? estate.tagline.th;
  const img = plot.photos?.[0] ?? estate.cover;
  const siteUrl = getSiteUrl();
  return {
    title,
    description,
    alternates: {
      canonical: `/th/estates/${slug}/${lot}`,
      languages: {
        en: `/estates/${slug}/${lot}`,
        ru: `/ru/estates/${slug}/${lot}`,
        th: `/th/estates/${slug}/${lot}`,
        "x-default": `/estates/${slug}/${lot}`,
      },
    },
    openGraph: {
      title,
      description,
      ...(img ? { images: [`${siteUrl}${img}`] } : {}),
    },
  };
}

export default async function ThaiEstateLotPage({ params }: Props) {
  const { slug, lot } = await params;
  const estate = getEstateBySlug(slug);
  const plot = estate?.plots.find((p) => p.code === lot);
  if (!estate || !plot) notFound();
  const siteUrl = getSiteUrl();
  const pageUrl = `${siteUrl}/th/estates/${slug}`;
  return (
    <>
      <EstateJsonLd estate={estate} url={pageUrl} locale="th" />
      <BreadcrumbJsonLd
        crumbs={[
          { name: "หน้าแรก", url: `${siteUrl}/th` },
          { name: "โครงการที่ดิน", url: `${siteUrl}/th/estates` },
          { name: estate.name.th, url: pageUrl },
          { name: plot.code, url: `${pageUrl}/${plot.code}` },
        ]}
      />
      <LandEstateLanding estate={estate} locale="th" initialLot={plot.code} />
    </>
  );
}
