/** prefers-reduced-motion на клиенте; на сервере всегда false (SSR-разметка одна). */
export function prefersReducedMotion(): boolean {
  return (
    typeof window !== "undefined" &&
    !!window.matchMedia?.("(prefers-reduced-motion: reduce)").matches
  );
}
