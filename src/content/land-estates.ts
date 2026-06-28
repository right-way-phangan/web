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
  /** Статус чанота (тайтл-дид): «ready» (по умолчанию) или «inProgress». */
  chanote?: "ready" | "inProgress";
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
  /** GPS-пин лота (центр участка), из кадастровой геолокации. Источник реальной геометрии. */
  lat?: number;
  lng?: number;
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
  /** Готовность инфраструктуры (estate-wide) — для бейджей доверия на лотах. */
  utilities?: { road?: boolean; power?: boolean; water?: boolean };
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
    // Схема разбивки по реальному мастер-плану NXS (топология лотов, не кадастр):
    // R9 — большой верхний лот-«шея», правым основанием примыкает к M1; ниже
    // полоса R6│R7│R8 (R8 правее R7), слева вниз ряд R1/R2/R34/R5/R10, центр
    // M1–M4 → дорога → M10, справа M5–M9 к нижнему острию; C10 — отдельный лот
    // (свой чанот) ниже R10 через дорогу. Дороги — коридорами. Закат/море = слева
    // (сторона R6–R10).
    utilities: { road: true, power: true },
    plan: {
      viewBox: "0 0 100 151",
      roads: [
        // Дороги вдоль РЕАЛЬНЫХ границ участков (по GPS-пинам/кадастру), сглажено.
        // Прежняя разметка Vladimir (2026-06-22, под коробки) — в git-истории.
        "M78.2,53.3 L76.9,52.9 L74.4,52.1 L70.5,51.0 L65.4,49.5 L60.2,49.0 L55.0,49.5 L49.8,51.1 L44.5,53.9 L40.6,55.9 L37.9,57.4 L36.6,58.2 L36.4,58.5 L36.2,58.8 L35.8,59.2 L35.3,59.7 L34.6,60.3 L34.1,61.1 L33.6,62.2 L33.3,63.4 L33.0,64.8 L33.1,66.5 L33.4,68.6 L34.0,70.9 L34.9,73.6 L35.5,75.8 L35.9,77.6 L36.1,79.0 L35.9,79.9 L36.2,81.2 L36.9,82.9 L38.1,84.9 L39.7,87.1 L40.9,89.4 L41.6,91.5 L42.0,93.6 L42.1,95.7 L42.7,97.8 L43.9,100.0 L45.7,102.3 L48.2,104.6 L50.8,106.5 L53.4,108.0 L56.3,108.9 L59.2,109.4 L61.5,109.7 L63.0,110.0 L63.8,110.1 L63.8,110.2 L63.9,110.7 L64.2,111.5 L64.7,112.9 L65.2,114.6 L64.4,117.2 L62.2,120.5 L58.7,124.7 L53.9,129.6 L50.3,133.3 L47.8,135.8 L46.6,137.0", // главная: раздел R-колонки и M-колонки (по реальным границам кадастра)
        "M17.6,109.7 L19.1,110.3 L21.9,111.5 L26.3,113.3 L32.0,115.6 L36.7,118.5 L40.3,121.9 L42.8,125.8 L44.1,130.3 L45.1,133.6 L45.8,135.8 L46.1,136.9", // нижний участок раздела (R5/R10 ↔ C10/M10)
        "M78.8,55.8 L78.1,56.3 L76.9,57.4 L74.9,58.9 L72.4,61.0 L70.2,62.9 L68.6,64.6 L67.3,66.2 L66.4,67.5 L65.6,69.6 L64.9,72.5 L64.2,76.1 L63.5,80.5 L63.2,84.2 L63.2,87.0 L63.6,89.2 L64.2,90.8 L64.7,93.0 L64.8,95.8 L64.7,99.4 L64.3,103.7 L64.0,106.9 L63.8,109.0 L63.7,110.1", // восточная ветка: M-центр ↔ M5–M9 (верх)
        "M66.0,117.3 L66.3,117.6 L67.0,118.2 L68.0,119.1 L69.4,120.4 L70.6,122.0 L71.7,124.1 L72.6,126.5 L73.4,129.3 L73.8,132.0 L73.8,134.7 L73.4,137.2 L72.6,139.8 L72.0,141.6 L71.6,142.9 L71.4,143.5", // восточная ветка (низ)
      ],
      seaSide: "left",
    },
    plots: [
      {
        code: "R1",
        plotShape: [[32.7, 66.9], [33.6, 61.2], [17.7, 55.2], [6.0, 58.4], [10.3, 77.5]],
        lat: 9.7755023,
        lng: 99.9753057,
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
        plotShape: [[36.2, 77.5], [32.7, 66.9], [10.3, 77.5], [14.3, 94.9], [35.8, 81.4]],
        lat: 9.7751786,
        lng: 99.9754592,
        status: "sold",
        tenure: "Freehold",
        seaView: true,
      },
      {
        code: "R5",
        plotShape: [[40.8, 119.2], [51.8, 108.2], [42.1, 98.6], [16.8, 105.9], [17.6, 109.7]],
        lat: 9.7744066,
        lng: 99.9758113,
        status: "sold",
        tenure: "Freehold",
        seaView: true,
      },
      {
        code: "R6",
        plotShape: [[17.7, 55.2], [14.9, 24.8], [0.0, 32.0], [6.0, 58.4]],
        lat: 9.7759944,
        lng: 99.9751732,
        status: "sold",
        tenure: "Freehold",
        seaView: true,
      },
      {
        code: "R7",
        plotShape: [[36.8, 57.9], [24.9, 19.9], [14.9, 24.8], [17.7, 55.2], [33.6, 61.2], [36.3, 58.8]],
        lat: 9.7760251,
        lng: 99.9755049,
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
        plotShape: [[57.5, 47.1], [31.1, 16.9], [24.9, 19.9], [36.8, 57.9]],
        lat: 9.7761472,
        lng: 99.9758979,
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
        plotShape: [[78.3, 53.3], [65.8, 0.0], [31.1, 16.9], [57.5, 47.1]],
        lat: 9.7765912,
        lng: 99.976408,
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
        plotShape: [[46.1, 136.9], [46.6, 137.0], [66.0, 117.4], [63.9, 110.3], [63.7, 110.1], [51.8, 108.2], [40.8, 119.2]],
        lat: 9.7741209,
        lng: 99.9760994,
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
          "/images/estates/haad-yao-hillside/r10-2.jpg",
          "/images/estates/haad-yao-hillside/r10-3.jpg",
          "/images/estates/haad-yao-hillside/r10-4.jpg",
          "/images/estates/haad-yao-hillside/r10-5.jpg",
          "/images/estates/haad-yao-hillside/r10-6.jpg",
        ],
      },
      {
        code: "R34",
        plotShape: [[42.1, 98.6], [42.0, 90.6], [35.8, 81.4], [14.3, 94.9], [16.8, 105.9]],
        lat: 9.7747992,
        lng: 99.9756979,
        status: "sold",
        tenure: "Freehold",
        seaView: true,
      },
      {
        code: "M1",
        plotShape: [[78.8, 55.8], [78.3, 53.3], [57.5, 47.1], [36.8, 57.9], [36.3, 58.8], [68.5, 64.1]],
        lat: 9.7756944,
        lng: 99.9761347,
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
        plotShape: [[68.5, 64.1], [36.3, 58.8], [33.6, 61.2], [32.7, 66.9], [36.2, 77.5], [65.2, 69.6]],
        lat: 9.7753836,
        lng: 99.9760831,
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
        ],
      },
      {
        code: "M3",
        plotShape: [[65.2, 69.6], [36.2, 77.5], [35.8, 81.4], [42.0, 90.6], [62.5, 87.0]],
        lat: 9.7751087,
        lng: 99.9761587,
        status: "sold",
        tenure: "Freehold",
        seaView: false,
      },
      {
        code: "M4",
        plotShape: [[62.5, 87.0], [42.0, 90.6], [42.1, 98.6], [51.8, 108.2], [63.7, 110.1], [65.3, 93.0]],
        lat: 9.7748079,
        lng: 99.9762114,
        status: "sold",
        tenure: "Freehold",
        seaView: false,
      },
      {
        code: "M5",
        plotShape: [[85.6, 84.6], [78.8, 55.8], [68.5, 64.1], [65.2, 69.6], [62.5, 87.0], [65.3, 93.0]],
        lat: 9.775027,
        lng: 99.9766792,
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
          "/images/estates/haad-yao-hillside/m5-3.jpg",
          "/images/estates/haad-yao-hillside/m5-4.jpg",
          "/images/estates/haad-yao-hillside/m5-5.jpg",
          "/images/estates/haad-yao-hillside/m5-6.jpg",
        ],
      },
      {
        code: "M6",
        plotShape: [[89.5, 101.2], [85.6, 84.6], [65.3, 93.0], [63.7, 110.1], [63.9, 110.3]],
        lat: 9.7747553,
        lng: 99.9767924,
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
        plotShape: [[93.3, 118.8], [90.9, 107.2], [89.5, 101.2], [63.9, 110.3], [66.0, 117.4], [71.3, 122.3]],
        lat: 9.7743717,
        lng: 99.9769315,
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
        ],
      },
      {
        code: "M8",
        plotShape: [[95.3, 128.2], [93.3, 118.8], [71.3, 122.3], [74.6, 133.5]],
        lat: 9.7739849,
        lng: 99.9769942,
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
          "/images/estates/haad-yao-hillside/m8-2.jpg",
          "/images/estates/haad-yao-hillside/m8-3.jpg",
          "/images/estates/haad-yao-hillside/m8-4.jpg",
          "/images/estates/haad-yao-hillside/m8-5.jpg",
          "/images/estates/haad-yao-hillside/m8-6.jpg",
        ],
      },
      {
        code: "M9",
        plotShape: [[71.4, 143.5], [100.0, 150.9], [95.3, 128.2], [74.6, 133.5]],
        lat: 9.7736037,
        lng: 99.9770933,
        status: "sold",
        tenure: "Freehold",
        seaView: false,
      },
      {
        code: "M10",
        plotShape: [[46.6, 137.0], [71.4, 143.5], [74.6, 133.5], [71.3, 122.3], [66.0, 117.4]],
        // GPS-пин не предоставлен — позиция оценена по паттерну
        status: "available",
        tenure: "Freehold",
        areaSqm: 2372,
        priceThb: 13_376_250,
        seaView: false,
        chanote: "inProgress",
        note: {
          en: "Mountain view. Chanote conversion still in progress — title is under the parent deed for now (verify before reserving).",
          ru: "Вид на горы. Перевод в чанот ещё идёт — пока титул в составе родительского (проверить до резерва).",
        },
        photos: [
          "/images/estates/haad-yao-hillside/m10-2.jpg",
          "/images/estates/haad-yao-hillside/m10-3.jpg",
          "/images/estates/haad-yao-hillside/m10-4.jpg",
          "/images/estates/haad-yao-hillside/m10-5.jpg",
          "/images/estates/haad-yao-hillside/m10-6.jpg",
        ],
      },
      {
        code: "C10",
        plotShape: [[22.4, 130.7], [46.1, 136.9], [40.8, 119.2], [17.6, 109.7]],
        // GPS-пин не предоставлен — позиция оценена по паттерну
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

/** Минимальная цена среди свободных freehold-лотов (для «от ฿X»). null — нет. */
export function estatePriceFrom(estate: LandEstate): number | null {
  const prices = estate.plots
    .filter((p) => p.status === "available" && p.tenure === "Freehold" && p.priceThb)
    .map((p) => p.priceThb as number);
  return prices.length ? Math.min(...prices) : null;
}

/** Лоты подборки с приложенными фото — для секции «Галерея» (группировка по лоту). */
export function estatePhotoPlots(estate: LandEstate): EstatePlot[] {
  return estate.plots.filter((p) => p.photos && p.photos.length > 0);
}

export interface BuildPotential {
  /** Ориентировочная застраиваемая площадь, м² (≈30% покрытия — типовая норма Таиланда). */
  coverageSqm: number;
  /** Ориентировочное число вилл (≈1 на 1500 м²), минимум 1. */
  villas: number;
}

/**
 * Грубая оценка «что можно построить» на лоте — ТОЛЬКО ориентир для интереса
 * (не юр.заключение): застраиваемая площадь при ~30% покрытии и индикативное
 * число вилл. Без areaSqm — null.
 */
export function buildPotential(plot: EstatePlot): BuildPotential | null {
  if (!plot.areaSqm) return null;
  return {
    coverageSqm: Math.round((plot.areaSqm * 0.3) / 10) * 10,
    villas: Math.max(1, Math.round(plot.areaSqm / 1500)),
  };
}
