"use client";

import { useEffect, useState } from "react";
import { MessageCircle, Send } from "lucide-react";
import { formatPriceCompact } from "@/lib/utils/price";
import { useLocale } from "@/lib/i18n/use-locale";
import { getProjectsDict } from "@/lib/i18n/dictionaries";
import { whatsappLink, telegramDmLink } from "@/lib/site-config";
import { track } from "@/lib/analytics/track";
import { cn } from "@/lib/utils/cn";

interface Props {
  rwNumber: string;
  titleEn: string;
  priceThb?: number;
}

/**
 * Sticky bottom action bar — mobile only (lg:hidden). Keeps a CTA + direct
 * contacts in reach while the visitor scrolls a long landing. Hides itself
 * while the inquiry form (#enquire) is on screen so it never covers the form.
 */
export function ProjectActionBar({ rwNumber, titleEn, priceThb }: Props) {
  const locale = useLocale();
  const t = getProjectsDict(locale);
  const [atForm, setAtForm] = useState(false);

  useEffect(() => {
    const el = document.getElementById("enquire");
    if (!el) return;
    const obs = new IntersectionObserver(
      ([e]) => setAtForm(e.isIntersecting),
      { rootMargin: "0px 0px -40% 0px" },
    );
    obs.observe(el);
    return () => obs.disconnect();
  }, []);

  const msg = t.contactMessage(titleEn);

  const scrollToForm = (e: React.MouseEvent) => {
    e.preventDefault();
    track("project_enquire", { rw: rwNumber });
    const el = document.getElementById("enquire");
    if (!el) return;
    // На лендинге проекта заявка свёрнута в <details> — открываем перед скроллом.
    if (el instanceof HTMLDetailsElement) el.open = true;
    const top = el.getBoundingClientRect().top + window.scrollY - 80;
    window.scrollTo({ top, behavior: "smooth" });
  };

  return (
    <div
      className={cn(
        "fixed inset-x-0 bottom-0 z-40 border-t border-forest-500/10 bg-cream-100/95 backdrop-blur-md lg:hidden",
        "transition-transform duration-300 [padding-bottom:env(safe-area-inset-bottom)]",
        atForm ? "translate-y-full" : "translate-y-0",
      )}
    >
      <div className="flex items-center gap-2 px-4 py-2.5">
        <div className="min-w-0 flex-1">
          {priceThb ? (
            <>
              <div className="text-[10px] uppercase tracking-[0.15em] text-forest-500/55">
                {t.from}
              </div>
              <div className="num truncate text-base text-forest-900">
                {formatPriceCompact(priceThb)}
              </div>
            </>
          ) : (
            <div className="truncate text-sm font-medium text-forest-900">{rwNumber}</div>
          )}
        </div>

        {/* data-rw → global ContactClickTracker attributes the messenger click
            to this project (RW-P####) in the own-DB funnel, not the site bucket. */}
        <a
          href={whatsappLink(msg)}
          target="_blank"
          rel="noopener noreferrer"
          data-rw={rwNumber}
          onClick={() => track("project_whatsapp", { rw: rwNumber })}
          aria-label="WhatsApp"
          className="flex h-10 w-10 shrink-0 items-center justify-center rounded-sm border border-forest-500/20 text-forest-600 transition-colors hover:border-brass-500 hover:text-brass-500"
        >
          <MessageCircle className="h-5 w-5" />
        </a>
        <a
          href={telegramDmLink(`interest_${rwNumber}`)}
          target="_blank"
          rel="noopener noreferrer"
          data-rw={rwNumber}
          onClick={() => track("project_telegram", { rw: rwNumber })}
          aria-label="Telegram"
          className="flex h-10 w-10 shrink-0 items-center justify-center rounded-sm border border-forest-500/20 text-forest-600 transition-colors hover:border-brass-500 hover:text-brass-500"
        >
          <Send className="h-5 w-5" />
        </a>
        <a
          href="#enquire"
          onClick={scrollToForm}
          className="inline-flex h-10 shrink-0 items-center rounded-sm bg-forest-900 px-4 text-sm font-medium text-cream-50 transition-colors hover:bg-forest-900/90"
        >
          {t.nav.enquire}
        </a>
      </div>
    </div>
  );
}
