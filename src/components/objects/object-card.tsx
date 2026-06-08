"use client";

import Link from "next/link";
import Image from "next/image";
import type { Route } from "next";
import {
  Waves,
  Mountain,
  Trees,
  Building2,
  Home,
  TreePine,
  Sun,
  ShieldCheck,
} from "lucide-react";
import type { RealEstateObject, ObjectType } from "@/types/object";
import { formatPriceCompact } from "@/lib/utils/price";
import { useLocale } from "@/lib/i18n/use-locale";
import { getListingsDict, type ListingsDict } from "@/lib/i18n/dictionaries";
import { SaveButton } from "./save-button";

const TYPE_ICON: Record<ObjectType, typeof Home> = {
  Land: TreePine,
  Villa: Home,
  House: Home,
  Apartment: Building2,
  Townhouse: Home,
  Hotel: Building2,
  Business: Building2,
  Project: Building2,
};

/**
 * Card thumbnail shows the migrated cover photo (Drive → Vercel Blob) when
 * present, falling back to a deterministic gradient from rwNumber for objects
 * without photos yet — so the grid stays intentional, never broken.
 *
 * Client component so it can self-localize via useLocale (label chrome switches
 * EN/RU by URL). The object's own title/description stays in its source language
 * (amoCRM, currently EN). The detail link stays at /object/[rw] for both locales
 * until /ru/object ships.
 */
function thumbHue(rw: string): number {
  let h = 0;
  for (let i = 0; i < rw.length; i++) h = (h * 31 + rw.charCodeAt(i)) >>> 0;
  return h % 360;
}

interface Props {
  object: RealEstateObject;
}

export function ObjectCard({ object }: Props) {
  const TypeIcon = TYPE_ICON[object.type];
  const hue = thumbHue(object.rwNumber);
  const t = getListingsDict(useLocale());

  return (
    <div className="group relative flex h-full flex-col">
      <SaveButton rw={object.rwNumber} className="absolute right-3 top-3 z-10" />
      <Link
        href={`/object/${object.rwNumber}` as Route}
        className="flex h-full flex-col overflow-hidden rounded-sm border border-forest-500/10 bg-cream-50 transition-all hover:border-forest-500/30 hover:shadow-lg"
      >
      <div
        className="relative aspect-[4/3] overflow-hidden bg-forest-500/5"
        style={
          object.coverImage
            ? undefined
            : {
                backgroundImage: `linear-gradient(135deg, hsl(${hue} 30% 88%) 0%, hsl(${(hue + 40) % 360} 25% 78%) 100%)`,
              }
        }
      >
        {object.coverImage ? (
          <Image
            src={object.coverImage}
            alt={object.titleEn}
            fill
            sizes="(min-width: 1024px) 33vw, (min-width: 640px) 50vw, 100vw"
            className="object-cover transition-transform duration-500 group-hover:scale-105"
          />
        ) : (
          <div className="absolute inset-0 flex items-center justify-center text-forest-500/30 transition-transform duration-500 group-hover:scale-105">
            <TypeIcon className="h-16 w-16" strokeWidth={1} />
          </div>
        )}

        <div className="absolute left-3 top-3 rounded-sm bg-cream-50/90 px-2 py-1 text-[10px] font-medium uppercase tracking-[0.15em] text-forest-500 backdrop-blur-sm">
          {object.rwNumber}
        </div>

        {object.beachfront ? (
          <FeatureBadge icon={Waves} label={t.beachfront} />
        ) : object.seaView ? (
          <FeatureBadge icon={Sun} label={t.seaView} />
        ) : object.mountainView ? (
          <FeatureBadge icon={Mountain} label={t.mountainView} />
        ) : object.jungleView ? (
          <FeatureBadge icon={Trees} label={t.jungleView} />
        ) : null}
      </div>

      <div className="flex flex-1 flex-col gap-3 p-5">
        <div className="flex items-center gap-2 text-xs text-forest-500/60">
          <span className="font-medium">{t.types[object.type]}</span>
          {object.district ? (
            <>
              <span aria-hidden>·</span>
              <span>{object.district}</span>
            </>
          ) : null}
        </div>

        <h3 className="font-serif text-xl leading-snug text-forest-900 line-clamp-2">
          {object.titleEn}
        </h3>

        {object.priceThb ? (
          <p className="num text-lg text-forest-900">
            {formatPriceCompact(object.priceThb)}
            {object.type === "Land" && object.pricePerRai ? (
              <span className="ml-2 text-xs font-sans text-forest-500/60">
                {formatPriceCompact(object.pricePerRai)}{t.perRai}
              </span>
            ) : null}
          </p>
        ) : object.pricePerRai ? (
          <p className="num text-lg text-forest-900">
            {formatPriceCompact(object.pricePerRai)}
            <span className="ml-2 text-xs font-sans text-forest-500/60">{t.perRai}</span>
          </p>
        ) : object.rentPerRaiMonth ? (
          <p className="num text-lg text-forest-900">
            {formatPriceCompact(object.rentPerRaiMonth)}
            <span className="ml-2 text-xs font-sans text-forest-500/60">{t.perRaiMonth}</span>
          </p>
        ) : (
          <p className="text-sm italic text-forest-500/55">{t.priceOnRequest}</p>
        )}

        <div className="mt-auto flex flex-wrap items-center gap-3 text-xs text-forest-500/70">
          {object.areaRai ? (
            <span>{formatRai(object.areaRai, t)}</span>
          ) : object.areaSqm ? (
            <span>{object.areaSqm.toLocaleString()} m²</span>
          ) : null}

          {object.bedrooms ? (
            <span>· {object.bedrooms} {t.bed}</span>
          ) : null}

          {object.documentType ? (
            <span className="ml-auto inline-flex items-center gap-1">
              <ShieldCheck className="h-3.5 w-3.5" />
              {object.documentType}
            </span>
          ) : null}
        </div>
        </div>
      </Link>
    </div>
  );
}

function FeatureBadge({
  icon: Icon,
  label,
}: {
  icon: typeof Waves;
  label: string;
}) {
  return (
    <div className="absolute bottom-3 left-3 inline-flex items-center gap-1.5 rounded-sm bg-forest-500/85 px-2.5 py-1 text-[10px] font-medium uppercase tracking-[0.15em] text-cream-100 backdrop-blur-sm">
      <Icon className="h-3 w-3" />
      {label}
    </div>
  );
}

function formatRai(rai: number, t: ListingsDict): string {
  if (rai >= 1) return `${rai.toLocaleString(undefined, { maximumFractionDigits: 2 })} ${t.rai}`;
  // sub-rai: 1 rai = 400 sq.wah; 1 sq.wah = 4 m². Show in m² for clarity.
  return `${Math.round(rai * 1600).toLocaleString()} m²`;
}
