"use client";

import { useEffect } from "react";

/**
 * Corrects <html lang> at runtime for a locale subtree. The single root layout
 * renders <html lang="en"> for the whole app (App Router allows only one
 * <html>), so RU pages would otherwise advertise lang="en" — wrong for screen
 * readers and the rendered-DOM signal Google reads. Mounting this under /ru sets
 * lang="ru" on mount and restores the previous value on unmount (so client-side
 * navigation back to an EN page flips it back). SEO is already covered by the
 * correct hreflang alternates + per-page og:locale; this fixes the live DOM.
 *
 * NOTE: the SSR-correct fix (server-rendered lang="ru") needs the request path
 * in the root layout via a middleware header — middleware currently carries
 * unrelated WIP, so this runtime correction ships now and the SSR part can fold
 * into that branch later.
 */
export function HtmlLang({ lang }: { lang: string }) {
  useEffect(() => {
    const previous = document.documentElement.lang;
    document.documentElement.lang = lang;
    return () => {
      document.documentElement.lang = previous;
    };
  }, [lang]);
  return null;
}
