"use client";

import { useEffect, useState } from "react";
import { ArrowRight } from "lucide-react";
import { cn } from "@/lib/utils/cn";

export interface NavSection {
  id: string;
  label: string;
}

interface Props {
  sections: NavSection[];
  enquireLabel: string;
  /** «свободно N» — короткая сводка справа от навигации. */
  availabilityLabel?: string;
}

/**
 * Липкая навигация по странице подборки: чипы-якоря на секции (План / Участки /
 * Фото / Карта) с подсветкой активной по мере прокрутки (scroll-spy через
 * IntersectionObserver) и кнопкой «Запросить». Прячется при печати; плавный
 * скролл с учётом высоты хедера. SSR-safe: до гидрации просто ссылки.
 */
export function EstateSectionNav({ sections, enquireLabel, availabilityLabel }: Props) {
  const [active, setActive] = useState<string>(sections[0]?.id ?? "");

  useEffect(() => {
    const ids = [...sections.map((s) => s.id), "enquire"];
    const els = ids
      .map((id) => document.getElementById(id))
      .filter((el): el is HTMLElement => Boolean(el));
    if (els.length === 0) return;

    const obs = new IntersectionObserver(
      (entries) => {
        const vis = entries
          .filter((e) => e.isIntersecting)
          .sort((a, b) => a.boundingClientRect.top - b.boundingClientRect.top);
        if (vis[0]) setActive(vis[0].target.id);
      },
      // верхняя треть экрана = «активная зона», чтобы подсветка опережала центр
      { rootMargin: "-20% 0px -70% 0px", threshold: 0 },
    );
    els.forEach((el) => obs.observe(el));
    return () => obs.disconnect();
  }, [sections]);

  const go = (e: React.MouseEvent, id: string) => {
    e.preventDefault();
    const el = document.getElementById(id);
    if (!el) return;
    setActive(id);
    el.scrollIntoView({ behavior: "smooth", block: "start" });
  };

  return (
    <div className="sticky top-16 z-30 -mx-4 mt-8 border-y border-forest-500/10 bg-cream-50/85 px-4 backdrop-blur-md print:hidden">
      <nav className="flex items-center gap-1 overflow-x-auto py-2.5 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
        {sections.map((s) => (
          <a
            key={s.id}
            href={`#${s.id}`}
            onClick={(e) => go(e, s.id)}
            className={cn(
              "shrink-0 rounded-full px-3.5 py-1.5 text-xs font-medium transition-colors",
              active === s.id
                ? "bg-forest-900 text-cream-50"
                : "text-forest-500/70 hover:bg-forest-500/8 hover:text-forest-900",
            )}
          >
            {s.label}
          </a>
        ))}
        {availabilityLabel ? (
          <span className="ml-2 hidden shrink-0 text-xs text-forest-500/55 sm:inline">
            {availabilityLabel}
          </span>
        ) : null}
        <a
          href="#enquire"
          onClick={(e) => go(e, "enquire")}
          className="ml-auto inline-flex shrink-0 items-center gap-1.5 rounded-full bg-brass-500 px-3.5 py-1.5 text-xs font-semibold text-cream-50 transition-colors hover:bg-brass-600"
        >
          {enquireLabel}
          <ArrowRight className="h-3 w-3" />
        </a>
      </nav>
    </div>
  );
}
