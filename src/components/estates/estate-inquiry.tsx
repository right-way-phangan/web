"use client";

import { Button } from "@/components/ui/button";
import { LeadForm } from "@/components/forms/lead-form";
import { whatsappLink, telegramDmLink } from "@/lib/site-config";
import { useLocale } from "@/lib/i18n/use-locale";
import { getObjectDict, getEstatesDict } from "@/lib/i18n/dictionaries";

interface Props {
  /** Slug подборки — для чистого Telegram start-payload. */
  slug: string;
  /** Название подборки — заголовок формы и текст обращения. */
  name: string;
  /** Выбранный лот (по кнопке «Запросить <лот>») — предзаполняет форму. */
  selectedLot?: string | null;
}

/**
 * Sticky-форма заявки на лендинге подборки участков. Как InquiryForm, но
 * привязана к подборке: в CRM уходит читаемая ссылка на название, Telegram
 * payload собирается из slug (без пробелов). При выборе лота форма
 * предзаполняется обращением по нему (ремоунт по ключу selectedLot).
 */
export function EstateInquiry({ slug, name, selectedLot }: Props) {
  const locale = useLocale();
  const t = getObjectDict(locale);
  const te = getEstatesDict(locale);
  const reference = selectedLot
    ? locale === "ru"
      ? `Подборка: ${name} · Участок ${selectedLot}`
      : `Collection: ${name} · Plot ${selectedLot}`
    : locale === "ru"
      ? `Подборка: ${name}`
      : `Collection: ${name}`;
  const defaultMessage = selectedLot ? te.lotPrefill(selectedLot) : t.inquiryDefaultMessage(name);

  return (
    <aside
      id="enquire"
      className="scroll-mt-24 rounded-sm border border-forest-500/10 bg-cream-50 p-6 md:sticky md:top-24 print:hidden"
    >
      <p className="text-xs font-medium uppercase tracking-[0.2em] text-brass-500">
        {t.enquireOrBook}
      </p>
      <h2 className="mt-2 font-serif text-2xl text-forest-900">{name}</h2>
      <p className="mt-2 text-sm text-forest-500/70">{t.inquiryLede}</p>

      <div className="mt-6">
        <LeadForm
          key={selectedLot ?? "all"}
          rwNumber={reference}
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
              href={telegramDmLink(`estate_${slug.replace(/-/g, "_")}`)}
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
