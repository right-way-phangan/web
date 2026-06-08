"use client";

import { Button } from "@/components/ui/button";
import { LeadForm } from "@/components/forms/lead-form";
import { whatsappLink, telegramDmLink } from "@/lib/site-config";
import { useLocale } from "@/lib/i18n/use-locale";
import { getObjectDict } from "@/lib/i18n/dictionaries";

interface Props {
  rwNumber: string;
}

/**
 * Sticky inquiry form on object detail pages. Submits to amoCRM via
 * lib/actions/inquiry.ts — routed to the right pipeline based on object type.
 * Self-localizes by URL (RU on /ru/object/*).
 */
export function InquiryForm({ rwNumber }: Props) {
  const locale = useLocale();
  const t = getObjectDict(locale);
  const defaultMessage = t.inquiryDefaultMessage(rwNumber);

  return (
    <aside className="rounded-sm border border-forest-500/10 bg-cream-50 p-6 md:sticky md:top-24">
      <p className="text-xs font-medium uppercase tracking-[0.2em] text-brass-500">
        {t.enquireOrBook}
      </p>
      <h2 className="mt-2 font-serif text-2xl text-forest-900">{rwNumber}</h2>
      <p className="mt-2 text-sm text-forest-500/70">{t.inquiryLede}</p>

      <div className="mt-6">
        <LeadForm
          rwNumber={rwNumber}
          source="object"
          defaultMessage={defaultMessage}
          layout="card"
          showViewingDate
          locale={locale}
        />
      </div>

      <div className="mt-6 border-t border-forest-500/10 pt-4">
        <p className="text-center text-[11px] uppercase tracking-[0.15em] text-forest-500/40">
          {t.orMessageDirectly}
        </p>
        <div className="mt-3 grid grid-cols-2 gap-2">
          <Button asChild variant="outline" size="sm">
            <a href={whatsappLink(defaultMessage)} target="_blank" rel="noopener noreferrer">
              WhatsApp
            </a>
          </Button>
          <Button asChild variant="outline" size="sm">
            <a
              href={telegramDmLink(`interest_${rwNumber}`)}
              target="_blank"
              rel="noopener noreferrer"
            >
              Telegram
            </a>
          </Button>
        </div>
      </div>
    </aside>
  );
}
