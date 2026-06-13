"use client";

import { useState } from "react";
import { Layers, ChevronDown } from "lucide-react";
import type { ObjectDict } from "@/lib/i18n/dictionaries";
import { cn } from "@/lib/utils/cn";

/**
 * Collapsible map legend, shared by the object-detail and /listings maps:
 * city-plan zoning swatches (when `zoning`), the "Nearby" amenity key (when
 * `poi`) and the cadastral data-source note (`showSource`, i.e. a Longdo
 * overlay is on). Collapsed by default on phones so it never dominates a short
 * map; grows upward from its toggle, capped height + scroll. Render only when
 * at least one of those sections has something to show.
 */
const POI_KEY: Array<[string, keyof ObjectDict["map"]]> = [
  ["⛴", "poiPier"],
  ["🏥", "poiHospital"],
  ["🏫", "poiSchool"],
  ["🛒", "poiShop"],
  ["🏧", "poiAtm"],
];

export function MapLegend({
  zoning,
  poi = false,
  showSource = true,
  t,
}: {
  zoning: boolean;
  poi?: boolean;
  showSource?: boolean;
  t: ObjectDict["map"];
}) {
  const [open, setOpen] = useState(
    () => typeof window !== "undefined" && window.innerWidth >= 640,
  );

  return (
    <div className="absolute bottom-2 left-2 z-[1000] flex max-w-[180px] flex-col-reverse items-start gap-1 sm:max-w-[230px]">
      <button
        type="button"
        aria-expanded={open}
        onClick={() => setOpen((o) => !o)}
        className="flex items-center gap-1.5 rounded-sm border border-forest-500/15 bg-cream-100/95 px-2 py-1.5 text-[11px] font-medium text-forest-900 shadow-sm hover:bg-cream-100 focus-visible:outline focus-visible:outline-2 focus-visible:outline-brass-500"
      >
        <Layers size={12} aria-hidden />
        {t.legendButton}
        <ChevronDown size={12} aria-hidden className={cn("transition-transform", open && "rotate-180")} />
      </button>
      {open ? (
        <div className="max-h-[220px] overflow-y-auto rounded-sm border border-forest-500/15 bg-cream-100/95 p-2.5 shadow-sm">
          {zoning ? (
            <>
              <p className="text-[10px] font-medium uppercase tracking-wide text-forest-500/70">
                {t.legendTitle}
              </p>
              <ul className="mt-1.5 space-y-1 text-[11px] leading-tight text-forest-900">
                {(
                  [
                    [{ background: "#37A700" }, t.legendRural],
                    [
                      { background: "repeating-linear-gradient(45deg,#4BE500 0 3px,#fff 3px 5px)" },
                      t.legendConservation,
                    ],
                    [{ background: "#AFF38E" }, t.legendRecreation],
                    [{ background: "#FEFE00" }, t.legendResidential],
                    [{ background: "#ACACAC" }, t.legendOther],
                  ] as Array<[React.CSSProperties, string]>
                ).map(([style, label]) => (
                  <li key={label} className="flex items-center gap-1.5">
                    <i
                      className="inline-block h-3 w-3 shrink-0 rounded-[2px] border border-black/10"
                      style={style}
                      aria-hidden
                    />
                    {label}
                  </li>
                ))}
              </ul>
            </>
          ) : null}
          {poi ? (
            <div className={cn(zoning && "mt-1.5 border-t border-forest-500/10 pt-1.5")}>
              <p className="text-[10px] font-medium uppercase tracking-wide text-forest-500/70">
                {t.poiLayer}
              </p>
              <ul className="mt-1.5 space-y-1 text-[11px] leading-tight text-forest-900">
                {POI_KEY.map(([emoji, key]) => (
                  <li key={key} className="flex items-center gap-1.5">
                    <span className="w-4 shrink-0 text-center" aria-hidden>
                      {emoji}
                    </span>
                    {t[key]}
                  </li>
                ))}
              </ul>
            </div>
          ) : null}
          {showSource ? (
            <p className={cn("text-[10px] leading-snug text-forest-500/70", (zoning || poi) && "mt-1.5 border-t border-forest-500/10 pt-1.5")}>
              {t.overlayNote}
            </p>
          ) : null}
        </div>
      ) : null}
    </div>
  );
}
