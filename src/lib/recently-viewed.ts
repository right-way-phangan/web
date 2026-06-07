"use client";

const KEY = "rw:recent";
const MAX = 12;

/** Read the recently-viewed RW numbers (most recent first). */
export function getRecentlyViewed(): string[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = localStorage.getItem(KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed.filter((x) => typeof x === "string") : [];
  } catch {
    return [];
  }
}

/** Record a view: move `rw` to the front, de-dupe, cap the list. */
export function recordView(rw: string): void {
  if (typeof window === "undefined" || !rw) return;
  try {
    const list = [rw, ...getRecentlyViewed().filter((x) => x !== rw)].slice(0, MAX);
    localStorage.setItem(KEY, JSON.stringify(list));
  } catch {
    /* quota / private mode — non-fatal */
  }
}
