"use client";

import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { useLocale } from "@/lib/i18n/use-locale";
import { getObjectDict } from "@/lib/i18n/dictionaries";
import { whatsappLink } from "@/lib/site-config";
import { useCurrency } from "@/components/ui/currency";
import { cn } from "@/lib/utils/cn";

interface Props {
  rwNumber: string;
  /** Raw THB amounts — formatted here in the active currency (฿/$/₽). */
  priceThb?: number;
  pricePerRai?: number;
  rentPerMonth?: number;
  rentPerRaiMonth?: number;
}

/** Страницы, где снизу закреплён этот CTA-бар. Единый источник для всех
 *  плавающих элементов нижней полки (messenger-fab уступает бару место). */
export function hasMobileCtaBar(pathname: string): boolean {
  return pathname.includes("/object/");
}

/**
 * Mobile-only bar pinned to the bottom of object pages: price + an Enquire
 * shortcut down to the inquiry form (#inquiry). The form is the last thing on
 * a long page, so without this the main conversion action lives below ~6
 * screens of content. Slides away while the form itself is in view.
 */
export function MobileCtaBar({
  rwNumber,
  priceThb,
  pricePerRai,
  rentPerMonth,
  rentPerRaiMonth,
}: Props) {
  const t = getObjectDict(useLocale());
  const { fmt } = useCurrency();
  const [formInView, setFormInView] = useState(false);

  const priceLabel = priceThb
    ? fmt(priceThb)
    : pricePerRai
      ? `${fmt(pricePerRai)} /rai`
      : rentPerMonth
        ? `${fmt(rentPerMonth)} /mo`
        : rentPerRaiMonth
          ? `${fmt(rentPerRaiMonth)} /rai/mo`
          : undefined;

  useEffect(() => {
    const form = document.getElementById("inquiry");
    if (!form || !("IntersectionObserver" in window)) return;
    const obs = new IntersectionObserver(
      ([entry]) => setFormInView(entry.isIntersecting),
      { threshold: 0.15 },
    );
    obs.observe(form);
    return () => obs.disconnect();
  }, []);

  return (
    <div
      className={cn(
        "fixed inset-x-0 bottom-0 z-30 border-t border-forest-500/10 bg-cream-50/95 px-4 pt-2.5 backdrop-blur-sm transition-transform duration-300 lg:hidden print:hidden",
        "pb-[max(0.625rem,env(safe-area-inset-bottom))]",
        formInView && "translate-y-full",
      )}
    >
      <div className="flex items-center justify-between gap-4">
        <div className="min-w-0">
          <p className="text-[10px] font-medium uppercase tracking-[0.2em] text-forest-500/70">
            {rwNumber}
          </p>
          {priceLabel ? (
            <p className="num truncate text-lg leading-tight text-forest-900">
              {priceLabel}
            </p>
          ) : (
            <p className="text-sm italic text-forest-500/70">{t.priceOnRequest}</p>
          )}
        </div>
        <div className="flex shrink-0 items-center gap-2">
          {/* One-tap WhatsApp with the listing pre-filled — the form is ~6
              screens down, half of mobile visitors won't scroll to it. */}
          <Button asChild variant="outline" size="md">
            <a
              href={whatsappLink(t.inquiryDefaultMessage(rwNumber))}
              target="_blank"
              rel="noopener noreferrer"
            >
              WhatsApp
            </a>
          </Button>
          <Button asChild size="md">
            <a href="#inquiry">{t.enquire}</a>
          </Button>
        </div>
      </div>
    </div>
  );
}
