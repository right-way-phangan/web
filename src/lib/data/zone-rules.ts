/**
 * Indicative building rules from a plot's detected zone + what we know about
 * the plot. The map auto-classifies the DPT city-plan colour (zone-lookup.ts:
 * Green/Yellow/Orange/Red/Purple); this turns that classification into a
 * plain-language "what you can build here" for the public object page.
 *
 * Deliberately indicative, never invented:
 *  - The DPT colour is a LAND-USE zone → it tells us permitted use + density.
 *  - HEIGHT / SETBACKS come from a separate overlay — the May-2025 Phangan
 *    environmental zones, keyed off proximity to the sea and slope. We only
 *    surface those where a plot flag tells us they apply (beachfront / sea
 *    view / mountain view).
 *  - Every figure here is sourced from Right Way's own vetted content (FAQ /
 *    Knowledge Base / Due Diligence). No FAR/footprint percentages are stated
 *    because we don't have an authoritative per-zone number — those are
 *    confirmed in Transaction DD. The UI always shows that caveat.
 */

import type { RealEstateObject } from "@/types/object";

export type RuleLocale = "en" | "ru";

export interface ZoneBuildInfo {
  /** Localized zone name, e.g. "Low-density residential". Omitted if unknown. */
  zone?: string;
  /** Labelled lines: permitted use, typical build form, permit. */
  lines: { label: string; text: string }[];
  /** Location-driven constraint notes (coastal / hillside). */
  notes: string[];
}

type Bi = { en: string; ru: string };
const pick = (b: Bi, l: RuleLocale) => b[l];

/** DPT land-use colour → permitted use + density (plain language). */
const ZONE_USE: Record<string, { name: Bi; use: Bi }> = {
  green: {
    name: { en: "Rural & agricultural", ru: "Сельская/сельхоз" },
    use: {
      en: "Low-density homes and agritourism. A private villa is typically allowed; dense or commercial development is not.",
      ru: "Жильё низкой плотности и агротуризм. Частная вилла обычно допустима; плотная или коммерческая застройка — нет.",
    },
  },
  yellow: {
    name: { en: "Low-density residential", ru: "Жилая, низкая плотность" },
    use: {
      en: "Houses and villas — the most build-friendly zone for a private home.",
      ru: "Дома и виллы — самая «застраиваемая» зона под частный дом.",
    },
  },
  orange: {
    name: { en: "Medium-density residential", ru: "Жилая, средняя плотность" },
    use: {
      en: "Houses, villas and small multi-unit buildings; higher density than the low-density zone.",
      ru: "Дома, виллы, небольшие многоквартирные; плотность выше, чем в зоне низкой плотности.",
    },
  },
  red: {
    name: { en: "Commercial", ru: "Коммерческая" },
    use: {
      en: "Shops, hospitality and mixed-use. Housing is secondary here.",
      ru: "Торговля, гостеприимство, смешанное использование. Жильё здесь вторично.",
    },
  },
  purple: {
    name: { en: "Industrial", ru: "Промышленная" },
    use: {
      en: "Warehousing and light industry — not intended for housing.",
      ru: "Склады и лёгкая промышленность — под жильё не предназначена.",
    },
  },
};

const TYPICAL_FORM: Bi = {
  en: "A typical Phangan residential build is 1–2 storeys (often 1.5 to lift the sea view), with a pool and garden.",
  ru: "Типовая жилая застройка на Пангане — 1–2 этажа (часто 1,5, чтобы поднять вид на море), бассейн и сад.",
};

const PERMIT: Bi = {
  en: "Building permit is issued by the local Tessaban; an environmental assessment is required for builds over 500 m².",
  ru: "Разрешение на строительство выдаёт местный тессабан; для строений свыше 500 м² требуется экологическая оценка.",
};

const COASTAL: Bi = {
  en: "Coastal zone: within ~200 m of the high-water line height is typically capped near 6 m with a reduced footprint and no commercial use on residential plots; within ~50 m only small single-storey buildings.",
  ru: "Прибрежная зона: в ~200 м от линии прилива высота обычно ограничена ~6 м, пятно застройки уменьшено, коммерция на жилых участках запрещена; в ~50 м — только небольшие одноэтажные строения.",
};

const HILLSIDE: Bi = {
  en: "Hillside (Mountain zone): slope-based limits, road-access requirements and environmental approvals may apply.",
  ru: "Склон (Горная зона): возможны ограничения по уклону, требования к подъездной дороге и экологические согласования.",
};

const NEAR_COAST: Bi = {
  en: "Near the coast — coastal height caps and setbacks may apply; confirmed against the plot's exact distance to the water in DD.",
  ru: "Рядом с морем — могут действовать прибрежные ограничения высоты и отступы; уточняется по точному расстоянию участка до воды в DD.",
};

/**
 * Build the indicative rule set for an object, or null if we can say nothing
 * useful (no zone and no coastal/hillside signal).
 */
export function zoneBuildInfo(o: RealEstateObject, locale: RuleLocale): ZoneBuildInfo | null {
  const key = (o.zone ?? "").trim().toLowerCase();
  const zoneDef = ZONE_USE[key];

  const lines: { label: string; text: string }[] = [];
  const notes: string[] = [];

  const L = locale === "ru"
    ? { use: "Использование", form: "Типовая застройка", permit: "Разрешение" }
    : { use: "Permitted use", form: "Typical build", permit: "Permit" };

  if (zoneDef) {
    lines.push({ label: L.use, text: pick(zoneDef.use, locale) });
    // "What you can build" form line only makes sense for a vacant plot.
    if (o.type === "Land" && (key === "green" || key === "yellow" || key === "orange")) {
      lines.push({ label: L.form, text: pick(TYPICAL_FORM, locale) });
    }
  }

  // Environmental overlay — only from signals we actually have.
  if (o.beachfront) notes.push(pick(COASTAL, locale));
  else if (o.seaView) notes.push(pick(NEAR_COAST, locale));
  if (o.mountainView) notes.push(pick(HILLSIDE, locale));

  if (lines.length === 0 && notes.length === 0) return null;

  // Permit note is worth showing whenever we're saying anything about building.
  if (o.type === "Land") lines.push({ label: L.permit, text: pick(PERMIT, locale) });

  return { zone: zoneDef ? pick(zoneDef.name, locale) : undefined, lines, notes };
}
