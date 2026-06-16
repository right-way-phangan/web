import Link from "next/link";
import type { Route } from "next";
import type { RealEstateObject } from "@/types/object";
import { zoneBuildInfo } from "@/lib/data/zone-rules";
import type { Locale } from "@/lib/i18n/dictionaries";
import { Appear } from "@/components/motion/appear";
import { cn } from "@/lib/utils/cn";

/**
 * "What you can build here" — indicative building rules derived from the plot's
 * detected DPT zone + its coastal/hillside flags (see lib/data/zone-rules.ts),
 * plus the agent's own plot-specific note (object.buildingRules) when present.
 *
 * Always indicative + linked to DD: the exact figures for a given plot are
 * confirmed in Transaction due diligence, never asserted from the zone alone.
 * Renders nothing when there is neither a derivable rule nor an agent note.
 */
const COPY = {
  en: {
    heading: "What you can build here",
    zone: "Zone",
    check: "Check before you build",
    note: "Agent note for this plot",
    disclaimer:
      "Indicative, based on the Phangan zoning maps (May 2025). The exact height, footprint, setbacks and permitted use for this plot are verified in our",
    ddLink: "due diligence",
    disclaimerTail: "before any offer.",
  },
  ru: {
    heading: "Что здесь можно строить",
    zone: "Зона",
    check: "Проверить до стройки",
    note: "Заметка агента по участку",
    disclaimer:
      "Индикативно, по картам зонирования Пангана (май 2025). Точные высота, пятно застройки, отступы и разрешённое использование для этого участка проверяются в нашем",
    ddLink: "due diligence",
    disclaimerTail: "до любого предложения.",
  },
} as const;

export function BuildingRules({
  object,
  locale,
}: {
  object: RealEstateObject;
  locale: Locale;
}) {
  const info = zoneBuildInfo(object, locale);
  const manual = object.buildingRules?.trim();
  if (!info && !manual) return null;

  const t = COPY[locale];
  const ddHref = (locale === "ru" ? "/ru/due-diligence" : "/due-diligence") as Route;

  return (
    <Appear>
    <section>
      <h2 className="font-serif text-3xl text-forest-900">{t.heading}</h2>

      {info?.zone ? (
        <p className="mt-4 inline-flex items-center gap-2 rounded-full border border-forest-500/15 bg-forest-500/[0.04] px-3 py-1 text-sm text-forest-700">
          <span className="text-forest-500/60">{t.zone}:</span>
          <span className="font-medium">{info.zone}</span>
        </p>
      ) : null}

      {info && info.lines.length > 0 ? (
        <dl className="mt-5 max-w-prose space-y-3">
          {info.lines.map((line) => (
            <div key={line.label} className="grid grid-cols-[8rem_1fr] gap-x-4 gap-y-1 sm:grid-cols-[10rem_1fr]">
              <dt className="text-sm font-medium text-forest-500/70">{line.label}</dt>
              <dd className="text-base leading-relaxed text-forest-500/85">{line.text}</dd>
            </div>
          ))}
        </dl>
      ) : null}

      {info && info.flags.length > 0 ? (
        <div className="mt-6 max-w-prose rounded-lg border border-amber-600/20 bg-amber-50/60 p-4">
          <p className="text-xs font-medium uppercase tracking-[0.15em] text-amber-700">
            {t.check}
          </p>
          <ul className="mt-2 space-y-2">
            {info.flags.map((f) => (
              <li key={f.text} className="flex gap-2 text-base leading-relaxed text-forest-500/85">
                <span aria-hidden className={cn("mt-0.5 shrink-0", f.level === "warn" ? "text-amber-600" : "text-forest-500/50")}>
                  {f.level === "warn" ? "▲" : "▸"}
                </span>
                <span>{f.text}</span>
              </li>
            ))}
          </ul>
        </div>
      ) : null}

      {manual ? (
        <div className="mt-6 max-w-prose rounded-lg border border-forest-500/10 bg-cream-50 p-4">
          <p className="text-xs font-medium uppercase tracking-[0.15em] text-brass-500">{t.note}</p>
          <p className="mt-2 whitespace-pre-line text-base leading-relaxed text-forest-500/85">{manual}</p>
        </div>
      ) : null}

      <p className="mt-5 max-w-prose text-sm leading-relaxed text-forest-500/60">
        {t.disclaimer}{" "}
        <Link href={ddHref} className="underline decoration-brass-500/40 underline-offset-2 hover:text-forest-700">
          {t.ddLink}
        </Link>{" "}
        {t.disclaimerTail}
      </p>
    </section>
    </Appear>
  );
}
