import "server-only";
import { backendFetch, BACKEND_URL } from "@/lib/api/backend";

/**
 * Очередь соц-постов для /admin/posts. Источник правды — таблица social_posts в
 * бэкенде; Гермес (бот /пост) пишет туда черновики пары EN+RU (status=draft).
 * Здесь — только чтение для админки. Публикация в канал держится до запуска.
 */

export type SocialPostStatus = "draft" | "scheduled" | "published" | "rejected";

export interface DbSocialPost {
  id: number;
  pairId: string;
  lang: string; // en | ru
  channel: string; // telegram | ...
  topic: string | null;
  body: string;
  status: SocialPostStatus;
  reviewerNote: string | null;
  createdBy: string;
  scheduledAt: string | null;
  publishedAt: string | null;
  createdAt: string;
  updatedAt: string;
}

/** Пара EN+RU одного поста (сгруппировано по pairId). */
export interface SocialPostPair {
  pairId: string;
  topic: string | null;
  status: SocialPostStatus; // статус берём по любой из версий (они меняются вместе)
  createdAt: string;
  versions: DbSocialPost[]; // обычно [en, ru]
}

/** Посты заданного статуса (по умолчанию — все), свежие первыми. */
export async function getSocialPosts(status?: SocialPostStatus): Promise<DbSocialPost[]> {
  if (!BACKEND_URL) return [];
  try {
    const q = status ? `?status=${status}&limit=200` : "?limit=200";
    const r = await backendFetch(`/social-posts${q}`, { cache: "no-store" });
    return r.ok ? ((await r.json()) as DbSocialPost[]) : [];
  } catch (err) {
    console.error("[social-posts] getSocialPosts failed:", err);
    return [];
  }
}

/** Группировка строк в пары EN+RU по pairId (для рендера карточки). */
export function groupByPair(rows: DbSocialPost[]): SocialPostPair[] {
  const map = new Map<string, DbSocialPost[]>();
  for (const r of rows) {
    const arr = map.get(r.pairId) ?? [];
    arr.push(r);
    map.set(r.pairId, arr);
  }
  const pairs: SocialPostPair[] = [];
  for (const [pairId, versions] of map) {
    versions.sort((a, b) => (a.lang === "en" ? -1 : b.lang === "en" ? 1 : 0));
    const head = versions[0];
    pairs.push({
      pairId,
      topic: versions.find((v) => v.topic)?.topic ?? null,
      status: head.status,
      createdAt: head.createdAt,
      versions,
    });
  }
  pairs.sort((a, b) => (a.createdAt < b.createdAt ? 1 : -1));
  return pairs;
}

/** Число черновиков в очереди — для бейджа навигации. */
export async function getDraftPostCount(): Promise<number> {
  if (!BACKEND_URL) return 0;
  try {
    const r = await backendFetch(`/social-posts/draft-count`, { cache: "no-store" });
    if (!r.ok) return 0;
    const data = (await r.json()) as { count?: number };
    return data.count ?? 0;
  } catch (err) {
    console.error("[social-posts] getDraftPostCount failed:", err);
    return 0;
  }
}
