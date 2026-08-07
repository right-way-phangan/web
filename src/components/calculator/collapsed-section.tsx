"use client";

import { useEffect, useId, useState } from "react";
import { ChevronDown } from "lucide-react";

/**
 * A secondary block folded away by default so the page leads with one calculator
 * instead of stacking several. The header is the site's eyebrow + serif rhythm;
 * the body mounts only when open. Opens itself when the URL hash points at it
 * (e.g. a "build on a plot" link that scrolls here and expands).
 */
export function CollapsedSection({
  id,
  eyebrow,
  title,
  lede,
  defaultOpen = false,
  children,
}: {
  id: string;
  eyebrow?: string;
  title: string;
  lede?: string;
  defaultOpen?: boolean;
  children: React.ReactNode;
}) {
  const [open, setOpen] = useState(defaultOpen);
  const panelId = useId();

  useEffect(() => {
    if (typeof window !== "undefined" && window.location.hash === `#${id}`) setOpen(true);
  }, [id]);

  return (
    <section id={id} className="mt-16 border-t border-forest-500/10 pt-8 md:mt-20 md:pt-10">
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        aria-expanded={open}
        aria-controls={panelId}
        className="group flex w-full items-start justify-between gap-4 text-left"
      >
        <span>
          {/* SectionEyebrow рендерит <p> — внутри кнопки нельзя, поэтому
              стили продублированы на span. */}
          {eyebrow ? (
            <span className="block text-[0.8125rem] font-medium uppercase tracking-eyebrow text-brass-700">
              {eyebrow}
            </span>
          ) : null}
          <span className="mt-3 block font-serif text-2xl text-forest-900 md:text-3xl">{title}</span>
          {lede ? <span className="mt-2 block max-w-xl text-forest-500/80">{lede}</span> : null}
        </span>
        <ChevronDown
          className={`mt-1 h-5 w-5 flex-none text-forest-500/60 transition-transform duration-300 group-hover:text-brass-600 ${
            open ? "rotate-180" : ""
          }`}
          aria-hidden
        />
      </button>
      {open ? (
        <div id={panelId} className="mt-8">
          {children}
        </div>
      ) : null}
    </section>
  );
}
