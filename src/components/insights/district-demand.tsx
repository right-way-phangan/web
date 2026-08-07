"use client";

import { CalendarCheck, Star } from "lucide-react";
import { useLocale } from "@/lib/i18n/use-locale";
import type { RentalMarket } from "@/lib/data/rental-market";
import { SubHead, BarRow } from "./ins-shared";

/**
 * Demand-quality blocks for the owners zone (#rents), built from fields the
 * pipeline already collects but the report never surfaced: measured forward-90d
 * occupancy per district, guest-favorite share and median reviews. Own local
 * dictionary (market-preset.tsx convention). Renders nothing when neither
 * signal has enough coverage yet.
 */

const DD = {
  en: {
    occEyebrow: "Booked right now",
    occTitle: "Occupancy by district",
    occNote:
      "Share of the next ~90 days already unavailable, measured from live listing calendars (active listings only, ≥5 reviews). A current-demand read, not an annual figure.",
    occSub: (n: number) => `${n} active listings measured`,
    coverage: (measured: number, total: number) =>
      `Measured for ${measured} of ${total} districts — coverage grows with every weekly run.`,
    qualEyebrow: "Where guests come back",
    qualTitle: "Demand quality by district",
    qualNote:
      "Guest-favorite share (Airbnb's top-listings badge) and median reviews — a proxy for how reliably a district converts and retains guests.",
    guestFav: "guest-favorite",
    reviews: (n: number) => `${n} median reviews`,
    empty: "",
  },
  ru: {
    occEyebrow: "Занято прямо сейчас",
    occTitle: "Загрузка по районам",
    occNote:
      "Доля ближайших ~90 дней, уже недоступных, по календарям живых объявлений (только активные, ≥5 отзывов). Срез текущего спроса, не годовая цифра.",
    occSub: (n: number) => `измерено по ${n} активным объявлениям`,
    coverage: (measured: number, total: number) =>
      `Измерено по ${measured} из ${total} районов — покрытие растёт с каждым недельным прогоном.`,
    qualEyebrow: "Куда гости возвращаются",
    qualTitle: "Качество спроса по районам",
    qualNote:
      "Доля «гостевого выбора» (бейдж лучших объявлений Airbnb) и медиана отзывов — прокси того, насколько надёжно район конвертирует и удерживает гостей.",
    guestFav: "гостевой выбор",
    reviews: (n: number) => `${n} отзывов (медиана)`,
    empty: "",
  },
} as const;

export function DistrictDemand({ data }: { data: RentalMarket }) {
  const t = DD[useLocale()];

  const occRows = data.districts
    .filter((d) => d.occupancyMeasured != null && (d.nOccupancy ?? 0) >= 5)
    .sort((a, b) => (b.occupancyMeasured ?? 0) - (a.occupancyMeasured ?? 0));

  const qualRows = data.districts
    .filter((d) => d.n >= 12 && d.guestFavoriteShare != null)
    .sort((a, b) => (b.guestFavoriteShare ?? 0) - (a.guestFavoriteShare ?? 0))
    .slice(0, 8);

  if (occRows.length === 0 && qualRows.length === 0) return null;

  const maxGf = Math.max(...qualRows.map((d) => d.guestFavoriteShare ?? 0), 0.01);

  return (
    <div className="mt-12 grid gap-8 lg:grid-cols-2">
      {/* Booked now — measured occupancy */}
      {occRows.length > 0 ? (
        <div>
          <p className="text-[11px] font-medium uppercase tracking-eyebrow text-brass-500">
            {t.occEyebrow}
          </p>
          <div className="mt-2">
            <SubHead title={t.occTitle} icon={<CalendarCheck className="h-4 w-4" />} />
          </div>
          <p className="mt-1 text-sm text-forest-500/70">{t.occNote}</p>
          <div className="mt-4 space-y-2.5">
            {occRows.map((d) => (
              <BarRow
                key={d.name}
                label={d.name}
                slug={d.slug}
                value={Math.round((d.occupancyMeasured as number) * 100)}
                max={100}
                right={`${Math.round((d.occupancyMeasured as number) * 100)}%`}
                sub={t.occSub(d.nOccupancy ?? 0)}
              />
            ))}
          </div>
          <p className="mt-3 text-[11px] text-forest-500/50">
            {t.coverage(occRows.length, data.districts.length)}
          </p>
        </div>
      ) : null}

      {/* Demand quality — guest-favorite share + reviews */}
      {qualRows.length > 0 ? (
        <div>
          <p className="text-[11px] font-medium uppercase tracking-eyebrow text-brass-500">
            {t.qualEyebrow}
          </p>
          <div className="mt-2">
            <SubHead title={t.qualTitle} icon={<Star className="h-4 w-4" />} />
          </div>
          <p className="mt-1 text-sm text-forest-500/70">{t.qualNote}</p>
          <div className="mt-4 space-y-2.5">
            {qualRows.map((d) => (
              <BarRow
                key={d.name}
                label={d.name}
                slug={d.slug}
                value={d.guestFavoriteShare ?? 0}
                max={maxGf}
                right={`${Math.round((d.guestFavoriteShare ?? 0) * 100)}%`}
                sub={`${t.guestFav}${d.reviewsMedian ? ` · ${t.reviews(d.reviewsMedian)}` : ""}`}
                tone="brass"
              />
            ))}
          </div>
        </div>
      ) : null}
    </div>
  );
}
