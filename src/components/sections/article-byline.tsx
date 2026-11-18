import Link from "next/link";
import type { Route } from "next";
import type { Author } from "@/content/authors";
import { authorPath } from "@/content/authors";
import type { Locale } from "@/lib/i18n/dictionaries";
import { L, intlLocale } from "@/lib/i18n/locale-path";

interface Props {
  author: Author;
  /** ISO date string, e.g. "2026-06-14". */
  dateISO: string;
  locale: Locale;
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
 * Visible author byline for knowledge-base and journal articles. Articles are
 * signed by the brand (Organization), not a named person — the on-page half of
 * the same entity the schema.org `author` `@id` resolves to. Links to /about.
 */
export function ArticleByline({
  author,
  dateISO,
  locale,
  dateKind = "published",
  reviewer,
}: Props) {
  const href = authorPath(locale) as Route;
  const date = new Date(dateISO).toLocaleDateString(intlLocale(locale, "en-GB"), {
    day: "numeric",
    month: "long",
    year: "numeric",
  });
  const dateLabel =
    dateKind === "updated" ? L(locale, { en: "Updated ", ru: "Обновлено ", th: "อัปเดต " }) : "";
  const reviewLabel = L(locale, { en: "Legally reviewed by ", ru: "Юридически проверено — ", th: "ตรวจสอบทางกฎหมายโดย " });

  return (
    <div className="mt-6 flex items-center gap-3">
      <span
        aria-hidden
        className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-panel font-serif text-sm text-panel-fg"
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
