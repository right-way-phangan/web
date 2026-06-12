import type { NextConfig } from "next";

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
    remotePatterns: [
      { protocol: "https", hostname: "drive.google.com" },
      { protocol: "https", hostname: "lh3.googleusercontent.com" },
      { protocol: "https", hostname: "**.r2.cloudflarestorage.com" },
      { protocol: "https", hostname: "**.public.blob.vercel-storage.com" },
    ],
  },
  typedRoutes: true,
  async headers() {
    return [
      {
        source: "/:path*",
        headers: [
          // CSP is deliberately absent: GTM + Vercel injectors + Leaflet tiles
          // need a careful audit first — a broken CSP is worse than none.
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
