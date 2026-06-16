"use client";

import { useRef, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import type { Route } from "next";
import { Sparkles, ArrowRight } from "lucide-react";
import { track } from "@vercel/analytics";
import { runNlSearch } from "@/lib/actions/search";
import { useLocale, localeHref } from "@/lib/i18n/use-locale";
import { getListingsDict } from "@/lib/i18n/dictionaries";

/**
 * Natural-language search box for /listings. Submits the phrase to a server
 * action that maps it to filter params, then navigates to the filtered list.
 */
export function NlSearch({ initialQuery = "" }: { initialQuery?: string }) {
  const router = useRouter();
  const locale = useLocale();
  const t = getListingsDict(locale);
  const [value, setValue] = useState(initialQuery);
  const [interpreted, setInterpreted] = useState<string[] | null>(null);
  const [noMatch, setNoMatch] = useState(false);
  const [pending, startTransition] = useTransition();
  const inputRef = useRef<HTMLInputElement>(null);

  function submit(text: string) {
    const q = text.trim();
    if (!q) return;
    startTransition(async () => {
      const res = await runNlSearch(q, locale);
      setInterpreted(res.interpreted);
      setNoMatch(!res.matched);
      track("nl_search", { q, matched: res.matched });
      // runNlSearch returns an EN "/listings?…" href; keep the visitor in /ru.
      const href = res.href.startsWith("/listings")
        ? localeHref(locale, res.href)
        : res.href;
      router.push(href as Route, { scroll: false });
    });
  }

  return (
    <div className="rounded-sm border border-forest-500/15 bg-cream-50 p-4 md:p-5">
      <form
        onSubmit={(e) => {
          e.preventDefault();
          submit(value);
        }}
        className="flex flex-col gap-2 sm:flex-row sm:items-center"
      >
        <div className="flex flex-1 items-center gap-2.5 rounded-sm border border-forest-500/20 bg-cream-100 px-3 py-2.5 focus-within:border-brass-500/50">
          <Sparkles className="h-4 w-4 shrink-0 text-brass-500" />
          <input
            ref={inputRef}
            type="text"
            value={value}
            onChange={(e) => setValue(e.target.value)}
            placeholder={t.nlPlaceholder}
            className="w-full bg-transparent text-sm text-forest-900 placeholder:text-forest-500/45 focus:outline-none"
            aria-label={t.nlPlaceholder}
          />
        </div>
        <button
          type="submit"
          disabled={pending || !value.trim()}
          className="inline-flex items-center justify-center gap-1.5 rounded-sm bg-panel px-5 py-2.5 text-sm font-medium text-panel-fg transition-colors hover:bg-forest-400 disabled:opacity-50"
        >
          {pending ? t.nlSearching : t.nlSearch}
          {!pending ? <ArrowRight className="h-4 w-4" /> : null}
        </button>
      </form>

      {interpreted && interpreted.length > 0 ? (
        <div className="mt-3 flex flex-wrap items-center gap-1.5 text-xs">
          <span className="text-forest-500/70">{t.nlInterpreted}</span>
          {interpreted.map((chip) => (
            <span
              key={chip}
              className="rounded-sm bg-forest-500/10 px-2 py-0.5 text-forest-500"
            >
              {chip}
            </span>
          ))}
        </div>
      ) : noMatch ? (
        <p className="mt-3 text-xs text-forest-500/70">{t.nlNoMatch}</p>
      ) : (
        <div className="mt-3 flex flex-wrap items-center gap-1.5 text-xs text-forest-500/55">
          <span>{t.nlTry}</span>
          {t.nlExamples.map((ex) => (
            <button
              key={ex}
              type="button"
              onClick={() => {
                setValue(ex);
                submit(ex);
              }}
              className="rounded-sm border border-forest-500/15 px-2 py-0.5 transition-colors hover:border-brass-500/40 hover:text-forest-500"
            >
              {ex}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
