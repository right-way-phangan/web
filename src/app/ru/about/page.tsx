import type { Metadata } from "next";
import Link from "next/link";
import type { Route } from "next";
import { PageHero } from "@/components/sections/page-hero";
import { ContentSection } from "@/components/sections/content-section";
import { PrincipleGrid } from "@/components/sections/principle-grid";
import { Button } from "@/components/ui/button";
import { whatsappLink } from "@/lib/site-config";
import { getAboutDict } from "@/lib/i18n/dictionaries";
import { DEFAULT_AUTHOR, authorPersonSchema } from "@/content/authors";
import { getSiteUrl } from "@/lib/site-url";

export const metadata: Metadata = {
  title: "О нас",
  description:
    "Right Way Phangan Group — агентство недвижимости на Ко Пангане, основано Владимиром Бурым в 2026 году.",
  alternates: { canonical: "/ru/about", languages: { en: "/about", ru: "/ru/about", "x-default": "/about" } },
};

export default function RussianAboutPage() {
  const d = getAboutDict("ru");
  const siteUrl = getSiteUrl();
  const profileSchema = {
    "@context": "https://schema.org",
    "@type": "ProfilePage",
    mainEntity: authorPersonSchema(DEFAULT_AUTHOR, siteUrl, "ru"),
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(profileSchema) }}
      />
      <PageHero
        eyebrow={d.hero.eyebrow}
        title={d.hero.title}
        lede={d.hero.lede}
        image="/images/scenes/coast-aerial.jpg"
        imageAlt="Вид с воздуха на побережье Ко Пангана"
      />

      <PrincipleGrid
        eyebrow={d.principlesEyebrow}
        title={d.principlesTitle}
        principles={[...d.principles]}
      />

      <ContentSection eyebrow={d.nameSection.eyebrow} title={d.nameSection.title} spacing="default">
        {d.nameSection.body.map((p) => (
          <p key={p}>{p}</p>
        ))}
      </ContentSection>

      <section id={DEFAULT_AUTHOR.slug} className="container-prose scroll-mt-24 py-16 md:py-24">
        <div className="grid gap-10 md:grid-cols-[1fr_2fr] md:gap-16">
          <div>
            <p className="text-xs font-medium uppercase tracking-[0.3em] text-brass-500">
              {d.founder.eyebrow}
            </p>
            <h2 className="mt-3 font-serif text-3xl text-forest-900 md:text-4xl">
              {d.founder.name}
            </h2>
            <p className="mt-2 text-sm text-forest-500/60">{d.founder.role}</p>
          </div>

          <div className="space-y-4 text-base leading-relaxed text-forest-500/85 md:text-lg">
            <p>{d.founder.body}</p>
            <p className="text-sm text-forest-500/70">{d.founder.languages}</p>
            <div className="flex flex-wrap gap-3 pt-4">
              <Button asChild variant="outline" size="md">
                <a
                  href={whatsappLink("Здравствуйте, Владимир — хочу узнать про Right Way Phangan.")}
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  {d.founder.whatsapp}
                </a>
              </Button>
              <Button asChild variant="ghost" size="md">
                <Link href={"/ru/contact" as Route}>{d.founder.contact}</Link>
              </Button>
            </div>
          </div>
        </div>
      </section>
    </>
  );
}
