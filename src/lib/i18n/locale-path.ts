import type { Locale } from "./dictionaries";

/**
 * Server-safe locale path prefixer (no "use client"). Mirrors localeHref from
 * use-locale.ts, which is client-only and cannot be called from Server
 * Components. Use this one in server code; use localeHref in client components.
 */
export function localePath(locale: Locale, path: string): string {
  if (locale === "en") return path;
  return path === "/" ? "/ru" : `/ru${path}`;
}
