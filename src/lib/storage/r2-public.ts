/**
 * Public dev domain of the R2 photo bucket. Indonesia (Komdigi) blocks the
 * whole *.r2.dev zone (gambling/phishing abuse hosted there), and parts of
 * China/Korea do too — visitors there saw a photo-less site. Public pages
 * therefore serve every R2 photo through the same-origin proxy /media/r2/*
 * (rewrite in next.config.ts): if the site opens, its photos open.
 * Admin reads keep original URLs — photo delete/reorder must write real R2
 * URLs back to the DB, so only sanitizePublicObject applies the proxy.
 */
import { getSiteUrl } from "@/lib/site-url";

export const R2_PUBLIC_BASE =
  "https://pub-e6d4ecfb57d243b4801e5d6fa0a37220.r2.dev/";

/** R2 photo URL → absolute same-origin proxy URL; anything else passes through. */
export function proxyR2Url(url: string): string {
  if (!url.startsWith(R2_PUBLIC_BASE)) return url;
  return `${getSiteUrl()}/media/r2/${url.slice(R2_PUBLIC_BASE.length)}`;
}
