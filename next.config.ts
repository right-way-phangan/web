import type { NextConfig } from "next";

// CSP in Report-Only mode: it never blocks anything, only reports violations to
// the browser console — a safe first step before an enforcing policy. The
// allow-lists below cover what the site actually loads today: GTM + GA4,
// Vercel analytics/insights, the map tile providers (CARTO/Longdo/ArcGIS),
// Vercel Blob photos and Google-hosted images. Watch the console for a week,
// tighten, then flip the header name to `Content-Security-Policy` to enforce.
const CSP_REPORT_ONLY = [
  "default-src 'self'",
  "base-uri 'self'",
  "object-src 'none'",
  "frame-ancestors 'self'",
  // 'unsafe-inline' stays for now (Next hydration + GTM inline snippets); a
  // nonce-based tightening is a later step once the report is clean.
  "script-src 'self' 'unsafe-inline' https://www.googletagmanager.com https://*.google-analytics.com https://va.vercel-scripts.com https://*.vercel-insights.com",
  "style-src 'self' 'unsafe-inline'",
  "img-src 'self' data: blob: https://*.public.blob.vercel-storage.com https://*.basemaps.cartocdn.com https://*.longdo.com https://server.arcgisonline.com https://drive.google.com https://lh3.googleusercontent.com https://*.google-analytics.com https://www.googletagmanager.com",
  "font-src 'self' data:",
  "connect-src 'self' https://*.google-analytics.com https://*.analytics.google.com https://*.vercel-insights.com https://www.googletagmanager.com",
  "frame-src 'self' https://www.googletagmanager.com",
  "worker-src 'self' blob:",
  "manifest-src 'self'",
].join("; ");

const nextConfig: NextConfig = {
  // Leaflet maps initialize against a DOM container by id. StrictMode's dev
  // double-mount re-inits a map on a container mid-teardown, which corrupts
  // react-leaflet's own map.remove() lifecycle and throws "Map container is
  // being reused by another instance" when navigating away from a map page.
  // Keeping StrictMode off lets react-leaflet manage one clean mount/unmount.
  reactStrictMode: false,
  // Bots that read raw HTML without running JS get blocking (head-placed)
  // metadata instead of streamed-into-body tags. This REPLACES Next's default
  // preview-bot list, so the defaults (Telegram/WhatsApp/Twitter previews…)
  // are folded in alongside the search/AI crawlers we care about for GEO/AEO.
  htmlLimitedBots:
    /Googlebot|Googlebot-Image|bingbot|Yandex(Bot|Images)?|Baiduspider|DuckDuckBot|Applebot|GPTBot|ClaudeBot|Claude-Web|PerplexityBot|CCBot|Bytespider|Mediapartners-Google|Slurp|vkShare|Slackbot|Discordbot|facebookexternalhit|facebookcatalog|Twitterbot|LinkedInBot|WhatsApp|SkypeUriPreview|BingPreview|ia_archiver|TelegramBot/i,
  images: {
    // AVIF first (≈25% lighter than WebP at same quality) — island connections
    // feel every photo byte; browsers without AVIF fall through to WebP.
    formats: ["image/avif", "image/webp"],
    // Catalog photos are immutable per object (cover/gallery don't change once
    // a listing is up) — keep optimized variants on the CDN for 30 days so the
    // slow cold AVIF/WebP transform hits at most one visitor per size, not the
    // long tail. Default TTL re-transforms far too eagerly for static media.
    minimumCacheTTL: 2592000,
    remotePatterns: [
      { protocol: "https", hostname: "drive.google.com" },
      { protocol: "https", hostname: "lh3.googleusercontent.com" },
      { protocol: "https", hostname: "**.r2.cloudflarestorage.com" },
      { protocol: "https", hostname: "**.public.blob.vercel-storage.com" },
    ],
  },
  typedRoutes: true,
  // Справочник (/admin/guide) читает markdown с диска на рантайме (страницы
  // dynamic из-за AdminNav) — без явного include Vercel не положит файлы в
  // серверный бандл и fs.readFileSync вернёт ENOENT.
  outputFileTracingIncludes: {
    "/admin/guide": ["./src/content/guide/**/*"],
    "/admin/guide/[slug]": ["./src/content/guide/**/*"],
    "/admin/api/search": ["./src/content/guide/**/*"],
  },
  async headers() {
    return [
      {
        source: "/:path*",
        headers: [
          // Report-Only: collects violations without blocking. Flip to
          // "Content-Security-Policy" to enforce once the report is clean.
          { key: "Content-Security-Policy-Report-Only", value: CSP_REPORT_ONLY },
          { key: "Strict-Transport-Security", value: "max-age=63072000; includeSubDomains" },
          { key: "X-Content-Type-Options", value: "nosniff" },
          { key: "X-Frame-Options", value: "SAMEORIGIN" },
          { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
          { key: "Permissions-Policy", value: "camera=(), microphone=(), geolocation=()" },
        ],
      },
    ];
  },
};

export default nextConfig;
