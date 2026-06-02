/**
 * Canonical site URL — used by sitemap, robots, OG images, metadata.
 *
 * Resolution order:
 *  1. NEXT_PUBLIC_SITE_URL (set in Vercel for production)
 *  2. VERCEL_URL (set automatically per-deployment by Vercel)
 *  3. http://localhost:3000 (local dev fallback)
 */
export function getSiteUrl(): string {
  const explicit = process.env.NEXT_PUBLIC_SITE_URL;
  if (explicit) return explicit.replace(/\/$/, "");
  const vercel = process.env.VERCEL_URL;
  if (vercel) return `https://${vercel}`;
  return "http://localhost:3000";
}
