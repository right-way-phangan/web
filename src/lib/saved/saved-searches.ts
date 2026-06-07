"use client";

import { useCallback, useEffect, useState } from "react";

const STORAGE_KEY = "rw:saved-searches";
const MAX = 12;

export interface SavedSearch {
  id: string;
  /** Human label, e.g. "Land in Sri Thanu · up to ฿20M". */
  label: string;
  /** Query string portion of the /listings URL, without leading "?". */
  query: string;
  createdAt: number;
}

function read(): SavedSearch[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    if (!Array.isArray(parsed)) return [];
    return parsed.filter(
      (s): s is SavedSearch =>
        s && typeof s.id === "string" && typeof s.label === "string" && typeof s.query === "string",
    );
  } catch {
    return [];
  }
}

/**
 * Persisted list of saved searches (filter URLs) in localStorage — no account
 * needed. A saved search is identified by its query string, so saving the same
 * filter set twice is a no-op. Mirrors the shortlist's storage pattern.
 */
export function useSavedSearches() {
  const [searches, setSearches] = useState<SavedSearch[]>([]);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    setSearches(read());
    setReady(true);
  }, []);

  useEffect(() => {
    if (!ready) return;
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(searches));
    } catch {
      /* quota / private mode — non-fatal */
    }
  }, [searches, ready]);

  useEffect(() => {
    const onStorage = (e: StorageEvent) => {
      if (e.key === STORAGE_KEY) setSearches(read());
    };
    window.addEventListener("storage", onStorage);
    return () => window.removeEventListener("storage", onStorage);
  }, []);

  const has = useCallback(
    (query: string) => searches.some((s) => s.query === query),
    [searches],
  );

  const save = useCallback((label: string, query: string) => {
    setSearches((list) => {
      if (list.some((s) => s.query === query)) return list;
      const next: SavedSearch = {
        id: `${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 7)}`,
        label,
        query,
        createdAt: Date.now(),
      };
      return [next, ...list].slice(0, MAX);
    });
  }, []);

  const remove = useCallback(
    (id: string) => setSearches((list) => list.filter((s) => s.id !== id)),
    [],
  );

  const clear = useCallback(() => setSearches([]), []);

  return { searches, ready, has, save, remove, clear };
}
