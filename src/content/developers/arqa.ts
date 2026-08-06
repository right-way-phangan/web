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
      "A project starts with an audit of the plot and the local building rules, a financial model and engineering design — renders come later. The villas are built to an upgraded European spec: double walls, panoramic glazing with sound and thermal insulation, insulated ceilings and premium climate control.",
    ].join("\n\n"),
    ru: [
      "ARQA Development — застройщик вилл на Ко Пангане. Команда ведёт свои посёлки по полному циклу: мастерплан, строительство, готовые дома и ежедневная работа с арендой — виллы, которые они продают, подкреплены виллами, которыми они уже управляют.",
      "Флагман — Phangaia Garden Resort на западном побережье острова рядом с Тонг Салой. Резорт строится очередями: первые две фазы сданы и работают как арендные виллы, фаза III — Verana Villas — строится.",
      "Сданные виллы передаются под ключ: мебель, техника, кондиционеры, ландшафт и бассейн. В Phangaia есть общий бассейн с зоной отдыха; Demaya Resort — отдельный сданный проект того же уровня в формате одной спальни.",
      "Проект начинается с аудита участка и регламентов, финансовой модели и инженерной проработки — рендеры появляются позже. Виллы строят по усиленному европейскому стандарту: двойные стены, панорамное остекление со звуко- и теплоизоляцией, утеплённые потолки и премиальный климат-контроль.",
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
        en: "Phangaia I–II (2023–2025) and Demaya Resort",
        ru: "Фазы I–II Phangaia (2023–2025) и Demaya Resort",
      },
    },
    {
      label: { en: "Under construction", ru: "Строится" },
      value: {
        en: "Verana Villas — first 6 villas due Nov 2026",
        ru: "Verana Villas — первые 6 вилл к ноя. 2026",
      },
    },
    {
      // Public Airbnb standing of the villas the team runs — the developer
      // confirmed in writing that we may quote it.
      label: { en: "Rental record", ru: "В аренде" },
      value: {
        en: "Airbnb Superhost · 4.91 across ~192 reviews",
        ru: "Суперхозяин Airbnb · 4,91 по ~192 отзывам",
      },
    },
  ],
  timeline: [
    {
      year: "2023–2025",
      title: "Phangaia Garden Resort — phases I & II",
      status: "built",
      description: {
        en: "Garden villa community in Nai Wok, near Thong Sala: six villas in three layouts, dark timber among the coconut palms, a shared pool with a sun deck and a garden planted with dozens of tropical species. Built from November 2023 to April 2025; the villas are delivered and operate as rentals. Three minutes from the international school, fifteen on foot to the sea, on a quiet road with no through traffic.",
        ru: "Вилловый посёлок-сад в Най Воке, рядом с Тонг Салой: шесть вилл в трёх планировках, тёмное дерево в кокосовой роще, общий бассейн с зоной отдыха и сад с десятками видов тропических растений. Построен с ноября 2023 по апрель 2025; виллы сданы и работают в аренде. Три минуты до международной школы, пятнадцать пешком до моря, тихая улица без сквозного движения.",
      },
      photo: "/images/developers/arqa/phangaia-pool.jpg",
    },
    { title: "Tree House" },
    {
      title: "Demaya Resort",
      status: "built",
      description: {
        en: "A separate delivered community inland, near Phaeng waterfall — one-bedroom villas with a private pool and sun loungers behind a green screen, an open kitchen-living room, a bedroom facing the water and a stone-clad bathroom. Handed over furnished.",
        ru: "Отдельный сданный посёлок в глубине острова, рядом с водопадом Пэнг: виллы с одной спальней — приватный бассейн и лежаки за зелёной ширмой, кухня-гостиная, спальня с выходом к воде и ванная в камне. Передаются меблированными.",
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
  // The developer's own shoots (handed over Aug 2026, publication confirmed by
  // Denis). Delivered objects only — no renders. Each frame needs a -sm.webp
  // sibling: the carousel shows the thumb, the lightbox the full JPEG.
  gallery: [
    {
      title: "Phangaia Garden Resort",
      note: { en: "Delivered · Nai Wok", ru: "Сдан · Най Вок" },
      photos: [
        "/images/developers/arqa/phangaia-pool-deck.jpg",
        "/images/developers/arqa/phangaia-villas.jpg",
        "/images/developers/arqa/phangaia-living.jpg",
        "/images/developers/arqa/phangaia-dining.jpg",
        "/images/developers/arqa/phangaia-terrace.jpg",
        "/images/developers/arqa/phangaia-lounge.jpg",
        "/images/developers/arqa/phangaia-suite.jpg",
        "/images/developers/arqa/phangaia-bedroom.jpg",
        "/images/developers/arqa/phangaia-kitchen.jpg",
        "/images/developers/arqa/phangaia-bathroom.jpg",
        "/images/developers/arqa/phangaia-garden-path.jpg",
        "/images/developers/arqa/phangaia-grove.jpg",
        "/images/developers/arqa/phangaia-poolside.jpg",
        "/images/developers/arqa/phangaia-reading.jpg",
        "/images/developers/arqa/phangaia-breakfast.jpg",
      ],
    },
    {
      title: "Demaya Resort",
      note: { en: "Delivered · one-bedroom villa", ru: "Сдан · вилла с одной спальней" },
      photos: [
        "/images/developers/arqa/demaya-pool.jpg",
        "/images/developers/arqa/demaya-exterior.jpg",
        "/images/developers/arqa/demaya-terrace.jpg",
        "/images/developers/arqa/demaya-living.jpg",
        "/images/developers/arqa/demaya-bedroom.jpg",
        "/images/developers/arqa/demaya-suite.jpg",
        "/images/developers/arqa/demaya-kitchen.jpg",
        "/images/developers/arqa/demaya-bath.jpg",
        "/images/developers/arqa/demaya-garden.jpg",
      ],
    },
    {
      title: "Verana Villas",
      note: {
        en: "Phase III, under construction · a completed villa of the same type",
        ru: "Фаза III, строится · построенная вилла того же типа",
      },
      photos: [
        "/images/developers/arqa/verana-facade.jpg",
        "/images/developers/arqa/verana-pool.jpg",
        "/images/developers/arqa/verana-bedroom-pool.jpg",
        "/images/developers/arqa/verana-open-plan.jpg",
        "/images/developers/arqa/verana-living.jpg",
        "/images/developers/arqa/verana-kitchen.jpg",
        "/images/developers/arqa/verana-master.jpg",
        "/images/developers/arqa/verana-bath.jpg",
        "/images/developers/arqa/verana-ceiling.jpg",
      ],
    },
  ],
  // Pins from the developer (Aug 2026). Phangaia and Verana share a site —
  // Verana is its phase III, so the two pins sit ~50 m apart by design.
  locations: [
    {
      title: "Phangaia Garden Resort",
      lat: 9.7215145,
      lng: 99.9876952,
      note: { en: "Delivered · Nai Wok, near Thong Sala", ru: "Сдан · Най Вок, рядом с Тонг Салой" },
    },
    {
      title: "Verana Villas",
      lat: 9.7215625,
      lng: 99.9881875,
      note: { en: "Under construction · phase III", ru: "Строится · фаза III" },
    },
    {
      title: "Demaya Resort",
      lat: 9.7369985,
      lng: 100.009027,
      note: { en: "Delivered · island centre", ru: "Сдан · центр острова" },
    },
    {
      title: "AyA Villas",
      lat: 9.728544,
      lng: 100.004779,
      note: { en: "Site — details to come", ru: "Площадка — данные уточняются" },
    },
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
