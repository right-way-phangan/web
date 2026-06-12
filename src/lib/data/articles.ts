import "server-only";
import { backendFetch, BACKEND_URL } from "@/lib/api/backend";
import type { KbBlock } from "@/content/knowledge-base";
import type { BlogPost } from "@/content/blog";
import { BLOG_POSTS } from "@/content/blog";
import { BLOG_POSTS_RU } from "@/content/blog.ru";

/**
 * DB-backed blog articles (content pipeline with review-gate). Published rows
 * from the own backend are merged with the hand-written static posts in
 * web/src/content/blog{,.ru}.ts so /blog renders both from one list.
 *
 * Article bodies are stored as markdown in the DB (source of truth, editable in
 * /admin/articles). We convert markdown → KbBlock[] here so they render through
 * the same <ArticleBody> as the static posts. Supported markdown subset:
 *   # / ## …      → subheading
 *   - / * / 1.    → bullet list
 *   blank-line    → paragraph break
 *   **bold**, [label](/href)  → inline (handled by ArticleBody)
 */

export type ArticleStatus = "pending" | "published" | "rejected";

export interface DbArticle {
  id: number;
  slug: string;
  lang: string;
  title: string;
  excerpt: string;
  topic: string;
  bodyMd: string;
  takeaways: string[] | null;
  readMins: number | null;
  coverImage: string | null;
  status: ArticleStatus;
  reviewerNote: string | null;
  createdBy: string;
  publishedAt: string | null;
  createdAt: string;
  updatedAt: string;
}

/** Markdown → KbBlock[] (the minimal subset the blog renderer supports). */
export function mdToBlocks(md: string): KbBlock[] {
  const lines = md.replace(/\r\n/g, "\n").split("\n");
  const blocks: KbBlock[] = [];
  let para: string[] = [];
  let list: string[] = [];
  const flushPara = () => {
    if (para.length) {
      blocks.push(para.join(" ").trim());
      para = [];
    }
  };
  const flushList = () => {
    if (list.length) {
      blocks.push({ ul: list.slice() });
      list = [];
    }
  };
  for (const raw of lines) {
    const line = raw.trim();
    if (!line) {
      flushList();
      flushPara();
      continue;
    }
    const h = /^#{1,6}\s+(.*)$/.exec(line);
    if (h) {
      flushList();
      flushPara();
      blocks.push({ h: h[1].trim() });
      continue;
    }
    const li = /^(?:[-*]|\d+\.)\s+(.*)$/.exec(line);
    if (li) {
      flushPara();
      list.push(li[1].trim());
      continue;
    }
    flushList();
    para.push(line);
  }
  flushList();
  flushPara();
  return blocks;
}

/** ISO datetime → "YYYY-MM-DD" (BlogPost.published is a date string). */
function toDateStr(iso: string | null, fallback: string): string {
  const src = iso || fallback;
  return src.slice(0, 10);
}

/** Map a DB row to the shared BlogPost shape used by the public blog. */
export function dbArticleToBlogPost(a: DbArticle): BlogPost {
  return {
    slug: a.slug,
    title: a.title,
    excerpt: a.excerpt,
    topic: a.topic,
    published: toDateStr(a.publishedAt, a.createdAt),
    readMins: a.readMins ?? 1,
    body: mdToBlocks(a.bodyMd),
    takeaways: a.takeaways ?? undefined,
  };
}

async function fetchPublished(lang: string): Promise<DbArticle[]> {
  if (!BACKEND_URL) return [];
  try {
    const r = await backendFetch(`/articles?status=published&lang=${lang}`, {
      next: { revalidate: 60, tags: ["articles"] },
    });
    if (!r.ok) return [];
    return (await r.json()) as DbArticle[];
  } catch (err) {
    console.error("[articles] fetchPublished failed:", err);
    return [];
  }
}

const STATIC_BY_LANG: Record<string, BlogPost[]> = {
  en: BLOG_POSTS,
  ru: BLOG_POSTS_RU,
};

/**
 * All blog posts for a language — DB-published merged with static, newest
 * first. On slug collision the DB row wins (it is the editable source).
 */
export async function getAllBlogPosts(lang: "en" | "ru" = "en"): Promise<BlogPost[]> {
  const dbPosts = (await fetchPublished(lang)).map(dbArticleToBlogPost);
  const bySlug = new Map<string, BlogPost>();
  for (const p of STATIC_BY_LANG[lang] ?? []) bySlug.set(p.slug, p);
  for (const p of dbPosts) bySlug.set(p.slug, p); // DB overrides static
  return [...bySlug.values()].sort((a, b) => b.published.localeCompare(a.published));
}

// ─── Admin-facing fetchers (all statuses, always fresh) ───

/** Every article (all statuses) for the /admin/articles queue. */
export async function getAdminArticles(): Promise<DbArticle[]> {
  if (!BACKEND_URL) return [];
  try {
    const r = await backendFetch(`/articles`, { cache: "no-store" });
    return r.ok ? ((await r.json()) as DbArticle[]) : [];
  } catch (err) {
    console.error("[articles] getAdminArticles failed:", err);
    return [];
  }
}

/**
 * The other language version of an EN+RU pair (same slug, other lang) — the
 * review page shows whether the paired translation exists and its status.
 */
export async function getPairedArticle(slug: string, lang: string): Promise<DbArticle | null> {
  if (!BACKEND_URL) return null;
  const other = lang === "ru" ? "en" : "ru";
  try {
    const r = await backendFetch(
      `/articles/slug/${encodeURIComponent(slug)}?lang=${other}`,
      { cache: "no-store" },
    );
    return r.ok ? ((await r.json()) as DbArticle) : null;
  } catch {
    return null;
  }
}

/** One article by id (admin review). */
export async function getAdminArticle(id: number): Promise<DbArticle | null> {
  if (!BACKEND_URL) return null;
  try {
    const r = await backendFetch(`/articles/${id}`, { cache: "no-store" });
    return r.ok ? ((await r.json()) as DbArticle) : null;
  } catch (err) {
    console.error("[articles] getAdminArticle failed:", err);
    return null;
  }
}

/** Count awaiting review — dashboard stat + nav badge. */
export async function getPendingArticleCount(): Promise<number> {
  if (!BACKEND_URL) return 0;
  try {
    const r = await backendFetch(`/articles/pending-count`, { cache: "no-store" });
    if (!r.ok) return 0;
    const j = (await r.json()) as { count: number };
    return j.count ?? 0;
  } catch {
    return 0;
  }
}

/** One post by slug (DB-published first, then static). */
export async function getBlogPost(
  slug: string,
  lang: "en" | "ru" = "en",
): Promise<BlogPost | null> {
  if (BACKEND_URL) {
    try {
      // ?lang= picks the right row of the EN+RU pair sharing this slug
      const r = await backendFetch(`/articles/slug/${encodeURIComponent(slug)}?lang=${lang}`, {
        next: { revalidate: 60, tags: ["articles"] },
      });
      if (r.ok) {
        const a = (await r.json()) as DbArticle;
        if (a && a.status === "published" && a.lang === lang) return dbArticleToBlogPost(a);
      }
    } catch (err) {
      console.error("[articles] getBlogPost failed:", err);
    }
  }
  return (STATIC_BY_LANG[lang] ?? []).find((p) => p.slug === slug) ?? null;
}
