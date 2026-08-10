"use client";

import { useState } from "react";
import Image from "next/image";
import { cn } from "@/lib/utils/cn";
import type { Locale } from "@/lib/i18n/dictionaries";
import { getProjectsDict } from "@/lib/i18n/dictionaries";
import { useDeveloperPhotos } from "./developer-photos";

/** Кадр альбома: лёгкое превью; полный кадр открывает общий лайтбокс. */
export interface AlbumThumb {
  thumb: string;
  alt: string;
}

/**
 * «Проекты в фото» — весь фотоархив застройщика одним блоком: ряд вкладок по
 * проектам и сетка кадров. Раньше здесь стояли три карусели друг под другом —
 * три экрана прокрутки, и до нижней добирались единицы. Кадр открывает общий
 * лайтбокс (состояние живёт в [[developer-photos]]), поэтому листать можно
 * весь архив, а не только выбранный проект.
 */
export function DeveloperAlbum({
  thumbs,
  locale,
}: {
  thumbs: AlbumThumb[];
  locale: Locale;
}) {
  const labels = getProjectsDict(locale).developers.album;
  const photos = useDeveloperPhotos();
  const groups = photos?.groups ?? [];
  const [active, setActive] = useState<string | null>(null);

  const group = active ? groups.find((g) => g.title === active) : undefined;
  const from = group?.start ?? 0;
  const shown = group ? thumbs.slice(from, from + group.count) : thumbs;

  const tabs = [
    { key: null as string | null, label: labels.all, count: thumbs.length },
    ...groups.map((g) => ({ key: g.title, label: g.title, count: g.count })),
  ];

  return (
    <div>
      {groups.length > 1 ? (
        <div
          role="tablist"
          aria-label={labels.all}
          className="-mx-6 mb-6 flex gap-2 overflow-x-auto px-6 pb-1 [scrollbar-width:none] md:mx-0 md:flex-wrap md:px-0 [&::-webkit-scrollbar]:hidden"
        >
          {tabs.map((t) => {
            const on = active === t.key;
            return (
              <button
                key={t.key ?? "all"}
                type="button"
                role="tab"
                aria-selected={on}
                onClick={() => setActive(t.key)}
                className={cn(
                  "inline-flex shrink-0 items-center gap-2 rounded-sm px-3 py-2 text-sm transition-colors",
                  on
                    ? "bg-forest-900 text-cream-50"
                    : "bg-forest-900/[0.06] text-forest-600 hover:bg-forest-900/10 hover:text-forest-900",
                )}
              >
                {t.label}
                <span className={cn("num text-xs", on ? "text-cream-50/70" : "text-forest-500/60")}>
                  {t.count}
                </span>
              </button>
            );
          })}
        </div>
      ) : null}

      <ul className="grid grid-cols-2 gap-2 md:grid-cols-3 md:gap-3 lg:grid-cols-4">
        {shown.map((p, i) => (
          <li key={p.thumb}>
            <button
              type="button"
              onClick={() => photos?.openAt(from + i)}
              className="group relative block aspect-[4/3] w-full overflow-hidden rounded-sm bg-forest-900/[0.04] outline-none focus-visible:ring-2 focus-visible:ring-brass-500/60"
              aria-label={p.alt}
            >
              <Image
                src={p.thumb}
                alt={p.alt}
                fill
                sizes="(min-width: 1024px) 280px, (min-width: 768px) 33vw, 50vw"
                className="object-cover transition-transform duration-500 ease-out group-hover:scale-[1.03]"
              />
            </button>
          </li>
        ))}
      </ul>

      <p className="mt-4 text-sm text-forest-500/60">{labels.photos(shown.length)}</p>
    </div>
  );
}
