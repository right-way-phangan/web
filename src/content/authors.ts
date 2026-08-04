/**
 * Article authorship — single source of truth for who signs the knowledge
 * base and the journal. Articles are attributed to the brand (Organization),
 * not to a named person: the visible byline and the schema.org `author`
 * both point at the same org entity as the site-wide RealEstateAgent node
 * (`<siteUrl>#org`), so E-E-A-T weight accrues to the organisation.
 *
 * Named Person authorship is a reversible asset: add an Author with a real
 * bio here, point DEFAULT_AUTHOR at it and emit a Person schema again —
 * every article re-bylines in one commit.
 */

import type { FaqCategoryId } from "@/content/faq";
import { siteConfig } from "@/lib/site-config";

export interface Author {
  /** Stable slug; doubles as an /about anchor id when a person has a bio there. */
  slug: string;
  name: string;
  /** Locale-keyed job title shown next to the name. */
  jobTitle: { en: string; ru: string };
  /** One-line role label for the byline (name + this). */
  byline: { en: string; ru: string };
  /** Full bio; feeds Person.description when a person is the author. */
  bio: { en: string; ru: string };
  /** Topics the author has demonstrable experience in (Person.knowsAbout). */
  knowsAbout: string[];
  /** External profiles, if any (Person.sameAs). Empty until confirmed. */
  sameAs: string[];
}

/** Brand author — articles carry the organisation, not a person. */
export const BRAND_AUTHOR: Author = {
  slug: "right-way-phangan",
  name: siteConfig.name,
  jobTitle: { en: "Editorial", ru: "Редакция" },
  byline: { en: "Editorial", ru: "Редакция" },
  bio: { en: "", ru: "" },
  knowsAbout: [],
  sameAs: [],
};

export const DEFAULT_AUTHOR = BRAND_AUTHOR;

/** Path behind the byline link — the brand's own /about. */
export function authorPath(locale: "en" | "ru"): string {
  return locale === "ru" ? "/ru/about" : "/about";
}

/**
 * schema.org `author` for Article/BlogPosting — the Organization, with the
 * same `@id` as the site-wide RealEstateAgent node so every page references
 * one entity. name/url are inlined to keep the node valid on pages where
 * the org snippet itself is absent.
 */
export function authorOrgSchema(siteUrl: string) {
  return {
    "@type": "Organization",
    "@id": `${siteUrl}#org`,
    name: siteConfig.name,
    url: siteUrl,
  };
}

/* ── Legal review (YMYL) ─────────────────────────────────────────────────────
 *
 * Knowledge-base guides in these categories make legal/financial claims about
 * Thai property — the kind of content Google weighs hardest (YMYL). A named,
 * licensed reviewer is the strongest E-E-A-T signal we can add to them.
 *
 * The slot is wired but DORMANT: `LEGAL_REVIEWER` is null until a Thai lawyer
 * is onboarded (see the DD work — lawyer Anas). While null, nothing renders and
 * no `reviewedBy` is emitted. To activate, replace null with a populated Author
 * (name, jobTitle "Licensed Thai lawyer", bio, knowsAbout) — every legal-category
 * guide then shows "Legally reviewed by …" + reviewedBy schema automatically.
 */

/** FAQ categories whose guides assert Thai legal/financial facts → want review. */
export const LEGAL_REVIEW_CATEGORIES: ReadonlySet<FaqCategoryId> = new Set<FaqCategoryId>([
  "ownership",
  "documents",
  "structures",
  "costs",
]);

/** The licensed reviewer. Null until onboarded — keep the type so activation is one edit. */
export const LEGAL_REVIEWER: Author | null = null;

/**
 * Reviewer for a guide, or null. Returns the reviewer only when (a) one exists
 * and (b) the guide is in a legal-sensitive category. Pass the article's
 * faqCategory (undefined for journal posts → no review by default).
 */
export function legalReviewerFor(faqCategory?: FaqCategoryId): Author | null {
  if (!LEGAL_REVIEWER) return null;
  if (!faqCategory || !LEGAL_REVIEW_CATEGORIES.has(faqCategory)) return null;
  return LEGAL_REVIEWER;
}

/** schema.org Person for an Article's `reviewedBy` (accuracy/completeness check). */
export function reviewerPersonSchema(
  reviewer: Author,
  siteUrl: string,
  locale: "en" | "ru",
) {
  return {
    "@type": "Person",
    name: reviewer.name,
    jobTitle: reviewer.jobTitle[locale],
    knowsAbout: reviewer.knowsAbout,
    ...(reviewer.sameAs.length ? { sameAs: reviewer.sameAs } : {}),
  };
}
