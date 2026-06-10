"use client";

import { useEffect, useRef } from "react";
import { usePathname } from "next/navigation";
import { track } from "@/lib/analytics/track";

/**
 * One delegated listener that turns clicks on contact links (WhatsApp / Telegram
 * / mailto / tel) into dataLayer events — anywhere on the site, no per-component
 * onClick. Robust to new links (header, footer, object pages, project bars…).
 *
 * Capture phase so the event fires before the link navigates away.
 */
export function ContactClickTracker() {
  const pathname = usePathname();
  const pathRef = useRef(pathname);
  pathRef.current = pathname;

  useEffect(() => {
    function onClick(e: MouseEvent) {
      const anchor = (e.target as HTMLElement | null)?.closest?.(
        "a[href]",
      ) as HTMLAnchorElement | null;
      if (!anchor) return;
      const href = anchor.getAttribute("href") ?? "";

      let event: string | null = null;
      if (href.startsWith("https://wa.me") || href.startsWith("https://api.whatsapp.com")) {
        event = "whatsapp_click";
      } else if (href.startsWith("https://t.me") || href.startsWith("tg:")) {
        event = "telegram_click";
      } else if (href.startsWith("mailto:")) {
        event = "email_click";
      } else if (href.startsWith("tel:")) {
        event = "phone_click";
      }
      if (!event) return;

      track(event, { location: pathRef.current, href });
    }

    document.addEventListener("click", onClick, { capture: true });
    return () => document.removeEventListener("click", onClick, { capture: true });
  }, []);

  return null;
}
