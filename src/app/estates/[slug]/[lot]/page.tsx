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

export const revalidate = 300;

/** Каждый лот каждой опубликованной подборки → своя статичная страница. */
export function generateStaticParams() {
  return getPublishedEstates().flatMap((e) => e.plots.map((p) => ({ slug: e.slug, lot: p.code })));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug, lot } = await params;
  const estate = getEstateBySlug(slug);
  const plot = estate?.plots.find((p) => p.code === lot);
  if (!estate || !plot) return { title: "Plot not found" };
  const price = plotPriceVisible(plot.status) && plot.priceThb ? ` · ${formatPriceCompact(plot.priceThb)}` : "";
  const title = `${plot.code} — ${estate.name.en}${price}`;
  const description = plot.note?.en ?? estate.tagline.en;
  const img = plot.photos?.[0] ?? estate.cover;
  const siteUrl = getSiteUrl();
  return {
    title,
    description,
    alternates: {
      canonical: `/estates/${slug}/${lot}`,
      languages: {
        en: `/estates/${slug}/${lot}`,
        ru: `/ru/estates/${slug}/${lot}`,
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

export default async function EstateLotPage({ params }: Props) {
  const { slug, lot } = await params;
  const estate = getEstateBySlug(slug);
  const plot = estate?.plots.find((p) => p.code === lot);
  if (!estate || !plot) notFound();
  const siteUrl = getSiteUrl();
  const pageUrl = `${siteUrl}/estates/${slug}`;
  return (
    <>
      <EstateJsonLd estate={estate} url={pageUrl} locale="en" />
      <BreadcrumbJsonLd
        crumbs={[
          { name: "Home", url: `${siteUrl}/` },
          { name: "Land estates", url: `${siteUrl}/estates` },
          { name: estate.name.en, url: pageUrl },
          { name: plot.code, url: `${pageUrl}/${plot.code}` },
        ]}
      />
      <LandEstateLanding estate={estate} locale="en" initialLot={plot.code} />
    </>
  );
}
