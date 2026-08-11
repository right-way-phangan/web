import type { Metadata } from "next";
import Link from "next/link";
import type { Route } from "next";
import { PageHero } from "@/components/sections/page-hero";
import { SectionEyebrow } from "@/components/sections/section-eyebrow";
import { Reveal } from "@/components/sections/reveal";
import { ContentSection } from "@/components/sections/content-section";
import { PrincipleGrid } from "@/components/sections/principle-grid";
import { Testimonials } from "@/components/sections/testimonials";
import { Button } from "@/components/ui/button";
import { whatsappLink } from "@/lib/site-config";
import { getAboutDict } from "@/lib/i18n/dictionaries";

export const metadata: Metadata = {
  title: "О нас",
  description:
    "Right Way Phangan Group — агентство недвижимости на Ко Пангане: проверенные объекты, сопровождение сделок и аналитика рынка.",
  alternates: { canonical: "/ru/about", languages: { en: "/about", ru: "/ru/about", "x-default": "/about" } },
};

export default function RussianAboutPage() {
  const d = getAboutDict("ru");

  return (
    <>
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

      <Testimonials locale="ru" />

      <ContentSection eyebrow={d.nameSection.eyebrow} title={d.nameSection.title} spacing="default">
        {d.nameSection.body.map((p) => (
          <p key={p}>{p}</p>
        ))}
      </ContentSection>

      <section className="container-prose py-14 md:py-20">
        <Reveal>
          <div className="grid gap-10 md:grid-cols-[1fr_2fr] md:gap-16">
            <div>
              <SectionEyebrow>{d.team.eyebrow}</SectionEyebrow>
              <h2 className="mt-3 font-serif text-3xl text-forest-900 md:text-4xl">
                {d.team.title}
              </h2>
              <p className="mt-2 text-sm text-forest-500/60">{d.team.role}</p>
            </div>

            <div className="rounded-bezel bg-cream-200/50 p-1.5 ring-1 ring-forest-900/5">
              <div className="rounded-core bg-cream-50 p-6 shadow-bezel md:p-8">
                <div className="space-y-4 text-base leading-relaxed text-forest-500/85 md:text-lg">
                  <p>{d.team.body}</p>
                  <p className="text-sm text-forest-500/70">{d.team.languages}</p>
                  <div className="flex flex-wrap gap-3 pt-4">
                    <Button asChild variant="outline" size="md">
                      <a
                        href={whatsappLink("Здравствуйте! Хочу узнать про Right Way Phangan.")}
                        target="_blank"
                        rel="noopener noreferrer"
                      >
                        {d.team.whatsapp}
                      </a>
                    </Button>
                    <Button asChild variant="ghost" size="md">
                      <Link href={"/ru/contact" as Route}>{d.team.contact}</Link>
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
