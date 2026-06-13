import type { Metadata } from "next";
import { getDevelopers, getDeveloperBySlug } from "@/lib/data/projects";
import { DeveloperPage } from "@/components/projects/developer-page";

interface Props {
  params: Promise<{ slug: string }>;
}

export const revalidate = 300;

export async function generateStaticParams() {
  const devs = await getDevelopers();
  return devs.map((d) => ({ slug: d.slug }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const dev = await getDeveloperBySlug(slug);
  if (!dev) return { title: "Застройщик не найден" };
  return {
    title: `${dev.name} — проекты застройщика`,
    description: `Проекты застройщика ${dev.name} на Ко Пангане — юниты, цены и доступность.`,
    alternates: {
      canonical: `/ru/developers/${slug}`,
      languages: { en: `/developers/${slug}`, ru: `/ru/developers/${slug}`, "x-default": `/developers/${slug}` },
    },
  };
}

export default async function RuDeveloperRoute({ params }: Props) {
  const { slug } = await params;
  return <DeveloperPage slug={slug} locale="ru" />;
}
