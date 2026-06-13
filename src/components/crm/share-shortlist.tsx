"use client";

import { useState } from "react";

/** Copy / WhatsApp-send the public shortlist link (/s/<signed-token>). */
export function ShareShortlist({
  url,
  phone,
  count,
}: {
  url: string;
  phone?: string | null;
  count: number;
}) {
  const [copied, setCopied] = useState(false);
  const digits = (phone ?? "").replace(/\D/g, "");
  const waText = encodeURIComponent(`Here is your personal property selection:\n${url}`);

  return (
    <div className="flex flex-wrap items-center gap-2">
      <button
        type="button"
        onClick={async () => {
          try {
            await navigator.clipboard.writeText(url);
            setCopied(true);
            setTimeout(() => setCopied(false), 1500);
          } catch {
            /* clipboard denied — ничего страшного */
          }
        }}
        className="rounded-full bg-brass-500/10 px-3 py-1.5 text-sm font-medium text-brass-700 hover:bg-brass-500/20"
      >
        {copied ? "✓ Скопировано" : `🔗 Ссылка на подборку (${count})`}
      </button>
      {digits && (
        <a
          href={`https://wa.me/${digits}?text=${waText}`}
          target="_blank"
          rel="noreferrer"
          className="rounded-full bg-emerald-500/10 px-3 py-1.5 text-sm font-medium text-emerald-700 hover:bg-emerald-500/20"
        >
          WA →
        </a>
      )}
    </div>
  );
}
