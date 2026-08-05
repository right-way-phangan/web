import type { Route } from "next";

/**
 * Единый реестр разделов админки. Источник правды для верхней навигации
 * (AdminNav), командной палитры (⌘K, /admin/api/search) и детектора пробелов
 * обучения (на обзоре /admin/guide сверяется, у каких разделов уже есть
 * учебная страница). Добавил раздел в /admin — добавь строку сюда; если у
 * него ещё нет гайда, детектор сам это подсветит, а палитра начнёт находить.
 */

export type AdminSection =
  | "home"
  | "objects"
  | "dd"
  | "outreach"
  | "crm"
  | "crm-today"
  | "crm-tasks"
  | "crm-calendar"
  | "crm-contacts"
  | "crm-triage"
  | "crm-import"
  | "crm-stats"
  | "crm-health"
  | "match"
  | "demand"
  | "articles"
  | "posts"
  | "ads"
  | "finance"
  | "valuation"
  | "comps"
  | "journey"
  | "seo"
  | "trends"
  | "agents"
  | "zoning"
  | "photo-audit"
  | "health"
  | "guide"
  | "new";

/** Группы верхней навигации (порядок = порядок в баре). «Дашборд» вне групп. */
export type AdminGroup = "objects" | "crm" | "content" | "analytics" | "system";

export const ADMIN_GROUPS: { key: AdminGroup; label: string }[] = [
  { key: "objects", label: "Объекты" },
  { key: "crm", label: "CRM" },
  { key: "content", label: "Контент" },
  { key: "analytics", label: "Аналитика" },
  { key: "system", label: "Система" },
];

export interface AdminSectionMeta {
  key: AdminSection;
  label: string;
  href: Route;
  /** Группа навигации; нет у home (плоская ссылка «Дашборд»). */
  group?: AdminGroup;
  /** Синонимы для поиска в командной палитре (⌘K). */
  keywords?: string;
  /** Учебная страница справочника (slug в /admin/guide), ожидаемая для раздела. */
  guideSlug?: string;
  /** Нужен ли разделу учебный материал (для детектора пробелов). */
  needsGuide: boolean;
}

export const ADMIN_SECTIONS: AdminSectionMeta[] = [
  {
    key: "home",
    label: "Дашборд",
    href: "/admin" as Route,
    keywords: "dashboard дашборд обзор сводка",
    needsGuide: false,
  },
  {
    key: "objects",
    label: "База объектов",
    href: "/admin/objects" as Route,
    group: "objects",
    keywords: "objects объекты база каталог listings",
    guideSlug: "objects",
    needsGuide: true,
  },
  {
    key: "new",
    label: "+ Новый объект",
    href: "/admin/new" as Route,
    group: "objects",
    keywords: "new объект добавить завести intake",
    guideSlug: "objects",
    needsGuide: false,
  },
  {
    key: "dd",
    label: "DD · Проверки",
    href: "/admin/dd" as Route,
    group: "objects",
    keywords: "dd проверки vetting юрист due diligence",
    guideSlug: "dd",
    needsGuide: true,
  },
  {
    key: "outreach",
    label: "Обзвон",
    href: "/admin/outreach" as Route,
    group: "objects",
    keywords: "outreach обзвон собственники звонки",
    guideSlug: "outreach",
    needsGuide: true,
  },
  {
    key: "photo-audit",
    label: "Проверка фото",
    href: "/admin/photo-audit" as Route,
    group: "objects",
    keywords: "photo фото утечка документы скан чанот",
    guideSlug: "photo-audit",
    needsGuide: true,
  },
  {
    key: "zoning",
    label: "Зоны застройки",
    href: "/admin/zoning" as Route,
    group: "objects",
    keywords: "zoning зоны застройки кадастр карта",
    guideSlug: "zoning",
    needsGuide: true,
  },
  {
    key: "crm",
    label: "Доска лидов",
    href: "/admin/crm" as Route,
    group: "crm",
    keywords: "crm борд лиды доска kanban",
    guideSlug: "crm",
    needsGuide: true,
  },
  {
    key: "crm-today",
    label: "Сегодня",
    href: "/admin/crm/today" as Route,
    group: "crm",
    keywords: "today сегодня план дня фокус",
    guideSlug: "crm",
    needsGuide: false,
  },
  {
    key: "crm-tasks",
    label: "Задачи",
    href: "/admin/crm/tasks" as Route,
    group: "crm",
    keywords: "tasks задачи снуз дедлайны",
    guideSlug: "crm",
    needsGuide: false,
  },
  {
    key: "crm-calendar",
    label: "Показы",
    href: "/admin/crm/calendar" as Route,
    group: "crm",
    keywords: "calendar календарь показы viewings",
    guideSlug: "crm",
    needsGuide: false,
  },
  {
    key: "crm-contacts",
    label: "Контакты",
    href: "/admin/crm/contacts" as Route,
    group: "crm",
    keywords: "contacts книга телефоны email контакты",
    guideSlug: "crm",
    needsGuide: false,
  },
  {
    key: "crm-triage",
    label: "Разбор legacy",
    href: "/admin/crm/triage" as Route,
    group: "crm",
    keywords: "triage разбор legacy очередь amo",
    guideSlug: "crm",
    needsGuide: false,
  },
  {
    key: "crm-import",
    label: "Импорт CSV",
    href: "/admin/crm/import" as Route,
    group: "crm",
    keywords: "import csv импорт лидов",
    guideSlug: "crm",
    needsGuide: false,
  },
  {
    key: "crm-stats",
    label: "Метрики CRM",
    href: "/admin/crm/stats" as Route,
    group: "crm",
    keywords: "stats метрики воронка прогноз цель",
    guideSlug: "crm",
    needsGuide: false,
  },
  {
    key: "crm-health",
    label: "Здоровье CRM",
    href: "/admin/crm/health" as Route,
    group: "crm",
    keywords: "health гигиена залипшие молчащие битые",
    guideSlug: "crm",
    needsGuide: false,
  },
  {
    key: "match",
    label: "Подбор · Match",
    href: "/admin/match" as Route,
    group: "crm",
    keywords: "match подбор ии walk-in",
    guideSlug: "match",
    needsGuide: true,
  },
  {
    key: "demand",
    label: "Спрос",
    href: "/admin/demand" as Route,
    group: "crm",
    keywords: "demand спрос инвентарь закупка",
    guideSlug: "analytics",
    needsGuide: false,
  },
  {
    key: "articles",
    label: "Статьи",
    href: "/admin/articles" as Route,
    group: "content",
    keywords: "articles статьи блог согласование ревью",
    guideSlug: "articles",
    needsGuide: true,
  },
  {
    key: "posts",
    label: "Посты",
    href: "/admin/posts" as Route,
    group: "content",
    keywords: "posts посты соцсети telegram",
    guideSlug: "posts",
    needsGuide: false,
  },
  {
    key: "ads",
    label: "Реклама",
    href: "/admin/ads" as Route,
    group: "content",
    keywords: "ads реклама офферы utm кампании",
    guideSlug: "ads",
    needsGuide: true,
  },
  {
    key: "finance",
    label: "Финансы",
    href: "/admin/finance" as Route,
    group: "analytics",
    keywords: "finance финансы opex runway кассы траты",
    guideSlug: "analytics",
    needsGuide: true,
  },
  {
    key: "valuation",
    label: "Оценка",
    href: "/admin/valuation" as Route,
    group: "analytics",
    keywords: "valuation оценка стоимость факторы компсы",
    guideSlug: "valuation",
    needsGuide: true,
  },
  {
    key: "comps",
    label: "Рынок · компсы",
    href: "/admin/comps" as Route,
    group: "analytics",
    keywords: "comps компсы рынок конкуренты медианы",
    guideSlug: "comps",
    needsGuide: true,
  },
  {
    key: "journey",
    label: "Путь посетителя",
    href: "/admin/journey" as Route,
    group: "analytics",
    keywords: "journey путь посетителя сессии поведение",
    guideSlug: "journey",
    needsGuide: true,
  },
  {
    key: "seo",
    label: "SEO · Search Console",
    href: "/admin/seo" as Route,
    group: "analytics",
    keywords: "seo search console запросы позиции",
    guideSlug: "seo",
    needsGuide: true,
  },
  {
    key: "trends",
    label: "Тренды",
    href: "/admin/trends" as Route,
    group: "analytics",
    keywords: "trends тренды метрики спарклайны wow",
    guideSlug: "trends",
    needsGuide: true,
  },
  {
    key: "agents",
    label: "Агенты",
    href: "/admin/agents" as Route,
    group: "system",
    keywords: "agents агенты ии задачи консилиум совет",
    guideSlug: "agents",
    needsGuide: true,
  },
  {
    key: "health",
    label: "Здоровье каталога",
    href: "/admin/health" as Route,
    group: "system",
    keywords: "health здоровье каталог пробелы данные",
    needsGuide: false,
  },
  {
    key: "guide",
    label: "Справочник",
    href: "/admin/guide" as Route,
    group: "system",
    keywords: "guide справочник учебник гайд как работает",
    needsGuide: false,
  },
];
