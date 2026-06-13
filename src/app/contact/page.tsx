import type { Metadata } from "next";
import { MessageCircle, Phone, Mail, MapPin } from "lucide-react";
import { PageHero } from "@/components/sections/page-hero";
import { LeadForm } from "@/components/forms/lead-form";
import {
  siteConfig,
  whatsappLink,
  telegramDmLink,
  telegramChannelLink,
} from "@/lib/site-config";

export const metadata: Metadata = {
  alternates: { canonical: "/contact", languages: { en: "/contact", ru: "/ru/contact", "x-default": "/contact" } },
  title: "Contact",
  description:
    "Tell us what you're looking for on Koh Phangan. We reply within the working day.",
};

interface PageProps {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}

export default async function ContactPage({ searchParams }: PageProps) {
  const sp = await searchParams;
  const briefRaw = sp.brief;
  const brief = (Array.isArray(briefRaw) ? briefRaw[0] : briefRaw) || undefined;

  return (
    <>
      <PageHero
        eyebrow="Contact"
        title="Tell us what you're looking for."
        lede="Send a brief and we'll match it against our active inventory. If you already have a specific listing in mind, mention the RW-#### code."
        image="/images/scenes/contact.jpg"
        imageAlt="Coastal villas above the sea on Koh Phangan"
      />

      {brief ? (
        <div className="container-prose pt-8">
          <p className="rounded-sm border border-brass-500/20 bg-brass-500/5 px-4 py-3 text-sm text-forest-500/80">
            We&rsquo;ve pre-filled your brief below from your search — edit it if
            you like, then send.
          </p>
        </div>
      ) : null}

      <section className="container-prose py-16 md:py-24">
      <div className="grid gap-12 lg:grid-cols-[1fr_320px] lg:gap-16">
        {/* Left: form */}
        <div className="rounded-sm border border-forest-500/10 bg-cream-50 p-6 md:p-8">
          <LeadForm source="contact" layout="block" defaultMessage={brief} />
        </div>

        {/* Right: direct channels */}
        <aside className="space-y-6">
          <div>
            <h2 className="text-xs font-medium uppercase tracking-[0.2em] text-brass-500">
              Or message us directly
            </h2>
            <ul className="mt-4 space-y-3">
              <ContactRow
                icon={MessageCircle}
                label="WhatsApp"
                value="Reply within the hour"
                href={whatsappLink()}
              />
              <ContactRow
                icon={Phone}
                label="Telegram chat"
                value={`@${siteConfig.contact.telegram.bot.replace(/_/g, " ").trim()}`}
                href={telegramDmLink()}
              />
              <ContactRow
                icon={Phone}
                label="Telegram channel"
                value={`@${siteConfig.contact.telegram.channel}`}
                href={telegramChannelLink()}
              />
              <ContactRow
                icon={Mail}
                label="Email"
                value={siteConfig.contact.email}
                href={`mailto:${siteConfig.contact.email}`}
              />
            </ul>
          </div>

          <div className="border-t border-forest-500/10 pt-6">
            <h2 className="text-xs font-medium uppercase tracking-[0.2em] text-brass-500">
              Office
            </h2>
            <div className="mt-4 flex items-start gap-3 text-sm text-forest-500">
              <MapPin className="h-4 w-4 mt-0.5 text-forest-500/50" />
              <div>
                <p>Koh Phangan, Thailand</p>
                <p className="mt-1 text-xs text-forest-500/60">
                  We meet clients on the island for viewings and signings.
                </p>
              </div>
            </div>
          </div>
        </aside>
      </div>
      </section>
    </>
  );
}

function ContactRow({
  icon: Icon,
  label,
  value,
  href,
}: {
  icon: typeof MessageCircle;
  label: string;
  value: string;
  href: string;
}) {
  return (
    <li>
      <a
        href={href}
        target="_blank"
        rel="noopener noreferrer"
        className="group flex items-start gap-3 rounded-sm border border-transparent p-2 -m-2 transition-colors hover:border-forest-500/10 hover:bg-cream-200/40"
      >
        <Icon className="h-4 w-4 mt-1 shrink-0 text-forest-500/50 group-hover:text-brass-500 transition-colors" />
        <div className="min-w-0">
          <p className="text-sm font-medium text-forest-900 group-hover:text-brass-500 transition-colors">
            {label}
          </p>
          <p className="truncate text-xs text-forest-500/60">{value}</p>
        </div>
      </a>
    </li>
  );
}
