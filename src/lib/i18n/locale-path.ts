import { LOCALES, type Locale } from "./dictionaries";

/**
 * Server-safe locale path helpers (no "use client"). EN lives at the root, every
 * other locale under its own prefix (/ru, /th) with identical slugs. Mirrors
 * localeHref from use-locale.ts, which is client-only.
 */
export function localePath(locale: Locale, path: string): string {
  if (locale === "en") return path;
  return path === "/" ? `/${locale}` : `/${locale}${path}`;
}

/** URL prefix for a locale: "" for en, "/ru", "/th". */
export function localeBase(locale: Locale): string {
  return locale === "en" ? "" : `/${locale}`;
}

/** Locale of an app path: "/ru/x" → "ru", "/th" → "th", anything else → "en". */
export function localeFromPath(pathname: string): Locale {
  for (const l of LOCALES) {
    if (l !== "en" && (pathname === `/${l}` || pathname.startsWith(`/${l}/`))) return l;
  }
  return "en";
}

/** Strip the locale prefix: "/th/listings" → "/listings", "/ru" → "/". */
export function stripLocale(pathname: string): string {
  const l = localeFromPath(pathname);
  return l === "en" ? pathname : pathname.slice(l.length + 1) || "/";
}

/** BCP-47 tag for Intl number/date formatting. `en` keeps whatever tag the
 * call site used before ("en-US" for numbers, "en-GB" for dates). Thai keeps the
 * Gregorian calendar so dates match the years quoted in content (2026, not 2569). */
export function intlLocale(locale: Locale, en: "en-US" | "en-GB" = "en-US"): string {
  return locale === "ru" ? "ru-RU" : locale === "th" ? "th-TH-u-ca-gregory" : en;
}

/** og:locale value. */
export const OG_LOCALE: Record<Locale, string> = { en: "en_US", ru: "ru_RU", th: "th_TH" };

/**
 * hreflang alternates for an EN path, for Next metadata:
 * `alternates: { canonical: localePath("th", "/about"), languages: langAlternates("/about") }`.
 */
export function langAlternates(path: string): Record<string, string> {
  return {
    en: path,
    ru: localePath("ru", path),
    th: localePath("th", path),
    "x-default": path,
  };
}

/** Pick the string for the current locale: `L(locale, { en, ru, th })`. */
export function L<T>(locale: Locale, v: Record<Locale, T>): T {
  return v[locale];
}
