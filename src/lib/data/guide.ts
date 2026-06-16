import "server-only";
import fs from "node:fs";
import path from "node:path";
import { getPublishedGuideSlugs } from "./settings";

/**
 * Внутренний справочник компании (/admin/guide) — «как тут всё работает».
 * Контент — markdown-файлы в src/content/guide/*.md (git = версия истории),
 * фронтматтер: title / section / order / updated / summary / keywords.
 * Лента «Что нового» — src/content/guide/_changelog.md, по строке на запись:
 *   - 2026-06-13 · crm · Добавлен раздел про задачи
 * Файлы читаются с диска на каждый запрос (страницы и так dynamic из-за
 * AdminNav) — пути включены в outputFileTracingIncludes (next.config.ts).
 */

export const GUIDE_SECTIONS = [
  { id: "training", title: "Обучение" },
  { id: "company", title: "Компания" },
  { id: "operations", title: "Операции" },
  { id: "tools", title: "Инструменты" },
  { id: "marketing", title: "Маркетинг" },
] as const;

export type GuideSectionId = (typeof GUIDE_SECTIONS)[number]["id"];

export interface GuidePageMeta {
  slug: string;
  title: string;
  section: GuideSectionId;
  order: number;
  /** YYYY-MM-DD последней содержательной правки — показывается на странице. */
  updated: string;
  summary: string;
  /** Дополнительные слова для поиска ⌘K (рус/англ синонимы). */
  keywords: string;
  /** Черновик (фронтматтер `status: draft`) — ждёт проверки, помечен в UI. */
  draft: boolean;
}

/** Живые данные, подставляемые в маркеры {{…}} страницы (актуальны на запрос). */
export interface GuideLiveData {
  /** Воронки и их стадии — маркер {{stages}}. */
  stages?: { pipeline: string; stages: string[] }[];
  /** Рабочие разделы админки — маркер {{admin-sections}}. */
  adminSections?: { label: string; href: string }[];
  /** Счётчики каталога/лидов — маркер {{stats}}. */
  stats?: { objects: number; leads: number };
}

export interface GuidePage extends GuidePageMeta {
  body: string;
}

export interface GuideLogEntry {
  date: string; // YYYY-MM-DD
  slug: string | null; // страница справочника, если запись про неё
  text: string;
}

const GUIDE_DIR = path.join(process.cwd(), "src/content/guide");

/** Минимальный парсер фронтматтера (--- key: value ---) — без зависимостей. */
function parseFrontmatter(raw: string): { meta: Record<string, string>; body: string } {
  const meta: Record<string, string> = {};
  if (!raw.startsWith("---")) return { meta, body: raw };
  const end = raw.indexOf("\n---", 3);
  if (end === -1) return { meta, body: raw };
  for (const line of raw.slice(3, end).split("\n")) {
    const m = /^([A-Za-z][\w-]*):\s*(.*)$/.exec(line.trim());
    if (m) meta[m[1]] = m[2].trim();
  }
  return { meta, body: raw.slice(end + 4).replace(/^\n+/, "") };
}

function isSection(v: string): v is GuideSectionId {
  return GUIDE_SECTIONS.some((s) => s.id === v);
}

function readPage(file: string): GuidePage | null {
  try {
    const raw = fs.readFileSync(path.join(GUIDE_DIR, file), "utf8");
    const { meta, body } = parseFrontmatter(raw);
    if (!meta.title) return null;
    return {
      slug: file.replace(/\.md$/, ""),
      title: meta.title,
      section: isSection(meta.section ?? "") ? (meta.section as GuideSectionId) : "company",
      order: Number(meta.order ?? 99),
      updated: meta.updated ?? "",
      summary: meta.summary ?? "",
      keywords: meta.keywords ?? "",
      draft: (meta.status ?? "").toLowerCase() === "draft",
      body,
    };
  } catch {
    return null;
  }
}

/** Все страницы справочника в порядке оглавления (секция → order). */
export function getGuidePages(): GuidePage[] {
  let files: string[] = [];
  try {
    files = fs.readdirSync(GUIDE_DIR).filter((f) => f.endsWith(".md") && !f.startsWith("_"));
  } catch {
    return [];
  }
  const sectionRank = new Map(GUIDE_SECTIONS.map((s, i) => [s.id, i]));
  return files
    .map(readPage)
    .filter((p): p is GuidePage => p !== null)
    .sort(
      (a, b) =>
        (sectionRank.get(a.section) ?? 9) - (sectionRank.get(b.section) ?? 9) ||
        a.order - b.order ||
        a.title.localeCompare(b.title),
    );
}

export function getGuidePage(slug: string): GuidePage | null {
  if (!/^[\w-]+$/.test(slug)) return null;
  return readPage(`${slug}.md`);
}

/**
 * Страницы с учётом ручной публикации из админки: страница, чей slug снят с
 * черновика кнопкой «Опубликовать» (оверрайд в app_settings), теряет `draft`.
 * Так фронтматтер-черновик можно согласовать без правки .md и редеплоя.
 */
export async function getResolvedGuidePages(): Promise<GuidePage[]> {
  const [pages, published] = await Promise.all([
    Promise.resolve(getGuidePages()),
    getPublishedGuideSlugs(),
  ]);
  if (published.size === 0) return pages;
  return pages.map((p) =>
    p.draft && published.has(p.slug) ? { ...p, draft: false } : p,
  );
}

/** Опубликована ли страница вручную (оверрайд поверх фронтматтер-черновика). */
export async function isGuidePagePublished(slug: string): Promise<boolean> {
  return (await getPublishedGuideSlugs()).has(slug);
}

/** Сколько страниц-черновиков ждёт проверки — бейдж на пункте «Справочник». */
export async function getGuideDraftCount(): Promise<number> {
  return (await getResolvedGuidePages()).filter((p) => p.draft).length;
}

/** Якорь заголовка — должен совпадать с id в GuideArticle (один алгоритм). */
export function guideHeadingId(text: string): string {
  return text
    .toLowerCase()
    .replace(/[*`]/g, "")
    .replace(/[^\p{L}\p{N}]+/gu, "-")
    .replace(/^-+|-+$/g, "");
}

export interface GuideHeading {
  level: 2 | 3;
  text: string;
  id: string;
}

/** h2/h3 страницы для оглавления (TOC). Инлайн-разметка из текста срезается. */
export function extractGuideHeadings(md: string): GuideHeading[] {
  const out: GuideHeading[] = [];
  let inCode = false;
  for (const raw of md.replace(/\r\n/g, "\n").split("\n")) {
    const t = raw.trim();
    if (t.startsWith("```")) {
      inCode = !inCode;
      continue;
    }
    if (inCode) continue;
    const m = /^(#{2,3})\s+(.*)$/.exec(t);
    if (m) {
      const text = m[2].replace(/[*`]/g, "").trim();
      out.push({ level: m[1].length as 2 | 3, text, id: guideHeadingId(text) });
    }
  }
  return out;
}

/**
 * Лента «Что нового» — новые записи сверху. Два источника, объединяются:
 *  1. _changelog.md — ручные записи (формат `- ДАТА · slug · текст`).
 *  2. _changelog.generated.json — авто-записи, собранные при деплое из
 *     commit-трейлеров `Guide: …` (scripts/build-guide-changelog.mjs).
 * Дедуп по date+text (если одно и то же попало и в ручную ленту, и в авто).
 */
export function getGuideChangelog(): GuideLogEntry[] {
  const entries: GuideLogEntry[] = [];

  try {
    const raw = fs.readFileSync(path.join(GUIDE_DIR, "_changelog.md"), "utf8");
    for (const line of raw.split("\n")) {
      const m = /^-\s*(\d{4}-\d{2}-\d{2})\s*·\s*([\w-]+|—)\s*·\s*(.+)$/.exec(line.trim());
      if (m) entries.push({ date: m[1], slug: m[2] === "—" ? null : m[2], text: m[3].trim() });
    }
  } catch {
    /* ручной лог отсутствует — берём только авто */
  }

  try {
    const raw = fs.readFileSync(path.join(GUIDE_DIR, "_changelog.generated.json"), "utf8");
    const auto = JSON.parse(raw) as GuideLogEntry[];
    if (Array.isArray(auto)) entries.push(...auto.filter((e) => e?.date && e?.text));
  } catch {
    /* авто-лог ещё не собран (нет git при билде) — не страшно */
  }

  const seen = new Set<string>();
  return entries
    .filter((e) => {
      const k = `${e.date}|${e.text}`;
      if (seen.has(k)) return false;
      seen.add(k);
      return true;
    })
    .sort((a, b) => b.date.localeCompare(a.date));
}

export interface GuideCoverageRow {
  key: string;
  label: string;
  href: string;
  guideSlug?: string;
  /** Учебная страница для раздела существует. */
  covered: boolean;
}

/**
 * Детектор пробелов обучения: сверяет реестр разделов админки
 * (lib/admin-sections.ts, needsGuide) с реально существующими страницами
 * справочника. Раздел без своей страницы → covered:false (подсветка на обзоре
 * /admin/guide — «обучение отстаёт»). Параметр приходит извне, чтобы не
 * создавать здесь зависимость от admin-sections (этот модуль server-only).
 */
export function getGuideCoverage(
  sections: { key: string; label: string; href: string; guideSlug?: string; needsGuide: boolean }[],
): GuideCoverageRow[] {
  const have = new Set(getGuidePages().map((p) => p.slug));
  return sections
    .filter((s) => s.needsGuide)
    .map((s) => ({
      key: s.key,
      label: s.label,
      href: s.href,
      guideSlug: s.guideSlug,
      covered: Boolean(s.guideSlug && have.has(s.guideSlug)),
    }));
}
