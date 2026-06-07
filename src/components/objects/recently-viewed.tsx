"use client";

import { useEffect, useMemo, useState } from "react";
import type { RealEstateObject } from "@/types/object";
import { getRecentlyViewed } from "@/lib/recently-viewed";
import { ObjectCard } from "./object-card";

/**
 * Horizontal strip of the visitor's recently-viewed listings, read from
 * localStorage on mount. Renders nothing until it has something to show, so it
 * never reserves space for new visitors.
 */
export function RecentlyViewed({
  catalog,
  excludeRw,
  title = "Recently viewed",
}: {
  catalog: RealEstateObject[];
  excludeRw?: string;
  title?: string;
}) {
  const [recent, setRecent] = useState<string[]>([]);
  useEffect(() => setRecent(getRecentlyViewed()), []);

  const items = useMemo(() => {
    const byRw = new Map(catalog.map((o) => [o.rwNumber, o]));
    return recent
      .filter((rw) => rw !== excludeRw)
      .map((rw) => byRw.get(rw))
      .filter((o): o is RealEstateObject => !!o);
  }, [catalog, recent, excludeRw]);

  if (items.length === 0) return null;

  return (
    <section className="mt-16 border-t border-forest-500/10 pt-12 md:mt-20 md:pt-16">
      <h2 className="font-serif text-3xl text-forest-900">{title}</h2>
      <div className="-mx-6 mt-8 flex snap-x gap-5 overflow-x-auto px-6 pb-2 md:-mx-8 md:px-8">
        {items.map((o) => (
          <div key={o.id} className="w-[260px] shrink-0 snap-start">
            <ObjectCard object={o} />
          </div>
        ))}
      </div>
    </section>
  );
}
