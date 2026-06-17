import Link from "next/link";
import Image from "next/image";
import type { Route } from "next";
import { MapPin, Layers, Map as MapIcon } from "lucide-react";
import type { LandEstate } from "@/content/land-estates";
import { estateStats } from "@/content/land-estates";
import type { Locale } from "@/lib/i18n/dictionaries";
import { getEstatesDict } from "@/lib/i18n/dictionaries";
import { cn } from "@/lib/utils/cn";
import { AvailabilityBar } from "@/components/projects/availability-bar";

/** Детерминированный hue для плейсхолдера-градиента (как в project-card). */
function hue(seed: string): number {
  let h = 0;
  for (let i = 0; i < seed.length; i++) h = (h * 31 + seed.charCodeAt(i)) >>> 0;
  return h % 360;
}

interface Props {
  estate: LandEstate;
  href: string;
  locale: Locale;
}

/** Карточка подборки участков для сетки /estates → ведёт на лендинг подборки. */
export function EstateCard({ estate, href, locale }: Props) {
  const t = getEstatesDict(locale);
  const s = estateStats(estate);
  const h = hue(estate.slug);

  return (
    <Link
      href={href as Route}
      className="group flex h-full flex-col overflow-hidden rounded-sm border border-forest-500/10 bg-cream-50 transition-all hover:border-forest-500/30 hover:shadow-lg"
    >
      <div
        className="relative aspect-[16/10] overflow-hidden bg-forest-500/5"
        style={
          estate.cover
            ? undefined
            : {
                backgroundImage: `linear-gradient(135deg, hsl(${h} 30% 88%) 0%, hsl(${(h + 40) % 360} 25% 78%) 100%)`,
              }
        }
      >
        {estate.cover ? (
          <Image
            src={estate.cover}
            alt={estate.name[locale]}
            fill
            unoptimized
            sizes="(min-width: 1024px) 33vw, (min-width: 640px) 50vw, 100vw"
            className="object-cover transition-transform duration-500 group-hover:scale-105"
          />
        ) : (
          <div className="absolute inset-0 flex items-center justify-center text-forest-500/25">
            <MapIcon className="h-16 w-16" strokeWidth={1} />
          </div>
        )}
        <span className="absolute left-3 top-3 inline-flex items-center gap-1.5 rounded-sm bg-cream-50/90 px-2 py-1 text-[10px] font-medium uppercase tracking-[0.15em] text-forest-500 backdrop-blur-sm">
          <Layers className="h-3 w-3" />
          {s.total} {t.plots.toLowerCase()}
        </span>
      </div>

      <div className="flex flex-1 flex-col gap-3 p-5">
        <div className="flex flex-wrap items-center gap-x-2 gap-y-1 text-xs text-forest-500/60">
          <span className="inline-flex items-center gap-1">
            <MapPin className="h-3 w-3" />
            {estate.district}
          </span>
          {s.areaRai > 0 ? (
            <span>· {s.areaRai} {locale === "ru" ? "рай всего" : "rai total"}</span>
          ) : null}
        </div>

        <h3 className="font-serif text-xl leading-snug text-forest-900 line-clamp-2">
          {estate.name[locale]}
        </h3>

        <p className="text-sm leading-relaxed text-forest-500/75 line-clamp-2">
          {estate.tagline[locale]}
        </p>

        <div className="mt-auto space-y-1.5 pt-1">
          <AvailabilityBar total={s.total} available={s.available} />
          <p
            className={cn(
              "text-xs",
              s.available > 0 && s.available <= 2 ? "font-medium text-brass-600" : "text-forest-500/60",
            )}
          >
            {s.available <= 0
              ? t.soldOut
              : s.available <= 2
                ? t.plotsLeft(s.available)
                : t.availableOf(s.available, s.total)}
          </p>
        </div>
      </div>
    </Link>
  );
}
