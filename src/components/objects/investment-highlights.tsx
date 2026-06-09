"use client";

import type { RealEstateObject } from "@/types/object";
import { useLocale } from "@/lib/i18n/use-locale";
import { getObjectDict, type ObjectDict } from "@/lib/i18n/dictionaries";

interface Highlight {
  title: string;
  text: string;
}

/**
 * Auto-generate 2-5 investment highlights from object fields, localized via the
 * object dictionary. No prices, no exaggeration — facts that genuinely affect
 * value.
 */
function deriveHighlights(o: RealEstateObject, hl: ObjectDict["hl"], nl: string): Highlight[] {
  const out: Highlight[] = [];

  if (o.beachfront) out.push(hl.beachfront);
  else if (o.seaView) out.push(hl.seaView);

  if (o.documentType === "Chanote") out.push(hl.chanote);
  else if (o.documentType === "NS3K") out.push(hl.ns3k);

  if (o.areaRai && o.areaRai >= 3) {
    // Explicit locale: a fractional rai (e.g. 3.5) renders with a runtime-
    // dependent decimal separator otherwise → server/client hydration mismatch.
    out.push(hl.plot(o.areaRai.toLocaleString(nl, { maximumFractionDigits: 1 })));
  }

  if (o.tenure?.includes("Freehold")) out.push(hl.freehold);
  if (o.condition === "New") out.push(hl.moveIn);
  if (o.altitude !== undefined && o.altitude >= 80) out.push(hl.elevation(o.altitude));
  if (o.quiet && out.length < 5) out.push(hl.quiet);

  return out.slice(0, 5);
}

export function InvestmentHighlights({ object }: { object: RealEstateObject }) {
  const locale = useLocale();
  const t = getObjectDict(locale);
  const items = deriveHighlights(object, t.hl, locale === "ru" ? "ru-RU" : "en-US");
  if (items.length === 0) return null;

  return (
    <section>
      <h2 className="font-serif text-3xl text-forest-900">{t.whyThisOne}</h2>
      <div className="mt-8 grid gap-6 sm:grid-cols-2">
        {items.map((item) => (
          <div
            key={item.title}
            className="rounded-sm border border-forest-500/10 bg-cream-50 p-6"
          >
            <h3 className="font-serif text-xl text-forest-900">{item.title}</h3>
            <p className="mt-2 text-sm leading-relaxed text-forest-500/75">{item.text}</p>
          </div>
        ))}
      </div>
    </section>
  );
}
