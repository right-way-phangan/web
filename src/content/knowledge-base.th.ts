/** PLACEHOLDER — regenerated from translated JSON before merge. */
import { KB_ARTICLES, type KbArticle } from "@/content/knowledge-base";

export const KB_ARTICLES_TH: KbArticle[] = KB_ARTICLES;

export function getKbArticleThBySlug(slug: string): KbArticle | undefined {
  return KB_ARTICLES_TH.find((a) => a.slug === slug);
}
