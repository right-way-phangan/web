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

// ---- Global chrome (header nav + CTA) ----

export interface ChromeDict {
  nav: { label: string; href: string }[];
  getInTouch: string;
  savedAria: string;
}

const chrome: Record<Locale, ChromeDict> = {
  en: {
    nav: [
      { label: "Listings", href: "/listings" },
      { label: "Districts", href: "/districts" },
      { label: "Calculator", href: "/calculator" },
      { label: "Insights", href: "/insights" },
      { label: "About", href: "/about" },
      { label: "Knowledge", href: "/knowledge" },
      { label: "Contact", href: "/contact" },
    ],
    getInTouch: "Get in touch",
    savedAria: "Saved listings",
  },
  ru: {
    nav: [
      { label: "Объекты", href: "/listings" },
      { label: "Районы", href: "/districts" },
      { label: "Калькулятор", href: "/calculator" },
      { label: "Аналитика", href: "/insights" },
      { label: "О нас", href: "/ru/about" },
      { label: "База знаний", href: "/knowledge" },
      { label: "Контакты", href: "/ru/contact" },
    ],
    getInTouch: "Связаться",
    savedAria: "Избранные объекты",
  },
};

export function getChromeDict(locale: Locale): ChromeDict {
  return chrome[locale];
}

// ---- Lead form labels ----

export interface FormDict {
  name: string;
  namePlaceholder: string;
  email: string;
  phone: string;
  message: string;
  submit: string;
  sending: string;
  success: string;
  privacy: string;
}

const form: Record<Locale, FormDict> = {
  en: {
    name: "Name",
    namePlaceholder: "Your name",
    email: "Email",
    phone: "Phone (optional)",
    message: "Message",
    submit: "Send enquiry",
    sending: "Sending…",
    success: "Thanks — we'll be in touch within the working day.",
    privacy: "We reply within the working day. No spam, ever.",
  },
  ru: {
    name: "Имя",
    namePlaceholder: "Ваше имя",
    email: "Email",
    phone: "Телефон (необязательно)",
    message: "Сообщение",
    submit: "Отправить запрос",
    sending: "Отправляем…",
    success: "Спасибо — ответим в течение рабочего дня.",
    privacy: "Отвечаем в течение рабочего дня. Без спама.",
  },
};

export function getFormDict(locale: Locale): FormDict {
  return form[locale];
}

// ---- About page ----

export interface AboutDict {
  hero: { eyebrow: string; title: string; lede: string };
  principlesEyebrow: string;
  principlesTitle: string;
  principles: { title: string; text: string }[];
  nameSection: { eyebrow: string; title: string; body: string[] };
  founder: { eyebrow: string; name: string; role: string; body: string; languages: string; whatsapp: string; contact: string };
}

const about: Record<Locale, AboutDict> = {
  en: {
    hero: {
      eyebrow: "About",
      title: "A boutique advisory, not a listing portal.",
      lede: "Right Way Phangan Group was founded in 2026 by Vladimir Buryi, building on four years of operational work in the local land market. We are a small, specialised team focused exclusively on Koh Phangan property.",
    },
    principlesEyebrow: "What we believe",
    principlesTitle: "Three principles, in plain language.",
    principles: [
      {
        title: "Honesty over polish",
        text: "If a property has issues, you hear about them before we walk on-site. Our reputation depends on long-term relationships, not single transactions.",
      },
      {
        title: "Process over hustle",
        text: "Every transaction follows a documented sequence: title search, boundary verification, encumbrance check, zoning, access rights, tax exposure. Nothing improvised, nothing skipped.",
      },
      {
        title: "Data over opinion",
        text: "We track price per rai by district, leasehold escalation norms, time-on-market — and we share what we know with our clients.",
      },
    ],
    nameSection: {
      eyebrow: "The name",
      title: 'Why "Right Way"',
      body: [
        "The name reflects a position rather than a slogan: there is a right way to buy property on Phangan, and there are several easier, faster ways that result in disputes, lost deposits, or unbuildable land.",
        "We optimise for the first path. It costs a little more time. It is rarely the wrong choice.",
      ],
    },
    founder: {
      eyebrow: "The founder",
      name: "Vladimir Buryi",
      role: "Founder · Koh Phangan",
      body: "Originally from Saint Petersburg, Russia. Four years operating in the Phangan land market, with hundreds of land plots assessed and over forty transactions supported in the local market. Based on Koh Phangan year-round from July 2026.",
      languages: "Languages: English, Russian.",
      whatsapp: "Message on WhatsApp",
      contact: "Get in touch",
    },
  },
  ru: {
    hero: {
      eyebrow: "О нас",
      title: "Бутиковое агентство, а не портал объявлений.",
      lede: "Right Way Phangan Group основана в 2026 году Владимиром Бурым на базе четырёх лет работы на местном рынке земли. Небольшая команда специалистов, сосредоточенная только на недвижимости Ко Пангана.",
    },
    principlesEyebrow: "Во что мы верим",
    principlesTitle: "Три принципа, простыми словами.",
    principles: [
      {
        title: "Честность важнее «глянца»",
        text: "Если у объекта есть проблемы, вы узнаёте о них до выезда на место. Наша репутация держится на долгих отношениях, а не на разовых сделках.",
      },
      {
        title: "Процесс важнее суеты",
        text: "Каждая сделка идёт по задокументированной последовательности: проверка титула, границ, обременений, зонирования, прав доступа, налогов. Ничего «на ходу», ничего не пропускаем.",
      },
      {
        title: "Данные важнее мнений",
        text: "Мы отслеживаем цену за рай по районам, нормы индексации аренды, срок экспозиции — и делимся этим с клиентами.",
      },
    ],
    nameSection: {
      eyebrow: "О названии",
      title: "Почему «Right Way»",
      body: [
        "Название — это позиция, а не слоган: есть правильный путь покупки недвижимости на Пангане, и есть несколько более простых и быстрых путей, которые заканчиваются спорами, потерянными задатками или непригодной для застройки землёй.",
        "Мы выбираем первый путь. Он стоит чуть больше времени. И почти никогда не оказывается ошибкой.",
      ],
    },
    founder: {
      eyebrow: "Основатель",
      name: "Владимир Бурый",
      role: "Основатель · Ко Панган",
      body: "Родом из Санкт-Петербурга. Четыре года работы на рынке земли Пангана: сотни оценённых участков и более сорока сопровождённых сделок на местном рынке. Постоянно на Ко Пангане с июля 2026 года.",
      languages: "Языки: английский, русский.",
      whatsapp: "Написать в WhatsApp",
      contact: "Связаться",
    },
  },
};

export function getAboutDict(locale: Locale): AboutDict {
  return about[locale];
}

// ---- Contact page ----

export interface ContactDict {
  hero: { eyebrow: string; title: string; lede: string };
  formHeading: string;
  formLede: string;
}

const contact: Record<Locale, ContactDict> = {
  en: {
    hero: {
      eyebrow: "Contact",
      title: "Tell us what you're looking for.",
      lede: "Send a brief and we'll match it against our active inventory. If you already have a specific listing in mind, mention the RW-#### code.",
    },
    formHeading: "Send a brief",
    formLede: "The more specific, the faster we can help.",
  },
  ru: {
    hero: {
      eyebrow: "Контакты",
      title: "Расскажите, что вы ищете.",
      lede: "Опишите задачу — мы сопоставим её с нашими активными объектами. Если уже присмотрели конкретный объект, укажите его код RW-####.",
    },
    formHeading: "Опишите задачу",
    formLede: "Чем конкретнее, тем быстрее мы поможем.",
  },
};

export function getContactDict(locale: Locale): ContactDict {
  return contact[locale];
}
