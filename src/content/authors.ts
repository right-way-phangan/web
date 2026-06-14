/**
 * Article authorship — a single source of truth for who writes/edits the
 * knowledge base and journal. Used to render visible bylines AND to emit a
 * schema.org Person as the `author` of every Article/BlogPosting (E-E-A-T:
 * named, identifiable, real-world-experienced author instead of a faceless
 * Organization). Locale-keyed text so EN and RU pages share one entity.
 *
 * The canonical "author page" is the founder section on /about (anchor
 * #vladimir-buryi) — that page carries the matching Person + ProfilePage
 * markup, so the `@id` here resolves to a real bio rather than a dead link.
 */

export interface Author {
  /** Stable slug; doubles as the /about anchor id. */
  slug: string;
  name: string;
  /** Locale-keyed job title shown next to the name. */
  jobTitle: { en: string; ru: string };
  /** One-line role label for the byline (name + this). */
  byline: { en: string; ru: string };
  /** Full bio — mirrors the /about founder copy; feeds Person.description. */
  bio: { en: string; ru: string };
  /** Topics the author has demonstrable experience in (Person.knowsAbout). */
  knowsAbout: string[];
  /** External profiles, if any (Person.sameAs). Empty until confirmed. */
  sameAs: string[];
}

export const VLADIMIR: Author = {
  slug: "vladimir-buryi",
  name: "Vladimir Buryi",
  jobTitle: { en: "Founder", ru: "Основатель" },
  byline: {
    en: "Founder, Right Way Phangan",
    ru: "Основатель Right Way Phangan",
  },
  bio: {
    en:
      "Founder of Right Way Phangan. Four years operating in the Koh Phangan land " +
      "market — hundreds of plots assessed and over forty transactions supported. " +
      "Lives on the island year-round. Writes from hands-on practice; legal claims " +
      "are grounded in cited sources and verified with licensed Thai lawyers.",
    ru:
      "Основатель Right Way Phangan. Четыре года работы на земельном рынке Ко Пангана — " +
      "сотни оценённых участков и более сорока сопровождённых сделок. Живёт на острове " +
      "круглый год. Пишет из практики; юридические утверждения опираются на источники " +
      "и сверяются с лицензированными тайскими юристами.",
  },
  knowsAbout: [
    "Koh Phangan real estate",
    "Thai property law",
    "Leasehold and freehold land",
    "Real estate due diligence",
    "Land zoning",
    "Foreign property ownership in Thailand",
  ],
  sameAs: [],
};

/** Every article is attributed to the founder until a second author appears. */
export const DEFAULT_AUTHOR = VLADIMIR;

/** Path to the author's canonical bio (founder section on /about). */
export function authorPath(author: Author, locale: "en" | "ru"): string {
  return locale === "ru"
    ? `/ru/about#${author.slug}`
    : `/about#${author.slug}`;
}

/**
 * schema.org Person for the `author` field of an Article/BlogPosting. The `@id`
 * is the locale-neutral founder anchor so all pages reference one entity; `url`
 * points to the language-appropriate bio.
 */
export function authorPersonSchema(
  author: Author,
  siteUrl: string,
  locale: "en" | "ru",
) {
  return {
    "@type": "Person",
    "@id": `${siteUrl}/about#${author.slug}`,
    name: author.name,
    url: `${siteUrl}${authorPath(author, locale)}`,
    jobTitle: author.jobTitle[locale],
    description: author.bio[locale],
    knowsAbout: author.knowsAbout,
    worksFor: { "@id": `${siteUrl}#org` },
    ...(author.sameAs.length ? { sameAs: author.sameAs } : {}),
  };
}
