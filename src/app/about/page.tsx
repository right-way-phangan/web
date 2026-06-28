import type { Metadata } from "next";
import { jsonLdHtml } from "@/lib/seo/json-ld";
import Link from "next/link";
import { PageHero } from "@/components/sections/page-hero";
import { ContentSection } from "@/components/sections/content-section";
import { PrincipleGrid } from "@/components/sections/principle-grid";
import { SectionEyebrow } from "@/components/sections/section-eyebrow";
import { Reveal } from "@/components/sections/reveal";
import { Button } from "@/components/ui/button";
import { whatsappLink } from "@/lib/site-config";
import { DEFAULT_AUTHOR, authorPersonSchema } from "@/content/authors";
import { getSiteUrl } from "@/lib/site-url";

export const metadata: Metadata = {
  alternates: { canonical: "/about", languages: { en: "/about", ru: "/ru/about", "x-default": "/about" } },
  title: "About",
  description:
    "Right Way Phangan Group — a real estate advisory on Koh Phangan, founded by Vladimir Buryi in 2026.",
};

const PRINCIPLES = [
  {
    title: "Honesty over polish",
    text: "If a property has issues, you hear about them before we walk on-site. Our reputation depends on long-term relationships, not single transactions.",
  },
  {
    title: "Process over hustle",
    text: "Every transaction follows a documented sequence: title search, boundary verification, encumbrance check, zoning, access rights, tax exposure. Nothing improvised, nothing skipped.",
  },
  {
    title: "Data over opinion",
    text: "We track price per rai by district, leasehold escalation norms, time-on-market — and we share what we know with our clients.",
  },
] as const;

export default function AboutPage() {
  const siteUrl = getSiteUrl();
  // ProfilePage wrapping the founder Person — makes the #vladimir-buryi anchor
  // an authoritative bio entity that every article's author @id resolves to.
  const profileSchema = {
    "@context": "https://schema.org",
    "@type": "ProfilePage",
    mainEntity: authorPersonSchema(DEFAULT_AUTHOR, siteUrl, "en"),
  };
  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: jsonLdHtml(profileSchema) }}
      />
      <PageHero
        eyebrow="About"
        title="A specialised advisory, not a listing portal."
        lede="Right Way Phangan Group was founded in 2026 by Vladimir Buryi, on four years of work in the local land market. A small, specialised team — Koh Phangan property only."
        image="/images/scenes/coast-aerial.jpg"
        imageAlt="Aerial view of the Koh Phangan coastline"
      />

      <PrincipleGrid
        eyebrow="What we believe"
        title="Three principles, in plain language."
        principles={[...PRINCIPLES]}
      />

      <ContentSection eyebrow="The name" title='Why "Right Way"' spacing="default">
        <p>
          The name reflects a position rather than a slogan: there is a right
          way to buy property on Phangan, and there are several easier, faster
          ways that result in disputes, lost deposits, or unbuildable land.
        </p>
        <p>
          We optimise for the first path. It costs a little more time. It is
          rarely the wrong choice.
        </p>
      </ContentSection>

      <section id={DEFAULT_AUTHOR.slug} className="container-prose scroll-mt-24 py-16 md:py-24">
        <Reveal>
          <div className="grid gap-10 md:grid-cols-[1fr_2fr] md:gap-16">
            <div>
              <SectionEyebrow>The founder</SectionEyebrow>
              <h2 className="mt-3 font-serif text-3xl text-forest-900 md:text-4xl">
                Vladimir Buryi
              </h2>
              <p className="mt-2 text-sm text-forest-500/60">
                Founder · Koh Phangan
              </p>
            </div>

            <div className="rounded-bezel bg-cream-200/50 p-1.5 ring-1 ring-forest-900/5">
              <div className="rounded-core bg-cream-50 p-6 shadow-bezel md:p-8">
                <div className="space-y-4 text-base leading-relaxed text-forest-500/85 md:text-lg">
                  <p>
                    Originally from Saint Petersburg, Russia. Four years operating
                    in the Phangan land market, with hundreds of land plots
                    assessed and over forty transactions supported in the local
                    market. Living on Koh Phangan year-round for over four years.
                  </p>
                  <p className="text-sm text-forest-500/70">
                    Languages: English, Russian.
                  </p>
                  <div className="flex flex-wrap gap-3 pt-4">
                    <Button asChild variant="outline" size="md">
                      <a
                        href={whatsappLink("Hi Vladimir — I'd like to ask about Right Way Phangan.")}
                        target="_blank"
                        rel="noopener noreferrer"
                      >
                        Message on WhatsApp
                      </a>
                    </Button>
                    <Button asChild variant="ghost" size="md">
                      <Link href="/contact">Get in touch</Link>
                    </Button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </Reveal>
      </section>
    </>
  );
}
