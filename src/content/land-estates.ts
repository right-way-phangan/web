/**
 * Content for /estates — «земельные проекты»: подборки участков от одного
 * собственника (большой чанот, нарезанный на несколько продаваемых участков).
 * Аналог раздела /projects (проекты застройщиков), но для земли: одна страница
 * на подборку + таблица участков с пометкой «доступен / резерв / продан /
 * арендован».
 *
 * Источник правды — этот content-файл (как districts/knowledge), а НЕ каталог
 * amoCRM: подборка курируется вручную (особые отношения с собственником, разбивка
 * на лоты). Каждый участок может ссылаться на реальную карточку каталога через
 * `rwNumber` → /object/RW-L####.
 *
 * Публикация: estate выходит на сайт только при `published: true`. Черновики
 * (published:false) не попадают ни в индекс, ни в generateStaticParams — так на
 * прод не утекают незаполненные/иллюстративные подборки.
 *
 * Правило цен (feedback_public_copy_no_prices + здравый смысл по закрытым
 * сделкам): цену/аренду показываем только для доступных и зарезервированных
 * участков; для проданных/арендованных цена скрыта — публично только статус.
 *
 * Конфиденциальность: контакты собственника/застройщика и лидов, а также
 * КОМИССИИ застройщика (3%/5%) и цена за рай — НЕ в этом файле и НЕ на сайте.
 * Публичная цена = только «цена за участок» (asking price). Комиссии и расчёты —
 * в рабочем хабе (оперативка), лиды — в CRM. → feedback_media_publication_rule.
 */

export type PlotStatus = "available" | "reserved" | "sold" | "rented";
export type PlotTenure = "Freehold" | "Leasehold";

/** Один продаваемый участок внутри подборки. */
export interface EstatePlot {
  /** Публичная метка лота: "R7" / "M1". */
  code: string;
  /** Опциональная привязка к реальной карточке каталога (RW-L####). */
  rwNumber?: string;
  status: PlotStatus;
  tenure: PlotTenure;
  areaRai?: number;
  areaSqm?: number;
  /** Цена продажи (freehold), THB — показывается только для available/reserved. */
  priceThb?: number;
  /** Аренда (leasehold), THB за рай в месяц — показывается только для available/reserved. */
  rentPerRaiMonth?: number;
  /** Срок аренды, лет (leasehold). */
  leaseTermYears?: number;
  seaView?: boolean;
  flatLand?: boolean;
  /** Короткая бейзлайн-заметка по лоту (двуязычно). */
  note?: { en: string; ru: string };
  /**
   * Фото лота — пути под /public (например /images/estates/<slug>/r7-1.jpg).
   * Рендерятся в секции «Галерея» сгруппированными по лоту. Пока файлов нет —
   * оставляем пустым (без битых картинок); владелец кладёт файлы и заполняет.
   */
  photos?: string[];
  /**
   * Контур лота на схеме плана — полигон в координатах estate.plan.viewBox
   * (нормализованная схема разбивки, НЕ геокарта). Рендерится EstateSitePlan,
   * красится по статусу. Нет контура → лот просто не показан на схеме.
   */
  plotShape?: [number, number][];
}

/** Схема плана разбивки участка (стилизованная, не кадастровая). */
export interface EstatePlan {
  /** SVG viewBox, напр. "0 0 100 96". */
  viewBox: string;
  /** Дороги — массив SVG path `d` (рисуются под лотами). */
  roads?: string[];
  /** Сторона моря/заката для стрелки-ориентира. */
  seaSide?: "left" | "right" | "top" | "bottom";
}

export interface LandEstate {
  slug: string;
  /** Публикуется ли на сайте. false → черновик, в индекс/маршруты не попадает. */
  published: boolean;
  name: { en: string; ru: string };
  /** Название района — должно совпадать со значением DISTRICT в amoCRM (для ссылки «все объекты района»). */
  district: string;
  /** Подзаголовок-слоган. */
  tagline: { en: string; ru: string };
  /** Описание подборки — массив абзацев. */
  description: { en: string[]; ru: string[] };
  /** Обложка: путь под /public (например /images/estates/<slug>/cover.jpg) или абсолютный URL. */
  cover?: string;
  lat?: number;
  lng?: number;
  /** Ссылка Google Maps на расположение участка/подборки. */
  locationUrl?: string;
  /** Суммарная площадь подборки, рай (для шапки). Если не задано — суммируется из лотов. */
  totalAreaRai?: number;
  /** Преимущества подборки (буллеты). */
  highlights?: { en: string; ru: string }[];
  /** Схема плана разбивки (опц.) — рендерится EstateSitePlan, если задана и у лотов есть plotShape. */
  plan?: EstatePlan;
  plots: EstatePlot[];
}

/**
 * Реальная подборка: склон над Хад Яо (запад Пангана), один собственник нарезал
 * землю на лоты двух рядов — R (верхний, закатный вид на море) и M (ниже, вид на
 * горы/долину), плюс отдельный премиум-лот C10. Часть продана, часть свободна.
 * Площади/коды — с мастер-плана собственника; цены за участок — из последнего
 * прайса собственника (2026-06-17). Продано: лоты, которых нет в прайсе.
 *
 * ⚠️ Комиссии застройщика (3%/5%) и цена за рай в этот файл НЕ кладём — они в
 * рабочем хабе. На сайте — только цена за участок (свободные/резерв). По M10 чанот
 * ещё не оформлен (отражено в заметке лота). Контакты собственника/лида — в хабе.
 */
export const LAND_ESTATES: LandEstate[] = [
  {
    slug: "haad-yao-hillside",
    published: true,
    name: {
      en: "Haad Yao Hillside — plot collection",
      ru: "Хад Яо, холмы — подборка участков",
    },
    district: "Haad Yao",
    tagline: {
      en: "Sunset sea-view and mountain-view building plots from one owner on the same hillside — bought individually.",
      ru: "Участки под застройку с видом на закатное море и на горы от одного собственника на одном склоне — покупка по отдельности.",
    },
    description: {
      en: [
        "A hillside above Haad Yao on Koh Phangan's west coast, divided by a single owner into building plots across two rows. The upper R-row opens to 360° sunset sea views over Haad Yao, Haad Salad and the Ang Thong Marine Park; the M-row sits a little lower with green mountain-and-valley views. A standalone premium plot (C10), bordering protected agricultural land, rounds out the collection. Concrete road access and underground three-phase electricity are already in across the development.",
        "Every lot comes from one trusted owner, so due diligence is streamlined — and before any reservation we verify the individual Chanote title lot by lot. That step matters here: not every lot is fully titled yet (M10's Chanote conversion is still in progress, see the note on that plot). Availability is tracked live below — as lots are sold, they are marked, and we keep it current.",
      ],
      ru: [
        "Склон над Хад Яо на западном берегу Пангана, разбитый одним собственником на участки под застройку в два ряда. Верхний ряд R открывает закатный вид на море 360° — на Хад Яо, Хад Салад и морской парк Анг Тонг; ряд M расположен чуть ниже, с видом на зелёные горы и долину. Подборку дополняет отдельный премиум-лот C10 на границе с охраняемой сельхозземлёй. По всей территории уже проложены бетонные дороги и подземное трёхфазное электричество.",
        "Все лоты — от одного надёжного собственника, поэтому due diligence упрощён, и перед любым резервом мы проверяем индивидуальный чанот по каждому лоту. Здесь это важно: не на каждый лот чанот уже оформлен (по M10 перевод в чанот ещё идёт, см. заметку к лоту). Доступность отслеживаем вживую ниже — по мере продажи лоты помечаются, поддерживаем актуальность.",
      ],
    },
    cover: "/images/estates/haad-yao-hillside/r7-2.jpg", // закатный кадр R7
    lat: 9.776124,
    lng: 99.975139,
    locationUrl: "https://maps.google.com/?q=9.776124,99.975139",
    highlights: [
      { en: "One owner across the hillside — DD streamlined", ru: "Один собственник на весь склон — DD упрощён" },
      { en: "Two view tiers: sunset sea-view (R) & mountain-view (M)", ru: "Два ряда: закатный вид на море (R) и вид на горы (M)" },
      { en: "Concrete roads + underground 3-phase power in place", ru: "Бетонные дороги + подземное 3-фазное электричество готовы" },
      { en: "Individual Chanote verified per lot before reservation", ru: "Индивидуальный чанот проверяем по каждому лоту до резерва" },
    ],
    plan: {
      viewBox: "0 0 100 118",
      roads: [
        "M2,52 C26,49 54,55 76,51 C88,48.5 98,52 98,52",
        "M3.7,7 C2.4,32 2.4,72 3.7,96",
        "M3.7,96 C3.7,104 9,108 15,109",
      ],
      seaSide: "left",
    },
    plots: [
      {
        code: "R1",
        plotShape: [[22.79, 27.0], [41.1, 27.0], [40.7, 48.68], [22.99, 46.9]],
        status: "available",
        tenure: "Freehold",
        areaSqm: 2252,
        priceThb: 18_297_500,
        seaView: true,
        flatLand: true,
        note: {
          en: "Flat ridge-top platform, 360° sunset sea view. Chanote confirmed.",
          ru: "Ровная площадка на гребне, закатный вид на море 360°. Чанот подтверждён.",
        },
        photos: [
          "/images/estates/haad-yao-hillside/r1-1.jpg",
          "/images/estates/haad-yao-hillside/r1-2.jpg",
          "/images/estates/haad-yao-hillside/r1-3.jpg",
          "/images/estates/haad-yao-hillside/r1-4.jpg",
          "/images/estates/haad-yao-hillside/r1-5.jpg",
          "/images/estates/haad-yao-hillside/r1-6.jpg",
        ],
      },
      {
        code: "R2",
        plotShape: [[41.1, 27.0], [57.99, 27.0], [57.59, 48.16], [40.7, 48.68]],
        status: "sold",
        tenure: "Freehold",
        seaView: true,
      },
      {
        code: "R5",
        plotShape: [[5.0, 27.0], [22.79, 27.0], [22.99, 46.9], [5.0, 48.78]],
        status: "sold",
        tenure: "Freehold",
        seaView: true,
      },
      {
        code: "R6",
        plotShape: [[80.0, 5.14], [95.0, 5.76], [95.0, 27.0], [79.9, 27.0]],
        status: "sold",
        tenure: "Freehold",
        seaView: true,
      },
      {
        code: "R7",
        plotShape: [[44.2, 5.44], [61.7, 7.1], [60.6, 27.0], [43.5, 27.0]],
        status: "available",
        tenure: "Freehold",
        areaSqm: 3232,
        priceThb: 30_262_500,
        seaView: true,
        flatLand: true,
        note: {
          en: "Double-bay view (Haad Yao + Haad Salad), large flat areas & granite boulders. Chanote confirmed.",
          ru: "Вид на две бухты (Хад Яо + Хад Салад), большие ровные площадки и гранитные валуны. Чанот подтверждён.",
        },
        photos: [
          "/images/estates/haad-yao-hillside/r7-1.jpg",
          "/images/estates/haad-yao-hillside/r7-2.jpg",
          "/images/estates/haad-yao-hillside/r7-3.jpg",
          "/images/estates/haad-yao-hillside/r7-4.jpg",
          "/images/estates/haad-yao-hillside/r7-5.jpg",
          "/images/estates/haad-yao-hillside/r7-6.jpg",
        ],
      },
      {
        code: "R8",
        plotShape: [[61.7, 7.1], [80.0, 5.14], [79.9, 27.0], [60.6, 27.0]],
        status: "available",
        tenure: "Freehold",
        areaSqm: 3540,
        priceThb: 28_762_500,
        seaView: true,
        note: {
          en: "Large R-row lot, sunset sea view.",
          ru: "Большой лот ряда R, закатный вид на море.",
        },
        // photos: ["/images/estates/haad-yao-hillside/r8-1.jpg", ...],
      },
      {
        code: "R9",
        plotShape: [[5.0, 6.67], [44.2, 5.44], [43.5, 27.0], [5.0, 27.0]],
        status: "available",
        tenure: "Freehold",
        areaSqm: 7540,
        priceThb: 47_125_000,
        seaView: true,
        note: {
          en: "Largest plot in the collection — nearly 5 rai, sunset sea view.",
          ru: "Самый большой лот подборки — почти 5 рай, закатный вид на море.",
        },
        // photos: ["/images/estates/haad-yao-hillside/r9-1.jpg", ...],
      },
      {
        code: "R10",
        plotShape: [[76.18, 27.0], [95.0, 27.0], [95.0, 49.1], [76.68, 47.1]],
        status: "available",
        tenure: "Freehold",
        areaSqm: 2420,
        priceThb: 22_687_500,
        seaView: true,
        note: {
          en: "Sea view from the upper part, quiet end of the loop road.",
          ru: "Вид на море из верхней части, тихий конец кольцевой дороги.",
        },
        photos: [
          "/images/estates/haad-yao-hillside/r10-1.jpg",
          "/images/estates/haad-yao-hillside/r10-2.jpg",
          "/images/estates/haad-yao-hillside/r10-3.jpg",
          "/images/estates/haad-yao-hillside/r10-4.jpg",
          "/images/estates/haad-yao-hillside/r10-5.jpg",
          "/images/estates/haad-yao-hillside/r10-6.jpg",
        ],
      },
      {
        code: "R34",
        plotShape: [[57.99, 27.0], [76.18, 27.0], [76.68, 47.1], [57.59, 48.16]],
        status: "sold",
        tenure: "Freehold",
        seaView: true,
      },
      {
        code: "M1",
        plotShape: [[21.97, 57.74], [38.5, 57.34], [39.5, 77.0], [21.37, 77.0]],
        status: "available",
        tenure: "Freehold",
        areaSqm: 2448,
        priceThb: 12_240_000,
        seaView: false,
        note: {
          en: "Mountain & valley view; Chanote being confirmed.",
          ru: "Вид на горы и долину; чанот уточняется.",
        },
        photos: [
          "/images/estates/haad-yao-hillside/m1-1.jpg",
          "/images/estates/haad-yao-hillside/m1-2.jpg",
          "/images/estates/haad-yao-hillside/m1-3.jpg",
          "/images/estates/haad-yao-hillside/m1-4.jpg",
          "/images/estates/haad-yao-hillside/m1-5.jpg",
          "/images/estates/haad-yao-hillside/m1-6.jpg",
        ],
      },
      {
        code: "M2",
        plotShape: [[38.5, 57.34], [56.59, 59.1], [56.89, 77.0], [39.5, 77.0]],
        status: "available",
        tenure: "Freehold",
        areaSqm: 2444,
        priceThb: 12_220_000,
        seaView: false,
        note: {
          en: "Mountain & valley view; Chanote being confirmed.",
          ru: "Вид на горы и долину; чанот уточняется.",
        },
        photos: [
          "/images/estates/haad-yao-hillside/m2-1.jpg",
          "/images/estates/haad-yao-hillside/m2-2.jpg",
          "/images/estates/haad-yao-hillside/m2-3.jpg",
          "/images/estates/haad-yao-hillside/m2-4.jpg",
          "/images/estates/haad-yao-hillside/m2-5.jpg",
          "/images/estates/haad-yao-hillside/m2-6.jpg",
        ],
      },
      {
        code: "M3",
        plotShape: [[56.59, 59.1], [73.26, 57.37], [72.36, 77.0], [56.89, 77.0]],
        status: "sold",
        tenure: "Freehold",
        seaView: false,
      },
      {
        code: "M4",
        plotShape: [[5.0, 59.04], [21.97, 57.74], [21.37, 77.0], [5.0, 77.0]],
        status: "sold",
        tenure: "Freehold",
        seaView: false,
      },
      {
        code: "M5",
        plotShape: [[73.26, 57.37], [95.0, 58.41], [95.0, 77.0], [72.36, 77.0]],
        status: "available",
        tenure: "Freehold",
        areaSqm: 3152,
        priceThb: 10_835_000,
        seaView: false,
        note: {
          en: "Largest M-row lot; mountain & valley view. Chanote being confirmed.",
          ru: "Самый большой лот ряда M; вид на горы и долину. Чанот уточняется.",
        },
        photos: [
          "/images/estates/haad-yao-hillside/m5-1.jpg",
          "/images/estates/haad-yao-hillside/m5-2.jpg",
          "/images/estates/haad-yao-hillside/m5-3.jpg",
          "/images/estates/haad-yao-hillside/m5-4.jpg",
          "/images/estates/haad-yao-hillside/m5-5.jpg",
          "/images/estates/haad-yao-hillside/m5-6.jpg",
        ],
      },
      {
        code: "M6",
        plotShape: [[24.96, 77.0], [45.28, 77.0], [43.98, 97.07], [24.36, 95.23]],
        status: "available",
        tenure: "Freehold",
        areaSqm: 2404,
        priceThb: 12_000_000,
        seaView: false,
        note: {
          en: "Mountain & valley view. Chanote being confirmed.",
          ru: "Вид на горы и долину. Чанот уточняется.",
        },
        photos: [
          "/images/estates/haad-yao-hillside/m6-1.jpg",
          "/images/estates/haad-yao-hillside/m6-2.jpg",
          "/images/estates/haad-yao-hillside/m6-3.jpg",
          "/images/estates/haad-yao-hillside/m6-4.jpg",
          "/images/estates/haad-yao-hillside/m6-5.jpg",
          "/images/estates/haad-yao-hillside/m6-6.jpg",
        ],
      },
      {
        code: "M7",
        plotShape: [[45.28, 77.0], [64.59, 77.0], [64.09, 94.95], [43.98, 97.07]],
        status: "available",
        tenure: "Freehold",
        areaSqm: 2403,
        priceThb: 12_000_000,
        seaView: false,
        note: {
          en: "Mountain & valley view. Chanote being confirmed.",
          ru: "Вид на горы и долину. Чанот уточняется.",
        },
        photos: [
          "/images/estates/haad-yao-hillside/m7-1.jpg",
          "/images/estates/haad-yao-hillside/m7-2.jpg",
          "/images/estates/haad-yao-hillside/m7-3.jpg",
          "/images/estates/haad-yao-hillside/m7-4.jpg",
          "/images/estates/haad-yao-hillside/m7-5.jpg",
          "/images/estates/haad-yao-hillside/m7-6.jpg",
        ],
      },
      {
        code: "M8",
        plotShape: [[64.59, 77.0], [75.94, 77.0], [75.34, 95.58], [64.09, 94.95]],
        status: "available",
        tenure: "Freehold",
        areaSqm: 1382,
        priceThb: 4_743_750,
        seaView: false,
        note: {
          en: "Compact M-row lot; mountain & valley view. Chanote being confirmed.",
          ru: "Компактный лот ряда M; вид на горы и долину. Чанот уточняется.",
        },
        photos: [
          "/images/estates/haad-yao-hillside/m8-1.jpg",
          "/images/estates/haad-yao-hillside/m8-2.jpg",
          "/images/estates/haad-yao-hillside/m8-3.jpg",
          "/images/estates/haad-yao-hillside/m8-4.jpg",
          "/images/estates/haad-yao-hillside/m8-5.jpg",
          "/images/estates/haad-yao-hillside/m8-6.jpg",
        ],
      },
      {
        code: "M9",
        plotShape: [[75.94, 77.0], [95.0, 77.0], [95.0, 96.96], [75.34, 95.58]],
        status: "sold",
        tenure: "Freehold",
        seaView: false,
      },
      {
        code: "M10",
        plotShape: [[5.0, 77.0], [24.96, 77.0], [24.36, 95.23], [5.0, 96.21]],
        status: "available",
        tenure: "Freehold",
        areaSqm: 2372,
        priceThb: 13_376_250,
        seaView: false,
        note: {
          en: "Mountain view. Chanote conversion still in progress — title is under the parent deed for now (verify before reserving).",
          ru: "Вид на горы. Перевод в чанот ещё идёт — пока титул в составе родительского (проверить до резерва).",
        },
        photos: [
          "/images/estates/haad-yao-hillside/m10-1.jpg",
          "/images/estates/haad-yao-hillside/m10-2.jpg",
          "/images/estates/haad-yao-hillside/m10-3.jpg",
          "/images/estates/haad-yao-hillside/m10-4.jpg",
          "/images/estates/haad-yao-hillside/m10-5.jpg",
          "/images/estates/haad-yao-hillside/m10-6.jpg",
        ],
      },
      {
        code: "C10",
        plotShape: [[15, 104], [47, 104.6], [46, 116.5], [14, 116]],
        status: "available",
        tenure: "Freehold",
        areaSqm: 2476,
        priceThb: 14_701_250,
        seaView: true,
        note: {
          en: "Standalone premium sunset plot (separate Chanote), bordering 37 rai of protected agricultural land — open views that stay.",
          ru: "Отдельный премиум-лот с закатным видом (свой чанот), граничит с 37 рай охраняемой сельхозземли — открытый вид сохранится.",
        },
        // photos: ["/images/estates/haad-yao-hillside/c10-1.jpg", ...],
      },
    ],
  },
];

// ---- Хелперы ----

/** Только опубликованные подборки. */
export function getPublishedEstates(): LandEstate[] {
  return LAND_ESTATES.filter((e) => e.published);
}

/** Найти опубликованную подборку по slug. */
export function getEstateBySlug(slug: string): LandEstate | undefined {
  return getPublishedEstates().find((e) => e.slug === slug);
}

export interface EstateStats {
  total: number;
  available: number;
  reserved: number;
  sold: number;
  rented: number;
  /** Доступно = available (свободно к покупке/аренде прямо сейчас). */
  taken: number;
  areaRai: number;
}

/** Сводка по подборке: счётчики статусов + суммарная площадь. */
export function estateStats(estate: LandEstate): EstateStats {
  const count = (s: PlotStatus) => estate.plots.filter((p) => p.status === s).length;
  const available = count("available");
  const reserved = count("reserved");
  const sold = count("sold");
  const rented = count("rented");
  const areaRai =
    estate.totalAreaRai ??
    estate.plots.reduce((sum, p) => sum + (p.areaRai ?? 0), 0);
  return {
    total: estate.plots.length,
    available,
    reserved,
    sold,
    rented,
    taken: sold + rented + reserved,
    areaRai: Math.round(areaRai * 100) / 100,
  };
}

/** Показывать ли цену/аренду лота публично (только свободные и зарезервированные). */
export function plotPriceVisible(status: PlotStatus): boolean {
  return status === "available" || status === "reserved";
}

/** Лоты подборки с приложенными фото — для секции «Галерея» (группировка по лоту). */
export function estatePhotoPlots(estate: LandEstate): EstatePlot[] {
  return estate.plots.filter((p) => p.photos && p.photos.length > 0);
}
