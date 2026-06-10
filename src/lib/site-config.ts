/**
 * Single source of truth for site-wide content used in Header, Footer, metadata.
 * Edit here, not in components.
 */

export const siteConfig = {
  name: "Right Way Phangan",
  tagline: "Specialised real estate on Koh Phangan",
  description:
    "Land, villas, and houses on Koh Phangan. Curated listings, transparent process, AI-assisted search.",

  // Primary nav (visible on Header + Footer)
  nav: [
    { label: "Listings", href: "/listings" as const },
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
      bot: process.env.NEXT_PUBLIC_TELEGRAM_BOT ?? "rightwayphangan_bot",
      channel: process.env.NEXT_PUBLIC_TELEGRAM_CHANNEL ?? "rightwayphangan",
    },
    whatsapp: process.env.NEXT_PUBLIC_WHATSAPP_E164 ?? "66800044960",
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
