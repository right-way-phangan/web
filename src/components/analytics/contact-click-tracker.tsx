"use client";

import { useEffect, useRef } from "react";
import { usePathname } from "next/navigation";
import { track } from "@/lib/analytics/track";
import { trackObjectEvent } from "@/lib/analytics/track-event";

/** Extract RW number from an object-page path (/object/RW-… or /ru/object/RW-…). */
function rwFromPath(path: string | null): string {
  const m = (path ?? "").match(/\/object\/(RW-[A-Za-z]?\d{3,5}(?:-\d{1,3})?)/i);
  return m ? m[1].toUpperCase() : "";
}

/** Marketing event name → own-DB engagement kind (messenger-first conversions). */
const CLICK_KIND: Record<string, string> = {
  whatsapp_click: "wa_click",
  telegram_click: "tg_click",
  email_click: "email_click",
  phone_click: "phone_click",
};

/**
 * One delegated listener that turns clicks on contact links (WhatsApp / Telegram
 * / mailto / tel) into dataLayer events — anywhere on the site, no per-component
 * onClick. Robust to new links (header, footer, object pages, project bars…).
 * Also records the click first-party (own DB) — for a DM-first audience these
 * messenger clicks are the dominant conversion, which GA4 alone can't tie to a
 * specific object.
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
      // First-party: count the messenger click against the object (or site).
      const kind = CLICK_KIND[event];
      if (kind && !navigator.webdriver) trackObjectEvent(kind, rwFromPath(pathRef.current));
    }

    document.addEventListener("click", onClick, { capture: true });
    return () => document.removeEventListener("click", onClick, { capture: true });
  }, []);

  return null;
}
