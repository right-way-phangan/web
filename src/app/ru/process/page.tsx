import type { Metadata } from "next";
import Link from "next/link";
import type { Route } from "next";
import { PageHero } from "@/components/sections/page-hero";
import { ProcessTimeline } from "@/components/sections/process-timeline";
import { Button } from "@/components/ui/button";
import { getProcessDict } from "@/lib/i18n/dictionaries";

export const metadata: Metadata = {
  title: "Процесс",
  description:
    "Как проходит сделка с Right Way: семь этапов, у каждого — понятный результат и момент, когда можно выйти без обязательств.",
  alternates: { canonical: "/ru/process", languages: { en: "/process", ru: "/ru/process", "x-default": "/process" } },
};

export default function RussianProcessPage() {
  const d = getProcessDict("ru");

  return (
    <>
      <PageHero
        eyebrow={d.hero.eyebrow}
        title={d.hero.title}
        lede={d.hero.lede}
        image="/images/scenes/process.jpg"
        imageAlt="Бухта Ко Пангана с воздуха в золотой час"
      />

      <ProcessTimeline steps={[...d.steps]} />

      <section className="border-t border-forest-500/10 bg-cream-200/30">
        <div className="container-prose py-16 md:py-24">
          <div className="max-w-2xl">
            <h2 className="font-serif text-3xl text-forest-900 md:text-4xl">{d.cta.title}</h2>
            <p className="mt-4 text-lg text-forest-500/70">{d.cta.lede}</p>
            <div className="mt-8 flex flex-wrap gap-3">
              <Button asChild variant="primary" size="md">
                <Link href={"/ru/contact" as Route}>{d.cta.book}</Link>
              </Button>
              <Button asChild variant="outline" size="md">
                <Link href={"/listings" as Route}>{d.cta.browse}</Link>
              </Button>
            </div>
          </div>
        </div>
      </section>
    </>
  );
}
