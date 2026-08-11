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
      "Phangaia Garden Resort on the island's west coast near Thong Sala is delivered — six villas that now operate as rentals. Verana Villas, a separate community on the same coast, is being built in phases: eight villas in phase 1, twelve in phase 2, and the shared amenities in phase 3 — a café, traditional baths and a training hall.",
      "The delivered villas are handed over turnkey — furniture, appliances, air conditioning, landscaping and a pool. Phangaia also has a shared pool and sun deck inside the community; Demaya Resort, a separate delivered resort of six villas in one- and two-bedroom formats, is built to the same standard.",
      "A project starts with an audit of the plot and the local building rules, a financial model and engineering design — renders come later. The villas are built to an upgraded European spec: double walls, panoramic glazing with sound and thermal insulation, insulated ceilings and premium climate control.",
    ].join("\n\n"),
    ru: [
      "ARQA Development — застройщик вилл на Ко Пангане. Команда ведёт свои посёлки по полному циклу: мастерплан, строительство, готовые дома и ежедневная работа с арендой — виллы, которые они продают, подкреплены виллами, которыми они уже управляют.",
      "Phangaia Garden Resort на западном побережье острова рядом с Тонг Салой сдан — шесть вилл, которые работают в аренде. Verana Villas — отдельный посёлок на том же побережье — строится очередями: восемь вилл в фазе 1, двенадцать в фазе 2 и общая инфраструктура в фазе 3: кафе, баня и зал для тренировок.",
      "Сданные виллы передаются под ключ: мебель, техника, кондиционеры, ландшафт и бассейн. В Phangaia есть общий бассейн с зоной отдыха; Demaya Resort — отдельный сданный резорт из шести вилл с одной и двумя спальнями — построен по тому же стандарту.",
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
        en: "Phangaia (2023–2025), Demaya, Tree House and 9 villas at Verana",
        ru: "Phangaia (2023–2025), Demaya, Tree House и 9 вилл в Verana",
      },
    },
    {
      label: { en: "Under construction", ru: "Строится" },
      value: {
        en: "Verana Villas — 7 villas for sale in phase 2",
        ru: "Verana Villas — 7 вилл в продаже, фаза 2",
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
  // Chronological: Phangaia is the developer's first project (confirmed by
  // Vladimir 2026-08-10). The order of the rest is our reading until the
  // developer sends start/handover dates.
  timeline: [
    {
      year: "2023–2025",
      title: "Phangaia Garden Resort",
      status: "built",
      description: {
        en: "Garden villa community in Nai Wok, near Thong Sala: six villas in three layouts, dark timber among the coconut palms, a shared pool with a sun deck and a garden planted with dozens of tropical species. Built from November 2023 to April 2025; the villas are delivered and operate as rentals. Three minutes from the international school, fifteen on foot to the sea, on a quiet road with no through traffic.",
        ru: "Вилловый посёлок-сад в Най Воке, рядом с Тонг Салой: шесть вилл в трёх планировках, тёмное дерево в кокосовой роще, общий бассейн с зоной отдыха и сад с десятками видов тропических растений. Построен с ноября 2023 по апрель 2025; виллы сданы и работают в аренде. Три минуты до международной школы, пятнадцать пешком до моря, тихая улица без сквозного движения.",
      },
      photo: "/images/developers/arqa/phangaia-pool.jpg",
    },
    {
      // The developer's own house, for sale through us as RW-0625 — facts come
      // from the owner's listing text (plot, floor area, layout, pool).
      title: "Tree House",
      status: "built",
      objectRw: "RW-0625",
      note: { en: "For sale · Madeau Wan", ru: "В продаже · Мадеуван" },
      description: {
        en: "A three-bedroom villa of 151 m² on an 800 m² Chanote plot in Madeau Wan, in the middle of the island. A pool with a sun deck, a covered terrace behind a lattice-block screen, micro-cement walls and timber ceilings, kitchen and living room in one volume. Delivered and furnished — the house is in our catalog.",
        ru: "Вилла с тремя спальнями, 151 м², на участке 800 м² с чанотом в Мадеуване, в центре острова. Бассейн с зоной отдыха, крытая терраса за решётчатой кладкой, микроцемент и дерево в отделке, кухня и гостиная одним объёмом. Дом сдан и меблирован — он есть в нашем каталоге.",
      },
      photo: "/images/developers/arqa/treehouse-pool.jpg",
    },
    {
      title: "Demaya Resort",
      status: "built",
      description: {
        en: "A delivered resort of six villas in two formats — one- and two-bedroom — inland, near Phaeng waterfall. Each has a private pool and sun loungers behind a green screen, an open kitchen-living room, a bedroom facing the water and a stone-clad bathroom. Handed over furnished.",
        ru: "Сданный резорт из шести вилл в двух форматах — с одной и двумя спальнями — в глубине острова, рядом с водопадом Пэнг. У каждой приватный бассейн и лежаки за зелёной ширмой, кухня-гостиная, спальня с выходом к воде и ванная в камне. Передаются меблированными.",
      },
      photo: "/images/developers/arqa/demaya-pool-view.jpg",
    },
    {
      title: "Verana Villas",
      status: "under-construction",
      rwNumber: "RW-P0018",
      note: {
        en: "A community of its own, built in three phases",
        ru: "Отдельный посёлок, три очереди",
      },
      description: {
        en: "Phase 1 — eight villas, four of them completed. Phase 2 — twelve villas, five completed and seven available to buy in one-, two- and three-bedroom formats. Phase 3 — the shared amenities: a café, traditional baths and a training hall.",
        ru: "Фаза 1 — восемь вилл, четыре из них сданы. Фаза 2 — двенадцать вилл, пять сданы, семь доступны к покупке в форматах с одной, двумя и тремя спальнями. Фаза 3 — общая инфраструктура: кафе, баня и зал для тренировок.",
      },
      photo: "/images/developers/arqa/verana-exterior-pool.jpg",
    },
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
      // Обложки (hero страницы и кадр карточки в ленте) входят в набор: иначе
      // они не листаются в лайтбоксе, а у проекта не сходится счётчик кадров.
      photos: [
        "/images/developers/arqa/phangaia-gateway.jpg",
        "/images/developers/arqa/phangaia-pool.jpg",
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
      title: "Tree House",
      note: { en: "For sale · Madeau Wan", ru: "В продаже · Мадеуван" },
      photos: ["/images/developers/arqa/treehouse-pool.jpg"],
    },
    {
      title: "Demaya Resort",
      note: { en: "Delivered · one-bedroom villa", ru: "Сдан · вилла с одной спальней" },
      photos: [
        "/images/developers/arqa/demaya-pool-view.jpg",
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
        "/images/developers/arqa/verana-exterior-pool.jpg",
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
      title: "Tree House",
      lat: 9.718785,
      lng: 100.005172,
      note: { en: "For sale · Madeau Wan", ru: "В продаже · Мадеуван" },
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
      en: "Track record and current projects by ARQA Development on Koh Phangan: the delivered Phangaia Garden Resort and Demaya Resort, and Verana Villas under construction with seven villas for sale. Enquire through Right Way.",
      ru: "Проекты застройщика ARQA Development на Ко Пангане: сданные Phangaia Garden Resort и Demaya Resort, строящиеся Verana Villas — семь вилл в продаже. Заявка — через Right Way.",
    },
  },
};
