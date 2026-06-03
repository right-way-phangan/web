"use client";

import { useRouter, useSearchParams, usePathname } from "next/navigation";
import type { Route } from "next";
import { LayoutGrid, Map } from "lucide-react";
import { cn } from "@/lib/utils/cn";

/** Grid / Map switch that preserves the active filters in the URL. */
export function ViewToggle({ view }: { view: "grid" | "map" }) {
  const router = useRouter();
  const pathname = usePathname();
  const params = useSearchParams();

  function go(next: "grid" | "map") {
    const p = new URLSearchParams(params.toString());
    if (next === "grid") p.delete("view");
    else p.set("view", "map");
    const qs = p.toString();
    router.replace((qs ? `${pathname}?${qs}` : pathname) as Route, { scroll: false });
  }

  return (
    <div className="inline-flex rounded-sm border border-forest-500/20 bg-cream-50 p-0.5">
      <Btn active={view === "grid"} onClick={() => go("grid")} icon={LayoutGrid} label="Grid" />
      <Btn active={view === "map"} onClick={() => go("map")} icon={Map} label="Map" />
    </div>
  );
}

function Btn({
  active,
  onClick,
  icon: Icon,
  label,
}: {
  active: boolean;
  onClick: () => void;
  icon: typeof Map;
  label: string;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-pressed={active}
      className={cn(
        "inline-flex items-center gap-1.5 rounded-sm px-3 py-1.5 text-xs font-medium transition-colors",
        active
          ? "bg-forest-500 text-cream-100"
          : "text-forest-500/70 hover:text-forest-500",
      )}
    >
      <Icon className="h-3.5 w-3.5" />
      {label}
    </button>
  );
}
