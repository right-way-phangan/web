/**
 * Thai counterpart of faq-derived.ts: hand-written TH FAQ plus entries
 * auto-derived from the translated knowledge-base articles.
 */
import { FAQ_ITEMS_TH } from "@/content/faq.th";
import { KB_ARTICLES_TH } from "@/content/knowledge-base.th";
import type { FaqItem } from "@/content/faq";

const KB_FAQ_ITEMS_TH: FaqItem[] = KB_ARTICLES_TH.flatMap((a) => {
  if (!a.faqCategory || !a.faqQuestion) return [];
  return [
    {
      id: `guide-${a.slug}`,
      category: a.faqCategory,
      question: a.faqQuestion,
      answer: [a.short, `อ่านคู่มือฉบับเต็ม: [${a.title}](/th/knowledge/${a.slug}).`],
    } satisfies FaqItem,
  ];
});

/** Hand-written TH FAQ plus library-derived entries. Used by /th/faq. */
export const ALL_FAQ_ITEMS_TH: FaqItem[] = [...FAQ_ITEMS_TH, ...KB_FAQ_ITEMS_TH];
