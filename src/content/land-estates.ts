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
    cover: undefined, // /images/estates/haad-yao-hillside/cover.jpg — добавить фото
    lat: 9.776124,
    lng: 99.975139,
    locationUrl: "https://maps.google.com/?q=9.776124,99.975139",
    highlights: [
      { en: "One owner across the hillside — DD streamlined", ru: "Один собственник на весь склон — DD упрощён" },
      { en: "Two view tiers: sunset sea-view (R) & mountain-view (M)", ru: "Два ряда: закатный вид на море (R) и вид на горы (M)" },
      { en: "Concrete roads + underground 3-phase power in place", ru: "Бетонные дороги + подземное 3-фазное электричество готовы" },
      { en: "Individual Chanote verified per lot before reservation", ru: "Индивидуальный чанот проверяем по каждому лоту до резерва" },
    ],
    plots: [
      {
        code: "R1",
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
        // photos: ["/images/estates/haad-yao-hillside/r1-1.jpg", ...],
      },
      {
        code: "R2",
        status: "sold",
        tenure: "Freehold",
        seaView: true,
      },
      {
        code: "R5",
        status: "sold",
        tenure: "Freehold",
        seaView: true,
      },
      {
        code: "R6",
        status: "sold",
        tenure: "Freehold",
        seaView: true,
      },
      {
        code: "R7",
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
        // photos: ["/images/estates/haad-yao-hillside/r7-1.jpg", ...],
      },
      {
        code: "R8",
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
        status: "available",
        tenure: "Freehold",
        areaSqm: 2420,
        priceThb: 22_687_500,
        seaView: true,
        note: {
          en: "Sea view from the upper part, quiet end of the loop road.",
          ru: "Вид на море из верхней части, тихий конец кольцевой дороги.",
        },
        // photos: ["/images/estates/haad-yao-hillside/r10-1.jpg", ...],
      },
      {
        code: "R34",
        status: "sold",
        tenure: "Freehold",
        seaView: true,
      },
      {
        code: "M1",
        status: "available",
        tenure: "Freehold",
        areaSqm: 2448,
        priceThb: 12_240_000,
        seaView: false,
        note: {
          en: "Mountain & valley view; Chanote being confirmed.",
          ru: "Вид на горы и долину; чанот уточняется.",
        },
        // photos: ["/images/estates/haad-yao-hillside/m1-1.jpg", ...],
      },
      {
        code: "M2",
        status: "available",
        tenure: "Freehold",
        areaSqm: 2444,
        priceThb: 12_220_000,
        seaView: false,
        note: {
          en: "Mountain & valley view; Chanote being confirmed.",
          ru: "Вид на горы и долину; чанот уточняется.",
        },
        // photos: ["/images/estates/haad-yao-hillside/m2-1.jpg", ...],
      },
      {
        code: "M3",
        status: "sold",
        tenure: "Freehold",
        seaView: false,
      },
      {
        code: "M4",
        status: "sold",
        tenure: "Freehold",
        seaView: false,
      },
      {
        code: "M5",
        status: "available",
        tenure: "Freehold",
        areaSqm: 3152,
        priceThb: 10_835_000,
        seaView: false,
        note: {
          en: "Largest M-row lot; mountain & valley view. Chanote being confirmed.",
          ru: "Самый большой лот ряда M; вид на горы и долину. Чанот уточняется.",
        },
        // photos: ["/images/estates/haad-yao-hillside/m5-1.jpg", ...],
      },
      {
        code: "M6",
        status: "available",
        tenure: "Freehold",
        areaSqm: 2404,
        priceThb: 12_000_000,
        seaView: false,
        note: {
          en: "Mountain & valley view. Chanote being confirmed.",
          ru: "Вид на горы и долину. Чанот уточняется.",
        },
        // photos: ["/images/estates/haad-yao-hillside/m6-1.jpg", ...],
      },
      {
        code: "M7",
        status: "available",
        tenure: "Freehold",
        areaSqm: 2403,
        priceThb: 12_000_000,
        seaView: false,
        note: {
          en: "Mountain & valley view. Chanote being confirmed.",
          ru: "Вид на горы и долину. Чанот уточняется.",
        },
        // photos: ["/images/estates/haad-yao-hillside/m7-1.jpg", ...],
      },
      {
        code: "M8",
        status: "available",
        tenure: "Freehold",
        areaSqm: 1382,
        priceThb: 4_743_750,
        seaView: false,
        note: {
          en: "Compact M-row lot; mountain & valley view. Chanote being confirmed.",
          ru: "Компактный лот ряда M; вид на горы и долину. Чанот уточняется.",
        },
        // photos: ["/images/estates/haad-yao-hillside/m8-1.jpg", ...],
      },
      {
        code: "M9",
        status: "sold",
        tenure: "Freehold",
        seaView: false,
      },
      {
        code: "M10",
        status: "available",
        tenure: "Freehold",
        areaSqm: 2372,
        priceThb: 13_376_250,
        seaView: false,
        note: {
          en: "Mountain view. Chanote conversion still in progress — title is under the parent deed for now (verify before reserving).",
          ru: "Вид на горы. Перевод в чанот ещё идёт — пока титул в составе родительского (проверить до резерва).",
        },
        // photos: ["/images/estates/haad-yao-hillside/m10-1.jpg", ...],
      },
      {
        code: "C10",
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
