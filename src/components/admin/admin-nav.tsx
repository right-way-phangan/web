import { cookies } from "next/headers";
import { unstable_cache } from "next/cache";
import { getPendingArticleCount } from "@/lib/data/articles";
import { getGuideDraftCount } from "@/lib/data/guide";
import { getOpenTaskCount } from "@/lib/data/agent-tasks";
import { getDraftPostCount } from "@/lib/data/social-posts";
import { AUTH_ENABLED, SESSION_COOKIE, verifySession } from "@/lib/auth/session";
import { canAccessAdminPath } from "@/lib/auth/roles";
import { ADMIN_SECTIONS, type AdminSection } from "@/lib/admin-sections";
import { AdminNavClient } from "./admin-nav-client";

/**
 * Общая навигация /admin: «Дашборд» + группы с выпадающими списками
 * (зеркало паттерна хедера сайта). Рендерится один раз из admin/layout.tsx —
 * страницы её не подключают; активный раздел вычисляется на клиенте из
 * pathname. Секции — из единого реестра lib/admin-sections.ts, отфильтрованы
 * по роли сессии (агент видит только своё). Бейджи (статьи на ревью, черновики
 * гайда/постов, задачи агентов) кэшируются на минуту — раньше каждая навигация
 * по админке стоила 4 живых запроса.
 */

export type { AdminSection };

const getBadgeCounts = unstable_cache(
  async () => {
    const [articles, guide, agents, posts] = await Promise.all([
      getPendingArticleCount(),
      getGuideDraftCount(),
      getOpenTaskCount(),
      getDraftPostCount(),
    ]);
    return { articles, guide, agents, posts } as Record<string, number>;
  },
  ["admin-nav-badges"],
  { revalidate: 60 },
);

export async function AdminNav() {
  let role = "admin";
  if (AUTH_ENABLED) {
    const token = (await cookies()).get(SESSION_COOKIE)?.value;
    const session = await verifySession(token);
    // Нет сессии → это /admin/login (middleware никого больше сюда не пустит).
    if (!session) return null;
    role = session.role;
  }
  const badges = await getBadgeCounts();
  const sections = ADMIN_SECTIONS.filter((s) => canAccessAdminPath(role, s.href)).map((s) => ({
    key: s.key,
    label: s.label,
    href: s.href as string,
    group: s.group ?? null,
    guideSlug: s.guideSlug ?? null,
    badge: badges[s.key] || 0,
  }));
  return <AdminNavClient sections={sections} />;
}
