"use client";

import { useState } from "react";
import Link from "next/link";
import type { Route } from "next";
import { Search, X, BellRing, Check } from "lucide-react";
import { useSavedSearches } from "@/lib/saved/saved-searches";
import { LeadForm } from "@/components/forms/lead-form";

/**
 * Saved searches on the /saved page: the filter sets a visitor chose to keep.
 * They can revisit one, drop it, or ask us to alert them when a new listing
 * matches — that request becomes a tagged amoCRM lead + a Telegram ping to the
 * team (no email service needed). Until per-user delivery exists, the team
 * reaches back out; the nightly diff script surfaces fresh matches.
 */
export function SavedSearches() {
  const { searches, ready, remove } = useSavedSearches();
  const [notifyOpen, setNotifyOpen] = useState(false);

  // Pre-hydration or genuinely empty — render nothing (the page's shortlist
  // section carries the empty state).
  if (!ready || searches.length === 0) return null;

  // The trailing [/listings?…] keeps the exact criteria machine-readable so the
  // nightly alert script can match new listings — and clickable for the agent.
  const brief = [
    "Please alert me when a new listing matches any of these saved searches:",
    ...searches.map(
      (s, i) => `${i + 1}. ${s.label}  [/listings${s.query ? `?${s.query}` : ""}]`,
    ),
  ].join("\n");

  return (
    <div className="mt-16 border-t border-forest-500/10 pt-12">
      <div className="flex items-center gap-2">
        <Search className="h-5 w-5 text-brass-500" />
        <h2 className="font-serif text-2xl text-forest-900">Saved searches</h2>
      </div>
      <p className="mt-2 max-w-xl text-sm text-forest-500/70">
        Jump back into a search, or ask us to flag new listings that fit.
      </p>

      <ul className="mt-6 divide-y divide-forest-500/10 rounded-sm border border-forest-500/10 bg-cream-50">
        {searches.map((s) => (
          <li key={s.id} className="flex items-center gap-3 px-4 py-3">
            <Link
              href={(`/listings${s.query ? `?${s.query}` : ""}`) as Route}
              className="min-w-0 flex-1 truncate text-sm font-medium text-forest-900 underline-offset-2 hover:text-brass-500 hover:underline"
            >
              {s.label}
            </Link>
            <button
              type="button"
              onClick={() => remove(s.id)}
              aria-label={`Remove saved search: ${s.label}`}
              className="shrink-0 rounded-sm p-1 text-forest-500/50 hover:bg-forest-500/5 hover:text-forest-500"
            >
              <X className="h-4 w-4" />
            </button>
          </li>
        ))}
      </ul>

      {notifyOpen ? (
        <div className="mt-6 rounded-sm border border-forest-500/15 bg-cream-50 p-5 md:p-6">
          <h3 className="font-serif text-lg text-forest-900">
            Alert me about new matches
          </h3>
          <p className="mt-1 mb-4 text-sm text-forest-500/70">
            We&rsquo;ll reach out as soon as a new listing fits — including
            off-market ones before they go public.
          </p>
          <LeadForm
            source="contact"
            kind="saved-search"
            defaultMessage={brief}
            layout="block"
            submitLabel="Set up my alerts"
          />
        </div>
      ) : (
        <button
          type="button"
          onClick={() => setNotifyOpen(true)}
          className="mt-5 inline-flex items-center gap-2 rounded-sm bg-forest-500 px-5 py-2.5 text-sm font-medium text-cream-100 transition-colors hover:bg-forest-400"
        >
          <BellRing className="h-4 w-4" />
          Alert me about new matches
        </button>
      )}

      <p className="mt-3 flex items-center gap-1.5 text-[11px] text-forest-500/45">
        <Check className="h-3 w-3" />
        Saved on this device. No account needed.
      </p>
    </div>
  );
}
