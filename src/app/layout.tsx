import type { Metadata, Viewport } from "next";
import { Inter, Cormorant_Garamond } from "next/font/google";
import { Analytics } from "@vercel/analytics/next";
import { SpeedInsights } from "@vercel/speed-insights/next";
import { Header } from "@/components/layout/header";
import { Footer } from "@/components/layout/footer";
import { MessengerFab } from "@/components/layout/messenger-fab";
import { ScrollProgress } from "@/components/motion/scroll-progress";
import { SavedProvider } from "@/lib/saved/saved-context";
import { CurrencyProvider } from "@/components/ui/currency";
import { OrganizationJsonLd } from "@/components/seo/organization-json-ld";
import { WebsiteJsonLd } from "@/components/seo/website-json-ld";
import { GtmScript, GtmNoScript } from "@/components/analytics/gtm";
import { Ga4Script } from "@/components/analytics/ga4";
import { ContactClickTracker } from "@/components/analytics/contact-click-tracker";
import { AttributionCapture } from "@/components/analytics/attribution-capture";
import { HtmlLang } from "@/components/i18n/html-lang";
import { ThemeProvider, ThemeScript } from "@/lib/theme/theme-context";
import { siteConfig } from "@/lib/site-config";
import { getSiteUrl } from "@/lib/site-url";
import "./globals.css";

// Cyrillic subsets cover the /ru pages — without them RU text falls back to
// system fonts and the serif/sans pairing breaks.
const sans = Inter({
  subsets: ["latin", "cyrillic"],
  variable: "--font-sans",
  display: "swap",
});

// Only 400 (default) and 600 (one semibold spot) are used across the site —
// declaring 500/700 preloaded two font files that never paint. Trimming to the
// two real weights halves the serif payload on the LCP path.
const serif = Cormorant_Garamond({
  subsets: ["latin", "cyrillic"],
  weight: ["400", "600"],
  variable: "--font-serif",
  display: "swap",
});

const siteUrl = getSiteUrl();

// Brand-tints the mobile browser chrome (address bar) — forest from the
// palette in light, the dark page background in dark. Without it Android/iOS
// render a default grey bar.
export const viewport: Viewport = {
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#04262E" },
    { media: "(prefers-color-scheme: dark)", color: "#181815" },
  ],
};

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  title: {
    default: `${siteConfig.name} — ${siteConfig.tagline}`,
    template: `%s · ${siteConfig.name}`,
  },
  description: siteConfig.description,
  alternates: {
    canonical: "/",
    types: { "application/rss+xml": "/feed.xml" },
  },
  openGraph: {
    type: "website",
    locale: "en_US",
    url: siteUrl,
    siteName: siteConfig.name,
    title: `${siteConfig.name} — ${siteConfig.tagline}`,
    description: siteConfig.description,
  },
  twitter: {
    card: "summary_large_image",
    title: `${siteConfig.name} — ${siteConfig.tagline}`,
    description: siteConfig.description,
  },
  robots: {
    index: true,
    follow: true,
    googleBot: { index: true, follow: true, "max-image-preview": "large" },
  },
  // Google Search Console ownership. Set GOOGLE_SITE_VERIFICATION in Vercel to
  // the token GSC shows for the "HTML tag" method, and the meta tag appears with
  // no redeploy of logic. (Simplest path now that GA4 is live: verify via the
  // existing GA4 property instead — then this can stay unset.)
  verification: process.env.GOOGLE_SITE_VERIFICATION
    ? { google: process.env.GOOGLE_SITE_VERIFICATION }
    : undefined,
  icons: {
    icon: [
      { url: "/favicon.ico", sizes: "any" },
      { url: "/icon-32.png", type: "image/png", sizes: "32x32" },
      { url: "/icon-192.png", type: "image/png", sizes: "192x192" },
      { url: "/icon-512.png", type: "image/png", sizes: "512x512" },
    ],
    apple: "/apple-touch-icon.png",
  },
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html
      lang="en"
      suppressHydrationWarning
      className={`${sans.variable} ${serif.variable}`}
    >
      <body className="flex min-h-svh flex-col">
        {/* Hoisted into <head> by React. Both origins are hit after first paint —
            GA4 for its collect beacon, er-api for live FX in the price widgets —
            so the handshake lands on the critical path (Lighthouse: ~310 ms). */}
        <link rel="preconnect" href="https://www.google-analytics.com" />
        <link rel="preconnect" href="https://open.er-api.com" />
        {/* Render-blocking, first in <body>: applies the persisted/system theme
            to <html> before paint so dark visitors never flash light. */}
        <ThemeScript />
        <HtmlLang />
        <a
          href="#main-content"
          className="sr-only focus:not-sr-only focus:fixed focus:left-4 focus:top-4 focus:z-[60] focus:rounded-sm focus:bg-panel focus:px-4 focus:py-2 focus:text-sm focus:text-panel-fg"
        >
          Skip to content
        </a>
        <GtmNoScript />
        {/*
          Kill-switch: this site uses no service worker. If a device carries a
          stale SW from whatever was on this domain before the DNS swap, it can
          intercept requests and "fail to load" the new site. getRegistrations()
          finds every SW on this origin regardless of its path, so this unregisters
          them all and clears caches the moment fresh HTML runs. See public/sw.js
          for the path-based fallback when stale HTML keeps this from running.
        */}
        <script
          dangerouslySetInnerHTML={{
            __html:
              "(function(){try{if('serviceWorker' in navigator){navigator.serviceWorker.getRegistrations().then(function(rs){rs.forEach(function(r){r.unregister()})}).catch(function(){})}if(self.caches&&caches.keys){caches.keys().then(function(ks){ks.forEach(function(k){caches.delete(k)})}).catch(function(){})}}catch(e){}})();",
          }}
        />
        <OrganizationJsonLd siteUrl={siteUrl} />
        <WebsiteJsonLd siteUrl={siteUrl} />
        <ThemeProvider>
          <SavedProvider>
            <CurrencyProvider>
              <ScrollProgress />
              <Header />
              <main id="main-content" className="flex-1">{children}</main>
              <Footer />
              <MessengerFab />
            </CurrencyProvider>
          </SavedProvider>
        </ThemeProvider>
        <ContactClickTracker />
        <AttributionCapture />
        <GtmScript />
        <Ga4Script />
        <Analytics />
        <SpeedInsights />
      </body>
    </html>
  );
}
