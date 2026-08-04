"use client";

import { useEffect, useState } from "react";
import { usePathname } from "next/navigation";
import { MessageCircle, X } from "lucide-react";
import { getChromeDict } from "@/lib/i18n/dictionaries";
import { whatsappLink, telegramDmLink } from "@/lib/site-config";
import { cn } from "@/lib/utils/cn";

/**
 * Mobile-only floating "message us" button: one tap opens WhatsApp / Telegram
 * shortcuts from any page. Hidden on object pages (the sticky enquire bar owns
 * the bottom edge there, with its own messenger links) and in the admin area.
 * Clicks are picked up by the global ContactClickTracker (wa.me / t.me hrefs).
 */
export function MessengerFab() {
  const [open, setOpen] = useState(false);
  // Появляется только после первого экрана: у верха страницы кнопка
  // перекрывала CTA hero на мобильном (SSR рендерит null — гидрация чистая).
  const [shown, setShown] = useState(false);
  const pathname = usePathname();
  const isRu = pathname === "/ru" || pathname.startsWith("/ru/");
  const chrome = getChromeDict(isRu ? "ru" : "en");

  useEffect(() => {
    const onScroll = () => setShown(window.scrollY > window.innerHeight * 0.6);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  if (pathname.startsWith("/admin") || pathname.includes("/object/")) return null;
  if (!shown) return null;

  return (
    <div className="fixed bottom-4 right-4 z-30 flex flex-col items-end gap-2 lg:hidden print:hidden">
      {open ? (
        <>
          <a
            href={whatsappLink()}
            target="_blank"
            rel="noopener noreferrer"
            className="flex min-h-[44px] items-center justify-center rounded-full bg-cream-50 px-4 py-2.5 text-sm font-medium text-forest-900 shadow-lg shadow-panel/15 ring-1 ring-forest-500/10"
          >
            WhatsApp
          </a>
          <a
            href={telegramDmLink()}
            target="_blank"
            rel="noopener noreferrer"
            className="flex min-h-[44px] items-center justify-center rounded-full bg-cream-50 px-4 py-2.5 text-sm font-medium text-forest-900 shadow-lg shadow-panel/15 ring-1 ring-forest-500/10"
          >
            Telegram
          </a>
        </>
      ) : null}
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        aria-expanded={open}
        aria-label={open ? chrome.chatClose : chrome.chatCta}
        className={cn(
          "flex h-12 w-12 items-center justify-center rounded-full text-panel-fg shadow-lg shadow-panel/25 transition-colors",
          open ? "bg-panel" : "bg-panel hover:bg-forest-400",
        )}
      >
        {open ? <X className="h-5 w-5" /> : <MessageCircle className="h-5 w-5" />}
      </button>
    </div>
  );
}
