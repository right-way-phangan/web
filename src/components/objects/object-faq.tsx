import Link from "next/link";
import { jsonLdHtml } from "@/lib/seo/json-ld";
import type { Route } from "next";
import { ChevronDown, ArrowRight } from "lucide-react";
import type { ObjectType, RealEstateObject } from "@/types/object";
import type { FaqBlock } from "@/content/faq";
import { FAQ_ITEMS } from "@/content/faq";
import { FAQ_ITEMS_RU } from "@/content/faq.ru";
import { FaqAnswer } from "@/components/faq/faq-blocks";
import { buildabilityFaq } from "@/lib/data/zone-rules";
import { getObjectDict, type Locale } from "@/lib/i18n/dictionaries";

type FaqItem = { id: string; question: string; answer: FaqBlock[] };

/**
 * Three FAQ answers matched to the object type, straight from the existing
 * FAQ content — plus FAQPage JSON-LD so listing pages surface in AI-search
 * answers (GEO/AEO). Table-heavy questions are avoided in the picks; the
 * JSON-LD flattens answers to plain text.
 */
const PICKS: Record<ObjectType, string[]> = {
  Land: ["q1", "q6", "q29"], // foreign land ownership · Chanote · building rules
  Villa: ["q5", "q2", "q22"], // villa vs land · freehold/leasehold · buying remotely
  House: ["q5", "q2", "q22"],
  Townhouse: ["q5", "q2", "q22"],
  Apartment: ["q2", "q21", "q22"], // tenure · timeline · buying remotely
  Hotel: ["q11", "q9", "q21"], // Thai company · seller verification · timeline
  Business: ["q11", "q9", "q21"],
  Project: ["q21", "q24", "q22"], // timeline · backing out · buying remotely
};

function blocksToText(blocks: FaqBlock[]): string {
  return blocks
    .map((b) => {
      if (typeof b === "string") return b.replace(/\*\*/g, "");
      if ("ul" in b) return b.ul.map((li) => li.replace(/\*\*/g, "")).join(" ");
      return b.table.note ?? "";
    })
    .filter(Boolean)
    .join(" ")
    .slice(0, 1200);
}

export function ObjectFaq({
  type,
  locale,
  object,
}: {
  type: ObjectType;
  locale: Locale;
  /** When given, prepends a per-listing "Can I build on RW-XXXX?" Q&A. */
  object?: RealEstateObject;
}) {
  const t = getObjectDict(locale);
  const source = locale === "ru" ? FAQ_ITEMS_RU : FAQ_ITEMS;
  const picked: FaqItem[] = PICKS[type]
    .map((id) => source.find((q) => q.id === id))
    .filter((q): q is NonNullable<typeof q> => !!q);

  // Per-listing buildability Q&A first — the most specific, GEO/AEO-friendly.
  const build = object ? buildabilityFaq(object, locale) : null;
  const items: FaqItem[] = build
    ? [{ id: "buildability", question: build.question, answer: build.answer }, ...picked]
    : picked;
  if (items.length === 0) return null;

  const faqHref = (locale === "ru" ? "/ru/faq" : "/faq") as Route;

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: items.map((q) => ({
      "@type": "Question",
      name: q.question,
      acceptedAnswer: { "@type": "Answer", text: blocksToText(q.answer) },
    })),
  };

  return (
    <section>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: jsonLdHtml(jsonLd) }}
      />
      <h2 className="font-serif text-3xl text-forest-900">{t.faqTitle}</h2>
      <div className="mt-6 divide-y divide-forest-500/10 border-y border-forest-500/10">
        {items.map((q) => (
          <details key={q.id} className="group py-4">
            <summary className="flex cursor-pointer list-none items-center justify-between gap-4 text-left font-medium text-forest-900 [&::-webkit-details-marker]:hidden">
              {q.question}
              <ChevronDown className="h-4 w-4 shrink-0 text-forest-500/50 transition-transform duration-200 group-open:rotate-180" />
            </summary>
            <div className="pt-3 text-sm">
              <FaqAnswer blocks={q.answer} />
            </div>
          </details>
        ))}
      </div>
      <Link
        href={faqHref}
        className="mt-5 inline-flex items-center gap-1.5 text-sm font-medium text-forest-500 underline-offset-4 transition-colors hover:text-brass-500 hover:underline"
      >
        {t.faqAll}
        <ArrowRight className="h-4 w-4" />
      </Link>
    </section>
  );
}
