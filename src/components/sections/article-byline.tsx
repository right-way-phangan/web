import Link from "next/link";
import type { Route } from "next";
import type { Author } from "@/content/authors";
import { authorPath } from "@/content/authors";

interface Props {
  author: Author;
  /** ISO date string, e.g. "2026-06-14". */
  dateISO: string;
  locale: "en" | "ru";
  /** "updated" prefixes the date with Updated/Обновлено (knowledge base). */
  dateKind?: "published" | "updated";
  /** Licensed reviewer for legal/YMYL guides — adds a "Legally reviewed by" line. */
  reviewer?: Author | null;
}

function initials(name: string): string {
  return name
    .split(/\s+/)
    .slice(0, 2)
    .map((w) => w[0]?.toUpperCase() ?? "")
    .join("");
}

/**
 * Visible author byline for knowledge-base and journal articles. A named,
 * linked author (not a faceless brand) is the on-page half of the E-E-A-T
 * signal that the Person JSON-LD makes machine-readable. Links to the founder's
 * bio on /about — the same entity the schema `@id` resolves to.
 */
export function ArticleByline({
  author,
  dateISO,
  locale,
  dateKind = "published",
  reviewer,
}: Props) {
  const href = authorPath(author, locale) as Route;
  const date = new Date(dateISO).toLocaleDateString(locale === "ru" ? "ru-RU" : "en-GB", {
    day: "numeric",
    month: "long",
    year: "numeric",
  });
  const dateLabel =
    dateKind === "updated" ? (locale === "ru" ? "Обновлено " : "Updated ") : "";
  const reviewLabel = locale === "ru" ? "Юридически проверено — " : "Legally reviewed by ";

  return (
    <div className="mt-6 flex items-center gap-3">
      <span
        aria-hidden
        className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-forest-900 font-serif text-sm text-cream-50"
      >
        {initials(author.name)}
      </span>
      <p className="text-sm leading-snug text-forest-500/70">
        <Link
          href={href}
          className="font-medium text-forest-900 underline-offset-4 hover:text-brass-500 hover:underline"
        >
          {author.name}
        </Link>
        <span className="text-forest-500/50"> · {author.byline[locale]}</span>
        <br />
        <span className="text-forest-500/50">
          {dateLabel}
          {date}
        </span>
        {reviewer ? (
          <>
            <br />
            <span className="text-forest-500/50">
              {reviewLabel}
              <span className="text-forest-500/70">{reviewer.name}</span>
              {" · "}
              {reviewer.jobTitle[locale]}
            </span>
          </>
        ) : null}
      </p>
    </div>
  );
}
