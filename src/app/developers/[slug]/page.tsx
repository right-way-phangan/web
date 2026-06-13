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
  if (!dev) return { title: "Developer not found" };
  return {
    title: `${dev.name} — developer projects`,
    description: `Projects by ${dev.name} on Koh Phangan — units, pricing and availability.`,
    alternates: {
      canonical: `/developers/${slug}`,
      languages: { en: `/developers/${slug}`, ru: `/ru/developers/${slug}`, "x-default": `/developers/${slug}` },
    },
  };
}

export default async function DeveloperRoute({ params }: Props) {
  const { slug } = await params;
  return <DeveloperPage slug={slug} locale="en" />;
}
