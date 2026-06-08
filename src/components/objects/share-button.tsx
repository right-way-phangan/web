"use client";

import { useState } from "react";
import { Share2, Check } from "lucide-react";
import { track } from "@vercel/analytics";
import { useLocale } from "@/lib/i18n/use-locale";
import { getObjectDict } from "@/lib/i18n/dictionaries";
import { cn } from "@/lib/utils/cn";

/**
 * Share the current listing. Uses the native share sheet where available
 * (mobile), falling back to copying the link to the clipboard on desktop.
 */
export function ShareButton({
  rw,
  title,
  className,
}: {
  rw: string;
  title?: string;
  className?: string;
}) {
  const [copied, setCopied] = useState(false);
  const t = getObjectDict(useLocale());

  async function onShare(e: React.MouseEvent) {
    e.preventDefault();
    e.stopPropagation();
    const url = typeof window !== "undefined" ? window.location.href : "";
    const shareTitle = title ? `${title} — ${rw}` : `Right Way listing ${rw}`;

    if (navigator.share) {
      try {
        await navigator.share({ title: shareTitle, url });
        track("share_listing", { rw, method: "native" });
      } catch {
        /* user cancelled — ignore */
      }
      return;
    }
    try {
      await navigator.clipboard.writeText(url);
      setCopied(true);
      track("share_listing", { rw, method: "copy" });
      setTimeout(() => setCopied(false), 1800);
    } catch {
      /* clipboard blocked — no-op */
    }
  }

  return (
    <button
      type="button"
      onClick={onShare}
      aria-label={t.shareAria}
      title={t.shareAria}
      className={cn(
        "inline-flex h-8 items-center justify-center gap-1.5 rounded-full border border-forest-500/20 px-3 text-xs font-medium text-forest-500 transition-colors hover:border-brass-500/40 hover:text-brass-500",
        className,
      )}
    >
      {copied ? <Check className="h-4 w-4 text-forest-500" /> : <Share2 className="h-4 w-4" />}
      {copied ? t.copied : t.share}
    </button>
  );
}
