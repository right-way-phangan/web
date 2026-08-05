import type { NextConfig } from "next";

// CSP now ENFORCED (was Report-Only through 2026-06-15). The allow-lists below
// were validated by a static audit of every client-side resource the site
// loads: GTM + GA4, Vercel analytics/insights, the map tile providers
// (CARTO/Longdo/ArcGIS, served as <img>), Vercel Blob photos and Google-hosted
// images, project-video embeds (YouTube-nocookie/Vimeo) and the calculator's
// live-FX fetch (open.er-api.com). No 'unsafe-eval' is needed (no eval/Function
// in client code; Leaflet doesn't require it). 'unsafe-inline' stays for Next
// hydration + GTM inline snippets; nonce-based tightening is a later step.
const CSP = [
  "default-src 'self'",
  "base-uri 'self'",
  "object-src 'none'",
  "frame-ancestors 'self'",
  // *.posthog.com is wildcarded on PostHog's own advice — the SDK pulls its
  // recorder/surveys bundles from shifting subdomains (us-assets.i, us.i…),
  // and a missing entry fails silently: capture() calls just never arrive.
  "script-src 'self' 'unsafe-inline' https://www.googletagmanager.com https://*.google-analytics.com https://va.vercel-scripts.com https://*.vercel-insights.com https://*.posthog.com",
  "style-src 'self' 'unsafe-inline'",
  "img-src 'self' data: blob: https://*.public.blob.vercel-storage.com https://*.r2.dev https://*.r2.cloudflarestorage.com https://*.basemaps.cartocdn.com https://*.longdo.com https://server.arcgisonline.com https://drive.google.com https://lh3.googleusercontent.com https://*.google-analytics.com https://www.googletagmanager.com",
  "font-src 'self' data:",
  // open.er-api.com: live FX fetched client-side by the ROI calculator.
  "connect-src 'self' https://*.google-analytics.com https://*.analytics.google.com https://*.vercel-insights.com https://www.googletagmanager.com https://open.er-api.com https://*.posthog.com",
  // youtube-nocookie/vimeo: project-landing video embeds (<iframe>).
  "frame-src 'self' https://www.googletagmanager.com https://www.youtube-nocookie.com https://player.vimeo.com",
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
    // Serve images straight from source instead of through Vercel's optimizer.
    // Why: the Hobby image-optimization quota is exhausted (every uncached
    // /_next/image returns 402 OPTIMIZED_IMAGE_REQUEST_PAYMENT_REQUIRED), which
    // was breaking catalog photos site-wide. Object photos now live on
    // Cloudflare R2 (zero egress) behind Cloudflare's global CDN and are already
    // pre-resized to 2000px/q85 by the migration, so going direct both fixes the
    // 402 AND takes all image bandwidth off Vercel. Revert to optimized once the
    // quota resets or a paid plan / Cloudflare Image Resizing is in place.
    // → memory project_image_optimization_limit
    unoptimized: true,
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
      // R2 public bucket (pub-*.r2.dev) is where object photos move after the
      // Vercel Blob store was blocked; *.r2.cloudflarestorage.com is the S3
      // endpoint kept for completeness. → memory project_image_optimization_limit
      { protocol: "https", hostname: "**.r2.dev" },
      { protocol: "https", hostname: "**.r2.cloudflarestorage.com" },
      { protocol: "https", hostname: "**.public.blob.vercel-storage.com" },
    ],
  },
  typedRoutes: true,
  // sharp is a native module — keep it external so Next loads it from
  // node_modules at runtime (the /staticmap brochure renderer uses it) instead
  // of trying to bundle the .node binary into the serverless function.
  serverExternalPackages: ["sharp"],
  // Server Actions по умолчанию ограничены телом ~1МБ. Загрузка фото объектов
  // в /admin идёт пофайлово через Server Action, и один тяжёлый рендер способен
  // превысить дефолт — поднимаем до 4МБ (под потолком платформы Vercel 4.5МБ).
  // Прямая (presigned) загрузка в R2 снимет ограничение полностью следующим шагом.
  experimental: {
    serverActions: {
      bodySizeLimit: "4mb",
    },
  },
  // Справочник (/admin/guide) читает markdown с диска на рантайме (страницы
  // dynamic из-за AdminNav) — без явного include Vercel не положит файлы в
  // серверный бандл и fs.readFileSync вернёт ENOENT.
  outputFileTracingIncludes: {
    "/admin/guide": ["./src/content/guide/**/*"],
    "/admin/guide/[slug]": ["./src/content/guide/**/*"],
    "/admin/api/search": ["./src/content/guide/**/*"],
  },
  async rewrites() {
    return [
      // Same-origin proxy for object photos: *.r2.dev is state-blocked in
      // Indonesia (Komdigi) and unreliable in China/Korea, so public pages
      // link photos via /media/r2/* (src/lib/storage/r2-public.ts) and this
      // rewrite streams them from the bucket through our own domain.
      {
        source: "/media/r2/:path*",
        destination:
          "https://pub-e6d4ecfb57d243b4801e5d6fa0a37220.r2.dev/:path*",
      },
    ];
  },
  async headers() {
    return [
      {
        source: "/:path*",
        headers: [
          // Enforced. Revert to "Content-Security-Policy-Report-Only" if a
          // legitimate resource gets blocked (then add it to the allow-list).
          { key: "Content-Security-Policy", value: CSP },
          { key: "Strict-Transport-Security", value: "max-age=63072000; includeSubDomains" },
          { key: "X-Content-Type-Options", value: "nosniff" },
          { key: "X-Frame-Options", value: "SAMEORIGIN" },
          { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
          // geolocation=(self): the object map's "show my location" button needs
          // it for our own origin; camera/mic stay fully off (site uses neither).
          { key: "Permissions-Policy", value: "camera=(), microphone=(), geolocation=(self)" },
        ],
      },
    ];
  },
};

export default nextConfig;
