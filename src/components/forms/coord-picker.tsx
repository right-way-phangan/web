"use client";

import { useState } from "react";
import dynamic from "next/dynamic";
import { Map as MapIcon, ChevronUp } from "lucide-react";
import type { CoordPickerLeafletProps } from "./coord-picker-leaflet";

// Leaflet is client-only (ssr:false), loaded on demand — the picker is heavy
// and most intake sessions paste a Google Maps URL without opening the map.
const Picker = dynamic(() => import("./coord-picker-leaflet"), {
  ssr: false,
  loading: () => <div className="h-[420px] w-full animate-pulse rounded-sm bg-forest-500/10" />,
});

/** Collapsible map editor: object pin + traced plot contour (admin intake). */
export function CoordPicker(props: CoordPickerLeafletProps) {
  const [open, setOpen] = useState(false);
  const hasContour = props.polygon.length >= 3;

  return (
    <div className="space-y-2">
      <button
        type="button"
        className="inline-flex items-center gap-2 rounded-sm border border-forest-500/20 px-3 py-2 text-sm font-medium text-forest-900 transition-colors hover:bg-forest-500/5"
        onClick={() => setOpen(!open)}
      >
        {open ? <ChevronUp size={16} aria-hidden /> : <MapIcon size={16} aria-hidden />}
        {open
          ? "Скрыть карту"
          : `Карта: пин + контур участка${hasContour ? ` (${props.polygon.length} точек)` : ""}`}
      </button>
      {open ? <Picker {...props} /> : null}
    </div>
  );
}
