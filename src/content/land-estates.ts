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
 * Конфиденциальность: контакты собственника/застройщика и лидов НЕ кладём в этот
 * файл и НЕ выводим на сайт — они в рабочем хабе (оперативка). Лиды — в CRM.
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
 * родительский титул на лоты двух рядов — R (верхний, закатный вид на море) и
 * M (ниже, вид на горы/долину). Часть продана, часть свободна. Площади и коды
 * лотов — с мастер-плана собственника; цены R1/R7 — из открытого каталога
 * застройщика, по остальным свободным — «по запросу» (уточняем).
 *
 * ⚠️ Перед публичным анонсом подтвердить у собственника: статусы лотов, цены по
 * M1/M2/R10/M10 и индивидуальный чанот по каждому лоту (по M10 чанот ещё не
 * оформлен — отражено в заметке лота). Контакты собственника/лида — в рабочем хабе.
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
      en: "Sunset sea-view and mountain-view building plots from one owner on the same hillside — one parent title, bought individually.",
      ru: "Участки под застройку с видом на закатное море и на горы от одного собственника на одном склоне — один родительский титул, покупка по отдельности.",
    },
    description: {
      en: [
        "A hillside above Haad Yao on Koh Phangan's west coast, divided by a single owner into building plots across two rows. The upper R-row opens to 360° sunset sea views over Haad Yao, Haad Salad and the Ang Thong Marine Park; the M-row sits a little lower with green mountain-and-valley views. Concrete road access and underground three-phase electricity are already in across the development.",
        "Because every lot comes from one owner under one parent title, due diligence is done once and inherited by each plot. Before any reservation we verify the individual Chanote title lot by lot — a step that matters here: not every lot is fully titled yet (M10's Chanote conversion is still in progress, see the note on that plot). Availability is tracked live below — as lots are sold, they are marked, and we keep it current.",
      ],
      ru: [
        "Склон над Хад Яо на западном берегу Пангана, разбитый одним собственником на участки под застройку в два ряда. Верхний ряд R открывает закатный вид на море 360° — на Хад Яо, Хад Салад и морской парк Анг Тонг; ряд M расположен чуть ниже, с видом на зелёные горы и долину. По всей территории уже проложены бетонные дороги и подземное трёхфазное электричество.",
        "Поскольку все лоты — от одного собственника под единым родительским титулом, due diligence делается один раз и наследуется каждым участком. Перед любым резервом мы проверяем индивидуальный чанот по каждому лоту — здесь это важно: не на каждый лот чанот уже оформлен (по M10 перевод в чанот ещё идёт, см. заметку к лоту). Доступность отслеживаем вживую ниже — по мере продажи лоты помечаются, поддерживаем актуальность.",
      ],
    },
    cover: undefined, // /images/estates/haad-yao-hillside/cover.jpg — добавить фото
    lat: 9.776124,
    lng: 99.975139,
    locationUrl: "https://maps.google.com/?q=9.776124,99.975139",
    highlights: [
      { en: "One owner, one parent title — DD done once", ru: "Один собственник, один родительский титул — DD один раз" },
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
        priceThb: 18_300_000,
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
        priceThb: 30_300_000,
        seaView: true,
        flatLand: true,
        note: {
          en: "Double-bay view (Haad Yao + Haad Salad), large flat areas & granite boulders. Chanote confirmed.",
          ru: "Вид на две бухты (Хад Яо + Хад Салад), большие ровные площадки и гранитные валуны. Чанот подтверждён.",
        },
        // photos: ["/images/estates/haad-yao-hillside/r7-1.jpg", ...],
      },
      {
        code: "R10",
        status: "available",
        tenure: "Freehold",
        areaSqm: 2420,
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
        seaView: false,
        note: {
          en: "Mountain view. Chanote conversion still in progress — title is under the parent deed for now (verify before reserving).",
          ru: "Вид на горы. Перевод в чанот ещё идёт — пока титул в составе родительского (проверить до резерва).",
        },
        // photos: ["/images/estates/haad-yao-hillside/m10-1.jpg", ...],
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
