import type { DeveloperProfile } from "./types";

/**
 * Venera — boutique pool-villa developer on Koh Phangan.
 *
 * ⚠️ WORKING NAME ("Venera", chosen 2026-07-16, to be revised later). There is no
 * confirmed umbrella brand in the source materials: the two projects sit under
 * two separate legal entities (Tropical Villa Koh Phangan Co., Ltd and Skyline
 * Serenity Co., Ltd), sharing the sales contact (Vita); "Venera" is borrowed
 * from Skyline's Venera Village. Confirm the real group name with Vita.
 *
 * INVARIANT: `slug` must equal developerSlug("Venera") — the exact value of the
 * `developer` field on the catalog objects (RW-P0020, RW-P0021). When the name
 * changes: rename the `developer` field on both objects (PATCH) in lock-step
 * with this slug/name/file, the index entry, the nav labels and the test, or
 * the objects and profile split into two slugs.
 *
 * Only two confirmed projects here — no invented track record. Enrich once Vita
 * answers (delivered projects, years).
 */
export const venera: DeveloperProfile = {
  slug: "venera",
  name: "Venera",
  bio: {
    en: [
      "Venera builds boutique pool-villa communities on Koh Phangan. Villas are sold on a leasehold basis and delivered turnkey — fully furnished, with an on-site management company handling check-in, housekeeping and day-to-day rental operations.",
      "Two projects are currently under construction: Tropical Villas — eight one-bedroom villas in Srithanu, the island's most popular district — and Skyline Villas — sea-view two-bedroom villas an 8-minute walk from Mae Haad beach, part of the Venera Village development.",
    ].join("\n\n"),
    ru: [
      "Venera строит бутик-посёлки вилл с бассейнами на Ко Пангане. Виллы продаются по leasehold и сдаются «под ключ» — полностью меблированными, с управляющей компанией на месте: заселение, уборка и ежедневная работа с арендой.",
      "Сейчас строятся два проекта: Tropical Villas — восемь вилл с одной спальней в Шритану, самом популярном районе острова, — и Skyline Villas — виллы с двумя спальнями и видом на море в 8 минутах ходьбы от пляжа Mae Haad, часть проекта Venera Village.",
    ].join("\n\n"),
  },
  facts: [
    {
      label: { en: "Focus", ru: "Специализация" },
      value: {
        en: "Boutique pool villas on Koh Phangan",
        ru: "Бутик-виллы с бассейном на Пангане",
      },
    },
    {
      label: { en: "Ownership", ru: "Владение" },
      value: {
        en: "Leasehold, delivered turnkey",
        ru: "Leasehold, сдача «под ключ»",
      },
    },
    {
      label: { en: "Under construction", ru: "Строится" },
      value: {
        en: "Tropical Villas (Srithanu) · Skyline Villas (Mae Haad)",
        ru: "Tropical Villas (Шритану) · Skyline Villas (Mae Haad)",
      },
    },
  ],
  timeline: [
    {
      year: "2026–2027",
      title: "Tropical Villas",
      status: "under-construction",
      rwNumber: "RW-P0020",
      description: {
        en: "8 one-bedroom pool villas in Srithanu, a 5-minute drive from the sea. Handover March 2027.",
        ru: "8 вилл с одной спальней и бассейном в Шритану, 5 минут до моря. Сдача — март 2027.",
      },
    },
    {
      year: "2025–2027",
      title: "Skyline Villas",
      status: "under-construction",
      rwNumber: "RW-P0021",
      note: {
        en: "Part of Venera Village",
        ru: "Часть Venera Village",
      },
      description: {
        en: "Sea-view two-bedroom villas an 8-minute walk from Mae Haad beach, delivered in phases through August 2027.",
        ru: "Виллы с двумя спальнями и видом на море в 8 минутах от пляжа Mae Haad, поэтапная сдача до августа 2027.",
      },
    },
  ],
  hero: {
    tagline: {
      en: "Boutique leasehold pool-villa communities on Koh Phangan.",
      ru: "Бутик-посёлки вилл с бассейном на Ко Пангане (leasehold).",
    },
  },
  seo: {
    title: {
      en: "Venera — pool-villa developer on Koh Phangan",
      ru: "Venera — застройщик вилл на Ко Пангане",
    },
    description: {
      en: "Projects by Venera on Koh Phangan: Tropical Villas in Srithanu and Skyline Villas near Mae Haad, both under construction. Enquire through Right Way.",
      ru: "Проекты Venera на Ко Пангане: Tropical Villas в Шритану и Skyline Villas рядом с Mae Haad, оба строятся. Заявка — через Right Way.",
    },
  },
};
