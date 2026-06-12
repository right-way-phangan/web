"use client";

import { useState } from "react";
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
  const pathname = usePathname();
  const isRu = pathname === "/ru" || pathname.startsWith("/ru/");
  const chrome = getChromeDict(isRu ? "ru" : "en");

  if (pathname.startsWith("/admin") || pathname.includes("/object/")) return null;

  return (
    <div className="fixed bottom-4 right-4 z-30 flex flex-col items-end gap-2 lg:hidden print:hidden">
      {open ? (
        <>
          <a
            href={whatsappLink()}
            target="_blank"
            rel="noopener noreferrer"
            className="rounded-full bg-cream-50 px-4 py-2.5 text-sm font-medium text-forest-900 shadow-lg shadow-forest-900/15 ring-1 ring-forest-500/10"
          >
            WhatsApp
          </a>
          <a
            href={telegramDmLink()}
            target="_blank"
            rel="noopener noreferrer"
            className="rounded-full bg-cream-50 px-4 py-2.5 text-sm font-medium text-forest-900 shadow-lg shadow-forest-900/15 ring-1 ring-forest-500/10"
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
          "flex h-12 w-12 items-center justify-center rounded-full text-cream-50 shadow-lg shadow-forest-900/25 transition-colors",
          open ? "bg-forest-900" : "bg-forest-500 hover:bg-forest-400",
        )}
      >
        {open ? <X className="h-5 w-5" /> : <MessageCircle className="h-5 w-5" />}
      </button>
    </div>
  );
}
