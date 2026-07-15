"use client";

import { useEffect, useRef, useState } from "react";
import { cn } from "@/lib/utils/cn";

export interface NavItem {
  id: string;
  label: string;
}

/**
 * Sticky section navigation for the project landing — Atmos-style. Scroll-spies
 * the section anchors via IntersectionObserver and smooth-scrolls on click,
 * compensating for the sticky site header + this bar so headings aren't hidden.
 */
export function ProjectNav({
  items,
  ctaLabel,
  availabilityNote,
  ariaLabel = "Project sections",
  ctaHref = "enquire",
}: {
  items: NavItem[];
  ctaLabel?: string;
  availabilityNote?: string;
  /** Accessible name for the nav strip (defaults to the project-landing wording). */
  ariaLabel?: string;
  /** Section id the CTA button scrolls to (bare id, no "#"). */
  ctaHref?: string;
}) {
  const [active, setActive] = useState(items[0]?.id);
  const navRef = useRef<HTMLElement>(null);

  // Keep the active tab centered in the nav strip as the user scrolls (mobile
  // esp.). Scroll ONLY the horizontal strip — never el.scrollIntoView(), which
  // also scrolls the window vertically and fought the user's scroll on mobile
  // (page jitter / couldn't reach the bottom of a long project landing).
  useEffect(() => {
    if (!active) return;
    const nav = navRef.current;
    const el = nav?.querySelector<HTMLElement>(`[data-nav-id="${active}"]`);
    if (!nav || !el) return;
    const navRect = nav.getBoundingClientRect();
    const elRect = el.getBoundingClientRect();
    const delta =
      elRect.left + elRect.width / 2 - (navRect.left + navRect.width / 2);
    nav.scrollBy({ left: delta, behavior: "smooth" });
  }, [active]);

  useEffect(() => {
    const sections = items
      .map((i) => document.getElementById(i.id))
      .filter((el): el is HTMLElement => el != null);
    if (sections.length === 0) return;

    const observer = new IntersectionObserver(
      (entries) => {
        const visible = entries
          .filter((e) => e.isIntersecting)
          .sort((a, b) => b.intersectionRatio - a.intersectionRatio);
        if (visible[0]) setActive(visible[0].target.id);
      },
      // Top margin pushes the trigger line below the sticky chrome.
      { rootMargin: "-128px 0px -55% 0px", threshold: [0, 0.25, 0.5] },
    );
    sections.forEach((s) => observer.observe(s));
    return () => observer.disconnect();
  }, [items]);

  const onClick = (e: React.MouseEvent, id: string) => {
    e.preventDefault();
    const el = document.getElementById(id);
    if (!el) return;
    const top = el.getBoundingClientRect().top + window.scrollY - 120;
    window.scrollTo({ top, behavior: "smooth" });
    history.replaceState(null, "", `#${id}`);
  };

  return (
    <div className="sticky top-16 z-30 -mx-4 border-b border-forest-500/10 bg-cream-100/85 shadow-[0_10px_30px_-26px_rgba(4,38,46,0.6)] backdrop-blur-md md:top-20">
      <div className="container-prose flex items-center gap-2 px-4">
        <nav
          ref={navRef}
          aria-label={ariaLabel}
          className="flex flex-1 gap-1 overflow-x-auto py-2 [mask-image:linear-gradient(to_right,transparent,black_1rem,black_calc(100%-1.5rem),transparent)] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
        >
          {items.map((item) => (
            <a
              key={item.id}
              data-nav-id={item.id}
              href={`#${item.id}`}
              onClick={(e) => onClick(e, item.id)}
              className={cn(
                "whitespace-nowrap rounded-sm px-3 py-1.5 text-sm transition-colors",
                active === item.id
                  ? "bg-forest-500/10 font-medium text-forest-900"
                  : "text-forest-500/70 hover:text-brass-500",
              )}
            >
              {item.label}
            </a>
          ))}
        </nav>
        {availabilityNote ? (
          <span className="hidden shrink-0 items-center gap-1.5 text-xs text-forest-500/70 lg:inline-flex">
            <span className="h-1.5 w-1.5 rounded-full bg-brass-500" />
            {availabilityNote}
          </span>
        ) : null}
        {ctaLabel ? (
          <a
            href={`#${ctaHref}`}
            onClick={(e) => onClick(e, ctaHref)}
            className="hidden shrink-0 items-center rounded-sm bg-panel px-4 py-1.5 text-sm font-medium text-panel-fg transition-colors hover:bg-panel/90 lg:inline-flex"
          >
            {ctaLabel}
          </a>
        ) : null}
      </div>
    </div>
  );
}
