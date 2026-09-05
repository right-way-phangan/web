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
    intentLabel: string; // "I'm looking for"
    intents: string[]; // chip labels — zipped with HERO_INTENT_PATHS by index
  };
  values: {
    eyebrow: string;
    title: string;
    lede: string;
    items: { title: string; text: string }[];
  };
  tools: {
    eyebrow: string;
    title: string;
    lede: string;
    items: { title: string; text: string; href: string }[];
    moreLabel: string;
    more: { label: string; href: string }[];
  };
  featured: { eyebrow: string; title: string; lede: string };
  stats: {
    listings: string;
    districts: string;
    reply: string;
    replyValue: string;
    vetted: string;
    vettedValue: string;
  };
  cta: { eyebrow: string; title: string; lede: string; browse: string; talk: string };
  // Титры скролл-падения героя (hero-fall): подсказка скролла, кнопка пропуска
  // и ровно 3 чекпоинта-фишки, всплывающие по ходу снижения.
  heroFlight: {
    scrollCue: string;
    skip: string;
    checkpoints: { title: string; text: string }[];
  };
}

const en: HomeDict = {
  hero: {
    eyebrow: "Koh Phangan · Thailand",
    titleHtml: "Land, villas and homes on Phangan — <em>done right</em>.",
    lede: "Title, zoning, numbers — checked before the deal.",
    ctaBrowse: "Browse listings",
    ctaProcess: "How we work",
    intentLabel: "I'm looking for",
    intents: ["Beachfront", "Sea view", "Land", "Villas", "Leasehold"],
  },
  values: {
    eyebrow: "Why Right Way",
    title: "Specialists, not a brokerage.",
    lede: "Three things we do differently.",
    items: [
      {
        title: "Phangan specialists",
        text: "Every listing is on Koh Phangan. We know each district — Sri Thanu, Thong Sala, Haad Salad, Bottle Beach.",
      },
      {
        title: "Transparent process",
        text: "Verified ownership, prices upfront, clear closing steps. For foreign buyers: Chanote checks, lease structuring, lawyer introductions.",
      },
      {
        title: "Honest numbers",
        text: "Yields, price history, drawbacks — all in. Our reports and calculator show figures we'd trust with our own money. No fantasy returns.",
      },
    ],
  },
  tools: {
    eyebrow: "Tools",
    title: "Run the numbers yourself.",
    lede: "Free, no sign-up. The data behind every listing, open to you.",
    items: [
      {
        title: "Investment calculator",
        text: "Project value, ROI and rent — for one of our listings or your own property.",
        href: "/calculator",
      },
      {
        title: "What's it worth?",
        text: "Estimate land or a villa against real island sales data.",
        href: "/tools/estimate",
      },
      {
        title: "Market insights",
        text: "Nightly rates, occupancy and district ratings — a live read of the rental market.",
        href: "/insights",
      },
    ],
    moreLabel: "More tools",
    more: [
      { label: "What can I build?", href: "/tools/zoning" },
      { label: "Buying guides", href: "/knowledge" },
      { label: "FAQ", href: "/faq" },
    ],
  },
  featured: {
    eyebrow: "Featured",
    title: "A few we'd show you first.",
    lede: "A sample of what's on the island right now.",
  },
  stats: {
    listings: "active listings",
    districts: "districts covered",
    reply: "typical first reply",
    replyValue: "≈ 1 hour",
    vetted: "due diligence, every deal",
    vettedValue: "2-level",
  },
  cta: {
    eyebrow: "Tell us what you want",
    title: "Find your place on Phangan.",
    lede: "A sunset view, walking distance to the beach, a buildable plot in a quiet district — we'll send the few worth seeing.",
    browse: "Browse listings",
    talk: "Talk to us",
  },
  heroFlight: {
    scrollCue: "Scroll to descend",
    skip: "Skip intro",
    checkpoints: [
      {
        title: "Checked before the deal",
        text: "Two-level due diligence on every transaction.",
      },
      {
        title: "Honest numbers, AI-checked",
        text: "Valuation and ROI on real island data — not fantasy returns.",
      },
      {
        title: "Cadastre & zoning, mapped",
        text: "Title class and build zones for any plot on the island.",
      },
    ],
  },
};

const ru: HomeDict = {
  hero: {
    eyebrow: "Ко Панган · Таиланд",
    titleHtml: "Земля, виллы и дома на Пангане — <em>как надо</em>.",
    lede: "Документ, зоны, цифры — проверяем до сделки.",
    ctaBrowse: "Смотреть объекты",
    ctaProcess: "Как мы работаем",
    intentLabel: "Я ищу",
    intents: ["Первая линия", "Вид на море", "Землю", "Виллы", "Аренду земли"],
  },
  values: {
    eyebrow: "Почему Right Way",
    title: "Специалисты, а не «риелторская контора».",
    lede: "Три вещи, которые мы делаем иначе.",
    items: [
      {
        title: "Специалисты по Пангану",
        text: "Все объекты — на Ко Пангане. Знаем каждый район: Шри Тану, Тонг Сала, Хад Салад, Боттл Бич.",
      },
      {
        title: "Прозрачный процесс",
        text: "Проверенное право собственности, цены без накруток, понятные шаги сделки. Для иностранцев: проверка чанота, оформление аренды, контакты юристов.",
      },
      {
        title: "Честные цифры",
        text: "Доходность, история цен, недостатки — всё как есть. В отчётах и калькуляторе — цифры, которым мы доверили бы свои деньги. Без сказочных процентов.",
      },
    ],
  },
  tools: {
    eyebrow: "Инструменты",
    title: "Проверьте цифры сами.",
    lede: "Бесплатно, без регистрации. Данные, что стоят за каждым объектом, — открыты вам.",
    items: [
      {
        title: "Калькулятор инвестиций",
        text: "Прогноз стоимости, ROI и аренды — по нашему объекту или по вашему.",
        href: "/calculator",
      },
      {
        title: "Сколько стоит объект?",
        text: "Оценка земли или виллы по реальным данным продаж на острове.",
        href: "/tools/estimate",
      },
      {
        title: "Аналитика рынка",
        text: "Ставки за ночь, загрузка и рейтинг районов — живой срез рынка аренды.",
        href: "/insights",
      },
    ],
    moreLabel: "Ещё инструменты",
    more: [
      { label: "Что можно построить?", href: "/tools/zoning" },
      { label: "База знаний", href: "/knowledge" },
      { label: "Вопросы и ответы", href: "/faq" },
    ],
  },
  featured: {
    eyebrow: "Избранное",
    title: "С чего мы бы начали показ.",
    lede: "Несколько объектов из того, что есть на острове прямо сейчас.",
  },
  stats: {
    listings: "активных объектов",
    districts: "районов острова",
    reply: "обычное время ответа",
    replyValue: "≈ 1 час",
    vetted: "due diligence в каждой сделке",
    vettedValue: "2 уровня",
  },
  cta: {
    eyebrow: "Расскажите, что нужно",
    title: "Найдите своё место на Пангане.",
    lede: "Вид на закат, пешком до пляжа, участок под застройку в тихом районе — пришлём те несколько, что стоит посмотреть.",
    browse: "Смотреть объекты",
    talk: "Связаться с нами",
  },
  heroFlight: {
    scrollCue: "Листайте, чтобы снизиться",
    skip: "Пропустить",
    checkpoints: [
      {
        title: "Проверка до сделки",
        text: "Двухуровневый due diligence в каждой сделке.",
      },
      {
        title: "Честные цифры с ИИ",
        text: "Оценка и доходность на реальных данных острова.",
      },
      {
        title: "Кадастр и зоны на карте",
        text: "Класс документа и зоны застройки для любого участка.",
      },
    ],
  },
};

const DICTS: Record<Locale, HomeDict> = { en, ru };

export function getHomeDict(locale: Locale): HomeDict {
  return DICTS[locale];
}

// ---- Global chrome (header nav + CTA) ----

export interface NavItem {
  label: string;
  href: string;
}
export interface NavGroup {
  label: string;
  items: NavItem[];
}
export interface ChromeDict {
  // Primary links sit directly in the bar; groups collapse the long tail into
  // labelled dropdowns (desktop) / sections (mobile). Keep both in sync with
  // siteConfig routes. Use flatNav() when a flat list is needed (footer, etc.).
  nav: NavItem[];
  groups: NavGroup[];
  getInTouch: string;
  savedAria: string;
  chatCta: string;
  chatClose: string;
  // header search → /listings?q=
  searchAria: string;
  searchTitle: string;
  searchPlaceholder: string;
  searchSubmit: string;
  footer: {
    blurb: string;
    explore: string;
    contact: string;
    telegramChat: string;
    channel: string;
    rights: string;
    location: string;
    journal: string;
  };
}

// EN nav mirrors siteConfig.nav 1:1 (the header now reads this for both locales,
// so it must stay in sync). RU is the localized equivalent, pointing at /ru/*
// where a Russian page exists and EN routes otherwise.
const chrome: Record<Locale, ChromeDict> = {
  en: {
    nav: [
      { label: "Listings", href: "/listings" },
      { label: "Leasehold", href: "/leasehold" },
      { label: "Projects", href: "/projects" },
      { label: "Sell", href: "/sell" },
    ],
    groups: [
      {
        label: "Explore",
        items: [
          { label: "Estates", href: "/estates" },
          { label: "Districts", href: "/districts" },
          { label: "All developers", href: "/developers" },
          { label: "ARQA Development", href: "/developers/arqa-development" },
        ],
      },
      {
        label: "Resources",
        items: [
          { label: "AI Match", href: "/match" },
          { label: "What's my property worth?", href: "/tools/estimate" },
          { label: "What can I build?", href: "/tools/zoning" },
          { label: "Calculator", href: "/calculator" },
          { label: "Insights", href: "/insights" },
          { label: "Knowledge", href: "/knowledge" },
          { label: "What we verify", href: "/due-diligence" },
          { label: "FAQ", href: "/faq" },
        ],
      },
      {
        label: "Company",
        items: [
          { label: "About", href: "/about" },
          { label: "Services", href: "/services" },
          { label: "Process", href: "/process" },
          { label: "Contact", href: "/contact" },
        ],
      },
    ],
    getInTouch: "Get in touch",
    savedAria: "Saved listings",
    chatCta: "Message us",
    chatClose: "Close chat options",
    searchAria: "Search listings",
    searchTitle: "Search listings",
    searchPlaceholder: "Try: sea-view land for 2–3 villas…",
    searchSubmit: "Search",
    footer: {
      blurb:
        "Right Way Phangan Group is a Koh Phangan–based real estate agency focused on land, villas, and houses for international buyers.",
      explore: "Explore",
      contact: "Contact",
      telegramChat: "Telegram chat",
      channel: "Channel",
      rights: "All rights reserved.",
      location: "Koh Phangan, Thailand",
      journal: "Journal",
    },
  },
  ru: {
    // hrefs flip to /ru/* as each wave ships; not-yet-built routes point at EN
    // so the nav never links to a 404 between deploys.
    nav: [
      { label: "Объекты", href: "/ru/listings" },
      { label: "Лизхолд", href: "/ru/leasehold" },
      { label: "Проекты", href: "/ru/projects" },
      { label: "Продать", href: "/ru/sell" },
    ],
    groups: [
      {
        label: "Обзор",
        items: [
          { label: "Участки", href: "/ru/estates" },
          { label: "Районы", href: "/ru/districts" },
          { label: "Все застройщики", href: "/ru/developers" },
          { label: "ARQA Development", href: "/ru/developers/arqa-development" },
        ],
      },
      {
        label: "Ресурсы",
        items: [
          { label: "ИИ-подбор", href: "/ru/match" },
          { label: "Сколько стоит мой объект?", href: "/ru/tools/estimate" },
          { label: "Что можно построить?", href: "/ru/tools/zoning" },
          { label: "Калькулятор", href: "/ru/calculator" },
          { label: "Аналитика", href: "/ru/insights" },
          { label: "База знаний", href: "/ru/knowledge" },
          { label: "Что мы проверяем", href: "/ru/due-diligence" },
          { label: "FAQ", href: "/ru/faq" },
        ],
      },
      {
        label: "Агентство",
        items: [
          { label: "О нас", href: "/ru/about" },
          { label: "Услуги", href: "/ru/services" },
          { label: "Процесс", href: "/ru/process" },
          { label: "Контакты", href: "/ru/contact" },
        ],
      },
    ],
    getInTouch: "Связаться",
    savedAria: "Избранные объекты",
    chatCta: "Написать нам",
    chatClose: "Скрыть варианты чата",
    searchAria: "Поиск по объектам",
    searchTitle: "Поиск по объектам",
    searchPlaceholder: "Например: участок с видом на море под 2–3 виллы…",
    searchSubmit: "Найти",
    footer: {
      blurb:
        "Right Way Phangan Group — агентство недвижимости на Ко Пангане: земля, виллы и дома для иностранных покупателей.",
      explore: "Разделы",
      contact: "Контакты",
      telegramChat: "Чат в Telegram",
      channel: "Канал",
      rights: "Все права защищены.",
      location: "Ко Панган, Таиланд",
      journal: "Журнал",
    },
  },
};

export function getChromeDict(locale: Locale): ChromeDict {
  return chrome[locale];
}

/** Flat list of every nav destination (primary + grouped) — for the footer. */
export function flatNav(c: ChromeDict): NavItem[] {
  return [...c.nav, ...c.groups.flatMap((g) => g.items)];
}

// ---- Lead form labels ----

export interface FormDict {
  name: string;
  namePlaceholder: string;
  email: string;
  phone: string;
  message: string;
  viewingDate: string;
  replyVia: string;
  videoTour: string;
  submit: string;
  sending: string;
  success: string;
  replyChannelHint: string; // подсказка, когда выбран мессенджер, но нет телефона
  successLede: string; // префикс блока «напишите напрямую» после успешной отправки
  successBrowse: string; // ссылка «смотреть ещё объекты» после отправки
  privacy: string;
  privacyConsent: string; // префикс перед ссылкой на /privacy
  privacyLink: string; // текст ссылки на политику
}

const form: Record<Locale, FormDict> = {
  en: {
    name: "Name",
    namePlaceholder: "Your name",
    email: "Email",
    phone: "Phone (if no email)",
    message: "Message",
    viewingDate: "Preferred viewing date (optional)",
    replyVia: "Reply to me via",
    videoTour: "Send me a video tour of this property",
    submit: "Send enquiry",
    sending: "Sending…",
    success: "Thanks — we'll be in touch within the working day.",
    replyChannelHint: "Add a phone number so we can reach you there.",
    successLede: "Meanwhile, message us directly —",
    successBrowse: "Browse more listings",
    privacy: "We reply within the working day. No spam, ever.",
    // PDPA-notice: формулировка предварительная, на проверку юристу
    privacyConsent: "By submitting you agree that we may share your contact details with the relevant property developer or owner to arrange your enquiry. See our",
    privacyLink: "Privacy Policy",
  },
  ru: {
    name: "Имя",
    namePlaceholder: "Ваше имя",
    email: "Email",
    phone: "Телефон (если нет email)",
    message: "Сообщение",
    viewingDate: "Желаемая дата просмотра (необязательно)",
    replyVia: "Куда ответить",
    videoTour: "Пришлите видео-тур по этому объекту",
    submit: "Отправить запрос",
    sending: "Отправляем…",
    success: "Спасибо — ответим в течение рабочего дня.",
    replyChannelHint: "Добавьте номер телефона, чтобы мы могли там связаться.",
    successLede: "А пока — напишите нам напрямую:",
    successBrowse: "Смотреть ещё объекты",
    privacy: "Отвечаем в течение рабочего дня. Без спама.",
    // PDPA-notice: формулировка предварительная, на проверку юристу
    privacyConsent: "Отправляя форму, вы соглашаетесь, что мы можем передать ваши контакты застройщику или собственнику объекта для обработки запроса. Подробнее — в",
    privacyLink: "Политике конфиденциальности",
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
  team: { eyebrow: string; title: string; role: string; body: string; languages: string; whatsapp: string; contact: string };
}

const about: Record<Locale, AboutDict> = {
  en: {
    hero: {
      eyebrow: "About",
      title: "A specialised advisory, not a listing portal.",
      lede: "Right Way Phangan Group was founded in 2026 on years of ground work in the local land market. We are a small, specialised team focused exclusively on Koh Phangan property.",
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
    team: {
      eyebrow: "The team",
      title: "Small team, one focus.",
      role: "Koh Phangan property only",
      body: "Advisory, due diligence and market analytics under one roof. Every legal question goes through licensed Thai lawyers, and what we know we publish — the guides, market data and tools on this site.",
      languages: "Languages: English, Russian.",
      whatsapp: "Message on WhatsApp",
      contact: "Get in touch",
    },
  },
  ru: {
    hero: {
      eyebrow: "О нас",
      title: "Профильное агентство, а не портал объявлений.",
      lede: "Right Way Phangan Group основана в 2026 году на многолетнем опыте работы на местном рынке земли. Небольшая команда специалистов — только недвижимость Ко Пангана.",
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
    team: {
      eyebrow: "Команда",
      title: "Небольшая команда, один фокус.",
      role: "Только недвижимость Ко Пангана",
      body: "Консультации, проверка объектов и аналитика рынка — в одном месте. Все юридические вопросы проходят через лицензированных тайских юристов, а то, что мы знаем, мы публикуем: гиды, данные рынка и инструменты на этом сайте.",
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
  /** Плашка над формой, когда бриф приехал из поиска (?brief=). */
  briefNote: string;
  channelsHeading: string;
  channels: {
    whatsapp: string;
    whatsappHint: string;
    tgChat: string;
    tgChannel: string;
    call: string;
    email: string;
  };
  office: { heading: string; place: string; note: string };
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
    briefNote:
      "We’ve pre-filled your brief below from your search — edit it if you like, then send.",
    channelsHeading: "Or message us directly",
    channels: {
      whatsapp: "WhatsApp",
      whatsappHint: "Reply within the hour",
      tgChat: "Telegram chat",
      tgChannel: "Telegram channel",
      call: "Call",
      email: "Email",
    },
    office: {
      heading: "Office",
      place: "Koh Phangan, Thailand",
      note: "We meet clients on the island for viewings and signings.",
    },
  },
  ru: {
    hero: {
      eyebrow: "Контакты",
      title: "Расскажите, что вы ищете.",
      lede: "Опишите задачу — мы сопоставим её с нашими активными объектами. Если уже присмотрели конкретный объект, укажите его код RW-####.",
    },
    formHeading: "Опишите задачу",
    formLede: "Чем конкретнее, тем быстрее мы поможем.",
    briefNote:
      "Мы подставили запрос из вашего поиска — поправьте, если нужно, и отправьте.",
    channelsHeading: "Или напишите напрямую",
    channels: {
      whatsapp: "WhatsApp",
      whatsappHint: "Отвечаем в течение часа",
      tgChat: "Telegram — чат",
      tgChannel: "Telegram — канал",
      call: "Позвонить",
      email: "Почта",
    },
    office: {
      heading: "Офис",
      place: "Ко Панган, Таиланд",
      note: "Встречаемся с клиентами на острове — показы и подписание.",
    },
  },
};

export function getContactDict(locale: Locale): ContactDict {
  return contact[locale];
}

// ---- Services page ----

export interface ServicesDict {
  hero: { eyebrow: string; title: string; lede: string };
  services: { title: string; text: string; meta: string }[];
  boundaries: { eyebrow: string; title: string; body: string[] };
  commission: {
    eyebrow: string;
    title: string;
    lede: string;
    rows: { label: string; value: string; detail: string; payer: string }[];
    note: string;
  };
  cta: { title: string; lede: string; start: string; process: string };
}

const services: Record<Locale, ServicesDict> = {
  en: {
    hero: {
      eyebrow: "Services",
      title: "Three services. Each done properly.",
      lede: "We deliberately do not offer rental management, construction, short-term lets or property staging. Our entire operation is built around three services, each one carrying the same level of documentation and care.",
    },
    services: [
      {
        title: "Land acquisition advisory",
        text: "For clients buying land to build, develop, or hold. We work across freehold (Chanote) and leasehold structures, with deep familiarity in the document chain. Each plot undergoes a four-stage check: title verification at the Land Office, boundary survey reconciliation, access and easement review, and zoning compliance. You receive a written report before signing anything.",
        meta: "Typical engagement: 4–12 weeks",
      },
      {
        title: "Villa and house transactions",
        text: "For clients buying a finished home or villa, whether for personal use or long-term hold. Each villa transaction includes structural review, utility verification, ownership history, and a clear comparison against current market rates in the same district.",
        meta: "Typical engagement: 2–6 weeks",
      },
      {
        title: "Standalone transaction support",
        text: "For clients who already found their property — directly, through another agent, or via a private contact — but want professional support through the closing process. We work as your representative at the Land Office and through legal proceedings.",
        meta: "Fixed-fee engagement",
      },
    ],
    boundaries: {
      eyebrow: "Boundaries",
      title: "Where we stop",
      body: [
        "We do not manage rental properties. We do not arrange short-term stays. We do not build, renovate, or design. We do not buy off-plan condominiums.",
        "We refer trusted partners for each of these — but our own operation stays focused on what we know best: helping you buy a piece of land or a home, properly.",
      ],
    },
    commission: {
      eyebrow: "Transparent pricing",
      title: "Honest about cost.",
      lede: "As a buyer, you pay us nothing — only the statutory Land Office fees on registration. Our work is settled within the deal: no buyer-side commission, no surprises at the table. Every engagement includes the full due diligence, the sale agreement, and representation through to transfer.",
      rows: [],
      note: "No hidden add-ons, no kickbacks — the number you see is the number you pay. For a standalone engagement, the fee is agreed upfront in writing before any work begins.",
    },
    cta: {
      title: "Ready to start?",
      lede: "Tell us what you're looking for. A 30-minute discovery call costs you nothing and saves both of us weeks down the road.",
      start: "Start a brief",
      process: "See our process",
    },
  },
  ru: {
    hero: {
      eyebrow: "Услуги",
      title: "Три услуги, один стандарт.",
      lede: "Не занимаемся управлением арендой, стройкой, краткосрочной сдачей и предпродажной подготовкой — только три услуги, каждая с одинаковой документацией и вниманием.",
    },
    services: [
      {
        title: "Сопровождение покупки земли",
        text: "Для тех, кто покупает землю под застройку, девелопмент или в актив. Работаем и с фрихолдом (чанот), и с лизхолдом, хорошо знаем всю цепочку документов. Каждый участок проходит проверку из четырёх этапов: титул в Земельном управлении, сверка границ, права доступа и сервитуты, соответствие зонированию. Письменный отчёт — до подписания чего-либо.",
        meta: "Обычный срок: 4–12 недель",
      },
      {
        title: "Сделки с виллами и домами",
        text: "Для тех, кто покупает готовый дом или виллу — для себя или в долгосрочный актив. Каждая сделка включает проверку конструктива, коммуникаций, истории владения и понятное сравнение с текущими ценами в том же районе.",
        meta: "Обычный срок: 2–6 недель",
      },
      {
        title: "Сопровождение отдельной сделки",
        text: "Для тех, кто уже нашёл объект — напрямую, через другого агента или по личным контактам — но хочет профессиональной поддержки на этапе закрытия. Представляем ваши интересы в Земельном управлении и в юридических процедурах.",
        meta: "Фиксированный гонорар",
      },
    ],
    boundaries: {
      eyebrow: "Границы",
      title: "Где мы останавливаемся",
      body: [
        "Мы не управляем арендой. Не организуем краткосрочное проживание. Не строим, не делаем ремонт и проект. Не покупаем кондоминиумы на стадии котлована.",
        "По каждому из этих направлений рекомендуем проверенных партнёров — но сами остаёмся в том, что знаем лучше всего: помогаем грамотно купить землю или дом.",
      ],
    },
    commission: {
      eyebrow: "Прозрачные условия",
      title: "Честно о стоимости.",
      lede: "Как покупатель, вы не платите нам ничего — только государственные сборы Земельного управления при регистрации. Наша работа учтена внутри сделки: без комиссии со стороны покупателя и без сюрпризов за столом. Каждое сопровождение включает полный due diligence, договор купли-продажи и представление интересов вплоть до передачи.",
      rows: [],
      note: "Без скрытых надбавок и откатов — сколько видите, столько и платите. По отдельному сопровождению гонорар оговаривается заранее, письменно, до начала работ.",
    },
    cta: {
      title: "Готовы начать?",
      lede: "Расскажите, что вы ищете. 30-минутный вводный звонок бесплатен и экономит нам обоим недели в будущем.",
      start: "Описать задачу",
      process: "Посмотреть процесс",
    },
  },
};

export function getServicesDict(locale: Locale): ServicesDict {
  return services[locale];
}

// ---- Process page ----

export interface ProcessDict {
  hero: { eyebrow: string; title: string; lede: string };
  steps: { number: number; title: string; duration?: string; text: string }[];
  cta: { title: string; lede: string; book: string; browse: string };
}

const process: Record<Locale, ProcessDict> = {
  en: {
    hero: {
      eyebrow: "Process",
      title: "From discovery to title in seven stages.",
      lede: "Every transaction follows the same sequence. Each stage has a defined deliverable and a clear point at which you can walk away with no obligation.",
    },
    steps: [
      { number: 1, title: "Discovery call", duration: "30 minutes", text: "We learn what you want to do with the property: live, hold, build, divide. Without this context, every property is just numbers. With it, we know which of our listings actually fit." },
      { number: 2, title: "Shortlist", duration: "Within 5 business days", text: "We send a written shortlist of three to seven properties with full data: location, document type, tenure, area in Thai units and m², and our honest read on each one — including drawbacks." },
      { number: 3, title: "On-site tour", duration: "One full day", text: "We arrange and accompany visits to the shortlisted properties — typically three to five in a single day. We bring district context, owner history, and our notes from previous due diligence." },
      { number: 4, title: "Offer and negotiation", text: "Once you choose a property, we structure the offer and negotiate on your behalf: payment schedule, contingencies, and any seller-side commitments (existing structures, utilities, fencing)." },
      { number: 5, title: "Due diligence", duration: "1–3 weeks", text: "A documented, written process: title verification at the Land Office, boundary reconciliation, encumbrance and mortgage check, zoning compliance, access rights, and water and electricity availability. Deliverable: a single PDF report you review before signing." },
      { number: 6, title: "Sale and Purchase Agreement", text: "A bilingual agreement (English–Thai) drafted by our partner law firm. We review every clause with you and explain Thai-specific provisions in plain language. Your deposit is held by the law firm in a dedicated client account — never paid to the seller up front — and released only at closing." },
      { number: 7, title: "Closing at the Land Office", text: "We represent you at the Land Office for title transfer, tax payment, and registration. You receive originals of all documents, our final transaction report, and contacts for ongoing matters." },
    ],
    cta: {
      title: "Ready when you are.",
      lede: "A discovery call is the cheapest hour we'll spend together — and the most useful. Bring your questions, even the ones that feel obvious.",
      book: "Book a call",
      browse: "Browse listings first",
    },
  },
  ru: {
    hero: {
      eyebrow: "Процесс",
      title: "От первого звонка до титула — семь этапов.",
      lede: "Каждая сделка идёт по одной и той же последовательности. У каждого этапа есть понятный результат и момент, когда вы можете выйти без обязательств.",
    },
    steps: [
      { number: 1, title: "Вводный звонок", duration: "30 минут", text: "Выясняем, что вы хотите делать с объектом: жить, держать, строить, делить. Без этого контекста любой объект — просто цифры. С ним мы знаем, какие из наших объектов вам реально подходят." },
      { number: 2, title: "Шорт-лист", duration: "В течение 5 рабочих дней", text: "Присылаем письменный список из трёх–семи объектов с полными данными: локация, тип документа, вид владения, площадь в тайских единицах и м², и наша честная оценка каждого — включая минусы." },
      { number: 3, title: "Выезд на объекты", duration: "Один полный день", text: "Организуем и сопровождаем просмотры из шорт-листа — обычно три–пять объектов за день. Приносим контекст по району, историю владельца и заметки с прошлых проверок." },
      { number: 4, title: "Оффер и переговоры", text: "Когда вы выбрали объект, мы структурируем предложение и ведём переговоры от вашего имени: график платежей, условия (финансирование, завершение проверки) и обязательства со стороны продавца (строения, коммуникации, забор)." },
      { number: 5, title: "Due diligence", duration: "1–3 недели", text: "Задокументированный письменный процесс: проверка титула в Земельном управлении, сверка границ, проверка обременений и залогов, зонирование, права доступа, наличие воды и электричества. Результат — единый PDF-отчёт, который вы изучаете до подписания." },
      { number: 6, title: "Договор купли-продажи", text: "Двуязычный договор (англ.–тайск.) от нашей партнёрской юрфирмы. Разбираем с вами каждый пункт и объясняем тайские нюансы простым языком. Ваш задаток держит юрфирма на отдельном клиентском счёте — не передаётся продавцу заранее — и выдаётся только при закрытии." },
      { number: 7, title: "Закрытие в Земельном управлении", text: "Представляем вас в Земельном управлении при передаче титула, уплате налогов и регистрации. Вы получаете оригиналы всех документов, итоговый отчёт по сделке и контакты по дальнейшим вопросам." },
    ],
    cta: {
      title: "Первый звонок — бесплатно.",
      lede: "Вводный звонок — самый дешёвый час из тех, что мы проведём вместе, и самый полезный. Приходите с вопросами, даже с теми, что кажутся очевидными.",
      book: "Записаться на звонок",
      browse: "Сначала посмотреть объекты",
    },
  },
};

export function getProcessDict(locale: Locale): ProcessDict {
  return process[locale];
}

// ---- Listings (filter bar, cards, search, map split, empty state) ----

export interface ListingsDict {
  // page hero
  eyebrow: string;
  title: string;
  ready: (n: number) => string;
  matches: (shown: number, total: number) => string;
  // nl search
  nlPlaceholder: string;
  nlExamples: string[];
  nlSearch: string;
  nlSearching: string;
  nlTry: string;
  nlInterpreted: string;
  nlNoMatch: string;
  // filter bar
  buy: string;
  rent: string;
  viewMode: string;
  anyDistrict: string;
  minPrice: string;
  maxPrice: string;
  minRent: string;
  maxRent: string;
  freehold: string;
  leasehold: string;
  beachfront: string;
  seaView: string;
  mountainView: string;
  jungleView: string;
  anyBeds: string;
  bedsN: (n: number) => string;
  districtsN: (n: number) => string;
  clearDistricts: string;
  sort: string;
  sortFeatured: string;
  sortNewest: string;
  sortPriceAsc: string;
  sortPriceDesc: string;
  sortTooltip: string;
  more: string;
  filters: string;
  clear: string;
  saveSearch: string;
  saved: string;
  matchesCount: (n: number) => string;
  sortedBy: (label: string) => string;
  updating: string;
  total: (n: number) => string;
  // object types
  types: { Land: string; Villa: string; House: string; Apartment: string; Townhouse: string; Hotel: string; Business: string; Project: string };
  // card
  priceOnRequest: string;
  perRai: string;
  perRaiMonth: string;
  perMonthShort: string;
  rai: string;
  bed: string;
  newBadge: string;
  // map split
  inMapArea: (n: number) => string;
  showAll: string;
  showMore: (n: number) => string;
  noneInArea: string;
  list: string;
  map: string;
  filteredToArea: string;
  moveMapHint: string;
  withoutPin: (n: number) => string;
  noMapped: string;
  // empty
  emptyFilteredTitle: string;
  emptyFilteredText: string;
  emptyTitle: string;
  emptyText: string;
  clearFilters: string;
  sendBrief: string;
  recentlyViewed: string;
}

const TYPES_EN = { Land: "Land", Villa: "Villa", House: "House", Apartment: "Apartment", Townhouse: "Townhouse", Hotel: "Hotel", Business: "Business", Project: "Project" };
const TYPES_RU = { Land: "Земля", Villa: "Вилла", House: "Дом", Apartment: "Апартаменты", Townhouse: "Таунхаус", Hotel: "Отель", Business: "Бизнес", Project: "Проект" };

const listings: Record<Locale, ListingsDict> = {
  en: {
    eyebrow: "Listings",
    title: "Every active property on Phangan.",
    ready: (n) => `${n} ${n === 1 ? "property" : "properties"} ready to view.`,
    matches: (shown, total) => `${shown} ${shown === 1 ? "match" : "matches"} from ${total} total listings.`,
    nlPlaceholder: "Describe what you want — e.g. flat land near the beach under 20M",
    nlExamples: ["flat land near the beach under 20M", "3-bed villa with sea view", "leasehold land in Sri Thanu"],
    nlSearch: "Search",
    nlSearching: "Searching…",
    nlTry: "Try:",
    nlInterpreted: "Interpreted as:",
    nlNoMatch: "Couldn’t pin that to a filter — showing everything. Try terms like a district, type, price, or “sea view”.",
    buy: "Buy",
    rent: "Rent",
    viewMode: "Buy or rent",
    anyDistrict: "Any district",
    minPrice: "Min ฿",
    maxPrice: "Max ฿",
    minRent: "Min ฿/mo",
    maxRent: "Max ฿/mo",
    freehold: "Freehold",
    leasehold: "Leasehold",
    beachfront: "Beachfront",
    seaView: "Sea view",
    mountainView: "Mountain view",
    jungleView: "Jungle view",
    anyBeds: "Any beds",
    bedsN: (n) => `${n}+`,
    districtsN: (n) => `${n} districts`,
    clearDistricts: "Clear districts",
    sort: "Sort",
    sortFeatured: "Featured",
    sortNewest: "Newest",
    sortPriceAsc: "Price ↑",
    sortPriceDesc: "Price ↓",
    sortTooltip: "Featured = the order we recommend (curated). Or sort by newest / price.",
    more: "More",
    filters: "Filters",
    clear: "Clear",
    saveSearch: "Save search",
    saved: "Saved",
    matchesCount: (n) => `${n} ${n === 1 ? "match" : "matches"}`,
    sortedBy: (label) => `sorted by ${label.toLowerCase()}`,
    updating: "Updating…",
    total: (n) => `${n} total`,
    types: TYPES_EN,
    priceOnRequest: "Price on request",
    perRai: "/rai",
    perRaiMonth: "/rai/mo",
    perMonthShort: "/mo",
    rai: "rai",
    bed: "bed",
    newBadge: "New",
    inMapArea: (n) => `${n} ${n === 1 ? "property" : "properties"} in the map area`,
    showAll: "Show all",
    showMore: (n) => `Show ${n} more`,
    noneInArea: "No listings in the current map area. Zoom out or pan to see more.",
    list: "List",
    map: "Map",
    filteredToArea: "Filtered to this area",
    moveMapHint: "Move the map to filter the list",
    withoutPin: (n) => `${n} listing${n === 1 ? "" : "s"} without a map pin`,
    noMapped: "No mapped locations for the current filters.",
    emptyFilteredTitle: "No matches for these filters.",
    emptyFilteredText: "Try removing one of the criteria, or send us a brief — we often have listings that aren’t published yet.",
    emptyTitle: "Nothing to show right now.",
    emptyText: "Our catalogue refreshes every few minutes. If you’re looking for something specific, message us and we’ll send matches privately.",
    clearFilters: "Clear filters",
    sendBrief: "Send a brief",
    recentlyViewed: "Recently viewed",
  },
  ru: {
    eyebrow: "Объекты",
    title: "Все активные объекты на Пангане.",
    ready: (n) => `${n} ${pluralRu(n, "объект готов", "объекта готовы", "объектов готовы")} к просмотру.`,
    matches: (shown, total) => `${shown} ${pluralRu(shown, "совпадение", "совпадения", "совпадений")} из ${total} всего.`,
    nlPlaceholder: "Опишите, что ищете — напр. ровный участок у пляжа до 20M",
    nlExamples: ["ровный участок у пляжа до 20M", "вилла с 3 спальнями и видом на море", "аренда земли в Шри Тану"],
    nlSearch: "Найти",
    nlSearching: "Ищем…",
    nlTry: "Примеры:",
    nlInterpreted: "Поняли так:",
    nlNoMatch: "Не удалось привязать к фильтру — показываем всё. Попробуйте район, тип, цену или «вид на море».",
    buy: "Купить",
    rent: "Аренда",
    viewMode: "Покупка или аренда",
    anyDistrict: "Любой район",
    minPrice: "Цена от ฿",
    maxPrice: "Цена до ฿",
    minRent: "Аренда от ฿/мес",
    maxRent: "Аренда до ฿/мес",
    freehold: "Freehold",
    leasehold: "Leasehold",
    beachfront: "Первая линия",
    seaView: "Вид на море",
    mountainView: "Вид на горы",
    jungleView: "Вид на джунгли",
    anyBeds: "Спальни",
    bedsN: (n) => `${n}+`,
    districtsN: (n) => `районов: ${n}`,
    clearDistricts: "Сбросить районы",
    sort: "Сортировка",
    sortFeatured: "Рекомендуемые",
    sortNewest: "Новые",
    sortPriceAsc: "Цена ↑",
    sortPriceDesc: "Цена ↓",
    sortTooltip: "Рекомендуемые = наш курируемый порядок. Или сортируйте по новизне / цене.",
    more: "Ещё",
    filters: "Фильтры",
    clear: "Сбросить",
    saveSearch: "Сохранить поиск",
    saved: "Сохранено",
    matchesCount: (n) => `${n} ${pluralRu(n, "совпадение", "совпадения", "совпадений")}`,
    sortedBy: (label) => `сортировка: ${label.toLowerCase()}`,
    updating: "Обновляем…",
    total: (n) => `всего ${n}`,
    types: TYPES_RU,
    priceOnRequest: "Цена по запросу",
    perRai: "/рай",
    perRaiMonth: "/рай/мес",
    perMonthShort: "/мес",
    rai: "рай",
    bed: "сп.",
    newBadge: "Новое",
    inMapArea: (n) => `${n} ${pluralRu(n, "объект", "объекта", "объектов")} в области карты`,
    showAll: "Показать все",
    showMore: (n) => `Показать ещё ${n} ${pluralRu(n, "объект", "объекта", "объектов")}`,
    noneInArea: "В текущей области карты объектов нет. Отдалите или подвиньте карту.",
    list: "Список",
    map: "Карта",
    filteredToArea: "Отфильтровано по области",
    moveMapHint: "Двигайте карту, чтобы отфильтровать список",
    withoutPin: (n) => `${n} ${pluralRu(n, "объект", "объекта", "объектов")} без метки на карте`,
    noMapped: "Для текущих фильтров нет объектов на карте.",
    emptyFilteredTitle: "Под эти фильтры ничего не нашлось.",
    emptyFilteredText: "Уберите один из критериев или отправьте бриф — у нас часто есть объекты, которых ещё нет в публикации.",
    emptyTitle: "Сейчас показывать нечего.",
    emptyText: "Каталог обновляется каждые несколько минут. Если ищете что-то конкретное — напишите нам, пришлём подходящее лично.",
    clearFilters: "Сбросить фильтры",
    sendBrief: "Отправить бриф",
    recentlyViewed: "Недавно просмотренные",
  },
};

/** RU plural picker: (1, 2–4, 0/5+) forms. */
export function pluralRu(n: number, one: string, few: string, many: string): string {
  const mod10 = n % 10;
  const mod100 = n % 100;
  if (mod10 === 1 && mod100 !== 11) return one;
  if (mod10 >= 2 && mod10 <= 4 && (mod100 < 12 || mod100 > 14)) return few;
  return many;
}

export function getListingsDict(locale: Locale): ListingsDict {
  return listings[locale];
}

// ---- Object detail page (+ its components) ----

export interface ObjectDict {
  backToListings: string;
  bcHome: string;
  locationCountry: string;
  openInMaps: string;
  openInGoogleMaps: string;
  directions: string;
  location: string;
  // interactive map controls (cadastre / zoning / geolocation)
  map: {
    baseMap: string;
    baseSatellite: string;
    baseTerrain: string;
    sunset: string;
    parcels: string;
    zoning: string;
    locate: string;
    locateStop: string;
    locateError: string;
    parcelZoomHint: string;
    legendButton: string;
    legendTitle: string;
    legendRural: string;
    legendConservation: string;
    legendRecreation: string;
    legendResidential: string;
    legendOther: string;
    overlayNote: string;
    poiLayer: string;
    poiPier: string;
    poiHospital: string;
    poiSchool: string;
    poiShop: string;
    poiAtm: string;
    fullscreen: string;
    fullscreenExit: string;
    measure: string;
    measureHint: string;
    perMonth: string;
    perRaiMonth: string;
  };
  perMonth: string;
  perRaiMonth: string;
  priceOnRequest: string;
  aboutProperty: string;
  whyThisOne: string;
  specifications: string;
  buildingRules: string;
  investmentOutlook: string;
  investmentOutlookLede: string;
  // inquiry
  enquireOrBook: string;
  enquire: string;
  inquiryLede: string;
  orMessageDirectly: string;
  inquiryDefaultMessage: (rw: string) => string;
  // share / save
  share: string;
  copied: string;
  brochure: string;
  shareAria: string;
  saveAria: string;
  removeAria: string;
  // buying costs
  costs: {
    title: string;
    lede: string;
    item: string;
    typical: string;
    transferFee: string;
    transferFeeNote: string;
    leaseReg: string;
    leaseRegNote: string;
    legal: string;
    surveyor: string;
    translation: string;
    inspection: string;
    total: string;
    sellerNote: string;
    disclaimer: string;
  };
  verifiedBadge: string;
  districtGuide: string;
  // unavailable listing (sold / reserved / withdrawn) — page stays live so old
  // shared links land on something useful instead of a 404
  unavail: {
    sold: string;
    reserved: string;
    generic: string;
    title: string;
    lede: string;
    browse: string;
    contact: string;
  };
  // object faq
  faqTitle: string;
  faqAll: string;
  // gallery
  galleryCaption: (rw: string, i: number, total: number) => string;
  prevPhoto: string;
  nextPhoto: string;
  photosCount: (n: number) => string;
  viewPhoto: (n: number) => string;
  // related
  moreInNearby: (district: string) => string;
  moreToExplore: string;
  // price context
  pcPerRai: string;
  pcPerSqm: string;
  pcAsking: string;
  pcInLine: (district: string, metric: string) => string;
  pcDelta: (pct: number, dir: "below" | "above", district: string, metric: string) => string;
  // spec groups + rows
  specGroups: { Pricing: string; Property: string; Legal: string; Building: string; Features: string; Infrastructure: string };
  /** Подписи форм владения. Mixed = «право не установлено», а не третья форма. */
  tenureValues: Record<string, string>;
  specRows: Record<string, string>;
  yes: string;
  no: string;
  years: (n: number) => string;
  /** Lease indexation: "3% every 5 years" / «3% каждые 5 лет»; без периода — просто "3%". */
  leaseEsc: (pct: number, everyYears?: number) => string;
  rai: string;
  features: Record<string, string>;
  // investment highlights
  hl: {
    beachfront: { title: string; text: string };
    seaView: { title: string; text: string };
    chanote: { title: string; text: string };
    ns3k: { title: string; text: string };
    plot: (rai: string) => { title: string; text: string };
    freehold: { title: string; text: string };
    moveIn: { title: string; text: string };
    elevation: (m: number) => { title: string; text: string };
    quiet: { title: string; text: string };
  };
}

const objectDict: Record<Locale, ObjectDict> = {
  en: {
    backToListings: "Back to listings",
    bcHome: "Home",
    locationCountry: "Koh Phangan, Thailand",
    openInMaps: "Open in Maps",
    openInGoogleMaps: "Open in Google Maps",
    directions: "Directions",
    location: "Location",
    map: {
      baseMap: "Map",
      baseSatellite: "Satellite",
      baseTerrain: "Terrain",
      sunset: "Sunset",
      parcels: "Plot boundaries",
      zoning: "Zoning",
      locate: "Show my location",
      locateStop: "Hide my location",
      locateError: "Location unavailable — allow access in your browser settings.",
      parcelZoomHint: "Zoom in to see plot boundaries",
      legendButton: "Legend",
      legendTitle: "City-plan zoning (DPT)",
      legendRural: "Rural & agricultural",
      legendConservation: "Conservation rural",
      legendRecreation: "Recreation / open space",
      legendResidential: "Low-density residential",
      legendOther: "Other / unclassified",
      overlayNote: "Cadastral data: Department of Lands via Longdo Map. Indicative — verify at the Land Office.",
      poiLayer: "Nearby",
      poiPier: "Ferry pier",
      poiHospital: "Hospital",
      poiSchool: "School",
      poiShop: "Shop / supermarket",
      poiAtm: "Banks & ATMs",
      fullscreen: "Fullscreen",
      fullscreenExit: "Exit fullscreen",
      measure: "Measure",
      measureHint: "Tap the map to measure distance",
      perMonth: "/mo",
      perRaiMonth: "/rai·mo",
    },
    perMonth: "/ month",
    perRaiMonth: "/ rai / month",
    priceOnRequest: "Price on request",
    aboutProperty: "About this property",
    whyThisOne: "Why this one",
    specifications: "Specifications",
    buildingRules: "Building rules",
    investmentOutlook: "Investment outlook",
    investmentOutlookLede: "Project this property’s value over time. Set your own growth outlook — every figure is illustrative.",
    enquireOrBook: "Enquire or book a viewing",
    enquire: "Enquire",
    inquiryLede: "Ask a question or pick a date to see it. We reply within the working day, usually within an hour.",
    orMessageDirectly: "Or message directly",
    inquiryDefaultMessage: (rw) => `Hi — I'd like more information about ${rw}.`,
    share: "Share",
    copied: "Copied",
    brochure: "Brochure (PDF)",
    shareAria: "Share this listing",
    saveAria: "Save to shortlist",
    removeAria: "Remove from saved",
    costs: {
      title: "What it costs to buy",
      lede: "The honest math for this property — standard Land Office rates and typical professional fees, beyond the asking price.",
      item: "Item",
      typical: "Typical cost",
      transferFee: "Land Office transfer fee",
      transferFeeNote: "2% of appraised value — commonly split between parties",
      leaseReg: "Lease registration fee",
      leaseRegNote: "1.1% of the total lease value — commonly split",
      legal: "Independent lawyer (due diligence, contracts, transfer)",
      surveyor: "Licensed surveyor (GPS boundary check)",
      translation: "Translation & notarisation",
      inspection: "Structural inspection (built property)",
      total: "Typical total beyond the price",
      sellerNote: "Specific Business Tax, withholding tax and most transfer costs fall on the seller by law and practice — they are not on this list.",
      disclaimer: "Indicative figures. We confirm the exact breakdown for this property before you commit to anything.",
    },
    verifiedBadge: "Verified listing — what we check",
    districtGuide: "District guide",
    unavail: {
      sold: "Sold",
      reserved: "Reserved",
      generic: "Unavailable",
      title: "This listing is no longer available",
      lede: "It may have been sold, reserved, or temporarily withdrawn. Here are similar properties on the island right now — or tell us what you're looking for and we'll suggest options.",
      browse: "Browse all listings",
      contact: "Tell us what you need",
    },
    faqTitle: "Good to know",
    faqAll: "All questions answered in the FAQ",
    galleryCaption: (rw, i, total) => `${rw} photos — ${i} of ${total}`,
    prevPhoto: "Previous photo",
    nextPhoto: "Next photo",
    photosCount: (n) => `${n} photo${n === 1 ? "" : "s"}`,
    viewPhoto: (n) => `View photo ${n}`,
    moreInNearby: (district) => `More in ${district} & nearby`,
    moreToExplore: "More listings to explore",
    pcPerRai: "per rai",
    pcPerSqm: "per m²",
    pcAsking: "asking price",
    pcInLine: (district, metric) => `≈ in line with the ${district} average (${metric})`,
    pcDelta: (pct, dir, district, metric) => `≈ ${pct}% ${dir} the ${district} average ${metric}`,
    specGroups: { Pricing: "Pricing", Property: "Property", Legal: "Legal", Building: "Building", Features: "Features", Infrastructure: "Infrastructure" },
    // Значения формы владения. «Mixed / N.A.» в CRM означает «право не
    // установлено» — печатать сырой токен «Mixed» покупателю нельзя, он читается
    // как утверждение о какой-то третьей форме владения.
    tenureValues: { Freehold: "Freehold", Leasehold: "Leasehold", Mixed: "To be confirmed" },
    specRows: {
      "Asking price": "Asking price", "Price per rai": "Price per rai", "Lease rent": "Lease rent",
      Type: "Type", District: "District", Zone: "Zone", "Plot area": "Plot area", "Built area": "Built area",
      Altitude: "Altitude", Terrain: "Terrain", "Document type": "Document type", Tenure: "Tenure", "Lease term": "Lease term",
      Indexation: "Indexation", "Lease prepayment": "Lease prepayment", "Additional terms": "Additional terms",
      Bedrooms: "Bedrooms", Bathrooms: "Bathrooms", Built: "Built", Condition: "Condition", "On site": "On site",
      Electricity: "Electricity", Water: "Water", Internet: "Internet", "Road access": "Road access",
    },
    yes: "Yes",
    no: "No",
    years: (n) => `${n} years`,
    leaseEsc: (pct, everyYears) =>
      everyYears
        ? `${pct.toLocaleString("en-US")}% every ${everyYears === 1 ? "year" : `${everyYears} years`}`
        : `${pct.toLocaleString("en-US")}%`,
    rai: "rai",
    features: {
      Beachfront: "Beachfront", "Sea view": "Sea view", "Mountain view": "Mountain view", "Jungle view": "Jungle view",
      "Flat land": "Flat land", "Quiet location": "Quiet location", "Private pool": "Private pool",
      "Private garden": "Private garden", Parking: "Parking", Gated: "Gated",
    },
    hl: {
      beachfront: { title: "Beachfront access", text: "Direct frontage to the sea — a rare and quickly disappearing category on Phangan." },
      seaView: { title: "Sea view", text: "Unobstructed view of the Gulf — a durable premium driver on resale." },
      chanote: { title: "Chanote title", text: "The strongest form of land title in Thailand. Boundaries are GPS-surveyed and registered with the Land Department." },
      ns3k: { title: "NS3K title", text: "Confirmed ownership with surveyed boundaries — upgradeable to Chanote in many cases." },
      plot: (rai) => ({ title: `${rai}-rai plot`, text: "Enough land for a multi-building project, a private villa with full grounds, or sub-division upside." }),
      freehold: { title: "Freehold-eligible", text: "Available for direct ownership via Thai company or transfer to qualifying buyers — clean exit path." },
      moveIn: { title: "Move-in ready", text: "Recently completed — no renovation, no permits, no waiting." },
      elevation: (m) => ({ title: `Elevation ${m} m`, text: "High enough for cooler nights, year-round breeze, and panoramic sightlines." }),
      quiet: { title: "Quiet location", text: "Away from nightlife and through-traffic — the kind of plot people buy for retirement or family." },
    },
  },
  ru: {
    backToListings: "Назад к объектам",
    bcHome: "Главная",
    locationCountry: "Ко Панган, Таиланд",
    openInMaps: "Открыть в картах",
    openInGoogleMaps: "Открыть в Google Maps",
    directions: "Маршрут",
    location: "Расположение",
    map: {
      baseMap: "Карта",
      baseSatellite: "Спутник",
      baseTerrain: "Рельеф",
      sunset: "Закат",
      parcels: "Границы участков",
      zoning: "Зоны застройки",
      locate: "Показать моё местоположение",
      locateStop: "Скрыть моё местоположение",
      locateError: "Геолокация недоступна — разрешите доступ в настройках браузера.",
      parcelZoomHint: "Приблизьте карту, чтобы увидеть границы участков",
      legendButton: "Легенда",
      legendTitle: "Зонирование (ผังเมือง, DPT)",
      legendRural: "Сельхоз / деревенская",
      legendConservation: "Заповедная сельхоз",
      legendRecreation: "Рекреация / открытые пространства",
      legendResidential: "Жилая малой плотности",
      legendOther: "Прочее / без категории",
      overlayNote: "Кадастровые данные: Департамент земель через Longdo Map. Ориентировочно — проверяйте в Land Office.",
      poiLayer: "Рядом",
      poiPier: "Паромный пирс",
      poiHospital: "Больница",
      poiSchool: "Школа",
      poiShop: "Магазин / супермаркет",
      poiAtm: "Банки и банкоматы",
      fullscreen: "На весь экран",
      fullscreenExit: "Выйти из полноэкранного",
      measure: "Линейка",
      measureHint: "Нажимайте по карте, чтобы измерить расстояние",
      perMonth: "/мес",
      perRaiMonth: "/рай·мес",
    },
    perMonth: "/ мес",
    perRaiMonth: "/ рай / мес",
    priceOnRequest: "Цена по запросу",
    aboutProperty: "Об объекте",
    whyThisOne: "Почему именно этот",
    specifications: "Характеристики",
    buildingRules: "Правила застройки",
    investmentOutlook: "Инвестиционный прогноз",
    investmentOutlookLede: "Спрогнозируйте стоимость объекта во времени. Задайте свой темп роста — все цифры иллюстративны.",
    enquireOrBook: "Запрос или запись на просмотр",
    enquire: "Запрос",
    inquiryLede: "Задайте вопрос или выберите дату просмотра. Отвечаем в течение рабочего дня, обычно в течение часа.",
    orMessageDirectly: "Или напишите напрямую",
    inquiryDefaultMessage: (rw) => `Здравствуйте — хочу узнать подробнее об объекте ${rw}.`,
    share: "Поделиться",
    copied: "Скопировано",
    brochure: "Брошюра (PDF)",
    shareAria: "Поделиться объектом",
    saveAria: "В избранное",
    removeAria: "Убрать из избранного",
    costs: {
      title: "Сколько стоит покупка",
      lede: "Честная математика по этому объекту — стандартные ставки Земельного департамента и типовые услуги, сверх запрашиваемой цены.",
      item: "Статья",
      typical: "Типичная сумма",
      transferFee: "Сбор за переход права (Land Office)",
      transferFeeNote: "2% от оценочной стоимости — обычно делится между сторонами",
      leaseReg: "Регистрация договора аренды",
      leaseRegNote: "1,1% от суммы аренды за весь срок — обычно делится",
      legal: "Независимый юрист (проверка, договоры, регистрация)",
      surveyor: "Лицензированный замер границ (GPS)",
      translation: "Перевод и нотариат",
      inspection: "Строительная инспекция (для построек)",
      total: "Типичный итог сверх цены",
      sellerNote: "Specific Business Tax, withholding tax и большая часть сборов за переход права по закону и практике ложатся на продавца — их в списке нет.",
      disclaimer: "Цифры ориентировочные. Точный расчёт по этому объекту мы подтверждаем до любых обязательств.",
    },
    verifiedBadge: "Проверенный объект — что мы проверяем",
    districtGuide: "Гид по району",
    unavail: {
      sold: "Продан",
      reserved: "Зарезервирован",
      generic: "Недоступен",
      title: "Этот объект больше не доступен",
      lede: "Он мог быть продан, зарезервирован или временно снят с продажи. Вот похожие объекты на острове прямо сейчас — или напишите, что ищете, и мы подберём варианты.",
      browse: "Все объекты",
      contact: "Расскажите, что ищете",
    },
    faqTitle: "Полезно знать",
    faqAll: "Все ответы — в FAQ",
    galleryCaption: (rw, i, total) => `${rw} — фото ${i} из ${total}`,
    prevPhoto: "Предыдущее фото",
    nextPhoto: "Следующее фото",
    photosCount: (n) => `${n} фото`,
    viewPhoto: (n) => `Открыть фото ${n}`,
    moreInNearby: (district) => `Ещё в районе ${district} и рядом`,
    moreToExplore: "Другие объекты",
    pcPerRai: "за рай",
    pcPerSqm: "за м²",
    pcAsking: "запрашиваемая цена",
    pcInLine: (district, metric) => `≈ на уровне среднего по ${district} (${metric})`,
    pcDelta: (pct, dir, district, metric) => `≈ на ${pct}% ${dir === "below" ? "ниже" : "выше"} среднего по ${district} (${metric})`,
    specGroups: { Pricing: "Цена", Property: "Объект", Legal: "Юридически", Building: "Строение", Features: "Особенности", Infrastructure: "Инфраструктура" },
    tenureValues: { Freehold: "Фрихолд", Leasehold: "Лизхолд", Mixed: "Уточняется" },
    specRows: {
      "Asking price": "Запрашиваемая цена", "Price per rai": "Цена за рай", "Lease rent": "Аренда",
      Type: "Тип", District: "Район", Zone: "Зона", "Plot area": "Площадь участка", "Built area": "Площадь строения",
      Altitude: "Высота", Terrain: "Рельеф", "Document type": "Тип документа", Tenure: "Вид владения", "Lease term": "Срок аренды",
      Indexation: "Индексация", "Lease prepayment": "Предоплата аренды", "Additional terms": "Доп. условия",
      Bedrooms: "Спальни", Bathrooms: "Санузлы", Built: "Год постройки", Condition: "Состояние", "On site": "На участке",
      Electricity: "Электричество", Water: "Вода", Internet: "Интернет", "Road access": "Подъезд",
    },
    yes: "Да",
    no: "Нет",
    years: (n) => `${n} ${pluralRu(n, "год", "года", "лет")}`,
    leaseEsc: (pct, everyYears) =>
      everyYears
        ? `${pct.toLocaleString("ru-RU")}% ${everyYears === 1 ? "каждый год" : `каждые ${everyYears} ${pluralRu(everyYears, "год", "года", "лет")}`}`
        : `${pct.toLocaleString("ru-RU")}%`,
    rai: "рай",
    features: {
      Beachfront: "Первая линия", "Sea view": "Вид на море", "Mountain view": "Вид на горы", "Jungle view": "Вид на джунгли",
      "Flat land": "Ровный участок", "Quiet location": "Тихое место", "Private pool": "Свой бассейн",
      "Private garden": "Свой сад", Parking: "Парковка", Gated: "Закрытая территория",
    },
    hl: {
      beachfront: { title: "Выход к пляжу", text: "Прямой выход к морю — редкая и быстро исчезающая категория на Пангане." },
      seaView: { title: "Вид на море", text: "Открытый вид на залив — устойчивый драйвер премии при перепродаже." },
      chanote: { title: "Титул Chanote", text: "Самая надёжная форма права на землю в Таиланде. Границы отсняты по GPS и зарегистрированы в Земельном департаменте." },
      ns3k: { title: "Титул NS3K", text: "Подтверждённое право с отснятыми границами — во многих случаях можно повысить до Chanote." },
      plot: (rai) => ({ title: `Участок ${rai} рай`, text: "Достаточно земли для проекта из нескольких строений, виллы с участком или потенциала под разделение." }),
      freehold: { title: "Возможен фрихолд", text: "Доступно для прямого владения через тайскую компанию или передачи квалифицированным покупателям — чистый выход." },
      moveIn: { title: "Готово к заселению", text: "Недавно завершено — без ремонта, разрешений и ожидания." },
      elevation: (m) => ({ title: `Высота ${m} м`, text: "Достаточно высоко для прохладных ночей, круглогодичного бриза и панорамных видов." }),
      quiet: { title: "Тихое место", text: "Вдали от ночной жизни и транзита — такой участок берут под пенсию или для семьи." },
    },
  },
};

export function getObjectDict(locale: Locale): ObjectDict {
  return objectDict[locale];
}

// ---- Developer projects (off-plan landings) ----

export interface ProjectsDict {
  eyebrow: string;
  indexTitle: string;
  indexLede: string;
  count: (n: number) => string;
  empty: string;
  viewProject: string;
  from: string;
  developer: string;
  completion: string;
  units: string;
  availableLabel: string;
  takenLabel: string;
  available: (a: number, total: number) => string;
  soldOut: string;
  unitsLeft: (n: number) => string;
  enquire: string;
  backToProjects: string;
  home: string;
  otherProjects: string;
  nav: {
    overview: string;
    gallery: string;
    plans: string;
    video: string;
    units: string;
    pricing: string;
    returns: string;
    timeline: string;
    construction: string;
    team: string;
    location: string;
    enquire: string;
  };
  sections: {
    overview: string;
    gallery: string;
    plans: string;
    video: string;
    units: string;
    unitsLede: string;
    pricing: string;
    priceStages: string;
    paymentTerms: string;
    leasePrepayment: string;
    tenure: string;
    leaseTerm: string;
    returns: string;
    returnsLede: string;
    netYield: string;
    estIncome: string;
    timeline: string;
    construction: string;
    team: string;
    location: string;
    amenities: string;
    facts: string;
  };
  /** Страница фотоотчётов со стройки — /projects/[slug]/construction. */
  construction: {
    title: string;
    lede: string;
    viewAll: string;
    backToProject: string;
    latest: string;
    photos: (n: number) => string;
    metaDescription: (name: string) => string;
  };
  watchVideo: string;
  contactMessage: (title: string) => string;
  stage: Record<string, string>;
  perYear: string;
  developers: {
    aboutTitle: string;
    historyTitle: string;
    catalogTitle: string;
    status: { built: string; "under-construction": string; planned: string; soon: string };
    timelineHint: string;
    timelineHintTouch: string;
    viewListing: string;
    viewPhotos: (n: number) => string;
    album: { all: string; photos: (n: number) => string; showAll: (n: number) => string };
    build: {
      areaLabel: string;
      areaUnit: string;
      finishLabel: string;
      bands: Record<"basic" | "mid" | "premium", { name: string; hint: string }>;
      poolLabel: string;
      feesLabel: string;
      feesHint: string;
      budget: string;
      perSqm: string;
      duration: string;
      months: (from: number, to: number) => string;
      permitLine: (from: number, to: number) => string;
      andUp: string;
      excludedTitle: string;
      excluded: string[];
      disclaimer: string;
      articleCta: string;
      fullCalcCta: string;
    };
    returns: {
      kpiRoi: string;
      kpiCagr: string;
      kpiProfit: string;
      kpiRentYear: string;
      yearsLabel: string;
      yearsValue: (n: number) => string;
      growthLabel: string;
      claimed: (unit: string, yieldPct: number, payback: number) => string;
      marketSource: (district: string, rate: number, occupancy: number) => string;
      noMarket: string;
      fullCta: string;
    };
    nextLeasehold: string;
    nextOffplan: string;
    nextVetting: string;
    nextProcess: string;
    nextZoning: string;
    nextInsights: string;
    sections: {
      photosTitle: string;
      photosLede: string;
      returnsTitle: string;
      returnsLede: string;
      buildTitle: string;
      buildLede: string;
      nextTitle: string;
      nextCatalog: string;
      nextLearn: string;
      nextTools: string;
    };
    dateTbc: string;
    soonLede: string;
    formTitle: string;
    formLede: string;
    formSubmit: string;
    formDefaultMessage: (name: string) => string;
    indexEyebrow: string;
    indexTitle: string;
    indexLede: string;
    nav: { overview: string; history: string; projects: string; photos: string; returns: string; build: string; enquire: string };
    kpi: { projects: string; delivered: string; building: string; portfolio: string };
    galleryTitle: string;
    mapTitle: string;
    mapLede: string;
  };
}

const projectsDict: Record<Locale, ProjectsDict> = {
  en: {
    eyebrow: "Developer projects",
    indexTitle: "Off-plan projects on Phangan.",
    indexLede:
      "Curated developer projects — pool villas, off-plan complexes and turnkey homes. Each with the full picture: units, pricing, payment schedule and projected returns.",
    count: (n) => `${n} ${n === 1 ? "project" : "projects"} on the island.`,
    empty: "No projects published yet. New developer projects appear here as they go live.",
    viewProject: "View project",
    from: "from",
    developer: "Developer",
    completion: "Completion",
    units: "Units",
    availableLabel: "Available",
    takenLabel: "Taken",
    available: (a, total) => `${a} of ${total} available`,
    soldOut: "Fully reserved",
    unitsLeft: (n) => `${n} ${n === 1 ? "unit" : "units"} left`,
    enquire: "Enquire about this project",
    backToProjects: "Back to projects",
    home: "Home",
    otherProjects: "Other projects",
    nav: {
      overview: "Overview",
      gallery: "Gallery",
      plans: "Plans",
      video: "Video",
      units: "Units",
      pricing: "Pricing",
      returns: "Returns",
      timeline: "Timeline",
      construction: "Site progress",
      team: "Team",
      location: "Location",
      enquire: "Enquire",
    },
    sections: {
      overview: "About the project",
      gallery: "Gallery",
      plans: "Floor plans & masterplan",
      video: "Video & tour",
      units: "Units & availability",
      unitsLede: "Live availability across the project.",
      pricing: "Price & payment",
      priceStages: "Price by stage",
      paymentTerms: "Payment schedule",
      leasePrepayment: "Lease prepayment",
      tenure: "Tenure",
      leaseTerm: "Lease term",
      returns: "Projected returns",
      returnsLede:
        "Model this project's outlook. Every figure is illustrative — not a guarantee.",
      netYield: "Net yield",
      estIncome: "Est. net income",
      timeline: "Construction timeline",
      construction: "Site progress",
      team: "Developer & team",
      location: "Location",
      amenities: "What's included",
      facts: "Key facts",
    },
    construction: {
      title: "Construction progress",
      lede: "Photos from the site, newest first. We update this page as the build moves.",
      viewAll: "See all construction photos",
      backToProject: "Back to the project",
      latest: "Latest update",
      photos: (n) => `${n} ${n === 1 ? "photo" : "photos"}`,
      metaDescription: (name) =>
        `Construction progress at ${name}, Koh Phangan — dated photo updates from the site.`,
    },
    watchVideo: "Watch video",
    contactMessage: (title) => `Hi! I'm interested in ${title}. Could you share more details?`,
    stage: {
      Ready: "Ready",
      "Under construction": "Under construction",
      "Off-plan": "Off-plan",
    },
    perYear: "/ year",
    developers: {
      aboutTitle: "About the developer",
      historyTitle: "Track record",
      catalogTitle: "Projects in our catalog",
      status: {
        built: "Delivered",
        "under-construction": "Under construction",
        planned: "Planned",
        soon: "Coming soon",
      },
      timelineHint: "Hover a project to open its card.",
      timelineHintTouch: "Tap a project to open its card.",
      viewListing: "View the listing",
      viewPhotos: (n) => `View ${n} ${n === 1 ? "photo" : "photos"}`,
      album: {
        all: "All",
        photos: (n) => `${n} ${n === 1 ? "photo" : "photos"} — tap to open`,
        showAll: (n) => `Show all ${n}`,
      },
      build: {
        areaLabel: "Built area",
        areaUnit: "m²",
        finishLabel: "Finish standard",
        bands: {
          basic: { name: "Basic", hint: "Thai standard, local materials" },
          mid: { name: "Mid-range", hint: "Western standard — the usual choice" },
          premium: { name: "Premium", hint: "High-spec materials, bespoke joinery" },
        },
        poolLabel: "With a pool",
        feesLabel: "Design and supervision",
        feesHint:
          "Architect, engineer and site supervision run {pct} of the build cost.",
        budget: "Build budget",
        perSqm: "per m²",
        duration: "Construction",
        months: (a, b) => `${a}–${b} months`,
        permitLine: (a, b) => `the permit, ${a}–${b} months before work starts`,
        andUp: " and up",
        excludedTitle: "Not included",
        excluded: [
          "the land",
          "site prep: clearing, access road, retaining walls",
          "utility connections and government fees",
          "furniture and equipment",
          "landscaping and driveways",
        ],
        disclaimer:
          "An estimate from published market bands for Koh Phangan, not a quote. A builder's quote depends on the plot, the slope and the spec.",
        articleCta: "How building on Phangan works",
        fullCalcCta: "Full pro-forma with land",
      },
      returns: {
        kpiRoi: "Total return",
        kpiCagr: "Per year",
        kpiProfit: "Profit over the hold",
        kpiRentYear: "Net rent / year",
        yearsLabel: "Hold for",
        yearsValue: (n) => `${n} ${n === 1 ? "year" : "years"}`,
        growthLabel: "Price growth / year",
        claimed: (unit, y, p) =>
          `The developer publishes ${y}% a year and ${p}-year payback for the ${unit} — that figure is theirs; the numbers above are ours.`,
        marketSource: (d, rate, occ) =>
          `Our own market data: ฿${rate.toLocaleString("en-US")} a night at ${occ}% occupancy, ${d}. Leasehold, 30 years, let from handover. An estimate, not a guarantee.`,
        noMarket: "An estimate on our own assumptions, not a guarantee.",
        fullCta: "Open the full calculator",
      },
      nextLeasehold: "Leasehold on Phangan",
      nextOffplan: "Buying off-plan",
      nextVetting: "What we check before listing",
      nextProcess: "How a deal runs",
      nextZoning: "What you can build here",
      nextInsights: "Rental market data",
      sections: {
        photosTitle: "Projects in photos",
        photosLede: "Delivered villas, shot by the developer — no renders.",
        returnsTitle: "What it returns",
        returnsLede:
          "Run the numbers on the project that is for sale — our market data, your assumptions.",
        buildTitle: "What it costs to build",
        buildLede:
          "A rough budget for building your own villa on the island, from published market bands.",
        nextTitle: "Where to next",
        nextCatalog: "Catalog",
        nextLearn: "Get your bearings",
        nextTools: "Tools",
      },
      dateTbc: "Years are shown where the developer has confirmed them.",
      soonLede:
        "The developer hasn't confirmed the details yet — we publish only what we can verify.",
      formTitle: "Construction enquiry",
      formLede:
        "Planning to build on Koh Phangan? Leave a request — we'll discuss your brief and coordinate it with the developer directly. Your enquiry goes to Right Way and we reply within a working day.",
      formSubmit: "Send request",
      formDefaultMessage: (name) =>
        `Hi! I'm interested in building with ${name} on Koh Phangan. Could we discuss my project?`,
      indexEyebrow: "Developers",
      indexTitle: "Developers building on Koh Phangan.",
      indexLede:
        "Vetted developers we work with on the island — their track record, current projects and a direct line to enquire, all in one place.",
      nav: { overview: "Overview", history: "Track record", projects: "Projects", photos: "Photos", returns: "Returns", build: "Build", enquire: "Enquire" },
      kpi: { projects: "Projects listed", delivered: "Delivered", building: "Under construction", portfolio: "Portfolio" },
      galleryTitle: "Projects in photos",
      mapTitle: "Where the projects are",
      mapLede: "Sites confirmed by the developer — tap a pin for directions.",
    },
  },
  ru: {
    eyebrow: "Проекты застройщиков",
    indexTitle: "Проекты от застройщиков на Пангане.",
    indexLede:
      "Отобранные проекты застройщиков — виллы с бассейном, off-plan комплексы и дома под ключ. По каждому — полная картина: юниты, цена, график платежей и прогноз доходности.",
    count: (n) => `${n} ${n === 1 ? "проект" : n < 5 ? "проекта" : "проектов"} на острове.`,
    empty: "Пока нет опубликованных проектов. Новые проекты застройщиков появляются здесь по мере выхода.",
    viewProject: "Смотреть проект",
    from: "от",
    developer: "Застройщик",
    completion: "Срок сдачи",
    units: "Юниты",
    availableLabel: "Доступно",
    takenLabel: "Занято",
    available: (a, total) => `доступно ${a} из ${total}`,
    soldOut: "Всё зарезервировано",
    unitsLeft: (n) => `осталось ${n} ${n === 1 ? "юнит" : n < 5 ? "юнита" : "юнитов"}`,
    enquire: "Запросить по проекту",
    backToProjects: "Назад к проектам",
    home: "Главная",
    otherProjects: "Другие проекты",
    nav: {
      overview: "Обзор",
      gallery: "Галерея",
      plans: "Планировки",
      video: "Видео",
      units: "Юниты",
      pricing: "Цена",
      returns: "Доходность",
      timeline: "Сроки",
      construction: "Ход стройки",
      team: "Команда",
      location: "Локация",
      enquire: "Заявка",
    },
    sections: {
      overview: "О проекте",
      gallery: "Галерея",
      plans: "Планировки и мастерплан",
      video: "Видео и тур",
      units: "Юниты и остатки",
      unitsLede: "Актуальная доступность по проекту.",
      pricing: "Цена и оплата",
      priceStages: "Цена по этапам",
      paymentTerms: "График платежей",
      leasePrepayment: "Предоплата аренды земли",
      tenure: "Вид владения",
      leaseTerm: "Срок аренды",
      returns: "Прогноз доходности",
      returnsLede:
        "Смоделируйте перспективу проекта. Все цифры иллюстративны — не гарантия.",
      netYield: "Чистая доходность",
      estIncome: "Оценка чистого дохода",
      timeline: "Этапы строительства",
      construction: "Ход стройки",
      team: "Застройщик и команда",
      location: "Локация",
      amenities: "Что включено",
      facts: "Ключевые факты",
    },
    construction: {
      title: "Ход строительства",
      lede: "Фотографии со стройплощадки, новые — сверху. Страница пополняется по мере работ.",
      viewAll: "Все фото со стройки",
      backToProject: "Назад к проекту",
      latest: "Последний отчёт",
      photos: (n) => `${n} фото`,
      metaDescription: (name) =>
        `Ход строительства ${name} на Ко Пангане — фотоотчёты со стройплощадки по датам.`,
    },
    watchVideo: "Смотреть видео",
    contactMessage: (title) => `Здравствуйте! Интересует ${title}. Расскажите подробнее, пожалуйста.`,
    stage: {
      Ready: "Готов",
      "Under construction": "Строится",
      "Off-plan": "Off-plan",
    },
    perYear: "/ год",
    developers: {
      aboutTitle: "О застройщике",
      historyTitle: "История проектов",
      catalogTitle: "Проекты в каталоге",
      status: {
        built: "Сдан",
        "under-construction": "Строится",
        planned: "Планируется",
        soon: "Скоро",
      },
      timelineHint: "Наведите на проект — откроется карточка.",
      timelineHintTouch: "Нажмите на проект — откроется карточка.",
      viewListing: "Смотреть объект",
      viewPhotos: (n) =>
        `Смотреть ${n} ${n === 1 ? "фото" : n < 5 ? "фото" : "фото"}`,
      album: {
        all: "Все",
        photos: (n) => `${n} ${n === 1 ? "кадр" : n < 5 ? "кадра" : "кадров"} — нажмите, чтобы открыть`,
        showAll: (n) => `Показать все ${n}`,
      },
      build: {
        areaLabel: "Площадь дома",
        areaUnit: "м²",
        finishLabel: "Класс отделки",
        bands: {
          basic: { name: "Базовый", hint: "тайский стандарт, местные материалы" },
          mid: { name: "Средний", hint: "западный стандарт — обычный выбор" },
          premium: { name: "Премиум", hint: "дорогие материалы, столярка на заказ" },
        },
        poolLabel: "С бассейном",
        feesLabel: "Проект и надзор",
        feesHint:
          "Архитектор, конструктор и технадзор — {pct} от стоимости стройки.",
        budget: "Бюджет стройки",
        perSqm: "за м²",
        duration: "Стройка",
        months: (a, b) => `${a}–${b} мес`,
        permitLine: (a, b) => `разрешение, ${a}–${b} мес до начала работ`,
        andUp: " и выше",
        excludedTitle: "Не входит",
        excluded: [
          "земля",
          "подготовка участка: расчистка, подъезд, подпорные стены",
          "подключения и госпошлины",
          "мебель и техника",
          "ландшафт и дорожки",
        ],
        disclaimer:
          "Прикидка по опубликованным рыночным вилкам для Пангана, а не смета. Реальная цена зависит от участка, уклона и спецификации.",
        articleCta: "Как строят на Пангане",
        fullCalcCta: "Полная проформа с землёй",
      },
      returns: {
        kpiRoi: "Итоговая доходность",
        kpiCagr: "В год",
        kpiProfit: "Прибыль за срок",
        kpiRentYear: "Чистая аренда / год",
        yearsLabel: "Держим",
        yearsValue: (n) =>
          `${n} ${n === 1 ? "год" : n % 10 >= 2 && n % 10 <= 4 && (n < 12 || n > 14) ? "года" : "лет"}`,
        growthLabel: "Рост цены / год",
        claimed: (unit, y, p) =>
          `Застройщик заявляет по формату ${unit} ${y}% годовых и окупаемость за ${p} лет — это его цифра; выше расчёт наш.`,
        marketSource: (d, rate, occ) =>
          `Наши рыночные данные: ${rate.toLocaleString("ru-RU")} ฿ за ночь при загрузке ${occ}%, ${d}. Лизхолд 30 лет, аренда с момента сдачи. Это оценка, а не гарантия.`,
        noMarket: "Оценка на наших допущениях, не гарантия.",
        fullCta: "Открыть полный калькулятор",
      },
      nextLeasehold: "Лизхолд на Пангане",
      nextOffplan: "Покупка на стадии стройки",
      nextVetting: "Что мы проверяем до публикации",
      nextProcess: "Как проходит сделка",
      nextZoning: "Что здесь можно построить",
      nextInsights: "Данные рынка аренды",
      sections: {
        photosTitle: "Проекты в фото",
        photosLede: "Сданные виллы, съёмка застройщика — не рендеры.",
        returnsTitle: "Что это приносит",
        returnsLede:
          "Посчитайте проект, который сейчас в продаже: наши рыночные данные, ваши допущения.",
        buildTitle: "Сколько стоит построить",
        buildLede:
          "Прикидка бюджета на свою виллу по опубликованным рыночным вилкам.",
        nextTitle: "Куда дальше",
        nextCatalog: "Каталог",
        nextLearn: "Разобраться",
        nextTools: "Инструменты",
      },
      dateTbc: "Годы показаны там, где подтверждены застройщиком.",
      soonLede:
        "Детали пока не подтверждены застройщиком — публикуем только то, что проверили.",
      formTitle: "Заявка на строительство",
      formLede:
        "Планируете строить на Пангане? Оставьте заявку — обсудим задачу и скоординируем её с застройщиком напрямую. Заявка приходит в Right Way, отвечаем в течение рабочего дня.",
      formSubmit: "Отправить заявку",
      formDefaultMessage: (name) =>
        `Здравствуйте! Интересует строительство с ${name} на Пангане. Хочу обсудить свой проект.`,
      indexEyebrow: "Застройщики",
      indexTitle: "Застройщики Ко Пангана.",
      indexLede:
        "Проверенные застройщики, с которыми мы работаем на острове — их история, текущие проекты и прямая заявка, всё в одном месте.",
      nav: { overview: "О застройщике", history: "История", projects: "Проекты", photos: "Фото", returns: "Доходность", build: "Построить", enquire: "Заявка" },
      kpi: { projects: "Проектов в каталоге", delivered: "Сдано", building: "Строится", portfolio: "Портфолио" },
      galleryTitle: "Проекты в фото",
      mapTitle: "Где проекты",
      mapLede: "Площадки подтверждены застройщиком — по пину открывается маршрут.",
    },
  },
};

export function getProjectsDict(locale: Locale): ProjectsDict {
  return projectsDict[locale];
}

export interface EstatesDict {
  eyebrow: string;
  indexTitle: string;
  indexLede: string;
  count: (n: number) => string;
  empty: string;
  viewEstate: string;
  home: string;
  breadcrumb: string;
  /** счётчики/строки доступности */
  plots: string;
  available: string;
  reserved: string;
  sold: string;
  rented: string;
  taken: string;
  availableOf: (a: number, total: number) => string;
  soldOut: string;
  plotsLeft: (n: number) => string;
  /** статусные бейджи */
  status: Record<PlotStatusKey, string>;
  /** заголовки секций */
  sections: {
    overview: string;
    highlights: string;
    plotsTitle: string;
    plotsLede: string;
    plan: string;
    gallery: string;
    location: string;
  };
  /** короткие подписи липкой навигации по странице */
  nav: { overview: string; plan: string; plots: string; gallery: string; location: string; returns: string };
  /** секция калькулятора окупаемости участков */
  returns: { eyebrow: string; title: string; intro: string };
  /** столбцы таблицы лотов */
  table: {
    plot: string;
    area: string;
    tenure: string;
    price: string;
    statusCol: string;
  };
  tenure: Record<"Freehold" | "Leasehold", string>;
  priceOnRequest: string;
  perRaiMonth: string;
  forSale: string;
  forLease: string;
  viewPlot: string;
  enquire: string;
  enquireTitle: string;
  otherEstates: string;
  seeDistrict: string;
  ddNote: string;
  /** план разбивки */
  planLede: string;
  /** подписи на самой схеме и в панели рядом с ней */
  planUi: {
    /** подпись под названием на схеме */
    caption: string;
    /** метка закатной/морской (западной) стороны */
    west: string;
    /** подсказка в панели, пока лот не выбран */
    hint: string;
    /** ориентир по сторонам света */
    orient: string;
  };
  /** фильтр и сортировка лотов */
  filter: { all: string; available: string; sea: string; mountain: string };
  sortLabel: string;
  sort: { recommended: string; priceLow: string; priceHigh: string; areaLarge: string };
  /** вид с участка (чип) */
  view: { sea: string; mountain: string };
  /** заявка по конкретному лоту */
  enquireLot: (code: string) => string;
  lotPrefill: (code: string) => string;
  noMatch: string;
  /** план: переключатель вида «схема ↔ спутник» */
  planView: { plan: string; satellite: string };
  satelliteHint: string;
  openInMaps: string;
  /** драуэр одного лота */
  drawer: {
    facts: string;
    view: string;
    note: string;
    buildTitle: string;
    coverage: string;
    villas: string;
    buildNote: string;
    roiCta: string;
    fullPlot: string;
    addCompare: string;
    inCompare: string;
  };
  /** сравнение лотов */
  compare: {
    title: string;
    open: string;
    clear: string;
    empty: string;
    pricePerSqm: string;
    add: (code: string) => string;
  };
  /** динамика рынка */
  momentum: (taken: number, total: number) => string;
}

type PlotStatusKey = "available" | "reserved" | "sold" | "rented";

const estatesDict: Record<Locale, EstatesDict> = {
  en: {
    eyebrow: "Land estates",
    indexTitle: "Plot collections on Phangan.",
    indexLede:
      "Land sold by the plot — several building plots from a single owner under one title, offered individually. Buy freehold or lease long-term; we track which plots are still available, reserved, sold or leased.",
    count: (n) => `${n} ${n === 1 ? "collection" : "collections"} on the island.`,
    empty: "No plot collections published yet. New estates appear here as they go live.",
    viewEstate: "View collection",
    home: "Home",
    breadcrumb: "Land estates",
    plots: "Plots",
    available: "Available",
    reserved: "Reserved",
    sold: "Sold",
    rented: "Leased",
    taken: "Taken",
    availableOf: (a, total) => `${a} of ${total} available`,
    soldOut: "Fully taken",
    plotsLeft: (n) => `${n} ${n === 1 ? "plot" : "plots"} left`,
    status: {
      available: "Available",
      reserved: "Reserved",
      sold: "Sold",
      rented: "Leased",
    },
    sections: {
      overview: "About this collection",
      highlights: "Why this estate",
      plotsTitle: "Plots & availability",
      plotsLede: "Live status across the estate — available, reserved, sold or leased.",
      plan: "Site plan",
      gallery: "On-site photos",
      location: "Location",
    },
    nav: { overview: "Overview", plan: "Site plan", plots: "Plots", gallery: "Photos", location: "Location", returns: "Returns" },
    returns: {
      eyebrow: "Investment",
      title: "Model your returns",
      intro: "Tick one or more freehold plots to see combined cost, projected value and ROI versus a bank deposit. Switch to Full for rental, leasehold and risk analysis.",
    },
    table: {
      plot: "Plot",
      area: "Area",
      tenure: "Tenure",
      price: "Price",
      statusCol: "Status",
    },
    tenure: { Freehold: "Freehold", Leasehold: "Leasehold" },
    priceOnRequest: "Price on request",
    perRaiMonth: "/ rai · month",
    forSale: "For sale",
    forLease: "For lease",
    viewPlot: "View plot",
    enquire: "Enquire about this collection",
    enquireTitle: "Enquire",
    otherEstates: "Other collections",
    seeDistrict: "See all listings in this district",
    ddNote:
      "One owner, one parent title — due diligence is done once and inherited by every plot.",
    planLede: "Hover a plot for details, tap to open its card. Colour shows status; north is up and the sun marks the west — sunset and sea.",
    planUi: {
      caption: "indicative subdivision · not to scale",
      west: "west · sunset · sea",
      hint: "Hover or tap a plot — its details show up here.",
      orient: "North is up; west — sunset and sea — is on the left",
    },
    filter: { all: "All", available: "Available", sea: "Sea view", mountain: "Mountain view" },
    sortLabel: "Sort",
    sort: { recommended: "Recommended", priceLow: "Price ↑", priceHigh: "Price ↓", areaLarge: "Largest" },
    view: { sea: "Sea view", mountain: "Mountain view" },
    enquireLot: (code) => `Enquire about ${code}`,
    lotPrefill: (code) => `I'm interested in plot ${code} at Haad Yao Hillside.`,
    noMatch: "No plots match this filter.",
    planView: { plan: "Plan", satellite: "Satellite" },
    satelliteHint: "Approximate location — imagery © Esri. Individual plot outlines are indicative.",
    openInMaps: "Open in Google Maps",
    drawer: {
      facts: "Plot details",
      view: "View",
      note: "Notes",
      buildTitle: "Build potential",
      coverage: "Buildable area (~30%)",
      villas: "Indicative villas",
      buildNote: "Indicative only — not a planning opinion. Final coverage depends on setbacks and title.",
      roiCta: "Model returns in the calculator",
      fullPlot: "Open full plot page",
      addCompare: "Add to compare",
      inCompare: "In compare",
    },
    compare: {
      title: "Compare plots",
      open: "Compare",
      clear: "Clear",
      empty: "Pick up to 3 plots to compare them side by side.",
      pricePerSqm: "Price / m²",
      add: (code) => `Compare ${code}`,
    },
    momentum: (taken, total) => `${taken} of ${total} already taken`,
  },
  ru: {
    eyebrow: "Земельные проекты",
    indexTitle: "Подборки участков на Пангане.",
    indexLede:
      "Земля по участкам — несколько участков под застройку от одного собственника под единым титулом, предлагаются по отдельности. Покупка во фрихолд или долгосрочная аренда; отслеживаем, какие участки свободны, в резерве, проданы или сданы.",
    count: (n) => `${n} ${n === 1 ? "подборка" : n < 5 ? "подборки" : "подборок"} на острове.`,
    empty: "Пока нет опубликованных подборок. Новые появляются здесь по мере выхода.",
    viewEstate: "Смотреть подборку",
    home: "Главная",
    breadcrumb: "Земельные проекты",
    plots: "Участки",
    available: "Свободно",
    reserved: "Резерв",
    sold: "Продано",
    rented: "Сдано",
    taken: "Занято",
    availableOf: (a, total) => `свободно ${a} из ${total}`,
    soldOut: "Всё занято",
    plotsLeft: (n) => `осталось ${n} ${n === 1 ? "участок" : n < 5 ? "участка" : "участков"}`,
    status: {
      available: "Свободен",
      reserved: "Резерв",
      sold: "Продан",
      rented: "Арендован",
    },
    sections: {
      overview: "Об этой подборке",
      highlights: "Почему этот проект",
      plotsTitle: "Участки и доступность",
      plotsLede: "Актуальный статус по подборке — свободен, резерв, продан или арендован.",
      plan: "План разбивки",
      gallery: "Фото с участков",
      location: "Расположение",
    },
    nav: { overview: "Обзор", plan: "План", plots: "Участки", gallery: "Фото", location: "На карте", returns: "Доходность" },
    returns: {
      eyebrow: "Инвестиции",
      title: "Посчитайте доходность",
      intro: "Отметьте один или несколько freehold-участков — увидите совокупную стоимость, прогноз цены и ROI против банковского депозита. В «Полном» режиме — аренда, leasehold и анализ рисков.",
    },
    table: {
      plot: "Участок",
      area: "Площадь",
      tenure: "Владение",
      price: "Цена",
      statusCol: "Статус",
    },
    tenure: { Freehold: "Фрихолд", Leasehold: "Лизхолд" },
    priceOnRequest: "Цена по запросу",
    perRaiMonth: "/ рай · мес",
    forSale: "Продажа",
    forLease: "Аренда",
    viewPlot: "Открыть участок",
    enquire: "Запросить по подборке",
    enquireTitle: "Заявка",
    otherEstates: "Другие подборки",
    seeDistrict: "Все объекты этого района",
    ddNote:
      "Один собственник, один родительский титул — due diligence делается один раз и наследуется каждым участком.",
    planLede: "Наведи на участок — покажем детали; нажми — откроется карточка. Цвет = статус. Север вверху, солнце — на западной стороне: закат и море.",
    planUi: {
      caption: "ориентировочная разбивка · не в масштабе",
      west: "запад · закат · море",
      hint: "Наведи или нажми на участок — детали появятся здесь.",
      orient: "Север вверху; запад — закат и море — слева",
    },
    filter: { all: "Все", available: "Свободные", sea: "Вид на море", mountain: "Вид на горы" },
    sortLabel: "Сортировка",
    sort: { recommended: "Рекомендуем", priceLow: "Цена ↑", priceHigh: "Цена ↓", areaLarge: "Площадь" },
    view: { sea: "Вид на море", mountain: "Вид на горы" },
    enquireLot: (code) => `Запросить ${code}`,
    lotPrefill: (code) => `Интересует участок ${code} в подборке Хад Яо.`,
    noMatch: "Под фильтр ничего не подходит.",
    planView: { plan: "Схема", satellite: "Спутник" },
    satelliteHint: "Примерное расположение — снимок © Esri. Контуры отдельных лотов ориентировочны.",
    openInMaps: "Открыть в Google Maps",
    drawer: {
      facts: "Параметры участка",
      view: "Вид",
      note: "Заметки",
      buildTitle: "Потенциал застройки",
      coverage: "Застраиваемая площадь (~30%)",
      villas: "Ориентировочно вилл",
      buildNote: "Только ориентир — не юр.заключение. Итог зависит от отступов и титула.",
      roiCta: "Смоделировать доходность в калькуляторе",
      fullPlot: "Открыть страницу участка",
      addCompare: "В сравнение",
      inCompare: "В сравнении",
    },
    compare: {
      title: "Сравнение участков",
      open: "Сравнить",
      clear: "Очистить",
      empty: "Выберите до 3 участков, чтобы сравнить их рядом.",
      pricePerSqm: "Цена / м²",
      add: (code) => `Сравнить ${code}`,
    },
    momentum: (taken, total) => `${taken} из ${total} уже занято`,
  },
};

export function getEstatesDict(locale: Locale): EstatesDict {
  return estatesDict[locale];
}
