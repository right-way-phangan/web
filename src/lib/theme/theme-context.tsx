"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useState,
  type ReactNode,
} from "react";

// Lightweight theme controller (no next-themes dependency — keeps the shared
// node_modules clean and gives full control over the anti-flash path). The
// inline ThemeScript sets the `.dark` class on <html> before first paint; this
// provider only mirrors that state into React for the toggle's icon and lets
// the user override the system preference, persisting the choice.

export type Theme = "light" | "dark" | "system";
type Resolved = "light" | "dark";

const STORAGE_KEY = "theme";

interface ThemeCtx {
  theme: Theme;
  resolved: Resolved;
  mounted: boolean;
  setTheme: (t: Theme) => void;
  toggle: () => void;
}

const ThemeContext = createContext<ThemeCtx | null>(null);

function systemPref(): Resolved {
  return typeof window !== "undefined" &&
    window.matchMedia("(prefers-color-scheme: dark)").matches
    ? "dark"
    : "light";
}

function apply(resolved: Resolved) {
  const cls = document.documentElement.classList;
  if (resolved === "dark") cls.add("dark");
  else cls.remove("dark");
}

// Дефолт — тёмная (решение 2026-08-06). Графит с золотом — сильнейшая версия
// бренда: фотографии острова и карточки каталога в нём звучат заметно лучше,
// чем на песке. Явный выбор посетителя всегда побеждает и запоминается, режим
// «system» остаётся в переключателе для тех, кому нужна привязка к ОС.
const DEFAULT_THEME: Theme = "dark";

function readStored(): Theme {
  try {
    const s = localStorage.getItem(STORAGE_KEY);
    if (s === "light" || s === "dark" || s === "system") return s;
  } catch {
    /* private mode / blocked storage — fall back to the default */
  }
  return DEFAULT_THEME;
}

export function ThemeProvider({ children }: { children: ReactNode }) {
  const [theme, setThemeState] = useState<Theme>(DEFAULT_THEME);
  const [resolved, setResolved] = useState<Resolved>("dark");
  const [mounted, setMounted] = useState(false);

  // Hydrate from storage once on mount (matches what ThemeScript already did to
  // the DOM, so no visual change — we just learn the value).
  useEffect(() => {
    const stored = readStored();
    const r = stored === "system" ? systemPref() : stored;
    setThemeState(stored);
    setResolved(r);
    apply(r);
    setMounted(true);
  }, []);

  // Follow the OS while in "system" mode.
  useEffect(() => {
    if (theme !== "system") return;
    const mq = window.matchMedia("(prefers-color-scheme: dark)");
    const onChange = () => {
      const r: Resolved = mq.matches ? "dark" : "light";
      setResolved(r);
      apply(r);
    };
    mq.addEventListener("change", onChange);
    return () => mq.removeEventListener("change", onChange);
  }, [theme]);

  const setTheme = useCallback((t: Theme) => {
    setThemeState(t);
    try {
      localStorage.setItem(STORAGE_KEY, t);
    } catch {
      /* ignore */
    }
    const r = t === "system" ? systemPref() : t;
    setResolved(r);
    apply(r);
  }, []);

  const toggle = useCallback(() => {
    setTheme(resolved === "dark" ? "light" : "dark");
  }, [resolved, setTheme]);

  return (
    <ThemeContext.Provider value={{ theme, resolved, mounted, setTheme, toggle }}>
      {children}
    </ThemeContext.Provider>
  );
}

export function useTheme(): ThemeCtx {
  const ctx = useContext(ThemeContext);
  if (!ctx) {
    // Defensive: never throw in render if a stray consumer mounts outside the
    // provider — return inert values matching the default theme.
    return {
      theme: DEFAULT_THEME,
      resolved: "dark",
      mounted: false,
      setTheme: () => {},
      toggle: () => {},
    };
  }
  return ctx;
}

/**
 * Synchronous, render-blocking script that applies the persisted (or system)
 * theme to <html> before the body paints — no light-mode flash on dark
 * visitors. Must be the first node in <body>. <html> carries
 * suppressHydrationWarning because this mutates its className pre-hydration.
 */
export function ThemeScript() {
  // e === 'system' → по системе; 'light'/'dark' → как выбрали; ничего не
  // сохранено → тёмная (дефолт, см. DEFAULT_THEME). Логика обязана совпадать
  // с readStored(), иначе первый кадр разойдётся с состоянием провайдера.
  const js = `(function(){try{var e=localStorage.getItem('${STORAGE_KEY}');var m=window.matchMedia('(prefers-color-scheme:dark)').matches;var d=e==='system'?m:(e?e==='dark':true);var c=document.documentElement.classList;if(d)c.add('dark');else c.remove('dark');}catch(_){c=document.documentElement.classList;c.add('dark');}})();`;
  return <script dangerouslySetInnerHTML={{ __html: js }} />;
}
