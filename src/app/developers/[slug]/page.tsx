import type { Metadata } from "next";
import { getDevelopers, getDeveloperBySlug } from "@/lib/data/projects";
import { getDeveloperProfile, profileSlugs } from "@/content/developers";
import { DeveloperPage } from "@/components/projects/developer-page";
import { BreadcrumbJsonLd } from "@/components/seo/breadcrumb-json-ld";
import { jsonLdHtml } from "@/lib/seo/json-ld";
import { getSiteUrl } from "@/lib/site-url";

interface Props {
  params: Promise<{ slug: string }>;
}

export const revalidate = 300;

export async function generateStaticParams() {
  const devs = await getDevelopers();
  // Union with curated profiles so a profile page survives catalog drift
  // (developer field renamed / objects unpublished).
  return [...new Set([...devs.map((d) => d.slug), ...profileSlugs()])].map(
    (slug) => ({ slug }),
  );
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const dev = await getDeveloperBySlug(slug);
  const profile = getDeveloperProfile(slug);
  if (!dev && !profile) return { title: "Developer not found" };
  const name = dev?.name ?? profile!.name;
  return {
    title: profile?.seo?.title?.en ?? `${name} — developer projects`,
    description:
      profile?.seo?.description?.en ??
      `Projects by ${name} on Koh Phangan — units, pricing and availability.`,
    alternates: {
      canonical: `/developers/${slug}`,
      languages: {
        en: `/developers/${slug}`,
        ru: `/ru/developers/${slug}`,
        "x-default": `/developers/${slug}`,
      },
    },
    ...(profile?.hero?.photo
      ? { openGraph: { images: [`${getSiteUrl()}${profile.hero.photo}`] } }
      : {}),
  };
}

export default async function DeveloperRoute({ params }: Props) {
  const { slug } = await params;
  const dev = await getDeveloperBySlug(slug);
  const profile = getDeveloperProfile(slug);
  const name = dev?.name ?? profile?.name;
  const base = getSiteUrl();
  return (
    <>
      {name ? (
        <BreadcrumbJsonLd
          crumbs={[
            { name: "Home", url: base },
            { name: "Projects", url: `${base}/projects` },
            { name, url: `${base}/developers/${slug}` },
          ]}
        />
      ) : null}
      {profile ? (
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: jsonLdHtml({
              "@context": "https://schema.org",
              "@type": "Organization",
              name: profile.name,
              description: profile.seo?.description?.en,
              url: `${base}/developers/${slug}`,
            }),
          }}
        />
      ) : null}
      <DeveloperPage slug={slug} locale="en" />
    </>
  );
}
