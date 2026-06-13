"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { usePathname, useRouter } from "next/navigation";

interface Hit {
  kind: "lead" | "object" | "page";
  title: string;
  subtitle?: string;
  href: string;
}

const KIND_ICON: Record<Hit["kind"], string> = { lead: "👤", object: "🏡", page: "📄" };

/**
 * Global admin search — ⌘K / Ctrl+K on desktop, the floating 🔍 button on the
 * phone PWA. Debounced server search (/admin/api/search) over leads, objects
 * and admin pages; arrows + Enter to navigate, Esc to close.
 */
export function CommandPalette() {
  const [open, setOpen] = useState(false);
  const [q, setQ] = useState("");
  const [hits, setHits] = useState<Hit[]>([]);
  const [sel, setSel] = useState(0);
  const [busy, setBusy] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === "k") {
        e.preventDefault();
        setOpen((v) => !v);
      }
      if (e.key === "Escape") setOpen(false);
    }
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);

  useEffect(() => {
    if (open) {
      setQ("");
      setHits([]);
      setSel(0);
      setTimeout(() => inputRef.current?.focus(), 30);
    }
  }, [open]);

  useEffect(() => {
    if (!open || q.trim().length < 2) {
      setHits([]);
      return;
    }
    setBusy(true);
    const ctl = new AbortController();
    const t = setTimeout(async () => {
      try {
        const r = await fetch(`/admin/api/search?q=${encodeURIComponent(q.trim())}`, {
          signal: ctl.signal,
        });
        if (r.ok) {
          const body = (await r.json()) as { hits: Hit[] };
          setHits(body.hits);
          setSel(0);
        }
      } catch {
        /* aborted or offline — keep previous list */
      } finally {
        setBusy(false);
      }
    }, 250);
    return () => {
      ctl.abort();
      clearTimeout(t);
    };
  }, [q, open]);

  const go = useCallback(
    (h: Hit | undefined) => {
      if (!h) return;
      setOpen(false);
      router.push(h.href as Parameters<typeof router.push>[0]);
    },
    [router],
  );

  if (pathname === "/admin/login") return null;

  return (
    <>
      {/* Floating opener — the only way in on a phone (PWA has no ⌘K). */}
      <button
        type="button"
        onClick={() => setOpen(true)}
        title="Поиск по админке (⌘K)"
        aria-label="Поиск по админке"
        className="fixed bottom-5 right-5 z-40 flex h-11 w-11 items-center justify-center rounded-full bg-forest-900 text-lg text-white shadow-lg hover:bg-forest-900/90"
      >
        🔍
      </button>

      {open && (
        <div
          className="fixed inset-0 z-50 flex items-start justify-center bg-forest-900/40 p-4 pt-[12vh]"
          onClick={() => setOpen(false)}
        >
          <div
            className="w-full max-w-lg overflow-hidden rounded-2xl bg-white shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          >
            <input
              ref={inputRef}
              value={q}
              onChange={(e) => setQ(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "ArrowDown") {
                  e.preventDefault();
                  setSel((s) => Math.min(s + 1, hits.length - 1));
                } else if (e.key === "ArrowUp") {
                  e.preventDefault();
                  setSel((s) => Math.max(s - 1, 0));
                } else if (e.key === "Enter") {
                  e.preventDefault();
                  go(hits[sel]);
                }
              }}
              placeholder="Лид, объект, телефон, RW-номер, страница…"
              className="w-full border-b border-forest-900/10 px-4 py-3 text-base outline-none"
            />
            <div className="max-h-[50vh] overflow-y-auto">
              {q.trim().length < 2 ? (
                <p className="px-4 py-6 text-sm text-forest-900/45">
                  Введите минимум 2 символа. Открытие: ⌘K / Ctrl+K или кнопка 🔍.
                </p>
              ) : hits.length === 0 ? (
                <p className="px-4 py-6 text-sm text-forest-900/45">
                  {busy ? "Ищу…" : "Ничего не нашлось."}
                </p>
              ) : (
                <ul>
                  {hits.map((h, i) => (
                    <li key={`${h.href}-${i}`}>
                      <button
                        type="button"
                        onClick={() => go(h)}
                        onMouseEnter={() => setSel(i)}
                        className={`flex w-full items-center gap-3 px-4 py-2.5 text-left text-sm ${
                          i === sel ? "bg-brass-500/10" : ""
                        }`}
                      >
                        <span className="shrink-0">{KIND_ICON[h.kind]}</span>
                        <span className="min-w-0 flex-1">
                          <span className="block truncate font-medium text-forest-900">
                            {h.title}
                          </span>
                          {h.subtitle && (
                            <span className="block truncate text-xs text-forest-900/50">
                              {h.subtitle}
                            </span>
                          )}
                        </span>
                        {i === sel && <span className="shrink-0 text-xs text-forest-900/35">⏎</span>}
                      </button>
                    </li>
                  ))}
                </ul>
              )}
            </div>
          </div>
        </div>
      )}
    </>
  );
}
