"use client";

import type { RealEstateObject } from "@/types/object";
import { useLocale } from "@/lib/i18n/use-locale";
import { getObjectDict } from "@/lib/i18n/dictionaries";
import { ObjectCard } from "./object-card";

/** Squared planar distance in degrees — fine for ranking on an island this size. */
function dist2(a: RealEstateObject, b: RealEstateObject): number {
  if (a.lat == null || a.lng == null || b.lat == null || b.lng == null) return Infinity;
  const dx = a.lat - b.lat;
  const dy = a.lng - b.lng;
  return dx * dx + dy * dy;
}

/**
 * Pick up to `limit` related listings: same-district first (closest by map
 * distance, then same type, then those with a real photo), topped up with the
 * nearest objects from elsewhere on the island.
 */
export function pickRelated(
  current: RealEstateObject,
  catalog: RealEstateObject[],
  limit = 4,
): RealEstateObject[] {
  const others = catalog.filter((o) => o.rwNumber !== current.rwNumber);

  const rank = (o: RealEstateObject) =>
    (o.type === current.type ? -2 : 0) + (o.coverImage ? -1 : 0);

  const sameDistrict = current.district
    ? others
        .filter((o) => o.district === current.district)
        .sort((a, b) => dist2(current, a) - dist2(current, b) || rank(a) - rank(b))
    : [];

  if (sameDistrict.length >= limit) return sameDistrict.slice(0, limit);

  // Top up with nearest from other districts (by distance when we have coords).
  const picked = new Set(sameDistrict.map((o) => o.rwNumber));
  const fillers = others
    .filter((o) => !picked.has(o.rwNumber))
    .sort((a, b) => dist2(current, a) - dist2(current, b) || rank(a) - rank(b));

  return [...sameDistrict, ...fillers].slice(0, limit);
}

export function RelatedListings({
  current,
  catalog,
}: {
  current: RealEstateObject;
  catalog: RealEstateObject[];
}) {
  const t = getObjectDict(useLocale());
  const related = pickRelated(current, catalog, 4);
  if (related.length === 0) return null;

  const heading = current.district ? t.moreInNearby(current.district) : t.moreToExplore;

  return (
    <section className="mt-16 border-t border-forest-500/10 pt-12 md:mt-20 md:pt-16 print:hidden">
      <h2 className="font-serif text-3xl text-forest-900">{heading}</h2>
      <div className="mt-8 grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
        {related.map((o) => (
          <ObjectCard key={o.id} object={o} />
        ))}
      </div>
    </section>
  );
}
