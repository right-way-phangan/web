import type { DeveloperProfile } from "./types";

/**
 * ARQA Development (ARQA Phangan) — villa developer on Koh Phangan.
 *
 * INVARIANT: `slug` must equal developerSlug("ARQA Development") — the exact
 * value of the `developer` field on ARQA catalog objects (e.g. RW-P0018).
 * New ARQA objects must use the same spelling, or they will form a second
 * developer group with a different slug.
 *
 * Only developer-confirmed facts here. Entries without year/status/description
 * are awaiting the developer's answers (see «Вопросы застройщику — страница
 * застройщика.md» in the ARQA folder) — enrich as they come in.
 */
export const arqa: DeveloperProfile = {
  slug: "arqa-development",
  name: "ARQA Development",
  bio: {
    en: [
      "ARQA Development is a villa developer on Koh Phangan. The team takes its communities through the full cycle — masterplan, construction, finished homes and day-to-day rental operations — so the villas it sells are backed by villas it already runs.",
      "Its flagship, Phangaia Garden Resort on the island's west coast near Thong Sala, is being delivered in phases: the first two phases are completed and operate as rental villas, and phase III — Verana Villas — is under construction.",
      "The delivered villas are handed over turnkey — furniture, appliances, air conditioning, landscaping and a pool. Phangaia also has a shared pool and sun deck inside the community; Demaya Resort, a separate delivered project, is built to the same standard in a one-bedroom format.",
    ].join("\n\n"),
    ru: [
      "ARQA Development — застройщик вилл на Ко Пангане. Команда ведёт свои посёлки по полному циклу: мастерплан, строительство, готовые дома и ежедневная работа с арендой — виллы, которые они продают, подкреплены виллами, которыми они уже управляют.",
      "Флагман — Phangaia Garden Resort на западном побережье острова рядом с Тонг Салой. Резорт строится очередями: первые две фазы сданы и работают как арендные виллы, фаза III — Verana Villas — строится.",
      "Сданные виллы передаются под ключ: мебель, техника, кондиционеры, ландшафт и бассейн. В Phangaia есть общий бассейн с зоной отдыха; Demaya Resort — отдельный сданный проект того же уровня в формате одной спальни.",
    ].join("\n\n"),
  },
  facts: [
    {
      label: { en: "Focus", ru: "Специализация" },
      value: {
        en: "Villa communities on Koh Phangan",
        ru: "Вилловые посёлки на Пангане",
      },
    },
    {
      label: { en: "Flagship", ru: "Флагман" },
      value: {
        en: "Phangaia Garden Resort, Nai Wok",
        ru: "Phangaia Garden Resort, Най Вок",
      },
    },
    {
      label: { en: "Delivered", ru: "Сдано" },
      value: {
        en: "Phangaia phases I–II and Demaya Resort",
        ru: "Фазы I–II Phangaia и Demaya Resort",
      },
    },
    {
      label: { en: "Under construction", ru: "Строится" },
      value: {
        en: "Verana Villas — first 6 villas due Nov 2026",
        ru: "Verana Villas — первые 6 вилл к ноя. 2026",
      },
    },
  ],
  timeline: [
    {
      title: "Phangaia Garden Resort — phases I & II",
      status: "built",
      description: {
        en: "Garden villa community in Nai Wok, near Thong Sala. The first two phases are delivered and operate as rental villas: dark-timber villas among the coconut palms, a landscaped garden and a shared pool with a sun deck.",
        ru: "Вилловый посёлок-сад в Най Воке, рядом с Тонг Салой. Первые две очереди сданы и работают как арендные виллы: тёмные виллы в кокосовой роще, ландшафтный сад и общий бассейн с зоной отдыха.",
      },
      photo: "/images/developers/arqa/phangaia-pool.jpg",
    },
    { title: "Tree House" },
    {
      title: "Demaya Resort",
      status: "built",
      description: {
        en: "Delivered one-bedroom villa format: a private pool and sun loungers behind a green screen, an open kitchen-living room, a bedroom facing the water and a stone-clad bathroom. Handed over furnished.",
        ru: "Сданный формат виллы с одной спальней: приватный бассейн и лежаки за зелёной ширмой, кухня-гостиная, спальня с выходом к воде и ванная в камне. Передаётся меблированной.",
      },
      photo: "/images/developers/arqa/demaya-pool-view.jpg",
    },
    {
      year: "2026",
      title: "Verana Villas",
      status: "under-construction",
      rwNumber: "RW-P0018",
      note: {
        en: "Phase III of Phangaia Garden Resort",
        ru: "Фаза III Phangaia Garden Resort",
      },
      description: {
        en: "12 pool villas; the first six are scheduled for handover in November 2026. The photo shows a completed villa of the same type on the site.",
        ru: "12 вилл с бассейнами; первые шесть — к передаче в ноябре 2026. На фото — построенная вилла того же типа на площадке.",
      },
      photo: "/images/developers/arqa/verana-exterior-pool.jpg",
    },
    { title: "Verana Villas 2" },
    { title: "AyA Villas" },
  ],
  hero: {
    photo: "/images/developers/arqa/phangaia-gateway.jpg",
    tagline: {
      en: "Builds and operates villa communities on Koh Phangan.",
      ru: "Строит вилловые посёлки на Пангане и сам ими управляет.",
    },
  },
  // Vetted photos from the developer's own shoots (Aug 2026) — delivered villas
  // only, no renders. Lifestyle frames with recognisable people are excluded:
  // no model release, and the developer has not confirmed publication in writing.
  gallery: [
    "/images/developers/arqa/phangaia-villas.jpg",
    "/images/developers/arqa/phangaia-living.jpg",
    "/images/developers/arqa/demaya-pool.jpg",
    "/images/developers/arqa/phangaia-dining.jpg",
    "/images/developers/arqa/demaya-living.jpg",
    "/images/developers/arqa/phangaia-bedroom.jpg",
    "/images/developers/arqa/phangaia-garden-path.jpg",
    "/images/developers/arqa/demaya-bedroom.jpg",
    "/images/developers/arqa/phangaia-kitchen.jpg",
    "/images/developers/arqa/demaya-kitchen.jpg",
    "/images/developers/arqa/phangaia-bathroom.jpg",
    "/images/developers/arqa/phangaia-grove.jpg",
  ],
  seo: {
    title: {
      en: "ARQA Development — villa developer on Koh Phangan",
      ru: "ARQA Development — застройщик вилл на Ко Пангане",
    },
    description: {
      en: "Track record and current projects by ARQA Development on Koh Phangan: delivered phases of Phangaia Garden Resort, the delivered Demaya Resort and Verana Villas under construction. Enquire through Right Way.",
      ru: "Проекты застройщика ARQA Development на Ко Пангане: сданные фазы Phangaia Garden Resort, сданный Demaya Resort и строящиеся Verana Villas. Заявка — через Right Way.",
    },
  },
};
