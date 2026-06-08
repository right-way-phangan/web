/**
 * Russian counterpart of faq-derived.ts: hand-written RU FAQ plus entries
 * auto-derived from the translated knowledge-base articles.
 */
import { FAQ_ITEMS_RU } from "@/content/faq.ru";
import { KB_ARTICLES_RU } from "@/content/knowledge-base.ru";
import type { FaqItem } from "@/content/faq";

const KB_FAQ_ITEMS_RU: FaqItem[] = KB_ARTICLES_RU.flatMap((a) => {
  if (!a.faqCategory || !a.faqQuestion) return [];
  return [
    {
      id: `guide-${a.slug}`,
      category: a.faqCategory,
      question: a.faqQuestion,
      answer: [a.short, `Полный гид: [${a.title}](/ru/knowledge/${a.slug}).`],
    } satisfies FaqItem,
  ];
});

/** Hand-written RU FAQ plus library-derived entries. Used by /ru/faq. */
export const ALL_FAQ_ITEMS_RU: FaqItem[] = [...FAQ_ITEMS_RU, ...KB_FAQ_ITEMS_RU];
