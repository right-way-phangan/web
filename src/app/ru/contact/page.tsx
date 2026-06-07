import type { Metadata } from "next";
import { MessageCircle, Phone, Mail } from "lucide-react";
import { PageHero } from "@/components/sections/page-hero";
import { LeadForm } from "@/components/forms/lead-form";
import {
  siteConfig,
  whatsappLink,
  telegramDmLink,
} from "@/lib/site-config";
import { getContactDict } from "@/lib/i18n/dictionaries";

export const metadata: Metadata = {
  title: "Контакты",
  description:
    "Расскажите, что вы ищете на Ко Пангане. Отвечаем в течение рабочего дня.",
  alternates: { canonical: "/ru/contact", languages: { en: "/contact", ru: "/ru/contact" } },
};

export default function RussianContactPage() {
  const d = getContactDict("ru");

  return (
    <>
      <PageHero
        eyebrow={d.hero.eyebrow}
        title={d.hero.title}
        lede={d.hero.lede}
        image="/images/scenes/contact.jpg"
        imageAlt="Виллы над морем на Ко Пангане"
      />

      <section className="container-prose py-16 md:py-24">
        <div className="grid gap-10 md:grid-cols-[1.2fr_1fr] md:gap-16">
          <div>
            <h2 className="font-serif text-2xl text-forest-900 md:text-3xl">
              {d.formHeading}
            </h2>
            <p className="mt-2 mb-6 text-sm text-forest-500/70">{d.formLede}</p>
            <LeadForm source="contact" layout="block" locale="ru" />
          </div>

          <aside className="space-y-5">
            <a
              href={whatsappLink("Здравствуйте — хочу узнать про объекты на Пангане.")}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-3 rounded-sm border border-forest-500/10 bg-cream-50 p-4 transition-colors hover:border-forest-500/30"
            >
              <MessageCircle className="h-5 w-5 text-forest-500" />
              <span className="text-sm text-forest-900">WhatsApp · +66 800-04-4960</span>
            </a>
            <a
              href={telegramDmLink()}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-3 rounded-sm border border-forest-500/10 bg-cream-50 p-4 transition-colors hover:border-forest-500/30"
            >
              <Phone className="h-5 w-5 text-forest-500" />
              <span className="text-sm text-forest-900">Telegram</span>
            </a>
            <a
              href={`mailto:${siteConfig.contact.email}`}
              className="flex items-center gap-3 rounded-sm border border-forest-500/10 bg-cream-50 p-4 transition-colors hover:border-forest-500/30"
            >
              <Mail className="h-5 w-5 text-forest-500" />
              <span className="text-sm text-forest-900">{siteConfig.contact.email}</span>
            </a>
          </aside>
        </div>
      </section>
    </>
  );
}
