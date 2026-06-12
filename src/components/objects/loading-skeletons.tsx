/**
 * Route-level loading skeletons (app/.../loading.tsx). Catalog data comes live
 * from amoCRM, so first paint can take a beat — these keep the layout shape
 * instead of a blank screen. Server-safe, no client JS.
 */

function Block({ className }: { className?: string }) {
  return <div className={`animate-pulse rounded-sm bg-forest-500/10 ${className ?? ""}`} />;
}

export function ListingsSkeleton() {
  return (
    <div className="container-prose py-10 md:py-14" aria-busy="true">
      {/* page hero */}
      <Block className="h-3 w-24" />
      <Block className="mt-4 h-10 w-2/3 max-w-xl" />
      <Block className="mt-4 h-4 w-48" />

      {/* search + filter bar */}
      <Block className="mt-10 h-12 w-full" />
      <div className="mt-3 flex flex-wrap gap-2">
        {Array.from({ length: 5 }).map((_, i) => (
          <Block key={i} className="h-9 w-28" />
        ))}
      </div>

      {/* card grid */}
      <div className="mt-10 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {Array.from({ length: 6 }).map((_, i) => (
          <div key={i} className="overflow-hidden rounded-sm border border-forest-500/10">
            <Block className="aspect-[4/3] w-full rounded-none" />
            <div className="space-y-3 p-5">
              <Block className="h-3 w-24" />
              <Block className="h-5 w-3/4" />
              <Block className="h-5 w-28" />
              <Block className="h-3 w-2/3" />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

export function ObjectSkeleton() {
  return (
    <div className="container-prose py-8 md:py-12" aria-busy="true">
      {/* breadcrumbs */}
      <Block className="h-4 w-56" />

      {/* gallery: single tile on mobile, 1+4 grid on desktop */}
      <div className="mt-6 grid gap-2 md:grid-cols-4 md:grid-rows-2">
        <Block className="aspect-[4/3] rounded-sm md:col-span-2 md:row-span-2 md:aspect-auto" />
        {Array.from({ length: 4 }).map((_, i) => (
          <Block key={i} className="hidden aspect-[4/3] md:block" />
        ))}
      </div>

      {/* header */}
      <Block className="mt-10 h-3 w-32" />
      <Block className="mt-4 h-10 w-3/4 max-w-2xl" />
      <Block className="mt-5 h-8 w-44" />
      <Block className="mt-4 h-4 w-64" />

      {/* two-column body */}
      <div className="mt-12 grid gap-12 lg:grid-cols-[1fr_360px] lg:gap-16">
        <div className="space-y-4">
          <Block className="h-7 w-56" />
          {Array.from({ length: 5 }).map((_, i) => (
            <Block key={i} className="h-4 w-full max-w-prose" />
          ))}
        </div>
        <Block className="h-96 w-full" />
      </div>
    </div>
  );
}
