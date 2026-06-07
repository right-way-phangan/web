import { MapPin } from "lucide-react";

/** Shared placeholder shown while a Leaflet map chunk loads (dynamic ssr:false). */
export function MapSkeleton({ label = "Loading map" }: { label?: string }) {
  return (
    <div className="flex h-full w-full flex-col items-center justify-center gap-3 rounded-sm border border-forest-500/10 bg-forest-500/5">
      <MapPin className="h-6 w-6 animate-pulse text-forest-500/30" strokeWidth={1.5} />
      <span className="text-xs uppercase tracking-[0.2em] text-forest-500/40">
        {label}
      </span>
    </div>
  );
}
