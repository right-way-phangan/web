"use client";

import { usePathname } from "next/navigation";
import type { Locale } from "./dictionaries";
import { localeFromPath, localePath } from "./locale-path";

/**
 * Client-side current locale, derived from the URL (/ru/* → "ru", /th/* → "th",
 * else "en"). Lets shared client components self-localize without prop
 * threading — the same component renders EN under /, RU under /ru, TH under /th.
 */
export function useLocale(): Locale {
  return localeFromPath(usePathname() ?? "/");
}

/** Prefix an app path with the locale base ("" for en, "/ru", "/th"). */
export function localeHref(locale: Locale, path: string): string {
  return localePath(locale, path);
}
