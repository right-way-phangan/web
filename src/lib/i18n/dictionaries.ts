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
      { label: "Districts", href: "/districts" },
      { label: "Calculator", href: "/calculator" },
      { label: "Insights", href: "/insights" },
      { label: "Services", href: "/services" },
      { label: "Process", href: "/process" },
      { label: "About", href: "/about" },
      { label: "Knowledge", href: "/knowledge" },
      { label: "FAQ", href: "/faq" },
      { label: "Contact", href: "/contact" },
    ],
    getInTouch: "Get in touch",
    savedAria: "Saved listings",
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
      { label: "Районы", href: "/ru/districts" },
      { label: "Калькулятор", href: "/ru/calculator" },
      { label: "Аналитика", href: "/ru/insights" },
      { label: "Услуги", href: "/ru/services" },
      { label: "Процесс", href: "/ru/process" },
      { label: "О нас", href: "/ru/about" },
      { label: "База знаний", href: "/knowledge" },
      { label: "FAQ", href: "/faq" },
      { label: "Контакты", href: "/ru/contact" },
    ],
    getInTouch: "Связаться",
    savedAria: "Избранные объекты",
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

// ---- Lead form labels ----

export interface FormDict {
  name: string;
  namePlaceholder: string;
  email: string;
  phone: string;
  message: string;
  viewingDate: string;
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
    viewingDate: "Preferred viewing date (optional)",
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
    viewingDate: "Желаемая дата просмотра (необязательно)",
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
        meta: "Fixed fee from 60,000 THB",
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
      eyebrow: "Commission",
      title: "Honest about the fee.",
      lede: "The commission is paid by the seller and built into the price, in line with island norms. As a buyer, you pay us nothing — only the statutory Land Office fees on registration.",
      rows: [
        { label: "Commission", value: "5% of the deal", detail: "Due diligence, sale agreement, and transaction representation included.", payer: "Paid by the seller" },
        { label: "Minimum fee", value: "150,000 THB", detail: "On smaller deals, the higher of 5% or this floor applies — due diligence costs the same regardless of price.", payer: "Paid by the seller" },
        { label: "Complex structure", value: "+0.5–1%", detail: "Thai company setup, multi-property or non-trivial leasehold deals.", payer: "Paid by the seller" },
      ],
      note: "Nothing charged to the buyer, no hidden add-ons, no kickbacks. On a leasehold villa the commission is based on the full transaction value — the land lease prepayment plus the building.",
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
      title: "Три услуги. Каждая — как надо.",
      lede: "Мы сознательно не занимаемся управлением арендой, строительством, краткосрочной сдачей и предпродажной подготовкой. Вся работа построена вокруг трёх услуг — и каждая выполняется с одинаковым уровнем документации и внимания.",
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
        meta: "Фикс. гонорар от 60 000 THB",
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
      eyebrow: "Комиссия",
      title: "Честно о вознаграждении.",
      lede: "Комиссию платит продавец, она зашита в цену — по нормам острова. Как покупатель, вы не платите нам ничего, только государственные сборы Земельного управления при регистрации.",
      rows: [
        { label: "Комиссия", value: "5% от сделки", detail: "Включает due diligence, договор купли-продажи и представление интересов в сделке.", payer: "Платит продавец" },
        { label: "Минимальный гонорар", value: "150 000 THB", detail: "На небольших сделках применяется большее из 5% или этого минимума — проверка стоит одинаково независимо от цены.", payer: "Платит продавец" },
        { label: "Сложная структура", value: "+0,5–1%", detail: "Регистрация тайской компании, несколько объектов или нетривиальный лизхолд.", payer: "Платит продавец" },
      ],
      note: "С покупателя — ничего, без скрытых надбавок и откатов. По лизхолд-вилле комиссия считается от полной стоимости сделки — предоплата аренды земли плюс строение.",
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
      { number: 6, title: "Sale and Purchase Agreement", text: "A bilingual agreement (English–Thai) drafted by our partner law firm. We review every clause with you and explain Thai-specific provisions in plain language. Deposit is held in escrow until closing." },
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
      { number: 6, title: "Договор купли-продажи", text: "Двуязычный договор (англ.–тайск.) от нашей партнёрской юрфирмы. Разбираем с вами каждый пункт и объясняем тайские нюансы простым языком. Задаток — на эскроу до закрытия." },
      { number: 7, title: "Закрытие в Земельном управлении", text: "Представляем вас в Земельном управлении при передаче титула, уплате налогов и регистрации. Вы получаете оригиналы всех документов, итоговый отчёт по сделке и контакты по дальнейшим вопросам." },
    ],
    cta: {
      title: "Когда будете готовы.",
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
  anyDistrict: string;
  minPrice: string;
  maxPrice: string;
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
  rai: string;
  bed: string;
  // map split
  inMapArea: (n: number) => string;
  showAll: string;
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
    anyDistrict: "Any district",
    minPrice: "Min ฿",
    maxPrice: "Max ฿",
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
    rai: "rai",
    bed: "bed",
    inMapArea: (n) => `${n} ${n === 1 ? "property" : "properties"} in the map area`,
    showAll: "Show all",
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
    anyDistrict: "Любой район",
    minPrice: "Цена от ฿",
    maxPrice: "Цена до ฿",
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
    rai: "рай",
    bed: "сп.",
    inMapArea: (n) => `${n} ${pluralRu(n, "объект", "объекта", "объектов")} в области карты`,
    showAll: "Показать все",
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
  locationCountry: string;
  openInMaps: string;
  openInGoogleMaps: string;
  location: string;
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
  inquiryLede: string;
  orMessageDirectly: string;
  inquiryDefaultMessage: (rw: string) => string;
  // share / save
  share: string;
  copied: string;
  shareAria: string;
  saveAria: string;
  removeAria: string;
  // gallery
  galleryCaption: (rw: string, i: number, total: number) => string;
  prevPhoto: string;
  nextPhoto: string;
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
  specRows: Record<string, string>;
  yes: string;
  no: string;
  years: (n: number) => string;
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
    locationCountry: "Koh Phangan, Thailand",
    openInMaps: "Open in Maps",
    openInGoogleMaps: "Open in Google Maps",
    location: "Location",
    perRaiMonth: "/ rai / month",
    priceOnRequest: "Price on request",
    aboutProperty: "About this property",
    whyThisOne: "Why this one",
    specifications: "Specifications",
    buildingRules: "Building rules",
    investmentOutlook: "Investment outlook",
    investmentOutlookLede: "Project this property’s value over time. Set your own growth outlook — every figure is illustrative.",
    enquireOrBook: "Enquire or book a viewing",
    inquiryLede: "Ask a question or pick a date to see it. We reply within the working day, usually within an hour.",
    orMessageDirectly: "Or message directly",
    inquiryDefaultMessage: (rw) => `Hi — I'd like more information about ${rw}.`,
    share: "Share",
    copied: "Copied",
    shareAria: "Share this listing",
    saveAria: "Save to shortlist",
    removeAria: "Remove from saved",
    galleryCaption: (rw, i, total) => `${rw} photos — ${i} of ${total}`,
    prevPhoto: "Previous photo",
    nextPhoto: "Next photo",
    moreInNearby: (district) => `More in ${district} & nearby`,
    moreToExplore: "More listings to explore",
    pcPerRai: "per rai",
    pcPerSqm: "per m²",
    pcAsking: "asking price",
    pcInLine: (district, metric) => `≈ in line with the ${district} average (${metric})`,
    pcDelta: (pct, dir, district, metric) => `≈ ${pct}% ${dir} the ${district} average ${metric}`,
    specGroups: { Pricing: "Pricing", Property: "Property", Legal: "Legal", Building: "Building", Features: "Features", Infrastructure: "Infrastructure" },
    specRows: {
      "Asking price": "Asking price", "Price per rai": "Price per rai", "Lease rent": "Lease rent",
      Type: "Type", District: "District", Zone: "Zone", "Plot area": "Plot area", "Built area": "Built area",
      Altitude: "Altitude", Terrain: "Terrain", "Document type": "Document type", Tenure: "Tenure", "Lease term": "Lease term",
      Bedrooms: "Bedrooms", Bathrooms: "Bathrooms", Built: "Built", Condition: "Condition", "On site": "On site",
      Electricity: "Electricity", Water: "Water", Internet: "Internet", "Road access": "Road access",
    },
    yes: "Yes",
    no: "No",
    years: (n) => `${n} years`,
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
    locationCountry: "Ко Панган, Таиланд",
    openInMaps: "Открыть в картах",
    openInGoogleMaps: "Открыть в Google Maps",
    location: "Расположение",
    perRaiMonth: "/ рай / мес",
    priceOnRequest: "Цена по запросу",
    aboutProperty: "Об объекте",
    whyThisOne: "Почему именно этот",
    specifications: "Характеристики",
    buildingRules: "Правила застройки",
    investmentOutlook: "Инвестиционный прогноз",
    investmentOutlookLede: "Спрогнозируйте стоимость объекта во времени. Задайте свой темп роста — все цифры иллюстративны.",
    enquireOrBook: "Запрос или запись на просмотр",
    inquiryLede: "Задайте вопрос или выберите дату просмотра. Отвечаем в течение рабочего дня, обычно в течение часа.",
    orMessageDirectly: "Или напишите напрямую",
    inquiryDefaultMessage: (rw) => `Здравствуйте — хочу узнать подробнее об объекте ${rw}.`,
    share: "Поделиться",
    copied: "Скопировано",
    shareAria: "Поделиться объектом",
    saveAria: "В избранное",
    removeAria: "Убрать из избранного",
    galleryCaption: (rw, i, total) => `${rw} — фото ${i} из ${total}`,
    prevPhoto: "Предыдущее фото",
    nextPhoto: "Следующее фото",
    moreInNearby: (district) => `Ещё в районе ${district} и рядом`,
    moreToExplore: "Другие объекты",
    pcPerRai: "за рай",
    pcPerSqm: "за м²",
    pcAsking: "запрашиваемая цена",
    pcInLine: (district, metric) => `≈ на уровне среднего по ${district} (${metric})`,
    pcDelta: (pct, dir, district, metric) => `≈ на ${pct}% ${dir === "below" ? "ниже" : "выше"} среднего по ${district} (${metric})`,
    specGroups: { Pricing: "Цена", Property: "Объект", Legal: "Юридически", Building: "Строение", Features: "Особенности", Infrastructure: "Инфраструктура" },
    specRows: {
      "Asking price": "Запрашиваемая цена", "Price per rai": "Цена за рай", "Lease rent": "Аренда",
      Type: "Тип", District: "Район", Zone: "Зона", "Plot area": "Площадь участка", "Built area": "Площадь строения",
      Altitude: "Высота", Terrain: "Рельеф", "Document type": "Тип документа", Tenure: "Вид владения", "Lease term": "Срок аренды",
      Bedrooms: "Спальни", Bathrooms: "Санузлы", Built: "Год постройки", Condition: "Состояние", "On site": "На участке",
      Electricity: "Электричество", Water: "Вода", Internet: "Интернет", "Road access": "Подъезд",
    },
    yes: "Да",
    no: "Нет",
    years: (n) => `${n} ${pluralRu(n, "год", "года", "лет")}`,
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
