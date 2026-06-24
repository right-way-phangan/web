"use client";

import Link from "next/link";
import type { Route } from "next";
import { TreePine, ShieldCheck } from "lucide-react";
import type { RealEstateObject } from "@/types/object";
import { formatPriceCompact } from "@/lib/utils/price";
import { MagicCard } from "@/components/ui/magic-card";

/**
 * Демо «прогона» 21st.dev builder: карточка объекта на brand-адаптированном
 * MagicCard (spotlight-рамка из реестра, перекрашенная в brass/forest/cream).
 * Реальные поля объекта, канонные токены и шрифт. В прод не подключено —
 * образец для сравнения с object-card.tsx перед возможной заменой.
 */
export function ObjectCardMagic({ object }: { object: RealEstateObject }) {
  return (
    <MagicCard className="h-full">
      <Link
        href={`/object/${object.rwNumber}` as Route}
        className="flex h-full flex-col p-5"
      >
        <div className="flex items-center gap-2 text-xs text-forest-500/70">
          <span className="rounded-sm bg-cream-200 px-2 py-1 text-[10px] font-medium uppercase tracking-[0.15em] text-forest-500">
            {object.rwNumber}
          </span>
          <span className="font-medium">{object.type}</span>
          {object.district ? <span>· {object.district}</span> : null}
        </div>

        <h3 className="mt-3 font-serif text-xl leading-snug text-forest-900 line-clamp-2">
          {object.titleEn}
        </h3>

        {object.priceThb ? (
          <p className="num mt-2 text-lg text-forest-900">
            {formatPriceCompact(object.priceThb)}
          </p>
        ) : (
          <p className="mt-2 text-sm italic text-forest-500/55">
            Price on request
          </p>
        )}

        <div className="mt-auto flex items-center gap-2 pt-4 text-xs text-forest-500/70">
          {object.areaRai ? (
            <span className="inline-flex items-center gap-1">
              <TreePine className="h-3.5 w-3.5" />
              {object.areaRai} rai
            </span>
          ) : null}
          {object.documentType ? (
            <span className="ml-auto inline-flex items-center gap-1">
              <ShieldCheck className="h-3.5 w-3.5" />
              {object.documentType}
            </span>
          ) : null}
        </div>
      </Link>
    </MagicCard>
  );
}
