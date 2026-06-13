"use client";

import { useEffect, useState } from "react";
import type { GuideHeading } from "@/lib/data/guide";

/**
 * Оглавление внутри страницы справочника (h2/h3) с подсветкой текущей секции
 * при прокрутке (scrollspy через IntersectionObserver). Видно только на xl —
 * на узких экранах его роль выполняют навигация по страницам и сворачиваемое
 * оглавление справочника.
 */
export function GuideToc({ headings }: { headings: GuideHeading[] }) {
  const [activeId, setActiveId] = useState<string>("");

  useEffect(() => {
    if (headings.length === 0) return;
    const els = headings
      .map((h) => document.getElementById(h.id))
      .filter((el): el is HTMLElement => el !== null);
    if (els.length === 0) return;

    const obs = new IntersectionObserver(
      (entries) => {
        const visible = entries
          .filter((e) => e.isIntersecting)
          .sort((a, b) => a.boundingClientRect.top - b.boundingClientRect.top);
        if (visible[0]) setActiveId(visible[0].target.id);
      },
      // Верхняя треть вьюпорта — «активная» зона чтения.
      { rootMargin: "-80px 0px -66% 0px", threshold: 0 },
    );
    els.forEach((el) => obs.observe(el));
    return () => obs.disconnect();
  }, [headings]);

  if (headings.length < 2) return null;

  return (
    <aside className="hidden xl:block">
      <div className="sticky top-6">
        <p className="mb-2 text-[11px] font-semibold uppercase tracking-[0.15em] text-forest-900/40">
          На этой странице
        </p>
        <ul className="space-y-1 border-l border-forest-900/10">
          {headings.map((h) => {
            const on = h.id === activeId;
            return (
              <li key={h.id}>
                <a
                  href={`#${h.id}`}
                  className={
                    "-ml-px block border-l-2 py-0.5 text-sm transition " +
                    (h.level === 3 ? "pl-5" : "pl-3") +
                    " " +
                    (on
                      ? "border-brass-500 font-medium text-forest-900"
                      : "border-transparent text-forest-900/55 hover:text-forest-900")
                  }
                >
                  {h.text}
                </a>
              </li>
            );
          })}
        </ul>
      </div>
    </aside>
  );
}
