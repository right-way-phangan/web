import { useEffect, useState } from "react";

/**
 * Reactive media-query match. Returns false on the server / first render, then
 * the real value after mount — so it's safe for deferring client-only work
 * (e.g. not mounting a heavy map on mobile until it's actually shown).
 */
export function useMediaQuery(query: string): boolean {
  const [matches, setMatches] = useState(false);

  useEffect(() => {
    const mql = window.matchMedia(query);
    setMatches(mql.matches);
    const handler = (e: MediaQueryListEvent) => setMatches(e.matches);
    mql.addEventListener("change", handler);
    return () => mql.removeEventListener("change", handler);
  }, [query]);

  return matches;
}
