import type { Metadata, Viewport } from "next";
import { Inter, Cormorant_Garamond } from "next/font/google";
import { Analytics } from "@vercel/analytics/next";
import { SpeedInsights } from "@vercel/speed-insights/next";
import { Header } from "@/components/layout/header";
import { Footer } from "@/components/layout/footer";
import { MessengerFab } from "@/components/layout/messenger-fab";
import { SavedProvider } from "@/lib/saved/saved-context";
import { OrganizationJsonLd } from "@/components/seo/organization-json-ld";
import { WebsiteJsonLd } from "@/components/seo/website-json-ld";
import { GtmScript, GtmNoScript } from "@/components/analytics/gtm";
import { Ga4Script } from "@/components/analytics/ga4";
import { ContactClickTracker } from "@/components/analytics/contact-click-tracker";
import { AttributionCapture } from "@/components/analytics/attribution-capture";
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

const serif = Cormorant_Garamond({
  subsets: ["latin", "cyrillic"],
  weight: ["400", "500", "600", "700"],
  variable: "--font-serif",
  display: "swap",
});

const siteUrl = getSiteUrl();

// Brand-tints the mobile browser chrome (address bar) — forest from the
// palette. Without it Android/iOS render a default grey bar.
export const viewport: Viewport = {
  themeColor: "#1F3A2E",
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
    <html lang="en" className={`${sans.variable} ${serif.variable}`}>
      <body className="flex min-h-screen flex-col">
        {/* Every photo lives on Vercel Blob — warming the connection early
            shaves the TLS handshake off the LCP image. rel=preconnect is a
            body-ok link element, no <head> access needed. */}
        <link
          rel="preconnect"
          href="https://qcv6wpmi0tztxmyg.public.blob.vercel-storage.com"
        />
        <a
          href="#main-content"
          className="sr-only focus:not-sr-only focus:fixed focus:left-4 focus:top-4 focus:z-[60] focus:rounded-sm focus:bg-forest-900 focus:px-4 focus:py-2 focus:text-sm focus:text-cream-50"
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
        <SavedProvider>
          <Header />
          <main id="main-content" className="flex-1">{children}</main>
          <Footer />
          <MessengerFab />
        </SavedProvider>
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
