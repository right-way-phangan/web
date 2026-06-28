import type { Route } from "next";

/**
 * Единый реестр разделов админки. Источник правды и для верхней навигации
 * (AdminNav), и для детектора пробелов обучения (на обзоре /admin/guide
 * сверяется, у каких разделов уже есть учебная страница). Добавил раздел в
 * /admin — добавь строку сюда; если у него ещё нет гайда, детектор сам это
 * подсветит.
 */

export type AdminSection =
  | "home"
  | "objects"
  | "dd"
  | "outreach"
  | "crm"
  | "demand"
  | "articles"
  | "posts"
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

export interface AdminSectionMeta {
  key: AdminSection;
  label: string;
  href: Route;
  /** Учебная страница справочника (slug в /admin/guide), ожидаемая для раздела. */
  guideSlug?: string;
  /** Нужен ли разделу учебный материал (для детектора пробелов). */
  needsGuide: boolean;
}

export const ADMIN_SECTIONS: AdminSectionMeta[] = [
  { key: "home", label: "Дашборд", href: "/admin" as Route, needsGuide: false },
  { key: "objects", label: "База объектов", href: "/admin/objects" as Route, guideSlug: "objects", needsGuide: true },
  { key: "dd", label: "DD · Проверки", href: "/admin/dd" as Route, guideSlug: "dd", needsGuide: true },
  { key: "outreach", label: "Обзвон", href: "/admin/outreach" as Route, guideSlug: "outreach", needsGuide: true },
  { key: "crm", label: "CRM · Лиды", href: "/admin/crm" as Route, guideSlug: "crm", needsGuide: true },
  { key: "demand", label: "Спрос", href: "/admin/demand" as Route, guideSlug: "analytics", needsGuide: false },
  { key: "articles", label: "Статьи", href: "/admin/articles" as Route, guideSlug: "articles", needsGuide: true },
  { key: "posts", label: "Посты", href: "/admin/posts" as Route, guideSlug: "posts", needsGuide: false },
  { key: "finance", label: "Финансы", href: "/admin/finance" as Route, guideSlug: "analytics", needsGuide: true },
  { key: "valuation", label: "Оценка", href: "/admin/valuation" as Route, guideSlug: "valuation", needsGuide: true },
  { key: "comps", label: "Рынок · компсы", href: "/admin/comps" as Route, guideSlug: "comps", needsGuide: true },
  { key: "journey", label: "Путь посетителя", href: "/admin/journey" as Route, guideSlug: "journey", needsGuide: true },
  { key: "seo", label: "SEO · Search Console", href: "/admin/seo" as Route, guideSlug: "seo", needsGuide: true },
  { key: "trends", label: "Тренды", href: "/admin/trends" as Route, guideSlug: "trends", needsGuide: true },
  { key: "agents", label: "Агенты", href: "/admin/agents" as Route, guideSlug: "agents", needsGuide: true },
  { key: "zoning", label: "Зоны застройки", href: "/admin/zoning" as Route, guideSlug: "zoning", needsGuide: true },
  { key: "photo-audit", label: "Проверка фото", href: "/admin/photo-audit" as Route, guideSlug: "photo-audit", needsGuide: true },
  { key: "health", label: "Здоровье", href: "/admin/health" as Route, needsGuide: false },
  { key: "guide", label: "Справочник", href: "/admin/guide" as Route, needsGuide: false },
  { key: "new", label: "+ Новый объект", href: "/admin/new" as Route, guideSlug: "objects", needsGuide: false },
];

/** Куда ведёт «❓ Как это работает» с данной страницы (контекстная справка). */
export function helpHrefFor(active: AdminSection): string {
  const meta = ADMIN_SECTIONS.find((s) => s.key === active);
  return meta?.guideSlug ? `/admin/guide/${meta.guideSlug}` : "/admin/guide";
}
