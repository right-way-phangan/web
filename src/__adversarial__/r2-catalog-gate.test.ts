// @vitest-environment node
import { beforeEach, describe, expect, it, vi } from "vitest";
import type { RealEstateObject } from "@/types/object";

/**
 * RED-TEAM, РАУНД 2 — атака на фикс 66435c5 в `lib/data/objects.ts`:
 * на живом пути (OBJECTS_API_URL) `getPublicObjects` сам фильтрует по
 * `status === "Active" && !!coverImage`. Раунд нашёл двух потребителей, которые
 * этого гейта не переживали. ИСПРАВЛЕНО 2026-08-31: гейт вынесен в
 * `isPubliclyListable()` и применяется ТОЛЬКО к списочной выдаче; резолв
 * страниц по slug/RW идёт через `getPublicObjectsUnfiltered()`, а кэш
 * «последнего удачного» заполняется ДО гейта.
 */

let apiObjects: RealEstateObject[] = [];

vi.mock("next/cache", () => ({
  // unstable_cache(fn, keys, opts) → просто fn
  unstable_cache: (fn: (...a: unknown[]) => unknown) => fn,
  revalidateTag: vi.fn(),
  revalidatePath: vi.fn(),
}));

vi.mock("@/lib/api/backend", () => ({
  BACKEND_URL: "https://backend.test",
  backendFetch: vi.fn(() =>
    Promise.resolve(new Response(JSON.stringify(apiObjects), { status: 200 })),
  ),
}));

vi.mock("@/lib/data/fx", () => ({ getUsdPerThb: () => Promise.resolve(null) }));

vi.mock("@/lib/storage/r2-public", () => ({
  proxyR2Url: (u: string) => u,
  proxyR2VideoUrl: (u: string) => u,
}));

const o = (p: Partial<RealEstateObject>): RealEstateObject => p as RealEstateObject;

const withCover = o({
  id: 1,
  rwNumber: "RW-P0030",
  type: "Project",
  status: "Active",
  titleEn: "Atmos Villas",
  coverImage: "https://r2/cover.jpg",
});
/** Тот же проект после чистки медиа: обложкой был скриншот прайса застройщика,
 *  правило feedback_media_publication_rule требует удалить его из PHOTOS. */
const coverStripped = o({ ...withCover, coverImage: undefined });
const unit = o({
  id: 2,
  rwNumber: "RW-P0030-1",
  type: "Villa",
  status: "Active",
  titleEn: "Villa A",
  coverImage: undefined,
});

beforeEach(() => {
  vi.resetModules();
  vi.stubEnv("OBJECTS_API_URL", "https://backend.test");
});

// АТАКА 42 [HIGH]: гейт «нет обложки — нет объекта» стоял в getPublicObjects, а
// на нём же висел резолв лендинга проекта | ОЖИДАЕТСЯ: потеря обложки прячет
// карточку из грида и sitemap — как у обычного объекта, чья страница при этом
// продолжает открываться | БЫЛО: `getProjectBySlug` читал ТОТ ЖЕ
// `getPublicObjects` и без обложки проект не находил → `/projects/[slug]`
// отвечал `notFound()`, жёсткий 404 на проиндексированном URL; триггер бытовой —
// обложкой был скриншот прайса, его удаляют по правилу медиа | ИСПРАВЛЕНО
// 2026-08-31: резолв идёт по `getPublicObjectsUnfiltered()`, лендинг жив,
// в списки объект по-прежнему не попадает.
// код: src/lib/data/objects.ts:226-247 → src/lib/data/projects.ts:66-73
describe("АТАКА 42 — проект без обложки скрыт из списков, но лендинг открывается", () => {
  it("с обложкой проект и в списке, и резолвится по slug", async () => {
    apiObjects = [withCover];
    const { getPublicObjects } = await import("@/lib/data/objects");
    const { getProjectBySlug } = await import("@/lib/data/projects");
    expect((await getPublicObjects()).map((x) => x.rwNumber)).toEqual(["RW-P0030"]);
    expect((await getProjectBySlug("atmos-villas"))?.project.rwNumber).toBe("RW-P0030");
  });

  it("без обложки: из каталожной выдачи исчез — но лендинг всё ещё резолвится", async () => {
    apiObjects = [coverStripped];
    const { getPublicObjects, isPubliclyListable } = await import("@/lib/data/objects");
    expect(isPubliclyListable(coverStripped)).toBe(false);
    expect(await getPublicObjects()).toEqual([]); // грид и sitemap его не видят

    const { getProjectBySlug } = await import("@/lib/data/projects");
    const found = await getProjectBySlug("atmos-villas");
    expect(found?.project.rwNumber).toBe("RW-P0030"); // 404 больше нет
  });

  it("и юниты для этого лендинга на месте: getAllObjects гейта не имеет", async () => {
    apiObjects = [coverStripped, unit];
    const { getAllObjects } = await import("@/lib/data/objects");
    const all = await getAllObjects();
    expect(all.map((x) => x.rwNumber)).toEqual(["RW-P0030", "RW-P0030-1"]);
    const { getProjectUnits } = await import("@/lib/data/projects");
    expect(getProjectUnits(coverStripped, all).map((x) => x.rwNumber)).toEqual(["RW-P0030-1"]);
  });
});

// АТАКА 43 [MEDIUM]: тот же гейт и статус | ОЖИДАЕТСЯ: Reserved/Sold объект
// исчезает из грида, но его страница остаётся живой ссылкой | БЫЛО: для ПРОЕКТА
// это был 404 — статус Reserved у RW-P снимал лендинг целиком, вместе со всем
// контентом застройщика (ход стройки, экономика, планировки), который к статусу
// продажи отношения не имеет | ИСПРАВЛЕНО 2026-08-31: лендинг резолвится
// независимо от статуса, как и graceful-страница /object/[rw].
// код: src/lib/data/objects.ts:226-233 → src/lib/data/projects.ts:66-73
describe("АТАКА 43 — Reserved-проект выпадает из списков, но лендинг не снимается", () => {
  const reserved = o({ ...withCover, status: "Reserved" });

  it("Reserved-проект выпадает из публичного набора", async () => {
    apiObjects = [reserved];
    const { getPublicObjects } = await import("@/lib/data/objects");
    expect(await getPublicObjects()).toEqual([]);
  });

  it("а обе страницы объекта живы: и /object/[rw], и /projects/[slug]", async () => {
    apiObjects = [reserved];
    const { getAnyObjectByRwNumber } = await import("@/lib/data/objects");
    expect((await getAnyObjectByRwNumber("RW-P0030"))?.rwNumber).toBe("RW-P0030");

    const { getProjectBySlug } = await import("@/lib/data/projects");
    expect((await getProjectBySlug("atmos-villas"))?.project.rwNumber).toBe("RW-P0030");
  });
});

// АТАКА 44 [MEDIUM, устойчивость]: кэш «последнего удачного ответа» |
// ОЖИДАЕТСЯ: `lastGoodPublic` спасает витрину при падении backend | БЫЛО: гейт
// применялся ДО записи в кэш, поэтому один штатный 200-ответ с обнулёнными
// обложками (сбой маппинга медиа, миграция R2) записывал в lastGoodPublic
// ПУСТОЙ каталог — отравление кэша без единой ошибки | ИСПРАВЛЕНО 2026-08-31:
// в кэш кладётся сырой удачный ответ, гейт применяется к выдаче.
// код: src/lib/data/objects.ts:236-247
describe("АТАКА 44 — 200-ответ без обложек больше не отравляет lastGoodPublic", () => {
  it("кэш хранит объект целиком, даже когда список пуст — и переживает падение backend", async () => {
    apiObjects = [coverStripped];
    const mod = await import("@/lib/data/objects");
    expect(await mod.getPublicObjects()).toEqual([]); // список пуст — гейт работает
    // но кэш не пуст: страница по slug/RW этот объект найдёт
    expect((await mod.getPublicObjectsUnfiltered()).map((x) => x.rwNumber)).toEqual(["RW-P0030"]);

    const backend = await import("@/lib/api/backend");
    vi.mocked(backend.backendFetch).mockRejectedValueOnce(new Error("backend down"));
    expect((await mod.getPublicObjectsUnfiltered()).map((x) => x.rwNumber)).toEqual(["RW-P0030"]);
  });

  it("контроль: удачный ответ С обложками кэшируется и переживает падение", async () => {
    apiObjects = [withCover];
    const mod = await import("@/lib/data/objects");
    expect((await mod.getPublicObjects()).map((x) => x.rwNumber)).toEqual(["RW-P0030"]);

    const backend = await import("@/lib/api/backend");
    vi.mocked(backend.backendFetch).mockRejectedValueOnce(new Error("backend down"));
    expect((await mod.getPublicObjects()).map((x) => x.rwNumber)).toEqual(["RW-P0030"]);
  });
});
