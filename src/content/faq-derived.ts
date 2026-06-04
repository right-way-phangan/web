/**
 * FAQ entries auto-derived from the public knowledge-base library.
 *
 * Each public KB article that declares a `faqCategory` + `faqQuestion` becomes a
 * teaser FAQ entry that links to the full guide. This is how the FAQ stays in
 * sync with the library without hand-editing: add a public article (already
 * reviewed) → it surfaces under the right FAQ category, searchable, with an
 * internal link to /knowledge/<slug> (good for SEO and assistant grounding).
 *
 * Deterministic, no LLM. A later phase may propose net-new Q&A wording from the
 * library — that path goes through the same review-gate before landing here.
 */
import { FAQ_ITEMS, type FaqItem } from "@/content/faq";
import { KB_ARTICLES } from "@/content/knowledge-base";

export const KB_FAQ_ITEMS: FaqItem[] = KB_ARTICLES.flatMap((a) => {
  if (!a.faqCategory || !a.faqQuestion) return [];
  return [
    {
      id: `guide-${a.slug}`,
      category: a.faqCategory,
      question: a.faqQuestion,
      answer: [a.short, `Full guide: [${a.title}](/knowledge/${a.slug}).`],
    } satisfies FaqItem,
  ];
});

/** Hand-written FAQ plus library-derived entries. Used by the FAQ page/explorer. */
export const ALL_FAQ_ITEMS: FaqItem[] = [...FAQ_ITEMS, ...KB_FAQ_ITEMS];