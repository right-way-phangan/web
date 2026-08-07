import type { Metadata } from "next";
import Link from "next/link";
import type { Route } from "next";
import { PageHero } from "@/components/sections/page-hero";
import { ContentSection } from "@/components/sections/content-section";
import { ServiceCards } from "@/components/sections/service-cards";
import { Button } from "@/components/ui/button";
import { getServicesDict } from "@/lib/i18n/dictionaries";

export const metadata: Metadata = {
  title: "Услуги",
  description:
    "Три услуги: сопровождение покупки земли, сделки с виллами и домами, поддержка отдельной сделки. Каждая задокументирована и под ответственность.",
  alternates: { canonical: "/ru/services", languages: { en: "/services", ru: "/ru/services", "x-default": "/services" } },
};

export default function RussianServicesPage() {
  const d = getServicesDict("ru");

  return (
    <>
      <PageHero
        eyebrow={d.hero.eyebrow}
        title={d.hero.title}
        lede={d.hero.lede}
        image="/images/scenes/turquoise-aerial.jpg"
        imageAlt="Бирюзовая вода и лодки у берегов Ко Пангана"
      />

      <ServiceCards services={[...d.services]} />

      <ContentSection eyebrow={d.boundaries.eyebrow} title={d.boundaries.title} spacing="default">
        {d.boundaries.body.map((p) => (
          <p key={p}>{p}</p>
        ))}
      </ContentSection>

      <section className="bg-cream-200/30">
        <div className="container-prose py-16 md:py-24">
          <p className="text-[0.8125rem] font-medium uppercase tracking-eyebrow text-brass-500">
            {d.commission.eyebrow}
          </p>
          <h2 className="mt-3 font-serif text-3xl text-forest-900 md:text-4xl">
            {d.commission.title}
          </h2>
          <p className="mt-6 max-w-2xl text-base leading-relaxed text-forest-500/80 md:text-lg">
            {d.commission.lede}
          </p>

          <p className="mt-8 max-w-2xl text-sm text-forest-500/70">{d.commission.note}</p>
        </div>
      </section>

      <section className="container-prose py-20 md:py-28">
        <div className="max-w-2xl">
          <h2 className="font-serif text-3xl text-forest-900 md:text-4xl">{d.cta.title}</h2>
          <p className="mt-4 text-lg text-forest-500/70">{d.cta.lede}</p>
          <div className="mt-8 flex flex-wrap gap-3">
            <Button asChild variant="primary" size="md">
              <Link href={"/ru/contact" as Route}>{d.cta.start}</Link>
            </Button>
            <Button asChild variant="outline" size="md">
              <Link href={"/ru/process" as Route}>{d.cta.process}</Link>
            </Button>
          </div>
        </div>
      </section>
    </>
  );
}
