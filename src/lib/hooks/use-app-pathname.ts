"use client";

import { usePathname } from "next/navigation";

/**
 * `usePathname()` normalised for the two home routes.
 *
 * During static prerender Next reports the home page as "/index" (and the RU
 * home as "/ru/index") — the name of the generated HTML file, not the URL the
 * browser will be on. Components that branch on the path then render one way on
 * the server and another after hydration: the language switcher emitted
 * href="/ru/index" (a 404), and the header/footer picked the non-home layout.
 */
export function useAppPathname(): string {
  const pathname = usePathname();
  if (pathname === "/index") return "/";
  if (pathname === "/ru/index") return "/ru";
  return pathname;
}
