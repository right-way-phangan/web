"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { updateLeadTags } from "@/lib/actions/lead-meta";

export interface MatchItem {
  rwNumber: string;
  title: string;
  cover: string | null;
  priceLabel: string;
  district: string | null;
  inShortlist: boolean;
}

/**
 * "Что показать" — matched objects + the client's shortlist on the lead card.
 * Shortlist is stored as `object:RW-…` tags; the copy button produces a ready
 * WhatsApp/Telegram message with site links.
 */
export function LeadMatches({
  leadId,
  tags,
  matches,
  shortlist,
  contactName,
}: {
  leadId: number;
  tags: string[];
  matches: MatchItem[];
  shortlist: MatchItem[];
  contactName?: string | null;
}) {
  const [pending, start] = useTransition();
  const [copied, setCopied] = useState(false);
  const router = useRouter();

  function setShortlist(rw: string, add: boolean) {
    const next = add
      ? [...tags, `object:${rw}`]
      : tags.filter((t) => t !== `object:${rw}`);
    start(async () => {
      await updateLeadTags(leadId, next);
      router.refresh();
    });
  }

  function copySelection() {
    const items = shortlist.length > 0 ? shortlist : matches;
    const lines = items.map(
      (m) => `• ${m.title}${m.priceLabel ? ` — ${m.priceLabel}` : ""}\n  https://rightwaygroup.co/object/${m.rwNumber}`,
    );
    const text = `${contactName ? `${contactName}, ` : ""}here is a selection for you:\n\n${lines.join("\n\n")}\n\n— Right Way Phangan`;
    navigator.clipboard.writeText(text).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 1500);
    });
  }

  function Card({ m }: { m: MatchItem }) {
    return (
      <div className="flex items-center gap-2 rounded-lg border border-forest-900/10 bg-cream-50 p-2">
        <span className="h-12 w-16 shrink-0 overflow-hidden rounded bg-forest-900/5">
          {m.cover ? (
            // eslint-disable-next-line @next/next/no-img-element -- admin thumb
            <img src={m.cover} alt="" className="h-full w-full object-cover" loading="lazy" />
          ) : null}
        </span>
        <span className="min-w-0 flex-1">
          <a
            href={`/object/${m.rwNumber}`}
            target="_blank"
            rel="noreferrer"
            className="block truncate text-xs font-medium text-forest-900 hover:text-brass-600"
          >
            {m.title}
          </a>
          <span className="block text-[11px] text-forest-900/55">
            {[m.rwNumber, m.district, m.priceLabel].filter(Boolean).join(" · ")}
          </span>
        </span>
        <button
          type="button"
          disabled={pending}
          onClick={() => setShortlist(m.rwNumber, !m.inShortlist)}
          title={m.inShortlist ? "Убрать из шортлиста" : "В шортлист"}
          className={
            "shrink-0 rounded-md px-2 py-1 text-xs font-medium disabled:opacity-40 " +
            (m.inShortlist
              ? "bg-brass-500/15 text-brass-600 hover:bg-brass-500/25"
              : "bg-forest-900/5 text-forest-900/60 hover:bg-forest-900/10")
          }
        >
          {m.inShortlist ? "★" : "+"}
        </button>
      </div>
    );
  }

  if (matches.length === 0 && shortlist.length === 0) return null;

  return (
    <div>
      <div className="mb-2 flex items-center justify-between">
        <h2 className="text-sm font-semibold uppercase tracking-wide text-forest-900/70">
          Что показать
        </h2>
        <button
          type="button"
          onClick={copySelection}
          className="rounded-full border border-forest-900/15 px-3 py-1 text-xs font-medium text-forest-900/70 hover:bg-forest-900/5"
        >
          {copied ? "✓ Скопировано" : `📋 Скопировать подборку${shortlist.length ? ` (${shortlist.length})` : ""}`}
        </button>
      </div>
      {shortlist.length > 0 && (
        <>
          <p className="mb-1 text-[11px] uppercase tracking-wide text-forest-900/40">
            Шортлист клиента
          </p>
          <div className="mb-3 grid gap-1.5 sm:grid-cols-2">
            {shortlist.map((m) => (
              <Card key={m.rwNumber} m={m} />
            ))}
          </div>
        </>
      )}
      {matches.length > 0 && (
        <>
          <p className="mb-1 text-[11px] uppercase tracking-wide text-forest-900/40">
            Подходит по запросу
          </p>
          <div className="grid gap-1.5 sm:grid-cols-2">
            {matches.map((m) => (
              <Card key={m.rwNumber} m={m} />
            ))}
          </div>
        </>
      )}
    </div>
  );
}
