"use client";

import { useEffect, useState } from "react";
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
export function ProjectNav({ items, ctaLabel }: { items: NavItem[]; ctaLabel?: string }) {
  const [active, setActive] = useState(items[0]?.id);

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
    <div className="sticky top-16 z-30 -mx-4 border-b border-forest-500/10 bg-cream-100/85 backdrop-blur-md md:top-20">
      <div className="container-prose flex items-center gap-2 px-4">
        <nav
          aria-label="Project sections"
          className="flex flex-1 gap-1 overflow-x-auto py-2 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
        >
          {items.map((item) => (
            <a
              key={item.id}
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
        {ctaLabel ? (
          <a
            href="#enquire"
            onClick={(e) => onClick(e, "enquire")}
            className="hidden shrink-0 items-center rounded-sm bg-forest-900 px-4 py-1.5 text-sm font-medium text-cream-50 transition-colors hover:bg-forest-900/90 lg:inline-flex"
          >
            {ctaLabel}
          </a>
        ) : null}
      </div>
    </div>
  );
}
