"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useState,
} from "react";

const STORAGE_KEY = "rw:saved";

interface SavedContextValue {
  saved: string[]; // RW numbers, newest first
  isSaved: (rw: string) => boolean;
  toggle: (rw: string) => void;
  remove: (rw: string) => void;
  clear: () => void;
  /** false until localStorage has been read — lets UI avoid a saved-state flash. */
  ready: boolean;
}

const SavedContext = createContext<SavedContextValue | null>(null);

/**
 * Client-side shortlist of listings (RW numbers) persisted to localStorage.
 * No account needed — survives reloads and syncs across tabs.
 */
export function SavedProvider({ children }: { children: React.ReactNode }) {
  const [saved, setSaved] = useState<string[]>([]);
  const [ready, setReady] = useState(false);

  // Hydrate from localStorage once on mount.
  useEffect(() => {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (raw) {
        const parsed = JSON.parse(raw);
        if (Array.isArray(parsed)) setSaved(parsed.filter((x) => typeof x === "string"));
      }
    } catch {
      /* ignore corrupt storage */
    }
    setReady(true);
  }, []);

  // Persist after each change (skip the pre-hydration render).
  useEffect(() => {
    if (!ready) return;
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(saved));
    } catch {
      /* quota / private mode — non-fatal */
    }
  }, [saved, ready]);

  // Cross-tab sync.
  useEffect(() => {
    const onStorage = (e: StorageEvent) => {
      if (e.key !== STORAGE_KEY) return;
      try {
        setSaved(e.newValue ? JSON.parse(e.newValue) : []);
      } catch {
        /* ignore */
      }
    };
    window.addEventListener("storage", onStorage);
    return () => window.removeEventListener("storage", onStorage);
  }, []);

  const isSaved = useCallback((rw: string) => saved.includes(rw), [saved]);
  const toggle = useCallback(
    (rw: string) =>
      setSaved((s) => (s.includes(rw) ? s.filter((x) => x !== rw) : [rw, ...s])),
    [],
  );
  const remove = useCallback((rw: string) => setSaved((s) => s.filter((x) => x !== rw)), []);
  const clear = useCallback(() => setSaved([]), []);

  return (
    <SavedContext.Provider value={{ saved, isSaved, toggle, remove, clear, ready }}>
      {children}
    </SavedContext.Provider>
  );
}

export function useSaved(): SavedContextValue {
  const ctx = useContext(SavedContext);
  if (!ctx) throw new Error("useSaved must be used within <SavedProvider>");
  return ctx;
}
