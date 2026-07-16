"use client";

import { Heart, X } from "lucide-react";
import type { MatchResult } from "@/types/match";
import { ObjectCard } from "@/components/objects/object-card";
import { cn } from "@/lib/utils/cn";

/**
 * Карточка выдачи RW Match: существующая ObjectCard + шапка с % фита и кнопками
 * ♥/✕, снизу — одна причина фита. Реакция уходит наверх (в MatchChat) и питает
 * пере-ранжирование. Бейдж % вынесен НАД карточкой, чтобы не конфликтовать с её
 * собственными абсолютными бейджами (rwNumber / save / ROI).
 */
export function MatchResultCard({
  result,
  liked,
  rejected,
  onReact,
  labels,
}: {
  result: MatchResult;
  liked: boolean;
  rejected: boolean;
  onReact: (rw: string, kind: "like" | "reject") => void;
  labels: { fit: string; like: string; reject: string };
}) {
  return (
    <div className={cn("flex flex-col", rejected && "opacity-40")}>
      <div className="mb-2 flex items-center justify-between gap-2">
        <span className="inline-flex items-center rounded-sm bg-brass-500 px-2 py-1 text-[11px] font-semibold uppercase tracking-[0.12em] text-panel-fg">
          {result.fitPct}% {labels.fit}
        </span>
        <div className="flex items-center gap-1">
          <button
            type="button"
            onClick={() => onReact(result.rw, "like")}
            aria-pressed={liked}
            title={labels.like}
            className={cn(
              "inline-flex h-8 w-8 items-center justify-center rounded-sm border transition-colors",
              liked
                ? "border-brass-500/50 bg-brass-500/15 text-brass-500"
                : "border-forest-500/20 text-forest-500/60 hover:border-brass-500/40 hover:text-brass-500",
            )}
          >
            <Heart className="h-4 w-4" fill={liked ? "currentColor" : "none"} />
          </button>
          <button
            type="button"
            onClick={() => onReact(result.rw, "reject")}
            aria-pressed={rejected}
            title={labels.reject}
            className="inline-flex h-8 w-8 items-center justify-center rounded-sm border border-forest-500/20 text-forest-500/60 transition-colors hover:border-forest-500/40 hover:text-forest-900"
          >
            <X className="h-4 w-4" />
          </button>
        </div>
      </div>

      <ObjectCard object={result.card} />

      {result.reason ? (
        <p className="mt-2 text-xs leading-relaxed text-forest-500/75">
          <span aria-hidden className="text-brass-500">
            ✦{" "}
          </span>
          {result.reason}
        </p>
      ) : null}
    </div>
  );
}
