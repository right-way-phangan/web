import type { Metadata } from "next";
import { PageHero } from "@/components/sections/page-hero";
import { LeadForm } from "@/components/forms/lead-form";
import { ContactChannels } from "@/components/sections/contact-channels";
import { getContactDict } from "@/lib/i18n/dictionaries";

export const metadata: Metadata = {
  title: "Контакты",
  description:
    "Расскажите, что вы ищете на Ко Пангане. Отвечаем в течение рабочего дня.",
  alternates: { canonical: "/ru/contact", languages: { en: "/contact", ru: "/ru/contact", "x-default": "/contact" } },
};

interface PageProps {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}

export default async function RussianContactPage({ searchParams }: PageProps) {
  const d = getContactDict("ru");
  const sp = await searchParams;
  const briefRaw = sp.brief;
  const brief = (Array.isArray(briefRaw) ? briefRaw[0] : briefRaw) || undefined;

  return (
    <>
      <PageHero
        eyebrow={d.hero.eyebrow}
        title={d.hero.title}
        lede={d.hero.lede}
        image="/images/scenes/contact.jpg"
        imageAlt="Виллы над морем на Ко Пангане"
      />

      {brief ? (
        <div className="container-prose pt-8">
          <p className="rounded-sm border border-brass-500/20 bg-brass-500/5 px-4 py-3 text-sm text-forest-600">
            {d.briefNote}
          </p>
        </div>
      ) : null}

      <section className="container-prose py-16 md:py-24">
        <div className="grid gap-12 lg:grid-cols-[1fr_320px] lg:gap-16">
          <div className="rounded-sm border border-forest-500/10 bg-cream-50 p-6 shadow-soft md:p-8">
            <LeadForm source="contact" layout="block" locale="ru" defaultMessage={brief} />
          </div>

          <ContactChannels dict={d} />
        </div>
      </section>
    </>
  );
}
