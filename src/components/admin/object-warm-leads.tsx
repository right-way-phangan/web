"use client";

import Link from "next/link";
import { useState } from "react";

export interface WarmLeadRow {
  id: number;
  name: string;
  phone: string | null;
  stage: string | null;
  score: number;
  reasons: string[];
}

/**
 * Warm-leads list for one object — the "who to call about this listing" panel.
 * Lets the agent copy all phones at once to start dialing.
 */
export function ObjectWarmLeads({ leads }: { leads: WarmLeadRow[] }) {
  const [copied, setCopied] = useState(false);
  const phones = leads.map((l) => l.phone).filter(Boolean) as string[];

  if (leads.length === 0) {
    return (
      <p className="text-sm text-forest-900/50">
        Подходящих открытых лидов нет. Появятся, когда заведёте лида с интересом к этому типу/району.
      </p>
    );
  }

  return (
    <div>
      {phones.length > 0 && (
        <button
          type="button"
          onClick={async () => {
            try {
              await navigator.clipboard.writeText(phones.join(", "));
              setCopied(true);
              setTimeout(() => setCopied(false), 1500);
            } catch {
              /* clipboard denied */
            }
          }}
          className="mb-3 rounded-full bg-brass-500/10 px-3 py-1.5 text-sm font-medium text-brass-700 hover:bg-brass-500/20"
        >
          {copied ? "✓ Скопировано" : `📋 Скопировать ${phones.length} телефон(ов)`}
        </button>
      )}
      <ul className="space-y-1.5">
        {leads.map((l) => (
          <li
            key={l.id}
            className="flex flex-wrap items-center gap-x-3 gap-y-1 rounded-lg border border-forest-900/10 bg-cream-50 px-3 py-2 text-sm"
          >
            <Link
              href={{ pathname: `/admin/crm/${l.id}` }}
              className="min-w-0 flex-1 truncate font-medium text-forest-900 hover:text-brass-700"
            >
              {l.name}
            </Link>
            {l.stage && (
              <span className="shrink-0 rounded-full bg-forest-900/5 px-2 py-0.5 text-xs text-forest-900/55">
                {l.stage}
              </span>
            )}
            {l.reasons.length > 0 && (
              <span className="shrink-0 text-xs text-forest-900/45">{l.reasons.join(" · ")}</span>
            )}
            {l.phone && (
              <a
                href={`tel:${l.phone}`}
                className="shrink-0 text-xs font-medium text-brass-600 hover:underline"
              >
                📞 {l.phone}
              </a>
            )}
          </li>
        ))}
      </ul>
    </div>
  );
}
