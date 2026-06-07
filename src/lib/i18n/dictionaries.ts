/**
 * i18n foundation. The English site is the default and lives at the root (no
 * locale prefix) — untouched. Russian lives under /ru. Rather than restructure
 * the whole app tree into [locale] (invasive on a live site), this scaffold
 * starts with a dictionary that drives the localized home page; further routes
 * can be ported one at a time as RU copy is written.
 *
 * Editorial: RU is the primary audience language alongside EN (the agency's
 * core differentiator). Listing content itself stays EN for now (it comes from
 * amoCRM); the chrome and marketing copy localize first.
 */

export const LOCALES = ["en", "ru"] as const;
export type Locale = (typeof LOCALES)[number];
export const DEFAULT_LOCALE: Locale = "en";

export interface HomeDict {
  hero: {
    eyebrow: string;
    titleHtml: string; // may contain a single <em>…</em>
    lede: string;
    ctaBrowse: string;
    ctaProcess: string;
  };
  values: {
    eyebrow: string;
    title: string;
    lede: string;
    items: { title: string; text: string }[];
  };
  featured: { eyebrow: string; title: string; lede: string };
  cta: { eyebrow: string; title: string; lede: string; browse: string; talk: string };
  inProgress: string;
}

const en: HomeDict = {
  hero: {
    eyebrow: "Koh Phangan · Thailand",
    titleHtml: "Land, villas, and homes — <em>curated</em> on Phangan.",
    lede: "A boutique agency for international buyers. Verified listings, transparent process, AI-assisted search across every district on the island.",
    ctaBrowse: "Browse listings",
    ctaProcess: "How we work",
  },
  values: {
    eyebrow: "Why Right Way",
    title: "Boutique, not brokerage.",
    lede: "Three things we do differently from the rest of the island.",
    items: [
      {
        title: "Phangan specialists",
        text: "Every listing is on Koh Phangan. We know each district personally — Sri Thanu, Thong Sala, Haad Salad, Bottle Beach, and the rest.",
      },
      {
        title: "Transparent process",
        text: "Verified ownership, real prices, clear closing steps. Foreign-buyer friendly: Chanote checks, lease structuring, lawyer introductions.",
      },
      {
        title: "AI-assisted search",
        text: "Tell us what you want — sunset view, walking distance to beach, 2-rai plot — and we narrow the island down to the ten worth seeing.",
      },
    ],
  },
  featured: {
    eyebrow: "Featured",
    title: "A few we'd show you first.",
    lede: "A sample of what's on the island right now.",
  },
  cta: {
    eyebrow: "Ready when you are",
    title: "Find your place on Phangan.",
    lede: "Tell us what matters — a sunset view, walking distance to the beach, a buildable plot in a quiet district — and we'll narrow the island down to the handful worth seeing.",
    browse: "Browse listings",
    talk: "Talk to us",
  },
  inProgress: "",
};

const ru: HomeDict = {
  hero: {
    eyebrow: "Ко Панган · Таиланд",
    titleHtml: "Земля, виллы и дома — <em>с отбором</em> на Пангане.",
    lede: "Бутиковое агентство для иностранных покупателей. Проверенные объекты, прозрачный процесс и поиск по всему острову с помощью ИИ.",
    ctaBrowse: "Смотреть объекты",
    ctaProcess: "Как мы работаем",
  },
  values: {
    eyebrow: "Почему Right Way",
    title: "Бутик, а не «риелторская контора».",
    lede: "Три вещи, которые мы делаем иначе, чем остальные на острове.",
    items: [
      {
        title: "Специалисты по Пангану",
        text: "Все объекты — на Ко Пангане. Мы лично знаем каждый район: Шри Тану, Тонг Сала, Хад Салад, Боттл Бич и остальные.",
      },
      {
        title: "Прозрачный процесс",
        text: "Проверенное право собственности, реальные цены, понятные шаги сделки. Удобно для иностранцев: проверка чанота, оформление аренды, контакты юристов.",
      },
      {
        title: "Поиск с помощью ИИ",
        text: "Скажите, что нужно — вид на закат, пешком до пляжа, участок на 2 рая — и мы сузим остров до десяти объектов, которые стоит посмотреть.",
      },
    ],
  },
  featured: {
    eyebrow: "Избранное",
    title: "С чего мы бы начали показ.",
    lede: "Несколько объектов из того, что есть на острове прямо сейчас.",
  },
  cta: {
    eyebrow: "Когда будете готовы",
    title: "Найдите своё место на Пангане.",
    lede: "Расскажите, что важно — вид на закат, пешком до пляжа, участок под застройку в тихом районе — и мы сузим остров до нескольких вариантов, которые стоит посмотреть.",
    browse: "Смотреть объекты",
    talk: "Связаться с нами",
  },
  inProgress:
    "Русская версия в разработке. Каталог и формы работают; часть страниц пока доступна только на английском.",
};

const DICTS: Record<Locale, HomeDict> = { en, ru };

export function getHomeDict(locale: Locale): HomeDict {
  return DICTS[locale];
}
