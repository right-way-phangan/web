"use client";

import { Printer } from "lucide-react";
import { track } from "@vercel/analytics";
import { trackObjectEvent } from "@/lib/analytics/track-event";
import { useLocale } from "@/lib/i18n/use-locale";
import { getObjectDict } from "@/lib/i18n/dictionaries";
import { cn } from "@/lib/utils/cn";

/**
 * "Brochure (PDF)" — opens the print dialog over the print-optimized page
 * (@media print hides the chrome, PrintBrochure adds photos + contacts), so
 * "Save as PDF" yields a clean listing brochure with zero PDF dependencies.
 */
export function BrochureButton({ rw, className }: { rw: string; className?: string }) {
  const t = getObjectDict(useLocale());
  return (
    <button
      type="button"
      onClick={() => {
        track("brochure_print", { rw });
        trackObjectEvent("brochure", rw);
        // PrintBrochure's <BrochureMedia> (always mounted on the object page)
        // listens for this, preloads the photos — mounted only on demand to
        // spare the blob quota — then calls window.print().
        window.dispatchEvent(new CustomEvent("rw:brochure", { detail: { rw } }));
      }}
      aria-label={t.brochure}
      title={t.brochure}
      className={cn(
        "inline-flex h-8 items-center justify-center gap-1.5 rounded-full border border-forest-500/20 px-3 text-xs font-medium text-forest-500 transition-colors hover:border-brass-500/40 hover:text-brass-500",
        "hidden sm:inline-flex print:hidden",
        className,
      )}
    >
      <Printer className="h-4 w-4" />
      {t.brochure}
    </button>
  );
}
