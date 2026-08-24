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

/**
 * Тот же прокси, но на превью 800px WebP из `thumbs/` (кладётся при заливке,
 * см. uploadImageToR2). Карточке каталога хватает ~400px, а без оптимизатора
 * Next (`images.unoptimized`) она тянула полный 2000px-файл: 785 КБ вместо
 * 106 КБ, LCP каталога 19 с. Если превью для старого фото ещё нет, вызывающий
 * код откатывается на оригинал — отсюда отдельная функция, а не подмена в
 * proxyR2Url.
 */
export function thumbR2Url(url: string): string {
  if (!url.startsWith(R2_PUBLIC_BASE)) return url;
  return `${getSiteUrl()}/media/r2/thumbs/${url.slice(R2_PUBLIC_BASE.length)}.webp`;
}

/**
 * Превью для уже проксированного URL (`/media/r2/...`): такие приходят из
 * sanitizePublicObject, когда объект уже прошёл через публичный слой.
 */
export function thumbFromProxiedUrl(url: string): string | null {
  const marker = "/media/r2/";
  const i = url.indexOf(marker);
  if (i === -1 || url.includes("/media/r2/thumbs/")) return null;
  return `${url.slice(0, i)}${marker}thumbs/${url.slice(i + marker.length)}.webp`;
}

/**
 * R2 video URL → same-origin proxy, but via the /media/video route handler
 * instead of the /media/r2 rewrite. Videos stream over Range requests, which
 * Vercel's edge cache mis-serves off the cached rewrite (a cached tail slice
 * gets returned for a header-byte request → MEDIA_ERR_SRC_NOT_SUPPORTED). The
 * route handler is dynamic + no-store, so it never edge-caches. Photos stay on
 * the cheaper cached rewrite. Non-R2 URLs pass through unchanged.
 */
export function proxyR2VideoUrl(url: string): string {
  if (!url.startsWith(R2_PUBLIC_BASE)) return url;
  return `${getSiteUrl()}/media/video/${url.slice(R2_PUBLIC_BASE.length)}`;
}
