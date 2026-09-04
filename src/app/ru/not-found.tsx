import { NotFoundContent } from "@/components/layout/not-found-content";

/**
 * Russian 404. The root not-found is prerendered once as `/_not-found` with
 * English copy and only the client flipped it to RU after hydration (audit
 * 2026-09-03). The catch-all `app/ru/[...notFound]` routes unknown RU URLs
 * here, where the RU copy is server-rendered.
 *
 * No "fresh listings" strip here on purpose: rendered on demand (not
 * prerendered like the root 404), the catalogue fetch inside the not-found
 * boundary produced an empty __next_error__ shell on prod (2026-09-04).
 */
export default function RuNotFound() {
  return <NotFoundContent locale="ru" />;
}
