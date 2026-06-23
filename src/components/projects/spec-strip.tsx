import { Bed, Bath, Maximize2, ScrollText, CalendarClock, Hourglass, type LucideIcon } from "lucide-react";
import type { RealEstateObject } from "@/types/object";
import type { Locale } from "@/lib/i18n/dictionaries";
import { SectionEyebrow } from "@/components/sections/section-eyebrow";

/** Compact key-facts strip under the hero — fast scanning without jumping to
 * the spec sections. Renders only the facts that are present. */
export function SpecStrip({ project: p, locale }: { project: RealEstateObject; locale: Locale }) {
  const ru = locale === "ru";
  const items: Array<{ icon: LucideIcon; value: string }> = [];

  if (p.bedrooms != null) items.push({ icon: Bed, value: `${p.bedrooms} ${ru ? "спал." : "bd"}` });
  if (p.bathrooms != null) items.push({ icon: Bath, value: `${p.bathrooms} ${ru ? "сан." : "ba"}` });
  if (p.areaSqm) items.push({ icon: Maximize2, value: `${p.areaSqm.toLocaleString()} m²` });
  if (p.tenure?.[0]) items.push({ icon: ScrollText, value: p.tenure[0] });
  if (p.leaseTermYears) items.push({ icon: Hourglass, value: `${p.leaseTermYears} ${ru ? "лет" : "yr"}` });
  if (p.completion) items.push({ icon: CalendarClock, value: p.completion });

  if (items.length === 0) return null;

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
