"use client";

import { usePathname } from "next/navigation";
import type { Locale } from "./dictionaries";

/**
 * Client-side current locale, derived from the URL (/ru/* → "ru", else "en").
 * Lets shared client components self-localize without prop threading — the same
 * component renders EN under / and RU under /ru.
 */
export function useLocale(): Locale {
  const pathname = usePathname();
  return pathname === "/ru" || pathname.startsWith("/ru/") ? "ru" : "en";
}

/** Prefix an app path with the locale base ("/ru" for ru, "" for en). */
export function localeHref(locale: Locale, path: string): string {
  if (locale === "en") return path;
  // path always starts with "/". "/" → "/ru", "/listings" → "/ru/listings".
  return path === "/" ? "/ru" : `/ru${path}`;
}
