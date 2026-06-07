"use client";

import { Heart } from "lucide-react";
import { track } from "@vercel/analytics";
import { useSaved } from "@/lib/saved/saved-context";
import { cn } from "@/lib/utils/cn";

/**
 * Heart toggle to add/remove a listing from the shortlist. Safe to render inside
 * an ObjectCard's link area — it stops the click from navigating.
 */
export function SaveButton({
  rw,
  className,
  variant = "overlay",
}: {
  rw: string;
  className?: string;
  /** "overlay" = floating on a card image; "inline" = on a light surface. */
  variant?: "overlay" | "inline";
}) {
  const { isSaved, toggle } = useSaved();
  const active = isSaved(rw);

  return (
    <button
      type="button"
      aria-pressed={active}
      aria-label={active ? "Remove from saved" : "Save to shortlist"}
      title={active ? "Remove from saved" : "Save to shortlist"}
      onClick={(e) => {
        e.preventDefault();
        e.stopPropagation();
        toggle(rw);
        track("save_toggle", { rw, saved: !active });
      }}
      className={cn(
        "inline-flex h-8 w-8 items-center justify-center rounded-full transition-colors",
        variant === "overlay"
          ? "bg-cream-50/90 text-forest-500 shadow-sm backdrop-blur-sm hover:text-brass-500"
          : "border border-forest-500/20 text-forest-500 hover:border-brass-500/40 hover:text-brass-500",
        className,
      )}
    >
      <Heart className={cn("h-4 w-4", active && "fill-brass-500 text-brass-500")} />
    </button>
  );
}
