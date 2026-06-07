import { useEffect, useRef, useState, type RefObject } from "react";

/**
 * Returns a ref and a one-way "has entered the viewport" flag. Used to defer
 * loading heavy, below-the-fold widgets (e.g. a Leaflet map) until the user
 * scrolls near them. `rootMargin` pre-arms slightly before the element is
 * actually visible so the content is ready by the time it scrolls in.
 */
export function useInView<T extends Element>(
  rootMargin = "200px",
): [RefObject<T>, boolean] {
  const ref = useRef<T>(null);
  const [inView, setInView] = useState(false);

  useEffect(() => {
    if (inView) return;
    const el = ref.current;
    if (!el) return;
    // No IntersectionObserver (old browser / SSR safety) → just show it.
    if (typeof IntersectionObserver === "undefined") {
      setInView(true);
      return;
    }
    const obs = new IntersectionObserver(
      (entries) => {
        if (entries.some((e) => e.isIntersecting)) {
          setInView(true);
          obs.disconnect();
        }
      },
      { rootMargin },
    );
    obs.observe(el);
    return () => obs.disconnect();
  }, [inView, rootMargin]);

  return [ref, inView];
}
