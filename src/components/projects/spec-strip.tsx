import { Bed, Bath, Maximize2, ScrollText, CalendarClock, Hourglass, type LucideIcon } from "lucide-react";
import type { RealEstateObject } from "@/types/object";
import type { Locale } from "@/lib/i18n/dictionaries";
import { SectionEyebrow } from "@/components/sections/section-eyebrow";

/** Compact key-facts strip under the hero — fast scanning without jumping to
 * the spec sections. Renders only the facts that are present. */
export function SpecStrip({
  project: p,
  units = [],
  locale,
}: {
  project: RealEstateObject;
  units?: RealEstateObject[];
  locale: Locale;
}) {
  const ru = locale === "ru";
  const items: Array<{ icon: LucideIcon; value: string }> = [];

  // A project with 1/2/3BR units said "1 bd" (the parent's own field) — show
  // the range across its units when they carry bedrooms.
  const bedroomsLabel = bedroomsRange(units) ?? (p.bedrooms != null ? String(p.bedrooms) : null);
  if (bedroomsLabel) items.push({ icon: Bed, value: `${bedroomsLabel} ${ru ? "спал." : "bd"}` });
  if (p.bathrooms != null) items.push({ icon: Bath, value: `${p.bathrooms} ${ru ? "сан." : "ba"}` });
  if (p.areaSqm) items.push({ icon: Maximize2, value: `${p.areaSqm.toLocaleString(ru ? "ru-RU" : "en-US")} m²` });
  if (p.tenure?.[0]) items.push({ icon: ScrollText, value: p.tenure[0] });
  if (p.leaseTermYears) items.push({ icon: Hourglass, value: `${p.leaseTermYears} ${ru ? "лет" : "yr"}` });
  if (p.completion) items.push({ icon: CalendarClock, value: p.completion });

  if (items.length === 0) return null;

  function bedroomsRange(list: RealEstateObject[]): string | null {
    const beds = list.map((u) => u.bedrooms).filter((b): b is number => typeof b === "number");
    if (beds.length === 0) return null;
    const min = Math.min(...beds);
    const max = Math.max(...beds);
    return min === max ? String(min) : `${min}–${max}`;
  }

  return (
    <div className="mt-8">
      <SectionEyebrow className="mb-3">{ru ? "Ключевые факты" : "Key specs"}</SectionEyebrow>
      <div className="flex flex-wrap items-center gap-x-6 gap-y-3 border-y border-forest-500/10 py-4">
        {items.map((it, i) => {
          const Icon = it.icon;
          return (
            <span key={i} className="inline-flex items-center gap-2 text-sm text-forest-500/85">
              <Icon className="h-4 w-4 text-brass-500" />
              {it.value}
            </span>
          );
        })}
      </div>
    </div>
  );
}
