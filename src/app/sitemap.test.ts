import { readdirSync, readFileSync } from "node:fs";
import { join } from "node:path";
import { describe, expect, it } from "vitest";

/**
 * Регрессия 2026-08-27: `/calculator` отдавала `index, follow`, но в
 * sitemap.xml её не было — при том что `/ru/calculator` там лежала. Робота
 * звали, а адрес не называли. Так же выпали `/match`, `/privacy`, `/credits`
 * и их русские пары: список статических маршрутов в sitemap.ts ведётся
 * руками, и новая страница попадает туда, только если о ней вспомнили.
 *
 * Тест сверяет то же, что тогда пришлось делать вручную: каждая страница,
 * приглашающая индексацию, должна быть в карте. Страницы с `index: false`
 * (например `/saved`) исключаются — им в карте не место.
 *
 * sitemap.ts читается как текст, а не импортируется: его функция ходит в
 * API за объектами, а тест должен быть офлайновым.
 */

const APP_DIR = join(process.cwd(), "src", "app");

function staticRoutes(dir: string, prefix = ""): string[] {
  const found: string[] = [];
  for (const entry of readdirSync(dir, { withFileTypes: true })) {
    if (!entry.isDirectory()) continue;
    const name = entry.name;
    // Динамические сегменты и группы маршрутов в карту не попадают поштучно,
    // служебные ветки — тем более.
    if (name.startsWith("[") || name.startsWith("(") || name === "admin" || name === "api") continue;
    const path = `${prefix}/${name}`;
    const full = join(dir, name);
    if (readdirSync(full).includes("page.tsx")) found.push(path);
    found.push(...staticRoutes(full, path));
  }
  return found;
}

function invitesIndexing(route: string): boolean {
  const source = readFileSync(join(APP_DIR, route.slice(1), "page.tsx"), "utf8");
  return !/index:\s*false|noindex/.test(source);
}

/** `/ru/about` → `/about`, `/ru` → `/` — RU-зеркало покрывается парой EN. */
function route(r: string): string {
  if (r === "/ru") return "/";
  return r.startsWith("/ru/") ? r.slice(3) : r;
}

describe("sitemap covers every indexable static page", () => {
  const sitemapSource = readFileSync(join(APP_DIR, "sitemap.ts"), "utf8");

  it("lists each page that asks robots to index it", () => {
    // Статика с 2026-09-04 перечислена парами EN/RU через pair(base, "/path")
    // — ищем путь в кавычках; RU-зеркала выводятся из той же пары.
    const missing = staticRoutes(APP_DIR)
      .filter(invitesIndexing)
      .map(route)
      .filter((r, i, arr) => arr.indexOf(r) === i)
      .filter((r) => !sitemapSource.includes(`"${r}"`) && !sitemapSource.includes(`\${base}${r}\``));

    expect(missing).toEqual([]);
  });

  it("keeps noindex pages out of the map", () => {
    // `/saved` — личная подборка посетителя: роботу там нечего смотреть.
    expect(sitemapSource).not.toContain("${base}/saved`");
  });
});
