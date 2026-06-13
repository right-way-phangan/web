/**
 * Anonymous visitor id (vid) — a random token in localStorage, no personal data
 * and no cross-site identity. Lets the backend count UNIQUE viewers (10 views by
 * 1 person ≠ 10 people) and spot cross-shopping (one vid viewing several
 * objects). Safe to lose; regenerated if cleared.
 */
const KEY = "rw_vid";

export function getVid(): string | undefined {
  if (typeof window === "undefined") return undefined;
  try {
    let v = window.localStorage.getItem(KEY);
    if (!v) {
      v =
        (crypto?.randomUUID?.() ??
          `${Date.now().toString(36)}${Math.random().toString(36).slice(2, 10)}`).slice(0, 36);
      window.localStorage.setItem(KEY, v);
    }
    return v;
  } catch {
    return undefined; // private mode / storage blocked — uniques degrade to nothing
  }
}
