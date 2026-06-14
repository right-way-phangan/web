"use client";

import { useEffect } from "react";
import { usePathname } from "next/navigation";

/**
 * Keeps <html lang> in sync with the active locale. The root layout is a single
 * static shell (lang="en" at SSR), and the site uses a /ru path prefix rather
 * than a [locale] segment — so without this, Russian pages would announce
 * lang="en" to screen readers and language signals (WCAG 3.1.1). Reading the
 * pathname in the layout via headers() would force the whole site dynamic and
 * kill static generation; this client correction is the low-cost fix. A fully
 * SSR-correct lang would require migrating routing to a [locale] segment.
 */
export function HtmlLang() {
  const pathname = usePathname();
  useEffect(() => {
    const lang = pathname?.startsWith("/ru") ? "ru" : "en";
    if (document.documentElement.lang !== lang) {
      document.documentElement.lang = lang;
    }
  }, [pathname]);
  return null;
}
