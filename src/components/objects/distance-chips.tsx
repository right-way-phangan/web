import { Waves, Ship } from "lucide-react";
import type { Locale } from "@/lib/i18n/dictionaries";
import { haversineMeters, formatDistance } from "@/lib/utils/geo";
import { PHANGAN_BEACHES, THONG_SALA } from "@/lib/data/phangan-poi";

/**
 * "Beach 350 m · Thong Sala 4.2 km" orientation chips for an object card —
 * straight-line distance from the plot to the nearest named beach and to the
 * island's main town/pier. Server component; renders nothing without coords.
 * Distances are approximate (≈), which the chips show.
 */
export function DistanceChips({
  lat,
  lng,
  locale,
}: {
  lat?: number;
  lng?: number;
  locale: Locale;
}) {
  if (lat == null || lng == null) return null;

  const nearestBeach = PHANGAN_BEACHES.reduce(
    (best, b) => {
      const d = haversineMeters(lat, lng, b.lat, b.lng);
      return d < best.d ? { poi: b, d } : best;
    },
    { poi: PHANGAN_BEACHES[0], d: Infinity },
  );
  const townM = haversineMeters(lat, lng, THONG_SALA.lat, THONG_SALA.lng);

  const beachName = locale === "ru" ? nearestBeach.poi.ru : nearestBeach.poi.en;
  const townName = locale === "ru" ? THONG_SALA.ru : THONG_SALA.en;

  const chips: Array<{ icon: typeof Waves; label: string }> = [
    { icon: Waves, label: `${beachName} ≈ ${formatDistance(nearestBeach.d, locale)}` },
    { icon: Ship, label: `${townName} ≈ ${formatDistance(townM, locale)}` },
  ];

  return (
    <ul className="mt-3 flex flex-wrap gap-2">
      {chips.map(({ icon: Icon, label }) => (
        <li
          key={label}
          className="inline-flex items-center gap-1.5 rounded-full border border-forest-500/15 bg-forest-500/5 px-3 py-1 text-xs font-medium text-forest-900"
        >
          <Icon size={13} className="text-brass-500" aria-hidden />
          {label}
        </li>
      ))}
    </ul>
  );
}
