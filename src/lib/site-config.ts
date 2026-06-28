/**
 * Single source of truth for site-wide content used in Header, Footer, metadata.
 * Edit here, not in components.
 */

export const siteConfig = {
  name: "Right Way Phangan",
  tagline: "Specialised real estate on Koh Phangan",
  description:
    "Land, villas, and houses on Koh Phangan. Personally vetted listings, transparent process, honest numbers.",

  // Primary nav (visible on Header + Footer)
  nav: [
    { label: "Listings", href: "/listings" as const },
    { label: "Leasehold", href: "/leasehold" as const },
    { label: "Districts", href: "/districts" as const },
    { label: "Calculator", href: "/calculator" as const },
    { label: "Insights", href: "/insights" as const },
    { label: "Services", href: "/services" as const },
    { label: "Process", href: "/process" as const },
    { label: "About", href: "/about" as const },
    { label: "Knowledge", href: "/knowledge" as const },
    { label: "FAQ", href: "/faq" as const },
    { label: "Contact", href: "/contact" as const },
  ],

  // Secondary links — footer + sitemap only, kept out of the (already full) header.
  footerExtra: [{ label: "Journal", href: "/blog" as const }],

  contact: {
    telegram: {
      // `||` (not `??`): empty-string env values must also fall back to the
      // real default, otherwise prod renders bare `t.me/` / `wa.me/` links.
      bot: process.env.NEXT_PUBLIC_TELEGRAM_BOT || "rightwayphangan_bot",
      channel: process.env.NEXT_PUBLIC_TELEGRAM_CHANNEL || "rightwayphangan",
    },
    whatsapp: process.env.NEXT_PUBLIC_WHATSAPP_E164 || "66843627784",
    email: "hello@rightwaygroup.co",
  },
} as const;

export function whatsappLink(message?: string) {
  const base = `https://wa.me/${siteConfig.contact.whatsapp}`;
  return message ? `${base}?text=${encodeURIComponent(message)}` : base;
}

export function telegramDmLink(start?: string) {
  const base = `https://t.me/${siteConfig.contact.telegram.bot}`;
  return start ? `${base}?start=${encodeURIComponent(start)}` : base;
}

export function telegramChannelLink() {
  return `https://t.me/${siteConfig.contact.telegram.channel}`;
}

/**
 * Human-readable phone, derived from the single E164 source so the displayed
 * number can never drift from the wa.me/tel: link. Thai mobile (66 + 9 digits)
 * → "+66 84 362 7784"; any other length falls back to a "+<digits>" form.
 */
export function phoneDisplay() {
  const e164 = siteConfig.contact.whatsapp.replace(/\D/g, "");
  if (e164.startsWith("66") && e164.length === 11) {
    const n = e164.slice(2); // 9 national digits
    return `+66 ${n.slice(0, 2)} ${n.slice(2, 5)} ${n.slice(5)}`;
  }
  return `+${e164}`;
}

/** tel: link off the same E164 source (for click-to-call). */
export function telLink() {
  return `tel:+${siteConfig.contact.whatsapp.replace(/\D/g, "")}`;
}
