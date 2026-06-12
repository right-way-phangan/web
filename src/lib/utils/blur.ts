/**
 * Shared blur placeholder for remote photos (amoCRM → Vercel Blob): per-image
 * base64 would mean fetching every photo at build time, so all cards share one
 * brand-toned wash — cream into a hint of forest — that photos fade in over.
 * URL-encoded (not base64) so it works in client bundles without Buffer.
 */
const BLUR_SVG =
  '<svg xmlns="http://www.w3.org/2000/svg" width="8" height="6"><rect width="8" height="6" fill="#F2EDE3"/><rect width="8" height="3" y="3" fill="#E8EEEA"/></svg>';

export const BLUR_PLACEHOLDER = `data:image/svg+xml,${encodeURIComponent(BLUR_SVG)}`;
