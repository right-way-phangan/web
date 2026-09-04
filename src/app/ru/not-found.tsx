import { Suspense } from "react";
import { NotFoundContent } from "@/components/layout/not-found-content";
import { FreshListings } from "@/components/layout/not-found-fresh-server";

/**
 * Russian 404. The root not-found is prerendered once as `/_not-found` with
 * English copy and only the client flipped it to RU after hydration (audit
 * 2026-09-03: `/ru/nope` served lang="en" + "This page can't be found."). The
 * catch-all `app/ru/[...notFound]` routes unknown RU URLs here, where the RU
 * copy is server-rendered.
 */
export default function RuNotFound() {
  return (
    <NotFoundContent
      locale="ru"
      fresh={
        <Suspense fallback={null}>
          <FreshListings />
        </Suspense>
      }
    />
  );
}
